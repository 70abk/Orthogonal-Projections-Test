const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const https = require('https');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'Client')));
app.use(cookieParser());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const hakbun = req.body.hakbun;
        const ext = path.extname(file.originalname);
        cb(null, `${hakbun}_${Date.now()}${ext}`);
    }
});

const upload = multer({ storage: storage });
app.get('/set-cookie', (req, res) => {
    res.cookie('session_id', 'user12345', {
        httpOnly: true,        // JS에서 접근 불가
        secure: true,          // HTTPS에서만 전송
        sameSite: 'Strict',    // 외부 요청에서 쿠키 전송 금지
        maxAge: 1000 * 60 * 10 // 10분 유지
    });
    res.send('보안 쿠키가 설정되었습니다.');
});

// index.html 전송
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});


const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.crt'))
};

https.createServer(httpsOptions, app).listen(3443, () => {
    console.log('HTTPS 서버: https://localhost:3443');
});
