
/**
 * @typedef {import('./avatar.js').Avatar} Avatar
 */

/**
 * @description Initialise les contrôles de paramètres pour l'objet de paramètres donné.
 *
 * Parcourt chaque paire clé-valeur de l'objet `objParam` fourni et appelle `param_ctrl`
 * pour configurer le contrôle d'interface utilisateur correspondant. Par défaut, utilise `activeGlo.params` comme objet de paramètres.
 *
 * @param {boolean} [onLoad=true] - Indique si la fonction est appelée lors du chargement initial.
 * @param {Object} [objParam=activeGlo.params] - L'objet de paramètres dont les entrées seront utilisées pour créer les contrôles.
 * @memberof module:ui
 */
function params_interface(onLoad = true, objParam = activeGlo.params){
  Object.entries(objParam).forEach(([key, val]) => { param_ctrl(val, key, onLoad); });
}

/**
 * @description Initialise et met à jour un élément de contrôle d'interface utilisateur avec la valeur donnée.
 * @param {*} val - La valeur à affecter au contrôle.
 * @param {string} id_ctrl - L'identifiant du contrôle.
 * @param {boolean} [onLoad=true] - Indique si la fonction est appelée lors du chargement initial.
 * @memberof module:ui
 */
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

/**
 * @description Met à jour le label associé à un input.
 * @param {HTMLElement} input - L'élément input à mettre à jour.
 * @memberof module:ui
 */
function updLabel(input){
  let label = document.querySelector('[for="' + input.id + '"]');
  if(label){
    let txt = !input.dataset.labels ? input.value : gloStart[input.dataset.labels][input.value];
    label.textContent = input.dataset.label + " : " + txt;
    input.title = txt;
  }
}

//------------------ AFFICHE UN MESSAGE TEMPORAIRE SUR LE CANVAS ----------------- //
/**
 * @description Affiche un ou plusieurs messages temporaires sur le canvas.
 * @param {...string} txts - Les messages à afficher.
 * @memberof module:ui
 */
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
 * @description Crée des cases à cocher HTML.
 * @param {[]} checkboxes - Tableau des propriétés.
 * @param {string} containerId - L'id du conteneur des cases à cocher.
 * @param {string} checked - L'id de la case à cocher par défaut.
 * @param {{event:string, func: string}} evtCheck - L'événement des cases à cocher HTML.
 * @memberof module:ui
 */
function createCheckboxesWithRange(checkboxes, containerId, checked, evtCheck){
  let container = getById(containerId);
  checkboxes.forEach(checkbox => {
    container.appendChild(createCheckboxWithRange(checkbox, checkbox, checkbox != checked ? false : true, evtCheck));
  });
}

/**
 * @description Crée un élément div conteneur contenant une case à cocher avec label et un input de type range.
 *
 * @param {string} checkTxt - Le texte du label pour la case à cocher.
 * @param {string} id - L'id à assigner à l'input checkbox.
 * @param {boolean} [checked=false] - Si la case à cocher doit être cochée par défaut.
 * @param {{event: string, func: string}} [evtCheck={event: 'onchange', func: 'return false'}] - L'événement et la fonction pour la checkbox.
 * @param {{event: string, func: string}} [evtRange={event: 'oninput', func: 'updateGloRangeCmlColor(this);'}] - L'événement et la fonction pour le range.
 * @returns {HTMLDivElement} Le div conteneur avec la case à cocher et le range.
 * @memberof module:ui
 */
function createCheckboxWithRange(
  checkTxt,
  id,
  checked = false,
  evtCheck = {event: 'onchange', func: 'return false'},
  evtRange = {event: 'oninput', func: 'updateGloRangeCmlColor(this);'}
) {
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


/**
 * @description
 * Réinitialise les paramètres globaux et l'interface utilisateur à leur état initial.
 * 
 * Cette fonction effectue les actions suivantes :
 * - Supprime les avatars existants selon les paramètres globaux courants.
 * - Sauvegarde les modificateurs actuels.
 * - Réinitialise l'objet global (`activeGlo`) et les paramètres UI sans déclencher l'événement `onLoad`.
 * - Définit le centre de l'objet global au centre du canvas.
 * - Restaure les modificateurs sauvegardés dans le nouvel objet global.
 * - Met à jour les propriétés des modificateurs selon les nouveaux paramètres.
 * - Réinitialise les avatars.
 *
 * @returns {void}
 * @memberof module:ui
 */
function razParams(){
  // Supprime les avatars existants
  deleteAvatar(activeGlo.params.nb);

  // Sauvegarde les modificateurs actuels
  let modifiersSave = activeGlo.modifiers;

  // Réinitialise l'objet global
  activeGlo = new Glob();

  // Réinitialise l'interface des paramètres sans déclencher onLoad
  params_interface(false);

  // Redéfinit le centre sur le canvas
  activeGlo.center = canvas.getCenter();

  // Restaure les modificateurs sauvegardés
  activeGlo.modifiers = modifiersSave;

  // Met à jour les propriétés des modificateurs selon les nouveaux paramètres
  for(let prop in activeGlo.params){
    if(inputsUpdModProp[prop]){
      getSelectedModifiers().forEach(mod => {
        mod[inputsUpdModProp[prop]] = activeGlo.params[prop];
        mod.glo.params[prop] = activeGlo.params[prop];
        mod.params[prop] = activeGlo.params[prop];
      });
    }
  }

  // Réinitialise les avatars
  raz_avatars();
}

/**
 * @description Crée une interface de navigation entre les éléments HTML de classe "interface".
 * @returns {void}
 * @memberof module:ui
 */
function createGoInterface(){
  let interfaces = [...document.getElementsByClassName('interface')];
  interfaces.forEach((it, i) => {
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

function switchAvatarsFormules(){
  window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'I', 'ctrlKey' : false, 'altKey' : false})); 
  getById('switchAvFormulesButton').textContent = activeGlo.formuleColorMode ? 'ON' : 'OFF';
}

/**
 * @description Met à jour un paramètre global et propage la valeur aux modificateurs sélectionnés ainsi qu’aux contrôles liés.
 * @param {HTMLInputElement} ctrl - L’élément de formulaire dont la valeur est appliquée.
 * @returns {void}
 * @memberof module:ui
 */
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
 * @description Met à jour la forme active dans le contexte global et la propage aux modificateurs sélectionnés.
 * @param {string|number} val - Identifiant ou index de la forme à appliquer.
 * @returns {void}
 * @memberof module:ui
 */
function updateForm(val){
  let form       = activeGlo.forms[val];
  activeGlo.form = form;

  getSelectedModifiers().forEach(mod => { mod.glo.form = form; });
}

/**
 * @description Met à jour la valeur d’un paramètre de couleur cumulée (rangesCmlColor) et la propage aux modificateurs sélectionnés.
 * @param {HTMLInputElement} ctrl - L’élément input dont la valeur numérique est utilisée.
 * @returns {void}
 * @memberof module:ui
 */
function updateGloRangeCmlColor(ctrl){
  let val = parseFloat(ctrl.value);

  activeGlo.rangesCmlColor[ctrl.id] = val;
  activeGlo.fromUpdGlo = true;

  getSelectedModifiers().forEach(mod => { mod.glo.rangesCmlColor[ctrl.id] = val; mod.glo.fromUpdGlo = true; });
}

/**
 * @description Met à jour un contrôle HTML à partir des valeurs de `activeGlo.params` (bornes min/max, valeur, label).
 * @param {string} ctlr_id - L'id du contrôle à synchroniser.
 * @returns {void}
 * @memberof module:ui
 */
function updCtrl(ctlr_id){
  let ctrl = getById(ctlr_id);
  if(ctrl.max < activeGlo.params[ctlr_id]){ ctrl.max = 2 * activeGlo.params[ctlr_id]; }
  if(ctrl.min > activeGlo.params[ctlr_id]){ ctrl.min = 2 * activeGlo.params[ctlr_id]; }
  ctrl.value = activeGlo.params[ctlr_id];
  updLabel(ctrl);
}

/**
 * @description Met à l’échelle la plage d’un contrôle (min/max/step) en fonction de sa valeur courante et de son historique, puis met à jour `activeGlo.params`.
 * @param {HTMLInputElement} ctrl - Le contrôle (input range/number) dont on adapte l’échelle.
 * @param {Event} e - L’événement d’entrée à stopper (propagation).
 * @returns {void}
 * @memberof module:ui
 */
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

/**
 * @description Dessine le pictogramme (logo) d’un modificateur sur le canvas de structure selon son type et son état (sélection, paramètres, angle).
 * @param {Object} mod - Le modificateur à représenter (ex. { x, y, type, select, nbEdges, attract, params, ... }).
 * @param {string} style - La couleur/stratégie de tracé (strokeStyle) à appliquer.
 * @param {number} [angle=0] - Angle de référence (radians) à utiliser pour certains types (director, oscillator, etc.).
 * @returns {void}
 * @memberof module:ui
 */
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

/**
 * @description Affiche un cercle/ellipse indicateur sur le canvas de structure autour d’un centre donné (ou déterminé automatiquement).
 * @param {{x:number, y:number}} [cent] - Centre de l’ellipse ; s’il est omis, il est déduit du contexte (centre défini, souris, etc.).
 * @returns {void}
 * @memberof module:ui
 */
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

/**
 * @description Affiche/masque l’interface (UI) et repositionne le conteneur dans le DOM ; met à jour l’icône de bascule.
 * @param {HTMLElement} [cont] - Conteneur de l’interface à déplacer.
 * @param {HTMLElement} [toggInt] - Bouton/élément de bascule dont le texte (▲/▼) est mis à jour.
 * @returns {void}
 * @memberof module:ui
 */
function showHideInterface(cont = containerInt, toggInt = toggleInt){
  activeGlo.uiDisplay = !activeGlo.uiDisplay;
  ui.style.display    = !activeGlo.uiDisplay ? 'none' : '';

  if(!activeGlo.uiDisplay){ document.getElementsByTagName('body')[0].insertBefore(cont, null); }
  else{ ui.insertBefore(cont, null); }

  cont.style.top      = !activeGlo.uiDisplay ? "0%" : "90%";
  toggInt.textContent = !activeGlo.uiDisplay ? "▼" : "▲";
}

/**
 * @description Affiche des informations (stats, état) sur le canvas de structure.
 * @returns {void}
 * @memberof module:ui
 */
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

/**
 * @description Affiche ou masque un contrôle donné dans le conteneur de contrôles du canvas.
 * @param {HTMLElement} ctrl_var - Le contrôle HTML à afficher ou masquer.
 * @returns {void}
 * @memberof module:ui
 */
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

/**
 * @description Attribue la couleur de fond au canvas courant.
 * @returns {void}
 * @memberof module:ui
 */
function canvasBg(){
  canvas.style.backgroundColor = activeGlo.theme.getBg();
}

/**
 * @description Bascule la couleur de fond du canvas entre la couleur sauvegardée et la couleur définie dans `activeGlo.canvasLoveBg`.
 * @returns {void}
 * @memberof module:ui
 */
function switchBg(){
  activeGlo.theme.switchBg();
  canvasBg();

  document.getElementById('switchBgButton').textContent = !activeGlo.theme.isDark() ? '☀️' : '🌙';
}

/**
 * @description Switch entre le fond d'écran actuel et automatique.
 * @returns {void}
 * @memberof module:ui
 */
function switchAutoBg(){
  activeGlo.updBgToAvColor = !activeGlo.updBgToAvColor;

  if(!activeGlo.updBgToAvColor){
    canvasBg();
  }
}

/**
 * @description Active ou désactive la persistance (clear) de l’affichage, met à jour l’UI et déclenche les raccourcis clavier associés.
 * @returns {void}
 * @memberof module:ui
 */
function switchPersist(){
  activeGlo.clear = !activeGlo.clear;
  window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'²', 'ctrlKey' : false, 'altKey' : false}));
  window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'F2', 'ctrlKey' : false, 'altKey' : false}));
  document.getElementById('switchPersistButton').textContent = !activeGlo.clear ? '✍️' : '🖐️';
}

/**
 * @description Met en pause ou relance l’animation (break global), met à jour l’icône correspondante.
 * @returns {void}
 * @memberof module:ui
 */
function switchPause(){
  activeGlo.totalBreak = !activeGlo.totalBreak;
  document.getElementById('switchPauseButton').textContent = !activeGlo.totalBreak ? '▶️' : '⏸️';
}

/**
 * @description Bascule entre les modes de rendu `stroke` et `stroke+fill` pour les modificateurs sélectionnés.
 * @returns {void}
 * @memberof module:ui
 */
function switchSroke(){
  activeGlo.strokeAndFill = !activeGlo.strokeAndFill;
  getSelectedModifiers().forEach(mod => { mod.glo.strokeAndFill = activeGlo.strokeAndFill; } );
  document.getElementById('switchStrokeIcon').classList = !activeGlo.strokeAndFill ? "fillRound" : "fillAndStrokeRound";
}

/**
 * @description Passe au type de grille suivant (rotation cyclique via `next()`).
 * @returns {void}
 * @memberof module:ui
 */
function switchGrid(){
  activeGlo.gridsType.next();
}

/**
 * @description Les avatars sont déplacés régulièrement au hasard ou pas.
 * @returns {void}
 * @memberof module:ui
 */
function switchMoveOnAlea(){
  activeGlo.moveOnAlea = !activeGlo.moveOnAlea;
  getSelectedModifiers().forEach(mod => { mod.glo.moveOnAlea = activeGlo.moveOnAlea; } );
}

/**
 * @description Effectue un test global de l’application (avec ou sans modificateurs), en réinitialisant certains paramètres et déclenchant des raccourcis clavier.
 * @returns {void}
 * @memberof module:test
 */
function testAll(){
  activeGlo.modifiers = [];
              
  if(!activeGlo.randomPointByMod){ window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'V', 'ctrlKey' : false, 'altKey' : false})); }
  keepBreak(glo_params, 'test');
  clear();

  window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'²', 'ctrlKey' : false, 'altKey' : false}));
  if(!activeGlo.shortcut.alphaVarSize){ window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'F2', 'ctrlKey' : false, 'altKey' : false})); }
  window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'y', 'ctrlKey' : true, 'altKey' : false}));

  if(activeGlo.clear){
    activeGlo.clear = !activeGlo.clear;
    document.getElementById('switchPersistButton').textContent = !activeGlo.clear ? '✍️' : '🖐️';
  }
  
  activeGlo.randomPointByMod = true;
  activeGlo.params.rAleaPos  = 0.2;
  getSelectedModifiers().forEach(mod => {
    mod.glo.params.rAleaPos  = 0.2;
    mod.glo.randomPointByMod = true;
  });
}

/**
 * @description Déclenche une séquence de commandes pour préparer et lancer le mode "peinture".
 * @fires KeyboardEvent - Déclenche des événements `keydown` simulant
 * les touches `V`, `²` et `F2`.
 *
 * @see keepBreak
 * @see clear
 * @see getSelectedModifiers
 */
function paint(){ 
  switchPersist();
  posAvMod();
  keepBreak(glo_params, 'test');
  clear();
}

/**
 * @description Switch entre un mode avec les avatars autour des modifers uniquement ou non.
 * @see updateGlo
 */
function posAvMod(dispatch = true){
  activeGlo.posAvMod = !activeGlo.posAvMod;

  let rAleaPos = getById('rAleaPos');
  rAleaPos.value = activeGlo.posAvMod ? 0.2 : rAleaPos.startValue;
  updateGlo(rAleaPos);

  if(dispatch){ window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'V', 'ctrlKey' : false, 'altKey' : false})); }
}

/**
 * @description Affiche l’interface spécifiée et met à jour la classe `active` sur le bouton correspondant.
 * @param {number} numInterface - L’index de l’interface à afficher.
 * @returns {void}
 * @memberof module:ui
 */
function showInterface(numInterface){
  let interfacesLength = interfaces.length;

  activeGlo.num_params = numInterface;

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
 * @description Change l’interface active dans un sens donné (+ ou -) et appelle `showInterface`.
 * @param {'+'|'-'} dir - La direction du changement (suivant ou précédent).
 * @returns {void}
 * @memberof module:ui
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

/**
 * @description Active/désactive le mode “source” d’un input à lier et marque visuellement l’input courant.
 * @returns {boolean} - `true` si une entrée focalisée a été traitée, sinon `false`.
 * @memberof module:ui
 */
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

/**
 * @description Lie l’input “source” courant à un autre input (cible) avec un signe (positif/négatif), ou annule le lien.
 * @param {boolean} [positive=true] - Indique si la liaison est positive (`true`) ou négative (`false`).
 * @returns {boolean} - `true` si une entrée focalisée a été traitée, sinon `false`.
 * @memberof module:ui
 */
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

/**
 * @description Active/désactive le contrôle d’un input sélectionné par le mouvement de la souris.
 * @returns {boolean} - `true` si une entrée focalisée a été traitée, sinon `false`.
 * @memberof module:ui
 */

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

/**
 * @description Applique une fonction sur l’input actuellement survolé/focalisé (dataset.focus==='true').
 * @param {Function} func - Fonction callback appelée avec l’input courant (et les arguments supplémentaires).
 * @param {...*} [args] - Arguments additionnels transmis au callback.
 * @returns {boolean} - `true` si un input a été trouvé et traité, sinon `false`.
 * @memberof module:ui
 */
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

/**
 * @description Supprime le caractère/élément décoratif associé à un input (ex. icône de liaison).
 * @param {HTMLElement} ctrl - Contrôle (input) concerné.
 * @param {string} endId - Suffixe d’identifiant de l’élément à retirer.
 * @returns {void}
 * @memberof module:ui
 */
function clearCharOnInput(ctrl, endId){
  getById(ctrl.id + '_' + endId).remove();
}

/**
 * @description Ajuste dynamiquement la largeur de l’UI en fonction de la taille du canvas (16:9).
 * @param {HTMLCanvasElement} [cv=structure] - Canvas de référence.
 * @returns {void}
 * @memberof module:ui
 */
function resizeUI(cv = structure){
  const canvasHeight = cv.height;

  const canvasNormalizeWidth = canvasHeight * SIXTEEN_ON_NINE;
  const windowWidth          = document.getElementsByTagName('body')[0].clientWidth;
  const uiWidth              = windowWidth - canvasNormalizeWidth;

  if(uiWidth > 200 && uiWidth < 300){
    ui.style.width = `${Math.abs(uiWidth)}px`;
    getById('actionsContainer').style.width = `${Math.abs(uiWidth) - 72}px`;
  }
}

/**
 * @description Définit le centre global (par la souris, aléatoire ou centre du canvas) et le propage aux avatars.
 * @param {boolean} [byMouse=true] - Si vrai, utilise la souris (quand `define` est vrai).
 * @param {boolean} [define=false] - Si vrai, calcule et fixe un nouveau centre ; sinon centre du canvas.
 * @returns {{x:number,y:number}} Le centre défini.
 * @memberof module:glo
 */
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

/**
 * @description Applique des valeurs aléatoires aux paramètres actifs (et éventuellement à un avatar).
 * @param {Object|false} [avatar=false] - Avatar ciblé ; si falsy, applique au global + met à jour l’UI.
 * @returns {void}
 * @memberof module:glo
 */
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

/**
 * @description Tire au sort une (ou plusieurs) valeur(s) de paramètres marqués aléatoires et déclenche les événements associés.
 * @param {boolean} [playInput=true] - Déclenche l’événement `input` sur les contrôles concernés.
 * @returns {void}
 * @memberof module:glo
 */
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

/**
 * @description Dessine un marqueur visuel (min/max) sur un input selon l’action utilisateur.
 * @param {HTMLInputElement} ctrl - Contrôle concerné.
 * @param {MouseEvent} e - Événement souris pour positionner le repère.
 * @returns {void}
 * @memberof module:ui
 */
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

/**
 * @description Dessine un caractère/indicateur positionné sur un input (ex. pour marquer un lien).
 * @param {HTMLElement} ctrl - Contrôle (input) ciblé.
 * @param {string} char - Caractère à afficher.
 * @param {string} endId - Suffixe d’identifiant de l’élément créé.
 * @returns {void}
 * @memberof module:ui
 */
function drawCharOnInput(ctrl, char, endId){
  let div            = document.createElement("div");
  div.className      = 'charOnInput';
  div.id             = ctrl.id + '_' + endId;
  div.style.fontSize = '16px';
  div.style.position = 'absolute';
  div.style.left     = '20px';
  div.style.top      = ctrl.offsetTop - 10 + 'px';
  div.style.color    = '#333';

  let txt = document.createTextNode(char);

  div.appendChild(txt);

  ctrl.parentElement.appendChild(div);
}

function alphaVarSize(obj, buttonCk = true){
  obj.shortcut.alphaVarSize = !obj.shortcut.alphaVarSize;
  obj.perm_var_size         = obj.shortcut.alphaVarSize;
  obj.growDecrease          = obj.shortcut.alphaVarSize;
  obj.alphaAbs              = !obj.alphaAbs;

  if(obj.growDecrease){ obj.sizeLineSave = obj.params.line_size; }
  else{ obj.params.line_size = obj.sizeLineSave; }
}