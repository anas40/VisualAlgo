
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
                this.exchangeBlank(ni-move[0], nj-move[1]);
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

        let si = fi;
        let sj = this.randomInt(2) >= 1 ? 1 : -1;
        while (sj + fj < 0 || sj + fj > 2) {
            sj = this.randomInt(2) >= 1 ? 1 : -1;
        }
        sj = sj + fj;
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
        let pq = new PQ();
        let tpq = new PQ();
        let twin = initial.twin();
        pq.push(new Node(initial, null, 0));
        tpq.push(new Node(twin, null, 0));
        let count = 0;
        while (pq.size > 0 && tpq.size > 0) {
            if (count > 31) {
                console.log("moveBreak")
                break;
            }
            let node = pq.pop();
            let tnode = tpq.pop();
            if (node.board.isGoal() == true) {
                this.Solution = node;
                let copy = node;
                while (copy != null) {
                    this.stk.push(copy.board);
                    copy = copy.previos;
                }
                break;
            }
            if (tnode.board.isGoal() == true) {
                break;
            }

            node.board.neighbors().forEach(n => {
                if (node.previos != null && node.previos.board.equals(n.board) == false) {
                    let no = new Node(n, node, node.moves + 1);
                    pq.push(no);
                } else if (node.previos == null) {
                    let no = new Node(n, node, node.moves + 1);
                    pq.push(no);
                }
            })
            tnode.board.neighbors().forEach(n => {
                if (tnode.previos != null && tnode.previos.board.equals(n.board) == false) {
                    let no = new Node(n, tnode, tnode.moves + 1);
                    tpq.push(no);
                } else if (tnode.previos == null) {
                    let no = new Node(n, tnode, tnode.moves + 1);
                    tpq.push(no);
                }
            })
            count++;
        }
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
let tiles = [[1, 2, 3], [4, 6, 5], [0, 7, 8]]

let b = new Board(tiles);
let s = new Solver(b);
if (s.isSolvable()) {
    console.log("Solvable")
    s.solution().forEach(board => {
        console.log(board.toString())
    })
} else {
    console.log("Not Solvable")
}


