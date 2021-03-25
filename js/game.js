'use strict';

// SECTION 1: Define constans (mostly emojis)
// Cells emojis
var EMPTY = '';
var MINE = '💥';
var FLAG = '🚩';

// Life emojis (for game's status)
var ALIVE = '😲';
var DEAD = '😵';
var WIN = '😎';

// Game's features emojis (mostly for helpers)
var LIVES = '💓';
var HINT = '💡';
var SAFE_CLICK = '🛡️';

// Define global vars and arrs (games needed)
var gBoard = [];
var gGame = {
    isPlaying: false,
    isLost: false,
    difficuty: null,
    mine: 0,
    life: 0,
    isHintMode: false
};
var gMineLocations = [];
var gFlagAvailable;
var gHintsAvailable;
var gSafeClickAvailable;

// Define game interval (just define, not set yet)
var gGameInterval;

// Define difficulties btns and spans arrs
var gElDifficultySpans = document.querySelectorAll(`.difficulty-text`);
var gElDifficultyBtns = document.querySelectorAll(`[name="difficulty-btn"]`);

// Define best score sound
var bestScoreAudio = new Audio(`./audio/win.mp3`);

// When page loads - hard check easy difficulty (prevent bug) and initGame (4*4 mat, 2 mines)
gElDifficultyBtns[0].checked = true;
initGame();



// SECTION 2: functions of the game!
// Define initGame()    - Parameters:
//                      size = int, uses to create square mat.
//                      mineNum = int, uses to determine how many mines will be on the board
//                      helpers = int, uses to determine how many helpers (such as lives, hints, etc. will be available for the player)
//                      - Use: Initialization game (reset vars, arrs, etc.)
function initGame(size, mine, helper) {

    // If necessary information miss - check game's difficulty and init again
    if (!size || !mine || !helper) {
        checkDifficultyAndInit();
        return;
    }

    // Change all preventing conditions to false (let the user start a game)
    gGame.isLost = false;
    gGame.isPlaying = false;

    // Clear timer (if exist) & render 0 to DOM's timer
    clearInterval(gGameInterval);
    document.querySelector(`.timer-digits`).innerText = 0;

    // reset game board and create new one
    gBoard = [];
    buildBoard(size);

    // Update gGame.difficulty
    gGame.difficuty = size;

    // Reset mines info and update gGame.mine
    gMineLocations = [];
    gGame.mine = mine;

    // Handle flags
    gFlagAvailable = mine;
    renderFlagAvailable();

    // Handle lives
    gGame.life = helper;
    renderLifeAvailable();

    // Handle hints
    gHintsAvailable = helper;
    renderHintAvailable();

    // Handle safe clicks
    gSafeClickAvailable = helper;
    renderSafeClickAvailable();

    // Loop over game's difficulties DOM elements and show them, so the client can change the game's difficulty
    for (var i = 0; i < gElDifficultyBtns.length; i++) {
        if (gElDifficultyBtns[i].checked) continue;
        else {
            gElDifficultyBtns[i].hidden = false;
            gElDifficultySpans[i].hidden = false;
        }
    }

    var elDifficultySeperators = document.querySelectorAll(`.difficulties-seperator`);
    for (var i = 0; i < elDifficultySeperators.length; i++) {
        elDifficultySeperators[i].style.display = `inline`;
    }

    // Render the board to DOM
    renderBoard(gBoard);

    // Become alive (render face to DOM)
    document.querySelector(`.restart-btn`).innerText = ALIVE;

    // Show best score
    renderBestScore(size);
}

// Define rightClickCell()      - Parameter:
//                              elCell = DOM obj, to determine which cell has clicked
//                              - Use: when client right click on a cell (usually to mark it with flag)
function rightClickCell(elCell) {

    // If it's game's kick-off || cell already shown || game is on hint mode - return
    if (!gGame.isPlaying || elCell.classList.contains(`cell-shown`) || gGame.isHintMode) return;

    // Define helpers vars
    var i = +elCell.dataset.i;
    var j = +elCell.dataset.j;
    var cell = gBoard[i][j];

    // If cell is marked - toggle marking off and increase flag conter by 1
    if (cell.isMarked) {
        cell.isMarked = false;
        gFlagAvailable++;
        elCell.innerText = '';
    }

    // Else - Mark cell as flag and decrease flag counter by 1
    else {
        cell.isMarked = true;
        gFlagAvailable--;
        elCell.innerText = FLAG;
    }

    // Render flag available counter to DOM
    renderFlagAvailable();

    // If flag available counter is 0 - check win
    if (!gFlagAvailable) winCheck();
}

// Define cellLeftClicked()     - Parameter:
//                              elCell = DOM obj, to determine which cell has clicked
//                              - Use: when client left click on a cell
function leftClickCell(elCell) {

    // Define helpers vars
    var i = +elCell.dataset.i;
    var j = +elCell.dataset.j;
    var cell = gBoard[i][j];

    // If cell is marked (flaged) || game finished- prevent click
    if (cell.isMarked || gGame.isLost) return;

    // If it's hint mode and nothing to reveal
    if (gGame.isHintMode && !gGame.isPlaying) {
        unRunHint();
        return;
    }

    // If it's game's kick-off - start clock, and mark location so no mines will be placed there
    if (!gGame.isPlaying) {
        cell.isFirst = true;
        runGame(gGame.mine);
    };

    // If game is hint moded reveal negs via hintReveal()
    if (gGame.isHintMode) {
        hintReveal({ i, j });
        gHintsAvailable--;
        renderHintAvailable();
        return;
    }

    // Update cell isShown and add cell-shown class to make it looks clicked
    cell.isShown = true;
    elCell.classList.add(`cell-shown`);

    // If cell is mine reduce life by one and change cell's bgc to red
    if (cell.isMine) {
        gGame.life--;
        renderLifeAvailable();
        elCell.style.backgroundColor = `red`;

        // If cllient has no lives available it's game over
        if (!gGame.life) {
            gameOver();
            return;

            // Else (client has lives) - show the mine, reduce life & flag, and render it to DOM
        } else {
            elCell.innerText = MINE;

            gFlagAvailable--;
            renderFlagAvailable();
            return;
        }
    }


    // If cell has mine negs - reveal only mine negs counter
    if (cell.minesAroundCount) elCell.innerText = cell.minesAroundCount;

    // If cell has no mine negs - reveal all negs
    else revealNegs({ i: +i, j: +j });

    // If no flag available check win
    if (!gFlagAvailable) winCheck();
}

// Define runGame()         - Parameter:
//                          mineNum = int, uses to determine how many mines to place
//                          - Use: Place mines on the board
function runGame(mineNum) {

    // Set gGame isPlaying true (so this function won't run every click)
    gGame.isPlaying = true;

    // Place mines and set mines negs counters
    placeMines(mineNum);
    setMinesNegsCount();

    // Define running secs to be show on timer
    var runningSecs = 0;

    // Starts the timer interval (every 1 sec the timer increase by 1 and rendering it to DOM)
    gGameInterval = setInterval(function () {
        runningSecs++;
        document.querySelector(`.timer-digits`).innerText = runningSecs;
    }, 1000);

    // Loop over game's difficulties DOM elements and hide them, so the client can not change the game's difficulty during a game
    for (var i = 0; i < gElDifficultyBtns.length; i++) {
        if (gElDifficultyBtns[i].checked) continue;
        else {
            gElDifficultyBtns[i].hidden = true;
            gElDifficultySpans[i].hidden = true;
        }
    }

    var elDifficultySeperators = document.querySelectorAll(`.difficulties-seperator`);
    for (var i = 0; i < elDifficultySeperators.length; i++) {
        elDifficultySeperators[i].style.display = `none`;
    }
}

// Define revealNegs        - Parameter:
//                          location = obj ({i, j}), uses for cell's coords
//                          - Use: reveal negs if cell clicked is empty
function revealNegs(location) {

    // Loop over negs of selected cell 
    // The i (row) loop
    for (var rowIdx = (location.i - 1); rowIdx <= (location.i + 1); rowIdx++) {

        // If selected row is not in mat boundaries > skip iteration
        if (rowIdx < 0 || rowIdx === gBoard.length) continue;

        // The j (col) loop (specific cell for check)
        for (var colIdx = (location.j - 1); colIdx <= (location.j + 1); colIdx++) {

            // If selected col is not in mat boundaries || curr cell is the cell to reveal > skip loop iteration
            if (colIdx < 0 ||
                colIdx === gBoard.length ||
                (rowIdx === location.i && colIdx === location.j)) continue;

            // Define currCell var
            var currCell = gBoard[rowIdx][colIdx];

            // If currCell already shown or marked as flag > skip loop iteration
            if (currCell.isShown || currCell.isMarked) continue;

            // Else - Mark as shown and define currCell element
            currCell.isShown = true;
            var elCurrCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`);

            // If curr cell has mine negs - reveal num and add cell-shown class
            if (currCell.minesAroundCount) {
                elCurrCell.innerText = currCell.minesAroundCount;
                elCurrCell.classList.add(`cell-shown`);

                // Else (no mine negs) - continue revealing and add cell-shown class
            } else {
                elCurrCell.classList.add(`cell-shown`);
                revealNegs({ i: rowIdx, j: colIdx });
            }

        }

    }

}

// Define revealHint()      - Parameter:
//                          location = obj ({i, j}), uses for cell's coords
//                          - Use: reveal cell & cell's neg content via revealCell()
function hintReveal(location) {

    // Loop over negs of selected cell 
    // The i (row) loop
    for (var rowIdx = (location.i - 1); rowIdx <= (location.i + 1); rowIdx++) {

        // If selected row is not in mat boundaries > skip iteration
        if (rowIdx < 0 || rowIdx > (gBoard.length - 1)) continue;

        // The j (col) loop (specific cell for check)
        for (var colIdx = (location.j - 1); colIdx <= (location.j + 1); colIdx++) {

            // If selected col is not in mat boundaries || curr cell is already shown > skip loop iteration
            if (colIdx < 0 ||
                colIdx > (gBoard.length - 1) ||
                gBoard[rowIdx][colIdx].isShown) continue;

            // Reveal cell for one second via revealCell()
            revealCell({ i: rowIdx, j: colIdx });
        }

    }

    // Get out of hint mode
    unRunHint();

}

// Define revealCell        - Parameter:
//                          location = obj ({i, j}), uses for cell's coords
//                          - Use: reveal cell content for 1 sec
function revealCell(location) {

    // Define helpers vars
    var cellOnMat = gBoard[location.i][location.j];
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    var cellContent = '';

    // Define cell content to reveal
    cellContent = (cellOnMat.isMine) ? MINE : (cellOnMat.minesAroundCount) ? cellOnMat.minesAroundCount : '';

    // Reveal the content & indicate it
    elCell.innerText = cellContent;
    elCell.classList.add(`cell-reveal`);

    // Stop revealing after 1 sec
    setTimeout(function () {
        elCell.innerText = '';
        elCell.classList.remove(`cell-reveal`);
    }, 1000);
}

// Define runHint()     - Parameter:
//                      elHint = DOM obj, use to determine which hint emoji to "light on"
//                      - Use: Set hint mode and "light on" selected hint emoji
function runHint(elHint) {

    // toggle gGame.isHintMode
    gGame.isHintMode = !gGame.isHintMode;

    // If hint mode is on - "light on" the selected emoji
    if (gGame.isHintMode) {
        elHint.style.filter = `none`;

        // Else - get out of hint mode via unRunHint()
    } else unRunHint();

}

// Define printRandomSafeCell()         - Use: render safe cell to user for one sec
function printRandomSafeCell() {

    // If game hasn't start - return
    if (!gGame.isPlaying) return;

    // Define safe cells arr
    var safeCells = [];

    // Get list of safe cells
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isShown || gBoard[i][j].isMine) continue;
            else safeCells.push({ i, j });
        }
    }

    // If there are no safe cells - return
    if (!safeCells.length) return;

    // Define helpers vars
    var safeCell = safeCells[getRandomInt(0, safeCells.length)];
    var elSafeCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`);

    // Show safe cell for 1 sec
    elSafeCell.classList.add(`cell-safe`);

    setTimeout(function () {
        elSafeCell.classList.remove(`cell-safe`);
    }, 1000);

    // Decrease safe cells available
    gSafeClickAvailable--;
    renderSafeClickAvailable();

}

// Define unRunHint()           - Use: make sure isHintMode is false & all light bulb are "light off"
function unRunHint() {

    // Set hint mode off
    gGame.isHintMode = false;

    // Get all hints emojis DOM elements
    var elHints = document.querySelectorAll(`.hint-emoji`);

    // Set all light bulb "light off"
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].style.filter = `grayscale(100%)`;
    }
}