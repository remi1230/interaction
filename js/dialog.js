/**
 * @module dialog
 * @description Ce module gère l’ouverture, la fermeture et la construction
 * des boîtes de dialogue liées aux canvas (brosse, modificateurs, aide).
 * Il fournit également des utilitaires pour la gestion des interactions souris
 * et la présentation de l’aide contextuelle.
 * 
 * Les boîtes de dialogue de l'application
 * Icône d'aide : aide
 * Ctrl + s     : infos sur les avatars
 * Crtl + x     : infos modifiers
 * Ctrl + b     : infos sur les paramètres spécifiques aux modifiers
 * Ctrl + g     : infos sur les modifiers et leurs avatars proches
 * Alt  + d     : touches libres
 */

/**
 * @typedef {Object} Point
 * @property {number} x - Coordonnée horizontale.
 * @property {number} y - Coordonnée verticale.
 * @property {boolean} [form=false] - Indique si le point appartient à une forme.
 * @property {boolean} [first=false] - Indique s’il s’agit du premier point d’une séquence.
 */

/**
 * @description Calcule les touches libres disponibles (simples, avec Ctrl, avec Alt) pour les raccourcis.
 * @returns {{alt: Array<Object>, ctrl: Array<Object>, simple: Array<Object>}} - Listes d’objets décrivant les touches libres.
 * @memberof module:ui
 */
function isInHelpTuchs(){
  let frees = {alt: [], ctrl: [], simple: []};

  let tuchLetters = tuchs.filter(t => !t.ctrl && !t.alt);
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

/**
 * @description Crée et insère dynamiquement une boîte de dialogue personnalisée
 * dans le conteneur principal, avec options de style, contenu HTML et gestion
 * de fermeture ou suppression au clic.
 *
 * @memberof module:dialog
 *
 * @param {Object} [options={}] - Options de configuration de la boîte de dialogue.
 * @param {Object} [options.style={}] - Styles CSS appliqués au `<dialog>`.
 * @param {string} [options.id] - Identifiant unique du `<dialog>` (facultatif).
 *
 * @param {string} content - Contenu HTML à insérer dans la boîte de dialogue.
 *
 * @param {('remove'|'close')} [closeOrRemove='remove'] - Détermine l'action au clic sur le fond :
 * `"remove"` supprime le `<dialog>` du DOM, `"close"` appelle simplement `dialog.close()`.
 *
 * @param {boolean} [isOpInput=true] - Si `true`, ajoute un slider permettant de régler
 * l'opacité du `<dialog>`.
 *
 * @returns {HTMLDialogElement} L’élément `<dialog>` créé et inséré dans le DOM.
 */
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
  opInput += " min='0.1' max='1' value='1' step='.01'>"
  opInput += "</div>";

  content = "<div class='dialogContentContainer' onclick='event.stopPropagation(); '>" + (isOpInput ? opInput : '') +  content + "</div>";

  dialog.addEventListener('click', (e) => {
    closeOrRemove === 'remove' ? dialog.remove() : dialog.close();
  });

  dialog.innerHTML = content;
  dialogContainer.appendChild(dialog);

  return dialog;
}

/**
 * @description Ouvre un dialog listant les touches libres (simples, Ctrl+caractère, Alt+caractère) sous forme de claviers virtuels.
 * @returns {HTMLDialogElement} - Le dialog créé.
 * @memberof module:ui
 */
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
  let freeTuchsOneSpecialChar = freeTuchs.simple.filter(
    t => (t.charCode > 32 && t.charCode < 48) || (t.charCode > 57 && t.charCode < 65)
  );

  let freeTuchsCtrlLetterMIN   = freeTuchs.ctrl.filter(t => t.tuch.match(/[a-z]/));
  let freeTuchsCtrlNumber      = freeTuchs.ctrl.filter(t => t.tuch.match(/[0-9]/));
  let freeTuchsCtrlSpecialChar = freeTuchs.ctrl.filter(
    t => (t.charCode > 32 && t.charCode < 48) || (t.charCode > 57 && t.charCode < 65)
  );

  let freeTuchsAltLetterMIN   = freeTuchs.alt.filter(t => t.tuch.match(/[a-z]/));
  let freeTuchsAltNumber      = freeTuchs.alt.filter(t => t.tuch.match(/[0-9]/));
  let freeTuchsAltSpecialChar = freeTuchs.alt.filter(
    t => (t.charCode > 32 && t.charCode < 48) || (t.charCode > 57 && t.charCode < 65)
  );

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

/**
 * @description Extrait les propriétés présentes dans un tableau d’objets et construit une matrice de valeurs, éventuellement triée.
 * @param {Object[]} arrObjs - Tableau d’objets source.
 * @param {string|false} isSorted - Nom de la propriété sur laquelle trier, ou `false`.
 * @param {'asc'|'desc'} newDir - Direction de tri.
 * @returns {{infosObjs: Array<Array<Object>>, propsInObjs: string[]}|false} - Données structurées et liste des propriétés, ou `false` si aucune propriété trouvée.
 * @memberof module:ui
 */
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

/**
 * @description Construit une matrice d’infos à partir d’un tableau d’objets et optionnellement la trie.
 * @param {Object[]} arrObjs - Tableau d'objets source.
 * @param {string|false} isSorted - Propriété sur laquelle trier, ou `false` pour aucun tri.
 * @param {'asc'|'desc'} newDir - Direction de tri.
 * @returns {{infosObjs: Array<Array<Object>>, propsInObjs: string[]}|false} Objet structuré ou `false` si aucune propriété.
 * @memberof module:ui
 */
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

/**
 * @description Extrait les paires (prop, val, typeof) d’un objet, limitées à un sous-ensemble de propriétés si fourni.
 * @param {Object} obj - Objet source.
 * @param {string[]|false} [propsInObj=false] - Propriétés à conserver, ou `false` pour toutes.
 * @returns {Array<{prop:string, val:*, typeof:string}>} Tableau d’infos sur les propriétés.
 * @memberof module:ui
 */
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

/**
 * @description Ouvre (ou met à jour) un dialogue listant les infos des modificateurs, avec en-têtes triables.
 * @param {string|false} [isSorted=false] - Propriété triée ou `false`.
 * @param {'asc'|'desc'|'none'} [newDir='none'] - Direction du tri.
 * @returns {HTMLDialogElement|string} Dialog créé (nouveau) ou HTML mis à jour (existant).
 * @memberof module:ui
 */
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

/**
 * @description Ouvre (ou met à jour) un dialogue listant les infos des avatars, avec en-têtes triables.
 * @param {string|false} [isSorted=false] - Propriété triée ou `false`.
 * @param {'asc'|'desc'|'none'} [newDir='none'] - Direction du tri.
 * @param {boolean} [isJustForContent=isSorted] - Retourne le dialog avec contenu ou juste le contenu.
 * @returns {HTMLDialogElement|string} Dialog créé (nouveau) ou HTML mis à jour (existant).
 * @memberof module:ui
 */
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

/**
 * @description Ajoute/enlève la classe de sélection sur une ligne de tableau d’infos.
 * @param {HTMLTableRowElement} tr - Ligne à (dé)sélectionner.
 * @returns {void}
 * @memberof module:ui
 */
function trSelect(tr){
  !tr.classList.contains('trSelect') ? addClasses(tr, 'trSelect') : removeClasses(tr, 'trSelect');
}

/**
 * @description Extrait les paires (prop, val) d’un objet pour toutes les propriétés scalaires (ni objet ni fonction).
 * @param {Object} obj - Objet source.
 * @param {string[]|false} [propsInObj=false] - Propriétés à conserver, ou `false` pour toutes.
 * @returns {Array<{prop:string, val:*}>} Tableau (prop, val) filtré.
 * @memberof module:ui
 */
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

/**
 * @description Trie une matrice d'infos (tableau de lignes d’objets {prop,val}) selon une propriété et un sens.
 * @param {Array<Array<{prop:string, val:*}>>} infosMods - Données à trier.
 * @param {string} prop - Propriété cible du tri.
 * @param {'asc'|'desc'} [dir='asc'] - Sens du tri.
 * @returns {Array<Array<{prop:string, val:*}>>} Le même tableau trié (in-place).
 * @memberof module:ui
 */
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

/**
 * @description Ouvre/ferme le dialogue d’infos pour un tableau d’objets (avec titre).
 * @param {Object[]|string} arrObjs - Tableau d’objets ou JSON encodé (`///` pour guillemets).
 * @param {string} title - Titre du dialogue.
 * @returns {void}
 * @memberof module:help
 */
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

/**
 * @description Ouvre ou ferme la boîte de dialogue du canvas de tracé des modificateurs,
 * initialise l'état de la souris et réinitialise les chemins.
 * @memberof module:dialog
 */
function toggleModPathDialog(){
  brushDialogVisible = !brushDialogVisible;

  if(brushDialogVisible){
    ctxModPath.clearRect(0, 0, modPathCanvas.width, modPathCanvas.height);

    if(activeGlo.modifiers.length){ getSelectedModifiers().forEach(mod => { mod.glo.stepsModPath = []; }); }
    else{ activeGlo.stepsModPath = []; }

    mouseModPathCanvas     =  { x: 0, y: 0, first: true, form: false};
    mouseModPathCanvasLast =  { x: 0, y: 0, first: true, form: false};
    modPathCanvasMouseDown = false;
    modPathCanvasMouseUp   = false;
    
    modPathDialog.showModal();
    fix_dpi(modPathCanvas);

    ctxModPath.strokeStyle = '#cc0000';
    strokeOnCanvas(ctxModPath, function(){ctxModPath.crossDiag(modPathCanvas.getCenter(), 10);});
  }
  else{ modPathDialog.close(); }
}

/**
 * @description Ouvre ou ferme la boîte de dialogue du canvas pour la brosse,
 * réinitialise les états de la souris (clics, mouvements) et prépare le canvas.
 * 
 * @global {Point} mouseCanvasClick - Coordonnées du clic courant.
 * @global {Point} mouseCanvasLastClick - Coordonnées du dernier clic.
 * @global {Point} mouseCanvas - État courant de la souris (mouvement).
 * @global {Point} mouseCanvasLast - Dernier état enregistré de la souris.
 */
function toggleBrushDialog(){
  brushModPathVisible = !brushModPathVisible;

  if(brushModPathVisible){
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

/**
 * @description Sauvegarde un mouvement de la souris sur le canvas des modificateurs,
 * soit pour l’objet global actif, soit pour chaque modificateur sélectionné.
 * @memberof module:dialog
 * @param {Point} [lastPt=mouseModPathCanvasLast] - Dernier point enregistré.
 * @param {Point} [pt=mouseModPathCanvas] - Point actuel capturé.
 */
function helpToSaveMoveOnModPathCanvas(lastPt = mouseModPathCanvasLast, pt = mouseModPathCanvas){
  if(!activeGlo.modifiers.length){ saveMoveOnModPathCanvas(activeGlo, lastPt, pt); }
  else{ getSelectedModifiers().forEach(mod => { saveMoveOnModPathCanvas(mod.glo, lastPt, pt); }); }
}

/**
 * @description Charge le fichier `event.js`, extrait les commentaires spéciaux
 * pour construire l’aide, et génère les tags associés.
 * @memberof module:dialog
 * @async
 * @returns {Promise<void>} Promise résolue une fois l’aide construite.
 */
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

/**
 * @description Ouvre ou ferme la boîte de dialogue d’aide.
 * @memberof module:dialog
 */
function toggleHelpDialog(){
  helpDialogVisible = !helpDialogVisible;

  if(helpDialogVisible){ helpDialog.showModal(); }
  else{ helpDialog.close(); }
}

/**
 * @description Construit l’interface de la boîte de dialogue d’aide,
 * génère dynamiquement les touches et leurs actions associées.
 * @memberof module:dialog
 * @param {boolean} [start=false] - Indique si la construction est initiale (reset complet).
 */
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
      (e) => {
        e.target.style.color  = "purple";
        e.target.style.cursor = "pointer";
      },
      false
    );
    key.addEventListener(
      "mouseleave",
      (e) => {
        e.target.style.color  = "";
      },
      false
    );
  });
  getById('helpDialogOpacity').value = 1
  helpDialog.style.opacity           = 1;

  tuchs = tuchs_save.slice();
}

/**
 * @description Filtre la liste des touches d’aide en fonction du texte recherché
 * et des tags sélectionnés.
 * @memberof module:dialog
 */
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

/**
 * @description Active ou désactive l’état d’aide sur un élément visuel (touche).
 * @memberof module:dialog
 * @param {HTMLElement} domHelpTuch - Élément DOM représentant une touche d’aide.
 */
function toggleHelpOnTuch(domHelpTuch){
  [...domHelpTuch.classList].includes('helpOn') ? removeClasses(domHelpTuch, 'helpOn') : addClasses(domHelpTuch, 'helpOn');
  constructHelpDialog();
}

/**
 * @description Vérifie si une propriété est active et met à jour
 * l’état visuel de la touche correspondante dans le dialogue d’aide.
 * @memberof module:dialog
 * @param {string} tuchId - Identifiant DOM de la touche.
 * @param {string} property - Nom de la propriété à vérifier dans activeGlo.
 */
function checkHelpProp(tuchId, property){
  if(property){
    activeGlo[property] ? addClasses(getById(tuchId), 'on') : removeClasses(getById(tuchId), 'on');
  } 
}

/**
 * @description Met à jour l’opacité de la boîte de dialogue d’aide
 * en fonction de la valeur saisie.
 * @memberof module:dialog
 * @param {InputEvent} e - Événement de changement de l’élément input.
 */
function helpDialogOpacityChange(e){
  e.stopPropagation();
  e.preventDefault();
  helpDialog.style.opacity = e.target.value; 
}