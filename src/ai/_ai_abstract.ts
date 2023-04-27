abstract class AIAbstract {
    protected board: Board;
    protected finished: boolean = false;

    constructor() {
        let startvalueselement = <HTMLInputElement>document.getElementById("startvalues");
        let startelvalue: string = startvalueselement.value.replace(/ /g, ",");
        let autoDelete = <HTMLInputElement>document.getElementById("autoDeleteRows");
        let startvalues: Array<number> = JSON.parse("[" + startelvalue + "]");
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
        if (this.finished) return;
        if (this.board.checkFinished()) {
            document.getElementById("textout").innerHTML = '<p class="w3-padding-large">Board finished!</p>';
            this.finished = true;
            return;
        }
        this.board.check();
    }
}
