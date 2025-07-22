// Establish a factory function that can be invoked to create players
function createPlayer(name, token) {
  return {
    name,
    token,
    greet() {
      console.log(
        `Welcome, you're ${this.name} and your token is ${this.token}`
      );
    },
  };
}

// Create the gameboard
let gameboard = (function () {
  let rows = 3;
  let columns = 3;
  let board = [];

  for (let i = 0; i < rows; i++) {
    let row = [];
    console.log(`row #${i + 1} created`);
    for (let j = 0; j < columns; j++) {
      row.push(0);
      console.log(`${i + 1}.${j + 1} cell pushed`);
    }
    board.push(row);
  }

  function placeMark(row, column, token) {
    gameboard.board[row][column] = token;
  }

  return {
    rows,
    columns,
    board,
    placeMark,
  };
})();

// Dictate how the game is played
let gamestate = (function () {
  // Create players and a way to fetch them
  let player1 = createPlayer('player one', 1);
  let player2 = createPlayer('player two', 2);

  function getPlayers() {
    return {
      playerOne: player1,
      playerTwo: player2,
    };
  }

  // Roll for starting player, and save winner in startingPlayer variable
  function playerStart(player1, player2) {
    return Math.random() < 0.5 ? player1 : player2;
  }

  let startingPlayer = playerStart(player1, player2);

  // Set playerTurn to starting player, create a function that changes the turn as well as a way to fetch whose turn it is
  let playerTurn = startingPlayer;

  function changeTurn() {
    if (playerTurn === player1) {
      playerTurn = player2;
    } else {
      playerTurn = player1;
    }
  }

  function getPlayerTurn() {
    if (playerTurn === player2) {
      return player2;
    } else if (playerTurn === player1) {
      return player1;
    }
  }

  // Find out if a player has won - their token either fills a row, a column or one of the diagonals
  function checkForWin() {
    let winner = null;
    const board = gameboard.board;

    // Check rows
    for (let i = 0; i < gameboard.rows; i++) {
      if (
        board[i][0] === player1.token &&
        board[i][1] === player1.token &&
        board[i][2] === player1.token
      ) {
        winner = player1;
        return winner;
      } else if (
        board[i][0] === player2.token &&
        board[i][1] === player2.token &&
        board[i][2] === player2.token
      ) {
        winner = player2;
        return winner;
      }
    }
    // Check columns
    for (let j = 0; j < gameboard.columns; j++) {
      if (
        board[0][j] === player1.token &&
        board[1][j] === player1.token &&
        board[2][j] === player1.token
      ) {
        winner = player1;
        return winner;
      } else if (
        board[0][j] === player2.token &&
        board[1][j] === player2.token &&
        board[2][j] === player2.token
      ) {
        winner = player2;
        return winner;
      }
    }
    // Check diagonals (top left to bottom right and top right to bottom left)
    if (
      board[0][0] === player1.token &&
      board[1][1] === player1.token &&
      board[2][2] === player1.token
    ) {
      winner = player1;
      return winner;
    } else if (
      board[0][0] === player2.token &&
      board[1][1] === player2.token &&
      board[2][2] === player2.token
    ) {
      winner = player2;
      return winner;
    }

    if (
      board[0][2] === player1.token &&
      board[1][1] === player1.token &&
      board[2][0] === player1.token
    ) {
      winner = player1;
      return winner;
    } else if (
      board[0][2] === player2.token &&
      board[1][1] === player2.token &&
      board[2][0] === player2.token
    ) {
      winner = player2;
      return winner;
    }

    // Check for tie
    let isBoardFull = true;
    tieLoop: for (let i = 0; i < gameboard.rows; i++) {
      for (let j = 0; j < gameboard.columns; j++) {
        if (board[i][j] === 0) {
          isBoardFull = false;
          break tieLoop;
        }
      }
    }

    // If winner has not been found yet, and board is full, then game is declared a tie
    if (isBoardFull === true) {
      winner = 'Tie';
    }
    return winner;
  }

  // Make sure gamestate exposes needed variables and functions
  return {
    startingPlayer,
    getPlayers,
    changeTurn,
    getPlayerTurn,
    checkForWin,
  };
})();

let displayController = (function () {
  function renderBoard() {
    let gameBoard = document.getElementById('game-board');
    for (let i = 0; i < gameboard.rows; i++) {
      for (let j = 0; j < gameboard.columns; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = i;
        cell.dataset.column = j;
        cell.dataset.token = '';
        cell.textContent = '';
        gameBoard.appendChild(cell);
        cell.addEventListener('click', handleClick);
      }
    }
    gameBoard.classList.add('game-board');
  }

  function updateCell(row, col, token) {}

  function displayMessage(message) {
    const messageDisplay = document.getElementById('message');
    messageDisplay.textContent = message;
  }

  // Place mark when square is clicked, place current players token in the row/column of the clicked square, then change turn and checkForWin.
  function handleClick(e) {
    const currentToken = gamestate.getPlayerTurn().token;
    const row = parseInt(e.target.dataset.row);
    const column = parseInt(e.target.dataset.column);

    if (gameboard.board[row][column] == 0) {
      e.target.dataset.token = currentToken;

      gameboard.placeMark(
        e.target.dataset.row,
        e.target.dataset.column,
        currentToken
      );

      gamestate.changeTurn();

      const winner = gamestate.checkForWin();

      if (winner == null) {
        displayController.displayMessage(
          `${gamestate.getPlayerTurn().name}'s turn`
        );
      } else if (winner == 'Tie') {
        displayController.displayMessage('you tied it up!');
      } else {
        displayController.displayMessage(`${winner.name} wins!`);
      }
    }
  }

  return {
    renderBoard,
    updateCell,
    displayMessage,
    handleClick,
  };
})();

// Let the startBtn render the board and show the current player's turn
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-game');
const startMsg = document.getElementById('start-message');

startBtn.addEventListener('click', function () {
  startBtn.remove();
  startMsg.remove();

  const continueBtn = document.createElement('div');
  gameContainer.appendChild(continueBtn);
  continueBtn.textContent = 'continue';
  continueBtn.classList.add('button');
  continueBtn.setAttribute('id', 'continue-button');

  continueBtn.addEventListener('click', function () {
    displayController.renderBoard();
    continueBtn.remove();
    displayController.displayMessage(`${gamestate.startingPlayer.name}'s turn`);
  });
});

// Log the starting player
console.log(gamestate.startingPlayer);
