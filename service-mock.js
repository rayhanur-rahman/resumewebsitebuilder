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

// If invalid (userGithubToken | userGithubRepoName) return false
function createRepoForUser(userId) {
    return true;
}


// This function is called when the zippedCV is successfully uploaded;
// Return false if failed
function uploadZippedCV(user) {
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
    var response = await MongoHelper.findObject(dbo, {user: userId});

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

        await MongoHelper.updateObject(dbo, {user: userId}, {$set: {profileData: response.profileData}});


        var ymlText = YAML.stringify(response.profileData);
        
        fs.writeFile('data.yml', ymlText, (err) => {

        });

    }
    
    var link =  await utils.upload('./data.yml').catch(exception => {return null;});
    if (link != null) await MongoHelper.updateObject(dbo, {user: userId}, {$set: {fileURL: link}});
    MongoHelper.closeConnection();
    fs.unlinkSync('data.yml');
    return link;

    return new Transfer('./data.yml')
        .upload()
        .then(async function (link) {
            console.log(`File uploaded successfully at ${link}`);
            await MongoHelper.updateObject(dbo, {user: userId}, {$set: {fileURL: link}});
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
    getUserIdFromDBLPLink: getUserIdFromDBLPLink
};