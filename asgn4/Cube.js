// @ts-check

// prettier-ignore
// POSITION UV    NORMAL
// x, y, z, u, v, nx, ny, nz
const cubeVertices = new Float32Array([
	// Top (y=1)
	0, 1, 0,  0, 0,  0, 1, 0,
	0, 1, 1,  0, 1,  0, 1, 0,
	1, 1, 1,  1, 1,  0, 1, 0,
	0, 1, 0,  0, 0,  0, 1, 0,
	1, 1, 1,  1, 1,  0, 1, 0,
	1, 1, 0,  1, 0,  0, 1, 0,
	// Front (z=0)
	0, 0, 0,  0, 0,  0, 0, -1,
	1, 1, 0,  1, 1,  0, 0, -1,
	1, 0, 0,  1, 0,  0, 0, -1,
	0, 0, 0,  0, 0,  0, 0, -1,
	0, 1, 0,  0, 1,  0, 0, -1,
	1, 1, 0,  1, 1,  0, 0, -1,
	// Back (z=1)
	1, 0, 1,  0, 0,  0, 0, 1,
	0, 1, 1,  1, 1,  0, 0, 1,
	0, 0, 1,  1, 0,  0, 0, 1,
	1, 0, 1,  0, 0,  0, 0, 1,
	1, 1, 1,  0, 1,  0, 0, 1,
	0, 1, 1,  1, 1,  0, 0, 1,
	// Left (x=0)
	0, 0, 0,  1, 0,  -1, 0, 0,
	0, 0, 1,  0, 0,  -1, 0, 0,
	0, 1, 1,  0, 1,  -1, 0, 0,
	0, 0, 0,  1, 0,  -1, 0, 0,
	0, 1, 1,  0, 1,  -1, 0, 0,
	0, 1, 0,  1, 1,  -1, 0, 0,
	// Right (x=1)
	1, 0, 0,  0, 0,  1, 0, 0,
	1, 1, 0,  0, 1,  1, 0, 0,
	1, 1, 1,  1, 1,  1, 0, 0,
	1, 0, 0,  0, 0,  1, 0, 0,
	1, 1, 1,  1, 1,  1, 0, 0,
	1, 0, 1,  1, 0,  1, 0, 0,
	// Bottom (y=0)
	0, 0, 0,  0, 0,  0, -1, 0,
	1, 0, 0,  1, 0,  0, -1, 0,
	1, 0, 1,  1, 1,  0, -1, 0,
	0, 0, 0,  0, 0,  0, -1, 0,
	1, 0, 1,  1, 1,  0, -1, 0,
	0, 0, 1,  0, 1,  0, -1, 0,
])

/**
 * @param {object} params
 * @param {[number, number, number, number]} params.color
 * @param {Matrix4} params.matrix
 * @param {Matrix4} params.originalMatrix
 * @param {number} params.texture
 * @param {number} params.topTexture
 * @param {number} params.sideTexture
 * @param {number} params.bottomTexture
 */
function drawCube({
	color,
	matrix,
	originalMatrix = matrix,
	texture,
	topTexture = texture,
	sideTexture = texture,
	bottomTexture = texture
}) {
	gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements)
	gl.uniformMatrix4fv(u_NormalMatrix, false, new Matrix4(originalMatrix).invert().transpose().elements)

	if (color) gl.uniform4f(u_FragColor, ...color)

	gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.DYNAMIC_DRAW)

	// @ts-expect-error
	if (normalsCheckbox.checked) {
		gl.uniform1i(u_whichTexture, Textures.NormalDebug)
		gl.drawArrays(gl.TRIANGLES, 0, 36)
		return
	}

	// Top
	gl.uniform1i(u_whichTexture, topTexture)
	gl.drawArrays(gl.TRIANGLES, 0, 6)

	// Front, Back, Left, Right
	gl.uniform1i(u_whichTexture, sideTexture)
	gl.drawArrays(gl.TRIANGLES, 6, 24)

	// Bottom
	gl.uniform1i(u_whichTexture, bottomTexture)
	gl.drawArrays(gl.TRIANGLES, 30, 6)
}

// prettier-ignore
const outlineVertices = new Float32Array([
	// 12 edges of a unit cube, each as a pair of endpoints [x,y,z,u,v,nx,ny,nz]
	0,0,0, 0,0, 0,0,0,  1,0,0, 0,0, 0,0,0, // bottom face
	1,0,0, 0,0, 0,0,0,  1,0,1, 0,0, 0,0,0,
	1,0,1, 0,0, 0,0,0,  0,0,1, 0,0, 0,0,0,
	0,0,1, 0,0, 0,0,0,  0,0,0, 0,0, 0,0,0,
	0,1,0, 0,0, 0,0,0,  1,1,0, 0,0, 0,0,0, // top face
	1,1,0, 0,0, 0,0,0,  1,1,1, 0,0, 0,0,0,
	1,1,1, 0,0, 0,0,0,  0,1,1, 0,0, 0,0,0,
	0,1,1, 0,0, 0,0,0,  0,1,0, 0,0, 0,0,0,
	0,0,0, 0,0, 0,0,0,  0,1,0, 0,0, 0,0,0, // vertical edges
	1,0,0, 0,0, 0,0,0,  1,1,0, 0,0, 0,0,0,
	1,0,1, 0,0, 0,0,0,  1,1,1, 0,0, 0,0,0,
	0,0,1, 0,0, 0,0,0,  0,1,1, 0,0, 0,0,0,
])

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

	gl.bufferData(gl.ARRAY_BUFFER, outlineVertices, gl.DYNAMIC_DRAW)
	gl.uniform4f(u_FragColor, 0, 0, 0, 1)
	gl.uniform1i(u_whichTexture, Textures.Color)
	gl.drawArrays(gl.LINES, 0, 24)
}
