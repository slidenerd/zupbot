'use strict';

const
	errorCodes = require('../engine/error'),
	request = require('request');

function findWeather(lat, lon){
	return new Promise((resolve, reject)=>{
		request({
			url: 'http://api.openweathermap.org/data/2.5/weather', //URL to hit
			qs: {
				lat: lat, 
				lon: lon,
				units: 'metric',
				appid: '353263113c293de88e214ced88de05a7'
			}, //Query string data
			headers: {'Accept':'application/json'},
			json: true
		}, function(error, response, body){
			if(error) {
				reject({error: error, code: errorCodes.weatherLookupFailed});
			} else {
				let report = parseWeather(body);
				resolve(report);
			}
		});
	});
}

function parseWeather(json){
	if(json.coord 
	&& json.coord.lat
	&& json.coord.lon
	&& json.weather
	&& json.weather.length
	&& json.weather[0]
	&& json.weather[0].description
	&& json.main
	&& json.main.temp
	&& json.wind
	&& json.clouds
	&& json.sys){
	return {
			lat: json.coord.lat,
			lon: json.coord.lon,
			main: json.weather[0].main,
			description: json.weather[0].description,
			temperature: json.main.temp.toFixed(0),
			pressure: json.main.pressure,
			humidity: json.main.humidity,
			seaLevel: json.main.sea_level,
			groundLevel: json.main.grnd_level,
			windSpeed: json.wind.speed,
			windDegree: json.wind.deg,
			clouds: json.clouds.all,
			dt: json.dt,
			countryCode: json.sys.country,
			sunrise: json.sys.sunrise,
			sunset: json.sys.sunset
		}
	}
	
}

let weather = {
	findWeather: findWeather,
}

module.exports = weather;