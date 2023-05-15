class AITree1 extends AITreeAbstract {
    /*
    Prios:
    4: Straight even
    5: Chain with even count
    6: Loop with even count
    7: Chainloop with even count
    11: Straight odd
    12: Chain with odd count
    13: Loop with odd count
    14: Chainloop with odd count
    */
    protected prioTree(): void {
        for (let node of this.nodes) {
            let length = this.countElements(node.c);
            if (node.type === "straightchain") node.prio = length % 2 === 0 ? 4 : 11;
            else if (node.type === "chain") node.prio = length % 2 === 0 ? 5 : 12;
            else if (node.type === "chainloop") node.prio = length % 2 === 0 ? 7 : 14;
            else node.prio = length % 2 === 0 ? 6 : 13;
        }
        if (this.debug) console.log(this.nodes);
        this.currentStep++;
    }

    protected createNextCrosses(): void {
        for (let prio = 1; prio <= 15; prio++) {
            for (let node of this.nodes) {
                if (node.prio !== prio) continue;
                this.crossesHandler(prio, node.c);
                return;
            }
        }
    }

    private crossesHandler(prio: number, chain: AIT_Node): void {
        if (prio === 4 || prio === 11) this.crossStraight(chain);
        if (prio === 5 || prio === 12) this.crossChain(chain);
        if ([6, 7, 13, 14].includes(prio)) this.crossLoops(chain);
        if (this.debug) console.log(this.nextCrosses);
        this.currentStep = 0;
    }

    private crossStraight(chain: AIT_Node): void {
        if (!chain) return;
        if (chain.nextType === "e") return;
        this.nextCrosses.push({ e1: chain.pos, e2: chain.next[0].pos });
        this.crossStraight(chain.next[0].next[0]);
    }

    private crossChain(chain: AIT_Node, before: AIT_Node = null): void {
        if (!before) before = chain;
        if (!this.checkStraight(chain)) {
            for (let n of chain.next) this.crossChain(n, chain);
            return;
        }
        let length = this.countElements(chain);
        if (length % 2 === 0) return this.crossStraight(chain);
        if (chain.type === before.type) return;
        this.nextCrosses.push({ e1: chain.pos, e2: before.pos });
        if (length === 1) return;
        this.crossStraight(chain.next[0]);
    }

    private crossLoops(chain: AIT_Node): void {
        this.removeLoops(chain);
        if(this.checkStraight(chain)) this.crossStraight(chain);
        else this.crossChain(chain);
    }

    private removeLoops(chain: AIT_Node): void {
        for (let i = chain.next.length - 1; i >= 0; i--) {
            if (chain.next[i].nextType === "l") {
                chain.next.splice(i, 1);
                if(chain.next.length === 0 && chain.type !== "start") chain.nextType = "e";
            } else this.removeLoops(chain.next[i]);
        }
    }
}
