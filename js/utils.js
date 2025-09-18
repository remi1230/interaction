function deleteRecurse(obj, prop, iter){
  obj.glo.modifiers.forEach(subMod => {
    if(iter > 0){ deleteRecurse(subMod, prop, iter-1); }
    else{
      delete subMod[prop];
    }
  });
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

  let ev = new Event('input', {
    bubbles: true,
    cancelable: true,
  });
  ctrl.dispatchEvent(ev);

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
  var simple_pause = activeGlo.break;
  var total_pause  = activeGlo.totalBreak;
  if(simple_pause){ activeGlo.break = false; }
  if(total_pause) { activeGlo.totalBreak = false; }
  func(param);
  if(simple_pause){ activeGlo.simple_pause_tmp = true; }
  if(total_pause){ activeGlo.total_pause_tmp = true; }

  return false;
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


//END
