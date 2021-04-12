window.addEventListener('load', () => {
    let box = document.querySelector('.box');
    box.addEventListener('click', selectBoxes);
    let start = document.querySelector('#start');
    start.addEventListener('click', findPath);
    document.querySelector('#generateGridButton').addEventListener('click', newGrid)
    generateGrid()
});


let row = 5
let col = 5
let start = null
let end = null
let walls = emptyArray(row, col)


function generateGrid() {
    document.querySelector('.box').style.gridTemplateColumns = `repeat(${col},1fr)`
    let counter = row * col;
    let box = document.querySelector('.box');
    box.innerHTML = ''
    for (let i = 0; i < counter; i++) {
        let div = document.createElement('div');
        div.id = `box${i}`;
        div.innerHTML = i;
        div.className = 'childBox';
        box.appendChild(div);
    }
}

function newGrid() {
    let grow = document.querySelector('#rows').value
    let gcolumn = document.querySelector('#columns').value
    if (!grow || !gcolumn) {
        console.log("Not row or not column");
        return
    }
    grow = Math.floor(parseInt(grow))
    gcolumn = Math.floor(parseInt(gcolumn))
    if (gcolumn <= 0 || grow <= 0) {
        console.log("Less than 0", grow, gcolumn);
        return
    }
    row = grow
    col = gcolumn
    walls = emptyArray(row,col)
    generateGrid()
}

function emptyArray(r, c) {
    let visited = new Array(r)
    for (let i = 0; i < r; i++) {
        visited[i] = new Array(c);
        visited[i].fill(0);
    }
    return visited
}

function boxSelected(num) {
    let selectedBox = document.querySelector(`#box${num}`)
    selectedBox.classList.remove('inStack')
    selectedBox.classList.add('selected')

}
function boxInQueue(num) {
    let selectedBox = document.querySelector(`#box${num}`)
    selectedBox.classList.add('inQueue')
}
function boxVisited(num) {
    let selectedBox = document.querySelector(`#box${num}`)
    selectedBox.classList.remove('selected')
    selectedBox.classList.add('visited')
}
function boxReset(num) {
    for (let i = 0; i < num; i++) {
        let selectedBox = document.querySelector(`#box${i}`)
        selectedBox.classList.remove('visited')
        selectedBox.classList.remove('wall')
        selectedBox.classList.remove('start')
        selectedBox.classList.remove('end')
        selectedBox.classList.remove('inQueue')

        selectedBox.innerText = i
    }
    start = null
    end = null
    walls = emptyArray(row, col)
}
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function selectBoxes(event) {
    let num = parseInt(event.target.innerText)
    let selectedBox = document.querySelector(`#box${num}`)

    if (start===null) {
        start = num
        selectedBox.classList.add('start')
        selectedBox.innerText = "Start"
    }
    else if(end === null) {
        end = num
        selectedBox.classList.add('end')
        selectedBox.innerText = "End"
    }
    else {
        let i = Math.floor(num / col);
        let j = Math.floor(num % col);
        walls[i][j] = 1;
        selectedBox.classList.add('wall')
        selectedBox.innerText = "Wall"
    }
}

async function findPath(event) {
    const time = 100;
    const moves = [{ f: 0, s: 1 }, { f: 0, s: -1 }, { f: 1, s: 0 }, { f: -1, s: 0 }]
    let visited = emptyArray(row, col);

    let selectedI = Math.floor(start / col);
    let selectedJ = Math.floor(start % col);
    visited[selectedI][selectedJ] = 1

    let queue = [];
    queue.push({ i: selectedI, j: selectedJ });
    while (queue.length > 0) {
        let { i, j } = queue.shift();
        let num = i * col + j;
        if (num === end) break;
        boxSelected(num)
        await sleep(time)

        moves.forEach(move => {
            if (i + move.f >= 0 && i + move.f < row && j + move.s >= 0 && j + move.s < col && !visited[i + move.f][j + move.s] && !walls[i+move.f][j+move.s]) {
                queue.push({ i: i + move.f, j: j + move.s })
                boxInQueue((i + move.f) * col + j + move.s)
                visited[i + move.f][j + move.s] = 1;
            }
        })

        boxVisited(num)
        await sleep(time)
    }
    boxReset(row * col)
}

