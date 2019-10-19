/**
 * A Bot for Slack!
 */

/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

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


//pushing level value 0 in db
var level = 0;
//Start Convo
controller.hears('start', 'direct_message', function (bot, message){
    if (level === 0) {
        bot.reply(message,'Welcome!');
        bot.reply(message,'Please say I am ready when you are ready');
        level++;
    } else {// bot replies an error message when the user is not in level 0
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
                        level = 0;
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

//Extracting LinkedIn Info
function ExtractingLinkedInInfo(response){
    return true;
}
//Extracting DBLP Info
function ExtractingDBLPInfo(response){
    return true;
}
//Extracting Github Info
function ExtractingGithubInfo(response){
    return true;
}

function MergeAllInfo(){
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
        });
     });
}

controller.hears('I am ready','direct_message', function(bot, message){
    if(level===1){
        bot.createConversation(message, function(err, convo) {
            // create a path for when a user says NO
            convo.addMessage({
                text: 'Great! I think I got all the information required',
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
            //Question 2
            convo.addQuestion('Great! Please provide your LinkedIn account ID.', [
                {
                    pattern: /.*.com/,
                    callback: function(response, convo) {
                        var ValidLinkedInAccount = ExtractingLinkedInInfo(response);
                        if(ValidLinkedInAccount === true){
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
            ],{},'yes_linkedin_thread');
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
                        convo.gotoThread('no_thread');
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
            convo.addQuestion('Amazing! Please provide me with the link.', [
                {
                    pattern: /.*.com/,
                    callback: function(response, convo) {
                        var ValidDBLPAccount = ExtractingDBLPInfo(response);
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
                        convo.gotoThread('yes_github_thread');
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
            ],{},'Ask_GitHub');
            //Question 6
            convo.addQuestion('Amazing! Please provide me with the link.', [
                {
                    pattern: /.*.com/,
                    callback: function(response, convo) {
                        var ValidGithubAccount = ExtractingGithubInfo(response);
                        if(ValidGithubAccount === true){
                            level++;
                            MergeAllInfo();
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
        bot.reply(message, 'I heard you loud and clear......');
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