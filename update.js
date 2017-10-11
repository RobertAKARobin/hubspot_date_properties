const request = require('request');
const lineReader = require('line-reader');
const ENV = require('./env.json');

let dealPropertyNames = [];
let dealCount = -1;
let dealsToUpload = [];
let dealsPerAPIUpload = 100;

let requestParams = {
	method: 'POST',
	url: 'https://api.hubapi.com/deals/v1/batch-async/update?hapikey=' + ENV.HAPIKEY,
	headers: {
		'Content-Type': 'application/json'
	},
	body: null
}

lineReader.eachLine('./data.csv', function(csvLine, isLast, next){
	dealCount += 1;
	csvLine = csvLine.split(',');

	if(dealCount === 0){
		dealPropertyNames = csvLine.slice(1);
		next();
	}else{
		let deal = {
			'objectId': csvLine.shift(),
			'properties': []
		};
		for(let i = 0; i < dealPropertyNames.length; i++){
			deal['properties'].push({
				name: dealPropertyNames[i],
				value: csvLine[i]
			});
		}
		dealsToUpload.push(deal);

		if(dealsToUpload.length == dealsPerAPIUpload || isLast){
			requestParams.body = JSON.stringify(dealsToUpload);
			console.log(dealCount + ' ' + dealsToUpload.length);
			request(requestParams, function(error, response, body){
				if(error){
					console.log(error);
					next(false);
				}else{
					console.log(body);
					dealsToUpload = [];
					next();
				}
			});
		}else{
			next();
		}
	}
});
