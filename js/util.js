//בס"ד

'use strict'

// get random number inclusive
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// get curr time in milisec
function currTime() {
    return Date.now()
}

// get timer
function timer(startTime, element) {
    var time
    gTimeInterval = setInterval(() => {
        time = currTime() - startTime
        element.innerText = `${time / 1000}`
    }, 1)
}


