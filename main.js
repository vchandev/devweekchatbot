export default (request, response) => {
    const pubnub = require('pubnub');
    const kvstore = require('kvstore');
    const xhr = require('xhr');
    
    let headersObject = request.headers;
    let paramsObject = request.params;
    let methodString = request.method;
    let bodyString = request.body;
    
    let VERIFY_TOKEN = 'my_verify_token'; // your verify token goes here
    let PAGE_ACCESS_TOKEN = 'EAADdENfJnNABAH5NjYt7bXgz5Pz4J56vZCjkcYrCMfhBfjE32ZAsanUvB9i33wp1ESjpLtNQ3jZAsGuuVLbV7ADrk2ta9y55laZAzEOqTBkYdeZA56BkCJWUooSqzhuVdkMbxfNhUhzMZBKETbSrOxYXqIf4sHOCARNQnXgJMpUQZDZD'; // your page access token goes here
    
    // Facebook validation
    if(methodString == 'GET'){
        if (paramsObject['hub.mode'] === 'subscribe' && paramsObject['hub.verify_token'] === VERIFY_TOKEN) {
            console.log("Validating webhook");
            response.status = 200;
            response.body = paramsObject['hub.challenge'];
        } else {
            console.error("Failed validation. Make sure the validation tokens match.");
            response.status = 403;
        }
      
      return Promise.resolve(response);
    }
     else {
        let data = JSON.parse(request.body);

        // Make sure this is a page subscription
        if (data.object === 'page') {
            // Iterate over each entry - there may be multiple if batched
            data.entry.forEach(function(entry) {
                let pageID = entry.id;
                let timeOfEvent = entry.time;
                // Iterate over each messaging event
                entry.messaging.forEach(function(msg) {
                    if (msg.message) {
                        receivedMessage(msg);
                    } else if (msg.postback) {
                        // receivedPostback(msg);
                    } else {
                        console.log("Webhook received unknown event: ", event);
                    }
                });
            });

        }
        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        
        response.status = 200;

        return Promise.resolve(response);
    }

function receivedMessage(event) {
        let senderID = event.sender.id;
        let recipientID = event.recipient.id;
        let timeOfMessage = event.timestamp;
        let message = event.message;
        
        console.log(`Received message for user ${senderID} and page ${recipientID} at ${timeOfMessage} with message: ${JSON.stringify(message)}`);

        let messageId = message.mid;
        let messageText = message.text;
        let messageAttachments = message.attachments;
        
        if (messageText) {
            // If we receive a text message, check to see if it matches a keyword
            // and send back the example. Otherwise, just echo the text we received.
            switch (messageText) {
                case 'generic':
                    // sendGenericMessage(senderID);
                    break;
                default:
                    sendTextMessage(senderID, messageText);
            }
        } else if (messageAttachments) {
            sendTextMessage(senderID, "Message with attachment received");
        }
}
        

 function sendTextMessage(recipientId, messageText) {
        let messageData = {
            recipient: {
                id: recipientId
            },
            //"sender_action":"typing_on",
            message: {
                text: messageText
            }
        };
        callSendAPI(messageData);
        console.log("Successfully sent generic message");
}
function callSendAPI(messageData) {
        
        const http_options = {
        "method": "POST",
        "body": JSON.stringify(messageData),
        "headers": {
                'Content-Type': 'application/json'
            }
        };
          
        const url = "https://graph.facebook.com/v2.6/me/messages?access_token=" + PAGE_ACCESS_TOKEN;
      
        return xhr.fetch(url, http_options).then((x) => {
            const body = JSON.parse(x.body);
            return request.ok();
        });
 }
};
Add Comment Collapse