# Static Resume Website Builder BOT
## 1. Problem Statement
In a competitive market, having a resume and homepage that works for you is essential. However, many of us already maintain e profile in popular web services like LinkedIn, Github etc. Moreover, building a personal website is often time consuming. Therefore, keeping that in mind, our plan is to create a bot that is able to put together a personal resume like website based on various public profiles such as LinkedIn, Github, DBLP index etc and the information that is fed to the bot by the person itself through the conversation with the bot. These days, slack provides a lot of options for developers to build bots that can do such interesting thing, so using the slack bot api, one can easily resuse their information from the website and get a set of static html and css pages that will be hosted as a personal resume webpage. It will save the user from spending time and tedious work on building html and css contents from the scratch. The bottom line is, this bot will help the user build a personal resume website without writing web contents from the scratch through the usage of jekyll and importing information from Linkedin, Github etc. Once, the static webpages have been generated, then the user can modify it within his/her needs. 

# 2. Bot Description
-   The Resume builder bot is a Slack based interactive conversational bot which simplifies the mundane (in the sense that it handles the formatting and ornamentation) task of buidling a resume website.  
-   The bot provides the user various alternatives to start their new resume website with different templates according to the user's taste. 
-   The bot will continue with the conversation bringing out important information that it needs from the user.
- Hence, with the necessary information, it will extract user profile information such as the publication list, projects, employment history, skillsets, etc from sites like LinkedIn, DBLP index, Github, etc. If a user does not maintain any profile in the aforementioned services, bot will provide a template where user can put all the information. 
- Once the bot completes its task, it will reply in Slack with a link to the homepage within which the CV is also availiable if user opts to host the site in github.io or provide a static webpage files that can be used to publish the site in any host.

# 3. Use Cases
## 3.1 Use Case # 1: Initiating the Bot
### Preconditions
The user must join a slack channel and the bot must be invited to the slack channel. 

### Main Flow
- The user wants to initiate coversation with the bot [S1]. The bot will reply an acknwoledgement message letting the user know that the bot has been initiated [S2].

### SubFlow
- [S1] User says ```/init``` @bot in the direct communication channel, Slack
- [S2] Having read the command from the user, the bot will reply with an acknowledgement "the bot has been initiated"

## 3.2 Use Case # 2: Pausing and Resuming the Conversation Session
### Preconditions
The conversation between the user and bot must have been initiated

### Main Flow
- User wishes to pause the process[S1]. The bot will suspend the session as user requests to pause[S2]. When a user requests to resume the conversation[S3], the bot will reinitiate the conversation [S4].

### SubFlow
- [S1] User types in ````pause```` @Bot to make the pause request
- [S2] The bot responds by suspending the session and saving the progress of the conversion and the tasks
- [S3] User types in ````resume```` @Bot to resume the conversation and restore the tasks it had completed previously
- [S4] The bot fetches the information of the session and reinitiates the conversation from where it left off.

### Alternate Flow
- [E1] No pausing session found by bot, hence cannot resume any session
 
## 3.3 Use Case # 3: Terminating the Bot
### Preconditions
- The conversation between the user and bot must have been initiated

### Main Flow
- The user type wants to terminate the conversation[S1]. The bot will ask the user whether s/he really wants to terminate the session or cancel it[S2]. The bot will send an acknwoledgement message letting the user know that the session has been terminated[S3]

### Sub Flow
- [S1] The user types in ````kill```` to terminate the conversation
- [S2] the bot asks the user like do you want to terminate or cancel the command. If the user replies no, then the bot will ignore the kill command. But if the user replies yes, the bot will ask the user whether s/he wants to save the session or not.
- [S3] The bot will reply that the session has been terminated. 

### Alternate  Flow
[E1] If the user replies to save the session, the bot will save the session before terminating.

## 3.4 Use Case 4: Gather Personal Information from the User

### Precondition
The conversation between the user and bot must have been initiated

### Main Flow
- The bot will ask the user about his/her public profiles in Linkedin, Github, Dblp profile links[S1]. If the user skips one or more questions asked by the bot, the bot will provide a template to the user to fill out the necessary information[S2]. Hence with all the information, the bot will process all the information in the background and prepare one single profile information which will be presented to the user later.[S3]

### Subflow
- [S1]  
	- The bot will ask ```Your Github Profile link?```
	- The user will provide the link or type ```/skip```
	- The bot will ask ```Your Linkedin Profile link?```
	- The user will provide the link or type ```/skip```
	- The bot will ask ```Your DBLP Profile link?```
	- The user will provide the link or type ```/skip```
- [S2] Bot will generate a file that holds a template. It requires the user to fill up the necessary missing information
- [S3] Once all the necessary information are filled, the bot will extract informaion from the public profiles, if stated by the user, or scan the file that it required the user to fill up. Hence, it will generate a single file that will hold all the information needed to build the homepage and resume.

### Alternate Flow
-[E1] If the bot is unable to extract the necessary information inspite of the links being provided, the bot will ask the user to fill up the missing information in the template file it provided.   

## 3.5 Use Case 5: Validate the Information from the User
- show user the profile picture
- provide user with a yml file with all data

## 3.6 Use Case 6: Select Homepage Look and Feel from the User Preference
- choose templates, colors etc
- choose whether it should be academic/industrial

## 3.7 Use Case 7: Delivering the Web Contents to the User
- github/zip
- if github, take token from user
    - warn user about the reposiroty naming convention
    - push and reply with a link
if zip file, provide user with a zip file containing all the things... 

