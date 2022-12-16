function stylize(thisThing: any, withStyle: any) {
    Object.assign(thisThing.style, withStyle)
}

function getRandom<G>(fromArray: G[]): G {
    return fromArray[Math.round(Math.random() * fromArray.length)]
}


class Dot {
    constructor(
        public x: number,
        public y: number,
        public title: string,
        public linked: Dot[] = [],
        public longText: string = "",
        public radius: number = 25,
        public color: string = getRandom(["red", "orange", "yellow", "purple", "green", "lightpink"]),
        public shouldBeOnScreen: boolean = true,
    ) { }

    draw(on: HTMLCanvasElement) {
        let c = on.getContext("2d")!
        c.beginPath()
        c.fillStyle = this.color
        c.ellipse(this.x, this.y, this.radius, this.radius, 0, 0, Math.PI * 2)
        c.fill()
        c.closePath()
    }
}

class GraphingCanvas {
    public context: CanvasRenderingContext2D
    constructor(
        public bgColor: string = "darkblue",
        public width: number = innerWidth,
        public height: number = innerHeight,
        public dots: Dot[] = [],
        public where: HTMLElement = document.body,
        public canvas: HTMLCanvasElement = document.createElement("canvas")
    ) {
        this.context = this.canvas.getContext("2d")!
        canvas.width = width
        canvas.height = height
        stylize(canvas, { backgroundColor: bgColor })
        stylize(document.body, { backgroundColor: "black", margin: 0 })
        where.appendChild(canvas)
        window.addEventListener("click", () => {this.zoom()})
    }
    populateGraphWithTestNodes() {
        let i = 0;
        while (i < 50) {
            this.dots.push(new Dot(this.width * Math.random(), this.height * Math.random(), "meow"))
            i++
        }
        this.dots.forEach(dot => {Math.random() > 0 ? dot.linked.push(this.dots[Math.round((this.dots.length-27)*Math.random())]) : ""})
    }
    clearCanvas() {
        this.context.fillStyle = this.bgColor
        this.context.fillRect(0, 0, this.width, this.height)
    }
    calculatePhysics(tick) {
        let C1 = 3
        let C2 = 0.01 * tick
        let C3 = 20
        let C4 = 1.2
        let C5 = 5e-4
        this.dots.forEach(dot => {
            this.dots.forEach(dot2 => {
                if (dot !== dot2) {
                    // attract
                    if (dot.linked.includes(dot2)) {
                        let dx = dot.x - dot2.x
                        let fx = C1 * Math.log(Math.abs(dx) / C2) * Math.sign(dx) * -1 * C4
                        dot.x += fx
                        let dy = dot.y - dot2.y
                        let fy = C1 * Math.log(Math.abs(dy) / C2) * Math.sign(dy) * -1 * C4
                        dot.y += fy
                        dot2.x -= fx
                        dot2.y -= fy
                    } else {
                        // repel non-linked
                        let dx = dot.x - dot2.x
                        let fx = C3 / Math.sqrt(Math.abs(dx)) * Math.sign(dx) * C4
                        dot.x += fx
                        let dy = dot.y - dot2.y
                        let fy = C3 / Math.sqrt(Math.abs(dy)) * Math.sign(dy) * C4
                        dot.y += fy

                        dot2.x -= fx * 0.1
                        dot2.y -= fy * 0.1
                    }
                }
                // center all regardless
                let dCx = dot.x - (this.canvas.width / 2 )
                let dCy = dot.y - (this.canvas.height / 2)
                dot.x -= C5 * dCx * C4
                dot.y -= C5 * dCy * C4
            })
        })
    }
    zoom() {
        this.context.scale(2, 2)
    }
    refreshCanvas() {
        this.clearCanvas()
        function makeGrid(c: CanvasRenderingContext2D) {
            let numC = 2
            let numR = 2
            let cellW = innerWidth / numC
            let cellH = innerHeight / numR
            for (let i = 0; i < Math.round(numC); i++) {
                c.moveTo(cellW * i, 0)
                c.lineTo(cellW * i, innerHeight)
                c.stroke()
            }
            for (let i = 0; i < Math.round(numR); i++) {
                c.moveTo(0, cellH * i)
                c.lineTo(innerWidth, cellH * i)
                c.stroke()
            }
        }
        if (i % 10 === 0)
        makeGrid(this.context)
        for (let dot of this.dots) {
            dot.linked.forEach(linkedDot => {
                graph.drawLink(dot, linkedDot)
            })
            dot.draw(graph.canvas)
        }
    }
    drawLink(dot: Dot, linkedDot: Dot) {
        this.context.beginPath()
        this.context.strokeStyle = "gray"
        this.context.lineWidth = 5
        this.context.lineTo(dot.x, dot.y)
        this.context.lineTo(linkedDot.x, linkedDot.y)
        this.context.stroke()
    }
}

let i = 0.0001
function beginAnimation(graph: GraphingCanvas) {
    requestAnimationFrame(() => beginAnimation(graph))
    graph.calculatePhysics(i)
    graph.refreshCanvas()
}

let graph = new GraphingCanvas()
graph.populateGraphWithTestNodes()
setTimeout(() => {i = 800}, 25 * graph.dots.length)
beginAnimation(graph)
