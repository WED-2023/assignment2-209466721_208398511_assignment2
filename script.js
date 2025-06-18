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


const GAME_WIDTH = 600;
const GAME_HEIGHT = 800;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 48;
const ENEMY_WIDTH = 48;
const ENEMY_HEIGHT = 48;
const PLAYER_START_Y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
const MOVE_AREA_HEIGHT = GAME_HEIGHT * 0.4;

let player, enemies, enemyDirection, playerBullets, enemyBullets, score, lives, gameRunning, speedMultiplier, speedUps;

function initGame() {
  player = {
    x: Math.floor(Math.random() * (GAME_WIDTH - PLAYER_WIDTH)),
    y: PLAYER_START_Y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    canShoot: true
  };
  enemies = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      enemies.push({
        x: 60 + col * (ENEMY_WIDTH + 12),
        y: 40 + row * (ENEMY_HEIGHT + 24),
        row: row
      });
    }
  }
  enemyDirection = 1;
  playerBullets = [];
  enemyBullets = [];
  score = 0;
  lives = 3;
  speedMultiplier = 1;
  speedUps = 0;
  gameRunning = true;
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('lives').textContent = 'Lives: 3';
  drawGame();
  requestAnimationFrame(gameLoop);
  setTimeout(speedUpEnemies, 5000);
}

function drawGame() {
  const area = document.getElementById('gameArea');
  area.innerHTML = '';

  // Player
  let playerElem = document.createElement('div');
  playerElem.style.position = 'absolute';
  playerElem.style.left = player.x + 'px';
  playerElem.style.top = player.y + 'px';
  playerElem.style.width = player.width + 'px';
  playerElem.style.height = player.height + 'px';
  playerElem.style.background = 'url(spaceship.png) no-repeat center/contain, #0af';
  playerElem.style.borderRadius = '8px';
  playerElem.id = 'player';
  area.appendChild(playerElem);

  // Enemies
  for (const e of enemies) {
    let enemyElem = document.createElement('div');
    enemyElem.style.position = 'absolute';
    enemyElem.style.left = e.x + 'px';
    enemyElem.style.top = e.y + 'px';
    enemyElem.style.width = ENEMY_WIDTH + 'px';
    enemyElem.style.height = ENEMY_HEIGHT + 'px';
    enemyElem.style.background = 'url(enemy.png) no-repeat center/contain, #fa0';
    enemyElem.style.borderRadius = '10px';
    area.appendChild(enemyElem);
  }

  // Player Bullets
  for (const b of playerBullets) {
    let bullet = document.createElement('div');
    bullet.style.position = 'absolute';
    bullet.style.left = b.x + 'px';
    bullet.style.top = b.y + 'px';
    bullet.style.width = '6px';
    bullet.style.height = '16px';
    bullet.style.background = '#0ff';
    bullet.style.borderRadius = '2px';
    area.appendChild(bullet);
  }

  // Enemy Bullets
  for (const b of enemyBullets) {
    let bullet = document.createElement('div');
    bullet.style.position = 'absolute';
    bullet.style.left = b.x + 'px';
    bullet.style.top = b.y + 'px';
    bullet.style.width = '6px';
    bullet.style.height = '16px';
    bullet.style.background = '#ff3';
    bullet.style.borderRadius = '2px';
    area.appendChild(bullet);
  }
}

function gameLoop() {
  if (!gameRunning) return;

  // Move player bullets
  for (const b of playerBullets) b.y -= 12 * speedMultiplier;
  playerBullets = playerBullets.filter(b => b.y > 0);

  // Move enemy bullets
  for (const b of enemyBullets) b.y += 8 * speedMultiplier;
  enemyBullets = enemyBullets.filter(b => b.y < GAME_HEIGHT);

  // Move enemies left/right
  let minX = Math.min(...enemies.map(e => e.x));
  let maxX = Math.max(...enemies.map(e => e.x));
  let move = 2.5 * speedMultiplier;
  if (enemyDirection > 0 && maxX + ENEMY_WIDTH + move > GAME_WIDTH) enemyDirection = -1;
  if (enemyDirection < 0 && minX - move < 0) enemyDirection = 1;
  for (const e of enemies) e.x += enemyDirection * move;

  // Handle shooting 
  if (enemyBullets.length === 0 || (enemyBullets[0].y > (GAME_HEIGHT * 0.75))) {
    if (enemies.length > 0) {
      let shooter = enemies[Math.floor(Math.random() * enemies.length)];
      enemyBullets.push({x: shooter.x + ENEMY_WIDTH/2 - 3, y: shooter.y + ENEMY_HEIGHT, from: shooter});
    }
  }

  // Handle collisions
  for (const b of playerBullets) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      let e = enemies[i];
      if (b.x < e.x + ENEMY_WIDTH && b.x + 6 > e.x && b.y < e.y + ENEMY_HEIGHT && b.y + 16 > e.y) {
        // Score
        let row = e.row;
        let points = [20, 15, 10, 5][row];
        score += points;
        document.getElementById('score').textContent = 'Score: ' + score;
        enemies.splice(i, 1);
        b.y = -1000; 
        break;
      }
    }
  }


  for (const b of enemyBullets) {
    if (
      b.x < player.x + PLAYER_WIDTH &&
      b.x + 6 > player.x &&
      b.y < player.y + PLAYER_HEIGHT &&
      b.y + 16 > player.y
    ) {
      lives -= 1;
      document.getElementById('lives').textContent = 'Lives: ' + lives;
      player.x = Math.floor(Math.random() * (GAME_WIDTH - PLAYER_WIDTH));
      player.y = PLAYER_START_Y;
      enemyBullets = [];
      if (lives <= 0) {
        alert("Game Over! Final score: " + score);
        gameRunning = false;
        return;
      }
    }
  }

  // Win condition
  if (enemies.length === 0) {
    alert("You win! Final score: " + score);
    gameRunning = false;
    return;
  }

  drawGame();
  requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener('keydown', function(e) {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft") {
    player.x = Math.max(0, player.x - 16);
  }
  if (e.key === "ArrowRight") {
    player.x = Math.min(GAME_WIDTH - PLAYER_WIDTH, player.x + 16);
  }
  if (e.key === "ArrowUp") {
    let limitY = GAME_HEIGHT - MOVE_AREA_HEIGHT;
    player.y = Math.max(limitY, player.y - 16);
  }
  if (e.key === "ArrowDown") {
    player.y = Math.min(PLAYER_START_Y, player.y + 16);
  }
  if (e.key === " ") {
    // shoot
    if (player.canShoot && gameRunning) {
      playerBullets.push({x: player.x + PLAYER_WIDTH/2 - 3, y: player.y});
      player.canShoot = false;
      setTimeout(() => player.canShoot = true, 300);
    }
  }
  drawGame();
});

function speedUpEnemies() {
  if (speedUps < 4) {
    speedMultiplier += 0.5;
    speedUps += 1;
    setTimeout(speedUpEnemies, 5000);
  }
}


const oldShowScreen = showScreen;
showScreen = function(screenId) {
  oldShowScreen(screenId);
  if (screenId === 'game') {
    setTimeout(initGame, 100); // slight delay to ensure div is visible
  }
};
