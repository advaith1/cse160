// Vertex shader program
const VSHADER_SOURCE = /*glsl*/ `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }
`

// Fragment shader program
const FSHADER_SOURCE = /*glsl*/ `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`

/** @type {HTMLCanvasElement} */
let canvas
/** @type {WebGLRenderingContext} */
let gl
/** @type {WebGLUniformLocation} */
let u_FragColor
/** @type {WebGLUniformLocation} */
let u_Size

function setupWebGL() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl')

	// Get the rendering context for WebGL
	gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: true })
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL')
		return
	}
}

function connectVariablesToGLSL() {
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.')
		return
	}

	// Get the storage location of a_Position
	const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position')
		return
	}

	// Create a buffer object
	const vertexBuffer = gl.createBuffer()
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object')
		return
	}

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position)

	// Get the storage location of u_FragColor
	u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
	if (!u_FragColor) {
		console.log('Failed to get the storage location of u_FragColor')
		return
	}

	// Get the storage location of u_Size
	u_Size = gl.getUniformLocation(gl.program, 'u_Size')
	if (!u_Size) {
		console.log('Failed to get the storage location of u_Size')
		return
	}
}

let CurrentShape = Point
let smoothDraw = false

function main() {
	setupWebGL()
	connectVariablesToGLSL()

	// Register function (event handler) to be called on a mouse press
	canvas.onmousedown = click
	canvas.onmousemove = click
	canvas.onmouseup = () => {
		if (CurrentShape === Line && smoothDraw) {
			endLine()
		}
	}

	squareButton.onclick = () => (CurrentShape = Point)
	triangleButton.onclick = () => (CurrentShape = Triangle)
	circleButton.onclick = () => (CurrentShape = Circle)
	diamondButton.onclick = () => (CurrentShape = Diamond)
	lineButton.onclick = () => {
		CurrentShape = Line
		smoothDraw = false
	}
	endLineButton.onclick = endLine
	smoothDrawButton.onclick = () => {
		CurrentShape = Line
		smoothDraw = true
		endLine()
	}
	clearButton.onclick = clear
	drawPictureButton.onclick = drawPicture

	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0)

	// Enable alpha blending for transparency
	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT)
}

/** @type {(Point | Triangle | Circle | Diamond | Line)[]} */
const points = []

/** @param {MouseEvent} ev */
function click(ev) {
	if (ev.buttons !== 1) return

	points.push(
		new CurrentShape({
			position: getCoords(ev),
			color: [+red.value, +green.value, +blue.value, +opacity.value],
			size: +size.value,
			circleSegments: +segments.value,
			prevLinePosition: points.at(-1)?.position2
		})
	)

	render()
}

function endLine() {
	if (points.at(-1) instanceof Line) {
		points.push(new Line({}))
	}
}

/** @param {MouseEvent} ev */
function getCoords(ev) {
	const rect = ev.target.getBoundingClientRect()

	const x = (ev.clientX - rect.left - canvas.width / 2) / (canvas.width / 2)
	const y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2)

	return [x, y]
}

function render() {
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT)

	for (const point of points) {
		point.render()
	}
}

function clear() {
	points.length = 0
	render()
}

// convert from 16x16 grid to webgl coords
function convertCoords(...vals) {
	return vals.map(v => (v - 8) / 8)
}

const grass = [0.15, 0.68, 0.24, 1]
const slug = [0.81, 0.64, 0, 1]
const black = [0, 0, 0, 1]
const sky = [0.5, 0.72, 0.91, 1]
const sun = [0.99, 0.87, 0.5, 1]

function drawPicture() {
	points.length = 0
	points.push(new Point({ position: [0, 0], color: sky, size: 1000 }))

	// Grass
	points.push(new Triangle({ position: convertCoords(2.5, 1, 3, 4, 3.25, 1), color: grass, size: 10 }))
	points.push(new Triangle({ position: convertCoords(6, 1, 6.25, 3.5, 6.5, 1), color: grass, size: 10 }))
	points.push(new Triangle({ position: convertCoords(8.5, 1, 8.75, 3.3, 9.2, 1), color: grass, size: 10 }))

	// A
	points.push(new Triangle({ position: convertCoords(10, 1, 10.75, 5, 10.5, 1), color: grass, size: 10 }))
	points.push(new Triangle({ position: convertCoords(11.1, 1, 10.7, 5, 11.5, 1), color: grass, size: 10 }))
	points.push(new Triangle({ position: convertCoords(10.4, 2.25, 11.25, 2.25, 10.75, 2), color: grass, size: 10 }))

	// J
	points.push(new Triangle({ position: convertCoords(12, 1, 12, 1.5, 13.25, 1), color: grass, size: 10 }))
	points.push(new Triangle({ position: convertCoords(12.9, 1, 13.5, 5, 13.5, 1), color: grass, size: 10 }))

	points.push(new Triangle({ position: convertCoords(14, 1, 14.25, 2.25, 14.5, 1), color: grass, size: 10 }))
	points.push(new Triangle({ position: convertCoords(14.75, 1, 15, 4, 15.25, 1), color: grass, size: 10 }))

	// Slug
	points.push(new Triangle({ position: convertCoords(1, 1.5, 6, 2.5, 6, 1.5), color: slug, size: 10 }))
	points.push(new Triangle({ position: convertCoords(6, 1.5, 5.75, 5, 8, 1.5), color: slug, size: 10 }))
	points.push(new Triangle({ position: convertCoords(5.75, 5, 8, 5, 6.7, 3.4), color: slug, size: 10 }))
	points.push(new Triangle({ position: convertCoords(7.1, 5, 7.3, 6, 7.4, 5), color: slug, size: 10 }))
	points.push(new Triangle({ position: convertCoords(7.5, 5, 7.7, 6, 7.8, 5), color: slug, size: 10 }))

	// Eye
	points.push(new Triangle({ position: convertCoords(7.2, 4.55, 7.35, 4.8, 7.5, 4.55), color: black, size: 10 }))

	// Mouth
	points.push(new Triangle({ position: convertCoords(6.8, 4.25, 8, 4.25, 8, 3), color: sky, size: 10 }))

	// Grass in front of slug
	points.push(new Triangle({ position: convertCoords(1, 1, 1.5, 3, 1.75, 1), color: grass, size: 10 }))
	points.push(new Triangle({ position: convertCoords(4, 1, 4.25, 3, 4.5, 1), color: grass, size: 10 }))
	points.push(new Triangle({ position: convertCoords(5, 1, 5.25, 3.5, 5.5, 1), color: grass, size: 10 }))
	points.push(new Triangle({ position: convertCoords(7.25, 1, 7.8, 3.1, 8, 1), color: grass, size: 10 }))

	// Sun
	points.push(new Circle({ position: convertCoords(3, 13), color: sun, size: 25, circleSegments: 60 }))
	points.push(new Triangle({ position: convertCoords(3, 14.5, 3.75, 13, 2.25, 13), color: sun, size: 10 }))
	points.push(new Triangle({ position: convertCoords(4.06, 14.06, 3, 13.75, 3.75, 13), color: sun, size: 10 }))
	points.push(new Triangle({ position: convertCoords(4.5, 13, 3, 13.75, 3, 12.25), color: sun, size: 10 }))
	points.push(new Triangle({ position: convertCoords(4.06, 11.94, 3.75, 13, 3, 12.25), color: sun, size: 10 }))
	points.push(new Triangle({ position: convertCoords(3, 11.5, 2.25, 13, 3.75, 13), color: sun, size: 10 }))
	points.push(new Triangle({ position: convertCoords(1.94, 11.94, 3, 12.25, 2.25, 13), color: sun, size: 10 }))
	points.push(new Triangle({ position: convertCoords(1.5, 13, 3, 12.25, 3, 13.75), color: sun, size: 10 }))
	points.push(new Triangle({ position: convertCoords(1.94, 14.06, 2.25, 13, 3, 13.75), color: sun, size: 10 }))

	render()
}
