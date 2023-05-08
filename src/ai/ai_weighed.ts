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
        for(let c of this.combinations) {
            if(c.prio !== 0) continue;
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
        console.warn("No code for combinations!");
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
            let i1 = this.findElement(c.neighbours[0]);
            let i2 = this.findElement(c.neighbours[1]);
            let i3;
            if (this.combinations[i1].neighbours.length === 1) {
                if (this.combinations[i2].neighbours.length === 2) {
                    if (this.checkIdentical(this.combinations[i2].neighbours[0], c.element))
                        i3 = this.findElement(this.combinations[i2].neighbours[1]);
                    else i3 = this.findElement(this.combinations[i2].neighbours[0]);
                } else continue;
            } else if (this.combinations[i1].neighbours.length === 2) {
                if (this.combinations[i2].neighbours.length === 1) {
                    if (this.checkIdentical(this.combinations[i1].neighbours[0], c.element))
                        i3 = this.findElement(this.combinations[i1].neighbours[1]);
                    else i3 = this.findElement(this.combinations[i1].neighbours[0]);
                } else continue;
            } else console.error("Unexpected Error");
            if (this.combinations[i3].neighbours.length !== 1) continue;
            if (this.combinations[i1].neighbours.length === 1) this.combinations[i1].prio = 1;
            else this.combinations[i2].prio = 2;
            return true;
        }
        return false;
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
