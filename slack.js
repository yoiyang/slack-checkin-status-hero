const crypto = require('crypto'); // auth
const axios = require('axios') // request

require('dotenv').config();
const signing_secret = process.env.SLACK_SIGNING_SECRET;
const app_token = process.env.TOKEN;
const admins = process.env.SLACK_ADMIN.split(' ');
const server_address = process.env.SERVER_ADDERSS;

// verify request and return user information
exports.verify_get_user = async (req) => {

    // confirm request is from Slack
    if (!verify_request(req)){
      return {ok: false,  message: "Invalid credential"}
    }
    // get user information
    const user = await get_user(req.body.user_id)  

    // if user doesn't have email, send error back
    if (user.profile.email == null)
      return {ok: false, message: `ERROR: ${err}. for user: ${req.body.user_name}`}
    
    return {ok:true, user_info: user}
}

// check if user is one of the admins
exports.is_admin = (email) => { 
    return admins.includes(email)
}

// compose response object that contains the token and timeout
exports.response = (attend_token, timeout) => {
    const bot_message = {
        "response_type": "in_channel",
        "text": `Your token is: ${attend_token}`,
        "attachments": [{ 
          "fields": [
            { "title": `Use: "/inclass ${attend_token}" to check in.`,
              "short": false
            }
          ],
          "text": `Valid until ${new Date(timeout).toLocaleString()}`,
          "image_url": `${server_address}/QR?t=${attend_token}`
      }]}
    return bot_message
}

// get user email using user id asynchronously
const get_user = (user_id) => {
    return new Promise(function(resolve, reject) {
        axios.get("https://slack.com/api/users.info", {params:{token: app_token, user: user_id}})
        .then((res) => {
            if (res.data.ok)
            resolve(res.data.user);
            else
            reject(res.data.error)
        })
        .catch((err) => {
            reject(err);
        })
    })
}

//confirm request is from Slack 
const verify_request = (req) => {
    const hmac = crypto.createHmac('sha256', signing_secret);
    const req_body = object_to_param(req.body);
    const timestamp = req.headers['x-slack-request-timestamp'];
    const sig_basestring = 'v0:' + timestamp + ':' + req_body;
    const my_signature = "v0=" + hmac.update(sig_basestring).digest('hex')
    const slack_signature = req.headers['x-slack-signature']

    return (my_signature === slack_signature);
}

// convert an object to the format of url params
const object_to_param = (obj)=>{
    var str = "";
    for (var key in obj) {
        if (str != "") 
            str += "&";
        str += key + "=" + encodeURIComponent(obj[key]);
    }
    return str
  }