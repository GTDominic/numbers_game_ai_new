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
        if (this.debug) console.log(this.nextCrosses);
        this.currentStep = 0;
    }

    private crossStraight(chain: AIT_Node): void {
        if (!chain) return;
        if (chain.nextType === "e") return;
        this.nextCrosses.push({e1: chain.pos, e2: chain.next[0].pos});
        this.crossStraight(chain.next[0].next[0]);
    }

    private crossChain(chain: AIT_Node): void {
        
    }
}
