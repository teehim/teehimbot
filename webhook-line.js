const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

const apiai = require('apiai');
const aiapp = apiai("dfb212764dde44ab949dfd05f8678fb9");

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Bot');
var db = mongoose.connection;

db.on('error', console.error.bind(console,"connection-error"));
db.once('open',function(){
    console.log('Mongo Connected');
});

const CHANNEL_ACCESS_TOKEN = "I8n2PuR6TOu0gqsrfPCeZc+oL1FpN1g3W6PpFxrRBwDlL/wOxPHsUh/Fd3VRQJhF62YX+JhJLov3uKX+RHk41i/yo/GW1wNq5gfsoti7/6NpNiPdn5yPI70zTS9xbwkqzxfH5fsMgQ1cZSajD+LIRAdB04t89/1O/w1cDnyilFU=";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode',server.address(),app.settings.env);
});

app.get('/webhook-line',(req,res) => {
    if(req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat'){
        res.status(200).send(req.query['hub.challenge']);
    } else{
        res.status(403).end();
    }
});

app.post('/webhook-line',(req,res) => {
    console.log(req.body.events);
    req.body.events.forEach((event) => {
        replyMessage(event);
    });
    res.status(200).end();
});

function replyMessage(event){
    if(event.message.type == "text"){
        var text = event.message.text;
        var replyText;
        if(text=="My Schedule"){
            replyText = "Fetching your schedule";
        }else if(text=="Available Room"){
            replyText = "Checking for available room";
        }else if(text=="Book"){
            replyText = "Which room do you want to book";
        }else if(text=="Info"){
            replyText = "Getting Information";
        }else{
            let airequest = aiapp.textRequest(text, {
                sessionId: 'teehim_bot'
            });

            airequest.on('response',(response)=>{
                replyText = response.result.fulfillment.speech;
                sendReply(event.replyToken,replyText);
            });

            airequest.on('error', (error) => {
                console.log("AI "+error);
            });

            airequest.end();
        }
        sendReply(event.replyToken,replyText);
    }

    function sendReply(token,text){
        if(text){
            request(
                {
                    url: 'https://api.line.me/v2/bot/message/reply',
                    headers: {Authorization: 'Bearer '+CHANNEL_ACCESS_TOKEN},
                    method: 'POST',
                    json: {
                        replyToken: token,
                        messages: [
                            {
                                type: "text",
                                text: text
                            }
                        ]
                    }
                },function (error, response){
                    if(error){
                        console.log('Error sending message: ',error);
                    }else if(response.body.error){
                        console.log('Error: ', response.body.error);
                    }else{
                        console.log(response.body);
                    }
                }
            );
        }
    }
   
}

