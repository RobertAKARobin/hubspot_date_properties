const request = require('request');
const ENV = require('./env.json');

Date.prototype.getMonthWithZeroes = function(){
	let date = this;
	return ('0' + (date.getMonth()+1)).slice(-2);
}

let startDate = new Date(2012, 06);
goToNextDate();

function goToNextDate(){
	let currentDate = startDate.getFullYear() + '_' + startDate.getMonthWithZeroes();
	startDate.setMonth(startDate.getMonth() + 1);
	console.log(currentDate);
	if(currentDate != '2022_12'){
		goToNextDate();
	}
}
