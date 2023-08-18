// *********************** MOVE ALEA IN CURVE, ORIENTED ELLIPSE, SHOW THIRD MARKS INFOS (CAN PUT ON GRIDS), DEAL WITH RANDOM MODE, *********************** //
// *********************** ANGLE POS & UPD MIMAGNETOR, REGEX FORMULE *********************** //
// *********************** RND SAT & LIGHT IN ONE COL MOD RND *********************** //
// *********************** CURVE NOT OUT *********************** //
// *********************** POS POLY MOD : INV ATT ************** //
// *********************** COLORS & OTHERS PARAMS IN MODS ************** //
// *********************** ORIENTED ELLIPSES IN MODS ************** //

(function() {
  get_ctx = function(varCanvas){ return varCanvas.getContext('2d'); };
  canvasContext = [];
  addCanvas(true);
  allCanvas = [...document.getElementsByClassName('canvas')];
  allCanvas.forEach(canvas => { fix_dpi(canvas); });
  dataCanvas = new Uint8Array(canvas.width * canvas.height);
})();

activeGlo.center = canvas.getCenter();

var startWidth    = canvas.width;
var startHeight   = canvas.height;

var ctxStructure  = get_ctx(structure);

giveFuncToCanvas(structure, ctxStructure);
giveFuncToCanvas(brushCanvas, ctxBrush);
giveFuncToCanvas(modPathCanvas, ctxModPath);

/**
 * @description Gives function to a canvas variable and to a ctx variable
 * @param {HTMLCanvasElement} varCanvas The canvas variable
 * @param {CanvasRenderingContext2D} varCtx The ctx variable
 * @returns {void}
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

function getPosInImageData(imgData, x, y, width) {
  var p = 4 * (x + y * width);
  return imgData.slice(p, p + 4);
}

//**************************BRUSH**************************//
function savePtOnBrushCanvas(pt){
  pt.size = activeGlo.params.brushSize;
  if(activeGlo.modifiers.length){ getSelectedModifiers().forEach(mod => { mod.glo.firstPtBrush = pt; }); }
  else{ activeGlo.firstPtBrush = pt; }
}

function saveMoveOnModPathCanvas(objGlo, lastPt, pt){
  let center        = modPathCanvas.getCenter();
  let distToCenter  = {x: pt.x - center.x, y: pt.y - center.y};
  let angleToCenter = atan2pi(distToCenter.x, distToCenter.y); 

  objGlo.stepsModPath.push({x: pt.x - lastPt.x, y: pt.y - lastPt.y, angleToCenter});
}

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
function drawSquareOnBrushCanvas(pt = mouseCanvas){
  ctxBrush.beginPath();
  ctxBrush.strokeStyle = '#cc0000';
  ctxBrush.lineWidth = 1;
  let sz = pt.size;
  ctxBrush.rect(pt.x - sz/2, pt.y - sz/2, sz, sz);
  ctxBrush.stroke();
}
function drawCircleOnBrushCanvas(pt = mouseCanvas){
  ctxBrush.beginPath();
  ctxBrush.strokeStyle = '#cc0000';
  ctxBrush.lineWidth = 1;
  ctxBrush.arc(pt.x, pt.y, pt.size/2, 0, two_pi, true);
  ctxBrush.stroke();
}
function drawPtOnBrushCanvas(pt = mouseCanvas){
  ctxBrush.beginPath();
  ctxBrush.fillStyle = '#cc0000';
  ctxBrush.lineWidth = 1;
  ctxBrush.arc(pt.x, pt.y, 1, 0, two_pi, true);
  ctxBrush.fill();
}
function drawLineOnBrushCanvas(ptStart = mouseCanvasLast, ptEnd = mouseCanvas){
  ctxBrush.strokeStyle = '#cc0000';
  ctxBrush.lineWidth = 1;
  ctxBrush.line({ start: {x: ptStart.x, y: ptStart.y}, end: {x: ptEnd.x, y: ptEnd.y} });
}
//*********************************************************//


/**
*@description Stroke a draw function on ctxVar
*@param {CanvasRenderingContext2D} ctxVar The ctx var
*@param {function} func The func
*/
function strokeOnCanvas(ctxVar, func){
  ctxVar.beginPath();
  func();
  ctxVar.stroke();
}

//------------------ TAILLE DU CANVAS ADAPTÉE À LA RÉSOLUTION D'ÉCRAN ----------------- //
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

radius_attract();
//------------------ INITIALISATION DES CONTRÔLES D'INTERFACE AVEC LES VARIABLES GLOBALES ----------------- //
function params_interface(onLoad = true, objParam = activeGlo.params){
  Object.entries(objParam).forEach(([key, val]) => { param_ctrl(val, key, onLoad); });
}
function param_ctrl(val, id_ctrl, onLoad = true){
  var ctrl = getById(id_ctrl);
  if(ctrl){
    ctrl.value = val;
    if(onLoad){ ctrl.dataset.startValue = val; }
    ctrl.dataset.last_value = val;
    ctrl.dataset.startMax   = ctrl.max;
    ctrl.dataset.startStep  = ctrl.step;
    ctrl.last_vals = [val];

    let noLabel = ctrl.classList.contains('noLabel');
    if(onLoad && !noLabel){
      let label = document.querySelector('[for="' + id_ctrl + '"]');
      ctrl.dataset.label = label.textContent;

      if(ctrl.classList.contains('radUnit')){ activeGlo.params[id_ctrl] *= rad; }
    }
    if(!noLabel){ updLabel(ctrl); }
  }
}
function updLabel(input){
  let label = document.querySelector('[for="' + input.id + '"]');
  if(label){
    let txt = !input.dataset.labels ? input.value : gloStart[input.dataset.labels][input.value];
    label.textContent = input.dataset.label + " : " + txt;
    input.title = txt;
  }
}
//------------------ CRÉATION D'AVATARS ----------------- //
function createAvatar(options = {}){
  crossPoints = [];
  let nb = typeof(options.nb) == 'undefined' ? activeGlo.params.nb  : options.nb;
  let w  = typeof(options.w)  == 'undefined' ? activeGlo.size : options.w;

  let areneWidth  = canvas.width - activeGlo.size;
  let areneHeight = canvas.height - activeGlo.size;

  let center = canvas.getCenter();

  let form = 'no', form_size, form_size_x, form_size_y;
  if(typeof(options.form) != 'undefined'){
    form  = typeof(options.form.name)  == 'undefined' ? 'square' : options.form.name;
    form_size    = typeof(options.form.size)    == 'undefined' ? areneWidth/2 : options.form.size;
    form_size_x  = typeof(options.form.size_x)  == 'undefined' ? areneWidth   : options.form.size_x;
    form_size_y  = typeof(options.form.size_y)  == 'undefined' ? areneHeight  : options.form.size_y;
  }

  let dep_dir = activeGlo.params.dep_dir;

  if(typeof(avatars) == 'undefined'){ avatars = []; }

  let r = canvas.height * activeGlo.params.circle_size * 2;
  let nb_avatars, newAvatar, step, x, y, nb_circles, cent;

  if(!activeGlo.center){ cent = options.center ? options.center : center; }
  else{ cent = activeGlo.center; }
  switch (form) {
    case 'no':
      let sz = activeGlo.params.rAleaPos;
      for(let i = 0; i < nb; i++){
        let point = sz >= 1 ? getRandomPoint(sz) : getRandomPointInCircle(sz);
        posAvatar(point.x, point.y, w, cent);
      }
      break;
    case 'square':
      nb_avatars = parseInt(sqr(nb));
      step       = parseFloat(r / nb_avatars);

      x = center.x - r/2 + step/2;
      for(let i = 1; i <= nb_avatars; i++){
        y = center.y - r/2 + step/2;
        for(let j = 1; j <= nb_avatars; j++){
          posAvatar(x, y, w, cent);
          y+=step;
        }
        x+=step;
      }
      break;
    case 'rect':
      nb_avatars = parseInt(sqr(nb));
      var step_x = parseFloat(form_size_x / nb_avatars);
      var step_y = parseFloat(form_size_y / nb_avatars);
      for(let i = 0; i < form_size_x; i+=step_x){
        for(let j = 0; j < form_size_y; j+=step_y){
          posAvatar(i, j, w, cent);
        }
      }
      break;
    case 'circle':
      let k      = activeGlo.params.ellipse_x / activeGlo.params.ellipse_y;
      let spiral = activeGlo.params.spiralAv;
      r          = canvas.height * activeGlo.params.circle_size;
      nb_circles = activeGlo.params.nb_circles;
      step       = parseFloat(two_pi / (nb / nb_circles));

      circles({center: cent, nb_circles: nb_circles, r: r, step: step, ellipse: k, spiral: spiral,
        func: function(pt){
          posAvatar(pt.x, pt.y, w, cent);
        }
      });
      break;
    case 'poly':
      step       = parseFloat(two_pi / nb);
      nb_circles = activeGlo.params.nb_circles;

      let nbEdges = activeGlo.params.polyAvNbEdges;
      r = canvas.height * activeGlo.params.circle_size;

      if(!activeGlo.starPoly){
        for(let i = 1; i <= nb_circles; i++){
          let pts = rotPoly(r*(i/nb_circles), parseInt(nb/nb_circles), cent, nbEdges);
          for(let i = 0; i < pts.length; i++){
            posAvatar(pts[i].x, pts[i].y, w, cent);
          }
        }
      }
      else{
        for(let i = 1; i <= nb_circles; i++){
          pointsStar(cent, nbEdges, parseInt(nb/nb_circles), r*(i/nb_circles), w, cent);
        }
      }
      break;
    case 'spiral':
      step = parseFloat(two_pi / nb);
      nb_circles = activeGlo.params.nb_circles;
      let max = two_pi + 0.0001;
      for(let i = step; i <= max; i+=step){
        for(let j = 1; j <= nb_circles; j++){
          x = cent.x + r*(i/max)*(j/nb_circles)*cos(i);
          y = cent.y + r*(i/max)*(j/nb_circles)*sin(i);
          posAvatar(x, y, w, cent);
        }
      }
      break;
  }
  all_nearsAvatars();

  if(activeGlo.alea_size){ alea_size(); }

  let avatarsLength = avatars.length;
  getById('nb').value = avatarsLength;
  getById('nb').title = avatarsLength;
  activeGlo.params.nb = avatarsLength;
  updLabel(getById('nb'));
}

/**
*@description Pos an avatar
*@param {number} x the x pos of avatar
*@param {number} y the y pos of avatar
*@param {{x: number, y: number}} cent the center pos of avatar
*@param {number} size the size of avatar
*@returns {{Avatar}} Avatar
*/
function posAvatar(x, y, size, cent, virtual = false){
  return new Avatar({
    x     : x,
    y     : y,
    size      : size,
    center    : cent,
    virtual   : virtual,
    fillStyle : 'green',
  });
}

function draw_avatars(){ avatars.forEach(avatar => { avatar.draw_avatar(); }); }

//------------------ SUPPRESSION D'AVATARS ----------------- //
function deleteAvatar(nb){
  if(nb == 'all'){ avatars = []; activeGlo.params.nb = 0; }
  else{
    for(let i = 0; i < nb; i++){ avatars.shift(); }
    activeGlo.params.nb = avatars.length;
  }
}
//------------------ DÉPLACEMENTS D'AVATARS ----------------- //
function animation(){
  if(!activeGlo.totalBreak){
    let attract_mouse = activeGlo.attract_mouse.state && activeGlo.attract_mouse.mousedown;
    let growing_mouse = activeGlo.growByMouse;
    let posOnMouse    = activeGlo.posOnMouse.avatar;
    let defineCenter  = activeGlo.defineCenter;
    let is_modifier   = activeGlo.pos_modifiers != 'none';
    let tail_memory   = activeGlo.params.tail_memory;
    let pause         = activeGlo.break;
    let nears_calc    = activeGlo.params.nears_calc;
    let noAvToAv      = activeGlo.noAvToAv ? activeGlo.noAvToAv.state : false;
    let keep_dir      = activeGlo.params.keep_dir;
    let resist        = activeGlo.params.resist;

    if(activeGlo.checkBlanks){ imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); }

    if(activeGlo.nb_moves%keep_dir == 0 && activeGlo.global_alea && !activeGlo.hyperAlea){ alea_params(); }
    if(activeGlo.nb_moves%keep_dir == 0){ one_alea_param(); }

    if(noAvToAv){
      activeGlo.noAvToAv.ax = 0;
      activeGlo.noAvToAv.ay = 0;
      avatarsMeanPoint();
    }

    for(let i = 0; i < avatars.length; i++){
      let avatar = avatars[i];

      let paramsNearMod = avatar.nearMod.params ? avatar.nearMod.params : activeGlo.params;
      let gloNear       = avatar.nearMod.glo ? avatar.nearMod.glo : activeGlo;
      let angle         = paramsNearMod.rotate_angle / 10;
      let spap          = paramsNearMod.speed_alea_pos;

      avatar.modifiersValues = {x: 0, y: 0, curve:{x: 0, y: 0}};

      if(activeGlo.hyperAlea && !avatar.glo){ avatar.glo = deepCopy(activeGlo, 'modifiers', 'inputToSlideWithMouse'); }
      if(activeGlo.nb_moves%keep_dir == 0 && activeGlo.global_alea && activeGlo.hyperAlea){ alea_params(avatar); }

      if(!avatar.virtual){
        avatar.last_x = avatar.x;
        avatar.last_y = avatar.y;

        avatar.dist = 0;
        avatar.ax   = 0;
        avatar.ay   = 0;

        avatar.distMods = [];

        if(gloNear.tail){
          tail_length = avatar.tail_length();
          if(tail_length <= paramsNearMod.lim_line){ avatar.lasts.push({x: avatar.last_x, y: avatar.last_y}); }
          if(avatar.lasts.length > tail_memory){ avatar.lasts.shift(); }
          while(avatar.tail_length() > paramsNearMod.lim_line){ avatar.lasts.shift(); }
        }
        else{
          avatar.lasts.push({x: avatar.last_x, y: avatar.last_y});
          if(avatar.lasts.length > 2){ avatar.lasts.shift(); }
        }

        if(gloNear.lim_dist && avatar.it%nears_calc == 0 && !gloNear.stopNear){ avatar.nearAvatars(); }

        if(resist == 0){ avatar.vx = 0; avatar.vy = 0; }

        if(gloNear.moveOnAlea && avatar.it%spap == 0){ avatar.moveOnAlea(); }
        if(avatar.nears.length){ avatar.interaction(); }

        if(gloNear.follow){ avatar.follow(); }
        if(activeGlo.attractByOne){ avatar.attractByOne(); }

        if(paramsNearMod.angleEllipse && paramsNearMod.rotate_angle){
          avatar.rotateEllipse(angle, !avatar.center ? { x: canvas.width/2, y: canvas.height/2 } : { x: avatar.center.x, y: avatar.center.y },
                              {x: paramsNearMod.ellipse_x, y: paramsNearMod.ellipse_y}, paramsNearMod.angleEllipse, paramsNearMod.spiral_force, false);
        }
        else if(paramsNearMod.rotate_angle){
          if(gloNear.spiral_cross && gloNear.spiral_cross_rotate){ angle = activeGlo.nb_spiral_cross % 2 != 0 ? -angle : angle; }
          avatar.rotate(angle, !avatar.center ? { x: canvas.width/2, y: canvas.height/2 } : { x: avatar.center.x, y: avatar.center.y },
                        {x: paramsNearMod.ellipse_x, y: paramsNearMod.ellipse_y}, paramsNearMod.spiral_force);
        }
        if(paramsNearMod.spiral_angle != 0){ avatar.spiral(); }
        if(paramsNearMod.trirotate_angle != 0){ avatar.rotPoly(); }
        if(paramsNearMod.trirotate_angle2 != 0){
          avatar.rotPoly(paramsNearMod.trirotate_angle2, { x: canvas.width/2, y: canvas.height/2 },
                                false, paramsNearMod.polyRotNbEdges2, false, paramsNearMod.polyRotAngle2);
        }
        if(paramsNearMod.dirForce != 0){ avatar.gloDir(); }
        if(paramsNearMod.attractForce != 0){ avatar.gloAttract(); }
        if(gloNear.curve){ avatar.curve(); }
        if(activeGlo.trans.state){ avatar.trans(activeGlo.trans.dir); }

        if(attract_mouse && !defineCenter && !is_modifier && !posOnMouse && growing_mouse){ avatar.mouse_growing(); }

        if(activeGlo.modifiers.length > 0){
          let modifiersSz = activeGlo.modifiers.length;
          avatar.distMinModifiers = 9999;
          if(!activeGlo.asyncModify){ for(let i = 0; i < modifiersSz; i++){ activeGlo.modifiers[i].modify(avatar); } }
          else{
            if(!activeGlo.asyncNumModifier){ activeGlo.asyncNumModifier = 0; }
            activeGlo.modifiers[activeGlo.asyncNumModifier].modify(avatar);
          }
        }

        if(activeGlo.asyncModify){
          if(activeGlo.nb_moves%paramsNearMod.asyncTime == 0){ activeGlo.asyncNumModifier++; }
          if(activeGlo.asyncNumModifier == activeGlo.modifiers.length){ activeGlo.asyncNumModifier = 0; }
        }

        avatar.vx += avatar.ax; avatar.vy += avatar.ay;

        if(resist > 0){
          let r = resist;
          avatar.vx /= r;
          avatar.vy /= r;
        }

        avatar.modifiersValues.x += avatar.vx;
        avatar.modifiersValues.y += avatar.vy;

        if(!pause){ avatar.it++; }
      }
    }

    activeGlo.trans.state = false;

    if(activeGlo.spirAvatar){ avatars.forEach(avatar => { avatar.spiralToAvatar(); }); }
    else if(activeGlo.orbite){ avatars.forEach(avatar => { avatar.orbite(); }); }


    for(let i = 0; i < avatars.length; i++){
      if(!avatars[i].virtual){
        let avatar        = avatars[i];
        let paramsNearMod = avatar.nearMod.params ? avatar.nearMod.params : activeGlo.params;
        let gloNearMod    = avatar.nearMod.glo ? avatar.nearMod.glo : activeGlo;

        avatar.x += avatar.modifiersValues.curve.x;
        avatar.y += avatar.modifiersValues.curve.y;

        if(gloNearMod.limSpeedBySize){
          avatar.limSpeedBySize();
        }
        else{
          avatar.limSpeedMax();
          avatar.limSpeedMin();
        }

        if(!paramsNearMod.distNearClearMods){
          avatar.x += avatar.modifiersValues.x;
          avatar.y += avatar.modifiersValues.y;
        }
        else{
          avatar.x += avatar.modifiersValues.x;
          avatar.y += avatar.modifiersValues.y;
          if(avatar.distMinModifiers < paramsNearMod.distNearClearMods){
            if(gloNearMod.moveOnAlea){ avatar.moveOnAlea(); }
          }
        }

        if(!avatar.speedBf){ avatar.speed = avatar.speed_avatar(); }
        else{ avatar.speedBefore(); avatar.speedBf = false; }
        avatar.accel = avatar.accel_avatar();

        if(activeGlo.checkBlanks && avatar.nextIsBlank()){ avatar.moveOnAlea(); }
      }
    }
    
    positionAvatars();

    if(activeGlo.crossPoints)     { drawCrossPoints(); }
    if(activeGlo.lineCrossPoints) { lineCrossPoints(); }

    if(activeGlo.updBgToAvColor && activeGlo.nb_moves%5 == 0){ updBgToAvColor({inv: true}); }

    if(activeGlo.nb_moves == 10000){ activeGlo.nb_moves = 0; }
    activeGlo.nb_moves++;
  }

  ctxStructure.clearRect(0, 0, structure.width, structure.height);

  if(activeGlo.params.modifiers_angle  != 0){ rotate_modifiers(); }

  if(activeGlo.modifierSelectbyRectangleOnRClick) { modifierSelectByRectangle(); }
  if(activeGlo.view_center)                       { view_center(); }
  if(activeGlo.view_modifiers)                    { view_modifiers(); }
  if(activeGlo.showCircle)                        { showCircle(); }
  if(activeGlo.showInfos)                         { showInfos(); }
  if(activeGlo.onModsInfo)                        { showModsInfos(); }
  if(activeGlo.testOnMouse)                       { testOnMouse(); }

  if(activeGlo.grid.draw){
    switch(activeGlo.grid.type){
      case 'square':
        drawGrid();
        break;
      case 'circle':
        drawCircleGrid();
        break;
      case 'third':
        drawThridGrid();
        break;
      case 'hexagone':
        drawEquiGrid();
        break;
      case 'spirale':
        drawSpiralGrid();
        break;
    }
  }

  requestAnimationFrame(animation);
}

function positionAvatars(){
  if(activeGlo.clear){ ctx.clearRect(0, 0, canvas.width, canvas.height); }

  var speed = 0; var speeds = []; var accel = 0; var accels = []; activeGlo.dist_moy = 0;
  for(let i = 0; i < avatars.length; i++){
    let avatar        = avatars[i];
    let gloNearMod    = avatar.nearMod.glo ? avatar.nearMod.glo : activeGlo;

    if(gloNearMod.secondMove && (!avatar.draw || !avatar.draw_ok)){
      avatar.lasts   = []; 
      avatar.lastsSm = [];
    }

    if(gloNearMod.collid_bord){ avatar.collidBorder(); }
    avatar.dir();
    if(gloNearMod.secondMove && avatar.draw){
      avatar.secondMove();
      avatar.dirSecond();

      avatar.pSave   = {x: avatar.x, y: avatar.y};
      avatar.lSave   = {x: avatar.last_x, y: avatar.last_y};
      avatar.lsSave  = avatar.lasts;
      avatar.dirSave = avatar.direction;

      avatar.x         = avatar.secondMovePos.x;
      avatar.y         = avatar.secondMovePos.y;
      avatar.last_x    = avatar.lastSm.x;
      avatar.last_y    = avatar.lastSm.y;
      avatar.lasts     = avatar.lastsSm;
      avatar.direction = avatar.dirSecMove;
    }
    if(activeGlo.sizeDirCoeff && avatar.lasts[avatar.lasts.length - 2]){ avatar.coeffDirSize(); }

    avatar.sizeIt();
    !activeGlo.followAvatar ? avatar.colorHsl() : avatar.colorByFollow();

    if((!gloNearMod.drawAltern || avatar.it%activeGlo.params.speedRndDraw == 0) && avatar.draw){
      avatar.draw_avatar();
    }

    if(avatar.draw){
      speed  += avatar.speed;
      accel  += avatar.accel;
      speeds.push(avatar.speed);
      accels.push(avatar.accel);
    }

    avatar.dist_moy = avatar.dist / avatars.length;

    activeGlo.dist_moy += avatar.dist_moy;

    if(gloNearMod.secondMove && avatar.draw){
      avatar.x         = avatar.pSave.x;
      avatar.y         = avatar.pSave.y;
      avatar.last_x    = avatar.lSave.x;
      avatar.last_y    = avatar.lSave.y;
      avatar.lasts     = avatar.lsSave;
      avatar.direction = avatar.dirSave;
    }

    if(avatar.draw_ok){ avatar.draw = true; }
    if(!avatar.draw){ avatar.draw_ok = true; }
  }

  activeGlo.speed_max = Math.max(...speeds);
  activeGlo.accel_max = Math.max(...accels);

  activeGlo.speed_moy = speed / avatars.length;
  activeGlo.accel_moy = accel / avatars.length;
  activeGlo.dist_moy /= avatars.length;
  if(activeGlo.simple_pause_tmp){ activeGlo.break = true; activeGlo.simple_pause_tmp = false; }
  if(activeGlo.total_pause_tmp){ activeGlo.totalBreak = true; activeGlo.total_pause_tmp = false; }
}

function modIsNearMouse(mod, dist){
  if(mod.x < mouse.x + dist && mod.x > mouse.x - dist && mod.y < mouse.y + dist && mod.y > mouse.y - dist){ return h(mod.x - mouse.x, mod.y - mouse.y); }

  return false;
}

function getModNearestMouse(dist){
  let modsNearestMouse = [];
  activeGlo.modifiers.forEach(mod => {
    let distToMouse = modIsNearMouse(mod, dist);
    if(distToMouse){ mod.distToMouse = modsNearestMouse.push(mod); }
  });

  let nearModToReturn = modsNearestMouse[0] ? modsNearestMouse[0] : false;
  modsNearestMouse.forEach(nearMod => {
    if(nearMod.distToMouse < nearModToReturn.distToMouse){
      nearModToReturn = nearMod;
    }
  });
  return nearModToReturn;
}

function modsSymToCenter(sym = 'vhAxe'){
  getSelectedModifiers().forEach(mod => {
    let p      = symToCenter({x: mod.x, y: mod.y});
    let newMod = deepCopy(mod, 'modifiers');
    newMod.select = false;

    if(sym !== 'all'){
      newMod.x = sym == 'vhAxe' || sym == 'vAxe' ? p.x : newMod.x;
      newMod.y = sym == 'vhAxe' || sym == 'hAxe' ? p.y : newMod.y;
    }
    else{
      newMod.x = p.x;
      var newMod2 = deepCopy(mod, 'modifiers');
      newMod2.select = false;
      newMod2.y = p.y;
      var newMod3 = deepCopy(mod, 'modifiers');
      newMod3.select = false;
      newMod3.x = p.x;
      newMod3.y = p.y;
      activeGlo.modifiers.push(newMod2);
      activeGlo.modifiers.push(newMod3);
    }
    
    activeGlo.modifiers.push(newMod);
  });
}

function testModsFormule(){
  let mod         = activeGlo.modifiers.length > 0 ? activeGlo.modifiers[0] : undefined;
  let av          = avatars[0] ? avatars[0] : undefined;

  let formules = activeGlo.params.mods_formule.split(',');

  if(activeGlo.modifiers.length > 0 && av){
    activeGlo.mods_formule.formules = [];

    activeGlo.mods_formule.state = true;
    formules.forEach(formule => {
      let prop = formule.substr(0, formule.indexOf('=')).trim();
      let val  = formule.substr(formule.indexOf('=') + 1).trim();

      let thisFormule = true; let ev;
      try{
        ev = eval(val);
        if(ev == av || isNaN(ev)){ activeGlo.mods_formule.state = false; }
      }
      catch(e){
        thisFormule = false;
        activeGlo.mods_formule.state = false;
      }
      if(thisFormule){
        activeGlo.mods_formule.formules.push({prop, val});
      }
    });
  }
  else{
    activeGlo.mods_formule.state = false;
  }
}

function modsFormule(mod, av){
  if(activeGlo.mods_formule.state){
    activeGlo.mods_formule.formules.forEach(formule => {
      mod[formule.prop] = eval(formule.val);
    });
  }
}

/**
 *
 * @param {Avatar} av
 */
function mouveVirtualAvatar(av){
  av.lasts.push({x: av.x, y: av.y});
  if(av.lasts.length > 2){ av.lasts.shift(); }
  av.x = mouse.x; av.y = mouse.y; av.distMinMods();
}

function modsToZero(){
  activeGlo.modsToZero = !activeGlo.modsToZero;
  if(activeGlo.modsToZero){
      getSelectedModifiers().forEach(mod => {
      mod.saveAttract = mod.attrac;
      mod.attract = 0;
    });
  }
  else{ getSelectedModifiers().forEach(mod => { mod.attract = mod.saveAttrac; }); }
}

function avatarsMeanPoint(){
  let x = 0, y = 0, avLength = avatars.length;
  avatars.forEach((av) => {
    x += av.x;
    y += av.y;
  });

  activeGlo.noAvToAv.meanPoint = {x: x/avLength, y: y/avLength};
}

//------------------ SELECT AVATARS BY RECTANGLE ----------------- //
function modifierSelectByRectangle(){
  if(activeGlo.mousedown){
    ctxStructure.fillStyle = 'rgba(0, 125, 125, 0.2)';
    ctxStructure.beginPath();
    ctxStructure.rect(mouse.click.x, mouse.click.y, mouse.x - mouse.click.x, mouse.y - mouse.click.y);
    ctxStructure.fill();

    let rectCoord = mouseCoordToRectCoor();
    activeGlo.modifiers.forEach(mod => {
      if(mod.x >= rectCoord.leftUp.x && mod.y >= rectCoord.leftUp.y && mod.x <= rectCoord.rightBottom.x && mod.y <= rectCoord.rightBottom.y && !mod.selectByRectangle){
        mod.select = !mod.select;
        mod.selectByRectangle = true;
      }
    });
  }
}

//------------------ WHEN SELECT AVATARS BY RECTANGLE : TRANSLATE MOUSE COORD TO RECT COORD ----------------- //
function mouseCoordToRectCoor(){
  let x = mouse.x - mouse.click.x > 0 ? true : false;
  let y = mouse.y - mouse.click.y > 0 ? true : false;

  if      (x && y) { return { leftUp: {x: mouse.click.x, y: mouse.click.y}, rightBottom: {x: mouse.x, y: mouse.y}  }; }
  else if (!x && y){ return { leftUp: {x: mouse.x, y: mouse.click.y}, rightBottom: {x: mouse.click.x, y: mouse.y}  }; }
  else if(x && !y) { return { leftUp: {x: mouse.click.x, y: mouse.y}, rightBottom: {x: mouse.x, y: mouse.click.y}  }; }
  else if(!x && !y){ return { leftUp: {x: mouse.x, y: mouse.y}, rightBottom: {x: mouse.click.x, y: mouse.click.y}  }; }
}

//------------------ DRAW THE CROSS POINTS ----------------- //
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
//------------------ DRAW BEETWEEN THE CROSS POINTS ----------------- //
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

//------------------ PLACEMENT SELON UNE FORME DES AVATARS ----------------- //
function createForm(opt){ keepBreak(function(){ var nb = activeGlo.params.nb; deleteAvatar('all'); activeGlo.params.nb = nb; createAvatar(opt); }); return false; }

//------------------ CLEAR CANVAS ----------------- //
function clear(){ ctx.clearRect(0, 0, canvas.width, canvas.height); /*dataCanvas = new Uint8Array(canvas.width * canvas.height);*/ }

function createGoInterface(){
  let interfaces = [...document.getElementsByClassName('interface')];
  interfaces.forEach((interface, i) => {
    let div = document.createElement("div");
    let txt = document.createTextNode(i+1);
    div.appendChild(txt);

    let isActive = i == 0 ? ' active' : '';

    div.className    = 'goInterface' + isActive;
    div.id           = 'goInterface_' + i;
    div.style.left   = 98.25 - ((interfaces.length - 1 - i) * 1.75) + '%';

    div.setAttribute("onclick", "showInterface(" + i + "); ");

    getById('goInterFaceContainer').appendChild(div);
  });
}

function addCanvas(start = false, duplicate = false, toImport = false){
  let arenaCanvas      = [...document.getElementsByClassName('arenaCanvas')];
  let newCanvas        = document.createElement("canvas");
  let numCanvas        = arenaCanvas.length;

  newCanvas.id        = 'arenaCanvas-' + numCanvas;
  newCanvas.className = 'canvas arenaCanvas';

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

  ctx    = get_ctx(newCanvas);
  canvas = newCanvas;

  gloStart.center = {x: canvas.width/2, y: canvas.height/2};

  giveFuncToCanvas(canvas, ctx);

  canvasContext.push(ctx);

  fix_dpi(newCanvas);

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

function diffParamsModsGloParams(){
  let diffColor = 'blue';

  getSelectedModifiers().forEach(mod => {
    for(let propParams in activeGlo.params){
      for(let propModParams in mod.params){
        if(propParams == propModParams){
          if(activeGlo.params[propParams] != mod.params[propModParams]){
            let $propParamsLabel = document.querySelector('[for="' + propParams + '"]');
            if($propParamsLabel.style.color != diffColor){
              $propParamsLabel.style.color = diffColor;
              getById(propParams).value    = mod.params[propModParams];
              updLabel(updLabel(getById('tint_color')));
            }
            else{

            }
          }
        }
      }
    }
  });
}

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

function checkColorFunctions(){
  activeGlo.colorFunctions[event.target.id] = !activeGlo.colorFunctions[event.target.id];

  let checked = 0;
  [...document.getElementsByClassName('inputCheckColorBox')].forEach(inp => {
    if(inp.checked){ checked++; }
  });

  if(checked > 1){ activeGlo.colorCumul = true; }
  else{ activeGlo.colorCumul = false; }

  getSelectedModifiers().forEach(mod => { mod.glo.colorCumul = activeGlo.colorCumul; mod.glo.colorFunctions[event.target.id] = activeGlo.colorFunctions[event.target.id]; });
}
/**
*@description Create HTML checkboxes
*@param {[]} checkboxes Array of prop
*@param {string} containerId The id of div container of HTML checkboxes
*@param {string} checked The id of the default checkbox to be checked
*@param {{event:string, func: string}} evtCheck The event of HTML checkboxes
*/
function createCheckboxesWithRange(checkboxes, containerId, checked, evtCheck){
  let container = getById(containerId);
  checkboxes.forEach(checkbox => {
    container.appendChild(createCheckboxWithRange(checkbox, checkbox, checkbox != checked ? false : true, evtCheck));
  });
}
/**
*@description Create a HTML checkbox
*@param {string} checkTxt The text of the checkbox
*@param {string} id The id of the checkbox
*@param {{event:string, func: string}} evtCheck The event of HTML checkboxes
*@param {{event:string, func: string}} evtRange The event of HTML range
*/
function createCheckboxWithRange(checkTxt, id, checked = false, evtCheck = {event: 'onchange', func: 'return false'},
                                 evtRange = {event: 'oninput', func: 'updateGloRangeCmlColor(this);'}){
  let divContainer = document.createElement("div");
  let divC         = document.createElement("div");
  let divR         = document.createElement("div");

  let lab = document.createElement("label");
  let inp = document.createElement("input");
  let ran = document.createElement("input");
  let spa = document.createElement("span");
  let txt = document.createTextNode(checkTxt);

  inp.id        = id;
  lab.className = 'inLine';
  inp.className = 'vAlignMid inputCheckColorBox';
  inp.checked   = checked;
  spa.className = 'vAlignMid';

  inp.setAttribute('type', 'checkbox');
  inp.setAttribute(evtCheck.event, evtCheck.func);

  divC.appendChild(lab);
  lab.appendChild(inp);
  lab.appendChild(spa);
  spa.appendChild(txt);

  ran.id        = 'range_' + id;
  ran.className = 'input_params';

  ran.setAttribute('type', 'range');
  ran.setAttribute('min', '0');
  ran.setAttribute('max', '2');
  ran.setAttribute('step', '0.1');
  ran.setAttribute('value', '1');

  ran.setAttribute(evtRange.event, evtRange.func);

  divR.appendChild(ran);

  divContainer.className = 'checkAndRange';
  divContainer.appendChild(divC);
  divContainer.appendChild(divR);

  return divContainer;
}

//------------------ AfFICHE UN MESSAGE TEMPORAIRE SUR LE CANVAS ----------------- //
function msg(...txts){
  let canvasBg = canvas.style.backgroundColor;

  if(canvasBg != ""){
    ctxStructure.fillStyle = fillStyleAccordToBg(canvas, ctxStructure);
  }
  else{
    ctxStructure.fillStyle = "#223351";
  }

  ctxStructure.font = "16px Comic Sans MS";

  let pos_y = !activeGlo.uiDisplay ? 30 : 30 + interfaces.find(int => int.clientHeight != 0).clientHeight;
  txts.forEach(txt => {
    ctxStructure.fillText(txt, 20, pos_y);
    pos_y+=20;
  });
}
//------------------ MODIFICATION DE VARIABLES GLOBALES SUITE À ÉVÈNEMENT INPUT----------------- //
function updateGlo(ctrl){
  let val = parseFloat(ctrl.value) ? parseFloat(ctrl.value) : ctrl.value;

  activeGlo.fromUpdGlo = true;

  let selectedMods = getSelectedModifiers();
  selectedMods.forEach(mod => {
    mod.params[ctrl.id]     = !ctrl.classList.contains('radUnit') ? val : val * rad;
    mod.glo.params[ctrl.id] = !ctrl.classList.contains('radUnit') ? val : val * rad;
  });

  if(typeof(activeGlo.params[ctrl.id]) != 'undefined' && (selectedMods.length === activeGlo.modifiers.length || !activeGlo.modifiers.length)){
    activeGlo.params[ctrl.id] = !ctrl.classList.contains('radUnit') ? val : val * rad;
  }

  ctrl.title = val;
  if(ctrl.id == 'radius_attract'){ radius_attract(); }

  if(typeof(ctrl.last_vals) == 'undefined'){ ctrl.last_vals = []; }

  if(ctrl.last_vals.length > 1){ ctrl.last_vals.shift(); }

  if(ctrl.dataset.last_value){ ctrl.last_vals.push(ctrl.dataset.last_value); }
  ctrl.dataset.last_value = val;

  updLabel(ctrl);

  if(activeGlo.hyperAlea){ avatars.forEach(avatar => avatar.glo.params[ctrl.id] = val); }

  if(activeGlo.linkedInputs[ctrl.id] && activeGlo.linkedInputs[ctrl.id] !== 'toLinked'){
    let ctrlToUpd = getById(activeGlo.linkedInputs[ctrl.id]);

    let intervalCtrl      = ctrl.max - ctrl.min;
    let intervalCtrlToUpd = ctrlToUpd.max - ctrlToUpd.min;
    let coeff             = intervalCtrlToUpd / intervalCtrl;
    let valToAdd          = (val - parseFloat(ctrl.last_vals[ctrl.last_vals.length-1])) * coeff;

    valToAdd *= ctrlToUpd.classList.contains('positive') ? 1 : -1;
    
    ctrlToUpd.value = parseFloat(ctrlToUpd.value) + valToAdd;

    updateGlo(ctrlToUpd);
    let event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    ctrlToUpd.dispatchEvent(event);
  };
}

/**
 * Update the form of avatar
 * @param  {String} val
 * @return {undefined}
 */
function updateForm(val){
  let form       = activeGlo.forms[val];
  activeGlo.form = form;

  getSelectedModifiers().forEach(mod => { mod.glo.form = form; });
}

//------------------ MODIFICATION DE VARIABLES GLOBALES SUITE À ÉVÈNEMENT INPUT RANGE COLOR CUMUL ----------------- //
function updateGloRangeCmlColor(ctrl){
  let val = parseFloat(ctrl.value);

  activeGlo.rangesCmlColor[ctrl.id] = val;
  activeGlo.fromUpdGlo = true;

  getSelectedModifiers().forEach(mod => { mod.glo.rangesCmlColor[ctrl.id] = val; mod.glo.fromUpdGlo = true; });
}

function updCtrl(ctlr_id){
  let ctrl = getById(ctlr_id);
  if(ctrl.max < activeGlo.params[ctlr_id]){ ctrl.max = 2 * activeGlo.params[ctlr_id]; }
  if(ctrl.min > activeGlo.params[ctlr_id]){ ctrl.min = 2 * activeGlo.params[ctlr_id]; }
  ctrl.value = activeGlo.params[ctlr_id];
  updLabel(ctrl);
}

function updateScale(ctrl, e){
  let last_val = parseFloat(ctrl.last_vals[ctrl.last_vals.length - 1]);
  let curval   = parseFloat(ctrl.value);
  let mid      = parseFloat(ctrl.max/2);
  let dblmax   = parseFloat(ctrl.max*2);

  e.stopPropagation();

  if(ctrl.max == 1){
    //ctrl.max = ctrl.dataset.startMax; ctrl.step = ctrl.dataset.startStep; ctrl.value = ctrl.dataset.startValue;
    if(curval < mid){ ctrl.min/=10; ctrl.step/=10; }
    else{ ctrl.min*=10; ctrl.step*=10; }
  }
  else if(curval > 0){
    ctrl.max = curval > mid ? dblmax : mid;

    let new_max = parseFloat(ctrl.max);

    if(new_max < 1){ ctrl.step = 0.01; }
    ctrl.value = curval <= new_max ? last_val : new_max;
  }
  else{
    ctrl.max = 1; ctrl.step = 0.01; ctrl.value = 0.5;
  }
  ctrl.title = ctrl.value;
  if(activeGlo.params[ctrl.id]){ activeGlo.params[ctrl.id] = ctrl.value; }
}

function radius_attract(){
  activeGlo.lim_dist = pow(pow(canvas.width, 2) + pow(canvas.height, 2), 0.5) / (256 / activeGlo.params.radius_attract);
  getSelectedModifiers().forEach(mod => { mod.glo.lim_dist = activeGlo.lim_dist; });
}

//------------------ LES AVATARS DANS LE RAYON D'ATTRACTION ----------------- //
function all_nearsAvatars(){  avatars.forEach(avatar => { avatar.nearAvatars(); });  }

//------------------ AJOUT OU SUPPRESSION D'ÉLÉMENT DE DESSIN ----------------- //
function nbAvatars(callback = verif_nb){
  let nb = parseInt(getById('nb').value);
  if(nb > activeGlo.params.nb){ createAvatar({nb: nb - activeGlo.params.nb, w: activeGlo.size}); }
  else if(nb < activeGlo.params.nb){ deleteAvatar(activeGlo.params.nb - nb); }

  verif_nb();
}

function verif_nb(){
  let nb = parseInt(getById('nb').value);
  if(nb != activeGlo.params.nb){ nbAvatars(nb); }
}
//------------------ MODIFICATION DE LA TAILLE DES AVATARS ----------------- //
function updateSize(ctrl){
  if(!activeGlo.updByVal){
    let upd_val = calcUpdVal(ctrl);
    activeGlo.size *= upd_val;
    avatars.forEach(avatar => { avatar.size *= upd_val; });
    getSelectedModifiers().forEach(mod => { mod.size *= upd_val; mod.glo.size *= upd_val; });
  }
  else{
    let val = parseFloat(ctrl.value);
    activeGlo.size = val;
    avatars.forEach(avatar => { avatar.size = val; });
    getSelectedModifiers().forEach(mod => { mod.size = val; mod.glo.size = val; });
  }
}
//------------------ MODIFICATION DE LA FORCE DES MODIFIEURS ----------------- //
function updateModifiersForce(ctrl, prop = 'attract', sprop = false, min = -Infinity, max = Infinity, p = 0.5){
  let upd_val = calcUpdVal(ctrl);

  upd_val = pow(upd_val, p);

  function changeProp(val, uval){
    if(val == 0) return uval;
    return val*uval > min && val*uval < max ? val*uval : val;
  }

  if(!sprop){ getSelectedModifiers().forEach(mod => { mod[prop]  = changeProp(mod[prop], upd_val); }); }
  else{ getSelectedModifiers().forEach(mod => { mod[prop][sprop] = changeProp(mod[prop][sprop], upd_val); }); }
}
//------------------ MODIFICATION PROPRIÉTE DES MODIFIEURS ----------------- //
function changeModifiersProp(ctrl, prop, byVal = false){
  let val = !byVal ? ctrl.value : byVal;

  if(parseFloat(val)){ val = parseFloat(val); }

  if(ctrl.classList.contains('radUnit')){ val*=rad; }

  getSelectedModifiers().forEach(mod => { mod[prop]  = val; });
}
//------------------ MODIFICATION PROPRIÉTE DES MODIFIEURS ----------------- //
function changeAvatarsProp(val, prop, toRad = false){
  val = parseFloat(val);
  if(toRad){ val*=rad; }

  avatars.forEach(av => { av[prop]  = val; });
}
/**
 * @description Update prop param angle of modifiers
 * @param {HTMLElement}  ctrl ctrl input range of interface
 * @param {string}  prop the prop in modifiers to update
 * @returns {void}
 */
function updModsAngle(ctrl, prop){
  let last_val = parseFloat(ctrl.dataset.last_value);
  let val      = parseFloat(ctrl.value);

  upd_val = rad * (val - last_val);

  getSelectedModifiers().forEach(mod => {
    let s        = Math.sign(mod[prop]) != 0 ? Math.sign(mod[prop]) : 1;
    let newAngle = mod[prop] + upd_val * -s;
    let sbf      = Math.sign(newAngle) != 0 ? Math.sign(newAngle) : 1;
    if(s == sbf){
      if(newAngle > PI)      {
        newAngle = -(PI - (PI + (-(newAngle - PI))));
      }
      else if(newAngle < -PI){ newAngle = -(newAngle + PI); }
    }
    else{
      if(s < 0 && sbf > 0){ newAngle =  PI - newAngle; }
      else                { newAngle = -PI - newAngle; }
    }

    mod[prop] = newAngle;
  });
}
/**
 * @description Update prop param dbl angle of modifiers
 * @param {HTMLElement}  ctrl ctrl input range of interface
 * @returns {void}
 */
function updModAngle(ctrl, prop = 'dblAngle'){
  let last_val = parseFloat(ctrl.dataset.last_value);
  let val      = parseFloat(ctrl.value);

  upd_val = rad * (val - last_val);

  getSelectedModifiers().forEach(mod => { mod[prop] = twoPINumber(mod[prop] + upd_val); });
}
//------------------ A TESTER ----------------- //
function calcUpdVal(ctrl){
  let last_val = parseFloat(ctrl.dataset.last_value);
  let val      = parseFloat(ctrl.value);

  let diff_val = abs(val - last_val) + 1;

  return val > last_val ? diff_val : 1 / diff_val;
}
//------------------ MODIFICATION DE LA TEINTE DES AVATARS ----------------- //
function updateTint(ctrl, col = 'all'){
  let last_val = ctrl.dataset.last_value;
  let val      = ctrl.value;

  var upd_val = 1;
  upd_val = val - last_val > 0 ? upd_val = val - last_val + 1 : upd_val = 1 / (last_val - val + 1);

  switch (col) {
    case 'all':
      updImage(data => {
        for (var i = 0; i < data.length; i += 4) {
          if(data[i] != 0 || data[i + 1] != 0 || data[i + 2] != 0){
            let hsla = RGBAToHSLA(data[i], data[i+1], data[i+2], data[i+3]);
            hsla.l  *= upd_val;
            let rbga = HSLAToRGBA(hsla.h, hsla.s, hsla.l, hsla.a);

            data[i]     = rbga.r;
            data[i + 1] = rbga.g;
            data[i + 2] = rbga.b;
          }
        }
      });
      break;
    case 'r':
      updImage(data => {
        for (var i = 0; i < data.length; i += 4) { data[i] *= upd_val; }
      });
      break;
    case 'g':
      updImage(data => {
        for (var i = 0; i < data.length; i += 4) { data[i + 1] *= upd_val; }
      });
      break;
    case 'b':
      updImage(data => {
        for (var i = 0; i < data.length; i += 4) { data[i + 2] *= upd_val; }
      });
      break;
    case 'a':
      updImage(data => {
        for (var i = 0; i < data.length; i += 4) { data[i + 3] *= upd_val; if(data[i + 3] > 255){ data[i + 3] = 255; } }
      });
      break;
    case 'a_max':
      updImage(data => {
        for (var i = 0; i < data.length; i += 4) {
          if(data[i + 3] > val * 255){ data[i + 3] = val * 255; }
        }
      });
      break;
  }

  ctrl.dataset.last_value = val;
}
function updateSaturation(ctrl){
  let last_val = ctrl.dataset.last_value;
  let val      = ctrl.value;

  var upd_val = 1;
  upd_val = val - last_val > 0 ? upd_val = val - last_val + 1 : upd_val = 1 / (last_val - val + 1);

  updImage(data => {
    for (var i = 0; i < data.length; i += 4) {
      if(data[i] != 0 || data[i + 1] != 0 || data[i + 2] != 0){
        let hsla = RGBAToHSLA(data[i], data[i+1], data[i+2], data[i+3]);
        hsla.s  *= upd_val;
        let rbga = HSLAToRGBA(hsla.h, hsla.s, hsla.l, hsla.a);

        data[i]     = rbga.r;
        data[i + 1] = rbga.g;
        data[i + 2] = rbga.b;
      }
    }
  });

  ctrl.dataset.last_value = val;
}
function ColorOffsetImg(ctrl){
  let last_val = ctrl.dataset.last_value;
  let val      = ctrl.value;
  let upd_val  = val - last_val;

  activeGlo.testDone = false;

  updImage(data => {
    for (var i  = 0; i < data.length; i += 4) {
      if(data[i] != 0 || data[i + 1] != 0 || data[i + 2] != 0){
        let hsla  = RGBAToHSLA(data[i], data[i+1], data[i+2], data[i+3]);
        hsla.h    = cyclicNumber(hsla.h + upd_val, 360);
        let rbga  = HSLAToRGBA(hsla.h, hsla.s, hsla.l, hsla.a);

        data[i]     = rbga.r;
        data[i + 1] = rbga.g;
        data[i + 2] = rbga.b;
      }
    }
  });

  ctrl.dataset.last_value = val;
}
function greyColor(ctrl){
  let last_val = ctrl.dataset.last_value;
  let val      = ctrl.value;
  let dir      = val - last_val > 0 ? true : false;

  updImage(data => {
    for (var i  = 0; i < data.length; i += 4) {
      if(data[i] != 0 || data[i + 1] != 0 || data[i + 2] != 0){
        let c     = dir ?
                    data[i] + data[i + 1] + data[i + 2] < 382.5 ? 0.9 : 1.1
                    :
                    data[i] + data[i + 1] + data[i + 2] < 382.5 ? 1.1 : 0.9;
        let hsla  = RGBAToHSLA(data[i], data[i+1], data[i+2], data[i+3]);
        hsla.l   *= c;
        if(hsla.l > 100){ hsla.l = 100;}
        let rbga  = HSLAToRGBA(hsla.h, hsla.s, hsla.l, hsla.a);

        data[i]     = rbga.r;
        data[i + 1] = rbga.g;
        data[i + 2] = rbga.b;
      }
    }
  });

  ctrl.dataset.last_value = val;
}
function invTint(){
  updImage(data => {
    for (var i  = 0; i < data.length; i += 4) {
      if(data[i] != 0 || data[i + 1] != 0 || data[i + 2] != 0){
        let hsla  = RGBAToHSLA(data[i], data[i+1], data[i+2], data[i+3]);
        hsla.l = 100 - hsla.l;
        let rbga  = HSLAToRGBA(hsla.h, hsla.s, hsla.l, hsla.a);

        data[i]     = rbga.r;
        data[i + 1] = rbga.g;
        data[i + 2] = rbga.b;
      }
    }
  });
}
//------------------ MODIFICATION DE LA COULEUR DES AVATARS ----------------- //
function rotateColor(x = 0.1, y = 0.1, z = 0.1){
  updImage(data => {
    for (var i = 0; i < data.length; i += 4) {
      if((data[i] != 255 || data[i + 1] != 255 || data[i + 2] != 255) && (data[i] != 0 || data[i + 1] != 0 || data[i + 2] != 0)){
        var pos = {x: data[i], y: data[i + 1], z: data[i + 2]};
    		pos = rotateByMatrix(pos, x, y, z);

        for(var p in pos){ pos[p] = abs(pos[p]); }

        data[i]     = parseInt(pos.x);
        data[i + 1] = parseInt(pos.y);
        data[i + 2] = parseInt(pos.z);
      }
    }
  });
}
//------------------ MODIFICATION DE LA COULEUR DES AVATARS ----------------- //
function rotate_image(angle){
  let center = canvas.getCenter();
  ctx.translate(center.x, center.y);
  ctx.rotate(angle * Math.PI / 180);
  ctx.translate(-center.x, -center.y);
}
//------------------ NIVEAUX DE GRIS DES AVATARS ----------------- //
function grey_color(){
  updImage(data => {
    for (var i = 0; i < data.length; i += 4) {
      let moy = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i]     = moy;
      data[i + 1] = moy;
      data[i + 2] = moy;
    }
  });
}
//------------------ SHELL IMAGE ----------------- //
function updShell(ctrl){
  let upd_val = calcUpdVal(ctrl);
  let k = 0;
  updImage(data => {
    for (var i = 0; i < data.length; i += 4) {

      var co = abs(cos(upd_val+k)); var si = abs(sin(upd_val+k));
			var cps = si+co;

			if(i%8 == 0){ upd_val = 1/upd_val; }

      data[i]     *= upd_val;
      data[i + 1] *= upd_val;
      data[i + 2] *= upd_val;

      if(i%4 == 0){ k+=rad; }
    }
  });
}
//------------------ TEST COLOR ----------------- //
function test_color(){
  let w = canvas.width * 4;
  updImage(data => {
    col = {r: rnd()*255, g: rnd()*255, b: rnd()*255};
    for (var i = 0; i < data.length; i += 4) {
      let new_line = i%w == 0;
      if(((data[i] == 255 && data[i + 1] == 255 && data[i + 2] == 255 && data[i + 3] == 255) ||
         (data[i] == 0 && data[i + 1] == 0 && data[i + 2] == 0 && data[i + 3] == 0)) && !new_line){
        data[i]     = col.r;
        data[i + 1] = col.g;
        data[i + 2] = col.b;
        data[i + 3] = 255;
      }
      else{
        col = {r: rnd()*255, g: rnd()*255, b: rnd()*255};
      }
    }
  });
}
//------------------ BLUR ----------------- //
function blur(){
  updImage(data => { let new_data = [], i;
    for (i = 4; i < data.length; i += 4) {
      if(data[i - 4] != 255 || data[i - 3] != 255 || data[i - 2] != 255 || data[i - 1] != 255){
        new_data[i]     = (data[i - 4] + data[i] + data[i + 4]) / 3;
        new_data[i + 1] = (data[i - 3] + data[i + 1] + data[i + 5]) / 3;
        new_data[i + 2] = (data[i - 2] + data[i + 2] + data[i + 6]) / 3;
        new_data[i + 3] = (data[i - 1] + data[i + 3] + data[i + 7]) / 3;
      }
    }
    for (i = 4; i < data.length; i += 4) {
      if(data[i - 4] != 255 || data[i - 3] != 255 || data[i - 2] != 255 || data[i - 1] != 255){
        data[i]     = new_data[i];
        data[i + 1] = new_data[i + 1];
        data[i + 2] = new_data[i + 2];
        data[i + 3] = new_data[i + 3];
      }
    }
  });
}
function sharp(){
  updImage(data => { let new_data = [], i;
    for (i = 4; i < data.length; i += 4) {
      if(data[i - 4] != 255 || data[i - 3] != 255 || data[i - 2] != 255 || data[i - 1] != 255){
        new_data[i]     = data[i] * 3 - (data[i - 4] + data[i + 4]);
        new_data[i + 1] = data[i + 1] * 3 - (data[i - 3] + data[i + 5]);
        new_data[i + 2] = data[i + 2] * 3 - (data[i - 2] + data[i + 6]);
        new_data[i + 3] = data[i + 3] * 3 - (data[i - 1] + data[i + 7]);
      }
    }
    for (i = 4; i < data.length; i += 4) {
      if(data[i - 4] != 255 || data[i - 3] != 255 || data[i - 2] != 255 || data[i - 1] != 255){
        data[i]     = new_data[i];
        data[i + 1] = new_data[i + 1];
        data[i + 2] = new_data[i + 2];
        data[i + 3] = new_data[i + 3];
      }
    }
  });
}
function invColors(){
  updImage(data => {
    for (i = 4; i < data.length; i += 4) {
      data[i]     = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
  });
}
function exchangeToneColor(){
  updImage(data => {
    let arrCol = [];
    data.forEach((c,i) => {
      if(c.r + c.g + c.b + c.a == 0){ c.ec = -1; }
      else{
        c.ec = abs(c.r - c.g) + abs(c.r - c.b) + abs(c.g - c.b);
      }
      arrCol.push(c.ec);
    });

    let arrColSz = arrCol.length;
    while(arrColSz--){
      minInd = getMinInd(arrCol);
      maxInd = getMaxInd(arrCol);

      arrCol.splice(minInd, 1);
      arrCol.splice(maxInd, 1);

      if(data[minInd] != -1 && data[maxInd] != -1){ data[minInd] = data[maxInd]; }
    }

  }, false);
}
//------------------ MODIFICATION DE L'IMAGE ----------------- //
function updImage(func, simple = true, clear = false){
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = simple ? imageData.data : arrColors(imageData.data);

  if(typeof(func) == 'function'){ func(data); }

  if(!simple){ simpleArr(data, imageData.data); }

  if(clear){ ctx.clearRect(0, 0, canvas.width, canvas.height); }

  ctx.putImageData(imageData, 0, 0);
}
function simpleUpdImage(ctxVar, func, arg){
  var imageData = ctxVar.getImageData(0, 0, canvas.width, canvas.height);

  if(typeof(func) == 'function'){ func(arg); }

  ctxVar.putImageData(imageData, 0, 0);
}

/**
 * @description Update background to avatars average color
 * @param {Boolean}  inv inverse background color
 * @returns {void}
 */
function updBgToAvColor(inv = false){
  let dataImage   = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data        = dataImage.data;
  let dataSz      = data.length;

  let n = 0;
  let tot = {r: 0, g: 0, b: 0};
  for (i = 4; i < dataSz; i += 4) {
    if((data[i - 4] != 255 || data[i - 3] != 255 || data[i - 2] != 255 || data[i - 1] != 255) &&
       (data[i - 4] != 0 || data[i - 3] != 0 || data[i - 2] != 0 || data[i - 1] != 0))
    {
      tot.r += data[i - 4];
      tot.g += data[i - 3];
      tot.b += data[i - 2];

      n++;
    }
  }

  if(n > 0){
    for(let c in tot){ tot[c] /= n; }
    if(inv){ for(let c in tot){ tot[c] = 255 - tot[c]; } }
    let bg = objRgb_to_strRgb(tot);
    canvas.style.backgroundColor = bg;
    activeGlo.backgroundColor = bg;
  }
}

/**
 * @description Update Background interface alpha color
 * @param {float} val alpha value
 * @returns {void}
 */
function bgInterfaceOpacity(ctrl){
  if(!activeGlo.interfaceBg){
    activeGlo.interfaceBg = getStyleProperty(".interface","background-color");
    if(activeGlo.interfaceBg.length < 22){ activeGlo.interfaceBg = "rgba" + activeGlo.interfaceBg.substring(3, activeGlo.interfaceBg.length - 1) + ", 1)"; }
  }

  let objCol = strRgba_to_objRgba(activeGlo.interfaceBg);
  objCol.a   = parseFloat(ctrl.value);
  let strCol = objRgba_to_strRgba(objCol);

  activeGlo.interfaceBg = strCol;

  interfaces.forEach(interface => { interface.style.backgroundColor = strCol; });
}

/**
 * @description Get property of a css rule by id or class
 * @param {string} classOrId class or id of the css rule
 * @param {string} property the property to return the value in the css rule
 * @returns {void}
 */
function getStyleProperty(classOrId, property)
{
    let firstChar = classOrId.charAt(0);
    let remaining = classOrId.substring(1);
    let elem      = (firstChar =='#') ?  document.getElementById(remaining) : document.getElementsByClassName(remaining)[0];

    return window.getComputedStyle(elem, null).getPropertyValue(property);
}

//------------------ TURN DATA IMAGE TO ARRAY COLORS ----------------- //
function arrColors(data){
  arrayColors = []; dataLength = data.length;
  for (var i = 0; i < dataLength; i += 4) {
    arrayColors.push({r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3]});
  }
  return arrayColors;
}
//------------------ TURN ARRAY COLORS TO DATA IMAGE ----------------- //
function simpleArr(data, imgData){
  n = 0;
  data.forEach(color => {
    imgData[n] = color.r; imgData[n + 1] = color.g; imgData[n + 2] = color.b; imgData[n + 3] = color.a;
    n+=4;
  });
}

/**
 * @description Update the color function
 * @param {HTMLInputElement} ctrl The input range in interface
 * @returns {void}
 */
function updColorFunction(ctrl){
  switchObjBools(activeGlo.colorFunctions, activeGlo.colorFunctionLabels[ctrl.value], activeGlo.colorCumul);
  /*if(!activeGlo.mode.colorCumul.state){
    switchObjBools(activeGlo.colorFunctions, activeGlo.colorFunctionLabels[ctrl.dataset.last_value], activeGlo.mode.colorCumul.state);
  }*/
}


//------------------ CALCUL ANGLE BETWEEN 0 & 2PI ----------------- //
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
//------------------ CALCUL POS ON GRID ----------------- //
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

function infoOnMouse(){
  let onModsInfo = false;
  let modifiersSz = activeGlo.modifiers.length;
  for(let i = 0; i < modifiersSz; i++){
    let mod = activeGlo.modifiers[i];
    if(mod.x < mouse.x + 10 && mod.x > mouse.x - 10 && mod.y < mouse.y + 10 && mod.y > mouse.y - 10){
      activeGlo.onModsInfo = {mod: mod};
      onModsInfo = true;
      break;
    }
  }
  if(!onModsInfo && !activeGlo.persistModsInfo){ activeGlo.onModsInfo = false; }
}

//------------------ CALCUL POS ON GRID ----------------- //
function putModsOnGrid(){
  if(activeGlo.grid.draw){
    getSelectedModifiers().forEach(mod => {
        let pos = posOnGrid({x: mod.x, y: mod.y}, activeGlo.grid.type);
        mod.x = pos.x;
        mod.y = pos.y;
    });
  }
}
//------------------ POS A MODIFIER ----------------- //
function pos_modifier(type = 'attractor', pos = mouse, inv = false, groupe = 0, virtual = false){
  let invAtt     = !inv ? 1 : -1;
  let random     = !activeGlo.pos_rnd_modifiers ? 1 : rnd();
  let force      = !activeGlo.modsToZero ? invAtt * 100 * random : 0;
  let dir_rnd    = !activeGlo.pos_rnd_modifiers ? 0 : rnd() * two_pi;
  let dir_angle  = invAtt * activeGlo.params.director_angle  + dir_rnd - invAtt * activeGlo.params.director_angle_upd;

  if(activeGlo.grid.draw){ pos = posOnGrid(pos, activeGlo.grid.type); }

  pos = !activeGlo.attract_center ? pos :
        !activeGlo.center ? canvas.getCenter() : activeGlo.center;

  let cent = !activeGlo.center ? canvas.getCenter() : activeGlo.center;

  let formule = {x: formule_x.value, y: formule_y.value};

  let dblAngle        = 0;
  let modPolyRotAngle = 0;
  let magnetAngle     = activeGlo.params.magnetor_angle;
  if(activeGlo.orientedPoly){
    let angle       = atan2pi(pos.x - cent.x, pos.y - cent.y);
    magnetAngle     = angle <= PI ? angle : -(angle - PI);
    modPolyRotAngle = two_pi - angle;
    dblAngle        = atan2piZ(pos.x - cent.x, pos.y - cent.y);
    dir_angle       = dblAngle;
  }

  if(type == 'magnetor' || type == 'mimagnetor' || activeGlo.doubleMods){ activeGlo.magnetors = true; }

  let newMod = {
    type              : type,
    x                 : pos.x,
    y                 : pos.y,
    attract           : force,
    brake             : activeGlo.params.brake_pow,
    nbEdges           : activeGlo.params.posModsNbEdges,
    magnetAngle       : magnetAngle,
    modPolyRotAngle   : modPolyRotAngle,
    dblAngle          : dblAngle,
    dir_angle         : dir_angle,
    tint              : activeGlo.params.tint_color,
    sat               : activeGlo.params.saturation,
    alpha             : activeGlo.params.alpha_color,
    colorDec          : activeGlo.params.colorDec,
    size              : activeGlo.size,
    lim_attract       : 0,
    haveColor         : activeGlo.modifiersHaveColor,
    powColor          : activeGlo.params.nearColorPow,
    varOneColMod      : activeGlo.params.varOneColMod,
    rot_spi           : force,
    ellipse           : {x: activeGlo.params.ellipse_x, y: activeGlo.params.ellipse_y},
    spiral_exp        : invAtt * activeGlo.params.spiral_exp,
    rotMax            : 0,
    rotSin            : [],
    formule           : formule,
    center            : cent,
    num_modifier      : num_modifier,
    glo               : deepCopy(activeGlo, 'modifiers', 'inputToSlideWithMouse'),
    params            : deepCopy(activeGlo.params),
    color             : activeGlo.modifiersColor,
    colorStrokeDec    : activeGlo.params.colorStrokeDec,
    tint_stroke       : activeGlo.params.tint_stroke,
    satStroke         : activeGlo.params.satStroke,
    colorFunction     : activeGlo.colorFunction,
    curveAngle        : activeGlo.params.curveAngle,
    double            : type == 'magnetor' ? true : false,
    dblForce          : activeGlo.doubleMods ? 200 : 1,
    modsWithSign      : activeGlo.modsWithSign ? true : false,
    alternRot         : {state: true, inv: 1},
    alternAtt         : {state: true, inv: 1},
    weight            : 1,
    groupe            : groupe,
    virtual           : virtual,
    modify            : makeModifierFunction(type)
  };

  activeGlo.modifiers.push(newMod);

  num_modifier++;
}

function deleteRecurse(obj, prop, iter){
  obj.glo.modifiers.forEach(subMod => {
    if(iter > 0){ deleteRecurse(subMod, prop, iter-1); }
    else{
      delete subMod[prop];
    }
  });
}

/**
*@description Make the modify function to modify the pos of avatars
*@param {string} modifierType The type of modifier, ex: 'attractor', 'rotator', ...
*@returns {void}
*/
function makeModifierFunction(modifierType){
  switch (modifierType) {
    case 'attractor':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist = av.dist_av(this) / this.params.weightDistMinMod;
        if(this == av.nearMod){
          av.goToNearMod    = dist < av.distMinNearMod ? true : false;
          av.distMinNearMod = dist;
        }
        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){
          av.distMinModifiers = dist; av.distMinNearMod = dist; av.nearMod = this;
        }

        if(dist <= this.lim_attract || !this.lim_attract){
          let angleToMod  = atan2pi(av.x - this.x, av.y - this.y);

          if(angleToMod >= this.params.minAngleMod && angleToMod <= this.params.maxAngleMod){
            let att   = this.attract * this.dblForce * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
            let b = !this.glo.invBrake ? this.brake : 1/this.brake;
            let brake = this.params.breakAdd + pow(dist, b);
            let addX  = att * (this.x - av.x) / brake;
            let addY  = att * (this.y - av.y) / brake;

            av.modifiersValues.x += addX;
            av.modifiersValues.y += addY;

            if(this.params.modsDevForce != '0'){
              let dist = h(addX, addY);
              let dir  = atan2piZ(addX, addY);
              let dec  = direction(dir + this.params.modsDevDir, dist * this.params.modsDevForce);

              av.modifiersValues.x += dec.x;
              av.modifiersValues.y += dec.y;
            }
          }
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += cos(this.dblAngle);
            this.y      += sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'rotator':
    case 'magnetor':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let posSave;
        let k = this.params.dblModDist;
        if(this.double){
          posSave = {x: this.x, y: this.y};
          this.x -= k*cos(this.dblAngle);
          this.y -= k*sin(this.dblAngle);

          if(!this.doublePos){ this.doublePos = {}; }
          this.doublePos.double = {x: this.x, y: this.y};
        }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;
        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let angleToMod  = atan2pi(av.x - this.x, av.y - this.y);

          if(angleToMod >= this.params.minAngleMod && angleToMod <= this.params.maxAngleMod){
            let att    = this.attract * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
            let b = !this.glo.invBrake ? this.brake : 1/this.brake;
            let brake  = this.params.breakAdd + pow(dist, b);
            let attRot = att / brake;

            if(this.rotMax > 0){ attRot = abs(attRot) > this.rotMax ? Math.sign(attRot) * this.rotMax : attRot; }

            if(!this.params.ell_x_mod_upd && !this.params.ell_y_mod_upd){
              av.rotate(attRot, {x: this.x, y: this.y}, {x: att*this.ellipse.x/brake, y: att*this.ellipse.y/brake},
                                  this.params.spiral_force, {force: this.params.modsDevForce, dir: this.params.modsDevDir});
            }
            else{
              av.rotateEllipse(attRot, {x: this.x, y: this.y},
                                  {x: att*this.ellipse.x/brake, y: att*this.ellipse.y/brake}, this.params.angleEllipseMod, this.params.spiral_force);
            }
          }

          if(this.double){
            this.x = posSave.x;
            this.y = posSave.y;
          }
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += k*cos(this.dblAngle);
            this.y      += k*sin(this.dblAngle);

            this.doublePos.noDouble = {x: this.x, y: this.y};

            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'magnetor':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att         = this.attract * this.dblForce;
          let brake       = this.params.breakAdd + pow(dist, this.brake);
          let dxToMod     = av.x - this.x;
          let dyToMod     = av.y - this.y;
          let angleToMod  = atan2pi(dxToMod, dyToMod);
          let magnetAngle = this.magnetAngle;

          let inv = 1;
          if(magnetAngle >= 0){
            inv = angleToMod > magnetAngle && (angleToMod < magnetAngle + PI) ? inv : -inv;
          }
          else{
            magnetAngle = -magnetAngle;
            inv = angleToMod > magnetAngle && (angleToMod < magnetAngle + PI) ? -inv : inv;
          }

          av.modifiersValues.x += inv * att * (this.x - av.x) / brake;
          av.modifiersValues.y += inv * att * (this.y - av.y) / brake;
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += cos(this.dblAngle);
            this.y      += sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'deviator':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att         = this.attract * this.dblForce * 4;
          let brake       = this.params.breakAdd + pow(dist, this.brake/2);

          let lastAv = av.lasts[av.lasts.length - 2];

          if(lastAv){
            let vx = av.x - lastAv.x;
            let vy = av.y - lastAv.y;

            let c = att / brake;

            if(!av.direction){ av.dir(); }

            let dir = direction(av.direction + this.params.deviatorAngle, h(vx, vy));

            av.modifiersValues.x += dir.x * c;
            av.modifiersValues.y += dir.y * c;
          }
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += cos(this.dblAngle);
            this.y      += sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'accelerator':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att         = this.attract * this.dblForce;
          let brake       = this.params.breakAdd + pow(dist, this.brake);

          let coeff = 1 + att/brake;
          
          av.modifiersValues.x *= coeff;
          av.modifiersValues.y *= coeff;
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += cos(this.dblAngle);
            this.y      += sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'polygonator':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att   = this.attract * this.dblForce * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
          let brake = this.params.breakAdd + pow(dist, this.brake);
          attRot    = 10 * att / brake;

          if(this.rotMax > 0){ att = abs(attRot) > this.rotMax ? Math.sign(attRot) * this.rotMax : att; }
          av.rotPoly(10 * att, {x: this.x, y: this.y}, true, this.nbEdges, this.brake, this.modPolyRotAngle,
                     {force: this.params.modsDevForce, dir: this.params.modsDevDir});
        }

        if(this.double){
            this.modPolyRotAngle += PI / this.nbEdges;

            let k        = this.params.dblModDist;
            let posSave  = {x: this.x, y: this.y};
            this.x      += k*cos(this.dblAngle);
            this.y      += k*sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;

            this.modPolyRotAngle -= PI / this.nbEdges;
        }
      };
    case 'spiralor':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att     = this.attract;
          let brake   = this.params.breakAdd + pow(dist, this.brake/1.15);
          let attract = att/4;
          let rot_spi = this.rot_spi;
          let attSpi  = rot_spi/brake;

          if(this.rotMax > 0){ attSpi = abs(attSpi) > this.rotMax ? Math.sign(attSpi) * this.rotMax : attSpi; }

          let attB = !this.glo.spiralOnlyInvrot ? attract/brake : abs(attract/brake);
          let f = 1 + attB;

          if(!this.params.ell_x_mod_upd && !this.params.ell_y_mod_upd){
              av.rotate(attSpi, {x: this.x, y: this.y}, {x: rot_spi*this.ellipse.x/brake, y: rot_spi*this.ellipse.y/brake}, f);
          }
          else{
              av.rotateEllipse(attSpi, {x: this.x, y: this.y}, {x: rot_spi*this.ellipse.x/brake, y: rot_spi*this.ellipse.y/brake}, this.params.angleEllipseMod, f);
          }
        }
      };
    case 'alternator':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att   = this.attract;
          let brake = this.params.breakAdd + pow(dist, this.brake);
          if(this.brake == 0){ att /= 100; }
          attRot    = att / brake;

          let alternatorSpeed = this.brake != 0 ? this.params.alternatorSpeed : parseInt(this.params.alternatorSpeed / 10);
          if(zeroOneCycle(this.glo.nb_moves, alternatorSpeed)){
            this.alternAtt.state = false;

            if(!this.glo.alternatorInv){ this.alternRot.inv = 1; }
            else{ this.alternRot.inv = this.alternRot.state ? this.alternRot.inv : -this.alternRot.inv; }

            this.alternRot.state = true;
            if(this.rotMax > 0){ attRot = abs(attRot) > this.rotMax ? Math.sign(attRot) * this.rotMax : attRot; }
            av.rotate(this.alternRot.inv * attRot, {x: this.x, y: this.y}, {x: att*this.ellipse.x/brake, y: att*this.ellipse.y/brake});
          }
          else{
            this.alternRot.state = false;

            if(!this.glo.alternatorInvAtt){ this.alternAtt.inv = 1; }
            else{ this.alternAtt.inv = this.alternAtt.state ? this.alternAtt.inv : -this.alternAtt.inv; }

            this.alternAtt.state = true;
            av.modifiersValues.x += this.alternAtt.inv * att * (this.x - av.x) / brake;
            av.modifiersValues.y += this.alternAtt.inv * att * (this.y - av.y) / brake;
          }
        }
      };
    case 'director':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att   = this.attract * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
          let brake = this.params.breakAdd + pow(dist, this.brake);
          let force = 100 * att / brake;
          let angle = this.dir_angle + this.params.director_angle_upd;

          av.modifiersValues.x += cos(angle) * force;
          av.modifiersValues.y += sin(angle) * force;
        }
    };
    case 'pathor':
      return function(av){
        if(this.glo.stepsModPath){
          if(this.params.mods_formule != '0'){ modsFormule(this, av); }

          let dist  = av.dist_av(this) / this.params.weightDistMinMod;

          av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
          if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

          if(dist <= this.lim_attract || !this.lim_attract){
            let att   = this.attract * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
            let brake = this.params.breakAdd + pow(dist, this.brake);
            let force = 100 * att / brake;

            let angleToCenter = atan2pi(av.x - this.x, av.y - this.y);
            let vects         = this.glo.stepsModPath.sort((a,b) => a.angleToCenter - b.angleToCenter).slice(1);

            if(vects.length){
              vects = vects.map(vect => { vect.angleToCenter.x -= vects[0].angleToCenter.x; vect.angleToCenter.y -= vects[0].angleToCenter.y; return vect; });

              let vect = vects[0];
              for(let i = 0; i < vects.length-1; i++){
                if(angleToCenter > vects[i].angleToCenter && angleToCenter <= vects[i+1].angleToCenter){ vect = vects[i]; break; }
              }
              if(angleToCenter > vects[vects.length-1].angleToCenter){
                vect = vects[vects.length-1];
              }

              av.modifiersValues.x += vect.x * force;
              av.modifiersValues.y += vect.y * force;
            }
          }
        }
    };
    case 'formulator':
      return function(av){
        if(this.formule){
          if(this.params.mods_formule != '0'){ modsFormule(this, av); }

          let dist  = av.dist_av(this) / this.params.weightDistMinMod;

          av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
          if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

          if(dist <= this.lim_attract || !this.lim_attract){
            let att    = this.attract * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
            let brake  = this.params.breakAdd + pow(dist, this.brake);
            let force  = 100 * att / brake;
            let result = {x: 0, y: 0};
            let reg_x  = '((av.x - this.x) * rad)';
            let reg_y  = '((av.y - this.y) * rad)';

            if(this.formule.x && this.formule.x != ''){
              let x = this.formule.x;
              x = x.replaceAll('xy', 'x*y');
              x = x.replaceAll('x', reg_x);
              x = x.replaceAll('y', reg_y);
              let result_x = parseFloat(eval(x)) * force;
              if(isFinite(result_x)){ result.x = result_x; }
            }
            if(this.formule.y && this.formule.y != ''){
              let y = this.formule.y;
              y = y.replaceAll('xy', 'x*y');
              y = y.replaceAll('x', reg_x);
              y = y.replaceAll('y', reg_y);
              let result_y = parseFloat(eval(y)) * force;
              if(isFinite(result_y)){ result.y = result_y; }
            }

            av.modifiersValues.x += result.x;
            av.modifiersValues.y += result.y;
          }
        }
      };
    case 'none':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }
      };
  }
}


//------------------ POS ATTRACTORS OR ROTATORS ----------------- //
function posModifiers(type = activeGlo.pos_modifiers, inv = activeGlo.invModifiersAtt){
  let invAtt = inv;
  if(type != 'all'){
    for(let i = 0; i < activeGlo.params.nb_modifiers; i++){
      if(inv){ invAtt = i%2 == 0 ? true : false; }
      if(!activeGlo.posOnMouse.circleMods){ pos_modifier(type, getRandomPoint(1), invAtt); }
      else{ posCircleModifiers(getRandomPoint(1)); }
    }
  }
  else {
    let types   = ['attractor', 'rotator', 'director'];
    let typesSz = types.length;
    for(let i = 0; i < activeGlo.params.nb_modifiers; i++){
      if(inv){ invAtt = i%2 == 0 ? true : false; }
      pos_modifier(types[i%typesSz], getRandomPoint(1), invAtt);
    }
  }
}

function posModifiersByType(cent, type = activeGlo.formModTypes[activeGlo.params.formModType]){
  switch(type){
    case 'circle':
      posCircleModifiers(cent);
      break;
    case 'square':
      posSquareModifiers(cent);
      break;
    case 'rectangle':
      posRectModifiers(cent);
      break;
    case 'polygone':
      posPolyModifiers(cent);
      break;
  }
}

//------------------ POS CIRCLES MODIFIERS ----------------- //
function posCircleModifiers(cent = false, type = activeGlo.pos_modifiers, inv = activeGlo.invModifiersAtt, rot = activeGlo.params.rotCircleModifiers){
  let pt, n = 0;
  let invAtt = inv;
  if(!cent){
    cent = !activeGlo.defineCenter ? defineCenter(false) :
                activeGlo.center ? activeGlo.center : canvas.getCenter();
  }

  if(!activeGlo.groupe){ activeGlo.groupe = 0; }

  pos_modifier(type, {x: cent.x, y: cent.y}, false, activeGlo.groupe);

  let k = activeGlo.params.ellipse_x / activeGlo.params.ellipse_y;
  let r = canvas.height * activeGlo.params.circle_size;
  let step = parseFloat(two_pi / activeGlo.params.nb_modifiers);
  let nb_circles = activeGlo.params.nb_circles;
  for(let i = 1; i <= nb_circles; i++){
    pt = {x: cent.x, y: cent.y + r*(i/nb_circles)};
    if(rot != 0){ pt = rotate(pt, cent, rot, k); }
    if(activeGlo.staggered && i > 1 && i%2 == 0){ pt = rotate(pt, cent, step/2, k); }
    if(activeGlo.params.nb_modifiers%2==0){ n++; }
    activeGlo.groupe++;
    for(let j = step; j <= two_pi+0.0001; j+=step){
      pt = rotate(pt, cent, step, k);

      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: pt.x, y: pt.y}, invAtt, activeGlo.groupe);
      n++;
    }
  }
}
//------------------ POS POLYGONE(S) MODIFIERS ----------------- //
function posPolyModifiers(cent = false, type = activeGlo.pos_modifiers, nb = activeGlo.params.nb_modifiers, inv = activeGlo.invModifiersAtt,
  rot = activeGlo.params.rotCircleModifiers, nbEdges = activeGlo.params.posModsNbEdges){
  let n = 0;
  let invAtt = inv;
  if(!cent){
    cent = !activeGlo.defineCenter ? defineCenter(false) :
    activeGlo.center ? activeGlo.center : canvas.getCenter();
  }

  if(!activeGlo.groupe){ activeGlo.groupe = 0; }

  let r = canvas.height * activeGlo.params.circle_size;
  let nb_circles = activeGlo.params.nb_circles;

  for(let i = 1; i <= nb_circles; i++){
    activeGlo.groupe++;
    let mod = {type: type, inv: invAtt, groupe: activeGlo.groupe};
    pointsStar(cent, nbEdges, nb, r*(i/nb_circles), 0, cent, mod);
  }
}
//------------------ POS SQUARE MODIFIERS ----------------- //
function posSquareModifiers(cent = false, type = activeGlo.pos_modifiers, inv = activeGlo.invModifiersAtt, rot = activeGlo.params.rotCircleModifiers){
  let x, y, pt, n = 0;
  let invAtt = inv;
  if(!cent){
    cent = !activeGlo.defineCenter ? defineCenter(false) :
    activeGlo.center ? activeGlo.center : canvas.getCenter();
}

  if(!activeGlo.groupe){ activeGlo.groupe = 0; }

  let form_size = canvas.height * activeGlo.params.circle_size * 2;
  nb_mods       = parseInt(sqr(activeGlo.params.nb_modifiers));
  step          = parseFloat(form_size / nb_mods);

  x = cent.x - form_size/2 + step/2;
  for(let i = 1; i <= nb_mods; i++){
    y = cent.y - form_size/2 + step/2;
    if(nb_mods%2==0){ n++; }
    activeGlo.groupe++;
    for(let j = 1; j <= nb_mods; j++){
      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: x, y: y}, invAtt, activeGlo.groupe);
      y+=step;
      n++;
    }
    x+=step;
  }
}
//------------------ POS RECTANGLE MODIFIERS ----------------- //
function posRectModifiers(cent = false, type = activeGlo.pos_modifiers, inv = activeGlo.invModifiersAtt, rot = activeGlo.params.rotCircleModifiers){
  let x, y, pt, n = 0;
  let invAtt = inv;
  if(!cent){
    cent = !activeGlo.defineCenter ? defineCenter(false) :
    activeGlo.center ? activeGlo.center : canvas.getCenter();
  }

  if(!activeGlo.groupe){ activeGlo.groupe = 0; }

  let form_size_w = canvas.width  * activeGlo.params.circle_size * 2;
  let form_size_h = canvas.height * activeGlo.params.circle_size * 2;
  nb_mods         = parseInt(sqr(activeGlo.params.nb_modifiers));
  step_x          = parseFloat(form_size_w / nb_mods);
  step_y          = parseFloat(form_size_h / nb_mods);

  x = cent.x - form_size_w/2 + step_x/2;
  for(let i = 1; i <= nb_mods; i++){
    y = cent.y - form_size_h/2 + step_y/2;
    if(nb_mods%2==0){ n++; }
    activeGlo.groupe++;
    for(let j = 1; j <= nb_mods; j++){
      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: x, y: y}, invAtt, activeGlo.groupe);
      y+=step_y;
      n++;
    }
    x+=step_x;
  }
}
/**
 * @description Paste the selected modifiers
 * @returns {void}
 */
function pasteModifiers(){
  if(activeGlo.modifiers.length > 0){
    let topLeftMod = findTopLeftModifiers();
    let dec        = {x: mouse.x - topLeftMod.x, y: mouse.y - topLeftMod.y};

    if(activeGlo.grid.draw){
      let modZero                  = activeGlo.modifiers[0];
      let indTopLeftMod            = activeGlo.modifiers.indexOf(topLeftMod);
      activeGlo.modifiers[0]             = topLeftMod;
      activeGlo.modifiers[indTopLeftMod] = modZero;
    }

    activeGlo.groupe++;

    getSelectedModifiers().forEach((mod, i) => {
      let pos = {x: mod.x + dec.x, y: mod.y + dec.y};

      if(i == 0 && (activeGlo.grid.draw)){
        let posDec = posOnGrid(pos, activeGlo.grid.type);
        dec = {x: dec.x + (posDec.x - pos.x), y: dec.y + (posDec.y - pos.y)};
        pos = posDec;
      }

      let newMod = deepCopy(mod, 'modifiers');

      newMod.x      = pos.x;
      newMod.y      = pos.y;
      newMod.select = false;

      let center = mod.center ? mod.center : getCenter();
      newMod.center = point(center.x + dec.x, center.y + dec.y);

      activeGlo.modifiers.push(newMod);
    });
  }
}
/**
 * @description Find the more top left modifier
 * @returns {void}
 */
function findTopLeftModifiers(){
  if(activeGlo.modifiers.length == 0){ return false; }

  return getSelectedModifiers().reduce((prev, curr) => {
    return h(prev.x, prev.y) < h(curr.x, curr.y) ? prev : curr;
  });
}
//------------------ ROTATE MODIFIERS ----------------- //
function rotate_modifiers(rotAngle = -999){
  let angle  = rotAngle == -999 ? activeGlo.params.modifiers_angle / 100 : rotAngle;
  let center = !activeGlo.center ? canvas.getCenter() : activeGlo.center;
  getSelectedModifiers().forEach((mod) => {
    if(activeGlo.grid.draw && activeGlo.grid.type == 'circle'){
      let angle = abs(activeGlo.params.modifiers_angle);
      let sign  = Math.sign(activeGlo.params.modifiers_angle);
      let ang   = Math.round(angle / rad) < 100 ? Math.round(angle / rad) : 100;
      let speed = 101 - ang;
      if(activeGlo.nb_moves%speed==0){
        angle = two_pi / (activeGlo.params.circleGridStep * 4);
        let coords = rotate({x: mod.x, y: mod.y}, center, angle*sign);
        mod.x = coords.x;
        mod.y = coords.y;
        let pos = posOnGrid({x: mod.x, y: mod.y}, 'circle');
        mod.x = pos.x;
        mod.y = pos.y;
      }
    }
    else{
      let coords = rotate({x: mod.x, y: mod.y}, center, angle);
      mod.x = coords.x;
      mod.y = coords.y;
    }
  });
}
//------------------ ROTATE MODIFIERS ----------------- //
function translateModifiers(x, y){
  getSelectedModifiers().forEach(mod => {
    mod.x += x;
    mod.y += y;
  });
  //if(activeGlo.grid.draw){ putModsOnGrid(); }
}
//------------------ ROTATE MODIFIERS ----------------- //
function getSelectedModifiers(allForZero = true){
  let selectedMods = activeGlo.modifiers.filter(mod => mod.select);
  if(selectedMods.length > 0){ return selectedMods; }
  return allForZero ? activeGlo.modifiers : [];
}
//------------------ TURN MODIFIERS ----------------- //
function turnModifiers(ctrl){
  let modNum = ctrl.value;
  getSelectedModifiers().forEach((mod) => {
    mod.type = activeGlo.modifierTypes[modNum];
    mod.double = mod.type != 'magnetor' ? false : true;
    mod.modify = makeModifierFunction(activeGlo.modifierTypes[modNum]);
  });
  if(!activeGlo.modifiers.some(mod => mod.type == 'magnetor' || mod.type == 'mimagnetor' || mod.double)){ activeGlo.magnetors = false; }
  else{ activeGlo.magnetors = true; }
}
//------------------ UPD FORMULE MODIFIERS ----------------- //
function updFormuleModifiers(ctrl, coordType){
  let formule = ctrl.value;

  let result = testFormule(formule);
  if(result != 'nok' && !isNaN(result)){
    getSelectedModifiers().forEach((mod) => {
      if(!mod.formule){ mod.formule = {}; }
      mod.formule[coordType] = formule;
    });
  }
}
//------------------ UPD FORMULE COLOR ----------------- //
function updFormuleColor(ctrl, colorType){
  if(!activeGlo.modifiers.length){ updateColor(activeGlo); }
  else{ getSelectedModifiers().forEach(mod => { updateColor(mod.glo); }); }

  function updateColor(objGlo){
    objGlo.formuleColor[colorType] = ctrl.value;

    let formuleColorTest = false;

    let valToTests = ['H', 'S', 'L', 'A', 'D', 'sz', 'cx', 'cy', 'vx', 'vy', 'v', 'x', 'y'];

    let form = objGlo.formuleColor[colorType];
    valToTests.forEach(valToTest => {
      let reg = new RegExp("\\d+" + valToTest, "g");
      if(!form.match('undefined')){ form = form.replaceAll(reg, undefined); }
      reg = new RegExp(valToTest + "\\d+", "g");
      if(!form.match('undefined')){ form = form.replaceAll(reg, undefined); }
    });

    if(!form.match('undefined')){
      valToTests.forEach(valToTest => {
        valToTests.forEach(valToTest2 => {
          if(!form.match('undefined')){ form = form.replaceAll(valToTest + valToTest2, undefined); }
        });
        if(!form.match('undefined')){ form = form.replaceAll(valToTest, 1); }
      });
      if(!form.match('undefined')){
        form = form.replaceAll('this', 'avatars[0]');
        formuleColorTest = evalFormuleColor(form);
      }
    }

    if(!formuleColorTest){
      Object.assign(objGlo.formuleColor, objGlo.formuleColorHisto);
      /*getSelectedModifiers().forEach(mod => { Object.assign(mod.formuleColor, mod.formuleColorHisto); });*/
    }
    else{
      let formule = replacesInFormuleColor(objGlo.formuleColor[colorType]);
      objGlo.formuleColor[colorType] = formule;
      Object.assign(objGlo.formuleColorHisto, objGlo.formuleColor);
      /*getSelectedModifiers().forEach(mod => {
        mod.formuleColor[colorType] = formule;
        Object.assign(mod.formuleColorHisto, mod.formuleColor);
      });*/
    }
  }
}

function replacesInFormuleColor(colorElem){
  let colorElemTest = colorElem.replaceAll('H', 'h');

  colorElemTest = colorElemTest.replaceAll('S', 's');
  colorElemTest = colorElemTest.replaceAll('L', 'l');

  colorElemTest = colorElemTest.replaceAll('D', 'this.distMinModifiers');
  colorElemTest = colorElemTest.replaceAll('sz', 'this.sizeCalc.s');
  colorElemTest = colorElemTest.replaceAll('cx', '100*cos(this.x)');
  colorElemTest = colorElemTest.replaceAll('cy', '100*cos(this.y)');
  colorElemTest = colorElemTest.replaceAll('vx', '100*this.vit().x');
  colorElemTest = colorElemTest.replaceAll('vy', '100*this.vit().y');
  colorElemTest = colorElemTest.replaceAll('v', '100*this.vit().v');
  colorElemTest = colorElemTest.replace(/(?<!\.)x/g, 'this.x');
  colorElemTest = colorElemTest.replace(/(?<!\.)y/g, 'this.y');

  return colorElemTest.replaceAll('A', 'a');
}

function testFormule(formule){
  let formule_test = formule.replaceAll('x', 1);
  formule_test     = formule_test.replaceAll('y', 1);
  return parseFloat(evalNoError(formule_test));
}
//------------------ SELECT MODIFIER ----------------- //
function modifier_select(byMouse = true, ctrl = null){
  if(byMouse){
    let nearestModToMouse = getModNearestMouse(10);

    if(nearestModToMouse){
      if(!activeGlo.modifierSelect.byGroup){
        nearestModToMouse.select = !nearestModToMouse.select;
        //changeParamsByMod(nearestModToMouse);
      }
      else{
        activeGlo.modifiers.forEach(mod => {
          if(mod.groupe == nearestModToMouse.groupe){ mod.select = !mod.select; }
        });
      }
    }
  }
  else{
    if(ctrl.value == 0){ activeGlo.modifiers.forEach(mod => { mod.select = false; }); }
    else{
      activeGlo.modifiers.forEach(mod => {
        if(mod.type == activeGlo.selModsByType[ctrl.value]){ mod.select = true; }
        else{ mod.select = false; }
      });
    }
  }
}
/**
 * @description Set params interface accord to the mod @param
 * @param  {modifier} mod
 * @return {void}
 */
function changeParamsByMod(mod){
  if(isOneModSelected()){
    if(!mod.saveParams){ mod.saveParams = deepCopy(activeGlo.params); }
    params_interface(false, mod.params);
  }
  else{
    params_interface(false, mod.saveParams);
    delete mod.saveParams;
  }
}

/**
 * @description Return true if only one modifier is selected
 * @return {Boolean}
 */
function isOneModSelected(){
  return getSelectedModifiers(false).length === 1;
}

function modsSelected(){
  return getSelectedModifiers(false).length;
}

//------------------ DEFINE CENTER ----------------- //
function defineCenter(byMouse = true, define = false){
  let cent;
  if(define){
    cent = byMouse ? {x: mouse.x, y: mouse.y} : getRandomPoint(0.75);

    if(activeGlo.grid.draw){ cent = posOnGrid(cent, activeGlo.grid.type); }

    activeGlo.center = cent;
    avatars.forEach((av) => {
      av.center = cent ;
    });
  }
  else{
    cent = canvas.getCenter();
    activeGlo.center = cent;
    avatars.forEach((av) => {
      av.center = cent;
    });
  }
  return cent;
}
//------------------ CHANGE L'ÉCHELLE ----------------- //
function scale_avatars(sign, div = 10){
  let center = { x: canvas.width / 2, y: canvas.height / 2 };
  if(sign == '+'){
    avatars.forEach(avatar => {
      avatar.x -= (center.x - avatar.x)/div;
      avatar.y -= (center.y - avatar.y)/div;
      avatar.x      = avatar.x;
      avatar.y      = avatar.y;
    });
  }
  else{
    avatars.forEach(avatar => {
      avatar.x += (center.x - avatar.x)/div;
      avatar.y += (center.y - avatar.y)/div;
      avatar.x      = avatar.x;
      avatar.y      = avatar.y;
    });
  }
}
//------------------ CHANGE L'ÉCHELLE DES MODIFIEURS ----------------- //
function scale_modifiers(sign, div = 10){
  let center = { x: canvas.width / 2, y: canvas.height / 2 };
  let mods = getSelectedModifiers();
  if(sign == '+'){
    mods.forEach(mod => {
      mod.x -= (center.x - mod.x)/div;
      mod.y -= (center.y - mod.y)/div;
    });
  }
  else{
    mods.forEach(mod => {
      mod.x += (center.x - mod.x)/div;
      mod.y += (center.y - mod.y)/div;
    });
  }
}

//------------------ VITESSE À ZÉRO DES AVATARS ----------------- //
function stop_avatars(){ avatars.forEach(avatar => { avatar.vx = 0; avatar.vy  = 0; } ); }

//------------------ SUPPRIME ET RECRÉE LES AVATARS ----------------- //
function raz_avatars(){
  var nb = activeGlo.params.nb;
  deleteAvatar(nb);
  activeGlo.params.nb = nb;

  createAvatar();
}

//------------------ ATTRIBUE DES VALEURS ALÉATOIRES AUX PARAMÉTRES ----------------- //
function alea_params(avatar = false){
  for(var param in activeGlo.params){
    if(activeGlo.alea[param]){
      let ctrl = getById(param);

      if(ctrl){
        let ctrl_min = !ctrl.dataset.alea_min ? parseFloat(ctrl.min) : parseFloat(ctrl.dataset.alea_min);
        let ctrl_max = !ctrl.dataset.alea_max ? parseFloat(ctrl.max) : parseFloat(ctrl.dataset.alea_max);
        let step     = parseFloat(ctrl.step);

        let new_val = getRnd(ctrl_min, ctrl_max);

        if(parseInt(ctrl.step) == ctrl.step){ new_val = round(new_val, 0); }

        if(!avatar){
          activeGlo.params[param] = new_val;
          ctrl.value = new_val;
          updLabel(ctrl);
        }
        else{
          avatar.glo.params[param] = new_val;
        }
        if(ctrl.dataset.playinput){
          let event = new Event('input', {
            bubbles: true,
            cancelable: true,
          });
          ctrl.dispatchEvent(event);
        }
      }
    }
  }
}
//------------------ ATTRIBUE DES VALEURS ALÉATOIRES AUX PARAMÉTRES DÉCLENCHEMENT CLICK DROIT ----------------- //
function one_alea_param(playInput = true){
  for(var param in activeGlo.params_alea){
    if(activeGlo.params_alea[param]){
      let ctrl = getById(param);

      let ctrl_min = !ctrl.dataset.alea_min ? parseFloat(ctrl.min) : parseFloat(ctrl.dataset.alea_min);
      let ctrl_max = !ctrl.dataset.alea_max ? parseFloat(ctrl.max) : parseFloat(ctrl.dataset.alea_max);

      let new_val = getRnd(ctrl_min, ctrl_max);
      if(parseInt(ctrl.step) == ctrl.step){ new_val = round(new_val, 0); }
      ctrl.value = new_val;

      if(activeGlo.hyperAlea && !activeGlo.global_alea){
        avatars.forEach(avatar => {
          let new_val = getRnd(ctrl_min, ctrl_max);
          if(parseInt(ctrl.step) == ctrl.step){ new_val = round(new_val, 0); }
          avatar.glo.params[param] = new_val;

          if(activeGlo.hyperAlea && param == 'upd_size'){ avatar.size = new_val; }
        });
      }
      else if(playInput){
        let event = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        ctrl.dispatchEvent(event);
      }
    }
  }
}

//------------------ DRAW LIM ON INPUT FOR RANDOM MODE ----------------- //
function drawLimOnInput(ctrl, e){
  let limType = ctrl.dataset.defineMin == 'true' ? 'min' : 'max';
  let lim_id  = ctrl.id + '_lim_' + limType;

  if(getById(lim_id)){ getById(lim_id).remove(); }


  let div            = document.createElement("div");
  div.className      = 'lim ' + limType;
  div.id             = ctrl.id + '_lim_' + limType;
  div.style.fontSize = '12px';
  div.style.position = 'absolute';
  div.style.left     = e.clientX - 14 + 'px';
  div.style.top      = ctrl.offsetTop - 7 + 'px';
  div.style.color    = '#888';

  let txt = document.createTextNode('▼');

  div.appendChild(txt);

  ctrl.parentElement.appendChild(div);
}
//------------------ DRAW CHAR ON INPUT ----------------- //
function drawCharOnInput(ctrl, char, endId){
  let posCtrl        = ctrl.getClientRects()[0];
  let div            = document.createElement("div");
  div.className      = 'charOnInput';
  div.id             = ctrl.id + '_' + endId;
  div.style.fontSize = '16px';
  div.style.position = 'absolute';
  div.style.left     = posCtrl.x + posCtrl.width - 20 + 'px';
  div.style.top      = ctrl.offsetTop - 10 + 'px';
  div.style.color    = '#333';

  let txt = document.createTextNode(char);

  div.appendChild(txt);

  ctrl.parentElement.appendChild(div);
}

//------------------ PARAMÉTRAGES PARTICULIERS ----------------- //
function glo_params(style = 'gravity'){
  let params;
  switch(style){
    case 'gravity':
      params = {
        keep_dir: 0,
        brake_pow: 1,
        attract: 2,
        radius_attract: 256,
        dep_dir: 0,
        same_dir: 0,
        resist: 1
      };
      break;
    case 'test':
      params = {
        limSpeedMin: 2,
        rAleaPos: 0.2,
      };
      break;
    case 'stars':
      params = {
        keep_dir: 0,
        brake_pow: 2.12,
        attract: 4800,
        radius_attract: 2,
        dep_dir: 0,
        upd_size: 5,
        same_dir: 0,
        resist: 0,
        alpha_color: 0.06,
        lim_line: 12,
        div_line: 0,
        max_color: 500,
        tint_color: 32,
      };
      activeGlo.bg_black                 = true;
      activeGlo.numLineCap               = 1;
      activeGlo.alphaAbs                 = true;
      activeGlo.tail                     = false;
      activeGlo.collid_bord              = false;
      canvas.style.backgroundColor = '#000';
      activeGlo.form                     = 'ellipse';
      break;
  }

  Object.entries(params).forEach(([key, val]) => {
    activeGlo.params[key] = val;
    var ctrl = getById(key);
    if(val > ctrl.max){ ctrl.max = val; }
    ctrl.value = val;
  });

  radius_attract();
  params_interface(false);
}

/**
 * @description Take a all state shot
 * @returns {void}
 */
function takeShot(){
  gloSave = deepCopy(activeGlo);
}
/**
 * @description param all state to the shot take with takeShot function
 * @returns {void}
 */
function goToShot(){
  if(gloSave){
    activeGlo = deepCopy(gloSave);
    let upd_size     = getById('upd_size');
    let upd_size_val = upd_size.value;
    params_interface(false);
    let nb = activeGlo.params.nb;
    deleteAvatar(avatars.length);
    activeGlo.params.nb = nb;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(activeGlo.backgroundColor){ canvas.style.backgroundColor = activeGlo.backgroundColor; }
    createAvatar();
    upd_size.dataset.last_value = upd_size_val;
    updateSize(upd_size);
  }
}

//------------------ VIEW CENTER OF CANVAS ----------------- //
function view_center(){
  let center = activeGlo.center ? activeGlo.center : { x: canvas.width / 2, y: canvas.height / 2 };
  drawLogo({x:center.x, y: center.y, type: 'center'}, 'rgb(255,0,0,1)');
}
//------------------ VIEW ATTRACTORS ----------------- //
function view_modifiers(arr = activeGlo.modifiers){
  arr.forEach(mod => {
    let g_mod = mod.attract;
    let sel   = mod.select;

    if(g_mod > 255 || mod.attract < -255){ g_mod = 255; }
    else if((g_mod < 50 && g_mod > 0) || (g_mod > -50 && g_mod < 0)){ g_mod = 50; }
    else if(g_mod < 0){ g_mod = -g_mod; }
    let col  = 255 - g_mod;
    let col2 = col;
    if(mod.attract < 0){ col2 = col + 50; }

    let angle = mod.type == 'director' ? mod.dir_angle : 0;
    if(mod.type == 'magnetor' || mod.type == 'mimagnetor'){ angle = mod.magnetAngle; }

    if(mod.type != 'spiralor'){
      drawLogo(mod, 'rgb(' + col + ',' + col2 + ',' + col + ',1)', angle);
    }
    else{
      drawLogo(mod, 'rgb(' + col + ',' + col2 + ',' + col + ',1)', angle);
      drawLogo(mod, 'rgb(' + col + ',' + col2 + ',' + col + ',1)', angle);
  }
  });
}

//------------------ DRAW A CROSS ----------------- //
function drawLogo(mod, style, angle = 0){
  let point           = {x: mod.x, y: mod.y};
  let type            = mod.type;
  let select          = mod.select;
  let nbEdges         = mod.nbEdges;
  let attract         = mod.attract;
  let modPolyRotAngle = mod.modPolyRotAngle;
  let size            = 10;

  ctxStructure.strokeStyle = style;

  lineW = ctxStructure.lineWidth;

  ctxStructure.lineWidth = !select ? 1 : 3;

  switch (type) {
    case 'attractor':
    case 'center':
      strokeOnCanvas(ctxStructure, function(){ctxStructure.crossDiag(point, size);});
      if(mod.params && (mod.params.minAngleMod || mod.params.maxAngleMod < two_pi)){
        strokeOnCanvas(ctxStructure, function(){ctxStructure.arc(point.x, point.y, size, mod.params.maxAngleMod, mod.params.minAngleMod, true);});
      }
      break;
    case 'rotator':
      if(!mod.double){
        strokeOnCanvas(ctxStructure, function(){ctxStructure.cross(point, size/2);});
        strokeOnCanvas(ctxStructure, function(){ctxStructure.arc(point.x, point.y, size, 0, two_pi, false);});
      }
      else{
        let doublePos   = mod.doublePos.double;
        let noDoublePos = mod.doublePos.noDouble;
        strokeOnCanvas(ctxStructure, function(){ctxStructure.cross(noDoublePos, size/2);});
        strokeOnCanvas(ctxStructure, function(){ctxStructure.arc(noDoublePos.x, noDoublePos.y, size, 0, two_pi, false);});
        strokeOnCanvas(ctxStructure, function(){ctxStructure.cross(doublePos, size/2);});
      }
      break;
    case 'spiralor':
      ctxStructure.spiral({x: mod.x, y: mod.y}, 10, 2.5);
      break;
    case 'rotsinator':
      strokeOnCanvas(ctxStructure, function(){ctxStructure.arcMulti(point, size, 2);});
      break;
    case 'magnetor':
      angle = mod.dblAngle;
      let dir  = direction(angle, size * (!select ? 1 : 2));
      ctxStructure.lineWidth = !select ? 10 : 20;
      ctxStructure.strokeStyle = attract > 0 ? 'red' : 'blue';
      ctxStructure.line({start: point, end: {x: point.x + dir.x, y: point.y + dir.y}});
      ctxStructure.strokeStyle = attract > 0 ? 'blue' : 'red';
      ctxStructure.line({start: point, end: {x: point.x - dir.x, y: point.y - dir.y}});
      break;
    case 'deviator':
      let coeff = !select ? 1 : 2;
      angleSave = angle;
      angle = -abs(angle);
      ctxStructure.lineWidth = !select ? 10 : 20;
      if(angleSave < 0){ ctxStructure.strokeStyle = attract < 0 ? 'red' : 'blue'; }
      else{ ctxStructure.strokeStyle = attract > 0 ? 'blue' : 'red'; }
      ctxStructure.line({start: point, end: {x: point.x + cos(angle) * size * coeff, y: point.y + sin(angle) * size* coeff}});
      break;
    case 'accelerator':
      strokeOnCanvas(ctxStructure, function(){ctxStructure.cross(point, size);});
      break;
    case 'polygonator':
      let rot = nbEdges % 2 != 0 ? PI / nbEdges : 0;
      if(modPolyRotAngle){ rot += modPolyRotAngle; }
      strokeOnCanvas(ctxStructure, function(){
        ctxStructure.polygone({pos: {x: point.x, y: point.y}, size: size, nb_edges: nbEdges, color: style, rot: rot});
      });
      break;
    case 'alternator':
      strokeOnCanvas(ctxStructure, function(){ctxStructure.rect(point.x - size, point.y - size, size*2, size*2);});
      break;
    case 'director':
      angle += mod.params.director_angle_upd;
      let endPoint = {x: point.x + cos(angle) * size * 2, y: point.y + sin(angle) * size * 2};

      let arrowAngle = 3*PI/4;
      let ptArrow1 = {x: endPoint.x + cos(angle + arrowAngle) * size, y: endPoint.y + sin(angle + arrowAngle) * size};
      let ptArrow2 = {x: endPoint.x + cos(angle - arrowAngle) * size, y: endPoint.y + sin(angle - arrowAngle) * size};

      ctxStructure.line({start: point, end: endPoint});
      ctxStructure.line({start: endPoint, end: ptArrow1});
      ctxStructure.line({start: endPoint, end: ptArrow2});
      break;
    case 'oscillator':
      angle += mod.params.director_angle_upd;
      ctxStructure.line({start: point, end: {x: point.x + size, y: point.y + size}});
      ctxStructure.line({start: {x:point.x + size, y: point.y + size}, end: {x: point.x + size, y: point.y - size}});
      break;
    case 'formulator':
      angle += mod.params.director_angle_upd;
      ctxStructure.line({start: point, end: {x: point.x + size, y: point.y}});
      ctxStructure.line({start: {x:point.x, y: point.y + size}, end: {x: point.x + size, y: point.y + size}});
      break;
    case 'pathor':
      if(mod.glo.stepsModPath && mod.glo.stepsModPath.length){
        mod.glo.stepsModPath.slice(1).forEach(vect => {
          let pointLast = {x: point.x + vect.x, y: point.y + vect.y};
          ctxStructure.line({start: {x:point.x, y: point.y}, end: {x: pointLast.x, y: pointLast.y}});
          point = pointLast;
        });
      }
      else{
        strokeOnCanvas(ctxStructure, function(){ctxStructure.arc(point.x, point.y, size, 0, two_pi, false);});
      }
      break;
  }
  ctxStructure.lineWidth = lineW;
}

//------------------ DRAW A GRID ----------------- //
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

//------------------ DRAW A THIRD GRID ----------------- //
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

//------------------ DRAW A CIRCLE GRID ----------------- //
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

//------------------ DRAW A SPIRAL GRID ----------------- //
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

//------------------ ROTATE A LINE TO RETURNS ROTATED LINES ON PI ----------------- //
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

//------------------ SHOW CIRCLE ----------------- //
function showCircle(cent = activeGlo.simpleMouseDown && activeGlo.showCircle){
  if(!cent){
    cent = !activeGlo.defineCenter ? defineCenter(false) :
    activeGlo.center ? activeGlo.center : canvas.getCenter();
  }
  else{ cent = mouse; }

  let r = structure.height * activeGlo.params.circle_size;

  let sx = activeGlo.params.ellipse_x, sy = activeGlo.params.ellipse_y;

  ctxStructure.strokeStyle = '#cc00cc';
  ctxStructure.beginPath();
  ctxStructure.ellipse(cent.x, cent.y, r*sx, r*sy, 0, two_pi, 0, false);
  ctxStructure.stroke();
}

//------------------ SHOW / HIDE INTERFACE ----------------- //
function showHideInterface(cont = containerInt, toggInt = toggleInt){
  activeGlo.uiDisplay = !activeGlo.uiDisplay;
  ui.style.display    = !activeGlo.uiDisplay ? 'none' : '';

  if(!activeGlo.uiDisplay){ document.getElementsByTagName('body')[0].insertBefore(cont, null); }
  else{ ui.insertBefore(cont, null); }

  cont.style.top      = !activeGlo.uiDisplay ? "0%" : "90%";
  toggInt.textContent = !activeGlo.uiDisplay ? "▼" : "▲";
}

//------------------ SHOW INFOS ----------------- //
function showInfos(){
  let canvasBg = canvas.style.backgroundColor;
  if(canvasBg != ""){
    ctxStructure.fillStyle = fillStyleAccordToBg(canvas, ctxStructure);
  }
  else{
    ctxStructure.fillStyle = "#223351";
  }

  ctxStructure.font = "16px Comic Sans MS";


  function putTxt(txt){ txts.push(txt); pos_y+=esp; }

  let pos_x = 20;
  let pos_y = !activeGlo.uiDisplay ? 30 : 30 + interfaces.find(int => int.clientHeight != 0).clientHeight;
  let esp   = 30;
  let txts  = [];
  let inf;
  putTxt({txt: "Nb avatars in screen : "  + nbAvatarsInScreen() + " / " + avatars.length, pos_y: pos_y});
  putTxt({txt: "Pause                         : "  + (activeGlo.totalBreak ? 'yes' : 'no'), pos_y: pos_y});

  txts.map(txt => ctxStructure.fillText(txt.txt, pos_x, txt.pos_y));
}

function fillStyleAccordToBg(canvasVar, ctxVar){
  ctxVar.fillStyle = objRgb_to_strRgb(updateColorToBack(strRgb_to_objRgb(canvasVar.style.backgroundColor)));
}

//------------------ SHOW MODIFIERS INFOS ----------------- //
function showModsInfos(){
  let canvasBg = canvas.style.backgroundColor;
  if(canvasBg != ""){
    ctxStructure.fillStyle = fillStyleAccordToBg(canvas, ctxStructure);
  }
  else{
    ctxStructure.fillStyle = "#223351";
  }

  ctxStructure.font = "16px Comic Sans MS";


  function putTxt(txt){ txts.push(txt); pos_y+=esp; }

  let pos_x = 20;
  let pos_y = !activeGlo.uiDisplay ? 30 : 30 + interfaces.find(int => int.clientHeight != 0).clientHeight;
  let esp   = 30;
  let txts  = [];

  for(let p in activeGlo.onModsInfo.mod){
    if(typeof activeGlo.onModsInfo.mod[p] != 'object'){ putTxt({txt: p + " : " + activeGlo.onModsInfo.mod[p], pos_y: pos_y}); }
  }

  txts.map(txt => ctxStructure.fillText(txt.txt, pos_x, txt.pos_y));
}

function fillStyleAccordToBg(canvasVar, ctxVar){
  ctxVar.fillStyle = objRgb_to_strRgb(updateColorToBack(strRgb_to_objRgb(canvasVar.style.backgroundColor)));
}

//------------------ SWITCH HYPER ALEA ----------------- //
function switchHyperAlea() {
  if(activeGlo.hyperAlea){ avatars.forEach(av => { av.glo = deepCopy(activeGlo, 'modifiers', 'inputToSlideWithMouse'); }); }
  else{ avatars.forEach(av => { delete av.glo; }); }
}
//------------------ TAILLE ALÉATOIRE DES AVATARS ----------------- //
function alea_size(){
  if(activeGlo.alea_size){
    let lvss = activeGlo.params.level_var_s_size;
    avatars.forEach(avatar => {
      avatar.size = rnd() > 0.9 ? activeGlo.size * getRandomIntInclusive(1,3) * lvss : activeGlo.size * rnd() / lvss;
    });
  }
  else{
    avatars.forEach(avatar => { avatar.size = activeGlo.size; });
  }
}

/**
 * @description Update the max angle from an input by the nb edges param
 * @param {string} idAngle The id input who gives the angle
 * @param {number} nbEdges The nb of edges
 * @returns {void}
 */
function updMaxAngleToNbEdges(idAngle, nbEdges){
  let ctrl = getById(idAngle);
  ctrl.value = 0;
  ctrl.max   = 180 / nbEdges;

  let event = new Event('input', {
    bubbles: true,
    cancelable: true,
  });
  ctrl.dispatchEvent(event);

}

//------------------ SAVE OR RESTORE STATE OF AVATARS ----------------- //
function dealBreakAvatars(){
  if(activeGlo.break){
    avatars.forEach(av => {
      av.vx_break = av.vx;
      av.vy_break = av.vy;
      av.vx = 0;
      av.vy = 0;
    });
  }
  else{
    avatars.forEach(av => {
      av.vx = av.vx_break;
      av.vy = av.vy_break;
    });
  }
}

//------------------ SHOW/HIDE CTRL ----------------- //
function showHideCtrl(ctrl_var){
  [...ctrl_canvas_container.children].forEach(ctrl_canvas => {
    if(ctrl_canvas.id != ctrl_var.id){ ctrl_canvas.style.display   = 'none'; }
  });

  if(ctrl_var.style.display == 'none'){
    ctrl_var.style.position = 'absolute';
    ctrl_var.style.top      = canvas.offsetTop  + 'px';
    ctrl_var.style.left     = canvas.offsetLeft + 'px';
    ctrl_var.style.display  = 'block';
    ctrl_var.style.zIndex   = '5';
  }
  else{
    ctrl_var.style.display = 'none';
  }
}
//------------------ EXPORT JSON ----------------- //
function expt_json(){
  let exp_json = getById('export_json');

	if(objectUrl) { window.URL.revokeObjectURL(objectUrl); }

	var filename = exp_json.value;
	var exportFormat = 'json';
  if (filename.toLowerCase().lastIndexOf("." + exportFormat) !== filename.length - exportFormat.length || filename.length < exportFormat.length + 1){
      filename += "." + exportFormat;
  }

  /*glos.forEach((gl,i) => { gl.backgroundColor = canvasContext[i].canvas.style.backgroundColor; });
  canvasContext.forEach(ct => { delete(ct.saveImage); });
  let meta = {glos: glos, canvasContext: canvasContext};*/

	var strMesh = JSON.stringify(glos);

	var blob = new Blob ( [ strMesh ], { type : "octet/stream" } );
	objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

  //let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(blob);
  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', objectUrl);
  linkElement.setAttribute('download', filename);
  linkElement.click();
}
//------------------ IMPORT JSON ----------------- //
function impt_json(){
  var file_to_read = getById("import_json").files[0];
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var content = e.target.result;
    var contentJsonFiles = JSON.parse(content);

    glos          = [];
    canvasContext = [];

    let cans = [...document.getElementsByClassName('arenaCanvas')];
    while(cans.length){
      cans[cans.length - 1].remove();
      cans = [...document.getElementsByClassName('arenaCanvas')];
    }

    let start = true;
    contentJsonFiles.forEach(contentJsonFile => {
      activeGlo.modifiers = [];
      let glo_save = deepCopy(activeGlo);
      activeGlo = Object.assign({}, activeGlo, contentJsonFile);
      glos.push(activeGlo);
      addCanvas(start, false, true); start = false;
      activeGlo = mergeDeep(activeGlo, glo_save, true);
      let upd_size     = getById('upd_size');
      let upd_size_val = upd_size.value;
      params_interface(false);
      let nb = activeGlo.params.nb;
      deleteAvatar(avatars.length);
      activeGlo.params.nb = nb;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if(activeGlo.backgroundColor){ canvas.style.backgroundColor = activeGlo.backgroundColor; }
      createAvatar();
      upd_size.dataset.last_value = upd_size_val;
      updateSize(upd_size);
      if(activeGlo.modifiers.some(mod => mod.type == 'magnetor' || mod.type == 'mimagnetor' || mod.double)){ activeGlo.magnetors = true; }
      activeGlo.modifiers.forEach(mod => { mod.modify = makeModifierFunction(mod.type); });
    });
  };
  fileread.readAsText(file_to_read);
  activeGlo.import_json = false;
}
//------------------ IMPORT JSON ----------------- //
function impt_image(event){
  //if(!activeGlo.break){ button_check('pause'); }
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var img = new Image();
    img.onload = function(){
      ctx.drawImage(img,0,0);
    };
    img.src = e.target.result;
  };
  fileread.readAsDataURL(event.target.files[0]);
  activeGlo.import_image = false;
  //showHideCtrl(import_image);
}

function flash(){
  localStorage.clear();
  localStorage.setItem('glo', JSON.stringify(activeGlo));
  localStorage.setItem('img', canvas.toDataURL());
}

function unflash(){
  localStorage.clear();
}

function restoreFlash(){
  glos          = [];
  canvasContext = [];

  let cans = [...document.getElementsByClassName('arenaCanvas')];
  while(cans.length){
    cans[cans.length - 1].remove();
    cans = [...document.getElementsByClassName('arenaCanvas')];
  }

  let start = true;
  activeGlo.modifiers = [];
  let glo_save = deepCopy(activeGlo);
  activeGlo = Object.assign({}, activeGlo, JSON.parse(localStorage.getItem('glo')));
  glos.push(activeGlo);
  addCanvas(start, false, true); start = false;
  activeGlo = mergeDeep(activeGlo, glo_save, true);
  let upd_size     = getById('upd_size');
  let upd_size_val = upd_size.value;
  params_interface(false);
  let nb = activeGlo.params.nb;
  deleteAvatar(avatars.length);
  activeGlo.params.nb = nb;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(activeGlo.backgroundColor){ canvas.style.backgroundColor = activeGlo.backgroundColor; }
  createAvatar();
  upd_size.dataset.last_value = upd_size_val;
  updateSize(upd_size);
  if(activeGlo.modifiers.some(mod => mod.type == 'magnetor' || mod.type == 'mimagnetor' || mod.double)){ activeGlo.magnetors = true; }
  activeGlo.modifiers.forEach(mod => { mod.modify = makeModifierFunction(mod.type); });

  var dataURL = localStorage.getItem('img');
  var img     = new Image;
  img.src     = dataURL;
  img.onload  = function () { ctx.drawImage(img, 0, 0); };
}

//------------------ CANVAS PICKER COLOR UPD CANVAS BG----------------- //
function canvas_bg_upd(ctrl){ canvas.style.backgroundColor = ctrl.value; activeGlo.backgroundColor = ctrl.value;}

//------------------ MODS COLOR PICKER COLOR UPD AVATARS & MODS COLOR ----------------- //
function modifiersColor_upd(ctrl) {
  let col = hexToHSL(ctrl.value);
  getSelectedModifiers().forEach(mod => {
    mod.color = col;
    mod.tint  = col.l;
    mod.sat   = col.s;
  });
}

//------------------ CANVAS DOWNLOAD IMAGE ----------------- //
function downloadCanvas(){
  let firstCanvas = canvasContext[0].canvas;
  let canvasToImg = document.createElement('canvas');
  let ctxToImg    = get_ctx(canvasToImg);

  canvasToImg.width  = canvasContext[0].canvas.width;
  canvasToImg.height = canvasContext[0].canvas.height;

  ctxToImg.fillStyle = firstCanvas.style.backgroundColor == '' ? 'white' : firstCanvas.style.backgroundColor;
  ctxToImg.fillRect(0, 0, firstCanvas.width, firstCanvas.height);

  canvasContext.forEach(ctxCan => {
    let can = ctxCan.canvas;

    ctxCan.saveImg = ctxCan.getImageData(0, 0, can.width, can.height);

    ctxCan.globalCompositeOperation = 'destination-over';
    ctxCan.fillStyle = can.style.backgroundColor == '' ? 'white' : can.style.backgroundColor;
    ctxCan.fillRect(0, 0, can.width, can.height);
    ctxCan.putImageData(ctxCan.saveImg, 0, 0);
    ctxToImg.drawImage(can, 0, 0);

    ctxCan.globalCompositeOperation = 'source-over';
    //ctxCan.putImageData(ctxCan.saveImg, 0, 0);
    delete(ctxCan.saveImg);
  });

  let canvas_href = canvasToImg.toDataURL("image/png");

  //canvasContext.forEach(ctxCan => {ctxCan.globalCompositeOperation = 'source-over'; });

  let a = document.createElement('a');

  a.download = "canvas.png";
  a.href = canvas_href;

  a.click();
}

function followAvatar(){
  activeGlo.avsToFollow = [];
  avatars.forEach(av => {
    if(rnd() <= (activeGlo.params.avToFollowTAvs/100)){ activeGlo.avsToFollow.push(av); }
  });
  avatars.forEach(av => {
    if(!activeGlo.avsToFollow.includes(av)){ av.avToFollow = activeGlo.avsToFollow[parseInt(rnd() * activeGlo.avsToFollow.length)]; }
    else{ av.avToFollow = false; }
  });
}

function getRandomPoint(coeff){ return {x: canvas.width * (coeff * rnd() + (1-coeff)/2), y: canvas.height * (coeff * rnd() + (1-coeff)/2)}; }

function getRandomPointInCircle(coeff, byMod = activeGlo.modifiers.length ? activeGlo.randomPointByMod : false, byAv = activeGlo.followAvatar, avToFollow = false){
  let center  = activeGlo.center;
  let minDist = activeGlo.params.rAleaPosMin;

  if(byMod){
    let mod = activeGlo.modifiers[parseInt(rnd() * activeGlo.modifiers.length)];
    center  = {x: mod.x, y: mod.y};
    coeff   = mod.params.rAleaPos;
    minDist = mod.params.rAleaPosMin;
  }

  if(avToFollow){
    center  = {x: avToFollow.x, y: avToFollow.y};
  }

  let r = !avToFollow ? coeff * h(canvas.width, canvas.height) / 2 : coeff * activeGlo.params.avToFollowDist;

  function calculTrigo(lim, it){
    let angle  = rnd() * two_pi;
    let cAngle = cos(angle);
    let sAngle = sin(angle);

    if((abs(cAngle) > lim && abs(sAngle) > lim) || n > it){ return {c: cAngle, s: sAngle}; }

    n++;
    return calculTrigo(lim, it);
  }

  let n   = 0;
  let lim = 0.5;
  let tri = calculTrigo(lim, 2);

  return {x: center.x + ((rnd() * (1 - minDist) + minDist) * r * tri.c), y: center.y + ((rnd() * (1 - minDist) + minDist) * r * tri.s)};
}

//------------------ GARDE LA PAUSE ----------------- //
function keepBreak(func, param = null) {
  var nb    = activeGlo.params.nb;
  var simple_pause = activeGlo.break;
  var total_pause  = activeGlo.totalBreak;
  if(simple_pause){ activeGlo.break = false; }
  if(total_pause) { activeGlo.totalBreak = false; }
  func(param);
  if(simple_pause){ activeGlo.simple_pause_tmp = true; }
  if(total_pause){ activeGlo.total_pause_tmp = true; }

  return false;
}

/**
 * @description Show an interface by num in activeGlo.num_interface
 * @param {number} numInterface The numero of interface
 * @returns {void}
 */
function showInterface(numInterface){
  let interfacesLength = interfaces.length;
  let numTxt           = numInterface + 1;

  //getById('num_interface').textContent = numTxt + "-►";

  for(let i = 0; i < interfacesLength; i++){
    let goInterface = getById('goInterface_' + i);
    if(i == numInterface){
      interfaces[i].style.display = '';
      goInterface.classList.add('active');
    }
    else{
      interfaces[i].style.display = 'none';
      goInterface.classList.remove('active');
    }
  }
}

/**
 * @description Change the interface by increment or decrement
 * @param {string} dir '+' for increment, '-' for decrement
 * @returns {void}
 */
function changeInterface(dir){
  if(dir == '+'){
    if(activeGlo.num_params < interfaces.length - 1){ activeGlo.num_params++; }
    else{ activeGlo.num_params = 0; }
  }
  else if(dir == '-'){
    if(activeGlo.num_params > 0){ activeGlo.num_params--; }
    else{ activeGlo.num_params = interfaces.length - 1; }
  }
  showInterface(activeGlo.num_params);
}

function deleteAvatarsProp(prop){
  let i = 0;
  for(; i < avatars.length; i++){ delete avatars[i][prop]; }
}

function razRotDone(val){
  if(val == 0){
    avatars.forEach(av => {
      av.numsMod = [];
    });
  }
}

function replaceAvOnEllipse(ctrl){
  let last_val = parseFloat(ctrl.last_vals[ctrl.last_vals.length - 1] * rad);
  let val      = parseFloat(ctrl.value * rad);

  let angle = val - last_val;

  avatars.forEach(av => {
    let cent = av.center ? av.center : canvas.getCenter();
    let pt = av.rotateCalc(angle, cent, {x:1,y:1}, 1);

    delete av.firstRotDone;

    av.x = pt.x;
    av.y = pt.y;
  });
}

function testOnMouse(){
  testIsBlank();
  //testColor();
  //testAngle();
  //testAv();
  //testSumHsl();
}

function testIsBlank(){
  let imgData = ctx.getImageData(mouse.x, mouse.y, canvas.width, canvas.height);

  let index = (round(mouse.x, 0) + round(mouse.y, 0) * canvas.width) * 4;

  if(imgData.data[index+3]){
    ctx.beginPath();
    //ctx.moveTo(mouse.x, mouse.y);
    ctx.arc(mouse.x, mouse.y, 10, 0, two_pi);
    ctx.fillStyle = '#cc0000';
    ctx.strokeStyle = '#880000';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }

  msg("Mouse x : " + mouse.x, "Mouse y : " + mouse.y, "Index : " + index, "Data index 0 : " + imgData.data[index], "Data index 1 : " + imgData.data[index+1],
  "Data index 2 : " + imgData.data[index+2],
  "Data index 3 : " + imgData.data[index+3]);
}

function testSumHsl(cs  = [{h: 220, s: 77, l: 42, a: 1}, {h: 350, s: 77, l: 42, a: 1},]){
  let cSum = hslaSum(...cs);

  cs.forEach((c,i) => {
    ctx.fillStyle = 'hsla(' + c.h + ', ' + c.s + '%, ' + c.l + '%, ' + c.a +')';
    ctx.beginPath();
    ctx.arc(300 + i*100, 300, 50, 0, two_pi);
    ctx.fill();
  });

  ctx.fillStyle = 'hsla(' + cSum.h + ', ' + cSum.s + '%, ' + cSum.l + '%, ' + cSum.a +')';
  ctx.beginPath();
  ctx.arc(300, 400, 50, 0, two_pi);
  ctx.fill();
}

function testAv(){
  let av = avatars[0];
  let diff = av.direction - av.dirSecMove;
  msg(
    'Direction  : ' + av.direction,
    'Dir second : ' + av.dirSecMove,
    'Dir - sec  : ' + diff,
  );
}

function testAngle(){
  let dx = mouse.x - canvas.width/2;
  let dy = mouse.y - canvas.height/2;

  msg('Angle : ' + atan2piZ(dx, dy));
}

function testColor(){
  let data = ctx.getImageData(mouse.x,mouse.y,1,1).data;

  msg('Color : ' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3]);
}


//------------------ REGEX POUR FORMULATORS ----------------- //
function reg(f){
	for(var prop in f){
  	f[prop] = f[prop].toString();
  	f[prop] = f[prop].replace(/\s/g,"");
  	f[prop] = f[prop].replace(/cxdy|cydx/g,"cos(x/y)");
  	f[prop] = f[prop].replace(/cxfy|cyfx/g,"cos(xy)");
  	f[prop] = f[prop].replace(/sxdy|sydx/g,"sin(x/y)");
  	f[prop] = f[prop].replace(/sxfy|syfx/g,"sin(x*y)");
  	f[prop] = f[prop].replace(/cxpy|cypx/g,"cos(x+y)");
  	f[prop] = f[prop].replace(/cxmy/g,"cos(x-y)");
  	f[prop] = f[prop].replace(/cymx/g,"cos(y-x)");
  	f[prop] = f[prop].replace(/sxpy|sypx/g,"sin(x+y)");
  	f[prop] = f[prop].replace(/sxmy/g,"sin(x-y)");
  	f[prop] = f[prop].replace(/symx/g,"sin(y-x)");
  	f[prop] = f[prop].replace(/cx/g,"cos(x)");
  	f[prop] = f[prop].replace(/cy/g,"cos(y)");
  	f[prop] = f[prop].replace(/sx/g,"sin(x)");
  	f[prop] = f[prop].replace(/sy/g,"sin(y)");
  	f[prop] = f[prop].replace(/²/g,"**2");
  	f[prop] = f[prop].replace(/xx([^,%*+-/)])/g, 'xx*$1');
  	f[prop] = f[prop].replace(/yy([^,%*+-/)])/g, 'yy*$1');
  	f[prop] = f[prop].replace(/x([^,%*+-/)])/g, 'x*$1');
  	f[prop] = f[prop].replace(/y([^,%*+-/)])/g, 'y*$1');
  	f[prop] = f[prop].replace(/x([^,%*+-/NP)])/g, 'x*$1');
  	f[prop] = f[prop].replace(/y([^,%*+-/NP)])/g, 'y*$1');
  	f[prop] = f[prop].replace(/PI([^,%*+-/)])/g, 'PI*$1');

  	f[prop] = f[prop].replace(/\)([^,%*+-/)'])/g, ')*$1');
  	f[prop] = f[prop].replace(/(\d+)([^,%*+-/.\d)])/g, '$1*$2');

  	f[prop] = f[prop].replace(/x\*_mod/g,"x_mod");
  	f[prop] = f[prop].replace(/y\*_mod/g,"y_mod");
  	f[prop] = f[prop].replace(/sin\*/g,"sin");
  	f[prop] = f[prop].replace(/tan\*/g,"tan");
  	f[prop] = f[prop].replace(/sign\*/g,"sign");
  	f[prop] = f[prop].replace(/logten\*/g,"logten");
  	f[prop] = f[prop].replace(/hy\*pot/g,"hypot");
  }
}


async function importWasm(path){
  const res      = await fetch(path);
  const rawBytes = await res.arrayBuffer();
  const module   = await WebAssembly.compile(rawBytes);

  return new WebAssembly.Instance(module);
}

async function init(path){
  const calcInstance = await importWasm(path);
  calculator = {add: null};
  calculator.add = calcInstance.exports._Z6cosSinf;
}

function inputToLinked(){
  return inputFlownByMouse(input => {
    if(typeof input.dataset.toLinked === 'undefined'){
      input.dataset.toLinked           = 'true';
      activeGlo.inputToLinked          = input.id;
      activeGlo.linkedInputs[input.id] = 'toLinked';
      addClasses(input, 'toLinked');
      drawCharOnInput(input,  getRndChar(4449, 4649), 'charToLinked');
    }
    else{
      input.dataset.toLinked           = input.dataset.toLinked === 'false' ? 'true' : 'false';
      activeGlo.inputToLinked          = input.dataset.toLinked === 'true';
      activeGlo.linkedInputs[input.id] = input.dataset.toLinked === 'true';
      if(activeGlo.inputToLinked){
        addClasses(input, 'toLinked');
        activeGlo.linkedInputs[input.id] = 'toLinked';
        drawCharOnInput(input,  getRndChar(4449, 4649), 'charToLinked');
      }
      else{
        removeClasses(input, 'toLinked');
        delete activeGlo.linkedInputs[input.id];
        clearCharOnInput(input, 'charToLinked');
      }
    }
  });
}
function inputToLinkedTo(positive = true){
  return inputFlownByMouse((input, positive) => {
    let sign = positive ? 'positive' : 'negative';
    if(activeGlo.inputToLinked){
      let toLinked = activeGlo.linkedInputs[activeGlo.inputToLinked];
      if(toLinked === 'toLinked'){
        addClasses(input, 'linkedTo', sign);
        activeGlo.linkedInputs[activeGlo.inputToLinked] = input.id;
        let char = getById(activeGlo.inputToLinked + '_charToLinked').textContent;
        drawCharOnInput(input,  char, 'charLinkedTo');
      }
      else{
        removeClasses(input, 'linkedTo', 'positive', 'negative');
        activeGlo.linkedInputs[activeGlo.inputToLinked] = 'toLinked';
        clearCharOnInput(input, 'charLinkedTo');
      }
    }
  }, positive);
}
function inputToSlideWithMouse(){
  return inputFlownByMouse(input => {
    if(activeGlo.inputToSlideWithMouse){ removeClasses(activeGlo.inputToSlideWithMouse, 'toSlideWithMouse'); }
    if(input !== activeGlo.inputToSlideWithMouse){
      activeGlo.inputToSlideWithMouse = input;
      addClasses(input, 'toSlideWithMouse');
    }
    else{
      activeGlo.inputToSlideWithMouse = false;
    }
  });
}

function inputFlownByMouse(func, ...args){
  let inputsSz = input_params.length;
  for(let i = 0; i < inputsSz; i++){
    let input = input_params[i];
    if(input.dataset.focus && input.dataset.focus == 'true'){
      func(input, ...args);

      return true;
    }
  }
  return false;
}

function clearCharOnInput(ctrl, endId){
  getById(ctrl.id + '_' + endId).remove();
}

function scaleCanvas(scale, ctxVars = [ctx, ctxStructure]){
  ctxVars.forEach(ctxVar => {
    ctxVar.scale(scale, scale);
    let sc = scale > 1 ? -1/(scale*2) : scale;
    ctxVar.translate(canvas.width * sc, canvas.height * sc);
  });
}

function rotateCanvas(angle, ctxVars = [ctx, ctxStructure]){
  ctxVars.forEach(ctxVar => {
    ctxVar.translate(canvas.width / 2,canvas.height / 2);
    ctxVar.rotate(angle);
    ctxVar.translate(-canvas.width / 2, -canvas.height / 2);
  });
}

function tiltCanvas(axe, angle, ctxVars = [ctx, ctxStructure]){
  ctxVars.forEach(ctxVar => {
    axe === 'h' ? ctxVar.transform(1, angle, 0, 1, 0, 0): ctxVar.transform(1, 0, angle, 1, 0, 0);;
  });
}

function nbAvatarsInScreen(){
  let nb = 0;
  avatars.forEach(av => {
    if(av.x <= canvas.width && av.x >= 0 && av.y <= canvas.height && av.y >= 0){ nb++; }
  });
  return nb;
}

function posModsOnMods(){
  getSelectedModifiers().forEach(mod => {
    let newMod     = deepCopy(mod, 'modifiers');
    newMod.type    = activeGlo.pos_modifiers;
    newMod.nbEdges = activeGlo.params.posModsNbEdges;
    newMod.modify  = makeModifierFunction(newMod.type);

    activeGlo.modifiers.push(newMod);
  });
}

function isInHelpTuchs(){
  let frees = {alt: [], ctrl: [], simple: []};

  let tuchLetters = tuchs.filter(t => !t.ctrl && !t.alt) ;
  let tuchCtrls   = tuchs.filter(t => t.ctrl);
  let tuchAlts    = tuchs.filter(t => t.alt);

  for(let i = 33; i < 123; i++){
    let char = String.fromCharCode(i);

    let charInTuchLetters = tuchLetters.find(t => t.tuch === char);
    let charInTuchCtrls   = tuchCtrls.find(t => t.tuch.slice(-1) === char);
    let charInTuchAlts    = tuchAlts.find(t => t.tuch.slice(-1) === char);

    if(!charInTuchLetters){ frees.simple.push({alt: false, ctrl: false, tuch: char, charCode: i}); }
    if(!charInTuchCtrls){ frees.ctrl.push({alt: false, ctrl: true, tuch: char, charCode: i}); }
    if(!charInTuchAlts){ frees.alt.push({alt: true, ctrl: false, tuch: char, charCode: i}); }
  }

  let notInfrees = [35, 43, 45, 64, 91, 92, 93, 94, 95, 96];

  frees.alt    = frees.alt.filter(t => t.tuch.toLowerCase() === t.tuch && !notInfrees.some(n => n === t.charCode));
  frees.ctrl   = frees.ctrl.filter(t => t.tuch.toLowerCase() === t.tuch && !notInfrees.some(n => n === t.charCode));
  frees.simple = frees.simple.filter(t => !notInfrees.some(n => n === t.charCode));

  return frees;
}

function makeDialog(options = {style: {width: '50%', height: '50%'}, }, content, closeOrRemove = 'remove'){
  let dialogContainer = getById('dialogContainer');

  let dialog = document.createElement("dialog");

  for (let prop in options.style){
    dialog.style[prop] = options.style[prop];
  }

  dialog.id = options.id ? options.id : '';

  dialog.style.position     = 'absolute';
  dialog.style.border       = 'none';
  dialog.style.borderRadius = '5px';
  dialog.style.overflowX    = 'hidden';

  content = "<div class='dialogContentContainer' onclick='event.stopPropagation(); '>" + content + "</div>";

  dialog.addEventListener('click', (e) => {
    closeOrRemove === 'remove' ? dialog.remove() : dialog.close();
  });

  dialog.innerHTML = content;
  dialogContainer.appendChild(dialog);

  return dialog;
}

function makeFreeTuchsDialog(){
  let freeTuchs = isInHelpTuchs();

  let content   = "<h1 style='text-align: center; '>Touches libres pour les évènements</h1>";
  content      += "<h3 class='helpTitle'>Caractères uniques</h3>";
  content      += "<div style='display: grid; grid-template-columns: repeat(4, 1fr); '>";
  content      += "<div>";
  content      += "<h4>Lettres minuscules</h4>";
  content      += "<div id='unikMinLetterContainer'></div>";
  content      += "</div>";
  content      += "<div>";
  content      += "<h4>Lettres majuscules</h4>";
  content      += "<div id='unikMajLetterContainer'></div>";
  content      += "</div>";
  content      += "<div>";
  content      += "<h4>Chiffres</h4>";
  content      += "<div id='unikNumbersContainer'></div>";
  content      += "</div>";
  content      += "<div>";
  content      += "<h4>Caractères spéciaux</h4>";
  content      += "<div id='unikSpecialContainer'></div>";
  content      += "</div>";
  content      += "</div>";

  content      += "<hr class='hrHelp'>";

  content      += "<h3 class='helpTitle'>Touche control + caractère</h3>";
  content      += "<div style='display: grid; grid-template-columns: repeat(3, 1fr); '>";
  content      += "<div>";
  content      += "<h4>Lettres minuscules</h4>";
  content      += "<div id='controlMinLetterContainer'></div>";
  content      += "</div>";
  content      += "<div>";
  content      += "<h4>Chiffres</h4>";
  content      += "<div id='controlNumbersContainer'></div>";
  content      += "</div>";
  content      += "<div>";
  content      += "<h4>Caractères spéciaux</h4>";
  content      += "<div id='controlSpecialContainer'></div>";
  content      += "</div>";
  content      += "</div>";

  content      += "<hr class='hrHelp'>";

  content      += "<h3 class='helpTitle'>Touche alt + caractère</h3>";
  content      += "<div style='display: grid; grid-template-columns: repeat(3, 1fr); '>";
  content      += "<div>";
  content      += "<h4>Lettres minuscules</h4>";
  content      += "<div id='altMinLetterContainer'></div>";
  content      += "</div>";
  content      += "<div>";
  content      += "<h4>Chiffres</h4>";
  content      += "<div id='altNumbersContainer'></div>";
  content      += "</div>";
  content      += "<div>";
  content      += "<h4>Caractères spéciaux</h4>";
  content      += "<div id='altSpecialContainer'></div>";
  content      += "</div>";
  content      += "</div>";

  let freeTuchsDialog = makeDialog(options = {style: {width: '66%', height: '66%'}, id: 'freeTuchsDialog'}, content);

  let freeTuchsOneLetterMIN   = freeTuchs.simple.filter(t => t.tuch.match(/[a-z]/));
  let freeTuchsOneLetterMAJ   = freeTuchs.simple.filter(t => t.tuch.match(/[A-Z]/));
  let freeTuchsOneNumber      = freeTuchs.simple.filter(t => t.tuch.match(/[0-9]/));
  let freeTuchsOneSpecialChar = freeTuchs.simple.filter(t => t.charCode > 32 && t.charCode < 48);

  let freeTuchsCtrlLetterMIN   = freeTuchs.ctrl.filter(t => t.tuch.match(/[a-z]/));
  let freeTuchsCtrlNumber      = freeTuchs.ctrl.filter(t => t.tuch.match(/[0-9]/));
  let freeTuchsCtrlSpecialChar = freeTuchs.ctrl.filter(t => t.charCode > 32 && t.charCode < 48);

  let freeTuchsAltLetterMIN   = freeTuchs.alt.filter(t => t.tuch.match(/[a-z]/));
  let freeTuchsAltNumber      = freeTuchs.alt.filter(t => t.tuch.match(/[0-9]/));
  let freeTuchsAltSpecialChar = freeTuchs.alt.filter(t => t.charCode > 32 && t.charCode < 48);

  makeKbdTuch(freeTuchsOneLetterMIN, 'unikMinLetterContainer');
  makeKbdTuch(freeTuchsOneLetterMAJ, 'unikMajLetterContainer');
  makeKbdTuch(freeTuchsOneNumber, 'unikNumbersContainer');
  makeKbdTuch(freeTuchsOneSpecialChar, 'unikSpecialContainer');

  makeKbdTuch(freeTuchsCtrlLetterMIN, 'controlMinLetterContainer');
  makeKbdTuch(freeTuchsCtrlNumber, 'controlNumbersContainer');
  makeKbdTuch(freeTuchsCtrlSpecialChar, 'controlSpecialContainer');

  makeKbdTuch(freeTuchsAltLetterMIN, 'altMinLetterContainer');
  makeKbdTuch(freeTuchsAltNumber, 'altNumbersContainer');
  makeKbdTuch(freeTuchsAltSpecialChar, 'altSpecialContainer');

  function makeKbdTuch(varTuchs, idTuchContainer){
    varTuchs.forEach(t => {
      let kbdTuch = document.createElement("kbd");

      kbdTuch.className = 'keys';
      kbdTuch.style.margin = '5px';

      let txtTuch = document.createTextNode(t.tuch);
      kbdTuch.appendChild(txtTuch);

      getById(idTuchContainer).appendChild(kbdTuch);
    });
  }
  return freeTuchsDialog;
}

function makeInfosDialog(isSorted = false, newDir = 'none'){
  let infsModifiers = infosModifiers(isSorted, newDir);

  let limNbProps = 20;
  infsModifiers.propsInMods = infsModifiers.propsInMods.slice(0, limNbProps);
  infsModifiers.infosMods.forEach((_infModifier, i) => { infsModifiers.infosMods[i] = infsModifiers.infosMods[i].slice(0, limNbProps); });

  let content   = "<h1 style='text-align: center; '>Infos sur les modifiers</h1>";
  content      += "<table style='width: 100%; border-collapse: collapse; '>";
  content      += "<thead style='border-bottom: 1px #ccc solid; '>";
  content      += "<tr>";
  infsModifiers.propsInMods.forEach(propInMod => { content += `<th class="thHelpInfo sort_${isSorted === propInMod ? newDir : 'none' }" ${isSorted === propInMod ? "data-sortdir='" + newDir + "' " : "data-sortdir='none' " } onclick="makeInfosDialog(this.textContent, this.dataset.sortdir !== 'none' && this.dataset.sortdir === 'asc' ? 'desc' : 'asc'); ">${propInMod}</th>`; });
  content      += "</tr>";
  content      += "</thead>";
  content      += "<tbody style='text-align: center; '>";
  infsModifiers.infosMods.forEach(infModifier => {
    content += "<tr onclick='trSelect(this); ' onmouseenter=\"addClasses(this, 'flyOnTr'); \" onmouseleave=\"removeClasses(this, 'flyOnTr'); \">";
    infModifier.forEach( infMod => {
      let val = typeof infMod.val === 'number' ? round(infMod.val, 2) : infMod.val;
      content += `<td>${val}</td>`;
    });
    content += "</tr>";
  });
  content      += "</tbody>";
  content      += "</table>";

  if(!isSorted){
    let infosDialog = makeDialog(options = {style: {width: '95%', height: '77%'}, id: 'infosDialog'}, content);
    return infosDialog;
  }

  content = "<div class='dialogContentContainer' onclick='event.stopPropagation(); '>" + content + "</div>";
  getById('infosDialog').innerHTML = content;
  return content;
}

function makeInfosAvatarsDialog(isSorted = false, newDir = 'none', isJustForContent = isSorted){
  let infsAvatars = infosAvatars(isSorted, newDir);

  let limNbProps = 18;
  infsAvatars.propsInAvs = infsAvatars.propsInAvs.slice(0, limNbProps);
  infsAvatars.infosAvs.forEach((_infAvatar, i) => { infsAvatars.infosAvs[i] = infsAvatars.infosAvs[i].slice(0, limNbProps); });

  let content   = "<h1 style='text-align: center; '>";
  content      += "<button type='button' class='helpMajButton' onclick=\"makeInfosAvatarsDialog(false, 'none', true); \">↺</button>Infos sur les avatars</h1>";
  content      += "<table style='width: 100%; border-collapse: collapse; '>";
  content      += "<thead style='border-bottom: 1px #ccc solid; '>";
  content      += "<tr>";
  infsAvatars.propsInAvs.forEach(propInAv => { content += `<th class="thHelpInfo sort_${isSorted === propInAv ? newDir : 'none' }" ${isSorted === propInAv ? "data-sortdir='" + newDir + "' " : "data-sortdir='none' " } onclick="makeInfosAvatarsDialog(this.textContent, this.dataset.sortdir !== 'none' && this.dataset.sortdir === 'asc' ? 'desc' : 'asc'); ">${propInAv}</th>`; });
  content      += "</tr>";
  content      += "</thead>";
  content      += "<tbody style='text-align: center; '>";
  infsAvatars.infosAvs.forEach(infAvatar => {
    content += "<tr class='" + selectClassAvatarToInfos(infAvatar[0].val) + "' onclick='trSelect(this); selectAvatarToInfos(this, " + infAvatar[0].val + "); ' onmouseenter=\"addClasses(this, 'flyOnTr'); \" onmouseleave=\"removeClasses(this, 'flyOnTr'); \">";
    infAvatar.forEach( infAv => {
      let val    = typeof infAv.val === 'number' ? round(infAv.val, 2) : infAv.val;
      let fill   = '';
      let stroke = '';
      if(infAv.prop === 'fillStyle'){ fill = ` <div style="background-color: ${val}; width: 10px; height: 10px; margin-top: 5px; display: inline-block; "></div>`; }
      else if(infAv.prop === 'strokeStyle'){ stroke = ` <div style="border: 1px ${val} solid; width: 10px; height: 10px; margin-top: 5px; display: inline-block; "></div>`; }
      content += `<td>${stroke || fill ? "<div style='display: grid; grid-template-columns: 200px 100%; '>" : ''}<div>${val}</div>${fill}${stroke}${stroke || fill ? "</div>" : ''}</td>`;
    });
    content += "<tr>";
  });
  content      += "</tbody>";
  content      += "</table>";

  if(!isSorted && !isJustForContent){
    let infosDialog = makeDialog(options = {style: {width: '95%', height: '77%'}, id: 'infosAvatarsDialog'}, content);
    return infosDialog;
  }

  content = "<div class='dialogContentContainer' onclick='event.stopPropagation(); '>" + content + "</div>";
  getById('infosAvatarsDialog').innerHTML = content;
  return content;
}

function selectAvatarToInfos(tr, numAv){
  avatars[numAv].infoSelect = tr.classList.contains('trSelect'); 
}

function selectClassAvatarToInfos(numAv){
  return avatars[numAv].infoSelect ? 'trSelect' : ''; 
}

function trSelect(tr){
  !tr.classList.contains('trSelect') ? addClasses(tr, 'trSelect') : removeClasses(tr, 'trSelect');
}

function infosArr(obj, propsInObj = false){
  if(obj){
    let props = [];
    for(let prop in obj){
      if(typeof obj[prop] !== 'object' && typeof obj[prop] !== 'function'){
        if(!propsInObj || propsInObj.includes(prop)){ props.push({prop: prop, val: obj[prop]}); }
      }
    }
    return props;
  }
  return [];
}

function infosModifiers(isSorted = false, dir = 'asc'){
  let infosMods = [];
  let propsInMods = infosArr(activeGlo.modifiers[0]).map(p => p.prop);

  if(propsInMods){
    activeGlo.modifiers.forEach(mod => { infosMods.push(infosArr(mod, propsInMods)); });
    if(isSorted){ sortInfosArray(infosMods, isSorted, dir); }
    return {infosMods, propsInMods};
  }
  return false;
}

function infosAvatars(isSorted = false, dir = 'asc'){
  let infosAvs = [];
  let propsInAvs = infosArr(avatars[0]).map(p => p.prop);

  if(propsInAvs){
    avatars.forEach(av => { infosAvs.push(infosArr(av, propsInAvs)); });
    if(isSorted){ sortInfosArray(infosAvs, isSorted, dir); }
    return {infosAvs, propsInAvs};
  }
  return false;
}

function sortInfosArray(infosMods, prop, dir = 'asc'){
  let numProp = 0;
  for(let i = 0; i < infosMods[0].length; i++){
    if(infosMods[0][i].prop === prop){ numProp = i; break; }
  }
  return dir === 'asc' ?
                       infosMods.sort((arr1, arr2) => arr1[numProp].val - arr2[numProp].val) :
                       infosMods.sort((arr1, arr2) => arr2[numProp].val - arr1[numProp].val); 
}















//END
