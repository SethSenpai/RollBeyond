const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const auth = require('express-basic-auth');
const Browser = require('zombie');

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
    var br = new Browser();
    br.visit("https://www.dndbeyond.com/profile/SethSenpai/characters/4521436", {waitFor:15000,debug:true}, (err,browser) => {
        resp.send(br.html());
    });
});

app.listen(9999, () => console.log(`listening on port 9999`));