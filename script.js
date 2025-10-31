function showContent(num) {
    // Hide main menu
    document.getElementById('mainMenu').style.display = 'none';
    
    // Hide all content sections
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected content
    document.getElementById('content' + num).classList.add('active');
}

function backToMenu() {
    // Hide all content sections
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show main menu
    document.getElementById('mainMenu').style.display = 'grid';
}
