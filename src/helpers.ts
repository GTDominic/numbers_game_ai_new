/**
 * Shuffles a numeric array
 * @param array Array to shuffle
 * @returns Shuffled array
 */
function G_shuffleNumberArray(array: Array<number>): Array <number> {
    let m = array.length;
    let t;
    let i;

    while(m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}