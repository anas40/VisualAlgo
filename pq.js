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
            let greater = c1
            if (this.heap[greater].priority > this.heap[c2].priority)
                greater = c2
            if (this.heap[idx].priority > this.heap[greater].priority) {
                swap(greater, idx, this.heap)
                this.sink(greater)
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

let pq = new PQ()
pq.push({})