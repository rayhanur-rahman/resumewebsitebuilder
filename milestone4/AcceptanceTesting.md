## Acceptance Tests
The purpose of our resumebot is to generate a homepage based on the information that we provide. 

## Use-Case #1: Initiate a session with a resumebot
#### Instructions: 
* The user has to say ``'start'`` to start a conversation with the resumebot.
* The bot will reply any one of the following:
    1. > Welcome! This bot will help you build your one page resume website. Please say 'I am ready' when you have your linkedin and dblp public url along with your github username. If you do not have any of this, bot can generate an empty website for you! 
    
    In this case, the user needs to reply 'I am ready' to start the conversation.

    2. > A session is already going on. Do you want to start a new session [y/n]?
    
    In this case, the user needs to reply 'y/n'. If 'y' is the reply, the bot will reply:
        
    > Please say 'start' to start a new session.

    and the user needs to type 'start'. Then the conversation referred to in 1 is prompted and user needs to say 'I am ready' to initiate the conversation.

## Use-Case #2: Gather Information from the user
#### Instructions
When the conversation has been successfully initiated, the bot will prompt for more information. It will start off by saying. 
* > Please tell me if you have a LinkedIn account?[yes/no]

    * If the user replies **no** the bot will move forward to the next step. If the user replies **yes**, then the bot will prompt for a valid LinkedIn profile link. 

    * > Please provide me with the DBLP link in the form of [http|https]://[your dblp profile url]

    * Then the user must provide a valid DBLP profile URL to continue the next step. 

Once we are done taking gathering info about the DBLP profile, the bot ask for the GitHub data from user.
* > Now tell me if you have a Github account?[yes/no]
    * If the user replies **no** the bot will move forward to the next step. If the user replies **yes**, then the bot will prompt for a valid GitHub profile data. 

    * > Amazing! Please provide me with Github User Name.

    * Then the user must provide a valid GitHub URL to continue to the next step. 

 Once the steps of collecting data from LinkedIn, DBLP and Github are done, the bot will upload the merged data and provide us the link. For example: 
* >Based on the information provided, I was able to generate a file. The file is uploaded at https://0x0.st/zI__.yml
. Go to this link and check the yml file. Please edit your email and phone number. Please also fill in if there are any other missing fields. You must comply with the yaml syntax editing and you cannot change the yaml schema that is already provided. Type in 'verify' to upload any revisions. 

## Use Case 3: Validate the Information from the User and provide the CV

Once we have reached the state in the previous use-case, we need to download the yaml file uploaded in the link provided by the bot. Once we download the file the user needs to fill in other missing information that the bot has missed while gathering the data. The user may also leave out information that he/she does not want to include in his/her homepage. Once the yaml file is ready, the user must type in `'verify'` and then the bot will ask for the link at which the verified yaml file has been uploaded.
* > Please give me a shareable link of the yml file in the form of [http|https]://[any file sharing website url] 
* Then the user must upload the file in any file sharing website and provide the link to the bot. The bot will then reply:
* > Data verified. Do you want your CV in industrial or academic format?[i/a]
* The user must reply `i/a`. If the reply is `i` the bot will generate a industrial CV and likewise if the reply is `a` the bot will generate an academic CV. Hence the bot will continue to ask the user for preferences. 
* > Do you want your CV in Github.io or in zipped format?[github/zip].
* If the user replies `zip`, the bot will prepare the homepage files and reply.
    * > Thanks. The zipped CV has been uploaded successfully at https://0x0.st/zI_M.zip
    * > Please say 'terminate' to terminate the session
    * The user downloads the zip file and says **terminate** to end the session.
* If the user replies `github`, the bot will prompt for more information about the github profile of the user.
    * >User name?
    * The user needs to provide the valid username which will contain the repo of CV.
    * >Token?
    * The user needs to provide a valid token for the corresponding username. The bot then continues with the rest of the conversation.
    * >website has been published at \<username\>.github.io
    * > Please say 'terminate' to terminate the session
    * The user visits the address that is provided and says **terminate** to end the session.

## Use Case # 4: Terminate a session with the resumebot
At any point, the user can terminate a session. This option is independent of any use cases or 
states the user/bot is at the moment.

* As the user types in `terminate`, the bot terminates the session.
* > Session terminated! You can start a new session by saying 'start'