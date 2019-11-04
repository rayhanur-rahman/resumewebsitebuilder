const mock_data = require('./mock_data.json'); //need to remove this mocking from here
var MongoHelper = require('./mongo-helper.js').MongoHelper;
// There are three levels. 0-2
// 0: starts with 'start'
// 1: starts with 'I am ready'
// 2: starts with 'verify'

var sessionData = {
    level: 0,
    user: '',
    fileURL: '',
    zippedSiteUrl: '',
    userGithubToken: '',
    userGithubRepoName: '',
    userLinkedInId: '',
    userLinkedInToken: '',
    noLinkedInFlag: false,
    noDblpFlag: false,
    noGithubFlag: false,
    linkedInData: null,
    dblpData: null,
    githubData: null,
    generatedYMLFileLink: '',
    uploadedYMLFileLink: '',
    generatedSiteLink: ''
}

var profileData = {
    intro: {
        name: '...',
        title: '...',
        avatar: {
            display: true,
            path: '...'
        }
    },
    contact: {
        email: "...",
        phone: 123,
        wechat: null,
        telegram: null,
        website: null,
        linkedin: "test",
        github: "test",
        gitlab: null,
        bitbucket: null,
        twitter: null,
        stackoverflow: null,
        codewars: null,
        goodreads: null,
        googlescholar: "...",
        researchgate: "...",
        resume: "..."
    },
    languages: {
        display: false,
        title: "Languages",
        items: [
            {
                idiom: "English",
                level: "Professional"
            }
        ]
    },
    interests: {
        display: true,
        title: "Interests",
        items: [
        {
            "item": "Coding"
        },
        {
            "item": "Reading"
        }
        ]
    },
    profile: {
        "display": false,
        "title": "Profile",
        "details": "It's your career profile, you can wirte markdown format text.\n+ First\n+ Second\n"
    },
    education: {
        display: true,
        title: "Education",
        items: [
            {
                university: "[University of ...",
                time: "2xxx-2xxx",
                major: "...",
                degree: "...",
                details: "..."
              }, 
              {
                university: "[University of ...",
                time: "2xxx-2xxx",
                major: "...",
                degree: "...",
                details: "..."
              }
        ]
    },
    experiences: {
        display: true,
        title: "Experiences",
        items: [
            {
                role: "designation",
                time: "2xxx-2xxx",
                company: "...",
                location: "...",
                details: '...'
              },
              {
                role: "designation",
                time: "2xxx-2xxx",
                company: "...",
                location: "...",
                details: '...'
              }
        ]
    },
    projects: {
        display: true,
        title: 'Projects',
        intro: 'these are my projects...',
        items: [
            {
                name: 'p1',
                link: '...',
                details: '...'
            },
            {
                name: 'p2',
                link: '...',
                details: '...'
            }
        ]
    },
    publications: {
        display: true,
        title: 'Publications',
        intro: 'these are my papers...',
        items: [
            {
                title: 'paper title',
                authors: 'mr x, mr y',
                conference: 'conf name',
                link: '...'
            }, 
            {
                title: 'paper title',
                authors: 'mr x, mr y',
                conference: 'conf name',
                link: '...'
            }

        ]
    },
    skills: {
        display: true,
        title: 'Skills',
        details: 'here is my skills a b c...'
    },
    evaluation: {
        display: false,
        title: "Self-evaluation",
        details: "Here is my self evaluation..."
    },
    footer: {
        display: true
    },
    close: 'please contact me at '
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

async function setLevel(level, userId) {
    var dbo = await MongoHelper.openConnection();
    var response = await MongoHelper.findObject(dbo, {user: userId});
    if (response != null) {
        await MongoHelper.updateObject(dbo, {user: userId}, {$set: {level: level}});
    }
    MongoHelper.closeConnection();
}

async function getLevel(userId) {
    var dbo = await MongoHelper.openConnection();
    var response = await MongoHelper.findObject(dbo, {user: userId});
    await MongoHelper.closeConnection();
    if (response == null) return 0;
    else {
        return response.level;
    }
}

async function incrementLevel(userId) {
    var dbo = await MongoHelper.openConnection();
    var response = await MongoHelper.findObject(dbo, {user: userId});
    if (response != null) {
        await MongoHelper.updateObject(dbo, {user: userId}, {$set: {level: response.level+1}});
    }
    MongoHelper.closeConnection();
}

async function setUser(userId) {
    var dbo = await MongoHelper.openConnection();
    await MongoHelper.insertObjectToCollection(dbo, {user: userId}, {
        level: 0,
        user: userId,
        fileURL: '',
        zippedSiteUrl: '',
        githubToken: '',
        githubUserName: '',
        linkedInURL: '',
        dblpUrl: '',
        noLinkedInFlag: false,
        noDblpFlag: false,
        noGithubFlag: false,
        linkedInData: null,
        dblpData: null,
        githubData: null,
        generatedYMLFileLink: '',
        uploadedYMLFileLink: '',
        generatedSiteLink: '',
        profileData: profileData
    });
    MongoHelper.closeConnection();
}

async function deleteUser(userId){
    var dbo = await MongoHelper.openConnection();
    await MongoHelper.deleteObject(dbo, {user: userId});
    MongoHelper.closeConnection();
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

async function setLinkedInUrl(userId, url) {
    var dbo = await MongoHelper.openConnection();
    var response = await MongoHelper.findObject(dbo, {user: userId});
    if (response != null) {
        await MongoHelper.updateObject(dbo, {user: userId}, {$set: {linkedInURL: url}});
    }
    MongoHelper.closeConnection();
}

async function setDBLPUrl(userId, url) {
    var dbo = await MongoHelper.openConnection();
    var response = await MongoHelper.findObject(dbo, {user: userId});
    if (response != null) {
        await MongoHelper.updateObject(dbo, {user: userId}, {$set: {dblpUrl: url}});
    }
    MongoHelper.closeConnection();
}

async function setGithubUserName(userId, githubUserName) {
    var dbo = await MongoHelper.openConnection();
    var response = await MongoHelper.findObject(dbo, {user: userId});
    if (response != null) {
        await MongoHelper.updateObject(dbo, {user: userId}, {$set: {githubUserName: githubUserName}});
    }
    MongoHelper.closeConnection();
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
    getZipURL: getZipURL,
    deleteUser: deleteUser,
    setLinkedInUrl: setLinkedInUrl,
    setDBLPUrl: setDBLPUrl,
    setGithubUserName: setGithubUserName
};