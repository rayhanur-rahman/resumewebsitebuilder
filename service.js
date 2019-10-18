const got  = require('got');

const token = "token " + "YOUR TOKEN";
const gitHubUrl = "https://api.github.com";
const linkedinUrl = "https://api.linkedin.com/v2";
const dblpUrl = "https://dblp.org"

function getGitRepos(userName) {
	const url = gitHubUrl + '/users/' + userName + "/repos";
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

function getLinkedInProfile(userId, fieldList) {
	const url = linkedinUrl + '/people/' + userId + "?fields=" + fieldList;
	const options = {
		method: 'GET',
		headers: {
			"content-type": "application/json",
            "Authorization": token,
            "Accept" : "X-RestLi-Protocol-Version:2.0.0"
		},
		json: true
	};

	let profile_details = (await got(url, options)).body;
	return profile_details;
}

function getDblpProfile(userId) {
	const url = dblpUrl + '/search/publ/api?q==author:' + userId + ":&format=json");
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