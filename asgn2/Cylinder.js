// @ts-check

/**
 * @param {object} params
 * @param {[number, number, number, number]} params.color
 * @param {Matrix4} params.matrix
 * @param {number} params.segments
 */
function drawCylinder({ color, matrix, segments }) {
	gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements)

	const vertices = []
	const angleStep = 360 / segments

	for (let angle = 0; angle < 360; angle += angleStep) {
		const a1 = (angle * Math.PI) / 180
		const a2 = ((angle + angleStep) * Math.PI) / 180
		const x1 = Math.cos(a1) * 0.5
		const z1 = Math.sin(a1) * 0.5
		const x2 = Math.cos(a2) * 0.5
		const z2 = Math.sin(a2) * 0.5

		// top circle (y=1)
		vertices.push(0.5, 1, 0.5, x1 + 0.5, 1, z1 + 0.5, x2 + 0.5, 1, z2 + 0.5)

		// bottom circle (y=0)
		vertices.push(0.5, 0, 0.5, x2 + 0.5, 0, z2 + 0.5, x1 + 0.5, 0, z1 + 0.5)

		// side (two triangles per segment)
		vertices.push(x1 + 0.5, 0, z1 + 0.5, x2 + 0.5, 0, z2 + 0.5, x2 + 0.5, 1, z2 + 0.5)
		vertices.push(x1 + 0.5, 0, z1 + 0.5, x2 + 0.5, 1, z2 + 0.5, x1 + 0.5, 1, z1 + 0.5)
	}

	gl.uniform4f(u_FragColor, ...color)

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW)

	gl.drawArrays(gl.TRIANGLES, 0, segments * 12)
}
