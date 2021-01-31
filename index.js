const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

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
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    next()
})

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.post('/api/messages', async (req, res) => {
    try {
        await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: req.body.to,
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