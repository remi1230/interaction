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

  let pos_y = 100;
  txts.forEach(txt => {
    ctxStructure.fillText(txt, 20, pos_y);
    pos_y+=20;
  });
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

function razParams(){
  deleteAvatar(activeGlo.params.nb);
  let modifiersSave = activeGlo.modifiers;
  activeGlo = new Glob();
  params_interface(false);
  activeGlo.center = canvas.getCenter();
  activeGlo.modifiers = modifiersSave;
  for(let prop in activeGlo.params){
    if(inputsUpdModProp[prop]){
      getSelectedModifiers().forEach(mod => {
        mod[inputsUpdModProp[prop]] = activeGlo.params[prop];
        mod.glo.params[prop] = activeGlo.params[prop];
        mod.params[prop] = activeGlo.params[prop];
      });
    }
  }
  raz_avatars();
}

function createGoInterface(){
  let interfaces = [...document.getElementsByClassName('interface')];
  interfaces.forEach((interface, i) => {
    let div = document.createElement("div");
    let txt = document.createTextNode(i+1);
    div.appendChild(txt);

    let isActive = i == 0 ? ' active' : '';

    div.className    = 'goInterface' + isActive;
    div.id           = 'goInterface_' + i;

    div.setAttribute("onclick", "showInterface(" + i + "); ");

    getById('goInterFaceContainer').appendChild(div);
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

function switchBg(){
  activeGlo.canvasLoveBg.state = !activeGlo.canvasLoveBg.state;
  if(activeGlo.canvasLoveBg.state){
    activeGlo.canvasLoveBg.save  = canvas.style.backgroundColor;
    canvas.style.backgroundColor = activeGlo.canvasLoveBg.color;
  }
  else{
    canvas.style.backgroundColor = activeGlo.canvasLoveBg.save;
  }

  document.getElementById('switchBgButton').textContent = !activeGlo.canvasLoveBg.state ? '☀️' : '🌙';
}

function switchPersist(){
  activeGlo.clear = !activeGlo.clear;
  window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'²', 'ctrlKey' : false, 'altKey' : false}));
  window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'F2', 'ctrlKey' : false, 'altKey' : false}));
  document.getElementById('switchPersistButton').textContent = !activeGlo.clear ? '✍️' : '🖐️';
}

function switchPause(){
  activeGlo.totalBreak = !activeGlo.totalBreak;
  document.getElementById('switchPauseButton').textContent = !activeGlo.totalBreak ? '▶️' : '⏸️';
}

function switchSroke(){
  activeGlo.strokeAndFill = !activeGlo.strokeAndFill;
  getSelectedModifiers().forEach(mod => { mod.glo.strokeAndFill = activeGlo.strokeAndFill; } );
  document.getElementById('switchStrokeIcon').classList = !activeGlo.strokeAndFill ? "fillRound" : "fillAndStrokeRound";
}

function switchGrid(){
  activeGlo.gridsType.next();
}

function testAll(withMods = true){
  if(withMods){ activeGlo.modifiers = []; }
              
  if(!activeGlo.randomPointByMod){ window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'V', 'ctrlKey' : false, 'altKey' : false})); }
  keepBreak(glo_params, 'test');
  clear();

  window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'²', 'ctrlKey' : false, 'altKey' : false}));
  if(!activeGlo.shortcut.alphaVarSize){ window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'F2', 'ctrlKey' : false, 'altKey' : false})); }
  if(withMods){
    window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'y', 'ctrlKey' : true, 'altKey' : false}));
  }
  if(activeGlo.clear){
    activeGlo.clear = !activeGlo.clear;
    document.getElementById('switchPersistButton').textContent = !activeGlo.clear ? '✍️' : '🖐️';
  }
  
  if(!withMods){
    activeGlo.randomPointByMod = true;
    activeGlo.params.rAleaPos  = 0.2;
    getSelectedModifiers().forEach(mod => {
      mod.glo.params.rAleaPos  = 0.2;
      mod.glo.randomPointByMod = true;
    });
  } 
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

function makeDialog(options = { style: {width: '50%', height: '50%'} }, content, closeOrRemove = 'remove', isOpInput = true){
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

  let numId = parseInt(rnd() * 32000); 

  let opInput = "<div>";
  opInput += "<label for='dialogOpacity_" + numId + "'>Opacité</label>";
  opInput += "<input type='range' id='dialogOpacity_" + numId + "' name='dialogOpacity_" + numId + "' class='input_help'";
  opInput += " oninput='this.parentElement.parentElement.parentElement.style.opacity = this.value;  ' onchange='event.stopPropagation(); ' onclick='event.stopPropagation(); '";
  opInput += " min='0.01' max='1' value='1' step='.01'>"
  opInput += "</div>";

  content = "<div class='dialogContentContainer' onclick='event.stopPropagation(); '>" + (isOpInput ? opInput : '') +  content + "</div>";

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

function makeInfosArrObjsDialog(arrObjs, isSorted = false, newDir = 'none', idDial = false, title){
  if(typeof arrObjs === 'string'){
    arrObjs = arrObjs.replaceAll('///', '\"');
    arrObjs = JSON.parse(arrObjs);
  }

  let idDialog = !idDial ? ('infosDialog_' + parseInt(rnd() * 32000)) : idDial;

  let infsObjs = infosArrObjs(arrObjs, isSorted, newDir);

  let arrObjsString = JSON.stringify(arrObjs);
  arrObjsString = arrObjsString.replace(/\"/g, '///');

  let limNbProps = 20;
  infsObjs.propsInObjs = infsObjs.propsInObjs.slice(0, limNbProps);
  infsObjs.infosObjs.forEach((_infObj, i) => { infsObjs.infosObjs[i] = infsObjs.infosObjs[i].slice(0, limNbProps); });

  let content   = "<h1 style='text-align: center; '>" + title + "</h1>";
  content      += "<table style='width: 100%; border-collapse: collapse; '>";
  content      += "<thead style='border-bottom: 1px #ccc solid; '>";
  content      += "<tr>";
  infsObjs.propsInObjs.forEach(propInObj => { content += `<th class="thHelpInfo sort_${isSorted === propInObj ? newDir : 'none' }" ${isSorted === propInObj ? "data-sortdir='" + newDir + "' " : "data-sortdir='none' " } onclick="makeInfosArrObjsDialog('${arrObjsString}', this.textContent, this.dataset.sortdir !== 'none' && this.dataset.sortdir === 'asc' ? 'desc' : 'asc', '${idDialog}', '${title}'); ">${propInObj}</th>`; });
  content      += "</tr>";
  content      += "</thead>";
  content      += "<tbody style='text-align: center; '>";
  infsObjs.infosObjs.forEach(infObj => {
    content += "<tr onclick='trSelect(this); ' onmouseenter=\"addClasses(this, 'flyOnTr'); \" onmouseleave=\"removeClasses(this, 'flyOnTr'); \">";
    infObj.forEach( infOb => {
      let val = typeof infOb.val === 'number' ? round(infOb.val, 2) : infOb.val;
      content += `<td>${val}</td>`;
    });
    content += "</tr>";
  });
  content      += "</tbody>";
  content      += "</table>";

  if(!isSorted){
    let infosDialog = makeDialog(options = {style: {width: '95%', height: '77%'}, id: idDialog}, content);
    return infosDialog;
  }

  content = "<div class='dialogContentContainer' onclick='event.stopPropagation(); '>" + content + "</div>";
  getById(idDialog).innerHTML = content;
  return content;
}

function infosArrObjs(arrObjs, isSorted, newDir){
  let infosObjs   = [];
  let propsInObjs = allInfosArr(arrObjs[0]).map(p => p.prop);

  if(propsInObjs){
    arrObjs.forEach(obj => { infosObjs.push(allInfosArr(obj, propsInObjs)); });
    if(isSorted){ sortInfosArray(infosObjs, isSorted, newDir); }
    return {infosObjs, propsInObjs};
  }
  return false;
}

function allInfosArr(obj, propsInObj = false){
  if(obj){
    let props = [];
    for(let prop in obj){
      if(!propsInObj || propsInObj.includes(prop)){
        let val = typeof obj[prop] !== 'object' ? obj[prop] : JSON.stringify(obj[prop]);
        props.push({prop: prop, val: val, typeof: typeof obj[prop]});
      }
    }
    return props;
  }
  return [];
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
  let limNbProps  = 19;
  let infsAvatars = infosAvatars(isSorted, newDir, 20);

  infsAvatars.propsInAvs = infsAvatars.propsInAvs.slice(0, limNbProps);

  let ind = infsAvatars.propsInAvs.indexOf('speed');
  infsAvatars.propsInAvs.splice(ind+1, 0, "speed_rel");

  let content   = "<header style='position: sticky; '>";
  content      += "<h1 style='text-align: center; '>";
  content      += "<button type='button' class='helpMajButton' onclick=\"makeInfosAvatarsDialog(false, 'none', true); \">↺</button>Infos sur les avatars</h1></header>";
  content      += "<table style='width: 100%; border-collapse: collapse; font-size: 12px; '>";
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
    let infosDialog = makeDialog(options = {style: {width: '95%', height: '77%'}, id: 'infosAvatarsDialog'}, content, '', false);
    return infosDialog;
  }

  content = "<div class='dialogContentContainer' onclick='event.stopPropagation(); '>" + content + "</div>";
  getById('infosAvatarsDialog').innerHTML = content;
  return content;
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

function sortInfosArray(infosMods, prop, dir = 'asc'){
  let numProp = 0;
  for(let i = 0; i < infosMods[0].length; i++){
    if(infosMods[0][i].prop === prop){ numProp = i; break; }
  }
  return dir === 'asc' ?
                       infosMods.sort((arr1, arr2) => {
                        let val1 = typeof arr1[numProp].val !== 'boolean' ? arr1[numProp].val : (arr1[numProp].val ? 1 : 0);
                        let val2 = typeof arr2[numProp].val !== 'boolean' ? arr2[numProp].val : (arr2[numProp].val ? 1 : 0);

                        return parseFloat(val1) - parseFloat(val2);
                       }) :
                       infosMods.sort((arr1, arr2) => {
                        let val1 = typeof arr1[numProp].val !== 'boolean' ? arr1[numProp].val : (arr1[numProp].val ? 1 : 0);
                        let val2 = typeof arr2[numProp].val !== 'boolean' ? arr2[numProp].val : (arr2[numProp].val ? 1 : 0);

                        return parseFloat(val2) - parseFloat(val1);
                       }) 
}

function toggleArrObjsDialog(arrObjs, title){
  let infosObjsDialog = getById('infosObjsDialog');
  if(infosObjsDialog){ infosObjsDialog.remove(); }
  else{
    let infosObjsDialog = makeInfosArrObjsDialog(arrObjs, false, 'none', false, title);
    infosObjsDialog.addEventListener("close", (event) => {
      activeGlo.infosObjsDialog = false;
    });
    infosObjsDialog.showModal();
  }
}

function resizeUI(cv = structure){
  const canvasHeight = cv.height;

  const canvasNormalizeWidth = canvasHeight * SIXTEEN_ON_NINE;
  const windowWidth          = document.getElementsByTagName('body')[0].clientWidth;
  const uiWidth              = windowWidth - canvasNormalizeWidth;

  if(uiWidth > 200 && uiWidth < 300){ ui.style.width = `${Math.abs(uiWidth)}px`; }
}

//------------------ DEFINE CENTER ----------------- //
function defineCenter(byMouse = true, define = false){
  let cent;
  if(define){
    cent = byMouse ? {x: mouse.x, y: mouse.y} : getRandomPoint(0.75);

    if(activeGlo.grid.draw){ cent = posOnGrid(cent, activeGlo.gridType); }

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
  div.style.left     = e.offsetX + 'px';
  div.style.top      = ctrl.offsetTop +  7 + 'px';
  div.style.color    = '#888';

  let txt = document.createTextNode('▲');

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