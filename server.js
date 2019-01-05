const Nightmare = require('nightmare');
const https = require('https');
const express = require('express');
const app = express();
const fs = require('fs');
var options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};
var serverPort = 9999;
var server = https.createServer(options,app);
//const http = require('http').Server(app);
const bodyParser = require('body-parser');
const auth = require('express-basic-auth');
//const io = require('socket.io')(http);
var io = require('socket.io')(server);


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
    const selector = ".ct-subsection--primary-box";
    const nightmare = Nightmare({show:false}); //set show false to disable popup

    var body;
    var actions;
    var spells;
    var equipment;
    var features;
    var creatures;

    console.log(`x: ${req.query.w.x}, y: ${req.query.w.y}`);
    console.log(`getting character sheet request`);
    nightmare.goto(req.query.url)
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
    var userName;
    var addedUser = false;
    
    //whiteboard socket
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data)); //register connection to the drawing event
    
    //rolls and chat socket
    socket.on('chat',(data)=>{ //handle rolls
        console.log(data.u);
        socket.username = data.u;
        if(data.c.indexOf('/r') >= 0 && data.c.indexOf('/r') <= 0 ){
            var command = data.c.substring(3);
            var result = rollDice(command);
            //socket.broadcast.emit('chatRx',{r:result,u:socket.username});
            io.emit('chatRx',{r:result,u:socket.username}); //needs to be changed when we have room instances
        }
        else
        {
            //socket.broadcast.emit('chatRx',{r:data.c,u:socket.username});
            io.emit('chatRx',{r:data.c,u:socket.username}); //needs to be changed when we have room instances
        }
    });
    
    //webcam streaming
    socket.on('stream', (frame) => {
        socket.broadcast.emit('stream',{img:frame.img,user:frame.user});
    });

    
    socket.on('addUser',(username) => {
        console.log(username);
        //if(addedUser) return;

        socket.username = username;
        userName = username;
        addedUser = true;
        console.log(socket.username);
    });

    socket.on('disconnect', () =>{
        socket.broadcast.emit('userLeft',{user:socket.username});
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

            if(multiplier > 15000){
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

//http.listen(9999, () => console.log(`listening on port 9999`));
server.listen(serverPort, () => {
    console.log(`https server on ${serverPort}`);
})