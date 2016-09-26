'use strict';

const
	constants = require('../engine/constants'),
	errorCodes = require('../engine/error'),
	geo = require('./geo'),
	request = require('request'),
	//The name of the subroutine that can find the weather
    weatherSubroutine = findWeather.name,

	//The name of the rive trigger to invoke while displaying results
    weatherTrigger = constants.JS_TRIGGER_WEATHER;

function init(rs, userId, session) {
	rs.setSubroutine(weatherSubroutine, (rs, args) => {
		return new rs.Promise((resolve, reject) => {
			report(resolve, reject, rs, args, userId, session);
		});
	});
}

function getWeatherQuery(lat, lon) {
	return {
		url: constants.ENDPOINT_OPEN_WEATHER_MAP, //URL to hit
		qs: {
			lat: lat,
			lon: lon,
			units: constants.UNITS_METRIC,
			appid: constants.OPEN_WEATHER_MAP_API_KEY
		}, //Query string data
		headers: { 'Accept': 'application/json' },
		json: true
	}
}

function findWeather(lat, lon) {
	let options = getWeatherQuery(lat, lon);
	return new Promise((resolve, reject) => {
		request(options, (error, response, body) => {
			callback(resolve, reject, error, response, body)
		});
	});
}

function handleFacebookGeolocation(rs, userId, session, lat, lon) {
	findWeather(lat, lon)
		.then((weatherReport) => {
			if (weatherReport) {
				weatherReport.location = 'your place'
				rs.setUservars(userId, weatherReport)
				return rs.replyAsync(userId, weatherTrigger, this);
			}
			else {
				reject(weatherReport);
			}
		})
		.then((reply) => {
			resolve(reply);
		})
		.catch((error) => {
			handleError(error, session)
			reject(error);
		})
}

function callback(resolve, reject, error, response, body) {
	if (!error && response.statusCode == 200) {
		let report = parse(body);
		resolve(report);
	} else {
		reject({ error: error, code: errorCodes.weatherLookupFailed });
	}
}

function parse(json) {
	if (json.coord
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
		&& json.sys) {
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

function report(resolve, reject, rs, args, userId, session) {
	geo.reverseGeocode(args[0])
		.then((cities) => {
			return findWeather(cities[0].lat, cities[0].lon);
		})
		.then((weatherReport) => {
			//Save the user input location so that we can show it in the response
			if (weatherReport) {
				weatherReport.location = args[0]
				rs.setUservars(userId, weatherReport)
				return rs.replyAsync(userId, weatherTrigger, this);
			}
			else {
				reject(weatherReport);
			}
		})
		.then((reply) => {
			resolve(reply);
		})
		.catch((error) => {
			handleError(error, session)
			reject(error);
		})
}

function handleError(error, session) {
    if (error && error.code) {
        switch (error.code) {
			case errorCodes.cityNotFound:
				session.send('Could not find the city');
				break;
			case errorCodes.cityLookupFailed:
				session.send('network issue while searching city');
				break;
			case errorCodes.weatherLookupFailed:
				session.send('Could not find weather');
				break;
			case errorCodes.weatherNotFound:
				session.send('Could not find weather');
				break;
        }
    }
}

let weather = {
	init: init,
	handleFacebookGeolocation: handleFacebookGeolocation
}

module.exports = weather;