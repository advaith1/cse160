function getCtx() {
	const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('example'))
	return canvas.getContext('2d')
}

function clear() {
	const ctx = getCtx()

	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, 400, 400)
}

/**
 * @param {Vector3} v
 * @param {string} color
 */
function drawVector(v, color) {
	const ctx = getCtx()

	ctx.beginPath()
	ctx.moveTo(200, 200)
	ctx.lineTo(200 + v.x * 20, 200 - v.y * 20)
	ctx.strokeStyle = color
	ctx.stroke()
}

function main() {
	clear()

	drawVector(new Vector3([2.25, 2.25, 0]), 'red')
}

function handleDrawEvent() {
	clear()

	drawVector(new Vector3([+x1.value, +y1.value, 0]), 'red')
	drawVector(new Vector3([+x2.value, +y2.value, 0]), 'blue')
}

function angleBetween(v1, v2) {
  const cos = Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude())
  return Math.acos(cos) * 180 / Math.PI
}

function areaTriangle(v1, v2) {
  return Vector3.cross(v1, v2).magnitude() / 2
}

function handleDrawOperationEvent() {
	clear()

	const v1 = new Vector3([+x1.value, +y1.value, 0])
	drawVector(v1, 'red')
	const v2 = new Vector3([+x2.value, +y2.value, 0])
	drawVector(v2, 'blue')

	const op = operation.value
	switch (op) {
		case 'add':
		case 'sub':
			v1[op](v2)
			drawVector(v1, 'green')
			break
		case 'mul':
		case 'div':
    case 'normalize':
			const s = +scalar.value
			v1[op](s)
			v2[op](s)
			drawVector(v1, 'green')
			drawVector(v2, 'green')
			break
    case 'magnitude':
      console.log(`Magnitude v1: ${v1.magnitude()}`)
      console.log(`Magnitude v2: ${v2.magnitude()}`)
      break
    case 'angle':
      console.log(`Angle: ${angleBetween(v1, v2)}`)
      break
    case 'area':
      console.log(`Area of the triangle: ${areaTriangle(v1, v2)}`)
      break
	}
}
