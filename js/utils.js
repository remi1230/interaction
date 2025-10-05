/**
 * @typedef {import('./avatar.js').Avatar} Avatar
 */

/**
 * @description Ajoute à l'input domElem les classes en paramètres.
 * @param {HTMLInputElement} domElem
 * @param  {...string} args
 */
function addClasses(domElem, ...args) {
  if (domElem) {
    args.forEach(arg => {
      domElem.classList.add(arg);
    });
  }
}
/**
 * @description Supprime pour l'input domElem les classes en paramètres.
 * @param {HTMLInputElement} domElem
 * @param  {...string} args
 */
function removeClasses(domElem, ...args) {
  if (domElem) {
    args.forEach(arg => {
      domElem.classList.remove(arg);
    });
  }
}

/**
 * @description Supprime une propriété d'un objet de manière récursive
 * @param {Object} obj - L'objet à modifier
 * @param {string} prop - La propriété à supprimer
 * @param {number} iter - Le nombre d'itérations restantes
 * @memberof module:utils
 */
function deleteRecurse(obj, prop, iter) {
  obj.glo.modifiers.forEach(subMod => {
    if (iter > 0) { deleteRecurse(subMod, prop, iter - 1); }
    else {
      delete subMod[prop];
    }
  });
}

function isFormulaValid(formula) {
  try {
    // Nettoyage
    let s = String(formula).trim();

    // Vérifier caractères autorisés
    if (/[^0-9+\-*/()., HSLADszcxyvra]/i.test(s)) {
      return false;
    }

    // Interdire collages nombre/symbole
    if (/\d+(H|S|L|A|D|sz|cx|cy|vx|vy|ax|ay|v|r|x|y|z|a)/i.test(s)) return false;
    if (/(H|S|L|A|D|sz|cx|cy|vx|vy|ax|ay|v|r|x|y|z|a)\d+/i.test(s)) return false;

    // Parenthèses équilibrées
    let bal = 0;
    for (const ch of s) {
      if (ch === "(") bal++;
      if (ch === ")") bal--;
      if (bal < 0) return false;
    }
    if (bal !== 0) return false;

    // Essayer un eval de test sécurisé
    const testEnv = { H: 1, S: 1, L: 1, A: 1, D: 1, sz: 1, cx: 1, cy: 1, vx: 1, vy: 1, ax: 1, ay: 1, v: 1, r: 1, x: 1, y: 1, z: 1, a: 1 };
    const expr = s.replace(/\b(H|S|L|A|D|sz|cx|cy|vx|vy|ax|ay|v|r|x|y|z|a)\b/g, m => testEnv[m]);
    // eslint-disable-next-line no-new-func
    const val = Function('"use strict";return (' + expr + ')')();
    return Number.isFinite(val);
  } catch {
    return false;
  }
}

/**
 * @description Met à jour la formule de couleur de l'objet global ou des modificateurs sélectionnés
 * @param {HTMLElement} ctrl - L'élément de contrôle à partir duquel la valeur est extraite
 * @param {string} colorType - Le type de couleur à mettre à jour
 * @memberof module:utils
 */
function updFormuleColor(ctrl, colorType, formuleType = 'formuleColor', histo = activeGlo.formuleColorHisto) {
  if (!activeGlo.modifiers.length) { updateColor(activeGlo); }
  else { getSelectedModifiers().forEach(mod => { updateColor(mod.glo); }); }

  function updateColor(objGlo) {
    objGlo[formuleType][colorType] = ctrl.value;

    if (isFormulaValid(ctrl.value)) {
      // Formule correcte → on applique
      let formule = replacesInFormuleColor(ctrl.value);
      objGlo[formuleType][colorType] = formule;
      Object.assign(histo, objGlo[formuleType]);
    } else {
      // Formule incorrecte → rollback
      Object.assign(objGlo[formuleType], histo);
    }
  }
}

/**
 * @description Inverse l'état d'une propriété booléenne d'un objet
 * @param {Object} obj - L'objet à modifier
 * @param {String} propToUpd - La propriété à mettre à jour
 * @param {Boolean} cumulation - Si vrai, les autres propriétés sont mises à false
 * @memberof module:calcul
 */
function switchObjBools(obj = {}, propToUpd = '', cumulation = true) {
  if (!obj[propToUpd]) { obj[propToUpd] = false; }

  obj[propToUpd] = !obj[propToUpd];

  if (!cumulation) {
    for (let prop in obj) {
      if (typeof (obj[prop]) != 'function' && propToUpd != prop && obj[propToUpd]) {
        obj[prop] = false;
      }
    }
  }
}

/**
 * @description Teste si une expression ne renvoie pas d'erreur avec eval
 * @param {string} expression - L'expression JavaScript à tester.
 * @returns {*} Soit le résultat de l'exécution, soit 'nok'
 */
function evalNoError(expression) {
  try {
    return eval(expression);
  }
  catch (e) {
    return 'nok';
  }
}

/**
 * @description Teste si une expression ne renvoie pas d'erreur avec eval
 * @param {string} expression - L'expression JavaScript à tester.
 * @returns {boolean} - `true` si l'évaluation réussit, `false` si une erreur est levée.
 */
function evalFormuleColor(expression) {
  try {
    eval(expression);
    return true;
  }
  catch (e) {
    return false;
  }
}

// Utilitaire : échappe les caractères spéciaux pour construire une RegExp sûre
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Applique une liste de règles de remplacement.
 * - type: 'word'  -> remplace uniquement le MOT ENTIER (\\bfoo\\b)
 * - type: 'regex' -> utilise la RegExp fournie telle quelle
 */
function applyReplacements(input, rules) {
  let out = String(input);
  for (const r of rules) {
    if (r.type === 'word') {
      const re = new RegExp(`\\b${escapeRegExp(r.from)}\\b`, 'g');
      out = out.replace(re, r.to);
    } else if (r.type === 'regex') {
      out = out.replace(r.re, r.to);
    }
  }
  return out;
}

/**
 * @description
 * Remplace les éléments symboliques d'une formule de couleur par leurs équivalents JavaScript utilisables dans le contexte de l'objet avatar.
 * Par exemple, remplace 'H', 'S', 'L', 'A' par 'h', 's', 'l', 'a', et d'autres symboles comme 'D', 'sz', 'cx', 'cy', 'vx', 'vy', 'v', 'x', 'y'
 * par des expressions ou propriétés JavaScript correspondantes.
 * Utile pour permettre l'évaluation dynamique de formules de couleur personnalisées.
 *
 * @param {string} colorElem - La formule de couleur à transformer.
 * @returns {string} - La formule transformée, prête à être évaluée en JavaScript.
 * @memberof module:utils
 */
function replacesInFormuleColor(colorElem) {
  const rules = [
    // Normalisations simples (mots entiers)
    { type: 'word', from: 'H', to: 'h' },
    { type: 'word', from: 'S', to: 's' },
    { type: 'word', from: 'L', to: 'l' },

    // Tokens multi-lettres d'abord (pour éviter que 'v' touche 'vx', etc.)
    { type: 'word', from: 'D', to: 'this.distMinModifiers' },
    { type: 'word', from: 'sz', to: 'this.sizeCalc.s' },
    { type: 'word', from: 'cx', to: '100*cos(this.x)' },
    { type: 'word', from: 'cy', to: '100*cos(this.y)' },
    { type: 'word', from: 'vx', to: '100*this.vit().x' },
    { type: 'word', from: 'vy', to: '100*this.vit().y' },
    { type: 'word', from: 'ax', to: '100*this.ax' },
    { type: 'word', from: 'ay', to: '100*this.ay' },

    // Les variables 'v' et 'r' seules (mot entier uniquement)
    { type: 'word', from: 'v', to: '100*this.speed' },
    { type: 'word', from: 'a', to: '100*this.accel' },
    { type: 'word', from: 'r', to: 'this.r()' },
    { type: 'word', from: 'z', to: '360*z()' },

    // x / y : uniquement si ce ne sont PAS des accès membres (pas précédés de '.')
    // et en tant que mots entiers pour éviter 'cx', 'vx', etc.
    { type: 'regex', re: /(?<!\.)\bx\b/g, to: 'this.x' },
    { type: 'regex', re: /(?<!\.)\by\b/g, to: 'this.y' },

    // En dernier, 'A' (mot entier)
    { type: 'word', from: 'A', to: 'a' },
  ];

  return applyReplacements(colorElem, rules);
}

/**
 * @description
 * Teste une formule mathématique en remplaçant toutes les occurrences de 'x' et 'y' par 1,
 * puis évalue le résultat avec evalNoError. Retourne le résultat sous forme de nombre flottant.
 * Utile pour vérifier la validité syntaxique et le résultat d'une formule personnalisée.
 *
 * @param {string} formule - La formule mathématique à tester (ex: "2*x+y").
 * @returns {number} - Le résultat de l'évaluation de la formule, ou NaN si l'évaluation échoue.
 * @memberof module:utils
 */
function testFormule(formule) {
  let formule_test = formule.replaceAll('x', 1);
  formule_test = formule_test.replaceAll('y', 1);
  return parseFloat(evalNoError(formule_test));
}

/**
 * @description
 * Initialise et applique un ensemble de paramètres globaux prédéfinis selon le style choisi (ex : 'gravity', 'test', 'stars').
 * Met à jour les contrôles de l'interface et certains états globaux en conséquence.
 *
 * @param {string} style - Le style de paramétrage à appliquer ('gravity', 'test', 'stars', etc.).
 * @returns {void}
 * @memberof module:utils
 */
function glo_params(style = 'gravity') {
  let params;
  switch (style) {
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
      activeGlo.bg_black = true;
      activeGlo.numLineCap = 1;
      activeGlo.alphaAbs = true;
      activeGlo.tail = false;
      activeGlo.collid_bord = false;
      canvas.style.backgroundColor = '#000';
      activeGlo.form = 'ellipse';
      break;
  }

  Object.entries(params).forEach(([key, val]) => {
    activeGlo.params[key] = val;
    var ctrl = getById(key);
    if (val > ctrl.max) { ctrl.max = val; }
    ctrl.value = val;
  });

  radius_attract();
  params_interface(false);
}

/**
 * @description
 * Réalise une sauvegarde profonde de l'état global actuel (activeGlo) dans la variable gloSave.
 * Permet de restaurer ultérieurement cet état avec la fonction goToShot.
 * Utile pour créer un "snapshot" de la configuration courante de l'animation.
 *
 * @returns {void}
 * @memberof module:utils
 */
function takeShot() {
  gloSave = deepCopy(activeGlo);
}

/**
 * @description
 * Restaure l'état global de l'animation à partir du snapshot précédemment sauvegardé avec takeShot.
 * Réinitialise les avatars, les paramètres d'interface et le fond selon la configuration sauvegardée.
 * Utile pour revenir à un état antérieur de l'animation.
 *
 * @returns {void}
 * @memberof module:utils
 */
function goToShot() {
  if (gloSave) {
    activeGlo = deepCopy(gloSave);
    let upd_size = getById('upd_size');
    let upd_size_val = upd_size.value;
    params_interface(false);
    let nb = activeGlo.params.nb;
    deleteAvatar(avatars.length);
    activeGlo.params.nb = nb;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (activeGlo.backgroundColor) { canvas.style.backgroundColor = activeGlo.backgroundColor; }
    createAvatar();
    upd_size.dataset.last_value = upd_size_val;
    updateSize(upd_size);
  }
}

/**
 * @description
 * Met à jour la propriété fillStyle du contexte 2D fourni en fonction de la couleur de fond du canvas donné.
 * Convertit la couleur de fond du canvas en objet RGB, l'ajuste si nécessaire, puis la reconvertit en chaîne RGB utilisable par le contexte.
 * Utile pour harmoniser la couleur de remplissage avec le fond du canvas lors de dessins.
 *
 * @param {HTMLCanvasElement} canvasVar - Le canvas dont la couleur de fond est utilisée.
 * @param {CanvasRenderingContext2D} ctxVar - Le contexte 2D dont la propriété fillStyle sera modifiée.
 * @returns {void}
 * @memberof module:utils
 */
function fillStyleAccordToBg(canvasVar, ctxVar) {
  ctxVar.fillStyle = objRgb_to_strRgb(updateColorToBack(strRgb_to_objRgb(canvasVar.style.backgroundColor)));
}

/**
 * @description
 * Active ou désactive le mode "hyperAlea" pour tous les avatars.
 * Si hyperAlea est activé dans activeGlo, chaque avatar reçoit une copie profonde de l'état global (hors propriétés spécifiques).
 * Sinon, la propriété glo de chaque avatar est supprimée.
 * Utile pour appliquer ou retirer dynamiquement des paramètres globaux individualisés à chaque avatar.
 *
 * @returns {void}
 * @memberof module:utils
 */
function switchHyperAlea() {
  if (activeGlo.hyperAlea) { avatars.forEach(av => { av.glo = deepCopy(activeGlo, 'modifiers', 'inputToSlideWithMouse'); }); }
  else { avatars.forEach(av => { delete av.glo; }); }
}

/**
 * @description
 * Attribue une taille aléatoire à chaque avatar si le mode aléatoire est activé dans activeGlo.
 * Si activeGlo.alea_size est vrai, la taille de chaque avatar est calculée aléatoirement selon un niveau de variation.
 * Sinon, tous les avatars reçoivent la taille définie dans activeGlo.size.
 * Utile pour diversifier visuellement la taille des avatars dans l'animation.
 *
 * @returns {void}
 * @memberof module:utils
 */
function alea_size() {
  if (activeGlo.alea_size) {
    let lvss = activeGlo.params.level_var_s_size;
    avatars.forEach(avatar => {
      avatar.size = rnd() > 0.9 ? activeGlo.size * getRandomIntInclusive(1, 3) * lvss : activeGlo.size * rnd() / lvss;
    });
  }
  else {
    avatars.forEach(avatar => { avatar.size = activeGlo.size; });
  }
}

/**
 * @description
 * Met à jour la valeur et la borne maximale d'un contrôle d'angle en fonction du nombre de côtés spécifié.
 * Déclenche un événement 'input' pour notifier les éventuels écouteurs de la modification.
 * Utile pour adapter dynamiquement la saisie d'angle lors de la modification du nombre de côtés d'une forme.
 *
 * @param {string} idAngle - L'identifiant de l'élément input qui contrôle l'angle.
 * @param {number} nbEdges - Le nombre de côtés de la forme.
 * @returns {void}
 * @memberof module:utils
 */
function updMaxAngleToNbEdges(idAngle, nbEdges) {
  let ctrl = getById(idAngle);
  ctrl.value = 0;
  ctrl.max = 180 / nbEdges;

  let ev = new Event('input', {
    bubbles: true,
    cancelable: true,
  });
  ctrl.dispatchEvent(ev);

}

/**
 * @description Génère un point aléatoire à l'intérieur du canvas, biaisé par le coefficient donné.
 *
 * @param {number} coeff - Un coefficient entre 0 et 1 qui contrôle la dispersion du point aléatoire.
 *                         Une valeur proche de 1 permet des points partout sur le canvas,
 *                         tandis qu'une valeur proche de 0 restreint les points vers le centre.
 * @returns {{x: number, y: number}} Un objet contenant les coordonnées x et y du point aléatoire.
 * @memberof module:utils
 */
function getRandomPoint(coeff) { return { x: canvas.width * (coeff * rnd() + (1 - coeff) / 2), y: canvas.height * (coeff * rnd() + (1 - coeff) / 2) }; }


/**
 * @description Génère un point aléatoire à l'intérieur d'un cercle, avec des options pour utiliser un modificateur ou suivre un avatar.
 *
 * @param {number} coeff - Coefficient déterminant le rayon du cercle.
 * @param {boolean} [byMod=activeGlo.modifiers.length ? activeGlo.randomPointByMod : false] - Utiliser un modificateur comme centre et rayon.
 * @param {boolean} [byAv=activeGlo.followAvatar] - Utiliser l'avatar comme centre.
 * @param {{x: number, y: number}=} [avToFollow=false] - L'objet avatar à suivre, si précisé.
 * @returns {{x: number, y: number}} Un point aléatoire {x, y} à l'intérieur du cercle spécifié.
 * @memberof module:utils
 */
function getRandomPointInCircle(coeff, byMod = activeGlo.modifiers.length ? activeGlo.randomPointByMod : false, fromPoint = false, avToFollow = false) {
  let center = activeGlo.center;
  let minDist = activeGlo.params.rAleaPosMin;

  if (byMod) {
    let mod = activeGlo.modifiers[parseInt(rnd() * activeGlo.modifiers.length)];
    center = { x: mod.x, y: mod.y };
    coeff = mod.params.rAleaPos;
    minDist = mod.params.rAleaPosMin;
  }
  else if (fromPoint) {
    center = { x: fromPoint.x, y: fromPoint.y };
  }

  if (avToFollow) {
    center = { x: avToFollow.x, y: avToFollow.y };
  }

  let r = !avToFollow ? coeff * h(canvas.width, canvas.height) / 2 : coeff * activeGlo.params.avToFollowDist;

  function calculTrigo(lim, it) {
    let angle = rnd() * two_pi;
    let cAngle = cos(angle);
    let sAngle = sin(angle);

    if ((abs(cAngle) > lim && abs(sAngle) > lim) || n > it) { return { c: cAngle, s: sAngle }; }

    n++;
    return calculTrigo(lim, it);
  }

  let n = 0;
  let lim = 0.5;
  let tri = calculTrigo(lim, 2);

  return { x: center.x + ((rnd() * (1 - minDist) + minDist) * r * tri.c), y: center.y + ((rnd() * (1 - minDist) + minDist) * r * tri.s) };
}


/**
 * @description
 * Désactive temporairement les indicateurs `activeGlo.break` et `activeGlo.totalBreak`,
 * exécute la fonction fournie, puis positionne des indicateurs temporaires pour signaler
 * si des pauses étaient actives avant l'exécution.
 *
 * @param {Function} func - La fonction à exécuter pendant que les pauses sont désactivées.
 * @param {*} [param=null] - Paramètre optionnel à passer à la fonction.
 * @returns {boolean} Retourne toujours false.
 * @memberof module:utils
 */
function keepBreak(func, param = null) {
  var simple_pause = activeGlo.break;
  var total_pause = activeGlo.totalBreak;
  if (simple_pause) { activeGlo.break = false; }
  if (total_pause) { activeGlo.totalBreak = false; }
  func(param);
  if (simple_pause) { activeGlo.simple_pause_tmp = true; }
  if (total_pause) { activeGlo.total_pause_tmp = true; }

  return false;
}

/**
 * @description Réinitialise la propriété `numsMod` de tous les avatars à un tableau vide si la valeur donnée est 0.
 *
 * @param {number} val - La valeur à vérifier. Si 0, la réinitialisation est effectuée.
 * @memberof module:utils
 */
function razRotDone(val) {
  if (val == 0) {
    avatars.forEach(av => {
      av.numsMod = [];
    });
  }
}

/**
 * @description Fait tourner tous les avatars autour d'une ellipse en fonction de la variation de la valeur du contrôle.
 *
 * @param {Object} ctrl - L'objet de contrôle contenant les valeurs de rotation.
 * @param {number[]} ctrl.last_vals - Tableau des valeurs précédentes du contrôle.
 * @param {number} ctrl.value - La valeur actuelle du contrôle.
 *
 * @global
 * @param {Array<Object>} avatars - Tableau des objets avatar à faire tourner.
 * @param {Object} canvas - L'objet canvas fournissant le point central.
 * @param {number} rad - Le facteur de conversion des degrés en radians.
 *
 * Chaque objet avatar doit avoir :
 *   - {Function} rotateCalc - Fonction pour calculer la position après rotation.
 *   - {Object} [center] - Centre optionnel pour la rotation.
 *   - {number} x - La coordonnée x (sera mise à jour).
 *   - {number} y - La coordonnée y (sera mise à jour).
 * @memberof module:utils
 */
function replaceAvOnEllipse(ctrl) {
  let last_val = parseFloat(ctrl.last_vals[ctrl.last_vals.length - 1] * rad);
  let val = parseFloat(ctrl.value * rad);

  let angle = val - last_val;

  avatars.forEach(av => {
    let cent = av.center ? av.center : canvas.getCenter();
    let pt = av.rotateCalc(angle, cent, { x: 1, y: 1 }, 1);

    delete av.firstRotDone;

    av.x = pt.x;
    av.y = pt.y;
  });
}

/**
 * @description
 * Transforme la représentation sous forme de chaîne de chaque valeur de propriété dans l'objet `f`
 * Applique diverses substitutions pour convertir des notations mathématiques personnalisées en expressions JavaScript valides.
 * @param {Object} f - L'objet dont les propriétés sont à transformer
 * @memberof module:utils
 */
function reg(f) {
  for (var prop in f) {
    f[prop] = f[prop].toString();
    f[prop] = f[prop].replace(/\s/g, "");
    f[prop] = f[prop].replace(/cxdy|cydx/g, "cos(x/y)");
    f[prop] = f[prop].replace(/cxfy|cyfx/g, "cos(xy)");
    f[prop] = f[prop].replace(/sxdy|sydx/g, "sin(x/y)");
    f[prop] = f[prop].replace(/sxfy|syfx/g, "sin(x*y)");
    f[prop] = f[prop].replace(/cxpy|cypx/g, "cos(x+y)");
    f[prop] = f[prop].replace(/cxmy/g, "cos(x-y)");
    f[prop] = f[prop].replace(/cymx/g, "cos(y-x)");
    f[prop] = f[prop].replace(/sxpy|sypx/g, "sin(x+y)");
    f[prop] = f[prop].replace(/sxmy/g, "sin(x-y)");
    f[prop] = f[prop].replace(/symx/g, "sin(y-x)");
    f[prop] = f[prop].replace(/cx/g, "cos(x)");
    f[prop] = f[prop].replace(/cy/g, "cos(y)");
    f[prop] = f[prop].replace(/sx/g, "sin(x)");
    f[prop] = f[prop].replace(/sy/g, "sin(y)");
    f[prop] = f[prop].replace(/²/g, "**2");
    f[prop] = f[prop].replace(/xx([^,%*+-/)])/g, 'xx*$1');
    f[prop] = f[prop].replace(/yy([^,%*+-/)])/g, 'yy*$1');
    f[prop] = f[prop].replace(/x([^,%*+-/)])/g, 'x*$1');
    f[prop] = f[prop].replace(/y([^,%*+-/)])/g, 'y*$1');
    f[prop] = f[prop].replace(/x([^,%*+-/NP)])/g, 'x*$1');
    f[prop] = f[prop].replace(/y([^,%*+-/NP)])/g, 'y*$1');
    f[prop] = f[prop].replace(/PI([^,%*+-/)])/g, 'PI*$1');

    f[prop] = f[prop].replace(/\)([^,%*+-/)'])/g, ')*$1');
    f[prop] = f[prop].replace(/(\d+)([^,%*+-/.\d)])/g, '$1*$2');

    f[prop] = f[prop].replace(/x\*_mod/g, "x_mod");
    f[prop] = f[prop].replace(/y\*_mod/g, "y_mod");
    f[prop] = f[prop].replace(/sin\*/g, "sin");
    f[prop] = f[prop].replace(/tan\*/g, "tan");
    f[prop] = f[prop].replace(/sign\*/g, "sign");
    f[prop] = f[prop].replace(/logten\*/g, "logten");
    f[prop] = f[prop].replace(/hy\*pot/g, "hypot");
  }
}


/**
 * @description Récupère, compile et instancie de façon asynchrone un module WebAssembly à partir du chemin donné.
 *
 * @async
 * @param {string} path - L’URL ou le chemin du fichier binaire WebAssembly (.wasm).
 * @returns {Promise<WebAssembly.Instance>} Une promesse résolue avec l’instance WebAssembly.
 * @memberof module:utils
 */
async function importWasm(path) {
  const res = await fetch(path);
  const rawBytes = await res.arrayBuffer();
  const module = await WebAssembly.compile(rawBytes);

  return new WebAssembly.Instance(module);
}

/**
 * @description Initialise un module WebAssembly et configure le calculateur.
 * @param {string} path - Le chemin du fichier WebAssembly (.wasm)
 * @returns {Promise<void>}
 * @memberof module:utils
 */
async function init(path) {
  const calcInstance = await importWasm(path);
  calculator = { add: null };
  calculator.add = calcInstance.exports._Z6cosSinf;
}

/**
 * @description Crée une copie profonde de l'objet ou du tableau donné, en excluant éventuellement certaines propriétés.
 * @param {Object|Array} inObject - L'objet ou le tableau à copier
 * @param {...string} propNoCopy - Les propriétés à ne pas copier (exclure)
 * @returns {Object|Array} - La copie profonde de l'objet ou du tableau
 * @memberof module:utils
 */
const deepCopy = (inObject, ...propNoCopy) => {
  if (typeof inObject !== "object" || inObject === null) {
    return inObject;
  }

  let outObject = Array.isArray(inObject) ? [] : {};

  for (let key in inObject) {
    if (!propNoCopy.some(p => p == key)) {
      let value = inObject[key];
      outObject[key] = deepCopy(value, ...propNoCopy);
    }
  }

  return outObject;
};
const mergeDeep = (target, source, isMergingArrays = false, propNoCopy = []) => {
  target = ((obj) => {
    let cloneObj;
    try {
      cloneObj = JSON.parse(JSON.stringify(obj));
    } catch (err) {
      cloneObj = Object.assign({}, obj);
    }
    return cloneObj;
  })(target);

  const isObject = (obj) => obj && typeof obj === "object";

  if (!isObject(target) || !isObject(source))
    return source;

  Object.keys(source).forEach(key => {
    if (propNoCopy.indexOf(key) === -1) {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue))
        if (isMergingArrays) {
          target[key] = targetValue.map((x, i) => sourceValue.length <= i ? x : mergeDeep(x, sourceValue[i], isMergingArrays));
          if (sourceValue.length > targetValue.length)
            target[key] = target[key].concat(sourceValue.slice(targetValue.length));
        } else {
          target[key] = targetValue.concat(sourceValue);
        }
      else if (isObject(targetValue) && isObject(sourceValue))
        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue, isMergingArrays);
      else if (typeof (targetValue) == 'undefined')
        target[key] = sourceValue;
    }
  });

  return target;
};

/**
 * Supprime les accents d'une chaîne de caractères
 * @param {string} str - La chaîne de caractères à traiter
 * @returns {string} - La chaîne de caractères sans accents
 * @memberof module:utils
 */
const removeAccents = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Trie un tableau de nombres
 * @param {number[]} arr - Le tableau à trier
 * @returns {number[]} - Le tableau trié
 * @memberof module:utils
 */
function sortNumeric(arr) { return arr.sort(function (a, b) { return a - b; }); }

/**
 * Génère un caractère aléatoire entre deux valeurs Unicode
 * @param {number} min - La valeur Unicode minimale
 * @param {number} max - La valeur Unicode maximale
 * @returns {string} - Un caractère aléatoire
 * @memberof module:utils
 */
const getRndChar = (min, max) => String.fromCharCode(parseInt(getRnd(min, max)));

function applyToSelectedMods(prop) {
  getSelectedModifiers().forEach(mod => { mod.glo[prop] = activeGlo[prop]; });
}
