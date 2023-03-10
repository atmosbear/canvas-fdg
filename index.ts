function stylize(thisThing: any, withStyle: any) {
    Object.assign(thisThing.style, withStyle)
}

function getRandom<G>(fromArray: G[]): G {
    return fromArray[Math.floor(Math.random() * fromArray.length)]
}


class Dot {
    constructor(
        public x: number,
        public y: number,
        public title: string,
        public linked: Dot[] = [],
        public longText: string = "",
        public radius: number = 10,
        public color: string = getRandom(["red", "yellow", "green", "lightpink", "blue", "purple", "white", "violet"]),
        public shouldBeOnScreen: boolean = true,
    ) { }

    draw(on: HTMLCanvasElement) {
        let c = on.getContext("2d")!
        c.beginPath()
        c.fillStyle = this.color
        c.ellipse(this.x, this.y, this.radius, this.radius, 0, 0, Math.PI * 2)
        c.font = "2rem Arial"
        c.fillText(this.title, this.x + this.radius + this.radius * 0.5, this.y + this.radius + this.radius * 0.5)
        c.fill()
        c.closePath()
    }
}

class GraphingCanvas {
    public context: CanvasRenderingContext2D
    constructor(
        public bgColor: string = "#111",
        public width: number = innerWidth,
        public height: number = innerHeight,
        public dots: Dot[] = [],
        public where: HTMLElement = document.body,
        public canvas: HTMLCanvasElement = document.createElement("canvas"),
        public currentDot?: Dot
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
        let dot = new Dot(x, y, title, links)
        this.dots.push(dot)
        let inputter = document.getElementById("inputter")! as HTMLInputElement
        inputter.value = ""
        // for(let dot in this.dots)
        // this.dots.push(new Dot(this.randomW(), this.randomH(), ""))
        // console.log(this.dots.length)
        return dot
    }
    populateGraphWithTestNodes() {
        let i = 0;
        while (i < 100) {
            let title = getRandom(["meow", "woof", "bark", 'purr', "buzz", "zzzz", "side", "left", "right", "orange", "cat", "wooo", "guitar playing", "sheet music", "water bottle", "cup"])
            this.dots.push(new Dot(this.width * Math.random(), this.height * Math.random(), title))
            i++
        }
        this.dots.forEach(dot => { Math.random() > 0 ? dot.linked.push(this.dots[Math.round((this.dots.length - 27) * Math.random())]) : "" })
    }
    clearCanvas() {
        this.context.fillStyle = this.bgColor
        this.context.fillRect(0, 0, this.width, this.height)
    }
    calculatePhysics() {
        C5 = normalC5 * C2 * Math.log(this.dots.length) // increase the central force depending on how many dots are already onscreen
        this.dots.forEach(dot => {
            this.dots.forEach(dot2 => {
                if (dot !== dot2) {
                    C4 *= 0.9999999
                    C2 *= 1.00000001
                    C3 *= 1.00000001
                    C5 *= 0.9999999
                    // C2 *= 0.9999999
                    // attract
                    if (dot.linked.includes(dot2) || dot2.linked.includes(dot)) {
                        // let dx = dot.x - dot2.x
                        // let dy = dot.y - dot2.y

                        // let fx = C1 * Math.log(Math.abs(dx) / C2) * Math.sign(dx) * -1 * C4
                        // let fy = C1 * Math.log(Math.abs(dy) / C2) * Math.sign(dy) * -1 * C4

                        // dot.x += fx
                        // dot.y += fy

                        // dot2.x -= fx
                        // dot2.y -= fy

                        let dx = Math.abs(dot.x - dot2.x)
                        let dy = Math.abs(dot.y - dot2.y)
                        let ideal = dot.radius * 3
                        let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
                        let sx = 5
                        let sy = 5
                        if (dot.x > dot2.x) {
                            sx *= -0.001
                        }
                        if (dot.y > dot2.y) {
                            sy *= -0.001
                        }
                        // if (dot.x < dot2.x) {
                        //     sx *= -1
                        // }
                        // d*= 2
                        // if (d > 1000){
                        let div = Math.log(d)
                        if (dx > ideal) {
                            dot.x += div * sx * C4 * C1
                            dot2.x -= div * sx * C4 * C1
                        } else if (dx < ideal) {
                            dot.x -= div * sx * C4 * C1
                            dot2.x += div * sx * C4 * C1
                        }
                        if (dy > ideal) {
                            dot.y += div * sy * C4 * C1
                            dot2.y -= div * sy * C4 * C1
                        } else if (dy < ideal) {
                            dot.y -= div * sy * C4 * C1
                            dot2.y += div * sy * C4 * C1
                        }
                        // }
                    } else {
                        // repel non-linked
                        let dx = dot.x - dot2.x
                        let dy = dot.y - dot2.y
                        dx *= 2
                        dy *= 2
                        let fx = C3 / Math.sqrt(Math.abs(dx)) * Math.sign(dx) * C4
                        let fy = C3 / Math.sqrt(Math.abs(dy)) * Math.sign(dy) * C4

                        dot.x += fx * 3
                        dot.y += fy * 3
                        dot2.x -= fx * 3
                        dot2.y -= fy * 3
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
        this.context.lineWidth = 2
        this.context.lineTo(dot.x, dot.y)
        this.context.lineTo(linkedDot.x, linkedDot.y)
        this.context.stroke()
    }
}
let tick = 0
let demo = true
window.addEventListener("keydown", (e) => {
    if (e.key === ";") {
        demo = false; graph.dots = [];
        C0 = 0.5
        C1 = 0.1 * C0
        C2 = 1 * C0
        C3 = 0.1 * C0
        C4 = 3 * C0
        let a = document.getElementById("instrucbox")
        graph.clearCanvas()
        a.innerText = "\n\n Left click to open the text box, and then type the name of the node.\n\nThen press TAB to add a node, or ENTER to link it to a previous one (if you've already pressed tab before).\n\nSorry, that's all there is for right this second - but I will come back to this project soon and make it a full-fledged note app!\n\nSome obvious deficiencies with my method are that they tend to shake too much and organize in X's instead of proper circles.\n\nI will - eventually - fix this by implementing sturdier physics methods."
    }
})
function beginAnimation(graph: GraphingCanvas) {
    requestAnimationFrame(() => beginAnimation(graph))
    if (tick < 200 || demo === false) {
        tick++
        graph.calculatePhysics()
        if (demo === true) {
            C2 /= 1.01
            C1 /= 1.01
            C3 *= 1.01
        }
    } else {
        if (!document.getElementById("instrucbox")) {
            let a = document.createElement("div")
            a.id = "instrucbox"
            a.innerText = "Even though the labels are just random unrelated words (for testing), you can see how this could be useful for visualizing data if it were actual relations.\n\nThere is a lot more for me to do - this is just a very tiny experiment.\n\nTo continue, press the semicolon key and you will be greeted with a blank screen where you can create your own nodes. "
            Object.assign(a.style, { position: "absolute", top: "30px", left: "30px", color: "white" })
            document.body.appendChild(a)
        }
    }
    graph.refreshCanvas()
}

let C0 = 1.1
let C1 = 0.5 * C0
let C2 = 1 * C0
let C3 = 0.1 * C0
let C4 = 3 * C0
let normalC5 = 2e-4
let C5 = normalC5 * C2
let graph = new GraphingCanvas()
graph.populateGraphWithTestNodes()
beginAnimation(graph)
window.addEventListener("click", (e: MouseEvent) => {
    if (!document.getElementById("inputter")) {
        let input = document.createElement("input")
        input.id = "inputter"
        stylize(input, { left: e.clientX + "px", top: e.clientY + "px", position: "absolute" })
        document.body.appendChild(input)
        input.onkeydown = (e) => {
            if (e.key === "Tab") { // @ts-expect-error there is a value here
                graph.currentDot = graph.newDot(e.target!.value)
            } else if (e.key === "Enter") { // @ts-expect-error there is a value here
                graph.newDot(e.target!.value, graph.currentDot ?? undefined)
            }
        }
        input.focus()
        input.onblur = () => { document.body.removeChild(document.getElementById("inputter")!) }
    }
})