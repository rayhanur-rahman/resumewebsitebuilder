var Transfer = require('transfer-sh')
const http_request = require('got');
const scrapedin = require('scrapedin')

const gitHubUrl = "https://api.github.com";
const linkedinUrl = "https://api.linkedin.com/v2";
const dblpUrl = "https://dblp.org"
var MongoHelper = require('./mongo-helper.js').MongoHelper;

require('dotenv').config();


async function getDblpData(userName) {
	const url = dblpUrl + '/search/publ/api?q==author:' + userName + ":&format=json";
	const options = {
		method: 'GET',
		headers: {
			"content-type": "application/json"
		},
		json: true
	};

	let profile_details = (await http_request(url, options)).body;
	// console.log(profile_details);
	return profile_details;
}

async function getLinkedInData(userId) {

  	const profileScraper = await scrapedin({ email: process.env.LINKEDIN_MAILID, password: process.env.LINKEDIN_PASS });
  	const profile = await profileScraper(userId);
	return profile;
}

async function getGitHubData(userId, token) {
	const url = gitHubUrl + "/users/" + userId + "/repos";
	const options = {
		method: 'GET',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		},
		json: true
	};
	let profile_details = (await http_request(url, options)).body;
	// console.log(profile_details);
	return profile_details;
}


async function setLinkedInData(profile){
	var profile_obj = JSON.stringify(profile);

	var dbo = await MongoHelper.openConnection();
	// var response = await MongoHelper.findObject(dbo, {user: userId});
	// if (response != null) {
		await MongoHelper.insertObjectToCollection(dbo, {user: "userId"}, {$set: {linkedInData: profile_obj}});
	// }
	MongoHelper.closeConnection();
}

exports.getDblpData = getDblpData
exports.getLinkedInData = getLinkedInData
exports.getGitHubData = getGitHubData
exports.setLinkedInData = setLinkedInData