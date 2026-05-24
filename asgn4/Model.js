class Model {
	constructor(filePath, matrix) {
		this.filePath = filePath
		this.color = [1, 1, 1, 1]
		this.matrix = matrix
		this.isFullyLoaded = false

		this.getFileContent()
	}

	parseModel(fileContent) {
		const linesTokens = fileContent.split('\n').map(l => l.split(' '))
		const allVertices = linesTokens.filter(tokens => tokens[0] === 'v').map(tokens => tokens.slice(1))
		const allNormals = linesTokens.filter(tokens => tokens[0] === 'vn').map(tokens => tokens.slice(1))

		// [x, y, z, u, v, nx, ny, nz]
		const data = []
		for (const face of linesTokens.filter(tokens => tokens[0] === 'f').flatMap(tokens => tokens.slice(1))) {
			const [v, , n] = face.split('/')
			const [vx, vy, vz] = allVertices[v - 1]
			const [nx, ny, nz] = allNormals[n - 1]
			data.push(+vx, +vy, +vz, 0, 0, +nx, +ny, +nz)
		}

		this.vertexCount = data.length / 8
		this.modelData = new Float32Array(data)
		this.isFullyLoaded = true
	}

	render() {
		if (!this.isFullyLoaded) return

		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements)
		gl.uniformMatrix4fv(u_NormalMatrix, false, new Matrix4(this.matrix).invert().transpose().elements)
		gl.uniform4f(u_FragColor, ...this.color)
		// @ts-expect-error
		gl.uniform1i(u_whichTexture, normalsCheckbox.checked ? Textures.NormalDebug : Textures.Color)

		gl.bufferData(gl.ARRAY_BUFFER, this.modelData, gl.DYNAMIC_DRAW)
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount)
	}

	async getFileContent() {
		try {
			const response = await fetch(this.filePath)
			if (!response.ok) throw new Error(`Could not load file "${this.filePath}". Are you sure the file name/path are correct?`)

			const fileContent = await response.text()
			this.parseModel(fileContent)
		} catch (e) {
			throw new Error(`Something went wrong when loading ${this.filePath}. Error:`, e)
		}
	}
}
