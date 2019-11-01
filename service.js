const fs = require('fs');
const AWS = require('aws-sdk');
const Transfer = require('transfer-sh')
const toy = require('./util.js')
const helper = require('./bot-helper.js')
require('dotenv').config();


require('dotenv').config();
const s3 = new AWS.S3({
    accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY
});

var gitHubToken = process.env.GITHUB_TOKEN;


function getUserIdFromDBLPLink(userLink) {
    return mock_data.dblpId;
}

function getUserIdFromGitHubLink(userLink) {
    return mock_data.gitHubId;
}
//Extracting LinkedIn Info; return false if failed

async function ExtractingLinkedInInfo(userId, token) {

    var profile_data = await toy.getLinkedInData(userId);
    console.log(profile_data)
    // Need to store profile_data in db with corresponding userId
    return true;
}

//Extracting DBLP Info; return false if failed

function ExtractingDBLPInfo(userId, response) {

    var profile_data = toy.getDblpData(getUserIdFromDBLPLink(response));
    // Need to store profile_data in db with corresponding userId
    return true;
}

//Extracting Github Info; return false if failed
function ExtractingGithubInfo(userId, response) {

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
            return link;
        })
        .catch(function (err) {
            console.log('could not upload');
            console.log(helper.getZipURL());
            return 'www.null.com';
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
            return link;
        })
        .catch(function (err) {
            console.log('could not upload');
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
    deleteAllData: deleteAllData
};