const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const cors = require('cors')
const fs = require('fs');
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser');



const app = express();

const target = process.env.TARGET || 'http://localhost:8399';

function checkPrototypePollution(req, res, next) {
    // check the requestion body or params contains __proto__ or constructor
    // stringlifyBody = JSON.stringify(req);
    // if (stringlifyBody.includes('__proto__') || stringlifyBody.includes('prototype') || stringlifyBody.includes('constructor')) {
    //     console.log('Body contains prototype pollution');
    //     //log the request in files
    //     const log = `Time: ${new Date().toISOString()} Request: ${JSON.stringify(req)} URL: ${req.url} IP: ${req.ip} \n`;
    //     fs.appendFile('blocked.log', log, (err) => {
    //         if (err) throw err;
    //         console.log('The log has been saved!');
    //     });
    //     return res.status(400).json({ message: 'Bad Request' });
    // }
    // check body or params

    if (req.body) {
        // check body contain the word __proto__ or constructor
        console.log(req.body);
        stringlifyBody = JSON.stringify(req.body);
        if (stringlifyBody.includes('__proto__') || stringlifyBody.includes('prototype') || stringlifyBody.includes('constructor')) {
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
        if (stringlifyParams.includes('__proto__') || stringlifyParams.includes('constructor')) {
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
        console.log('Proxy Request: ', req.url);
    }
}));

const PORT = 8599;
app.listen(PORT, () => {
    console.log(`Proxy Server is running on port ${PORT}`);
});
