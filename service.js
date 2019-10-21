const fs = require('fs');
const AWS = require('aws-sdk');
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
var level = 0;

//Extracting LinkedIn Info; return false if failed
function ExtractingLinkedInInfo(ID,token) {
    return true;
}

//Extracting DBLP Info; return false if failed
function ExtractingDBLPInfo(response) {
    return true;
}

//Extracting Github Info; return false if failed
function ExtractingGithubInfo(response) {
    return true;
}

// If invalid (userGithubToken | userGithubRepoName) return false
function createRepoForUser() {
    //console.log(getGithubRepoName());
    //console.log(getGithubToken());
    return true;
}

// this function does not work for now
function setFileURL( URL ) {
    fileURL = URL;
    //console.log(fileURL)
}

// this function does not work for now
function getFileURL() {
    //console.log(fileURL);
    return fileURL;
}

// When asked for a token, the text of the user's reply is taken and passed
// to this function to set the global var userGithubToken
function setGithubtoken( token ) {
    userGithubToken = token;
}

// When asked for a repo name, the text of the user's reply is taken and passed
// to this function to set the global var userGithubRepoName
function setRepoName( repoName ) {
    userGithubRepoName = repoName;
}

function setLinkedInToken( token ){
    userLinkedInToken = token;
}

function getLinkedInToken() {
    return userLinkedInToken;
}

function setLinkedInId ( Id ){
    userLinkedInId = Id;
}

function getLinkedInId (){
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
function uploadZippedCV() {
    return true;
}

// This function verifies the yml content of the file uploaded by the user
// Return false if the content is inconsistent with the data obtained from the links or
// submitted earlier by the user
function verifyYMLContent(){
    return true;
}

// This function uploads an empty template for the user to fill in when they don't have
// one or any links
function uploadEmptyTemplate(){

}

// This function merges all the info extracted from the linkedin, dblp, and github page
// and put them in yml file
function mergeAllInfo(){
    //Merging all the information
    fs.writeFile('MergedFile.txt', 'KichuEkta', function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });
    fs.readFile('MergedFile.txt', (err, data) => {
        if (err) throw err;
        const params = {
            Bucket: process.env.BUCKET_NAME, // pass your bucket name
            Key:  `${process.env.CUBE_NAME}/public/MergedFile.txt`, // file will be saved as testBucket/contacts.csv
            Body: JSON.stringify(data, null, 2)
        };
        s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`)
            fileURL = data.Location;
            setFileURL(data.Location);
            return data.Location;
        });
     });
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
    s3: s3
};

