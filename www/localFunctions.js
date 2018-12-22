function getCharSheet(login, charName, windowSize){
    $.get('/charSheet',{w:windowSize}, (data)=>{
        console.log(`requesting character sheet`);
        $('#charSheet').empty();
        $('#charSheet').append(data);
        console.log(data);
    })
}