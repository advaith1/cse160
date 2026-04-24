// Vertex shader program
const VSHADER_SOURCE = /*glsl*/ `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix
/** @type {WebGLUniformLocation} */
let u_GlobalRotateMatrix

function setupWebGL() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl')

	// Get the rendering context for WebGL
	gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: true })
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL')
		return
	}

	gl.enable(gl.DEPTH_TEST)
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
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0)

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position)

	// Get the storage location of u_FragColor
	u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
	if (!u_FragColor) {
		console.log('Failed to get the storage location of u_FragColor')
		return
	}

	// Get the storage location of u_ModelMatrix
	u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
	if (!u_ModelMatrix) {
		console.log('Failed to get the storage location of u_ModelMatrix')
		return
	}

	// Get the storage location of u_GlobalRotateMatrix
	u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix')
	if (!u_GlobalRotateMatrix) {
		console.log('Failed to get the storage location of u_GlobalRotateMatrix')
		return
	}
}

let bodyAngle = 0
let bodyAnimation = false

let frontLeftLegTopAngle = 0
let frontLeftLegTopAnimation = false
let frontLeftLegBottomAngle = 0
let frontLeftLegBottomAnimation = false

let frontRightLegTopAngle = 0
let frontRightLegTopAnimation = false
let frontRightLegBottomAngle = 0
let frontRightLegBottomAnimation = false

let backLeftLegTopAngle = 0
let backLeftLegTopAnimation = false
let backLeftLegBottomAngle = 0
let backLeftLegBottomAnimation = false
let backLeftLegFootAngle = 0
let backLeftLegFootAnimation = false

let backRightLegTopAngle = 0
let backRightLegTopAnimation = false
let backRightLegBottomAngle = 0
let backRightLegBottomAnimation = false
let backRightLegFootAngle = 0
let backRightLegFootAnimation = false

let tailAngle = 0
let tailAnimation = false

let leafY = 0
let leafAnimation = false

let xAngle = 10
let yAngle = 50
let prevX = 0
let prevY = 0

let wave = false
let dragging = false

/** @param {boolean} value */
function setAllAnimations(value) {
	bodyAnimation = value
	frontLeftLegTopAnimation = value
	frontLeftLegBottomAnimation = value
	frontRightLegTopAnimation = value
	frontRightLegBottomAnimation = value
	backLeftLegTopAnimation = value
	backLeftLegBottomAnimation = value
	backRightLegTopAnimation = value
	backRightLegBottomAnimation = value
	backLeftLegFootAnimation = value
	backRightLegFootAnimation = value
	tailAnimation = value
	leafAnimation = value

	bodyAnimationCheckbox.checked = value
	frontLeftLegTopAnimationCheckbox.checked = value
	frontLeftLegBottomAnimationCheckbox.checked = value
	frontRightLegTopAnimationCheckbox.checked = value
	frontRightLegBottomAnimationCheckbox.checked = value
	backLeftLegTopAnimationCheckbox.checked = value
	backLeftLegBottomAnimationCheckbox.checked = value
	backRightLegTopAnimationCheckbox.checked = value
	backRightLegBottomAnimationCheckbox.checked = value
	backLeftLegFootAnimationCheckbox.checked = value
	backRightLegFootAnimationCheckbox.checked = value
	tailAnimationCheckbox.checked = value
	leafAnimationCheckbox.checked = value
}

/**
 * normalize angle: -180 to 180 degrees
 * @param {number} angle
 */
function normalize(angle) {
	return ((((angle + 180) % 360) + 360) % 360) - 180
}

/** @param {number} value */
function setXAngle(value) {
	xAngle = normalize(value)
	xSlider.value = xAngle
}

/** @param {number} value */
function setYAngle(value) {
	yAngle = normalize(value)
	ySlider.value = yAngle
}

function toggleWave() {
	if (wave) {
		wave = false
		setXAngle(10)
		setYAngle(50)
	} else {
		wave = true
		setAllAnimations(true)
		setXAngle(5)
		setYAngle(85)
	}
}

function main() {
	setupWebGL()
	connectVariablesToGLSL()

	canvas.style.cursor = 'grab'
	canvas.onmousedown = e => {
		if (e.buttons !== 1) return
		canvas.style.cursor = 'grabbing'
		prevX = e.x
		prevY = e.y
		dragging = true

		if (e.shiftKey) toggleWave()
	}
	document.body.onmousemove = e => {
		if (!dragging || e.buttons !== 1) return

		setXAngle(xAngle + (e.y - prevY) * 0.5)
		setYAngle(yAngle + (e.x - prevX) * 0.5)

		prevX = e.x
		prevY = e.y
	}
	document.body.onmouseup = () => {
		canvas.style.cursor = 'grab'
		dragging = false
	}

	waveImg.onclick = toggleWave

	animateAllButton.onclick = () => setAllAnimations(true)
	stopAllButton.onclick = () => setAllAnimations(false)

	bodyAnimationCheckbox.onchange = e => (bodyAnimation = e.target.checked)
	frontLeftLegTopAnimationCheckbox.onchange = e => (frontLeftLegTopAnimation = e.target.checked)
	frontLeftLegBottomAnimationCheckbox.onchange = e => (frontLeftLegBottomAnimation = e.target.checked)
	frontRightLegTopAnimationCheckbox.onchange = e => (frontRightLegTopAnimation = e.target.checked)
	frontRightLegBottomAnimationCheckbox.onchange = e => (frontRightLegBottomAnimation = e.target.checked)
	backLeftLegTopAnimationCheckbox.onchange = e => (backLeftLegTopAnimation = e.target.checked)
	backLeftLegBottomAnimationCheckbox.onchange = e => (backLeftLegBottomAnimation = e.target.checked)
	backLeftLegFootAnimationCheckbox.onchange = e => (backLeftLegFootAnimation = e.target.checked)
	backRightLegTopAnimationCheckbox.onchange = e => (backRightLegTopAnimation = e.target.checked)
	backRightLegBottomAnimationCheckbox.onchange = e => (backRightLegBottomAnimation = e.target.checked)
	backRightLegFootAnimationCheckbox.onchange = e => (backRightLegFootAnimation = e.target.checked)
	tailAnimationCheckbox.onchange = e => (tailAnimation = e.target.checked)
	leafAnimationCheckbox.onchange = e => (leafAnimation = e.target.checked)

	xSlider.oninput = e => setXAngle(+e.target.value)
	ySlider.oninput = e => setYAngle(+e.target.value)

	bodySlider.oninput = e => (bodyAngle = +e.target.value)
	frontLeftLegTopSlider.oninput = e => (frontLeftLegTopAngle = +e.target.value)
	frontLeftLegBottomSlider.oninput = e => (frontLeftLegBottomAngle = +e.target.value)
	frontRightLegTopSlider.oninput = e => (frontRightLegTopAngle = +e.target.value)
	frontRightLegBottomSlider.oninput = e => (frontRightLegBottomAngle = +e.target.value)
	backLeftLegTopSlider.oninput = e => (backLeftLegTopAngle = +e.target.value)
	backLeftLegBottomSlider.oninput = e => (backLeftLegBottomAngle = +e.target.value)
	backLeftLegFootSlider.oninput = e => (backLeftLegFootAngle = +e.target.value)
	backRightLegTopSlider.oninput = e => (backRightLegTopAngle = +e.target.value)
	backRightLegBottomSlider.oninput = e => (backRightLegBottomAngle = +e.target.value)
	backRightLegFootSlider.oninput = e => (backRightLegFootAngle = +e.target.value)
	tailSlider.oninput = e => (tailAngle = +e.target.value)
	leafSlider.oninput = e => (leafY = +e.target.value)

	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0)

	requestAnimationFrame(tick)
}

function getSecs() {
	return performance.now() / 1000
}

const startTime = getSecs()
let seconds = 0

let lastTime = performance.now()
let renderNum = 0

function tick() {
	seconds = getSecs() - startTime

	updateAnimationAngles()

	render()

	// update perf every 10 renders
	if (renderNum === 0) {
		const duration = performance.now() - lastTime
		perf.innerText = `${Math.floor(1 / (duration / 1000))} fps`
	}
	lastTime = performance.now()
	renderNum = (renderNum + 1) % 10

	requestAnimationFrame(tick)
}

function updateAnimationAngles() {
	if (bodyAnimation) {
		bodyAngle = 2 * Math.sin(3 * seconds)
		bodySlider.value = bodyAngle
	}
	if (frontLeftLegTopAnimation) {
		if (wave) {
			frontLeftLegTopAngle = Math.min(15 * Math.sin(5 * seconds - 1), 0)
		} else {
			frontLeftLegTopAngle = 15 * Math.sin(3 * seconds - 1)
		}
		frontLeftLegTopSlider.value = frontLeftLegTopAngle
	}
	if (frontLeftLegBottomAnimation) {
		if (wave) {
			// only if inner arm is up
			if (Math.sin(5 * seconds - 1) > -0.05) {
				frontLeftLegBottomAngle = Math.max(15 * Math.sin(20 * seconds) + 5, -8)
			}
		} else {
			frontLeftLegBottomAngle = 15 * Math.sin(3 * seconds) + 5
		}
		frontLeftLegBottomSlider.value = frontLeftLegBottomAngle
	}
	if (frontRightLegTopAnimation) {
		frontRightLegTopAngle = 15 * Math.sin(3 * seconds - 3)
		frontRightLegTopSlider.value = frontRightLegTopAngle
	}
	if (frontRightLegBottomAnimation) {
		frontRightLegBottomAngle = 15 * Math.sin(3 * seconds - 2) + 5
		frontRightLegBottomSlider.value = frontRightLegBottomAngle
	}
	if (backLeftLegTopAnimation) {
		backLeftLegTopAngle = 15 * Math.sin(3 * seconds)
		backLeftLegTopSlider.value = backLeftLegTopAngle
	}
	if (backLeftLegBottomAnimation) {
		backLeftLegBottomAngle = 15 * Math.sin(3 * seconds + 1) + 5
		backLeftLegBottomSlider.value = backLeftLegBottomAngle
	}
	if (backLeftLegFootAnimation) {
		backLeftLegFootAngle = 5 * Math.sin(3 * seconds + 2) + 5
		backLeftLegFootSlider.value = backLeftLegFootAngle
	}
	if (backRightLegTopAnimation) {
		backRightLegTopAngle = 15 * Math.sin(3 * seconds - 2)
		backRightLegTopSlider.value = backRightLegTopAngle
	}
	if (backRightLegBottomAnimation) {
		backRightLegBottomAngle = 15 * Math.sin(3 * seconds - 1) + 5
		backRightLegBottomSlider.value = backRightLegBottomAngle
	}
	if (backRightLegFootAnimation) {
		backRightLegFootAngle = 5 * Math.sin(3 * seconds) + 5
		backRightLegFootSlider.value = backRightLegFootAngle
	}
	if (tailAnimation) {
		tailAngle = 10 * Math.sin(3 * seconds)
		tailSlider.value = tailAngle
	}
	if (leafAnimation) {
		leafY = 0.01 * Math.sin(3 * seconds)
		leafSlider.value = leafY
	}
}

function render() {
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	gl.uniformMatrix4fv(
		u_GlobalRotateMatrix,
		false,
		new Matrix4() //
			.setRotate(-xAngle, 1, 0, 0)
			.rotate(-yAngle, 0, 1, 0).elements
	)

	const bodyMatrix = new Matrix4() //

	if (wave) {
		bodyMatrix //
			.translate(0.2, -0.4, 0)
			.rotate(90, 0, 0, 1)
			.rotate(bodyAngle / 10, 1, 0, 0)
	} else {
		bodyMatrix.rotate(bodyAngle, 1, 0, 0)
	}

	// Body
	drawCube({
		color: [133 / 255, 162 / 255, 248 / 255, 1],
		matrix: bodyMatrix //
			.translate(-0.1, -0.2, -0.35)
			.scale(0.9, 0.7, 0.7)
	})

	const headPositionMatrix = new Matrix4() //
		.setTranslate(-0.5, 0.2, -0.4)

	// Head
	drawCube({
		color: [143 / 255, 172 / 255, 258 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.scale(0.5, 0.5, 0.8)
	})

	// Snout
	drawCube({
		// c0cffc
		color: [192 / 255, 207 / 255, 252 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(-0.1, 0.1, 0.25)
			.scale(0.1, 0.2, 0.3)
	})

	// Nostrils
	drawCube({
		// 416ed2
		color: [65 / 255, 110 / 255, 210 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(-0.11, 0.15, 0.44)
			.scale(0.05, 0.03, 0.06)
	})
	drawCube({
		// 416ed2
		color: [65 / 255, 110 / 255, 210 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(-0.11, 0.15, 0.3)
			.scale(0.05, 0.03, 0.06)
	})

	// Leaf
	drawCube({
		// 4ac184
		color: [74 / 255, 193 / 255, 132 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(0.15, 0.55 + leafY, 0.15)
			.scale(0.2, 0.05, 0.35)
	})
	drawCube({
		// 4ac184
		color: [74 / 255, 193 / 255, 132 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(0.22, 0.55 + leafY, 0.5)
			.scale(0.05, 0.05, 0.2)
	})

	// Eyes
	drawCylinder({
		color: [0, 0, 0, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(-0, 0.25, 0.6)
			.scale(0.02, 0.1, 0.1)
			.rotate(90, 0, 0, 1),
		segments: 30
	})
	drawCylinder({
		color: [0, 0, 0, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(-0, 0.25, 0.1)
			.scale(0.02, 0.1, 0.1)
			.rotate(90, 0, 0, 1),
		segments: 30
	})

	// Left Ear
	drawCube({
		// 86a1f8
		color: [134 / 255, 161 / 255, 248 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(0.15, 0.2, -0.1)
			.scale(0.2, 0.2, 0.1)
	})
	drawCube({
		// c0cffc
		color: [192 / 255, 207 / 255, 252 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(0.1499, 0.225, -0.075)
			.scale(0.15, 0.15, 0.075)
	})

	// Right Ear
	drawCube({
		// 86a1f8
		color: [134 / 255, 161 / 255, 248 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(0.15, 0.2, 0.8)
			.scale(0.2, 0.2, 0.1)
	})
	drawCube({
		// c0cffc
		color: [192 / 255, 207 / 255, 252 / 255, 1],
		matrix: new Matrix4(headPositionMatrix) //
			.translate(0.1499, 0.225, 0.8)
			.scale(0.15, 0.15, 0.075)
	})

	const legColor = [138 / 255, 167 / 255, 253 / 255, 1]

	const frontLeftLegMatrix = new Matrix4()

	let updatedFrontLeftLegTopAngle = frontLeftLegTopAngle
	let updatedFrontLeftLegBottomAngle = frontLeftLegBottomAngle

	if (wave) {
		frontLeftLegMatrix //
			.translate(0.2, -0.1, -0.2)
			.rotate(90, 0, 0, 1)
			.rotate(90, 1, 0, 0)

		updatedFrontLeftLegTopAngle += 15
		updatedFrontLeftLegBottomAngle = updatedFrontLeftLegBottomAngle * 1.5 + 5
	}

	frontLeftLegMatrix //
		.rotate(updatedFrontLeftLegTopAngle, 0, 0, 1)
		.translate(0, -0.3, -0.25)
		.rotate(-5, 0, 0, 1)

	// front left leg top
	drawCube({
		color: legColor,
		matrix: new Matrix4(frontLeftLegMatrix) //
			.scale(0.1, 0.2, 0.1)
	})

	// front left leg bottom
	drawCube({
		color: legColor,
		matrix: new Matrix4(frontLeftLegMatrix) //
			.rotate(updatedFrontLeftLegBottomAngle, 0, 0, 1)
			.translate(0.05, -0.295, 0)
			.rotate(10, 0, 0, 1)
			.scale(0.1, 0.3, 0.1)
	})

	const frontRightLegMatrix = new Matrix4()

	if (wave) {
		frontRightLegMatrix //
			.translate(-0.2, 0.2, 0.3)
			.rotate(-30, 1, 0, 0)
			.rotate(90, 0, 1, 0)
			.rotate(frontRightLegTopAngle / 15, 0, 0, 1)
	} else {
		frontRightLegMatrix //
			.rotate(frontRightLegTopAngle, 0, 0, 1)
	}

	frontRightLegMatrix //
		.translate(0, -0.3, 0.15)
		.rotate(5, 0, 0, 1)

	// front right leg top
	drawCube({
		color: legColor,
		matrix: new Matrix4(frontRightLegMatrix) //
			.scale(0.1, 0.2, 0.1)
	})

	let updatedFrontRightLegBottomAngle = frontRightLegBottomAngle
	if (wave) updatedFrontRightLegBottomAngle /= 5

	// front right leg bottom
	drawCube({
		color: legColor,
		matrix: new Matrix4(frontRightLegMatrix) //
			.rotate(updatedFrontRightLegBottomAngle, 0, 0, 1)
			.translate(0.05, -0.275, 0)
			.rotate(10, 0, 0, 1)
			.scale(0.1, 0.3, 0.1)
	})

	const initialBackLegMatrix = new Matrix4() //
		.translate(0.5, 0, 0)

	if (wave) initialBackLegMatrix.translate(-0.5, -0.3, 0)

	const backLeftLegMatrix = new Matrix4(initialBackLegMatrix) //
		.rotate(backLeftLegTopAngle, 0, 0, 1)
		.translate(0, -0.3, -0.25)
		.rotate(-5, 0, 0, 1)

	// back left leg top
	drawCube({
		color: legColor,
		matrix: new Matrix4(backLeftLegMatrix) //
			.scale(0.1, 0.2, 0.1)
	})

	const backLeftLegBottomMatrix = new Matrix4(backLeftLegMatrix) //
		.rotate(backLeftLegBottomAngle, 0, 0, 1)
		.translate(0.04, -0.225, 0)
		.rotate(10, 0, 0, 1)

	// back left leg bottom
	drawCube({
		color: legColor,
		matrix: new Matrix4(backLeftLegBottomMatrix) //
			.scale(0.1, 0.25, 0.1)
	})

	const footHeight = 0.075

	function getFootMatrix(legBottomMatrix, footAngle) {
		return new Matrix4(legBottomMatrix) //
			.translate(0.11, 0.03, 0)
			.rotate(footAngle, 0, 0, 1)
			.translate(-0.15, -footHeight, -0.0001)
			.scale(0.15, footHeight, 0.1002)
	}

	// back left leg foot
	drawCube({
		color: [111 / 255, 149 / 255, 252 / 255, 1],
		matrix: getFootMatrix(backLeftLegBottomMatrix, backLeftLegFootAngle)
	})

	const backRightLegMatrix = new Matrix4(initialBackLegMatrix) //
		.rotate(backRightLegTopAngle, 0, 0, 1)
		.translate(0, -0.3, 0.15)
		.rotate(5, 0, 0, 1)

	// back right leg top
	drawCube({
		color: legColor,
		matrix: new Matrix4(backRightLegMatrix) //
			.scale(0.1, 0.2, 0.1)
	})

	const backRightLegBottomMatrix = new Matrix4(backRightLegMatrix) //
		.rotate(backRightLegBottomAngle, 0, 0, 1)
		.translate(0.04, -0.225, 0)
		.rotate(10, 0, 0, 1)

	// back right leg bottom
	drawCube({
		color: legColor,
		matrix: new Matrix4(backRightLegBottomMatrix) //
			.scale(0.1, 0.25, 0.1)
	})

	// back right leg foot
	drawCube({
		color: [111 / 255, 149 / 255, 252 / 255, 1],
		matrix: getFootMatrix(backRightLegBottomMatrix, backRightLegFootAngle)
	})

	const tailMatrix = new Matrix4() //

	if (wave) tailMatrix.translate(-0.4, -0.3, 0)

	// tail
	drawCube({
		color: legColor,
		matrix: tailMatrix //
			.translate(0.8, 0, -0.05)
			.rotate(20, 0, 0, 1)
			.rotate(tailAngle, 0, 1, 0)
			.scale(0.2, 0.1, 0.1)
	})
}
