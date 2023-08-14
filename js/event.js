//------------------ LANCEMENT DE LA BOUCLE DE DESSIN ----------------- //
document.addEventListener("DOMContentLoaded", function() {
    params_interface();
    createGoInterface();
    createCheckboxesWithRange(activeGlo.colorFunctionLabels, 'colorCumulContainer', 'qMove', {event: 'onchange', func: 'checkColorFunctions()'});
    feedHelp();
    if(!localStorage.getItem('glo')){ createAvatar({nb: activeGlo.params.nb, w: activeGlo.size}); }
    else{ restoreFlash(); }
    getById('brushFormType_0').checked = true;
    animation();
});

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

//------------------ ClICK ON SHOW / HIDE INTERFACE ----------------- //
getById('showHideInterfaceTxt').addEventListener('click', () => {
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
structure.addEventListener('wheel', (e) => {
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
    if(!activeGlo.inputToSlideWithMouse ){ getSelectedModifiers().forEach(mod => { mod.attract += Math.sign(mod.attract) * event.deltaY*0.1; }); }
    else{
      activeGlo.inputToSlideWithMouse.value = parseFloat(activeGlo.inputToSlideWithMouse.value) + (parseFloat(activeGlo.inputToSlideWithMouse.step) * Math.sign(event.deltaY));
      activeGlo.inputToSlideWithMouse.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, }));
    }
  }
});
structure.addEventListener('mousemove', (e) => {
  let rect = canvas.getBoundingClientRect();
  let coeff = {x: startWidth / canvas.clientWidth, y: startHeight / canvas.clientHeight};
  mouse.x = (e.clientX- rect.left) * coeff.x;
  mouse.y = (e.clientY - rect.top) * coeff.y;

  if(activeGlo.infoOnMouse){ infoOnMouse(); }
  else if(activeGlo.posVirtualMod){
    if(activeGlo.virtual.modifier){ activeGlo.modifiers.forEach(mod => { if(mod.virtual){ mod.x = mouse.x; mod.y = mouse.y; } }); }
    else{ avatars.forEach(av => { if(av.virtual){ mouveVirtualAvatar(av); } }); }
  }
});

// Fermeture des modaux
helpDialog.addEventListener('click', () => {
  helpDialogVisible = !helpDialogVisible;
  helpDialog.close();
});
brushDialog.addEventListener('click', () => {
  brushCanvasMouseDown = false;
  brushDialogVisible = !brushDialogVisible;
  brushDialog.close();
});
helpDialogGrid.addEventListener('click', (event) => event.stopPropagation());


//*************************************CANVAS POUR LA BROSSE*************************************//
function toggleBrushDialog(){
  brushDialogVisible = !brushDialogVisible;

  if(brushDialogVisible){
    ctxBrush.clearRect(0, 0, brushCanvas.width, brushCanvas.height);
    
    if(activeGlo.modifiers.length){ getSelectedModifiers().forEach(mod => { mod.glo.stepsBrush = []; }); }
    else{ activeGlo.stepsBrush = []; }

    mouseCanvasClick     =  { x: 0, y: 0, form: false};
    mouseCanvasLastClick =  { x: 0, y: 0, form: false};
    mouseCanvas          =  { x: 0, y: 0, first: true, form: false};
    mouseCanvasLast      =  { x: 0, y: 0, first: true, form: false};

    mouseCanvasChangeToLine = false;
    brushCanvasMouseDown    = false;
    brushCanvasMouseUp      = false;

    if(getById('brushFormType_1').checked){
      savePtOnBrushCanvas({x: 0, y: 0});
    }
    
    brushDialog.showModal();
    fix_dpi(brushCanvas);
  }
  else{ brushDialog.close(); }
}

brushCanvas.addEventListener('mousedown', e => {
  brushCanvasMouseDown = true;
  mouseCanvasLastClick = mouseCanvasClick;
  mouseCanvasClick     = getMousePos(e, brushCanvas);
  
  saveMoveOrPtOnBrushCanvas(mouseCanvas, activeGlo.brushType, 'mousedown', brushCanvasMouseUp);
  if(!mouseCanvasChangeToLine){ drawOnBrushCanvas(); }
  else{ drawOnBrushCanvas(activeGlo.brushType === 'manual' || activeGlo.brushType === 'line' ? 'manual' : activeGlo.brushType); }

  mouseCanvasChangeToLine = false;
  brushCanvasMouseUp      = false;
} );

getById('brushFormType_1').addEventListener('change', _event => {
  mouseCanvasChangeToLine = getById('brushFormType_1').checked;
});

brushCanvas.addEventListener('mouseup', _event => {
  brushCanvasMouseDown = false;
  brushCanvasMouseUp   = true;
} );

brushCanvas.addEventListener('mousemove', e => {
  mouseCanvasLast = mouseCanvas;
  mouseCanvas     = getMousePos(e, brushCanvas);

  if(brushCanvasMouseDown && activeGlo.brushType === 'manual'){
    saveMoveOrPtOnBrushCanvas(mouseCanvas, activeGlo.brushType, 'mousemove');
    drawLineOnBrushCanvas();
  }
});
//***********************************************************************************************//


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
//------------------ RESIZE CANVAS WHEN RESIZE WINDOW ----------------- //
window.addEventListener('resize', function () {
  if(activeGlo.clear){ allCanvas.forEach(canvas => { fix_dpi(canvas); }); }
});

//------------------ ÉVÈNEMENTS D'APPUI SUR UNE TOUCHE ----------------- //
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
              let modsSz = activeGlo.modifiers.length;
              activeGlo.modifiers = activeGlo.modifiers.filter(mod => !mod.select);
              if(modsSz == activeGlo.modifiers.length){ activeGlo.modifiers = []; }
              avatars.forEach(av => { av.nearMod = {}; av.distMinModifiers = 9999; });

              break;
            /// F1 -- Effacement du canvas -- canvas -- clear ///
            case 'F1':
              activeGlo.clear = !activeGlo.clear;

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
              activeGlo.strokeAndFill = !activeGlo.strokeAndFill;
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
            /// . -- Pose des modifiers sur les sélectionnés -- modifiers, selection, pose ///
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
              activeGlo.totalBreak = !activeGlo.totalBreak;
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
            /// = -- Interface visible ou pas -- interface ///
        		case '=':
              showHideInterface();
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
              activeGlo.modifiers = [];
              
              if(!activeGlo.randomPointByMod){ window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'V', 'ctrlKey' : false, 'altKey' : false})); }
              keepBreak(glo_params, 'test');
              clear();

              window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'²', 'ctrlKey' : false, 'altKey' : false}));
              if(!activeGlo.shortcut.alphaVarSize){ window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'F2', 'ctrlKey' : false, 'altKey' : false})); }
              window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'y', 'ctrlKey' : true, 'altKey' : false}));
              if(activeGlo.clear){ window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'F1', 'ctrlKey' : false, 'altKey' : false})); }
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
            /// Alt a -- Affiche une grille carrée -- interface, grille ///
            case 'a':
              if(activeGlo.grid.type == 'square' || activeGlo.grid.type == 'none'){ activeGlo.grid.draw = !activeGlo.grid.draw; }
              activeGlo.grid.type = activeGlo.grid.draw ? 'square' : 'none';
              break;
            /// Alt b -- Incline positivement le canvas verticalement -- canvas, transformation ///
            case 'b':
              tiltCanvas('v', 0.25);
              break;
            /// Alt c -- Pose des modifiers par symétrie totale des sélectionnés -- modifier, position ///
            case 'c':
              modsSymToCenter('all');
              break;
            /// Alt e -- Affiche une grille au tiers -- interface, grille ///
            case 'e':
              if(activeGlo.grid.type == 'third' || activeGlo.grid.type == 'none'){ activeGlo.grid.draw = !activeGlo.grid.draw; }
              activeGlo.grid.type = activeGlo.grid.draw ? 'third' : 'none';
              break;
            /// Alt f -- Incline le négativement canvas verticalement -- canvas, transformation ///
            case 'f':
              tiltCanvas('v', -0.25);
              break;
            /// Alt g -- Pose des modifiers sur la grille -- modifier, grille -- putOnGrid ///
            case 'g':
              activeGlo.putOnGrid = !activeGlo.putOnGrid;
              break;
            /// Alt h -- Affiche ou cache cette liste de touches -- interface ///
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
            /// Alt f -- Incline positivement le canvas horizontalement -- canvas, transformation ///
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
            /// Alt p -- Déplacement des modifiers sur la grille -- modifier, deplacement, grille ///
            case 'p':
              putModsOnGrid();
              break;
            /// Alt r -- Affiche une grille héxagonale -- interface, grille ///
            case 'r':
              if(activeGlo.grid.type == 'hexagone' || activeGlo.grid.type == 'none'){ activeGlo.grid.draw = !activeGlo.grid.draw; }
              activeGlo.grid.type = activeGlo.grid.draw ? 'hexagone' : 'none';
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
            /// Alt z -- Affiche une grille ronde -- interface, grille ///
            case 'z':
              if(activeGlo.grid.type == 'circle' || activeGlo.grid.type == 'none'){ activeGlo.grid.draw = !activeGlo.grid.draw; }
              activeGlo.grid.type = activeGlo.grid.draw ? 'circle' : 'none';
              break;
            /// Alt ç -- Rotation polygonale plus précise -- caslcul -- polyPrecision  ///
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
            //FREE
            case 'b':
              activeGlo.modifiers.forEach(mod => { mod.select = false; });
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
              activeGlo.canvasLoveBg.state = !activeGlo.canvasLoveBg.state;
              if(activeGlo.canvasLoveBg.state){
                activeGlo.canvasLoveBg.save  = canvas.style.backgroundColor;
                canvas.style.backgroundColor = activeGlo.canvasLoveBg.color;
              }
              else{
                canvas.style.backgroundColor = activeGlo.canvasLoveBg.save;
              }
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
            //FREE
            case 's':
              activeGlo.params.wheel_force = -activeGlo.params.wheel_force;
              updCtrl('wheel_force');
              activeGlo.modifiers.forEach(mod => { if(mod.virtual){ mod.attract = activeGlo.params.wheel_force; } });
              break;
            /// Ctrl u -- Pose un polygone de modifiers -- modifier, pose ///
            case 'u':
              posPolyModifiers();
              break;
            /// Ctrl v -- Taille des avatars selon la distance des modifiers -- avatar, taille -- sizeDirCoeff ///
            case 'v':
              activeGlo.sizeDirCoeff = !activeGlo.sizeDirCoeff;
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
                  let event = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                  });
                  input.dispatchEvent(event);
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

function alphaVarSize(obj, buttonCk = true){
  obj.shortcut.alphaVarSize = !obj.shortcut.alphaVarSize;
  obj.perm_var_size         = obj.shortcut.alphaVarSize;
  obj.growDecrease          = obj.shortcut.alphaVarSize;
  obj.alphaAbs              = !obj.alphaAbs;


  if(obj.growDecrease){ obj.sizeLineSave = obj.params.line_size; }
  else{ obj.params.line_size = obj.sizeLineSave; }
}

async function feedHelp(){
  fetch('./js/event.js').then(res => res.text()).then(text => {
    const regex = /\/\/\/(.*?)\/\/\//g;
    tuchs = text.match(regex);
    tuchs = tuchs.map( tuch => {
      let infos = tuch.substring(4, tuch.length - 4).split(' -- ');
 
      let tags     = infos[2] ? infos[2].replace(/\s/g, '').toLowerCase().split(',') : '';
      let property = infos[3] ? infos[3].replace(/\s/g, '') : '';

      if(tags){ tags.forEach(tag => { HTags.push(tag); }); }

      return {ctrl: infos[0].toLowerCase().includes("ctrl"), alt: infos[0].toLowerCase().includes("alt"), tuch: infos[0], action: infos[1], tags: tags, property: property};
    });

    if(HTags.length){ HTags = [...new Set(HTags)]; HTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); }

    constructHelpDialog(true);
  });
}

function toggleHelpDialog(){
  helpDialogVisible = !helpDialogVisible;

  if(helpDialogVisible){ helpDialog.showModal(); }
  else{ helpDialog.close(); }
}

function constructHelpDialog(start = false){
  let tuchs_save = tuchs.slice();
  if(!start){
    helpDialogGrid.innerHTML = "";
    filterHelpArray();
  }
  else{
    getById('searchInHelp').value = "";
  }

  tuchs.forEach((tuch, i) => {
    let divContainer = document.createElement("div");
    let kbdTuch      = document.createElement("kbd");
    let divAction    = document.createElement("div");

    let tuchId = 'helpTuch_' + i;

    tuch.id             = tuchId;
    kbdTuch.id          = tuchId;
    kbdTuch.className   = 'keys';
    divAction.className = 'helpTxt';

    let txtTuch   = document.createTextNode(tuch.tuch);
    let txtAction = document.createTextNode(tuch.action);

    kbdTuch.appendChild(txtTuch);
    divAction.appendChild(txtAction);

    let tuchToTrigger = tuch.ctrl || tuch.alt ? tuch.tuch.substr(-1) : tuch.tuch;

    tuchToTrigger = tuchToTrigger.replace('←', 'ArrowLeft');
    tuchToTrigger = tuchToTrigger.replace('→', 'ArrowRight');
    tuchToTrigger = tuchToTrigger.replace('↑', 'ArrowUp');
    tuchToTrigger = tuchToTrigger.replace('↓', 'ArrowDown');

    kbdTuch.title = tuch.property;
    kbdTuch.setAttribute('onclick', 
      `window.dispatchEvent(new KeyboardEvent('keydown',  {'key':'${tuchToTrigger}', 'ctrlKey' : ${tuch.ctrl}, 'altKey' : ${tuch.alt}})); checkHelpProp('${kbdTuch.id}', '${tuch.property}'); `
    );

    if(activeGlo[tuch.property]){ addClasses(kbdTuch, 'on'); }

    kbdTuch.style.textAlign      = 'center';
    divAction.style.paddingRight = '30px';

    divContainer.style.display             = 'grid';
    divContainer.style.gridTemplateColumns = '50px 100%';
    divContainer.style.columnGap           = '5px';
    divContainer.dataset.tags              = '';

    divContainer.appendChild(kbdTuch);
    divContainer.appendChild(divAction);

    if(Array.isArray(tuch.tags)){ divContainer.dataset.tags = tuch.tags.join(','); }

    helpDialogGrid.appendChild(divContainer);
  });

  if(start){ 
    HTags.forEach(HTag => {
      let spanTag = document.createElement("span");
      let txtTag  = document.createTextNode(HTag);

      spanTag.className  = 'helpTag';
      spanTag.dataset.on = 'false';
      spanTag.appendChild(txtTag);

      spanTag.setAttribute('onclick', "this.dataset.on = this.dataset.on === 'false' ? 'true' : 'false'; this.classList.toggle('helpTagOn'); constructHelpDialog(); ");

      getById('HelpTags').appendChild(spanTag);
    });
  }

  [...document.getElementsByClassName('keys')].forEach(key => {
    key.addEventListener(
      "mouseenter",
      (event) => {
        event.target.style.color  = "purple";
        event.target.style.cursor = "pointer";
      },
      false
    );
    key.addEventListener(
      "mouseleave",
      (event) => {
        event.target.style.color  = "";
      },
      false
    );
  });
  getById('helpDialogOpacity').value = 0.67;
  helpDialog.style.opacity           = 0.67;

  tuchs = tuchs_save.slice();
}

function filterHelpArray(){
  let searchTxt = getById('searchInHelp').value;

  if(searchTxt){
    tuchs = tuchs.filter(tuch => removeAccents(tuch.action.toLowerCase()).includes(removeAccents(searchTxt.toLowerCase()))); 
  }

  let onTags   = [];
  let spanTags = [...document.getElementsByClassName('helpTag')];
  spanTags.forEach(spanTag => {
    if(spanTag.dataset.on === 'true'){ onTags.push(spanTag.textContent); }
  });
  
  if(onTags.length){
    tuchs = tuchs.filter( tuch => {
        let on = true;
        onTags.forEach(onTag => {
            if( !tuch.tags.includes(removeAccents(onTag.toLowerCase())) ){ on = false; }
        });
        return on;
      });
  }
  if([...getById('helpTuch_On').classList].includes('helpOn')){
    tuchs = tuchs.filter( tuch => tuch.property && activeGlo[tuch.property]);
  }
}

function toggleHelpOnTuch(domHelpTuch){
  [...domHelpTuch.classList].includes('helpOn') ? removeClasses(domHelpTuch, 'helpOn') : addClasses(domHelpTuch, 'helpOn');
  constructHelpDialog();
}

function checkHelpProp(tuchId, property){
  if(property){
    activeGlo[property] ? addClasses(getById(tuchId), 'on') : removeClasses(getById(tuchId), 'on');
  } 
}

function applyToSelectedMods(prop){
  getSelectedModifiers().forEach(mod => { mod.glo[prop] = activeGlo[prop]; } );
}


function helpDialogOpacityChange(event){
  event.stopPropagation();
  event.preventDefault();
  helpDialog.style.opacity = event.target.value; 
}

function addClasses(domElem, ...args){
  if(domElem){
    args.forEach(arg => {
      domElem.classList.add(arg);
    });
  }
}
function removeClasses(domElem, ...args){
  if(domElem){
    args.forEach(arg => {
      domElem.classList.remove(arg);
    });
  }
}









//END
