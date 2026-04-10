// @ts-check

class Line {
  /**
   * @param {object} params
   * @param {[number, number] | undefined} params.prevLinePosition
   * @param {[number, number] | undefined} params.position
   * @param {[number, number, number, number]} params.color
   * @param {number} params.size
   */
  constructor({ prevLinePosition, position, color, size }) {
    this.position1 = prevLinePosition
    this.position2 = position
    this.color = color
    this.size = size
  }

  render() {
    if (!this.position1 || !this.position2) return
    const [x1, y1] = this.position1
    const [x2, y2] = this.position2

    const [r, g, b, a] = this.color

    // Write data into the buffer object for a_Position
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y2]), gl.DYNAMIC_DRAW)
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, r, g, b, a)
    // Pass the size of a point to u_Size variable
    gl.uniform1f(u_Size, this.size)
    // Draw
    gl.drawArrays(gl.LINES, 0, 2)
  }
}
