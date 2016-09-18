var request = require('request');

var headers = {
    'Fk-Affiliate-Id': 'slidenerd',
    'Fk-Affiliate-Token': 'cb49349872094f7494d802c1efc6b67b'
};

var options = {
    url: 'https://affiliate-api.flipkart.net/affiliate/offers/v1/dotd/json',
    headers: headers
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);