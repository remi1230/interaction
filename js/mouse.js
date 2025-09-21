/**
 * @typedef {import('./avatar.js').Avatar} Avatar
 */

/**
 * @description Récupère la position de la souris dans le canevas
 * @param {MouseEvent} e - L'événement de la souris
 * @param {HTMLCanvasElement} canvasVar - Le canevas à utiliser
 * @param {Object} ms - Un objet pour stocker la position de la souris
 * @returns {Object} La position de la souris dans le canevas
 * @memberof module:mouse
 */
function getMousePos(e, canvasVar, ms = false){
  let rect = canvasVar.getBoundingClientRect();
  let coeff = {x: canvasVar.width / canvasVar.clientWidth, y: canvasVar.height / canvasVar.clientHeight};

  if(!ms){ return {x: (e.clientX- rect.left) * coeff.x, y: (e.clientY - rect.top) * coeff.y}; }

  ms.x = (e.clientX- rect.left) * coeff.x;
  ms.y = (e.clientY - rect.top) * coeff.y;

  return ms;
}

/**
 * @description 
 * Vérifie si la souris est au-dessus d'un modificateur et met à jour l'état en conséquence.
 * Si la souris est au-dessus d'un modificateur, l'état `activeGlo.onModsInfo` est mis à jour avec le modificateur correspondant.
 * Si la souris n'est pas au-dessus d'un modificateur et que `activeGlo.persistModsInfo` est faux, l'état `activeGlo.onModsInfo` est réinitialisé à faux.
 * @memberof module:mouse
 */
function infoOnMouse(){
  let onModsInfo = false;
  let modifiersSz = activeGlo.modifiers.length;
  for(let i = 0; i < modifiersSz; i++){
    let mod = activeGlo.modifiers[i];
    if(mod.x < mouse.x + 10 && mod.x > mouse.x - 10 && mod.y < mouse.y + 10 && mod.y > mouse.y - 10){
      activeGlo.onModsInfo = {mod: mod};
      onModsInfo = true;
      break;
    }
  }
  if(!onModsInfo && !activeGlo.persistModsInfo){ activeGlo.onModsInfo = false; }
}

/**
 * @description  Déplace un avatar virtuel à la position de la souris
 * @param {Avatar} av - L'avatar à déplacer
 * @memberof module:mouse
 */
function mouveVirtualAvatar(av){
  av.lasts.push({x: av.x, y: av.y});
  if(av.lasts.length > 2){ av.lasts.shift(); }
  av.x = mouse.x; av.y = mouse.y; av.distMinMods();
}

//------------------ WHEN SELECT AVATARS BY RECTANGLE : TRANSLATE MOUSE COORD TO RECT COORD ----------------- //
/**
 * @description 
 * Convertit les coordonnées de la souris en coordonnées de rectangle pour la sélection d'avatars.
 * Cette fonction détermine les coins supérieur gauche et inférieur droit du rectangle de sélection
 * en fonction des positions initiale et actuelle de la souris.
 * @returns {{leftUp: {x: number, y: number}, rightBottom: {x: number, y: number}}} Un objet contenant les coordonnées des coins `leftUp` et `rightBottom` du rectangle.
 * @memberof module:mouse
 */
function mouseCoordToRectCoor(){
  let x = mouse.x - mouse.click.x > 0 ? true : false;
  let y = mouse.y - mouse.click.y > 0 ? true : false;

  if      (x && y) { return { leftUp: {x: mouse.click.x, y: mouse.click.y}, rightBottom: {x: mouse.x, y: mouse.y}  }; }
  else if (!x && y){ return { leftUp: {x: mouse.x, y: mouse.click.y}, rightBottom: {x: mouse.click.x, y: mouse.y}  }; }
  else if(x && !y) { return { leftUp: {x: mouse.click.x, y: mouse.y}, rightBottom: {x: mouse.x, y: mouse.click.y}  }; }
  else if(!x && !y){ return { leftUp: {x: mouse.x, y: mouse.y}, rightBottom: {x: mouse.click.x, y: mouse.click.y}  }; }
}