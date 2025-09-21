/**
 * @description Lance les tests au clic de la souris
 * @memberof module:tests
 */
function testOnMouse(){
  testIsBlank();
  //testColor();
  //testAngle();
  //testAv();
  //testSumHsl();
}

/**
 * @description Teste si la couleur sous la souris est transparente (blank)
 * @memberof module:tests
 */
function testIsBlank(){
  const x = Math.min(canvas.width  - 1, Math.max(0, Math.floor(mouse.x)));
  const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(mouse.y)));

  const imgData = ctx.getImageData(x, y, 1, 1);
  const d = imgData.data;
  const [r,g,b,a] = d;

  const isBlank = (r|g|b|a) === 0;

  msg(
    "Mouse x : " + x,
    "Mouse y : " + y,
    `RGB${!isBlank ? 'A' : ''} : ` + (!isBlank ? [r,g,b,a].join(", ") : canvas.style.backgroundColor.slice(4, -1)),
    "Couleur de fond: " + (isBlank ? 'Oui' : 'Non')
  );
}

/**
 * @description Teste la somme des valeurs HSLA
 * @param {Array} cs
 * @memberof module:tests
 */
function testSumHsl(cs  = [{h: 220, s: 77, l: 42, a: 1}, {h: 350, s: 77, l: 42, a: 1},]){
  let cSum = hslaSum(...cs);

  cs.forEach((c,i) => {
    ctx.fillStyle = 'hsla(' + c.h + ', ' + c.s + '%, ' + c.l + '%, ' + c.a +')';
    ctx.beginPath();
    ctx.arc(300 + i*100, 300, 50, 0, two_pi);
    ctx.fill();
  });

  ctx.fillStyle = 'hsla(' + cSum.h + ', ' + cSum.s + '%, ' + cSum.l + '%, ' + cSum.a +')';
  ctx.beginPath();
  ctx.arc(300, 400, 50, 0, two_pi);
  ctx.fill();
}

/**
 * @description Teste les valeurs de direction et de dirSecMove du premier avatar
 * @memberof module:tests
 */
function testAv(){
  let av = avatars[0];
  let diff = av.direction - av.dirSecMove;
  msg(
    'Direction  : ' + av.direction,
    'Dir second : ' + av.dirSecMove,
    'Dir - sec  : ' + diff,
  );
}

/**
 * @description Teste l'angle entre le centre du canvas et la position de la souris
 * @memberof module:tests
 */
function testAngle(){
  let dx = mouse.x - canvas.width/2;
  let dy = mouse.y - canvas.height/2;

  msg('Angle : ' + atan2piZ(dx, dy));
}

/**
 * @description Teste la couleur RGBA sous la souris
 * @memberof module:tests
 */
function testColor(){
  let data = ctx.getImageData(mouse.x,mouse.y,1,1).data;

  msg('Color : ' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3]);
}

/**
 * @description Teste les formules de modification des modificateurs
 * @memberof module:tests
 */
function testModsFormule(){
  let mod         = activeGlo.modifiers.length > 0 ? activeGlo.modifiers[0] : undefined;
  let av          = avatars[0] ? avatars[0] : undefined;

  let formules = activeGlo.params.mods_formule.split(',');

  if(activeGlo.modifiers.length > 0 && av){
    activeGlo.mods_formule.formules = [];

    activeGlo.mods_formule.state = true;
    formules.forEach(formule => {
      let prop = formule.substr(0, formule.indexOf('=')).trim();
      let val  = formule.substr(formule.indexOf('=') + 1).trim();

      let thisFormule = true; let ev;
      try{
        ev = eval(val);
        if(ev == av || isNaN(ev)){ activeGlo.mods_formule.state = false; }
      }
      catch(e){
        thisFormule = false;
        activeGlo.mods_formule.state = false;
      }
      if(thisFormule){
        activeGlo.mods_formule.formules.push({prop, val});
      }
    });
  }
  else{
    activeGlo.mods_formule.state = false;
  }
}

/**
 * Affiche dans la console les valeurs des propriétés d'un tableau d'objets
 * @param {String} prop - La propriété à afficher
 * @param {Array} arrObjs - Le tableau d'objets
 * @param {String} sProp - La sous-propriété à afficher (facultatif)
 * @returns {Array|Boolean} - Les valeurs des propriétés ou false si le tableau est vide
 * @memberof module:tests
 */
function debugProp(prop, arrObjs = activeGlo.modifiers, sProp = false){
  if(arrObjs.length == 0){ console.log("Empty array"); return false; }
  else{
    let arrToReturn = [];
    if(!sProp){ arrObjs.forEach(obj => { console.log(obj[prop]); arrToReturn.push(obj[prop]); }); }
    else{ arrObjs.forEach(obj => { console.log(obj[prop][sProp]); arrToReturn.push(obj[prop][sProp]); }); }

    return arrToReturn;
  }
}

/**
 * @description Vérifie si un tableau d'objets contient des valeurs NaN
 * @param {Array} arr - Le tableau à vérifier
 * @returns {Array|String} - Les objets contenant des NaN ou 'none'
 * @memberof module:tests
 */
function naNs(arr) {
  let theNaNs = [];
  arr.forEach((item, i) => {
    for(let prop in item){
      if(typeof(item[prop]) == 'number' && isNaN(item[prop])){ theNaNs.push(item); break; }
    }
  });
  return theNaNs.length > 0 ? theNaNs : 'none';
}

/**
 * Vérifie si un tableau d'objets contient des valeurs infinies
 * @param {Array} arr - Le tableau à vérifier
 * @returns {Array|String} - Les objets contenant des valeurs infinies ou 'none'
 * @memberof module:tests
 */
function infinites(arr) {
  let theNaNs = [];
  arr.forEach((item, i) => {
    for(let prop in item){
      if(typeof(item[prop]) == 'number' && !isFinite(item[prop])){ theNaNs.push(item); break; }
    }
  });
  return theNaNs.length > 0 ? theNaNs : 'none';
}

/**
 * @description Renvoie le nombre de modificateurs actifs
 * @returns {number}
 * @memberof module:calcul
 */
function nmods(){ return activeGlo.modifiers.length; }

/**
 * @description Renvoie le nombre d'avatars actifs
 * @returns {number}
 * @memberof module:calcul
 */
function navs() { return avatars.length; }

/**
 * Renvoie le nom de la classe d'un objet
 * @param {*} obj - L'objet à tester
 * @returns {string} - Le nom de la classe de l'objet
 * @memberof module:calcul
 */
function wclass(obj){ return obj.constructor.name; }