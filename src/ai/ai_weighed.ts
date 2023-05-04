class AIWeighed extends AIAbstract {
    private currentStep: number = 0;
    private combinations: Array<{
        element: { x: number; y: number };
        neighbours: Array<{ x: number; y: number }>;
        prio: number;
    }> = [];

    public step(): void {
        if (this.finished) return;
        if (this.currentStep === 0) return this.findElements();
        if (this.currentStep === 1) return this.findNeighbours();
        if (this.currentStep === 2) return this.removeNotCrossable();
        if (this.currentStep === 3) return this.weighElements();
    }

    private findElements(): void {
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
            for (let n of [lN, rN, tN, bN]) if (n) c.neighbours.push(n);
        }
        this.currentStep++;
    }

    private removeNotCrossable(): void {
        for(let i = this.combinations.length - 1; i >= 0; i--) {
            let e1 = this.combinations[i].element;
            let e1v = this.board.getElement(e1.x, e1.y);
            for(let j = this.combinations[i].neighbours.length - 1; j >= 0; j--) {
                let e2 = this.combinations[i].neighbours[j];
                let e2v = this.board.getElement(e2.x, e2.y);
                if(e1v !== e2v && e1v + e2v !== 10) this.combinations[i].neighbours.splice(j, 1);
            }
            if(this.combinations[i].neighbours.length === 0) this.combinations.splice(i, 1);
        }
        this.currentStep++;
    }

    private weighElements(): void {
        if(this.combinations.length === 0) {
            this.checkOrFinished();
            this.currentStep = 0;
            return;
        }
        for(let i = 0; i < this.combinations.length; i++) {
            if(this.combinations[i].neighbours.length === 1) this.weigh1Neighbor(i);
            else if(this.combinations[i].neighbours.length === 4) this.weigh4Neighbor(i);
            else this.weigh23Neighbor(i);
        }
        console.log(this.combinations);
    }

    private weigh1Neighbor(i: number): void {
        let n = this.combinations[i].neighbours[0];
        let j = this.findElement(n.x, n.y);
        this.combinations[i].prio = this.combinations[j].neighbours.length;
    }

    private weigh23Neighbor(i: number): void {
        let minPrio = this.combinations[i].neighbours.length;
        for(let j = 0; j < this.combinations[i].neighbours.length; j++) {
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

    private findElement(x: number, y: number): number {
        for(let i = 0; i < this.combinations.length; i++) {
            if(this.combinations[i].element.x === x && this.combinations[i].element.y === y) return i;
        }
    }
}
