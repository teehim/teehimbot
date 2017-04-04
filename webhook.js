const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

const PAGE_ACCESS_TOKEN = "EAAGDrZCh2JNkBAN6dNzHGt9ANbtZAZCYCCjYwZALkHZAQadZCQiFzMagX3rHDY2bcIuC4kb0RkL5PiGZCXojvH1arJlAApZBPtFVK4zPWDz1E8xwW9CQZAX5dqz2wD4OFPqjSCboZCrwQV5WvAObgye6ue1I6x1sPtUvyrYlaSIcbESQZDZD";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode',server.address(),app.settings.env);
});

app.get('/webhook',(req,res) => {
    if(req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat'){
        res.status(200).send(req.query['hub.challenge']);
    } else{
        res.status(403).end();
    }
});

app.post('/webhook',(req,res) => {
    console.log(req.body);
    if (req.body.object === 'page'){
        req.body.entry.forEach((entry)=> {
            entry.messaging.forEach((event)=>{
                if(event.message && event.message.text){
                    getUserInfo(event);
                }
            });
        });
        res.status(200).end();
    }
});

function sendMessage(event,user) {
    let sender = event.sender.id;
    let text = event.message.text;

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: PAGE_ACCESS_TOKEN},
        method: 'POST',
        // json: {
        //     recipient: {id: sender},
        //     message: {attachment: {
        //         type: "template",
        //         payload:{
        //             template_type: "button",
        //             text: "Choose your link",
        //             buttons: [
        //                 {
        //                     type: "web_url",
        //                     url: "https://www.google.co.th/search?q="+text,
        //                     title: "Google"
        //                 },
        //                 {
        //                     type: "web_url",
        //                     url: "https://www.youtube.com/results?search_query="+text,
        //                     title: "Youtube"
        //                 }
        //             ]
        //         }
        //     }}
        // }   
        json: {
            recipient: {id: sender},
            message: {text: user.first_name}
        }
    },function (error, response){
        if(error){
            console.log('Error sending message: ',error);
        }else if(response.body.error){
            console.log('Error: ', response.body.error);
        }
    });
}

function getUserInfo(event) {
    let sender = event.sender.id;

    request({
        url: 'https://graph.facebook.com/v2.6/'+sender,
        qs: {access_token: PAGE_ACCESS_TOKEN},
        method: 'GET'  
    },function (error, response){
        if(error){
            console.log('Error sending message: ',error);
        }else if(response.body.error){
            console.log('Error: ', response.body.error);
        }
        var user = JSON.parse(response.body);
        sendMessage(event,user);
    });
}

