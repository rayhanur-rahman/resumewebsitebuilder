const fs = require('fs');
const AWS = require('aws-sdk');
const mock_data = require('./mock_data.json');
const Transfer = require('transfer-sh')
const toy = require('./util.js')
const nock = require("nock");
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY
});

var gitHubToken = process.env.GITHUB_TOKEN;

var sessionData = {
    fileURL: ''
}


function getUserIdFromDBLPLink(userLink) {
    return mock_data.dblpId;
}

function getUserIdFromGitHubLink(userLink) {
    return mock_data.gitHubId;
}
//Extracting LinkedIn Info; return false if failed

function ExtractingLinkedInInfo(userId, token) {

    var fields = "education,projects,skill";
    nock("https://api.linkedin.com/v2", {
            reqheaders: {
                'Authorization': token
            },
        })
        .persist()
        .get("/people/bob?fields=" + fields)
        .reply(200, JSON.stringify(mock_data.linkedInProfile));

    var profile_data = toy.getLinkedInData(userId, token, fields);
    // Need to store profile_data in db with corresponding userId
    return true;
}

//Extracting DBLP Info; return false if failed

function ExtractingDBLPInfo(userId, response) {
    nock("https://dblp.org")
        .persist()
        .get("/search/publ/api?q==author:bob_smith:&format=json")
        .reply(200, JSON.stringify(mock_data.dblp_profile));

    var profile_data = toy.getDblpData(getUserIdFromDBLPLink(response));
    // Need to store profile_data in db with corresponding userId
    return true;
}

//Extracting Github Info; return false if failed
function ExtractingGithubInfo(userId, response) {

    nock("https://api.github.com", {
            reqheaders: {
                'Authorization': gitHubToken
            },
        })

        .persist()
        .get("/users/bob_smith/repos")
        .reply(200, JSON.stringify(mock_data.gitRepos));

    var profile_data = toy.getGitHubData(getUserIdFromGitHubLink(response), gitHubToken);

    // Need to store profile_data in db with corresponding userId
    return true;
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
function mergeAllInfo(userId) {
    console.log('called');
    return new Transfer('./user-mock-data.yml')
        .upload()
        .then(function (link) {
            console.log(`File uploaded successfully at ${link}`);
            sessionData.fileURL = link;
            return sessionData.fileURL;
        })
        .catch(function (err) {
            console.log('could not upload');
            sessionData.fileURL = 'www.null.com';
            return sessionData.fileURL;
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
    deleteAllData: deleteAllData
};