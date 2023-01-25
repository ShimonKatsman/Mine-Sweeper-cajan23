//בס"ד

'use strict'

// console.log('hi main')

const elModal = document.querySelector('.modal')

var size //= 4
var mineAmount //= 2

// The model
// – A Matrix
// containing cell objects:
var gBoard = []
// console.log('gBoard', gBoard)

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
    SIZE: 4, //matrix(board) size
    MINES: 2 //mine count
}

// This is an object in which you
// can keep and update the
// current game state:
const gGame = {
    isOn: false, //Boolean, when true we let the user play
    shownCount: 0, //How many cells are shown
    markedCount: 0, //How many cells are marked (with a flag)
    secsPassed: 0 //How many seconds passed 
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

//This is called when page loads 
function onInit() {
    elModal.style.display = 'none'
    gGame.shownCount = 0
    gGame.markedCount = 0

    buildBoard()
    renderBoard(gBoard, '.board')
}

// Builds the board
// Set the mines: Call setMinesNegsCount()
// Return the created board
function buildBoard() {
    gBoard = createMat(size, size, gCELL)

    randomizeMines(gBoard, mineAmount)
    // gBoard[2][3].cell.isMine = true
    // gBoard[1][0].cell.isMine = true

    // console.log('gBoard[2][3]', gBoard[2][3])
    // console.log('gBoard[1][0]', gBoard[1][0])
    console.log('gBoard', gBoard)

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

    if (gBoard[i][j].cell.isMarked) return
    elCoverDiv.classList.remove('closed')

    if (!gBoard[i][j].cell.isMine) {
        gGame.shownCount++
        checkGameOver()
        return
    }

    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.style.backgroundColor = 'red'
    gameOver('Game Over...')

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
    if (gGame.markedCount + gGame.shownCount === size ** 2) gameOver('You Won!!!')
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

function gameOver(msg) {
    elModal.querySelector('span').innerText = msg
    elModal.style.display = 'block'
}

function setLevel(elBtn) {
    size = +elBtn.dataset.size
    mineAmount = +elBtn.dataset.mines
    // console.log(size, mineAmount)

    gGame.isOn = true
    onInit()
}

// *See how you can hide the context
// menu on right-click*
// function onCellMarked(elCell) {
//     // see flagMark() at line # 187
// }