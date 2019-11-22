const fs = require('fs');
const utils = require('./util.js')
var MongoHelper = require('./mongo-helper.js').MongoHelper;
const http_request = require('got');
const scrapedin = require('scrapedin')
var xml2js = require('xml2js');
var walk = require('walk');
const request = require('request');
const helper = require('./bot-helper.js')

const gitHubUrl = "https://api.github.com";
const dblpUrl = "https://dblp.org";


async function prepareTempData(userId, path, zip){
    var randomTmpFolderName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (!fs.existsSync(`./tmp/${randomTmpFolderName}`)) {
        fs.mkdirSync(`./tmp/${randomTmpFolderName}`);
    }
    zip.extractAllTo(`./tmp/${randomTmpFolderName}`, true);

    fs.copyFile(path, `./tmp/${randomTmpFolderName}/site/_data/data.yml`, (err) => {
        if (err) throw err;
    });

    profilePicUrl = (await helper.getProfileData(userId)).intro.avatar.path
    await utils.download(profilePicUrl, `./tmp/${randomTmpFolderName}/site/assets/images/`, 'profile.png')

    return randomTmpFolderName
}


async function prepareRepoForResume(userId, username, token, path, zip){
    var randomTmpFolderName = await prepareTempData(userId, path, zip);
    await pushDataToGitHub(username, `${username}.github.io`, token, `./tmp/${randomTmpFolderName}/site`)
    console.log('complete')
    return true;
}


async function prepareZippedFile(userId, path, zip){
    var randomTmpFolderName = await prepareTempData(userId, path, zip);
    let link;
    if (await utils.zipFolder(`./tmp/${randomTmpFolderName}/site`, './site.zip')) {
        link = await utils.upload('./site.zip').catch(exception => {
            return null;
        });
        var dbo = await MongoHelper.openConnection();
        var response = await MongoHelper.findObject(dbo, {
            user: userId
        });
        if (link != null && response != null) {
            await MongoHelper.updateObject(dbo, {
                user: userId
            }, {
                $set: {
                    zippedSiteUrl: link
                }
            });
        }
    }
    MongoHelper.closeConnection();
    return link;
}

function mergeLinkedInData(response){
    response.profileData.contact.linkedin = response.linkedInData.username;
    response.profileData.intro.name = response.linkedInData.name;
    response.profileData.intro.title = (response.linkedInData.title != null) ? response.linkedInData.title : '...';
    response.profileData.intro.avatar.path = (response.linkedInData.imageUrl != null) ? response.linkedInData.imageUrl : '...';
    response.profileData.profile.details = (response.linkedInData.summary != null) ? response.linkedInData.summary : '...';
    if (response.linkedInData.education.length > 0) {
        response.profileData.education.items = [];
        response.linkedInData.education.forEach(item => {
            response.profileData.education.items.push(item);
        });
    }
    if (response.linkedInData.experience.length > 0) {
        response.profileData.experiences.items = [];
        response.linkedInData.experience.forEach(item => {
            response.profileData.experiences.items.push(item);
        });
    }
    response.profileData.skills.details = (response.linkedInData.skills != ' ') ? response.linkedInData.skills : response.profileData.skills.details;  
}

function mergeDblpData(response){
    if (response.dblpData.length > 0) {
        response.profileData.publications.items = [];
        response.dblpData.forEach(item => {
            response.profileData.publications.items.push(item);
        });
    }
}

function mergeGitHubData(response){
    if (response.githubData.projects != null) {
        if (response.githubData.projects.length > 0) {
            response.profileData.contact.github = response.githubData.author;
            response.profileData.projects.items = [];
            response.githubData.projects.forEach(item => {
                response.profileData.projects.items.push(item);
            });
            
        }
    }
}


async function createRepo(repo, token) {

    var endpoint = "/user/repos";
    //console.log(urlRoot+endpoint)
    return new Promise(function (resolve, reject) {
        request({
                url: gitHubUrl + endpoint,
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
    var contents = await utils.ReadFileAndConvertToBase_64(absolutePath);

    return new Promise(function (resolve, reject) {
        request({
                url: gitHubUrl + endpoint,
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


async function getDblpData(userName) {
    const url = dblpUrl + '/pid' + userName + ".xml";

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

async function getLinkedInData(profileLink) {
	console.log(profileLink);
	return scrapedin({
        email: process.env.LINKEDIN_MAILID,
        password: process.env.LINKEDIN_PASS
    }).then((profileScraper) => profileScraper(profileLink))
    .then((profile) => {
        return profile;
    }).catch(err => {console.log('could not parse linkedin site, try again later'); return null;});
}


async function getGitHubData(githubUserName) {
    const url =  gitHubUrl + "/users/" + githubUserName + "/repos";
    const options = {
        method: 'GET',
        headers: {
            "content-type": "application/json"
        },
        json: true
    };
    let profile_details;
    try {
        profile_details = (await http_request(url, options)).body;
    } catch (error) {
        return null;
    }
    return profile_details;
}

module.exports = {
    getLinkedInData : getLinkedInData,
    prepareRepoForResume : prepareRepoForResume,
    prepareZippedFile : prepareZippedFile,
    mergeLinkedInData : mergeLinkedInData,
    mergeDblpData : mergeDblpData,
    mergeGitHubData : mergeGitHubData,
    getDblpData : getDblpData,
    getGitHubData : getGitHubData
}

