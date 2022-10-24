const WIDTH = 16;
const HEIGHT = 16;
const BACKGROUND_COLOR = 'white';
const SNAKE_COLOR = 'black';
const FRUIT_COLOR = 'red';
const APPEND_SPEED_EVERY = 5;

const TOP = 0;
const RIGHT = 1;
const BOTTOM = 2;
const LEFT = 3;

document.head ??= document.getElementsByTagName('head')[0];

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

const setFavicon = (canvas) => {
    const src = canvas.toDataURL();
    const link = document.createElement('link');
    const oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
};

const setTitle = (titleStr) => {
    document.title = titleStr;
};

let gameSpeed = 1;

let score = 0;

let fruitX = 0;
let fruitY = 0;

const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;

const ctx = canvas.getContext('2d');

let headX = 0;
let headY = HEIGHT / 2;

let dir = TOP;
let bodyParts = [];

let dirWasChanded = false;

const trueMod = (a, b) => ((a % b) + b) % b;

const respawnFruit = () => {
    const posToSpawn = [];
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            if (x === headX && y === headY) {
                continue;
            }
            if (bodyParts.some((part) => part.x === x && part.y === y)) {
                continue;
            }
            posToSpawn.push({ x, y });
        }
    }
    const pos = posToSpawn[Math.floor(Math.random() * posToSpawn.length)];
    fruitX = pos.x;
    fruitY = pos.y;
};

respawnFruit();

const changeDir = (newDir) => {
    if (dirWasChanded) {
        return;
    }
    if (dir === newDir) {
        return;
    }
    if (dir === TOP && newDir === BOTTOM) {
        return;
    }
    if (dir === RIGHT && newDir === LEFT) {
        return;
    }
    if (dir === BOTTOM && newDir === TOP) {
        return;
    }
    if (dir === LEFT && newDir === RIGHT) {
        return;
    }
    dirWasChanded = true;
    dir = newDir;
}

const handleKey = (e) => {
    switch (e.keyCode) {
        case 38:
        case 87:
            changeDir(TOP);
            break;
        case 68:
        case 39:
            changeDir(RIGHT);
            break;
        case 83:
        case 40:
            changeDir(BOTTOM);
            break;
        case 65:
        case 37:
            changeDir(LEFT);
            break;
    }
};

document.addEventListener('keydown', handleKey);

const restart = () => {
    headX = 0;
    headY = HEIGHT / 2;
    dir = TOP;
    bodyParts = [];
    gameSpeed = 5;
    score = 0;
    respawnFruit();
};

restart();

const handleFrame = async () => {
    dirWasChanded = false;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = SNAKE_COLOR;
    ctx.fillRect(headX, headY, 1, 1);

    let fruitEated = false;
    if (headX === fruitX && headY === fruitY) {
        respawnFruit();
        fruitEated = true;
        ++score;

        if (score % APPEND_SPEED_EVERY === 0) {
            ++gameSpeed;
        }
        setTitle(`${score} 🍎`);
    }

    bodyParts.forEach((part) => {
        ctx.fillRect(part.x, part.y, 1, 1);
    });

    ctx.fillStyle = FRUIT_COLOR;
    ctx.fillRect(fruitX, fruitY, 1, 1);

    bodyParts.push({ x: headX, y: headY });

    if (!fruitEated) {
        bodyParts.splice(0, 1);
    }

    if (dir === TOP) {
        headY -= 1;
    } else if (dir === RIGHT) {
        headX += 1;
    } else if (dir === BOTTOM) {
        headY += 1;
    } else if (dir === LEFT) {
        headX -= 1;
    }

    headX = trueMod(headX, WIDTH);
    headY = trueMod(headY, HEIGHT);

    if (bodyParts.some((part) => part.x === headX && part.y === headY)) {
        setTitle(`💀: ${score} 🍎`);
        restart();
    }

    setFavicon(canvas);

    await sleep(1 / gameSpeed);

    requestAnimationFrame(() => handleFrame());
};

handleFrame();
