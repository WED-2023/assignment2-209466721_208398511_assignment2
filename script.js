const users = [
    { username: 'p', password: 'testuser' }
    
];

function loginUser(){
    const username = document.getElementById('user-name').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        showScreen('game');
    } else {
        alert('Invalid username or password');
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function(div) {
        div.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'flex';
}

function loginUser() {
    showScreen('game');
}


window.onload = function() {
    showScreen('welcome');
}

