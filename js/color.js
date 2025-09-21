/**
 * @description Convertit une couleur hexadécimale en objet RGB
 * @param {string} hexCol La couleur hexadécimale à convertir
 * @returns {object} L'objet RGB correspondant
 */
function hexToRgb(hexCol){
  return{
    r: parseInt(hexCol.substr(1,2), 16),
    g: parseInt(hexCol.substr(3,2), 16),
    b: parseInt(hexCol.substr(5,2), 16)
  };
}

/**
 * @description Convertit une chaîne RGB en objet RGB
 * @param {string} strCol La chaîne RGB à convertir
 * @returns {object} L'objet RGB correspondant
 * @memberof Color
 */
function strRgb_to_objRgb(strCol){
  arrCol = strCol.substring(4, strCol.length - 1).split(', ');
  return {
    r: arrCol[0],
    g: arrCol[1],
    b: arrCol[2]
  };
}

/**
 * @description Convertit une chaîne RGBA en objet RGBA
 * @param {string} strCol La chaîne RGBA à convertir
 * @returns {{r: string, g: string, b: string, a: string}} L'objet RGBA correspondant
 * @memberof Color
 */
function strRgba_to_objRgba(strCol){
  arrCol = strCol.substring(5, strCol.length - 1).split(', ');
  return {
    r: arrCol[0],
    g: arrCol[1],
    b: arrCol[2],
    a: arrCol[3]
  };
}

/**
 * @description Convertit une couleur hexadécimale en objet HSL
 * @param {string} hex La couleur hexadécimale à convertir
 * @returns {{h: number, s: number, l: number}} L'objet HSL correspondant
 * @memberof Color
 */
function hexToHSL(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0;
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    s = s*100;
    s = Math.round(s);
    l = l*100;
    l = Math.round(l);
    h = Math.round(360*h);

    return {h, s, l};
}

/**
 * @description Convertit une couleur RGBA en objet HSLA
 * @param {number} r La composante rouge
 * @param {number} g La composante verte
 * @param {number} b La composante bleue
 * @param {number} a La composante alpha
 * @returns {{h: number, s: number, l: number, a: number}} L'objet HSLA correspondant
 * @memberof Color
 */
function RGBAToHSLA(r, g, b, a) {
  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

      if (delta == 0)
    h = 0;
  // Red is max
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax == g)
    h = (b - r) / delta + 2;
  // Blue is max
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0)
      h += 360;

      l = (cmax + cmin) / 2;

      // Calculate saturation
      s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

      // Multiply l and s by 100
      s = +(s * 100).toFixed(1);
      l = +(l * 100).toFixed(1);

      a /= 255;

      return {h, s, l, a};
}

/**
 * @description Convertit une couleur HSLA en objet RGBA
 * @param {number} h La composante de teinte
 * @param {number} s La composante de saturation
 * @param {number} l La composante de luminosité
 * @param {number} a La composante alpha
 * @returns {{r: number, g: number, b: number, a: number}} L'objet RGBA correspondant
 * @memberof Color
 */
function HSLAToRGBA(h, s, l, a) {
  // Must be fractions of 1
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;

      if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  a *= 255;

  return {r, g, b, a};
}

/**
 * @description Calcule la somme des couleurs HSLA
 * @param {Array} colors Un tableau d'objets HSLA
 * @returns {{h: number, s: number, l: number, a: number}} La couleur HSLA résultante
 * @memberof Color
 */
function hslaSum(colors){
  let xS = 0, yS = 0, wS = 0, uS = 0, zS = 0, aS = 0; nb = 0;

  colors.forEach(color => {
    let p  = !color.p && color.p != 0 ? 1 : color.p;
    let ls = !color.ls ? 0 : color.ls;
    let st = !color.st ? 0 : color.st;

    xS += Math.cos(color.h * rad) * color.s * p;
    yS += Math.sin(color.h * rad) * color.s * p;
    wS += ls * p;
    uS += st * p;
    zS += color.l * p;
    aS += color.a * p;

    nb += p;
  });

  xS /= nb;
  yS /= nb;
  wS /= nb;
  uS /= nb;
  zS /= nb;
  aS /= nb;

  return {h: atan2(yS, xS) / rad, s: Math.sqrt(xS * xS + yS * yS), l: zS, ls: wS, st: uS, a: aS};
}

/**
 * @description Convertit un objet RGB en chaîne de caractères RGB
 * @param {{r: number, g: number, b: number}} arrCol L'objet RGB à convertir
 * @returns {string} La chaîne de caractères RGB correspondante
 * @memberof Color
 */
function objRgb_to_strRgb(arrCol){
  return "rgb(" + arrCol.r + ", " + arrCol.g + ", " + arrCol.b + ")";
}

/**
 * @description Convertit un objet RGBA en chaîne de caractères RGBA
 * @param {{r: number, g: number, b: number, a: number}} arrCol L'objet RGBA à convertir
 * @returns {string} La chaîne de caractères RGBA correspondante
 * @memberof Color
 */
function objRgba_to_strRgba(arrCol){
  return "rgba(" + arrCol.r + ", " + arrCol.g + ", " + arrCol.b + ", " + arrCol.a + ")";
}

/**
 * @description Met à jour la couleur de fond en fonction de la couleur de premier plan
 * @param {{r: number, g: number, b: number}} bg La couleur de fond
 * @returns {{r: number, g: number, b: number}} La couleur de premier plan mise à jour
 * @memberof Color
 */
function updateColorToBack(bg){
  let sumColor = 0;
  for(var col in bg){ sumColor += parseInt(bg[col]); }
  return sumColor < 1.5*255 ? {r : 255, g: 255, b: 255} : {r : 0, g: 0, b: 0};
}