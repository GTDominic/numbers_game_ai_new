/**
 * Shuffles a numeric array
 * @param array Array to shuffle
 * @returns Shuffled array
 */
function G_shuffleNumberArray(array: Array<number>): Array<number> {
    let currentIndex = array.length;
    let temporaryValue: number;
    let randomIndex: number;
    let seed = config.shuffleSeed;
    seed = seed || 1;
    let random = () => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
    while (0 !== currentIndex) {
        randomIndex = Math.floor(random() * currentIndex);
        currentIndex--;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
