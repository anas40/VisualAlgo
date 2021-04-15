window.addEventListener('load', () => {
    let box = document.querySelector('.box');
    box.addEventListener('click', selectBoxes);
    let start = document.querySelector('#start');
    start.addEventListener('click', findPath);
    document.querySelector('#generateGridButton').addEventListener('click', newGrid)
    generateGrid()
});

let row = 12
let col = 12
let start = null
let end = null

// array containing postion of walls
let walls = emptyArray(row, col)

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
//generates new grid according to user input
function generateGrid() {
    //creates UI grid with css grid template columns property
    let counter = row * col;
    
    let box = document.querySelector('.box');
    box.style.gridTemplateColumns = `repeat(${col},1fr)`
    box.innerHTML = ''
    // creates row*col divs
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
    grow = Math.floor(parseInt(grow))
    gcolumn = Math.floor(parseInt(gcolumn))
    if (gcolumn <= 0 || grow <= 0) {
        console.log("Less than 0", grow, gcolumn);
        return
    }
    row = grow
    col = gcolumn
    walls = emptyArray(row, col)
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
    pq = [0]
    size = 0
}
function showSelectedPath(num) {
    for (let i = 0; i < num; i++) {
        let selectedBox = document.querySelector(`#box${i}`)
        selectedBox.classList.remove('inQueue')
    }
}
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function selectBoxes(event) {
    let num = parseInt(event.target.innerText)
    let selectedBox = document.querySelector(`#box${num}`)

    if (start === null) {
        start = num
        selectedBox.classList.add('start')
        selectedBox.innerText = "S"
    }
    else if (end === null) {
        end = num
        selectedBox.classList.add('end')
        selectedBox.innerText = "E"
    }
    else {
        let i = Math.floor(num / col);
        let j = Math.floor(num % col);
        walls[i][j] = 1;
        selectedBox.classList.add('wall')
        selectedBox.innerText = "W"
    }
}


async function findPath() {
    const time = 100;
    const moves = [{ f: 0, s: 1 }, { f: 0, s: -1 }, { f: 1, s: 0 }, { f: -1, s: 0 }]
    let visited = emptyArray(row, col);

    let selectedI = Math.floor(start / col);
    let selectedJ = Math.floor(start % col);
    visited[selectedI][selectedJ] = 1

    let p = priority(selectedI, selectedJ)
    let pqueue = new PQ()
    pqueue.push({ i: selectedI, j: selectedJ, priority: p });
    while (pqueue.size > 0) {
        let { i, j } = pqueue.pop();
        // console.log(priority);
        let num = i * col + j;
        if (num === end) break;
        boxSelected(num)
        await sleep(time)

        moves.forEach(move => {
            if (i + move.f >= 0 && i + move.f < row && j + move.s >= 0 && j + move.s < col && !visited[i + move.f][j + move.s] && !walls[i + move.f][j + move.s]) {
                let pri = priority(i + move.f, j + move.s)
                pqueue.push({ i: i + move.f, j: j + move.s, priority: pri })
                boxInQueue((i + move.f) * col + j + move.s)
                visited[i + move.f][j + move.s] = 1;
            }
        })

        boxVisited(num)
        await sleep(time)
    }
    boxVisited(end)
    showSelectedPath(row*col)
    await sleep(time*50)

    boxReset(row * col)
}

function abs(val) {
    if (val < 0) return -val;
    return val
}
function swap(i, j, arr) {
    let t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
}

function priority(i, j) {
    let ei = Math.floor(end / col);
    let ej = Math.floor(end % col);
    return abs(i - ei) + abs(j - ej);
}

class PQ {
    //dummy fill position 0 for simpler sink and swim operations
    heap
    size

    constructor() {
        this.size = 0
        this.heap = [{ i: 0, j: 0, priority: Number.MAX_SAFE_INTEGER }]
    }

    sink(idx) {
        let c1 = idx * 2;
        let c2 = c1 + 1
        if (c2 <= this.size) {
            let smaller = c1
            if (this.heap[smaller].priority > this.heap[c2].priority)
                smaller = c2
            if (this.heap[idx].priority > this.heap[smaller].priority) {
                swap(smaller, idx,this.heap)
                this.sink(smaller)
            }
        } else if (c1 <= this.size && this.heap[idx].priority > this.heap[c1].priority) {
            swap(c1, idx,this.heap)
            this.sink(c1)
        }
    }

    swim(idx) {
        while (idx > 0) {
            let parent = Math.floor(idx / 2);
            if (parent > 0 && this.heap[parent].priority > this.heap[idx].priority)
                swap(parent, idx,this.heap);
            else
                break;
            idx = parent;
        }
    }

    push(val) {
        this.heap.push(val)
        this.size++;
        this.swim(this.size)
    }
    pop() {
        swap(1, this.size,this.heap)
        let max = this.heap[this.size]
        this.size--
        this.heap.pop()
        this.sink(1)
        return max
    }
}