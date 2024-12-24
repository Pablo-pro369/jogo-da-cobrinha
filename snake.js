document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('gameOverButton').addEventListener('click', restartGame);

let eatSound = new Audio('audio/comer.mp3');
let gameOverSound = new Audio('audio/gameover.mp3');
let startSound = new Audio('audio/Vai.mp3');

let gameInterval, timerInterval, triangleInterval;
let score = 0;
let timer = 0;
let fruitSpawnInterval = 10000; // Intervalo de 10 segundos para adicionar frutas roxas
let maxPurpleFruits = 10;
let purpleFruitsCount = 0;
let multiplyingPhase = false;
let triangleColorIndex = 0;
let triangleVisible = false;
let trianglePosition = { x: 0, y: 0 };
const triangleColors = ["red", "blue", "purple", "black"];
let snakeColor = "black";

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const box = 32;

let snake = [];
let food;
let purpleFood = [];
let direction;

function startGame() {
    resetGameVariables();

    startSound.play();
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('gameOverButton').style.display = 'none';

    gameInterval = setInterval(draw, 100);
    timerInterval = setInterval(updateTimer, 1000);
    setTimeout(spawnPurpleFruit, fruitSpawnInterval);
    setTimeout(showTriangle, 60000);
}

function resetGameVariables() {
    score = 0;
    timer = 0;
    purpleFruitsCount = 0;
    multiplyingPhase = false;
    triangleColorIndex = 0;
    triangleVisible = false;
    direction = null;
    snakeColor = "black";
    updateScore();

    snake = [{ x: 9 * box, y: 10 * box }];
    food = {
        x: Math.floor(Math.random() * 17 + 1) * box,
        y: Math.floor(Math.random() * 15 + 3) * box
    };
    purpleFood = [];

    context.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    context.fillStyle = "lightgreen";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        context.fillStyle = snakeColor;
        context.fillRect(snake[i].x, snake[i].y, box, box);
        context.strokeStyle = "darkgreen";
        context.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    context.beginPath();
    context.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
    context.fillStyle = "red";
    context.fill();
    context.strokeStyle = "darkred";
    context.stroke();
    context.closePath();

    for (let i = 0; i < purpleFood.length; i++) {
        context.beginPath();
        context.arc(purpleFood[i].x + box / 2, purpleFood[i].y + box / 2, box / 2, 0, Math.PI * 2);
        context.fillStyle = "purple";
        context.fill();
        context.strokeStyle = "darkpurple";
        context.stroke();
        context.closePath();
    }

    if (triangleVisible) {
        drawTriangle(trianglePosition.x, trianglePosition.y, triangleColors[triangleColorIndex]);
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        food = {
            x: Math.floor(Math.random() * 17 + 1) * box,
            y: Math.floor(Math.random() * 15 + 3) * box
        };
        score++;
        updateScore();
        eatSound.play();
    } else {
        snake.pop();
    }

    for (let i = 0; i < purpleFood.length; i++) {
        if (snakeX === purpleFood[i].x && snakeY === purpleFood[i].y) {
            purpleFood.splice(i, 1);
            score--;
            updateScore();
            if (snake.length > 1) {
                snake.pop(); // Remove o último bloco da cobra
            }
        }
    }

    if (triangleVisible && collisionWithTriangle(snakeX, snakeY)) {
        snakeColor = triangleColors[triangleColorIndex];
        triangleVisible = false;
        triangleColorIndex = (triangleColorIndex + 1) % triangleColors.length;
    }

    let newHead = { x: snakeX, y: snakeY };
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        clearTimeout(triangleInterval);
        document.getElementById('gameOverButton').style.display = 'block';
        gameOverSound.play();
    }

    snake.unshift(newHead);
}

function updateTimer() {
    timer++;
    updateScore();
}

function spawnPurpleFruit() {
    if (multiplyingPhase) {
        if (purpleFood.length < 20) {
            let missingFruits = 20 - purpleFood.length;
            for (let i = 0; i < missingFruits; i++) {
                purpleFood.push({
                    x: Math.floor(Math.random() * 17 + 1) * box,
                    y: Math.floor(Math.random() * 15 + 3) * box
                });
            }
        }

        setTimeout(() => {
            purpleFood = [];
            purpleFruitsCount = 0;
            multiplyingPhase = false;
            setTimeout(spawnPurpleFruit, fruitSpawnInterval);
        }, 60000);

    } else {
        if (purpleFruitsCount < maxPurpleFruits) {
            purpleFood.push({
                x: Math.floor(Math.random() * 17 + 1) * box,
                y: Math.floor(Math.random() * 15 + 3) * box
            });
            purpleFruitsCount++;
            setTimeout(spawnPurpleFruit, fruitSpawnInterval);
        } else {
            multiplyingPhase = true;
            setTimeout(spawnPurpleFruit, 60000);
        }
    }
}

function showTriangle() {
    trianglePosition = {
        x: Math.floor(Math.random() * 17 + 1) * box,
        y: Math.floor(Math.random() * 15 + 3) * box
    };
    triangleVisible = true;

    setTimeout(() => {
        triangleVisible = false;
        triangleInterval = setTimeout(showTriangle, 60000);
    }, 10000);
}

function drawTriangle(x, y, color) {
    context.beginPath();
    context.moveTo(x + box / 2, y);
    context.lineTo(x, y + box);
    context.lineTo(x + box, y + box);
    context.closePath();

    context.fillStyle = color;
    context.fill();
    context.strokeStyle = "dark" + color;
    context.stroke();
}

function collisionWithTriangle(snakeX, snakeY) {
    return snakeX >= trianglePosition.x && snakeX < trianglePosition.x + box &&
           snakeY >= trianglePosition.y && snakeY < trianglePosition.y + box;
}

function restartGame() {
    startSound.play();
    startGame();
}

function updateScore() {
    document.getElementById('scoreContainer').innerText = `Pontos: ${score} | Tempo: ${timer}s`;
}

function collision(newHead, array) {
    for (let i = 0; i < array.length; i++) {
        if (newHead.x === array[i].x && newHead.y === array[i].y) {
            return true;
        }
    }
    return false;
}

document.addEventListener("keydown", event => {
    if (event.keyCode === 37 && direction !== "RIGHT") direction = "LEFT";
    else if (event.keyCode === 38 && direction !== "DOWN") direction = "UP";
    else if (event.keyCode === 39 && direction !== "LEFT") direction = "RIGHT";
    else if (event.keyCode === 40 && direction !== "UP") direction = "DOWN";
});
