let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');
const startDiv = document.querySelector('.startDiv');
const startButton = startDiv.querySelector('.start');
const scoreElement = document.querySelector('.score p');
const livesElement = document.querySelectorAll('.lives li');

let playerX = 1;
let playerY = 1;
let score = 0;
let lives = 3;
let gameInterval;
let enemyInterval;
let resetting;

// Player = 2, Wall = 1, Enemy = 3, Point = 0
let maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 1, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 3, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let enemies = [
    { x: 8, y: 1, prev: 0 },
    { x: 5, y: 6, prev: 0 },
    { x: 1, y: 8, prev: 0 }
];

// Populates the maze in the HTML
function populateMaze() {
    main.innerHTML = ''; // Clear previous maze
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            let block = document.createElement('div');
            block.classList.add('block');

            switch (maze[y][x]) {
                case 1:
                    block.classList.add('wall');
                    break;
                case 2:
                    block.id = 'player';
                    let mouth = document.createElement('div');
                    mouth.classList.add('mouth');
                    block.appendChild(mouth);
                    break;
                case 3:
                    block.classList.add('enemy');
                    break;
                case 0:
                    block.classList.add('point');
                    block.style.height = '1vh';
                    block.style.width = '1vh';
                    break
                default:
                    block.style.height = '1vh';
                    block.style.width = '1vh';
            }

            main.appendChild(block);
        }
    }
}

// Player movement and grid-based collision detection
function movePlayer() {
    if (resetting){
        console.log('resetting');
        return;
    }
    let newX = playerX;
    let newY = playerY;


    if (upPressed) newY--;
    else if (downPressed) newY++;
    else if (leftPressed) newX--;
    else if (rightPressed) newX++;

    // Collision detection and movement
    if (maze[newY][newX] !== 1) {
        if (maze[newY][newX] === 3) {
            loseLife();
            return;
        } else if (maze[newY][newX] === 0) {
            score += 10;
            scoreElement.textContent = score;
        }
        // Update maze and player position
        maze[playerY][playerX] = -1; // Remove dot from old position
        maze[newY][newX] = 2;
        playerX = newX;
        playerY = newY;
        populateMaze();
        updatePlayerMouthDirection();
    }
}

// Update the player's mouth direction based on movement
function updatePlayerMouthDirection() {
    const player = document.querySelector('#player');
    const playerMouth = player.querySelector('.mouth');

    if (downPressed) {
        playerMouth.classList = 'down';
    } else if (upPressed) {
        playerMouth.classList = 'up';
    } else if (leftPressed) {
        playerMouth.classList = 'left';
    } else if (rightPressed) {
        playerMouth.classList = 'right';
    }
}

// Manage player lives
function loseLife() {
    resetting = true;
    lives--;
    livesElement[lives].style.visibility = 'hidden';
    if (lives <= 0) {
        endGame('Game Over!');
    } else {
        resetPlayerPosition();
    }
}

// Reset player position after losing a life
function resetPlayerPosition() {
    maze[playerY][playerX] = -1;
    playerX = 1;
    playerY = 1;
    maze[playerY][playerX] = 2;
    populateMaze();
    setTimeout(()=>{resetting = false; console.log('resetting done');}, 500);
}

// Move enemies randomly
function moveEnemies() {
    
    if (resetting){
        return;
    }
    enemies.forEach(enemy => {
        let directions = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }   // Right
        ];

        let randomDirection = directions[Math.floor(Math.random() * directions.length)];
        let newX = enemy.x + randomDirection.x;
        let newY = enemy.y + randomDirection.y;

        if (maze[newY][newX] !== 1 && maze[newY][newX] !== 3) {
            maze[enemy.y][enemy.x] = enemy.prev; // Add previous state to old position
            enemy.prev = maze[newY][newX]===2?-1:maze[newY][newX];
            enemy.x = newX;
            enemy.y = newY;
            maze[enemy.y][enemy.x] = 3; // Place enemy in new position
        }

        // Check for collision with player
        if (newX === playerX && newY === playerY) {
            loseLife();
        }
    });

    populateMaze();
}

// Start the game when the start button is clicked
startButton.addEventListener('click', () => {
    startDiv.style.display = 'none';
    startGame();
});

// End the game
function endGame(message) {
    clearInterval(enemyInterval);
    alert(message);
    const playerName = prompt(`${message}\nPlease enter your name:`);
    if (playerName) {
        saveScore(playerName, score);
    }
    location.reload(); // Restart the game (could be improved)
}

// Save the score to localStorage
function saveScore(name, score) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: name, score: score });
    leaderboard.sort((a, b) => b.score - a.score); // Sort by highest score
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Display the leaderboard
function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const leaderboardElement = document.querySelector('.leaderboard ol');
    leaderboardElement.innerHTML = ''; // Clear current leaderboard

    leaderboard.slice(0, 6).forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.name}........${entry.score}`;
        leaderboardElement.appendChild(listItem);
    });
}

// Start the game loop
function startGame() {
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    enemyInterval = setInterval(moveEnemies, 500);
}


// Key event listeners for player movement
function keyUp(event) {
    if (event.key === 'ArrowUp') {
        upPressed = false;
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (event.key === 'ArrowRight') {
        rightPressed = false;
    }
    movePlayer()    
}

function keyDown(event) {
    if (event.key === 'ArrowUp') {
        upPressed = true;
    } else if (event.key === 'ArrowDown') {
        downPressed = true;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === 'ArrowRight') {
        rightPressed = true;
    }
    movePlayer()
}



// Button Events
let lbttn = document.querySelector("#lbttn")
let ubttn = document.querySelector("#ubttn")
let rbttn = document.querySelector("#rbttn")
let dbttn = document.querySelector("#dbttn")

lbttn.addEventListener('mousedown', () => { leftPressed = true; movePlayer()});
lbttn.addEventListener('mouseup', () => { leftPressed = false; });
lbttn.addEventListener('mouseleave', () => { leftPressed = false; }); // Handle case where mouse leaves the button

ubttn.addEventListener('mousedown', () => { upPressed = true; movePlayer()});
ubttn.addEventListener('mouseup', () => { upPressed = false; });
ubttn.addEventListener('mouseleave', () => { upPressed = false; }); // Handle case where mouse leaves the button

rbttn.addEventListener('mousedown', () => { rightPressed = true; movePlayer()});
rbttn.addEventListener('mouseup', () => { rightPressed = false; });
rbttn.addEventListener('mouseleave', () => { rightPressed = false; }); // Handle case where mouse leaves the button

dbttn.addEventListener('mousedown', () => { downPressed = true; movePlayer()});
dbttn.addEventListener('mouseup', () => { downPressed = false; });
dbttn.addEventListener('mouseleave', () => { downPressed = false; });

// Initialize the maze on load
populateMaze();
displayLeaderboard();
