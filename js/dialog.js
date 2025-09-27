/**
 * @module dialog
 * @description Ce module gère l’ouverture, la fermeture et la construction
 * des boîtes de dialogue liées aux canvas (brosse, modificateurs, aide).
 * Il fournit également des utilitaires pour la gestion des interactions souris
 * et la présentation de l’aide contextuelle.
 */

/**
 * @typedef {Object} Point
 * @property {number} x - Coordonnée horizontale.
 * @property {number} y - Coordonnée verticale.
 * @property {boolean} [form=false] - Indique si le point appartient à une forme.
 * @property {boolean} [first=false] - Indique s’il s’agit du premier point d’une séquence.
 */

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
 * @memberof module:dialog
 * @param {Point} [mouseCanvasClick] - Coordonnées du clic courant.
 * @param {Point} [mouseCanvasLastClick] - Coordonnées du dernier clic.
 * @param {Point} [mouseCanvas] - État courant de la souris (mouvement).
 * @param {Point} [mouseCanvasLast] - Dernier état enregistré de la souris.
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