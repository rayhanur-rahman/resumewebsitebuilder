const fs = require('fs');
const AWS = require('aws-sdk');
const http_request  = require('request');
const mock_data = require('./mock_data.json');
const Transfer = require('transfer-sh')
const toy = require('./toy.js')
const nock = require("nock");


require('dotenv').config();
const s3 = new AWS.S3({
    accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY
});

// After the bot processes all the data, this is where the yml file is stored
var fileURL;

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

var sessionData = {
    level: 0,
    user: '',
    fileURL: '',
    userGithubToken: '',
    userGithubRepoName: '',
    userLinkedInId: '',
    userLinkedInToken: ''
}


const token = "token " + "YOUR TOKEN";
const gitHubUrl = "https://api.github.com";
const linkedinUrl = "https://api.linkedin.com/v2";
const dblpUrl = "https://dblp.org"

function setLevel(level, userId){
	sessionData.level = level;
}

function getLevel(userId){
	return sessionData.level;
}

function incrementLevel(userId){
	sessionData.level++;
}

function setUser(userId){
    sessionData.user = userId;
}

//Extracting LinkedIn Info; return false if failed
//TODO nockify
function ExtractingLinkedInInfo(userId,token) {
	const url = linkedinUrl + '/people/' + userId + "?fields=" + token;
	const options = {
		method: 'GET',
		headers: {
			"content-type": "application/json",
            "Authorization": token
		},
		json: true
	};

	let profile_details = ( http_request(url, options)).body;
    return true;
}


function getUserIdFromDBLPLink(userLink){
    return mock_data.dblpId;
}
//Extracting DBLP Info; return false if failed

function ExtractingDBLPInfo(userId, response) {
    nock("https://dblp.org")
    .persist()
    .get("/search/publ/api?q==author:bob_smith:&format=json")
    .reply(200, mock_data.dblp_profile);

    var profile_data = toy.getDblpData(getUserIdFromDBLPLink(response));
    console.log(profile_data);
    return true;
}

//Extracting Github Info; return false if failed
function ExtractingGithubInfo(userId, response) {

	const url = gitHubUrl + "/users/" + response + "/repos";
	const options = {
		method: 'GET',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		},
		json: true
	};

	let repos = ( http_request(url, options)).body;
    return true;
}

// If invalid (userGithubToken | userGithubRepoName) return false
function createRepoForUser(user) {
    //console.log(getGithubRepoName());
    //console.log(getGithubToken());
    return true;
}

// this function does not work for now
function setFileURL( URL ) {
    sessionData.fileURL = URL;
    //console.log(fileURL)
}

// this function does not work for now
function getFileURL(userId) {
    //console.log(fileURL);
    return sessionData.fileURL;
}

// When asked for a token, the text of the user's reply is taken and passed
// to this function to set the global var userGithubToken
function setGithubtoken( userId, token ) {
    sessionData.userGithubToken = token;
}
//Once the session is terminated, all the data relevant to the session will be deleted
function deleteAllData(){
    return true;
}
// When asked for a repo name, the text of the user's reply is taken and passed
// to this function to set the global var userGithubRepoName
function setRepoName( userId, repoName ) {
    sessionData.userGithubRepoName = repoName;
}

function setLinkedInToken( userId, token ){
    sessionData.userLinkedInToken = token;
}

function getLinkedInToken(userId) {
    return sessionData.userLinkedInToken;
}

function setLinkedInId (userId, link ){
    sessionData.userLinkedInId = parseLinkedInIdFromUrl(link);
}

function parseLinkedInIdFromUrl(link) {
    console.log(mock_data.linkedId);
    return mock_data.linkedId;
}

function getLinkedInId (userId){
     return sessionData.userLinkedInId;
}

// getter function; not needed as the var userGithubToken is global
function getGithubToken() {
    return sessionData.userGithubToken;
}

// getter function; not needed as the var userGithubRepoName is global
function getGithubRepoName() {
    return sessionData.userGithubRepoName;
}

// This function is called when the zippedCV is successfully uploaded;
// Return false if failed
function uploadZippedCV(user) {
    return getZippedContent(user);
}

function getZippedContent(user){
    return mock_data.zippedLink;
}

// This function verifies the yml content of the file uploaded by the user
// Return false if the content is inconsistent with the data obtained from the links or
// submitted earlier by the user
function verifyYMLContent(url){
    // check if the link contains a yml file
    // check if the yml files contains required attributes
    return true;
}

// This function uploads an empty template for the user to fill in when they don't have
// one or any links
function uploadEmptyTemplate(){

}

// This function merges all the info extracted from the linkedin, dblp, and github page
// and put them in yml file
function mergeAllInfo(userId){
    //Merging all the information
    fs.writeFile('MergedFile.txt', 'KichuEkta', function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });

    new Transfer('./MergedFile.txt')
        .upload()
        .then(function (link) { 
            console.log(`File uploaded successfully at ${link}`); 
            sessionData.fileURL = link;
            setFileURL(sessionData.fileURL);
            return sessionData.fileURL;
        })
        .catch(function (err) { console.log(err) })
}

//module.exports.verifyYMLContent = verifyYMLContent;

module.exports = {
    mergeAllInfo: mergeAllInfo,
    verifyYMLContent: verifyYMLContent,
    fileURL: fileURL,
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
    sessionData: sessionData,
    setUser: setUser,
    deleteAllData: deleteAllData
};

