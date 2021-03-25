'use strict';

// Define winCheck()        - Use: Loop all over the board and check if all flags are marked and all cells are shown
function winCheck() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isShown && !currCell.isMarked) return;
        }
    }

    // Woohoo! we have a winner!
    gameWin();
}

// Define gameWin()         - Use: update win and update gGame
function gameWin() {

    // Pause game
    clearInterval(gGameInterval);
    gGame.isPlaying = false;
    gGame.isLost = true;

    // Handle best score
    setBestScore();

    // Change emoji face
    document.querySelector(`.restart-btn`).innerText = WIN;
}

// Define gameOver()        - Use: client clicked on mine and no lives remain
function gameOver() {

    // Loop over all mines on board
    for (var idx = 0; idx < gMineLocations.length; idx++) {
        var i = gMineLocations[idx].i;
        var j = gMineLocations[idx].j;
        var currMineCell = document.querySelector(`.cell-${i}-${j}`);

        // If mine flaged correctly - indicate with green bgc
        if (gBoard[i][j].isMarked) currMineCell.classList.add(`cell-mark-correctly`);

        // If mine is just clicked - indicate with red bgc
        else if (gBoard[i][j].isShown) currMineCell.innerText = MINE;

        // If mine is shown just for curiosity - indicate with orange bgc
        else {
            currMineCell.classList.add(`cell-shown`);
            currMineCell.style.backgroundColor = `#ff8C00`;
            currMineCell.innerText = MINE;
        }
    }

    // Pause game
    gGame.isPlaying = false;
    gGame.isLost = true;
    clearInterval(gGameInterval);

    // Change emoji face
    document.querySelector(`.restart-btn`).innerText = DEAD;
}

// Define setBestScore()        - Use: check if best score is set and store it
function setBestScore() {

    // If browser don't support local storage - return
    if (typeof (Storage) === 'undefined') return;

    // Set score as time (by secs) took to finishe
    var score = document.querySelector(`.timer-digits`).innerText;

    // Decrease score (it's good) if still remains helpers elements
    if (gGame.life) score -= gGame.life * 10;
    if (gHintsAvailable) score -= gHintsAvailable * 5;
    if (gSafeClickAvailable) score -= gSafeClickAvailable * 2;

    // Get curr best score
    var currBestScore = localStorage.getItem(`bestScore[${gGame.difficuty}]`);

    // If new best score > store it
    if (!currBestScore || score < currBestScore) {
        localStorage.setItem(`bestScore[${gGame.difficuty}]`, score);
        bestScoreAudio.play();
    }

}