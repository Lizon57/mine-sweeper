// Define buildBoard() [creates board matrix of desired size (size * size!)]
function buildBoard(size) {

    // Define mat (a var that will be return for placement)
    var mat = [];

    // Create mat rows
    for (var i = 0; i < size; i++) {
        mat[i] = [];

        // Create mat cells
        for (var j = 0; j < size; j++) {
            mat[i].push(createCell({ i, j }));
        }
    }

    return mat;
}

// Define renderBoard() [render the board to the dom]
function renderBoard(board) {

    // Define strHTML (the render of gBoard to dom)
    var strHTML = '';

    // Create rows
    for (var i = 0; i < board.length; i++) {
        strHTML += `<div class="row">`;

        // Create cells
        for (var j = 0; j < board.length; j++) {

            // Create cell's div
            strHTML += `<div class="cell cell-${i}-${j}" data-i="${i}" data-j="${j}" onclick="cellLeftClicked(this)" oncontextmenu="rightClicker(this)"></div>`;
        }

        strHTML += `</div>`;

    }

    // Render to dom
    document.querySelector(`.game-board`).innerHTML = strHTML;
}

// Define setMinesNegsCount() [goes all over the board and set each cell the number of mine negs]
function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = getCellMineNegsCount({ i, j });
        }
    }
}

// Define getCellMineNegsCount() [gets location as object ({i, j}, like {0,0}) and return cell number of mine negs]
function getCellMineNegsCount(location) {

    // Define counter var
    var negsMineCounter = 0;

    // For loops goes to get negs of selected cell
    // A loop goes to rows negs
    for (var rowIdx = (location.i - 1); rowIdx <= (location.i + 1); rowIdx++) {

        // If selected row is not in mat boundaries > skip loop iteration
        if (rowIdx < 0 || rowIdx > (gBoard.length - 1)) continue;

        // A loop goes to cols negs (more specific)
        for (var colIdx = (location.j - 1); colIdx <= (location.j + 1); colIdx++) {

            // If selected col is not in mat boundaries || curr cell is the cell to check negs > skip loop iteration
            if (colIdx < 0 ||
                colIdx > (gBoard.length - 1) ||
                colIdx === location.j && rowIdx === location.i) continue;

            // If neg selected is mine - increase negsMineCounter
            if (gBoard[rowIdx][colIdx].isMine) negsMineCounter++;
        }

    }

    return negsMineCounter;
}

// Define createCell() [gets location as object {i, j}, like {0,0}]
function createCell(location) {
    return {
        id: gCellId++,
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isFirst: false
    }
}

// Define placeMines() gets int num of mines to place on the board
function placeMines(num) {
    while (num > 0) {

        // Getting a random i & j to place mines
        var i = getRandomInt(0, gBoard.length);
        var j = getRandomInt(0, gBoard.length);

        // If random cell selected is empty - place mine
        if (!gBoard[i][j].isMine && !gBoard[i][j].isFirst) {
            gBoard[i][j].isMine = true;
            num--;
            console.log(i, j, `is mine now`);

            gMineLocations.push({ i, j });
        }

    }
}

// Define renderFlagsAviable() [render the num of flags available to DOM]
function renderFlagAvailable() {
    var elFlag = document.querySelector(`.flag-available`);

    elFlag.innerText = gFlagAviable;
}

// Define renderLivesAvailable [render the num of lives available to DOM]
function renderLivesAvailable() {
    var elLive = document.querySelector(`.lives-available`);

    elLive.innerText = gGame.lives;
}

// Define checkDifficultyAndInit() [used when restart from emoji]
function checkDifficultyAndInit() {
    for (var i = 0; i < gElDifficultyBtns.length; i++) {
        if (gElDifficultyBtns[i].checked) {
            var matSize = gElDifficultyBtns[i].dataset.mat_size;
            var mineNum = gElDifficultyBtns[i].dataset.mine_num;
            initGame(matSize, mineNum);
            return;
        }
    }
}

// Define renderHintsAvailable() [render the nums of hints available to DOM (clickable elements)]
function renderHintsAvailable() {
    var elHint = document.querySelector(`.hints-available`);
    strHTML = '';

    for (var i = 0; i < gHintsAvailable; i++) {
        strHTML += `<span class="hint-emoji" onClick="runHint(this)">${HINT}</span>`;
    }

    elHint.innerHTML = strHTML;

}

// Define runHint() [toggle hints]
function runHint(elHint) {
    gGame.isHintMode = !gGame.isHintMode;
    var isHintMode = gGame.isHintMode;
    var elHints = document.querySelectorAll(`.hint-emoji`);

    if (isHintMode) {
        elHint.style.filter = `none`;
    } else {
        for (var i = 0; i < elHints.length; i++) {
            elHints[i].style.filter = `grayscale(100%)`;
        }
    }

}



// Define getRandomInt() [The maximum is exclusive and the minimum is inclusive]
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}