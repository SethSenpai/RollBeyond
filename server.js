const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const auth = require('express-basic-auth');
const request = require('request');

app.use(express.static('www'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(auth({
    users: {'elias' : 'blessings'},
    challenge: true
}));

app.get('/', (req,res) => {
    res.sendFile('/www/index.html', {root: __dirname});
    console.log(`connection coming in from: ${req.ip}`);
});

app.get('/charSheet', (req,resp) => {
    console.log(`getting character sheet request`);
    request(`https://www.dndbeyond.com/profile/SethSenpai/characters/4521436`,(err,res,body) => {
        if(err){
            console.log(`Error: ${err} | StatusCode: ${res.statusCode}`);
            resp.sendFile(__dirname + '/www/charSheetErr.html');
        }
        else{
            resp.sendFile(body);
        }
    });
});

app.listen(9999, () => console.log(`listening on port 9999`));