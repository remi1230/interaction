// *********************** MOVE ALEA IN CURVE, ORIENTED ELLIPSE, SHOW THIRD MARKS INFOS (CAN PUT ON GRIDS), DEAL WITH RANDOM MODE, *********************** //
// *********************** ANGLE POS & UPD MIMAGNETOR, REGEX FORMULE *********************** //
// *********************** RND SAT & LIGHT IN ONE COL MOD RND *********************** //
// *********************** CURVE NOT OUT *********************** //
// *********************** POS POLY MOD : INV ATT ************** //
// *********************** COLORS & OTHERS PARAMS IN MODS ************** //
// *********************** ORIENTED ELLIPSES IN MODS ************** //

(function() {
  allCanvas.forEach(canvas => { fix_dpi(canvas); });
  dataCanvas = new Uint8Array(canvas.width * canvas.height);
})();

var startWidth   = canvas.width;
var startHeight  = canvas.height;
var get_ctx      = function(varCanvas){ return varCanvas.getContext('2d'); };
var ctx          = get_ctx(canvas);
var ctxStructure = get_ctx(structure);

giveFuncToCanvas(canvas, ctx);
giveFuncToCanvas(structure, ctxStructure);

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
    varCtx.moveTo(x1, y1);
    varCtx.lineTo(x2, y2);
  };
  //------------------ DRAW A LINE BETWEEN TWO POINTS ON CANVAS ----------------- //
  varCtx.line = function(ln){
    varCtx.beginPath();
    varCtx.ln(ln.start.x, ln.start.y, ln.end.x, ln.end.y);
    varCtx.stroke();
  };
  //------------------ DRAW A CROSS ON CANVAS ----------------- //
  varCtx.cross = function(point, size){
    varCtx.ln(point.x, point.y - size, point.x, point.y + size);
    varCtx.ln(point.x + size, point.y, point.x - size, point.y);
  };
  //------------------ DRAW A DIAG CROSS ON CANVAS ----------------- //
  varCtx.crossDiag = function(point, size){
    varCtx.moveTo(point.x - size, point.y - size);
    varCtx.lineTo(point.x + size, point.y + size);
    varCtx.moveTo(point.x + size, point.y - size);
    varCtx.lineTo(point.x - size, point.y + size);
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

    varCtx.moveTo(points[0].x, points[0].y);
    varCtx.lineTo(points[1].x, points[1].y);
    varCtx.moveTo(points[2].x, points[2].y);
    varCtx.lineTo(points[3].x, points[3].y);
  };
  //------------------ DRAW MULTI ARC ON CANVAS ----------------- //
  varCtx.arcMulti = function(point, size, nb){
    for(let i = 1; i <= nb; i++){
      varCtx.arc(point.x, point.y, size * i / nb, 0, two_pi, false);
      varCtx.stroke();
      varCtx.beginPath();
    }
  };
  //------------------ DRAW ELLIPSE ON CANVAS ----------------- //
  varCtx.spiral = function(pos, r, dim){
    var nb = floor(r/dim - 1);

    var angle = half_pi;
    var turn  = ceil(two_pi / angle);

    for(let i = 0; i < nb; i++){
      var less = i * dim;
      varCtx.beginPath();
      varCtx.ellipse(pos.x, pos.y, r - less, r - less, 0, 0, angle, false);
      varCtx.stroke();
      for(let j = 1; j < turn; j++){
        var add = j*angle;
        varCtx.beginPath();
        varCtx.ellipse(pos.x, pos.y, r - dim - less, r - less, 0, add, angle + add, false);
        varCtx.stroke();
      }
    }
  };
  //------------------ DÉSSINER UN POLYGONE ----------------- //
  varCtx.polygone = function(opt, star = glo.starPoly){
    if(opt.nb_edges < 5){ star = false; }

    let nb_edges = opt.nb_edges;
    let nbRots   = !star ? 1 : Math.floor((nb_edges+1)/2) - 1;
    let pos      = opt.pos;

    let point = {x: pos.x, y: pos.y - opt.size};

    if(opt.rot || opt.rot == 0){ point = rotate(point, pos, opt.rot); }
    else if(glo.params.rotPoly_angle != 0){
      glo.rotPoly_angle += glo.params.rotPoly_angle/100;
      point = rotate(point, pos, glo.rotPoly_angle);
    }

    varCtx.strokeStyle = opt.color;
    varCtx.moveTo(point.x, point.y);

    let oneMore = false;
    for(var i = 0; i < nb_edges; i++){
      if(star && nb_edges % 2 == 0 && nb_edges % 4 != 0 && i == 1 + nb_edges/2){
        oneMore = true;
        point = rotate(point, pos, two_pi/nb_edges);
        varCtx.moveTo(point.x, point.y);
      }
      point = rotate(point, pos, nbRots * two_pi/nb_edges);
      varCtx.lineTo(point.x, point.y);
    }

    if(oneMore){
      point = rotate(point, pos, nbRots * two_pi/nb_edges);
      varCtx.lineTo(point.x, point.y);
    }
  };
  //------------------ DÉSSINER UNE ÉTOILE ----------------- //
  varCtx.star = function(opt){
    let nb_edges = opt.nb_edges;
    let nbRots   = Math.floor((nb_edges+1)/2) - 1;
    let pos      = opt.pos;

    let point = {x: pos.x, y: pos.y - opt.size};

    if(opt.rot || opt.rot == 0){ point = rotate(point, pos, opt.rot); }
    else if(glo.params.rotPoly_angle != 0){
      glo.rotPoly_angle += glo.params.rotPoly_angle/100;
      point = rotate(point, pos, glo.rotPoly_angle);
    }

    varCtx.strokeStyle = opt.color;
    varCtx.moveTo(point.x, point.y);

    for(var i = 0; i < nb_edges; i++){
      oneMore = false;
      if(nb_edges % 2 == 0 && nb_edges % 4 != 0 && i == 1 + nb_edges/2){
        oneMore = true;
        point = rotate(point, pos, two_pi/nb_edges);
        varCtx.moveTo(point.x, point.y);
      }

      point = rotate(point, pos, nbRots*two_pi/nb_edges);
      varCtx.lineTo(point.x, point.y);

      if(oneMore){
        point = rotate(point, pos, nbRots * two_pi/nb_edges);
        varCtx.lineTo(point.x, point.y);
      }
    }
  };
  //------------------ DÉSSINER UN NUAGE DE POINTS ----------------- //
  varCtx.cloud = function(opt){
    let pos = opt.pos;
    let siz = opt.size;
    let nbp = opt.nb_points;
    let szp = opt.sz_point;

    varCtx.strokeStyle = opt.color;

    if(!opt.withLine){
      for(let i = 0; i < nbp; i++){
        let pt_angle     = rnd() * two_pi;
        let pt_x = pos.x + rnd() * siz * Math.cos(pt_angle);
        let pt_y = pos.y + rnd() * siz * Math.sin(pt_angle);

        varCtx.moveTo(pt_x, pt_y);
        varCtx.arc(pt_x, pt_y, szp, 0, two_pi, false);
      }
    }
    else{
      for(let i = 0; i < nbp; i++){
        let pt_angle     = rnd() * two_pi;
        let pt_x = pos.x + rnd() * siz * Math.cos(pt_angle);
        let pt_y = pos.y + rnd() * siz * Math.sin(pt_angle);

        varCtx.moveTo(pos.x, pos.y);
        varCtx.arc(pt_x, pt_y, szp, 0, two_pi, false);
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

    if(glo.params.rotPoly_angle != 0){
      glo.rotPoly_angle += glo.params.rotPoly_angle/100;
      point = rotate(point, pos, glo.rotPoly_angle);
    }

    varCtx.strokeStyle = opt.color;
    varCtx.moveTo(point.x, point.y);

    for(var i = 0; i < nb_edges; i++){
      point = rotate(point, pos, two_pi/(nb_edges*rnd()));
      varCtx.lineTo(point.x, point.y);
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

    varCtx.moveTo(startPt.x, startPt.y);
    varCtx.bezierCurveTo(firstAnchor.x, firstAnchor.y, lastAnchor.x, lastAnchor.y, endPt.x, endPt.y);
  };
  //------------------ RETURN TRUE IF PIXEL AT POS IS BLANK, ELSE FASE ----------------- //
  varCtx.isBlank = function(pos, data = dataCanvas){
    return !data[round(pos.y,0) * canvas.width + round(pos.x,0)];
  };

  varCtx.font = "30px Comic Sans MS";
}

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
function params_interface(onLoad = true){
  Object.entries(glo.params).forEach(([key, val]) => { param_ctrl(val, key, onLoad); });
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

      if(ctrl.classList.contains('radUnit')){ glo.params[id_ctrl] *= rad; }
    }
    if(!noLabel){ updLabel(ctrl); }
  }
}
function updLabel(input){
  let label = document.querySelector('[for="' + input.id + '"]');
  let txt = !input.dataset.labels ? input.value : glo[input.dataset.labels][input.value];
  label.textContent = input.dataset.label + " : " + txt;
  input.title = txt;
}
//------------------ CRÉATION D'AVATARS ----------------- //
function createAvatar(options = {}){
  crossPoints = [];
  let nb = typeof(options.nb) == 'undefined' ? glo.params.nb  : options.nb;
  let w  = typeof(options.w)  == 'undefined' ? glo.size : options.w;

  let areneWidth  = canvas.width - glo.size;
  let areneHeight = canvas.height - glo.size;

  let center = canvas.getCenter();

  let form = 'no', form_size, form_size_x, form_size_y;
  if(typeof(options.form) != 'undefined'){
    form  = typeof(options.form.name)  == 'undefined' ? 'square' : options.form.name;
    form_size    = typeof(options.form.size)    == 'undefined' ? areneWidth/2 : options.form.size;
    form_size_x  = typeof(options.form.size_x)  == 'undefined' ? areneWidth   : options.form.size_x;
    form_size_y  = typeof(options.form.size_y)  == 'undefined' ? areneHeight  : options.form.size_y;
  }

  let dep_dir = glo.params.dep_dir;

  if(typeof(avatars) == 'undefined'){ avatars = []; }

  let r = canvas.height * glo.params.circle_size * 2;
  let nb_avatars, newAvatar, step, x, y, nb_circles, cent;

  if(!glo.center){ cent = options.center ? options.center : center; }
  else{ cent = glo.center; }
  switch (form) {
    case 'no':
      let sz = glo.params.rAleaPos;
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
      let k      = glo.params.ellipse_x / glo.params.ellipse_y;
      let spiral = glo.params.spiralAv;
      r          = canvas.height * glo.params.circle_size;
      nb_circles = glo.params.nb_circles;
      step       = parseFloat(two_pi / (nb / nb_circles));

      circles({center: cent, nb_circles: nb_circles, r: r, step: step, ellipse: k, spiral: spiral,
        func: function(pt){
          posAvatar(pt.x, pt.y, w, cent);
        }
      });
      break;
    case 'poly':
      step       = parseFloat(two_pi / nb);
      nb_circles = glo.params.nb_circles;

      let nbEdges = glo.params.polyAvNbEdges;
      r = canvas.height * glo.params.circle_size;

      if(!glo.starPoly){
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
      nb_circles = glo.params.nb_circles;
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

  if(glo.mode.alea_size.state){ alea_size(); }

  let avatarsLength = avatars.length;
  getById('nb').value = avatarsLength;
  getById('nb').title = avatarsLength;
  glo.params.nb = avatarsLength;
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
  if(nb == 'all'){ avatars = []; glo.params.nb = 0; }
  else{
    for(let i = 0; i < nb; i++){ avatars.shift(); }
    glo.params.nb = avatars.length;
  }
}
//------------------ DÉPLACEMENTS D'AVATARS ----------------- //
function animation(){
  if(!glo.mode.totalBreak.state){
    let attract_mouse = glo.attract_mouse.state && glo.attract_mouse.mousedown;
    let growing_mouse = glo.mode.growByMouse.state;
    let posOnMouse    = glo.posOnMouse.avatar;
    let defineCenter  = glo.defineCenter;
    let is_modifier   = glo.pos_modifiers != 'none';
    let tail_memory   = glo.params.tail_memory;
    let pause         = glo.mode.break.state;
    let nears_calc    = glo.params.nears_calc;
    let noAvToAv      = glo.noAvToAv ? glo.noAvToAv.state : false;
    let keep_dir      = glo.params.keep_dir;
    let spap          = glo.params.speed_alea_pos;
    let resist        = glo.params.resist;
    let angle         = glo.params.rotate_angle / 10;

    path = new Path2D();


    if(glo.nb_moves%keep_dir == 0 && glo.mode.global_alea.state && !glo.mode.hyperAlea.state){ alea_params(); }
    if(glo.nb_moves%keep_dir == 0){ one_alea_param(); }

    if(noAvToAv){
      glo.noAvToAv.ax = 0;
      glo.noAvToAv.ay = 0;
      avatarsMeanPoint();
    }

    for(let i = 0; i < avatars.length; i++){
      let avatar = avatars[i];
      avatar.modifiersValues = {x: 0, y: 0, curve:{x: 0, y: 0}};

      if(glo.mode.hyperAlea.state && !avatar.glo){ avatar.glo = deepCopy(glo); }
      if(glo.nb_moves%keep_dir == 0 && glo.mode.global_alea.state && glo.mode.hyperAlea.state){ alea_params(avatar); }

      if(!avatar.virtual){
        avatar.last_x = avatar.x;
        avatar.last_y = avatar.y;

        avatar.dist = 0;
        avatar.ax   = 0;
        avatar.ay   = 0;

        avatar.distMods = [];

        if(glo.mode.tail.state){
          tail_length = avatar.tail_length();
          if(tail_length <= glo.params.lim_line){ avatar.lasts.push({x: avatar.last_x, y: avatar.last_y}); }
          if(avatar.lasts.length > tail_memory){ avatar.lasts.shift(); }
          while(avatar.tail_length() > glo.params.lim_line){ avatar.lasts.shift(); }
        }
        else{
          avatar.lasts.push({x: avatar.last_x, y: avatar.last_y});
          if(avatar.lasts.length > 2){ avatar.lasts.shift(); }
        }

        if(avatar.it%nears_calc == 0 && !glo.mode.stopNear.state){ avatar.nearAvatars(); }

        if(resist == 0){ avatar.vx = 0; avatar.vy = 0; }

        if(glo.mode.moveOnAlea.state && avatar.it%spap == 0){ avatar.lasts = []; avatar.moveOnAlea(); }
        if(avatar.nears.length){ avatar.interaction(); }

        if(glo.mode.follow.state){ avatar.follow(); }
        if(glo.attractByOne){ avatar.attractByOne(); }

        if(glo.params.angleEllipse && glo.params.rotate_angle){
          avatar.rotateEllipse(angle, !avatar.center ? { x: canvas.width/2, y: canvas.height/2 } : { x: avatar.center.x, y: avatar.center.y },
                              {x: glo.params.ellipse_x, y: glo.params.ellipse_y}, glo.params.angleEllipse, glo.params.spiral_force);
        }
        else if(glo.params.rotate_angle){
          if(glo.mode.spiral_cross.state && glo.mode.spiral_cross_rotate.state){ angle = glo.nb_spiral_cross % 2 != 0 ? -angle : angle; }
          avatar.rotate(angle, !avatar.center ? { x: canvas.width/2, y: canvas.height/2 } : { x: avatar.center.x, y: avatar.center.y });
        }
        if(glo.params.spiral_angle != 0){ avatar.spiral(); }
        if(glo.params.trirotate_angle != 0){ avatar.rotPoly(); }
        if(glo.params.trirotate_angle2 != 0){
          avatar.rotPoly(glo.params.trirotate_angle2, { x: canvas.width/2, y: canvas.height/2 },
                                false, glo.params.polyRotNbEdges2, false, glo.params.polyRotAngle2);
        }
        if(glo.curve){ avatar.curve(); }
        if(glo.trans.state){ avatar.trans(glo.trans.dir); }

        if(attract_mouse && !defineCenter && !is_modifier && !posOnMouse && growing_mouse){ avatar.mouse_growing(); }

        if(glo.modifiers.length > 0){
          let modifiersSz = glo.modifiers.length;
          avatar.distMinModifiers = 9999;
          for(let i = 0; i < modifiersSz; i++){ glo.modifiers[i].modify(avatar); }
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

    glo.trans.state = false;

    if(glo.mode.spirAvatar.state){ avatars.forEach(avatar => { avatar.spiralToAvatar(); }); }
    else if(glo.mode.orbite.state){ avatars.forEach(avatar => { avatar.orbite(); }); }


    for(let i = 0; i < avatars.length; i++){
      if(!avatars[i].virtual){
        let avatar = avatars[i];
        avatar.x += avatar.modifiersValues.curve.x;
        avatar.y += avatar.modifiersValues.curve.y;

        limSpeed(avatar.modifiersValues);
        if(!glo.params.distNearClearMods){
          avatar.x += avatar.modifiersValues.x;
          avatar.y += avatar.modifiersValues.y;
        }
        else{
          avatar.x += avatar.modifiersValues.x;
          avatar.y += avatar.modifiersValues.y;
          if(avatar.distMinModifiers < glo.params.distNearClearMods){
            avatar.draw_ok = false;
            avatar.draw    = false;
            if(glo.mode.moveOnAlea.state){ avatar.moveOnAlea(); }
          }
        }

        if(!avatar.speedBf){ avatar.speed = avatar.speed_avatar(); }
        else{ avatar.speedBefore(); avatar.speedBf = false; }
        avatar.accel = avatar.accel_avatar();
      }
    }

    positionAvatars();

    if(glo.crossPoints)     { drawCrossPoints(); }
    if(glo.lineCrossPoints) { lineCrossPoints(); }

    if(glo.updBgToAvColor && glo.nb_moves%5 == 0){ updBgToAvColor({inv: true}); }

    if(glo.nb_moves == 10000){ glo.nb_moves = 0; }
    glo.nb_moves++;
  }

  ctxStructure.clearRect(0, 0, structure.width, structure.height);

  if(glo.params.modifiers_angle  != 0){ rotate_modifiers(); }

  if(glo.modifierSelect.byRectangle){ modifierSelectByRectangle(); }
  if(glo.view_center)               { view_center(); }
  if(glo.view_modifiers)            { view_modifiers(); }
  if(glo.draw_grid)                 { drawGrid(); }
  if(glo.draw_circle_grid)          { drawCircleGrid(); }
  if(glo.draw_third_grid)           { drawThridGrid(); }
  if(glo.draw_equi_grid)            { drawEquiGrid(); }
  if(glo.showCircle)                { showCircle(); }
  if(glo.showInfos)                 { showInfos(); }
  if(glo.onModsInfo)                { showModsInfos(); }
  if(glo.testOnMouse)               { testOnMouse(); }

  requestAnimationFrame(animation);
}

function limSpeed(v, lim = glo.params.limSpeed){
  if(lim > 0){
    let d = h(v.x, v.y);
    if(d > lim){
      v.x *= lim/d;
      v.y *= lim/d;
    }
  }
}

function positionAvatars(){
  if(glo.mode.clear.state){ ctx.clearRect(0, 0, canvas.width, canvas.height); }

  var speed = 0; var speeds = []; var accel = 0; var accels = []; glo.dist_moy = 0;
  for(let i = 0; i < avatars.length; i++){
    let avatar = avatars[i];
    if(glo.mode.collid_bord.state){ avatar.collidBorder(); }
    avatar.dir();
    if(glo.mode.secondMove.state){
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
    if(glo.sizeDirCoeff && avatar.lasts[avatar.lasts.length - 2]){ avatar.coeffDirSize(); }

    avatar.sizeIt();
    avatar.colorHsl();

    if((!glo.mode.drawAltern.state || avatar.it%glo.params.speedRndDraw == 0) && avatar.draw){
      avatar.draw_avatar();
    }

    if(avatar.draw){
      speed  += avatar.speed;
      accel  += avatar.accel;
      speeds.push(avatar.speed);
      accels.push(avatar.accel);
    }

    if(avatar.draw_ok){ avatar.draw = true; }
    if(!avatar.draw){ avatar.draw_ok = true; }

    avatar.dist_moy = avatar.dist / avatars.length;

    glo.dist_moy += avatar.dist_moy;

    if(glo.mode.secondMove.state){
      avatar.x         = avatar.pSave.x;
      avatar.y         = avatar.pSave.y;
      avatar.last_x    = avatar.lSave.x;
      avatar.last_y    = avatar.lSave.y;
      avatar.lasts     = avatar.lsSave;
      avatar.direction = avatar.dirSave;
    }

    //if(!glo.mode.clear.state && glo.curve){dataCanvas[round(avatar.y,0) * canvas.width + round(avatar.x,0)] = 1;}
  }

  glo.speed_max = Math.max(...speeds);
  glo.accel_max = Math.max(...accels);

  glo.speed_moy = speed / avatars.length;
  glo.accel_moy = accel / avatars.length;
  glo.dist_moy /= avatars.length;
  if(glo.simple_pause_tmp){ glo.mode.break.state = true; glo.simple_pause_tmp = false; }
  if(glo.total_pause_tmp){ glo.mode.totalBreak.state = true; glo.total_pause_tmp = false; }
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
  glo.modsToZero = !glo.modsToZero;
  if(glo.modsToZero){
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

  glo.noAvToAv.meanPoint = {x: x/avLength, y: y/avLength};
}

//------------------ SELECT AVATARS BY RECTANGLE ----------------- //
function modifierSelectByRectangle(){
  if(glo.mousedown){
    ctxStructure.fillStyle = 'rgba(0, 125, 125, 0.2)';
    ctxStructure.beginPath();
    ctxStructure.rect(mouse.click.x, mouse.click.y, mouse.x - mouse.click.x, mouse.y - mouse.click.y);
    ctxStructure.fill();

    let rectCoord = mouseCoordToRectCoor();
    glo.modifiers.forEach(mod => {
      if(mod.x >= rectCoord.leftUp.x && mod.y >= rectCoord.leftUp.y && mod.x <= rectCoord.rightBottom.x && mod.y <= rectCoord.rightBottom.y){
        mod.select = true;
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
    var size = glo.size;
    if(glo.dimSizeCenter){
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
      if(glo.dimSizeCenter){
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
function createForm(opt){ keepBreak(function(){ var nb = glo.params.nb; deleteAvatar('all'); glo.params.nb = nb; createAvatar(opt); }); return false; }

//------------------ CLEAR CANVAS ----------------- //
function clear(){ ctx.clearRect(0, 0, canvas.width, canvas.height); /*dataCanvas = new Uint8Array(canvas.width * canvas.height);*/ }

//------------------ MENU DU CANVAS ----------------- //
function showMenu(pos = '75%'){
  glo.is_canvas_menu = true;

  canvas_menu.style.display  = 'block';
  canvas_menu.style.position = 'absolute';
  canvas_menu.style.left     = pos;
  canvas_menu.style.top      = '15px';
}
function hideMenu(){
  canvas_menu.style.display = 'none';
  glo.is_canvas_menu = false;
}
function createCanvasMenu(menu = glo.mode, keyType = 'min'){
  while (canvas_menu_button.firstChild) { canvas_menu_button.removeChild(canvas_menu_button.firstChild); }
  for (var p in menu){ createItemMenu(menu, p, keyType); }
}
function createItemMenu(menu, p, keyType){
  let name  = p;
  let state = menu[p];
  let key   = '';
  if(typeof(menu[p]) == 'object'){
    name       = menu[p].name;
    state      = menu[p].state;
    key        = typeof(menu[p].key) != 'undefined' ? menu[p].key : '';
    specialKey = typeof(menu[p].specialKey) != 'undefined' ? menu[p].specialKey : '';
  }

  let create;
  if(keyType      == 'min'  && specialKey == ''){ create = key.toLowerCase() == key ? true : false; }
  else if(keyType == 'maj'  && specialKey == ''){ create = key.toUpperCase() == key && key.charCodeAt() > 64 && key.charCodeAt() < 91 ? true : false; }
  else if(keyType == 'ctrl'  && specialKey == 'ctrl'){ create = key.toLowerCase() == key ? true : false; }
  else if(keyType == 'ctrl' && specialKey == 'ctrl'){ create = key.toUpperCase() == key && key.charCodeAt() > 64 && key.charCodeAt() < 91 ? true : false; }

  if(create){
    var newButton  = document.createElement("button");

    var div_txt = document.createElement("div");
    var div_key = document.createElement("div");
    var div_chk = document.createElement("div");
    var txt     = document.createTextNode(name);
    var key_txt = document.createTextNode(specialKey + ' ' + key);
    var chk     = document.createTextNode('✓');

    div_key.style.color     = '#666';
    div_key.style.fontStyle = 'italic';
    div_key.style.textAlign = 'right';

    div_txt.appendChild(txt);
    div_key.appendChild(key_txt);
    div_chk.appendChild(chk);

    name = typeof(menu[p]) == 'object' ? p : name;

    div_chk.className     = 'check_button';
    div_chk.id            = 'check_button_' + name;
    div_chk.style.opacity = state ? '1' : '0';

    var buttonGrid = document.createElement("div");
    buttonGrid.className = "buttonGrid";
    buttonGrid.appendChild(div_txt);
    buttonGrid.appendChild(div_chk);
    buttonGrid.appendChild(div_key);

    newButton.style.paddingBottom = '4px';
    newButton.appendChild(buttonGrid);

    newButton.setAttribute("onclick", "button_check('" + name + "'); ");
    newButton.setAttribute("oncontextmenu", "event.preventDefault(); glo.mode['" + p + "'].noAlea = !glo.mode['" + p + "'].noAlea; ");

    canvas_menu_button.appendChild(newButton);
  }
}

function checkColorFunctions(){
  glo.colorFunctions[event.target.id] = !glo.colorFunctions[event.target.id];

  let checked = 0;
  [...document.getElementsByClassName('inputCheckColorBox')].forEach(inp => {
    if(inp.checked){ checked++; }
  });

  if(checked > 1){ glo.mode.colorCumul.state = false; button_check('colorCumul'); }
  else{ glo.mode.colorCumul.state = true; button_check('colorCumul'); }
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
//------------------ SHOW/HIDE CHECH IN MENU ----------------- //
function button_check(mode_prop, menu = glo.mode){
  if(typeof(menu[mode_prop]) != 'object'){ menu[mode_prop] = !menu[mode_prop]; }
  else{ menu[mode_prop].state = !menu[mode_prop].state; }

  var div_chk = getById('check_button_' + mode_prop);

  if(div_chk != null){ div_chk.style.opacity = div_chk.style.opacity == '0' ? '1' : '0'; }
  if(typeof(menu[mode_prop]) == 'object' && typeof(menu[mode_prop].callback) == 'function'){
    if(typeof(menu[mode_prop].callback_args) != 'undefined'){ menu[mode_prop].callback(menu[mode_prop].callback_args); }
    else{menu[mode_prop].callback(); }
  }
}

/**
 * @description Uncheck a button in menu if param prop is true
 * @param {{}}  obj The obj that contains the property
 * @param {boolean} stateProp The state of prop
 * @param {string}  propCheck The prop to check in menu
 * @returns {void}
 */
function buttonCheckPropToAnother(obj, stateProp, propCheck){
  if(stateProp && obj[propCheck].state){ button_check(propCheck); }
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

  let pos_y = !glo.uiDisplay ? 30 : 30 + interfaces.find(int => int.clientHeight != 0).clientHeight;
  txts.forEach(txt => {
    ctxStructure.fillText(txt, 20, pos_y);
    pos_y+=20;
  });
}
//------------------ MODIFICATION DE VARIABLES GLOBALES SUITE À ÉVÈNEMENT INPUT----------------- //
function updateGlo(ctrl){
  let val = parseFloat(ctrl.value) ? parseFloat(ctrl.value) : ctrl.value;

  if(typeof(glo.params[ctrl.id]) != 'undefined'){
    glo.params[ctrl.id] = !ctrl.classList.contains('radUnit') ? val : val * rad;
  }

  ctrl.title = val;
  if(ctrl.id == 'radius_attract'){ radius_attract(); }

  if(typeof(ctrl.last_vals) == 'undefined'){ ctrl.last_vals = []; }

  if(ctrl.last_vals.length > 1){ ctrl.last_vals.shift(); }

  if(ctrl.dataset.last_value){ ctrl.last_vals.push(ctrl.dataset.last_value); }
  ctrl.dataset.last_value = val;

  updLabel(ctrl);

  getSelectedModifiers().forEach(mod => { mod.params[ctrl.id] = val; });

  glo.fromUpdGlo = true;
}
//------------------ MODIFICATION DE VARIABLES GLOBALES SUITE À ÉVÈNEMENT INPUT RANGE COLOR CUMUL ----------------- //
function updateGloRangeCmlColor(ctrl){
  let val = ctrl.value;

  glo.rangesCmlColor[ctrl.id] = parseFloat(val);
  glo.fromUpdGlo = true;
}

function updCtrl(ctlr_id){
  let ctrl = getById(ctlr_id);
  if(ctrl.max < glo.params[ctlr_id]){ ctrl.max = 2 * glo.params[ctlr_id]; }
  if(ctrl.min > glo.params[ctlr_id]){ ctrl.min = 2 * glo.params[ctlr_id]; }
  ctrl.value = glo.params[ctlr_id];
  updLabel(ctrl);
}

function updateScale(ctrl, e){
  let last_val = parseFloat(ctrl.last_vals[ctrl.last_vals.length - 1]);
  let curval   = parseFloat(ctrl.value);
  let max      = parseFloat(ctrl.max);
  let mid      = parseFloat(ctrl.max/2);
  let dblmax   = parseFloat(ctrl.max*2);

  e.stopPropagation();

  if(ctrl.max == 1){
    ctrl.max = ctrl.dataset.startMax; ctrl.step = ctrl.dataset.startStep; ctrl.value = ctrl.dataset.startValue;
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
  if(glo.params[ctrl.id]){ glo.params[ctrl.id] = ctrl.value; }
}

function radius_attract(){ glo.lim_dist = pow(pow(canvas.width, 2) + pow(canvas.height, 2), 0.5) / (256 / glo.params.radius_attract); }

//------------------ LES AVATARS DANS LE RAYON D'ATTRACTION ----------------- //
function all_nearsAvatars(){  avatars.forEach(avatar => { avatar.nearAvatars(); });  }

//------------------ AJOUT OU SUPPRESSION D'ÉLÉMENT DE DESSIN ----------------- //
function nbAvatars(callback = verif_nb){
  let nb = parseInt(getById('nb').value);
  if(nb > glo.params.nb){ createAvatar({nb: nb - glo.params.nb, w: glo.size}); }
  else if(nb < glo.params.nb){ deleteAvatar(glo.params.nb - nb); }

  verif_nb();
}

function verif_nb(){
  let nb = parseInt(getById('nb').value);
  if(nb != glo.params.nb){ nbAvatars(nb); }
}
//------------------ MODIFICATION DE LA TAILLE DES AVATARS ----------------- //
function updateSize(ctrl, alea = false){
  let upd_val = calcUpdVal(ctrl);

  if(!glo.updByVal){
    glo.size *= upd_val;
    avatars.forEach(avatar => { avatar.size *= upd_val; });
    getSelectedModifiers().forEach(mod => { mod.size *= upd_val; });
  }
  else{
    glo.size = ctrl.value;
    avatars.forEach(avatar => { avatar.size = ctrl.value; });
    getSelectedModifiers().forEach(mod => { mod.size = ctrl.value; });
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

  glo.testDone = false;

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
    canvas.style.backgroundColor = objRgb_to_strRgb(tot);
  }
}

/**
 * @description Update Background interface alpha color
 * @param {float} val alpha value
 * @returns {void}
 */
function bgInterfaceOpacity(ctrl){
  if(!glo.interfaceBg){
    glo.interfaceBg = getStyleProperty(".interface","background-color");
    if(glo.interfaceBg.length < 22){ glo.interfaceBg = "rgba" + glo.interfaceBg.substring(3, glo.interfaceBg.length - 1) + ", 1)"; }
  }

  let objCol = strRgba_to_objRgba(glo.interfaceBg);
  objCol.a   = parseFloat(ctrl.value);
  let strCol = objRgba_to_strRgba(objCol);

  glo.interfaceBg = strCol;

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
  switchObjBools(glo.colorFunctions, glo.colorFunctionLabels[ctrl.value], glo.mode.colorCumul.state);
  /*if(!glo.mode.colorCumul.state){
    switchObjBools(glo.colorFunctions, glo.colorFunctionLabels[ctrl.dataset.last_value], glo.mode.colorCumul.state);
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
function posOnGrid(pos, squareGrid){
  let w = canvas.width, h = canvas.height;
  let c = {x: w/2, y: h/2};

  if(squareGrid){
    let stepSz = w / glo.params.gridStep;

    let dToCenter = { x: pos.x - c.x, y: pos.y - c.y };
    let sToCenter = { x: Math.round(dToCenter.x/stepSz), y: Math.round(dToCenter.y/stepSz) };

    let x = c.x + sToCenter.x * stepSz;
    let y = c.y + sToCenter.y * stepSz;

    return {x: x, y: y};
  }
  else{
    let steps      = glo.params.circleGridStep;
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
  }

  return pos;
}

function infoOnMouse(){
  let onModsInfo = false;
  let modifiersSz = glo.modifiers.length;
  for(let i = 0; i < modifiersSz; i++){
    let mod = glo.modifiers[i];
    if(mod.x < mouse.x + 10 && mod.x > mouse.x - 10 && mod.y < mouse.y + 10 && mod.y > mouse.y - 10){
      glo.onModsInfo = {mod: mod};
      onModsInfo = true;
      break;
    }
  }
  if(!onModsInfo && !glo.persistModsInfo){ glo.onModsInfo = false; }
}

//------------------ CALCUL POS ON GRID ----------------- //
function putModsOnGrid(){
  if(glo.draw_grid || glo.draw_circle_grid){
    let squareGrid = glo.draw_grid || (glo.draw_grid && glo.draw_circle_grid) ? true : false;
    getSelectedModifiers().forEach(mod => {
        let pos = posOnGrid({x: mod.x, y: mod.y}, squareGrid);
        mod.x = pos.x;
        mod.y = pos.y;
    });
  }
}
//------------------ POS A MODIFIER ----------------- //
function pos_modifier(type = 'attractor', pos = mouse, inv = false, groupe = 0, virtual = false){
  let invAtt     = !inv ? 1 : -1;
  let random     = !glo.mode.pos_rnd_modifiers.state ? 1 : rnd();
  let force      = !glo.modsToZero ? invAtt * glo.params.wheel_force * random : 0;
  let dir_rnd    = !glo.mode.pos_rnd_modifiers.state ? 0 : rnd() * two_pi;
  let dir_angle  = invAtt * glo.params.director_angle  + dir_rnd - invAtt * glo.params.director_angle_upd;

  let squareGrid = glo.draw_grid || (glo.draw_grid && glo.draw_circle_grid) ? true : false;
  if(glo.putOnGrid && (glo.draw_grid || glo.draw_circle_grid)){ pos = posOnGrid(pos, squareGrid); }

  pos = !glo.mode.attract_center.state ? pos :
        !glo.center ? canvas.getCenter() : glo.center;

  let cent = !glo.center ? canvas.getCenter() : glo.center;

  let formule = {x: formule_x.value, y: formule_y.value};

  let dblAngle        = 0;
  let modPolyRotAngle = 0;
  let magnetAngle     = glo.params.magnetor_angle;
  if(glo.orientedPoly){
    let angle       = atan2pi(pos.x - cent.x, pos.y - cent.y);
    magnetAngle     = angle <= PI ? angle : -(angle - PI);
    modPolyRotAngle = two_pi - angle;
    dblAngle        = atan2piZ(pos.x - cent.x, pos.y - cent.y);
    dir_angle       = dblAngle;
  }

  if(type == 'magnetor' || type == 'mimagnetor' || glo.doubleMods){ glo.magnetors = true; }

  glo.modifiers.push({
    x: pos.x, y: pos.y, attract: force, lim_attract: 0, rot_spi: force, brake: glo.params.brake_pow,
    ellipse: {x: glo.params.ellipse_x, y: glo.params.ellipse_y},
    spiral_exp      : invAtt * glo.params.spiral_exp,
    nbEdges         : glo.params.posModsNbEdges,
    magnetAngle     : magnetAngle,
    rotMax          : 0,
    rotSin          : [],
    modPolyRotAngle : modPolyRotAngle,
    dblAngle        : dblAngle,
    dir_angle       : dir_angle,
    formule         : formule,
    type            : type,
    center          : cent,
    params          : deepCopy(glo.params),
    size            : glo.size,
    color           : glo.modifiersColor,
    colorDec        : glo.params.colorDec,
    tint            : glo.params.tint_color,
    tint_stroke     : glo.params.tint_stroke,
    sat             : glo.params.saturation,
    alpha           : glo.params.alpha_color,
    colorFunction   : glo.colorFunction,
    haveColor       : glo.modifiersHaveColor,
    powColor        : glo.params.nearColorPow,
    varOneColMod    : glo.params.varOneColMod,
    curveAngle      : glo.params.curveAngle,
    double          : type == 'magnetor' ? true : false,
    dblForce        : glo.doubleMods ? 200 : 1,
    modsWithSign    : glo.modsWithSign ? true : false,
    alternRot       : {state: true, inv: 1},
    alternAtt       : {state: true, inv: 1},
    weight          : 1,
    groupe          : groupe,
    virtual         : virtual,
    num_modifier    : num_modifier,
    modify          : makeModifierFunction(type)
  });
  num_modifier++;
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
        let dist  = av.dist_av(this);
        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, w: this.weight});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist >= this.lim_attract){
          let att   = this.attract * this.dblForce;
          let brake = glo.params.breakAdd + pow(dist, this.brake);

          av.modifiersValues.x += att * (this.x - av.x) / brake;
          av.modifiersValues.y += att * (this.y - av.y) / brake;
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
        let posSave;
        let k = glo.params.dblModDist;
        if(this.double){
          posSave = {x: this.x, y: this.y};
          this.x -= k*cos(this.dblAngle);
          this.y -= k*sin(this.dblAngle);

          if(!this.doublePos){ this.doublePos = {}; }
          this.doublePos.double = {x: this.x, y: this.y};
        }

        let dist  = av.dist_av(this);
        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, w: this.weight});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist >= this.lim_attract){
          let att    = this.attract;
          let brake  = glo.params.breakAdd + pow(dist, this.brake);
          let attRot = att / brake;

          if(this.rotMax > 0){ attRot = abs(attRot) > this.rotMax ? Math.sign(attRot) * this.rotMax : attRot; }

          if(!glo.params.angleEllipseMod){
            av.rotate(attRot, {x: this.x, y: this.y}, {x: att*this.ellipse.x/brake, y: att*this.ellipse.y/brake});
          }
          else{
            av.rotateEllipse(attRot, {x: this.x, y: this.y},
                                {x: att*this.ellipse.x/brake, y: att*this.ellipse.y/brake}, this.dblAngle, glo.params.spiral_force);
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
        let dist  = av.dist_av(this);

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, w: this.weight});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist >= this.lim_attract){
          let att         = this.attract * this.dblForce;
          let brake       = glo.params.breakAdd + pow(dist, this.brake);
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
    case 'invertor':
      return function(av){
        let dist  = av.dist_av(this);

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, w: this.weight});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist >= this.lim_attract){
          let att         = this.attract * this.dblForce;
          let brake       = glo.params.breakAdd + pow(dist, this.brake);

          let lastAv = av.lasts[av.lasts.length - 2];

          if(lastAv){
            let vx = av.x - lastAv.x;
            let vy = av.y - lastAv.y;

            let c = att / brake;

            if(!av.direction){ av.dir(); }

            /*av.modifiersValues.x += vx * c * cos(av.direction);
            av.modifiersValues.y += vy * c * sin(av.direction);*/
            av.modifiersValues.x += -vx * c;
            av.modifiersValues.y += -vy * c;
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
    case 'polygonator':
      return function(av){
        let dist  = av.dist_av(this);

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, w: this.weight});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist >= this.lim_attract){
          let att   = this.attract * this.dblForce;
          let brake = glo.params.breakAdd + pow(dist, this.brake);
          attRot    = 10 * att / brake;

          if(this.rotMax > 0){ att = abs(attRot) > this.rotMax ? Math.sign(attRot) * this.rotMax : att; }
          av.rotPoly(10 * att, {x: this.x, y: this.y}, true, this.nbEdges, this.brake, this.modPolyRotAngle);
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
    case 'spiralor':
      return function(av){
        let dist  = av.dist_av(this);

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, w: this.weight});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist >= this.lim_attract){
          let att     = this.attract;
          let brake   = glo.params.breakAdd + pow(dist, this.brake/1.15);
          let attract = att/4;
          let rot_spi = this.rot_spi;
          let attSpi  = rot_spi/brake;

          if(this.rotMax > 0){ attSpi = abs(attSpi) > this.rotMax ? Math.sign(attSpi) * this.rotMax : attSpi; }

          let attB = !glo.spiralOnlyInvrot ? attract/brake : abs(attract/brake);
          let f = 1 + attB;

          if(!glo.params.angleEllipseMod){
              av.rotate(attSpi, {x: this.x, y: this.y}, {x: rot_spi*this.ellipse.x/brake, y: rot_spi*this.ellipse.y/brake}, f);
          }
          else{
              av.rotateEllipse(attSpi, {x: this.x, y: this.y}, {x: rot_spi*this.ellipse.x/brake, y: rot_spi*this.ellipse.y/brake}, this.dblAngle, f);
          }
        }
      };
    case 'alternator':
      return function(av){
        let dist  = av.dist_av(this);

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, w: this.weight});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist >= this.lim_attract){
          let att   = this.attract;
          let brake = glo.params.breakAdd + pow(dist, this.brake);
          if(this.brake == 0){ att /= 100; }
          attRot    = att / brake;

          let alternatorSpeed = this.brake != 0 ? glo.params.alternatorSpeed : parseInt(glo.params.alternatorSpeed / 10);
          if(zeroOneCycle(glo.nb_moves, alternatorSpeed)){
            this.alternAtt.state = false;

            if(!glo.alternatorInv){ this.alternRot.inv = 1; }
            else{ this.alternRot.inv = this.alternRot.state ? this.alternRot.inv : -this.alternRot.inv; }

            this.alternRot.state = true;
            if(this.rotMax > 0){ attRot = abs(attRot) > this.rotMax ? Math.sign(attRot) * this.rotMax : attRot; }
            av.rotate(this.alternRot.inv * attRot, {x: this.x, y: this.y}, {x: att*this.ellipse.x/brake, y: att*this.ellipse.y/brake});
          }
          else{
            this.alternRot.state = false;

            if(!glo.alternatorInvAtt){ this.alternAtt.inv = 1; }
            else{ this.alternAtt.inv = this.alternAtt.state ? this.alternAtt.inv : -this.alternAtt.inv; }

            this.alternAtt.state = true;
            av.modifiersValues.x += this.alternAtt.inv * att * (this.x - av.x) / brake;
            av.modifiersValues.y += this.alternAtt.inv * att * (this.y - av.y) / brake;
          }
        }
      };
    case 'director':
      return function(av){
        let dist  = av.dist_av(this);

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, w: this.weight});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist >= this.lim_attract){
          let att   = this.attract;
          let brake = glo.params.breakAdd + pow(dist, this.brake);
          let force = 100 * att / brake;
          let angle = this.dir_angle + glo.params.director_angle_upd;

          av.modifiersValues.x += cos(angle) * force;
          av.modifiersValues.y += sin(angle) * force;
        }
      };
    case 'formulator':
      return function(av){
        if(this.formule){
          let dist  = av.dist_av(this);

          av.distMods.push({dist: dist, h: this.color.h, l: this.tint, w: this.weight});
          if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

          if(dist >= this.lim_attract){
            let att    = this.attract;
            let brake  = glo.params.breakAdd + pow(dist, this.brake);
            let force  = 100 * att / brake;
            let result = {x: 0, y: 0};
            let reg_x  = '((av.x - canvas.getCenter().x) * rad)';
            let reg_y  = '((av.y - canvas.getCenter().y) * rad)';

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

      };
  }
}


//------------------ POS ATTRACTORS OR ROTATORS ----------------- //
function posModifiers(type = glo.pos_modifiers, inv = glo.mode.invModifiersAtt.state){
  let invAtt = inv;
  if(type != 'all'){
    for(let i = 0; i < glo.params.nb_modifiers; i++){
      if(inv){ invAtt = i%2 == 0 ? true : false; }
      if(!glo.posOnMouse.circleMods){ pos_modifier(type, getRandomPoint(1), invAtt); }
      else{ posCircleModifiers(getRandomPoint(1)); }
    }
  }
  else {
    let types   = ['attractor', 'rotator', 'director'];
    let typesSz = types.length;
    for(let i = 0; i < glo.params.nb_modifiers; i++){
      if(inv){ invAtt = i%2 == 0 ? true : false; }
      pos_modifier(types[i%typesSz], getRandomPoint(1), invAtt);
    }
  }
}
//------------------ POS CIRCLES MODIFIERS ----------------- //
function posCircleModifiers(cent = false, type = glo.pos_modifiers, inv = glo.mode.invModifiersAtt.state, rot = glo.params.rotCircleModifiers){
  let pt, n = 0;
  let invAtt = inv;
  if(!cent){
    cent = !glo.defineCenter ? defineCenter(false) :
                glo.center ? glo.center : canvas.getCenter();
  }

  if(!glo.groupe){ glo.groupe = 0; }

  let k = glo.params.ellipse_x / glo.params.ellipse_y;
  let r = canvas.height * glo.params.circle_size;
  let step = parseFloat(two_pi / glo.params.nb_modifiers);
  let nb_circles = glo.params.nb_circles;
  for(let i = 1; i <= nb_circles; i++){
    pt = {x: cent.x, y: cent.y + r*(i/nb_circles)};
    if(rot != 0){ pt = rotate(pt, cent, rot, k); }
    if(glo.staggered && i > 1 && i%2 == 0){ pt = rotate(pt, cent, step/2, k); }
    if(glo.params.nb_modifiers%2==0){ n++; }
    glo.groupe++;
    for(let j = step; j <= two_pi+0.0001; j+=step){
      pt = rotate(pt, cent, step, k);

      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: pt.x, y: pt.y}, invAtt, glo.groupe);
      n++;
    }
  }
}
//------------------ POS CIRCLES MODIFIERS ----------------- //
function posPolyModifiers(type = glo.pos_modifiers, nb = glo.params.nb_modifiers, inv = glo.mode.invModifiersAtt.state,
  rot = glo.params.rotCircleModifiers, nbEdges = glo.params.posModsNbEdges){
  let n = 0;
  let invAtt = inv;
  let cent = !glo.defineCenter ? defineCenter(false) :
              glo.center ? glo.center : canvas.getCenter();

  if(!glo.groupe){ glo.groupe = 0; }

  let r = canvas.height * glo.params.circle_size;
  let nb_circles = glo.params.nb_circles;
  /*for(let i = 1; i <= nb_circles; i++){
    glo.groupe++;
    if(glo.params.nb_modifiers%2==0){ n++; }
    let pts = rotPoly(r*(i/nb_circles), nb, cent, nbEdges);
    for(let j = 0; j < pts.length; j++){
      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: pts[j].x, y: pts[j].y}, invAtt, glo.groupe);
      n++;
    }
  }*/

  for(let i = 1; i <= nb_circles; i++){
    glo.groupe++;
    let mod = {type: type, inv: invAtt, groupe: glo.groupe};
    pointsStar(cent, nbEdges, nb, r*(i/nb_circles), 0, cent, mod);
  }
}
//------------------ POS SQUARE MODIFIERS ----------------- //
function posSquareModifiers(type = glo.pos_modifiers, inv = glo.mode.invModifiersAtt.state, rot = glo.params.rotCircleModifiers){
  let x, y, pt, n = 0;
  let invAtt = inv;
  let cent = !glo.defineCenter ? defineCenter(false) :
              glo.center ? glo.center : canvas.getCenter();

  if(!glo.groupe){ glo.groupe = 0; }

  let form_size = canvas.height * glo.params.circle_size * 2;
  nb_mods       = parseInt(sqr(glo.params.nb_modifiers));
  step          = parseFloat(form_size / nb_mods);

  x = cent.x - form_size/2 + step/2;
  for(let i = 1; i <= nb_mods; i++){
    y = cent.y - form_size/2 + step/2;
    if(nb_mods%2==0){ n++; }
    glo.groupe++;
    for(let j = 1; j <= nb_mods; j++){
      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: x, y: y}, invAtt, glo.groupe);
      y+=step;
      n++;
    }
    x+=step;
  }
}
//------------------ POS RECTANGLE MODIFIERS ----------------- //
function posRectModifiers(type = glo.pos_modifiers, inv = glo.mode.invModifiersAtt.state, rot = glo.params.rotCircleModifiers){
  let x, y, pt, n = 0;
  let invAtt = inv;
  let cent = !glo.defineCenter ? defineCenter(false) :
              glo.center ? glo.center : canvas.getCenter();

  if(!glo.groupe){ glo.groupe = 0; }

  let form_size_w = canvas.width  * glo.params.circle_size * 2;
  let form_size_h = canvas.height * glo.params.circle_size * 2;
  nb_mods         = parseInt(sqr(glo.params.nb_modifiers));
  step_x          = parseFloat(form_size_w / nb_mods);
  step_y          = parseFloat(form_size_h / nb_mods);

  x = cent.x - form_size_w/2 + step_x/2;
  for(let i = 1; i <= nb_mods; i++){
    y = cent.y - form_size_h/2 + step_y/2;
    if(nb_mods%2==0){ n++; }
    glo.groupe++;
    for(let j = 1; j <= nb_mods; j++){
      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: x, y: y}, invAtt, glo.groupe);
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
  if(glo.modifiers.length > 0){
    let topLeftMod = findTopLeftModifiers();
    let dec        = {x: mouse.x - topLeftMod.x, y: mouse.y - topLeftMod.y};

    if(glo.putOnGrid){
      let modZero                  = glo.modifiers[0];
      let indTopLeftMod            = glo.modifiers.indexOf(topLeftMod);
      glo.modifiers[0]             = topLeftMod;
      glo.modifiers[indTopLeftMod] = modZero;
    }

    glo.groupe++;
    getSelectedModifiers().forEach((mod, i) => {
      let pos = {x: mod.x + dec.x, y: mod.y + dec.y};

      if(i == 0 && (glo.putOnGrid)){
        let posDec = posOnGrid(pos, glo.draw_grid);
        dec = {x: dec.x + (posDec.x - pos.x), y: dec.y + (posDec.y - pos.y)};
        pos = posDec;
      }

      let newMod = {};
      for(let prop in mod){ newMod[prop] = mod[prop]; }

      newMod.x      = pos.x;
      newMod.y      = pos.y;
      newMod.select = false;

      let center = mod.center ? mod.center : getCenter();
      newMod.center = point(center.x + dec.x, center.y + dec.y);

      glo.modifiers.push(newMod);
    });
  }
}
/**
 * @description Find the more top left modifier
 * @returns {void}
 */
function findTopLeftModifiers(){
  if(glo.modifiers.length == 0){ return false; }

  return getSelectedModifiers().reduce((prev, curr) => {
    return h(prev.x, prev.y) < h(curr.x, curr.y) ? prev : curr;
  });
}
//------------------ ROTATE MODIFIERS ----------------- //
function rotate_modifiers(rotAngle = -999){
  let angle  = rotAngle == -999 ? glo.params.modifiers_angle / 100 : rotAngle;
  let center = !glo.center ? canvas.getCenter() : glo.center;
  getSelectedModifiers().forEach((mod) => {
    if(glo.putOnGrid && glo.draw_circle_grid){
      let angle = abs(glo.params.modifiers_angle);
      let sign  = Math.sign(glo.params.modifiers_angle);
      let ang   = Math.round(angle / rad) < 100 ? Math.round(angle / rad) : 100;
      let speed = 101 - ang;
      if(glo.nb_moves%speed==0){
        angle = two_pi / (glo.params.circleGridStep * 4);
        let coords = rotate({x: mod.x, y: mod.y}, center, angle*sign);
        mod.x = coords.x;
        mod.y = coords.y;
        let pos = posOnGrid({x: mod.x, y: mod.y}, false);
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
}
//------------------ ROTATE MODIFIERS ----------------- //
function getSelectedModifiers(){
  let selectedMods = glo.modifiers.filter(mod => mod.select);
  if(selectedMods.length > 0){ return selectedMods; }
  return glo.modifiers;
}
//------------------ TURN MODIFIERS ----------------- //
function turnModifiers(ctrl){
  let modNum = ctrl.value;
  getSelectedModifiers().forEach((mod) => {
    mod.type = glo.modifierTypes[modNum];
    mod.double = mod.type != 'magnetor' ? false : true;
    mod.modify = makeModifierFunction(glo.modifierTypes[modNum]);
  });
  if(!glo.modifiers.some(mod => mod.type == 'magnetor' || mod.type == 'mimagnetor' || mod.double)){ glo.magnetors = false; }
  else{ glo.magnetors = true; }
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
  glo.formuleColor[colorType] = ctrl.value;

  let form = glo.formuleColor[colorType].replaceAll('H', 1);
  form = form.replaceAll('L', 1);
  form = form.replaceAll('S', 1);
  form = form.replaceAll('A', 1);
  form = form.replace(/(?<!\.)x/g, 1);
  form = form.replace(/(?<!\.)y/g, 1);
  form = form.replaceAll('this', 'avatars[0]');

  let formuleColorTest = evalFormuleColor(form);

  if(formuleColorTest && (form[form.length-1] == '-' || form[form.length-1] == '+' || form[form.length-1] == ' ')){ formuleColorTest = false; }

  if(!formuleColorTest){ Object.assign(glo.formuleColor, glo.formuleColorHisto); }
  else{ Object.assign(glo.formuleColorHisto, glo.formuleColor); }
}

function testFormule(formule){
  let formule_test = formule.replaceAll('x', 1);
  formule_test     = formule_test.replaceAll('y', 1);
  return parseFloat(evalNoError(formule_test));
}
//------------------ SELECT MODIFIER ----------------- //
function modifier_select(byMouse = true, ctrl = null){
  let modifiersSz = glo.modifiers.length;
  if(byMouse){
    for(let i = 0; i < modifiersSz; i++){
      let mod = glo.modifiers[i];
      if(mod.x < mouse.x + 10 && mod.x > mouse.x - 10 && mod.y < mouse.y + 10 && mod.y > mouse.y - 10){
        if(glo.modifierSelect.byOne){ glo.modifiers[i].select = !glo.modifiers[i].select; break; }
        else if(glo.modifierSelect.byGroup){
          for(let j = 0; j < modifiersSz; j++){
            if(glo.modifiers[i].groupe == glo.modifiers[j].groupe){ glo.modifiers[j].select = !glo.modifiers[j].select; }
          }
        }
        break;
      }
    }
  }
  else{
    if(ctrl.value == 0){ glo.modifiers.forEach(mod => { mod.select = false; }); }
    else{
      glo.modifiers.forEach(mod => {
        if(mod.type == glo.selModsByType[ctrl.value]){ mod.select = true; }
        else{ mod.select = false; }
      });
    }
  }
}
//------------------ DEFINE CENTER ----------------- //
function defineCenter(byMouse = true, define = false){
  let cent;
  if(define){
    cent = byMouse ? {x: mouse.x, y: mouse.y} : getRandomPoint(0.75);

    if(glo.putOnGrid && (glo.draw_grid || glo.draw_circle_grid)){
      let isSquareGrid = glo.draw_grid || (glo.draw_grid && glo.draw_circle_grid) ? true : false;
      cent = posOnGrid(cent, isSquareGrid);
    }

    glo.center = cent;
    avatars.forEach((av) => {
      av.center = cent ;
    });
  }
  else{
    cent = canvas.getCenter();
    glo.center = cent;
    avatars.forEach((av) => {
      av.center = cent;
    });
  }
  return cent;
}
//------------------ RAZ ROTATE CANVAS----------------- //
function raz_rotate(){
  if(!glo.mode.rotate.state){
    ctx.rotate(-glo.mode.rotate.current_rotate);
    glo.mode.rotate.current_rotate = 0;
  }
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
  var nb = glo.params.nb;
  deleteAvatar(nb);
  glo.params.nb = nb;

  createAvatar();
}

//------------------ ATTRIBUE DES VALEURS ALÉATOIRES AUX PARAMÉTRES ----------------- //
function alea_params(avatar = false){
  for(var param in glo.params){
    if(glo.alea[param]){
      let ctrl = getById(param);

      if(ctrl){
        let ctrl_min = !ctrl.dataset.alea_min ? parseFloat(ctrl.min) : parseFloat(ctrl.dataset.alea_min);
        let ctrl_max = !ctrl.dataset.alea_max ? parseFloat(ctrl.max) : parseFloat(ctrl.dataset.alea_max);
        let step     = parseFloat(ctrl.step);

        let new_val = getRnd(ctrl_min, ctrl_max);

        if(parseInt(ctrl.step) == ctrl.step){ new_val = round(new_val, 0); }

        if(!avatar){
          glo.params[param] = new_val;
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
  for(var mode in glo.mode){
    if(!glo.mode[mode].noAlea){
      if(!avatar){
        let state = glo.mode[mode].state;
        glo.mode[mode].state = rnd() > 0.5 ? true : false;
        if(state != glo.mode[mode].state){ button_check(mode); }
      }
      else{
        avatar.glo.mode[mode].state = rnd() > 0.5 ? true : false;
      }
    }
  }
}
//------------------ ATTRIBUE DES VALEURS ALÉATOIRES AUX PARAMÉTRES DÉCLENCHEMENT CLICK DROIT ----------------- //
function one_alea_param(playInput = true){
  for(var param in glo.params_alea){
    if(glo.params_alea[param]){
      let ctrl = getById(param);

      let ctrl_min = !ctrl.dataset.alea_min ? parseFloat(ctrl.min) : parseFloat(ctrl.dataset.alea_min);
      let ctrl_max = !ctrl.dataset.alea_max ? parseFloat(ctrl.max) : parseFloat(ctrl.dataset.alea_max);
      let step     = parseFloat(ctrl.step);

      let new_val = getRnd(ctrl_min, ctrl_max);

      if(parseInt(ctrl.step) == ctrl.step){ new_val = round(new_val, 0); }

      ctrl.value = new_val;

      if(playInput){
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
        attract: 0,
        radius_attract: 0,
        same_dir: 0,
      };
      if(glo.mode.collid_bord.state){ button_check('collid_bord'); }
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
      glo.bg_black                 = true;
      glo.numLineCap               = 1;
      glo.mode.alphaAbs.state      = true;
      glo.mode.tail.state          = false;
      glo.mode.collid_bord.state   = false;
      canvas.style.backgroundColor = '#000';
      glo.form                     = 'ellipse';
      break;
  }

  Object.entries(params).forEach(([key, val]) => {
    glo.params[key] = val;
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
  gloSave = deepCopy(glo);
}
/**
 * @description param all state to the shot take with takeShot function
 * @returns {void}
 */
function goToShot(){
  if(gloSave){
    glo = deepCopy(gloSave);
    let upd_size     = getById('upd_size');
    let upd_size_val = upd_size.value;
    params_interface(false);
    upd_mode();
    let nb = glo.params.nb;
    deleteAvatar(avatars.length);
    glo.params.nb = nb;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(glo.backgroundColor){ canvas.style.backgroundColor = glo.backgroundColor; }
    createAvatar();
    upd_size.dataset.last_value = upd_size_val;
    updateSize(upd_size);
  }
}

//------------------ VIEW CENTER OF CANVAS ----------------- //
function view_center(){
  let center = glo.center ? glo.center : { x: canvas.width / 2, y: canvas.height / 2 };
  drawLogo({x:center.x, y: center.y, type: 'center'}, 'rgb(255,0,0,1)');
}
//------------------ VIEW ATTRACTORS ----------------- //
function view_modifiers(arr = glo.modifiers){
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
    case 'invertor':
      let coeff = !select ? 1 : 2;
      angleSave = angle;
      angle = -abs(angle);
      ctxStructure.lineWidth = !select ? 10 : 20;
      if(angleSave < 0){ ctxStructure.strokeStyle = attract < 0 ? 'red' : 'blue'; }
      else{ ctxStructure.strokeStyle = attract > 0 ? 'blue' : 'red'; }
      ctxStructure.line({start: point, end: {x: point.x + cos(angle) * size * coeff, y: point.y + sin(angle) * size* coeff}});
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
      angle += glo.params.director_angle_upd;
      ctxStructure.line({start: point, end: {x: point.x + cos(angle) * size, y: point.y + sin(angle) * size}});
      break;
    case 'oscillator':
      angle += glo.params.director_angle_upd;
      ctxStructure.line({start: point, end: {x: point.x + size, y: point.y + size}});
      ctxStructure.line({start: {x:point.x + size, y: point.y + size}, end: {x: point.x + size, y: point.y - size}});
      break;
    case 'formulator':
      angle += glo.params.director_angle_upd;
      ctxStructure.line({start: point, end: {x: point.x + size, y: point.y}});
      ctxStructure.line({start: {x:point.x, y: point.y + size}, end: {x: point.x + size, y: point.y + size}});
      break;
  }
  ctxStructure.lineWidth = lineW;
}

//------------------ DRAW A GRID ----------------- //
function drawGrid(step = glo.params.gridStep){
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
    //ctxStructure.beginPath();
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

//------------------ DRAW AN EQUI GRID ----------------- //
function drawEquiGrid(){
  let n = 0;
  let w = structure.width;
  let h = structure.height;
  let c = {x: w/2, y: h/2};

  ctxStructure.strokeStyle = '#ff8800';

  let step   = w / glo.params.gridEquiStep;
  let angleT = glo.params.gridEquiAngle;

  for(i = c.x; i <= w*2; i+=step){
    let ptRight = point(i, c.y);
    let ptLeft  = point(c.x - step*n, c.y);
    for(j = 0; j < 2; j++){
      for(k = 0; k < 2; k++){
        let ptEndRight = new Pt(ptRight.x, ptRight.y);
        let ptEndLeft  = new Pt(ptLeft.x, ptLeft.y);
        let angle = k%2==0 ? j%2==0 ? angleT : PI-angleT :
                    j%2==0 ? -angleT : -(PI-angleT);
        ptEndRight.addDir(angle, w*2);
        ptEndLeft.addDir(angle, w*2);
        ctxStructure.lineWidth = n%2!=0 ? 1 :
                                 n%4==0 ? 2 : 3;
        ctxStructure.beginPath();
        ctxStructure.ln(ptRight.x, ptRight.y, ptEndRight.x, ptEndRight.y);
        ctxStructure.ln(ptLeft.x, ptLeft.y, ptEndLeft.x, ptEndLeft.y);
        ctxStructure.stroke();
      }
    }
    n++;
  }

  n = 0;
  let miStep = step/2;
  let stepH = sin(angleT) * (miStep / cos(angleT));
  for(i = c.y; i <= h; i+=stepH){
    let upEndPtY = c.y - n*stepH;
    ctxStructure.lineWidth = n%2!=0 ? 1 :
                             n%4==0 ? 2 : 3;
    ctxStructure.beginPath();
    ctxStructure.ln(0, i, w, i);
    ctxStructure.ln(0, upEndPtY, w, upEndPtY);
    ctxStructure.stroke();
    n++;
  }
}

//------------------ DRAW A THIRD GRID ----------------- //
function drawThridGrid(step = glo.params.thirdGridStep){
  let n = 1;
  let w = structure.width;
  let h = structure.height;

  ctxStructure.strokeStyle = '#223351';

  let frac = glo.params.thirdGridFrac;

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
function drawCircleGrid(step = glo.params.circleGridStep){
  let n   = 0, m = 0;
  let w   = structure.width;
  let h   = structure.height;
  let c   = {x: w/2, y: h/2};
  let rep = glo.params.circleRep;

  ctxStructure.strokeStyle = '#cc0000';

  let sx = glo.params.ellipse_x, sy = glo.params.ellipse_y;

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

//------------------ ROTATE A LINE TO RETURNS ROTATED LINES ON PI ----------------- //
function rotateLn(ln, step, center){
  let linesRotated = [], lnRotated;
  let k = glo.params.ellipse_x / glo.params.ellipse_y;
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
function showCircle(){
  let cent = !glo.defineCenter ? defineCenter(false) :
              glo.center ? glo.center : canvas.getCenter();

  let r = structure.height * glo.params.circle_size;

  let sx = glo.params.ellipse_x, sy = glo.params.ellipse_y;

  ctxStructure.strokeStyle = '#cc00cc';
  ctxStructure.beginPath();
  ctxStructure.ellipse(cent.x, cent.y, r*sx, r*sy, 0, two_pi, 0, false);
  ctxStructure.stroke();
}

//------------------ SHOW / HIDE INTERFACE ----------------- //
function showHideInterface(id = false){
  glo.uiDisplay    = !glo.uiDisplay;
  ui.style.display = !glo.uiDisplay ? 'none' : '';

  let t = !id ? getById(event.target.id) : getById(id);
  if(!glo.uiDisplay){ document.getElementsByTagName('body')[0].insertBefore(t, null); }
  else{ ui.insertBefore(t, null); }
  t.style.top   = !glo.uiDisplay ? "0%" : "90%";
  t.textContent = !glo.uiDisplay ? "▼" : "▲";
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
  let pos_y = !glo.uiDisplay ? 30 : 30 + interfaces.find(int => int.clientHeight != 0).clientHeight;
  let esp   = 30;
  let txts  = [];
  let inf;
  putTxt({txt: "Selection mode      "  + glo.modifierSelect.whatIsSelect(), pos_y: pos_y});
  putTxt({txt: "Modifers type        " + glo.pos_modifiers, pos_y: pos_y});
  putTxt({txt: "Put in the center    " + (!glo.mode.attract_center.state ? 'disabled' : 'enabled '), pos_y: pos_y});
  inf = glo.params.wheel_force > 0 ? 'positive' : 'negative';
  if(glo.params.wheel_force == 0){inf = 'zero';}
  putTxt({txt: "Mouse force sign    "  + inf, pos_y: pos_y});
  putTxt({txt: "Pos/neg modifiers  "   + (!glo.mode.invModifiersAtt.state ? 'disabled' : 'enabled '), pos_y: pos_y});
  putTxt({txt: "Pos mods with sign "   + (!glo.modsWithSign ? 'disabled' : 'enabled '), pos_y: pos_y});
  putTxt({txt: "Define center        " + (!glo.defineCenter ? 'disabled' : 'enabled '), pos_y: pos_y});

  inf = "";
  for(let colFunc in glo.colorFunctions){
    if(glo.colorFunctions[colFunc]){ inf += colFunc + " "; }
  }

  putTxt({txt: "Color function(s)    " + inf, pos_y: pos_y});

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
  let pos_y = !glo.uiDisplay ? 30 : 30 + interfaces.find(int => int.clientHeight != 0).clientHeight;
  let esp   = 30;
  let txts  = [];

  for(let p in glo.onModsInfo.mod){
    if(typeof glo.onModsInfo.mod[p] != 'object'){ putTxt({txt: p + " : " + glo.onModsInfo.mod[p], pos_y: pos_y}); }
  }

  txts.map(txt => ctxStructure.fillText(txt.txt, pos_x, txt.pos_y));
}

function fillStyleAccordToBg(canvasVar, ctxVar){
  ctxVar.fillStyle = objRgb_to_strRgb(updateColorToBack(strRgb_to_objRgb(canvasVar.style.backgroundColor)));
}

//------------------ UPDATE MODE ----------------- //
function updateMode(opts, menu = glo.mode){
  var state_prop = menu[opts.state_prop].state;
  opts.props.forEach((prop) => {
    if(typeof(menu[prop]) != 'object'){ menu[prop] = state_prop; }
    else{ menu[prop].state = state_prop; }
  });
  createCanvasMenu();
}
//------------------ SWITCH HYPER ALEA ----------------- //
function switchHyperAlea() {
  if(glo.mode.hyperAlea.state){ avatars.forEach(av => { av.glo = deepCopy(glo); }); }
  else{ avatars.forEach(av => { delete av.glo; }); }
}
//------------------ TAILLE ALÉATOIRE DES AVATARS ----------------- //
function alea_size(){
  if(glo.mode.alea_size.state){
    let lvss = glo.params.level_var_s_size;
    avatars.forEach(avatar => {
      avatar.size = rnd() > 0.9 ? glo.size * getRandomIntInclusive(1,3) * lvss : glo.size * rnd() / lvss;
    });
  }
  else{
    avatars.forEach(avatar => { avatar.size = glo.size; });
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
  if(glo.mode.break.state){
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

  glo.backgroundColor = canvas.style.backgroundColor;
	var strMesh = JSON.stringify(glo);

	var blob = new Blob ( [ strMesh ], { type : "octet/stream" } );
	objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

  let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(blob);
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
    var contentJsonFile = JSON.parse(content);
    glo.modifiers = [];
    let glo_save = deepCopy(glo);
    glo = Object.assign({}, glo, contentJsonFile);
    glo = mergeDeep(glo, glo_save, true);
    let upd_size     = getById('upd_size');
    let upd_size_val = upd_size.value;
    params_interface(false);
    upd_mode();
    let nb = glo.params.nb;
    deleteAvatar(avatars.length);
    glo.params.nb = nb;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(glo.backgroundColor){ canvas.style.backgroundColor = glo.backgroundColor; }
    createAvatar();
    upd_size.dataset.last_value = upd_size_val;
    updateSize(upd_size);
    if(glo.modifiers.some(mod => mod.type == 'magnetor' || mod.type == 'mimagnetor' || mod.double)){ glo.magnetors = true; }
    glo.modifiers.forEach(mod => { mod.modify = makeModifierFunction(mod.type); });
  };
  fileread.readAsText(file_to_read);
  glo.import_json = false;
}
//------------------ IMPORT JSON ----------------- //
function impt_image(event){
  if(!glo.mode.break.state){ button_check('pause'); }
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var img = new Image();
    img.onload = function(){
      ctx.drawImage(img,0,0);
    };
    img.src = e.target.result;
  };
  fileread.readAsDataURL(event.target.files[0]);
  glo.import_image = false;
  //showHideCtrl(import_image);
}
//------------------ CHEK MENU WITH GLO.MODE ----------------- //
function upd_mode(){
  Object.entries(glo.mode).forEach(([mode_prop, val]) => {
    var div_chk = getById('check_button_' + mode_prop);
    if(div_chk){
      div_chk.style.opacity = glo.mode[mode_prop].state ? '1' : '0';

      if(typeof(glo.mode[mode_prop]) == 'object' && typeof(glo.mode[mode_prop].callback) == 'function'){
        if(typeof(glo.mode[mode_prop].callback_args) != 'undefined'){ glo.mode[mode_prop].callback(glo.mode[mode_prop].callback_args); }
        else{ glo.mode[mode_prop].callback(); }
      }
    }
  });
}

//------------------ CANVAS PICKER COLOR UPD CANVAS BG----------------- //
function canvas_bg_upd(ctrl){ canvas.style.backgroundColor = ctrl.value; }

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
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = canvas.style.backgroundColor == '' ? 'white' : canvas.style.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let canvas_href = canvas.toDataURL("image/png");

  ctx.globalCompositeOperation = 'source-over';

  let a = document.createElement('a');

  a.download = "canvas.png";
  a.href = canvas_href;

  a.click();
}

function getRandomPoint(coeff){ return {x: canvas.width * (coeff * rnd() + (1-coeff)/2), y: canvas.height * (coeff * rnd() + (1-coeff)/2)}; }

function getRandomPointInCircle(coeff){
  let center   = { x: canvas.width/2, y: canvas.height/2 };
  let r        = coeff * h(canvas.width, canvas.height) / 2;

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

  return {x: center.x + rnd() * r * tri.c, y: center.y + rnd() * r * tri.s};
}

//------------------ GARDE LA PAUSE ----------------- //
function keepBreak(func, param = null) {
  var nb    = glo.params.nb;
  var simple_pause = glo.mode.break.state;
  var total_pause  = glo.mode.totalBreak.state;
  if(simple_pause){ glo.mode.break.state = false; }
  if(total_pause) { glo.mode.totalBreak.state = false; }
  func(param);
  if(simple_pause){ glo.simple_pause_tmp = true; }
  if(total_pause){ glo.total_pause_tmp = true; }

  return false;
}

/**
 * @description Show an interface by num in glo.num_interface
 * @param {number} numInterface The numero of interface
 * @returns {void}
 */
function showInterface(numInterface){
  let interfacesLength = interfaces.length;
  let numTxt           = numInterface + 1;

  getById('num_interface').textContent = numTxt + "-►";

  for(let i = 0; i < interfacesLength; i++){
    if(i == numInterface){ interfaces[i].style.display = ''; }
    else{ interfaces[i].style.display = 'none'; }
  }
}

/**
 * @description Change the interface by increment or decrement
 * @param {string} dir '+' for increment, '-' for decrement
 * @returns {void}
 */
function changeInterface(dir){
  if(dir == '+'){
    if(glo.num_params < interfaces.length - 1){ glo.num_params++; }
    else{ glo.num_params = 0; }
  }
  else if(dir == '-'){
    if(glo.num_params > 0){ glo.num_params--; }
    else{ glo.num_params = interfaces.length - 1; }
  }
  showInterface(glo.num_params);
}

function razAvPaths(){
  if(glo.mode.clear.state){
    avatars.forEach(av => {
      av.path     = new Path2D();
      av.selfPath = new Path2D();
      av.savePath = [];
      av.pathIt   = 0;
    });
  }
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
  msg(ctx.isBlank(mouse));
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
