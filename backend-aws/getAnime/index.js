const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    let body = JSON.parse(event.body);

    if(!body || !body.ids) {
        console.log("ERROR: Bad Request");
        const resp = {
            statusCode: 400,
            body: JSON.stringify({
                err: "ERROR: Bad Request, include id in body"
            })
        }
        callback(resp);
    }

    let animeIds = [];
    body.ids.forEach(id => {
        animeIds.push({ 'id': id });
    });

    var params = {
        RequestItems: {
            'aniMinder-SeasonalList': {
                Keys: animeIds,
                ProjectionExpression: 'title, nextAiringEpisode'
            },
        }
    }

    ddb.batchGet(params, function(err, data) {
        if (err) {
            console.log("ERROR", err);
        } else {
            let animeData = data.Responses['aniMinder-SeasonalList'];
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(animeData)
            });
        }
    });
};
