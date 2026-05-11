// Blocky World CruzCraft by advaith for CSE 160
// Inspiration and some textures from Minecraft, (c) Mojang AB
// Some inspiration from Umair Rizwan
// Some code and textures (c) 2012 kanda and matsuda

// Vertex shader program
const VSHADER_SOURCE = /*glsl*/ `
	attribute vec4 a_Position;
	attribute vec2 a_UV;
	varying vec2 v_UV;
	uniform mat4 u_ModelMatrix;
	uniform mat4 u_ViewMatrix;
	uniform mat4 u_ProjectionMatrix;
	void main() {
		gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
		v_UV = a_UV;
	}
`

// Fragment shader program
const FSHADER_SOURCE = /*glsl*/ `
	precision mediump float;
	varying vec2 v_UV;
	uniform vec4 u_FragColor;
	uniform sampler2D u_Sampler0;
	uniform sampler2D u_Sampler1;
	uniform sampler2D u_Sampler2;
	uniform sampler2D u_Sampler3;
	uniform sampler2D u_Sampler4;
	uniform sampler2D u_Sampler5;
	uniform sampler2D u_Sampler6;
	uniform sampler2D u_Sampler7;
	uniform sampler2D u_Sampler8;
	uniform sampler2D u_Sampler9;
	uniform sampler2D u_Sampler10;
	uniform int u_whichTexture;
	void main() {
		if (u_whichTexture == -3) { // color
			gl_FragColor = u_FragColor;
		} else if (u_whichTexture == -2) { // UV debug
			gl_FragColor = vec4(v_UV, 1.0, 1.0);
		} else if (u_whichTexture == -1) { // ground
			gl_FragColor = texture2D(u_Sampler1, v_UV * 100.0);
		} else if (u_whichTexture == 0) { // texture0
			gl_FragColor = texture2D(u_Sampler0, v_UV);
		} else if (u_whichTexture == 1) { // texture1
			gl_FragColor = texture2D(u_Sampler1, v_UV);
		} else if (u_whichTexture == 2) { // texture2
			gl_FragColor = texture2D(u_Sampler2, v_UV);
		} else if (u_whichTexture == 3) { // texture3
			gl_FragColor = texture2D(u_Sampler3, v_UV);
		} else if (u_whichTexture == 4) { // texture4
			gl_FragColor = texture2D(u_Sampler4, v_UV);
		} else if (u_whichTexture == 5) { // texture5
			gl_FragColor = texture2D(u_Sampler5, v_UV);
		} else if (u_whichTexture == 6) { // texture6
			gl_FragColor = texture2D(u_Sampler6, v_UV);
		} else if (u_whichTexture == 7) { // texture7
			gl_FragColor = texture2D(u_Sampler7, v_UV);
		} else if (u_whichTexture == 8) { // texture8
			gl_FragColor = texture2D(u_Sampler8, v_UV);
		} else if (u_whichTexture == 9) { // texture9
			gl_FragColor = texture2D(u_Sampler9, v_UV);
		} else if (u_whichTexture == 10) { // texture10
			gl_FragColor = texture2D(u_Sampler10, v_UV);
		} else { // Error
			gl_FragColor = vec4(1, 0.2, 0.2, 1);
		}
		if (gl_FragColor.a < 0.5) discard;
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
let u_ViewMatrix
/** @type {WebGLUniformLocation} */
let u_ProjectionMatrix
/** @type {WebGLUniformLocation} */
let u_whichTexture
/** @type {WebGLUniformLocation[]} */
const samplers = []

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
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
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

	const a_UV = gl.getAttribLocation(gl.program, 'a_UV')
	if (a_UV < 0) {
		console.log('Failed to get the storage location of a_UV')
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

	const FSIZE = Float32Array.BYTES_PER_ELEMENT

	// a_Position: 3 floats at offset 0
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * FSIZE, 0)
	gl.enableVertexAttribArray(a_Position)

	// a_UV: 2 floats after 3 floats
	gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 5 * FSIZE, 3 * FSIZE)
	gl.enableVertexAttribArray(a_UV)

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

	// Get the storage location of u_ViewMatrix
	u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
	if (!u_ViewMatrix) {
		console.log('Failed to get the storage location of u_ViewMatrix')
		return
	}

	// Get the storage location of u_ProjectionMatrix
	u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix')
	if (!u_ProjectionMatrix) {
		console.log('Failed to get the storage location of u_ProjectionMatrix')
		return
	}

	// Get the storage location of u_whichTexture
	u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture')
	if (!u_whichTexture) {
		console.log('Failed to get the storage location of u_whichTexture')
		return
	}

	for (let i = 0; i <= Object.values(Textures).at(-1); i++) {
		samplers[i] = gl.getUniformLocation(gl.program, `u_Sampler${i}`)
		if (!samplers[i]) {
			console.log(`Failed to get the storage location of u_Sampler${i}`)
			return
		}
	}
}

function initTexture(path, textureNum, [minFilter, magFilter]) {
	const image = new Image() // Create the image object
	if (!image) {
		console.log('Failed to create the image object')
		return false
	}
	// Register the event handler to be called on loading an image
	image.onload = () => {
		const texture = gl.createTexture() // Create a texture object
		if (!texture) {
			console.log('Failed to create the texture object')
			return false
		}

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) // Flip the image's y axis
		// Enable texture unit
		gl.activeTexture(gl.TEXTURE0 + textureNum)
		// Bind the texture object to the target
		gl.bindTexture(gl.TEXTURE_2D, texture)

		// Set the texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)

		// Set the texture image
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
		gl.generateMipmap(gl.TEXTURE_2D)

		// Set the texture unit to the sampler
		gl.uniform1i(samplers[textureNum], textureNum)
	}

	// Tell the browser to load an image
	image.src = path

	return true
}

let eye = [0, 1, 0]
let at = [0, 1, -3]
let up = [0, 1, 0]

let velocityY = 0

let slugX
let slugZ
let slugAngle = Math.random() * Math.PI * 2

// the Ground texture is GrassTop repeated 100x

const Textures = {
	Color: -3,
	UVDebug: -2,
	Ground: -1,
	Sky: 0,
	GrassTop: 1,
	GrassSide: 2,
	Dirt: 3,
	LogTop: 4,
	LogSide: 5,
	Leaves: 6,
	Planks: 7,
	Stone: 8,
	Cobblestone: 9,
	Sand: 10
}

const blocks = Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => new Array(100)))

const BLOCK_TYPES = [, 'grass', 'dirt', 'log', 'leaves', 'planks', 'stone', 'cobblestone', 'sand']

let currentBlock = 'dirt'
const keys = new Set()

function main() {
	setupWebGL()
	connectVariablesToGLSL()

	const IMAGE = [gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR]
	const MINECRAFT = [gl.NEAREST_MIPMAP_LINEAR, gl.NEAREST]

	initTexture('textures/sky_cloud.jpg', Textures.Sky, IMAGE)
	initTexture('textures/jungle_grass_top.png', Textures.GrassTop, MINECRAFT)
	initTexture('textures/jungle_grass_side.png', Textures.GrassSide, MINECRAFT)
	initTexture('textures/dirt.png', Textures.Dirt, MINECRAFT)
	initTexture('textures/log_spruce_top.png', Textures.LogTop, MINECRAFT)
	initTexture('textures/log_spruce.png', Textures.LogSide, MINECRAFT)
	initTexture('textures/leaves_spruce_jungle.png', Textures.Leaves, MINECRAFT)
	initTexture('textures/planks_spruce.png', Textures.Planks, MINECRAFT)
	initTexture('textures/stone.png', Textures.Stone, MINECRAFT)
	initTexture('textures/cobblestone.png', Textures.Cobblestone, MINECRAFT)
	initTexture('textures/sand.png', Textures.Sand, MINECRAFT)

	setCurrentBlock('dirt')

	document.onkeydown = e => {
		keys.add(e.key)
		// jump
		if (e.key === ' ' && isOnGround()) velocityY = 12
		if (e.key in BLOCK_TYPES) setCurrentBlock(BLOCK_TYPES[e.key])
	}
	document.onkeyup = e => keys.delete(e.key)

	document.onwheel = e => {
		const i = BLOCK_TYPES.indexOf(currentBlock)
		const next = e.deltaY > 0 ? (i < BLOCK_TYPES.length - 1 ? i + 1 : 1) : i > 1 ? i - 1 : BLOCK_TYPES.length - 1
		setCurrentBlock(BLOCK_TYPES[next])
	}

	canvas.oncontextmenu = e => e.preventDefault()
	canvas.onmousedown = e => {
		const x = Math.floor(at[0])
		const y = Math.max(Math.floor(at[1] + 0.9), 0)
		const z = Math.floor(at[2])

		if (e.buttons === 1) {
			//
			if (document.pointerLockElement !== canvas) {
				canvas.requestPointerLock()
			} else {
				const nearSlug = Math.hypot(eye[0] - slugX, eye[2] - slugZ) < 10
				const lookingDown = at[1] < eye[1]
				if (nearSlug && lookingDown) {
					document.exitPointerLock()
					alert('You found the slug!')
				} else if (blocks[x + 50][y][z + 50]) {
					delete blocks[x + 50][y][z + 50]
				}
			}
		} else if (e.buttons === 2) {
			blocks[x + 50][y][z + 50] = currentBlock
		}
	}
	canvas.onmousemove = e => {
		if (document.pointerLockElement !== canvas) return

		const mouseDeltaX = e.movementX
		const mouseDeltaY = e.movementY

		if (mouseDeltaX === 0 && mouseDeltaY === 0) return

		const d = new Vector3(at).sub(new Vector3(eye)).normalize()
		const horizontalLen = Math.hypot(d.x, d.z)

		const horizontalAngle = Math.atan2(d.z, d.x) + (mouseDeltaX * 0.5 * Math.PI) / 180
		const verticalAngle = Math.max(
			-Math.PI / 2 + 0.01,
			Math.min(Math.PI / 2 - 0.01, Math.atan2(d.y, horizontalLen) - (mouseDeltaY * 0.5 * Math.PI) / 180)
		)

		d.x = Math.cos(verticalAngle) * Math.cos(horizontalAngle)
		d.y = Math.sin(verticalAngle)
		d.z = Math.cos(verticalAngle) * Math.sin(horizontalAngle)

		at = new Vector3(eye).add(d.mul(3)).elements
	}

	fovSlider.oninput = e => (fov.innerText = e.target.value)

	let treeChance = 0.1
	const leavesChance = 0.7
	for (let x = 5; x < 95; x++) {
		treeChance *= 1.3
		if (Math.random() < treeChance) {
			for (let z = 5; z < 95; z++) {
				if (blocks[x][0][z] || Math.hypot(x - 50, z - 50) < 10) continue
				if (Math.random() < treeChance) {
					treeChance *= 0.5
					const height = Math.floor(Math.random() * 5) + 10
					for (let y = 0; y < height; y++) {
						blocks[x][y][z] = 'log'
					}
					const leavesStart = Math.floor(Math.random() * 3) + height - 3
					for (let y = leavesStart; y < height + 2; y++) {
						if (Math.random() < leavesChance) blocks[x - 1][y][z] = 'leaves'
						if (Math.random() < leavesChance) blocks[x + 1][y][z] = 'leaves'
						if (Math.random() < leavesChance) blocks[x][y][z - 1] = 'leaves'
						if (Math.random() < leavesChance) blocks[x][y][z + 1] = 'leaves'
					}
				}
			}
		}
	}

	const blockChance = 0.0025
	for (let x = 0; x < 100; x++) {
		for (let z = 0; z < 100; z++) {
			if (!blocks[x][0][z] && Math.hypot(x - 50, z - 50) > 3 && Math.random() < blockChance) {
				blocks[x][0][z] = Math.random() < 0.8 ? 'grass' : 'dirt'
			}
		}
	}

	// slug initial position
	do {
		slugX = Math.random() * 80 - 40
		slugZ = Math.random() * 80 - 40
	} while (isBlocked({ x: slugX, y: 0, z: slugZ }))

	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0)

	requestAnimationFrame(tick)
}

let lastTickTime = performance.now()
let lastRenderTime = lastTickTime
let renderNum = 0

function tick(timestamp) {
	const dt = (timestamp - lastTickTime) / 1000
	lastTickTime = timestamp

	// movement
	if (keys.size > 0) {
		const d = new Vector3(at).sub(new Vector3(eye)).normalize().setY(0).normalize()
		const right = Vector3.cross(d, new Vector3(up)).normalize()
		const change = new Vector3()
		if (keys.has('w')) {
			// move forward
			change.add(d)
		}
		if (keys.has('s')) {
			// move backward
			change.sub(d)
		}
		if (keys.has('a')) {
			// move left
			change.sub(right)
		}
		if (keys.has('d')) {
			// move right
			change.add(right)
		}
		if (!change.is0) {
			change.mul((8 * dt) / change.magnitude())
			const newEye = new Vector3(eye).add(change)
			if (!isBlocked(newEye)) {
				eye = newEye.elements
				at = new Vector3(at).add(change).elements
			}
		}
		if (keys.has('q')) {
			// turn left
			const d_ = new Vector3(d)
			const r = Math.hypot(d_.x, d_.z)
			const theta = Math.atan2(d_.z, d_.x) - (90 * dt * Math.PI) / 180
			d_.x = r * Math.cos(theta)
			d_.z = r * Math.sin(theta)
			at = new Vector3(eye).add(d_.mul(3)).setY(at[1]).elements
		}
		if (keys.has('e')) {
			// turn right
			const d_ = new Vector3(d)
			const r = Math.hypot(d_.x, d_.z)
			const theta = Math.atan2(d_.z, d_.x) + (90 * dt * Math.PI) / 180
			d_.x = r * Math.cos(theta)
			d_.z = r * Math.sin(theta)
			at = new Vector3(eye).add(d_.mul(3)).setY(at[1]).elements
		}
	}

	// gravity
	if (!isOnGround()) {
		velocityY -= 50 * dt
	} else {
		if (velocityY < 0) velocityY = 0
	}
	if (velocityY !== 0) {
		const newEyeY = eye[1] + velocityY * dt
		const clampedY = Math.max(newEyeY, 0)
		const dy = clampedY - eye[1]
		at[1] += dy
		eye[1] = clampedY
		if (clampedY === 0) velocityY = 0
	}

	// slug movement
	const slugSpeed = 0.1
	const slugDx = Math.sin(slugAngle) * slugSpeed * dt
	const slugDz = -Math.cos(slugAngle) * slugSpeed * dt
	if (isBlocked({ x: slugX + slugDx, y: 0, z: slugZ + slugDz })) {
		slugAngle = Math.random() * Math.PI * 2
	} else {
		slugX += slugDx
		slugZ += slugDz
	}

	render()

	// update dom every 10 renders
	if (renderNum === 0) {
		const duration = performance.now() - lastRenderTime
		perf.innerText = `${String(Math.floor(1 / (duration / 1000)))} fps`
		position.innerText = `Position: ${Math.floor(eye[0])}, ${Math.floor(eye[1])}, ${Math.floor(eye[2])}`
	}
	lastRenderTime = performance.now()
	renderNum = (renderNum + 1) % 10

	requestAnimationFrame(tick)
}

function isBlocked({ x, y, z }) {
	const r = 0.4
	const by = Math.floor(y)
	for (const dx of [-r, r]) {
		for (const dz of [-r, r]) {
			const bx = Math.floor(x + dx) + 50
			const bz = Math.floor(z + dz) + 50
			if (bx < 0 || bx >= 100 || bz < 0 || bz >= 100) return true
			if (blocks[bx]?.[by]?.[bz]) return true
		}
	}
	return false
}

function isOnGround() {
	// standing on the ground or on top of a block
	if (eye[1] <= 0) return true
	return isBlocked({ x: eye[0], y: Math.floor(eye[1]) - 1, z: eye[2] })
}

function setCurrentBlock(block) {
	currentBlock = block
	window[block].style.outline = '4px solid white'
	for (const otherBlock of BLOCK_TYPES) {
		if (otherBlock && otherBlock !== block) {
			window[otherBlock].style.outline = 'none'
		}
	}
}

const BlockTextures = {
	grass: {
		topTexture: Textures.GrassTop,
		sideTexture: Textures.GrassSide,
		bottomTexture: Textures.Dirt
	},
	dirt: {
		texture: Textures.Dirt
	},
	log: {
		texture: Textures.LogTop,
		sideTexture: Textures.LogSide
	},
	leaves: {
		texture: Textures.Leaves
	},
	planks: {
		texture: Textures.Planks
	},
	stone: {
		texture: Textures.Stone
	},
	cobblestone: {
		texture: Textures.Cobblestone
	},
	sand: {
		texture: Textures.Sand
	}
}

function render() {
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	gl.uniformMatrix4fv(
		u_ProjectionMatrix,
		false,
		new Matrix4() //
			.setPerspective(fovSlider.value, canvas.width / canvas.height, 0.1, 200).elements
	)

	gl.uniformMatrix4fv(
		u_ViewMatrix,
		false,
		new Matrix4() //
			.setLookAt(...eye, ...at, ...up).elements
	)

	// Ground
	drawCube({
		matrix: new Matrix4() //
			.translate(-50, -1, -50)
			.scale(100, 0.1, 100),
		texture: Textures.Ground
	})

	// Sky
	drawCube({
		matrix: new Matrix4() //
			.scale(100, 100, 100)
			.translate(-0.5, -0.25, -0.5),
		texture: Textures.Sky
	})

	for (let x = 0; x < blocks.length; x++) {
		for (let y = 0; y < blocks[x].length; y++) {
			for (let z = 0; z < blocks[x][y].length; z++) {
				const block = blocks[x][y][z]
				if (!block) continue
				const matrix = new Matrix4().setTranslate(x - 50, y - 0.89, z - 50).scale(0.99999, 0.99999, 0.99999)
				drawCube({
					matrix,
					...BlockTextures[block]
				})
			}
		}
	}

	// outline the target block if pointing at one
	const tbx = Math.floor(at[0])
	const tby = Math.max(Math.floor(at[1] + 0.9), 0)
	const tbz = Math.floor(at[2])
	if (outlineCheckbox.checked || blocks[tbx + 50]?.[tby]?.[tbz + 50]) {
		drawCubeOutline(new Matrix4().setTranslate(tbx, tby - 0.89, tbz))
	}

	// Slug
	const slugColor = {
		color: [0.9, 0.8, 0, 1],
		texture: Textures.Color
	}
	const slugMatrix = new Matrix4() //
		.translate(slugX, -0.9, slugZ)
		.rotate((-slugAngle * 180) / Math.PI, 0, 1, 0)
	// Body
	drawCube({
		matrix: new Matrix4(slugMatrix) //
			.scale(0.2, 0.1, 0.5),
		...slugColor
	})
	// Head
	drawCube({
		matrix: new Matrix4(slugMatrix) //
			.translate(0, 0.28, -0.28)
			.rotate(45, 1, 0, 0)
			.scale(0.2, 0.1, 0.4),
		...slugColor
	})
	// Left Antenna
	drawCube({
		matrix: new Matrix4(slugMatrix) //
			.translate(0.04, 0.27, -0.23)
			.rotate(20, 0, 0, 1)
			.scale(0.02, 0.15, 0.02),
		...slugColor
	})
	// Right Antenna
	drawCube({
		matrix: new Matrix4(slugMatrix) //
			.translate(0.14, 0.27, -0.23)
			.rotate(-20, 0, 0, 1)
			.scale(0.02, 0.15, 0.02),
		...slugColor
	})
}
