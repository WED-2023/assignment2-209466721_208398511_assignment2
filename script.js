const users = [
    { username: 'p', password: 'testuser', email: 'testuser@gmaqil.com', firstName: 'testuser', lastName: 'testuser'},
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

function registerUser() {
    const username = document.querySelector('#register input[name="user-name"]').value.trim();
    const password = document.querySelector('#register input[name="psw"]').value;
    const repeatPassword = document.querySelector('#register input[name="psw-repeat"]').value;
    const email = document.querySelector('#register input[name="email"]').value.trim();
    const firstName = document.querySelector('#register input[name="name"]').value.trim();
    const lastName = document.querySelector('#register input[name="Lastname"]').value.trim();
    const year = document.querySelector('#register select[name="dob-year"]').value;
    const month = document.querySelector('#register select[name="dob-month"]').value;
    const day = document.querySelector('#register select[name="dob-day"]').value;
    
    if (!year || !month || !day) {
        alert("Please select your full date of birth.");
        return false;
    }
    if (!username || !password || !repeatPassword || !email || !firstName || !lastName) {
        alert("Please fill in all fields.");
        return false;
    }

    const pwValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
    if (!pwValid) {
        alert("Password must be at least 8 characters and include both letters and numbers.");
        return false;
    }

    const nameValid = /^[A-Za-z]+$/.test(firstName);
    const lastNameValid = /^[A-Za-z]+$/.test(lastName);
    if (!nameValid) {
        alert("First name must contain only letters.");
        return false;
    }
    if (!lastNameValid) {
        alert("Last name must contain only letters.");
        return false;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
        alert("Please enter a valid email address.");
        return false;
    }

    if (password !== repeatPassword) {
        alert("Passwords do not match.");
        return false;
    }

    if (users.some(u => u.username === username)) {
        alert("Username already exists.");
        return false;
    }

    users.push({ username, password, email, firstName, lastName,birthYear: year, birthMonth: month, birthDay: day });
    alert("Registration successful!");
    showScreen('login');
    return false;
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

