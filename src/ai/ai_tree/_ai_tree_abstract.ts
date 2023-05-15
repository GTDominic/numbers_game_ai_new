abstract class AITreeAbstract extends AIAbstract {
    protected debug = true;
    protected currentStep: number = 0;
    protected nodes: Array<{
        c: AIT_Node;
        type: "straightchain" | "chain" | "chainloop" | "loop";
        prio: number;
    }> = [];
    protected nextCrosses: Array<{ e1: { x: number; y: number }; e2: { x: number; y: number } }> = [];

    public step(): void {
        if (this.finished) return;
        if (this.nextCrosses.length !== 0) return this.cross();
        if (this.currentStep === 0) return this.buildTree();
        if (this.currentStep === 1) return this.prioTree();
        if (this.currentStep === 2) return this.createNextCrosses();
    }

    protected abstract prioTree(): void;
    protected abstract createNextCrosses(): void;

    protected countElements(chain: AIT_Node): number {
        if (chain.nextType === "e") return 1;
        if (chain.nextType === "l") return 0;
        let sum = 0;
        for (let n of chain.next) {
            sum += this.countElements(n);
        }
        return sum + 1;
    }

    protected checkForChainLoops(chain: AIT_Node): boolean {
        if (chain.nextType === "l") return true;
        let loop = false;
        for (let n of chain.next) if (this.checkForChainLoops(n)) loop = true;
        return loop;
    }

    protected checkStraight(chain: AIT_Node): boolean {
        if (chain.next.length > 1) return false;
        if (chain.next.length === 0) return true;
        return this.checkStraight(chain.next[0]);
    }

    private cross(): void {
        let e = this.nextCrosses.shift();
        this.board.cross(e.e1.x, e.e1.y, e.e2.x, e.e2.y);
    }

    private buildTree(): void {
        this.nodes = [];
        for (let y = 0; y < this.board.getSize(); y++) {
            for (let x = 0; x < 9; x++) {
                let value = this.board.getElement(x, y);
                if (value === null) continue;
                let neighbours = this.findNeighbours(x, y);
                if (neighbours.length !== 1) continue;
                let found = false;
                for (let n of this.nodes) if (this.findElementInChain(n.c, { x, y })) found = true;
                if (found) continue;
                this.nodes.push({ c: new AIT_Node({ x, y }, "start"), type: null, prio: null });
                this.buildChain(this.nodes[this.nodes.length - 1].c);
            }
        }
        for (let y = 0; y < this.board.getSize(); y++) {
            for (let x = 0; x < 9; x++) {
                let value = this.board.getElement(x, y);
                if (value === null) continue;
                let neighbours = this.findNeighbours(x, y);
                if (neighbours.length <= 1) continue;
                let found = false;
                for (let n of this.nodes) if (this.findElementInChain(n.c, { x, y })) found = true;
                if (found) continue;
                this.nodes.push({ c: new AIT_Node({ x, y }, "start"), type: "loop", prio: null });
                this.buildChain(this.nodes[this.nodes.length - 1].c);
            }
        }
        for (let node of this.nodes) {
            if (node.type === "loop") continue;
            node.type = this.checkForChainLoops(node.c) ? "chainloop" : "chain";
            if (node.type === "chain") node.type = this.checkStraight(node.c) ? "straightchain" : "chain";
        }
        if (this.debug) console.log(this.nodes);
        if (this.nodes.length === 0) {
            this.checkOrFinished();
            return;
        }
        this.currentStep++;
    }

    private buildChain(element: AIT_Node, totChain: AIT_Node = null): void {
        if (!totChain) totChain = element;
        if (element.nextType === "l") return;
        let neighbours = this.findNeighbours(element.pos.x, element.pos.y);
        element.nextType = neighbours.length === 1 ? (element.type === "start" ? "n" : "e") : "n";
        for (let i = 0; i < neighbours.length; i++) {
            let t = neighbours[i].type;
            let o = t === "b" ? "t" : t === "t" ? "b" : t === "l" ? "r" : "l";
            if (o === element.type) continue;
            let loop: "l" = this.findElementInChain(totChain, neighbours[i].pos) ? "l" : null;
            element.next.push(new AIT_Node(neighbours[i].pos, neighbours[i].type, loop));
        }
        for (let n of element.next) this.buildChain(n, totChain);
    }

    private findNeighbours(x: number, y: number): Array<{ pos: { x: number; y: number }; type: "t" | "b" | "l" | "r" }> {
        let tN: { pos: { x: number; y: number }; type: "t" | "b" | "l" | "r" } = {
            pos: this.board.findTopNeighbor(x, y - 1),
            type: "t",
        };
        let lN: { pos: { x: number; y: number }; type: "t" | "b" | "l" | "r" } = {
            pos: this.board.findLeftNeighbor(x - 1, y),
            type: "l",
        };
        let bN: { pos: { x: number; y: number }; type: "t" | "b" | "l" | "r" } = {
            pos: this.board.findBottomNeighbor(x, y + 1),
            type: "b",
        };
        let rN: { pos: { x: number; y: number }; type: "t" | "b" | "l" | "r" } = {
            pos: this.board.findRightNeighbor(x + 1, y),
            type: "r",
        };
        if (tN.pos !== null && lN.pos !== null) if (this.checkCoordinates(tN.pos, lN.pos)) lN.pos = null;
        if (bN.pos !== null && rN.pos !== null) if (this.checkCoordinates(bN.pos, rN.pos)) rN.pos = null;
        let neighbours: Array<{ pos: { x: number; y: number }; type: "t" | "b" | "l" | "r" }> = [];
        for (let n of [tN, lN, bN, rN]) {
            if (n.pos === null) continue;
            let v1 = this.board.getElement(x, y);
            let v2 = this.board.getElement(n.pos.x, n.pos.y);
            if (v1 !== v2 && v1 + v2 !== 10) continue;
            neighbours.push(n);
        }
        return neighbours;
    }

    private findElementInChain(chain: AIT_Node, search: { x: number; y: number }): boolean {
        if (this.checkCoordinates(chain.pos, search)) return true;
        if (chain.nextType === "l") return false;
        let found = false;
        for (let n of chain.next) if (this.findElementInChain(n, search)) found = true;
        return found;
    }

    private checkCoordinates(e1: { x: number; y: number }, e2: { x: number; y: number }): boolean {
        return e1.x === e2.x && e1.y === e2.y;
    }
}

class AIT_Node {
    public pos: { x: number; y: number };
    public next: Array<AIT_Node>;
    public nextType: "n" | "e" | "l";
    public type: "t" | "b" | "l" | "r" | "start";

    constructor(pos: { x: number; y: number }, type: "t" | "b" | "l" | "r" | "start", nextType: "l" = null) {
        this.pos = pos;
        this.next = [];
        this.nextType = nextType;
        this.type = type;
    }
}
