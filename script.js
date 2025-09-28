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

  function resetBoard() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        board[i][j] = 0;
      }
    }
  }

  return {
    rows,
    columns,
    board,
    placeMark,
    resetBoard,
  };
})();

// Establish game elements, and dictate how the game is played
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
    let winLine = null;

    // Check Rows (Horizontal Wins)
    for (let i = 0; i < gameboard.rows; i++) {
      if (
        board[i][0] !== 0 &&
        board[i][0] === board[i][1] &&
        board[i][1] === board[i][2]
      ) {
        winner = board[i][0] === player1.token ? player1 : player2;
        winLine = [
          [i, 0],
          [i, 1],
          [i, 2],
        ];
        return { winner, line: winLine };
      }
    }

    // Check Columns (Vertical Wins)
    for (let j = 0; j < gameboard.columns; j++) {
      if (
        board[0][j] !== 0 &&
        board[0][j] === board[1][j] &&
        board[1][j] === board[2][j]
      ) {
        winner = board[0][j] === player1.token ? player1 : player2;
        winLine = [
          [0, j],
          [1, j],
          [2, j],
        ];
        return { winner, line: winLine };
      }
    }

    // Check Diagonals (Top-Left to Bottom-Right)
    if (
      board[0][0] !== 0 &&
      board[0][0] === board[1][1] &&
      board[1][1] === board[2][2]
    ) {
      winner = board[0][0] === player1.token ? player1 : player2;
      winLine = [
        [0, 0],
        [1, 1],
        [2, 2],
      ];
      return { winner, line: winLine };
    }

    // Check Diagonals (Top-Right to Bottom-Left)
    if (
      board[0][2] !== 0 &&
      board[0][2] === board[1][1] &&
      board[1][1] === board[2][0]
    ) {
      winner = board[0][2] === player1.token ? player1 : player2;
      winLine = [
        [0, 2],
        [1, 1],
        [2, 0],
      ];
      return { winner, line: winLine };
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
      return { winner: 'Tie', line: null };
    }

    // If no win and no tie, the game continues.
    return { winner: null, line: null };
  }

  // Get token of current player, place token on internal gamestate, checkForWin, if game isn't over changeTurns
  function playRound(row, column) {
    const currentToken = getPlayerTurn().token;
    gameboard.placeMark(row, column, currentToken);

    // DESTRUCTURE the result from checkForWin
    const result = checkForWin();
    const gameResult = result.winner;

    if (gameResult === null) {
      changeTurn();
    }

    // Return the full result object for displayController to use the line coordinates
    return result;
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

  function getScores() {
    return {
      player1: scores.player1,
      player2: scores.player2,
    };
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
    updateScores,
    getScores,
  };
})();

// Call the gamestate elements to control the display and UI
let displayController = (function () {
  // Show the board in the UI when the game is started
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

  // Display a message with the game state
  function displayMessage(message) {
    const messageDisplay = document.getElementById('message');
    messageDisplay.textContent = message;
  }

  // Display the score
  function updateScoreDisplay() {
    const gameArea = document.getElementById('game-area');
    const players = gamestate.getPlayers();
    const scores = gamestate.getScores();

    let scoreDisplay = document.getElementById('scoreboard');
    let spacerDisplay = document.getElementById('scoreboard-spacer');

    // Create a hidden ghost-spacer-scoreboard to the left of board (to center board) and a visible scoreboard to the right of board if they don't exist
    if (!scoreDisplay) {
      // Create the invisible spacer (must be created first)
      spacerDisplay = document.createElement('div');
      spacerDisplay.id = 'scoreboard-spacer';
      spacerDisplay.classList.add('scoreboard', 'scoreboard-spacer'); // Apply both classes

      // Create the visible scoreboard
      scoreDisplay = document.createElement('div');
      scoreDisplay.id = 'scoreboard';
      scoreDisplay.classList.add('scoreboard');

      // Create and append the scoreboard title
      const title = document.createElement('h3');
      title.classList.add('scoreboard-title');
      title.textContent = 'scoreboard';
      scoreDisplay.appendChild(title);

      // Create the score content container (to separate title from scores)
      const scoreContent = document.createElement('div');
      scoreContent.id = 'score-content';
      scoreDisplay.appendChild(scoreContent);

      const gameBoardElement = document.getElementById('game-board');

      // Insert spacer before the game board
      gameArea.insertBefore(spacerDisplay, gameBoardElement);

      // Insert visible scoreboard after the game board
      gameArea.appendChild(scoreDisplay);
    }

    // Define content of scoreboard
    const content = `${players.playerOne.name}: <b>${scores.player1}</b><br>${players.playerTwo.name}: <b>${scores.player2}</b>`;
    document.getElementById('score-content').innerHTML = content;
    spacerDisplay.innerHTML = `<h3 class="scoreboard-title">scoreboard</h3><div id="dummy-score-content">${content}</div>`;
  }

  // Create the button that starts a new round
  function showNextRoundButton() {
    const gameContainer = document.getElementById('game-container');

    const nextBtn = document.createElement('div');
    nextBtn.textContent = 'play next round';
    nextBtn.classList.add('button');
    nextBtn.id = 'next-round-button';

    // Attach the reset handler (We define this function next)
    nextBtn.addEventListener('click', resetGame);

    gameContainer.appendChild(nextBtn);
  }

  // Highlight the winning line
  function highlightWin(lineCoordinates) {
    const cells = document.querySelectorAll('.cell');

    lineCoordinates.forEach(([row, column]) => {
      const winningCell = Array.from(cells).find(
        (cell) => cell.dataset.row == row && cell.dataset.column == column
      );

      if (winningCell) {
        winningCell.classList.add('winning-cell');
      }
    });
  }

  // Reset game function
  function resetGame() {
    // Clear the internal game board state and board UI
    gameboard.resetBoard();
    clearBoard();
    document.getElementById('next-round-button').remove();
    renderBoard();

    // Reset the starting player (change turn) and message for the new round
    gamestate.changeTurn();
    displayController.displayMessage(
      `${gamestate.getPlayerTurn().name}'s turn`
    );
  }

  // Make sure the game proceeds when a cell is clicked
  function handleClick(e) {
    // Read coordinates
    const row = parseInt(e.target.dataset.row);
    const column = parseInt(e.target.dataset.column);

    // Check if cell is empty in order to run playRound logic with coordinates (getToken of player whose turn it is, place it in internal gamestate and checkForWin)
    if (gameboard.board[row][column] == 0) {
      const result = gamestate.playRound(row, column);
      const outcome = result.winner;

      // Then update UI/DOM with token ID on html element of targeted cell which CSS renders to icon.
      e.target.dataset.token = gameboard.board[row][column];

      // Display message and handle the end of a game based on the outcome
      if (outcome == null) {
        displayController.displayMessage(
          `${gamestate.getPlayerTurn().name}'s turn`
        );
      } else {
        if (outcome == 'Tie') {
          displayController.displayMessage('you tied it up!');
        } else {
          displayController.displayMessage(`${outcome.name} wins!`);
          displayController.highlightWin(result.line);
        }
        displayController.handleGameEnd(outcome);
      }
    }
  }

  // When a game is over, make sure player's can't place additional tokens
  function removeCellListeners() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.removeEventListener('click', handleClick);
    });
  }

  // When a game is over, remove the game-board elements from the DOM
  function clearBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
  }

  // When a winner is found ..
  function handleGameEnd(outcome) {
    // Update the score
    gamestate.updateScores(outcome);

    // Update the score display
    updateScoreDisplay();

    // Make sure no more tokens can be placed
    removeCellListeners();

    // Show next button
    showNextRoundButton();
  }

  return {
    renderBoard,
    displayMessage,
    handleClick,
    handleGameEnd,
    updateScoreDisplay,
    showNextRoundButton,
    resetGame,
    highlightWin,
  };
})();

// When game is started, remove start btn and msg, and show inputs for player names - then render board after continue is pressed
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-game');
const startMsg = document.getElementById('start-message');

startBtn.addEventListener('click', function () {
  startBtn.remove();
  startMsg.remove();

  const gameArea = document.getElementById('game-area');

  const nameContainer = document.createElement('div');
  gameContainer.insertBefore(nameContainer, gameArea);
  nameContainer.classList.add('name-container');

  const inputContainerOne = document.createElement('div');
  nameContainer.appendChild(inputContainerOne);
  inputContainerOne.classList.add('input-container');

  const getNameOneLabel = document.createElement('label');
  inputContainerOne.appendChild(getNameOneLabel);
  getNameOneLabel.classList.add('input-label');
  getNameOneLabel.setAttribute('for', 'name-one');
  getNameOneLabel.textContent = 'player one name';

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
  getNameTwoLabel.textContent = 'player two name';

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

    // Animation start - fade out the input section
    nameContainer.classList.add('fade-out');
    continueBtn.classList.add('fade-out');

    // Wait 400ms (matching the intended CSS fade-out duration) before rendering the board
    setTimeout(() => {
      // Render the board and score display
      displayController.renderBoard();
      displayController.updateScoreDisplay();

      // Trigger the game board fade-in
      const gameAreaElement = document.getElementById('game-area');
      gameAreaElement.classList.add('animate-game-area');

      // Clean up (remove inputs/button)
      nameContainer.remove();
      continueBtn.remove();

      displayController.displayMessage(
        `${gamestate.startingPlayer.name}'s turn`
      );
    }, 400);
  });
});

// Log the starting player
console.log(gamestate.startingPlayer);
