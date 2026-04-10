// @ts-check

class Circle {
  /**
   * @param {object} params
   * @param {[number, number]} params.position
   * @param {[number, number, number, number]} params.color
   * @param {number} params.size
   * @param {number} params.circleSegments
   */
  constructor({ position, color, size, circleSegments }) {
    this.position = position
    this.color = color
    this.size = size
    this.segments = circleSegments
  }

  render() {
    const [x, y] = this.position
    const [r, g, b, a] = this.color

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, r, g, b, a)
    // Pass the size of a point to u_Size variable
    gl.uniform1f(u_Size, this.size)

    const d = this.size / 200

    const vertices = []
    const angleStep = 360 / this.segments
    for (let angle1 = 0; angle1 < 360; angle1 += angleStep) {
      const angle2 = angle1 + angleStep
      const vec1X = Math.cos((angle1 * Math.PI) / 180) * d
      const vec1Y = Math.sin((angle1 * Math.PI) / 180) * d
      const vec2X = Math.cos((angle2 * Math.PI) / 180) * d
      const vec2Y = Math.sin((angle2 * Math.PI) / 180) * d
      vertices.push(x, y, x + vec1X, y + vec1Y, x + vec2X, y + vec2Y)
    }

    // Write data into the buffer object for a_Position
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW)

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2)
  }
}
