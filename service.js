const fs = require('fs');
const utils = require('./util.js')
const YAML = require('json2yaml');
const admZip = require('adm-zip');
const http_request = require('got');
var MongoHelper = require('./mongo-helper.js').MongoHelper;
const validateSchema = require('yaml-schema-validator')

require('dotenv').config();


//Extracting LinkedIn Info; return false if failed

async function ExtractingLinkedInInfo(userId, url) {
    console.log(url);
    var tokens = url.split('/');
    var linkedinUserName = tokens[tokens.length - 2];

    var profile_data = await utils.getLinkedInData(url);
    console.log(profile_data);

    var linkedInData = {
        name: profile_data.profileAlternative.name,
        title: profile_data.profileAlternative.headline,
        imageUrl: profile_data.profileAlternative.imageurl,
        summary: profile_data.profileAlternative.summary,
        education: [],
        experience: [],
        skills: '',
        username: linkedinUserName
    }

    profile_data.skills.forEach(element => {
        linkedInData.skills = linkedInData.skills + ' | ' + element.title;
    });

    profile_data.positions.forEach(item => {
        linkedInData.experience.push({
            role: item.title,
            time: item.date1,
            company: item.companyName,
            location: item.location,
            details: item.description
        });
    });

    profile_data.educations.forEach(item => {
        linkedInData.education.push({
            university: item.title,
            time: item.date1 + ' - ' + item.date2,
            major: item.fieldofstudy,
            degree: item.degree,
            details: item.description
        });
    });

    if (profile_data != null) {
        var dbo = await MongoHelper.openConnection();
        var response = await MongoHelper.findObject(dbo, {
            user: userId
        });
        if (response != null) {
            await MongoHelper.updateObject(dbo, {
                user: userId
            }, {
                $set: {
                    linkedInData: linkedInData
                }
            });
        }
        MongoHelper.closeConnection();
        return true;
    } else
        return false;
}

//Extracting DBLP Info; return false if failed

async function ExtractingDBLPInfo(userId, response) {
    var result = await utils.getUserIdFromDBLPLink(response);
    if (result != null) {
        result = await utils.getDblpData(result);

        var dblpData = [];

        result.forEach(item => {
            if (item.article != null) {
                dblpData.push({
                    title: item.article[0].title[0],
                    authors: item.article[0].author.join(', '),
                    conference: item.article[0].journal[0],
                    link: 'https://dblp.org/' + item.article[0].url[0]
                });
            }

            if (item.inproceedings != null) {
                dblpData.push({
                    title: item.inproceedings[0].title[0],
                    authors: item.inproceedings[0].author.join(', '),
                    conference: item.inproceedings[0].booktitle[0],
                    link: 'https://dblp.org/' + item.inproceedings[0].url[0]
                });
            }
        })

        if (result != null) {
            console.log(result);
            var dbo = await MongoHelper.openConnection();
            var response = await MongoHelper.findObject(dbo, {
                user: userId
            });
            if (response != null) {
                await MongoHelper.updateObject(dbo, {
                    user: userId
                }, {
                    $set: {
                        dblpData: dblpData
                    }
                });
            }
            MongoHelper.closeConnection();
            return true;
        } else
            return false;
    } else
        return false;

}

//Extracting Github Info; return false if failed
async function ExtractingGithubInfo(userId, githubUserName) {
    const url = 'https://api.github.com' + "/users/" + githubUserName + "/repos";
    const options = {
        method: 'GET',
        headers: {
            "content-type": "application/json"
        },
        json: true
    };
    let profile_details;

    try {
        profile_details = (await http_request(url, options)).body;
        console.log(profile_details);

        var projectDetails = [];
        for (var i = 0; i < profile_details.length; i++) {
            var data = {
                name: profile_details[i].name,
                link: profile_details[i].html_url,
                details: profile_details[i].description
            }
            projectDetails.push(data);
        }

        var dbo = await MongoHelper.openConnection();
        var response = await MongoHelper.findObject(dbo, {
            user: userId
        });
        if (response != null) {
            await MongoHelper.updateObject(dbo, {
                user: userId
            }, {
                $set: {
                    githubData: {projects: projectDetails, author: githubUserName}
                }
            });
        }
        MongoHelper.closeConnection();
        return true;
    } catch (error) {
        return false;
    }
}


function prepareRepoForResume(username, token, path, zip){
    var randomTmpFolderName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (!fs.existsSync(`./tmp/${randomTmpFolderName}`)) {
        fs.mkdirSync(`./tmp/${randomTmpFolderName}`);
    }
    zip.extractAllTo(`./tmp/${randomTmpFolderName}`, true);

    fs.copyFile(path, `./tmp/${randomTmpFolderName}/site/_data/data.yml`, (err) => {
        if (err) throw err;
    });
    await utils.pushDataToGitHub(username, `${username}.github.io`, token, `./tmp/${randomTmpFolderName}/site`)
    console.log('complete')
    return true;
}


// If invalid (userGithubToken | userGithubRepoName) return false
async function createRepoForUser(userId, username, token, path, choice) {

    if (choice == 'a') {
        const zip = new admZip('./resources/site-ac.zip');
    }
    else if (choice == 'i') {
        const zip = new admZip('./resources/site-in.zip');
    }
    else{
        return false;
    }
    return prepareRepoForResume(username, token, path, zip);
}


function prepareZippedFile(userId, path, zip){
    var randomTmpFolderName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        if (!fs.existsSync(`./tmp/${randomTmpFolderName}`)) {
            fs.mkdirSync(`./tmp/${randomTmpFolderName}`);
        }

        zip.extractAllTo(`./tmp/${randomTmpFolderName}`, true);

        fs.copyFile(path, `./tmp/${randomTmpFolderName}/site/_data/data.yml`, (err) => {
            if (err) throw err;
        });

        if (await utils.zipFolder(`./tmp/${randomTmpFolderName}/site`, './site.zip')) {
            var link = await utils.upload('./site.zip').catch(exception => {
                return null;
            });

            var dbo = await MongoHelper.openConnection();
            var response = await MongoHelper.findObject(dbo, {
                user: userId
            });

            if (link != null && response != null) {
                await MongoHelper.updateObject(dbo, {
                    user: userId
                }, {
                    $set: {
                        zippedSiteUrl: link
                    }
                });

            }
        }

        MongoHelper.closeConnection();
}

// This function is called when the zippedCV is successfully uploaded;
// Return false if failed
async function uploadZippedCV(userId, path, choice) {
    if (choice == 'a') {
        const zip = new admZip('./resources/site-ac.zip');
    }
    else if (choice == 'i') {
        const zip = new admZip('./resources/site-in.zip');
    }
    else{
        return null;
    }

    var link = prepareZippedFile(userId, path, zip)
    fs.unlinkSync('site.zip');
    return link;
}

// This function verifies the yml content of the file uploaded by the user
// Return false if the content is inconsistent with the data obtained from the links or
// submitted earlier by the user
function verifyYMLContent(path) {
    var errors = validateSchema(path, {
        schemaPath: './schema.yaml' // can also be schema.json
    });
    return (errors.length == 0) ? true : false;
}

// This function uploads an empty template for the user to fill in when they don't have
// one or any links
function uploadEmptyTemplate() {

}

function mergeLinkedInData(response){
    response.profileData.contact.linkedin = response.linkedInData.username;
    response.profileData.intro.name = response.linkedInData.name;
    response.profileData.intro.title = (response.linkedInData.title != null) ? response.linkedInData.title : '...';
    response.profileData.intro.avatar.path = (response.linkedInData.imageUrl != null) ? response.linkedInData.imageUrl : '...';
    response.profileData.profile.details = (response.linkedInData.summary != null) ? response.linkedInData.summary : '...';
    if (response.linkedInData.education.length > 0) {
        response.profileData.education.items = [];
        response.linkedInData.education.forEach(item => {
            response.profileData.education.items.push(item);
        });
    }
    if (response.linkedInData.experience.length > 0) {
        response.profileData.experiences.items = [];
        response.linkedInData.experience.forEach(item => {
            response.profileData.experiences.items.push(item);
        });
    }
    response.profileData.skills.details = (response.linkedInData.skills != ' ') ? response.linkedInData.skills : response.profileData.skills.details;  
}

function mergeDblpData(response){
    if (response.dblpData.length > 0) {
        response.profileData.publications.items = [];
        response.dblpData.forEach(item => {
            response.profileData.publications.items.push(item);
        });
    }
}

function mergeGitHubData(response){
    if (response.githubData.projects != null) {
        if (response.githubData.projects.length > 0) {
            response.profileData.contact.github = response.githubData.author;
            response.profileData.projects.items = [];
            response.githubData.projects.forEach(item => {
                response.profileData.projects.items.push(item);
            });
            
        }
    }
}

// This function merges all the info extracted from the linkedin, dblp, and github page
// and put them in yml file
async function mergeAllInfo(userId) {

    var dbo = await MongoHelper.openConnection();
    var response = await MongoHelper.findObject(dbo, {
        user: userId
    });

    if (response != null) {
        if (response.linkedInData != null) {
            mergeLinkedInData(response);
        }
        if (response.dblpData != null) {
            mergeDblpData(response);
        }
        if (response.githubData != null) {
            mergeGitHubData(response);
        }

        await MongoHelper.updateObject(dbo, {
            user: userId
        }, {
            $set: {
                profileData: response.profileData
            }
        });
        var ymlText = YAML.stringify(response.profileData);
        fs.writeFileSync('data.yml', ymlText, (err) => {
            console.log(err)
        });
    }
    var link = await utils.upload('./data.yml').catch(exception => {
        return null;
    });
    if (link != null) await MongoHelper.updateObject(dbo, {
        user: userId
    }, {
        $set: {
            fileURL: link
        }
    });
    MongoHelper.closeConnection();
    fs.unlinkSync('data.yml');
    return link;
}

//Once the session is terminated, all the data relevant to the session will be deleted
async function deleteAllData(user) {
    var dbo = await MongoHelper.openConnection();
    var response = await MongoHelper.findObject(dbo, {
        user: user
    });

    if(response != null) {
        await MongoHelper.deleteObject(dbo, {user: user})
    }
    MongoHelper.closeConnection();
}



async function downloadYmlFile(url){
    var randomTmpFolderName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    if (!fs.existsSync(`./tmp/${randomTmpFolderName}`)) {
        fs.mkdirSync(`./tmp/${randomTmpFolderName}`);
    }

    if (await utils.download(url, `./tmp/${randomTmpFolderName}`, 'data.yml')  ) 
        return `./tmp/${randomTmpFolderName}/data.yml`
    else 
        return null

}

module.exports = {
    mergeAllInfo: mergeAllInfo,
    verifyYMLContent: verifyYMLContent,
    ExtractingLinkedInInfo: ExtractingLinkedInInfo,
    ExtractingDBLPInfo: ExtractingDBLPInfo,
    ExtractingGithubInfo: ExtractingGithubInfo,
    createRepoForUser: createRepoForUser,
    uploadZippedCV: uploadZippedCV,
    uploadEmptyTemplate: uploadEmptyTemplate,
    deleteAllData: deleteAllData,
    downloadYmlFile: downloadYmlFile
};