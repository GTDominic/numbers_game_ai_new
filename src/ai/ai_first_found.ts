class AIFirstFound extends AIAbstract {
    public step(): void {
        if (this.finished) return;
        let searching: boolean = false;
        let stop: boolean = false;
        let sx: number = 0;
        let sy: number = 0;
        while (!searching && !stop) {
            let neighbor = this.board.findBottomNeighbor(sx, sy + 1);
            if (neighbor) searching = this.board.cross(sx, sy, neighbor.x, neighbor.y);
            if (searching) return;
            neighbor = this.board.findRightNeighbor(sx + 1, sy);
            if (neighbor) searching = this.board.cross(sx, sy, neighbor.x, neighbor.y);
            if (searching) return;
            if (sx === 8) {
                sx = 0;
                sy++;
            } else sx++;
            if (!this.board.checkPosition(sx, sy)) stop = true;
        }
        this.checkOrFinished();
    }
}
