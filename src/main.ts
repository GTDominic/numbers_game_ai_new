let currentAI: AIAbstract;
let aiAutoRunSpeed = 1;
const aiAutoRun = setInterval(aiRunAuto, aiAutoRunSpeed);

function main(): void {
    
}

function selectAI(): void {
    let element = <HTMLInputElement> document.getElementById('selectedAI');
    let ai = element.value;
    if(ai === 'first_found') currentAI = new AIFirstFound();
}

function aiStep(): void {
    currentAI.step();
}

function deleteRows(): void {
    currentAI.deleteRows();
}

function aiRunAuto(): void {
    let element = <HTMLInputElement> document.getElementById('autoAI');
    if(element.checked) currentAI.step();
}