export const numberOfRows = 7;
export const numberOfColumns = 7;

export const minStreak = 3; // streaks shorter than this don't give points
export const instantWin = 7; // a streak of this length results in a game over and instant win

export const pointSystem = {
  // streak_length: points
  3: 1,
  4: 3,
  5: 7,
  6: 15,
};

class Player {
  constructor(name) {
    this.name = name;
    this.streaks = [];
    this.points = 0;
    this.instant_winner = false;
    this.instant_win_streak = [];
  }
}

const cpuObj = new Player("cpu");
const userObj = new Player("user");

export const players = {
  cpu: cpuObj,
  user: userObj,
};

export const markers = {
  unmarked: "unmarked",
  cpu: players.cpu.name,
  user: players.user.name,
};

export const delaysMs = {
  cpuMove: 1000,
  resultsCalculation: 2000,
  displayError: 2000,
};
