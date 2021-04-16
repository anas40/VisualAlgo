window.addEventListener('load', () => {
    let box = document.querySelector('.box');
    box.addEventListener('click', startDFS);
    document.querySelector('#generateGridButton').addEventListener('click', newGrid)
    generateGrid()
});

let row = 5
let col = 5


function checkoverflow(box) {
    let width = box.offsetWidth
    let height = box.offsetHeight

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
    let counter = row * col;
    let box = document.querySelector('.box');
    box.style.gridTemplateColumns = `repeat(${col},1fr)`
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
        console.log("Less than 0", grow, gcolumn);
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
    selectedBox.classList.remove('inStack')
    selectedBox.classList.add('selected')

}
function boxInStack(num) {
    let selectedBox = document.querySelector(`#box${num}`)
    selectedBox.classList.add('inStack')
}
function boxVisited(num) {
    let selectedBox = document.querySelector(`#box${num}`)
    selectedBox.classList.remove('selected')
    selectedBox.classList.add('visited')
}
function boxReset() {
    generateGrid();
}
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function startDFS(event) {
    const start = event.target.innerText
    if (isNaN(start)) return

    const time = 500;
    const moves = [{ i: 0, j: 1 }, { i: 0, j: -1 }, { i: 1, j: 0 }, { i: -1, j: 0 }]
    let visited = emptyArray(row, col);

    let startI = Math.floor(start / col);
    let startJ = Math.floor(start % col);
    visited[startI][startJ] = 1

    let stack = [];
    stack.push({ i: startI, j: startJ });
    while (stack.length > 0) {
        let { i, j } = stack.pop();
        let num = i * col + j;


        boxSelected(num)
        await sleep(time)

        moves.forEach(move => {
            const ni = i + move.i;
            const nj = j + move.j
            if (ni >= 0 && ni < row && nj >= 0 && nj < col && !visited[ni][nj]) {
                stack.push({ i: ni, j: nj })
                boxInStack(ni * col + nj)
                visited[ni][nj] = 1
            }
        })

        boxVisited(num)
        await sleep(time)
    }
    boxReset()
}

