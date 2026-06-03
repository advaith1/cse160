// @ts-check

import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('webgl'))

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
renderer.shadowMap.enabled = true

const fov = 45
const aspect = canvas.width / canvas.height
const near = 0.1
const far = 100
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.set(0, 4, 20)

const controls = new PointerLockControls(camera, canvas)

canvas.onclick = () => controls.lock()

const timer = new THREE.Timer()

const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()

// Mars Ground
// https://freepbr.com/product/rocky-dunes1/
const marsColor = textureLoader.load('./textures/rocky-dunes1-bl/rocky-dunes1_albedo.png')
const marsAO = textureLoader.load('./textures/rocky-dunes1-bl/rocky-dunes1_ao.png')
const marsHeight = textureLoader.load('./textures/rocky-dunes1-bl/rocky-dunes1_height.png')
const marsNormal = textureLoader.load('./textures/rocky-dunes1-bl/rocky-dunes1_normal-ogl.png')
const marsRoughness = textureLoader.load('./textures/rocky-dunes1-bl/rocky-dunes1_roughness.png')

for (const texture of [marsColor, marsAO, marsHeight, marsNormal, marsRoughness]) {
	texture.wrapS = THREE.RepeatWrapping
	texture.wrapT = THREE.RepeatWrapping
	texture.repeat.set(10, 10)
}

const displacementScale = 5
const marsMaterial = new THREE.MeshStandardMaterial({
	map: marsColor,
	color: '#db9f79',
	aoMap: marsAO,
	displacementMap: marsHeight,
	displacementScale,
	normalMap: marsNormal,
	roughnessMap: marsRoughness,
	roughness: 1
})

const marsGeometry = new THREE.PlaneGeometry(1000, 1000, 512, 512)
const ground = new THREE.Mesh(marsGeometry, marsMaterial)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// get height

let heightData = null
let canvasWidth, canvasHeight

function loadHeightMap(url, callback) {
	const img = new Image()
	img.onload = () => {
		const canvas = document.createElement('canvas')
		canvasWidth = img.width
		canvasHeight = img.height
		canvas.width = canvasWidth
		canvas.height = canvasHeight

		const ctx = canvas.getContext('2d')
		ctx.drawImage(img, 0, 0)

		heightData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data
		if (callback) callback()
	}
	img.src = url
}

loadHeightMap('./textures/rocky-dunes1-bl/rocky-dunes1_height.png')

function getTerrainHeight(worldX, worldZ, planeSize, textureRepeat = 1) {
	if (!heightData) return 0

	const u = worldX / planeSize + 0.5
	const v = worldZ / planeSize + 0.5

	const tiledU = (((u * textureRepeat) % 1) + 1) % 1
	const tiledV = (((v * textureRepeat) % 1) + 1) % 1

	const px = tiledU * (canvasWidth - 1)
	const py = tiledV * (canvasHeight - 1)

	const x0 = Math.floor(px)
	const y0 = Math.floor(py)
	const x1 = Math.min(x0 + 1, canvasWidth - 1)
	const y1 = Math.min(y0 + 1, canvasHeight - 1)
	const fx = px - x0
	const fy = py - y0

	const h00 = heightData[(y0 * canvasWidth + x0) * 4] / 255
	const h10 = heightData[(y0 * canvasWidth + x1) * 4] / 255
	const h01 = heightData[(y1 * canvasWidth + x0) * 4] / 255
	const h11 = heightData[(y1 * canvasWidth + x1) * 4] / 255

	const height = h00 * (1 - fx) * (1 - fy) + h10 * fx * (1 - fy) + h01 * (1 - fx) * fy + h11 * fx * fy

	return height * displacementScale
}

function loadColorTexture(path) {
	const texture = textureLoader.load(path)
	texture.colorSpace = THREE.SRGBColorSpace
	return texture
}

const backgroundTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/6/60/ESO_-_Milky_Way.jpg', () => {
	backgroundTexture.mapping = THREE.EquirectangularReflectionMapping
	backgroundTexture.colorSpace = THREE.SRGBColorSpace
	scene.background = backgroundTexture
})

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const color = 0xffffff
const intensity = 3
const directionalLight = new THREE.DirectionalLight(color, intensity)
directionalLight.position.set(0, 10, 0)
directionalLight.target.position.set(-5, 0, 0)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(2048, 2048)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 200
directionalLight.shadow.camera.left = -50
directionalLight.shadow.camera.right = 50
directionalLight.shadow.camera.top = 50
directionalLight.shadow.camera.bottom = -50
scene.add(directionalLight)
scene.add(directionalLight.target)

/** @param {THREE.Group} object */
function enableShadows(object) {
	object.traverse(child => {
		if (child instanceof THREE.Mesh) child.castShadow = true
	})
}

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Rover
// https://science.nasa.gov/3d-resources/mars-2020-perseverance-rover/
/** @type {THREE.Group} */
let rover = null
/** @type {THREE.AnimationMixer} */
let roverMixer = null
/** @type {THREE.AnimationAction[]} */
let roverActions = []
gltfLoader.load('models/Perseverance.glb', gltf => {
	rover = gltf.scene
	rover.scale.multiplyScalar(2)
	rover.translateY(1.75)
	enableShadows(rover)
	roverMixer = new THREE.AnimationMixer(rover)
	roverActions = gltf.animations.map(clip => {
		const action = roverMixer.clipAction(clip)
		action.setLoop(THREE.LoopOnce, 1)
		action.clampWhenFinished = true
		return action
	})
	scene.add(rover)
})

const metalColor = loadColorTexture('textures/metal/Metal009_1K-JPG_Color.jpg')
const metalDisplacement = textureLoader.load('textures/metal/Metal009_1K-JPG_Displacement.jpg')
const metalNormal = textureLoader.load('textures/metal/Metal009_1K-JPG_NormalGL.jpg')
const metalRoughness = textureLoader.load('textures/metal/Metal009_1K-JPG_Roughness.jpg')
const metalMetalness = textureLoader.load('textures/metal/Metal009_1K-JPG_Metalness.jpg')

for (const texture of [metalColor, metalDisplacement, metalNormal, metalRoughness, metalMetalness]) {
	texture.wrapS = THREE.RepeatWrapping
	texture.wrapT = THREE.RepeatWrapping
	texture.repeat.set(1, 4)
}

const metalMaterial = new THREE.MeshStandardMaterial({
	map: metalColor,
	displacementMap: metalDisplacement,
	displacementScale: 0.05,
	normalMap: metalNormal,
	roughnessMap: metalRoughness,
	metalnessMap: metalMetalness,
	metalness: 0.2
})
const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 10, 32)
const pole = new THREE.Mesh(poleGeometry, metalMaterial)
pole.position.set(0, 5, 0)
pole.castShadow = true

const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5.5, 16)
const arm = new THREE.Mesh(armGeometry, metalMaterial)
arm.rotation.z = Math.PI / 2
arm.position.set(2.55, 10, 0)
arm.castShadow = true

const lampAssembly = new THREE.Group()
lampAssembly.position.set(-12, 0, 0)
lampAssembly.add(pole)
lampAssembly.add(arm)
scene.add(lampAssembly)

const lampTilt = Math.atan2(3, 5)
const lampGroup = new THREE.Group()
lampGroup.position.set(7, 10, 0)
lampGroup.rotation.z = lampTilt
lampAssembly.add(lampGroup)

const lampGeometry = new THREE.CylinderGeometry(1.5, 2, 3, 32, 1, true)
const lamp = new THREE.Mesh(lampGeometry, metalMaterial)
lamp.material.side = THREE.DoubleSide
lamp.castShadow = true
lampGroup.add(lamp)

const backplateGeometry = new THREE.CircleGeometry(1.55, 32)
const backplate = new THREE.Mesh(backplateGeometry, metalMaterial)
backplate.rotation.x = -Math.PI / 2
backplate.position.y = 1.5
backplate.castShadow = true
lampGroup.add(backplate)

/** @type {THREE.Group} */
let bulb = null
gltfLoader.load('models/Lightbulb.glb', gltf => {
	bulb = gltf.scene
	bulb.userData.isEmissive = true
	bulb.traverse(child => {
		if (child instanceof THREE.Mesh) {
			child.userData.isEmissive = true
			child.material.emissive = new THREE.Color(0xffffaa)
			child.material.emissiveIntensity = 0
		}
	})
	bulb.scale.multiplyScalar(-0.01)
	bulb.position.set(0, 1.75, 0)
	lampGroup.add(bulb)
})

const spotLight = new THREE.SpotLight(0xffffaa, 0, 40, Math.PI / 7, 0.5)
spotLight.position.set(-3, 10, 0)
spotLight.target.position.set(0, 1.75, 0)
spotLight.castShadow = true
spotLight.shadow.mapSize.set(1024, 1024)
scene.add(spotLight)
scene.add(spotLight.target)

const worldY = new THREE.Vector3(0, 1, 0)

// Positions:
// 50, 20
// 55, 55
// 20, 100
// -20, 130
// -50, 100
// -40, 60
// -60, 30
// -95, -35
// -95, -70
// 0, -100
// 30, -40
// 50, -10

// some models by Poly by Google [CC-BY] via Poly Pizza

// Wrench
/** @type {THREE.Group} */
let wrench = null
gltfLoader.load('models/Wrench.glb', gltf => {
	wrench = gltf.scene
	wrench.userData.name = 'wrench'
	enableShadows(wrench)
	wrench.scale.multiplyScalar(5)
	wrench.position.set(7, 4, 10)
	wrench.rotateZ(-Math.PI / 4)
	scene.add(wrench)
})

// Screwdriver
/** @type {THREE.Group} */
let screwdriver = null
gltfLoader.load('models/Screwdriver.glb', gltf => {
	screwdriver = gltf.scene
	screwdriver.userData.name = 'screwdriver'
	enableShadows(screwdriver)
	screwdriver.scale.multiplyScalar(0.005)
	screwdriver.position.set(-7, 4, 10)
	screwdriver.rotateZ(-Math.PI / 4)
	scene.add(screwdriver)
})

// Gear
/** @type {THREE.Group} */
let gear = null
gltfLoader.load('models/Gear.glb', gltf => {
	gear = gltf.scene
	gear.userData.name = 'gear'
	enableShadows(gear)
	gear.scale.multiplyScalar(0.25)
	gear.position.set(55, 3, 55)
	gear.rotateZ(-Math.PI / 4)
	scene.add(gear)
})

// Screw
/** @type {THREE.Group} */
let screw = null
gltfLoader.load('models/Screw.glb', gltf => {
	screw = gltf.scene
	screw.userData.name = 'screw'
	enableShadows(screw)
	screw.scale.multiplyScalar(0.25)
	screw.position.set(50, 4, -10)
	screw.rotateZ(-Math.PI / 4)
	scene.add(screw)
})

// Washer
const washerShape = new THREE.Shape()
washerShape.absarc(0, 0, 0.2, 0, Math.PI * 2, false)
const holePath = new THREE.Path()
holePath.absarc(0, 0, 0.1, 0, Math.PI * 2, true)
washerShape.holes.push(holePath)
const washerGeometry = new THREE.ExtrudeGeometry(washerShape, {
	depth: 0.1,
	steps: 1,
	bevelEnabled: false
})
const washerMaterial = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	metalness: 0.75,
	roughness: 0.1
})
const washer = new THREE.Mesh(washerGeometry, washerMaterial)
washer.userData.name = 'washer'
washer.position.set(-40, 3, 60)
washer.castShadow = true
scene.add(washer)

// Gear 2
/** @type {THREE.Group} */
let gear2 = null
gltfLoader.load('models/Gear2.glb', gltf => {
	gear2 = gltf.scene
	gear2.userData.name = 'gear2'
	enableShadows(gear2)
	gear2.scale.multiplyScalar(0.005)
	gear2.position.set(-60, 3, 30)
	gear2.rotateZ(-Math.PI / 4)
	scene.add(gear2)
})

// Spring
/** @type {THREE.Group} */
let spring = null
gltfLoader.load('models/Spring.glb', gltf => {
	spring = gltf.scene
	spring.userData.name = 'spring'
	enableShadows(spring)
	spring.scale.multiplyScalar(0.25)
	spring.position.set(20, 2, 100)
	spring.rotateZ(-Math.PI / 4)
	scene.add(spring)
})

// Nail
/** @type {THREE.Group} */
let nail = null
gltfLoader.load('models/Nail.glb', gltf => {
	nail = gltf.scene
	nail.userData.name = 'nail'
	enableShadows(nail)
	nail.scale.multiplyScalar(0.005)
	nail.position.set(50, 2, 20)
	nail.rotateZ(-Math.PI / 4)
	nail.traverse(child => {
		if (child instanceof THREE.Mesh) {
			child.material.side = THREE.DoubleSide
		}
	})
	scene.add(nail)
})

// Nut and Bolt
// Nut and Bolt by serenay tosun [CC-BY] via Poly Pizza
/** @type {THREE.Group} */
let nutAndBolt = null
gltfLoader.load('models/NutAndBolt.glb', gltf => {
	nutAndBolt = gltf.scene
	nutAndBolt.userData.name = 'nutAndBolt'
	enableShadows(nutAndBolt)
	nutAndBolt.position.set(30, 4, -40)
	nutAndBolt.rotateZ(-Math.PI / 4)
	nutAndBolt.traverse(child => {
		if (child instanceof THREE.Mesh) {
			child.material.side = THREE.DoubleSide
		}
	})
	scene.add(nutAndBolt)
})

// Gear 3
/** @type {THREE.Group} */
let gear3 = null
gltfLoader.load('models/Gear.glb', gltf => {
	gear3 = gltf.scene
	gear3.userData.name = 'gear3'
	enableShadows(gear3)
	gear3.scale.multiplyScalar(0.25)
	gear3.position.set(-95, 3, -35)
	gear3.rotateZ(-Math.PI / 4)
	scene.add(gear3)
})

// Screw 2
/** @type {THREE.Group} */
let screw2 = null
gltfLoader.load('models/Screw.glb', gltf => {
	screw2 = gltf.scene
	screw2.userData.name = 'screw2'
	enableShadows(screw2)
	screw2.scale.multiplyScalar(0.25)
	screw2.position.set(-50, 4, 100)
	screw2.rotateZ(-Math.PI / 4)
	scene.add(screw2)
})

// Spring 2
/** @type {THREE.Group} */
let spring2 = null
gltfLoader.load('models/Spring.glb', gltf => {
	spring2 = gltf.scene
	spring2.userData.name = 'spring2'
	enableShadows(spring2)
	spring2.scale.multiplyScalar(0.25)
	spring2.position.set(-95, 4, -70)
	spring2.rotateZ(-Math.PI / 4)
	scene.add(spring2)
})

// Nail 2
/** @type {THREE.Group} */
let nail2 = null
gltfLoader.load('models/Nail.glb', gltf => {
	nail2 = gltf.scene
	nail2.userData.name = 'nail2'
	enableShadows(nail2)
	nail2.scale.multiplyScalar(0.005)
	nail2.position.set(-20, 3, 130)
	nail2.rotateZ(-Math.PI / 4)
	nail2.traverse(child => {
		if (child instanceof THREE.Mesh) {
			child.material.side = THREE.DoubleSide
		}
	})
	scene.add(nail2)
})

// Washer 2
const washer2 = new THREE.Mesh(washerGeometry, washerMaterial.clone())
washer2.userData.name = 'washer2'
washer2.position.set(0, 3, -100)
washer2.castShadow = true
scene.add(washer2)

const objectsPickedUp = new Set()
const scatteredObjects = new Set([
	'gear',
	'screw',
	'washer',
	'gear2',
	'spring',
	'nail',
	'nutAndBolt',
	'gear3',
	'screw2',
	'spring2',
	'nail2',
	'washer2'
])
let collectedAllObjects = false

let selectedObject = null
canvas.addEventListener('click', event => {
	if (!controls.isLocked) return
	if (selectedObject) {
		if (selectedObject === lampAssembly) {
			spotLight.intensity = spotLight.intensity === 0 ? 500 : 0
			bulb.traverse(child => {
				if (child instanceof THREE.Mesh) {
					child.material.emissiveIntensity = child.material.emissiveIntensity === 0 ? 2 : 0
				}
			})
		} else if (selectedObject === rover) {
			if (collectedAllObjects) {
				roverActions.forEach(action => {
					action.reset()
					action.play()
				})
			}
			collectedAllObjects = false
			document.getElementById('done').classList.remove('hidden')
		} else {
			scene.remove(selectedObject)
			const { name } = selectedObject.userData
			selectedObject = null
			objectsPickedUp.add(name)
			if (name === 'screwdriver') document.getElementById('screwdriver').classList.remove('hidden')
			if (name === 'wrench') document.getElementById('wrench').classList.remove('hidden')
			if (objectsPickedUp.has('screwdriver') && objectsPickedUp.has('wrench')) {
				document.getElementById('pickUpScattered').classList.remove('hidden')
				document.getElementById('hints').classList.remove('hidden')
			}
			const scatteredPickedUpCount = objectsPickedUp.intersection(scatteredObjects).size
			document.querySelector('progress').value = scatteredPickedUpCount
			if (objectsPickedUp.size === 14) {
				collectedAllObjects = true
				document.getElementById('repair').classList.remove('hidden')
			}
		}
	}
})

/** @param {THREE.Group | THREE.Mesh} object */
/** @param {number} distance */
function updateCloseToObject(object, distance) {
	const dist = camera.position.distanceTo(object.position)
	const close = dist < distance && (object !== rover || collectedAllObjects)
	object.traverse(child => {
		if (child instanceof THREE.Mesh && !child.userData.isEmissive) {
			child.material.emissive.set(close ? 0xffff00 : 0x000000)
			child.material.emissiveIntensity = close ? 0.6 : 0
			if (close) selectedObject = object
		}
	})
}

const keys = new Set()
document.onkeydown = e => keys.add(e.code)
document.onkeyup = e => keys.delete(e.code)

let renderNum = 0
let lastRenderTime = performance.now()

/** @type {FrameRequestCallback} */
function render(time) {
	time *= 0.001

	timer.update()
	const delta = timer.getDelta()

	if (roverMixer) {
		roverMixer.update(delta)
		for (const action of roverActions) {
			if (action.isRunning() && action.time >= action.getClip().duration / 2) {
				action.paused = true
			}
		}
	}

	selectedObject = null

	/** @param {THREE.Mesh | THREE.Group} object */
	function updateObject(object) {
		if (object) {
			object.rotateOnWorldAxis(worldY, delta)
			updateCloseToObject(object, 4)
		}
	}

	updateObject(wrench)
	updateObject(screwdriver)
	updateObject(gear)
	updateObject(screw)
	updateObject(washer)
	updateObject(gear2)
	updateObject(spring)
	updateObject(nail)
	updateObject(nutAndBolt)
	updateObject(gear3)
	updateObject(screw2)
	updateObject(spring2)
	updateObject(nail2)
	updateObject(washer2)

	if (rover) updateCloseToObject(rover, 6)
	updateCloseToObject(lampAssembly, 7)

	if (controls.isLocked) {
		const moveSpeed = 25 * delta

		if (keys.has('KeyW')) controls.moveForward(moveSpeed)
		if (keys.has('KeyS')) controls.moveForward(-moveSpeed)
		if (keys.has('KeyA')) controls.moveRight(-moveSpeed)
		if (keys.has('KeyD')) controls.moveRight(moveSpeed)
	}

	camera.position.x = Math.max(-450, Math.min(450, camera.position.x))
	camera.position.z = Math.max(-450, Math.min(450, camera.position.z))

	const currentHeight = getTerrainHeight(camera.position.x, camera.position.z, 1000, 10)
	camera.position.y = currentHeight + 2

	// move light so shadows work everywhere
	directionalLight.position.set(camera.position.x, camera.position.y + 20, camera.position.z + 10)
	directionalLight.target.position.set(camera.position.x, camera.position.y, camera.position.z)
	directionalLight.target.updateMatrixWorld()

	renderer.render(scene, camera)

	if (renderNum === 0) {
		const duration = performance.now() - lastRenderTime
		document.getElementById('perf').innerText = `${String(Math.floor(1 / (duration / 1000)))} fps`
		const { x, y, z } = camera.position
		document.getElementById('position').innerText = `Position: ${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}`
	}
	lastRenderTime = performance.now()
	renderNum = (renderNum + 1) % 10

	requestAnimationFrame(render)
}
requestAnimationFrame(render)
