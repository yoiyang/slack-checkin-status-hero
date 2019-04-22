const QRCode = require('qrcode'); // QR code
const base64Img = require('base64-img'); // QR image
const fs = require('fs'); // send image
const status_hero = require('./status_hero'); // send image
const slack = require('./slack'); // send image
const axios = require('axios') // request
// var request = require('request'); // request

// env variables
require('dotenv').config();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const server_address = process.env.SERVER_ADDERSS;

// the generated token 
var attend_token = "";
var timeout = new Date().getTime();

// ---------Event-handlers---------
exports.check_in_handler = async (req, res) => {

    // verify the request and get user
    var verify = await slack.verify_get_user(req)
    if (!verify.ok){
      res.send(verify.message)
      return
    }
  
    // if verified, get user object
    const user = verify.user_info;

    // verify the token passed in the request's params
    verify = is_token_ok(req.body.text)
    if (!verify.ok){
      res.send(verify.message)
      return
    }
  
    console.log(`${user.profile.email} checks in`)
    // check in user on Status Hero
    status_hero.checkin(user.profile.email)    
      .then((response) => {
        res.send(`Checked in! ${response.data.url}`)
      })
      .catch((err) => {
        res.send(err.data)
      });
}
  
exports.token_gen_handler = async (req, res) => {
    
    // verify the request and get user
    const verify = await slack.verify_get_user(req)
    
    // if not verified, return 
    if (!verify.ok){
      res.send(verify.message)
      return
    }
    // if verified, get user object
    const user = verify.user_info;
  
    // check user permission
    if (!slack.is_admin(user.profile.email)){
      res.send("Permission denied")
      return
    }
  
    // generate new token
    generate_token().then(() => {
        res.send(slack.response(attend_token, timeout));
      })
      .catch((err) => {
        res.send(err)
      });
}
exports.helper_site_handler = (req, res) => {
    const verify = is_token_ok(get_token(req))
    if (!verify.ok)
        res.send(verify.message)
    else
        res.end(fs.readFileSync(`./web.html`), 'binary');
}
  
exports.QR_handler = (req, res)=> {
    const verify = is_token_ok(get_token(req))
    if (!verify.ok)
        res.send(verify.message)
    else{
        res.writeHead(200, {'Content-Type': 'image/png' });
        res.end(fs.readFileSync(`./QR.png`), 'binary');
    }
}
exports.add_to_slack_handler = (req, res) => {
    res.send(
      '<a href="https://slack.com/oauth/authorize?scope=commands,bot&client_id=' + clientId + '"><img alt=""Add to Slack"" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>'
    );
}
exports.slack_bot_verification_handler = (req, res) => {
    // allow user to add this bot to their workspace, redirect user to the bot after adding
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
    } else {
        axios({url: 'https://slack.com/api/oauth.access', 
                params: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, 
                method: 'get', 
            })
            .then((body) => {
                res.send('Awesome! <a href="https://slack.com/app_redirect?app=AHVKQK8E4">Open Slack</a> <script>window.location.replace("https://slack.com/app_redirect?app=AHVKQK8E4");</script>');
            })
            .catch((error) => {
                res.send(error);
        })
    }
}

// ---------Helper functions---------
// check if the token has expired, and if token matches our token
const is_token_ok = (param_token) => {
    if (timeout - new Date().getTime() < 0 || param_token != attend_token)
        return {ok: false, message: "Token expired or invalid"}
    return {ok:true}
}

// generate attendance token
const generate_token = () => {
    return new Promise(function(resolve, reject) {
        attend_token = Math.random().toString(36).substring(7);
        timeout = new Date().getTime() + 15 * 60 * 1000;   // allow it to live for 15 min
        // generate the QR code
        QRCode.toDataURL(`${server_address}/web?t=${attend_token}`)
        .then((url) => {
            base64Img.imgSync(url, "", "QR");   // create an image named QR.png at current dir
            generate_web();
            resolve();
        })
        .catch(err => {
            reject(err)
        });
    })
}
// generate a website for users to copy the token easily
const generate_web = () => { 
    const page = '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>'+
        '<script>function f(){document.getElementById("i").select();document.execCommand("copy");window.location.href="slack://open";}'
        + `</script><input id="i" value="/inclass ${attend_token}" onclick="this.setSelectionRange(0, 9999)"/><br><button onclick="f()">Copy & go</button>`;

    fs.writeFile(`web.html`, page, function(err) {
        if (err) throw err;
        console.log(`The website is created at: ${server_address}/web?t=${attend_token}`);
    }); 
}

// fetch token from request url, format defined by us
const get_token = (req) =>{
    return req.originalUrl.substring(req.originalUrl.indexOf("t=")+2)
}