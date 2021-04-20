window.addEventListener('load', () => {
    document.querySelector('.box').addEventListener('click', selectBoxes);
    document.querySelector('#start').addEventListener('click', findPath);
    document.querySelector('#generateGridButton').addEventListener('click', newGrid)
    generateGrid()
});

let row = 12
let col = 12
let start = null
let end = null
const time = 100;
// array containing postion of walls
let walls = emptyArray(row, col)

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
    grow = getInt(grow)
    gcolumn = getInt(gcolumn)
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
    let selectedBox = document.querySelector(`#box${num}`);
    selectedBox.classList.remove('selected');
    selectedBox.classList.add('visited');
}
function boxReset() {
    generateGrid();
    start = null;
    end = null;
    walls = emptyArray(row, col);
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function selectBoxes(event) {
    //if parent is clicked then do nothing
    if (event.target.classList.contains('box')) return
    const num = parseInt(event.target.innerText)
    //if box is already selected and contains string
    if (isNaN(num)) return

    const selectedBox = document.querySelector(`#box${num}`)

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
        const [i, j] = getCoordinates(num, col);
        walls[i][j] = 1;
        selectedBox.classList.add('wall')
        selectedBox.innerText = "W"
    }
}
async function showSelectedPath(node) {
    let stack = []
    //putting path in stack array
    while (node !== null) {
        stack.push({ i: node.i, j: node.j });
        node = node.pre
    }
    //for path from start to end
    stack.reverse();
    //selecting all boxes
    let boxes = document.querySelector('.box').children
    //clearing the grid
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].classList.remove('inQueue')
        boxes[i].classList.remove('visited')
    }
    //displaying the selected path
    for (const child of stack) {
        const num = child.i * col + child.j;
        let selectedBox = document.querySelector(`#box${num}`);
        selectedBox.classList.add('visited');
        await sleep(time)
    }

}

async function findPath() {
    const moves = [{ i: 0, j: 1 }, { i: 0, j: -1 }, { i: 1, j: 0 }, { i: -1, j: 0 }]
    const visited = emptyArray(row, col);

    const [startI, startJ] = getCoordinates(start, col);
    visited[startI][startJ] = 1

    const pqueue = new PQ()
    pqueue.push({ i: startI, j: startJ, priority: priority(startI, startJ), pre: null });
    while (pqueue.size > 0) {
        const cur = pqueue.pop();
        const { i, j } = cur
        const num = i * col + j;
        if (num === end) {
            boxVisited(end);
            showSelectedPath(cur)
            break;
        };
        boxSelected(num)
        await sleep(time)

        moves.forEach(move => {
            const ni = i + move.i;
            const nj = j + move.j
            if (ni >= 0 && ni < row && nj >= 0 && nj < col && !visited[ni][nj] && !walls[ni][nj]) {
                pqueue.push({ i: ni, j: nj, priority: priority(ni, nj), pre: cur })
                boxInQueue(ni * col + nj)
                visited[ni][nj] = 1;
            }
        })

        boxVisited(num)
        await sleep(time)
    }
    await sleep(time * 50)
    boxReset()
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
function getInt(num) {
    return Math.floor(parseInt(num))
}
function priority(i, j) {
    const [ei, ej] = getCoordinates(end, col);
    return abs(i - ei) + abs(j - ej);
}

function getCoordinates(num, col) {
    return [Math.floor(num / col), Math.floor(num % col)];
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
                swap(smaller, idx, this.heap)
                this.sink(smaller)
            }
        } else if (c1 <= this.size && this.heap[idx].priority > this.heap[c1].priority) {
            swap(c1, idx, this.heap)
            this.sink(c1)
        }
    }

    swim(idx) {
        while (idx > 0) {
            let parent = Math.floor(idx / 2);
            if (parent > 0 && this.heap[parent].priority > this.heap[idx].priority)
                swap(parent, idx, this.heap);
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
        swap(1, this.size, this.heap)
        let max = this.heap[this.size]
        this.size--
        this.heap.pop()
        this.sink(1)
        return max
    }
}