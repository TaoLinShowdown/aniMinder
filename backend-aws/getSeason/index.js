const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let parameters = event.queryStringParameters;
    let season = parameters.season;
    let year = parseInt(parameters.seasonYear);
    let sortType = parameters.sort;
    let reverse = parameters.reverse === "true" ? -1 : 1;

    console.log(season, year);

    var params = {
        TableName: 'aniMinder-SeasonalList',
        FilterExpression: 'season = :s and seasonYear = :y',
        ExpressionAttributeValues: {
            ':s': season,
            ':y': year
        }
    }

    let response = await ddb.scan(params).promise();
    let animes = response.Items;
    sort(animes, sortType, reverse)
    return {
        statusCode: 200,
        body: JSON.stringify(animes)
    }
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
