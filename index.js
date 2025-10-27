const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'Client')));
app.use(cookieParser());

// index.html 전송
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});


const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.crt'))
};

https.createServer(httpsOptions, app).listen(3000, '0.0.0.0', () => {
  console.log('HTTPS 서버: https://0.0.0.0:3000');
});
