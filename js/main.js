//בס"ד

'use strict'

// console.log('hi main')

const elModal = document.querySelector('.modal')
const elLives = document.querySelector('.lives span')
const elSmiley = document.querySelector('.smiley button')

var elTempHintBtn
var startTime
localStorage.setItem("bestScoreBeginner", Infinity)
localStorage.setItem("bestScoreMedium", Infinity)
localStorage.setItem("bestScoreExpert", Infinity)


// The model
// – A Matrix
// containing cell objects:
var gBoard = []

// Each cell:
const gCELL = {
    minesAroundCount: 0, //mine neighbours example
    isShown: false, //was it clicked?
    isMine: false, //is it a mine?
    isMarked: false, //is it flaged?
    // position: { i: 0, j: 0 }, //position example
}

// This is an object by which the
// board size is set (in this case:
// 4x4 board and how many mines
// to place):
const gLevel = {
    SIZE: 0, //4, //matrix(board) size
    MINES: 0, //2 //mine count
}

// This is an object in which you
// can keep and update the
// current game state:
const gGame = {
    isOn: false, //Boolean, when true we let the user play
    shownCount: 0, //How many cells are shown
    markedCount: 0, //How many cells are marked (with a flag)
    secsPassed: 0, //How many seconds passed
    lives: 3,
    // hints: 3,
    isHint: false,
}

// creats a matrix
function createMat(ROWS, COLS, content) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        // content.position.i++
        for (var j = 0; j < COLS; j++) {
            // content.position = { i, j } //.j++
            row.push({ cell: Object.assign({}, content), position: { i, j } })
        }
        mat.push(row)
    }
    return mat
}

// renders the matrix to the DOM
// Render the board as a <table> to the page
function renderBoard(board, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < board.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell
            var className

            if (board[i][j].cell.isMine) {
                className = `cell cell-${i}-${j} mine`
                cell = '💣'
            } else {
                cell = board[i][j].cell.minesAroundCount
                className = `cell cell-${i}-${j}`
            }


            strHTML += `<td class="${className}"><div onmousedown="flagMark(event, this, ${i}, ${j})" onclick="onCellClicked(this,${i}, ${j})" class="closed cell-${i}-${j}"><span></span></div>${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// This is called when page loads 
function onInit() {
    elModal.style.display = 'none'
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.lives = 3
    gGame.isHint = false

    elSmiley.innerText = '😃'
    elLives.innerText = gGame.lives

    buildBoard()
    renderBoard(gBoard, '.board')
    console.log('gGame.shownCount', gGame.shownCount)

}

// Builds the board
// Set the mines: Call setMinesNegsCount()
// Return the created board
function buildBoard() {
    gBoard = createMat(gLevel.SIZE, gLevel.SIZE, gCELL)


    randomizeMines(gBoard, gLevel.MINES)

    // gBoard[2][3].cell.isMine = true
    // gBoard[1][0].cell.isMine = true

    // console.log('gBoard[2][3]', gBoard[2][3])
    // console.log('gBoard[1][0]', gBoard[1][0])
    // console.log('gBoard', gBoard)

    setMinesNegsCount(gBoard)
}

// randomize mines' location
function randomizeMines(board, amount) {
    // if (amount === 0) amount++

    for (var i = 0; i < amount; i++) {
        var row = getRandomIntInclusive(0, board.length - 1)
        var col = getRandomIntInclusive(0, board[0].length - 1)
        if (board[row][col].cell.isMine) {
            i--
            // randomizeMines(board, amount - 1)
        } else board[row][col].cell.isMine = true
    }
}

// counts neighbours
function countNeighbours(rowIdx, colIdx, mat) {
    var neighboursCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].cell.isMine) neighboursCount++
        }
    }
    return neighboursCount
}

// Count mines around each cell
// and set the cell's
// minesAroundCount.   
function setMinesNegsCount(board) {
    var neigCount

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            neigCount = countNeighbours(i, j, board)

            board[i][j].cell.minesAroundCount = neigCount
        }
    }

}

// Called when a cell is clicked
function onCellClicked(elCoverDiv, i, j) {
    // console.log('hi from click');
    if (!gGame.isOn) return

    if (gGame.shownCount === 0 && !gGame.isMarked) {
        startTime = currTime()

        var elTempCell = document.querySelector(`td.cell-${i}-${j}`)
        while (elTempCell.innerText === '💣') {
            onInit()
            elTempCell = document.querySelector(`td.cell-${i}-${j}`)
        }

        const elTempCoverDiv = document.querySelector(`div.cell-${i}-${j}`)
        elTempCoverDiv.classList.remove('closed')
    }

    if (gBoard[i][j].cell.isMarked) return

    if (gGame.isHint) {
        hintPlay(elCoverDiv, i, j)
        return
    }

    elCoverDiv.classList.remove('closed')

    if (!gBoard[i][j].cell.isMine) {
        gGame.shownCount++
        if (gBoard[i][j].cell.minesAroundCount === 0) {
            openNeighbours(i, j, gBoard)
        }
        console.log('gGame.shownCount', gGame.shownCount)
        checkGameOver()
        return
    }

    const elCell = document.querySelector(`.cell-${i}-${j}`)

    if (gGame.lives > 1) {
        elCell.style.backgroundColor = 'red'
        gGame.lives--
        elLives.innerText = gGame.lives
        return
    }

    elCell.style.backgroundColor = 'red'
    elSmiley.innerText = '🤯'
    gameOver('Game Over...')
    elLives.innerText = 0

    for (var k = 0; k < gBoard.length; k++) {
        for (var l = 0; l < gBoard[0].length; l++) {
            if (gBoard[k][l].cell.isMine) {
                var elTempCoverDiv = document.querySelector(`div.cell-${k}-${l}`)
                elTempCoverDiv.classList.remove('closed')
            }
        }
    }

}

// Game ends when all mines are
// marked, and all the other cells
// are shown
function checkGameOver() {
    if (gGame.markedCount + gGame.shownCount === gLevel.SIZE ** 2) {
        bestScore()

        elSmiley.innerText = '😎'
        gameOver('You Won!!!')
    }
}

// When user clicks a cell with no
// mines around, we need to open
// not only that cell, but also its
// neighbors.
function expandShown(board, elCell,
    i, j) {
    // *NOTE: start with a basic
    // implementation that only opens
    // the non - mine 1st degree
    // neighbors*
    // **BONUS: if you have the time
    // later, try to work more like the
    // real algorithm(see description
    // at the Bonuses section below)**
}

// Called when a cell is right-clicked
function flagMark(ev, elClosedDiv, i, j) {

    if (ev.button === 0 || ev.button === 1) return
    // console.log('hi from flagMark')
    // console.log('ev', ev)
    elClosedDiv.addEventListener("contextmenu", (e) => { e.preventDefault() })

    if (!gGame.isOn) return

    if (gBoard[i][j].cell.isMarked) {
        elClosedDiv.querySelector('span').innerText = ''
        gBoard[i][j].cell.isMarked = false
        gGame.markedCount--
        return
    }

    gBoard[i][j].cell.isMarked = true
    elClosedDiv.querySelector('span').innerText = '🚩'
    gGame.markedCount++
    checkGameOver()
    // console.log('gBoard[i][j]', gBoard[i][j])
}

// end game
function gameOver(msg) {
    gGame.isOn = false

    elModal.querySelector('span').innerText = msg
    elModal.style.display = 'block'
}

// choose difficulty
function setLevel(elBtn) {
    gLevel.SIZE = +elBtn.dataset.size
    gLevel.MINES = +elBtn.dataset.mines
    // console.log(size, mineAmount)

    // gGame.isOn = true
    onInit()
}

// if no mines around open surrounding neighbours
function openNeighbours(rowIdx, colIdx, mat) {
    var openedNeighbours = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= mat[i].length) continue
            var elCoverDiv = document.querySelector(`div.cell-${i}-${j}`)
            if (!elCoverDiv.classList.contains('closed')) continue
            elCoverDiv.classList.remove('closed')
            gGame.shownCount++
            console.log('gGame.shownCount', gGame.shownCount)

            openedNeighbours.push(elCoverDiv)
        }
    }
    return openedNeighbours
}

// hint mode
function hint(elBtn) {
    if (gGame.isHint || elBtn.innerText === '👻') return
    elBtn.innerText = '💪'
    gGame.isHint = true
    elTempHintBtn = elBtn
}

// use hint
function hintPlay(cover, i, j) {
    elTempHintBtn.innerText = '👻'
    gGame.isHint = false

    cover.classList.remove('closed')
    var tempOpenedNeighbours = openNeighbours(i, j, gBoard)

    setTimeout(() => {
        cover.classList.add('closed')
        for (var i = 0; i < tempOpenedNeighbours.length; i++) {
            tempOpenedNeighbours[i].classList.add('closed')
        }
    }, 1000)
}



// save best time in local storage
function bestScore() {
    gGame.secsPassed = (currTime() - startTime) / 1000
    switch (gLevel.SIZE) {

        case 4: {
            if (gGame.secsPassed < localStorage.getItem('bestScoreBeginner')) {
                // localStorage.clear()
                localStorage.setItem("bestScoreBeginner", gGame.secsPassed)

                var elSpan = document.querySelector('.beginner')
                elSpan.innerText = localStorage.getItem('bestScoreBeginner')
            }
            break;
        }

        case 8: {
            if (gGame.secsPassed < localStorage.getItem('bestScoreMedium')) {
                // localStorage.clear()
                localStorage.setItem("bestScoreMedium", gGame.secsPassed)

                var elSpan = document.querySelector('.medium')
                elSpan.innerText = localStorage.getItem('bestScoreMedium')
            }
            break;
        }

        case 12: {
            if (gGame.secsPassed < localStorage.getItem('bestScoreExpert')) {
                // localStorage.clear()
                localStorage.setItem("bestScoreExpert", gGame.secsPassed)

                var elSpan = document.querySelector('.expert')
                elSpan.innerText = localStorage.getItem('bestScoreExpert')
            }
            break;
        }
    }
}


// *See how you can hide the context
// menu on right-click*
// function onCellMarked(elCell) {
//     // see flagMark() at line # 187
// }