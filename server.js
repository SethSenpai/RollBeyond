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
    //console.log(`a user connected from: ${socket.ip}`);
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data)); //register connection to the drawing event
    
    socket.on('chat',(data)=>{ //handle rolls
        //console.log(`chat recieved`);
        if(data.indexOf('/r') >= 0 && data.indexOf('/r') <= 0 ){
            //console.log(`rolling dice`);
            var command = data.substring(3);
            var result = rollDice(command);
            socket.broadcast.emit('chat',result);
        }
        else
        {
            //console.log(`got chat`);
            socket.broadcast.emit('chat',data);
        }
    }); 
});

function rollDice(command){
    command = command.replace(/ /g,'');
    var commandArray = command.split('d');
    
    if(commandArray.length > 1 && //all elements there
        isNaN(parseInt(commandArray[0])) == false && //die is valid number
        /^[0-9\+\-]+$/.test(commandArray[1]) == true)
        { //rest only contains numbers and plus and minus
            var multiplier = parseInt(commandArray[0]);
            var diemod = [];
            var pmmod;
            var die;
            var mod;

            if(commandArray[1].indexOf('+') >= 0){
                diemod = commandArray[1].split('+');
                die = parseInt(diemod[0]);
                mod = parseInt(diemod[1]);
                pmmod = '+';
            }
            else if(commandArray[1].indexOf('-') >= 0){
                diemod = commandArray[1].split('-');
                die = parseInt(diemod[0]);
                mod = parseInt(diemod[1]);
                pmmod = '-';
            }
            else{
                pmmod = ' ';
                diemod = commandArray[1];
                die = parseInt(diemod);
            }

            if(multiplier > 5000){
                return "too many dice to roll";
            }

            var rollContainer = [];
            for(i = 0; i < multiplier; i++){
                rollContainer.push(Math.floor((Math.random() * die)+1));
            }

            var sum = rollContainer.reduce((a,b)=> a + b, 0);
            var totalSum;
            switch(pmmod){
                case '+':
                    totalSum = sum + mod;
                    return `${rollContainer} + ${mod} = ${totalSum}`;
                break;
                case '-':
                    totalSum = sum - mod;
                    return `${rollContainer} - ${mod} = ${totalSum}`;
                break;
                case ' ':
                    return `${rollContainer} = ${sum}`;
                break;
            }

    }
    else
    {
        return "error in roll";
    }
}

http.listen(9999, () => console.log(`listening on port 9999`));