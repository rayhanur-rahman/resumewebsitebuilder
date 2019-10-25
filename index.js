var service = require('./service-mock.js');
var helper = require('./bot-helper.js');
function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({
            user: installer
        }, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}

var config = {};
require('dotenv').config();

if (process.env.MONGODB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({
            mongoUri: process.env.MONGODB_URI
        }),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN) ? './db_slack_bot_ci/' : './db_slack_bot_a/'),
    };
}

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

controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
});

controller.on('message, message.channels, message.im', function (bot, message) {
    console.log(message);
});

controller.hears('start', 'direct_message', function (bot, message) {
    helper.setUser(message.user);
    if (helper.getLevel(message.user) === 0) {
        bot.reply(message, 'Welcome! Please say \'I am ready\' when you are ready');
        helper.incrementLevel(message.user);
    } else {
        bot.createConversation(message, function (err, convo) {
            convo.addMessage({
                text: 'Please say \'start\' to start a new session.',
            }, 'yes_thread');

            convo.addMessage({
                text: 'Alright',
            }, 'no_thread');

            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'default',
            }, 'bad_response');
            convo.addMessage({
                text: 'session terminated! You can say \'start\' to create a new session',
            }, 'session_terminated');

            convo.addQuestion('A session is already going on. Do you want to start a new session [y/n]?', [{
                    pattern: 'y',
                    callback: function (response, convo) {
                        convo.gotoThread('yes_thread');
                        helper.setLevel(0, convo.context.user);
                    },

                },
                {
                    pattern: 'n',
                    callback: function (response, convo) {
                        convo.gotoThread('no_thread');

                        // if (service.getLevel(convo.context.user) === 0)
                        //     convo.gotoThread('default');
                        // if (service.getLevel(convo.context.user) === 1)
                        //     convo.gotoThread('');
                        // if (service.getLevel(convo.context.user) === 0)
                        //     convo.gotoThread('');
                    },
                },
                {
                    pattern: 'terminate',
                    callback: function (response, convo) {
                        convo.gotoThread('session_terminated');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ], {}, 'default');
            convo.activate();
        });
    }
});

controller.hears('I am ready', 'direct_message', function (bot, message) {
    if (helper.getLevel(message.user) === 1) {
        bot.createConversation(message, function (err, convo) {
            // create a path for when a user says NO
            convo.addMessage({
                text: 'Great! I think I got all the information required',
                text: "File uploaded successfully at {{& vars.link}}. Go to this link and check the yml file. Type in 'verify' to upload any revisions",
            }, 'Valid');

            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'default',
            }, 'bad_response');

            // Question No.1
            convo.addQuestion('Please tell me if you have a LinkedIn account?[yes/no]', [{
                    pattern: 'yes',
                    callback: function (response, convo) {
                        convo.gotoThread('yes_linkedin_thread');
                    },
                },
                {
                    pattern: 'no',
                    callback: function (response, convo) {
                        helper.setNoLinkedFlag(convo.context.user, true)
                        convo.gotoThread('Ask_DBLP');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ], {}, 'default');
            //Question 2
            convo.addQuestion('Great! Please provide your LinkedIn account ID.', [{
                    pattern: /.*/,
                    callback: function (response, convo) {
                        //TODO fix linkedin, github, dblp link regex
                        helper.setLinkedInId(convo.context.user, response);
                        convo.gotoThread('Ask_token_LinkedIn');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ], {}, 'yes_linkedin_thread');
            convo.addQuestion('Great! Please provide your LinkedIn account token', [{
                    pattern: /.*/,
                    callback: function (response, convo) {
                        helper.setLinkedInToken(convo.context.user, response);
                        if (service.ExtractingLinkedInInfo(helper.getLinkedInId(convo.context.user), helper.getLinkedInToken(convo.context.user))) {
                            convo.gotoThread('Ask_DBLP');
                        } else {
                            convo.gotoThread('yes_linkedin_thread');
                        }
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ], {}, 'Ask_token_LinkedIn');
            //Question No. 3
            convo.addQuestion('Awesome! Now tell me if you have a DBLP account?[yes/no]', [{
                    pattern: 'yes',
                    callback: function (response, convo) {
                        convo.gotoThread('yes_dblp_thread');
                    },
                },
                {
                    pattern: 'no',
                    callback: function (response, convo) {
                        helper.setNoDBLPFlag(convo.context.user, true);
                        convo.gotoThread('Ask_GitHub');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ], {}, 'Ask_DBLP');
            //Question No. 4 
            convo.addQuestion('Amazing! Please provide me with the DBLP link.', [{
                    pattern: /.*/,
                    callback: function (response, convo) {
                        if (service.ExtractingDBLPInfo(convo.context.user, response)) {
                            convo.gotoThread('Ask_GitHub');
                        } else {
                            convo.gotoThread('yes_dblp_thread');
                        }
                    },
                },
                {
                    pattern: 'no',
                    callback: function (response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ], {}, 'yes_dblp_thread');
            //Question 5
            convo.addQuestion('Awesome! Now tell me if you have a Github account?[yes/no]', [{
                    pattern: 'yes',
                    callback: function (response, convo) {
                        convo.gotoThread('yes_github_thread');
                    },
                },
                {
                    pattern: 'no',
                    callback: async function (response, convo) {
                        helper.setNoGithubFlag(convo.context.user, true)
                        var link = await service.mergeAllInfo(convo.context.user);
                        convo.setVar('link', link);
                        convo.gotoThread('no_github_thread');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ], {}, 'Ask_GitHub');
            //Question 6
            convo.addQuestion('Amazing! Please provide me with Github link.', [{
                    pattern: /.*/,
                    callback: async function (response, convo) {
                        var ValidGithubAccount = service.ExtractingGithubInfo(convo.context.user, response);

                        if (ValidGithubAccount === true) {
                            if (helper.getNoLinkedFlag(convo.context.user) || helper.getNoDBLPFlag(convo.context.user) || helper.getNoGithubFlag(convo.context.user)) {
                                var link = await service.mergeAllInfo(convo.context.user);
                                convo.setVar('link', link);
                                convo.gotoThread('no_github_thread');
                            } else {
                                helper.incrementLevel(convo.context.user);
                                var link = await service.mergeAllInfo(convo.context.user);
                                convo.setVar('link', link);
                                convo.gotoThread('Valid');
                            }
                        } else {
                            convo.gotoThread('default');
                        }
                    },
                },
                {
                    pattern: 'no',
                    callback: function (response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ], {}, 'yes_github_thread');
            //Message 7
            convo.addQuestion('Please fill up this template and upload', [{
                    pattern: /.*.yml/,
                    callback: function (response, convo) {

                        convo.gotoThread('Ask_DBLP');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_at_no_linkedin_thread');
                    },
                }
            ], {}, 'no_linkedin_thread');
            convo.addQuestion('Please fill up this template and upload', [{
                    pattern: /.*.yml/,
                    callback: function (response, convo) {

                        convo.gotoThread('Ask_GitHub');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_at_no_DBLP_thread');
                    },
                }
            ], {}, 'no_DBLP_thread');
            convo.addQuestion('I see that you have several information missing that I require. Please fill up this template at {{& vars.link}} and upload', [{
                    pattern: /.*.yml/,
                    callback: function (response, convo) {
                        helper.incrementLevel(convo.context.user);
                        convo.gotoThread('Valid');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_at_no_github_thread');
                    },
                }
            ], {}, 'no_github_thread');
            convo.addMessage({
                text: 'Sorry, maybe you did not upload a yml file',
                action: 'no_linkedin_thread',
            }, 'bad_at_no_linkedin_thread');
            convo.addMessage({
                text: 'Sorry, maybe you did not upload a yml file',
                action: 'no_DBLP_thread',
            }, 'bad_at_no_DBLP_thread');
            convo.addMessage({
                text: 'Sorry, maybe you did not upload a yml file',
                action: 'no_github_thread',
            }, 'bad_at_no_github_thread');
            convo.activate();
        });
    }
});

controller.hears('verify', 'direct_message', function (bot, message) {
    if (helper.getLevel(message.user) === 2) {
        //bot.reply(message,'Please give me the link');
        bot.createConversation(message, function (err, convo) {
            convo.addQuestion('Please give me a link of the yml file', [{
                    pattern: /.*.yml/,
                    callback: function (response, convo) {

                        //verifyYMLContent() verifies the yml content. return false if the yml data have errors
                        if (service.verifyYMLContent(response)) {
                            //bot.reply('Data verified. Do you your CV in Github or zipped format?');
                            convo.gotoThread('Template_Choice');
                        } else {
                            convo.gotoThread('invalid_YML_content');
                        }

                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_at_default');
                    },
                }
            ], {}, 'default');

            convo.addQuestion('Data verified. Do you want your CV in industrial or academic format?[i/a]', function (response, convo) {
                if (response.text === 'i') {
                    convo.gotoThread('valid2');
                } else if (response.text === 'a') {
                    convo.gotoThread('valid2');
                    //convo.gotoThread('session_terminated');
                } else {
                    convo.gotoThread('Template_Choice');
                }
            }, {}, 'Template_Choice');

            convo.addQuestion('Do you want your CV in Github.io or in zipped format?[github/zip].', async function (response, convo) {
                if (response.text === 'github') {
                    convo.gotoThread('github_thread_token');
                } else if (response.text === 'zip') {
                    var link = await service.uploadZippedCV(convo.context.user);
                    //TODO where is the dummy link for zipped file? dummy link is in the link variable. mention it somehow
                    console.log(link);
                    bot.reply(message, link);
                    convo.setVar('link', link);
                    convo.gotoThread('zipped_CV_uploaded');
                    //convo.gotoThread('session_terminated');
                } else {
                    convo.gotoThread('bad_at_valid2');
                }
            }, {}, 'valid2');
            convo.addQuestion('Token?', [{
                    pattern: /.*/,
                    callback: function (response, convo) {
                        helper.setGithubtoken(convo.context.user, response.match.input);
                        convo.gotoThread('github_thread_repoName');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_at_token');
                    },
                }
            ], {}, 'github_thread_token');
            convo.addQuestion('User name?', [{
                    pattern: /.*/,
                    callback: function (response, convo) {
                        // This will create the cv repository for the user
                        helper.setRepoName(convo.context.user, response.match.input);
                        if (service.createRepoForUser(convo.context.user)) {
                            convo.gotoThread('repoCreated');
                        } else {
                            convo.gotoThread('bad_at_repoCreation');
                        }
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_at_repoName');
                    },
                }
            ], {}, 'github_thread_repoName');
            convo.addMessage({
                text: 'Thanks. The zipped CV has been uploaded successfully at {{& vars.link}}',
                action: 'terminate_session2',
            }, 'zipped_CV_uploaded');
            convo.addMessage({
                text: 'Sorry the repo could not be created. Make sure you provide valid token and repo name',
                action: 'github_thread_token',
            }, 'bad_at_repoCreation');
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'github_thread_token',
            }, 'bad_at_token');
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'github_thread_repoName',
            }, 'bad_at_repoName');
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'valid2',
            }, 'bad_at_valid2');
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'valid2',
            }, 'bad_at_valid2');
            convo.addMessage({
                text: 'website has been published at <your github username>.github.io ', //here will be the github.io link
                action: 'terminate_session2',
            }, 'repoCreated');
            convo.addMessage({
                text: 'session terminated! You can say \'start\' to create a new session',
                action: "completed"
            }, 'session_terminated');
            convo.addQuestion('Please say \'terminate\' to terminate the session', function (response, convo) {
                if (response.text === 'terminate') {
                    helper.setLevel(0, convo.context.user);
                    service.deleteAllData(convo.context.user);
                    convo.gotoThread('session_terminated');
                } else {
                    convo.gotoThread('bad_at_terminate_session2');
                }
            }, {}, 'terminate_session2');
            convo.addMessage({
                text: 'Sorry I did not understand',
                action: 'terminate_session2',
            }, 'bad_at_terminate_session2');
            convo.addMessage({
                text: 'Sorry, maybe you did not upload a yml file',
                action: 'default',
            }, 'bad_at_default');
            convo.addMessage({
                text: 'Sorry, maybe the fields in the .yml file are not correctly filled up',
                action: 'default',
            }, 'invalid_YML_content');



            convo.on('end', function (convo) {
                console.log(convo.status);

                if (convo.status == 'completed') {
                    // do something useful with the users responses
                    console.log('edned well');

                } else {
                    console.log('ended bad');
                }

            });


            convo.activate();
        });

    } else { // bot replies an error message when the user is not in service.level 0
        bot.createConversation(message, function (err, convo) {
            // create a path for when a user says YES
            convo.addMessage({
                text: 'Please say \'start\' to start a new session.',
            }, 'yes_thread');

            // create a path for when a user says NO
            convo.addMessage({
                text: 'Alright',
            }, 'no_thread');

            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Sorry I did not understand.',
                action: 'default',
            }, 'bad_response');

            // Create a yes/no question in the default thread...
            convo.addQuestion('A session is already going on. Do you want to start a new session [y/n]?', [{
                    pattern: 'y',
                    callback: function (response, convo) {
                        convo.gotoThread('yes_thread');
                        helper.setLevel(0, convo.context.user);
                    },

                },
                {
                    pattern: 'n',
                    callback: function (response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ], {}, 'default');

            convo.activate();
        });
    }
});

controller.on('direct_message,mention,direct_mention', async function (bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, async function (err) {
        if (err) {
            console.log(err)
        }
        bot.reply(message, 'Sorry I did not understand. You can start a new session by saying \'start\'');
    });
});


//https://resumeslackbot.herokuapp.com/oauth