const request = require('request');
const ENV = require('./env.json');

Date.prototype.getMonthWithZeroes = function(){
	let date = this;
	return ('0' + (date.getMonth()+1)).slice(-2);
}

let startDate = new Date(2013, 03);
goToNextDate();

function goToNextDate(){
	let year = startDate.getFullYear();
	let month = startDate.getMonthWithZeroes();
	let internalName = ['revenue', year, month].join('_');
	let displayName = 'Revenue ' + year + '/' + month;
	console.log(internalName);

	startDate.setMonth(startDate.getMonth() + 1);

	create();
	// destroy();

	function destroy(){
		request({
			method: 'DELETE',
			url: 'https://api.hubapi.com/properties/v1/deals/properties/named/' + internalName + '?hapikey=' + ENV.HAPIKEY,
			headers: {
				'Content-Type': 'application/json'
			}
		}, function(error, response, body){
			console.log(error || response.statusCode);
			if(error){
				return;
			}else{
				goToNextDate();
			}
		})
	}

	function create(){
		request({
			method: 'POST',
			url: 'https://api.hubapi.com/properties/v1/deals/properties?hapikey=' + ENV.HAPIKEY,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: internalName,
				label: displayName,
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
				if(year == '2022' && month == '12'){
					return;
				}else{
					goToNextDate();
				}
			}
		})
	}


}
