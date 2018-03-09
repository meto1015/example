'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()
//initialize intent variable
var intent = ''

app.set('port', (process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080))

// Allows us tu process the data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// ROUTES

app.get('/', function(req, res) {
  res.send("Hi I am a chatbot")
})

app.get('/test', function(req, res) {
  res.send("This is a test")
})

let token = "EAAB6BV0Flp8BAAWZAMdvVCn4zJmuc5yVtBYGVZCz41yQphgdeB2SpwuGzJeJCf0WSr8Bs4TNIAFpQBbhCTXnQMrRNr8KTZB4ioQkbAfRabTXwOZAoC5GfZC5nV1Q5ZBRrypHcrKmwhRgyfa04XXkK6dBFqKZCaZC4HfrxZCwncVhohwZDZD"

// Facebook

app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === "blondiebytes") {
    res.send(req.query['hub.challenge'])
  }
  res.send("Wrong token")
})

app.post('/webhook/', function(req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = messaging_events[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text

      //send message to wit.ai
      request.post({  url: 'https://api.wit.ai/message',
                      auth: {bearer: '24OSWHTMR4AMQ4ULIGAYSIGKCQBEK2XU'},
                      qs: { v: '20180228',
                            q: text }
                }, function (err, httpResponse, body) {
                if (httpResponse && (httpResponse.statusCode === 401 || httpResponse.statusCode === 403)) { 
                  logger('The authentification token to post to wit.ai is invalid or expired.');
                }
                console.log('Server:', body);
                intent = jsonBody.entities.intent[0].value;
                console.log('Here is the intent: ' + intent);
                }
            );
      intent = 'Here I need to assign the intent';
      response.send('intent has been detected: ' + intent);

      sendText(sender, "Text echo: " + text.substring(0, 100) + "   intent: " + intent)
    }
  }
  res.sendStatus(200)
})

function sendText(sender, text) {
  let messageData = {text: text}
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: token},
    method: "POST",
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function(error, response, body) {
    if (error) {
      console.log("sending error")
    } else if (response.body.error) {
      console.log("response body error")
    }
  })
}

app.listen(app.get('port'), function() {
  console.log("running: port")
})
