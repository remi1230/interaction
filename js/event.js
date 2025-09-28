
/**
 * @module events
 * @description Ce module gère tous les événements utilisateur (clavier, souris, interface)
 * liés aux canvases et aux contrôles. Il définit le comportement des interactions,
 * la gestion des modificateurs et avatars, ainsi que la navigation dans l’interface.
 */

/**
 * @typedef {Object} Point
 * @property {number} x - Coordonnée horizontale.
 * @property {number} y - Coordonnée verticale.
 * @property {boolean} [form=false] - Indique si le point appartient à une forme.
 * @property {boolean} [first=false] - Indique s’il s’agit du premier point d’une séquence.
 */

/**
 * @event DOMContentLoaded
 * @description Initialise l’interface et les contrôles à la fin du chargement du DOM.
 * Configure l’UI, restaure l’état global et lance l’animation principale.
 * @memberof module:events
 */
document.addEventListener("DOMContentLoaded", function() {
    params_interface();
    createGoInterface();
    createCheckboxesWithRange(activeGlo.colorFunctionLabels, 'colorCumulContainer', 'qMove', {event: 'onchange', func: 'checkColorFunctions(event)'});
    resizeUI();
    feedHelp();
    canvasBg();
    if(!localStorage.getItem('glo')){ createAvatar({nb: activeGlo.params.nb, w: activeGlo.size}); }
    else{ restoreFlash(); }
    getById('brushFormType_0').checked = true;
    animation();
});

/**
 * @event ui.mousedown @memberof module:events
 * @description Indique que la souris est pressée sur l’interface UI.
 * @memberof module:events
 */
ui.addEventListener('mousedown', () => { activeGlo.uiMouseDown = true; });

/**
 * @event ui.mouseup @memberof module:events
 * @description Indique que la souris est relâchée sur l’interface UI.
 * @memberof module:events
 */
ui.addEventListener('mouseup',   () => { activeGlo.uiMouseDown = false; });

/**
 * @event ui.contextmenu @memberof module:events
 * @description Intercepte le clic droit sur l’UI
 * empêche le menu contextuel natif et déclenche un changement d’interface.
 * @param {MouseEvent} e - Événement souris.
 * @memberof module:events
 */
ui.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if(!activeGlo.time){ activeGlo.time = new Date().getTime(); }
  else{
    let diffTime = new Date().getTime() - activeGlo.time;
    if(diffTime < 500){ changeInterface('-'); }
  }

  activeGlo.time = new Date().getTime();
});

/**
 * @event structure.click
 * @description Sur le canvas structure : permet de poser des avatars, coller des modificateurs,
 * définir un centre ou basculer l’affichage de l’interface selon le contexte.
 * @memberof module:events
 */
structure.addEventListener('click', () => {
  if(!activeGlo.virtual.modifier && !activeGlo.virtual.avatar){
    let posOnMouse = activeGlo.posOnMouse;

    if(posOnMouse.pasteMods){ pasteModifiers(); }
    else if(posOnMouse.avatar){
      posAvatar(mouse.x, mouse.y, activeGlo.size, activeGlo.center ? activeGlo.center : {x: canvas.width/2, y: canvas.height/2});
      all_nearsAvatars();
      let avatarsLength = avatars.length;
      getById('nb').value = avatarsLength;
      getById('nb').title = avatarsLength;
      activeGlo.params.nb = avatarsLength;
      updLabel(getById('nb'));
    }
    else if(activeGlo.formModTypes[activeGlo.params.formModType] != 'one'){ posModifiersByType(mouse); }
    else{
      if(!activeGlo.attract_mouse.state){
        if(typeof(activeGlo.num_params) == 'undefined'){ activeGlo.num_params = 0; }

        ui.style.display       = ui.style.display === 'none' ? '' : 'none';
        canvas.style.height    = ui.style.display === 'none' ? '98.25%' : '83.5%';
        structure.style.height = ui.style.display === 'none' ? '98.25%' : '83.5%';

        simpleUpdImage(ctx, fix_dpi, canvas);
        simpleUpdImage(ctxStructure, fix_dpi, structure);
      }
      else{
        if(activeGlo.defineCenter){ defineCenter(true, true); }
        else{
          if(activeGlo.modifierSelect.byOne || activeGlo.modifierSelect.byGroup){ modifier_select(); }
          else if(activeGlo.pos_modifiers != 'none' && !activeGlo.modifierSelect.isOneSelect()){ pos_modifier(activeGlo.pos_modifiers); }
        }
      }
    }
  }
});

/**
 * @event structure.contextmenu
 * @description Intercepte le clic droit sur le canvas structure,
 * empêche le menu contextuel natif et déclenche la sélection rectangulaire de modificateurs.
 * @param {MouseEvent} e - Événement souris.
 * @memberof module:events
 */
structure.addEventListener('contextmenu', (e) => {
  activeGlo.modifierSelectbyRectangleOnRClick = true;
  e.preventDefault();
  modifier_select();
});

/**
 * @event structure.mousedown
 * @description (sur le canvas `structure`) Capture la position du clic, active les drapeaux de souris,
 * et gère deux cas :
 * 1) **Sélection rectangulaire** (clic droit ou mode `modifierSelectbyRectangleOnRClick`) : active `activeGlo.mousedown`
 *    pour commencer le tracé de sélection.
 * 2) **Mode attraction actif** (`activeGlo.attract_mouse.state` et clic ≠ droit) : passe en mode "placement virtuel" :
 *    - si `activeGlo.virtual.modifier` → pose un **modifier virtuel** via `pos_modifier(...)` et active `activeGlo.posVirtualMod`.
 *    - sinon (`activeGlo.virtual.avatar`) → supprime les avatars virtuels existants, crée un **avatar virtuel** à la souris
 *      via `posAvatar(...)`, désactive son dessin (`draw`, `draw_ok`) et initialise son historique (`lasts`).
 * @memberof module:events
 * @param {MouseEvent} e - Événement souris.
 */
structure.addEventListener('mousedown', (e) => {
  mouse.click = {x: mouse.x, y: mouse.y};

  activeGlo.simpleMouseDown = true;
  if(activeGlo.modifierSelectbyRectangleOnRClick || e.button == 2){ activeGlo.mousedown = true; activeGlo.modifierSelectbyRectangleOnRClick = true; }
  else if(activeGlo.attract_mouse.state && e.button != 2){
    activeGlo.attract_mouse.mousedown = true;
    if(activeGlo.virtual.modifier || activeGlo.virtual.avatar){
      activeGlo.posVirtualMod = true;
      if(activeGlo.virtual.modifier){ pos_modifier(activeGlo.pos_modifiers, mouse, false, 9999, true); }
      else{
        avatars.forEach((av, i) => { if(av.virtual){ avatars.splice(i,1); } });
        let av  = posAvatar(mouse.x, mouse.y, activeGlo.size, canvas.getCenter(), true);
        av.draw = false; av.draw_ok = false;
        av.lasts.push({x: av.x, y: av.y});
      }
    }
  }
});

/**
  * @event structure.mouseup
  * @description (sur le canvas `structure`) Termine l’action en cours :
  * - Réinitialise les drapeaux (`simpleMouseDown`, `showCircle`, `mousedown`).
  * - Désactive `selectByRectangle` pour tous les modifiers.
  * - Si le **mode attraction** est actif : relâche `attract_mouse.mousedown`.
  *   Si un **placement virtuel** était en cours (`posVirtualMod`) :
  *   - le clôture et **retire** l’entité virtuelle créée (modifier virtuel ou avatar virtuel) de leurs listes respectives.
  * @memberof module:events
  */
structure.addEventListener('mouseup',   () => {
  activeGlo.simpleMouseDown = false;
  activeGlo.showCircle      = false;
  activeGlo.mousedown       = false;

  activeGlo.modifiers.forEach(mod => { mod.selectByRectangle = false; });

  if(activeGlo.attract_mouse.state){
    activeGlo.attract_mouse.mousedown = false;
    if(activeGlo.posVirtualMod){
      activeGlo.posVirtualMod = false;
      if(activeGlo.virtual.modifier){ activeGlo.modifiers.forEach((mod, i) => { if(mod.virtual){ activeGlo.modifiers.splice(i,1); } }); }
      else{ avatars.forEach((av, i) => { if(av.virtual){ avatars.splice(i,1); } }); }
    }
  }
});

/**
 * @event structure.wheel
 * @description Gère la molette de la souris :
 * - avec Shift : zoom avatars
 * - avec Alt : zoom modificateurs
 * - avec Ctrl : ajuste la taille du cercle
 * - par défaut : ajuste attraction/modificateurs ou sliders.
 * @param {WheelEvent} e
 * @memberof module:events
 */
structure.addEventListener('wheel', (e) => {
  e.preventDefault();

  if(e.shiftKey){
    if(e.deltaY > 0){ scale_avatars('-', e.deltaY); }
    else{ scale_avatars('+', -e.deltaY); }
  }
  else if(e.altKey){
    if(e.deltaY > 0){ scale_modifiers('-', e.deltaY); }
    else{ scale_modifiers('+', -e.deltaY); }
  }
  else if(activeGlo.simpleMouseDown){
    step = !e.ctrlKey ? 0.0001 : 0.00001;
    activeGlo.showCircle = true;
    activeGlo.params.circle_size -= e.deltaY * step;

    if(activeGlo.params.circle_size < 0){ activeGlo.params.circle_size = 0; }

    updCtrl('circle_size');
  }
  else{
    if(!activeGlo.inputToSlideWithMouse ){ getSelectedModifiers().forEach(mod => { mod.attract += Math.sign(mod.attract) * e.deltaY*0.1; }); }
    else{
      activeGlo.inputToSlideWithMouse.value = parseFloat(activeGlo.inputToSlideWithMouse.value) + (parseFloat(activeGlo.inputToSlideWithMouse.step) * Math.sign(e.deltaY));
      activeGlo.inputToSlideWithMouse.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, }));
    }
  }
});

/**
 * @event structure.mousemove
 * @description Met à jour la position de la souris sur le canvas structure.
 * Gère l’affichage d’infos, le déplacement de modificateurs ou d’avatars virtuels.
 * @param {MouseEvent} e
 * @memberof module:events
 */
structure.addEventListener('mousemove', (e) => {
  mouse = getMousePos(e, canvas, mouse);

  if(activeGlo.infoOnMouse){ infoOnMouse(); }
  else if(activeGlo.posVirtualMod){
    if(activeGlo.virtual.modifier){ activeGlo.modifiers.forEach(mod => { if(mod.virtual){ mod.x = mouse.x; mod.y = mouse.y; } }); }
    else{ avatars.forEach(av => { if(av.virtual){ mouveVirtualAvatar(av); } }); }
  }
});

/**
 * @event goInterFaceContainer.wheel
 * @description (sur `#goInterFaceContainer`) Permet de changer l’interface
 * en fonction du sens de la molette.
 * @param {WheelEvent} e
 * @memberof module:events
 */
getById('goInterFaceContainer').addEventListener('wheel', (e) => {
  e.preventDefault();
  changeInterface(e.deltaY < 0 ? '+' : '-');
});

/**
 * @event helpDialog.click
 * @description (sur `helpDialog`) Ferme le dialogue d’aide quand on clique dessus,
 * et inverse l’état de visibilité.
 * @memberof module:events
 */
helpDialog.addEventListener('click', () => {
  helpDialogVisible = !helpDialogVisible;
  helpDialog.close();
});

/**
 * @event brushDialog.click
 * @description (sur `brushDialog`) Ferme le dialogue de la brosse, réinitialise
 * l’état de la souris (mousedown = false) et inverse la visibilité.
 * @memberof module:events
 */
brushDialog.addEventListener('click', () => {
  brushCanvasMouseDown = false;
  brushDialogVisible = !brushDialogVisible;
  brushDialog.close();
});

/**
 * @event helpDialogGrid.click
 * @description (sur `helpDialogGrid`) Empêche la propagation des clics à la boîte
 * de dialogue parente, pour éviter une fermeture involontaire.
 * @param {MouseEvent} e
 * @memberof module:events
 */
helpDialogGrid.addEventListener('click', (e) => e.stopPropagation());

/**
 * @event brushCanvas.mousedown
 * @description (sur `brushCanvas`) Active le dessin de la brosse :
 * - initialise les positions de clic (`mouseCanvasClick`, `mouseCanvasLastClick`),
 * - enregistre un point ou mouvement via `saveMoveOrPtOnBrushCanvas`,
 * - déclenche un tracé (`drawOnBrushCanvas`),
 * - gère le passage en mode ligne si activé (`mouseCanvasChangeToLine`).
 * @param {MouseEvent} e
 * @memberof module:events
 */
brushCanvas.addEventListener('mousedown', e => {
  brushCanvasMouseDown = true;
  mouseCanvasLastClick = mouseCanvasClick;
  mouseCanvasClick     = getMousePos(e, brushCanvas);
  
  saveMoveOrPtOnBrushCanvas(mouseCanvas, activeGlo.brushType, 'mousedown', brushCanvasMouseUp);
  if(!mouseCanvasChangeToLine){ drawOnBrushCanvas(); }
  else{ drawOnBrushCanvas(activeGlo.brushType === 'manual' || activeGlo.brushType === 'line' ? 'manual' : activeGlo.brushType); }

  mouseCanvasChangeToLine = false;
  brushCanvasMouseUp      = false;
});

/**
 * @event modPathCanvas.mousedown
 * @description (sur `modPathCanvas`) Démarre un tracé de chemin de modificateurs :
 * - active `modPathCanvasMouseDown`,
 * - enregistre la position courante (`mouseModPathCanvas`),
 * - sauvegarde le mouvement via `helpToSaveMoveOnModPathCanvas`,
 * - trace une ligne rouge entre le dernier point et le nouveau.
 * @param {MouseEvent} e
 * @memberof module:events
 */
modPathCanvas.addEventListener('mousedown', e => {
  modPathCanvasMouseDown = true;
  mouseModPathCanvasLast = mouseModPathCanvas;
  mouseModPathCanvas     = getMousePos(e, modPathCanvas);
  
  helpToSaveMoveOnModPathCanvas();

  if(mouseModPathCanvasLast.x && mouseModPathCanvasLast.y){
    ctxModPath.strokeStyle = '#cc0000';
    ctxModPath.line({start: {x: mouseModPathCanvasLast.x, y: mouseModPathCanvasLast.y}, end: {x: mouseModPathCanvas.x, y: mouseModPathCanvas.y}});
  }

  modPathCanvasMouseUp = false;
});

/**
 * @event modPathCanvas.mouseup
 * @description (sur `modPathCanvas`) Termine un tracé de chemin de modificateurs :
 * - désactive `modPathCanvasMouseDown`,
 * - dessine un petit cercle rouge à la position du relâchement.
 * @param {MouseEvent} _event
 * @memberof module:events
 */
modPathCanvas.addEventListener('mouseup', _event => {
  modPathCanvasMouseDown = false;
  modPathCanvasMouseUp   = true;

  ctxModPath.strokeStyle = '#cc0000';
  ctxModPath.moveTo(mouseModPathCanvas.x, mouseModPathCanvas.y);
  ctxModPath.arc(mouseModPathCanvas.x, mouseModPathCanvas.y, 1, 0, two_pi);
  ctxModPath.stroke();
});

/**
 * @event modPathCanvas.mousemove
 * @description (sur `modPathCanvas`) En mode mousedown actif, trace des segments rouges
 * entre les positions successives de la souris et sauvegarde les mouvements.
 * @param {MouseEvent} e
 * @memberof module:events
 */
modPathCanvas.addEventListener('mousemove', e => {
  if(modPathCanvasMouseDown){
    mouseModPathCanvasLast = mouseModPathCanvas;
    mouseModPathCanvas     = getMousePos(e, modPathCanvas);

    helpToSaveMoveOnModPathCanvas();

    ctxModPath.strokeStyle = '#cc0000';
    ctxModPath.line({start: {x: mouseModPathCanvasLast.x, y: mouseModPathCanvasLast.y}, end: {x: mouseModPathCanvas.x, y: mouseModPathCanvas.y}});
  }
});

/**
 * @event modPathDialog.close
 * @description (sur `modPathDialog`) À la fermeture du dialogue, sauvegarde
 * le dernier mouvement du chemin en cours (soit sur l’objet global, soit
 * sur le premier modificateur sélectionné).
 * @memberof module:events
 */
modPathDialog.addEventListener("close", () => {
  helpToSaveMoveOnModPathCanvas(mouseModPathCanvas, activeGlo.modifiers.length ? getSelectedModifiers()[0].glo.stepsModPath[0] : activeGlo.stepsModPath[0]);
});

/**
 * @event brushFormType_1.change
 * @description (sur `#brushFormType_1`) Active ou désactive le mode de dessin en ligne
 * pour la brosse (`mouseCanvasChangeToLine`).
 * @param {Event} _event
 * @memberof module:events
 */
getById('brushFormType_1').addEventListener('change', _event => {
  mouseCanvasChangeToLine = getById('brushFormType_1').checked;
});

/**
 * @event brushCanvas.mouseup
 * @description (sur `brushCanvas`) Termine le dessin de la brosse, désactive
 * `brushCanvasMouseDown` et active `brushCanvasMouseUp`.
 * @param {MouseEvent} _event
 * @memberof module:events
 */
brushCanvas.addEventListener('mouseup', _event => {
  brushCanvasMouseDown = false;
  brushCanvasMouseUp   = true;
} );

/**
 * @event brushCanvas.mousemove
 * @description (sur `brushCanvas`) Met à jour la position de la souris.
 * Si la brosse est en mode manuel et mousedown actif :
 * - sauvegarde le mouvement via `saveMoveOrPtOnBrushCanvas`,
 * - trace une ligne via `drawLineOnBrushCanvas`.
 * @param {MouseEvent} e
 * @memberof module:events
 */
brushCanvas.addEventListener('mousemove', e => {
  mouseCanvasLast = mouseCanvas;
  mouseCanvas     = getMousePos(e, brushCanvas);

  if(brushCanvasMouseDown && activeGlo.brushType === 'manual'){
    saveMoveOrPtOnBrushCanvas(mouseCanvas, activeGlo.brushType, 'mousemove');
    drawLineOnBrushCanvas();
  }
});
//***********************************************************************************************//


input_params.forEach((input) => {
  /**
 * @event input_params.mouseover
 * @description (sur chaque input `.input_params`) Gère le focus visuel et logique :
 * tous les autres inputs sont désactivés (`dataset.focus = false`),
 * l’input survolé est activé et reçoit le focus.
 * @param {MouseEvent} e
 * @memberof module:events
 */
  input.addEventListener('mouseover', (e) => {
    let target = e.target;
    if(target.classList.contains('input_params')){
      input_params.forEach((input) => { input.dataset.focus = 'false'; });
      target.dataset.focus = 'true'; target.focus();
    }
  });
  /**
 * @event input_params.mouseout
 * @description (sur chaque input `.input_params`) Supprime le flag `dataset.focus`
 * quand la souris sort de l’input.
 * @param {MouseEvent} e
 * @memberof module:events
 */
  input.addEventListener('mouseout', (e) => {
    if(e.target.classList.contains('input_params')){  e.target.dataset.focus = 'false'; }
  });

  /**
 * @event input_params.mouseout
 * @description (sur chaque input `.input_params`) Supprime le flag `dataset.focus`
 * quand la souris sort de l’input.
 * @param {MouseEvent} e
 * @memberof module:events
 */
  input.addEventListener('wheel', (e) => {
    if(e.target.classList.contains('input_params')){
      const currval = parseFloat(e.target.value);
      const step    = parseFloat(e.target.step) * -Math.sign(e.deltaY);

      const newVal = currval + step;

      e.target.dispatchEvent(new Event('input', { bubbles: true }));
      e.target.value = newVal;
    }
  });
});
//------------------ STOP WINDOW KEYS EVENTS ON INPUTS ----------------- //
 stopWindowEvents.forEach(ctrl => {
  /**
 * @event ctrl.focus
 * @description (sur chaque contrôle `stopWindowEvents`) Active le blocage
 * des raccourcis clavier globaux (`activeGlo.stopWindowEvents = true`).
 * @memberof module:events
 */
   ctrl.addEventListener('focus', () => { activeGlo.stopWindowEvents = true; });
   /**
 * @event ctrl.blur
 * @description (sur chaque contrôle `stopWindowEvents`) Désactive le blocage
 * des raccourcis clavier globaux (`activeGlo.stopWindowEvents = false`).
 * @memberof module:events
 */
   ctrl.addEventListener('blur', () => { activeGlo.stopWindowEvents = false; });
 });

/**
 * @function aleaOnRightClick
 * @description Active/désactive le mode aléatoire d’un paramètre via un clic droit.
 * @memberof module:events
 * @param {Object} obj_param - Objet contenant les paramètres contrôlés.
 */
function aleaOnRightClick(obj_param){
  for(var p in obj_param){
    let param = getById(p);
    if(param){
    /** 
     * @event param.contextmenu
     * @description Active/désactive le mode aléatoire d’un paramètre via un clic droit.
     * @memberof module:events
     */
      param.addEventListener('contextmenu', (e) => {
        e.stopPropagation();
        e.preventDefault();

        let p = e.target.id;
        if(typeof(activeGlo.params_alea) == 'undefined'){ activeGlo.params_alea = {}; }
        activeGlo.params_alea[p] = !activeGlo.params_alea[p];

        document.querySelector(`label[for="${param.id}"]`).style.color = activeGlo.params_alea[p] ? '#cc6666' : 'unset';
      });
    }
  }
}
aleaOnRightClick(activeGlo.params);

/**
 * @function defineMinOrMax
 * @description Définit une valeur minimale ou maximale pour un paramètre
 * lorsqu’il est activé en mode aléatoire et cliqué.
 * @memberof module:events
 * @param {Object} obj_param - Objet contenant les paramètres contrôlés.
 */
function defineMinOrMax(obj_param){
  for(var p in obj_param){
    let param = getById(p);
    if(param){
      /** 
     * @event param.mouseup
     * @description Définit une valeur minimale ou maximale pour un paramètre
     * lorsqu’il est activé en mode aléatoire et cliqué.
     * @memberof module:events
     */
      param.addEventListener('mouseup', (e) => {
        let p = e.target.id;
        if(e.button == 0 && ((activeGlo.params_alea && activeGlo.params_alea[p]) || (activeGlo.global_alea && activeGlo.alea[p]))){
          let ctrl = getById(p);
          if(typeof(ctrl.dataset.defineMin) == 'undefined' || ctrl.dataset.defineMin == 'false'){ ctrl.dataset.defineMin = 'true'; }
          else{ ctrl.dataset.defineMin = "false"; }

          if(ctrl.dataset.defineMin == 'true'){ ctrl.dataset.alea_min = ctrl.value; }
          else{ ctrl.dataset.alea_max = ctrl.value; }
          drawLimOnInput(ctrl, e);
        }
      });
    }
  }
}
defineMinOrMax(activeGlo.params);

/**
 * @event resize
 * @description Réadapte les canvases et l’interface lors du redimensionnement de la fenêtre.
 * @memberof module:events
 */
window.addEventListener('resize', function () {
  resizeUI();
  /*if(activeGlo.clear){ allCanvas.forEach(canvas => { fix_dpi(canvas); }); }*/
});

/**
 * @event keydown
 * @description Gère les raccourcis clavier complexes :
 * - touches simples (F1, a, b, …)
 * - combinaisons Ctrl, Alt, Shift
 * Chaque touche active/désactive des propriétés dans `activeGlo` ou déclenche des actions.
 * @param {KeyboardEvent} e
 * @memberof module:events
 */
window.addEventListener("keydown", function (e) {
  let inputsSz;
  if(!activeGlo.stopWindowEvents && e.key != 'Shift'){
    if(e.key !== 'F12' && e.key !== 'f'){ e.preventDefault(); }

    let activeGloSave = {...activeGlo};

    let i, center;
    let key = e.key;
    if(isNaN(parseInt(key))){
      if(!e.ctrlKey){
        if(!e.altKey){
        	switch (key) {
            case 'Delete':
              deleteAllModifiers();

              break;
            /// F1 -- Effacement du canvas -- canvas -- clear ///
            case 'F1':
              switchPersist();

              break;
            /// F2 -- Style dessin -- dessin ///
            case 'F2':
              alphaVarSize(activeGlo);
              getSelectedModifiers().forEach(mod => { alphaVarSize(mod.glo, false); });

              if(!activeGlo.shortcut.alphaVarSize){ avatars.forEach(av => { av.size = activeGlo.size; av.grow = 0; }); }

              break;
            /// F3 -- Dessélectionner tous les modifiers -- selection, modifier ///
            case 'F3':
              activeGlo.modifiers.forEach(mod => { mod.select = false; });

              break;
            /// F4 -- Sélectionner des modifiers au hazard -- selection, modifier ///
            case 'F4':
              activeGlo.modifiers.forEach(mod => { mod.select = false; if(round(rnd(), 0)){ mod.select = true; } });

              break;
            /// F5 -- Sélection / Déselection de tous les modifiers -- selection, modifier -- allModsSelected ///
            case 'F5':
              activeGlo.allModsSelected = !activeGlo.allModsSelected;
              activeGlo.modifiers.forEach(mod => { mod.select = activeGlo.allModsSelected; });

              break;
            /// F6 -- Inverser la sélection -- selection, modifier ///
            case 'F6':
              activeGlo.modifiers.forEach(mod => { mod.select = !mod.select; });

              break;
            /// F7 -- Sélection des modifiers positifs puis négatifs -- selection, modifier -- selectBySign ///
            case 'F7':
              activeGlo.selectBySign = !activeGlo.selectBySign;
              let sign = activeGlo.selectBySign ? 1 : -1;
              activeGlo.modifiers.forEach(mod => {
                if(Math.sign(mod.attract) == sign){ mod.select = true; }
                else{ mod.select = false; }
              });

              break;
            /// F8 -- Sélection par groupe -- selection, modifier ///
            case 'F8':
              activeGlo.modifierSelect.update('byGroup');

              break;
            /// F9 -- Poser des modifiers en cercle avec la souris -- pose, modifier ///
            case 'F9':
              switchObjBools(activeGlo.posOnMouse, 'circleMods', false);

              break;
            /// F10 -- Copier le ou les modifiers sélectionnés avec la souris -- copie, modifier ///
            case 'F10':
              switchObjBools(activeGlo.posOnMouse, 'pasteMods', false);

              break;
            /// F11 -- Attribue au hazard une couleur à chaque modifier -- couleur, modifier -- modifiersHaveColor ///
            case 'F11':
              let rndColSave = false;
              getSelectedModifiers().forEach(mod => {
                mod.haveColor = !mod.haveColor;
                if(mod.haveColor){
                  let around = 60;
                  let rndCol = cyclicNumber(parseInt(rndColSave ? (Math.random() > 0.5 ? getRnd(0, rndColSave - around) : getRnd(rndColSave + around, 360)) : getRnd(0, 360)), 360);
                  mod.color = {h: rndCol, s: 20 + parseInt(rnd() * 60), l: 20 + parseInt(rnd() * 60)};
                  rndColSave = rndCol;
                }
              });
              activeGlo.modifiersHaveColor = !activeGlo.modifiersHaveColor;

              break;
            /// a -- L'alpha varie aléatoirement -- avatar, dessin -- alpha ///
        		case 'a':
              if(!inputToSlideWithMouse(false)){ activeGlo.alpha = !activeGlo.alpha; }
        			break;
            /// b -- Les modifiers ont la couleur sélectionnée avec l'interface -- couleur, modifier ///
        		case 'b':
              activeGlo.oneColor.state = !activeGlo.oneColor.state;
        			break;
            /// c -- Créer un cercle d'avatars -- avatar, creation ///
        		case 'c':
              activeGlo.createMod = 'circle';
              center = canvas.getCenter();
              if(activeGlo.clearForm){ clear(); }
              createForm({ form: {name: 'circle', size: canvas.width/4}, center: center });
        			break;
            /// d -- Les avatars rebondissent à l'exterieur des bords -- avatar -- far_rebound ///
        		case 'd':
              activeGlo.far_rebound = !activeGlo.far_rebound;
        			break;
            /// e -- Le contrôle survolé est à liable -- interface ///
        		case 'e':
              inputToLinked();
        			break;
            /// f -- Avec attraction, les avatars an suivent d'autres -- avatar -- follow ///
        		case 'f':
              activeGlo.follow = !activeGlo.follow;
        			break;
            /// g -- Certains paramètres varient au hazard -- divers -- global_alea ///
        		case 'g':
              activeGlo.global_alea = !activeGlo.global_alea;
        			break;
            /// h -- L'attraction entre avatars est hazardeuse -- avatar, attraction -- alea_attract ///
        		case 'h':
              activeGlo.alea_attract = !activeGlo.alea_attract;
        			break;
            /// i -- L'attraction entre avatars est inversée -- avatar, attraction -- inverse_g ///
        		case 'i':
              activeGlo.inverse_g = !activeGlo.inverse_g;
        			break;
            /// j -- Télécharge un png du canvas -- canvas, image ///
        		case 'j':
              downloadCanvas();
        			break;
        		/*case 'n':
              activeGlo.numLineCap++;
              applyToSelectedMods('numLineCap');
        			break;*/
            /// k -- Dessine le bord de l'avatar -- avatar, dessin -- stroke ///
        		case 'k':
              activeGlo.stroke = !activeGlo.stroke;
        			break;
            /// l -- La vitesse des avatars est limitée selon leurs tailles -- avatar -- limSpeedBySize ///
        		case 'l':
              activeGlo.limSpeedBySize = !activeGlo.limSpeedBySize;
        			break;
            /// m -- Variation de la taille suivant la vitesse -- avatar, dessin -- var_size ///
        		case 'm':
              activeGlo.var_size = !activeGlo.var_size;
        			break;
            /// n -- Les avatars sont noirs -- avatar, dessin -- color_black ///
        		case 'n':
              activeGlo.color_black = !activeGlo.color_black;
              if(activeGlo.color_white){ activeGlo.color_white = false; }
        			break;
            /// o -- Avec attraction, les avatars orbitent les uns autour des autres -- attraction, avatar -- orbite ///
        		case 'o':
              activeGlo.orbite = !activeGlo.orbite;
        			break;
            /// p -- Inverse aléatoirement l'attraction entre avatars -- attraction, avatar -- alea_inv_g ///
        		case 'p':
              activeGlo.alea_inv_g = !activeGlo.alea_inv_g;
        			break;
            /// q -- Créer un carré d'avatars -- avatar, creation ///
        		case 'q':
              activeGlo.createMod = 'square';
              if(activeGlo.clearForm){ clear(); }
              createForm({ form: {size: canvas.width/4} });
        			break;
            /// r -- Le contrôle survolé est lié à celui liable -- interface ///
        		case 'r':
              inputToLinkedTo();
        			break;
            /// s -- Taille des avatars aléatoire -- avatar, taille -- alea_size ///
        		case 's':
              activeGlo.alea_size = !activeGlo.alea_size;
              alea_size();
        			break;
            /// t -- Affiche le centre -- info, centre -- view_center ///
        		case 't':
              if(!inputToLinkedTo(false)){ activeGlo.view_center = !activeGlo.view_center; }
        			break;
            /// u -- Créer un rectangle d'avatars -- avatar, creation ///
        		case 'u':
              activeGlo.createMod = 'rect';
              if(activeGlo.clearForm){ clear(); }
              keepBreak(function(){ var nb = activeGlo.params.nb; deleteAvatar('all'); activeGlo.params.nb = nb; createAvatar({form: {name: 'rect'} }); });
        			break;
            /// v -- Couleur selon l'accélération ou la vitesse -- avatar, couleur -- speed_color ///
        		case 'v':
              activeGlo.speed_color = !activeGlo.speed_color;
        			break;
            /// w -- Les avatars sont blancs -- avatar, dessin -- color_white ///
        		case 'w':
              activeGlo.color_white = !activeGlo.color_white;
              if(activeGlo.color_black){ activeGlo.color_black = false; }
        			break;
            /// x -- Orientation des rebonds -- avatar, attraction -- normalCollid ///
        		case 'x':
              activeGlo.normalCollid = !activeGlo.normalCollid;
        			break;
            /// y -- Symétrie centrale des modifiers -- modifier, position ///
        		case 'y':
              modsSymToCenter();
        			break;
            /// z -- Transforme l'image en noir et blanc -- image, couleur ///
        		case 'z':
              grey_color();
        			break;
            /// A -- Déplacer un curseur attribue la valeur réélle de celui-ci -- divers -- updByVal ///
        		case 'A':
              activeGlo.updByVal = !activeGlo.updByVal;
        			break;
            /// B -- Calcul ou pas des avatars proches -- avatar -- stopNear ///
        		case 'B':
              activeGlo.stopNear = !activeGlo.stopNear;
        			break;
            /// C -- Rendre l'image plus nette -- image, transformation ///
        		case 'C':
              sharp();
        			break;
            /// D -- Inverse le sens de la spirale -- modifier, couleur -- inv_spiral ///
        		case 'D':
              activeGlo.inv_spiral = !activeGlo.inv_spiral;
        			break;
            /// E -- Avatars plein avec bords -- avatar, dessin -- strokeAndFill ///
        		case 'E':
              switchSroke();
        			break;
            /// F -- Modifiers en mode une couleur -- modifier, couleur -- modifiersHaveColor ///
        		case 'F':
              getSelectedModifiers().forEach(mod => { mod.haveColor = !mod.haveColor; });
              activeGlo.modifiersHaveColor = !activeGlo.modifiersHaveColor;
        			break;
            /// G -- Les modifiers d'une seule couleur varie ou non la teinte -- modifier, couleur -- addWithTint ///
        		case 'G':
              activeGlo.addWithTint = !activeGlo.addWithTint;
        			break;
            /// H -- Rotation quand spiral croisée -- avatar, rotation -- spiral_cross_rotate ///
        		case 'H':
              activeGlo.spiral_cross_rotate = !activeGlo.spiral_cross_rotate;
        			break;
            /// I -- Les couleurs sont calculées à partir des formules -- formule, couleur -- formuleColorMode ///
        		case 'I':
              activeGlo.formuleColorMode = !activeGlo.formuleColorMode;
              getById('switchAvFormulesButton').textContent = activeGlo.formuleColorMode ? 'ON' : 'OFF';
        			break;
            /// J -- Les modifiers affectent les avatars tour à tour -- modifier, calcul -- asyncModify ///
        		case 'J':
              activeGlo.asyncModify = !activeGlo.asyncModify;
              if(activeGlo.asyncModify){ activeGlo.asyncNumModifier = 0; }
        			break;
            /// L -- Les avatars en suivent d'autres -- avatar -- followAvatar ///
        		case 'L':
              activeGlo.followAvatar = !activeGlo.followAvatar;
              followAvatar();
        			break;
            /// M -- Les avatars se déplacent en spiral -- avatar, dessin -- spiral_cross ///
        		case 'M':
              activeGlo.spiral_cross = !activeGlo.spiral_cross;
        			break;
            /// N -- Dessine alternativement les avatars -- avatar, dessin -- drawAltern ///
        		case 'N':
              activeGlo.drawAltern = !activeGlo.drawAltern;
        			break;
            /// O -- Alpha selon la taille des avatars -- avatar, taille -- alphaBySize ///
        		case 'O':
              activeGlo.alphaBySize = !activeGlo.alphaBySize;
        			break;
            /// Q -- Alpha absolu ou relatif -- avatar, dessin -- alphaAbs ///
        		case 'Q':
              activeGlo.alphaAbs = !activeGlo.alphaAbs;
        			break;
            /// R -- La création d'une forme efface le dessin -- dessin -- clearForm ///
        		case 'R':
              activeGlo.clearForm = !activeGlo.clearForm;
        			break;
            /// S -- Pose des modifiers sur la grille -- modifier, grille -- putOnGrid ///
            case 'S':
              activeGlo.putOnGrid = !activeGlo.putOnGrid;
              break;  
            /// T -- Les modifiers sont placés au centre -- modifier, centre -- attract_center ///
        		case 'T':
              activeGlo.attract_center = !activeGlo.attract_center;
        			break;
            /// U -- Les avatars ont une queue -- avatar, dessin -- tail ///
        		case 'U':
              activeGlo.tail = !activeGlo.tail;
        			break;
            /// V -- Le rayon de pose des avatars à comme centre les modifiers -- avatar, pose -- randomPointByMod ///
        		case 'V':
              activeGlo.randomPointByMod = !activeGlo.randomPointByMod;
        			break;
            /// W -- La rotation en spirale oscille -- avatar, rotation -- cos_spiral ///
        		case 'W':
              activeGlo.cos_spiral = !activeGlo.cos_spiral;
        			break;
            /// X -- Flouter l'image -- image, transformation ///
        		case 'X':
              blur();
        			break;
            /// Y -- Attraction augmentée par la vitesse -- attraction, avatar -- gSpeed ///
        		case 'Y':
              activeGlo.gSpeed = !activeGlo.gSpeed;
        			break;
            /// Z -- Décale de 180° les couleurs -- dessin, couleur ///
        		case 'Z':
              let inputColorDec = getById('colorDec');

              inputColorDec.value = inputColorDec.value == '0' ? '180' : '0';
              inputColorDec.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, }));
        			break;
            /// à -- Inverse le brake -- attraction -- invBrake ///
        		case 'à':
              activeGlo.invBrake = !activeGlo.invBrake;
        			break;
            /// ç -- Restore les modes et paramètres -- RAZ ///
        		case 'ç':
              goToShot();
        			break;
            /// é -- L'alpha des avatars change au hazard -- avatar, dessin -- alphaRnd ///
        		case 'é':
              activeGlo.alphaRnd = !activeGlo.alphaRnd;
        			break;
            /// è -- Créer une spirale d'avatars -- avatar, creation ///
        		case 'è':
              activeGlo.createMod = 'spiral';
              center = canvas.getCenter();
              if(activeGlo.clearForm){ clear(); }
              createForm({ form: {name: 'spiral', size: canvas.width/4}, center: center });
        			break;
            /// ù -- Switch entre un fond noir et blanc -- image, couleur -- bg_black ///
        		case 'ù':
              activeGlo.bg_black = !activeGlo.bg_black;
              canvasContext[activeGlo.params.selectCanvas].canvas.style.backgroundColor = activeGlo.bg_black ? '#000' : '#fff';
        			break;
            /// $ -- Les avatars rebondissent sur les bords -- avatar -- collid_bord ///
        		case '$':
              activeGlo.collid_bord = !activeGlo.collid_bord;
        			break;
            /// & -- Mode de croissance hazardeuse des avatars -- avatar, taille -- growDecrease ///
        		case '&':
              activeGlo.growDecrease = !activeGlo.growDecrease;
              if(activeGlo.growDecrease){ activeGlo.sizeLineSave = activeGlo.params.line_size; }
              else{ avatars.forEach(av => { av.size = activeGlo.size; }); activeGlo.params.line_size = activeGlo.sizeLineSave; }
        			break;
            /// ! -- Les couleurs selon la vitesse relative ou absolu -- couleur, avatar -- relative ///
        		case '!':
              activeGlo.relative = !activeGlo.relative;
        			break;
            /// " -- Les alternateurs inversent leur attraction suivant une période -- modifier -- alternatorInvAtt ///
        		case '"':
              activeGlo.alternatorInvAtt = !activeGlo.alternatorInvAtt;
        			break;
            /// ' -- Réduit le canvas par 2 -- canvas ///
        		case "'":
              scaleCanvas(0.5);
        			break;
            /// ( -- Augmente le canvas par 2 -- canvas ///
        		case "(":
              scaleCanvas(2);
        			break;
            /// ) -- Mode de déplacement en courbe -- dessin -- curve ///
        		case ')':
              activeGlo.curve = !activeGlo.curve;
              break;
            /// ° -- L'attraction augmente suivant la distance du modifier -- attraction, modifier -- forceByCenter ///
        		case '°':
              activeGlo.forceByCenter = !activeGlo.forceByCenter;
        			break;
            /// . -- Pose des modifiers sur les sélectionnés -- modifier, selection, pose ///
        		case '.':
              posModsOnMods();
        			break;
            /// £ -- Créer un polygone d'avatars -- avatar, creation ///
        		case '£':
              activeGlo.createMod = 'poly';
              center = canvas.getCenter();
              if(activeGlo.clearForm){ clear(); }
              createForm({ form: {name: 'poly', size: canvas.width/4}, center: center });
        			break;
            /// * -- Attribue les propriété du 1er modifier aux autres -- avatar, copie ///
        		case '*':
              getSelectedModifiers().forEach(mod => {
                for(let prop in activeGlo.modifiers[0]){
                  if(typeof(activeGlo.modifiers[0][prop]) === 'object'){ mod[prop] = deepCopy(activeGlo.modifiers[0][prop]); }
                  else if(prop != 'x' && prop != 'y'){ mod[prop] = activeGlo.modifiers[0][prop]; }
                }
                mod.select = true;
              });
        			break;
            /// % -- La taille des avatars diminue suivant la distance du centre -- avatar, taille -- dimSizeCenter ///
        		case '%':
              activeGlo.dimSizeCenter = !activeGlo.dimSizeCenter;
        			break;
            /// µ -- Rotationne le canvas d'un angle positif -- canvas ///
        		case 'µ':
              rotateCanvas(PI/8);
              break;
            /// § -- Rotationne le canvas d'un angle négatif -- canvas ///
        		case '§':
              rotateCanvas(-PI/8);
        			break;
            /// ⏎ -- Avec gravité, relie les points de rencontre des avatars -- avatar, attraction -- lineCrossPoints ///
        		case 'Enter':
              activeGlo.lineCrossPoints = !activeGlo.lineCrossPoints;
        			break;
            /// Esc -- Rechargement de la page -- divers ///
        		case 'Escape':
              location.reload();
        			break;
            /// Esp -- Pause -- divers ///
        		case ' ':
              switchPause();
        			break;
            /// ▼ -- Exécution pas à pas -- divers ///
        		case 'PageDown':
              //if(!activeGlo.totalBreak){ button_check('totalBreak'); }
              keepBreak(function(){});
        			break;
            /// ² -- RAZ des avatars avec pose au hazard -- avatar, RAZ ///
        		case '²':
              activeGlo.createMod = 'random';
              if(activeGlo.clearForm){ clear(); }
              keepBreak(raz_avatars);
        			break;
            /// + - -- Rapproche ou éloigne les avatars du centre -- avatar, position ///
        		case '+': case '-':
              keepBreak(scale_avatars, key);
        			break;
            /// _ -- Sauvegarde les modes et paramètres -- divers ///
        		case '_':
              takeShot();
        			break;
            /// , -- Une spirale négative tourne dans le sens inverse -- divers -- spiralOnlyInvrot ///
        		case ',':
              activeGlo.spiralOnlyInvrot = !activeGlo.spiralOnlyInvrot;
        			break;
            /// ; -- Variation de taille des avatars -- avatar, taille -- perm_var_size ///
        		case ';':
              activeGlo.perm_var_size = !activeGlo.perm_var_size;
              activeGlo.sizeLineSave = activeGlo.params.line_size;
        			break;
            /// : -- Avec gravité, affiche les points de rencontre des avatars -- avatar, attraction -- crossPoints ///
        		case ':':
              activeGlo.crossPoints = !activeGlo.crossPoints;
        			break;
            /// < -- Dessine un cercle d'avatars -- creation, avatar ///
        		case '<':
              testAll();
        			break;
            /// > -- Rotation des couleurs de l'image -- image, couleur ///
        		case '>':
              rotateColor();
        			break;
            /// ← -- Déplace les avatars vers la gauche -- avatar, deplacement ///
            case 'ArrowLeft':
              if(!e.shiftKey){
                activeGlo.trans.state = true;
                activeGlo.trans.dir   = 'left';
              }
              else{ rotate_modifiers(-rad); }
              break;
            /// → -- Déplace les avatars vers la droite -- avatar, deplacement ///
            case 'ArrowRight':
              if(!e.shiftKey){
                activeGlo.trans.state = true;
                activeGlo.trans.dir   = 'right';
              }
              else{ rotate_modifiers(rad); }
              break;
            /// ↑ -- Déplace les avatars vers le haut -- avatar, deplacement ///
            case 'ArrowUp':
              activeGlo.trans.state = true;
              activeGlo.trans.dir   = 'up';
              break;
            /// ↓ -- Déplace les avatars vers le bas -- avatar, deplacement ///
            case 'ArrowDown':
              activeGlo.trans.state = true;
              activeGlo.trans.dir   = 'down';
              break;
        	}
        }
        else{
          e.preventDefault();
          switch (key) {
            /// Alt a -- Ouvre la documentation sur le code JavaScript du projet -- info ///
            case 'a':
              window.open("docs/index.html", "_blank");
              break;/// Alt b -- Incline positivement le canvas verticalement -- canvas, transformation ///
            case 'b':
              tiltCanvas('v', 0.25);
              break;
            /// Alt c -- Pose des modifiers par symétrie totale des sélectionnés -- modifier, position ///
            case 'c':
              modsSymToCenter('all');
              break;
            /// Alt d -- Liste des touches libres pour les évènements -- info ///
            case 'd':
              let freeTuchsDialog = getById('freeTuchsDialog');
              if(freeTuchsDialog){ freeTuchsDialog.remove(); }
              else{
                let freeTuchsDialog = makeFreeTuchsDialog();
                freeTuchsDialog.showModal();
              }
              break;
            /// Alt f -- Incline le négativement canvas verticalement -- canvas, transformation ///
            case 'f':
              tiltCanvas('v', -0.25);
              break;
            /// Alt h -- Affiche ou cache cette liste de touches -- interface, info ///
            case 'h':
              toggleHelpDialog();
              break;
            /// Alt i -- Inverse l'attraction des modifiers -- modifier, attraction ///
            case 'i':
              getSelectedModifiers().forEach(mod => { mod.attract = -mod.attract; mod.rot_spi = -mod.rot_spi; });
              break;
            /// Alt j -- Les avatars se tournent autour en spirale -- avatar, rotation -- spirAvatar ///
            case 'j':
              activeGlo.spirAvatar = !activeGlo.spirAvatar;
              break;
            /// Alt l -- Inverse périodiquement la tinte -- couleur -- alternTint ///
            case 'l':
              activeGlo.alternTint = !activeGlo.alternTint;
              break;
            /// Alt m -- Inverse périodiquement la saturation -- couleur -- alternSat ///
            case 'm':
              activeGlo.alternSat = !activeGlo.alternSat;
              break;
            /// Alt n -- Incline positivement le canvas horizontalement -- canvas, transformation ///
            case 'n':
              tiltCanvas('h', 0.25);
              break;
            /// Alt q -- /10 le pas du slider seléctionné -- interface ///
            case 'q':
              inputsSz = input_params.length;
              for(let i = 0; i < inputsSz; i++){
                let input = input_params[i];
                if(input.dataset.focus && input.dataset.focus == 'true'){
                  input.step/=10;
                  break;
                }
              }
              break;
            /// Alt g -- Déplacement des modifiers sur la grille -- modifier, deplacement, grille ///
            case 'g':
              putModsOnGrid();
              break;
            /// Alt s -- Incline négativement le canvas horizontalement -- canvas, transformation ///
            case 's':
              tiltCanvas('h', -0.25);
              break;
            /// Alt t -- Affiche des infos -- info -- showInfos ///
            case 't':
              activeGlo.showInfos = !activeGlo.showInfos;
              break;
            /// Alt u -- Pose un rectangle de modifiers -- modifier, creation ///
            case 'u':
              posRectModifiers();
              break;
            /// Alt v -- Affiche ou cache la fenêtre pour créer une brosse -- interface ///
            case 'v':
              toggleBrushDialog();
              break;
            /// Alt w -- Pose des modifiers par symétrie horizontale des sélectionnés -- modifier, position ///
            case 'w':
              modsSymToCenter('hAxe');
              break;
            /// Alt x -- Pose des modifiers par symétrie verticale des sélectionnés -- modifier, position ///
            case 'x':
              modsSymToCenter('vAxe');
              break;
            /// Alt y -- Pose un carré de modifiers -- modifier, creation ///
            case 'y':
              posSquareModifiers();
              break;
            /// Alt ç -- Rotation polygonale plus précise -- calcul -- polyPrecision  ///
            case 'ç':
              activeGlo.polyPrecision = !activeGlo.polyPrecision;
              break;
            /// Alt , -- Ne dessine que sur les blancs -- dessin -- checkBlanks  ///
            case ',':
              activeGlo.checkBlanks = !activeGlo.checkBlanks;
              break;
            /// Alt & -- Rotation des brosses orientables -- orientation, avatar -- rotateBrush  ///
            case '&':
              activeGlo.rotateBrush = !activeGlo.rotateBrush;
              break;
            /// Alt + -- Augmente la visibilité de l'interface -- interface ///
            case '+':
              if(ui.style.opacity < 1 && ui.style.opacity != ""){ ui.style.opacity = parseFloat(ui.style.opacity) + 0.02; }
              break;
            /// Alt - -- Diminue la visibilité de l'interface -- interface ///
            case '-':
              if(ui.style.opacity == ""){ ui.style.opacity = "0.99"; }
              else if(ui.style.opacity > 0){ ui.style.opacity = parseFloat(ui.style.opacity) - 0.02; }
              break;
            /// Alt " -- Affiche ou cache la fenêtre pour créer un chemin de mods ///
            case '"':
              toggleModPathDialog();
              break;
            //FREE
            case "'":
              activeGlo.selectBySign = !activeGlo.selectBySign;
              let sign = activeGlo.selectBySign ? 1 : -1;
              activeGlo.modifiers.forEach(mod => {
                if(Math.sign(mod.attract) == sign){ mod.select = true; }
                else{ mod.select = false; }
              });
              break;
            /// Alt < -- x10 le pas du slider seléctionné -- interface ///
            case '<':
              inputsSz = input_params.length;
              for(let i = 0; i < inputsSz; i++){
                let input = input_params[i];
                if(input.dataset.focus && input.dataset.focus == 'true'){
                  input.step*=10;
                  break;
                }
              }
              break;
            /// Alt ← -- Déplace les modifiers vers la gauche -- deplacement, modifier ///
            case 'ArrowLeft':
              translateModifiers(-10, 0);
              break;
            /// Alt → -- Déplace les modifiers vers la droite -- deplacement, modifier ///
            case 'ArrowRight':
              translateModifiers(10, 0);
              break;
            /// Alt ↑ -- Déplace les modifiers vers le haut -- deplacement, modifier ///
            case 'ArrowUp':
              translateModifiers(0, -10);
              break;
            /// Alt ↓ -- Déplace les modifiers vers le bas -- deplacement, modifier ///
            case 'ArrowDown':
              translateModifiers(0, 10);
              break;
          }
        }
      }
      else{
        if(key != 'f'){ e.preventDefault(); }
        if(e.shiftKey){
          let nextCanvasSelected, ctrlSelectCanvas, doEvent;
          switch (key) {
            case 'ArrowLeft':
              ctrlSelectCanvas   = getById('selectCanvas');
              nextCanvasSelected = parseInt(ctrlSelectCanvas.value) - 1;
              if(nextCanvasSelected < 0){ nextCanvasSelected = ctrlSelectCanvas.max; }

              selectCanvas(nextCanvasSelected);
              ctrlSelectCanvas.value = nextCanvasSelected;
              updateGlo(ctrlSelectCanvas);
              break;
            case 'ArrowRight':
              ctrlSelectCanvas   = getById('selectCanvas');
              nextCanvasSelected = parseInt(ctrlSelectCanvas.value) + 1;
              if(nextCanvasSelected > ctrlSelectCanvas.max){ nextCanvasSelected = 0; }

              selectCanvas(nextCanvasSelected);
              ctrlSelectCanvas.value = nextCanvasSelected;
              updateGlo(ctrlSelectCanvas);
              break;
          }
        }
        else{
          switch (key) {
            /// Ctrl a -- L'orientation des modifiers se fait depuis le centre ou pas -- modifier, orientation -- orientedPoly ///
            case 'a':
              activeGlo.orientedPoly = !activeGlo.orientedPoly;
              break; 
            /// Ctrl b -- Infos sur les paramètres spécifiques aux modifiers -- info, divers, modifier ///
            case 'b':
              let paramsMods = [];
              activeGlo.modifiers.forEach(mod => { paramsMods.push(mod.params); });
              toggleArrObjsDialog(paramsMods, "Infos sur les paramètres spécifiques aux modifiers");
              break;
            /// Ctrl c -- Permet de définir le centre d'un click -- centre -- defineCenter ///
            case 'c':
              activeGlo.defineCenter = !activeGlo.defineCenter;
              break;
            /// Ctrl d -- RAZ du centre -- centre ///
            case 'd':
              defineCenter(false, false);
              break;
            /// Ctrl e -- Inverse les couleurs de l'image -- image, couleur ///
            case 'e':
              invColors();
              break;
            /// Ctrl g -- Infos sur les paramètres des modifiers le plus proche de chaque avatar -- info, divers ///
            case 'g':
              let avsNearMods = [];
              avatars.forEach(av => {
                let avNearModCopy = deepCopy(av.nearMod);
                avNearModCopy.num_av = av.n_avatars; avsNearMods.push(avNearModCopy);
              });
              toggleArrObjsDialog(avsNearMods, "Infos sur les paramètres spécifiques au modifier le plus proche de chaque avatar");
              break;
            /// Ctrl h -- La force des modifiers posés est hazardeuse -- modifier, attraction -- pos_rnd_modifiers ///
            case 'h':
              activeGlo.pos_rnd_modifiers = !activeGlo.pos_rnd_modifiers;
              break;
            /// Ctrl i -- Inverse alternativement l'attraction des modifiers -- modifier, attraction -- invModifiersAtt ///
            case 'i':
              activeGlo.invModifiersAtt = !activeGlo.invModifiersAtt;
              break;
            /// Ctrl j -- Les couleurs se mélangent -- couleur -- colorsAdd ///
            case 'j':
              activeGlo.colorsAdd = !activeGlo.colorsAdd;
              break;
            /// Ctrl k -- Couleur de fond préférée -- couleur ///
            case 'k':
              switchBg();
              break;
            /// Ctrl l -- Inverse périodiquement les couleurs -- couleur -- alternColor ///
            case 'l':
              activeGlo.alternColor = !activeGlo.alternColor;
              break;
            /// Ctrl m -- Pose des modifiers avec un position au hazard -- modifier, pose ///
            case 'm':
              posModifiers();
              break;
            /// Ctrl o -- Import d'un fichier JSON -- import ///
            case 'o':
              impt_json();
              break;
            /// Ctrl p -- Inverse la tinte de l'image -- image, couleur ///
            case 'p':
              invTint();
              break;
            /// Ctrl q -- Avec rayon d'attraction, mode chaos -- attraction -- chaos ///
            case 'q':
              activeGlo.chaos = !activeGlo.chaos;
              break;
            /// Ctrl r -- Stroke au hazard -- dessin -- alea_stroke ///
            case 'r':
              activeGlo.alea_stroke = !activeGlo.alea_stroke;
              break;
            /// Ctrl s -- Infos sur les avatars -- info, avatar ///
            case 's':
              let infosAvatarsDialog = getById('infosAvatarsDialog');
              if(infosAvatarsDialog){ infosAvatarsDialog.remove(); }
              else{
                let infosAvatarsDialog = makeInfosAvatarsDialog();
                infosAvatarsDialog.addEventListener("close", () => {
                  activeGlo.infosAvatars = false;
                });
                infosAvatarsDialog.showModal();
              }
              break;
            /// Ctrl u -- Pose un polygone de modifiers -- modifier, pose ///
            case 'u':
              posPolyModifiers();
              break;
            /// Ctrl v -- Taille des avatars selon la distance des modifiers -- avatar, taille -- sizeDirCoeff ///
            case 'v':
              activeGlo.sizeDirCoeff = !activeGlo.sizeDirCoeff;
              break;
            /// Ctrl x -- Infos sur les modifiers -- info, modifier ///
            case 'x':
              let infosDialog = getById('infosDialog');
              if(infosDialog){ infosDialog.remove(); }
              else{
                let infosDialog = makeInfosDialog();
                infosDialog.showModal();
              }
              break;
            /// Ctrl y -- Pose un cercle de modifiers -- modifier, pose ///
            case 'y':
              posCircleModifiers();
              break;
            /// Ctrl z -- Affiche les modifiers -- modifier -- view_modifiers ///
            case 'z':
              activeGlo.view_modifiers = !activeGlo.view_modifiers;
              break;
            /// Ctrl  -- Pause incomplète -- avatar, divers -- break ///
        		case ' ':
              activeGlo.break = !activeGlo.break;
              dealBreakAvatars();
        			break;
            /// Ctrl ( -- Survoler un modifier donne des infos -- info -- infoOnMouse ///
            case '(':
              activeGlo.infoOnMouse = !activeGlo.infoOnMouse;
              break;
            /// Ctrl ) -- Avatar virtuel -- avatar ///
            case ')':
              switchObjBools(activeGlo.virtual, 'avatar', false);
              break;
            /// Ctrl & -- Infos persistantes -- info -- persistModsInfo ///
            case '&':
              activeGlo.persistModsInfo = !activeGlo.persistModsInfo;
              break;
            /// Ctrl ; -- La pose d'un avatar est virtuelle -- avatar, pose ///
            case ';':
              switchObjBools(activeGlo.virtual, 'modifier', false);
              break;
            /// Ctrl * -- Les avatars polygonales ont la forme d'une étoile -- avatar, dessin -- starPoly ///
            case '*':
              activeGlo.starPoly = !activeGlo.starPoly;
              break;
            /// Ctrl , -- Pour des tests avec la souris -- info -- testOnMouse ///
            case ',':
              activeGlo.testOnMouse = !activeGlo.testOnMouse;
              break;
            /// Ctrl : -- Les avatars dans un cloud ont une ligne entre eux -- avatar, dessin -- withLine ///
            case ':':
              activeGlo.withLine = !activeGlo.withLine;
              break;
            /// Ctrl " -- Les couleurs se combinent selon une fonction -- avatar, couleur -- colorCumul ///
            case '"':
              activeGlo.colorCumul = !activeGlo.colorCumul;
              break;
            /// Ctrl ! -- Double les avatars -- avatar, dessin -- doubleAvatar ///
            case '!':
              activeGlo.doubleAvatar = !activeGlo.doubleAvatar;
              activeGlo.noLimLine    = !activeGlo.noLimLine;
              break;
            /// Ctrl + -- Augmente la distance au centre des modifiers -- modifier, position ///
            case '+': case '-':
              keepBreak(scale_modifiers, key);
              break;
            /// Ctrl ² -- La distance ne compte plus pour les modifiers -- modifier ///
            case '²':
              modsToZero();
              break;
            /// Ctrl < -- RAZ du slider seléctionné -- interface, RAZ ///
            case '<':
              inputsSz = input_params.length;
              for(let i = 0; i < inputsSz; i++){
                let input = input_params[i];
                if(input.dataset.focus && input.dataset.focus == 'true'){
                  let startVal = parseFloat(input.dataset.startValue);
                  if(parseInt(startVal) == startVal){ startVal = parseInt(startVal) ; }
                  input.value = startVal;
                  let ev = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                  });
                  input.dispatchEvent(ev);
                  break;
                }
              }
              break;
            /// Ctrl ← -- Déplace légèrement les modifiers vers la gauche -- modifier, deplacement ///
              case 'ArrowLeft':
                translateModifiers(-1, 0);
                break;
              /// Ctrl → -- Déplace légèrement les modifiers vers la droite -- modifier, deplacement ///
              case 'ArrowRight':
                translateModifiers(1, 0);
                break;
              /// Ctrl ↑ -- Déplace légèrement les modifiers vers le haut -- modifier, deplacement ///
              case 'ArrowUp':
                translateModifiers(0, -1);
                break;
              /// Ctrl ↓ -- Déplace légèrement les modifiers vers le bas -- modifier, deplacement ///
              case 'ArrowDown':
                translateModifiers(0, 1);
                break;
          }
        }
      }
    }
    else{
      if(!e.ctrlKey){
        let numKey = parseInt(key);
        if(numKey <= 1){ activeGlo.style = parseInt(key); }
        else{
          switch (key) {
            //FREE
            case '2':
              activeGlo.doubleMods = !activeGlo.doubleMods;
              break;
            /// 3 -- Doubler les modifiers -- modifier ///
            case '3':
              getSelectedModifiers().forEach(mod => { mod.double = !mod.double; mod.dblForce = mod.double ? 200 : 1; });
              break;
            /// 4 -- Poser des avatars avec la souris -- avatar, pose ///
            case '4':
              switchObjBools(activeGlo.posOnMouse, 'avatar', false);
              break;
            /// 5 -- Brake à zéro des modifers -- modifier ///
            case '5':
              activeGlo.brakeModstoZero = !activeGlo.brakeModstoZero;
              if(activeGlo.brakeModstoZero){ getSelectedModifiers().forEach(mod => { mod.brakeSave = mod.brake; mod.brake = 0; }); }
              else{ getSelectedModifiers().forEach(mod => { mod.brake = mod.brakeSave; }); }
              break;
            /// 6 -- Pose des modifiers en quinconce -- modifier, pose -- staggered ///
            case '6':
              activeGlo.staggered = !activeGlo.staggered;
              break;
            /// 7 -- Couleur de fond = couleur moyenne (réactualisée) -- couleur, image -- updBgToAvColor ///
            case '7':
              activeGlo.updBgToAvColor = !activeGlo.updBgToAvColor;
              break;
            /// 8 -- Couleur de fond = inverse de couleur moyenne -- image, couleur ///
            case '8':
              updBgToAvColor(true);
              break;
            /// 9 -- Couleur de fond = couleur moyenne -- image, couleur ///
            case '9':
              updBgToAvColor();
              break;
          }
        }
      }
      else{
        e.preventDefault();
        switch (key) {
          /// Ctrl 0 -- Retour vers le portail -- divers ///
          case '0':
            window.open('http://1230.fr:88', '_blank');
            break;
          /// Ctrl 1 -- Résistance à 1 -- attraction ///
          case '1':
            let ctrl_resist = getById('resist');
            ctrl_resist.value = 1;
            updateGlo(ctrl_resist);
            break;
          /// Ctrl 2 -- Les ellipses sont allongées par la vitesse -- avatar, dessin -- sameSizeEllipse ///
          case '2':
            activeGlo.sameSizeEllipse = !activeGlo.sameSizeEllipse;
            break;
          /// Ctrl 3 -- Les avatars respectent une distance moyenne -- avatar, attraction -- dist_mean ///
          case '3':
            activeGlo.dist_mean = !activeGlo.dist_mean;
            break;
          /// Ctrl 4 -- Les avatars respectent une distance moyenne inversée -- avatar, attraction -- dist_mean_inv ///
          case '4':
            activeGlo.dist_mean_inv = !activeGlo.dist_mean_inv;
            break;
          /// Ctrl 5 -- Les avatars respectent une distance moyenne unique -- avatar, attraction -- dist_mean_one ///
          case '5':
            activeGlo.dist_mean_one = !activeGlo.dist_mean_one;
            break;
          /// Ctrl 6 -- Les avatars ont un second mouvement sinusoïdal -- avatar, attraction -- secondMove ///
          case '6':
            activeGlo.secondMove = !activeGlo.secondMove;
            break;
          /// Ctrl 7 -- Les avatars grossissent au passage de la souris -- avatar -- growByMouse ///
          case '7':
            activeGlo.growByMouse = !activeGlo.growByMouse;
            break;
          /// Ctrl 8 -- Les avatars se déplacent au hazard -- avatar, position -- moveOnAlea ///
          case '8':
            activeGlo.moveOnAlea = !activeGlo.moveOnAlea;
            break;
          /// Ctrl 9 -- Tout est paramétré au hazard -- avatar, modifier -- hyperAlea ///
          case '9':
            activeGlo.hyperAlea = !activeGlo.hyperAlea;
            break;
        }
      }
    }


    for(let prop in activeGlo){
      if(typeof activeGlo[prop] === 'boolean' && activeGlo[prop] !== activeGloSave[prop]){
        getSelectedModifiers().forEach(mod => { mod.glo[prop] = activeGlo[prop]; } );
        let tuch = tuchs.find(tuch => tuch.property === prop);
        if(tuch){
          activeGlo[prop] ? addClasses(getById(tuch.id), 'on') : removeClasses(getById(tuch.id), 'on');
        }
      }
    }
 
    activeGloSave = null;
  }
});
