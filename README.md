# slack-checkin-status-hero
A slack bot that lets students check in by displaying a QR code in class on Slack. (Node.js)

## Getting Started
### Create your Slack app
Creating your own Slack app on [slack](https://api.slack.com/apps) and add it to your workspace. 
### Create an .env file
In the project directory, copy and paste the following code to **.env**.
```
# -----Server-----
SERVER_ADDERSS = server.com
PORT = 3000
# -----Slack-----
SLACK_ADMIN = testuser2@ucsd.edu testuser2@ucsd.edu 
SLACK_SIGNING_SECRET = abcdefg
CLIENT_ID = 1234567890.1234567890
CLIENT_SECRET = 1234567890abcdefghijklm
TOKEN = xoxp-1234567890-1234567890-1234567890-1234567890abcdefghijklm
BOT_TOKEN = xoxp-1234567890-1234567890-1234567890abcdefghijklm
# -----Status hero-----
SH_API_KEY = 1234567890abcdefghijklm
SH_TEAM_ID = 12345-1234-1234-1234-1234567890a
SH_ACTIVITY = Lecture
# -----------
```
On your [Slack app's page](https://api.slack.com/apps):
1. Go to Basic Information, copy and paste relavant tokens into ```#-----Slack-----``` section of your *.env* file. 
Go to OAuth & Permissions, copy OAuth Access Token to the field ```TOKEN``` in **.env** and copy Bot User OAuth Access Token to the field ```BOT_TOKEN```.

* Note: these tokens will change after each reinstall*
### Prepare libraries and network
```
npm install
ngrok http 3000
```
ngrock creates global access to your local server (we'll run later) by forwarding your server to an address that looks like "https://e4061850.ngrok.io". (You can find this right after running ```ngrok``` on port 3000.)

*This tutorial will use "https://e4061850.ngrok.io" as an example of your server's address in the following setup. (Make sure to use your ngrok address) *
### Change your app's config on Slack 
In [your slack app](https://api.slack.com/apps) page: 
1. Go to **Slack Commands** and create two commands:
    /generate
        Request URL = https://e4061850.ngrok.io/gen
    /inclass
        Request URL = https://e4061850.ngrok.io/check

2. Go to **OAuth & Permissions** and add a Redirect URL
        Redirect URL = https://e4061850.ngrok.io/oauth

3. Go to **.env** in the project directory and change 
        SERVER_ADDRESS = https://e4061850.ngrok.io/

### Get Status Hero tokens
Go to your [status hero](https://statushero.com) setting; click on Team Setting; then click on API tab. Find Team ID and Team API key and copy them in **.env** file.

### Run local server. 
```
npm start
```
### Done. Use those commands on Slack.

## Work Flow

1. the course staff types a command on slack to generate a QR code/token that lasts about 15 minutes.
2. our Slack app sends a request to the server to generate the QR code with an embedded alphanumeric code/token
3. our server receives:
- Slack security token: to make sure that the calls are from slack 
- the course staff email:  for permission control. (only staff members can generate the QR code/token
- respond with a QR code/token (for 15-min lifetime) as a message back to Slack. 
4. The course staff then displays the QR code/token to the entire class for check-in.
5. Now, the student can perform: 
a. use camera to scan QR code which opens a website and copy the command.
b. type in or paste the check-in command with the token on Slack
6. the server receives:
- the token: what we generated in real time for 15 min duration
- slack security token: to make sure that the calls are from slack 
- the student’s email: for the student’s checking-in on StatusHero
- the server checks if the token is correct; if so, it makes an api call to StatusHero with the student’s email to perform check-in (in this case, it creates an event called Lecture and creates an activity called "Attended class" on the student's behalf).
