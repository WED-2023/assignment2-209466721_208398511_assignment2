// User management and states
const users = [
  { username: 'p', password: 'testuser', email: 'testuser@gmaqil.com', firstName: 'testuser', lastName: 'testuser', scores: [] }
];
let currentUser = null;
let shootKey = " ";
let gameDuration = 120;
let playerColor = "#00aaff";
let enemyColor = "#ff9900";

// Simple modal
function showAboutModal() { document.getElementById('aboutModal').classList.add('active'); }
function hideAboutModal() { document.getElementById('aboutModal').classList.remove('active'); }
function closeAbout(e) { if (e.target.id === "aboutModal") hideAboutModal(); }
window.addEventListener('keydown', (e) => { if (e.key === "Escape") hideAboutModal(); });

// Screen switching
function showScreen(id, isModal = false) {
  document.querySelectorAll('.screen').forEach(d => d.classList.remove('active'));
  if (!isModal) document.getElementById(id).classList.add('active');
  else showAboutModal();
}
showScreen('welcome');

// DOB dropdowns
(function setupDOB() {
  let year = document.getElementById('reg-year');
  let month = document.getElementById('reg-month');
  let day = document.getElementById('reg-day');
  for (let y = 2010; y >= 1920; y--) year.innerHTML += `<option>${y}</option>`;
  for (let m = 1; m <= 12; m++) month.innerHTML += `<option>${m}</option>`;
  for (let d = 1; d <= 31; d++) day.innerHTML += `<option>${d}</option>`;
})();

// Shooting key selection
(function setupShootKeys() {
  let sk = document.getElementById('config-shootkey');
  sk.innerHTML = `<option value=" ">Space</option>`;
  for (let i = 65; i <= 90; i++) sk.innerHTML += `<option value="${String.fromCharCode(i)}">${String.fromCharCode(i)}</option>`;
})();

// Registration validation
document.getElementById('registerForm').onsubmit = function (e) {
  e.preventDefault();
  let username = reg('username'), password = reg('password'), confirm = reg('confirm'), first = reg('firstname'), last = reg('lastname'), email = reg('email');
  let year = reg('year'), month = reg('month'), day = reg('day');
  let err = "";
  if ([username, password, confirm, first, last, email, year, month, day].some(x => !x.value)) err = "Please fill all fields.";
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password.value)) err = "Password must have at least 8 letters & numbers.";
  if (password.value !== confirm.value) err = "Passwords do not match.";
  if (/\d/.test(first.value) || /\d/.test(last.value)) err = "Name cannot have digits.";
  if (!/\S+@\S+\.\S+/.test(email.value)) err = "Invalid email.";
  if (users.find(u => u.username === username.value)) err = "Username exists.";
  if (err) return regErr(err);
  users.push({
    username: username.value,
    password: password.value,
    firstName: first.value,
    lastName: last.value,
    email: email.value,
    dob: `${year.value}-${month.value}-${day.value}`,
    scores: []
  });
  regErr("Registration successful! Please login.", true);
  setTimeout(() => showScreen('login'), 600);
};
function reg(x) { return document.getElementById('reg-' + x); }
function regErr(t, ok) { let e = document.getElementById('register-error'); e.textContent = t; e.style.color = ok ? '#1fa3ff' : '#ff5555'; }

// Login validation
document.getElementById('loginForm').onsubmit = function (e) {
  e.preventDefault();
  let username = document.getElementById('login-username').value;
  let password = document.getElementById('login-password').value;
  let user = users.find(u => u.username === username && u.password === password);
  if (user) {
    if (currentUser !== username) {
      currentUser = username;
      users.find(u => u.username === username).scores = [];
    }
    showScreen('config');
    showHighscoreTable();
  } else {
    document.getElementById('login-error').textContent = 'Invalid username or password';
  }
};

// Config screen
function startGame() {
  shootKey = document.getElementById('config-shootkey').value;
  gameDuration = Math.max(120, parseInt(document.getElementById('config-duration').value) * 60);
  playerColor = document.getElementById('config-playerColor').value;
  enemyColor = document.getElementById('config-enemyColor').value;
  showScreen('game');
  startSpaceGame();
}
function newGame() {
  showScreen('game');
  startSpaceGame();
}

//Game Logic
let ctx, canvas, interval, timerInt, gameState;
function startSpaceGame() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  gameState = {
    player: { x: canvas.width / 2 - 25, y: canvas.height * 0.85, w: 50, h: 40, speed: 8, color: playerColor, cooldown: 0, lives: 3 },
    bullets: [],
    enemies: [],
    eBullets: [],
    score: 0,
    ticks: 0,
    enemySpeed: 1.8,
    dir: 1,
    accelSteps: 0,
    lost: false,
    won: false,
    gameTimer: gameDuration,
    running: true
  };
  spawnEnemies();
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('lives').textContent = 'Lives: 3';
  document.getElementById('timer').textContent = "Time: " + formatTime(gameState.gameTimer);
  playMusic();
  clearInterval(interval);
  interval = setInterval(gameTick, 1000 / 60);
  clearInterval(timerInt);
  timerInt = setInterval(timerTick, 1000);
}

function spawnEnemies() {
  gameState.enemies = [];
  let rows = 4, cols = 5, ew = 80, eh = 38, gapX = 20, gapY = 22, top = 48, left = 90;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    gameState.enemies.push({
      x: left + c * (ew + gapX), y: top + r * (eh + gapY),
      w: ew, h: eh,
      row: r, alive: true, color: enemyColor,
      points: [20, 15, 10, 5][r]
    });
}

function gameTick() {
  if (!gameState.running) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  moveEnemies();
  drawEnemies();
  movePlayer();
  drawPlayer();
  moveBullets();
  drawBullets();
  moveEBullets();
  drawEBullets();
  checkCollisions();
  drawHUD();
  checkEndGame();
  gameState.ticks++;
  if (gameState.ticks % (5 * 60) === 0 && gameState.accelSteps < 4) {
    gameState.enemySpeed += 0.9; gameState.accelSteps++;
  }
  if (gameState.enemies.filter(e => e.alive).length && gameState.ticks % 90 === 0) enemyShoot();
}

function movePlayer() {
  let p = gameState.player;
  let limitY = canvas.height * 0.6;
  if (keyState["ArrowLeft"] && p.x > 0) p.x -= p.speed;
  if (keyState["ArrowRight"] && p.x < canvas.width - p.w) p.x += p.speed;
  if (keyState["ArrowUp"] && p.y > limitY) p.y -= p.speed;
  if (keyState["ArrowDown"] && p.y < canvas.height - p.h) p.y += p.speed;
}

function drawPlayer() {
  let p = gameState.player;
  ctx.save();
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(p.x + p.w / 2, p.y);
  ctx.lineTo(p.x, p.y + p.h);
  ctx.lineTo(p.x + p.w, p.y + p.h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function moveEnemies() {
  let dir = gameState.dir, speed = gameState.enemySpeed, minX = Math.min(...gameState.enemies.filter(e => e.alive).map(e => e.x)), maxX = Math.max(...gameState.enemies.filter(e => e.alive).map(e => e.x + e.w));
  if ((dir === 1 && maxX + speed > canvas.width) || (dir === -1 && minX - speed < 0)) { gameState.dir *= -1; for (let e of gameState.enemies) e.y += 32; }
  for (let e of gameState.enemies) if (e.alive) e.x += speed * gameState.dir;
}

function drawEnemies() {
  for (let e of gameState.enemies) if (e.alive) {
    ctx.save();
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 19px Arial";
    ctx.fillText(e.points, e.x + e.w / 2 - 12, e.y + e.h / 2 + 7);
    ctx.restore();
  }
}

function moveBullets() {
  for (let b of gameState.bullets) b.y -= 12;
  gameState.bullets = gameState.bullets.filter(b => b.y > -20);
}
function drawBullets() {
  ctx.save();
  for (let b of gameState.bullets) {
    ctx.fillStyle = "#39ff14";
    ctx.fillRect(b.x, b.y, 7, 17);
  }
  ctx.restore();
}
function moveEBullets() {
  let spd = 8 + gameState.accelSteps * 2;
  for (let b of gameState.eBullets) b.y += spd;
  gameState.eBullets = gameState.eBullets.filter(b => b.y < canvas.height + 20);
}
function drawEBullets() {
  ctx.save();
  for (let b of gameState.eBullets) {
    ctx.fillStyle = "#ff3232";
    ctx.fillRect(b.x, b.y, 7, 17);
  }
  ctx.restore();
}

function enemyShoot() {
  let alive = gameState.enemies.filter(e => e.alive);
  if (!alive.length) return;
  let idx = Math.floor(Math.random() * alive.length);
  let e = alive[idx];
  if (gameState.eBullets.length && (gameState.eBullets.slice(-1)[0].y < canvas.height * 0.25)) return;
  gameState.eBullets.push({ x: e.x + e.w / 2 - 3, y: e.y + e.h });
}

function checkCollisions() {
  for (let b of gameState.bullets) for (let e of gameState.enemies) if (e.alive && b.x + 7 > e.x && b.x < e.x + e.w && b.y < e.y + e.h && b.y > e.y) {
    e.alive = false; gameState.score += e.points; playSound('hit'); document.getElementById('score').textContent = "Score: " + gameState.score;
    b.y = -999;
  }
  let p = gameState.player;
  for (let b of gameState.eBullets) if (b.x + 7 > p.x && b.x < p.x + p.w && b.y + 17 > p.y && b.y < p.y + p.h) {
    loseLife();
    b.y = canvas.height + 100;
  }
}

function drawHUD() {
  document.getElementById('score').textContent = "Score: " + gameState.score;
  document.getElementById('lives').textContent = "Lives: " + gameState.player.lives;
}

function timerTick() {
  if (!gameState.running) return;
  gameState.gameTimer--;
  document.getElementById('timer').textContent = "Time: " + formatTime(gameState.gameTimer);
  if (gameState.gameTimer <= 0) endGame('time');
}

function checkEndGame() {
  if (!gameState.enemies.filter(e => e.alive).length) endGame('champion');
  if (gameState.player.lives <= 0) endGame('lose');
}

function endGame(type) {
  gameState.running = false;
  clearInterval(interval); clearInterval(timerInt); pauseMusic();
  let title = '', msg = '';
  if (type === 'lose') { title = "You Lost!"; msg = `Final Score: ${gameState.score}`; playSound('lose'); }
  else if (type === 'time') {
    title = (gameState.score < 100) ? "You can do better!" : "Winner!";
    msg = `Final Score: ${gameState.score}`;
  } else { title = "Champion!"; msg = `Final Score: ${gameState.score}`; }
  let user = users.find(u => u.username === currentUser);
  user.scores.push(gameState.score);
  document.getElementById('endgame-title').textContent = title;
  document.getElementById('endgame-score').textContent = msg;
  showScreen('endgame');
  showHighscoreTable();
}

function showHighscoreTable() {
  let user = users.find(u => u.username === currentUser);
  let hs = document.getElementById('highscores');
  if (!user || !user.scores.length) { hs.innerHTML = "<p>No games played yet.</p>"; return; }
  let arr = user.scores.slice().sort((a, b) => b - a);
  hs.innerHTML = `<h3>Your High Scores</h3><table><tr><th>Place</th><th>Score</th></tr>` +
    arr.map((s, i) => `<tr${s === user.scores[user.scores.length - 1] ? ' style="font-weight:bold;background:#182;' : ''}"><td>${i + 1}</td><td>${s}</td></tr>`).join('') +
    `</table>`;
}

function loseLife() {
  gameState.player.lives--;
  playSound('lose');
  document.getElementById('lives').textContent = "Lives: " + gameState.player.lives;
  gameState.player.x = canvas.width / 2 - 25;
  gameState.player.y = canvas.height * 0.85;
  if (gameState.player.lives <= 0) endGame('lose');
}

function formatTime(sec) {
  let m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

// Keyboard control
let keyState = {};
window.addEventListener('keydown', (e) => {
  if (document.getElementById('game').classList.contains('active')) {
    keyState[e.key] = true;
    // Shooting
    if (e.key.toUpperCase() === shootKey.toUpperCase() && gameState.bullets.length < 4 && gameState.player.lives > 0) {
      gameState.bullets.push({ x: gameState.player.x + gameState.player.w / 2 - 3, y: gameState.player.y - 18 });
    }
  }
});
window.addEventListener('keyup', (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
    keyState[e.key] = false;
  }
});

// Sound/music
function playMusic() { let m = document.getElementById('bg-music'); m.currentTime = 0; m.play(); }
function pauseMusic() { document.getElementById('bg-music').pause(); }
function playSound(type) { document.getElementById(type === 'hit' ? 'snd-hit' : 'snd-lose').play(); }

// Reset for new user
function resetForNewUser() {
  currentUser = null;
  showScreen('welcome');
}
