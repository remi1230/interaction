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

function verif_nb(){
  let nb = parseInt(getById('nb').value);
  if(nb != activeGlo.params.nb){ nbAvatars(nb); }
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

//------------------ MODIFICATION PROPRIÉTE DES MODIFIEURS ----------------- //
function changeAvatarsProp(val, prop, toRad = false){
  val = parseFloat(val);
  if(toRad){ val*=rad; }

  avatars.forEach(av => { av[prop]  = val; });
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

//------------------ VITESSE À ZÉRO DES AVATARS ----------------- //
function stop_avatars(){ avatars.forEach(avatar => { avatar.vx = 0; avatar.vy  = 0; } ); }

//------------------ SUPPRIME ET RECRÉE LES AVATARS ----------------- //
function raz_avatars(){
  var nb = activeGlo.params.nb;
  deleteAvatar(nb);
  activeGlo.params.nb = nb;

  createAvatar();
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

function nbAvatarsInScreen(){
  let nb = 0;
  avatars.forEach(av => {
    if(av.x <= canvas.width && av.x >= 0 && av.y <= canvas.height && av.y >= 0){ nb++; }
  });
  return nb;
}

function selectAvatarToInfos(tr, numAv){
  avatars[numAv].infoSelect = tr.classList.contains('trSelect'); 
}

function selectClassAvatarToInfos(numAv){
  return avatars[numAv].infoSelect ? 'trSelect' : ''; 
}

function avatarsMeanPoint(){
  let x = 0, y = 0, avLength = avatars.length;
  avatars.forEach((av) => {
    x += av.x;
    y += av.y;
  });

  activeGlo.noAvToAv.meanPoint = {x: x/avLength, y: y/avLength};
}

function infosAvatars(isSorted = false, dir = 'asc', limNbProps = 19){
  let infosAvs = [];
  let propsInAvs = infosArr(avatars[0]).map(p => p.prop);

  if(propsInAvs){
    avatars.forEach(av => { infosAvs.push(infosArr(av, propsInAvs)); });

    infosAvs.forEach((_infAvatar, i) => {
      let ind = infosAvs[i].findIndex(inf => inf.prop === 'speed');
      infosAvs[i].splice(ind+1, 0, {prop: "speed_rel", val: parseFloat(infosAvs[i][ind].val) / parseFloat(activeGlo.speed_max)});
      infosAvs[i] = infosAvs[i].slice(0, limNbProps);
    });

    if(isSorted){ sortInfosArray(infosAvs, isSorted, dir); }

    return {infosAvs, propsInAvs};
  }
  return false;
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
//------------------ A TESTER ----------------- //
function calcUpdVal(ctrl){
  let last_val = parseFloat(ctrl.dataset.last_value);
  let val      = parseFloat(ctrl.value);

  let diff_val = abs(val - last_val) + 1;

  return val > last_val ? diff_val : 1 / diff_val;
}

function deleteAvatarsProp(prop){
  let i = 0;
  for(; i < avatars.length; i++){ delete avatars[i][prop]; }
}
