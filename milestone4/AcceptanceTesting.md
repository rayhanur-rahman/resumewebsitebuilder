## Acceptance Tests
The purpose of our resumebot is to generate a homepage based on the information that we provide. 

## Slack Channel
Our bot has been deployed at https://app.slack.com/client/TNEF1FW9W/DPJ0ZN02J

## Login credentials for TAs
1. Join the slack workspace at https://northcarolina-s8o7157.slack.com with the following email address and password:
    1. email: ``nkasera@ncsu.edu``
    2. password: ``ncsu123456``
2. Next, from the ``Apps`` section in the left panel, click on the ``resumebot``. This is our designed bot that is deployed on the server.

3. Follow the acceptance tests in the following to start, continue, and terminate a conversation with the bot.
## Use-Case #1: Initiate a session with a resumebot
#### Instructions: 
* The user has to say ``'start'`` to start a conversation with the resumebot. To this, the bot can respond by any one of the following messages:
    1. **Response i:**
    > Welcome! This bot will help you build your one page resume website. Please say 'I am ready' when you have your linkedin and dblp public url along with your github username. If you do not have any of this, bot can generate an empty website for you!
    2. **Response ii:**
    > A session is already going on. Do you want to start a new session [y/n]?
    
    The following gives the rationale behind both of the responses and flow of conversation after each of them.
    * **Response i:** This occurs when the bot is ready for a new session. This can occur if a previous session was terminated, or a user wanted to reinitiate a new session in the middle of an ongoing one. Next, the following happens.
        1. The user responds with ``I am ready`` to start the conversation.
        
        2. If the user types in anything other than ``I am ready``, the bot responds: 
        >Sorry I did not understand. You can start a new session by saying 'start'
        
        Hence, the user types in ``start`` to reinitiate the conversation.

    * **Response ii:** This occurs when the bot is in the middle of an ongoing session. Next, the following happens.
    
        1. If the user types in `y` to **Response ii**, the bot responds with the message:
        > Please say 'start' to start a new session.

        The user types in ``start`` and the bot responds to this with **Response i** to initiate a new session again.

        2. If the user types in `n` to **Response ii**, the bot preserves the state of its last conversation so that the user can resume to the session that was already going on. 

## Use-Case #2: Gather Information from the user
#### Instructions
When the conversation has been successfully initiated, the bot will prompt for more information. It will start off by saying. 
* > Please tell me if you have a LinkedIn account?[yes/no]

    * If the user replies **no** the bot will move forward to the next step. If the user replies **yes**, then the bot will prompt for a valid LinkedIn profile link. 

    * > Please provide your LinkedIn Profile Url in the form https://linkedin.com/in/\<username\>

    * Then the user must provide a valid LinkedIn profile URL to continue the next step. 

    * If the user fails to adhere to the instruction or provides an invalid link the bot will redirect the conversation to ask for the LinkedIn profile link again by saying the following. 
    
    * > Sorry! The Url is wrong...

Once we are done taking gathering info about the LinkedIn profile, the bot ask for the DBLP data from user.
* > Please tell me if you have a DBLP account?[yes/no]

    * If the user replies **no** the bot will move forward to the next step. If the user replies **yes**, then the bot will prompt for a valid DBLP profile link. 

    * > Please provide me with the DBLP link in the form of [http|https]://[your dblp profile url]

    * Then the user must provide a valid DBLP profile URL in the specified format to continue the next step. 
    
    * If the user fails to adhere to the instruction or provides an invalid link the bot will redirect the conversation to ask for the DBLP profile link again by saying the following. 
    * > Sorry! The Url is wrong...



Once we are done taking gathering info about the DBLP profile, the bot ask for the GitHub data from user.
* > Now tell me if you have a Github account?[yes/no]
    * If the user replies **no** the bot will move forward to the next step. If the user replies **yes**, then the bot will prompt for a valid GitHub profile data. 

    * > Amazing! Please provide me with Github User Name.

    * Then the user must provide a valid GitHub URL to continue to the next step.

    * If the user fails to adhere to the instruction or provides an invalid username the bot will redirect the conversation to ask for the github profile link again by saying the following. 
    * > Sorry! The github info is wrong

 Once the steps of collecting data from LinkedIn, DBLP and Github are done, the bot will upload the merged data and provide us the link. For example: 
* >Based on the information provided, I was able to generate a file. The file is uploaded at https://0x0.st/zI__.yml
. Go to this link and check the yml file. Please edit your email and phone number. Please also fill in if there are any other missing fields. You must comply with the yaml syntax editing and you cannot change the yaml schema that is already provided. Type in 'verify' to upload any revisions. 

## Use Case 3: Validate the Information from the User and provide the CV

Once we have reached the state in the previous use-case, we need to download the yaml file uploaded in the link provided by the bot. Once we download the yml file the user needs to fill in other missing information in the yml file that the bot has missed while gathering the data. The user may also leave out information that he/she does not want to include in his/her homepage. Once the yaml file is ready, the user must type in `'verify'` and then the bot will ask for the link at which the verified yaml file has been uploaded.
* > Please give me a shareable link of the yml file in the form of [http|https]://[any file sharing website url] 
* Then the user must upload the edited or verified file in any file sharing website such as transfer.sh,0x0.st,etc and provide the link to the bot. The bot will then reply:
* > Data verified. Do you want your CV in industrial or academic format?[i/a]
* The user must reply `i/a`. If the reply is `i` the bot will generate a industrial CV and likewise if the reply is `a` the bot will generate an academic CV. If anything other than `i/a` is input by the user, the bot does not accept it and prompts for the answer once again. Hence the bot will continue to ask the user for preferences. 
* > Do you want your CV in Github.io or in zipped format?[github/zip].
* If the user replies `zip`, the bot will prepare the homepage files and reply.
    * > Thanks. The zipped CV has been uploaded successfully at https://0x0.st/zI_M.zip
    * > Please say 'terminate' to terminate the session
    * The user downloads the zip file and says **terminate** to end the session.
* If the user replies `github`, the bot will prompt for more information about the github profile of the user.
    * >Make sure your Github does not have a repository named <username>.github.io. Now your Github username?
    * The user needs to provide the valid username which will contain the repo of CV.
    * >Make sure your token has appropriate permissions. Now input the token?
    * The user needs to provide a valid token for the corresponding username. The bot then continues with the rest of the conversation.
    * >website has been published at \<username\>.github.io
    * > Please say 'terminate' to terminate the session
    * It must be noted that the github pushing takes a significant amount of time owing to the fact that each push accounts for only one file.
    * The user visits the address that is provided and says **terminate** to end the session.
* If the user answers anything other than github/zip, the bot replies: 
    * >Sorry I did not understand.
    * The bot redirects the conversation to question again.
## Use Case # 4: Terminate a session with the resumebot
Except for the cases where the bot expects any URL from the user, the user can terminate a session by typing in ``terminate`` at any point. The user must provide with a valid URL in the cases where the bot asks for a URL (e.g., link to one's LinkedIn, DBLP, or GitHub profiles, or link to the updated .yml file). If anything other than a valid URL (e.g., any invalid URL or any commands, even ``terminate``) is given, it winds back and will ask for a valid URL again.

* For the cases other than asking for a URL, if the user types in `terminate`, the bot terminates the session with the following message:
* > Session terminated! You can start a new session by saying 'start'
