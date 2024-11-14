import { classNames, streakHighlights } from "./domConstants.js";
import {
  delaysMs,
  instantWin,
  numberOfColumns,
  numberOfRows,
  players,
} from "./gameConstants.js";
import { handleCellClick } from "./gameFunctions.js";

const board = document.getElementById("board");

export function createBoard() {
  for (let i = 0; i < numberOfRows; i++) {
    const row = document.createElement("tr");
    row.className = classNames.row;
    for (let j = 0; j < numberOfColumns; j++) {
      const cell = document.createElement("td");
      cell.className = classNames.cell;
      cell.dataset.row = i;
      cell.dataset.col = j;
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}

export function activateBoard() {
  const cells = board.querySelectorAll("td");
  for (const cell of cells) {
    cell.addEventListener("click", handleCellClick);
    cell.classList.add("clickable");
  }
}

export function deactivateBoard() {
  const cells = board.querySelectorAll("td");
  for (const cell of cells) {
    cell.removeEventListener("click", handleCellClick);
    cell.classList.remove("clickable");
  }
}

export function deactivateCell(cell) {
  cell.removeEventListener("click", handleCellClick);
  cell.classList.remove("clickable");
}

export function displayError(message) {
  const errorModal = document.createElement("dialog");
  errorModal.className = classNames.errorModal;
  errorModal.textContent = message;
  document.body.appendChild(errorModal);
  errorModal.showModal();
  setTimeout(() => errorModal.close(), delaysMs.displayError);
}

export function updateInstructions(message) {
  const instructions = document.getElementById("instructions");
  instructions.textContent = message;
}

export function displayEndScreen(winner, userPoints, cpuPoints) {
  const userPointsNoun = userPoints === 1 ? "pt" : "pts";
  const cpuPointsNoun = cpuPoints === 1 ? "pt" : "pts";
  updateInstructions(
    `User: ${userPoints}${userPointsNoun} - CPU: ${cpuPoints}${cpuPointsNoun}`
  );
  const instructions = document.getElementById("instructions");
  const winnerElement = document.createElement("h2");
  winnerElement.textContent =
    winner !== "draw" ? `${winner} wins!` : "It's a draw!";
  winnerElement.className = classNames.winner;
  instructions.insertAdjacentElement("afterend", winnerElement);

  highlightStreaks();

  addPlayAgainButton();
}

export function displayInstantWin(winner, streak) {
  updateInstructions(`Streak of ${instantWin}!!!`);
  const instructions = document.getElementById("instructions");
  const winnerElement = document.createElement("h2");
  winnerElement.textContent = `${winner} wins by instant win!`;
  winnerElement.className = classNames.winner;
  instructions.insertAdjacentElement("afterend", winnerElement);

  highlightInstantWin(streak);

  addPlayAgainButton();
}

function addPlayAgainButton() {
  const playAgainElement = document.createElement("button");
  playAgainElement.textContent = "Play Again";
  playAgainElement.className = classNames.playAgainButton;
  playAgainElement.addEventListener("click", () => {
    location.reload();
  });
  board.insertAdjacentElement("afterend", playAgainElement);
}

function highlightStreaks() {
  const activePlayers = [players.user, players.cpu];
  for (const player of activePlayers) {
    for (const streak of player.streaks) {
      const streakCells = streak.map(([row, col]) => {
        const cell = document.querySelector(
          `[data-row="${row}"][data-col="${col}"]`
        );
        return cell;
      });
      streakCells.forEach((cell) => {
        cell.classList.add(streakHighlights[streak.length]);
      });
    }
  }
}

/**
 *
 * @param {Array} streak - an array of coordinates (coordinates = an array of numbers)
 */
function highlightInstantWin(streak) {
  const streakCells = streak.map(([row, col]) => {
    const cell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    return cell;
  });
  streakCells.forEach((cell) => {
    cell.classList.add(streakHighlights.instantWin);
  });
}
