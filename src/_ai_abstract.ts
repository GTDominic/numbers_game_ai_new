abstract class AIAbstract {
    protected board: Board;

    constructor() {
        this.board = new Board([1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9]);
    }
    
    abstract step(): void;
}