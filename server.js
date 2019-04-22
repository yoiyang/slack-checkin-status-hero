// Initialize an Express application
const express = require('express'); // connection
const handlers = require('./handlers') // event handlers

// constants
const port = process.env.PORT || 3000;
const app = express();  
app.use(express.urlencoded({extended: true})); // Important: to get the raw body of the request

// ---------main events---------
app.post('/gen', handlers.token_gen_handler); // Generate Token at server.com/gen
app.post('/check', handlers.check_in_handler); // Check-In at server.com/check

// ---------other events---------
app.get('/web', handlers.helper_site_handler); // Send back website of the token at server.com/web?t=......
app.get('/QR', handlers.QR_handler); // Send back QR Image at server.com/QR?t=...
app.get('/', handlers.add_to_slack_handler); // Add this Bot web component at server.com/ 
app.get('/oauth', handlers.slack_bot_verification_handler); // The router Slack uses to verify this app when adding

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

