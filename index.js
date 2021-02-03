const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const cors = require('cors')
const MessagingResponse = require('twilio').twiml.MessagingResponse
const wsServer = require('./socket')
console.log(wsServer.connections)
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/*
    Middleware
*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);
app.use(cors())
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    next()
})

app.post('/api/sms', async (req, res) => {
    const twiml = new MessagingResponse()
    const content = req.body.Body
    console.log('content: ', content)

    try {
        wsServer.connections[0].sendUTF(content)
        if (req.body.Body == 'test') {
            twiml.message('Hi!')
        } else {
            twiml.message('Bye!')
        }
        
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    } catch (e) {
        console.log(e)
        res.status(500).send('fail!')
    }
})

app.post('/api/messages', async (req, res) => {
    try {
        await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.MY_NUMBER,
            body: req.body.body
        })

        res.send(JSON.stringify({ success: true }));
    } catch (e) {
        console.log(e)
        res.send(JSON.stringify({ success: false }));
    }
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);