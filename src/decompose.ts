export function decompose_2d_matrix(mat: number[]) {
  console.log('mat', mat)

  var a = mat[0]
  var b = mat[1]
  var c = mat[2]
  var d = mat[3]
  var e = mat[4]
  var f = mat[5]

  var delta = a * d - b * c

  let result = {
    translation: [e, f],
    deg: 0,
    rotation: 0,
    scale: [0, 0],
    skew: [0, 0],
  }
  // Apply the QR-like decomposition.
  if (a != 0 || b != 0) {
    var r = Math.sqrt(a * a + b * b)
    result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r)
    result.scale = [r, delta / r]
    result.skew = [Math.atan((a * c + b * d) / (r * r)), 0]
  } else if (c != 0 || d != 0) {
    var s = Math.sqrt(c * c + d * d)
    result.rotation =
      Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s))
    result.scale = [delta / s, s]
    result.skew = [0, Math.atan((a * c + b * d) / (s * s))]
  } else {
    // a = b = c = d = 0
  }
  let degree =
    result.rotation * (180 / Math.PI) + (Math.PI / 2) * (180 / Math.PI)
  result.deg = degree < 0 ? degree + 360 : degree

  return result
}
