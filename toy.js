var fs = require('fs');
var request = require('request');
var crypto = require('crypto');
var walk = require('walk');

const gitHubUrl = "https://api.github.com";

require('dotenv').config();


// Retrieve


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
                console.log(response.body.name)
                resolve(body.name);
            });
    });
}

async function foo(){
    var x = await createRepo('tedst1', '4ea3724f70b3227f0839a2209d094e39a3b921d3')
    if (x != undefined) console.log('pass')
    else console.log('fail')
}

foo()