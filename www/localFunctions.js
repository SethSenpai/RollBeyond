function getCharSheet(login, charName){
    $.get('/charSheet',{}, (data)=>{
        console.log(`requesting character sheet`);
        $('#charSheet').empty();
        $('#charSheet').append(data);
        console.log(data);
    })
}