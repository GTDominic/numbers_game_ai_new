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

    private appendValues(array: Array<number>): void {
        for(let n of array) {
            if(this.board[this.board.length - 1].length === 9) this.board.push([]);
            this.board[this.board.length - 1].push({value: n, visible: true}); 
        }
    }

    private drawBoard(): void {
        let svg = new SVGGenerator(400, 900, document.getElementById('game_svg'), true);
        for(let y = 0; y < this.board.length; y++) {
            for(let x = 0; x < this.board[y].length; x++) {
                svg.addRectangle(x * 15, y * 15, 15, 15, 'fill:black;stroke:blue;stroke-width:2');
            }
        }
    }
}