'use strict';

let $ = query => document.querySelector(query);
let randint = (min, max) => Math.floor(Math.random() * (max - min + 1) - min);

let canvas = $('#snakecanvas');
canvas.height = 720;
canvas.width = 720;
let context = canvas.getContext('2d');

const config = {
  HEIGHT: 40,
  WIDTH: 40,
  MAX_DOTS: 1,
};

const opposite = {
  'up': 'down',
  'down': 'up',
  'left': 'right',
  'right': 'left'
};

let state = {
  isRunning: false,
  pieces: [],
  dots: [],
  previousDirection: 'up',
  moveNext: 'up',
};

function getSquareCoords(x, y) {
  return { px: x * 11, py: y * 11 };
}

function fillSquare(x, y, style) {
  let _style = context.fillStyle;
  context.fillStyle = style || 'green';
  let { px, py } = getSquareCoords(x, y);
  context.fillRect( px, py, 10, 10 );
  context.fillStyle = _style;
}

function pushDot(x, y) {
  if(state.dots.length >= config.MAX_DOTS) {
    state.dots = [...state.dots.slice(1), { x: x, y: y }];
  } else {
    state.dots = [...state.dots, { x: x, y: y }];
  }
}

function changeDirection(direction) {
  if (state.moveNext !== opposite[direction]) {
    state.moveNext = direction;
  }
}

function collision(piece) {
  for (let i = 0; i < state.pieces.length; ++i) {
  if (state.pieces[i].x === piece.x && state.pieces[i].y === piece.y) {
    console.log(piece, state.pieces[i])
      return true;
    }
  }
  return false;
}

function grow(piece) {
  for (let i = 0; i < state.dots.length; ++i) {
    if (state.dots[i].x === piece.x && state.dots[i].y === piece.y) {
      console.log(piece, state.dots[i])
        return true;
      }
    }
    return false;  
}

function renderState() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for(let i = 0; i < state.pieces.length; ++i) {
    let alpha = .5/(i+1) + .5;
    fillSquare(state.pieces[i].x, state.pieces[i].y, `rgb(0,0,1,${alpha}`);
  }  

  for(let i = 0; i < state.dots.length; ++i) {
    fillSquare(state.dots[i].x, state.dots[i].y);
  }  
}  

function advance() {
  let piece = {};
  let switchTo;
  let isMoveValid = opposite[state.previousDirection] !== state.moveNext;

  if(isMoveValid) {
    state.previousDirection = state.moveNext;
    switchTo = state.moveNext;
  } else {
    switchTo = state.previousDirection
  }
  
  switch(switchTo) {
    case 'up':    piece.x = state.pieces[0].x; piece.y = state.pieces[0].y - 1; break;
    case 'down':  piece.x = state.pieces[0].x; piece.y = state.pieces[0].y + 1; break;
    case 'left':  piece.x = state.pieces[0].x - 1; piece.y = state.pieces[0].y; break;
    case 'right': piece.x = state.pieces[0].x + 1; piece.y = state.pieces[0].y; break;
  }

  if(collision(piece)) {
    console.log('collision');
    stop();
  }

  if(grow(piece)) {
    console.log('nomnomnom');
    // leave tail piece and add new dot
    pushDot( randint(0, config.WIDTH), randint(0, config.HEIGHT) );
  } else {
    // remove rail piece
    state.pieces.pop();
  }

  state.pieces.unshift(piece);
}

function stop() {
  state.isRunning = false;
}

function mainLoop() {

  let interval;

  window.addEventListener('keydown', event => {
    switch( event.key ) {
      case 'ArrowUp':    changeDirection('up');    break;
      case 'ArrowDown':  changeDirection('down');  break;
      case 'ArrowLeft':  changeDirection('left');  break;
      case 'ArrowRight': changeDirection('right'); break;
    }
  });

  for( let i = 0; i < 9; ++i) {
    state.pieces.push({x: 20, y: 20+i})
  }
  pushDot( randint(0, config.WIDTH), randint(0, config.HEIGHT) );

  interval = setInterval(advance, 100);

  function loop(time) {
    if (state.isRunning) {
      renderState(state);
      requestAnimationFrame(loop);
    } else {
      clearInterval(interval);
      return;
    }
  }

  requestAnimationFrame(loop);
}


state.isRunning = true;
mainLoop();