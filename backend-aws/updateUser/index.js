const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();  

exports.handler = async (event) => {
    let body = JSON.parse(event.body);
    let { deviceId, action, animeIds } = body;

    let params = {
        TableName: 'aniMinder-Users',
        Key: { 'userId': deviceId },
        ExpressionAttributeValues: {
            ':a': ddb.createSet(animeIds)
        },
        ReturnValues: "UPDATED_NEW"
    }

    if ( action === 'ADD' ) {
        params['UpdateExpression'] = 'ADD followingAnime :a';
        await ddb.update(params).promise();
    } else if ( action === 'DELETE' ) {
        params['UpdateExpression'] = 'DELETE followingAnime :a';
        await ddb.update(params).promise();
    } else {
        const resp = {
            statusCode: 400,
            body: JSON.stringify('ERROR: invalid action')
        }
        return resp;
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify('SUCCESS')
    }
};
