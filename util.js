var Transfer = require('transfer-sh')
const http_request = require('got');
const scrapedin = require('scrapedin')

const gitHubUrl = "https://api.github.com";
const linkedinUrl = "https://api.linkedin.com/v2";
const dblpUrl = "https://dblp.org"
var MongoHelper = require('./mongo-helper.js').MongoHelper;
var request = require('request')
var fs = require('fs')

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

async function getLinkedInData(profileLink) {
	console.log(profileLink);
	return scrapedin({
        email: process.env.LINKEDIN_MAILID,
        password: process.env.LINKEDIN_PASS
    }).then((profileScraper) => profileScraper(profileLink))
    .then((profile) => {
        return profile;
    }).catch(err => {console.log(err); return null;});
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

function upload(filename) {
    return new Promise((resolve, reject) => {
        request.post('https://0x0.st', function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        }).form().append('file', fs.createReadStream(filename));
    });
}

exports.getDblpData = getDblpData
exports.getLinkedInData = getLinkedInData
exports.getGitHubData = getGitHubData
exports.setLinkedInData = setLinkedInData
exports.upload = upload

//linkedintester88
//qwerty12