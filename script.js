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
  // for loop
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
  // Declare players and a way to fetch them
  let player1 = createPlayer('Player One', 1);
  let player2 = createPlayer('Player Two', 2);

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

  // Start game and set playerTurn to starting player
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

  function checkForWin() {
    let winner = undefined;
    for (let i = 0; i < gameboard.rows; i++) {
      let playerOneWinCounter = 0;
      let playerTwoWinCounter = 0;
      if (gameboard.board[i][0] === 1) {
        playerOneWinCounter++;
      } else if (gameboard.board[i][0] === 2) {
        playerTwoWinCounter++;
      }
      for (let j = 0; j < gameboard.columns; j++) {
        if (gameboard.board[0][j] === 1) {
          playerOneWinCounter++;
        } else if (gameboard.board[0][j] === 2) {
          playerTwoWinCounter++;
        }
      }
      if (playerOneWinCounter === 3) {
        winner = player1;
      } else if (playerTwoWinCounter === 3) {
        winner = player2;
      }
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

console.log(gamestate.startingPlayer);
gamestate.changeTurn();
console.log(gamestate.getPlayerTurn());
