var Transfer = require('transfer-sh')
const http_request  = require('got');

const token = "token " + "YOUR TOKEN";
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
  console.log(profile_details);
  return profile_details;
}

exports.getDblpData = getDblpData

