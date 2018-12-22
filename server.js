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
    console.log(`connection coming in from: ${req.ip}`);
    res.sendFile(__dirname + "/www/index.html");    
});

app.get('/charSheet', (req,resp) => {
    console.log(`getting character sheet request`);
    request(`https://www.dndbeyond.com/profile/SethSenpai/characters/4521436`,(err,res,body) => {
        if(err){
            console.log(`Error: ${err} | StatusCode: ${res.statusCode}`);
            resp.sendFile(__dirname + "/www/charSheetErr.html");
        }
        else{
            var regSheet = /<div class="ct-character-sheet__inner" style="">(.*?)<\/div>/;
            var sheet = regSheet.exec(body);
            console.log(sheet);
            resp.send(sheet);
        }
    });
});

app.listen(9999, () => console.log(`listening on port 9999`));