// @ts-check

const { PI, sin, cos } = Math

const d = PI / 100
const dd = PI / 100

const sphereVerticesArr = []

for (let theta = 0; theta < PI; theta += d) {
	for (let phi = 0; phi < 2 * PI; phi += d) {
		const p1 = [sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta)]
		const p2 = [sin(theta + dd) * cos(phi), sin(theta + dd) * sin(phi), cos(theta + dd)]
		const p3 = [sin(theta) * cos(phi + dd), sin(theta) * sin(phi + dd), cos(theta)]
		const p4 = [sin(theta + dd) * cos(phi + dd), sin(theta + dd) * sin(phi + dd), cos(theta + dd)]

		// prettier-ignore
		sphereVerticesArr.push(
				...p1, 0, 0, ...p1,
				...p2, 0, 0, ...p2,
				...p4, 0, 0, ...p4,
				...p1, 0, 0, ...p1,
				...p4, 0, 0, ...p4,
				...p3, 0, 0, ...p3,
			)
	}
}

const sphereVertices = new Float32Array(sphereVerticesArr)

/**
 * @param {object} params
 * @param {[number, number, number, number]} params.color
 * @param {Matrix4} params.matrix
 */
function drawSphere({ color, matrix }) {
	gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements)
	gl.uniformMatrix4fv(u_NormalMatrix, false, new Matrix4(matrix).invert().transpose().elements)

	// @ts-expect-error
	gl.uniform1i(u_whichTexture, normalsCheckbox.checked ? Textures.NormalDebug : Textures.Color)
	gl.uniform4f(u_FragColor, ...color)

	gl.bufferData(gl.ARRAY_BUFFER, sphereVertices, gl.DYNAMIC_DRAW)

	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length / 8)
}
