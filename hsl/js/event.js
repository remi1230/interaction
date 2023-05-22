//------------------ LANCEMENT DE LA BOUCLE DE DESSIN ----------------- //
document.addEventListener("DOMContentLoaded", function() {
    params_interface();
    createCanvasMenu();
    createCheckboxesWithRange(glo.colorFunctionLabels, 'colorCumulContainer', 'qMove', {event: 'onchange', func: 'checkColorFunctions()'});
    createAvatar({nb: glo.params.nb, w: glo.size});
    animation();
});

//------------------ ClICK ON UI TO HIDE MENU ----------------- //
ui.addEventListener('click', () => {
  if(!glo.fromUpdGlo ){ hideMenu(); }
  glo.fromUpdGlo = false;
});
//------------------ DBLClICK ON UI TO CHANGE INTERFACE ----------------- //
/*ui.addEventListener('dblclick', () => {
  changeInterface('+');
});*/
//------------------ WHEEL ON UI TO CHANGE INTERFACE ----------------- //
ui.addEventListener('wheel', (e) => {
  if(glo.uiMouseDown){
    e.stopPropagation();
    if(e.deltaY > 0){ changeInterface('-'); }
    else{ changeInterface('+'); }
  }
});

ui.addEventListener('mousedown', () => { glo.uiMouseDown = true; });
ui.addEventListener('mouseup',   () => { glo.uiMouseDown = false; });

//------------------ UI PREVENTDEFAULT ----------------- //
ui.addEventListener('contextmenu', () => {
  event.preventDefault();
  if(!glo.time){ glo.time = new Date().getTime(); }
  else{
    let diffTime = new Date().getTime() - glo.time;
    if(diffTime < 500){ changeInterface('-'); }
  }

  glo.time = new Date().getTime();
});

//------------------ ClICK ON NUM INTERFACE ----------------- //
getById('num_interface').addEventListener('click', () => {
  event.stopPropagation();
  changeInterface('+');
});

//------------------ ClICK ON NUM INTERFACE ----------------- //
getById('num_interface').addEventListener('contextmenu', () => {
  event.preventDefault();
  changeInterface('-');
});

//------------------ ClICK ON SHOW / HIDE INTERFACE ----------------- //
getById('showHideInterface').addEventListener('click', () => {
  event.preventDefault();
  showHideInterface();
});
//------------------ ClICK SUR LE CANVAS POUR SWITCHER L'AFFICHAGE DES PARAMÉTRES ----------------- //
structure.addEventListener('click', () => {
  if(!glo.virtual.modifier && !glo.virtual.avatar){
    let posOnMouse = glo.posOnMouse;

    if(posOnMouse.pasteMods){ pasteModifiers(); }
    else if(posOnMouse.avatar){
      posAvatar(mouse.x, mouse.y, glo.size, glo.center ? glo.center : {x: canvas.width/2, y: canvas.height/2});
      all_nearsAvatars();
      let avatarsLength = avatars.length;
      getById('nb').value = avatarsLength;
      getById('nb').title = avatarsLength;
      glo.params.nb = avatarsLength;
      updLabel(getById('nb'));
    }
    else if(posOnMouse.circleMods){ posCircleModifiers(mouse); }
    else{
      if(!glo.is_canvas_menu && !glo.attract_mouse.state){
        if(typeof(glo.num_params) == 'undefined'){ glo.num_params = 0; }

        ui.style.display       = ui.style.display === 'none' ? '' : 'none';
        canvas.style.height    = ui.style.display === 'none' ? '98.25%' : '83.5%';
        structure.style.height = ui.style.display === 'none' ? '98.25%' : '83.5%';

        simpleUpdImage(ctx, fix_dpi, canvas);
        simpleUpdImage(ctxStructure, fix_dpi, structure);
      }
      else{
        hideMenu();
        if(glo.defineCenter){ defineCenter(true, true); }
        else{
          if(glo.modifierSelect.byOne || glo.modifierSelect.byGroup){ modifier_select(); }
          else if(glo.pos_modifiers != 'none' && !glo.modifierSelect.isOneSelect()){ pos_modifier(glo.pos_modifiers); }
        }
      }
    }
  }
});
//------------------ ClICK DROIT SUR LE CANVAS POUR MODIFIER DES PARAMÉTRES ----------------- //
structure.addEventListener('contextmenu', (e) => {
  createCanvasMenu();
  e.preventDefault();
  showMenu(e.clientX + 'px');
});
//------------------ MOUSE MOVEMENT ----------------- //
structure.addEventListener('mousedown', (e) => {
  mouse.click = {x: mouse.x, y: mouse.y};
  if(glo.modifierSelect.byRectangle && e.button != 2){ glo.mousedown = true; }
  else if(glo.attract_mouse.state && e.button != 2){
    glo.attract_mouse.mousedown = true;
    if(glo.virtual.modifier || glo.virtual.avatar){
      glo.posVirtualMod = true;
      if(glo.virtual.modifier){ pos_modifier(glo.pos_modifiers, mouse, false, 9999, true); }
      else{
        avatars.forEach((av, i) => { if(av.virtual){ avatars.splice(i,1); } });
        let av  = posAvatar(mouse.x, mouse.y, glo.size, canvas.getCenter(), true);
        av.draw = false; av.draw_ok = false;
        av.lasts.push({x: av.x, y: av.y});
      }
    }
  }
});
structure.addEventListener('mouseup',   () => {
  if(glo.modifierSelect.byRectangle){ glo.mousedown = false; }
  else if(glo.attract_mouse.state){
    glo.attract_mouse.mousedown = false;
    if(glo.posVirtualMod){
      glo.posVirtualMod = false;
      if(glo.virtual.modifier){ glo.modifiers.forEach((mod, i) => { if(mod.virtual){ glo.modifiers.splice(i,1); } }); }
      else{ avatars.forEach((av, i) => { if(av.virtual){ avatars.splice(i,1); } }); }
    }
  }
});
structure.addEventListener('wheel',     (e) => {
  if(e.shiftKey){
    if(event.deltaY > 0){ scale_avatars('-', event.deltaY); }
    else{ scale_avatars('+', -event.deltaY); }
  }
  if(e.altKey){
    if(event.deltaY > 0){ scale_modifiers('-', event.deltaY); }
    else{ scale_modifiers('+', -event.deltaY); }
  }
  //else if(glo.attract_mouse.state && glo.posVirtualMod){
  else{
    glo.params.wheel_force += event.deltaY*0.1;
    glo.params.wheel_force = parseInt(glo.params.wheel_force);
    updCtrl('wheel_force');
    glo.modifiers.forEach(mod => { if(mod.virtual){ mod.attract = glo.params.wheel_force; } });
  }
});
structure.addEventListener('mousemove', (e) => {
  let rect = canvas.getBoundingClientRect();
  let coeff = {x: startWidth / canvas.clientWidth, y: startHeight / canvas.clientHeight};
  mouse.x = (e.clientX- rect.left) * coeff.x;
  mouse.y = (e.clientY - rect.top) * coeff.y;

  if(glo.mode.infoOnMouse.state){ infoOnMouse(); }
  else if(glo.posVirtualMod){
    if(glo.virtual.modifier){ glo.modifiers.forEach(mod => { if(mod.virtual){ mod.x = mouse.x; mod.y = mouse.y; } }); }
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
   ctrl.addEventListener('focus', () => { glo.stopWindowEvents = true; });
   ctrl.addEventListener('blur', () => { glo.stopWindowEvents = false; });
 });
//------------------ ClICK DROIT SUR CTRL PARAMÉTRE ----------------- //
aleaOnRightClick(glo.params);
function aleaOnRightClick(obj_param){
  for(var p in obj_param){
    let param = getById(p);
    //if(param == null){ alert(p); }
    param.addEventListener('contextmenu', (e) => {
      e.stopPropagation();
      e.preventDefault();

      let p = e.target.id;
      if(typeof(glo.params_alea) == 'undefined'){ glo.params_alea = {}; }
      glo.params_alea[p] = !glo.params_alea[p];
    });
  }
}
//------------------ ClICK GAUCHE SUR CTRL PARAMÉTRE QUAND ALEA ----------------- //
defineMinOrMax(glo.params);
function defineMinOrMax(obj_param){
  for(var p in obj_param){
    let param = getById(p);
    param.addEventListener('mouseup', (e) => {
      let p = e.target.id;
      if(e.button == 0 && ((glo.params_alea && glo.params_alea[p]) || ((glo.mode.hyperAlea.state || glo.mode.global_alea.state) && glo.alea[p]))){
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
  if(glo.mode.clear.state){ allCanvas.forEach(canvas => { fix_dpi(canvas); }); }
});
//------------------ ÉVÈNEMENTS D'APPUI SUR UNE TOUCHE ----------------- //
window.addEventListener("keydown", function (e) {
  let inputsSz;
  if(!glo.stopWindowEvents && e.key != 'Shift'){
    let i, center;
    let key = e.key;
    let createMenu = true;
    if(isNaN(parseInt(key))){
      if(!e.ctrlKey){
        if(!e.altKey){
        	switch (key) {
        		case '*':
              glo.shortcut.alphaVarSize = !glo.shortcut.alphaVarSize;
              glo.perm_var_size = glo.shortcut.alphaVarSize;
              glo.growDecrease  = glo.shortcut.alphaVarSize;
              button_check('alphaAbs');

              if(glo.growDecrease){ glo.sizeLineSave = glo.params.line_size; }
              else{ glo.params.line_size = glo.sizeLineSave; }

              if(!glo.shortcut.alphaVarSize){ avatars.forEach(av => { av.size = glo.size; }); }

        			break;
        		case 'b':
              stop_avatars();
        			break;
        		case 'ù':
              glo.bg_black = !glo.bg_black;
              canvas.style.backgroundColor = glo.bg_black ? '#000' : '#fff';
        			break;
        		case '&':
              glo.growDecrease = !glo.growDecrease;
              if(glo.growDecrease){ glo.sizeLineSave = glo.params.line_size; }
              else{ avatars.forEach(av => { av.size = glo.size; }); glo.params.line_size = glo.sizeLineSave; }
        			break;
        		case 'é':
              glo.alternatorInv = !glo.alternatorInv;
        			break;
        		case '"':
              glo.alternatorInvAtt = !glo.alternatorInvAtt;
        			break;
        		case "'":
              e.preventDefault();
              glo.colorSquare = !glo.colorSquare;
        			break;
        		case "(":
              getSelectedModifiers().forEach(mod => {
                mod.haveColor = !mod.haveColor;
                if(mod.haveColor){
                  mod.color = {h: parseInt(rnd() * 360), s: 20 + parseInt(rnd() * 60), l: 20 + parseInt(rnd() * 60)};
                }
              });
              glo.modifiersHaveColor = !glo.modifiersHaveColor;
        			break;
        		case 'A':
              glo.updByVal = !glo.updByVal;
        			break;
        		case 'Z':
              let inputColorDec = getById('colorDec');

              inputColorDec.value = inputColorDec.value == '0' ? '180' : '0';
              inputColorDec.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, }));
        			break;
        		case 'X':
              blur();
        			break;
        		case 'C':
              sharp();
        			break;
        		case 'I':
              glo.formuleColorMode = !glo.formuleColorMode;
        			break;
        		case '%':
              glo.dimSizeCenter = !glo.dimSizeCenter;
        			break;
        		case 'µ':
              glo.dash++;
              break;
        		case '§':
              if(glo.dash > 1){ glo.dash--; }
        			break;
        		case ')':
              glo.curve = !glo.curve;
              break;
        		case '²':
              glo.allModsSelected = !glo.allModsSelected;
              glo.modifiers.forEach(mod => { mod.select = glo.allModsSelected; });
        			break;
        		case 'n':
              glo.numLineCap++;
        			break;
        		case 'r':
              glo.createMod = 'random';
              if(glo.mode.clearForm.state){ clear(); }
              keepBreak(raz_avatars);
        			break;
        		case 'q':
              glo.createMod = 'square';
              if(glo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {size: canvas.width/4} });
        			break;
        		case 'c':
              glo.createMod = 'circle';
              center = canvas.getCenter();
              if(glo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {name: 'circle', size: canvas.width/4}, center: center });
        			break;
        		case '£':
              glo.createMod = 'poly';
              center = canvas.getCenter();
              if(glo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {name: 'poly', size: canvas.width/4}, center: center });
        			break;
        		case 'è':
              glo.createMod = 'spiral';
              center = canvas.getCenter();
              if(glo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {name: 'spiral', size: canvas.width/4}, center: center });
        			break;
        		case 'u':
              createMenu = false; glo.createMod = 'rect';
              if(glo.mode.clearForm.state){ clear(); }
              keepBreak(function(){ var nb = glo.params.nb; deleteAvatar('all'); glo.params.nb = nb; createAvatar({form: {name: 'rect'} }); });
        			break;
        		case '+': case '-':
              keepBreak(scale_avatars, key);
        			break;
        		case 'z':
              grey_color();
        			break;
        		case '_':
              takeShot();
        			break;
        		case 'ç':
              goToShot();
        			break;
        		case 'à':
        			break;
        		case ',':
              glo.spiralOnlyInvrot = !glo.spiralOnlyInvrot;
        			break;
        		case 'F':
              getSelectedModifiers().forEach(mod => { mod.haveColor = !mod.haveColor; });
              glo.modifiersHaveColor = !glo.modifiersHaveColor;
        			break;
        		case '=':
              showHideInterface('showHideInterface');
        			break;
        		case 't':
              glo.view_center = !glo.view_center;
        			break;
        		case ';':
              glo.perm_var_size = !glo.perm_var_size;
              glo.sizeLineSave = glo.params.line_size;
        			break;
        		case ':':
              glo.crossPoints = !glo.crossPoints;
        			break;
        		case 'Enter':
              glo.lineCrossPoints = !glo.lineCrossPoints;
        			break;
        		case 'j':
              downloadCanvas();
        			break;
        		case 'PageDown':
              if(!glo.mode.totalBreak.state){ button_check('totalBreak'); }
              keepBreak(function(){});
        			break;
        		case '<':
              keepBreak(glo_params, 'test');
              glo.createMod = 'circle';
              var cent = canvas.getCenter();
              if(glo.mode.clearForm.state){ clear(); }
              createMenu = createForm({ form: {name: 'circle', size: canvas.width/4}, center: cent });
        			break;
        		case '>':
              createMenu = false;
              rotateColor();
        			break;
            case 'ArrowLeft':
              if(!e.shiftKey){
                glo.trans.state = true;
                glo.trans.dir   = 'left';
              }
              else{ rotate_modifiers(-rad); }
              break;
            case 'ArrowRight':
              if(!e.shiftKey){
                glo.trans.state = true;
                glo.trans.dir   = 'right';
              }
              else{ rotate_modifiers(rad); }
              break;
            case 'ArrowUp':
              glo.trans.state = true;
              glo.trans.dir   = 'up';
              break;
            case 'ArrowDown':
              glo.trans.state = true;
              glo.trans.dir   = 'down';
              break;
        	}
          for(let prop in glo.mode){
            if(typeof(glo.mode[prop].key) != 'undefined' && typeof(glo.mode[prop].specialKey) == 'undefined' && glo.mode[prop].key == key){
              if(key == ' '){ e.preventDefault(); }
              button_check(prop);
            }
          }
        }
        else{
          e.preventDefault();
          switch (key) {
            case 'w':
              createCanvasMenu();
              showMenu();
              break;
            case 'x':
              createCanvasMenu(glo.mode, 'maj');
              showMenu();
              break;
            case 'c':
              createCanvasMenu(glo.mode, 'ctrl');
              showMenu();
              break;
            case 's':
              let modsSz = glo.modifiers.length;
              glo.modifiers = glo.modifiers.filter(mod => !mod.select);
              if(modsSz == glo.modifiers.length){ glo.modifiers = []; }
              avatars.forEach(av => { av.nearMod = {}; av.distMinModifiers = 9999; });
              break;
            case 'i':
              getSelectedModifiers().forEach(mod => { mod.attract = -mod.attract; mod.rot_spi = -mod.rot_spi; });
              break;
            case 'v':
              glo.modifierSelect.update('byOne');
              break;
            case 'b':
              glo.modifierSelect.update('byGroup');
              break;
            case 'n':
              glo.modifierSelect.update('byRectangle');
              break;
            case ',':
              switchObjBools(glo.posOnMouse, 'pasteMods', false);
              break;
            case 'a':
              glo.draw_grid = !glo.draw_grid;
              break;
            case 'z':
              glo.draw_circle_grid = !glo.draw_circle_grid;
              break;
            case 'e':
              glo.draw_third_grid = !glo.draw_third_grid;
              break;
            case 'r':
              glo.draw_equi_grid = !glo.draw_equi_grid;
              break;
            case 'g':
              glo.putOnGrid = !glo.putOnGrid;
              break;
            case 't':
              glo.showInfos = !glo.showInfos;
              break;
            case 'f':
              glo.modifiersDrawNear = !glo.modifiersDrawNear;
              break;
            case '&':
              switchObjBools(glo.posOnMouse, 'circleMods', false);
              break;
            case 'ç':
              glo.polyPrecision = !glo.polyPrecision;
              break;
            case '+':
              if(ui.style.opacity < 1 && ui.style.opacity != ""){ ui.style.opacity = parseFloat(ui.style.opacity) + 0.02; }
              break;
            case '-':
              if(ui.style.opacity == ""){ ui.style.opacity = "0.99"; }
              else if(ui.style.opacity > 0){ ui.style.opacity = parseFloat(ui.style.opacity) - 0.02; }
              break;
            case '"':
              getSelectedModifiers().forEach(mod => { mod.modsWithSign = !mod.modsWithSign; });
              break;
            case "'":
              glo.selectBySign = !glo.selectBySign;
              let sign = glo.selectBySign ? 1 : -1;
              glo.modifiers.forEach(mod => {
                if(Math.sign(mod.attract) == sign){ mod.select = true; }
                else{ mod.select = false; }
              });
              break;
            case 'p':
              putModsOnGrid();
              break;
            case 'y':
              posSquareModifiers();
              break;
            case 'u':
              posRectModifiers();
              break;
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
            case 'ArrowLeft':
              translateModifiers(-10, 0);
              break;
            case 'ArrowRight':
              translateModifiers(10, 0);
              break;
            case 'ArrowUp':
              translateModifiers(0, -10);
              break;
            case 'ArrowDown':
              translateModifiers(0, 10);
              break;
          }
        }
      }
      else{
        e.preventDefault();
        switch (key) {
          case 'o':
            impt_json();
            break;
          case 'a':
            glo.orientedPoly = !glo.orientedPoly;
            break;
          case 'r':
            glo.alea_stroke = !glo.alea_stroke;
            break;
          case ')':
            switchObjBools(glo.virtual, 'avatar', false);
            break;
          case 'l':
            glo.alternColor = !glo.alternColor;
            break;
          case '&':
            glo.persistModsInfo = !glo.persistModsInfo;
            break;
          case 'p':
            glo.noBlankTest = !glo.noBlankTest;
            break;
          case ';':
            switchObjBools(glo.virtual, 'modifier', false);
            break;
          case '*':
            glo.starPoly = !glo.starPoly;
            break;
          case ',':
            glo.testOnMouse = !glo.testOnMouse;
            break;
          case 'z':
            glo.view_modifiers = !glo.view_modifiers;
            break;
          case 'j':
            glo.colorsAdd = !glo.colorsAdd;
            break;
          case 'k':
            glo.canvasLoveBg.state = !glo.canvasLoveBg.state;
            if(glo.canvasLoveBg.state){
              glo.canvasLoveBg.save  = canvas.style.backgroundColor;
              canvas.style.backgroundColor = glo.canvasLoveBg.color;
            }
            else{
              canvas.style.backgroundColor = glo.canvasLoveBg.save;
            }
            break;
          case 'b':
            glo.modifiers.forEach(mod => { mod.select = false; });
            break;
          case 's':
            glo.params.wheel_force = -glo.params.wheel_force;
            updCtrl('wheel_force');
            glo.modifiers.forEach(mod => { if(mod.virtual){ mod.attract = glo.params.wheel_force; } });
            break;
          case 'q':
            glo.chaos = !glo.chaos;
            break;
          case 'c':
            glo.defineCenter = !glo.defineCenter;
            break;
          case 'd':
            defineCenter(false, false);
            break;
          case 'v':
            glo.sizeDirCoeff = !glo.sizeDirCoeff;
            break;
          case '!':
            glo.doubleAvatar = !glo.doubleAvatar;
            glo.noLimLine    = !glo.noLimLine;
            break;
          case 'm':
            posModifiers();
            break;
          case 'y':
            posCircleModifiers();
            break;
          case 'u':
            posPolyModifiers();
            break;
          case 'e':
            invColors();
            break;
          case '+': case '-':
            keepBreak(scale_modifiers, key);
            break;
          case 'x':
            let gcoLength = gco.length;
            if(typeof(glo.num_gco) == 'undefined'){ glo.num_gco = 0; }

            if(glo.num_gco < gcoLength - 1){ glo.num_gco++; }
            else{ glo.num_gco = 0; }

            ctx.globalCompositeOperation = gco[glo.num_gco];

            break;
          case '²':
            //changeInterface('-');
            modsToZero();
            break;
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
            case 'ArrowLeft':
              translateModifiers(-1, 0);
              break;
            case 'ArrowRight':
              translateModifiers(1, 0);
              break;
            case 'ArrowUp':
              translateModifiers(0, -1);
              break;
            case 'ArrowDown':
              translateModifiers(0, 1);
              break;
        }
        for(let prop in glo.mode){
          if(typeof(glo.mode[prop].key) != 'undefined' && typeof(glo.mode[prop].specialKey) != 'undefined' &&
          glo.mode[prop].specialKey == 'ctrl' && glo.mode[prop].key == key){
            if(key == ' '){ e.preventDefault(); }
            button_check(prop);
          }
        }
      }
    }
    else{
      if(!e.ctrlKey){
        let numKey = parseInt(key);
        if(numKey <= 1){ glo.style = parseInt(key); }
        else{
          switch (key) {
            case '9':
              updBgToAvColor();
              break;
            case '8':
              updBgToAvColor(true);
              break;
            case '7':
              glo.updBgToAvColor = !glo.updBgToAvColor;
              break;
            case '6':
              glo.staggered = !glo.staggered;
              break;
            case '5':
              glo.brakeModstoZero = !glo.brakeModstoZero;
              if(glo.brakeModstoZero){ getSelectedModifiers().forEach(mod => { mod.brakeSave = mod.brake; mod.brake = 0; }); }
              else{ getSelectedModifiers().forEach(mod => { mod.brake = mod.brakeSave; }); }
              break;
            case '4':
              switchObjBools(glo.posOnMouse, 'avatar', false);
              break;
            case '3':
              getSelectedModifiers().forEach(mod => { mod.double = !mod.double; mod.dblForce = mod.double ? 200 : 1; });
              break;
            case '2':
              glo.doubleMods = !glo.doubleMods;
              break;
          }
        }
      }
      else{
        e.preventDefault();
        switch (key) {
          case '1':
            let ctrl_resist = getById('resist');
            ctrl_resist.value = 1;
            updateGlo(ctrl_resist);
            break;
        }
        for(let prop in glo.mode){
          if(typeof(glo.mode[prop].key) != 'undefined' && typeof(glo.mode[prop].specialKey) != 'undefined' &&
          glo.mode[prop].specialKey == 'ctrl' && glo.mode[prop].key == key){
            if(key == ' '){ e.preventDefault(); }
            button_check(prop);
          }
        }
      }
    }
  }
});
