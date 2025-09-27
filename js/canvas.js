(function() {
  get_ctx = function(varCanvas, wrf = false){ return varCanvas.getContext('2d', { willReadFrequently: wrf }); };
  canvasContext = [];
  addCanvas(true);
  allCanvas = [...document.getElementsByClassName('canvas')];
  allCanvas.forEach(canvas => { fix_dpi(canvas); });
  dataCanvas = new Uint8Array(canvas.width * canvas.height);
})();

/**
 * @description Nettoie le canvas en utilisant la méthode
 * ctx.clearRect(0, 0, canvas.width, canvas.height)
 * @memberof module:canvas
 */
function clear(){ ctx.clearRect(0, 0, canvas.width, canvas.height); }

/**
 * @description Ajoute un nouveau canvas
 * @param {boolean} start - Indique si c'est le canvas de départ
 * @param {boolean} duplicate - Indique si c'est un duplicata
 * @param {boolean} toImport - Indique si c'est un canvas à importer
 * @memberof module:canvas
 */
function addCanvas(start = false, duplicate = false, toImport = false){
  let arenaCanvas      = [...document.getElementsByClassName('arenaCanvas')];
  let newCanvas        = document.createElement("canvas");
  let numCanvas        = arenaCanvas.length;

  newCanvas.id        = 'arenaCanvas-' + numCanvas;
  newCanvas.className = 'canvas arenaCanvas';
  
  newCanvas.style.opacity = 1;

  newCanvas.dataset.numCanvas = numCanvas;

  getById("canvasContainer").appendChild(newCanvas);
  getById("canvasContainer").insertBefore(newCanvas, getById('structure'));

  if(!start){
    let selectCanvas   = getById('selectCanvas');
    selectCanvas.max   = parseInt(selectCanvas.max) + 1;
    selectCanvas.value = selectCanvas.max;
  }

  gloStart.selectCanvas.push((numCanvas).toString());
  gloStart.params.selectCanvas = numCanvas;

  if(canvasContext.length > 0){ ctx.saveImage = ctx.getImageData(0, 0, canvas.width, canvas.height); }

  ctx    = get_ctx(newCanvas, true);
  canvas = newCanvas;

  fix_dpi(newCanvas);

  gloStart.center = {x: canvas.width/2, y: canvas.height/2};

  giveFuncToCanvas(canvas, ctx);

  canvasContext.push(ctx);

  if(duplicate){
    glos.push(deepCopy(activeGlo));

    activeGlo = glos[numCanvas];
    activeGlo.modifiers.forEach(mod => {
      mod.glo = deepCopy(activeGlo, 'modifiers', 'inputToSlideWithMouse');
      activeGlo.modifiers.push(deepCopy(mod));
    });
  }
  else{
    if(!start && !toImport){ glos.push(deepCopy(gloStart)); }
    if(!toImport){ activeGlo = glos[numCanvas]; }
  }
  if(!toImport){avatars.forEach(av => { av.size = activeGlo.size; }); }
  if(!start && !toImport){ params_interface(false); }
}

activeGlo.center = canvas.getCenter();

var startWidth    = canvas.width;
var startHeight   = canvas.height;

var ctxStructure  = get_ctx(structure);

giveFuncToCanvas(structure, ctxStructure);
giveFuncToCanvas(brushCanvas, ctxBrush);
giveFuncToCanvas(modPathCanvas, ctxModPath);

/**
 * @description Ajoute des fonctions au canvas et au contexte
 * @param {HTMLCanvasElement} varCanvas variable canvas
 * @param {CanvasRenderingContext2D} varCtx variable contexte
 * @memberof module:canvas
 */
function giveFuncToCanvas(varCanvas, varCtx){
  //------------------ GET CENTER OF CANVAS ----------------- //
  varCanvas.getCenter = function(){ return {x: this.width/2, y: this.height/2}; };

  //------------------ DRAW A LINE BETWEEN TWO POINTS ON CANVAS ----------------- //
  varCtx.ln = function(x1, y1, x2, y2){
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
  };
  //------------------ DRAW A LINE BETWEEN TWO POINTS ON CANVAS ----------------- //
  varCtx.line = function(ln){
    this.beginPath()
    this.ln(ln.start.x, ln.start.y, ln.end.x, ln.end.y);
    this.stroke();
  };
  //------------------ DRAW A CROSS ON CANVAS ----------------- //
  varCtx.cross = function(point, size){
    this.ln(point.x, point.y - size, point.x, point.y + size);
    this.ln(point.x + size, point.y, point.x - size, point.y);
  };
  //------------------ DRAW A DIAG CROSS ON CANVAS ----------------- //
  varCtx.crossDiag = function(point, size){
    this.moveTo(point.x - size, point.y - size);
    this.lineTo(point.x + size, point.y + size);
    this.moveTo(point.x + size, point.y - size);
    this.lineTo(point.x - size, point.y + size);
  };
  //------------------ DRAW AN ANGLE CROSS ON CANVAS ----------------- //
  varCtx.angleCross = function(pt, size, angle){
    let points = [
      point(pt.x, pt.y - size),
      point(pt.x, pt.y + size),
      point(pt.x + size, pt.y),
      point(pt.x - size, pt.y)
    ];

    for(let i = 0; i < 4; i++){ points[i] = rotate(points[i], pt, angle); }

    this.moveTo(points[0].x, points[0].y);
    this.lineTo(points[1].x, points[1].y);
    this.moveTo(points[2].x, points[2].y);
    this.lineTo(points[3].x, points[3].y);
  };
  //------------------ DRAW MULTI ARC ON CANVAS ----------------- //
  varCtx.arcMulti = function(point, size, nb){
    for(let i = 1; i <= nb; i++){
      this.arc(point.x, point.y, size * i / nb, 0, two_pi, false);
      this.stroke();
      this.beginPath();
    }
  };
  //------------------ DRAW ELLIPSE ON CANVAS ----------------- //
  varCtx.spiral = function(pos, r, dim){
    var nb = floor(r/dim - 1);

    var angle = half_pi;
    var turn  = ceil(two_pi / angle);

    for(let i = 0; i < nb; i++){
      var less = i * dim;
      this.beginPath();
      this.ellipse(pos.x, pos.y, r - less, r - less, 0, 0, angle, false);
      this.stroke();
      for(let j = 1; j < turn; j++){
        var add = j*angle;
        this.beginPath();
        this.ellipse(pos.x, pos.y, r - dim - less, r - less, 0, add, angle + add, false);
        this.stroke();
      }
    }
  };
  //------------------ DÉSSINER UN POLYGONE ----------------- //
  varCtx.polygone = function(opt, star = activeGlo.starPoly){
    if(opt.nb_edges < 5){ star = false; }

    let nb_edges = opt.nb_edges;
    let nbRots   = !star ? 1 : Math.floor((nb_edges+1)/2) - 1;
    let pos      = opt.pos;

    let point = {x: pos.x, y: pos.y - opt.size};

    if(opt.rot || opt.rot == 0){ point = rotate(point, pos, opt.rot); }
    else if(activeGlo.params.rotPoly_angle != 0){
      activeGlo.rotPoly_angle += activeGlo.params.rotPoly_angle/100;
      point = rotate(point, pos, activeGlo.rotPoly_angle);
    }

    this.strokeStyle = opt.color;
    this.moveTo(point.x, point.y);

    let oneMore = false;
    for(var i = 0; i < nb_edges; i++){
      if(star && nb_edges % 2 == 0 && nb_edges % 4 != 0 && i == 1 + nb_edges/2){
        oneMore = true;
        point = rotate(point, pos, two_pi/nb_edges);
        this.moveTo(point.x, point.y);
      }
      point = rotate(point, pos, nbRots * two_pi/nb_edges);
      this.lineTo(point.x, point.y);
    }

    if(oneMore){
      point = rotate(point, pos, nbRots * two_pi/nb_edges);
      this.lineTo(point.x, point.y);
    }
  };
  //------------------ DÉSSINER UNE ÉTOILE ----------------- //
  varCtx.star = function(opt){
    let nb_edges = opt.nb_edges;
    let nbRots   = Math.floor((nb_edges+1)/2) - 1;
    let pos      = opt.pos;

    let point = {x: pos.x, y: pos.y - opt.size};

    if(opt.rot || opt.rot == 0){ point = rotate(point, pos, opt.rot); }
    else if(activeGlo.params.rotPoly_angle != 0){
      activeGlo.rotPoly_angle += activeGlo.params.rotPoly_angle/100;
      point = rotate(point, pos, activeGlo.rotPoly_angle);
    }

    this.strokeStyle = opt.color;
    this.moveTo(point.x, point.y);

    for(var i = 0; i < nb_edges; i++){
      oneMore = false;
      if(nb_edges % 2 == 0 && nb_edges % 4 != 0 && i == 1 + nb_edges/2){
        oneMore = true;
        point = rotate(point, pos, two_pi/nb_edges);
        this.moveTo(point.x, point.y);
      }

      point = rotate(point, pos, nbRots*two_pi/nb_edges);
      this.lineTo(point.x, point.y);

      if(oneMore){
        point = rotate(point, pos, nbRots * two_pi/nb_edges);
        this.lineTo(point.x, point.y);
      }
    }
  };
  //------------------ DÉSSINER UN NUAGE DE POINTS ----------------- //
  varCtx.cloud = function(opt){
    let pos = opt.pos;
    let siz = opt.size;
    let nbp = opt.nb_points;
    let szp = opt.sz_point;

    this.strokeStyle = opt.color;

    if(!opt.withLine){
      for(let i = 0; i < nbp; i++){
        let pt_angle     = rnd() * two_pi;
        let pt_x = pos.x + rnd() * siz * Math.cos(pt_angle);
        let pt_y = pos.y + rnd() * siz * Math.sin(pt_angle);

        this.moveTo(pt_x, pt_y);
        this.arc(pt_x, pt_y, szp, 0, two_pi, false);
      }
    }
    else{
      for(let i = 0; i < nbp; i++){
        let pt_angle     = rnd() * two_pi;
        let pt_x = pos.x + rnd() * siz * Math.cos(pt_angle);
        let pt_y = pos.y + rnd() * siz * Math.sin(pt_angle);

        this.moveTo(pos.x, pos.y);
        this.arc(pt_x, pt_y, szp, 0, two_pi, false);
      }
    }
  };
  //------------------ DÉSSINER UNE FORME ALÉATOIRE ----------------- //
  varCtx.alea_form = function(opt){
    let nb_edges = opt.nb_edges;
    let pos      = opt.pos;

    let point = {x: pos.x, y: pos.y - opt.size};

    pos.x+=rnd()*opt.size;
    pos.y+=rnd()*opt.size;

    if(activeGlo.params.rotPoly_angle != 0){
      activeGlo.rotPoly_angle += activeGlo.params.rotPoly_angle/100;
      point = rotate(point, pos, activeGlo.rotPoly_angle);
    }

    this.strokeStyle = opt.color;
    this.moveTo(point.x, point.y);

    for(var i = 0; i < nb_edges; i++){
      point = rotate(point, pos, two_pi/(nb_edges*rnd()));
      this.lineTo(point.x, point.y);
    }
  };
  //------------------ DÉSSINER UNE COURBE DE BÉZIER ----------------- //
  varCtx.bezier = function(startPt, endPt){
    let dx = endPt.x - startPt.x;
    let dy = endPt.y - startPt.y;

    let dAnchor  = h(dx, dy) * 0.5;

    let qPt  = {x: startPt.x + dx/4, y: startPt.y + dy/4};
    let tqPt = {x: startPt.x + 3*dx/4, y: startPt.y + 3*dy/4};

    let angle = atan2piZ(dx, dy);
    let dir   = direction(angle+half_pi, dAnchor);

    let firstAnchor = {x: qPt.x  + dir.x, y: qPt.y  + dir.y};
    let lastAnchor  = {x: tqPt.x - dir.x, y: tqPt.y - dir.y};

    this.moveTo(startPt.x, startPt.y);
    this.bezierCurveTo(firstAnchor.x, firstAnchor.y, lastAnchor.x, lastAnchor.y, endPt.x, endPt.y);
  };
  //------------------ DÉSSINER AVEC LA BROSSE ----------------- //
  varCtx.brush = function(pos, avSize, moves){
    moves.forEach(move => {
      let vector = move.vector;
      let type   = move.type;
      let size   = move.size * avSize;

      pos = {x: pos.x + vector.x*avSize, y: pos.y + vector.y*avSize};
      if(type === 'espace'){ this.moveTo(pos.x, pos.y); }
      else if(type === 'line'){
        this.lineTo(pos.x, pos.y);
      }
      else{
        switch(move.formType){
          case 'circle' : this.moveTo(pos.x + size/2, pos.y); this.arc(pos.x, pos.y, size/2, 0, two_pi); break; 
          case 'square' : this.moveTo(pos.x - size/2, pos.y - size/2); this.rect(pos.x - size/2, pos.y - size/2, size, size); break; 
        }
      }
    });
  };
  //------------------ RETURN TRUE IF PIXEL AT POS IS BLANK, ELSE FASE ----------------- //
  varCtx.isBlank = function(pos, data = imgData){
    let dataPixel = getPosInImageData(data.data, pos.x, pos.y, data.width);
    return dataPixel[0] == 0 && dataPixel[1] == 0 && dataPixel[2] == 0 && dataPixel[3] == 0;
  };

  varCtx.font = "30px Comic Sans MS";
}

/**
 * @description Renvoie le tableau RGBA d'un pixel dans un ImageData
 * @param {ImageData} imgData Les données de l'image  
 * @param {number} x La position x du pixel
 * @param {number} y La position y du pixel
 * @param {number} width La largeur de l'image
 * @returns {Array<number>} RGBA array
 * @memberof module:canvas
 */
function getPosInImageData(imgData, x, y, width) {
  var p = 4 * (x + y * width);
  return imgData.slice(p, p + 4);
}

/**
 * @description Sauvegarde un point sur le canvas de la brosse
 * @param {{x: number, y: number, size: number}} pt Le point à sauvegarder
 * @memberof module:canvas
 */
function savePtOnBrushCanvas(pt){
  pt.size = activeGlo.params.brushSize;
  if(activeGlo.modifiers.length){ getSelectedModifiers().forEach(mod => { mod.glo.firstPtBrush = pt; }); }
  else{ activeGlo.firstPtBrush = pt; }
}

/**
 * @description Sauvegarde un déplacement sur le canvas de modPath
 * @param {{stepsModPath: Array<{x: number, y: number, angleToCenter: number}>}} objGlo
 * @param {{x: number, y: number}} lastPt Le dernier point
 * @param {{x: number, y: number}} pt Le point actuel
 * @memberof module:canvas 
 */
function saveMoveOnModPathCanvas(objGlo, lastPt, pt){
  let center        = modPathCanvas.getCenter();
  let distToCenter  = {x: pt.x - center.x, y: pt.y - center.y};
  let angleToCenter = atan2pi(distToCenter.x, distToCenter.y); 

  objGlo.stepsModPath.push({x: pt.x - lastPt.x, y: pt.y - lastPt.y, angleToCenter});
}

/**
 * @description Sauvegarde un déplacement sur le canvas de la brosse
 * @param {{x: number, y: number, size: number}} pt Le point à sauvegarder
 * @memberof module:canvas
 */
function saveMoveOnBrushCanvas(pt){
  if(activeGlo.modifiers.length){ getSelectedModifiers().forEach(mod => { pushVector(mod.glo); }); }
  else{ pushVector(activeGlo); }

  function pushVector(obj){
    if(!obj.stepsBrush){ obj.stepsBrush = []; }
    obj.stepsBrush.push(new BrushMovement({
      vector: {
        x: pt.x - obj.firstPtBrush.x,
        y: pt.y - obj.firstPtBrush.y
      },
        type: pt.type,
        formType: pt.formType,
        size: activeGlo.params.brushSize
    }));
  }
}

/**
 * @description Sauvegarde un déplacement ou un point sur le canvas de la brosse
 * @param {{formType: string, first: boolean, size: number}} mouseCanvas Le canvas de la souris
 * @param {{type: string, formType: string, size: number}} brushType Le type de brosse
 * @param {string} eventType Le type d'événement
 * @param {boolean} brushCanvasMouseUp Indique si la souris est relâchée
 */
function saveMoveOrPtOnBrushCanvas(mouseCanvas, brushType, eventType, brushCanvasMouseUp){
  mouseCanvas.form      = brushType !== 'manual' && brushType !== 'line';
  mouseCanvas.first     = false;
  mouseCanvas.formType  = brushType;
  mouseCanvas.size      = activeGlo.params.brushSize;

  if(eventType === 'mousedown'){
    if(!brushCanvasMouseUp){
      mouseCanvas.first = true;
      mouseCanvas.type = brushType === 'manual' ? 'espace' : brushType;
      if(mouseCanvas.form){
        mouseCanvas.type = 'form'; 
        savePtOnBrushCanvas({x: 0, y: 0});
        saveMoveOnBrushCanvas(mouseCanvas);
        savePtOnBrushCanvas(mouseCanvas);
      }
      else{
        savePtOnBrushCanvas(mouseCanvas);
      }
    }
    else{
      mouseCanvas.type = brushType === 'manual' || mouseCanvasChangeToLine ? 'espace' : brushType;
      if(mouseCanvas.form){ mouseCanvas.type = 'form'; }
      saveMoveOnBrushCanvas(mouseCanvas);
      savePtOnBrushCanvas(mouseCanvas);
    }
  }
  else if(brushCanvasMouseDown && brushType === 'manual'){
    mouseCanvas.type = 'line';
    saveMoveOnBrushCanvas(mouseCanvas);
    savePtOnBrushCanvas(mouseCanvas);
  }
}

/** 
 * @description Dessine sur le canvas de la brosse selon le type de brosse
 * @param {string} brushType Le type de brosse
 * @memberof module:canvas
 */
function drawOnBrushCanvas(brushType = activeGlo.brushType){
  switch(brushType){
    case 'manual':
      drawPtOnBrushCanvas();
    break;
    case 'line':
      drawLineOnBrushCanvas(mouseCanvasClick, mouseCanvasLastClick);
    break;
    case 'circle':
      drawCircleOnBrushCanvas();
    break;
    case 'square':
      drawSquareOnBrushCanvas();
    break;
  }
}

/**
 * Dessine un carré sur le canvas de la brosse
 * @param {{x: number, y: number, size: number}} pt Le point à dessiner
 * @memberof module:canvas
 */
function drawSquareOnBrushCanvas(pt = mouseCanvas){
  ctxBrush.beginPath();
  ctxBrush.strokeStyle = '#cc0000';
  ctxBrush.lineWidth = 1;
  let sz = pt.size;
  ctxBrush.rect(pt.x - sz/2, pt.y - sz/2, sz, sz);
  ctxBrush.stroke();
}

/**
 * Dessine un cercle sur le canvas de la brosse
 * @param {{x: number, y: number, size: number}} pt Le point à dessiner
 * @memberof module:canvas
 */
function drawCircleOnBrushCanvas(pt = mouseCanvas){
  ctxBrush.beginPath();
  ctxBrush.strokeStyle = '#cc0000';
  ctxBrush.lineWidth = 1;
  ctxBrush.arc(pt.x, pt.y, pt.size/2, 0, two_pi, true);
  ctxBrush.stroke();
}

/**
 * Dessine un point sur le canvas de la brosse
 * @param {{x: number, y: number, size: number}} pt Le point à dessiner
 * @memberof module:canvas
 */
function drawPtOnBrushCanvas(pt = mouseCanvas){
  ctxBrush.beginPath();
  ctxBrush.fillStyle = '#cc0000';
  ctxBrush.lineWidth = 1;
  ctxBrush.arc(pt.x, pt.y, 1, 0, two_pi, true);
  ctxBrush.fill();
}

/**
 * Dessine une lignesur le canvas de la brosse
 * @param {{x: number, y: number}} ptStart Le point de départ
 * @param {{x: number, y: number}} ptEnd Le point de fin
 * @memberof module:canvas
 */
function drawLineOnBrushCanvas(ptStart = mouseCanvasLast, ptEnd = mouseCanvas){
  ctxBrush.strokeStyle = '#cc0000';
  ctxBrush.lineWidth = 1;
  ctxBrush.line({ start: {x: ptStart.x, y: ptStart.y}, end: {x: ptEnd.x, y: ptEnd.y} });
}

/**
 * @description Exécute une fonction de dessin avec stroke() sur un contexte donné
 * @param {CanvasRenderingContext2D} ctxVar Le contexte sur lequel dessiner 
 * @param {function} func La fonction de dessin à exécuter
 */
function strokeOnCanvas(ctxVar, func){
  ctxVar.beginPath();
  func();
  ctxVar.stroke();
}

/**
 * @description Fixe le DPI du canvas pour une meilleure résolution
 * @param {HTMLCanvasElement} varCanvas Le canvas à fixer
 * @memberof module:canvas
 */
function fix_dpi(varCanvas) {
  let style = {
      height() {
        return +getComputedStyle(varCanvas).getPropertyValue('height').slice(0,-2);
      },
      width() {
        return +getComputedStyle(varCanvas).getPropertyValue('width').slice(0,-2);
      }
    };
    varCanvas.setAttribute('width', style.width() * dpi);
    varCanvas.setAttribute('height', style.height() * dpi);
}

/**
 * @description Met à l'échelle le canvas
 * @param {number} scale Le facteur d'échelle
 * @param {Array<CanvasRenderingContext2D>} ctxVars Les contextes à mettre à l'échelle
 * @memberof module:canvas
 */
function scaleCanvas(scale, ctxVars = [ctx, ctxStructure]){
  ctxVars.forEach(ctxVar => {
    ctxVar.scale(scale, scale);
    let sc = scale > 1 ? -1/(scale*2) : scale;
    ctxVar.translate(canvas.width * sc, canvas.height * sc);
  });
}

/**
 * @description Fait pivoter le canvas
 * @param {number} angle L'angle de rotation en radians
 * @param {Array<CanvasRenderingContext2D>} ctxVars Les contextes à faire pivoter
 * @memberof module:canvas
 */
function rotateCanvas(angle, ctxVars = [ctx, ctxStructure]){
  ctxVars.forEach(ctxVar => {
    ctxVar.translate(canvas.width / 2,canvas.height / 2);
    ctxVar.rotate(angle);
    ctxVar.translate(-canvas.width / 2, -canvas.height / 2);
  });
}

/**
 * @description Incline le canvas selon un axe
 * @param {'h'|'v'} axe L'axe d'inclinaison ('h' pour horizontal, 'v' pour vertical)
 * @param {number} angle L'angle d'inclinaison
 * @param {Array<CanvasRenderingContext2D>} ctxVars Les contextes à incliner
 * @memberof module:canvas
 */
function tiltCanvas(axe, angle, ctxVars = [ctx, ctxStructure]){
  ctxVars.forEach(ctxVar => {
    axe === 'h' ? ctxVar.transform(1, angle, 0, 1, 0, 0): ctxVar.transform(1, 0, angle, 1, 0, 0);;
  });
}

/**
 * Met à jour la couleur de fond du canvas
 * @param {HTMLInputElement} ctrl L'élément de contrôle de la couleur
 * @memberof module:canvas
 */
function canvas_bg_upd(ctrl){ canvas.style.backgroundColor = ctrl.value; activeGlo.backgroundColor = ctrl.value;}

/**
 * @description Télécharge le contenu de tous les canvas en une seule image PNG
 * @memberof module:canvas
 */
function downloadCanvas() {
  // On prend la taille réelle (pixels) du premier canvas
  const src = canvasContext[0].canvas;
  const W = Math.round(src.clientWidth * (window.devicePixelRatio || 1));
  const H = Math.round(src.clientHeight * (window.devicePixelRatio || 1));

  // Canvas de sortie aux mêmes dimensions réelles
  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const octx = out.getContext('2d');

  // Fond opaque (ou la couleur du style si définie)
  const bg = src.style.backgroundColor || '#ffffff';
  octx.fillStyle = bg;
  octx.fillRect(0, 0, W, H); // on remplit TOUT le out

  // Dessine chaque calque source dessus
  // (Si tous tes canvas ont la même taille W×H, simple drawImage)
  canvasContext.forEach(ctxCan => {
    const can = ctxCan.canvas;
    if (can.width === W && can.height === H) {
      octx.drawImage(can, 0, 0);
    } else {
      // sécurité si un calque a une taille différente
      octx.drawImage(can, 0, 0, can.width, can.height, 0, 0, W, H);
    }
  });

  // Export
  const href = out.toDataURL('image/png'); // opaque car fond rempli
  const a = document.createElement('a');
  a.download = 'canvas.png';
  a.href = href;
  a.click();
}

/**
 * @description Sélectionne un canvas parmi plusieurs
 * @param {number} numCanvas Le numéro du canvas à sélectionner
 * @memberof module:canvas
 */
function selectCanvas(numCanvas){
  ctx.saveImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

  ctx = canvasContext[numCanvas];
  fix_dpi(ctx.canvas);

  canvas = ctx.canvas;

  ctx.putImageData(ctx.saveImage, 0, 0);

  activeGlo = glos[numCanvas];
  avatars.forEach(av => { av.size = activeGlo.size; });
  params_interface(false);

  ctx.globalCompositeOperation = activeGlo.ctxCompositions[activeGlo.params.ctxComposition];
}

/**
 * @description Affiche le centre du canvas
 * @memberof module:canvas
 */
function view_center(){
  let center = activeGlo.center ? activeGlo.center : { x: canvas.width / 2, y: canvas.height / 2 };
  drawLogo({x:center.x, y: center.y, type: 'center'}, 'rgb(255,0,0,1)');
}

/**
 * @description Affiche les points d'intersection définis dans crossPoints
 * @memberof module:canvas
 */
function drawCrossPoints(){
  let lineWidth = 0.03;
  crossPoints.forEach(crossPoint => {
    var size = activeGlo.size;
    if(activeGlo.dimSizeCenter){
      let center = {x: canvas.width/2, y: canvas.height/2};
      let dist_to_center = hypo(center.x-crossPoint.x, center.y-crossPoint.y);
      let h = canvas.height/2;
      let coeff = h/dist_to_center;
      size          /= coeff;
      ctx.lineWidth  = lineWidth / coeff;
    }
    ctx.strokeStyle = crossPoint.color;
    ctx.beginPath();
    ctx.arc(crossPoint.x, crossPoint.y, size, 0, two_pi, false);
    ctx.stroke();
  });
}

/**
 * @description Relie les points d'intersection définis dans crossPoints
 * @memberof module:canvas
 */
function lineCrossPoints(){
  let lineWidth = 0.5;
  crossPoints.forEach((crossPoint, i) => {
    if(crossPoints[i+1]){
      if(activeGlo.dimSizeCenter){
        let center = {x: canvas.width/2, y: canvas.height/2};
        let dist_to_center = hypo(center.x-crossPoint.x, center.y-crossPoint.y);
        let h = canvas.height/2;
        let coeff = h/dist_to_center;
        ctx.lineWidth  = lineWidth / coeff;
      }
      ctx.strokeStyle = '#cc0000';
      ctx.beginPath();
      ctx.moveTo(crossPoint.x, crossPoint.y);
      ctx.lineTo(crossPoints[i+1].x, crossPoints[i+1].y);
      ctx.stroke();
    }
  });
}

/**
 * @description Placement selon une forme des avatars
 * @param {object} opt Les options de la forme
 * @returns {boolean} false
 * @memberof module:canvas
 */
function createForm(opt){ keepBreak(function(){ var nb = activeGlo.params.nb; deleteAvatar('all'); activeGlo.params.nb = nb; createAvatar(opt); }); return false; }