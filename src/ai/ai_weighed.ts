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
            if (c.neighbours[i].type === "t" && c.neighbours[i + 1].type === "l" && this.checkIdentical(c.neighbours[i], c.neighbours[i + 1])) {
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
        let j = this.findElement(n.x, n.y);
        this.combinations[i].prio = this.combinations[j].neighbours.length;
    }

    private weigh23Neighbor(i: number): void {
        let minPrio = this.combinations[i].neighbours.length;
        for (let j = 0; j < this.combinations[i].neighbours.length; j++) {
            let n = this.combinations[i].neighbours[j];
            let k = this.findElement(n.x, n.y);
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
        // Execute first prio 1 combination
        for (let c of this.combinations) {
            if (c.prio !== 1) continue;
            let crossed = this.board.cross(c.element.x, c.element.y, c.neighbours[0].x, c.neighbours[0].y);
            if (crossed) {
                this.currentStep = 0;
                return;
            }
        }
        for (let c of this.combinations)
            if (c.prio === 2 && c.neighbours.length === 1) {
                c.prio = 1;
                return;
            }
        console.log("No code for combinations!");
        this.firstFound();
    }

    private findElement(x: number, y: number): number {
        for (let i = 0; i < this.combinations.length; i++) {
            if (this.combinations[i].element.x === x && this.combinations[i].element.y === y) return i;
        }
    }

    private checkIdentical(e1: { x: number; y: number }, e2: { x: number; y: number }): boolean {
        return e1.x === e2.x && e1.y === e2.y;
    }

    private firstFound(): void {
        console.warn("First Found!");
        let searching: boolean = false;
        let stop: boolean = false;
        let sx: number = 0;
        let sy: number = 0;
        while (!searching && !stop) {
            let neighbor = this.board.findBottomNeighbor(sx, sy + 1);
            if (neighbor) searching = this.board.cross(sx, sy, neighbor.x, neighbor.y);
            if (searching) {
                this.currentStep = 0;
                return;
            }
            neighbor = this.board.findRightNeighbor(sx + 1, sy);
            if (neighbor) searching = this.board.cross(sx, sy, neighbor.x, neighbor.y);
            if (searching) {
                this.currentStep = 0;
                return;
            }
            if (sx === 8) {
                sx = 0;
                sy++;
            } else sx++;
            if (!this.board.checkPosition(sx, sy)) stop = true;
        }
    }
}
