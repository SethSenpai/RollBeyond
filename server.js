const Nightmare = require('nightmare');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const auth = require('express-basic-auth');
const http = require('http').Server(app);
const io = require('socket.io')(http);


app.use(express.static('www'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(auth({
    users: {'elias' : 'blessings'},
    challenge: true
}));

//serve the index file
app.get('/', (req,res) => {
    res.sendFile(__dirname + "/www/index.html");    
});

//function to scrape charactersheet
app.get('/charSheet', (req,resp) => {
    const selector = ".ct-character-sheet__inner";
    const nightmare = Nightmare({show:false}); //set show false to disable popup

    var body;
    var actions;
    var spells;
    var equipment;
    var features;
    var creatures;

    console.log(`x: ${req.query.w.x}, y: ${req.query.w.y}`);
    console.log(`getting character sheet request`);
    nightmare.goto('https://www.dndbeyond.com/characters/4521436')
    .viewport(parseInt(req.query.w.x),parseInt(req.query.w.y))
    .wait(selector)
    .evaluate(() => document.querySelector('.ct-character-sheet__inner').innerHTML)
    .then(datab =>{
        //save body
        body = datab;
        console.log(`Send sheet data`);
        nightmare.evaluate(() => document.querySelector('.ct-tab-list__content').innerHTML)
        .then(dataa => {
            //saved actions
            actions = dataa;
            console.log(`grabbed actions`);
            nightmare.click('.ct-primary-box__tab--equipment')
            .wait('.ct-equipment')
            .evaluate(()=> document.querySelector('.ct-tab-list__content').innerHTML)
            .then(datae =>{
                //saved equipment
                equipment = datae;
                console.log(`grabbed equipment`);
                nightmare.click('.ct-primary-box__tab--features')
                .wait('.ct-features')
                .evaluate(()=> document.querySelector('.ct-tab-list__content').innerHTML)
                .then(dataf => {
                    //saved features
                    features = dataf;
                    console.log(`grabbed features`);
                    nightmare.click('.ct-primary-box__tab--creatures')
                    .wait('.ct-creatures')
                    .evaluate(()=> document.querySelector('.ct-tab-list__content').innerHTML)
                    .then(datac => {
                        //saved creatures
                        creatures = datac;
                        console.log(`grabbed creatures`);
                        nightmare.click('.ct-primary-box__tab--spells')
                        .wait('.ct-spells')
                        .evaluate(() => document.querySelector('.ct-tab-list__content').innerHTML)
                        .end()
                        .then(datas =>{
                            //saved spells
                            spells = datas;
                            console.log(`grabbed spells`);
                            var data = {b:body,a:actions,s:spells,e:equipment,f:features,c:creatures};
                            resp.send(data);
                        })
                        .catch(error =>{
                            console.log(`prob not a spellcaster eh: ${error}`);
                            var data = {b:body,a:actions,s:spells,e:equipment,f:features,c:creatures};
                            resp.send(data);
                        })
                    })
                })
            })
        })
    })
    

    //console.log(data);
    //resp.send(data);
});

//socket.io connection event
io.on('connection', (socket) => {
    console.log(`a user connected from: ${socket.ip}`);
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data)); //register connection to the drawing event
});

http.listen(9999, () => console.log(`listening on port 9999`));