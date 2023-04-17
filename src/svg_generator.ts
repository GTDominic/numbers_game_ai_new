class SVGGenerator {
    private svg: any;

    constructor(width: number, height: number, parent: object, redraw: boolean) {
        this.svg = parent;
        if (redraw) this.svg.innerHTML = '';
        this.svg = this.addElement('svg', {width: width, height: height});
    }

    public addRectangle(x: number, y: number, width: number, height: number, style: string): void {
        this.addElement('rect', {x: x, y: y, width: width, height: height, style: style});
    }

    public addText(x: number, y: number, content: string, style: string): void {
        this.addElement('text', {x: x, y: y, style: style}).innerHTML = content;
    }

    private addElement(form: string, attributes: { [index: string]: any }): SVGElement {
        let svgBase = document.createElementNS('http://www.w3.org/2000/svg', form);
        for(const key in attributes) svgBase.setAttribute(key, attributes[key]);
        return this.svg.appendChild(svgBase);
    }
}