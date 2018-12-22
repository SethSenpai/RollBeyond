const Nightmare = require('nightmare');
const nightmare = Nightmare();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const auth = require('express-basic-auth');


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
    const selector = ".ct-character-sheet__inner";
    var data;
    console.log(`x: ${req.query.w.x}, y: ${req.query.w.y}`);
    console.log(`getting character sheet request`);
    nightmare.goto("https://www.dndbeyond.com/profile/SethSenpai/characters/4521436")
    .viewport(parseInt(req.query.w.x),parseInt(req.query.w.y))
    .wait(selector)
    .evaluate(() => document.querySelector('.ct-character-sheet__inner').innerHTML)
    .end()
    .then(datab =>{
        resp.send(datab);
        console.log(datab);
    })
    .catch(error => {
        console.error("failed",error);
    })

    //console.log(data);
    //resp.send(data);
});

app.listen(9999, () => console.log(`listening on port 9999`));