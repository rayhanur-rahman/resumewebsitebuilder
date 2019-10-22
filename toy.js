var Transfer = require('transfer-sh')
const http_request  = require('got');

const gitHubUrl = "https://api.github.com";
const linkedinUrl = "https://api.linkedin.com/v2";
const dblpUrl = "https://dblp.org"

async function getDblpData(userName){
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

async function getLinkedInData(userId, token, fields){
	const url = linkedinUrl + "/people/" + userId+"?fields="+fields;
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

async function getGitHubData(userId, token){
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


exports.getDblpData = getDblpData
exports.getLinkedInData = getLinkedInData
exports.getGitHubData = getGitHubData

