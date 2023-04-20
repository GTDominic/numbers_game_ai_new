let currentAI: AIAbstract;
let aiAutoRunSpeed = 10;
let calls = 0;
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
    let slowElement = <HTMLInputElement> document.getElementById('slowAutoAI');
    if(calls === 1000000000000) calls = 0;
    calls++;
    if(element.checked) {
        if(slowElement.checked) {
            if(calls % 10 === 0) currentAI.step();
        } else currentAI.step();
    }
}