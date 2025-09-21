/**
 * @description Dessine une grille carrée sur le canvas de structure
 * @param {number} step - pas de la grille
 * @memberof module:grids
 */
function drawGrid(step = activeGlo.params.gridStep){
  let n = 0;
  let w = structure.width;
  let h = structure.height;
  let c = {x: w/2, y: h/2};

  ctxStructure.strokeStyle = '#0000cc';

  step = w / step;

  for(i = c.x; i <= w; i+=step){
    if(n%8==0){ ctxStructure.lineWidth = 1; }
    else{ ctxStructure.lineWidth = n%2 == 0 ? 0.5 : 0.1; }
    ctxStructure.line({start: {x: i, y: 0}, end: {x: i, y: h}});
    if(i > c.x){
      let distToCenter = c.x - n*step;
      ctxStructure.line({start: {x: distToCenter, y: 0}, end: {x: distToCenter, y: h}});
    }
    else{
      ctxStructure.lineWidth = 2;
      ctxStructure.stroke();
    }
    n++;
  }

  n = 0;
  for(i = c.y; i <= h; i+=step){
    if(n%8==0){ ctxStructure.lineWidth = 1; }
    else{ ctxStructure.lineWidth = n%2 == 0 ? 0.5 : 0.1; }
    ctxStructure.line({start: {x: 0, y: i}, end: {x: w, y: i}});
    if(i > c.y){
      let distToCenter = c.y - n*step;
      ctxStructure.line({start: {x: 0, y: distToCenter}, end: {x: w, y: distToCenter}});
    }
    else{
      ctxStructure.lineWidth = 2;
      ctxStructure.stroke();
    }
    n++;
  }
}

/**
 * @description Dessine une grille héxagonale sur le canvas de structure
 * @param {number} step - pas de la grille
 * @memberof module:grids
 */
function drawEquiGrid(){
  let w = structure.width;
  let h = structure.height;
  let c = {x: w/2, y: h/2};

  let gridStep = activeGlo.params.gridEquiStep%2==0 ? activeGlo.params.gridEquiStep : activeGlo.params.gridEquiStep + 1;
  let step     = w / gridStep;

  let coeff = sqr(3, 0.5);
  let size = step/coeff;

  ctxStructure.lineWidth = 1;

  let n = 0;
  let k = 0;
  for(let i = c.x; i <= w*2; i+=step){
    k = 0;
    for(let j = 0; j <= h; j+=step*(coeff/2)){
      let dec = k%2==0 ? 0 : size*(coeff/2);
      let ptLeft  = point(c.x - (step*n + dec), c.y + j);
      let ptRight = point(c.x + (step*n + dec), c.y - j);

      let gridColor = activeGlo.thirdGridColor;

      ctxStructure.beginPath();
      ctxStructure.polygone({pos: ptLeft, size: size, nb_edges: 6, color: gridColor});
      ctxStructure.polygone({pos: ptRight, size: size, nb_edges: 6, color: gridColor});
      ctxStructure.polygone({pos: {x: c.x + ptLeft.x, y: ptLeft.y}, size: size, nb_edges: 6, color: gridColor});
      ctxStructure.polygone({pos: {x: ptLeft.x, y: ptRight.y}, size: size, nb_edges: 6, color: gridColor});
      ctxStructure.stroke();

      k++;
    }
    n++;
  }
}

/**
 * @description Dessine une grille à rectangulaire au proportion 1/3 sur le canvas de structure
 * @param {number} step - pas de la grille
 * @memberof module:grids
 */
function drawThirdGrid(step = activeGlo.params.thirdGridStep){
  let n = 1;
  let w = structure.width;
  let h = structure.height;

  ctxStructure.strokeStyle = '#223351';

  let frac = activeGlo.params.thirdGridFrac;

  let powStep = pow(frac, step);

  let stepH = w / powStep;
  for(i = stepH; i < w; i+=stepH){
    ctxStructure.lineWidth = 1;
    if(n%(powStep/frac)==0){ ctxStructure.lineWidth = 3; }
    else if(n%(frac)==0){ ctxStructure.lineWidth = 2; }
    ctxStructure.line({start: {x: i, y: 0}, end: {x: i, y: h}});
    n++;
  }

  n = 1;
  let stepW = h / powStep;
  for(i = stepW; i < h; i+=stepW){
    ctxStructure.lineWidth = 1;
    if(n%(powStep/frac)==0){ ctxStructure.lineWidth = 3; }
    else if(n%(frac)==0){ ctxStructure.lineWidth = 2; }
    ctxStructure.line({start: {x: 0, y: i}, end: {x: w, y: i}});
    n++;
  }
}

/**
 * @description Dessine une grille circulaire sur le canvas de structure
 * @param {number} step - pas de la grille
 * @memberof module:grids
 */
function drawCircleGrid(step = activeGlo.params.circleGridStep){
  let n   = 0, m = 0;
  let w   = structure.width;
  let h   = structure.height;
  let c   = {x: w/2, y: h/2};
  let rep = activeGlo.params.circleRep;

  ctxStructure.strokeStyle = '#cc0000';

  let sx = activeGlo.params.ellipse_x, sy = activeGlo.params.ellipse_y;

  stepCircle = 0.5 * w / step;
  for(i = stepCircle; i <= w; i+=stepCircle){
    if(n%4==0){ ctxStructure.lineWidth = n%8==0 ? 1 : 2; }
    else{ ctxStructure.lineWidth = n%2 == 0 ? 0.5 : 0.1; }
    ctxStructure.beginPath();
    ctxStructure.ellipse(c.x, c.y, i*sx, i*sy, 0, two_pi, 0, false);
    ctxStructure.stroke();
    n++;
  }

  let first_ln = {
    start: {x: c.x, y: -20*h},
    end  : {x: c.x, y: 30*h}
  };

  let stepSection = 0.5 * PI / step;
  rotateLn(first_ln, stepSection, c).forEach((section, i) => {
    ctxStructure.lineWidth = i%2 == 0 ? 0.5 : 0.1;
    ctxStructure.line(section);
  });
  if(rep > 0){
    let stepMark = PI/rep;
    rotateLn(first_ln, stepMark, c).forEach((mark, i) => {
      ctxStructure.lineWidth   = (i%2 == 0 && rep%2 == 0) || rep <= 3 ? 2 : 1;
      ctxStructure.strokeStyle = (i%2 == 0 && rep%2 == 0) || rep <= 3 ? '#aa0000' : '#cc0000';
      ctxStructure.line(mark);
    });
  }
}

/**
 * @description Dessine une grille à rectangulaire au proportion 1/3 sur le canvas de structure
 * @param {number} step Le pas de la grille
 * @memberof module:grids
 */
function drawThridGrid(step = activeGlo.params.thirdGridStep){
  let n = 1;
  let w = structure.width;
  let h = structure.height;

  ctxStructure.strokeStyle = '#223351';

  let frac = activeGlo.params.thirdGridFrac;

  let powStep = pow(frac, step);

  let stepH = w / powStep;
  for(i = stepH; i < w; i+=stepH){
    ctxStructure.lineWidth = 1;
    if(n%(powStep/frac)==0){ ctxStructure.lineWidth = 3; }
    else if(n%(frac)==0){ ctxStructure.lineWidth = 2; }
    ctxStructure.line({start: {x: i, y: 0}, end: {x: i, y: h}});
    n++;
  }

  n = 1;
  let stepW = h / powStep;
  for(i = stepW; i < h; i+=stepW){
    ctxStructure.lineWidth = 1;
    if(n%(powStep/frac)==0){ ctxStructure.lineWidth = 3; }
    else if(n%(frac)==0){ ctxStructure.lineWidth = 2; }
    ctxStructure.line({start: {x: 0, y: i}, end: {x: w, y: i}});
    n++;
  }
}

/**
 * Dessine une grille spirale sur le canvas de structure
 * @param {number} step - pas de la grille
 * @memberof module:grids
 */
function drawSpiralGrid(step = activeGlo.params.circleGridStep){
  let n   = 0;
  let w   = structure.width;
  let h   = structure.height;
  let c   = {x: w/2, y: h/2};

  ctxStructure.strokeStyle = '#cc0000';

  let sx = activeGlo.params.ellipse_x, sy = activeGlo.params.ellipse_y;

  stepCircle = 0.5 * w / step;

  let angle = PI/6, firstPt;
  for(i = stepCircle; i <= w; i+=stepCircle){
    if(n%4==0){ ctxStructure.lineWidth = n%8==0 ? 1 : 2; }
    else{ ctxStructure.lineWidth = n%2 == 0 ? 0.5 : 0.1; }
    ctxStructure.beginPath();
    ctxStructure.ellipse(c.x, c.y, i*sx, i*sy, 0, two_pi, 0, false);

    if(i == stepCircle){ firstPt = {x: c.x, y: c.y + i}; }
    else{ firstPt = rotate({x: c.x, y: c.y + i}, c, PI/pow(2*n, 0.5)); }

    let nextPt  = firstPt;

    ctxStructure.crossDiag(firstPt, 3);

    for(let j = 1; j < 12; j++){
      newAngle = angle * j;

      nextPt = rotate(nextPt, c, angle);
      ctxStructure.crossDiag(nextPt, 3);
    }

    ctxStructure.stroke();
    n++;
  }
}

/**
 * @description Fait pivoter une ligne autour d'un centre
 * @param {Object} ln  ligne à faire pivoter
 * @param {number} step angle de rotation
 * @param {{x: number, y: number}} center centre de rotation
 * @returns {Array} lignes pivotées
 */
function rotateLn(ln, step, center){
  let linesRotated = [], lnRotated;
  let k = activeGlo.params.ellipse_x / activeGlo.params.ellipse_y;
  for(let i = 0; i <= PI - step/2; i+=step){
    lnRotated = {
      start: rotate(ln.start, center, i, k),
      end  : rotate(ln.end, center, i, k)
    };
    linesRotated.push(lnRotated);
  }
  return linesRotated;
}

/**
 * @description Ajuste une position donnée pour qu'elle corresponde à l'intersection la plus proche de la la grille choisie
 * @param {{x: number, y: number}} pos position à ajuster
 * @param {string} gridType type de grille
 * @returns {{x: number, y: number}} position ajustée
 */
function posOnGrid(pos, gridType = 'square'){
  let w = canvas.width, h = canvas.height;
  let c = {x: w/2, y: h/2};

  switch(gridType){
    case 'square':
      let stepSz = w / activeGlo.params.gridStep;

      let dToCenter = { x: pos.x - c.x, y: pos.y - c.y };
      let sToCenter = { x: Math.round(dToCenter.x/stepSz), y: Math.round(dToCenter.y/stepSz) };

      let x = c.x + sToCenter.x * stepSz;
      let y = c.y + sToCenter.y * stepSz;

      pos = {x: x, y: y};
      break;
  case 'circle':
      let steps      = activeGlo.params.circleGridStep;
      let r          = hypo(pos.x - c.x, pos.y - c.y);
      let stepCircle = c.x / steps;
      let nbSteps    = Math.round(r / stepCircle);
      let new_r      = nbSteps * stepCircle;

      let stepSection = steps * 4;
      let angle       = twoPiAngle(pos, c);
      let nbSecSteps  = Math.round(angle * stepSection / two_pi);
      let new_angle   = -nbSecSteps * two_pi / stepSection;

      pos.x = c.x + new_r*cos(new_angle);
      pos.y = c.y + new_r*sin(new_angle);

      break;
  case 'third':
      let stepThird      = activeGlo.params.thirdGridFrac**activeGlo.params.thirdGridStep;
      let stepThirdInPix = { x: w/stepThird, y: h/stepThird };

      pos = { x: stepThirdInPix.x * Math.round(pos.x/stepThirdInPix.x), y: stepThirdInPix.y * Math.round(pos.y/stepThirdInPix.y) };

      break;
  }

  return pos;
}
