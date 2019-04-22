// env
require('dotenv').config();

//requests
const axios = require('axios')

// Initialize using signing secret from environment variables
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const port = process.env.PORT || 3000;

// Initialize an Express application
const express = require('express');
const app = express();

// env variables
require('dotenv').config();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const signing_secret = process.env.SLACK_SIGNING_SECRET;
const app_token = process.env.TOKEN;
const admins = process.env.SLACK_ADMIN.split(' ');
const server_address = process.env.SERVER_ADDERSS;
const sh_team_id = process.env.SH_TEAM_ID;
const sh_api_key = process.env.SH_API_KEY;
const sh_activity = process.env.SH_ACTIVITY;


// req = axios.post('https://slack.com/api/users.info', {
//   token: process.env.BOT_TOKEN,
//   user: "UHZ5Y4AS3"
// })
// .then((res)=>{
//   console.log(res.data)
  
// })
// .catch((error) => {
//   console.error(error)
// })


console.log( `teamid: ${sh_team_id}`);
console.log( `apikey: ${sh_api_key}`);
const get_status = (email) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-TEAM-ID': sh_team_id,
      'X-API-KEY': sh_api_key,
    }
  };
  axios.get("https://service.statushero.com/api/v1/status_activities/2019-04-22-mich-singe", config)
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log(err)
  });
 
}

get_status("michaelmiren@gmail.com")
