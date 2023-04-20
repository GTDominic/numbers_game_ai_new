abstract class AIAbstract {
    protected board: Board;
    protected finished: boolean = false;

    constructor() {
        let startvalueselement = <HTMLInputElement> document.getElementById('startvalues');
        let autoDelete = <HTMLInputElement> document.getElementById('autoDeleteRows');
        let startvalues: Array<number> = JSON.parse("[" + startvalueselement.value + "]");
        this.board = new Board(startvalues, autoDelete.checked);
    }
    
    /**
     * Executes a single step
     */
    abstract step(): void;

    /**
     * Deletes empty rows
     */
    public deleteRows(): void {
        this.board.deleteEmptyRows();
    }

    protected checkOrFinished(): void {
        if(this.finished) return;
        if(this.board.checkFinished()) {
            document.getElementById('textout').innerHTML = 'Board finished!';
            this.finished = true;
        }
        if(!this.board.check()) {
            document.getElementById('textout').innerHTML = 'Infinite check!';
        }
    }
}