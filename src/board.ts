class Board {
    // 9xX => X-Coordinate from 0 to 8
    private board: Array<
        Array<{
            value: number;
            visible: boolean;
        }>
    >;
    private startarray: Array<number>;
    private autoDeleteRows: boolean;
    private checkPressed: number;
    private statDelRows: number = 0;
    private statCrossedElements: number = 0;
    private statCrossCalled: number = 0;
    private statNeighbor: number = 0;
    private statCheck: number = 0;
    private statShuffled: number = 0;

    constructor(array: Array<number>, autoDelete: boolean) {
        this.startarray = [...array];
        this.board = [[]];
        this.autoDeleteRows = autoDelete;
        this.checkPressed = 0;
        this.appendValues(array);
        this.drawHandler();
    }

    /**
     * Function to get the Value of an element
     * @param x x-Position
     * @param y y-Position
     * @returns Value of Element / null if Element not visible or not an element
     */
    public getElement(x: number, y: number): number {
        if (!this.checkPosition(x, y)) return null;
        return this.board[y][x].visible ? this.board[y][x].value : null;
    }

    /**
     * Function to get the y-size of the board
     * @returns Length of the board
     */
    public getSize(): number {
        return this.board.length;
    }

    /**
     * Checks whether Position is part of board
     * @param x x-Position
     * @param y y-Position
     * @returns true if element on board / false otherwise
     */
    public checkPosition(x: number, y: number): boolean {
        if (y < 0 || y >= this.board.length) return false;
        if (x < 0 || x >= this.board[y].length) return false;
        return true;
    }

    /**
     * Crosses two elements and performs necessary checks
     * @param x1 x-Coordinate of Element 1
     * @param y1 y-Coordinate of Element 1
     * @param x2 x-Coordinate of Element 2
     * @param y2 y-Coordinate of Element 2
     * @returns true if Elements crossed / false otherwise
     */
    public cross(x1: number, y1: number, x2: number, y2: number): boolean {
        let e1 = this.board[y1][x1];
        let e2 = this.board[y2][x2];
        this.statCrossCalled++;
        if (!e1.visible || !e2.visible) return false;
        if (e1.value !== e2.value && e1.value + e2.value !== 10) return false;
        let lN = this.findLeftNeighbor(x1 - 1, y1);
        let rN = this.findRightNeighbor(x1 + 1, y1);
        let uN = this.findTopNeighbor(x1, y1 - 1);
        let dN = this.findBottomNeighbor(x1, y1 + 1);
        let neighbor = false;
        if (lN) if (x2 === lN.x && y2 === lN.y) neighbor = true;
        if (rN) if (x2 === rN.x && y2 === rN.y) neighbor = true;
        if (uN) if (x2 === uN.x && y2 === uN.y) neighbor = true;
        if (dN) if (x2 === dN.x && y2 === dN.y) neighbor = true;
        if (!neighbor) return false;
        this.board[y1][x1].visible = false;
        this.board[y2][x2].visible = false;
        this.statCrossedElements += 2;
        this.checkPressed = 0;
        this.drawHandler();
        return true;
    }

    /**
     * Adds all visible values to the end of the board
     */
    public check(): boolean {
        this.statCheck++;
        let values: Array<number> = [];
        if (this.checkPressed === 2) this.shuffle();
        this.checkPressed++;
        for (let row of this.board) {
            for (let element of row) {
                if (element.visible) values.push(element.value);
            }
        }
        this.appendValues(values);
        this.drawHandler();
        return true;
    }

    /**
     * Shuffles the board
     */
    public shuffle(): void {
        let values: Array<number> = [];
        for (let row of this.board) for (let element of row) if (element.visible) values.push(element.value);
        G_shuffleNumberArray(values);
        this.board = [[]];
        this.appendValues(values);
        this.checkPressed = 0;
        this.statShuffled++;
        this.drawHandler();
    }

    /**
     * checks whether visible elements exist
     * @returns true if no visible elements / false otherwise
     */
    public checkFinished(): boolean {
        for (let row of this.board) {
            for (let element of row) {
                if (element.visible) return false;
            }
        }
        return true;
    }

    /**
     * Checks for empty rows and deletes them
     */
    public deleteEmptyRows(): void {
        let empty: boolean;
        for (let y = this.board.length - 1; y >= 0; y--) {
            empty = true;
            if (this.board[y].length !== 9) continue;
            for (let element of this.board[y]) {
                if (element.visible) empty = false;
            }
            if (!empty) continue;
            this.statDelRows++;
            this.board.splice(y, 1);
        }
        this.drawHandler(true);
    }

    /**
     * function to find the upper neighbor of an element
     * @param x x-Coordinate of the element one above
     * @param y y-Coordinate of the element one above
     * @returns Coordinate of the neighbor / null if no neighbor
     */
    public findTopNeighbor(x: number, y: number): { x: number; y: number } {
        this.statNeighbor++;
        if (y < 0) return null;
        if (!this.board[y][x].visible) return this.findTopNeighbor(x, y - 1);
        return { x, y };
    }

    /**
     * function to find the lower neighbor of an element
     * @param x x-Coordinate of the element one below
     * @param y y-Coordinate of the element one below
     * @returns Coordinate of the neighbor / null if no neighbor
     */
    public findBottomNeighbor(x: number, y: number): { x: number; y: number } {
        this.statNeighbor++;
        if (y >= this.board.length) return null;
        if (y === this.board.length - 1 && x >= this.board[y].length) return null;
        if (!this.board[y][x].visible) return this.findBottomNeighbor(x, y + 1);
        return { x, y };
    }

    /**
     * function to find the right neighbor of an element
     * @param x x-Coordinate of the element one to the right
     * @param y y-Coordinate of the element one to the right
     * @returns Coordinate of the neighbor / null if no neighbor
     */
    public findRightNeighbor(x: number, y: number): { x: number; y: number } {
        this.statNeighbor++;
        if (y >= this.board.length) return null;
        if (y === this.board.length - 1 && x >= this.board[y].length) return null;
        if (x > 8) return this.findRightNeighbor(0, y + 1);
        if (!this.board[y][x].visible) return this.findRightNeighbor(x + 1, y);
        return { x, y };
    }

    /**
     * function to find the left neighbor of an element
     * @param x x-Coordinate of the element one to the left
     * @param y y-Coordinate of the element one to the left
     * @returns Coordinate of the neighbor / null if no neighbor
     */
    public findLeftNeighbor(x: number, y: number): { x: number; y: number } {
        this.statNeighbor++;
        if (y < 0) return null;
        if (x < 0) return this.findLeftNeighbor(8, y - 1);
        if (!this.board[y][x].visible) return this.findLeftNeighbor(x - 1, y);
        return { x, y };
    }

    /**
     * Refreshes the stats table
     */
    public refreshStats(): void {
        document.getElementById("delRows").innerHTML = String(this.statDelRows);
        document.getElementById("crossedElements").innerHTML = String(this.statCrossedElements);
        document.getElementById("crossCall").innerHTML = String(this.statCrossCalled);
        document.getElementById("neighborSearch").innerHTML = String(this.statNeighbor);
        document.getElementById("callCheck").innerHTML = String(this.statCheck);
        document.getElementById("currentRows").innerHTML = String(this.board.length);
        document.getElementById("shuffled").innerHTML = String(this.statShuffled);
        this.statNumber();
    }

    private appendValues(array: Array<number>): void {
        for (let n of array) {
            if (this.board[this.board.length - 1].length === 9) this.board.push([]);
            this.board[this.board.length - 1].push({ value: n, visible: true });
        }
    }

    private drawHandler(ignoreDelete: boolean = false): void {
        if (ignoreDelete) return this.drawBoard();
        if (this.autoDeleteRows) return this.deleteEmptyRows();
        this.drawBoard();
    }

    private drawBoard(): void {
        let noDraw = <HTMLInputElement>document.getElementById("noSVG");
        if(noDraw.checked) {
            this.refreshStats();
            return;
        }
        let svg = new SVGGenerator(9 * 30, this.board.length * 30, document.getElementById("game_svg"), true);
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[y].length; x++) {
                let fill = this.board[y][x].visible ? "black" : "#a0a0a0";
                svg.addRectangle(x * 30, y * 30, 30, 30, `fill:${fill}`);
                fill = this.board[y][x].visible ? config.numberColors[this.board[y][x].value] : "#303030";
                svg.addText(
                    x * 30 + 15,
                    y * 30 + 15,
                    String(this.board[y][x].value),
                    `stroke:none;fill:${fill};font-family:Arial;text-anchor:middle;dominant-baseline:middle`
                );
            }
        }
        this.refreshStats();
    }

    private statNumber(): void {
        let table = document.getElementById("numberTable");
        let tableContent = `
            <tr>
                <th>Number</th>
                <th>Amount</th>
            <tr>
        `;
        for (let num = 0; num <= 9; num++) {
            let count: number = 0;
            for (let row of this.board) for (let element of row) if (element.visible && element.value === num) count++;
            tableContent += `
                <tr>
                    <td>${num}</td>
                    <td>${count}</td>
                <tr>
            `;
        }
        table.innerHTML = tableContent;
    }
}
