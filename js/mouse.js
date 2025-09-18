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
 *
 * @param {Avatar} av
 */
function mouveVirtualAvatar(av){
  av.lasts.push({x: av.x, y: av.y});
  if(av.lasts.length > 2){ av.lasts.shift(); }
  av.x = mouse.x; av.y = mouse.y; av.distMinMods();
}

//------------------ WHEN SELECT AVATARS BY RECTANGLE : TRANSLATE MOUSE COORD TO RECT COORD ----------------- //
function mouseCoordToRectCoor(){
  let x = mouse.x - mouse.click.x > 0 ? true : false;
  let y = mouse.y - mouse.click.y > 0 ? true : false;

  if      (x && y) { return { leftUp: {x: mouse.click.x, y: mouse.click.y}, rightBottom: {x: mouse.x, y: mouse.y}  }; }
  else if (!x && y){ return { leftUp: {x: mouse.x, y: mouse.click.y}, rightBottom: {x: mouse.click.x, y: mouse.y}  }; }
  else if(x && !y) { return { leftUp: {x: mouse.click.x, y: mouse.y}, rightBottom: {x: mouse.x, y: mouse.click.y}  }; }
  else if(!x && !y){ return { leftUp: {x: mouse.x, y: mouse.y}, rightBottom: {x: mouse.click.x, y: mouse.click.y}  }; }
}