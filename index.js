/**
 * A Bot for Slack!
 */

/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */
//after bot processes all the data, this is where the yml file is stored
var fileURL;
// after bot asks for token, this is where token is stored
var userGithubToken;
// after bot asks for repo name, this is where repo name is stored
var userGithubRepoName;

var service = require('./service.js');

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({ user: installer }, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};

require('dotenv').config();

const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY
});

if (process.env.MONGODB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({ mongoUri: process.env.MONGODB_URI }),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN) ? './db_slack_bot_ci/' : './db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "I'm here!")
});

controller.on('file_shared', function (bot, message) {
    console.log('file shared');
    console.log(message);
    // make a rest api call to https://slack.com/api/files.info?file=FPJBZ9JK1&token=xoxb-762511540336-791388161521-MCcMRT5iwVgxP25nBk0tg0dS
    //file=fileid
    //token=bottoken

});

controller.on('message, message.channels, message.im', function (bot, message) {
    console.log(message);
});

controller.hears('hello', 'direct_message', function (bot, message) {
    bot.reply(message, 'Hello!');
    //https://www.mydatahack.com/uploading-and-downloading-files-in-s3-with-node-js/

    fs.writeFile('newfile.txt', 'Learn Node FS module', function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });

    fs.readFile('newfile.txt', (err, data) => {
        if (err) throw err;
        const params = {
            Bucket: process.env.BUCKET_NAME, // pass your bucket name
            Key:  `${process.env.CUBE_NAME}/public/newFile.txt`, // file will be saved as testBucket/contacts.csv
            Body: JSON.stringify(data, null, 2)
        };
        s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`)
        });
     });
});


//Start Convo
controller.hears('start', 'direct_message', function (bot, message){
    if (service.level === 0) {
        bot.reply(message,'Welcome! Please say \'I am ready\' when you are ready');
        service.level++;
    } else {// bot replies an error message when the user is not in service.level 0
        bot.createConversation(message, function(err, convo) {
            // create a path for when a user says YES
            convo.addMessage({
                    text: 'Please say \'start\' to start a new session.',
            },'yes_thread');
        
            // create a path for when a user says NO
            convo.addMessage({
                text: 'Alright',
            },'no_thread');
        
            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'default',
            },'bad_response');
            convo.addMessage({
                text: 'session terminated! You can say \'start\' to create a new session',
            },'session_terminated');
        
            // Create a yes/no question in the default thread...
            convo.addQuestion('A session is already going on. Do you want to start a new session [y/n]?', [
                {
                    pattern: 'y',
                    callback: function(response, convo) {
                        convo.gotoThread('yes_thread');
                        service.level = 0;
                    },
                    
                },
                {
                    pattern: 'n',
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    pattern: 'terminate',
                    callback: function(response, convo) {
                        convo.gotoThread('session_terminated');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'default');
            convo.activate();
        });
    }
});
//Service level 1
controller.hears('I am ready','direct_message', function(bot, message){
    if(service.level===1){
        bot.createConversation(message, function(err, convo) {
            // create a path for when a user says NO
            convo.addMessage({
                text: 'Great! I think I got all the information required',
                text: `File uploaded successfully at `+ service.getFileURL(),
            },'Valid');
        
            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'default',
            },'bad_response');
        
            // Question No.1
            convo.addQuestion('Please tell me if you have a LinkedIn account?[yes/no]', [
                {
                    pattern: 'yes',
                    callback: function(response, convo) {
                        convo.gotoThread('yes_linkedin_thread');
                    },
                },
                {
                    pattern: 'no',
                    callback: function(response, convo) {
                        service.noLinkedInFlag=true;
                        convo.gotoThread('Ask_DBLP');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'default');
            //Question 2
            convo.addQuestion('Great! Please provide your LinkedIn account ID.', [
                {
                    pattern: /.*.com/,
                    callback: function(response, convo) {
                        service.setLinkedInId(response);
                        convo.gotoThread('Ask_token_LinkedIn');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'yes_linkedin_thread');
            convo.addQuestion('Great! Please provide your LinkedIn account token', [
                {
                    pattern: /.*/,
                    callback: function(response, convo) {
                        service.setLinkedInToken(response);
                        if(service.ExtractingLinkedInInfo(service.getLinkedInId(), service.getLinkedInToken())){
                            convo.gotoThread('Ask_DBLP');
                        } else{
                            convo.gotoThread('yes_linkedin_thread');
                        }
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'Ask_token_LinkedIn');
            //Question No. 3
            convo.addQuestion('Awesome! Now tell me if you have a DBLP account?[yes/no]', [
                {
                    pattern: 'yes',
                    callback: function(response, convo) {
                        convo.gotoThread('yes_dblp_thread');
                    },
                },
                {
                    pattern: 'no',
                    callback: function(response, convo) {
                        //console.log("Gello!");
                        service.noDblpFlag = true;
                        convo.gotoThread('Ask_GitHub');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'Ask_DBLP');
            //Question No. 4 
            convo.addQuestion('Amazing! Please provide me with the DBLP link.', [
                {
                    pattern: /.*/,
                    callback: function(response, convo) {
                        var ValidDBLPAccount = service.ExtractingDBLPInfo(response);
                        if(ValidDBLPAccount === true){
                            convo.gotoThread('Ask_GitHub');
                        } else{
                            convo.gotoThread('yes_dblp_thread');
                        }
                    },
                },
                {
                    pattern: 'no',
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'yes_dblp_thread');
            //Question 5
            convo.addQuestion('Awesome! Now tell me if you have a Github account?[yes/no]', [
                {
                    pattern: 'yes',
                    callback: function(response, convo) {
                        if(service.noLinkedInFlag || service.noDblpFlag || service.noGithubFlag){
                            convo.gotoThread('no_github_thread');
                        } else{    
                            convo.gotoThread('yes_github_thread');
                        }
                    },
                },
                {
                    pattern: 'no',
                    callback: function(response, convo) {
                        convo.gotoThread('no_github_thread');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'Ask_GitHub');
            //Question 6
            convo.addQuestion('Amazing! Please provide me with Github link.', [
                {
                    pattern: /.*.com/,
                    callback: function(response, convo) {
                        var ValidGithubAccount = service.ExtractingGithubInfo(response);
                        if(ValidGithubAccount === true){
                            service.level++;
                            service.mergeAllInfo();
                            convo.gotoThread('Valid');
                            
                        } else{
                            convo.gotoThread('default');
                        }
                    },
                },
                {
                    pattern: 'no',
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'yes_github_thread');
            //Message 7
            convo.addQuestion('Please fill up this template and upload', [
                {
                    pattern: /.*.yml/,
                    callback: function(response, convo) {
                        
                        convo.gotoThread('Ask_DBLP');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_at_no_linkedin_thread');
                    },
                }
            ],{},'no_linkedin_thread');
            convo.addQuestion('Please fill up this template and upload', [
                {
                    pattern: /.*.yml/,
                    callback: function(response, convo) {
                        
                        convo.gotoThread('Ask_GitHub');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_at_no_DBLP_thread');
                    },
                }
            ],{},'no_DBLP_thread');
            convo.addQuestion('I see that you have several information missing that I require. Please fill up this template and upload', [
                {
                    pattern: /.*.yml/,
                    callback: function(response, convo) {
                        service.level++;
                        console.log(service.level);
                        convo.gotoThread('Valid');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_at_no_github_thread');
                    },
                }
            ],{},'no_github_thread');
            convo.addMessage({
                text: 'Sorry, maybe you did not upload a yml file',
                action: 'no_linkedin_thread',
            },'bad_at_no_linkedin_thread');
            convo.addMessage({
                text: 'Sorry, maybe you did not upload a yml file',
                action: 'no_DBLP_thread',
            },'bad_at_no_DBLP_thread');
            convo.addMessage({
                text: 'Sorry, maybe you did not upload a yml file',
                action: 'no_github_thread',
            },'bad_at_no_github_thread');
            convo.activate();
        });
    }
});

controller.hears('verify', 'direct_message', function (bot, message){
    if (service.level === 2) {
        //bot.reply(message,'Please give me the link');
        bot.createConversation(message, function(err, convo) {
            convo.addQuestion('Please give me a link of the yml file', [
                {
                    pattern: /.*.yml/,
                    callback: function(response, convo) {
                        
                        //verifyYMLContent() verifies the yml content. return false if the yml data have errors
                        if (service.verifyYMLContent()) {
                            //bot.reply('Data verified. Do you your CV in Github or zipped format?');
                            convo.gotoThread('valid2');
                        }else {
                            convo.gotoThread('invalid_YML_content');
                        }
                        
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_at_default');
                    },
                }
            ],{},'default');

            convo.addQuestion('Data verified. Do you want your CV in Github.io or in zipped format?[github/zip]',function(response,convo) {
                if (response.text === 'github'){
                    convo.gotoThread('github_thread_token');
                } else if (response.text === 'zip') {
                    service.uploadZippedCV();
                    convo.gotoThread('zipped_CV_uploaded');
                        //convo.gotoThread('session_terminated');
                } else {
                    convo.gotoThread('bad_at_valid2');
                }
              },{},'valid2');
            convo.addQuestion('Token?', [
                {
                    pattern: /.*/,
                    callback: function(response, convo) {
                        service.setGithubtoken(response.match.input);
                        convo.gotoThread('github_thread_repoName');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_at_token');
                    },
                }
            ],{},'github_thread_token');
            convo.addQuestion('Repo name?', [
                {
                    pattern: /.*/,
                    callback: function(response, convo) {
                        // This will create the cv repository for the user
                        service.setRepoName(response.match.input);
                        if (service.createRepoForUser()) {
                            convo.gotoThread('repoCreated');
                        }else {
                            convo.gotoThread('bad_at_repoCreation');
                        }
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_at_repoName');
                    },
                }
            ],{},'github_thread_repoName');
            convo.addMessage({
                text: 'Thanks. The zipped CV has been uploaded successfully',
                action: 'terminate_session2',
            },'zipped_CV_uploaded');
            convo.addMessage({
                text: 'Sorry the repo could not be created. Make sure you provide valid token and repo name',
                action: 'github_thread_token',
            },'bad_at_repoCreation');
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'github_thread_token',
            },'bad_at_token');
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'github_thread_repoName',
            },'bad_at_repoName');
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'valid2',
            },'bad_at_valid2');
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'valid2',
            },'bad_at_valid2');
            convo.addMessage({
                text: 'Repo Created at ',//here will be the github.io link
                action: 'terminate_session2',
            },'repoCreated');
            convo.addMessage({
                text: 'session terminated! You can say \'start\' to create a new session',
            },'session_terminated');
            convo.addQuestion('Please say \'terminate\' to terminate the session',function(response,convo) {
                if (response.text === 'terminate'){
                    service.level = 0;
                    service.deleteAllData();
                    convo.gotoThread('session_terminated');
                } else {
                    convo.gotoThread('bad_at_terminate_session2');
                }
                
          
              },{},'terminate_session2');
            convo.addMessage({
                text: 'Sorry I did not understand',
                action: 'terminate_session2',
            },'bad_at_terminate_session2');
            convo.addMessage({
                text: 'Sorry, maybe you did not upload a yml file',
                action: 'default',
            },'bad_at_default');
            convo.addMessage({
                text: 'Sorry, maybe the fields in the .yml file are not correctly filled up',
                action: 'default',
            },'invalid_YML_content');
            convo.activate();
        });

    } else {// bot replies an error message when the user is not in service.level 0
        bot.createConversation(message, function(err, convo) {
            // create a path for when a user says YES
            convo.addMessage({
                    text: 'Please say \'start\' to start a new session.',
            },'yes_thread');
        
            // create a path for when a user says NO
            convo.addMessage({
                text: 'Alright',
            },'no_thread');
        
            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'default',
            },'bad_response');
        
            // Create a yes/no question in the default thread...
            convo.addQuestion('A session is already going on. Do you want to start a new session [y/n]?', [
                {
                    pattern: 'y',
                    callback: function(response, convo) {
                        convo.gotoThread('yes_thread');
                        service.level = 0;
                    },
                    
                },
                {
                    pattern: 'n',
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'default');
        
            convo.activate();
        });
    }
});
//
/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
controller.on('direct_message,mention,direct_mention', function (bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function (err) {
        if (err) {
            console.log(err)
        }
        bot.reply(message, 'Sorry I did not understand. You can start a new session by saying \'start\'');
        console.log(message);
    });
});

controller.hears('start1', 'direct_message', function (bot, message) {
    bot.createConversation(message, function(err, convo) {

        // create a path for when a user says YES
        convo.addMessage({
                text: 'You said yes! How wonderful.',
        },'yes_thread');
    
        // create a path for when a user says NO
        convo.addMessage({
            text: 'You said no, that is too bad.',
        },'no_thread');
    
        // create a path where neither option was matched
        // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
        convo.addMessage({
            text: 'Sorry I did not understand.',
            action: 'default',
        },'bad_response');
    
        // Create a yes/no question in the default thread...
        convo.addQuestion('Do you like cheese?', [
            {
                pattern: 'yes',
                callback: function(response, convo) {
                    convo.gotoThread('yes_thread');
                },
            },
            {
                pattern: 'no',
                callback: function(response, convo) {
                    convo.gotoThread('no_thread');
                },
            },
            {
                default: true,
                callback: function(response, convo) {
                    convo.gotoThread('bad_response');
                },
            }
        ],{},'default');
    
        convo.activate();
    });
});

//https://resumeslackbot.herokuapp.com/oauth