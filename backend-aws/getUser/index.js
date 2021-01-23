const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let body = JSON.parse(event.body);
    let parameters = event.queryStringParameters;
    let sortType = parameters.sort;
    let reverse = parameters.reverse === "true" ? -1 : 1;

    // get user
    var getUserParams = {
        TableName: 'aniMinder-Users',
        Key: {
            'userId': body.deviceId
        }
    }
    let response = await ddb.get(getUserParams).promise();
    
    // if empty response/no user with that id
    if (Object.keys(response).length === 0) {
        var createUserParams = {
            TableName: 'aniMinder-Users',
            Item: {
                userId: body.deviceId,
                followingAnime: ddb.createSet([-1])
            }
        }
        await ddb.put(createUserParams).promise();
        var resp = {
            statusCode: 200,
            body: JSON.stringify([-1])
        }
        return resp;
    }

    // get anime based on user follows
    let ids = response.Item.followingAnime.values;
    let keys = []
    ids.forEach(id => {
        keys.push({ 'id': id })
    });
    var getAnimeParams = {
        RequestItems: {
            'aniMinder-SeasonalList': {
                Keys: keys
            }
        }
    }
    let animeResp = await ddb.batchGet(getAnimeParams).promise();
    let animeList = animeResp.Responses['aniMinder-SeasonalList'];
    sort(animeList, sortType, reverse)

    var resp = {
        statusCode: 200,
        body: JSON.stringify(animeList)
    }
    return resp;
};

/* sort by 
 * TITLE
 * AIRING
 * SCORE
 * EPISODES
 */
function sort(animes, by, reverse) {
    if (by === "TITLE") {
        animes.sort((a, b) => {
            let titleA = a.title.english === null ? a.title.romaji === null ? a.title.native : a.title.romaji : a.title.english;
            let titleB = b.title.english === null ? b.title.romaji === null ? b.title.native : b.title.romaji : b.title.english;
            return titleA > titleB ? 1 * reverse : -1 * reverse;
        });
    } else if (by === "AIRING") {
        animes.sort((a, b) => {
            let airingA = a.nextAiringEpisode === null ? Number.MAX_SAFE_INTEGER : a.nextAiringEpisode.airingAt;
            let airingB = b.nextAiringEpisode === null ? Number.MAX_SAFE_INTEGER : b.nextAiringEpisode.airingAt;
            return (airingA - airingB) * reverse;
        });
    } else if (by === "SCORE") {
        animes.sort((a, b) => (a.averageScore - b.averageScore) * reverse);
    } else if (by === "EPISODES") {
        animes.sort((a, b) => (a.episodes - b.episodes) * reverse);
    }
}

