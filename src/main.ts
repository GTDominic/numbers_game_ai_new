let currentAI: AIAbstract;

function main(): void {
    currentAI = new AIFirstFound();
}

function aiStep(): void {
    currentAI.step();
}