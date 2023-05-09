class AIWeighed extends AIAbstract {
    private currentStep: number = 0;
    private combinations: Array<{
        element: { x: number; y: number };
        neighbours: Array<{ x: number; y: number; type: string }>;
        prio: number;
    }>;

    public step(): void {
        if (this.finished) return;
        if (this.currentStep === 0) return this.findElements();
        if (this.currentStep === 1) return this.findNeighbours();
        if (this.currentStep === 2) return this.removeNotCrossable();
        if (this.currentStep === 3) return this.weighElements();
        if (this.currentStep === 4) return this.executeStep();
    }

    private findElements(): void {
        this.combinations = [];
        for (let y = 0; y < this.board.getSize(); y++) {
            for (let x = 0; x < 9; x++) {
                if (this.board.getElement(x, y) !== null) this.combinations.push({ element: { x, y }, neighbours: [], prio: null });
            }
        }
        this.currentStep++;
    }

    private findNeighbours(): void {
        for (let c of this.combinations) {
            let lN = this.board.findLeftNeighbor(c.element.x - 1, c.element.y);
            let rN = this.board.findRightNeighbor(c.element.x + 1, c.element.y);
            let tN = this.board.findTopNeighbor(c.element.x, c.element.y - 1);
            let bN = this.board.findBottomNeighbor(c.element.x, c.element.y + 1);
            let n = [tN, lN, bN, rN];
            let nt = ["t", "l", "b", "r"];
            for (let i = 0; i < n.length; i++) if (n[i]) c.neighbours.push({ x: n[i].x, y: n[i].y, type: nt[i] });
        }
        this.board.refreshStats();
        this.currentStep++;
    }

    private removeNotCrossable(): void {
        for (let i = this.combinations.length - 1; i >= 0; i--) {
            let e1 = this.combinations[i].element;
            let e1v = this.board.getElement(e1.x, e1.y);
            for (let j = this.combinations[i].neighbours.length - 1; j >= 0; j--) {
                let e2 = this.combinations[i].neighbours[j];
                let e2v = this.board.getElement(e2.x, e2.y);
                if (e1v !== e2v && e1v + e2v !== 10) this.combinations[i].neighbours.splice(j, 1);
            }
            if (this.combinations[i].neighbours.length === 0) this.combinations.splice(i, 1);
        }
        this.findDoubles();
        this.currentStep++;
    }

    private findDoubles(): void {
        for (let c of this.combinations) {
            if (c.neighbours.length === 1) continue;
            let i = 0;
            if (
                c.neighbours[i].type === "t" &&
                c.neighbours[i + 1].type === "l" &&
                this.checkIdentical(c.neighbours[i], c.neighbours[i + 1])
            ) {
                c.neighbours.splice(i + 1, 1);
            }
            if (c.neighbours.length === 1) continue;
            i = null;
            for (let j = 0; j < c.neighbours.length - 1; j++) if (c.neighbours[j].type === "b") i = j;
            if (i !== null && this.checkIdentical(c.neighbours[i], c.neighbours[i + 1])) {
                c.neighbours.splice(i + 1, 1);
            }
        }
    }

    private weighElements(): void {
        if (this.combinations.length === 0) {
            this.checkOrFinished();
            this.currentStep = 0;
            return;
        }
        for (let i = 0; i < this.combinations.length; i++) {
            if (this.combinations[i].neighbours.length === 1) this.weigh1Neighbor(i);
            else if (this.combinations[i].neighbours.length === 4) this.weigh4Neighbor(i);
            else this.weigh23Neighbor(i);
        }
        this.currentStep++;
    }

    private weigh1Neighbor(i: number): void {
        let n = this.combinations[i].neighbours[0];
        let j = this.findElement(n);
        this.combinations[i].prio = this.combinations[j].neighbours.length;
    }

    private weigh23Neighbor(i: number): void {
        let minPrio = this.combinations[i].neighbours.length;
        for (let j = 0; j < this.combinations[i].neighbours.length; j++) {
            let n = this.combinations[i].neighbours[j];
            let k = this.findElement(n);
            let kl = this.combinations[k].neighbours.length;
            minPrio = kl > minPrio ? kl : minPrio;
        }
        this.combinations[i].prio = minPrio;
    }

    private weigh4Neighbor(i: number): void {
        this.combinations[i].prio = 4;
    }

    private executeStep(): void {
        console.log(this.combinations);
        this.findTElements();
        for (let c of this.combinations) {
            if (c.prio !== 0) continue;
            let crossed = this.board.cross(c.element.x, c.element.y, c.neighbours[0].x, c.neighbours[0].y);
            if (crossed) {
                this.currentStep = 0;
                return;
            }
        }
        // Execute first prio 1 combination
        for (let c of this.combinations) {
            if (c.prio !== 1) continue;
            let crossed = this.board.cross(c.element.x, c.element.y, c.neighbours[0].x, c.neighbours[0].y);
            if (crossed) {
                this.currentStep = 0;
                return;
            }
        }
        this.find3Elements();
        let found = this.find4Elements();
        if (found) return;
        found = this.findChains();
        if (found) return;
        console.warn("No code for combinations!");
        return;
        for (let prio = 1; prio <= 5; prio++) {
            for (let c of this.combinations) {
                if (c.prio !== prio) continue;
                let crossed = this.board.cross(c.element.x, c.element.y, c.neighbours[0].x, c.neighbours[0].y);
                if (crossed) {
                    this.currentStep = 0;
                    return;
                }
            }
        }
    }

    private findTElements(): void {
        for (let c of this.combinations) {
            if (c.prio !== 3 || c.neighbours.length !== 3) continue;
            let correct = true;
            for (let n of c.neighbours) {
                if (this.combinations[this.findElement(n)].neighbours.length !== 1) correct = false;
            }
            if (!correct) continue;
            let directions: Array<string> = [];
            for (let n of c.neighbours) {
                directions.push(n.type);
            }
            if (G_compareArrays(directions, ["t", "l", "b"])) this.combinations[this.findElement(c.neighbours[1])].prio = 0;
            if (G_compareArrays(directions, ["t", "l", "r"])) this.combinations[this.findElement(c.neighbours[0])].prio = 0;
            if (G_compareArrays(directions, ["t", "b", "r"])) this.combinations[this.findElement(c.neighbours[2])].prio = 0;
            if (G_compareArrays(directions, ["l", "b", "r"])) this.combinations[this.findElement(c.neighbours[1])].prio = 0;
            return;
        }
    }

    // Set 3 Elements as prio 5
    private find3Elements(): void {
        for (let c of this.combinations) {
            if (c.prio !== 2 || c.neighbours.length !== 2) continue;
            let correct = true;
            for (let n of c.neighbours) {
                if (this.combinations[this.findElement(n)].neighbours.length !== 1) correct = false;
            }
            if (!correct) continue;
            c.prio = 5;
            for (let n of c.neighbours) {
                this.combinations[this.findElement(n)].prio = 5;
            }
        }
    }

    private find4Elements(): boolean {
        for (let c of this.combinations) {
            if (c.prio !== 2 || c.neighbours.length !== 2) continue;
            let e1;
            let e2 = c;
            let e3;
            let e4;
            let n1 = this.combinations[this.findElement(e2.neighbours[0])];
            let n2 = this.combinations[this.findElement(e2.neighbours[1])];
            if (n1.neighbours.length === 1) {
                e1 = n1;
                e3 = n2;
            } else {
                e1 = n2;
                e3 = n1;
            }
            if (e3.neighbours.length !== 2 || e1.neighbours.length !== 1) continue;
            n1 = this.combinations[this.findElement(e3.neighbours[0])];
            n2 = this.combinations[this.findElement(e3.neighbours[1])];
            if (n1.neighbours.length === 1) e4 = n1;
            else e4 = n2;
            if (e4.neighbours.length !== 1) continue;
            e1.prio = 0;
            return true;
        }
        return false;
    }

    private findChains(): boolean {
        let chains: Array<
            Array<{
                element: { x: number; y: number };
                neighbours: Array<{ x: number; y: number; type: string }>;
                prio: number;
            }>
        > = [];
        for (let c of this.combinations) {
            if (c.neighbours.length !== 1) continue;
            let error = false;
            for (let chain of chains) for (let element of chain) if (this.checkIdentical(element.element, c.element)) error = true;
            if (error) continue;
            chains.push([c]);
            let j = chains.length - 1;
            chains[j].push(this.combinations[this.findElement(c.neighbours[0])]);
            if (chains[j][1].neighbours.length !== 2) {
                chains.pop();
                continue;
            }
            let i = 1;
            while (chains[j][i].neighbours.length === 2) {
                let o = chains[j][i - 1];
                let n1 = this.combinations[this.findElement(chains[j][i].neighbours[0])];
                let n2 = this.combinations[this.findElement(chains[j][i].neighbours[1])];
                if (this.checkIdentical(o.element, n1.element)) chains[j].push(n2);
                else chains[j].push(n1);
                i++;
                if (chains[j][i].neighbours.length > 2) {
                    chains.pop();
                    error = true;
                    break;
                }
            }
            if (error) continue;
        }
        if (chains.length === 0) return false;
        let even = false;
        for(let chain of chains) {
            if(chain.length % 2 !== 0) {
                for(let element of chain) element.prio = 5;
            } else {
                chain[0].prio = 0;
                even = true;
            }
        }
        return even;
    }

    private findElement(e: { x: number; y: number }): number {
        for (let i = 0; i < this.combinations.length; i++) {
            if (this.combinations[i].element.x === e.x && this.combinations[i].element.y === e.y) return i;
        }
    }

    private checkIdentical(e1: { x: number; y: number }, e2: { x: number; y: number }): boolean {
        return e1.x === e2.x && e1.y === e2.y;
    }
}
