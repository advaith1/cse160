// @ts-check

class Point {
  /**
   * @param {object} params
   * @param {[number, number]} params.position
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

    // Write data into the buffer object for a_Position
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y]), gl.DYNAMIC_DRAW)
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, r, g, b, a)
    // Pass the size of a point to u_Size variable
    gl.uniform1f(u_Size, this.size)
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1)
  }
}
