window.addEventListener('load', () => {
    let box = document.querySelector('.box');
    box.addEventListener('click', startBFS);
    document.querySelector('#generateGridButton').addEventListener('click', newGrid)
    generateGrid()
});

let row = 5
let col = 5


function checkoverflow(box) {
    let width = box.offsetWidth
    let height = box.offsetHeight
    console.log(height, screen.height * .80);
    console.log(width, screen.width * .80);

    if (height > screen.height * 0.80) {
        box.style.overflowY = 'scroll'
        box.style.height = `${screen.height * .80}px`
    }
    if (width > screen.width * 0.80) {
        box.style.overflowX = 'scroll'
        box.style.width = `${screen.width * .80}px`
    }
}
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
    checkoverflow(box)
}

function newGrid() {
    let grow = document.querySelector('#rows').value
    let gcolumn = document.querySelector('#columns').value
    if (!grow || !gcolumn) {
        console.log("Not row or not column");
        return
    }
    console.log("check1");
    grow = Math.floor(parseInt(grow))
    gcolumn = Math.floor(parseInt(gcolumn))
    if (gcolumn <= 0 || grow <= 0) {
        console.log("Less than 0",grow,gcolumn);
        return
    }
    row = grow
    col = gcolumn
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
    selectedBox.classList.remove('inQueue')
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
    }
}
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function startBFS(event) {
    const start = event.target.innerText
    const time = 500;
    const moves = [{ f: 0, s: 1 }, { f: 0, s: -1 }, { f: 1, s: 0 }, { f: -1, s: 0 }]
    let visited = emptyArray(row, col);

    let selectedI = Math.floor(start / col);
    let selectedJ = Math.floor(start % col);

    let queue = [];
    queue.push({ i: selectedI, j: selectedJ });
    while (queue.length>0) {
        let { i, j } = queue.shift();
        let num = i * col + j;
        
        if (visited[i][j]) continue;
        visited[i][j] = 1
        boxSelected(num)
        await sleep(time)
        
        moves.forEach(move => {
            if (i + move.f >= 0 && i + move.f < row && j + move.s >= 0 && j + move.s < col && !visited[i + move.f][j + move.s]) {
                queue.push({ i: i + move.f, j: j + move.s })
                boxInQueue((i + move.f) * col + j + move.s)
            }
        })

        boxVisited(num)
        await sleep(time)
    }
    boxReset(row * col)
}

