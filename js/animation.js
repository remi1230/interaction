//------------------ DÉPLACEMENTS D'AVATARS ----------------- //

/**
 * Fonction principale d'animation
 * Appelée en boucle par requestAnimationFrame
 * - Met à jour les positions et vitesses des avatars en fonction des paramètres globaux et de leurs interactions.
 * - Applique forces, rotations, limites de vitesse et affiche la structure (grille, modificateurs...).
 * - Incrémente le compteur global et se rappelle récursivement.
 * 
 * @returns {void}
 * @memberof module:animation
 */
function animation(){
  if(!activeGlo.totalBreak){
    let attract_mouse = activeGlo.attract_mouse.state && activeGlo.attract_mouse.mousedown;
    let growing_mouse = activeGlo.growByMouse;
    let posOnMouse    = activeGlo.posOnMouse.avatar;
    let defineCenter  = activeGlo.defineCenter;
    let is_modifier   = activeGlo.pos_modifiers != 'none';
    let tail_memory   = activeGlo.params.tail_memory;
    let pause         = activeGlo.break;
    let nears_calc    = activeGlo.params.nears_calc;
    let noAvToAv      = activeGlo.noAvToAv ? activeGlo.noAvToAv.state : false;
    let keep_dir      = activeGlo.params.keep_dir;
    let resist        = activeGlo.params.resist;

    if(activeGlo.checkBlanks){ imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); }

    if(activeGlo.nb_moves%keep_dir == 0 && activeGlo.global_alea && !activeGlo.hyperAlea){ alea_params(); }
    if(activeGlo.nb_moves%keep_dir == 0){ one_alea_param(); }

    if(noAvToAv){
      activeGlo.noAvToAv.ax = 0;
      activeGlo.noAvToAv.ay = 0;
      avatarsMeanPoint();
    }

    for(let i = 0; i < avatars.length; i++){
      let avatar = avatars[i];

      let paramsNearMod = avatar.nearMod.params ? avatar.nearMod.params : activeGlo.params;
      let gloNear       = avatar.nearMod.glo ? avatar.nearMod.glo : activeGlo;
      let angle         = paramsNearMod.rotate_angle / 10;
      let spap          = paramsNearMod.speed_alea_pos;

      avatar.modifiersValues = {x: 0, y: 0, curve:{x: 0, y: 0}};

      if(activeGlo.hyperAlea && !avatar.glo){ avatar.glo = deepCopy(activeGlo, 'modifiers', 'inputToSlideWithMouse'); }
      if(activeGlo.nb_moves%keep_dir == 0 && activeGlo.global_alea && activeGlo.hyperAlea){ alea_params(avatar); }

      if(!avatar.virtual){
        avatar.last_x = avatar.x;
        avatar.last_y = avatar.y;

        avatar.dist = 0;
        avatar.ax   = 0;
        avatar.ay   = 0;

        avatar.distMods = [];

        if(gloNear.tail){
          tail_length = avatar.tail_length();
          if(tail_length <= paramsNearMod.lim_line){ avatar.lasts.push({x: avatar.last_x, y: avatar.last_y}); }
          if(avatar.lasts.length > tail_memory){ avatar.lasts.shift(); }
          while(avatar.tail_length() > paramsNearMod.lim_line){ avatar.lasts.shift(); }
        }
        else{
          avatar.lasts.push({x: avatar.last_x, y: avatar.last_y});
          if(avatar.lasts.length > 2){ avatar.lasts.shift(); }
        }

        if(gloNear.lim_dist && avatar.it%nears_calc == 0 && !gloNear.stopNear){ avatar.nearAvatars(); }

        if(resist == 0){ avatar.vx = 0; avatar.vy = 0; }

        if(gloNear.moveOnAlea && avatar.it%spap == 0){ avatar.moveOnAlea(); }
        if(avatar.nears.length){ avatar.interaction(); }

        if(gloNear.follow){ avatar.follow(); }
        if(activeGlo.attractByOne){ avatar.attractByOne(); }

        if(paramsNearMod.angleEllipse && paramsNearMod.rotate_angle){
          avatar.rotateEllipse(angle, !avatar.center ? { x: canvas.width/2, y: canvas.height/2 } : { x: avatar.center.x, y: avatar.center.y },
                              {x: paramsNearMod.ellipse_x, y: paramsNearMod.ellipse_y}, paramsNearMod.angleEllipse, paramsNearMod.spiral_force, false);
        }
        else if(paramsNearMod.rotate_angle){
          if(gloNear.spiral_cross && gloNear.spiral_cross_rotate){ angle = activeGlo.nb_spiral_cross % 2 != 0 ? -angle : angle; }
          avatar.rotate(angle, !avatar.center ? { x: canvas.width/2, y: canvas.height/2 } : { x: avatar.center.x, y: avatar.center.y },
                        {x: paramsNearMod.ellipse_x, y: paramsNearMod.ellipse_y}, paramsNearMod.spiral_force);
        }
        if(paramsNearMod.spiral_angle != 0){ avatar.spiral(); }
        if(paramsNearMod.trirotate_angle != 0){ avatar.rotPoly(); }
        if(paramsNearMod.trirotate_angle2 != 0){
          avatar.rotPoly(paramsNearMod.trirotate_angle2, { x: canvas.width/2, y: canvas.height/2 },
                                false, paramsNearMod.polyRotNbEdges2, false, paramsNearMod.polyRotAngle2);
        }
        if(paramsNearMod.dirForce != 0){ avatar.gloDir(); }
        if(paramsNearMod.attractForce != 0){ avatar.gloAttract(); }
        if(gloNear.curve){ avatar.curve(); }
        if(activeGlo.trans.state){ avatar.trans(activeGlo.trans.dir); }

        if(attract_mouse && !defineCenter && !is_modifier && !posOnMouse && growing_mouse){ avatar.mouse_growing(); }

        if(activeGlo.modifiers.length > 0){
          let modifiersSz = activeGlo.modifiers.length;
          avatar.distMinModifiers = 9999;
          if(!activeGlo.asyncModify){ for(let i = 0; i < modifiersSz; i++){ activeGlo.modifiers[i].modify(avatar); } }
          else{
            if(!activeGlo.asyncNumModifier){ activeGlo.asyncNumModifier = 0; }
            activeGlo.modifiers[activeGlo.asyncNumModifier].modify(avatar);
          }
        }

        if(activeGlo.asyncModify){
          if(activeGlo.nb_moves%paramsNearMod.asyncTime == 0){ activeGlo.asyncNumModifier++; }
          if(activeGlo.asyncNumModifier == activeGlo.modifiers.length){ activeGlo.asyncNumModifier = 0; }
        }

        avatar.vx += avatar.ax; avatar.vy += avatar.ay;

        if(resist > 0){
          let r = resist;
          avatar.vx /= r;
          avatar.vy /= r;
        }

        avatar.modifiersValues.x += avatar.vx;
        avatar.modifiersValues.y += avatar.vy;

        if(!pause){ avatar.it++; }
      }
    }

    activeGlo.trans.state = false;

    if(activeGlo.spirAvatar){ avatars.forEach(avatar => { avatar.spiralToAvatar(); }); }
    else if(activeGlo.orbite){ avatars.forEach(avatar => { avatar.orbite(); }); }


    for(let i = 0; i < avatars.length; i++){
      if(!avatars[i].virtual){
        let avatar        = avatars[i];
        let paramsNearMod = avatar.nearMod.params ? avatar.nearMod.params : activeGlo.params;
        let gloNearMod    = avatar.nearMod.glo ? avatar.nearMod.glo : activeGlo;

        avatar.x += avatar.modifiersValues.curve.x;
        avatar.y += avatar.modifiersValues.curve.y;

        if(gloNearMod.limSpeedBySize){
          avatar.limSpeedBySize();
        }
        else{
          avatar.limSpeedMax();
          avatar.limSpeedMin();
        }

        if(!paramsNearMod.distNearClearMods){
          avatar.x += avatar.modifiersValues.x;
          avatar.y += avatar.modifiersValues.y;
        }
        else{
          avatar.x += avatar.modifiersValues.x;
          avatar.y += avatar.modifiersValues.y;
          if(avatar.distMinModifiers < paramsNearMod.distNearClearMods){
            if(gloNearMod.moveOnAlea){ avatar.moveOnAlea(); }
          }
        }

        if(!avatar.speedBf && avatar.draw){ avatar.speed = avatar.speed_avatar(); }
        else{ avatar.speedBefore(); avatar.speedBf = false; }
        avatar.accel = avatar.accel_avatar();

        if(activeGlo.checkBlanks && avatar.nextIsBlank()){ avatar.moveOnAlea(); }
      }
    }
    
    positionAvatars();

    if(activeGlo.crossPoints)     { drawCrossPoints(); }
    if(activeGlo.lineCrossPoints) { lineCrossPoints(); }

    if(activeGlo.updBgToAvColor && activeGlo.nb_moves%5 == 0){ updBgToAvColor({inv: true}); }

    if(activeGlo.nb_moves == 10000){ activeGlo.nb_moves = 0; }
    activeGlo.nb_moves++;
  }

  ctxStructure.clearRect(0, 0, structure.width, structure.height);

  if(activeGlo.params.modifiers_angle  != 0){ rotate_modifiers(); }

  if(activeGlo.modifierSelectbyRectangleOnRClick) { modifierSelectByRectangle(); }
  if(activeGlo.view_center)                       { view_center(); }
  if(activeGlo.view_modifiers)                    { view_modifiers(); }
  if(activeGlo.showCircle)                        { showCircle(); }
  if(activeGlo.showInfos)                         { showInfos(); }
  if(activeGlo.onModsInfo)                        { showModsInfos(); }
  if(activeGlo.testOnMouse)                       { testOnMouse(); }

  if(activeGlo.gridType){
    switch(activeGlo.gridType){
      case 'square':
        drawGrid();
        break;
      case 'circle':
        drawCircleGrid();
        break;
      case 'third':
        drawThridGrid();
        break;
      case 'hexagone':
        drawEquiGrid();
        break;
      case 'spirale':
        drawSpiralGrid();
        break;
    }
  }

  requestAnimationFrame(animation);
}