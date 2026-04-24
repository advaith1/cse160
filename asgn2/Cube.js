// @ts-check

/**
 * @param {[number, number, number, number]} color
 * @param {number} multiplier
 */
function setColor(color, multiplier) {
	const [r, g, b, a] = color
	gl.uniform4f(u_FragColor, Math.min(r * multiplier, 1), Math.min(g * multiplier, 1), Math.min(b * multiplier, 1), a)
}

/**
 * @param {object} params
 * @param {[number, number, number, number]} params.color
 * @param {Matrix4} params.matrix
 */
function drawCube({ color, matrix }) {
	gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements)

	const vertices = new Float32Array([
		// Front
		0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0,
		// Top
		0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0,
		// Back
		1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
		// Bottom
		0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1,
		// Left
		0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0,
		// Right
		1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1
	])

	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW)

	// Front
	setColor(color, 0.95)
	gl.drawArrays(gl.TRIANGLES, 0, 6)

	// Top
	setColor(color, 1.1)
	gl.drawArrays(gl.TRIANGLES, 6, 6)

	// Back
	setColor(color, 0.6)
	gl.drawArrays(gl.TRIANGLES, 12, 6)

	// Bottom
	setColor(color, 0.45)
	gl.drawArrays(gl.TRIANGLES, 18, 6)

	// Left
	setColor(color, 1)
	gl.drawArrays(gl.TRIANGLES, 24, 6)

	// Right
	setColor(color, 0.75)
	gl.drawArrays(gl.TRIANGLES, 30, 6)
}
