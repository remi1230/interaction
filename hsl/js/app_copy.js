fix_dpi();
var get_ctx = function(){ return canvas.getContext('2d'); }
var ctx = get_ctx();

//------------------ DÉSSINER UN POLYGONE ----------------- //
ctx.polygone = function(opt){
  let nb_edges = opt.nb_edges;
  let pos      = opt.pos;
  let size     = opt.size;
  let color    = opt.color;

  let point = {x: pos.x, y: pos.y - size};

  ctx.strokeStyle = color;
  ctx.moveTo(point.x, point.y);

  for(var i = 0; i < nb_edges; i++){
    point = rotate(point, pos, 2*PI/nb_edges);
    ctx.lineTo(point.x, point.y);
  }
}

ctx.font = "30px Comic Sans MS";

//------------------ TAILLE DU CANVAS ADAPTÉE À LA RÉSOLUTION D'ÉCRAN ----------------- //
function fix_dpi() {
let style = {
    height() {
      return +getComputedStyle(canvas).getPropertyValue('height').slice(0,-2);
    },
    width() {
      return +getComputedStyle(canvas).getPropertyValue('width').slice(0,-2);
    }
  }
  canvas.setAttribute('width', style.width() * dpi);
  canvas.setAttribute('height', style.height() * dpi);
}

radius_attract();
//------------------ INITIALISATION DES CONTRÔLES D'INTERFACE AVEC LES VARIABLES GLOBALES ----------------- //
function params_interface(){
  Object.entries(glo.params).forEach(([key, val]) => { param_ctrl(val, key) });
  Object.entries(glo.params_suit).forEach(([key, val]) => { param_ctrl(val, key) });
}
function param_ctrl(val, id_ctrl){
  var ctrl = document.getElementById(id_ctrl);
  ctrl.value = val;
  ctrl.dataset.last_value = val;
  ctrl.dataset.startValue = val;
  ctrl.dataset.startMax   = ctrl.max;
  ctrl.dataset.startStep  = ctrl.step;
  ctrl.last_vals = [val];
}
//------------------ CRÉATION D'AVATARS ----------------- //
function createAvatar(options = {}){
  let nb = typeof(options.nb) == 'undefined' ? glo.params.nb  : options.nb;
  let w  = typeof(options.w)  == 'undefined' ? glo.size : options.w;

  let areneWidth  = canvas.width - glo.size;
  let areneHeight = canvas.height - glo.size;

  let center = { x: canvas.width / 2, y: canvas.height / 2 };

  let form = 'no';
  if(typeof(options.form) != 'undefined'){
    form  = typeof(options.form.name)  == 'undefined' ? 'square' : options.form.name;
    var form_size    = typeof(options.form.size)    == 'undefined' ? areneWidth/2 : options.form.size;
    var form_size_x  = typeof(options.form.size_x)  == 'undefined' ? areneWidth   : options.form.size_x;
    var form_size_y  = typeof(options.form.size_y)  == 'undefined' ? areneHeight  : options.form.size_y;
  }

  let dep_dir = glo.params.dep_dir;

  if(typeof(avatars) == 'undefined'){ avatars = []; }

  var nb_avatars;
  switch (form) {
    case 'no':
      for(let i = 0; i < nb; i++){
        var newAvatar = new Avatar({
          x_tmp     : getRandomIntInclusive(glo.size, areneWidth),
          y_tmp     : getRandomIntInclusive(glo.size, areneHeight),
          size      : w,
          fillStyle : 'green',
        });
      }
      break;
    case 'square':
      nb_avatars = parseInt(sqr(nb));
      var step = parseFloat(form_size / nb_avatars);
      var div = 2;

      var x = center.x - form_size/div + step/div;
      var y = center.y - form_size/div + step/div;
      for(let i = x; i < form_size + x; i+=step){
        for(let j = y; j < form_size + y; j+=step){
          var newAvatar = new Avatar({
            x_tmp     : i,
            y_tmp     : j,
            size      : w,
            fillStyle : 'green',
          });
        }
      }
      break;
    case 'rect':
      nb_avatars = parseInt(sqr(nb));
      var step_x = parseFloat(form_size_x / nb_avatars);
      var step_y = parseFloat(form_size_y / nb_avatars);
      for(let i = 0; i < form_size_x; i+=step_x){
        for(let j = 0; j < form_size_y; j+=step_y){
          var newAvatar = new Avatar({
            x_tmp     : i,
            y_tmp     : j,
            size      : w,
            fillStyle : 'green',
          });
        }
      }
      break;
    case 'circle':
      var r = canvas.height * .45;
      var two_pi = 2*PI;
      var step = parseFloat(2*PI / nb);
      for(let i = step; i <= two_pi+.0001; i+=step){
        var x = center.x + r*cos(i);
        var y = center.y + r*sin(i);
        var newAvatar = new Avatar({
          x_tmp     : x,
          y_tmp     : y,
          size      : w,
          fillStyle : 'green',
        });
      }
      break;
  }
  all_nearsAvatars();
  //draw_avatars();

  let avatarsLength = avatars.length;
  document.getElementById('nb').value = avatarsLength;
  document.getElementById('nb').title = avatarsLength;
  glo.params.nb = avatarsLength;
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
function moveAvatars(){
  let attract_mouse = glo.attract_mouse.state && glo.attract_mouse.mousedown;
  let pause         = glo.mode.pause.state;

  if(!pause){
    let keep_dir = glo.params.keep_dir;
    let dep_dir  = glo.params.dep_dir;
    let attract  = glo.params.attract;
    let resist   = glo.params.resist;
    let lim_out  = glo.lim_out;
    let style    = glo.style;

    if(glo.nb_moves%keep_dir == 0 && glo.mode.global_alea.state){ alea_params(); }
    if(glo.nb_moves%keep_dir == 0){ one_alea_param(); }

    //if(glo.mode.follow.state){ formuleNoError(); }

    avatars.forEach(avatar => {
      avatar.last_x = avatar.x_tmp;
      avatar.last_y = avatar.y_tmp;

      if(avatar.it%60 == 0 && !glo.stopNear){ avatar.nearAvatars(); }

      if(resist == 0){ avatar.vx = 0; avatar.vy = 0; }

      avatar.interaction();

      if(glo.mode.follow.state){ avatar.follow(); }
      if(glo.mode.rotate.state){ avatar.rotate(); }
      if(glo.mode.orbite.state){ avatar.orbite(); }
      if(glo.spiral){ avatar.spiral(); }
      if(glo.trans.state){ avatar.trans(glo.trans.dir); }
      if(attract_mouse){ avatar.mouse_attract(); }

      avatar.vx += avatar.ax; avatar.vy += avatar.ay;

      if(resist > 1){
        let r = 1 + (resist / attract);
        avatar.vx /= r;
        avatar.vy /= r;
      }

      avatar.speed = avatar.speed_avatar();
      avatar.accel = avatar.accel_avatar();

      avatar.x_tmp += avatar.vx;
      avatar.y_tmp += avatar.vy;

      avatar.it++;
    });
    glo.trans.state = false;
    positionAvatars();
  }
  else if(attract_mouse){
    let keep_dir = glo.params.keep_dir;
    let dep_dir  = glo.params.dep_dir;
    let attract  = glo.params.attract;
    let resist   = glo.params.resist;
    let lim_out  = glo.lim_out;
    let style    = glo.style;

    if(glo.nb_moves%keep_dir == 0 && glo.mode.global_alea.state){ alea_params(); }
    if(glo.nb_moves%keep_dir == 0){ one_alea_param(); }

    avatars.forEach(avatar => {
      avatar.last_x = avatar.x_tmp;
      avatar.last_y = avatar.y_tmp;

      if(resist == 0){ avatar.vx = 0; avatar.vy = 0; }
      avatar.mouse_attract(pause);
      avatar.vx += avatar.ax; avatar.vy += avatar.ay;

      if(resist > 1){
        let r = 1 + (resist / attract);
        avatar.vx /= r;
        avatar.vy /= r;
      }

      avatar.speed = avatar.speed_avatar();
      avatar.accel = avatar.accel_avatar();

      avatar.x_tmp += avatar.vx;
      avatar.y_tmp += avatar.vy;
    });
    positionAvatars();
  }
  if(glo.nb_moves == 100){ glo.nb_moves = 0; }
  glo.nb_moves++;
  IDanimation = requestAnimationFrame(moveAvatars);
}

//------------------ PLACEMENT SELON UNE FORME DES AVATARS ----------------- //
function createForm(opt){ keepPause(function(){ var nb = glo.params.nb; deleteAvatar('all'); glo.params.nb = nb; createAvatar(opt); }); return false; }

function positionAvatars(){
  if(glo.mode.clear.state){ ctx.clearRect(0, 0, canvas.width, canvas.height); }

  var speed = 0; var speeds = []; var accel = 0;
  avatars.forEach(avatar => {
    if(glo.mode.collid_bord.state){ avatar.collidBorder(); }
    avatar.position();
    avatar.color_avatar();

    if(!glo.drawAltern || glo.nb_moves%glo.params.dep_dir == 0){ avatar.draw_avatar(); }

    speeds.push(avatar.speed);
    speed += avatar.speed;
    accel += avatar.accel;
  });

  glo.speed_max = Math.max(...speeds);

  glo.speed_moy = speed / avatars.length;
  glo.accel_moy = accel / avatars.length;
  if(glo.pause_tmp){ glo.mode.pause.state = true; glo.pause_tmp = false; }
}
//------------------ MENU DU CANVAS ----------------- //
function showMenu(pos = canvas.width - 300){
  glo.is_canvas_menu = true;

  canvas_menu.style.display  = 'block';
  canvas_menu.style.position = 'absolute';
  canvas_menu.style.left     = pos + 'px';
  canvas_menu.style.top      = '15px';
}
function hideMenu(){
  canvas_menu.style.display = 'none';
  glo.is_canvas_menu = false;
}
function createCanvasMenu(menu = glo.mode){
  while (canvas_menu_button.firstChild) {
  canvas_menu_button.removeChild(canvas_menu_button.firstChild);
  }
  for (var p in menu){
    let name  = p;
    let state = menu[p];
    let key   = '';
    if(typeof(menu[p]) == 'object'){
      name  = menu[p].name;
      state = menu[p].state;
      key   = typeof(menu[p].key) != 'undefined' ? menu[p].key : '';
    }

    var newButton  = document.createElement("button");

    var sp_txt = document.createElement("span");
    var sp_chk = document.createElement("span");
    var txt    = document.createTextNode(name + " (" + key + ")");
    var chk    = document.createTextNode('✓');

    sp_txt.appendChild(txt);
    sp_chk.appendChild(chk);

    name = typeof(menu[p]) == 'object' ? p : name;

    sp_chk.className     = 'check_button';
    sp_chk.id            = 'check_button_' + name;
    sp_chk.style.opacity = state ? '1' : '0';

    newButton.style.paddingBottom = '4px';
    newButton.appendChild(sp_txt);
    newButton.appendChild(sp_chk);

    newButton.setAttribute("onclick", "button_check('" + name + "'); ");

    canvas_menu_button.appendChild(newButton);
  }
}
//------------------ SHOW/HIDE CHECH IN MENU ----------------- //
function button_check(mode_prop, menu = glo.mode){
  if(typeof(menu[mode_prop]) != 'object'){ menu[mode_prop] = !menu[mode_prop]; }
  else{ menu[mode_prop]['state'] = !menu[mode_prop]['state']; }

  var sp_chk = document.getElementById('check_button_' + mode_prop);
  sp_chk.style.opacity = sp_chk.style.opacity == '0' ? '1' : '0';

  if(typeof(menu[mode_prop]) == 'object' && typeof(menu[mode_prop].callback) == 'function'){
    typeof(menu[mode_prop].callback_args) != 'undefined' ? menu[mode_prop].callback(menu[mode_prop].callback_args) : menu[mode_prop].callback();
  }
}
//------------------ AfFICHE UN MESSAGE TEMPORAIRE SUR LE CANVAS ----------------- //
function msg(txt, duration){
  if(glo.mode.clear.state){
    let pause = glo.mode.pause.state;
    glo.mode.pause.state = true;
    ctx.clearRect(0, 0, canvas.width, 60);
    ctx.fillStyle = "red";
    ctx.fillText(txt, 20, 40);
    setTimeout(function(){ if(!pause){glo.mode.pause.state = false;} }, duration);
  }
}
//------------------ MODIFICATION DE VARIABLES GLOBALES SUITE À ÉVÈNEMENT INPUT----------------- //
function updateGlo(ctrl){
  if(typeof(glo['params'][ctrl.id]) != 'undefined'){ glo['params'][ctrl.id] = parseFloat(ctrl.value); }
  else if(typeof(glo['params_suit'][ctrl.id]) != 'undefined'){ glo['params_suit'][ctrl.id] = parseFloat(ctrl.value); }

  ctrl.title = ctrl.value;
  if(ctrl.id == 'radius_attract'){ radius_attract(); }

  if(typeof(ctrl.last_vals) == 'undefined'){ ctrl.last_vals = []; }

  if(ctrl.last_vals.length > 1){ ctrl.last_vals.shift(); }

  ctrl.last_vals.push(ctrl.dataset.last_value);
  ctrl.dataset.last_value = ctrl.value;
}
//------------------ UPDATE ROTATE ANGLE----------------- //
function updRotateAngle(ctrl){
  if(ctrl.value > PI){ ctrl.value = PI; }
  let label = document.querySelector('[for="' + ctrl.id + '"]');
  let val = parseFloat(ctrl.value);
  let name = ctrl.dataset.label_name;
  label.textContent = name + " angle : " + Math.ceil(180 * val / PI);
}

function updateScale(ctrl){
  let last_val = parseFloat(ctrl.last_vals[ctrl.last_vals.length - 1]);
  let curval   = parseFloat(ctrl.value);
  let max      = parseFloat(ctrl.max);
  let mid      = parseFloat(ctrl.max/2);
  let dblmax   = parseFloat(ctrl.max*2);

  if(ctrl.max == 1){
    ctrl.max = ctrl.dataset.startMax; ctrl.step = ctrl.dataset.startStep; ctrl.value = ctrl.dataset.startValue;
  }
  else if(curval > 0){
    ctrl.max = curval > mid ? dblmax : mid;

    let new_max = parseFloat(ctrl.max);

    if(new_max < 1){ ctrl.step = .01; }
    ctrl.value = curval <= new_max ? last_val : new_max;
  }
  else{
    ctrl.max = 1; ctrl.step = .01; ctrl.value = .5;
  }
  ctrl.title = ctrl.value;
  glo.params[ctrl.id] = ctrl.value;
}

function radius_attract(){ glo.lim_dist = pow(pow(canvas.width, 2) + pow(canvas.height, 2), .5) / (256 / glo.params.radius_attract); }

function all_nearsAvatars(){  avatars.forEach(avatar => { avatar.nearAvatars(); })  }

//------------------ AJOUT OU SUPPRESSION D'ÉLÉMENT DE DESSIN ----------------- //
function nbAvatars(callback = verif_nb){
  let nb = parseInt(document.getElementById('nb').value);
  if(nb > glo.params.nb){ createAvatar({nb: nb - glo.params.nb, w: glo.size}); }
  else if(nb < glo.params.nb){ deleteAvatar(glo.params.nb - nb); }

  verif_nb();
}

function verif_nb(){
  let nb = parseInt(document.getElementById('nb').value);
  if(nb != glo.params.nb){ nbAvatars(nb); }

  msg(nb, 200);
}
//------------------ MODIFICATION DE LA TAILLE DES AVATARS ----------------- //
function updateSize(ctrl, alea = false){
  let last_val = ctrl.dataset.last_value;
  let val      = ctrl.value;

  var upd_val = 1;
  upd_val = val - last_val > 0 ? upd_val = val - last_val + 1 : upd_val = 1 / (last_val - val + 1);

  avatars.forEach(avatar => { avatar.size *= upd_val; });

  glo.size *= upd_val;
  ctrl.dataset.last_value = val;
}
//------------------ MODIFICATION DE LA TEINTE DES AVATARS ----------------- //
function updateTint(ctrl){
  let last_val = ctrl.dataset.last_value;
  let val      = ctrl.value;

  var upd_val = 1;
  upd_val = val - last_val > 0 ? upd_val = val - last_val + 1 : upd_val = 1 / (last_val - val + 1);

  updImage(data => {
    for (var i = 0; i < data.length; i += 4) {
      data[i]     *= upd_val;
      data[i + 1] *= upd_val;
      data[i + 2] *= upd_val;
    }
  });

  ctrl.dataset.last_value = val;
}
//------------------ MODIFICATION DE LA COULEUR DES AVATARS ----------------- //
function rotateColor(ctrl){
  updImage(data => {
    for (var i = 0; i < data.length; i += 4) {
      if(data[i] != 255 || data[i + 1] != 255 || data[i + 2] != 255){
        var pos = {x: data[i], y: data[i + 1], z: data[i + 2]};
    		pos = rotateByMatrix(pos, .1, .1, .1);

        data[i]     = parseInt(pos.x);
        data[i + 1] = parseInt(pos.y);
        data[i + 2] = parseInt(pos.z);
      }
    }
  });
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
  updImage(data => { let new_data = [];
    for (var i = 4; i < data.length; i += 4) {
      if(data[i - 4] != 255 || data[i - 3] != 255 || data[i - 2] != 255 || data[i - 1] != 255){
        new_data[i]     = (data[i - 4] + data[i] + data[i + 4]) / 3;
        new_data[i + 1] = (data[i - 3] + data[i + 1] + data[i + 5]) / 3;
        new_data[i + 2] = (data[i - 2] + data[i + 2] + data[i + 6]) / 3;
        new_data[i + 3] = (data[i - 1] + data[i + 3] + data[i + 7]) / 3;
      }
    }
    for (var i = 4; i < data.length; i += 4) {
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
  updImage(data => { let new_data = [];
    for (var i = 4; i < data.length; i += 4) {
      if(data[i - 4] != 255 || data[i - 3] != 255 || data[i - 2] != 255 || data[i - 1] != 255){
        new_data[i]     = data[i] * 3 - (data[i - 4] + data[i + 4]);
        new_data[i + 1] = data[i + 1] * 3 - (data[i - 3] + data[i + 5]);
        new_data[i + 2] = data[i + 2] * 3 - (data[i - 2] + data[i + 6]);
        new_data[i + 3] = data[i + 3] * 3 - (data[i - 1] + data[i + 7]);
      }
    }
    for (var i = 4; i < data.length; i += 4) {
      if(data[i - 4] != 255 || data[i - 3] != 255 || data[i - 2] != 255 || data[i - 1] != 255){
        data[i]     = new_data[i];
        data[i + 1] = new_data[i + 1];
        data[i + 2] = new_data[i + 2];
        data[i + 3] = new_data[i + 3];
      }
    }
  });
}
function greyColor(val){
  updImage(data => {
    let mod = val; let goToNumber = function(numGo, numToGo, k){ return numGo < numToGo ? numGo + ((numToGo - numGo) * k) : numGo - ((numGo - numToGo) * k); }
    data.forEach(c => {
      var colorMidName = 'r';
  		if((c.g < c.r && c.g > c.b) || (c.g > c.r && c.g < c.b)){ colorMidName == 'g'; }
  		else if((c.b < c.r && c.b > c.g) || (c.b > c.r && c.b < c.g)){ colorMidName == 'b'; }
  		if(colorMidName == 'r'){ c.b = goToNumber(c.b, c.r, mod); c.g = goToNumber(c.g, c.r, mod); }
  		else if(colorMidName == 'g'){ c.b = goToNumber(c.b, c.g, mod); c.r = goToNumber(c.r, c.g, mod); }
  		else{ c.r = goToNumber(c.r, c.b, mod); c.g = goToNumber(c.g, c.b, mod); }
  		c.r = c.r < 0 ? 0 : c.r; c.g = c.g < 0 ? 0 : c.g; c.b = c.b < 0 ? 0 : c.b;
  		c.r = c.r > 255 ? 255 : c.r; c.g = c.g > 255 ? 255 : c.g; c.b = c.b > 255 ? 255 : c.b;
    });
  }, false);
}
//------------------ MODIFICATION DE L'IMAGE ----------------- //
function updImage(func, simple = true){
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = simple ? imageData.data : arrColors(imageData.data);

  func(data);

  if(!simple){ simpleArr(data, imageData.data); }

  ctx.putImageData(imageData, 0, 0);
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
//------------------ RAZ ROTATE CANVAS----------------- //
function raz_rotate(){
  if(!glo.mode.rotate.state){
    ctx.rotate(-glo.mode.rotate.current_rotate);
    glo.mode.rotate.current_rotate = 0;
  }
}
//------------------ CHANGE L'ÉCHELLE ----------------- //
function scale_avatars(sign){
  let center = { x: canvas.width / 2, y: canvas.height / 2 };
  let div = 10;
  if(sign == '+'){
    avatars.forEach(avatar => {
      avatar.x_tmp -= (center.x - avatar.x)/div;
      avatar.y_tmp -= (center.y - avatar.y)/div;
      avatar.x      = avatar.x_tmp;
      avatar.y      = avatar.y_tmp;
    });
  }
  else{
    avatars.forEach(avatar => {
      avatar.x_tmp += (center.x - avatar.x)/div;
      avatar.y_tmp += (center.y - avatar.y)/div;
      avatar.x      = avatar.x_tmp;
      avatar.y      = avatar.y_tmp
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
function alea_params(){
  for(var param in glo.params){
    if(param != 'nb' && param != 'resist' && param != 'keep_dir' &&
       param != 'dep_dir' && param != 'upd_size' && param != 'brake_pow' && param != 'lim_line' && param != 'div_line'){
      let ctrl = document.getElementById(param);

      let ctrl_max = parseFloat(ctrl.max);
      let ctrl_val = parseFloat(ctrl.value);
      let grow     = ctrl_max / ctrl_val;
      let step     = parseFloat(ctrl.step);
      let alea_min = typeof(ctrl.dataset.alea_min) != 'undefined' ? parseFloat(ctrl.dataset.alea_min) : -1;

      let rnd_val = rnd() < 0.5 ? rnd() * grow : rnd();
      let new_val = ctrl_val * rnd_val;

      if(new_val <= alea_min){ new_val = alea_min; }

      ctrl.value = new_val;
      glo.params[param] = new_val;

      if(new_val > ctrl_max || new_val === Infinity || isNaN(new_val)){ ctrl.value = ctrl_max/2; glo.params[param] = parseFloat(ctrl_max/2); }
    }
  }
}
//------------------ ATTRIBUE DES VALEURS ALÉATOIRES AUX PARAMÉTRES DÉCLENCHEMENT CLICK DROIT ----------------- //
function one_alea_param(){
  for(var param in glo.params_alea){
    if(glo.params_alea[param]){
      let ctrl = document.getElementById(param);

      let ctrl_max = parseFloat(ctrl.max);
      let ctrl_val = parseFloat(ctrl.value);
      let grow     = ctrl_max / ctrl_val;
      let step     = parseFloat(ctrl.step);
      let alea_min = typeof(ctrl.dataset.alea_min) != 'undefined' ? parseFloat(ctrl.dataset.alea_min) : -1;

      let rnd_val = rnd() < 0.5 ? rnd() * grow : rnd();
      let new_val = ctrl_val * rnd_val;

      if(new_val <= alea_min){ new_val = alea_min; }

      ctrl.value = new_val;

      let event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });
      ctrl.dispatchEvent(event);

      if(new_val > ctrl_max || new_val === Infinity || isNaN(new_val)){ ctrl.value = ctrl_max/2; glo.params[param] = parseFloat(ctrl_max/2); }
    }
  }
}

//------------------ PARAMÉTRAGES PARTICULIERS ----------------- //
function glo_params(style = 'gravity'){
  switch(style){
    case 'gravity':
      var params = {
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
      var params = {
        attract: 0,
        radius_attract: 1,
        same_dir: 0,
      };
      if(glo.mode.collid_bord.state){ button_check('collid_bord'); }
      break;
    case 'stars':
      var params = {
        keep_dir: 0,
        brake_pow: 2.12,
        attract: 4800,
        radius_attract: 2,
        dep_dir: 0,
        upd_size: 5,
        same_dir: 0,
        resist: 0,
        alpha_color: .38,
        lim_line: 12,
        div_line: 0,
        max_color: 500,
        tint_color: 4,
      };
      glo.bg_black = true;
      glo.numLineCap = 1;
      glo.mode.alpha.state = true;
      canvas.style.backgroundColor = '#000';
      glo.form = 'line';
      break;
  }

  Object.entries(params).forEach(([key, val]) => {
    glo.params[key] = val;
    var ctrl = document.getElementById(key);
    ctrl.value = val;
  });

  radius_attract();
}

//------------------ VIEW CENTER OF CANVAS ----------------- //
function view_center(){
  let center = { x: canvas.width / 2, y: canvas.height / 2 };

  ctx.beginPath();
  ctx.fillStyle = 'rgb(255,0,0,1)';
  ctx.arc(center.x, center.y, 1, 0, 2 * PI, false);
  ctx.fill();
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
  let exp_json = document.getElementById('export_json');

	if(objectUrl) { window.URL.revokeObjectURL(objectUrl); }

	var filename = exp_json.value;
	var exportFormat = 'json';
  if (filename.toLowerCase().lastIndexOf("." + exportFormat) !== filename.length - exportFormat.length || filename.length < exportFormat.length + 1){
      filename += "." + exportFormat;
  }

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
  var file_to_read = document.getElementById("import_json").files[0];
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var content = e.target.result;
    var contentJsonFile = JSON.parse(content);
    glo = contentJsonFile;
    params_interface();
    upd_mode();
  };
  fileread.readAsText(file_to_read);
  glo.import_json = false;
  showHideCtrl(import_json);
}
//------------------ IMPORT JSON ----------------- //
function impt_image(event){
  if(!glo.mode.pause.state){ button_check('pause'); }
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var img = new Image();
    img.onload = function(){
        ctx.drawImage(img,0,0);
    }
    img.src = e.target.result;
  };
  fileread.readAsDataURL(event.target.files[0]);
  glo.import_image = false;
  showHideCtrl(import_image);
}
//------------------ CHEK MENU WITH GLO.MODE ----------------- //
function upd_mode(){
  Object.entries(glo.mode).forEach(([mode_prop, val]) => {
    var sp_chk = document.getElementById('check_button_' + mode_prop);
    sp_chk.style.opacity = glo.mode[mode_prop].state ? '1' : '0';

    if(typeof(glo.mode[mode_prop]) == 'object' && typeof(glo.mode[mode_prop].callback) == 'function'){
      typeof(glo.mode[mode_prop].callback_args) != 'undefined' ? glo.mode[mode_prop].callback(glo.mode[mode_prop].callback_args) : glo.mode[mode_prop].callback();
    }
  });
}

//------------------ CANVAS PICKER COLOR UPD CANAVS BG----------------- //
function canvas_bg_upd(ctrl){ canvas.style.backgroundColor = ctrl.value; }

//------------------ CANVAS DOWNLOAD IMAGE ----------------- //
function downloadCanvas(){
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = canvas.style.backgroundColor == '' ? 'white' : canvas.style.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  draw_avatars();

  let canvas_href = canvas.toDataURL("image/png");
  let a = document.createElement('a');

  a.download = "canvas.png";
  a.href = canvas_href;

  a.click();
}

//------------------ GARDE LA PAUSE ----------------- //
function keepPause(func, param = null) {
  var nb    = glo.params.nb;
  var pause = glo.mode.pause.state;
  if(pause){ glo.mode.pause.state = false; }
  func(param);
  if(pause){ glo.pause_tmp = true; }

  return false;
}
