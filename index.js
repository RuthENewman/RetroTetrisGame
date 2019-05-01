const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20,20);

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.position];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x){
      if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
      }
    }
  }
  return false;
}

function createMatrix(width, height) {
  const matrix = [];
  while (height--) {
    matrix.push(new Array(width).fill(0));
  }
  return matrix;
}

function createPiece(letter) {
  switch (letter) {
    case 'T':
      return [
      [0,0,0],
      [3,3,3],
      [0,3,0],
    ];
    case 'O':
      return [
        [4, 4],
        [4, 4],
      ];
    case 'L':
      return [
        [0,5,0],
        [0,5,0],
        [0,5,5],
      ];
    case 'J':
      return [
        [0,7,0],
        [0,7,0],
        [7,7,0],
      ];
    case 'I':
      return [
        [0,6,0,0],
        [0,6,0,0],
        [0,6,0,0],
        [0,6,0,0],
      ];
    case 'S':
      return [
        [0,2,2],
        [2,2,0],
        [0,0,0],
      ];
      case 'Z':
        return [
          [1,1,0],
          [0,1,1],
          [0,0,0],
        ];
  }
}

function draw() {
  context.fillStyle = 'black';
  context.fillRect(0,0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.position);
}

const colours = [
  ['red'],
  ['green'],
  ['yellow'],
  ['blue'],
  ['purple'],
  ['aqua'],
  ['orange']
];

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colours[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    })
  })
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.position.y][x + player.position.x] = value;
      }
    })
  })
}

function playerDrop() {
  player.position.y++;
  if (collide(arena, player)) {
    player.position.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerReset() {
  const pieces = "ZSTOLIJ";
  player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
  player.position.y = 0;
  player.position.x = (Math.floor(arena[0].length / 2)) - (Math.floor(player.matrix[0].length / 2))
  if(collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerMove(direction) {
  player.position.x += direction;
  if (collide(arena, player)) {
    player.position.x -= direction;
  }
}

function playerRotate() {
  const position = player.position.x;
  let offset = 1;
  rotate(player.matrix);
  while(collide(arena, player)) {
    player.position.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix);
      player.position.x = position;
      return;
    }
  }
}

function rotate(matrix) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] =  [
        matrix[y][x],
        matrix[x][y],
      ];
    }
      matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function updateScore(time = 0) {
  document.querySelector('.score').innerText = player.score;
}

const arena = createMatrix(12,20);


const player = {
  position: {x: 0, y: 0},
  matrix: null,
  score: 0,
}

document.addEventListener('keydown', event => {
  switch (event.keyCode) {
    case 37:
      playerMove(-1);
      break;
    case 39:
      playerMove(+1);
      break;
    case 40:
      playerDrop();
      break;
    case 38:
      playerRotate();
      break;
  }
})

playerReset();
updateScore();

update();
