function stylize(thisThing: any, withStyle: any) {
    Object.assign(thisThing.style, withStyle)
}

function getRandom<G>(fromArray: G[]): G {
    return fromArray[Math.round(Math.random() * fromArray.length + 1)]
}


class Dot {
    constructor(
        public x: number,
        public y: number,
        public title: string,
        public linked: Dot[] = [],
        public longText: string = "",
        public radius: number = 20,
        public color: string = getRandom(["red", "yellow", "green", "lightpink"]),
        public shouldBeOnScreen: boolean = true,
    ) { }

    draw(on: HTMLCanvasElement) {
        let c = on.getContext("2d")!
        c.beginPath()
        c.fillStyle = this.color
        c.ellipse(this.x, this.y, this.radius, this.radius, 0, 0, Math.PI * 2)
        c.font = "2rem Arial"
        c.fillText(this.title, this.x + this.radius  + this.radius * 0.5, this.y + this.radius + this.radius * 0.5)
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
        // window.addEventListener("click", () => {this.zoom()})
    }
    randomW() {
        return Math.random() * this.width
    }
    randomH() {
        return Math.random() * this.height
    }
    newDot(title: string, linkTo?: Dot) {
        let x = this.randomW()
        let y = this.randomH()
        let links: Dot[] = []
        if (linkTo) {
            links.push(linkTo)
        }
        this.dots.push(new Dot(x, y, title, links))
        // for(let dot in this.dots)
        // this.dots.push(new Dot(this.randomW(), this.randomH(), ""))
        // console.log(this.dots.length)
    }
    populateGraphWithTestNodes() {
        let i = 0;
        while (i < 50) {
            this.dots.push(new Dot(this.width * Math.random(), this.height * Math.random(), "meow"))
            i++
        }
        this.dots.forEach(dot => { Math.random() > 0 ? dot.linked.push(this.dots[Math.round((this.dots.length - 27) * Math.random())]) : "" })
    }
    clearCanvas() {
        this.context.fillStyle = this.bgColor
        this.context.fillRect(0, 0, this.width, this.height)
    }
    calculatePhysics() {
        let C0 = 3
        let C1 = 2 * C0
        let C2 = 2 * C0
        let C3 = 1 * C0
        let C4 = 0.1 * C0
        let C5 = 5e-5 * C2 * Math.log(this.dots.length) // increase the central force depending on how many dots are already onscreen
        this.dots.forEach(dot => {
            this.dots.forEach(dot2 => {
                if (dot !== dot2) {
                    // attract
                    if (dot.linked.includes(dot2)) {
                        let dx = dot.x - dot2.x
                        let fx = C1 * Math.log(Math.abs(dx) / C2) * Math.sign(dx) * -1 * C4
                        let dy = dot.y - dot2.y
                        let fy = C1 * Math.log(Math.abs(dy) / C2) * Math.sign(dy) * -1 * C4
                        dot.x += fx
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

                        dot2.x -= fx
                        dot2.y -= fy
                    }
                }
                // center all regardless
                let dCx = dot.x - (this.canvas.width / 2)
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
        // makeGrid(this.context)
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

function beginAnimation(graph: GraphingCanvas) {
    requestAnimationFrame(() => beginAnimation(graph))
    graph.calculatePhysics()
    graph.refreshCanvas()
}

let graph = new GraphingCanvas()
// graph.populateGraphWithTestNodes()
beginAnimation(graph)
window.addEventListener("click", (e: MouseEvent) => {
    if (!document.getElementById("inputter")) {
        let input = document.createElement("input")
        input.id = "inputter"
        stylize(input, { left: e.clientX + "px", top: e.clientY + "px", position: "absolute" })
        document.body.appendChild(input)
        input.onkeydown = (e) => { if (e.key === "Enter") graph.newDot(e.target!.value, graph.dots[0] ? getRandom(graph.dots) : undefined) }
    }
})
