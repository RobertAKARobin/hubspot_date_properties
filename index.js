const request = require('request');
const ENV = require('./env.json');

Date.prototype.getMonthWithZeroes = function(){
	let date = this;
	return ('0' + (date.getMonth()+1)).slice(-2);
}

let startDate = new Date(2012, 06);
// goToNextDate();

request({
	method: 'POST',
	url: 'https://api.hubapi.com/properties/v1/deals/properties?hapikey=' + ENV.HAPIKEY,
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		name: 'test_456',
		label: 'Test 456!',
		groupName: 'revenue_forecast',
		type: 'number'
	})
}, function(error, response, body){
	var apiResponse = JSON.parse(body)
	if(apiResponse.status == 'error'){
		console.log({
			success: false,
			response: apiResponse
		})
	}else{
		console.log({
			success: true,
			response: apiResponse
		})
	}
});

function goToNextDate(){
	let currentDate = startDate.getFullYear() + '_' + startDate.getMonthWithZeroes();
	startDate.setMonth(startDate.getMonth() + 1);
	console.log(currentDate);
	if(currentDate != '2022_12'){
		goToNextDate();
	}
}
