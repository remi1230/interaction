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

  activeGlo.testDone = false;

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
function invTint(){
  updImage(data => {
    for (var i  = 0; i < data.length; i += 4) {
      if(data[i] != 0 || data[i + 1] != 0 || data[i + 2] != 0){
        let hsla  = RGBAToHSLA(data[i], data[i+1], data[i+2], data[i+3]);
        hsla.l = 100 - hsla.l;
        let rbga  = HSLAToRGBA(hsla.h, hsla.s, hsla.l, hsla.a);

        data[i]     = rbga.r;
        data[i + 1] = rbga.g;
        data[i + 2] = rbga.b;
      }
    }
  });
}
function invSaturation(){
  updImage(data => {
    for (var i  = 0; i < data.length; i += 4) {
      if(data[i] != 0 || data[i + 1] != 0 || data[i + 2] != 0){
        let hsla  = RGBAToHSLA(data[i], data[i+1], data[i+2], data[i+3]);
        hsla.s = 100 - hsla.s;
        let rbga  = HSLAToRGBA(hsla.h, hsla.s, hsla.l, hsla.a);

        data[i]     = rbga.r;
        data[i + 1] = rbga.g;
        data[i + 2] = rbga.b;
      }
    }
  });
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
    let bg = objRgb_to_strRgb(tot);
    canvas.style.backgroundColor = bg;
    activeGlo.backgroundColor = bg;
  }
}

/**
 * @description Update Background interface alpha color
 * @param {float} val alpha value
 * @returns {void}
 */
function bgInterfaceOpacity(ctrl){
  if(!activeGlo.interfaceBg){
    activeGlo.interfaceBg = getStyleProperty(".interface","background-color");
    if(activeGlo.interfaceBg.length < 22){ activeGlo.interfaceBg = "rgba" + activeGlo.interfaceBg.substring(3, activeGlo.interfaceBg.length - 1) + ", 1)"; }
  }

  let objCol = strRgba_to_objRgba(activeGlo.interfaceBg);
  objCol.a   = parseFloat(ctrl.value);
  let strCol = objRgba_to_strRgba(objCol);

  activeGlo.interfaceBg = strCol;

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
function updColorFunction(ctrl){
  switchObjBools(activeGlo.colorFunctions, activeGlo.colorFunctionLabels[ctrl.value], activeGlo.colorCumul);
  /*if(!activeGlo.mode.colorCumul.state){
    switchObjBools(activeGlo.colorFunctions, activeGlo.colorFunctionLabels[ctrl.dataset.last_value], activeGlo.mode.colorCumul.state);
  }*/
}
