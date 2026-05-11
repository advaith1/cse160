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
 * @param {number} params.texture
 * @param {number} params.topTexture
 * @param {number} params.sideTexture
 * @param {number} params.bottomTexture
 */
function drawCube({ color, matrix, texture, topTexture = texture, sideTexture = texture, bottomTexture = texture }) {
	gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements)

	if (color) gl.uniform4f(u_FragColor, ...color)

	// prettier-ignore
	// x, y, z, u, v
	const vertices = new Float32Array([
		// Front (z=0)
		0, 0, 0,  0, 0,
		1, 1, 0,  1, 1,
		1, 0, 0,  1, 0,
		0, 0, 0,  0, 0,
		0, 1, 0,  0, 1,
		1, 1, 0,  1, 1,
		// Top (y=1)
		0, 1, 0,  0, 0,
		0, 1, 1,  0, 1,
		1, 1, 1,  1, 1,
		0, 1, 0,  0, 0,
		1, 1, 1,  1, 1,
		1, 1, 0,  1, 0,
		// Back (z=1)
		1, 0, 1,  0, 0,
		0, 1, 1,  1, 1,
		0, 0, 1,  1, 0,
		1, 0, 1,  0, 0,
		1, 1, 1,  0, 1,
		0, 1, 1,  1, 1,
		// Bottom (y=0)
		0, 0, 0,  0, 0,
		1, 0, 0,  1, 0,
		1, 0, 1,  1, 1,
		0, 0, 0,  0, 0,
		1, 0, 1,  1, 1,
		0, 0, 1,  0, 1,
		// Left (x=0)
		0, 0, 0,  1, 0,
		0, 0, 1,  0, 0,
		0, 1, 1,  0, 1,
		0, 0, 0,  1, 0,
		0, 1, 1,  0, 1,
		0, 1, 0,  1, 1,
		// Right (x=1)
		1, 0, 0,  0, 0,
		1, 1, 0,  0, 1,
		1, 1, 1,  1, 1,
		1, 0, 0,  0, 0,
		1, 1, 1,  1, 1,
		1, 0, 1,  1, 0,
	])

	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW)

	gl.uniform1i(u_whichTexture, topTexture)

	// Top
	// setColor(color, 1.1)
	gl.drawArrays(gl.TRIANGLES, 6, 6)

	gl.uniform1i(u_whichTexture, sideTexture)

	// Front
	// setColor(color, 0.95)
	gl.drawArrays(gl.TRIANGLES, 0, 6)

	// Back
	// setColor(color, 0.6)
	gl.drawArrays(gl.TRIANGLES, 12, 6)

	// Left
	// setColor(color, 1)
	gl.drawArrays(gl.TRIANGLES, 24, 6)

	// Right
	// setColor(color, 0.75)
	gl.drawArrays(gl.TRIANGLES, 30, 6)

	gl.uniform1i(u_whichTexture, bottomTexture)

	// Bottom
	// setColor(color, 0.45)
	gl.drawArrays(gl.TRIANGLES, 18, 6)
}

/** @param {Matrix4} matrix */
function drawCubeOutline(matrix) {
	gl.uniformMatrix4fv(
		u_ModelMatrix,
		false,
		new Matrix4(matrix) //
			.translate(0.5, 0.5, 0.5)
			.scale(1.001, 1.001, 1.001)
			.translate(-0.5, -0.5, -0.5).elements
	)

	// prettier-ignore
	const vertices = new Float32Array([
		// 12 edges of a unit cube, each as a pair of endpoints [x,y,z,u,v]
		0,0,0, 0,0,  1,0,0, 0,0, // bottom face
		1,0,0, 0,0,  1,0,1, 0,0,
		1,0,1, 0,0,  0,0,1, 0,0,
		0,0,1, 0,0,  0,0,0, 0,0,
		0,1,0, 0,0,  1,1,0, 0,0, // top face
		1,1,0, 0,0,  1,1,1, 0,0,
		1,1,1, 0,0,  0,1,1, 0,0,
		0,1,1, 0,0,  0,1,0, 0,0,
		0,0,0, 0,0,  0,1,0, 0,0, // vertical edges
		1,0,0, 0,0,  1,1,0, 0,0,
		1,0,1, 0,0,  1,1,1, 0,0,
		0,0,1, 0,0,  0,1,1, 0,0,
	])

	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW)
	gl.uniform4f(u_FragColor, 0, 0, 0, 1)
	gl.uniform1i(u_whichTexture, Textures.Color)
	gl.drawArrays(gl.LINES, 0, 24)
}
