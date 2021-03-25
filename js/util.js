'use strict';

// Define buildBoard()      - Parameter: 
//                          size = int, uses to create square mat.
//                          - Use: create the square matrix
function buildBoard(size) {

    // Create mat rows & cells (push the returned obj from createCell())
    for (var i = 0; i < size; i++) {
        gBoard[i] = [];
        for (var j = 0; j < size; j++) {
            gBoard[i].push(createCell());
        }
    }

}

// Define createCell()      - Use: create each matrix's cell as obj
function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isFirst: false
    }
}

// Define renderBoard()     - Parameter:
//                          board = a matrix arr
//                          - Use: render the board to the DOM
function renderBoard(board) {

    // Define strHTML (the HTML string which will be render to the DOM)
    var strHTML = '';

    // Create rows
    for (var i = 0; i < board.length; i++) {
        strHTML += `<div>`;

        // Create cells
        for (var j = 0; j < board.length; j++) {

            // Create cell's div
            strHTML += `<div class="cell cell-${i}-${j}" data-i="${i}" data-j="${j}" onclick="leftClickCell(this)" oncontextmenu="rightClickCell(this)"></div>`;
        }

        strHTML += `</div>`;

    }

    // Render to dom
    document.querySelector(`.game-board`).innerHTML = strHTML;
}

// Define setMinesNegsCount()   - Use: update all gBoard cells's minesAroundCount
function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = getCellMineNegsCount({ i, j });
        }
    }
}

// Define getCellMineNegsCount()    - Parameter:
//                                  location = obj ({i, j}), uses for cell's coords
//                                  - Use: returns the cell's mine negs num
function getCellMineNegsCount(location) {

    // Define mine negs counter
    var negsMineCounter = 0;

    // Loop over negs of selected cell 
    // The i (row) loop
    for (var rowIdx = (location.i - 1); rowIdx <= (location.i + 1); rowIdx++) {

        // If selected row is not in mat boundaries > skip iteration
        if (rowIdx < 0 || rowIdx > (gBoard.length - 1)) continue;

        // The j (col) loop (specific cell for check)
        for (var colIdx = (location.j - 1); colIdx <= (location.j + 1); colIdx++) {

            // If selected col is not in mat boundaries || curr cell is the cell to check mine negs > skip loop iteration
            if (colIdx < 0 ||
                colIdx > (gBoard.length - 1) ||
                (colIdx === location.j && rowIdx === location.i)) continue;

            // If neg selected is mine - increase negsMineCounter
            if (gBoard[rowIdx][colIdx].isMine) negsMineCounter++;
        }

    }

    return negsMineCounter;
}

// Define placeMines()      - Parameter:
//                          num = int, uses to determine how many mines to place
//                          Use: Place mines on the board
function placeMines(num) {
    while (num) {

        // Get a random i & j to place mines
        var i = getRandomInt(0, gBoard.length);
        var j = getRandomInt(0, gBoard.length);

        // If random cell selected is empty and not the first cell clicked - place mine
        if (!gBoard[i][j].isMine && !gBoard[i][j].isFirst) {
            gBoard[i][j].isMine = true;
            num--;

            gMineLocations.push({ i, j });
        }

    }
}

// Define checkDifficultyAndInit()      - Called when: gameInit() run with missed parameters only
function checkDifficultyAndInit() {

    // Loop over game's difficulty buttons
    for (var i = 0; i < gElDifficultyBtns.length; i++) {

        // If curr game btn is checked - get the info from it
        if (gElDifficultyBtns[i].checked) {
            var matSize = gElDifficultyBtns[i].dataset.mat_size;
            var mineNum = gElDifficultyBtns[i].dataset.mine_num;
            var lives = gElDifficultyBtns[i].dataset.lives;

            // Initialize the game and return
            initGame(matSize, mineNum, lives);
            return;
        }
    }
}

// Define getRandomInt()        - Parameters:
//                              min = int, the min num random from (inclusive)
//                              max = int, the max num random to (exclusive)
//                              Use: return a random int within min and max
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}