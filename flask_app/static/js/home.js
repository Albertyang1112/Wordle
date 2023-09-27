document.getElementById('howToPlay').addEventListener('click', function() {
    document.getElementById('howToPlayPopup').classList.add('active');
    document.getElementById('closeInstructions').addEventListener('click', function(){
        document.getElementById('howToPlayPopup').classList.remove('active');
    })});