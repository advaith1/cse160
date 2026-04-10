// @ts-check

class Triangle {
  /**
   * @param {object} params
   * @param {number[]} params.position
   * @param {[number, number, number, number]} params.color
   * @param {number} params.size
   */
  constructor({ position, color, size }) {
    this.position = position
    this.color = color
    this.size = size
  }

  render() {
    const [x, y] = this.position
    const [r, g, b, a] = this.color

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, r, g, b, a)
    // Pass the size of a point to u_Size variable
    gl.uniform1f(u_Size, this.size)

    const d = this.size / 200

    // for the picture, can pass in vertices directly in position. otherwise normally construct vertices
    const vertices = this.position.length === 6 ? this.position : [x, y, x + d, y, x, y + d]

    // Write data into the buffer object for a_Position
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}
