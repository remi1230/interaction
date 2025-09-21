/**
 * @description Récupère un entier aléatoire inclus entre deux valeurs
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @param {boolean} zero - Indique si zéro est une valeur valide
 * @returns {number} - Un entier aléatoire inclus entre min et max
 * @memberof module:calcul
 */
function getRandomIntInclusive(min, max, zero = false) {
  min = Math.ceil(min);
  max = Math.floor(max);

  var res = Math.floor(Math.random() * (max - min +1)) + min;

  if(!zero){ return res != 0 ? res : getRandomIntInclusive(min, max); }

  return res;
}

/**
 * @description Crée un point
 * @param {number} x - Coordonnée x
 * @param {number} y - Coordonnée y
 * @returns {Object} - Un objet représentant le point
 * @memberof module:calcul
 */
function point(x, y){
  return {x, y};
}

/**
 * @description Applique une transformation matricielle à un point
 * @param {Object} pt - Le point à transformer
 * @param {Array} mat - La matrice de transformation
 * @returns {Object} - Le point transformé
 * @memberof module:calcul
 */
function matrix(pt, mat){
  return { x: pt.x * mat[0][0] + pt.y * mat[0][1], y: pt.x * mat[1][0] + pt.y * mat[1][1] };
}

/**
 * @description Fait tourner un point autour d'un centre
 * @param {Object} point - Le point à faire tourner
 * @param {Object} center - Le centre de rotation
 * @param {number} angle - L'angle de rotation
 * @param {number} k - Facteur d'échelle
 * @param {number} spiral - Facteur de spirale
 * @returns {Object} - Le point tourné
 * @memberof module:calcul
 */
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

/**
 * @description Fait tourner un point autour d'un centre en tenant compte d'un facteur d'ellipse
 * @param {Object} point - Le point à faire tourner
 * @param {Object} center - Le centre de rotation
 * @param {number} angle - L'angle de rotation
 * @param {number} k - Facteur d'échelle
 * @param {number} spiral - Facteur de spirale
 * @returns {Object} - Le point tourné
 * @memberof module:calcul
 */
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

/**
 * @description Fait tourner un point autour d'un centre en utilisant une matrice de rotation
 * @param {Object} pos - Le point à faire tourner
 * @param {number} roll - L'angle de roulis
 * @param {number} pitch - L'angle de tangage
 * @param {number} yaw - L'angle de lacet
 * @param {boolean} rad - Indique si les angles sont en radians
 * @returns {Object} - Le point tourné
 * @memberof module:calcul
 */
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

/**
 * @description Fait une symétrie d'un point par rapport à un centre
 * @param {Object} point - Le point à symétriser
 * @param {Object} center - Le centre de symétrie
 * @returns {Object} - Le point symétrisé
 * @memberof module:calcul
 */
function symToCenter(point, center = activeGlo.center){
  return { x: 2*center.x - point.x, y: 2*center.y - point.y };
}

/**
 * @description Implémente une puissance « signée » qui force toujours un résultat réel et qui conserve le signe de val, même pour des valeurs négatives avec des exposants décimaux ou pairs
 * @param {number} val - La base de la puissance
 * @param {number} exp - L'exposant de la puissance
 * @returns {number} - Le résultat de la puissance
 */
function cpow(val, exp){
  if(parseInt(exp) == exp){ return val < 0 && exp%2 == 0 ? -pow(val, exp) : pow(val, exp); }
  else{ return val < 0 ? -pow(-val, exp) : pow(val, exp); }
}

/**
 * @description Génère un nombre aléatoire entre 0 et 1
 * @returns {number} - Un nombre aléatoire entre 0 et 1
 * @memberof module:calcul
 */
function rnd_sign(){ return rnd() > 0.5 ? rnd() : -1 + rnd(); }

/**
 * @description Génère un nombre aléatoire entre min et max
 * @param {number} min - La valeur minimale
 * @param {number} max - La valeur maximale
 * @returns {number} - Un nombre aléatoire entre min et max
 * @memberof module:calcul
 */
function getRnd(min, max) { return Math.random() * (max - min) + min; }

/**
 * @description Renvoie l'indice du maximum d'un tableau
 * @param {*[]} arr - Le tableau à analyser
 * @returns {number} - L'indice du maximum
 * @memberof module:calcul
 */
function getMaxInd(arr) {
    return arr.reduce((r, v, i, a) => v <= a[r] ? r : i, -1);
}
/**
 * @description Renvoie l'indice du minimum d'un tableau
 * @param {*[]} arr - Le tableau à analyser
 * @returns {number} - L'indice du minimum
 * @memberof module:calcul
 */
function getMinInd(arr) {
    return arr.reduce((r, v, i, a) => v >= a[r] ? r : i, -1);
}

/**
 * @description Crée des cercles
 * @param {{center: {x: number, y: number}, nb_circles: number, r: number, ellipse: boolean, spiral: number, step: number, argsFunc: function}} opts - Les options pour créer les cercles
 * @memberof module:calcul
 */
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

/**
 * @description Crée un polygone régulier
 * @param {number} r - Le rayon du polygone
 * @param {number} nb - Le nombre de points du polygone
 * @param {{x: number, y: number}} center - Le centre du polygone
 * @param {number} nbEdges - Le nombre de côtés du polygone
 * @param {boolean} star - Indique si le polygone est une étoile
 * @returns {[{x: number, y: number}]} - Les points du polygone
 * @memberof module:calcul
 */
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
    angle += nbRots*edgeAngle;
  }

  pts.pop();
  return pts;
}

/**
 * @description Renvoie l'angle entre -PI et PI
 * @param {number} x - La coordonnée x
 * @param {number} y - La coordonnée y
 * @returns {number}
 * @memberof module:calcul
 */
function atan2pi(x, y){
  let angle = Math.atan2(x, y);
  return angle > 0 ? angle : (two_pi + angle);
}

/**
 * @description Renvoie le reste de la division de n par cycle
 * @param {number} n - Le nombre à diviser
 * @param {number} cycle - Le cycle de répétition
 * @returns {number}
 * @memberof module:calcul
 */
function mod(n, cycle = activeGlo.nb_moves){ return cycle%n==0 ? 1 : 0; }

/**
 * @description Renvoie l'angle entre -PI et PI
 * @param {number} x - La coordonnée x
 * @param {number} y - La coordonnée y
 * @returns {number}
 * @memberof module:calcul
 */
function atan2piZ(x, y){ return twoPINumber(-3*half_pi - atan2(x, y)); }

/**
 * @description Renvoie un nombre cyclique
 * @param {number} n - Le nombre à rendre cyclique
 * @param {number} cycle - Le cycle de répétition
 * @example
 * cyclicNumber(0, 2) => 0
 * cyclicNumber(1, 2) => 1
 * cyclicNumber(2, 2) => 0
 * cyclicNumber(3, 2) => 1
 * @returns {number}
 * @memberof module:calcul
 */
function cyclicNumber(n, cycle){ return n%cycle + (n >= 0 ? 0 : cycle); }

/**
 * @description Renvoie un nombre dans l'intervalle [0, 2PI]
 * @param {number} n - Le nombre à rendre dans l'intervalle [0, 2PI]
 * @example 
 * twoPINumber(-1) => 2PI - 1
 * twoPINumber(0) => 0
 * twoPINumber(1) => 1
 * twoPINumber(2PI+1) => 1
 * @returns {number}
 * @memberof module:calcul
 */
function twoPINumber(n){ return cyclicNumber(n, two_pi); }

/**
 * @description Tronque vers le bas au multiple de interval
 * @param {number} n - Le nombre à aplatir
 * @param {number} interval - L'intervalle d'aplatissement
 * @example
 * flatNumber(0, 2) => 0
 * flatNumber(1, 2) => 0
 * flatNumber(2, 2) => 2
 * flatNumber(3, 2) => 2
 * @returns {number}
 * @memberof module:calcul
 */
function flatNumber(n, interval){ return Math.floor(n/interval) * interval; }

/**
 * @description Renvoie l'angle entre 0 et 2PI d'un point par rapport à un centre
 * @param {{x: number, y: number}} pos - La position du point
 * @param {{x: number, y: number}} center - Le centre de référence
 * @returns {number} - L'angle entre 0 et 2PI
 * @memberof module:calcul
 */
function twoPiAngle(pos, center){
  let posToCenter = {x: pos.x - center.x, y: pos.y - center.y};
  let angle = atan(posToCenter.x/posToCenter.y);

  let pos_y = posToCenter.y < 0 ? true : false;
  let pos_x = posToCenter.x < 0 ? true : false;

  if    (!pos_x && pos_y)  { angle = half_pi + angle; }
  else if(pos_x && pos_y)  { angle = angle + half_pi; }
  else                     { angle = 3*half_pi + angle; }

  return angle;
}

/**
 * @description Renvoie un vecteur dans la direction spécifiée par un angle et une distance
 * @param {number} angle - L'angle de direction
 * @param {number} dist - La distance à parcourir
 * @returns {{x: number, y: number}} - Le vecteur de direction
 * @memberof module:calcul
 */
function direction(angle, dist){
  return {
    x:  cos(angle) * dist,
    y:  sin(angle) * dist
  };
}

/**
 * @description Renvoie une liste de points dans une direction spécifiée
 * @param {{x: number, y: number}} pt - Le point de départ
 * @param {number} angle - L'angle de direction
 * @param {number} dist - La distance à parcourir
 * @param {number} nb - Le nombre de points à générer
 * @returns {{x: number, y: number}[]} - La liste des points générés
 * @memberof module:calcul
 */
function directions(pt, angle, dist, nb){
  let pts = [];
  for(let i = 1; i <= nb; i++){
    const pt = ptAddDir(pt, angle * i, dist);
    pts.push(pt);
  }
  return pts;
}

/**
 * @description Renvoie un point déplacé dans une direction spécifiée par un angle et une distance
 * @param {{x: number, y: number}} pt - Le point de départ
 * @param {number} angle - L'angle de direction
 * @param {number} dist - La distance à parcourir
 * @returns {{x: number, y: number}} - Le point déplacé
 * @memberof module:calcul
 */
function ptAddDir(pt, angle, dist){ return ptAddVect(pt, direction(angle, dist)); }

/**
 * @description Renvoie un vecteur résultant de l'addition d'un vecteur à un point
 * @param {{x: number, y: number}} pt - Le point de départ
 * @param {{x: number, y: number}} v - Le vecteur à ajouter
 * @returns {{x: number, y: number}} - Le point résultant
 * @memberof module:calcul
 */
function ptAddVect(pt, v){ return {x: pt.x + v.x, y: pt.y + v.y}; }

/**
 * @description Renvoie un ensemble de points représentant une étoile
 * @param {{nb_edges: number, pos: {x: number, y: number}, size: number, rot: number}} opt - Les options de l'étoile
 * @returns {[{x: number, y: number}]} - Les points de l'étoile
 * @memberof module:calcul
 */
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

  return points;
}

/**
 * @description Renvoie un ensemble de points représentant une étoile
 * @param {{x: number, y: number}} pos - La position de l'étoile
 * @param {number} nbEdges - Le nombre de bords de l'étoile
 * @param {number} nb - Le nombre total de points
 * @param {number} starSize - La taille de l'étoile
 * @param {number} avSize - La taille de l'avatar
 * @param {{x: number, y: number}} center - Le centre de l'étoile
 * @returns {[{x: number, y: number}]} - Les points de l'étoile
 * @memberof module:calcul
 */
function pointsStar(pos, nbEdges, nb, starSize, avSize, center){
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

/**
 * Redimensionne une ligne entre deux points
 * @param {{x: number, y: number}} startPt - Le point de départ
 * @param {{x: number, y: number}} endPt - Le point d'arrivée
 * @param {number} coeff - Le coefficient de redimensionnement
 * @returns {{startPt: {x: number, y: number}, endPt: {x: number, y: number}}} - Les points redimensionnés
 * @memberof module:calcul
 */
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
 * @description Renvoie 0 ou 1 en fonction du cycle
 * @param {number} n - Le nombre à tester
 * @param {number} cycle - Le cycle
 * @example
 * zeroOneCycle(0, 2) => 0
 * zeroOneCycle(1, 2) => 0
 * zeroOneCycle(2, 2) => 1
 * zeroOneCycle(3, 2) => 1
 * zeroOneCycle(4, 2) => 0
 * @returns {number} - 0 ou 1
 * @memberof module:calcul
 */
function zeroOneCycle(n, cycle){ return Math.floor(n/cycle)%2; }

/**
 * @description Calcule la factorielle d'un nombre
 * @param {number} n - Le nombre dont on veut calculer la factorielle
 * @returns {number} - La factorielle de n
 * @memberof module:calcul
 */
function factDec(n){
  if(n <= 1){ return 1; }
  return n * factDec(n-1);
}

/**
 * @description Arrondit un nombre à une certaine précision
 * @param {number} val - La valeur à arrondir
 * @param {number} precision - La précision de l'arrondi
 * @example
 * round(3.14159) => 3.14
 * round(3.14159, 3) => 3.142
 * round(3.14159, 0) => 3
 * @returns {number} - La valeur arrondie
 * @memberof module:calcul
 */
function round(val, precision = 2){ return Math.round(val*pow(10, precision))/pow(10, precision); }

/** 
 * @description Représente un point dans un espace 2D
 * @param {number} x - La coordonnée x du point
 * @param {number} y - La coordonnée y du point
 * @returns {Object} - Un objet représentant le point
 * @memberof module:calcul
 */
class Pt {
  constructor(x = 0, y = 0){
    this.x = x;
    this.y = y;
  }
  
  /**
   * Ajoute un vecteur à ce point dans une direction donnée
   * @param {number} angle - L'angle de direction
   * @param {number} dist - La distance à parcourir
   * @memberof module:calcul
   */
  addDir(angle, dist){
    this.addVect(this.direction(angle, dist));
  }

  /**
   * Calcule la direction d'un vecteur à partir d'un angle et d'une distance
   * @param {number} angle - L'angle de direction
   * @param {number} dist - La distance à parcourir
   * @returns {{x: number, y: number}} - Un objet représentant le vecteur
   * @memberof module:calcul
   */
  direction(angle, dist){
    return {
      x:  cos(angle) * dist,
      y:  sin(angle) * dist
    };
  }

  /**
   * Ajoute un vecteur à ce point
   * @param {{x: number, y: number}} v - Le vecteur à ajouter
   * @memberof module:calcul
   */
  addVect(v){
    this.x += v.x;
    this.y += v.y;
	}
}

/**
 * @description Renvoie 0 ou 1 aléatoirement
 * @returns {0|1}
 * @memberof module:calcul
 */
function ù(){
  return rnd() > 0.5 ? 0 : 1;
}

/**
 * @description Calcule la somme des éléments d'un tableau
 * @param {number[]} arr - Le tableau à traiter
 * @returns {number} - La somme des éléments du tableau
 * @memberof module:calcul
 */
const array_sum = arr => arr.reduce((a,b) => a+b, 0);

