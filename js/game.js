'use strict'
const MINE = '⛯';
const FLAG = '⚑';
const SMILEY = '🙂';
const SADSMILEY = '🙁';
const WINSMILEY = '😎';
const LIGHT = '💡';
var gBoard;
var gBlink = false;
var gLevel = {
    SIZE: 4,
    MINES: 2
};

var timerIndex = 0;
var gEmptyLocation = [];
var safeClickCount = 3;
var gfirstClick = true;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
var LIVES = 3;

function initGame() {
    reset();
    showBestScore()

    var countElement = document.querySelector('.clicksCount');
    countElement.innerText = safeClickCount;

    var liveElement = document.querySelector('.live');
    liveElement.innerText = LIVES;

    gBoard = buildBoard();

    renderBoard(gBoard)
    gGame.isOn = true;


}

function firstClick() {
    if (gfirstClick) {
        insertMines(gBoard);
        setMinesNegsCount(gBoard);
        startTime();
    }

    gfirstClick = false;


}
function insertMines(board) {
    var mines = gLevel.MINES;
    while (mines > 0) {
        var rndIndexi = rndNum(0, gLevel.SIZE - 1);
        var rndIndexj = rndNum(0, gLevel.SIZE - 1);


        if (board[rndIndexi][rndIndexj].isShown !== true && board[rndIndexi][rndIndexj].isMine !== true) {
            board[rndIndexi][rndIndexj].isMine = true
            mines--;
        }

    }
}



function cellMarked(elCell) {
    firstClick();
    if (!gGame.isOn) return;
    var getDataId = elCell.getAttribute('id-cell');
    var pos = splitId(getDataId);
    var currentCell = gBoard[pos.i][pos.j];
    if (currentCell.isShown) return;

    if (currentCell.isShown !== true && currentCell.isMarked === false) {
        currentCell.isMarked = true;
        elCell.innerHTML = FLAG;
        gGame.markedCount++;


    }
    else {
        currentCell.isMarked = false;
        elCell.innerHTML = '';
        gGame.markedCount--;

    }
    event.preventDefault();
    checkGameOver();

}



function cellClicked(elCell) {

    if (!gGame.isOn) return;

    var getDataId = elCell.getAttribute('id-cell');
    var pos = splitId(getDataId);
    var currentCell = gBoard[pos.i][pos.j];
    if (gBlink) return;
    if (elCell.classList.contains('blink_cells')) {
        revealNegCell(gBoard, pos)
        console.log('contains');
        gBlink = true;
        return;
    }
    if (currentCell.isMine) {
        LIVES--;
        var liveElement = document.querySelector('.live');
        liveElement.innerText = LIVES;
        var msgElement = document.querySelector('.mineClicked');
        msgElement.classList.add('show');
        setTimeout(function () {
            var msgElement = document.querySelector('.mineClicked');
            msgElement.classList.remove('show');
        }, 4000);
        if (LIVES === 0) {
            elCell.innerHTML = MINE;
            elCell.classList.add('red');

            console.log('game over');
            return gameOver();
        }

    }
    else {

        if (currentCell.isMarked) return;
        if (currentCell.isShown) return;
        elCell.innerHTML = currentCell.minesAroundCount;
        if (currentCell.minesAroundCount === 0) {
            elCell.innerHTML = '';

        }

        elCell.classList.add('color');
        currentCell.isShown = true;
        firstClick();
        expandShown(gBoard, pos);
    }




    checkGameOver();

}

function gameOver() {

    gGame.isOn = false;
    revealAllMines(gBoard);
    stoptimer();
    var el = document.querySelector('img');
    el.src = "img/2.png";


}




function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board.length; j++) {
            var pos = { i: i, j: j };
            board[i][j].minesAroundCount = countNegCell(board, pos)
        }


    }

}
function safeClick() {

    if (safeClickCount > 0 && gGame.isOn) {

        gEmptyLocation = findEmptyLocation(gBoard);
        var rndIndex = rndNum(0, gEmptyLocation.length - 1);

        var iIndex = null;
        var jIndex = null;

        iIndex = gEmptyLocation[rndIndex].i;
        jIndex = gEmptyLocation[rndIndex].j;
        var elCell = document.querySelector(`.cell[id-cell="${iIndex},${jIndex}"]`)
        elCell.classList.add('blink_me');
        clearColor(elCell);
        safeClickCount--;
        var countElement = document.querySelector('.clicksCount');
        countElement.innerText = safeClickCount;
    }


}
function checkGameOver() {
    countShowenCells(gBoard);
    var calcSize = ((gLevel.SIZE) * (gLevel.SIZE));
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === (calcSize - gLevel.MINES)) {
        stoptimer();
        gGame.isOn = false;

        console.log('win');
        var el = document.querySelector('img');
        el.src = "img/3.png";
        saveBestScore();
    }
    else {


    }


}
function countShowenCells(board) {
    var counter = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isShown && board[i][j].isMine !== true) {
                counter++;

            }
        }
        gGame.shownCount = counter;
    }
}


function expandShown(board, pos) {

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (board[i][j].isMarked === true) continue;
            if (board[i][j].isMine === true) continue;
            if (board[i][j].isShown === true) continue;

            renderCell({ i, j }, board[i][j].minesAroundCount);

            board[i][j].isShown = true;

            var elCell = document.querySelector(`.cell[id-cell="${i},${j}"]`)
            elCell.classList.add('color');

            if (board[i][j].minesAroundCount === 0) {

                renderCell({ i, j }, '');
                expandShown(board, { i: i, j: j });
            }


        }

    }

}





function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) {
                board[i][j].isShown = true;
                var elCell = document.querySelector(`.cell[id-cell="${i},${j}"]`)
                elCell.classList.add('red');
                renderCell({ i, j }, MINE)
            }
        }
    }

}

function reset() {
    showBestScore();
    LIVES = 3;
    gfirstClick = true;
    stoptimer(timerIndex);
    timerIndex = 0;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gEmptyLocation = [];
    var el = document.querySelector('img');
    el.src = "img/1.png";

    var hintEle = document.querySelectorAll('.hint');
    hintEle[0].classList.remove('hide');
    hintEle[1].classList.remove('hide');
    hintEle[2].classList.remove('hide');



}


function findEmptyLocation(board) {
    var res = [];
    for (var i = 0; i < board.length; i++) {
        var pos = { i: 0, j: 0 };

        for (var j = 0; j < board.length; j++) {

            if (board[i][j].isShown !== true && board[i][j].isMine !== true && board[i][j].isMarked !== true) {

                pos = { i: i, j: j };
                res.push(pos);
            }
        }

    }
    return res;

}


function revealEmptyCells(ele) {
    ele.classList.add('hide');
    gEmptyLocation = findEmptyLocation(gBoard);
    for (var i = 0; i < gEmptyLocation.length; i++) {
        var elCell = document.querySelector(`.cell[id-cell="${gEmptyLocation[i].i},${gEmptyLocation[i].j}"]`)

        elCell.classList.add('blink_cells');
        clearMarkedCells(elCell);



    }
}



function clearMarkedCells(elCell) {
    setTimeout(function () {


        elCell.classList.remove('blink_cells');

        gBlink = false;

    }, 4000);
}

function clearRenderdCells({ i, j }) {
    setTimeout(function () {

        renderCell({ i, j }, "");

    }, 3000);

}


function beginnerLevel() {
    gLevel = {
        SIZE: 4,
        MINES: 2
    };
    reset();
    initGame();
}
function mediumLevel() {
    gLevel = {
        SIZE: 8,
        MINES: 12
    };
    reset();
    initGame();
}

function expertLevel() {
    gLevel = {
        SIZE: 12,
        MINES: 30
    };
    reset();
    initGame();
}