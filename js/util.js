'use strict'

function buildBoard() {
    var board = [];

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];

        for (var j = 0; j < gLevel.SIZE; j++) {

            board[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false, };

        }

    }


    return board;
}

function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board.length; j++) {

            strHTML += `<td class="cell" id-cell="${i},${j}" 
            onclick="cellClicked(this) "oncontextmenu="cellMarked(this)"></td>`;
        }
        strHTML += '</tr>';

    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function rndNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell[id-cell="${location.i},${location.j}"]`)

    elCell.innerHTML = value;
}



function startTime() {
    var timerElement = document.querySelector('.timer');
    var start = Date.now();
    var timer = setInterval(function () {


        var end = Date.now() - start;

        timerElement.innerText = Math.floor(end / 1000);
        gGame.secsPassed = Math.floor(end / 1000);
    }, 1);

    timerIndex = timer;



}


function stoptimer() {

    clearInterval(timerIndex);
}

function clearColor(elCell) {
    setTimeout(function () {
        elCell.classList.remove('blink_me');
    }, 5000);
}

function countNegCell(board, pos) {

    var count = 0;

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === pos.i && j === pos.j) continue;

            if (board[i][j].isMine === true) count++;
        }
    }
    return count;

}

function revealNegCell(board, pos) {



    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === pos.i && j === pos.j) continue;
            if (board[i][j].isShown === true) continue;
            if (board[i][j].isMarked === true) continue;

            renderCell({ i, j }, board[i][j].minesAroundCount);
            if (board[i][j].isMine === true) {
                renderCell({ i, j }, MINE);

            }

            var elCell = document.querySelector(`.cell[id-cell="${i},${j}"]`)
            elCell.classList.add('blink_cells');
            clearMarkedCells(elCell);
            clearRenderdCells({ i, j });

        }
    }


}
function splitId(strId) {
    var splitStr = strId.split(',');
    var pos = {};
    pos = { i: +splitStr[0], j: +splitStr[1] };
    return pos;

}
function saveBestScore() {

    if (localStorage.getItem(gLevel.SIZE) === null) {
        localStorage.setItem(gLevel.SIZE, gGame.secsPassed);


    }
    else {

        var getScore = localStorage.getItem(gLevel.SIZE);
        if (gGame.secsPassed < getScore) {
            localStorage.setItem(gLevel.SIZE, gGame.secsPassed);


        }
    }
}

function showBestScore() {

    var eleScore = document.querySelector('.bestScore');
    if (localStorage.getItem(gLevel.SIZE) === null) {
        eleScore.innerText = '0';
    } else {
        eleScore.innerText = localStorage.getItem(gLevel.SIZE);

    }



}