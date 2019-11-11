var Transfer = require('transfer-sh')
const scrapedin = require('scrapedin')
const gitHubUrl = "https://api.github.com";
const linkedinUrl = "https://api.linkedin.com/v2";
const dblpUrl = "https://dblp.org"
const fs = require('fs');
const Transfer = require('transfer-sh')
const axios = require("axios");
var xml2js = require('xml2js');
const http_request = require('got');
var MongoHelper = require('./mongo-helper.js').MongoHelper;
const Path = require('path')  
const { zip } = require('zip-a-folder');
var walk = require('walk');
var request = require('request');

require('dotenv').config();


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

async function download (url, dir, fileName) {  
    const path = Path.resolve(__dirname, dir, fileName)
    const writer = fs.createWriteStream(path)
  
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {resolve(true)})
      writer.on('error', () => {reject(false)})
    })
}

function getUserIdFromDBLPLink(userLink) {
    return axios(userLink)
        .then(response => {
            var regexForPid = /homepages\/[0-9]*\/[0-9]*/g;
            var found = response.data.match(regexForPid);
            return found[0].substring(9);

        })
        .catch(err => {
            return null;
        });
}

async function getDblpData(userName) {
    const url = "https://dblp.org" + '/pid' + userName + ".xml";

    let profile_details = (await http_request(url, {
        method: 'GET',
        headers: {
            "content-type": "application/xml"
        }
    })).body;

    return xml2js.parseStringPromise(profile_details, {
            attrkey: '@'
        }).then(function (result) {
            return result.dblpperson.r;
        })
        .catch(function (err) {
            console.log(err);
            return null;
        });
}

//Function to read file from directory and convert it to Base-64 format
async function ReadFileAndConvertToBase_64(pathName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(pathName, function (err, data) {
            if (err) {
                return console.error(err);
            }
            //console.log(data.toString());
            //var b = new Buffer(data.toString());
            var base_64_format_file = data.toString('base64');
            resolve(base_64_format_file);
        });
    });
}

async function pushDataToGitHub(userName, repoName, token, dir) {
    var listoffiles = await getDir(dir);
    // console.log(listoffiles);
    var GithubRepoName = await createRepo(repoName, token);

    for (i = 0; i < listoffiles.length; i++) {
        item = listoffiles[i];
        var content = await PushFileToGithub(userName, GithubRepoName, token, item.absolute, item.relative);
    }

}

//Function to push files into github repo
async function PushFileToGithub(username, RepoName, token, absolutePath, relativePath) {
    var endpoint = "/repos/" + username + "/" + RepoName + `/contents/${relativePath}`;
    var contents = await ReadFileAndConvertToBase_64(absolutePath);

    return new Promise(function (resolve, reject) {
        request({
                url: "https://api.github.com" + endpoint,
                method: "PUT",
                headers: {
                    "User-Agent": "CSC510-REST-WORKSHOP",
                    "content-type": "application/json",
                    "Authorization": `token ${token}`
                },
                json: {
                    "message": `added ${relativePath}`,
                    "content": contents
                }
            },
            function (error, response, body) {
                if (error) {
                    console.log(chalk.red(error));
                    reject(error);
                    return; // Terminate execution.
                }
                // console.log(response.statusCode);
                var message = (response.statusCode == 201) ? true : false;
                resolve(message);
            });
    });
}

async function getDir(dir) {
    var files = [];
    var walker = walk.walk(dir, {
        followLinks: false
    });

    return new Promise((resolve, reject) => {
        walker.on('file', function (root, stat, next) {
            // console.log(root);
            files.push({
                absolute: root + '/' + stat.name,
                leaf: stat.name,
                relative: (root + '/' + stat.name).substring(dir.length + 1)
            });
            next();
        });

        walker.on('end', function () {
            resolve(files);
        });
    });
}

async function createRepo(repo, token) {

    var endpoint = "/user/repos";
    //console.log(urlRoot+endpoint)
    return new Promise(function (resolve, reject) {
        request({
                url: 'https://api.github.com' + endpoint,
                method: "POST",
                headers: {
                    "User-Agent": "CSC510-REST-WORKSHOP",
                    "content-type": "application/json",
                    "Authorization": `token ${token}`
                },
                json: {
                    "name": repo,
                    "description": "Your Repo for personalized homepage",
                    "private": false,
                    "has_issues": true,
                    "has_projects": true,
                    "has_wiki": false
                }
            },
            function (error, response, body) {
                if (error) {
                    console.log(chalk.red(error));
                    reject(error);
                    return; // Terminate execution.
                }
                console.log(body.name);
                resolve(body.name);
            });
    });
}

async function zipFolder(srcPath, destPath){
    return await zip(srcPath, destPath)
    .then(s => {return true})
    .catch(e => {return false});
}



exports.getDblpData = getDblpData
exports.getLinkedInData = getLinkedInData
exports.getGitHubData = getGitHubData
exports.setLinkedInData = setLinkedInData
exports.upload = upload
exports.download = download
exports.getUserIdFromDBLPLink = getUserIdFromDBLPLink
exports.ReadFileAndConvertToBase_64 = ReadFileAndConvertToBase_64
exports.pushDataToGitHub = pushDataToGitHub
exports.zipFolder = zipFolder
//linkedintester88
//qwerty12