const mock_data = require('./mock_data.json'); //need to remove this mocking from here

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


function getZipURL() {
    // return mock_data.zipurl;
    return sessionData.fileURL;
}

function setFileURL(url) {
    sessionData.fileURL = URL;
    //console.log(fileURL)
}

// this function does not work for now
function getFileURL(userId) {
    //console.log(fileURL);
    return mock_data.fileurl;
}


function setNoLinkedFlag(userId, value) {
    sessionData.noLinkedInFlag = value;
}

function getNoLinkedFlag(userId) {
    return sessionData.noLinkedInFlag;
}

function setNoDBLPFlag(userId, value) {
    sessionData.noDblpFlag = value;
}

function getNoDBLPFlag(userId) {
    return sessionData.noDblpFlag;
}

function setNoGithubFlag(userId, value) {
    sessionData.noDblpFlag = value;
}

function getNoGithubFlag(userId) {
    return sessionData.noDblpFlag;
}

function setLevel(level, userId) {
    sessionData.level = level;
}

function getLevel(userId) {
    return sessionData.level;
}

function incrementLevel(userId) {
    sessionData.level++;
}

function setUser(userId) {
    sessionData.user = userId;
}

// When asked for a token, the text of the user's reply is taken and passed
// to this function to set the global var userGithubToken
function setGithubtoken(userId, token) {
    sessionData.userGithubToken = token;
}

// When asked for a repo name, the text of the user's reply is taken and passed
// to this function to set the global var userGithubRepoName
function setRepoName(userId, repoName) {
    sessionData.userGithubRepoName = repoName;
}

function setLinkedInToken(userId, token) {
    sessionData.userLinkedInToken = token;
}

function getLinkedInToken(userId) {
    return sessionData.userLinkedInToken;
}

function setLinkedInId(userId, link) {
    sessionData.userLinkedInId = parseLinkedInIdFromUrl(link);
}

function parseLinkedInIdFromUrl(link) {
    console.log(mock_data.linkedId);
    return mock_data.linkedId;
}

function getLinkedInId(userId) {
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


module.exports = {
    setFileURL: setFileURL,
    getFileURL: getFileURL,
    setGithubtoken: setGithubtoken,
    setRepoName: setRepoName,
    getGithubToken: getGithubToken,
    getGithubRepoName: getGithubRepoName,
    getLinkedInToken: getLinkedInToken,
    getLinkedInId: getLinkedInId,
    setLinkedInToken: setLinkedInToken,
    setLinkedInId: setLinkedInId,
    setLevel: setLevel,
    getLevel: getLevel,
    incrementLevel: incrementLevel,
    sessionData: sessionData,
    setUser: setUser,
    setNoLinkedFlag: setNoLinkedFlag,
    getNoLinkedFlag: getNoLinkedFlag,
    setNoDBLPFlag: setNoDBLPFlag,
    getNoDBLPFlag: getNoDBLPFlag,
    setNoGithubFlag: setNoGithubFlag,
    getNoGithubFlag: getNoGithubFlag,
    getZipURL: getZipURL
};