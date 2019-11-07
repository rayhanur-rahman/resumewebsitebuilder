var Transfer = require('transfer-sh');
var fs = require('fs');
var request = require('request');
var MongoHelper = require('./mongo-helper.js').MongoHelper;
const axios = require("axios");
var xml2js = require('xml2js');
const http_request = require('got');
const scrapedin = require('scrapedin')
const util = require('util');
const utils = require('./util.js');
const svc = require('./service-mock.js');
var crypto = require('crypto');
var walk = require('walk');
const admZip = require('adm-zip');





const gitHubUrl = "https://api.github.com";
const linkedinUrl = "https://api.linkedin.com/v2";
const dblpUrl = "https://dblp.org"

require('dotenv').config();


// Retrieve
var MongoClient = require('mongodb').MongoClient;


// Connect to the db
function connectToMongo() {
    return MongoClient.connect(process.env.MONGODB_URI, {
        useUnifiedTopology: true
    }).then(client => {
        console.log('mongo connection establised');
        return client;

    }).catch(err => {
        console.log(err);
    });
}

function selectDb(client) {
    var dbo = client.db(process.env.DBNAME);
    console.log('db selected');
    return dbo;
}

function createCollection(dbo) {
    return dbo.createCollection('dogs').then(result => {
        console.log('collection created!');
    }).catch(err => {
        console.log('error');
    });
}

function insert(dbo) {
    var collection = dbo.collection('dogs');
    return collection.insertOne({
        name: 'Darth',
        id: 3
    }).then(res => console.log('inserted')).catch(err => console.log(err));
}

function find(dbo) {
    var collection = dbo.collection('dogs');
    return collection.findOne({
        name: 'kkk'
    }).then(res => {
        return res;
    }).catch(err => console.log(err));
}

async function dosth() {
    var client = await connectToMongo();
    var dbo = await selectDb(client);
    await createCollection(dbo);
    await insert(dbo);
    console.log(await find(dbo));
    console.log('xxx');
}

// dosth();
// console.log('fff');


// get GitHub data from username


async function createRepo(repo, token) {
    var endpoint = "/user/repos";
    //console.log(urlRoot+endpoint)
    return new Promise(function (resolve, reject) {
        request({
                url: gitHubUrl + endpoint,
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
    var shaValue = await getSha1(absolutePath);

    return new Promise(function (resolve, reject) {
        request({
                url: gitHubUrl + endpoint,
                method: "PUT",
                headers: {
                    "User-Agent": "CSC510-REST-WORKSHOP",
                    "content-type": "application/json",
                    "Authorization": `token ${token}`
                },
                json: {
                    "message": `added ${relativePath}`,
                    "content": contents,
                    'sha': shaValue
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
        console.log('pushing ' + item)
        var content = await PushFileToGithub(userName, GithubRepoName, token, item.absolute, item.relative);
        console.log('pushed');

    }

}


async function getSha1(path) {
    return new Promise((r, e) => {
        var algo = 'sha1';
        var shasum = crypto.createHash(algo);
        var s = fs.ReadStream(path);
        s.on('data', function (d) {
            shasum.update(d);
        });

        s.on('end', function () {
            var d = shasum.digest('hex');
            r(d);
        });
    });
}

const validateSchema = require('yaml-schema-validator')

function verifyYMLContent(path) {
    var errors = validateSchema(path, {
        schemaPath: './schema.yaml' // can also be schema.json
    });
    console.log(errors)
    // return (errors.length == 0) ? true : false;
}

verifyYMLContent('/home/rr/Workspace/csc510-20/resources/site-in/site/_data/data.yml');