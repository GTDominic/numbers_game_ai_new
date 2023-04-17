class AIFirstFound extends AIAbstract {
    public step(): void {
        this.board.cross(0, 0, 0, 1);
    }
}