export function componentToRGBNumber(c: number) {
  return Math.round(c * 255)
}
export function componentToHex(c: number) {
  var hex = (componentToRGBNumber(c) | (1 << 8)).toString(16).slice(1)
  return hex.length == 1 ? '0' + hex : hex
}

export function rgbaToHex(r: number, g: number, b: number, a?: number) {
  let hex = '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  let alpha = a ? String(a) : '1'
  alpha =
    alpha === '1'
      ? ''
      : ((Number(alpha) * 255) | (1 << 8)).toString(16).slice(1)
  return hex + alpha
}

export function gradientStopsToRgba(gradientStops: ColorStop[]) {
  return gradientStops
    .map((item) => {
      return `rgba(${componentToRGBNumber(item.color.r)},${componentToRGBNumber(
        item.color.g
      )},${componentToRGBNumber(item.color.b)},${item.color.a}) ${
        item.position * 100
      }%`
    })
    .join(',')
}
