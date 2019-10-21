const got  = require('got');

const token = "token " + "YOUR TOKEN";
const gitHubUrl = "https://api.github.com";
const linkedinUrl = "https://api.linkedin.com/v2";
const dblpUrl = "https://dblp.org"

async function getGitRepos(userName) {
	const url = gitHubUrl + "/users/" + userName + "/repos";
	const options = {
		method: 'GET',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		},
		json: true
	};

	let repos = (await got(url, options)).body;
	return repos;
}


async function getLinkedInProfile(userId, fieldList) {
	const url = linkedinUrl + '/people/' + userId + "?fields=" + fieldList;
	const options = {
		method: 'GET',
		headers: {
			"content-type": "application/json",
            "Authorization": token
		},
		json: true
	};

	let profile_details = (await got(url, options)).body;
	return profile_details;
}

async function getDblpProfile(userId) {
	const url = dblpUrl + '/search/publ/api?q==author:' + userId + ":&format=json";
	const options = {
		method: 'GET',
		headers: {
			"content-type": "application/json"
		},
		json: true
	};

	let profile_details = (await got(url, options)).body;
	return profile_details;
}

function getGitData(userName){
	let repo_data = getGitRepos(userName);
	// convert the full data from github to the specific items
	console.log(repo_data)
	return repo_data;

}

function getLinkedInData(userId){
	let data = getLinkedInProfile(userId);
	// convert the full data from Linkedin to the specific items
	return data;

}

function getDblpData(userName){
	let data = getDblpProfile(userName);
	// convert the full data from DBLP to the specific items
	return data;

}

function mergeProfiles(gitHubData, linkedinData, dblpData){


}

function conversStart(slackUserId){

}

function validateLevel(slackUserId, currentLevel){

}

function validateUserProfiles(userProfile){

}

function prepareWebpageContent(userProfile){

}

exports.getGitData = getGitData
exports.getDblpData = getDblpData
exports.getLinkedInData = getLinkedInData