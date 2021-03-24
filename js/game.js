// Define constans
var SIZE = 4;
var EMPTY = '';
var MINE = '💥';
var FLAG = '🚩';
var ALIVE = '😲';
var DEAD = '😵';
var WIN = '😎';
var HINT = '💡';

// Define global vars and arrs
var gBoard = [];
var gGame = {
    mines: 0,
    isPlaying: false,
    lives: 0,
    isHintMode: false
};
var gCellId = 100;
var gMineLocations = [];
var gFlagAviable;
var gHintsAvailable = 3;

// Define game interval (not set yet)
var gGameInterval;

// Define difficulty btns and spans arrs
var gElDifficultySpans = document.querySelectorAll(`.difficulty-text`);
var gElDifficultyBtns = document.querySelectorAll(`[name="difficulty-btn"]`);

// When page loads - hard check Easy difficulty (prevent bug) and initGame (4*4 mat, 2 mines)
gElDifficultyBtns[0].checked = true;
initGame(4, 2, 1);


//      Define functions of the game
// Define initGame() [gets size as int to create square mat and num of mines as int]
function initGame(size, mineNum, lives) {

    // If restarted from emoji - check difficulty and init again
    if (!size || !mineNum) {
        checkDifficultyAndInit();
        return;
    }

    // Clear timer (if excist)
    document.querySelector(`.timer-digits`).innerText = 0;
    clearInterval(gGameInterval);

    // Create board
    gBoard = buildBoard(size);

    // Handle mines
    gMineLocations = [];
    gGame.mines = mineNum;

    // Handle flags
    gFlagAviable = mineNum;
    renderFlagAvailable();

    // Handle lives
    gGame.lives = lives;
    renderLivesAvailable();

    // Handle hints
    gHintsAvailable = 3;
    renderHintsAvailable();

    // Render board to DOM
    renderBoard(gBoard);

    // Let changing difficulty
    for (var i = 0; i < gElDifficultyBtns.length; i++) {
        if (gElDifficultyBtns[i].checked) continue;
        else {
            gElDifficultyBtns[i].hidden = false;
            gElDifficultySpans[i].hidden = false;
        }
    }

    // Become alive (render face to DOM)
    document.querySelector(`.restart-btn`).innerText = ALIVE;
}

// Define rightClicker [gets elCell to handle the cell clicked as flag]
function rightClicker(elCell) {

    // If it's game's kick-off or hint mode - return
    if (!gGame.isPlaying || gGame.isHintMode) return;

    // Define helpers vars 
    var cellI = elCell.dataset.i;
    var cellJ = elCell.dataset.j;
    var cell = gBoard[cellI][cellJ];

    // If cell is shown - return
    if (cell.isShown) return;

    // If cell is marked - toggle marking off and increase flag conter by 1
    if (cell.isMarked) {
        cell.isMarked = false;
        gFlagAviable++;
        elCell.innerText = '';
    }

    // Else - Mark cell as flag and decrease flag counter by 1
    else {
        cell.isMarked = true;
        gFlagAviable--;
        elCell.innerText = FLAG;
    }

    // Render flag available counter to DOM
    renderFlagAvailable();

    // If flag available counter is 0 - check win
    if (!gFlagAviable) winCheck();
}

// Define cellLeftClicked() [gets elCell to handle the cell clicked]
function cellLeftClicked(elCell) {

    // Define helping vars (cell's-i &j)
    var cellI = elCell.dataset.i;
    var cellJ = elCell.dataset.j;
    var cell = gBoard[cellI][cellJ];

    // If it's game's kick-off - start clock, and mark location so no mines will be placed there
    if (!gGame.isPlaying) {
        cell.isFirst = true;
        runGame(gGame.mines);
    };

    // If cell is marked (flaged) - prevent reveal
    if (cell.isMarked) return;

    // Update cell isShown and add cell-shown class to make it looks clicked
    cell.isShown = true;
    elCell.classList.add(`cell-shown`);

    // If cell is mine - game over
    if (cell.isMine) {
        elCell.style.backgroundColor = `red`;

        if (!gGame.lives) {
            gameOver();
            return;
        } else {
            cell.innerText = MINE;
            gGame.lives--;
            renderLivesAvailable();
            gFlagAviable--;
            renderFlagAvailable();
        }
    }


    // If cell has mine negs - reveal only mine negs counter
    if (cell.minesAroundCount) elCell.innerText = cell.minesAroundCount;

    // If cell has no mine negs - reveal all negs
    else revealNegs({ i: +cellI, j: +cellJ });

    // If no flag aviable check win
    if (!gFlagAviable) winCheck();
}

// Define runGame() [starts game time interval, place mines & prevent changing difficulty]
function runGame(mineNum) {

    // Set gGame isPlaying true (so this function wont run every click)
    gGame.isPlaying = true;

    // Define running secs to be show on timer
    var runningSecs = 0;

    // Starts the interval (every 1 sec the timer increase by 1 and rendering it to DOM)
    gGameInterval = setInterval(function () {
        runningSecs++;
        document.querySelector(`.timer-digits`).innerText = runningSecs;
    }, 1000);

    // Place mines and set mines negs counters
    placeMines(mineNum);
    setMinesNegsCount();

    // Prevent changing game difficulty
    for (var i = 0; i < gElDifficultyBtns.length; i++) {
        if (gElDifficultyBtns[i].checked) continue;
        else {
            gElDifficultyBtns[i].hidden = true;
            gElDifficultySpans[i].hidden = true;
        }
    }
}

// Define gameOver() [used when click on mine and no lives remain]
function gameOver() {

    // Show all mines on board (except those who marked as mines)
    for (var idx = 0; idx < gMineLocations.length; idx++) {
        var currMineI = gMineLocations[idx].i;
        var currMineJ = gMineLocations[idx].j;

        var currMineCell = document.querySelector(`.cell-${currMineI}-${currMineJ}`);

        if (gBoard[currMineI][currMineJ].isMarked) {
            currMineCell.classList.add(`cell-mark-correctly`);
        } else {
            currMineCell.classList.add(`cell-shown`);
            currMineCell.innerText = MINE;
        }
    }

    // Pause game
    gGame.isPlaying = false;
    clearInterval(gGameInterval);

    // Change emoji face
    document.querySelector(`.restart-btn`).innerText = DEAD;
}

// Define revealNegs [gets location as object {i, j}, like {0,0}]
function revealNegs(location) {

    // For loops goes to get negs of selected cell
    // A loop goes to rows negs
    for (var rowIdx = (location.i - 1); rowIdx <= (location.i + 1); rowIdx++) {

        // If selected row is not in mat boundaries > skip loop iteration
        if (rowIdx < 0 || rowIdx === gBoard.length) continue;

        // A loop goes to cols negs (more specific)
        for (var colIdx = (location.j - 1); colIdx <= (location.j + 1); colIdx++) {

            // If selected col is not in mat boundaries || curr cell is the cell to check negs > skip loop iteration
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

// Define winCheck()
function winCheck() {

    // Loops go over all mat, if all cells are shown or marked as mine - we have a winner
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isShown && !currCell.isMarked) return;
        }
    }

    gameWin();
}

// Define gameWin()
function gameWin() {
    // TODO: best time records handle

    // Pause game
    gGame.isPlaying = false;
    clearInterval(gGameInterval);

    // Change emoji face
    document.querySelector(`.restart-btn`).innerText = WIN;
}