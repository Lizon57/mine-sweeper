'use strict';

// Define renderLifeAvailable()      - Use: render the num of lives aviable to the DOM
function renderLifeAvailable() {

    // Define strHTML - the string that would render to the DOM
    var strHTML = '';

    // Get the lives container
    var elLife = document.querySelector(`.lives-avialable`);

    if (!gGame.life) strHTML = 0;

    // Prepare strHTML - each life worth one life emoji
    else for (var i = 0; i < gGame.life; i++) {
        strHTML += LIVES;
    }

    // Render to the DOM
    elLife.innerText = strHTML;
}

// Define renderHintAvailable()       - Use: render the num of hints aviable to the DOM
function renderHintAvailable() {

    // Get the hints container
    var elHint = document.querySelector(`.hints-avialable`);

    // Define strHTML (the HTML string which will be render to the DOM)
    var strHTML = '';

    // Check if hints left
    if (!gHintsAvailable) strHTML = `0`;

    // For each hint aviable add an emoji on strHTML
    else for (var i = 0; i < gHintsAvailable; i++) {
        strHTML += `<span class="hint-emoji" onClick="runHint(this)">${HINT}</span>`;
    }

    // Render the num of lives aviable to DOM
    elHint.innerHTML = strHTML;

}

// Define renderFlagAvailable()      - Use: render the num of flags aviable to the DOM
function renderFlagAvailable() {

    // Get the flags container
    var elFlag = document.querySelector(`.flags-available`);

    // Render the num of flags aviable to DOM
    elFlag.innerText = gFlagAvailable;
}

// Define renderBestScore()     - Parameter:
//                                      Size = int, to identify which best score should be render
//                                      - Use: render best score to DOM
function renderBestScore(size) {

    // If client browser unable to use local storage - return
    if (typeof (Storage) === 'undefined') {
        document.querySelector(`.best-score`).style.display = `none`;
        console.log(`hi`);

        // Else - get relevant best score
    } else {
        var currBestScore = localStorage.getItem(`bestScore[${size}]`);
        document.querySelector(`.best-score-span`).innerText = (currBestScore) ? currBestScore : `no best score et yet.`;
    }
}

// Define renderSafeClickAvailable()       - Use: render the num of safe clicks aviable to the DOM
function renderSafeClickAvailable() {

    // Get the hints container
    var elSafeClick = document.querySelector(`.safe-clicks-avialable`);

    // Define strHTML (the HTML string which will be render to the DOM)
    var strHTML = '';

    // Check if hints left
    if (!gSafeClickAvailable) strHTML = `0`;

    // For each safe click aviable add an emoji on strHTML
    else for (var i = 0; i < gSafeClickAvailable; i++) {
        strHTML += `<span class="safe-click-emoji" onClick="printRandomSafeCell()">${SAFE_CLICK}</span>`;
    }

    // Render the num of safe clicks to DOM
    elSafeClick.innerHTML = strHTML;

}

// Define renderModal()        - Parameters:
//                                  title = str, the title of modal
//                                  txt = str, the message modal show
//                              Use for: Show messages to client
function renderModal(title, txt) {

    // Prepare the modal
    document.querySelector(`.modal-title`).innerText = title;
    document.querySelector(`.modal-text`).innerText = txt;

    // Show the modal
    document.querySelector(`.modal-full-screen`).style.display = `block`;

    // Hide game section
    document.querySelector(`.game-section`).style.display = `none`;

}

// Define closeModal()          - Use: close the modal and render back the game
function closeModal() {
    document.querySelector(`.modal-full-screen`).style.display = `none`;

    document.querySelector(`.game-section`).style.display = `block`;
}