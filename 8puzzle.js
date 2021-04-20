
class PQ {
    //dummy fill position 0 for simpler sink and swim operations
    //heap will contains nodes
    heap
    size

    constructor() {
        this.size = 0
        this.heap = [{ previos: null, board: null, moves: 0, priority: Number.MAX_SAFE_INTEGER }]
    }

    sink(idx) {
        let c1 = idx * 2;
        let c2 = c1 + 1
        if (c2 <= this.size) {
            let smaller = c1
            if (this.heap[smaller].priority > this.heap[c2].priority)
                smaller = c2
            if (this.heap[idx].priority > this.heap[smaller].priority) {
                this.swap(smaller, idx, this.heap)
                this.sink(smaller)
            }
        } else if (c1 <= this.size && this.heap[idx].priority > this.heap[c1].priority) {
            this.swap(c1, idx, this.heap)
            this.sink(c1)
        }
    }

    swim(idx) {
        while (idx > 0) {
            let parent = Math.floor(idx / 2);
            if (parent > 0 && this.heap[parent].priority > this.heap[idx].priority)
                this.swap(parent, idx, this.heap);
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
        this.swap(1, this.size, this.heap)
        let max = this.heap[this.size]
        this.size--
        this.heap.pop()
        this.sink(1)
        return max
    }
    swap(i, j) {
        let t = this.heap[i]
        this.heap[i] = this.heap[j]
        this.heap[j] = t
    }
}
class Node {
    previos;
    board;
    moves;
    priority;

    constructor(b, p, m) {
        this.board = b;
        this.previos = p;
        this.moves = m;
        this.priority = m + b.manhattan;
    }
}

class Board {
    board;
    size;
    hamming;
    manhattan;
    blankI;
    blankJ;

    // create a board from an n-by-n array of tiles,
    // where tiles[row][col] = tile at (row, col)
    constructor(tiles) {
        this.manhattan = 0;
        this.hamming = 0;

        this.size = tiles.length;
        this.board = this.emptyArray(this.size, this.size);
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = tiles[i][j];
                if (this.board[i][j] == 0) {
                    this.blankI = i;
                    this.blankJ = j;
                }

                let boardNum = this.abs(this.board[i][j] - (i * this.size + j + 1));
                if (boardNum != 0 && this.board[i][j] != 0) {
                    this.hamming++;
                    this.manhattan += boardNum % this.size + parseInt(boardNum / this.size);
                }
            }
        }

    }

    exchangeBlank(i, j) {
        let temp = this.board[i][j];
        this.board[i][j] = 0;
        this.board[this.blankI][this.blankJ] = temp;
        this.blankI = i;
        this.blankJ = j;
    }

    abs(num) {
        if (num < 0) {
            return -num;
        }
        return num;
    }
    // string representation of this board
    toString() {
        let out = this.size;
        for (let i = 0; i < this.size; i++) {
            out += "\n";
            for (let j = 0; j < this.size; j++) {
                out += this.board[i][j];
            }
        }
        return out;
    }
    emptyArray(r, c) {
        let arr = new Array(r)
        for (let i = 0; i < r; i++) {
            arr[i] = new Array(c);
            arr[i].fill(0);
        }
        return arr
    }

    // board dimension n
    dimension() {
        return this.size;
    }


    // is this board the goal board?
    isGoal() {
        if (this.hamming == 0) {
            return true;
        }
        return false;
    }

    equals(y) {
        if (this.size != y.length)
            return false;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (y[i][j] != this.board[i][j])
                    return false;
            }
        }
        return true;

    }

    // all neighboring boards
    neighbors() {
        let n = [];
        let moves = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        moves.forEach(move => {
            let ni = this.blankI + move[0];
            let nj = this.blankJ + move[1];
            if (ni < this.size && ni >= 0 && nj < this.size && nj >= 0) {
                this.exchangeBlank(ni, nj);
                let b = new Board(this.board);
                this.exchangeBlank(ni - move[0], nj - move[1]);
                n.push(b);
            }
        })
        return n;
    }

    exchange(i, j, si, sj) {
        let temp = this.board[i][j];
        this.board[i][j] = this.board[si][sj];
        this.board[si][sj] = temp;
    }
    randomInt(size = this.size) {
        return Math.floor((Math.random() * size))
    }
    // a board that is obtained by exchanging any pair of tiles
    twin() {
        let fi = this.randomInt();
        let fj = this.randomInt();
        while (fi === this.blankI && fj === this.blankJ) {
            fi = this.randomInt();
            fj = this.randomInt();
        }
        let si = this.randomInt();
        let sj = this.randomInt();
        while ((si === this.blankI && sj === this.blankJ) || (fi === si && fj === sj)) {
            si = this.randomInt();
            sj = this.randomInt();
        }

        this.exchange(si, sj, fi, fj);
        let b = new Board(this.board);
        this.exchange(si, sj, fi, fj);
        return b;
    }

}

class Solver {

    Solution;
    stk = [];

    // find a solution to the initial board (using the A* algorithm)
    constructor(initial) {
        this.Solution = null;
        if (!this.isValid(initial.board)) return
        let pq = new PQ();
        pq.push(new Node(initial, null, 0));
        while (pq.size > 0) {
            let node = pq.pop();
            if (node.moves > 50) {
                console.log("huge");
                break;
            }
            if (node.board.isGoal() == true) {
                this.Solution = node;
                let copy = node;
                while (copy != null) {
                    this.stk.push(copy.board.board);
                    copy = copy.previos;
                }
                break;
            }
            node.board.neighbors().forEach(n => {
                if (node.previos != null && node.previos.board.equals(n.board) == false) {
                    pq.push(new Node(n, node, node.moves + 1));
                } else if (node.previos == null) {
                    pq.push(new Node(n, node, node.moves + 1));
                }
            })
        }
    }
    isValid(board) {
        let flat = JSON.parse(JSON.stringify(board)).flat()
        let inversion = 0;
        for (let i = 0; i < flat.length; i++) {
            for (let j = i + 1; j < flat.length; j++) {
                if (flat[i] === 0 || flat[j] === 0) continue;
                if (flat[j] < flat[i]) inversion++
            }
        }
        if (inversion % 2 === 0) return true;
        return false;
    }

    // is the initial board solvable? (see below)
    isSolvable() {
        return this.Solution != null;
    }

    // min number of moves to solve initial board; -1 if unsolvable
    moves() {
        if (this.Solution == null)
            return -1;
        return this.Solution.moves;
    }

    // sequence of boards in a shortest solution; null if unsolvable
    solution() {
        let ans = [...this.stk]
        return ans.reverse()
    }
}

let row = 3
let col = 3
let images = [
    { id: 1, image: "./doge/1.png" },
    { id: 2, image: "./doge/2.png" },
    { id: 3, image: "./doge/3.png" },
    { id: 4, image: "./doge/4.png" },
    { id: 5, image: "./doge/5.png" },
    { id: 6, image: "./doge/6.png" },
    { id: 7, image: "./doge/7.png" },
    { id: 8, image: "./doge/8.png" },
    { id: 0, image: "" }]

let tiles = [[], [], []]


window.addEventListener('load', () => {
    document.querySelector('#shuffle').addEventListener('click', generateGrid)
    document.querySelector('#start').addEventListener('click', solve);
    generateGrid()
});
async function solve() {
    console.log(tiles);
    let board = new Board(tiles);
    let solver = new Solver(board);
    if (solver.isSolvable()) {
        let solution = solver.solution()
        for (const board of solution) {
            let box = document.querySelector('.box');
            box.innerHTML = ''

            for (let i = 0; i < 9; i++) {
                let div = document.createElement('div');
                let id = board[Math.floor(i / col)][i % col];
                div.id = `box${id}`;
                if (id === 0) {
                    div.innerHTML = ''
                }
                else {
                    div.innerHTML = `<img src="./doge/${id}.png" />`;
                }
                div.className = 'childBox';
                box.appendChild(div);
            }
            await sleep(500);
        }
        document.querySelector('#box0').innerHTML = '<img src="./doge/9.png" />'

    }
}
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function isValid() {
    let flat = JSON.parse(JSON.stringify(tiles)).flat()
    let inversion = 0;
    for (let i = 0; i < flat.length; i++) {
        for (let j = i + 1; j < flat.length; j++) {
            if (flat[i] === 0 || flat[j] === 0) continue;
            if (flat[j] < flat[i]) inversion++
        }
    }
    if (inversion % 2 === 0) return true;
    return false;
}
function getTiles(imagePos) {

    for (let i = 0; i < imagePos.length; i++){
        let id = imagePos[i].id;        
        tiles[Math.floor(i / col)][i % col] = id;
    }
}
function generateGrid() {
    document.querySelector('.box').style.gridTemplateColumns = `repeat(${col},1fr)`
    console.log("Generated");
    let counter = row * col;
    shuffle(images);
    getTiles(images);
    
    while (!isValid()) {
        console.log("Turn");
        shuffle(images);
        getTiles(images);
    }
    let box = document.querySelector('.box');
    box.innerHTML = ''

    for (let i = 0; i < counter; i++) {
        let div = document.createElement('div');
        let id = images[i].id;
        div.id = `box${id}`;
        div.innerHTML = `<img src="${images[i].image}" />`;
        div.className = 'childBox';
        box.appendChild(div);
    }
}
function shuffle(arr, n = 9) {
    for (let i = n - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}


