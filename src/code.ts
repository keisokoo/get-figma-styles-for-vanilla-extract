import { merge, set } from "remeda";
import {
  componentToRGBNumber,
  gradientStopsToRgba,
  rgbaToHex,
} from "./colorFormat";
import { decompose_2d_matrix } from "./decompose";
import { splitWithWordCase } from "./wordFormat";

figma.showUI(__html__);

figma.on("selectionchange", () => {
  figma.ui.postMessage(figma.currentPage.selection);
});

const FontStyle = {
  thin: 100,
  extrathin: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

function extractLinearGradientColor(name: string, currentColor: GradientPaint) {
  const gradientTransform = currentColor.gradientTransform;
  const matrixArray = [
    gradientTransform[0][0],
    gradientTransform[0][1],
    gradientTransform[0][2],
    gradientTransform[1][0],
    gradientTransform[1][1],
    gradientTransform[1][2],
  ] as [number, number, number, number, number, number];
  const decomposedMatrix = decompose_2d_matrix(matrixArray);
  const bgColor = `linear-gradient(${
    decomposedMatrix.deg
  }deg,${gradientStopsToRgba([...currentColor.gradientStops])});`;
  let pushObj = {
    name: name,
    gradientStops: currentColor.gradientStops,
    gradientTransform: currentColor.gradientTransform,
    background: bgColor,
    type: currentColor.type,
    groupName: splitWithWordCase(name, "/"),
  } as any;
  return pushObj;
}
function getBackgroundColor() {
  const paintStyles = figma.getLocalPaintStyles();
  // background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
  const backgroundColors = paintStyles
    .filter(
      (paint) =>
        (paint.paints?.length > 1 &&
          paint.paints.some(
            (color) => color.type === "SOLID" || color.type.includes("GRADIENT")
          )) ||
        (paint.paints.length === 1 &&
          paint.paints.some((color) => color.type.includes("GRADIENT")))
    )
    .map((paint: PaintStyle) => {
      return paint.paints.map((color) => {
        if (color.type === "SOLID") {
          return null;
          // return extractSolidColor(paint.name, type, color)
        } else if (color.type === "GRADIENT_LINEAR") {
          console.log("GRADIENT_LINEAR", color);
          const gradientTransform = color.gradientTransform;
          const matrixArray = [
            gradientTransform[0][0],
            gradientTransform[0][1],
            gradientTransform[0][2],
            gradientTransform[1][0],
            gradientTransform[1][1],
            gradientTransform[1][2],
          ] as [number, number, number, number, number, number];
          const decomposedMatrix = decompose_2d_matrix(
            [...color.gradientTransform[0]].concat(color.gradientTransform[1])
          );
          console.log(
            "decomposedMatrix in linear",
            matrixArray,
            decomposedMatrix,
            color.gradientTransform
          );
          const bgColor = `linear-gradient(${
            decomposedMatrix.deg
          }deg,${gradientStopsToRgba([...color.gradientStops])})`;
          let pushObj = {
            name: paint.name,
            gradientStops: color.gradientStops,
            gradientTransform: color.gradientTransform,
            background: bgColor,
            type: color.type,
          } as any;
          return extractLinearGradientColor(paint.name, color);
        } else if (color.type === "GRADIENT_RADIAL") {
          console.log("radial", color);

          const gradientTransform = color.gradientTransform;
          const matrixArray = [
            Math.round(gradientTransform[0][0]),
            Math.round(gradientTransform[0][1]),
            Math.round(gradientTransform[0][2]),
            Math.round(gradientTransform[1][0]),
            Math.round(gradientTransform[1][1]),
            Math.round(gradientTransform[1][2]),
          ] as [number, number, number, number, number, number];
          const decomposedMatrix = decompose_2d_matrix(
            [...color.gradientTransform[0]].concat(color.gradientTransform[1])
          );
          console.log(
            "decomposedMatrix in GRADIENT_RADIAL",
            decomposedMatrix,
            color.gradientTransform
          );
          return null;
        } else {
          return null;
        }
      });
    })
    .filter((ii) => !!ii)
    .reduce((prev, curr) => {
      let originalName = curr[0].name;

      let groupObject = set({} as any, originalName, curr[0].background);
      prev = merge(prev, groupObject);
      return prev;
    }, {} as any);
  return backgroundColors;
}
function extractSolidColor(name: string, currentColor: SolidPaint) {
  let pushObj = {
    name: name,
    hex: rgbaToHex(
      currentColor.color.r,
      currentColor.color.g,
      currentColor.color.b,
      currentColor.opacity
    ),
    rgba: `rgba(${componentToRGBNumber(
      currentColor.color.r
    )},${componentToRGBNumber(currentColor.color.g)},${componentToRGBNumber(
      currentColor.color.b
    )},${currentColor.opacity})`,
    color: currentColor,
    groupName: splitWithWordCase(name, "/"),
  } as any;
  return pushObj;
}
function getLocalSolidStyles(colorConfig: "hex" | "rgba" = "hex") {
  const paintStyles = figma.getLocalPaintStyles();
  return paintStyles
    .filter(
      (paint) => paint.paints?.length === 1 && paint.paints[0].type === "SOLID"
    )
    .map((paint: PaintStyle) => {
      const currentColor = paint.paints[0];
      if (currentColor.type === "SOLID") {
        return extractSolidColor(paint.name, currentColor);
      }
    })
    .filter((ii) => ii)
    .reduce((prev, curr) => {
      let originalName = curr.name;
      let groupObject = set(
        {} as any,
        originalName,
        colorConfig === "rgba" ? curr.rgba : curr.hex
      );
      prev = merge(prev, groupObject);
      return prev;
    }, {} as any);
}
function getLocalTextStyles() {
  let textStyles: TextStyle[] = figma.getLocalTextStyles();
  return textStyles
    .filter((text: TextStyle) => text.type === "TEXT")
    .map((text: TextStyle) => {
      let fontNameStyle = text.fontName.style
        .replace(/\s/g, "")
        .toLocaleLowerCase() as keyof typeof FontStyle;
      let fontWeight = FontStyle[fontNameStyle] ?? 400;

      let pushObj = {
        name: text.name,
        groupName: splitWithWordCase(text.name, "/"),
        css: {
          fontSize: `${text.fontSize}px`,
          fontWeight: `${fontWeight}`,
          letterSpacing: `${
            text.letterSpacing.unit === "PERCENT"
              ? text.letterSpacing.value + "%"
              : text.letterSpacing.value + "px"
          }`,
          ...(text.lineHeight.unit !== "AUTO" && {
            lineHeight: `${
              text.lineHeight.unit === "PERCENT"
                ? text.lineHeight.value + "%"
                : text.lineHeight.value + "px"
            }`,
          }),
        },
      };
      return pushObj;
    })
    .reduce((prev, curr) => {
      let originalName = curr.name;
      let groupObject = set({} as any, originalName, curr.css);
      prev = merge(prev, groupObject);
      return prev;
    }, {} as any);
}
const localTextStyles = getLocalTextStyles();
console.log("typography", localTextStyles);
const localSolidColors = getLocalSolidStyles();
const localBackgroundColors = getBackgroundColor();
console.log("colors", merge(localSolidColors, localBackgroundColors));

const allColors = merge(localSolidColors, localBackgroundColors);
const onlyKeysValueIsNullColors = Object.keys(allColors).reduce(
  (prev, curr) => {
    prev[curr] = null;
    return prev;
  },
  {} as { [key: string]: null }
);
figma.ui.postMessage({
  type: "styles",
  text: `
  import { createThemeContract, createTheme } from "@vanilla-extract/css";

  export const figmaTypography = ${JSON.stringify(localTextStyles, null, 2)};
  
  const colors = createThemeContract(${JSON.stringify(
    onlyKeysValueIsNullColors,
    null,
    2
  )});
  export const figmaTheme = createTheme(colors, ${JSON.stringify(
    allColors,
    null,
    2
  )}
  );
  `,
});
