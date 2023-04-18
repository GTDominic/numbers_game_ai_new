let currentAI: AIAbstract;
let aiAutoRunSpeed = 500;
const aiAutoRun = setInterval(aiRunAuto, aiAutoRunSpeed);

function main(): void {
    currentAI = new AIFirstFound();
}

function aiStep(): void {
    currentAI.step();
}

function aiRunAuto(): void {
    let element = <HTMLInputElement> document.getElementById('autoAI');
    if(element.checked) currentAI.step();
}