function getUserInfo(){
    userNameLocal = prompt(`Please enter your user name: `);
    characterSheetLocal = prompt(`Enter your character sheet URL from D&D Beyond: `);
    $('#userNameInput').val(userNameLocal);
    $('#sheetURLInput').val(characterSheetLocal);

    var socket = io();
    socket.emit('addUser' , userNameLocal);

    $('#drawerEnterDetails').click(()=>{
        userNameLocal = $('#userNameInput').val();
        characterSheetLocal = $('#sheetURLInput').val();
        runGCS();
    });
}