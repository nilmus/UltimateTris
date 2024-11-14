import { activateBoard, createBoard } from "./domFunctions.js";
import { initBoardArray } from "./gameFunctions.js";

const main = () => {
  createBoard();
  activateBoard();
  initBoardArray();
};

main();
