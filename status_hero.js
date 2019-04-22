const axios = require('axios') // request

require('dotenv').config();
const sh_team_id = process.env.SH_TEAM_ID;
const sh_api_key = process.env.SH_API_KEY;
const sh_activity = process.env.SH_ACTIVITY;

// check user in on status hero 
exports.checkin = async (user_email) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-TEAM-ID': sh_team_id,
        'X-API-KEY': sh_api_key,
      }
    };
    console.log("calling to check in")
    return axios.post("https://service.statushero.com/api/v1/status_activities", 
      { 'email': user_email,
        'source': sh_activity,
        'description': "Attended class."}, config)

  }