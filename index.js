const request = require('request');
const ENV = require('./env.json');

Date.prototype.getMonthWithZeroes = function(){
	let date = this;
	return ('0' + (date.getMonth()+1)).slice(-2);
}

let startDate = new Date(2012, 06);
goToNextDate();

function goToNextDate(){
	let year = startDate.getFullYear();
	let month = startDate.getMonthWithZeroes();
	startDate.setMonth(parseInt(month) + 1);

	request({
		method: 'POST',
		url: 'https://api.hubapi.com/properties/v1/deals/properties?hapikey=' + ENV.HAPIKEY,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			name: ['revenue', year, month].join('_'),
			label: 'Revenue ' + year + '/' + month,
			groupName: 'revenue_by_month',
			type: 'number',
			fieldType: 'number',
			showCurrencySymbol: true
		})
	}, function(error, response, body){
		var apiResponse = JSON.parse(body)
		console.log(apiResponse);
		if(apiResponse.status == 'error'){
			return;
		}else{
			if(year == '2012' && month == '07'){
				return;
			}else{
				goToNextDate();
			}
		}
	});
}
