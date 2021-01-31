const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let runId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    let seasonalList = await getSeasonalList(runId);
    console.log(`[${runId}] num anime: `, seasonalList.length)
    let updates = await updateDBEntries(seasonalList, runId);
    return Promise.all(updates);
};

async function updateDBEntries(animes, runId) {
    let promises = [];
    await animes.forEach((anime) => {
        var params = {
            TableName: "aniMinder-SeasonalList",
            Key: {
                "id": anime.id
            },
            UpdateExpression: "SET season = :season, seasonYear = :seasonYear, studios = :studios, episodes = :episodes, coverImage = :coverImage, nextAiringEpisode = :nextAiringEpisode, title = :title, averageScore = :averageScore",
            ExpressionAttributeValues: {
                ":season": anime.season,
                ":seasonYear": anime.seasonYear,
                ":studios": anime.studios,
                ":episodes": anime.episodes === null ? 0 : anime.episodes,
                ":averageScore": anime.averageScore === null ? 0 : anime.averageScore,
                ":coverImage": anime.coverImage,
                ":nextAiringEpisode": anime.nextAiringEpisode,
                ":title": anime.title
            },
            ReturnValues: "UPDATED_NEW"
        };
        console.log(`[${runId}] updating anime: ${anime.title.english}`);
        let update = ddb.update(params);
        let result = update.promise();
        promises.push(result);
    });
    return promises;
}

async function getSeasonalList(runId) {
    let query = `
    query ($season: MediaSeason, $seasonYear: Int, $format: MediaFormat, $perPage: Int, $page: Int) {
        Page (page: $page, perPage: $perPage) {
            pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
            }
            media(season: $season, seasonYear: $seasonYear, format: $format, type: ANIME) {
                id
                season
                seasonYear
                episodes
                averageScore
                coverImage {
                    large
                }
                studios(isMain: true) {
                    nodes {
                        name
                    }
                }
                nextAiringEpisode {
                    airingAt
                    episode
                }
                title {
                    romaji
                    english
                    native
                }
            }
        }
    }
    `

    // find the current season and year
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let season = [["", 0], ["", 0]];
    if (month >= 0 && month <= 2) {
        season = [["WINTER", year], ["FALL", year-1]];
    } else if (month >= 3 && month <= 5) {
        season = [["SPRING", year], ["WINTER", year]];
    } else if (month >= 6 && month <= 8) {
        season = [["SUMMER", year], ["SPRING", year]];
    } else {
        season = [["FALL", year], ["SUMMER", year]];
    }

    console.log(season);

    let seasonalList = [];

    for (const s of season) {
        let variables = {
            "page": 1,
            "format": "TV",
            "season": s[0],
            "seasonYear": s[1],
            "perPage": 20
        }
        let data = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });
        console.log(`[${runId}] GETTING PAGE ${variables.page} for season ${s[0]} ${s[1]}`);
        data = await data.json();
        let currPage = data.data.Page;
        let pageInfo = currPage.pageInfo;
        let media = currPage.media;
        seasonalList = seasonalList.concat(media);
        while( pageInfo.hasNextPage ) {
            console.log(`GETTING PAGE ${variables.page + 1}`)
            variables.page = variables.page + 1;
            data = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            });
            data = await data.json();
            currPage = data.data.Page;
            pageInfo = currPage.pageInfo;
            media = currPage.media;
            seasonalList = seasonalList.concat(media);
        } 
    }

    return seasonalList;
}