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
  let player1 = createPlayer('player one', 1);
  let player2 = createPlayer('player two', 2);

  function getPlayers() {
    return {
      playerOne: player1,
      playerTwo: player2,
    };
  }

  function setPlayerNames(name1, name2) {
    player1.name = name1;
    player2.name = name2;
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

  // Get token of current player, place token on internal gamestate, checkForWin, if game isn't over changeTurns
  function playRound(row, column) {
    const currentToken = getPlayerTurn().token;
    gameboard.placeMark(row, column, currentToken);

    const gameResult = checkForWin();

    if (gameResult === null) {
      changeTurn();
    }

    return gameResult;
  }

  // Track the score
  let scores = { player1: 0, player2: 0 };

  function updateScores(outcome) {
    if (outcome !== 'Tie' && outcome !== null) {
      if (outcome.token === 1) {
        scores.player1++;
      } else if (outcome.token === 2) {
        scores.player2++;
      }
    }
  }

  // Make sure gamestate exposes needed variables and functions
  return {
    startingPlayer,
    getPlayers,
    setPlayerNames,
    changeTurn,
    getPlayerTurn,
    checkForWin,
    playRound,
    scores,
    updateScores,
  };
})();

// Show the board in the UI when the game is started
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

  function displayMessage(message) {
    const messageDisplay = document.getElementById('message');
    messageDisplay.textContent = message;
  }

  // Read coordinates, check if cell is empty in order to run playRound logic (getToken of player whose turn it is, place it in internal gamestate and checkForWin), then update UI/DOM with token ID on html element of targeted cell which CSS renders to icon. Display message based on outcome.
  function handleClick(e) {
    const row = parseInt(e.target.dataset.row);
    const column = parseInt(e.target.dataset.column);

    if (gameboard.board[row][column] == 0) {
      //
      const outcome = gamestate.playRound(row, column);

      e.target.dataset.token = gameboard.board[row][column];

      if (outcome == null) {
        displayController.displayMessage(
          `${gamestate.getPlayerTurn().name}'s turn`
        );
      } else if (outcome == 'Tie') {
        displayController.displayMessage('you tied it up!');
      } else {
        displayController.displayMessage(`${outcome.name} wins!`);
      }
      displayController.handleGameEnd(outcome);
    }
  }

  function handleGameEnd(outcome) {
    // This function will stop interaction, update scores, and show the restart button.

    // Lav DOM element til at vise score
    // Når en spiller vinder eller game er tied skal boardet fjernes fra DOM
    // Når boardet er fjernet skal en Go next-knap implementeres
    // Den GO next-knap skal fjernes når spil er i gang
    gamestate.updateScores(outcome); // <-- Call the function you just created!
    // Next steps go here...
  }

  return {
    renderBoard,
    displayMessage,
    handleClick,
    handleGameEnd,
  };
})();

// When game is started, remove start btn and msg, and show inputs for player names - then render board after continue is pressed
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-game');
const startMsg = document.getElementById('start-message');

startBtn.addEventListener('click', function () {
  startBtn.remove();
  startMsg.remove();

  const nameContainer = document.createElement('div');
  gameContainer.appendChild(nameContainer);
  nameContainer.classList.add('name-container');

  const inputContainerOne = document.createElement('div');
  nameContainer.appendChild(inputContainerOne);
  inputContainerOne.classList.add('input-container');

  const getNameOneLabel = document.createElement('label');
  inputContainerOne.appendChild(getNameOneLabel);
  getNameOneLabel.classList.add('input-label');
  getNameOneLabel.setAttribute('for', 'name-one');
  getNameOneLabel.textContent = 'Player one name';

  const getNameOne = document.createElement('input');
  inputContainerOne.appendChild(getNameOne);
  getNameOne.classList.add('input-field');
  getNameOne.setAttribute('type', 'text');
  getNameOne.setAttribute('name', 'name-one');
  getNameOne.setAttribute('id', 'name-one');

  const inputContainerTwo = document.createElement('div');
  nameContainer.appendChild(inputContainerTwo);
  inputContainerTwo.classList.add('input-container');

  const getNameTwoLabel = document.createElement('label');
  inputContainerTwo.appendChild(getNameTwoLabel);
  getNameTwoLabel.classList.add('input-label');
  getNameTwoLabel.setAttribute('for', 'name-two');
  getNameTwoLabel.textContent = 'Player two name';

  const getNameTwo = document.createElement('input');
  inputContainerTwo.appendChild(getNameTwo);
  getNameTwo.classList.add('input-field');
  getNameTwo.setAttribute('type', 'text');
  getNameTwo.setAttribute('name', 'name-two');
  getNameTwo.setAttribute('id', 'name-two');

  const continueBtn = document.createElement('div');
  gameContainer.appendChild(continueBtn);
  continueBtn.textContent = 'continue';
  continueBtn.classList.add('button');
  continueBtn.setAttribute('id', 'continue-button');

  continueBtn.addEventListener('click', function () {
    gamestate.setPlayerNames(getNameOne.value, getNameTwo.value);
    displayController.renderBoard();
    nameContainer.remove();
    continueBtn.remove();
    displayController.displayMessage(`${gamestate.startingPlayer.name}'s turn`);
  });
});

// Log the starting player
console.log(gamestate.startingPlayer);
