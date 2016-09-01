'use strict';
const
    request =require('request');

function getLocationDetails(location){
    return new Promise((resolve, reject)=>{
        request({
            url: 'https://devru-latitude-longitude-find-v1.p.mashape.com/latlon.php', //URL to hit
            qs: {
                location: location
            }, //Query string data
            headers: {
                'X-Mashape-Key': 'ASgnW8JcttmshvHd0Hf1jUaS5fr9p1PcCxcjsnvgJ0EG00bIdt',
                'Accept':'application/json'
            },
            json: true
        }, function(error, response, body){
            if(error) {
                reject(error);
            } else {
                let cities = parseLocationDetails(body.Results);
                if(cities && cities.length){
                    resolve(cities);
                }
                else{
                    reject(null)
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

