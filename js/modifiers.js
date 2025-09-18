function modIsNearMouse(mod, dist){
  if(mod.x < mouse.x + dist && mod.x > mouse.x - dist && mod.y < mouse.y + dist && mod.y > mouse.y - dist){ return h(mod.x - mouse.x, mod.y - mouse.y); }

  return false;
}

function getModNearestMouse(dist){
  let modsNearestMouse = [];
  activeGlo.modifiers.forEach(mod => {
    let distToMouse = modIsNearMouse(mod, dist);
    if(distToMouse){ mod.distToMouse = modsNearestMouse.push(mod); }
  });

  let nearModToReturn = modsNearestMouse[0] ? modsNearestMouse[0] : false;
  modsNearestMouse.forEach(nearMod => {
    if(nearMod.distToMouse < nearModToReturn.distToMouse){
      nearModToReturn = nearMod;
    }
  });
  return nearModToReturn;
}

function modsSymToCenter(sym = 'vhAxe'){
  getSelectedModifiers().forEach(mod => {
    let p      = symToCenter({x: mod.x, y: mod.y});
    let newMod = deepCopy(mod, 'modifiers');
    newMod.select = false;

    if(sym !== 'all'){
      newMod.x = sym == 'vhAxe' || sym == 'vAxe' ? p.x : newMod.x;
      newMod.y = sym == 'vhAxe' || sym == 'hAxe' ? p.y : newMod.y;
    }
    else{
      newMod.x = p.x;
      var newMod2 = deepCopy(mod, 'modifiers');
      newMod2.select = false;
      newMod2.y = p.y;
      var newMod3 = deepCopy(mod, 'modifiers');
      newMod3.select = false;
      newMod3.x = p.x;
      newMod3.y = p.y;
      activeGlo.modifiers.push(newMod2);
      activeGlo.modifiers.push(newMod3);
    }
    
    activeGlo.modifiers.push(newMod);
  });
}

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

function modsFormule(mod, av){
  if(activeGlo.mods_formule.state){
    activeGlo.mods_formule.formules.forEach(formule => {
      mod[formule.prop] = eval(formule.val);
    });
  }
}

function modsToZero(){
  activeGlo.modsToZero = !activeGlo.modsToZero;
  if(activeGlo.modsToZero){
      getSelectedModifiers().forEach(mod => {
      mod.saveAttract = mod.attrac;
      mod.attract = 0;
    });
  }
  else{ getSelectedModifiers().forEach(mod => { mod.attract = mod.saveAttrac; }); }
}

//------------------ MODIFICATION DE LA FORCE DES MODIFIEURS ----------------- //
function updateModifiersForce(ctrl, prop = 'attract', sprop = false, min = -Infinity, max = Infinity, p = 0.5){
  let upd_val = calcUpdVal(ctrl);

  upd_val = pow(upd_val, p);

  function changeProp(val, uval){
    if(val == 0) return uval;
    return val*uval > min && val*uval < max ? val*uval : val;
  }

  if(!sprop){ getSelectedModifiers().forEach(mod => { mod[prop]  = changeProp(mod[prop], upd_val); }); }
  else{ getSelectedModifiers().forEach(mod => { mod[prop][sprop] = changeProp(mod[prop][sprop], upd_val); }); }
}
//------------------ MODIFICATION PROPRIÉTE DES MODIFIEURS ----------------- //
function changeModifiersProp(ctrl, prop, byVal = false){
  let val = !byVal ? ctrl.value : byVal;

  if(parseFloat(val)){ val = parseFloat(val); }

  if(ctrl.classList.contains('radUnit')){ val*=rad; }

  getSelectedModifiers().forEach(mod => { mod[prop]  = val; });
}
/**
 * @description Update prop param angle of modifiers
 * @param {HTMLElement}  ctrl ctrl input range of interface
 * @param {string}  prop the prop in modifiers to update
 * @returns {void}
 */
function updModsAngle(ctrl, prop){
  let last_val = parseFloat(ctrl.dataset.last_value);
  let val      = parseFloat(ctrl.value);

  upd_val = rad * (val - last_val);

  getSelectedModifiers().forEach(mod => {
    let s        = Math.sign(mod[prop]) != 0 ? Math.sign(mod[prop]) : 1;
    let newAngle = mod[prop] + upd_val * -s;
    let sbf      = Math.sign(newAngle) != 0 ? Math.sign(newAngle) : 1;
    if(s == sbf){
      if(newAngle > PI)      {
        newAngle = -(PI - (PI + (-(newAngle - PI))));
      }
      else if(newAngle < -PI){ newAngle = -(newAngle + PI); }
    }
    else{
      if(s < 0 && sbf > 0){ newAngle =  PI - newAngle; }
      else                { newAngle = -PI - newAngle; }
    }

    mod[prop] = newAngle;
  });
}
/**
 * @description Update prop param dbl angle of modifiers
 * @param {HTMLElement}  ctrl ctrl input range of interface
 * @returns {void}
 */
function updModAngle(ctrl, prop = 'dblAngle'){
  let last_val = parseFloat(ctrl.dataset.last_value);
  let val      = parseFloat(ctrl.value);

  upd_val = rad * (val - last_val);

  getSelectedModifiers().forEach(mod => { mod[prop] = twoPINumber(mod[prop] + upd_val); });
}

//------------------ CALCUL POS ON GRID ----------------- //
function putModsOnGrid(){
  if(activeGlo.grid.draw){
    getSelectedModifiers().forEach(mod => {
        let pos = posOnGrid({x: mod.x, y: mod.y}, activeGlo.gridType);
        mod.x = pos.x;
        mod.y = pos.y;
    });
  }
}
//------------------ POS A MODIFIER ----------------- //
function pos_modifier(type = 'attractor', pos = mouse, inv = false, groupe = 0, virtual = false){
  let invAtt     = !inv ? 1 : -1;
  let random     = !activeGlo.pos_rnd_modifiers ? 1 : rnd();
  let force      = !activeGlo.modsToZero ? invAtt * 100 * random : 0;
  let dir_rnd    = !activeGlo.pos_rnd_modifiers ? 0 : rnd() * two_pi;
  let dir_angle  = invAtt * activeGlo.params.director_angle  + dir_rnd - invAtt * activeGlo.params.director_angle_upd;

  if(activeGlo.grid.draw){ pos = posOnGrid(pos, activeGlo.gridType); }

  pos = !activeGlo.attract_center ? pos :
        !activeGlo.center ? canvas.getCenter() : activeGlo.center;

  let cent = !activeGlo.center ? canvas.getCenter() : activeGlo.center;

  let formule = {x: formule_x.value, y: formule_y.value};

  let dblAngle        = 0;
  let modPolyRotAngle = 0;
  let magnetAngle     = activeGlo.params.magnetor_angle;
  if(activeGlo.orientedPoly){
    let angle       = atan2pi(pos.x - cent.x, pos.y - cent.y);
    magnetAngle     = angle <= PI ? angle : -(angle - PI);
    modPolyRotAngle = two_pi - angle;
    dblAngle        = atan2piZ(pos.x - cent.x, pos.y - cent.y);
    dir_angle       = dblAngle;
  }

  if(type == 'magnetor' || type == 'mimagnetor' || activeGlo.doubleMods){ activeGlo.magnetors = true; }

  activeGlo.params.num_modifier = num_modifier;

  let newMod = {
    num_modifier      : num_modifier,
    num_av            : 'None',
    type              : type,
    x                 : pos.x,
    y                 : pos.y,
    attract           : force,
    brake             : activeGlo.params.brake_pow,
    nbEdges           : activeGlo.params.posModsNbEdges,
    magnetAngle       : magnetAngle,
    modPolyRotAngle   : modPolyRotAngle,
    dblAngle          : dblAngle,
    dir_angle         : dir_angle,
    tint              : activeGlo.params.tint_color,
    sat               : activeGlo.params.saturation,
    alpha             : activeGlo.params.alpha_color,
    colorDec          : activeGlo.params.colorDec,
    size              : activeGlo.size,
    lim_attract       : 0,
    haveColor         : activeGlo.modifiersHaveColor,
    powColor          : activeGlo.params.nearColorPow,
    varOneColMod      : activeGlo.params.varOneColMod,
    rot_spi           : force,
    params            : deepCopy(activeGlo.params),
    ellipse           : {x: activeGlo.params.ellipse_x, y: activeGlo.params.ellipse_y},
    spiral_exp        : invAtt * activeGlo.params.spiral_exp,
    rotMax            : 0,
    rotSin            : [],
    formule           : formule,
    center            : cent,
    glo               : deepCopy(activeGlo, 'modifiers', 'inputToSlideWithMouse'),
    color             : activeGlo.modifiersColor,
    colorStrokeDec    : activeGlo.params.colorStrokeDec,
    tint_stroke       : activeGlo.params.tint_stroke,
    satStroke         : activeGlo.params.satStroke,
    colorFunction     : activeGlo.colorFunction,
    curveAngle        : activeGlo.params.curveAngle,
    double            : type == 'magnetor' ? true : false,
    dblForce          : activeGlo.doubleMods ? 200 : 1,
    modsWithSign      : activeGlo.modsWithSign ? true : false,
    alternRot         : {state: true, inv: 1},
    alternAtt         : {state: true, inv: 1},
    weight            : 1,
    groupe            : groupe,
    virtual           : virtual,
    modify            : makeModifierFunction(type)
  };

  activeGlo.modifiers.push(newMod);

  num_modifier++;
}

/**
*@description Make the modify function to modify the pos of avatars
*@param {string} modifierType The type of modifier, ex: 'attractor', 'rotator', ...
*@returns {void}
*/
function makeModifierFunction(modifierType){
  switch (modifierType) {
    case 'attractor':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist = av.dist_av(this) / this.params.weightDistMinMod;
        if(this == av.nearMod){
          av.goToNearMod    = dist < av.distMinNearMod ? true : false;
          av.distMinNearMod = dist;
        }
        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){
          av.distMinModifiers = dist; av.distMinNearMod = dist; av.nearMod = this;
        }

        if(dist <= this.lim_attract || !this.lim_attract){
          let angleToMod  = atan2pi(av.x - this.x, av.y - this.y);

          if(angleToMod >= this.params.minAngleMod && angleToMod <= this.params.maxAngleMod){
            let att   = this.attract * this.dblForce * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
            let b = !this.glo.invBrake ? this.brake : 1/this.brake;
            let brake = this.params.breakAdd + pow(dist, b);
            let addX  = att * (this.x - av.x) / brake;
            let addY  = att * (this.y - av.y) / brake;

            av.modifiersValues.x += addX;
            av.modifiersValues.y += addY;

            if(this.params.modsDevForce != '0'){
              let dist = h(addX, addY);
              let dir  = atan2piZ(addX, addY);
              let dec  = direction(dir + this.params.modsDevDir, dist * this.params.modsDevForce);

              av.modifiersValues.x += dec.x;
              av.modifiersValues.y += dec.y;
            }
          }
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += cos(this.dblAngle);
            this.y      += sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'rotator':
    case 'magnetor':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let posSave;
        let k = this.params.dblModDist;
        if(this.double){
          posSave = {x: this.x, y: this.y};
          this.x -= k*cos(this.dblAngle);
          this.y -= k*sin(this.dblAngle);

          if(!this.doublePos){ this.doublePos = {}; }
          this.doublePos.double = {x: this.x, y: this.y};
        }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;
        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let angleToMod  = atan2pi(av.x - this.x, av.y - this.y);

          if(angleToMod >= this.params.minAngleMod && angleToMod <= this.params.maxAngleMod){
            let att    = this.attract * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
            let b = !this.glo.invBrake ? this.brake : 1/this.brake;
            let brake  = this.params.breakAdd + pow(dist, b);
            let attRot = att / brake;

            if(this.rotMax > 0){ attRot = abs(attRot) > this.rotMax ? Math.sign(attRot) * this.rotMax : attRot; }

            if(!this.params.ell_x_mod_upd && !this.params.ell_y_mod_upd){
              av.rotate(attRot, {x: this.x, y: this.y}, {x: att*this.ellipse.x/brake, y: att*this.ellipse.y/brake},
                                  this.params.spiral_force, {force: this.params.modsDevForce, dir: this.params.modsDevDir});
            }
            else{
              av.rotateEllipse(attRot, {x: this.x, y: this.y},
                                  {x: att*this.ellipse.x/brake, y: att*this.ellipse.y/brake}, this.params.angleEllipseMod, this.params.spiral_force);
            }
          }

          if(this.double){
            this.x = posSave.x;
            this.y = posSave.y;
          }
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += k*cos(this.dblAngle);
            this.y      += k*sin(this.dblAngle);

            this.doublePos.noDouble = {x: this.x, y: this.y};

            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'magnetor':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att         = this.attract * this.dblForce;
          let brake       = this.params.breakAdd + pow(dist, this.brake);
          let dxToMod     = av.x - this.x;
          let dyToMod     = av.y - this.y;
          let angleToMod  = atan2pi(dxToMod, dyToMod);
          let magnetAngle = this.magnetAngle;

          let inv = 1;
          if(magnetAngle >= 0){
            inv = angleToMod > magnetAngle && (angleToMod < magnetAngle + PI) ? inv : -inv;
          }
          else{
            magnetAngle = -magnetAngle;
            inv = angleToMod > magnetAngle && (angleToMod < magnetAngle + PI) ? -inv : inv;
          }

          av.modifiersValues.x += inv * att * (this.x - av.x) / brake;
          av.modifiersValues.y += inv * att * (this.y - av.y) / brake;
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += cos(this.dblAngle);
            this.y      += sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'deviator':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att         = this.attract * this.dblForce * 4;
          let brake       = this.params.breakAdd + pow(dist, this.brake/2);

          let lastAv = av.lasts[av.lasts.length - 2];

          if(lastAv){
            let vx = av.x - lastAv.x;
            let vy = av.y - lastAv.y;

            let c = att / brake;

            if(!av.direction){ av.dir(); }

            let dir = direction(av.direction + this.params.deviatorAngle, h(vx, vy));

            av.modifiersValues.x += dir.x * c;
            av.modifiersValues.y += dir.y * c;
          }
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += cos(this.dblAngle);
            this.y      += sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'accelerator':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att         = this.attract * this.dblForce;
          let brake       = this.params.breakAdd + pow(dist, this.brake);

          let coeff = 1 + att/brake;
          
          av.modifiersValues.x *= coeff;
          av.modifiersValues.y *= coeff;
        }

        if(this.double){
            let posSave  = {x: this.x, y: this.y};
            this.x      += cos(this.dblAngle);
            this.y      += sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;
        }
      };
    case 'polygonator':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att   = this.attract * this.dblForce * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
          let brake = this.params.breakAdd + pow(dist, this.brake);
          attRot    = 10 * att / brake;

          if(this.rotMax > 0){ att = abs(attRot) > this.rotMax ? Math.sign(attRot) * this.rotMax : att; }
          av.rotPoly(10 * att, {x: this.x, y: this.y}, true, this.nbEdges, this.brake, this.modPolyRotAngle,
                     {force: this.params.modsDevForce, dir: this.params.modsDevDir});
        }

        if(this.double){
            this.modPolyRotAngle += PI / this.nbEdges;

            let k        = this.params.dblModDist;
            let posSave  = {x: this.x, y: this.y};
            this.x      += k*cos(this.dblAngle);
            this.y      += k*sin(this.dblAngle);
            this.attract = -this.attract;
            this.double  = false;
            this.modify(av);
            this.double  = true;
            this.attract = -this.attract;
            this.x       = posSave.x;
            this.y       = posSave.y;

            this.modPolyRotAngle -= PI / this.nbEdges;
        }
      };
    case 'spiralor':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att     = this.attract;
          let brake   = this.params.breakAdd + pow(dist, this.brake/1.15);
          let attract = att/4;
          let rot_spi = this.rot_spi;
          let attSpi  = rot_spi/brake;

          if(this.rotMax > 0){ attSpi = abs(attSpi) > this.rotMax ? Math.sign(attSpi) * this.rotMax : attSpi; }

          let attB = !this.glo.spiralOnlyInvrot ? attract/brake : abs(attract/brake);
          let f = 1 + attB;

          if(!this.params.ell_x_mod_upd && !this.params.ell_y_mod_upd){
              av.rotate(attSpi, {x: this.x, y: this.y}, {x: rot_spi*this.ellipse.x/brake, y: rot_spi*this.ellipse.y/brake}, f);
          }
          else{
              av.rotateEllipse(attSpi, {x: this.x, y: this.y}, {x: rot_spi*this.ellipse.x/brake, y: rot_spi*this.ellipse.y/brake}, this.params.angleEllipseMod, f);
          }
        }
      };
    case 'alternator':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att   = this.attract;
          let brake = this.params.breakAdd + pow(dist, this.brake);
          if(this.brake == 0){ att /= 100; }
          attRot    = att / brake;

          let alternatorSpeed = this.brake != 0 ? this.params.alternatorSpeed : parseInt(this.params.alternatorSpeed / 10);
          if(zeroOneCycle(this.glo.nb_moves, alternatorSpeed)){
            this.alternAtt.state = false;

            if(!this.glo.alternatorInv){ this.alternRot.inv = 1; }
            else{ this.alternRot.inv = this.alternRot.state ? this.alternRot.inv : -this.alternRot.inv; }

            this.alternRot.state = true;
            if(this.rotMax > 0){ attRot = abs(attRot) > this.rotMax ? Math.sign(attRot) * this.rotMax : attRot; }
            av.rotate(this.alternRot.inv * attRot, {x: this.x, y: this.y}, {x: att*this.ellipse.x/brake, y: att*this.ellipse.y/brake});
          }
          else{
            this.alternRot.state = false;

            if(!this.glo.alternatorInvAtt){ this.alternAtt.inv = 1; }
            else{ this.alternAtt.inv = this.alternAtt.state ? this.alternAtt.inv : -this.alternAtt.inv; }

            this.alternAtt.state = true;
            av.modifiersValues.x += this.alternAtt.inv * att * (this.x - av.x) / brake;
            av.modifiersValues.y += this.alternAtt.inv * att * (this.y - av.y) / brake;
          }
        }
      };
    case 'director':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }

        let dist  = av.dist_av(this) / this.params.weightDistMinMod;

        av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
        if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

        if(dist <= this.lim_attract || !this.lim_attract){
          let att   = this.attract * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
          let brake = this.params.breakAdd + pow(dist, this.brake);
          let force = 100 * att / brake;
          let angle = this.dir_angle + this.params.director_angle_upd;

          av.modifiersValues.x += cos(angle) * force;
          av.modifiersValues.y += sin(angle) * force;
        }
    };
    case 'pathor':
      return function(av){
        if(this.glo.stepsModPath){
          if(this.params.mods_formule != '0'){ modsFormule(this, av); }

          let dist  = av.dist_av(this) / this.params.weightDistMinMod;

          av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
          if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

          if(dist <= this.lim_attract || !this.lim_attract){
            let att   = this.attract * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
            let brake = this.params.breakAdd + pow(dist, this.brake);
            let force = 100 * att / brake;

            let angleToCenter = atan2pi(av.x - this.x, av.y - this.y);
            let vects         = this.glo.stepsModPath.sort((a,b) => a.angleToCenter - b.angleToCenter).slice(1);

            if(vects.length){
              vects = vects.map(vect => { vect.angleToCenter.x -= vects[0].angleToCenter.x; vect.angleToCenter.y -= vects[0].angleToCenter.y; return vect; });

              let vect = vects[0];
              for(let i = 0; i < vects.length-1; i++){
                if(angleToCenter > vects[i].angleToCenter && angleToCenter <= vects[i+1].angleToCenter){ vect = vects[i]; break; }
              }
              if(angleToCenter > vects[vects.length-1].angleToCenter){
                vect = vects[vects.length-1];
              }

              av.modifiersValues.x += vect.x * force;
              av.modifiersValues.y += vect.y * force;
            }
          }
        }
    };
    case 'formulator':
      return function(av){
        if(this.formule){
          if(this.params.mods_formule != '0'){ modsFormule(this, av); }

          let dist  = av.dist_av(this) / this.params.weightDistMinMod;

          av.distMods.push({dist: dist, h: this.color.h, l: this.tint, ls: this.tint_stroke, st: this.satStroke, w: this.weight, colorDec: this.colorDec, colorStrokeDec: this.colorStrokeDec, varColDistModifs : this.params.varColDistModifs});
          if(dist < av.distMinModifiers){ av.distMinModifiers = dist; av.nearMod = this; }

          if(dist <= this.lim_attract || !this.lim_attract){
            let att    = this.attract * (this.glo.forceByCenter ? av.coeffSizeCenter() : 1);
            let brake  = this.params.breakAdd + pow(dist, this.brake);
            let force  = 100 * att / brake;
            let result = {x: 0, y: 0};
            let reg_x  = '((av.x - this.x) * rad)';
            let reg_y  = '((av.y - this.y) * rad)';

            if(this.formule.x && this.formule.x != ''){
              let x = this.formule.x;
              x = x.replaceAll('xy', 'x*y');
              x = x.replaceAll('x', reg_x);
              x = x.replaceAll('y', reg_y);
              let result_x = parseFloat(eval(x)) * force;
              if(isFinite(result_x)){ result.x = result_x; }
            }
            if(this.formule.y && this.formule.y != ''){
              let y = this.formule.y;
              y = y.replaceAll('xy', 'x*y');
              y = y.replaceAll('x', reg_x);
              y = y.replaceAll('y', reg_y);
              let result_y = parseFloat(eval(y)) * force;
              if(isFinite(result_y)){ result.y = result_y; }
            }

            av.modifiersValues.x += result.x;
            av.modifiersValues.y += result.y;
          }
        }
      };
    case 'none':
      return function(av){
        if(this.params.mods_formule != '0'){ modsFormule(this, av); }
      };
  }
}

//------------------ POS ATTRACTORS OR ROTATORS ----------------- //
function posModifiers(type = activeGlo.pos_modifiers, inv = activeGlo.invModifiersAtt){
  let invAtt = inv;
  if(type != 'all'){
    for(let i = 0; i < activeGlo.params.nb_modifiers; i++){
      if(inv){ invAtt = i%2 == 0 ? true : false; }
      if(!activeGlo.posOnMouse.circleMods){ pos_modifier(type, getRandomPoint(1), invAtt); }
      else{ posCircleModifiers(getRandomPoint(1)); }
    }
  }
  else {
    let types   = ['attractor', 'rotator', 'director'];
    let typesSz = types.length;
    for(let i = 0; i < activeGlo.params.nb_modifiers; i++){
      if(inv){ invAtt = i%2 == 0 ? true : false; }
      pos_modifier(types[i%typesSz], getRandomPoint(1), invAtt);
    }
  }
}

function posModifiersByType(cent, type = activeGlo.formModTypes[activeGlo.params.formModType]){
  switch(type){
    case 'circle':
      posCircleModifiers(cent);
      break;
    case 'square':
      posSquareModifiers(cent);
      break;
    case 'rectangle':
      posRectModifiers(cent);
      break;
    case 'polygone':
      posPolyModifiers(cent);
      break;
  }
}

//------------------ POS CIRCLES MODIFIERS ----------------- //
function posCircleModifiers(cent = false, type = activeGlo.pos_modifiers, inv = activeGlo.invModifiersAtt, rot = activeGlo.params.rotCircleModifiers){
  let pt, n = 0;
  let invAtt = inv;
  if(!cent){
    cent = !activeGlo.defineCenter ? defineCenter(false) :
                activeGlo.center ? activeGlo.center : canvas.getCenter();
  }

  if(!activeGlo.groupe){ activeGlo.groupe = 0; }

  pos_modifier(type, {x: cent.x, y: cent.y}, false, activeGlo.groupe);

  let k = activeGlo.params.ellipse_x / activeGlo.params.ellipse_y;
  let r = canvas.height * activeGlo.params.circle_size;
  let step = parseFloat(two_pi / activeGlo.params.nb_modifiers);
  let nb_circles = activeGlo.params.nb_circles;
  for(let i = 1; i <= nb_circles; i++){
    pt = {x: cent.x, y: cent.y + r*(i/nb_circles)};
    if(rot != 0){ pt = rotate(pt, cent, rot, k); }
    if(activeGlo.staggered && i > 1 && i%2 == 0){ pt = rotate(pt, cent, step/2, k); }
    if(activeGlo.params.nb_modifiers%2==0){ n++; }
    activeGlo.groupe++;
    for(let j = step; j <= two_pi+0.0001; j+=step){
      pt = rotate(pt, cent, step, k);

      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: pt.x, y: pt.y}, invAtt, activeGlo.groupe);
      n++;
    }
  }
}
//------------------ POS POLYGONE(S) MODIFIERS ----------------- //
function posPolyModifiers(cent = false, type = activeGlo.pos_modifiers, nb = activeGlo.params.nb_modifiers, inv = activeGlo.invModifiersAtt,
  rot = activeGlo.params.rotCircleModifiers, nbEdges = activeGlo.params.posModsNbEdges){
  let n = 0;
  let invAtt = inv;
  if(!cent){
    cent = !activeGlo.defineCenter ? defineCenter(false) :
    activeGlo.center ? activeGlo.center : canvas.getCenter();
  }

  if(!activeGlo.groupe){ activeGlo.groupe = 0; }

  let r = canvas.height * activeGlo.params.circle_size;
  let nb_circles = activeGlo.params.nb_circles;

  for(let i = 1; i <= nb_circles; i++){
    activeGlo.groupe++;
    let mod = {type: type, inv: invAtt, groupe: activeGlo.groupe};
    pointsStar(cent, nbEdges, nb, r*(i/nb_circles), 0, cent, mod);
  }
}
//------------------ POS SQUARE MODIFIERS ----------------- //
function posSquareModifiers(cent = false, type = activeGlo.pos_modifiers, inv = activeGlo.invModifiersAtt, rot = activeGlo.params.rotCircleModifiers){
  let x, y, pt, n = 0;
  let invAtt = inv;
  if(!cent){
    cent = !activeGlo.defineCenter ? defineCenter(false) :
    activeGlo.center ? activeGlo.center : canvas.getCenter();
}

  if(!activeGlo.groupe){ activeGlo.groupe = 0; }

  let form_size = canvas.height * activeGlo.params.circle_size * 2;
  nb_mods       = parseInt(sqr(activeGlo.params.nb_modifiers));
  step          = parseFloat(form_size / nb_mods);

  x = cent.x - form_size/2 + step/2;
  for(let i = 1; i <= nb_mods; i++){
    y = cent.y - form_size/2 + step/2;
    if(nb_mods%2==0){ n++; }
    activeGlo.groupe++;
    for(let j = 1; j <= nb_mods; j++){
      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: x, y: y}, invAtt, activeGlo.groupe);
      y+=step;
      n++;
    }
    x+=step;
  }
}
//------------------ POS RECTANGLE MODIFIERS ----------------- //
function posRectModifiers(cent = false, type = activeGlo.pos_modifiers, inv = activeGlo.invModifiersAtt, rot = activeGlo.params.rotCircleModifiers){
  let x, y, pt, n = 0;
  let invAtt = inv;
  if(!cent){
    cent = !activeGlo.defineCenter ? defineCenter(false) :
    activeGlo.center ? activeGlo.center : canvas.getCenter();
  }

  if(!activeGlo.groupe){ activeGlo.groupe = 0; }

  let form_size_w = canvas.width  * activeGlo.params.circle_size * 2;
  let form_size_h = canvas.height * activeGlo.params.circle_size * 2;
  nb_mods         = parseInt(sqr(activeGlo.params.nb_modifiers));
  step_x          = parseFloat(form_size_w / nb_mods);
  step_y          = parseFloat(form_size_h / nb_mods);

  x = cent.x - form_size_w/2 + step_x/2;
  for(let i = 1; i <= nb_mods; i++){
    y = cent.y - form_size_h/2 + step_y/2;
    if(nb_mods%2==0){ n++; }
    activeGlo.groupe++;
    for(let j = 1; j <= nb_mods; j++){
      if(inv){ invAtt = n%2 == 0 ? true : false; }
      pos_modifier(type, {x: x, y: y}, invAtt, activeGlo.groupe);
      y+=step_y;
      n++;
    }
    x+=step_x;
  }
}
/**
 * @description Paste the selected modifiers
 * @returns {void}
 */
function pasteModifiers(){
  if(activeGlo.modifiers.length > 0){
    let topLeftMod = findTopLeftModifiers();
    let dec        = {x: mouse.x - topLeftMod.x, y: mouse.y - topLeftMod.y};

    if(activeGlo.grid.draw){
      let modZero                  = activeGlo.modifiers[0];
      let indTopLeftMod            = activeGlo.modifiers.indexOf(topLeftMod);
      activeGlo.modifiers[0]             = topLeftMod;
      activeGlo.modifiers[indTopLeftMod] = modZero;
    }

    activeGlo.groupe++;

    getSelectedModifiers().forEach((mod, i) => {
      let pos = {x: mod.x + dec.x, y: mod.y + dec.y};

      if(i == 0 && (activeGlo.grid.draw)){
        let posDec = posOnGrid(pos, activeGlo.gridType);
        dec = {x: dec.x + (posDec.x - pos.x), y: dec.y + (posDec.y - pos.y)};
        pos = posDec;
      }

      let newMod = deepCopy(mod, 'modifiers');

      newMod.x      = pos.x;
      newMod.y      = pos.y;
      newMod.select = false;

      let center = mod.center ? mod.center : getCenter();
      newMod.center = point(center.x + dec.x, center.y + dec.y);

      activeGlo.modifiers.push(newMod);
    });
  }
}

function diffParamsModsGloParams(){
  let diffColor = 'blue';

  getSelectedModifiers().forEach(mod => {
    for(let propParams in activeGlo.params){
      for(let propModParams in mod.params){
        if(propParams == propModParams){
          if(activeGlo.params[propParams] != mod.params[propModParams]){
            let $propParamsLabel = document.querySelector('[for="' + propParams + '"]');
            if($propParamsLabel.style.color != diffColor){
              $propParamsLabel.style.color = diffColor;
              getById(propParams).value    = mod.params[propModParams];
              updLabel(updLabel(getById('tint_color')));
            }
            else{

            }
          }
        }
      }
    }
  });
}

/**
 * @description Find the more top left modifier
 * @returns {void}
 */
function findTopLeftModifiers(){
  if(activeGlo.modifiers.length == 0){ return false; }

  return getSelectedModifiers().reduce((prev, curr) => {
    return h(prev.x, prev.y) < h(curr.x, curr.y) ? prev : curr;
  });
}
//------------------ ROTATE MODIFIERS ----------------- //
function rotate_modifiers(rotAngle = -999){
  let angle  = rotAngle == -999 ? activeGlo.params.modifiers_angle / 100 : rotAngle;
  let center = !activeGlo.center ? canvas.getCenter() : activeGlo.center;
  getSelectedModifiers().forEach((mod) => {
    if(activeGlo.grid.draw && activeGlo.gridType == 'circle'){
      let angle = abs(activeGlo.params.modifiers_angle);
      let sign  = Math.sign(activeGlo.params.modifiers_angle);
      let ang   = Math.round(angle / rad) < 100 ? Math.round(angle / rad) : 100;
      let speed = 101 - ang;
      if(activeGlo.nb_moves%speed==0){
        angle = two_pi / (activeGlo.params.circleGridStep * 4);
        let coords = rotate({x: mod.x, y: mod.y}, center, angle*sign);
        mod.x = coords.x;
        mod.y = coords.y;
        let pos = posOnGrid({x: mod.x, y: mod.y}, 'circle');
        mod.x = pos.x;
        mod.y = pos.y;
      }
    }
    else{
      let coords = rotate({x: mod.x, y: mod.y}, center, angle);
      mod.x = coords.x;
      mod.y = coords.y;
    }
  });
}
//------------------ ROTATE MODIFIERS ----------------- //
function translateModifiers(x, y){
  getSelectedModifiers().forEach(mod => {
    mod.x += x;
    mod.y += y;
  });
  //if(activeGlo.grid.draw){ putModsOnGrid(); }
}
//------------------ ROTATE MODIFIERS ----------------- //
function getSelectedModifiers(allForZero = true){
  let selectedMods = activeGlo.modifiers.filter(mod => mod.select);
  if(selectedMods.length > 0){ return selectedMods; }
  return allForZero ? activeGlo.modifiers : [];
}
//------------------ TURN MODIFIERS ----------------- //
function turnModifiers(ctrl){
  let modNum = ctrl.value;
  getSelectedModifiers().forEach((mod) => {
    mod.type = activeGlo.modifierTypes[modNum];
    mod.double = mod.type != 'magnetor' ? false : true;
    mod.modify = makeModifierFunction(activeGlo.modifierTypes[modNum]);
  });
  if(!activeGlo.modifiers.some(mod => mod.type == 'magnetor' || mod.type == 'mimagnetor' || mod.double)){ activeGlo.magnetors = false; }
  else{ activeGlo.magnetors = true; }
}
//------------------ UPD FORMULE MODIFIERS ----------------- //
function updFormuleModifiers(ctrl, coordType){
  let formule = ctrl.value;

  let result = testFormule(formule);
  if(result != 'nok' && !isNaN(result)){
    getSelectedModifiers().forEach((mod) => {
      if(!mod.formule){ mod.formule = {}; }
      mod.formule[coordType] = formule;
    });
  }
}

//------------------ SELECT MODIFIER ----------------- //
function modifier_select(byMouse = true, ctrl = null){
  if(byMouse){
    let nearestModToMouse = getModNearestMouse(10);

    if(nearestModToMouse){
      if(!activeGlo.modifierSelect.byGroup){
        nearestModToMouse.select = !nearestModToMouse.select;
        //changeParamsByMod(nearestModToMouse);
      }
      else{
        activeGlo.modifiers.forEach(mod => {
          if(mod.groupe == nearestModToMouse.groupe){ mod.select = !mod.select; }
        });
      }
    }
  }
  else{
    if(ctrl.value == 0){ activeGlo.modifiers.forEach(mod => { mod.select = false; }); }
    else{
      activeGlo.modifiers.forEach(mod => {
        if(mod.type == activeGlo.selModsByType[ctrl.value]){ mod.select = true; }
        else{ mod.select = false; }
      });
    }
  }
}
/**
 * @description Set params interface accord to the mod @param
 * @param  {modifier} mod
 * @return {void}
 */
function changeParamsByMod(mod){
  if(isOneModSelected()){
    if(!mod.saveParams){ mod.saveParams = deepCopy(activeGlo.params); }
    params_interface(false, mod.params);
  }
  else{
    params_interface(false, mod.saveParams);
    delete mod.saveParams;
  }
}

/**
 * @description Return true if only one modifier is selected
 * @return {Boolean}
 */
function isOneModSelected(){
  return getSelectedModifiers(false).length === 1;
}

function modsSelected(){
  return getSelectedModifiers(false).length;
}

//------------------ CHANGE L'ÉCHELLE DES MODIFIEURS ----------------- //
function scale_modifiers(sign, div = 10){
  let center = { x: canvas.width / 2, y: canvas.height / 2 };
  let mods = getSelectedModifiers();
  if(sign == '+'){
    mods.forEach(mod => {
      mod.x -= (center.x - mod.x)/div;
      mod.y -= (center.y - mod.y)/div;
    });
  }
  else{
    mods.forEach(mod => {
      mod.x += (center.x - mod.x)/div;
      mod.y += (center.y - mod.y)/div;
    });
  }
}

//------------------ VIEW ATTRACTORS ----------------- //
function view_modifiers(arr = activeGlo.modifiers){
  arr.forEach(mod => {
    let g_mod = mod.attract;
    let sel   = mod.select;

    if(g_mod > 255 || mod.attract < -255){ g_mod = 255; }
    else if((g_mod < 50 && g_mod > 0) || (g_mod > -50 && g_mod < 0)){ g_mod = 50; }
    else if(g_mod < 0){ g_mod = -g_mod; }
    let col  = 255 - g_mod;
    let col2 = col;
    if(mod.attract < 0){ col2 = col + 50; }

    let angle = mod.type == 'director' ? mod.dir_angle : 0;
    if(mod.type == 'magnetor' || mod.type == 'mimagnetor'){ angle = mod.magnetAngle; }

    if(mod.type != 'spiralor'){
      drawLogo(mod, 'rgb(' + col + ',' + col2 + ',' + col + ',1)', angle);
    }
    else{
      drawLogo(mod, 'rgb(' + col + ',' + col2 + ',' + col + ',1)', angle);
      drawLogo(mod, 'rgb(' + col + ',' + col2 + ',' + col + ',1)', angle);
  }
  });
}

//------------------ SHOW MODIFIERS INFOS ----------------- //
function showModsInfos(){
  let canvasBg = canvas.style.backgroundColor;
  if(canvasBg != ""){
    ctxStructure.fillStyle = fillStyleAccordToBg(canvas, ctxStructure);
  }
  else{
    ctxStructure.fillStyle = "#223351";
  }

  ctxStructure.font = "16px Comic Sans MS";


  function putTxt(txt){ txts.push(txt); pos_y+=esp; }

  let pos_x = 20;
  let pos_y = !activeGlo.uiDisplay ? 30 : 30 + interfaces.find(int => int.clientHeight != 0).clientHeight;
  let esp   = 30;
  let txts  = [];

  for(let p in activeGlo.onModsInfo.mod){
    if(typeof activeGlo.onModsInfo.mod[p] != 'object'){ putTxt({txt: p + " : " + activeGlo.onModsInfo.mod[p], pos_y: pos_y}); }
  }

  txts.map(txt => ctxStructure.fillText(txt.txt, pos_x, txt.pos_y));
}

//------------------ MODS COLOR PICKER COLOR UPD AVATARS & MODS COLOR ----------------- //
function modifiersColor_upd(ctrl) {
  let col = hexToHSL(ctrl.value);
  getSelectedModifiers().forEach(mod => {
    mod.color = col;
    mod.tint  = col.l;
    mod.sat   = col.s;
  });
}

function switchModifiersVisibility(){
  activeGlo.view_modifiers = !activeGlo.view_modifiers;
  document.getElementById('switchModifiersVisibilityIcon').textContent = !activeGlo.view_modifiers ? '👁‍🗨' : '👁';
}

function deleteAllModifiers(){
  let modsSz = activeGlo.modifiers.length;
  activeGlo.modifiers = activeGlo.modifiers.filter(mod => !mod.select);
  if(modsSz == activeGlo.modifiers.length){ activeGlo.modifiers = []; }
  avatars.forEach(av => { av.nearMod = {}; av.distMinModifiers = 9999; });
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
}

function posModsOnMods(){
  getSelectedModifiers().forEach(mod => {
    let newMod     = deepCopy(mod, 'modifiers');
    newMod.type    = activeGlo.pos_modifiers;
    newMod.nbEdges = activeGlo.params.posModsNbEdges;
    newMod.modify  = makeModifierFunction(newMod.type);

    activeGlo.modifiers.push(newMod);
  });
}

function infosModifiers(isSorted = false, dir = 'asc'){
  let infosMods = [];
  let propsInMods = infosArr(activeGlo.modifiers[0]).map(p => p.prop);

  if(propsInMods){
    activeGlo.modifiers.forEach(mod => { infosMods.push(infosArr(mod, propsInMods)); });
    if(isSorted){ sortInfosArray(infosMods, isSorted, dir); }
    return {infosMods, propsInMods};
  }
  return false;
}

function checkColorFunctions(e){
  activeGlo.colorFunctions[e.target.id] = !activeGlo.colorFunctions[e.target.id];

  let checked = 0;
  [...document.getElementsByClassName('inputCheckColorBox')].forEach(inp => {
    if(inp.checked){ checked++; }
  });

  if(checked > 1){ activeGlo.colorCumul = true; }
  else{ activeGlo.colorCumul = false; }

  getSelectedModifiers().forEach(mod => { mod.glo.colorCumul = activeGlo.colorCumul; mod.glo.colorFunctions[e.target.id] = activeGlo.colorFunctions[e.target.id]; });
}

function radius_attract(){
  activeGlo.lim_dist = pow(pow(canvas.width, 2) + pow(canvas.height, 2), 0.5) / (256 / activeGlo.params.radius_attract);
  getSelectedModifiers().forEach(mod => { mod.glo.lim_dist = activeGlo.lim_dist; });
}

radius_attract();