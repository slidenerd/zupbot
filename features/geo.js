'use strict';
const
    constants = require('../engine/constants'),
    errorCodes = require('../engine/error'),
    request =require('request');

function reverseGeocode(location){

    let options = {
        url: constants.ENDPOINT_GEO_URI, //URL to hit
        qs: {
            location: location ? location.trim() : location
        }, //Query string data
        headers: {
            'X-Mashape-Key': constants.GEO_API_KEY,
            'Accept':'application/json'
        },
        json: true
    }
    return new Promise((resolve, reject)=>{
        request(options, (error, response, body)=>{
            callback(resolve, reject, error, response, body);
        });
    });
}

function callback(resolve, reject, error, response, body){
    if(error) {
        reject({error: error, code: errorCodes.cityLookupFailed});
    } else {
        let cities = parse(body.Results);
        if(cities && cities.length){
            resolve(cities);
        }
        else{
            reject({error: error, code: errorCodes.cityNotFound})
        }
    }
}

function parse(response){
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
    reverseGeocode: reverseGeocode,
}

module.exports = geo;

