const fs = require('fs');
const AWS = require('aws-sdk');
const http_request = require('request');
const Transfer = require('transfer-sh');
const mock_data = require('./mock_data.json');

require('dotenv').config();
const s3 = new AWS.S3({
    accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY
});

// After the bot processes all the data, this is where the yml file is stored
var fileURL;
//After the bot 
var ZipUrl;

// After the bot asks for token, this is where token is stored
var userGithubToken;

// After the bot asks for repo name, this is where repo name is stored
var userGithubRepoName;
//After the bot asks for LinkedIn accountID, this is where acc ID is stored
var userLinkedInId;
//After the bot asks for LinkedIn token, this is where token is stored
var userLinkedInToken;

// There are three levels. 0-2
// 0: starts with 'start'
// 1: starts with 'I am ready'
// 2: starts with 'verify'
var level = 0;

var noGithubFlag = false;
var noLinkedInFlag = false;
var noDblpFlag = false;

const token = "token " + "YOUR TOKEN";
const gitHubUrl = "https://api.github.com";
const linkedinUrl = "https://api.linkedin.com/v2";
const dblpUrl = "https://dblp.org"

function setLevel(level, userId) {
    // set level value in db
}

function getLevel(userId) {
    // get level data from db
}

function incrementLevel(userId) {
    //increment the level in db
}

function setUser(userId) {
    return true;
}


//Extracting LinkedIn Info; return false if failed
function ExtractingLinkedInInfo(ID, token) {
    const url = linkedinUrl + '/people/' + "?fields=";
    const options = {
        method: 'GET',
        headers: {
            "content-type": "application/json",
            "Authorization": token
        },
        json: true
    };

    let profile_details = (http_request(url, options)).body;
    return true;
}

//Extracting DBLP Info; return false if failed
function ExtractingDBLPInfo(response) {
    const url = dblpUrl + '/search/publ/api?q==author:' + ":&format=json";
    const options = {
        method: 'GET',
        headers: {
            "content-type": "application/json"
        },
        json: true
    };

    let profile_details = (http_request(url, options)).body;
    return true;
}

//Extracting Github Info; return false if failed
function ExtractingGithubInfo(response) {

    const url = gitHubUrl + "/users/" + "/repos";
    const options = {
        method: 'GET',
        headers: {
            "content-type": "application/json",
            "Authorization": token
        },
        json: true
    };

    let repos = (http_request(url, options)).body;
    return true;
}

// If invalid (userGithubToken | userGithubRepoName) return false
function createRepoForUser() {
    //console.log(getGithubRepoName());
    //console.log(getGithubToken());
    return true;
}

// this function does not work for now
function setFileURL(URL) {
    fileURL = URL;
    //console.log(fileURL)
}

function getZipURL() {
    return mock_data.zipurl;
}

// this function does not work for now
function getFileURL() {
    return mock_data.fileurl;
}

// When asked for a token, the text of the user's reply is taken and passed
// to this function to set the global var userGithubToken
function setGithubtoken(token) {
    userGithubToken = token;
}
//Once the session is terminated, all the data relevant to the session will be deleted
function deleteAllData() {
    return true;
}
// When asked for a repo name, the text of the user's reply is taken and passed
// to this function to set the global var userGithubRepoName
function setRepoName(repoName) {
    userGithubRepoName = repoName;
}

function setLinkedInToken(token) {
    userLinkedInToken = token;
}

function getLinkedInToken() {
    return userLinkedInToken;
}

function setLinkedInId(Id) {
    userLinkedInId = Id;
}

function getLinkedInId() {
    return userLinkedInId;
}

// getter function; not needed as the var userGithubToken is global
function getGithubToken() {
    return userGithubToken;
}

// getter function; not needed as the var userGithubRepoName is global
function getGithubRepoName() {
    return userGithubRepoName;
}

// This function is called when the zippedCV is successfully uploaded;
// Return false if failed
async function uploadZippedCV() {
    await new Transfer('./user-mock-data.zip')
        .upload()
        .then(function (link) {
            console.log(`File uploaded successfully at ${link}`);
            ZipUrl = link;
            return ZipUrl;
        })
        .catch(function (err) {
            console.log(err)
        })
}

// This function verifies the yml content of the file uploaded by the user
// Return false if the content is inconsistent with the data obtained from the links or
// submitted earlier by the user
function verifyYMLContent() {
    return true;
}

// This function uploads an empty template for the user to fill in when they don't have
// one or any links
function uploadEmptyTemplate() {

}

// This function merges all the info extracted from the linkedin, dblp, and github page
// and put them in yml file
async function mergeAllInfo() {
    //Merging all the information
new Transfer('./user-mock-data.yml')
        .upload()
        .then(function (link) {
            console.log(`File uploaded successfully at ${link}`);
            fileURL = link;
            console.log("print in function: " + fileURL);
            return fileURL;
        })
        .catch(function (err) {
            console.log(err)
        })
}

//module.exports.verifyYMLContent = verifyYMLContent;

module.exports = {
    deleteAllData: deleteAllData,
    mergeAllInfo: mergeAllInfo,
    verifyYMLContent: verifyYMLContent,
    fileURL: fileURL,
    ZipUrl: ZipUrl,
    userGithubToken: userGithubToken,
    userGithubRepoName: userGithubRepoName,
    ExtractingLinkedInInfo: ExtractingLinkedInInfo,
    ExtractingDBLPInfo: ExtractingDBLPInfo,
    ExtractingGithubInfo: ExtractingGithubInfo,
    createRepoForUser: createRepoForUser,
    setFileURL: setFileURL,
    getFileURL: getFileURL,
    setGithubtoken: setGithubtoken,
    setRepoName: setRepoName,
    getGithubToken: getGithubToken,
    getGithubRepoName: getGithubRepoName,
    uploadZippedCV: uploadZippedCV,
    uploadEmptyTemplate: uploadEmptyTemplate,
    getLinkedInToken: getLinkedInToken,
    getLinkedInId: getLinkedInId,
    setLinkedInToken: setLinkedInToken,
    setLinkedInId: setLinkedInId,
    fs: fs,
    AWS: AWS,
    s3: s3,
    setLevel: setLevel,
    getLevel: getLevel,
    incrementLevel: incrementLevel,
    getZipURL: getZipURL
};