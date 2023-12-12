const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const cors = require('cors')
const fs = require('fs');
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser');

const { checkAgainstBlocklist } = require('./checkBlocklist');

const app = express();

const target = process.env.TARGET || 'http://localhost:8399';

const secretHeaderName = 'PPProxy-Secret-Header'; 
const secretHeaderValue = 'Polluted_PrototypePollution_With_Poison_Y3W2q';


function checkPrototypePollution(req, res, next) {

    if (req.body) {
        // check body contain the word __proto__ or constructor
        console.log(req.body);
        stringlifyBody = JSON.stringify(req.body);
        if (checkAgainstBlocklist(stringlifyBody)) {
            console.log('Body contains prototype pollution');
            //log the request in files
            console.log(req.body);
            const log = `Time: ${new Date().toISOString()} \n Request: ${JSON.stringify(req.body)} \n URL: ${req.url} \n IP: ${req.ip} \n`;
            fs.appendFile('blocked.log', log, (err) => {
                if (err) throw err;
                console.log('The log has been saved!');
            });
            return res.status(400).json({ message: 'Bad Request' });
        }
    }
    // check params
    if (req.params) {
        // check params contain the word __proto__ or constructor
        stringlifyParams = JSON.stringify(req.params);
        if (checkAgainstBlocklist(stringlifyParams)) {
            console.log('Params contains prototype pollution');
            //log the request in files
            console.log(req.params);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }

    next();
    
}

app.use(cors())

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text({ extended: false }));
app.use(cookieParser());

app.use(checkPrototypePollution);

app.use('/', createProxyMiddleware({
    target: target,
    changeOrigin: false,

    onProxyReq: (proxyReq, req, res) => {

        proxyReq.setHeader(secretHeaderName, secretHeaderValue);
        console.log('Proxy Request: ', req.url);
    },
    onProxyRes: (proxyRes, req, res) => {
        if (proxyRes.headers[secretHeaderName] && proxyRes.headers[secretHeaderName] === secretHeaderValue) {
            delete proxyRes.headers[secretHeaderName];
        }
    }
}));

const PORT = 8599;
app.listen(PORT, () => {
    console.log(`Proxy Server is running on port ${PORT}`);
});
