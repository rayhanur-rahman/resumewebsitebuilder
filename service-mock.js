const fs = require('fs');
const AWS = require('aws-sdk');
const Transfer = require('transfer-sh')
const utils = require('./util.js')
const nock = require("nock");
require('dotenv').config();
var MongoHelper = require('./mongo-helper.js').MongoHelper;
const axios = require("axios");
var xml2js = require('xml2js');
const util = require('util');
const http_request = require('got');
var MongoHelper = require('./mongo-helper.js').MongoHelper;
var YAML = require('json2yaml');
const admZip = require('adm-zip');
const Path = require('path')  
const { zip } = require('zip-a-folder');
var crypto = require('crypto');
var walk = require('walk');
var request = require('request');




const s3 = new AWS.S3({
    accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY
});

var gitHubToken = process.env.GITHUB_TOKEN;

var sessionData = {
    fileURL: ''
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

//Extracting LinkedIn Info; return false if failed

async function ExtractingLinkedInInfo(userId, url) {
    console.log(url);
    var profile_data = await utils.getLinkedInData(url);
    console.log(profile_data);

    var linkedInData = {
        name: profile_data.profileAlternative.name,
        title: profile_data.profileAlternative.headline,
        imageUrl: profile_data.profileAlternative.imageurl,
        summary: profile_data.profileAlternative.summary,
        education: [],
        experience: [],
        skills: ''
    }

    profile_data.skills.forEach(element => {
        linkedInData.skills = linkedInData.skills + ' | ' + element.title;
    });

    profile_data.positions.forEach(item => {
        linkedInData.experience.push({
            role: item.title,
            time: item.date1,
            company: item.companyName,
            location: item.location,
            details: item.description
        });
    });

    profile_data.educations.forEach(item => {
        linkedInData.education.push({
            university: item.title,
            time: item.date1 + ' - ' + item.date2,
            major: item.fieldofstudy,
            degree: item.degree,
            details: item.description
        });
    });

    if (profile_data != null) {
        var dbo = await MongoHelper.openConnection();
        var response = await MongoHelper.findObject(dbo, {
            user: userId
        });
        if (response != null) {
            await MongoHelper.updateObject(dbo, {
                user: userId
            }, {
                $set: {
                    linkedInData: linkedInData
                }
            });
        }
        MongoHelper.closeConnection();
        return true;
    } else
        return false;
}

//Extracting DBLP Info; return false if failed

async function ExtractingDBLPInfo(userId, response) {
    var result = await getUserIdFromDBLPLink(response);
    if (result != null) {
        result = await getDblpData(result);

        var dblpData = [];

        result.forEach(item => {
            if (item.article != null) {
                dblpData.push({
                    title: item.article[0].title[0],
                    authors: item.article[0].author.join(', '),
                    conference: item.article[0].journal[0],
                    link: 'https://dblp.org/' + item.article[0].url[0]
                });
            }

            if (item.inproceedings != null) {
                dblpData.push({
                    title: item.inproceedings[0].title[0],
                    authors: item.inproceedings[0].author.join(', '),
                    conference: item.inproceedings[0].booktitle[0],
                    link: 'https://dblp.org/' + item.inproceedings[0].url[0]
                });
            }
        })

        if (result != null) {
            console.log(result);
            var dbo = await MongoHelper.openConnection();
            var response = await MongoHelper.findObject(dbo, {
                user: userId
            });
            if (response != null) {
                await MongoHelper.updateObject(dbo, {
                    user: userId
                }, {
                    $set: {
                        dblpData: dblpData
                    }
                });
            }
            MongoHelper.closeConnection();
            return true;
        } else
            return false;
    } else
        return false;

}

//Extracting Github Info; return false if failed
async function ExtractingGithubInfo(userId, githubUserName) {
    const url = 'https://api.github.com' + "/users/" + githubUserName + "/repos";
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
        console.log(profile_details);

        var projectDetails = [];
        for (var i = 0; i < profile_details.length; i++) {
            var data = {
                name: profile_details[i].name,
                link: profile_details[i].html_url,
                details: profile_details[i].description
            }
            projectDetails.push(data);
        }

        var dbo = await MongoHelper.openConnection();
        var response = await MongoHelper.findObject(dbo, {
            user: userId
        });
        if (response != null) {
            await MongoHelper.updateObject(dbo, {
                user: userId
            }, {
                $set: {
                    githubData: projectDetails
                }
            });
        }
        MongoHelper.closeConnection();
        return true;
    } catch (error) {
        return false;
    }
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

async function pushDir(userName, repoName, token, dir) {
    var listoffiles = await getDir(dir);
    // console.log(listoffiles);
    var GithubRepoName = await createRepo(repoName, token);

    for (i = 0; i < listoffiles.length; i++) {
        item = listoffiles[i];
        var content = await PushFileToGithub(userName, GithubRepoName, token, item.absolute, item.relative);
    }

}

// If invalid (userGithubToken | userGithubRepoName) return false
async function createRepoForUser(userId, username, token, path) {
    const zip = new admZip('./resources/site-ac.zip');
    var randomTmpFolderName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (!fs.existsSync(`./tmp/${randomTmpFolderName}`)) {
        fs.mkdirSync(`./tmp/${randomTmpFolderName}`);
    }

    zip.extractAllTo(`./tmp/${randomTmpFolderName}`, true);

    fs.copyFile(path, `./tmp/${randomTmpFolderName}/site/_data/data.yml`, (err) => {
        if (err) throw err;
    });
    
    await pushDir(username, `${username}.github.io`, token, `./tmp/${randomTmpFolderName}/site`)
    console.log('complete')
    return true;
}

async function zipAFolder(srcPath, destPath){
    return await zip(srcPath, destPath)
    .then(s => {return true})
    .catch(e => {return false});
}

// This function is called when the zippedCV is successfully uploaded;
// Return false if failed
async function uploadZippedCV(userId, path) {

    const zip = new admZip('./resources/site-ac.zip');
    var randomTmpFolderName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (!fs.existsSync(`./tmp/${randomTmpFolderName}`)) {
        fs.mkdirSync(`./tmp/${randomTmpFolderName}`);
    }

    zip.extractAllTo(`./tmp/${randomTmpFolderName}`, true);

    fs.copyFile(path, `./tmp/${randomTmpFolderName}/site/_data/data.yml`, (err) => {
        if (err) throw err;
    });

    if (await zipAFolder(`./tmp/${randomTmpFolderName}/site`, './site.zip')) {
        var link = await utils.upload('./site.zip').catch(exception => {
            return null;
        });

        var dbo = await MongoHelper.openConnection();
        var response = await MongoHelper.findObject(dbo, {
            user: userId
        });

        if (link != null && response != null) 
        {
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
    fs.unlinkSync('site.zip');
    return link;

    return new Transfer('./site-mock.zip')
        .upload()
        .then(function (link) {
            console.log(`File uploaded successfully at ${link}`);
            sessionData.fileURL = link;
            return sessionData.fileURL;
        })
        .catch(function (err) {
            console.log('could not upload');
            sessionData.fileURL = 'www.null.com';
            console.log(getZipURL());
            return sessionData.fileURL;
        })
}

// This function verifies the yml content of the file uploaded by the user
// Return false if the content is inconsistent with the data obtained from the links or
// submitted earlier by the user
function verifyYMLContent(url) {
    // check if the link contains a yml file
    // check if the yml files contains required attributes
    return true;
}

// This function uploads an empty template for the user to fill in when they don't have
// one or any links
function uploadEmptyTemplate() {

}

// This function merges all the info extracted from the linkedin, dblp, and github page
// and put them in yml file
async function mergeAllInfo(userId) {

    var dbo = await MongoHelper.openConnection();
    var response = await MongoHelper.findObject(dbo, {
        user: userId
    });

    if (response != null) {
        if (response.linkedInData != null) {
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

        if (response.dblpData != null) {

            if (response.dblpData.length > 0) {
                response.profileData.publications.items = [];
                response.dblpData.forEach(item => {
                    response.profileData.publications.items.push(item);
                });
            }

        }

        if (response.githubData != null) {

            if (response.githubData.length > 0) {
                response.profileData.projects.items = [];
                response.githubData.forEach(item => {
                    response.profileData.projects.items.push(item);
                });
            }


        }

        await MongoHelper.updateObject(dbo, {
            user: userId
        }, {
            $set: {
                profileData: response.profileData
            }
        });


        var ymlText = YAML.stringify(response.profileData);

        fs.writeFileSync('data.yml', ymlText, (err) => {
            console.log(err)
        });

    }

    var link = await utils.upload('./data.yml').catch(exception => {
        return null;
    });
    if (link != null) await MongoHelper.updateObject(dbo, {
        user: userId
    }, {
        $set: {
            fileURL: link
        }
    });
    MongoHelper.closeConnection();
    fs.unlinkSync('data.yml');
    return link;

    return new Transfer('./data.yml')
        .upload()
        .then(async function (link) {
            console.log(`File uploaded successfully at ${link}`);
            await MongoHelper.updateObject(dbo, {
                user: userId
            }, {
                $set: {
                    fileURL: link
                }
            });
            MongoHelper.closeConnection();
            fs.unlinkSync('data.yml');
            return link;
        })
        .catch(function (err) {
            console.log('could not upload');
            sessionData.fileURL = 'www.null.com';
            MongoHelper.closeConnection();
            fs.unlinkSync('data.yml');
            return 'www.null.com';
        })
}

//Once the session is terminated, all the data relevant to the session will be deleted
function deleteAllData() {
    return true;
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

async function downloadYmlFile(url){

    var randomTmpFolderName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (!fs.existsSync(`./tmp/${randomTmpFolderName}`)) {
        fs.mkdirSync(`./tmp/${randomTmpFolderName}`);
    }

    if (await download(url, `./tmp/${randomTmpFolderName}`, 'data.yml')  ) 
        return `./tmp/${randomTmpFolderName}/data.yml`
    else 
        return null

}

//module.exports.verifyYMLContent = verifyYMLContent;

module.exports = {
    mergeAllInfo: mergeAllInfo,
    verifyYMLContent: verifyYMLContent,
    ExtractingLinkedInInfo: ExtractingLinkedInInfo,
    ExtractingDBLPInfo: ExtractingDBLPInfo,
    ExtractingGithubInfo: ExtractingGithubInfo,
    createRepoForUser: createRepoForUser,
    uploadZippedCV: uploadZippedCV,
    uploadEmptyTemplate: uploadEmptyTemplate,
    fs: fs,
    AWS: AWS,
    s3: s3,
    deleteAllData: deleteAllData,
    ExtractingDBLPInfo: ExtractingDBLPInfo,
    getDblpData: getDblpData,
    getUserIdFromDBLPLink: getUserIdFromDBLPLink,
    downloadYmlFile: downloadYmlFile
};