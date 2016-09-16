'use strict';
const
    errorCodes = require('../engine/error'),
    request =require('request');

function getLocationDetails(location){
    return new Promise((resolve, reject)=>{
        request({
            url: 'https://devru-latitude-longitude-find-v1.p.mashape.com/latlon.php', //URL to hit
            qs: {
                location: location ? location.trim() : location
            }, //Query string data
            headers: {
                'X-Mashape-Key': 'ASgnW8JcttmshvHd0Hf1jUaS5fr9p1PcCxcjsnvgJ0EG00bIdt',
                'Accept':'application/json'
            },
            json: true
        }, function(error, response, body){
            if(error) {
                reject({error: error, code: errorCodes.cityLookupFailed});
            } else {
                let cities = parseLocationDetails(body.Results);
                if(cities && cities.length){
                    resolve(cities);
                }
                else{
                    reject({error: error, code: errorCodes.cityNotFound})
                }
            }
        });
    });
}

function parseLocationDetails(response){
    let cities = [];
    for(let city of response){
        cities.push({
            name: city.name,
            type: city.type,
            country: city.c,
            lat: city.lat,
            lon: city.lon
        });
    }
    return cities;
}

let geo = {
    getLocationDetails: getLocationDetails,
}

module.exports = geo;

