function stylize(thisThing, withStyle) {
    Object.assign(thisThing.style, withStyle);
}
function getRandom(fromArray) {
    return fromArray[Math.floor(Math.random() * fromArray.length)];
}
var Dot = /** @class */ (function () {
    function Dot(x, y, title, linked, longText, radius, color, shouldBeOnScreen) {
        if (linked === void 0) { linked = []; }
        if (longText === void 0) { longText = ""; }
        if (radius === void 0) { radius = 10; }
        if (color === void 0) { color = getRandom(["red", "yellow", "green", "lightpink", "blue", "purple", "white", "violet"]); }
        if (shouldBeOnScreen === void 0) { shouldBeOnScreen = true; }
        this.x = x;
        this.y = y;
        this.title = title;
        this.linked = linked;
        this.longText = longText;
        this.radius = radius;
        this.color = color;
        this.shouldBeOnScreen = shouldBeOnScreen;
    }
    Dot.prototype.draw = function (on) {
        var c = on.getContext("2d");
        c.beginPath();
        c.fillStyle = this.color;
        c.ellipse(this.x, this.y, this.radius, this.radius, 0, 0, Math.PI * 2);
        c.font = "2rem Arial";
        c.fillText(this.title, this.x + this.radius + this.radius * 0.5, this.y + this.radius + this.radius * 0.5);
        c.fill();
        c.closePath();
    };
    return Dot;
}());
var GraphingCanvas = /** @class */ (function () {
    function GraphingCanvas(bgColor, width, height, dots, where, canvas, currentDot) {
        if (bgColor === void 0) { bgColor = "#111"; }
        if (width === void 0) { width = innerWidth; }
        if (height === void 0) { height = innerHeight; }
        if (dots === void 0) { dots = []; }
        if (where === void 0) { where = document.body; }
        if (canvas === void 0) { canvas = document.createElement("canvas"); }
        this.bgColor = bgColor;
        this.width = width;
        this.height = height;
        this.dots = dots;
        this.where = where;
        this.canvas = canvas;
        this.currentDot = currentDot;
        this.context = this.canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        stylize(canvas, { backgroundColor: bgColor });
        stylize(document.body, { backgroundColor: "black", margin: 0 });
        where.appendChild(canvas);
        // window.addEventListener("click", () => {this.zoom()})
    }
    GraphingCanvas.prototype.randomW = function () {
        return Math.random() * this.width;
    };
    GraphingCanvas.prototype.randomH = function () {
        return Math.random() * this.height;
    };
    GraphingCanvas.prototype.newDot = function (title, linkTo) {
        var x = this.randomW();
        var y = this.randomH();
        var links = [];
        if (linkTo) {
            links.push(linkTo);
        }
        var dot = new Dot(x, y, title, links);
        this.dots.push(dot);
        var inputter = document.getElementById("inputter");
        inputter.value = "";
        // for(let dot in this.dots)
        // this.dots.push(new Dot(this.randomW(), this.randomH(), ""))
        // console.log(this.dots.length)
        return dot;
    };
    GraphingCanvas.prototype.populateGraphWithTestNodes = function () {
        var _this = this;
        var i = 0;
        while (i < 100) {
            var title = getRandom(["meow", "woof", "bark", 'purr', "buzz", "zzzz", "side", "left", "right", "orange", "cat", "wooo", "guitar playing", "sheet music", "water bottle", "cup"]);
            this.dots.push(new Dot(this.width * Math.random(), this.height * Math.random(), title));
            i++;
        }
        this.dots.forEach(function (dot) { Math.random() > 0 ? dot.linked.push(_this.dots[Math.round((_this.dots.length - 27) * Math.random())]) : ""; });
    };
    GraphingCanvas.prototype.clearCanvas = function () {
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.width, this.height);
    };
    GraphingCanvas.prototype.calculatePhysics = function () {
        var _this = this;
        C5 = normalC5 * C2 * Math.log(this.dots.length); // increase the central force depending on how many dots are already onscreen
        this.dots.forEach(function (dot) {
            _this.dots.forEach(function (dot2) {
                if (dot !== dot2) {
                    C4 *= 0.9999999;
                    C2 *= 1.00000001;
                    C3 *= 1.00000001;
                    C5 *= 0.9999999;
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
                        var dx = Math.abs(dot.x - dot2.x);
                        var dy = Math.abs(dot.y - dot2.y);
                        var ideal = dot.radius * 3;
                        var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                        var sx = 5;
                        var sy = 5;
                        if (dot.x > dot2.x) {
                            sx *= -0.001;
                        }
                        if (dot.y > dot2.y) {
                            sy *= -0.001;
                        }
                        // if (dot.x < dot2.x) {
                        //     sx *= -1
                        // }
                        // d*= 2
                        // if (d > 1000){
                        var div = Math.log(d);
                        if (dx > ideal) {
                            dot.x += div * sx * C4 * C1;
                            dot2.x -= div * sx * C4 * C1;
                        }
                        else if (dx < ideal) {
                            dot.x -= div * sx * C4 * C1;
                            dot2.x += div * sx * C4 * C1;
                        }
                        if (dy > ideal) {
                            dot.y += div * sy * C4 * C1;
                            dot2.y -= div * sy * C4 * C1;
                        }
                        else if (dy < ideal) {
                            dot.y -= div * sy * C4 * C1;
                            dot2.y += div * sy * C4 * C1;
                        }
                        // }
                    }
                    else {
                        // repel non-linked
                        var dx = dot.x - dot2.x;
                        var dy = dot.y - dot2.y;
                        dx *= 2;
                        dy *= 2;
                        var fx = C3 / Math.sqrt(Math.abs(dx)) * Math.sign(dx) * C4;
                        var fy = C3 / Math.sqrt(Math.abs(dy)) * Math.sign(dy) * C4;
                        dot.x += fx * 3;
                        dot.y += fy * 3;
                        dot2.x -= fx * 3;
                        dot2.y -= fy * 3;
                    }
                }
                // center all regardless
                var dCx = dot.x - (_this.canvas.width / 2);
                var dCy = dot.y - (_this.canvas.height / 2);
                dot.x -= C5 * dCx * C4;
                dot.y -= C5 * dCy * C4;
            });
        });
    };
    GraphingCanvas.prototype.zoom = function () {
        this.context.scale(2, 2);
    };
    GraphingCanvas.prototype.refreshCanvas = function () {
        this.clearCanvas();
        var _loop_1 = function (dot) {
            dot.linked.forEach(function (linkedDot) {
                graph.drawLink(dot, linkedDot);
            });
            dot.draw(graph.canvas);
        };
        for (var _i = 0, _a = this.dots; _i < _a.length; _i++) {
            var dot = _a[_i];
            _loop_1(dot);
        }
    };
    GraphingCanvas.prototype.drawLink = function (dot, linkedDot) {
        this.context.beginPath();
        this.context.strokeStyle = "gray";
        this.context.lineWidth = 2;
        this.context.lineTo(dot.x, dot.y);
        this.context.lineTo(linkedDot.x, linkedDot.y);
        this.context.stroke();
    };
    return GraphingCanvas;
}());
var tick = 0;
var demo = true;
window.addEventListener("keydown", function (e) {
    if (e.key === ";") {
        demo = false;
        graph.dots = [];
        C0 = 0.5;
        C1 = 0.1 * C0;
        C2 = 1 * C0;
        C3 = 0.1 * C0;
        C4 = 3 * C0;
        var a = document.getElementById("instrucbox");
        graph.clearCanvas();
        a.innerText = "\n\n Left click to open the text box, and then type the name of the node.\n\nThen press TAB to add a node, or ENTER to link it to a previous one (if you've already pressed tab before).\n\nSorry, that's all there is for right this second - but I will come back to this project soon and make it a full-fledged note app!\n\nSome obvious deficiencies with my method are that they tend to shake too much and organize in X's instead of proper circles.\n\nI would fix this by implementing sturdier physics methods.";
    }
});
function beginAnimation(graph) {
    requestAnimationFrame(function () { return beginAnimation(graph); });
    if (tick < 200 || demo === false) {
        tick++;
        graph.calculatePhysics();
        if (demo === true) {
            C2 /= 1.01;
            C1 /= 1.01;
            C3 *= 1.01;
        }
    }
    else {
        if (!document.getElementById("instrucbox")) {
            var a = document.createElement("div");
            a.id = "instrucbox";
            a.innerText = "Even though the labels are just random unrelated words, you can see how this could be useful for visualizing data. There is a lot more for me to do - this is just a very tiny experiment.\n\nTo continue, press the semicolon key and you will be greeted with a blank screen where you can create your own nodes. ";
            Object.assign(a.style, { position: "absolute", top: "30px", left: "30px", color: "white" });
            document.body.appendChild(a);
        }
    }
    graph.refreshCanvas();
}
var C0 = 1.1;
var C1 = 0.5 * C0;
var C2 = 1 * C0;
var C3 = 0.1 * C0;
var C4 = 3 * C0;
var normalC5 = 2e-5;
var C5 = normalC5 * C2;
var graph = new GraphingCanvas();
graph.populateGraphWithTestNodes();
beginAnimation(graph);
window.addEventListener("click", function (e) {
    if (!document.getElementById("inputter")) {
        var input = document.createElement("input");
        input.id = "inputter";
        stylize(input, { left: e.clientX + "px", top: e.clientY + "px", position: "absolute" });
        document.body.appendChild(input);
        input.onkeydown = function (e) {
            var _a;
            if (e.key === "Tab") { // @ts-expect-error there is a value here
                graph.currentDot = graph.newDot(e.target.value);
            }
            else if (e.key === "Enter") { // @ts-expect-error there is a value here
                graph.newDot(e.target.value, (_a = graph.currentDot) !== null && _a !== void 0 ? _a : undefined);
            }
        };
        input.focus();
        input.onblur = function () { document.body.removeChild(document.getElementById("inputter")); };
    }
});
