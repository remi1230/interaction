//------------------ LANCEMENT DE LA BOUCLE DE DESSIN ----------------- //
document.addEventListener("DOMContentLoaded", function() {
    params_interface();
    feedHelp();
    createGoInterface();
    createCanvasMenu();
    createCheckboxesWithRange(activeGlo.colorFunctionLabels, 'colorCumulContainer', 'qMove', {event: 'onchange', func: 'checkColorFunctions()'});
    if(!localStorage.getItem('glo')){ createAvatar({nb: activeGlo.params.nb, w: activeGlo.size}); }
    else{ restoreFlash(); }
    animation();
});//

//------------------ ClICK ON UI TO HIDE MENU ----------------- //
ui.addEventListener('click', () => {
  if(!activeGlo.fromUpdGlo ){ hideMenu(); }
  activeGlo.fromUpdGlo = false;
});
//------------------ DBLClICK ON UI TO CHANGE INTERFACE ----------------- //
/*ui.addEventListener('dblclick', () => {
  changeInterface('+');
});*/
//------------------ WHEEL ON UI TO CHANGE INTERFACE ----------------- //
/*ui.addEventListener('wheel', (e) => {
  if(activeGlo.uiMouseDown){
    e.stopPropagation();
    if(e.deltaY > 0){ changeInterface('-'); }
    else{ changeInterface('+'); }
  }
});*/

ui.addEventListener('mousedown', () => { activeGlo.uiMouseDown = true; });
ui.addEventListener('mouseup',   () => { activeGlo.uiMouseDown = false; });

//------------------ UI PREVENTDEFAULT ----------------- //
ui.addEventListener('contextmenu', () => {
  event.preventDefault();
  if(!activeGlo.time){ activeGlo.time = new Date().getTime(); }
  else{
    let diffTime = new Date().getTime() - activeGlo.time;
    if(diffTime < 500){ changeInterface('-'); }
  }

  activeGlo.time = new Date().getTime();
});

//------------------ ClICK ON NUM INTERFACE ----------------- //
/*getById('num_interface').addEventListener('click', () => {
  event.stopPropagation();
  changeInterface('+');
});

//------------------ ClICK ON NUM INTERFACE ----------------- //
getById('num_interface').addEventListener('contextmenu', () => {
  event.preventDefault();
  changeInterface('-');
});*/

//------------------ ClICK ON SHOW / HIDE INTERFACE ----------------- //
getById('showHideInterface').addEventListener('click', () => {
  event.preventDefault();
  showHideInterface();
});
//------------------ ClICK SUR LE CANVAS POUR SWITCHER L'AFFICHAGE DES PARAMÉTRES ----------------- //
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
      if(!activeGlo.is_canvas_menu && !activeGlo.attract_mouse.state){
        if(typeof(activeGlo.num_params) == 'undefined'){ activeGlo.num_params = 0; }

        ui.style.display       = ui.style.display === 'none' ? '' : 'none';
        canvas.style.height    = ui.style.display === 'none' ? '98.25%' : '83.5%';
        structure.style.height = ui.style.display === 'none' ? '98.25%' : '83.5%';

        simpleUpdImage(ctx, fix_dpi, canvas);
        simpleUpdImage(ctxStructure, fix_dpi, structure);
      }
      else{
        hideMenu();
        if(activeGlo.defineCenter){ defineCenter(true, true); }
        else{
          if(activeGlo.modifierSelect.byOne || activeGlo.modifierSelect.byGroup){ modifier_select(); }
          else if(activeGlo.pos_modifiers != 'none' && !activeGlo.modifierSelect.isOneSelect()){ pos_modifier(activeGlo.pos_modifiers); }
        }
      }
    }
  }
});
//------------------ ClICK DROIT SUR LE CANVAS POUR MODIFIER DES PARAMÉTRES ----------------- //
structure.addEventListener('contextmenu', (e) => {
  activeGlo.modifierSelectbyRectangleOnRClick = true;
  e.preventDefault();
  modifier_select();
});
//------------------ MOUSE MOVEMENT ----------------- //
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
structure.addEventListener('wheel',     (e) => {
  e.preventDefault();

  if(e.shiftKey){
    if(event.deltaY > 0){ scale_avatars('-', event.deltaY); }
    else{ scale_avatars('+', -event.deltaY); }
  }
  if(e.altKey){
    if(event.deltaY > 0){ scale_modifiers('-', event.deltaY); }
    else{ scale_modifiers('+', -event.deltaY); }
  }
  else if(activeGlo.simpleMouseDown){
    step = !e.ctrlKey ? 0.0001 : 0.00001;
    activeGlo.showCircle = true;
    activeGlo.params.circle_size -= event.deltaY * step;

    if(activeGlo.params.circle_size < 0){ activeGlo.params.circle_size = 0; }

    updCtrl('circle_size');
  }
  else{
    let modNearestToMouse = getModNearestMouse(15);
    if(modNearestToMouse){
      modNearestToMouse.attract += event.deltaY*0.1;
    }
    else{
      getSelectedModifiers().forEach(mod => { mod.attract += Math.sign(mod.attract) * event.deltaY*0.1; });
      /*activeGlo.modifiers.forEach(mod => {
        if(mod.virtual){ mod.attract = activeGlo.params.wheel_force; }
      });

      activeGlo.params.wheel_force += event.deltaY*0.1;
      activeGlo.params.wheel_force = parseInt(activeGlo.params.wheel_force);
      updCtrl('wheel_force');
      activeGlo.modifiers.forEach(mod => { if(mod.virtual){ mod.attract = activeGlo.params.wheel_force; } });*/
    }
  }
});
structure.addEventListener('mousemove', (e) => {
  let rect = canvas.getBoundingClientRect();
  let coeff = {x: startWidth / canvas.clientWidth, y: startHeight / canvas.clientHeight};
  mouse.x = (e.clientX- rect.left) * coeff.x;
  mouse.y = (e.clientY - rect.top) * coeff.y;

  if(activeGlo.mode.infoOnMouse.state){ infoOnMouse(); }
  else if(activeGlo.posVirtualMod){
    if(activeGlo.virtual.modifier){ activeGlo.modifiers.forEach(mod => { if(mod.virtual){ mod.x = mouse.x; mod.y = mouse.y; } }); }
    else{ avatars.forEach(av => { if(av.virtual){ mouveVirtualAvatar(av); } }); }
  }
});
//------------------ WHEEL ON INPUTS ----------------- //
input_params.forEach(() => {
  addEventListener('mouseover', (e) => {
    let target = e.target;
    if(target.classList.contains('input_params')){
      input_params.forEach((input) => { input.dataset.focus = 'false'; });
      target.dataset.focus = 'true'; target.focus();
    }
  });
  addEventListener('mouseout', (e) => {
    if(e.target.classList.contains('input_params')){  e.target.dataset.focus = 'false'; }
  });
});
//------------------ STOP WINDOW KEYS EVENTS ON INPUTS ----------------- //
 stopWindowEvents.forEach(ctrl => {
   ctrl.addEventListener('focus', () => { activeGlo.stopWindowEvents = true; });
   ctrl.addEventListener('blur', () => { activeGlo.stopWindowEvents = false; });
 });
//------------------ ClICK DROIT SUR CTRL PARAMÉTRE ----------------- //
aleaOnRightClick(activeGlo.params);
function aleaOnRightClick(obj_param){
  for(var p in obj_param){
    let param = getById(p);
    //if(param == null){ alert(p); }
    param.addEventListener('contextmenu', (e) => {
      e.stopPropagation();
      e.preventDefault();

      let p = e.target.id;
      if(typeof(activeGlo.params_alea) == 'undefined'){ activeGlo.params_alea = {}; }
      activeGlo.params_alea[p] = !activeGlo.params_alea[p];
    });
  }
}
//------------------ ClICK GAUCHE SUR CTRL PARAMÉTRE QUAND ALEA ----------------- //
defineMinOrMax(activeGlo.params);
function defineMinOrMax(obj_param){
  for(var p in obj_param){
    let param = getById(p);
    param.addEventListener('mouseup', (e) => {
      let p = e.target.id;
      if(e.button == 0 && ((activeGlo.params_alea && activeGlo.params_alea[p]) || (activeGlo.mode.global_alea.state && activeGlo.alea[p]))){
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
//------------------ RESIZE CANVAS WHEN RESIZE WINDOW ----------------- //
window.addEventListener('resize', function () {
  if(activeGlo.mode.clear.state){ allCanvas.forEach(canvas => { fix_dpi(canvas); }); }
});

function changeGloAndMods(prop, mode = false){
  if(!mode){
    activeGlo[prop] = !activeGlo[prop];
    getSelectedModifiers.forEach(mod => { mod.glo[prop] = !mod.glo[prop]; });
  }
  else{
    activeGlo.mode[prop].state = !activeGlo[prop].clear.state;
    getSelectedModifiers.forEach(mod => { mod.glo.mode[prop].state = !mod.glo.mode[prop].state; });
  }
}

//------------------ ÉVÈNEMENTS D'APPUI SUR UNE TOUCHE ----------------- //
window.addEventListener("keydown", function (e) {
  let inputsSz;
  if(!activeGlo.stopWindowEvents && e.key != 'Shift'){
    if(e.key !== 'F12' && e.key !== 'f'){ e.preventDefault(); }

    let activeGloSave = deepCopy(activeGlo, 'modifiers');

    let i, center;
    let key = e.key;
    let createMenu = true, doNotInMods = false;
    if(isNaN(parseInt(key))){
      if(!e.ctrlKey){
        if(!e.altKey){
        	switch (key) {
            case 'Delete':
              let modsSz = activeGlo.modifiers.length;
              activeGlo.modifiers = activeGlo.modifiers.filter(mod => !mod.select);
              if(modsSz == activeGlo.modifiers.length){ activeGlo.modifiers = []; }
              avatars.forEach(av => { av.nearMod = {}; av.distMinModifiers = 9999; });

              break;
            /// F1 -- Effacement du canvas ///
            case 'F1':
              activeGlo.mode.clear.state = !activeGlo.mode.clear.state;

              break;
            /// F2 -- Style dessin ///
            case 'F2':
              /*activeGlo.shortcut.alphaVarSize = !activeGlo.shortcut.alphaVarSize;
              activeGlo.perm_var_size = activeGlo.shortcut.alphaVarSize;
              activeGlo.growDecrease  = activeGlo.shortcut.alphaVarSize;
              button_check('alphaAbs');

              if(activeGlo.growDecrease){ activeGlo.sizeLineSave = activeGlo.params.line_size; }
              else{ activeGlo.params.line_size = activeGlo.sizeLineSave; }*/

              //doNotInMods = true;
              alphaVarSize(activeGlo);
              getSelectedModifiers().forEach(mod => { alphaVarSize(mod.glo, false); });

              if(!activeGlo.shortcut.alphaVarSize){ avatars.forEach(av => { av.size = activeGlo.size; av.grow = 0; }); }

              break;
            /// F3 -- Dessélectionner tous les modifiers ///
            case 'F3':
              activeGlo.modifiers.forEach(mod => { mod.select = false; });

              break;
            /// F4 -- Sélectionner des modifiers au hazard ///
            case 'F4':
              activeGlo.modifiers.forEach(mod => { mod.select = false; if(round(rnd(), 0)){ mod.select = true; } });

              break;
            /// F5 -- Sélection / Déselection de tous les modifiers ///
            case 'F5':
              activeGlo.allModsSelected = !activeGlo.allModsSelected;
              activeGlo.modifiers.forEach(mod => { mod.select = activeGlo.allModsSelected; });

              break;
            /// F6 -- Inverser la sélection ///
            case 'F6':
              activeGlo.modifiers.forEach(mod => { mod.select = !mod.select; });

              break;
            /// F7 -- Sélection des modifiers positifs puis négatifs ///
            case 'F7':
              activeGlo.selectBySign = !activeGlo.selectBySign;
              let sign = activeGlo.selectBySign ? 1 : -1;
              activeGlo.modifiers.forEach(mod => {
                if(Math.sign(mod.attract) == sign){ mod.select = true; }
                else{ mod.select = false; }
              });

              break;
            /// F8 -- Sélection par groupe ///
            case 'F8':
              activeGlo.modifierSelect.update('byGroup');

              break;
            /// F9 -- Poser des modifiers en cercle avec la souris ///
            case 'F9':
              switchObjBools(activeGlo.posOnMouse, 'circleMods', false);

              break;
            /// F10 -- Copier le ou les modifiers sélectionnés avec la souris ///
            case 'F10':
              switchObjBools(activeGlo.posOnMouse, 'pasteMods', false);

              break;
            /// F11 -- Attribue au hazard une couleur à chaque modifier ///
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
            /// * -- Attribue les propriété du 1er modifier aux autres ///
        		case '*':
              getSelectedModifiers().forEach(mod => {
                for(let prop in activeGlo.modifiers[0]){
                  if(typeof(activeGlo.modifiers[0][prop]) === 'object'){ mod[prop] = deepCopy(activeGlo.modifiers[0][prop]); }
                  else if(prop != 'x' && prop != 'y'){ mod[prop] = activeGlo.modifiers[0][prop]; }
                }
                mod.select = true;
              });

        			break;
            /// b -- Les modifiers ont la couleur sélectionnée avec l'interface ///
        		case 'b':
              activeGlo.oneColor.state = !activeGlo.oneColor.state;
        			break;
            /// ù -- Switch entre un fond noir et blanc ///
        		case 'ù':
              activeGlo.bg_black = !activeGlo.bg_black;
              canvasContext[activeGlo.params.selectCanvas].canvas.style.backgroundColor = activeGlo.bg_black ? '#000' : '#fff';
        			break;
            /// & -- Mode de croissance hazardeuse des avatars ///
        		case '&':
              activeGlo.growDecrease = !activeGlo.growDecrease;
              if(activeGlo.growDecrease){ activeGlo.sizeLineSave = activeGlo.params.line_size; }
              else{ avatars.forEach(av => { av.size = activeGlo.size; }); activeGlo.params.line_size = activeGlo.sizeLineSave; }
        			break;
            /// é -- L'alpha des avatars change au hazard ///
        		case 'é':
              activeGlo.alphaRnd = !activeGlo.alphaRnd;
        			break;
            /// " -- Les alternateurs inversent leur attraction suivant une période ///
        		case '"':
              activeGlo.alternatorInvAtt = !activeGlo.alternatorInvAtt;
        			break;
            //FREE
        		case "'":
              e.preventDefault();
              activeGlo.colorSquare = !activeGlo.colorSquare;
        			break;
            //FREE
        		case "(":
              getSelectedModifiers().forEach(mod => {
                mod.haveColor = !mod.haveColor;
                if(mod.haveColor){
                  mod.color = {h: parseInt(rnd() * 360), s: 20 + parseInt(rnd() * 60), l: 20 + parseInt(rnd() * 60)};
                }
              });
              activeGlo.modifiersHaveColor = !activeGlo.modifiersHaveColor;
        			break;
            /// A -- Déplacer un curseur attribue la valeur réélle de celui-ci ///
        		case 'A':
              activeGlo.updByVal = !activeGlo.updByVal;
        			break;
            /// Z -- Décale de 180° les couleurs ///
        		case 'Z':
              let inputColorDec = getById('colorDec');

              inputColorDec.value = inputColorDec.value == '0' ? '180' : '0';
              inputColorDec.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, }));
        			break;
            /// X -- Flouter l'image ///
        		case 'X':
              blur();
        			break;
            /// C -- Rendre l'image plus nette ///
        		case 'C':
              sharp();
        			break;
            /// I -- Les couleurs sont calculées à partir des formules ///
        		case 'I':
              activeGlo.formuleColorMode = !activeGlo.formuleColorMode;
        			break;
        		case 'J':
              activeGlo.asyncModify = !activeGlo.asyncModify;
              if(activeGlo.asyncModify){ activeGlo.asyncNumModifier = 0; }
        			break;
            //Free
        		case 'L':
              activeGlo.modifiers.forEach(mod => { mod.select = false; if(round(rnd(), 0)){ mod.select = true; } });
        			break;
            /// G -- Les modifiers d'une seule couleur varie ou non la teinte ///
        		case 'G':
              activeGlo.addWithTint = !activeGlo.addWithTint;
        			break;
            /// V -- Le rayon de pose des avatars à comme centre les modifiers ///
        		case 'V':
              activeGlo.randomPointByMod = !activeGlo.randomPointByMod;
        			break;
            /// ° -- L'attraction augmente suivant la distance du modifier ///
        		case '°':
              activeGlo.forceByCenter = !activeGlo.forceByCenter;
        			break;
        		case '.':
              //Free
              activeGlo.oneModToAdd = !activeGlo.oneModToAdd;
        			break;
            /// % -- La taille des avatars diminue suivant la distance du centre ///
        		case '%':
              activeGlo.dimSizeCenter = !activeGlo.dimSizeCenter;
        			break;
            //FREE
        		case 'µ':
              activeGlo.dash++;
              applyToSelectedMods('dash');
              break;
            //FREE
        		case '§':
              if(activeGlo.dash > 1){ activeGlo.dash--; }
              applyToSelectedMods('dash');
        			break;
            /// ) -- Mode de déplacement en courbe ///
        		case ')':
              activeGlo.curve = !activeGlo.curve;
              break;
            /// Esc -- Rechargement de la page ///
        		case 'Escape':
              location.reload();
        			break;
            /// ² -- RAZ des avatars avec pose au hazard ///
        		case '²':
              activeGlo.createMod = 'random';
              if(activeGlo.mode.clearForm.state){ clear(); }
              keepBreak(raz_avatars);
        			break;
            /// n -- Style de ligne ///
        		case 'n':
              activeGlo.numLineCap++;
              applyToSelectedMods('numLineCap');
        			break;
            //FREE
        		case 'r':
              activeGlo.createMod = 'random';
              if(activeGlo.mode.clearForm.state){ clear(); }
              keepBreak(raz_avatars);
        			break;
            /// q -- Créer un carré d'avatars ///
        		case 'q':
              activeGlo.createMod = 'square';
              if(activeGlo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {size: canvas.width/4} });
        			break;
            /// c -- Créer un cercle d'avatars ///
        		case 'c':
              activeGlo.createMod = 'circle';
              center = canvas.getCenter();
              if(activeGlo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {name: 'circle', size: canvas.width/4}, center: center });
        			break;
            /// £ -- Créer un polygone d'avatars ///
        		case '£':
              activeGlo.createMod = 'poly';
              center = canvas.getCenter();
              if(activeGlo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {name: 'poly', size: canvas.width/4}, center: center });
        			break;
            /// è -- Créer une spirale d'avatars ///
        		case 'è':
              activeGlo.createMod = 'spiral';
              center = canvas.getCenter();
              if(activeGlo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {name: 'spiral', size: canvas.width/4}, center: center });
        			break;
            /// u -- Créer un rectangle d'avatars ///
        		case 'u':
              createMenu = false; activeGlo.createMod = 'rect';
              if(activeGlo.mode.clearForm.state){ clear(); }
              keepBreak(function(){ var nb = activeGlo.params.nb; deleteAvatar('all'); activeGlo.params.nb = nb; createAvatar({form: {name: 'rect'} }); });
        			break;
            /// + - -- Rapproche ou éloigne les avatars du centre ///
        		case '+': case '-':
              keepBreak(scale_avatars, key);
        			break;
            /// z -- Transforme l'image en noir et blanc ///
        		case 'z':
              grey_color();
        			break;
            /// _ -- Sauvegarde les modes et paramètres ///
        		case '_':
              takeShot();
        			break;
            /// ç -- Restore les modes et paramètres ///
        		case 'ç':
              goToShot();
        			break;
            /// à -- Inverse le brake ///
        		case 'à':
              activeGlo.invBrake = !activeGlo.invBrake;
        			break;
            /// , -- Une spirale négative tourne dans le sens inverse ///
        		case ',':
              activeGlo.spiralOnlyInvrot = !activeGlo.spiralOnlyInvrot;
        			break;
            /// F -- Modifiers en mode une couleur ///
        		case 'F':
              getSelectedModifiers().forEach(mod => { mod.haveColor = !mod.haveColor; });
              activeGlo.modifiersHaveColor = !activeGlo.modifiersHaveColor;
        			break;
            /// = -- Interface visible ou pas ///
        		case '=':
              showHideInterface('showHideInterface');
        			break;
            /// t -- Affiche le centre ///
        		case 't':
              activeGlo.view_center = !activeGlo.view_center;
        			break;
            /// ; -- Variation de taille des avatars ///
        		case ';':
              activeGlo.perm_var_size = !activeGlo.perm_var_size;
              activeGlo.sizeLineSave = activeGlo.params.line_size;
        			break;
            /// : -- Avec gravité, affiche les points de rencontre des avatars ///
        		case ':':
              activeGlo.crossPoints = !activeGlo.crossPoints;
        			break;
            /// Etr -- Avec gravité, relie les points de rencontre des avatars ///
        		case 'Enter':
              activeGlo.lineCrossPoints = !activeGlo.lineCrossPoints;
        			break;
            /// j -- Télécharge un png du canvas ///
        		case 'j':
              downloadCanvas();
        			break;
            /// ▼ -- Exécution pas à pas ///
        		case 'PageDown':
              if(!activeGlo.mode.totalBreak.state){ button_check('totalBreak'); }
              keepBreak(function(){});
        			break;
            /// < -- Dessine un cercle d'avatars ///
        		case '<':
              keepBreak(glo_params, 'test');
              activeGlo.createMod = 'circle';
              var cent = canvas.getCenter();
              if(activeGlo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {name: 'circle', size: canvas.width/4}, center: cent });
        			break;
            /// > -- Rotation des couleurs de l'image ///
        		case '>':
              createMenu = false;
              rotateColor();
        			break;
            /// ← -- Déplace les avatars vers la gauche ///
            case 'ArrowLeft':
              if(!e.shiftKey){
                activeGlo.trans.state = true;
                activeGlo.trans.dir   = 'left';
              }
              else{ rotate_modifiers(-rad); }
              break;
            /// → -- Déplace les avatars vers la droite ///
            case 'ArrowRight':
              if(!e.shiftKey){
                activeGlo.trans.state = true;
                activeGlo.trans.dir   = 'right';
              }
              else{ rotate_modifiers(rad); }
              break;
            /// ↑ -- Déplace les avatars vers le haut ///
            case 'ArrowUp':
              activeGlo.trans.state = true;
              activeGlo.trans.dir   = 'up';
              break;
            /// ↓ -- Déplace les avatars vers le bas ///
            case 'ArrowDown':
              activeGlo.trans.state = true;
              activeGlo.trans.dir   = 'down';
              break;
        	}
          for(let prop in activeGlo.mode){
            if(typeof(activeGlo.mode[prop].key) != 'undefined' && typeof(activeGlo.mode[prop].specialKey) == 'undefined' && activeGlo.mode[prop].key == key){
              if(key == ' '){ e.preventDefault(); }
              button_check(prop);
            }
          }
        }
        else{
          e.preventDefault();
          switch (key) {
            /// Alt w -- Menu avec simples touches ///
            case 'w':
              createCanvasMenu();
              showMenu();
              break;
            /// Alt x -- Menu avec MAJ ///
            case 'x':
              createCanvasMenu(activeGlo.mode, 'maj');
              showMenu();
              break;
            /// Alt c -- Menu avec CTRL ///
            case 'c':
              createCanvasMenu(activeGlo.mode, 'ctrl');
              showMenu();
              break;
            /// Alt h -- Affiche ou cache cette liste de touches ///
            case 'h':
              toggleHelpDialog();
              break;
            //FREE
            case 's':
              createCanvasBoolMenu();
              showMenu();
              break;
            /// Alt i -- Inverse l'attraction des modifiers ///
            case 'i':
              getSelectedModifiers().forEach(mod => { mod.attract = -mod.attract; mod.rot_spi = -mod.rot_spi; });
              break;
            //FREE
            case 'v':
              activeGlo.modifierSelect.update('byOne');
              break;
            //FREE
            case 'b':
              activeGlo.modifierSelect.update('byGroup');
              break;
            //FREE
            case 'n':
              activeGlo.modifierSelect.update('byRectangle');
              break;
            //FREE
            case ',':
              switchObjBools(activeGlo.posOnMouse, 'pasteMods', false);
              break;
            /// Alt a -- Affiche une grille carrée ///
            case 'a':
              if(activeGlo.grid.type == 'square' || activeGlo.grid.type == 'none'){ activeGlo.grid.draw = !activeGlo.grid.draw; }
              activeGlo.grid.type = activeGlo.grid.draw ? 'square' : 'none';
              break;
            /// Alt z -- Affiche une grille ronde ///
            case 'z':
              if(activeGlo.grid.type == 'circle' || activeGlo.grid.type == 'none'){ activeGlo.grid.draw = !activeGlo.grid.draw; }
              activeGlo.grid.type = activeGlo.grid.draw ? 'circle' : 'none';
              break;
            /// Alt e -- Affiche une grille au tiers ///
            case 'e':
              if(activeGlo.grid.type == 'third' || activeGlo.grid.type == 'none'){ activeGlo.grid.draw = !activeGlo.grid.draw; }
              activeGlo.grid.type = activeGlo.grid.draw ? 'third' : 'none';
              break;
            /// Alt r -- Affiche une grille héxagonale ///
            case 'r':
              if(activeGlo.grid.type == 'hexagone' || activeGlo.grid.type == 'none'){ activeGlo.grid.draw = !activeGlo.grid.draw; }
              activeGlo.grid.type = activeGlo.grid.draw ? 'hexagone' : 'none';
              break;
            //FREE
            case '&':
              if(activeGlo.grid.type == 'spirale' || activeGlo.grid.type == 'none'){ activeGlo.grid.draw = !activeGlo.grid.draw; }
              activeGlo.grid.type = activeGlo.grid.draw ? 'spirale' : 'none';
              break;
            /// Alt g -- Pose des modifiers sur la grille ///
            case 'g':
              activeGlo.putOnGrid = !activeGlo.putOnGrid;
              break;
            /// Alt t -- Affiche des infos ///
            case 't':
              activeGlo.showInfos = !activeGlo.showInfos;
              break;
            //FREE
            case 'f':
              activeGlo.modifiersDrawNear = !activeGlo.modifiersDrawNear;
              break;
            //FREE
            case '&':
              switchObjBools(activeGlo.posOnMouse, 'circleMods', false);
              break;
            /// Alt ç -- Rotation polygonale plus précise ///
            case 'ç':
              activeGlo.polyPrecision = !activeGlo.polyPrecision;
              break;
            /// Alt + -- Augmente la visibilité de l'interface ///
            case '+':
              if(ui.style.opacity < 1 && ui.style.opacity != ""){ ui.style.opacity = parseFloat(ui.style.opacity) + 0.02; }
              break;
            /// Alt - -- Diminue la visibilité de l'interface ///
            case '-':
              if(ui.style.opacity == ""){ ui.style.opacity = "0.99"; }
              else if(ui.style.opacity > 0){ ui.style.opacity = parseFloat(ui.style.opacity) - 0.02; }
              break;
            //FREE
            case '"':
              getSelectedModifiers().forEach(mod => { mod.modsWithSign = !mod.modsWithSign; });
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
            /// Alt p -- Déplacement des modifiers sur la grille ///
            case 'p':
              putModsOnGrid();
              break;
            /// Alt y -- Pose un carré de modifiers ///
            case 'y':
              posSquareModifiers();
              break;
            /// Alt u -- Pose un rectangle de modifiers ///
            case 'u':
              posRectModifiers();
              break;
            /// Alt < -- x10 le pas du slider seléctionné ///
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
            /// Alt q -- /10 le pas du slider seléctionné ///
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
            /// Alt ← -- Déplace les modifiers vers la gauche ///
            case 'ArrowLeft':
              translateModifiers(-10, 0);
              break;
            /// Alt → -- Déplace les modifiers vers la droite ///
            case 'ArrowRight':
              translateModifiers(10, 0);
              break;
            /// Alt ↑ -- Déplace les modifiers vers le haut ///
            case 'ArrowUp':
              translateModifiers(0, -10);
              break;
            /// Alt ↓ -- Déplace les modifiers vers le bas ///
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
          /// Ctrl o -- Import d'un fichier JSON ///
            case 'o':
              impt_json();
              break;
            /// Ctrl a -- L'orientation des modifiers se fait depuis le centre ou pas ///
            case 'a':
              activeGlo.orientedPoly = !activeGlo.orientedPoly;
              break;
            /// Ctrl r -- Stroke au hazard ///
            case 'r':
              activeGlo.alea_stroke = !activeGlo.alea_stroke;
              break;
            /// Ctrl ) -- Avatar virtuel ///
            case ')':
              switchObjBools(activeGlo.virtual, 'avatar', false);
              break;
            /// Ctrl l -- Inverse périodiquement les couleurs ///
            case 'l':
              activeGlo.alternColor = !activeGlo.alternColor;
              break;
            /// Ctrl & -- Infos persistantes ///
            case '&':
              activeGlo.persistModsInfo = !activeGlo.persistModsInfo;
              break;
            //FREE
            case 'p':
              activeGlo.noBlankTest = !activeGlo.noBlankTest;
              break;
            /// Ctrl ; -- La pose d'un avatar est virtuelle ///
            case ';':
              switchObjBools(activeGlo.virtual, 'modifier', false);
              break;
            /// Ctrl * --  ///
            case '*':
              activeGlo.starPoly = !activeGlo.starPoly;
              break;
            /// Ctrl , -- Pour des tests avec la souris ///
            case ',':
              activeGlo.testOnMouse = !activeGlo.testOnMouse;
              break;
            /// Ctrl z -- Affiche les modifiers ///
            case 'z':
              activeGlo.view_modifiers = !activeGlo.view_modifiers;
              break;
            /// Ctrl j -- Les couleurs se mélangent ///
            case 'j':
              activeGlo.colorsAdd = !activeGlo.colorsAdd;
              break;
            /// Ctrl k -- Couleur de fond préférée ///
            case 'k':
              activeGlo.canvasLoveBg.state = !activeGlo.canvasLoveBg.state;
              if(activeGlo.canvasLoveBg.state){
                activeGlo.canvasLoveBg.save  = canvas.style.backgroundColor;
                canvas.style.backgroundColor = activeGlo.canvasLoveBg.color;
              }
              else{
                canvas.style.backgroundColor = activeGlo.canvasLoveBg.save;
              }
              break;
            //FREE
            case 'b':
              activeGlo.modifiers.forEach(mod => { mod.select = false; });
              break;
            //FREE
            case 's':
              activeGlo.params.wheel_force = -activeGlo.params.wheel_force;
              updCtrl('wheel_force');
              activeGlo.modifiers.forEach(mod => { if(mod.virtual){ mod.attract = activeGlo.params.wheel_force; } });
              break;
            /// Ctrl q -- Avec rayon d'attraction, mode chaos ///
            case 'q':
              activeGlo.chaos = !activeGlo.chaos;
              break;
            /// Ctrl c -- Permet de définir le centre d'un click ///
            case 'c':
              activeGlo.defineCenter = !activeGlo.defineCenter;
              break;
            /// Ctrl d -- RAZ du centre ///
            case 'd':
              defineCenter(false, false);
              break;
            /// Ctrl v -- Taille des avatars selon la distance des modifiers ///
            case 'v':
              activeGlo.sizeDirCoeff = !activeGlo.sizeDirCoeff;
              break;
            /// Ctrl ! -- Double les avatars ///
            case '!':
              activeGlo.doubleAvatar = !activeGlo.doubleAvatar;
              activeGlo.noLimLine    = !activeGlo.noLimLine;
              break;
            /// Ctrl m -- Pose des modifiers avec un position au hazard ///
            case 'm':
              posModifiers();
              break;
            /// Ctrl y -- Pose un cercle de modifiers ///
            case 'y':
              posCircleModifiers();
              break;
            /// Ctrl u -- Pose un polygone de modifiers ///
            case 'u':
              posPolyModifiers();
              break;
            /// Ctrl e -- Inverse les couleurs de l'image ///
            case 'e':
              invColors();
              break;
            /// Ctrl + -- Augmente la distance au centre des modifiers ///
            case '+': case '-':
              keepBreak(scale_modifiers, key);
              break;
            //FREE
            case 'x':
              let gcoLength = gco.length;
              if(typeof(activeGlo.num_gco) == 'undefined'){ activeGlo.num_gco = 0; }

              if(activeGlo.num_gco < gcoLength - 1){ activeGlo.num_gco++; }
              else{ activeGlo.num_gco = 0; }

              ctx.save_globalCompositeOperation = ctx.globalCompositeOperation;
              ctx.globalCompositeOperation      = gco[activeGlo.num_gco];

              console.log(ctx.globalCompositeOperation);

              break;
            /// Ctrl ² -- La distance ne compte plus pour les modifiers ///
            case '²':
              modsToZero();
              break;
            /// Ctrl < -- RAZ du slider seléctionné ///
            case '<':
              inputsSz = input_params.length;
              for(let i = 0; i < inputsSz; i++){
                let input = input_params[i];
                if(input.dataset.focus && input.dataset.focus == 'true'){
                  let startVal = parseFloat(input.dataset.startValue);
                  if(parseInt(startVal) == startVal){ startVal = parseInt(startVal) ; }
                  input.value = startVal;
                  let event = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                  });
                  input.dispatchEvent(event);
                  break;
                }
              }
              break;
            /// Ctrl ← -- Déplace les modifiers vers la gauche ///
              case 'ArrowLeft':
                translateModifiers(-1, 0);
                break;
              /// Ctrl → -- Déplace les modifiers vers la droite ///
              case 'ArrowRight':
                translateModifiers(1, 0);
                break;
              /// Ctrl ↑ -- Déplace les modifiers vers le haut ///
              case 'ArrowUp':
                translateModifiers(0, -1);
                break;
              /// Ctrl ↓ -- Déplace les modifiers vers le bas ///
              case 'ArrowDown':
                translateModifiers(0, 1);
                break;
          }
        }
        for(let prop in activeGlo.mode){
          if(typeof(activeGlo.mode[prop].key) != 'undefined' && typeof(activeGlo.mode[prop].specialKey) != 'undefined' &&
          activeGlo.mode[prop].specialKey == 'ctrl' && activeGlo.mode[prop].key == key){
            if(key == ' '){ e.preventDefault(); }
            button_check(prop);
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
          /// 9 -- Couleur de fond = couleur moyenne ///
            case '9':
              updBgToAvColor();
              break;
            /// 8 -- Couleur de fond = inverse de couleur moyenne ///
            case '8':
              updBgToAvColor(true);
              break;
            /// 7 -- Couleur de fond = couleur moyenne (réactualisée) ///
            case '7':
              activeGlo.updBgToAvColor = !activeGlo.updBgToAvColor;
              break;
            /// 6 -- Pose des modifiers en quinconce ///
            case '6':
              activeGlo.staggered = !activeGlo.staggered;
              break;
            /// 5 -- Brake à zéro des modifers ///
            case '5':
              activeGlo.brakeModstoZero = !activeGlo.brakeModstoZero;
              if(activeGlo.brakeModstoZero){ getSelectedModifiers().forEach(mod => { mod.brakeSave = mod.brake; mod.brake = 0; }); }
              else{ getSelectedModifiers().forEach(mod => { mod.brake = mod.brakeSave; }); }
              break;
            /// 4 -- Poser des avatars avec la souris ///
            case '4':
              switchObjBools(activeGlo.posOnMouse, 'avatar', false);
              break;
            /// 3 -- Doubler les modifiers ///
            case '3':
              getSelectedModifiers().forEach(mod => { mod.double = !mod.double; mod.dblForce = mod.double ? 200 : 1; });
              break;
            //FREE
            case '2':
              activeGlo.doubleMods = !activeGlo.doubleMods;
              break;
          }
        }
      }
      else{
        e.preventDefault();
        switch (key) {
          /// 1 -- Résistance à 1 ///
          case '1':
            let ctrl_resist = getById('resist');
            ctrl_resist.value = 1;
            updateGlo(ctrl_resist);
            break;
        }
        for(let prop in activeGlo.mode){
          if(typeof(activeGlo.mode[prop].key) != 'undefined' && typeof(activeGlo.mode[prop].specialKey) != 'undefined' &&
          activeGlo.mode[prop].specialKey == 'ctrl' && activeGlo.mode[prop].key == key){
            if(key == ' '){ e.preventDefault(); }
            button_check(prop);
          }
        }
      }
    }

    if(!doNotInMods){
      for(let prop in activeGlo){
        if(typeof activeGlo[prop] === 'boolean' && activeGlo[prop] !== activeGloSave[prop]){
          getSelectedModifiers().forEach(mod => { mod.glo[prop] = activeGlo[prop]; } );
        }
      }
      for(let prop in activeGlo.mode){
        if(typeof activeGloSave.mode[prop] === 'undefined' || activeGlo.mode[prop].state !== activeGloSave.mode[prop].state){
          getSelectedModifiers().forEach(mod => {
            mod.glo.mode[prop] = deepCopy(activeGlo.mode[prop]);
          });
          break;
        }
      }
    }

    doNotInMods = false;
    activeGloSave = null;
  }
});

function alphaVarSize(obj, buttonCk = true){
  obj.shortcut.alphaVarSize = !obj.shortcut.alphaVarSize;
  obj.perm_var_size = obj.shortcut.alphaVarSize;
  obj.growDecrease  = obj.shortcut.alphaVarSize;

  if(buttonCk){ button_check('alphaAbs'); }

  if(obj.growDecrease){ obj.sizeLineSave = obj.params.line_size; }
  else{ obj.params.line_size = obj.sizeLineSave; }
}

function feedHelp(){
  fetch('./js/event.js').then(res => res.text()).then(text => {
    const regex = /\/\/\/(.*?)\/\/\//g;
    tuchs = text.match(regex);
    tuchs = tuchs.map( tuch => {
      let infos = tuch.substring(4, tuch.length - 4).split(' -- ');

      return {ctrl: infos[0].toLowerCase().includes("ctrl"), alt: infos[0].toLowerCase().includes("alt"), tuch: infos[0], action: infos[1]};
    });
    //tuchs.sort((a,b) => (a.tuch  > b.tuch ) ? 1 : ((b.tuch  > a.tuch ) ? -1 : 0));
  });
}

function toggleHelpDialog(){
  helpDialogVisible = !helpDialogVisible;

  if(helpDialogVisible){
    tuchs.forEach(tuch => {
      let divContainer = document.createElement("div");
      let kbdTuch      = document.createElement("kbd");
      let divAction    = document.createElement("div");

      kbdTuch.className = 'keys';

      let txtTuch   = document.createTextNode(tuch.tuch);
      let txtAction = document.createTextNode(tuch.action);

      kbdTuch.appendChild(txtTuch);
      divAction.appendChild(txtAction);

      let tuchToTrigger = tuch.ctrl || tuch.alt ? tuch.tuch.substr(-1) : tuch.tuch;

      kbdTuch.setAttribute('onclick', `window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'${tuchToTrigger}', 'ctrlKey' : ${tuch.ctrl}, 'altKey' : ${tuch.alt}})); `);

      kbdTuch.style.textAlign      = 'center';
      divAction.style.paddingRight = '30px';

      divContainer.style.display             = 'grid';
      divContainer.style.gridTemplateColumns = '50px 100%';
      divContainer.style.columnGap = '5px';

      divContainer.appendChild(kbdTuch);
      divContainer.appendChild(divAction);

      helpDialogGrid.appendChild(divContainer);
    });
    helpDialog.showModal();
  }
  else{
    helpDialogGrid.replaceChildren();
    helpDialog.close();
  }
}

function applyToSelectedMods(prop){
  getSelectedModifiers().forEach(mod => { mod.glo[prop] = activeGlo[prop]; } );
}










//END
