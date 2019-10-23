const fs = require('fs');
const AWS = require('aws-sdk');
const http_request  = require('request');
const mock_data = require('./mock_data.json');
const Transfer = require('transfer-sh')
const toy = require('./util.js')
const nock = require("nock");
require('dotenv').config();


require('dotenv').config();
const s3 = new AWS.S3({
    accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY
});

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
    userLinkedInToken: '',
    noLinkedInFlag: false,
    noDblpFlag: false,
    noGithubFlag: false
}

var gitHubToken = process.env.GITHUB_TOKEN;

function setNoLinkedFlag(userId, value){
    sessionData.noLinkedInFlag = value;
}

function getNoLinkedFlag(userId){
    return sessionData.noLinkedInFlag;
}

function setNoDBLPFlag(userId, value){
    sessionData.noDblpFlag = value;
}

function getNoDBLPFlag(userId){
    return sessionData.noDblpFlag;
}

function setNoGithubFlag(userId, value){
    sessionData.noDblpFlag = value;
}

function getNoGithubFlag(userId){
    return sessionData.noDblpFlag;
}

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

function getZipURL(){
    return mock_data.zipurl;
}

// this function does not work for now
function getFileURL() {
    return mock_data.fileurl;
}

//Extracting LinkedIn Info; return false if failed

function ExtractingLinkedInInfo(userId, token) {

    var fields = "education,projects,skill";
    nock("https://api.linkedin.com/v2",{
        reqheaders: {
          'Authorization': token
        },
      })
    .persist()
    .get("/people/bob?fields="+fields)
    .reply(200, JSON.stringify(mock_data.linkedInProfile));

    var profile_data = toy.getLinkedInData(userId, token, fields);
    // Need to store profile_data in db with corresponding userId
    return true;
}


function getUserIdFromDBLPLink(userLink){
    return mock_data.dblpId;
}

function getUserIdFromGitHubLink(userLink){
    return mock_data.gitHubId;
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

    nock("https://api.github.com",{
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

// this function does not work for now
function setFileURL( url ) {
    sessionData.fileURL = URL;
    //console.log(fileURL)
}

// this function does not work for now
function getFileURL(userId) {
    //console.log(fileURL);
    return mock_data.fileurl;
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
    new Transfer('./site-mock.zip')
        .upload()
        .then(function (link) { 
            console.log(`File uploaded successfully at ${link}`); 
            sessionData.fileURL = link;
            setFileURL(sessionData.fileURL);
            return sessionData.fileURL;
        })
        .catch(function (err) { 
            console.log(err);
            return 'null';
         })
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
async function mergeAllInfo(userId){
    

    new Transfer('./user-mock-data.yml')
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
    deleteAllData: deleteAllData,
    setNoLinkedFlag: setNoLinkedFlag,
    getNoLinkedFlag: getNoLinkedFlag,
    setNoDBLPFlag: setNoDBLPFlag,
    getNoDBLPFlag: getNoDBLPFlag,
    setNoGithubFlag: setNoGithubFlag,
    getNoGithubFlag: getNoGithubFlag,
    getZipURL: getZipURL,
    getFileURL: getFileURL
};

