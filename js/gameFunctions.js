import { classNames } from "./domConstants.js";
import {
  activateBoard,
  deactivateBoard,
  displayEndScreen,
  displayError,
  displayInstantWin,
  updateInstructions,
} from "./domFunctions.js";
import {
  delaysMs,
  instantWin,
  markers,
  minStreak,
  numberOfColumns,
  numberOfRows,
  players,
  pointSystem,
} from "./gameConstants.js";

const boardArray = [];

export const initBoardArray = () => {
  for (let i = 0; i < numberOfRows; i++) {
    boardArray[i] = [];
    for (let j = 0; j < numberOfColumns; j++) {
      boardArray[i][j] = markers.unmarked;
    }
  }
};

export const handleCellClick = (event) => {
  // USER move
  const cell = event.currentTarget;
  const validMove = checkValidMove(cell);
  if (!validMove) {
    displayError("Please select an empty cell");
    return;
  }
  event.target.classList.add(classNames.userCells);
  registerMove(cell, markers.user);

  let gameOver = checkAndHandleGameOver();
  if (gameOver) return;

  // CPU move
  deactivateBoard();
  updateInstructions("CPU's turn...");
  setTimeout(() => {
    const cpuCell = cpuMove();
    cpuCell.classList.add(classNames.cpuCells);
    registerMove(cpuCell, markers.cpu);
    activateBoard();
    updateInstructions("Your turn!");
    gameOver = checkAndHandleGameOver();
    if (gameOver) return;
  }, delaysMs.cpuMove);
};

const checkValidMove = (cell) => {
  // For now I'm simply doing it based on class
  return (
    !cell.classList.contains(classNames.userCells) &&
    !cell.classList.contains(classNames.cpuCells)
  );
};

const registerMove = (cell, player) => {
  // player: "cpu" or "user"
  const row = cell.dataset.row;
  const col = cell.dataset.col;
  boardArray[row][col] = player;
};

const retrieveUnmarkedCells = () => {
  // retrieve the indices of all "unmarked" cells
  const unmarkedCells = []; // e.g. [[0, 0], [2, 1], [6, 0]]
  for (let i in boardArray) {
    for (let j in boardArray[i]) {
      if (boardArray[i][j] === markers.unmarked) {
        unmarkedCells.push([i, j]);
      }
    }
  }
  return unmarkedCells;
};

const cpuMove = () => {
  const unmarkedCells = retrieveUnmarkedCells();

  // pick one of the unmarked cells at random
  const randomIndex = Math.floor(Math.random() * unmarkedCells.length);
  const [row, col] = unmarkedCells[randomIndex];
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

  // return the move
  return cell;
};

const checkGameOver = () => {
  const unmarkedCells = retrieveUnmarkedCells();
  return unmarkedCells.length === 0;
};

const handleGameOver = () => {
  const activePlayers = [players.user, players.cpu];
  for (const player of activePlayers) {
    player.streaks = getStreaks(player.name);
    player.points = countPoints(player.streaks);
  }
  const winner = determineWinner(players.user.points, players.cpu.points);
  displayEndScreen(winner, players.user.points, players.cpu.points);
  return;
};

const handleInstantWin = () => {
  const activePlayers = [players.user, players.cpu];
  for (const player of activePlayers) {
    if (player.instant_winner) {
      displayInstantWin(player.name, player.instant_win_streak);
      return;
    }
  }
  throw new Error("No instant winner");
};

const checkAndHandleGameOver = () => {
  const instantWin = checkInstantWin();
  if (instantWin) {
    deactivateBoard();
    handleInstantWin();
    return true;
  }

  const gameOver = checkGameOver();
  if (gameOver) {
    deactivateBoard();
    updateInstructions("Match is over! Calculating results...");
    setTimeout(() => {
      handleGameOver();
    }, delaysMs.resultsCalculation);
  }
  return gameOver;
};

/**
 *
 * @param {"cpu" | "user"} player
 * @returns an array of streaks (streaks = an array of coordinates (coordinates = an array of numbers))
 */
const getStreaks = (player) => {
  const streaks = [];
  for (let i = 0; i < boardArray.length; i++) {
    const row = boardArray[i];
    for (let j = 0; j < row.length; j++) {
      const mark = row[j];

      if (mark !== player) {
        continue;
      }

      const orientations = ["horizontal", "vertical", "rdiag", "ldiag"];

      orientations.forEach((orientation) => {
        const streak = checkStreak([i, j], orientation);
        if (streak.length >= minStreak) {
          streaks.push(streak);
        }
      });
    }
  }
  return streaks;
};

/**
 *
 * @param {Array} startingCell - the coordinates of the starting cell
 * @param {"horizontal" | "vertical" | "rdiag" | "ldiag"} orientation - the direction to be checked
 * @returns {Array} an array of coordinates (as an array) of the cells that make up the streak
 */
const checkStreak = (startingCell, orientation) => {
  const directions = {
    horizontal: [0, 1],
    vertical: [1, 0],
    rdiag: [1, 1],
    ldiag: [1, -1],
  };
  const direction = directions[orientation];

  const mark = boardArray[startingCell[0]][startingCell[1]];
  if (mark === markers.unmarked) {
    return [];
  }

  const streak = [startingCell];
  let isStreak = true;
  let checkingCoords = [
    startingCell[0] + direction[0],
    startingCell[1] + direction[1],
  ];
  while (
    isStreak &&
    checkingCoords[0] >= 0 &&
    checkingCoords[0] < numberOfRows &&
    checkingCoords[1] >= 0 &&
    checkingCoords[1] < numberOfColumns
  ) {
    const checkingCell = boardArray[checkingCoords[0]][checkingCoords[1]];
    if (checkingCell === mark) {
      streak.push(checkingCoords);
      checkingCoords = [
        checkingCoords[0] + direction[0],
        checkingCoords[1] + direction[1],
      ];
    } else {
      isStreak = false;
    }
  }
  return streak;
};

const checkInstantWin = () => {
  const activePlayers = [players.user, players.cpu];
  for (const player of activePlayers) {
    player.streaks = getStreaks(player.name);
  }
  for (const player of activePlayers) {
    for (const streak of player.streaks) {
      if (streak.length >= instantWin) {
        player.instant_winner = true;
        player.instant_win_streak = streak;
        return true;
      }
    }
  }
  return false;
};

const countPoints = (streaks) => {
  let points = 0;
  for (const streak of streaks) {
    points += pointSystem[streak.length];
  }
  return points;
};

const determineWinner = (pointsUser, pointsCpu) => {
  if (pointsUser > pointsCpu) {
    return "user";
  } else if (pointsCpu > pointsUser) {
    return "cpu";
  } else {
    return "draw";
  }
};
