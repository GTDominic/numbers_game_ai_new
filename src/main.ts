function main(): void {
    let test = new SVGGenerator(400, 300, document.getElementById('svg_test'), true);
    test.addRectangle(5, 5, 200, 200, 'fill:black;stroke:blue');
}