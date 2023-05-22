//------------------ FONCTIONS D'UTILITÉS MATHÉMATIQUES ----------------- //
function getRandomIntInclusive(min, max, zero = false) {
  min = Math.ceil(min);
  max = Math.floor(max);

  var res = Math.floor(Math.random() * (max - min +1)) + min;

  if(!zero){ return res != 0 ? res : getRandomIntInclusive(min, max); }

  return res;
}

function point(x, y){
  return {x, y};
}

function matrix(pt, mat){
  return { x: pt.x * mat[0][0] + pt.y * mat[0][1], y: pt.x * mat[1][0] + pt.y * mat[1][1] };
}

function rotate(point, center, angle, k = 1, spiral = 1) {
  var xM, yM;
  xM = (point.x - center.x) / spiral;
  yM = (point.y - center.y) / spiral;

  let mat = [
    [cos(angle),     -k*sin(angle)],
    [1/k*sin(angle),    cos(angle)]
  ];

  let pt = matrix({x: xM, y: yM}, mat);

  return{
    x: pt.x + center.x,
    y: pt.y + center.y
  };
}

function rotateEllipse(point, center, angle, k = 1, spiral = 1) {
 let xM, yM;
 let angleEllipse = activeGlo.params.angleEllipse;

 let mat = [
   [cos(angle),     -k*sin(angle)],
   [1/k*sin(angle),    cos(angle)]
 ];

 let pt = rotate(point, center, -angleEllipse);
 xM = (pt.x - center.x) / spiral;
 yM = (pt.y - center.y) / spiral;


 pt = matrix({x: xM, y: yM}, mat);
 pt = {x: pt.x + center.x, y: pt.y + center.y};
 return rotate(pt, center, angleEllipse);
}

function rotateByMatrix(pos, roll, pitch, yaw, rad = true) {
	var pitch_rad = pitch * Math.PI / 180;
	var roll_rad = roll * Math.PI / 180;
	var yaw_rad = yaw * Math.PI / 180;

	if(rad){
		pitch_rad = pitch;
		roll_rad = roll;
		yaw_rad = yaw;
	}

	var cos = Math.cos;
	var sin = Math.sin;

	var cosa = cos(yaw_rad);
	var sina = sin(yaw_rad);

	var cosb = cos(pitch_rad);
	var sinb = sin(pitch_rad);

	var cosc = cos(roll_rad);
	var sinc = sin(roll_rad);

	var Axx = cosa*cosb;
	var Axy = cosa*sinb*sinc - sina*cosc;
	var Axz = cosa*sinb*cosc + sina*sinc;

	var Ayx = sina*cosb;
	var Ayy = sina*sinb*sinc + cosa*cosc;
	var Ayz = sina*sinb*cosc - cosa*sinc;

	var Azx = -sinb;
	var Azy = cosb*sinc;
	var Azz = cosb*cosc;

	var cx = 0; var cy = 0; var cz = 0;

	var px = pos.x;
	var py = pos.y;
	var pz = pos.z;

	var pos_to_return = {};

	pos_to_return.x = Axx*px + Axy*py + Axz*pz;
	pos_to_return.y = Ayx*px + Ayy*py + Ayz*pz;
	pos_to_return.z = Azx*px + Azy*py + Azz*pz;

	return pos_to_return;
}

function cpow(val, exp){
  if(parseInt(exp) == exp){ return val < 0 && exp%2 == 0 ? -pow(val, exp) : pow(val, exp); }
  else{ return val < 0 ? -pow(-val, exp) : pow(val, exp); }
}

function rnd_sign(){ return rnd() > 0.5 ? rnd() : -1 + rnd(); }
function getRnd(min, max) { return Math.random() * (max - min) + min; }

function getMaxInd(arr) {
    return arr.reduce((r, v, i, a) => v <= a[r] ? r : i, -1);
}
function getMinInd(arr) {
    return arr.reduce((r, v, i, a) => v >= a[r] ? r : i, -1);
}

function circles(opts){
  let pt;
  let cent       = opts.center;
  let nb_circles = opts.nb_circles;
  let r          = opts.r;
  let k          = opts.ellipse;
  let spiral     = opts.spiral;
  let step       = opts.step;
  let argsFunc   = !opts.argsFunc ? null : opts.argsFunc;

  let coeffStep = spiral == 1 ? 1 : pow(spiral, 400);

  let n;
  for(let i = 1; i <= nb_circles; i++){
    n = 1;
    pt = {x: cent.x, y: cent.y + r*(i/nb_circles)};
    for(let j = step; j <= two_pi+0.0001; j+=step){
      if(spiral != 1){ coeffStep += 1/n; }
      if(!activeGlo.params.angleEllipse){ pt = rotate(pt, cent, step * coeffStep, k, spiral); }
      else{ pt = rotateEllipse(pt, cent, step * coeffStep, k, spiral); }

      opts.func(pt, argsFunc);
      n++;
    }
  }
}

function nmods(){ return activeGlo.modifiers.length; }
function navs() { return avatars.length; }

function makePoly(){
  testStar(14);
}

function rotPoly(r, nb, center, nbEdges, star = activeGlo.starPoly){
  let x = 0, y = 0;

  if(nbEdges < 5){ star = false; }

  let edgeAngle  = two_pi / nbEdges;

  let nbRots    = !star ? 1 : Math.floor((nbEdges+1)/2) - 1;
  let oneMore   = false;

  let pt         = {x: center.x, y: center.y + r};
  let nextPoint  = rotate(pt, center, nbRots * edgeAngle);

  let dToNextPt  = h(nextPoint.x - pt.x, nextPoint.y - pt.y);
  let step       = dToNextPt / (nb/nbEdges);
  let nbPtEdge   = parseInt(nb/nbEdges);

  if(star){
    pt  = rotate(pt, center, edgeAngle/2);
  }

  if(nbPtEdge == 0){ nbPtEdge = 1; }

  let pts = [pt]; let angle = edgeAngle/2;
  for(let i = 1; i <= nbEdges; i++){
    for(let j = 0; j < nbPtEdge; j++){
      x +=  step * cos(angle);
      y += -step * sin(angle);

      pts.push({x: pt.x + x, y: pt.y + y});
    }
    /*if(star && nbEdges % 2 == 0 && nbEdges % 4 != 0 && i == 1 + nbEdges/2){
      oneMore = true;
      angle  += edgeAngle;
      x += 0.5 * nbPtEdge * step  * cos(angle);
      y += 0.5 * nbPtEdge * -step * sin(angle);
    }*/
    angle += nbRots*edgeAngle;
    /*if(oneMore){
      x +=  step * cos(angle);
      y += -step * sin(angle);

      pts.push({x: pt.x + x, y: pt.y + y});
    }*/
  }

  pts.pop();
  return pts;
}

function atan2pi(x, y){
  let angle = Math.atan2(x, y);
  return angle > 0 ? angle : (two_pi + angle);
}


function mod(n, cycle = activeGlo.nb_moves){ return cycle%n==0 ? 1 : 0; }

function atan2piZ(x, y){ return twoPINumber(-3*half_pi - atan2(x, y)); }

function cyclicNumber(n, cycle){ return n%cycle + (n >= 0 ? 0 : cycle); }

function twoPINumber(n){ return cyclicNumber(n, two_pi); }

function flatNumber(n, interval){ return Math.floor(n/interval) * interval; }

function direction(angle, dist){
  return {
    x:  cos(angle) * dist,
    y:  sin(angle) * dist
  };
}

function directions(pt, angle, dist, nb){
  let pts = [];
  for(let i = 1; i <= nb; i++){
    pt = ptAddDir(pt, angle * i, dist);
    pts.push(pt);
  }
  return pts;
}

function ptAddDir(pt, angle, dist){ return ptAddVect(pt, direction(angle, dist)); }

function ptAddVect(pt, v){ return {x: pt.x + v.x, y: pt.y + v.y}; }


function star(opt){
  let nb_edges = opt.nb_edges;
  let nbRots   = Math.floor((nb_edges+1)/2) - 1;
  let pos      = opt.pos;

  let point  = {x: pos.x, y: pos.y - opt.size};
  let points = [];
  points[0]  = [];
  points[1]  = [];

  if(opt.rot || opt.rot == 0){ point = rotate(point, pos, opt.rot); }
  else if(activeGlo.params.rotPoly_angle != 0){
    activeGlo.rotPoly_angle += activeGlo.params.rotPoly_angle/100;
    point = rotate(point, pos, activeGlo.rotPoly_angle);
  }

  oneMore = false; let angle;
  for(var i = 0; i < nb_edges; i++){
    if(nb_edges % 2 == 0 && nb_edges % 4 != 0 && i == 1 + nb_edges/2){
      oneMore = true;
      angle   = 0.5 * nbRots * two_pi/nb_edges;
    }
    else{
      angle = nbRots * two_pi/nb_edges;
    }

    point = rotate(point, pos, angle);
    if(!oneMore){ points[0].push(point); }
    else{ points[1].push(point); }
  }

  if(oneMore){
    point = rotate(point, pos, nbRots * two_pi/nb_edges);
    points[1].push(point);
    points[0].pop();
  }

  console.log(points);
  return points;
}

function pointsStar(pos, nbEdges, nb, starSize, avSize, center, mod = false){
  pts = star({
    nb_edges: nbEdges,
    pos: pos,
    size: starSize
  });

  let nbByEdge = parseInt(nb / nbEdges);

  for(let i = 0; i < pts.length; i++){
    for(let j = 0; j < pts[i].length - 1; j++){
      let ptCurr = pts[i][j];
      let ptNext = pts[i][j + 1];

      let dist = h(ptNext.x - ptCurr.x, ptNext.y - ptCurr.y) / nbByEdge;

      let angle  = atan2piZ(ptNext.x - ptCurr.x, ptNext.y - ptCurr.y);
      for(let k = 0; k < nbByEdge; k++){
        ptCurr = ptAddDir(ptCurr, angle, dist);

        if(!mod){ posAvatar(ptCurr.x, ptCurr.y, avSize, center); }
        else{
          let type    = mod.type ? mod.type : 'attractor';
          let inv     = mod.inv ? mod.inv : false;
          let groupe  = mod.groupe ? mod.groupe : 0;
          let virtual = mod.virtual ? mod.virtual : false;

          pos_modifier(type, ptCurr, inv, groupe, virtual);
        }
      }
    }
  }

  let ptCurr = pts[0][pts[0].length - 1];
  let ptNext = pts[0][0];

  let dist = h(ptNext.x - ptCurr.x, ptNext.y - ptCurr.y) / nbByEdge;

  let angle  = atan2piZ(ptNext.x - ptCurr.x, ptNext.y - ptCurr.y);
  for(let k = 0; k < nbByEdge; k++){
    ptCurr = ptAddDir(ptCurr, angle, dist);

    if(!mod){ posAvatar(ptCurr.x, ptCurr.y, avSize, center); }
    else{
      let type    = mod.type ? mod.type : 'attractor';
      let inv     = mod.inv ? mod.inv : false;
      let groupe  = mod.groupe ? mod.groupe : 0;
      let virtual = mod.virtual ? mod.virtual : false;

      pos_modifier(type, ptCurr, inv, groupe, virtual);
    }
  }

  if(pts[1].length > 0){
    let ptCurr = pts[1][pts[1].length - 1];
    let ptNext = pts[1][0];

    let dist = h(ptNext.x - ptCurr.x, ptNext.y - ptCurr.y) / nbByEdge;

    let angle  = atan2piZ(ptNext.x - ptCurr.x, ptNext.y - ptCurr.y);
    for(let k = 0; k < nbByEdge; k++){
      ptCurr = ptAddDir(ptCurr, angle, dist);

      if(!mod){ posAvatar(ptCurr.x, ptCurr.y, avSize, center); }
      else{
        let type    = mod.type ? mod.type : 'attractor';
        let inv     = mod.inv ? mod.inv : false;
        let groupe  = mod.groupe ? mod.groupe : 0;
        let virtual = mod.virtual ? mod.virtual : false;

        pos_modifier(type, ptCurr, inv, groupe, virtual);
      }
    }
  }
}


function redimLine(startPt, endPt, coeff = 1){
  let dx = endPt.x - startPt.x;
  let dy = endPt.y - startPt.y;

  coeff/=2;

  return {
    startPt: {x: startPt.x - dx * coeff, y: startPt.y - dy * coeff},
    endPt :{x: endPt.x + dx * coeff, y: endPt.y + dy * coeff}
  };
}

/**
 * @description Returns 0 or 1 based on n and cycle
 * @param {number} n The number to test
 * @param {number} cycle The cycle
 */
function zeroOneCycle(n, cycle){ return Math.floor(n/cycle)%2; }

function zmod(cycle, n = activeGlo.nb_moves){ return Math.floor(n/cycle)%2; }



/**
 * @description Show in console prop values of an array of objects
 * @param {String} prop The prop to show the value
 * @param {[]} arrObjs The array of objects
 * @returns {void}
 */
function debugProp(prop, arrObjs = activeGlo.modifiers, sProp = false){
  if(arrObjs.length == 0){ console.log("Empty array"); return false; }
  else{
    let arrToReturn = [];
    if(!sProp){ arrObjs.forEach(obj => { console.log(obj[prop]); arrToReturn.push(obj[prop]); }); }
    else{ arrObjs.forEach(obj => { console.log(obj[prop][sProp]); arrToReturn.push(obj[prop][sProp]); }); }

    return arrToReturn;
  }
}

//------------------ TEST IF SOME NaN IN ARRAY ----------------- //
function naNs(arr) {
  let theNaNs = [];
  arr.forEach((item, i) => {
    for(let prop in item){
      if(typeof(item[prop]) == 'number' && isNaN(item[prop])){ theNaNs.push(item); break; }
    }
  });
  return theNaNs.length > 0 ? theNaNs : 'none';
}
//------------------ TEST IF SOME Infinite IN ARRAY ----------------- //
function infinites(arr) {
  let theNaNs = [];
  arr.forEach((item, i) => {
    for(let prop in item){
      if(typeof(item[prop]) == 'number' && !isFinite(item[prop])){ theNaNs.push(item); break; }
    }
  });
  return theNaNs.length > 0 ? theNaNs : 'none';
}

function switchObjBools(obj = {}, propToUpd = '', cumulation = true){
  if (!obj[propToUpd]) { obj[propToUpd] = false; }

  obj[propToUpd] = !obj[propToUpd];

  if(!cumulation){
    for (let prop in obj) {
        if (typeof (obj[prop]) != 'function' && propToUpd != prop && obj[propToUpd]) {
            obj[prop] = false;
        }
    }
  }
}

function evalNoError(expression){
  try{
    return eval(expression);
  }
  catch(e){
    return 'nok';
  }
}

function evalFormuleColor(expression){
  try{
    eval(expression);
    return true;
  }
  catch(e){
    return false;
  }
}

function hexToRgb(hexCol){
  return{
    r: parseInt(hexCol.substr(1,2), 16),
    g: parseInt(hexCol.substr(3,2), 16),
    b: parseInt(hexCol.substr(5,2), 16)
  };
}

function strRgb_to_objRgb(strCol){
  arrCol = strCol.substring(4, strCol.length - 1).split(', ');
  return {
    r: arrCol[0],
    g: arrCol[1],
    b: arrCol[2]
  };
}

function strRgba_to_objRgba(strCol){
  arrCol = strCol.substring(5, strCol.length - 1).split(', ');
  return {
    r: arrCol[0],
    g: arrCol[1],
    b: arrCol[2],
    a: arrCol[3]
  };
}

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

function objRgb_to_strRgb(arrCol){
  return "rgb(" + arrCol.r + ", " + arrCol.g + ", " + arrCol.b + ")";
}
function objRgba_to_strRgba(arrCol){
  return "rgba(" + arrCol.r + ", " + arrCol.g + ", " + arrCol.b + ", " + arrCol.a + ")";
}

function updateColorToBack(bg){
  let sumColor = 0;
  for(var col in bg){ sumColor += parseInt(bg[col]); }
  return sumColor < 1.5*255 ? {r : 255, g: 255, b: 255} : {r : 0, g: 0, b: 0};
}

function fact(n){ return Array.from(Array(n), (x, index) => index + 1).reduce((acc, val) => acc * val ); }
function factDec(n){
  if(n <= 1){ return 1; }
  return n * factDec(n-1);
}

function round(val, precision = 2){ return Math.round(val*pow(10, precision))/pow(10, precision); }

const deepCopy = (inObject, propNoCopy = []) => {
  let outObject, value;
  if (typeof inObject !== "object" || inObject === null) {
    return inObject;
  }

  outObject = Array.isArray(inObject) ? [] : {};

  for (let key in inObject) {
    if(propNoCopy !== key){
      value = inObject[key];
      outObject[key] = deepCopy(value, propNoCopy);
    }
  }

  if(outObject.propNoCopy){ delete outObject.propNoCopy; }

  return outObject;
};

//En cours
function deepCopyNoCircularArray(obj, objName, objNewName, arr, arrName, iter){
  obj[arrName] = deepCopy(arr, objName);

  if(iter){
    iter--;
    obj[arrName].forEach(item => {
      item[objNewName] = deepCopy(obj, arrName);
    	deepCopyNoCircularArray(item[objNewName], objName, objNewName, arr, arrName, iter);
    });
  }

  return obj;
}

//En cours
function setPropInRecurArray(obj, objName, arrName, prop){
  obj[arrName].forEach((item, i) => {
    item[objName][arrName].forEach(subItem => { subItem[prop] = item[prop]; });
  });
}

function deepCopyNoCircularArraySave(obj, objNewName, arrName){
  let arr     = obj[arrName];
  let copyObj = deepCopy(obj, arrName);

  copyObj[arrName] = deepCopy(arr, obj);

  copyObj[arrName].forEach(item => { item[objNewName] = deepCopy(obj, arrName); });

  return copyObj;
}

const mergeDeep = (target, source, isMergingArrays = false, propNoCopy = []) => {
    target = ((obj) => {
        let cloneObj;
        try {
            cloneObj = JSON.parse(JSON.stringify(obj));
        } catch(err) {
            // If the stringify fails due to circular reference, the merge defaults
            //   to a less-safe assignment that may still mutate elements in the target.
            // You can change this part to throw an error for a truly safe deep merge.
            cloneObj = Object.assign({}, obj);
        }
        return cloneObj;
    })(target);

    const isObject = (obj) => obj && typeof obj === "object";

    if (!isObject(target) || !isObject(source))
        return source;

    Object.keys(source).forEach(key => {
      if(propNoCopy.indexOf(key) === -1){
          const targetValue = target[key];
          const sourceValue = source[key];

          if (Array.isArray(targetValue) && Array.isArray(sourceValue))
              if (isMergingArrays) {
                  target[key] = targetValue.map((x, i) => sourceValue.length <= i ? x : mergeDeep(x, sourceValue[i], isMergingArrays));
                  if (sourceValue.length > targetValue.length)
                      target[key] = target[key].concat(sourceValue.slice(targetValue.length));
              } else {
                  target[key] = targetValue.concat(sourceValue);
              }
          else if (isObject(targetValue) && isObject(sourceValue))
              target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue, isMergingArrays);
          else if(typeof(targetValue) == 'undefined')
              target[key] = sourceValue;
        }
    });

    return target;
};

/**
 * @description Creates a new point
 */
class Pt {
  constructor(x = 0, y = 0){
    this.x = x;
    this.y = y;
  }

  addDir(angle, dist){
    this.addVect(this.direction(angle, dist));
  }

  direction(angle, dist){
    return {
      x:  cos(angle) * dist,
      y:  sin(angle) * dist
    };
  }

  addVect(v){
    this.x += v.x;
    this.y += v.y;
	}
}

function ù(){
  return rnd() > 0.5 ? 0 : 1;
}


function sortNumeric(arr){ return arr.sort(function(a, b){return a-b;}); }

/**
 * @description Return the class of an object
 * @param {object} obj The object
 * @returns {String}
 */
function wclass(obj){ return obj.constructor.name; }

/**
 * @description Return a color inside a palette
 * @param {Object} obj The object
 * @returns {Color}
 */
function makeColorInPalette(hue, palette){

  function calculCol(colBf, col){

  }

  let p = sortNumeric(palette);

  for(let i = 1; i < palette.length; i++){
    let colBf = palette[i-1];
    let col   = palette[i];

    if(hue <= colBf || (hue > colBf && hue <= col)){
      return calculCol([colBf, col]);
    }
  }
  return calculCol([palette[palette.length - 2]], [palette[palette.length - 1]]);
}
