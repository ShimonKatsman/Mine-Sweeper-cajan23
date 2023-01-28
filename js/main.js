//בס"ד

'use strict'

// console.log('hi main')

const gElModal = document.querySelector('.modal')
const gElLives = document.querySelector('.lives span')
const gElSmiley = document.querySelector('.smiley')
const gElTimer = document.querySelector('.timer span')
const gElMineCounter = document.querySelector('.mine-counter span')
const gElSafeClickSpan = document.querySelector('.safe-click span')
const gElSet = document.querySelector('.manual .set')


var gElTempHintBtn
var gStartTime
var gTimeInterval
var prevBoards = []
var gMegaHintClick = {}
var gPlayMegaHint = false
var gMinesRows = []
var gMinesCols = []
var gIsExterminating = false


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
    isManual: false,
    isMegaHint: false,
    isExterminated: false,
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
            var div = board[i][j].cell.isShown ? '' : `<div onmousedown="onCellMarked(event, this, ${i}, ${j})" onclick="onCellClicked(this,${i}, ${j})" class="closed cover cell-${i}-${j}"><span></span></div>`

            if (board[i][j].cell.isShown && gGame.shownCount !== 0) {
                gGame.shownCount--
            }

            if (div !== '') gBoard[i][j].cell.isShown = false

            if (board[i][j].cell.isMine) {
                className = `cell cell-${i}-${j} mine`
                cell = '💣'
                // } else if (board[i][j].cell.minesAroundCount === 0) {
                //     cell = ''
                //     className = `cell cell-${i}-$k{j} empty`
            } else {
                cell = board[i][j].cell.minesAroundCount
                className = `cell cell-${i}-${j}`
            }


            strHTML += `<td class="${className}">${div}${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'


    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML


    // for (var i = 0; i < array.length; i++) {
    //     for (var i = 0; i < array.length; i++) {
    //         if (board[i][j] === '💣') {
    //             board[i][j].cell.isMine = trie
    //         }
    //     }
    // }

    // for (var i = 0; i < board.length; i++) {
    //     for (var j = 0; j < board[0].length; j++) {
    //         if (board[i][j].cell.isMine) {
    //             var elDiv = document.querySelector(`.cover.cell-${i}-${j}`)
    //             if (elDiv.classList.contains('closed')) {
    //                 //     elDiv.style.height = '29px'
    //                 // elDiv.style.marginBottom='-1px'
    //                 // elDiv.style.marginTop = '0.5px'
    //             }
    //         }
    //     }
    // }

    // for (var i = 0; i < board.length; i++) {
    //     for (var j = 0; j < board[0].length; j++) {
    //         var elCell = document.querySelector(`.cell.cell-${i}-${j}.mine`)
    //         var elDiv = document.querySelector(`.cover.cell-${i}-${j}`)

    //         // if (elCell.classList.contains('empty'))
    //             // elDiv.style.marginTop = '-15px'
    //             // elDiv.style.marginLeft = '-1px'
    //             elDiv.style.marginBottom = '-10px'
    //     }
    // }

    // for (var i = 0; i < board.length; i++) {
    //     for (var j = 0; j < board[0].length; j++) {
    //         var elCell = document.querySelector(`.cell.cell-${i}-${j}`)
    //         var elDiv = document.querySelector(`.cover.cell-${i}-${j}`)

    //         if (elCell.classList.contains('empty'))
    //             elDiv.style.marginTop = '-15px'
    //             elDiv.style.marginLeft = '-1px'
    //     }
    // }
}

// This is called when page loads 
function onInit() {
    gElModal.style.display = 'none'
    clearInterval(gTimeInterval)
    gElMineCounter.innerText = gLevel.MINES
    gElSafeClickSpan.innerText = 3

    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.lives = 3
    gGame.isHint = false
    gGame.isMegaHint = false
    gGame.isExterminated = false


    gElSmiley.innerText = '😃'
    gElLives.innerText = gGame.lives

    prevBoards = []
    gMegaHintClick = {}
    gMinesRows = []
    gMinesCols = []

    var elHintBtns = document.querySelectorAll('.hints button')
    for (var i = 0; i < elHintBtns.length; i++) {
        elHintBtns[i].innerText = '💡'
    }

    buildBoard()
    renderBoard(gBoard, '.board')
    showBestTime('bestScoreBeginner', 'beginner')
    showBestTime('bestScoreMedium', 'medium')
    showBestTime('bestScoreExpert', 'expert')
    // console.log('gGame.shownCount', gGame.shownCount)

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
            // gMinesRows.splice(gMinesRows.indexOf(row), 1)
            // gMinesCols.splice(gMinesCols.indexOf(col), 1)

            i--
            continue
            // randomizeMines(board, amount - 1)
        } else board[row][col].cell.isMine = true

        gMinesRows.push(row)
        gMinesCols.push(col)
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

    prevBoards.push(copyMatOfObjects(gBoard))
    // console.log('prevBoards', prevBoards)

    if (gGame.isManual) {
        gElSet.style.display = 'inline-block'
        setMine(i, j)
        return
    }

    // console.log('gPlayMegaHint', gPlayMegaHint)
    // console.log('gGame.isMegaHint', gGame.isMegaHint)
    if (gPlayMegaHint) {
        if (isNaN(gMegaHintClick.i)) {
            gMegaHintClick = { i, j }
            return
        }

        setMegaHint(i, j)
        return
    }

    if (elCoverDiv.innerText === '🟢') { //'✔'){}
        elCoverDiv.innerText = ''
    }

    if (gGame.shownCount === 0 && !gBoard[i][j].cell.isMarked) {
        gStartTime = currTime()
        timer(gStartTime, gElTimer)

        var elTempCell = document.querySelector(`td.cell-${i}-${j}`)
        while (elTempCell.innerText === '💣' && !gGame.isMegaHint && !gGame.isHint && !gGame.isExterminated) {
            onInit()
            prevBoards.push(copyMatOfObjects(gBoard))
            timer(gStartTime, gElTimer)
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

    // elCoverDiv.classList.remove('closed')
    elCoverDiv.style.display = 'none'

    if (!gBoard[i][j].cell.isMine) {
        gGame.shownCount++
        gBoard[i][j].cell.isShown = true

        if (gBoard[i][j].cell.minesAroundCount === 0) {
            openNeighbours(i, j, gBoard)
        }
        // console.log('gGame.shownCount', gGame.shownCount)

        // prevBoards.push(copyMatOfObjects(gBoard))
        // console.log('prevBoards', prevBoards)

        checkGameOver()
        return
    }

    const elCell = document.querySelector(`.cell-${i}-${j}`)

    if (gGame.lives > 1) {
        gBoard[i][j].cell.isShown = true
        elCell.style.backgroundColor = 'red'
        gGame.lives--
        gGame.markedCount++
        gElLives.innerText = gGame.lives
        gElMineCounter.innerText = +gElMineCounter.innerText - 1
        checkGameOver()

        // prevBoards.push(copyMatOfObjects(gBoard))
        // console.log('prevBoards', prevBoards)

        return
    }

    gBoard[i][j].cell.isShown = true

    elCell.style.backgroundColor = 'red'
    gElMineCounter.innerText = +gElMineCounter.innerText - 1
    gElSmiley.innerText = '🤯'
    gameOver('Game Over...')
    gElLives.innerText = 0

    for (var k = 0; k < gBoard.length; k++) {
        for (var l = 0; l < gBoard[0].length; l++) {
            var elTempCoverDiv = document.querySelector(`div.cell-${k}-${l}`)

            if (elTempCoverDiv.innerText === '🚩') {
                if (!gBoard[k][l].cell.isMine) {
                    elTempCoverDiv.innerText = '❌'
                    continue
                }
                elTempCoverDiv.innerText = ''
                var elTempCell = document.querySelector(`td.cell.cell-${k}-${l}`)
                // console.log('elTempCell', elTempCell)
                elTempCell.style.backgroundColor = 'pink'
            }

            elTempCoverDiv.classList.remove('closed')
        }
    }
}

// prevBoards.push(copyMatOfObjects(gBoard))
// console.log('prevBoards', prevBoards)
// }

// Game ends when all mines are
// marked, and all the other cells
// are shown
function checkGameOver() {
    // console.log('gGame.markedCount', gGame.markedCount)
    // console.log('gGame.shownCount', gGame.shownCount)
    if (gGame.markedCount + gGame.shownCount === gLevel.SIZE ** 2) {
        bestScore()
        gElSmiley.innerText = '😎'
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
// *See how you can hide the context
// menu on right-click*
function onCellMarked(ev, elClosedDiv, i, j) {
    elClosedDiv.addEventListener("contextmenu", (e) => { e.preventDefault() })

    if (ev.button === 0 || ev.button === 1 || gGame.isManual) return
    // console.log('hi from flagMark')
    // console.log('ev', ev)

    if (!gGame.isOn /*&& gGame.shownCount === 0*/) return

    if (gBoard[i][j].cell.isMarked) {
        elClosedDiv.querySelector('span').innerText = ''
        gBoard[i][j].cell.isMarked = false
        gGame.markedCount--
        gElMineCounter.innerText = +gElMineCounter.innerText + 1
        return
    }

    gBoard[i][j].cell.isMarked = true
    elClosedDiv.querySelector('span').innerText = '🚩'
    gGame.markedCount++
    gElMineCounter.innerText = +gElMineCounter.innerText - 1
    checkGameOver()
    // console.log('gBoard[i][j]', gBoard[i][j])
}

// end game
function gameOver(msg) {
    gGame.isOn = false
    clearInterval(gTimeInterval)

    gElModal.querySelector('span').innerText = msg
    gElModal.style.display = 'block'
}

// choose difficulty
function setLevel(elBtn) {
    clearInterval(gTimeInterval)
    gMegaHintClick = {}

    gGame.isOn = true
    gLevel.SIZE = +elBtn.dataset.size
    gLevel.MINES = +elBtn.dataset.mines
    // console.log(size, mineAmount)

    // gGame.isOn = true
    onInit()
    gElMineCounter.innerText = gLevel.MINES
}

// if no mines around open surrounding neighbours
function openNeighbours(rowIdx, colIdx, mat) {
    var openedNeighbours = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= mat[i].length || mat[i][j].cell.isMarked) continue
            var elCoverDiv = document.querySelector(`div.cell-${i}-${j}`)
            if (!elCoverDiv.classList.contains('closed')) continue
            elCoverDiv.classList.remove('closed')
            gGame.shownCount++
            if (mat[i][j].cell.minesAroundCount === 0) openNeighbours(i, j, mat)
            // console.log('gGame.shownCount', gGame.shownCount)
            gBoard[i][j].cell.isShown = true
            openedNeighbours.push(elCoverDiv)
        }
    }
    return openedNeighbours
}

function openCloseNeighbours(rowIdx, colIdx, mat) {
    var openedNeighbours = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= mat[i].length || mat[i][j].cell.isMarked) continue
            var elCoverDiv = document.querySelector(`div.cell-${i}-${j}`)
            if (!elCoverDiv.classList.contains('closed')) continue
            elCoverDiv.classList.remove('closed')
            gGame.shownCount++
            // if (mat[i][j].cell.minesAroundCount === 0) openNeighbours(i, j, mat)
            // console.log('gGame.shownCount', gGame.shownCount)
            gBoard[i][j].cell.isShown = true
            openedNeighbours.push(elCoverDiv)
        }
    }
    return openedNeighbours

}

// hint mode
function hint(elBtn) {
    if (!gGame.isOn || gGame.isHint || elBtn.innerText === '👻') return
    elBtn.innerText = '💪'
    gGame.isHint = true
    gElTempHintBtn = elBtn
}

// use hint
function hintPlay(cover, i, j) {
    gElTempHintBtn.innerText = '👻'
    gGame.isHint = false

    cover.classList.remove('closed')
    var tempOpenedNeighbours = openCloseNeighbours(i, j, gBoard)

    setTimeout(() => {
        cover.classList.add('closed')
        for (var i = 0; i < tempOpenedNeighbours.length; i++) {
            tempOpenedNeighbours[i].classList.add('closed')

        }
    }, 1000)
}

// save best time model
function bestScore() {
    gGame.secsPassed = +gElTimer.innerText //(currTime() - gStartTime) / 1000

    calcBestTime(gLevel.SIZE)
    // switch (gLevel.SIZE) {

    //     case 4: {
    //         if (gGame.secsPassed < localStorage.getItem('bestScoreBeginner')) {
    //             // localStorage.clear()
    //             localStorage.setItem("bestScoreBeginner", gGame.secsPassed)

    //             var elSpan = document.querySelector('.beginner')
    //             elSpan.innerText = localStorage.getItem('bestScoreBeginner')
    //         }
    //         break;
    //     }

    //     case 8: {
    //         if (gGame.secsPassed < localStorage.getItem('bestScoreMedium')) {
    //             // localStorage.clear()
    //             localStorage.setItem("bestScoreMedium", gGame.secsPassed)

    //             var elSpan = document.querySelector('.medium')
    //             elSpan.innerText = localStorage.getItem('bestScoreMedium')
    //         }
    //         break;
    //     }

    //     case 12: {
    //         if (gGame.secsPassed < localStorage.getItem('bestScoreExpert')) {
    //             // localStorage.clear()
    //             localStorage.setItem("bestScoreExpert", gGame.secsPassed)

    //             var elSpan = document.querySelector('.expert')
    //             elSpan.innerText = localStorage.getItem('bestScoreExpert')
    //         }
    //         break;
    //     }
    // }
}

// display best time
function showBestTime(key, selector) {
    if (!localStorage.getItem(`${key}`)) {
        localStorage.setItem(`${key}`, Infinity)
    } else if (localStorage.getItem(`${key}`) !== 'Infinity') {
        var elSpan = document.querySelector(`.${selector}`)
        elSpan.innerText = localStorage.getItem(`${key}`)
    }
}

// saves best time to local storage
function calcBestTime(size) {
    var key
    // var selector

    switch (size) {

        case 4: {
            key = 'bestScoreBeginner'
            // selector = 'beginner'
            break;
        }

        case 8: {
            key = 'bestScoreMedium'
            // selector = 'medium'
            break;
        }

        case 12: {
            key = 'bestScoreExpert'
            // selector = 'expert'
            break;
        }
    }

    if (gGame.secsPassed < localStorage.getItem(`${key}`)) {
        // localStorage.clear()
        localStorage.setItem(`${key}`, gGame.secsPassed)

        // var elSpan = document.querySelector(`.${selector}`)
        // elSpan.innerText = localStorage.getItem(`${key}`)
    }
}

// gives 3 safe clicks
function safeClick() {
    if (gElSafeClickSpan.innerText === '0' || gGame.shownCount + gLevel.MINES === gLevel.SIZE ** 2) {
        gElSafeClickSpan.innerText = 'no'
        return
    }

    var row = getRandomIntInclusive(0, gLevel.SIZE - 1)
    var col = getRandomIntInclusive(0, gLevel.SIZE - 1)
    var elCover = document.querySelector(`.cover.cell-${row}-${col}`)

    // const tempPosFirst = {}
    // const tempPosSecond = {}

    while (gBoard[row][col].cell.isMine || !elCover.classList.contains('closed')) {
        row = getRandomIntInclusive(0, gLevel.SIZE - 1)
        col = getRandomIntInclusive(0, gLevel.SIZE - 1)

        // while (gElSafeClickSpan.innerText === '2' && tempPosFirst.i === row
        //     && tempPosFirst.j === col
        // ) {
        //     // tempPosFirst.i = row
        //     // tempPosFirst.j = col
        //     row = getRandomIntInclusive(0, gLevel.SIZE - 1)
        //     col = getRandomIntInclusive(0, gLevel.SIZE - 1)
        //     // tempPosSecond.i = row
        //     // tempPosSecond.j = col
        // }

        // while (gElSafeClickSpan.innerText === '1' && tempPosSecond.i === row
        //     && tempPosSecond.j === col
        // ) {
        //     row = getRandomIntInclusive(0, gLevel.SIZE - 1)
        //     col = getRandomIntInclusive(0, gLevel.SIZE - 1)
        //     // tempPosSecond.i = row
        //     // tempPosSecond.j = col
        // }

        elCover = document.querySelector(`.cover.cell-${row}-${col}`)

        // if (gElSafeClickSpan.innerText === '2') {
        //     tempPosFirst.i = row
        //     tempPosFirst.j = col
        // }

        // if (gElSafeClickSpan.innerText === '1') {
        //     tempPosSecond.i = row
        //     tempPosSecond.j = col
        // }
    }

    gElSafeClickSpan.innerText = + gElSafeClickSpan.innerText - 1
    elCover.innerText = '🟢' //'✔'

    setTimeout(() => {
        elCover.innerText = ''
    }, 2000)

}

// starts manual mode
function manuallyCreate() {
    if (gLevel.SIZE === 0) return

    gGame.isManual = true
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j].cell.isMine = false
        }
    }

    gMinesRows = []
    gMinesCols = []

    gElMineCounter.innerText = 0
    // gLevel.MINES = 0
}

// sets mine at cell clicked
function setMine(row, col) {
    gBoard[row][col].cell.isMine = true
    gElMineCounter.innerText = +gElMineCounter.innerText + 1

    gMinesRows.push(row)
    gMinesCols.push(col)
    // gLevel.MINES++
}

// renders new board
function set() {
    gElSet.style.display = 'none'
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].cell.isShown = false
        }
    }
    gGame.shownCount = 0
    gGame.markedCount = 0
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board')
    gGame.isManual = false
}

// resets the board 1 step back
function undo() {
    if (prevBoards.length === 0) return

    gMinesRows = []
    gMinesCols = []

    //     for (var i = 0; i < tempBoard.length; i++) {

    //         if (tempBoard[i].cell.isShown && !prevBoards[i - 1].cell.isShown)

    // }

    var tempBoard = prevBoards.pop()
    setMinesNegsCount(gBoard)
    renderBoard(tempBoard, '.board')

    var mineCount = 0 //= +gElMineCounter.innerText

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            // if (gBoard[i][j].cell.isShown) gBoard[i][j].cell.isShown = false

            var elTempCell = document.querySelector(`td.cell-${i}-${j}`)

            if (elTempCell.innerText === '💣') {
                //     gBoard[i][j].cell.isMine = true
                //     elTempCell.style.backgroundColor = 'red'
                gBoard[i][j].cell.isMine = true
                mineCount++
                gMinesRows.push(i)
                gMinesCols.push(j)

                if (gBoard[i][j].cell.isShown) {
                    var elTempCell = document.querySelector(`td.cell-${i}-${j}`)

                    if (elTempCell.innerText === '💣') elTempCell.style.backgroundColor = 'red'
                }
            }
        }
    }

    gElMineCounter.innerText = mineCount

    // console.log('prevBoards', prevBoards)
}

// copies matrix of objects
function copyMatOfObjects(mat) {
    var newMat = []
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = []
        for (var j = 0; j < mat[0].length; j++) {
            // newMat[i][j] =Object.assign({}, mat[i][j])
            newMat[i].push({ cell: Object.assign({}, mat[i][j].cell), position: { i, j } })
        }
    }
    return newMat
}

// toggle dark mode
function toggleDarkMode() {
    var elBody = document.querySelector('body')
    elBody.classList.toggle('invert')

    // gElSmiley.innerText="👹"
}

// set mega hint mode
function megaHint() {
    if (gGame.isMegaHint) return
    gGame.isMegaHint = true
    gPlayMegaHint = true
}

// play mega hint
function setMegaHint(endRow, endCol) {

    for (var i = gMegaHintClick.i; i <= endRow; i++) {
        for (var j = gMegaHintClick.j; j <= endCol; j++) {
            if (gBoard[i][j].cell.isShown) continue

            var elcover = document.querySelector(`div.cell-${i}-${j}`)
            if (elcover.classList.contains('closed')) elcover.classList.remove('closed')
        }
    }

    gPlayMegaHint = false

    setTimeout(() => {
        for (var i = gMegaHintClick.i; i <= endRow; i++) {
            for (var j = gMegaHintClick.j; j <= endCol; j++) {
                if (gBoard[i][j].cell.isShown) continue
                var elcover = document.querySelector(`div.cell-${i}-${j}`)
                elcover.classList.add('closed')
            }
        }

    }, 2000)
}

// removes 3 mines
function exterminate() {
    if (gIsExterminating) return
    if (gMinesRows.length < 3) return

    gGame.isExterminated = true

    prevBoards.push(copyMatOfObjects(gBoard))

    // console.log('minesPositions', gMinesPositions)
    gIsExterminating = true
    for (var i = 0; i < 3; i++) {
        var index = getRandomIntInclusive(0, gMinesRows.length - 1)
        var rowPos = gMinesRows.splice(index, 1)
        var colPos = gMinesCols.splice(index, 1)
        //gMinesPositions[index]
        // console.log('example',gMinesPositions.splice(index, 1))
        if (gBoard[rowPos][colPos].cell.isShown) {
            // var elTempCell = document.querySelector(`td.cell-${rowPos}-${colPos}`)

            // if (elTempCell.innerText === '💣') elTempCell.style.backgroundColor = 'red'

            i--
            continue
        }

        gBoard[rowPos][colPos].cell.isMine = false

        // gLevel.MINES--
        gElMineCounter.innerText = +gElMineCounter.innerText - 1
        // console.log('minesPositions', gMinesPositions)

        // var elCover = document.querySelector(`div.cell-${pos.i}-${pos.j}`)
        // el


        // for (var i = 0; i < gBoard.length; i++) {
        //     for (var j = 0; j < gBoard.length; j++) {
        //         var elTempCell = document.querySelector(`td.cell-${i}-${j}`)
        //         if (elTempCell.innerText === '💣') {
        //             gBoard[i][j].cell.isMine = true
        //             elTempCell.style.backgroundColor = 'red'

        //         }
        //     }
        // }

        // console.log('prevBoards', prevBoards)
    }

    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board')

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].cell.isShown) {
                var elTempCell = document.querySelector(`td.cell-${i}-${j}`)

                if (elTempCell.innerText === '💣') elTempCell.style.backgroundColor = 'red'
            }
        }
    }

    // for (var i = 0; i < gBoard.length; i++) {
    //     for (var j = 0; j < gBoard[0].length; j++) {
    //         var elTempCell = document.querySelector(`td.cell-${i}-${j}`)
    //         if (elTempCell.innerText === '💣' && gBoard[i][j].isShown) {
    //             // gBoard[i][j].cell.isMine = true
    //             elTempCell.style.backgroundColor = 'red'
    //             // mineCount++
    //         }
    //     }
    // }

    gIsExterminating = false
}