'use strict';

const
	errorCodes = require('../engine/error'),
	request = require('request'),
	//The name of the subroutine that can find the weather
	topicRecharge = {key: 'topic', value: 'recharge'},
    rechargeSubroutine = 'findOperatorInfo',

	//The name of the rive trigger to invoke while displaying results
    rechargeTrigger = 'jsoperatorinfo';

function init(rs, session){
	rs.setSubroutine(rechargeSubroutine, (rs, args)=>{
		return new rs.Promise((resolve, reject)=>{
			report(resolve, reject, rs, args, session);
		});
	});
}

function findOperatorInfo(mobileNumber){

	let options = {
		url: 'https://joloapi.com/api/findoperator.php', //URL to hit
		qs: {
			userid: 'slidenerd', 
			key: '258443870341474',
			mob: mobileNumber,
			type: 'json'
		}
	}

	return new Promise((resolve, reject)=>{
		request(options, (error, response, body)=>{
			callback(resolve, reject, error, response, body)
		});
	});
}

function callback(resolve, reject, error, response, body){
	if(!error && response.statusCode == 200) {
		console.log(body);
		console.log('BEFORE PARSING');
		let report = parse(JSON.parse(body));
		if(report.success === 'true'){
			resolve(report);
		}
		else{
			reject(report);
		}
		
	} else {
		reject(error);
	}
}

function parse(json){
	if(json && json.operator_code && json.circle_code){
		return {
			success: 'true', 
			operator_code: json.operator_code, 
			circle_code: json.circle_code
		};
	}
	else if(json && json.status === 'FAILED'){
		return {
			success: 'false',
			status: json.status,
			errorcode: json.errorcode
		};
	}
	else{
		return {success: 'false'};
	}
}

function report(resolve, reject, rs, args, session){
	findOperatorInfo(args[0])
	.then((json)=>{
		//Save the user input location so that we can show it in the response
		//Change the topic to weather
		console.log(json);
		let userId = session.userData.user.id;
		rs.setUservar(userId, topicRecharge.key, topicRecharge.value)
		let operatorName = getOperatorName(json.operator_code);
		let circleName = getCircleName(json.circle_code);
		if(operatorName && circleName){
			rs.setUservar(userId, 'operatorName', operatorName);
			rs.setUservar(userId, 'circleName', circleName);
		}
		return rs.replyAsync(userId, rechargeTrigger, this);
	})
	.then((reply)=>{
		resolve(reply);
	})
	.catch((error)=>{
		session.send('Oops, I wasnt able to find your operator, can you enter your 10 digit phone number once again?');
		reject(error);
	})
}

function getOperatorName(operatorCode){
	let operatorName = null;
	switch(operatorCode){
		case '1':
			operatorName = 'Aircel';
			break;
		case '3':
			operatorName = 'BSNL';
			break;
		case '5':
			operatorName = 'Videocon';
			break;	
		case '6':
			operatorName = 'MTNL Mumbai';
			break;
		case '8':
			operatorName = 'Idea';
			break;
		case '9':
			operatorName = 'Loop';
			break;
		case '10':
			operatorName = 'MTS';
			break;
		case '12':
			operatorName = 'Reliance CDMA';
			break;
		case '13':
			operatorName = 'Reliance GSM';
			break;
		case '17':
			operatorName = 'Tata Docomo GSM or Virgin GSM or T24';
			break;
		case '18':
			operatorName = 'Tata Docomo CDMA or Virgin CDMA';
			break;
		case '19':
			operatorName = 'Uninor';
			break;
		case '20':
			operatorName = 'MTNL Delhi';
			break;
		case '22':
			operatorName = 'Vodafone';
			break;
		case '28':
			operatorName = 'Airtel';
			break;
	}
	return operatorName;
}

function getCircleName(circleCode){
	let circleName = null;
	switch(circleCode){
		case '1':
			circleName = 'Delhi/NCR';
			break;
		case '2':
		circleName = 'Mumbai';
			break;
		case '3':
		circleName = 'Kolkata';
			break;	
		case '4':
		circleName = 'Maharashtra';
			break;
		case '5':
		circleName = 'Andhra Pradesh';
			break;
		case '6':
		circleName = 'Tamil Nadu';
			break;
		case '7':
		circleName = 'Karnataka';
			break;
		case '8':
		circleName = 'Gujarat';
			break;
		case '9':
		circleName = 'Uttar Pradesh (East)';
			break;
		case '10':
		circleName = 'Madhya Pradesh';
			break;
		case '11':
		circleName = 'Uttar Pradesh (West)';
			break;
		case '12':
		circleName = 'West Bengal';
			break;
		case '13':
		circleName = 'Rajasthan';
			break;
		case '14':
		circleName = 'Kerala';
			break;
		case '15':
		circleName = 'Punjab';
			break;
		case '16':
			circleName = 'Haryana';
			break;
		case '17':
			circleName = 'Bihar & Jharkhand';
			break;
		case '18':
			circleName = 'Orissa';
			break;
		case '19':
			circleName = 'Assam';
			break;
		case '20':
			circleName = 'North East';
			break;
		case '21':
			circleName = 'Himachal Pradesh';
			break;
		case '22':
			circleName = 'Jammu & Kashmir';
			break;
		case '23':
			circleName = 'Chennai';
			break;
	}
	return circleName;
}

let recharge = {
	init: init
}
module.exports = recharge;