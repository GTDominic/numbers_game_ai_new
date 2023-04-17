class Board {
    private board: Array<Array<{
        value: number,
        visible: boolean
    }>>;
    private startarray: Array<number>;

    constructor(array: Array<number>) {
        this.startarray = [...array];
        this.board = [[]];
        this.appendValues(array);
        this.drawBoard();
    }

    public cross(x1: number, y1: number, x2: number, y2: number): boolean {
        this.board[y1][x1].visible = false;
        this.board[y2][x2].visible = false;
        this.drawBoard();
        return true;
    }

    private appendValues(array: Array<number>): void {
        for(let n of array) {
            if(this.board[this.board.length - 1].length === 9) this.board.push([]);
            this.board[this.board.length - 1].push({value: n, visible: true}); 
        }
    }

    private drawBoard(): void {
        const colors = ['#1447ff','#d936d3','#47ed87','#ff3636','#f7eb00','#6e3000','#f7eb00','#ff3636','#47ed87','#d936d3'];
        let svg = new SVGGenerator(9 * 30, this.board.length * 30, document.getElementById('game_svg'), true);
        for(let y = 0; y < this.board.length; y++) {
            for(let x = 0; x < this.board[y].length; x++) {
                let fill = this.board[y][x].visible ? 'black' : '#a0a0a0';
                svg.addRectangle(x * 30, y * 30, 30, 30, `fill:${fill}`);
                fill = this.board[y][x].visible ? colors[this.board[y][x].value] : '#303030';
                svg.addText(x * 30 + 15, y * 30 + 15, String(this.board[y][x].value), `stroke:none;fill:${fill};font-family:Arial;text-anchor:middle;dominant-baseline:middle`);
            }
        }
    }
}