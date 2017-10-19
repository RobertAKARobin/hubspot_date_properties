const request = require('request');
const lineReader = require('line-reader');
const ENV = require('./env.json');

Date.prototype.getMonthWithZeroes = function(){
	var date = this;
	return ('0' + (date.getMonth()+1)).slice(-2);
}
Date.prototype.getDateWithZeroes = function(){
	var date = this;
	return ('0' + date.getDate()).slice(-2);
}
Date.prototype.toArray = function(){
	var date = this;
	return [date.getFullYear(), date.getMonthWithZeroes(), date.getDateWithZeroes()];
}

var sfHeaders = {
	date: 1,
	amount: 2,
	sfId: 5
}
var hsHeaders = {
	hsId: 0,
	sfId: 1
}
var sfFile = './sfdata.csv';
var hsFile = './dealid_with_oppid.tsv';

var deals = {};

mapHSData();

function mapHSData(){
	var count = -1;
	lineReader.eachLine(hsFile, function(tsvLine, isLast, next){
		tsvLine = tsvLine.split('\t');
		count += 1;

		if(count > 0){
			var hsId = tsvLine[hsHeaders.hsId];
			var sfId = tsvLine[hsHeaders.sfId];
			deals[sfId] = (deals[sfId] || {
				sfId: sfId,
				hsId: hsId,
				months: {}
			});
		}
		if(isLast){
			mapSFData();
		}else{
			next();
		}
	});
}

function mapSFData(){
	var count = -1;
	lineReader.eachLine(sfFile, function(csvLine, isLast, next){
		csvLine = csvLine.split(',');
		count += 1;
		
		if(count > 0){
			var schedule = {
				sfId: csvLine[sfHeaders.sfId],
				date: (new Date(csvLine[sfHeaders.date])).toArray(),
				amount: parseFloat(csvLine[sfHeaders.amount])
			}	
			var monthName = ['revenue', schedule.date[0], schedule.date[1]].join('_');
			var deal = deals[schedule.sfId];
			if(deal){
				deal.months[monthName] = (deal.months[monthName] || 0) + schedule.amount;
			}
		}
		if(isLast){
			prepareHSData();
		}else{
			next();
		}
	});
}

var hsData = [];
function prepareHSData(){
	Object.values(deals).forEach(function(deal){
		var datum = {
			objectId: deal.hsId,
			properties: []
		};
		Object.keys(deal.months).forEach(function(monthName){
			datum.properties.push({
				name: monthName,
				value: deal.months[monthName]
			})
		});
		hsData.push(datum);
	});

	uploadHSData();
}

function uploadHSData(){
	var index = 0;
	console.log(hsData.length)
	sendNextBatch();

	function sendNextBatch(){
		if(index < hsData.length){
			var dealBatch = hsData.slice(index, index + 100);
			console.log(index)
			console.log(dealBatch.length);
			request({
				method: 'POST',
				url: 'https://api.hubapi.com/deals/v1/batch-async/update',
				qs: {
					hapikey: ENV.HAPIKEY
				},
				body: JSON.stringify(dealBatch)
			}, function(error, response, body){
				console.log(response.statusCode)
				if(error){
					console.log(body);
				}else{
					index += 100;
					sendNextBatch();
				}
			});
		}
	}
}
