abstract class AIAbstract {
    protected board: Board;

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
        if(this.board.checkFinished()) {
            document.getElementById('textout').innerHTML = 'Board finished!';
        }
        this.board.check();
    }
}