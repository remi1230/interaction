//------------------ CLASSE POUR INSTANCIER CHAQUE ÉLÉMENT DE DESSIN----------------- //
/**
 * @description Creates a new Avatar
 */
class Avatar {

  constructor(options = {}){
    this.x            = options.x;
    this.y            = options.y;
    this.z            = 0;
    this.vx           = 0;
    this.vy           = 0;
    this.speed        = 0;
    this.ax           = 0;
    this.ay           = 0;
    this.grow         = 0;
    this.growLine     = 0;
    this.dist_moy     = 1;
    this.size         = options.size;
    this.sizeCalc     = {s: options.size, x: options.size, y: options.size};
    this.fillStyle    = options.fillStyle;
    this.strokeStyle  = options.fillStyle;
    this.hsl          = {h: 0, s: 0, l: 0, a: 1, p: 1};
    this.form         = activeGlo.form;
    this.colorMod     = activeGlo.modifiersColor;
    this.it           = num_avatar;
    this.id           = num_avatar;
    this.n_avatars    = avatars.length;
    this.lasts        = [];
    this.lastsSm      = [];
    this.multi        = [];
    this.nears        = [];
    this.numsMod      = [];
    this.nearMod      = {};
    this.draw         = true;
    this.goToNearMod  = true;

    this.distMinModifiers = 9999;

    if(options.center){ this.center = options.center; }
    if(options.virtual){ this.virtual = options.virtual; }

    avatars.push(this);

    num_avatar++;
  }

  lim_x(){ let dec = activeGlo.far_rebound ? this.size * 2 : 0; return canvas.width - this.size + dec; }
  lim_y(){ let dec = activeGlo.far_rebound ? this.size * 2 : 0; return canvas.height - this.size + dec; }

  direct(angle, dist){
    return {
      x:  cos(angle) * dist,
      y:  sin(angle) * dist
    };
  }

  gloDir(){
    let angle, force;
    if(this.nearMod.params){
      angle = this.nearMod.params.dirAngle;
      force = this.nearMod.params.dirForce;
    }
    else{
      angle = activeGlo.params.dirAngle;
      force = activeGlo.params.dirForce;
    }

    force /= 10;

    let dec  = this.direct(angle, force);

    this.modifiersValues.x += dec.x;
    this.modifiersValues.y += dec.y;
  }

  gloAttract(){
    let force;
    if(this.nearMod.params){
      force = this.nearMod.params.attractForce;
    }
    else{
      force = activeGlo.params.attractForce;
    }

    let center = {x: canvas.width/2, y: canvas.height/2};

    let angle = atan2piZ(center.x - this.x, center.y - this.y);

    force /= 10;

    let dec  = this.direct(angle, force);

    this.modifiersValues.x += dec.x;
    this.modifiersValues.y += dec.y;
  }

  vit(){
    let vx = this.x - this.last_x;
    let vy = this.y - this.last_y;
    let v  = pow(pow(vx,2) + pow(vy,2), 0.5);

    return {x: vx, y: vy, v: v};
  }

  sizeIt(obj = this.nearMod.num_modifier ? this.nearMod.glo : activeGlo){
    let size, size_x, size_y;

    ctx.lineWidth = obj.params.line_size;

    if(obj.growDecrease){
      if(zeroOneCycle(this.it, obj.params.growDecrease)){
        this.grow     += obj.params.growDecreaseCoeff;
        this.growLine += obj.params.growLineDecreaseCoeff*obj.params.growDecreaseCoeff;
      }
      else if(obj.size - obj.params.growDecreaseCoeff >= 0) {
        this.grow     -= obj.params.growDecreaseCoeff;
        this.growLine -= obj.params.growLineDecreaseCoeff*obj.params.growDecreaseCoeff;
      }
      ctx.lineWidth = obj.params.line_size + this.growLine;
    }

    let lim_line = obj.params.lim_line;
    if(!obj.var_size){
      size   = obj.size + this.grow;
      if(size <= 0){ size = 0.1; }
      size_x = size;
      size_y = size;
    }
    else{
      let vit = this.vit();
      size   = pow(pow(vit.x,2) + pow(vit.y,2), 0.5) * obj.size;
      size_x = abs(vit.x) * obj.size;
      size_y = abs(vit.y) * obj.size;

      size   = size < lim_line ? size : lim_line;
      size_x = size_x < lim_line ? size_x : lim_line;
      size_y = size_y < lim_line ? size_y : lim_line;
    }

    let coeff = 1, coeffLn = 1;
    if(obj.dimSizeCenter){
      coeff = this.coeffSizeCenter();

      size   *= coeff;
      size_x *= coeff;
      size_y *= coeff;
    }
    if(obj.params.distNearDrawMods){
      coeffLn = this.coeffSizeMinMod();

      size   *= coeffLn;
      size_x *= coeffLn;
      size_y *= coeffLn;
    }

    if(obj.sizeDirCoeff && this.lasts[this.lasts.length - 2]){ size *= this.dirSizeCoeff; }

    /*if(obj.growDecrease){
      if(zeroOneCycle(this.it, obj.params.growDecrease)){
        obj.params.line_size += obj.params.growLineDecreaseCoeff*obj.params.growDecreaseCoeff;
      }
      else if(ctx.lineWidth - obj.params.growDecreaseCoeff >= 0){
        obj.params.line_size -= obj.params.growLineDecreaseCoeff*obj.params.growDecreaseCoeff;
      }
      ctx.lineWidth = obj.params.line_size;
    }*/

    if(obj.perm_var_size){
      let lvs = obj.params.level_var_size;
      if(rnd() > 0.5){
        size = size * (1+rnd()) * lvs;
        ctx.lineWidth = ctx.lineWidth * (1+rnd()) * obj.params.level_var_size;
      }
      else{
        size = size / (1+rnd()) / lvs;
        ctx.lineWidth = ctx.lineWidth / (1+rnd()) / obj.params.level_var_size;
      }
    }

    ctx.lineWidth    *= coeff * coeffLn;
    this.sizeCalc     = {s: size, x: size_x, y: size_y};
    this.nearMod.size = size;
  }

  draw_avatar(form = this.nearMod.glo ? this.nearMod.glo.form : activeGlo.form, objGlo = this.nearMod.glo ? this.nearMod.glo : activeGlo){
    let size   = this.sizeCalc.s;
    let size_x = this.sizeCalc.x;
    let size_y = this.sizeCalc.y;

    let x = this.x, y = this.y;

    if(objGlo.doubleAvatar){
      let dir = this.direction;
      let dec = direction(dir + half_pi, objGlo.params.dblAvDist);
      x -= dec.x;
      y -= dec.y;
    }

    let addAngle = 0;
    ctx.beginPath();
    switch(form){
      case 'circle':
        if(objGlo.params.arcRotAngle > 0){
          addAngle = cyclicNumber(-0.1 * objGlo.nb_moves * objGlo.params.arcRotAngle, objGlo.params.arcEndAngle - objGlo.params.arcStartAngle - rad);
        }
        ctx.arc(x, y, size, objGlo.params.arcStartAngle + addAngle, objGlo.params.arcEndAngle);
        break;
      case 'ellipse':
        let oval_size = objGlo.params.oval_size;
        let sx = !objGlo.sameSizeEllipse ? (1+size) * (1 + this.speed*oval_size) : (1+size) * (1 + oval_size);
        let sy = !objGlo.sameSizeEllipse ? 1+size*oval_size : size * oval_size;

        this.sizeCalc.x = sx;
        this.sizeCalc.y = sy;

        let dir = this.direction;
        if(!objGlo.rotateBrush){ dir = 0; }

        if(objGlo.params.arcRotAngle > 0){
          addAngle = cyclicNumber(-0.1 * this.it * objGlo.params.arcRotAngle, objGlo.params.arcEndAngle - objGlo.params.arcStartAngle - rad);
        }
        ctx.ellipse(x, y, sx, sy, dir, objGlo.params.arcStartAngle + addAngle, objGlo.params.arcEndAngle);
        break;
      case 'square':
        ctx.rect(x, y, size_x, size_y);
        break;
      case 'poly':
        ctx.polygone({pos: {x: x, y: y}, size: size, nb_edges: objGlo.params.nb_edges, color: this.fillStyle});
        break;
      case 'cloud':
        ctx.cloud({pos: {x: x, y: y}, size: size, nb_points: objGlo.params.nb_points_cloud,
                   sz_point: objGlo.params.sz_points_cloud, withLine: objGlo.withLine, color: this.fillStyle});
        break;
      case 'alea_form':
        ctx.alea_form({pos: {x: x, y: y}, size: size, nb_edges: objGlo.params.nb_edges, color: this.fillStyle});
        break;
      case 'line':
      case 'bezier':
        let last = this.lasts[this.lasts.length - 1];
        if(objGlo.secondMove && this.lasts[this.lasts.length - 2]){ last = this.lasts[this.lasts.length - 2]; }
        let last_x = last.x;
        let last_y = last.y;
        let dx     = x - last_x;
        let dy     = y - last_y;
        let dist   = pow(pow(dx, 2) + pow(dy, 2), 0.5);

        if(objGlo.doubleAvatar){
          let dir = this.direction;
          let dec = direction(dir + half_pi, objGlo.params.dblAvDist);

          if(objGlo.sizeDirCoeff && this.lasts[this.lasts.length - 2]){ dec.x *= this.dirSizeCoeff; dec.y *= this.dirSizeCoeff; }

          last_x -= dec.x;
          last_y -= dec.y;
        }

        if(!objGlo.noLimLine){
          last_x = dist < objGlo.params.lim_line ? last_x : last_x + dx/objGlo.params.div_line;
          last_y = dist < objGlo.params.lim_line ? last_y : last_y + dy/objGlo.params.div_line;
        }

        if(objGlo.dash > 0){ ctx.setLineDash([objGlo.dash, objGlo.dash]); }

        ctx.lineCap     = objGlo.lineCap[objGlo.numLineCap%3];
        ctx.fillStyle   = this.fillStyle;
        ctx.strokeStyle = this.fillStyle;

        if(form == 'line'){
          ctx.moveTo(last_x, last_y);
          ctx.lineTo(x, y);
        }
        else{
          let ln = redimLine({x: last_x, y: last_y}, {x: x, y: y}, 10);
          ctx.bezier(ln.startPt, ln.endPt);
        }

        break;
      case 'cross':
        ctx.crossDiag({x: x, y: y}, size);
        break;
      case 'brush':
        if((pointsBrush[0] && pointsBrush[0].length) || pointsBrushToLine[0]){
          let ptsB     = pointsBrush[0] && pointsBrush[0].length ? pointsBrush : pointsBrushToLine;
          let ptsBSave = ptsB.slice();

          if(objGlo.rotateBrush){
            ptsB = [];
            if(pointsBrush[0] && pointsBrush[0].length){
              ptsBSave.forEach((ptsBrush, i) => {
                ptsB[i] = [];
                ptsBrush.forEach(ptBrush => {
                  ptsB[i].push(rotate(ptBrush, {x: 0, y: 0}, this.direction ));
                });
              });
            }
            else{
              ptsB    = [];
              ptsB[0] = [];
              ptsBSave.forEach((ptBrush, i) => {
                ptsB[0].push(rotate(ptBrush, {x: 0, y: 0}, this.direction ));
              });
            }
          }
          else{
            if(!pointsBrushToLine[0]){ ptsB = ptsBSave; }
            else{ ptsB = []; ptsB[0] = ptsBSave; }
          }

          if(activeGlo.params.formVarLevel){
            let formVarLevel = activeGlo.params.formVarLevel / 10;
              ptsB.forEach((ptsBrush, i) => {
                ptsBrush.forEach((pt, j) => {
                  ptsB[i][j] = {x: ptsB[i][j].x + rnd_sign() * formVarLevel, y: ptsB[i][j].y + rnd_sign() * formVarLevel};
                });
              });
          }
          
          ctx.brush({x: x, y: y}, size, ptsB);
        }
        break;
    }

    var stroke = objGlo.stroke;
    if(objGlo.alea_stroke){ stroke = rnd() < 0.5 ? true : false; }
    if(objGlo.strokeAndFill){
      //if(objGlo.perm_var_size || objGlo.growDecrease){ ctx.lineWidth = objGlo.sizeLineSave; }
      ctx.strokeStyle = this.strokeStyle;
      ctx.fillStyle   = this.fillStyle;
      ctx.stroke();
      ctx.fill();
    }
    else if(!stroke && form != 'line' && form != 'cross' && form != 'bezier'){
      ctx.fillStyle = this.fillStyle;
      ctx.fill();
    }
    else{
      ctx.strokeStyle = this.strokeStyle;
      ctx.stroke();
    }

    if(objGlo.tail && this.draw && !this.lapWithoutDraw){ this.drawTail(); }

    if(objGlo.doubleAvatar){
      objGlo.doubleAvatar = false;
      let posSave  = {x: this.x, y: this.y};
      let lastSave = {x: this.lasts[this.lasts.length - 1].x, y: this.lasts[this.lasts.length - 1].y};
      let dir      = this.direction;
      let dec      = direction(dir + half_pi, objGlo.params.dblAvDist);

      if(objGlo.sizeDirCoeff && this.lasts[this.lasts.length - 2]){ dec.x *= this.dirSizeCoeff; dec.y *= this.dirSizeCoeff; }

      this.x += dec.x;
      this.y += dec.y;
      this.lasts[this.lasts.length - 1].x += dec.x;
      this.lasts[this.lasts.length - 1].y += dec.y;

      this.draw_avatar();

      this.x = posSave.x;
      this.y = posSave.y;
      this.lasts[this.lasts.length - 1].x = lastSave.x;
      this.lasts[this.lasts.length - 1].y = lastSave.y;

      objGlo.doubleAvatar = true;
    }
  }

  limSpeedMax(v = this.modifiersValues, lim = this.nearMod.params ? this.nearMod.params.limSpeedMax : activeGlo.params.limSpeedMax){
    if(lim > 0){
      let d = h(v.x, v.y);
      if(d > lim){
        let lim_d = lim/d;

        v.x *= lim_d;
        v.y *= lim_d;
      }
    }
  }
  limSpeedMin(v = this.modifiersValues, lim = this.nearMod.params ? this.nearMod.params.limSpeedMin : activeGlo.params.limSpeedMin){
    if(lim > 0){
      let d = h(v.x, v.y);
      if(d < lim){
        let lim_d = lim/d;
        
        v.x *= lim_d;
        v.y *= lim_d;
      }
    }
  }
  limSpeedBySize(v = this.modifiersValues, lim = this.sizeCalc.x * 2){
      let d     = h(v.x, v.y);
      let lim_d = lim/d;

      v.x *= lim_d;
      v.y *= lim_d;
  }

  drawTail(){
    let lastsSz = this.lasts.length;
    let tailDec = -activeGlo.params.tailDec;

    let dec = {x: 0, y: 0};
    
    if((this.nearMod.glo && this.nearMod.glo.form === 'ellipse') || activeGlo.form === 'ellipse'){
      dec = {x: tailDec * this.sizeCalc.x * cos(this.direction), y: tailDec * this.sizeCalc.x * sin(this.direction)}; 
    }

    if(lastsSz){
      ctx.beginPath();
      ctx.strokeStyle = this.fillStyle;
      for(let i = 0; i < lastsSz; i++){
        ctx.lineTo(this.lasts[i].x + dec.x, this.lasts[i].y + dec.y);
      }
      ctx.stroke();
    }
  }

  secondMove(){
    if(this.secondMovePos){
      this.lastSm = {x: this.secondMovePos.x, y: this.secondMovePos.y};
      this.lastsSm.push(this.lastSm);
      if(this.lastsSm.length > activeGlo.params.tail_memory){ this.lastsSm.shift(); }
    }
    else{
      this.lastSm = {x: this.x, y: this.y};
      this.lastsSm.push(this.lastSm);
    }

    let d              = cos(this.it * activeGlo.params.secondMoveIt * rad) * activeGlo.params.secondMoveRange;
    let dir            = direction(this.direction + half_pi, d);
    this.secondMovePos = {x: this.x + dir.x, y: this.y + dir.y};
  }

  nearMouse(dist){
    if(this.x < mouse.x + dist && this.x > mouse.x - dist && this.y < mouse.y + dist && this.y > mouse.y - dist){ return h(this.x - mouse.x, this.y - mouse.y); }

    return false;
  }

  coeffDirSize(){
    this.speedDir();
    this.dirSizeCoeff = pow(pow(1 - this.dirSpeed/two_pi, activeGlo.params.sizeDirCoeff), abs(activeGlo.params.sizeDirCoeff));
  }

  speedDir(){
    if(!this.direction){ this.dir(); }
    let dirAv = atan2piZ(this.x - this.lasts[this.lasts.length - 2].x, this.y - this.lasts[this.lasts.length - 2].y);
    this.dirSpeed = abs(this.direction - dirAv);
  }

  coeffSizeCenter(){
    let center = !this.center ? {x: canvas.width/2, y: canvas.height/2} : this.center;
    let dist_to_center = this.dist_to_center(center) + 1;
    let h = canvas.height/2;

    let k     = activeGlo.params.coeffDimSizeCenter;
    let coeff = dist_to_center/h;

    return pow(coeff,k);
  }

  coeffSizeMinMod(){
    let coeff = 1;

    //this.distMinMods();

    if(this.distMinModifiers < activeGlo.params.distNearDrawMods){
      coeff = this.distMinModifiers / activeGlo.params.distNearDrawMods;
    }
    return coeff;
  }

  nearAvatars(){
    this.nears = []; let lim = activeGlo.lim_dist;
    for(let i = 0; i < avatars.length; i++){
      if(this.dist_av(avatars[i]) <= lim && avatars[i] != this){ this.nears.push(avatars[i]); }
    }
  }

  collidBorder(){
    let x = this.x;
    let y = this.y;
    let size  = activeGlo.far_rebound ? -this.size*2 : this.size;

    var is_inv = false;

    let lim_x = this.lim_x();
    let lim_y = this.lim_y();

    if(x < size){ x = size; this.invDir(); is_inv = true; }
    else if(x > lim_x){ x = lim_x; this.invDir(); is_inv = true; }
    if(y < size){ y = size; if(!is_inv){ this.invDir(false); } }
    else if(y > lim_y){ y = lim_y; if(!is_inv){ this.invDir(false); } }

    if(x > lim_x && y > lim_y){ x = lim_x - this.size; y = lim_y - this.size; }

    this.x = x;
    this.y = y;
  }

  invDir(axe_x = true){
    if(!activeGlo.normalCollid){
      this.vx = -this.vx;
      this.vy = -this.vy;
    }
    else{
      if(axe_x){ this.vx = -this.vx; }
      else{ this.vy = -this.vy; }
    }
  }

  distMinMods(...args){
    this.distMinModifiers = 9999;
    if(args.length == 0){
      let modifiersSz = activeGlo.modifiers.length;
      for(let i = 0; i < modifiersSz; i++){
        let mod  = activeGlo.modifiers[i];
        let dist = pow(pow(this.x - mod.x, 2) + pow(this.y - mod.y, 2), 0.5);
        if(dist < this.distMinModifiers){ this.distMinModifiers = dist; this.nearMod = mod; }
      }
    }
    else{
      args.map(arg =>{
        activeGlo.modifiers.filter(mod => mod.type == arg).map(mod => {
          let dist = pow(pow(this.x - mod.x, 2) + pow(this.y - mod.y, 2), 0.5);
          if(dist < this.distMinModifiers){ this.distMinModifiers = dist; this.nearMod = mod; }
        });
      });
    }
    return this.distMinModifiers;
  }

  secondNearMod(){
    let nearMod, nearModSecond;
    let distMinModifiers = 9999;
    let modifiersSz = activeGlo.modifiers.length;
    for(let i = 0; i < modifiersSz; i++){
      let mod  = activeGlo.modifiers[i];
      let dist = h(this.x - mod.x, this.y - mod.y);
      if(dist < distMinModifiers){ distMinModifiers = dist; nearMod = mod; }
    }
    distMinModifiers = 9999;
    for(let i = 0; i < modifiersSz; i++){
      let mod  = activeGlo.modifiers[i];
      let dist = h(this.x - mod.x, this.y - mod.y);
      if(dist < distMinModifiers && mod != nearMod){ distMinModifiers = dist; nearModSecond = mod; }
    }

    return {secondNearMod: nearModSecond, secondDistMinModifiers: distMinModifiers};
  }

  interaction(obj = !activeGlo.hyperAlea ? activeGlo : this.glo){
    let attract        = obj.params.attract/100;
    let lim_attract    = obj.params.lim_attract;
    let same_dir       = obj.params.same_dir;
    let out_dir        = obj.params.out_dir;
    let out_force      = obj.params.out_force;
    let dep_dir        = obj.params.dep_dir;
    let brake_pow      = obj.params.brake_pow;
    let chaos_lim      = obj.params.chaos_dist;
    let chaos_force    = obj.params.chaos_force;
    let follow_force_x = obj.params.follow_force_x;
    let follow_force_y = obj.params.follow_force_y;
    let alea_attract   = activeGlo.alea_attract;
    let inv_g          = obj.inverse_g ? -1 : 1;
    let dist_mean      = obj.dist_mean;
    let dist_moy       = activeGlo.dist_moy;
    let dist_mean_inv  = obj.dist_mean_inv;
    let dist_mean_one  = obj.dist_mean_one;
    let is_chaos       = obj.chaos;
    let breakAdd       = obj.params.breakAdd;

    if(activeGlo.alea_inv_g){ inv_g = activeGlo.nb_moves%dep_dir == 0 ? -activeGlo.params.inv_g_force : 1; }

    this.ax      = 0;
    this.ay      = 0;
    let nb_nears = 0;
    let att      = attract;

    let avatar, x_avatar, y_avatar, x_av, y_av, dist, lim, brake, siz, vit, x, y;

    for(let i = 0; i < this.nears.length; i++){
      avatar = this.nears[i];
      if(this != avatar){
        x_avatar = avatar.x;
        y_avatar = avatar.y;
        x_av     = this.x;
        y_av     = this.y;
        lim      = (avatar.size + this.size) / 2;

        x = x_avatar - x_av; y = y_avatar - y_av;
        dist = this.dist_av(avatar);
        this.dist += dist;

        if(obj.crossPoints && dist < obj.params.crossPointsLim){
          let arrCol = this.fillStyle.split(',');
          arrCol[0] = arrCol[0].substring(4);
          arrCol.forEach((col,i) => { if(i < 3){arrCol[i] = 255 - parseInt(col);} });

          let strCol = "rgb(" + arrCol[0] + "," + arrCol[1] + "," + arrCol[2] + "," + arrCol[3];

          crossPoints.push({x: x_av, y: y_av, color: strCol});
          if(crossPoints.length > 2048){ crossPoints.shift(); }
        }

        if(dist <= lim*same_dir){
          this.vx += follow_force_x * avatar.vx;
          this.vy += follow_force_y * avatar.vy;
          nb_nears++;
        }
        if(dist >= lim_attract){
          brake = breakAdd + pow(dist, brake_pow);
          if(attract && alea_attract){
            if(!this.signAleaAttract || this.signAleaAttract.nbLaps >= activeGlo.params.aleaAttractLaps){
              this.signAleaAttract = {sign: Math.sign(rnd_sign()), nbLaps: 1, att: rnd()};
            }
            else{
              this.signAleaAttract.nbLaps++;
            }
            att = 10 * attract * this.signAleaAttract.sign * this.signAleaAttract.att;
          }

          siz = this.size;
          vit = !obj.gSpeed ? 1 : avatar.vit().v;

          if(isNaN(vit)){ vit = 1; }

          let outF = 0;
          if(dist <= lim*out_dir){ outF = -out_force * inv_g; }

          if(dist_mean && dist_moy){
            if(!dist_mean_inv && this.dist_moy < dist_moy){ inv_g = -inv_g; }
            else if(dist_mean_inv && this.dist_moy > dist_moy){ inv_g = -inv_g; }
          }
          else if(dist_mean_one && dist_moy){
            if(!dist_mean_inv && this.dist_moy < dist){ inv_g = -inv_g; }
            else if(dist_mean_inv && this.dist_moy > dist){ inv_g = -inv_g; }
          }

          let f    = inv_g*att*(outF + siz+vit*obj.params.gSpeed)/brake;
          let addX = f*x;
          let addY = f*y;

          this.ax += addX;
          this.ay += addY;

          //let modsDevForce = this.nearMod.params ? this.nearMod.params.modsDevForce : activeGlo.params.modsDevForce;
          let modsDevForce = activeGlo.params.modsDevForce;
          modsDevForce = this.n_avatars%2 ? modsDevForce : -modsDevForce;
          if(modsDevForce != '0'){
            //let modsDevDir = this.nearMod.params ? this.nearMod.params.modsDevDir : activeGlo.params.modsDevDir;
            let modsDevDir = activeGlo.params.modsDevDir;

            let dist = h(addX, addY);
            let dir  = atan2piZ(addX, addY);
            let dec  = direction(dir + modsDevDir, dist * modsDevForce);

            this.ax += dec.x;
            this.ay += dec.y;
          }
        }
        if(is_chaos && dist <= lim*chaos_lim){
          let chaos = chaos_force/(1+dist);
          this.ax += chaos*rnd_sign();
          this.ay += chaos*rnd_sign();
        }
      }
    }

    if(nb_nears > 0){
      this.vx /= nb_nears;
      this.vy /= nb_nears;
    }
  }

  moveOnAlea(){
    this.draw    = false;
    this.draw_ok = false;
    this.lasts   = []; 
    this.lastsSm = [];

    let point;
    let size = activeGlo.params.rAleaPos;

    point = getRandomPointInCircle(size, activeGlo.modifiers.length ? 
    activeGlo.randomPointByMod : false, activeGlo.followAvatar, activeGlo.followAvatar ? this.avToFollow : false);
    this.x = point.x;
    this.y = point.y;
  }

  mouse_attract(pause = false){
    let brake_pow = activeGlo.params.brake_pow;
    let mouseG    = activeGlo.params.wheel_force;

    if(activeGlo.attract_center){ mouse.x = canvas.width/2; mouse.y = canvas.height/2; }

    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;

    let brake = 216 + (pow(this.mouse_dist(), brake_pow));
    if(!pause){
      this.ax += dx*mouseG/brake;
      this.ay += dy*mouseG/brake;
    }
    else{
      this.ax = dx*mouseG/brake;
      this.ay = dy*mouseG/brake;
    }
  }

  mouse_rotate(){
    let angle  = activeGlo.params.wheel_force / (this.mouse_dist()**2);

    if(activeGlo.attract_center){ mouse.x = canvas.width/2; mouse.y = canvas.height/2; }

    this.rotate(angle, mouse, {x: 1, y:1});
  }

  mouse_growing(){ this.grow = activeGlo.params.wheel_force/(2+ pow(this.mouse_dist(), 0.7)); }
  mouse_darking(){ this.dark = activeGlo.params.wheel_force/(2+ pow(this.mouse_dist(), 0.7)); }

  mouse_dist(){ return pow(pow(mouse.x - this.x, 2) + pow(mouse.y - this.y, 2), 0.5); }

  trans(dir){
    switch (dir) {
      case 'left':
        this.x-=2;
        break;
      case 'right':
        this.x+=2;
        break;
      case 'up':
        this.y-=2;
        break;
      case 'down':
        this.y+=2;
        break;
    }
  }

  follow(){
    if(activeGlo.style == 0){
      if(this.nears.length > 0){
        let avToFollow;
        if(typeof(this.avToFollow) == 'undefined') {
          this.avToFollow = this.nears[getRandomIntInclusive(0, this.nears.length - 1, true)];
          this.avToFollow.avToFollow = this;
        }
        if(typeof(this.avToFollow) != 'undefined'){
          if(this.avToFollow == this){ this.avToFollow = undefined; this.follow(); }

          this.vx = -this.avToFollow.vx;
          this.vy = -this.avToFollow.vy;
        }
      }
    }
    else{
      let x = this.x, y = this.y;
      let cx = cos(x*rad);
      let cy = cos(y*rad);
      let sx = sin(x*rad);
      let sy = sin(y*rad);

      let cxcy = cx*cy, cxPcy = cx + cy, cxMcy = cx - cy;
      let sxsy = sx*sy, sxPsy = sx + sy, sxMsy = sx - sy;

      let sxPcy = sx+cy > 0.1 ? sx+cy : sx+abs(cy);
      let cxPsy = cx+sy > 0.1 ? cx+sy : abs(cx)+sy;

      let x_val = cy, y_val = cx;

      if(activeGlo.formule.x != 0 && !activeGlo.formule.error.x){
        let form_x = this.eval_formule(activeGlo.formule.x);
        if(!isNaN(form_x)){ x_val = form_x; }
      }
      if(activeGlo.formule.y != 0 && !activeGlo.formule.error.y){
        let form_y = this.eval_formule(activeGlo.formule.y);
        if(!isNaN(form_y)){ y_val = form_y; }
      }

      this.x += x_val;
      this.y += y_val;

      this.x = this.x;
      this.y = this.y;
    }
  }

  orbite(){
    let avToOrbite;
    if(activeGlo.style == 1){
      if(typeof(this.number_orbite) == 'undefined' || typeof(this.nears[this.number_orbite]) == 'undefined') {
        this.number_orbite = getRandomIntInclusive(0, this.nears.length - 1, true);
      }
      avToOrbite = this.nears[this.number_orbite];
    }
    else{
      if(typeof(this.avToOrbite) == 'undefined') {
        this.avToOrbite = this.nears[getRandomIntInclusive(0, this.nears.length - 1, true)];
      }
      avToOrbite = this.avToOrbite;
    }

    if(typeof(avToOrbite) != 'undefined'){
      if(activeGlo.style == 1){ avToOrbite.number_orbite = this.n_avatars; }
      else{ avToOrbite.avToOrbite = this; }
      this.rotate(activeGlo.params.orbite_angle/10, {x: avToOrbite.x, y: avToOrbite.y});
    }
  }

  attractByOne(){
    let avToGo;
    if(this.it%activeGlo.params.keep_dir==0) {
      this.avToGo = this.nears[getRandomIntInclusive(0, this.nears.length - 1, true)];
    }
    avToGo = this.avToGo;

    if(typeof(avToGo) != 'undefined'){
      let dist = this.dist_av(avToGo);
      let x    = avToGo.x - this.x;
      let y    = avToGo.y - this.y;

      let brake = pow(dist, activeGlo.params.brake_pow);

      let k = 100;
      this.ax += k*x/brake;
      this.ay += k*y/brake;
    }
  }

  matrix(pt, mat){
    return { x: pt.x * mat[0][0] + pt.y * mat[0][1], y: pt.x * mat[1][0] + pt.y * mat[1][1] };
  }

  rotate(angle   = activeGlo.params.rotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
         ellipse = {x: activeGlo.params.ellipse_x, y: activeGlo.params.ellipse_y}, spiral = activeGlo.params.spiral_force, modsDev = {force: 0, dir: 0}) {
    let xM, yM;
    let k = ellipse.x/ellipse.y;

    xM = (this.x - center.x) / spiral;
    yM = (this.y - center.y) / spiral;

    let mat = [
      [cos(angle),     -k*sin(angle)],
      [1/k*sin(angle),    cos(angle)]
    ];

    let pt = this.matrix({x: xM, y: yM}, mat);

    let new_x = pt.x + center.x;
    let new_y = pt.y + center.y;

    let addX = new_x - this.x;
    let addY = new_y - this.y;

    this.modifiersValues.x += addX;
    this.modifiersValues.y += addY;

    if(modsDev.force != '0'){
      let dist = h(addX, addY);
      let dir  = atan2piZ(addX, addY);
      let dec  = direction(dir + modsDev.dir, dist * modsDev.force);

      this.modifiersValues.x += dec.x;
      this.modifiersValues.y += dec.y;
    }
  }

  rotateEllipse(angle = activeGlo.params.rotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
         ellipse = {x: activeGlo.params.ellipse_x, y: activeGlo.params.ellipse_y}, angleEllipse = 0, spiral = activeGlo.params.spiral_force, numMod = false) {
   let xM, yM;
   let k = ellipse.x/ellipse.y;

   let mat = [
     [cos(angle),     -k*sin(angle)],
     [1/k*sin(angle),    cos(angle)]
   ];

   let pt;
   if(!this.firstRotDone){
     this.firstRotDone = true;
     xM = (this.x - center.x) / spiral;
     yM = (this.y - center.y) / spiral;
   }
   else{
     pt = rotate({x: this.x, y: this.y}, center, -angleEllipse);
     xM = (pt.x - center.x) / spiral;
     yM = (pt.y - center.y) / spiral;
   }

   pt = this.matrix({x: xM, y: yM}, mat);
   pt = {x: pt.x + center.x, y: pt.y + center.y};
   pt = rotate(pt, center, angleEllipse);

   this.modifiersValues.x += (pt.x - this.x);
   this.modifiersValues.y += (pt.y - this.y);
  }

  rotateEllipseSave(angle = activeGlo.params.rotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
         ellipse = {x: activeGlo.params.ellipse_x, y: activeGlo.params.ellipse_y}, angleEllipse = 0, spiral = activeGlo.params.spiral_force, numMod = false) {
   let xM, yM;
   let k = ellipse.x/ellipse.y;

   let mat = [
     [cos(angle),     -k*sin(angle)],
     [1/k*sin(angle),    cos(angle)]
   ];

   let pt;
   xM = (this.x - center.x) / spiral;
   yM = (this.y - center.y) / spiral;

   pt = this.matrix({x: xM, y: yM}, mat);
   pt = {x: pt.x + center.x, y: pt.y + center.y};

   let vect = {x: pt.x - this.x, y: pt.y - this.y};

   let matR = [
     [cos(angleEllipse), -sin(angleEllipse)],
     [sin(angleEllipse),  cos(angleEllipse)]
   ];
   vect = this.matrix(vect, matR);

   this.modifiersValues.x += vect.x;
   this.modifiersValues.y += vect.y;
  }

  rotateCalc(angle   = activeGlo.params.rotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
         ellipse = {x: activeGlo.params.ellipse_x, y: activeGlo.params.ellipse_y}, spiral = activeGlo.params.spiral_force) {
    let xM, yM;
    let k = ellipse.x/ellipse.y;

    xM = (this.x - center.x) / spiral;
    yM = (this.y - center.y) / spiral;

    let mat = [
      [cos(angle),     -k*sin(angle)],
      [1/k*sin(angle),    cos(angle)]
    ];

    let pt = this.matrix({x: xM, y: yM}, mat);

    return {x: pt.x + center.x, y: pt.y + center.y};
  }

  rotPoly(speed = activeGlo.params.trirotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
    noAvCenter = false, nbEdges = activeGlo.params.polyRotNbEdges, brake = false, polyRotAngle = activeGlo.params.polyRotAngle, modsDev = {force: 0, dir: 0}){
    if(this.center && !noAvCenter){ center = this.center; }
    speed/=15;

    let dx = this.x - center.x;
    let dy = this.y - center.y;
    let d  = h(dx, dy);

    let angle = atan2pi(dx, dy) + polyRotAngle;

    let x = 0, y = 0;

    let edgeAngle  = two_pi / nbEdges;
    let firstAngle = edgeAngle / 2;

    let a = flatNumber(angle, edgeAngle);

    let numSide = round(a/edgeAngle, 0);
    let midR = abs(d*cos(a + firstAngle - angle));
    let r    = midR/cos(firstAngle);

    //let nextSide = {x: center.x + r * cos(two_pi * numSide / nbEdges), y: center.y + r * sin(two_pi * numSide / nbEdges)};

    if(brake){ speed /= pow(r, brake/1.18); }
    speed*=midR;

    let k = a - polyRotAngle + firstAngle;

    x =  speed * cos(k);
    y = -speed * sin(k);

    /*if(activeGlo.polyPrecision){
      let newD = roundStepsPro(x, y, r, 0.1);
      x = newD.dx;
      y = newD.dy;
    }*/
    if(activeGlo.polyPrecision){
      let nextSide = {x: center.x + r * cos(two_pi * numSide / nbEdges), y: center.y + r * sin(two_pi * numSide / nbEdges)};

      let distToNextSide  = h(nextSide.x - this.x, nextSide.y - this.y);
      let distToNextPoint = h(x, y);

      if(distToNextPoint > distToNextSide){
        x = nextSide.x - this.x;
        y = nextSide.y - this.y;
      }

      //this.rotPoly(speed, center, noAvCenter, nbEdges, brake, polyRotAngle, modsDev);

      /*let new_d = h(this.x + x - this.center.x, this.y + y - this.center.y);
      let distToSom   = pow((r*r) - (midR*midR), 0.5);
      let distToNewPt = pow((new_d*new_d) - (midR*midR), 0.5);

      if(distToNewPt > distToSom){
        let coeff = distToSom/distToNewPt;

        if(coeff != 0){
          x*=coeff;
          y*=coeff;

          this.speedBf = true;
          this.modifiersValues.x += x;
          this.modifiersValues.y += y;

          this.rotPoly(speed, center, noAvCenter, nbEdges, brake, polyRotAngle, modsDev);
        }
      }*/
    }

    this.modifiersValues.x -= x;
    this.modifiersValues.y -= y;

    if(modsDev.force != '0'){
      let dist = h(x, y);
      let dir  = atan2piZ(x, y);
      let dec  = direction(dir + modsDev.dir, dist * modsDev.force);

      this.modifiersValues.x += dec.x;
      this.modifiersValues.y += dec.y;
    }
  }

  nextIsBlank(){
    let next = {x: this.x, y: this.y};
    let now  = {x: this.lasts[this.lasts.length - 1].x, y: this.lasts[this.lasts.length - 1].y};
    let dist = {x: next.x - now.x, y: next.y - now.y, d: h(next.x - now.x, next.y - now.y)};

    let dir  = atan2piZ(dist.x, dist.y);
    let c    = 2*this.size/dist.d;
    next.x   = now.x + dist.x * cos(dir) * c;
    next.y   = now.y - dist.y * sin(dir) * c;

    if(!ctx.isBlank({x: ceil(next.x), y: ceil(next.y)}, img)){
      this.draw    = false;
      this.draw_ok = false;

      let point  = getRandomPoint(1);

      this.x = point.x;
      this.y = point.y;
    }
  }

  curve(){
    let pos    = {x: this.x, y: this.y};
    let rCurve = activeGlo.params.rCurve;

    if(!this.curveRot){
      this.curveAngle = activeGlo.params.curveAngle;
      this.sw         = Math.sign(rnd_sign());
    }

    let angle = this.curveAngle;
    if(this.it%activeGlo.params.changeCurve==0 || !this.curveRot){
      this.curveRot = {x: pos.x + rnd_sign()*rCurve, y: pos.y + rnd_sign()*rCurve};
      this.sw = Math.sign(rnd_sign());
    }

    let pt = this.rotateCalc(angle, this.curveRot);
    let addVal = {x: pt.x - pos.x, y: pt.y - pos.y};
    this.modifiersValues.curve.x += addVal.x * this.sw;
    this.modifiersValues.curve.y += addVal.y * this.sw;
  }

  speedBefore(){
    let lastsSz = this.lasts.length;
    if(lastsSz > 1){
      let last   = this.lasts[lastsSz - 1];
      let lastBf = this.lasts[lastsSz - 2];

      return pow(pow(last.x - lastBf.x, 2) + pow(last.y - lastBf.y, 2), 0.5);
    }
  }

  oppositeEdge(nbEdges){
    let angle = (PI * (nbEdges - 2)) / (2 * nbEdges);
    let coeff = pow((1/sin(angle))**2 - 1, 0.5);

    if(abs(parseInt(coeff) - coeff) < 0.0001){ return parseInt(coeff); }

    return coeff;
  }

  oscille(){
    let y = this.y;
    this.x += cos(this.it*rad);
    this.y += sin(this.it*rad);
    this.rotate(this.direction, {x: this.x, y: y}, true);
  }

  dir(){ this.direction = atan2piZ(this.x - this.last_x, this.y - this.last_y); }
  dirSecond(){
    if(this.lastsSm.length > 0){
      let last = this.lastSm;
      let curr = this.secondMovePos;
      this.dirSecMove = atan2piZ(curr.x - last.x, curr.y - last.y);
    }
    else{
      this.dirSecMove = 0;
    }
  }
  angle(){ this.angle   = atan2piZ(this.x - this.center.x, this.y - this.center.y); }

  spiral(inv_spiral = activeGlo.inv_spiral){
    let center = !this.center ? { x: canvas.width/2, y: canvas.height/2 } : { x: this.center.x, y: this.center.y };
    let dx     = center.x - this.x, dy = center.y - this.y;
    let d      = this.dist_to_center(center);

    let exp  = activeGlo.params.spiral_exp;
    let turn = 1;
    if(inv_spiral){ d = -d; turn = -turn; }

    let x_move = cpow(dx,exp)/cpow(d,exp);
    let y_move = cpow(dy,exp)/cpow(d,exp);

    let k = activeGlo.params.spiral_speed;
    let pRot = {x: this.x + k*x_move, y: this.y + k*y_move};

    if(!activeGlo.nb_spirals)  { activeGlo.nb_spirals = 0; }

    let nb_spirals = activeGlo.cos_spiral ? activeGlo.nb_spirals : 0;
    let angle      = activeGlo.params.spiral_angle;
    let dev_angle  = activeGlo.params.dev_angle;

    if(!activeGlo.cos_spiral && !activeGlo.spiral_cross){ this.rotate(turn*angle, pRot); }
    else if(!activeGlo.spiral_cross){ this.rotate(turn*(angle * (1 + cos(nb_spirals))), pRot); }
    else{
      turn = this.n_avatars % 2 == 0 ? -1 : 1;
      this.rotate(turn*angle, pRot);
    }

    if(activeGlo.cos_spiral){ activeGlo.nb_spirals+=dev_angle; }
  }

  spiralToAvatar(){
    if(typeof(this.avToSpiral) == 'undefined') {
      this.avToSpiral = this.nears[getRandomIntInclusive(0, this.nears.length - 1, true)];
    }
    var avToSpiral = this.avToSpiral;

    if(typeof(avToSpiral) != 'undefined'){
      avToSpiral.avToSpiral = this;
      let center = { x: avToSpiral.x, y: avToSpiral.y };
      let dx     = center.x - this.x, dy = center.y - this.y;
      let d      = pow(pow(dx, 2) + pow(dy, 2), 0.5);

      let exp  = activeGlo.params.spiral_exp;
      let turn = 1;
      if(activeGlo.inv_spiral){ d = -d; turn = -turn; }

      let x_move = cpow(dx,exp)/pow(d,exp);
      let y_move = cpow(dy,exp)/pow(d,exp);

      let pRot = {x: this.x + x_move, y: this.y + y_move};

      if(!activeGlo.nb_spirals){ activeGlo.nb_spirals = 0; }

      let nb_spirals = activeGlo.cos_spiral ? activeGlo.nb_spirals : 0;
      let angle      = activeGlo.params.spirAvatar_angle;
      let dev_angle  = activeGlo.params.dev_angle;

      if(!activeGlo.cos_spiral){ this.rotate(turn*angle, pRot); }
      else{ this.rotate(turn*(angle * (1 + cos(nb_spirals))), pRot); }

      activeGlo.nb_spirals+=dev_angle;
    }
  }

  dist_to_center(center = {x: canvas.width/2, y: canvas.height/2}){ return pow(pow(center.x - this.x, 2) + pow(center.y - this.y, 2), 0.5); }

  tail_length(){
    let dist_tail = 0;
    let avLastLength = this.lasts.length;
    if(avLastLength > 1){
      for(var i = 1; i < avLastLength; i++){
        dist_tail += hypo(this.lasts[i].x - this.lasts[i-1].x, this.lasts[i].y - this.lasts[i-1].y);
      }
    }
    return dist_tail;
  }

  turnAngle(angle, d){
    let pos_y = d.y < 0 ? true : false;
    let pos_x = d.x < 0 ? true : false;

    if    (!pos_x && pos_y)  { angle = half_pi + angle; }
    else if(pos_x && pos_y)  { angle = angle + half_pi; }
    else                     { angle = 3*half_pi + angle; }

    return angle;
  }

  speed_avatar(){ return pow(pow(this.x - this.last_x, 2) + pow(this.y - this.last_y, 2), 0.5); }
  accel_avatar(){
    if(this.lasts[this.lasts.length - 1] && this.lasts[this.lasts.length - 2]){
      let last       = this.lasts[this.lasts.length - 1];
      let av_last    = this.lasts[this.lasts.length - 2];
      let last_vit   = {x: last.x - av_last.x, y: last.y - av_last.y};
      let vit        = {x: this.x - last.x, y: this.y - last.y};

      return pow(pow(vit.x - last_vit.x, 2) + pow(vit.y - last_vit.y, 2), 0.5);
    }
    return pow(pow(this.ax, 2) + pow(this.ay, 2), 0.5);
  }

  dist_av(av){ return pow(pow(this.x - av.x, 2) + pow(this.y - av.y, 2), 0.5); }

  colorByCenter(var_cent_col){
    let d_max = pow(pow(canvas.width/2, 2) + pow(canvas.height/2, 2), 0.5);
    let center = !this.center ? {x: canvas.width/2, y: canvas.height/2} : this.center;
    return 360 * this.dist_to_center(center)/(d_max/var_cent_col);
  }
  colorByDir(v = this.vit()){
    return activeGlo.params.dirColorCoeff * 180 * atan2pi(v.x, v.y) / PI;
  }

  colorByDistMod(){
    return activeGlo.params.varColDistModifs  * PI * this.distMinModifiers / canvas.width;
  }

  colorBySpeedOrAccel(move, relOrAbs, moyOrMax, move_moy, move_max, maxCol, varCol){
    return 360-(360*move/move_max);
  }

  /*colorByFollow(){
    if(this.avToFollow){
      let newStrokeH =  this.avToFollow.hslStroke.h + (rnd_sign() * activeGlo.params.avToFollowColorStrokeH);
      let newFillH   =  this.avToFollow.hsl.h + (rnd_sign() * activeGlo.params.avToFollowColorH);
      let newStrokeS =  this.avToFollow.hslStroke.s + (rnd_sign() * activeGlo.params.avToFollowColorStrokeS);
      let newFillS   =  this.avToFollow.hsl.s + (rnd_sign() * activeGlo.params.avToFollowColorS);
      let newStrokeL =  this.avToFollow.hslStroke.l + (rnd_sign() * activeGlo.params.avToFollowColorStrokeL);
      let newFillL   =  this.avToFollow.hsl.l + (rnd_sign() * activeGlo.params.avToFollowColorL);
      
      this.strokeStyle = 'hsla(' + newStrokeH + ', ' + newStrokeS + '%, ' + newStrokeL + '%, ' + this.avToFollow.hslStroke.a +')';
      this.fillStyle   = 'hsla(' + newFillH + ', ' + newFillS + '%, ' + newFillL + '%, ' + this.avToFollow.hsl.a +')';

      this.hslStroke = {h: newStrokeH, s: newStrokeS, l: newStrokeL, a: this.avToFollow.hslStroke.a, p: 1};
      this.hsl       = {h: newFillH, s: newFillS, l: newFillL, a: this.avToFollow.hsl.a, p: 1};
    }
    else{ this.colorHsl(); }
  }*/

  colorByFollow(){
    this.colorHsl();

    let newStrokeH =  this.hslStroke.h + (rnd_sign() * activeGlo.params.avToFollowColorStrokeH);
    let newFillH   =  this.hsl.h + (rnd_sign() * activeGlo.params.avToFollowColorH);
    let newStrokeS =  this.hslStroke.s + (rnd_sign() * activeGlo.params.avToFollowColorStrokeS);
    let newFillS   =  this.hsl.s + (rnd_sign() * activeGlo.params.avToFollowColorS);
    let newStrokeL =  this.hslStroke.l + (rnd_sign() * activeGlo.params.avToFollowColorStrokeL);
    let newFillL   =  this.hsl.l + (rnd_sign() * activeGlo.params.avToFollowColorL);
    
    this.strokeStyle = 'hsla(' + newStrokeH + ', ' + newStrokeS + '%, ' + newStrokeL + '%, ' + this.hslStroke.a +')';
    this.fillStyle   = 'hsla(' + newFillH + ', ' + newFillS + '%, ' + newFillL + '%, ' + this.hsl.a +')';

    this.hslStroke = {h: newStrokeH, s: newStrokeS, l: newStrokeL, a: this.hslStroke.a, p: 1};
    this.hsl       = {h: newFillH, s: newFillS, l: newFillL, a: this.hsl.a, p: 1};
  }

  colorHsl(obj = this.nearMod.num_modifier ? this.nearMod.glo : activeGlo){
    //if(activeGlo.params.formule_param && activeGlo.params.formule_param != '0'){ formule_param(obj, this); }
    if(obj.hyperAlea){ obj = this.glo; }

    let params = this.nearMod.params ? this.nearMod.params : obj.params;

    let tint          = !obj.hyperAlea ? params.tint_color : obj.params.tint_color;
    let sat           = !this.nearMod.sat  ? obj.params.saturation : this.nearMod.sat;
    let satStroke     = !this.nearMod.satStroke  ? obj.params.satStroke : this.nearMod.satStroke;
    let tint_stroke   = !this.nearMod.tint_stroke  ? obj.params.tint_stroke : this.nearMod.tint_stroke;
    let var_cent_col  = obj.params.var_center_col;
    let varMoveCol    = obj.params.varMoveCol;
    let move          = obj.speed_color ? this.speed : this.accel;
    let move_max      = obj.speed_color ? activeGlo.speed_max : activeGlo.accel_max;


    let cd = !this.nearMod.colorDec && this.nearMod.colorDec != 0 ? obj.params.colorDec : this.nearMod.colorDec;
    if(obj == this.glo){ cd += obj.params.colorDec; }
    let cdStroke = !this.nearMod.colorStrokeDec && this.nearMod.colorStrokeDec != 0 ? obj.params.colorStrokeDec : this.nearMod.colorStrokeDec;
    if(obj == this.glo){ cd += obj.params.colorStrokeDec; }

    let colorSum;

    if(!obj.colorCumul){
      let switchColor = this.nearMod.colorFunction != undefined ? this.nearMod.colorFunction : obj.colorFunction;
      switch(switchColor){
        case 'distMod' :
          let varCol = !this.nearMod.haveColor ? obj.params.varColDistModifs : this.nearMod.varOneColMod;
          if(!obj.colorsAdd || this.nearMod.haveColor){ move = 360 * varCol * this.distMinModifiers / canvas.width; }
          else{
            let colors = [];
            this.distMods.forEach(d => {
              move = 360 * d.varColDistModifs * d.dist / canvas.width;
              colors.push({h: move + d.colorDec, s: sat, st: satStroke, l: d.l, ls: d.ls, a: 1, p: pow(canvas.width/d.dist, obj.params.powColorAdd) * d.w});
            });
            let color = hslaSum(colors);
            move        = color.h;
            sat         = color.s;
            satStroke   = color.st;
            tint        = color.l;
            tint_stroke = color.ls;
          }
          break;
        case 'center'  : move = this.colorByCenter(var_cent_col); break;
        case 'dir'     : move = this.colorByDir(); break;
        case 'qMove'   : move = 360 - (360*move*varMoveCol/(obj.relative ? move_max : 1)); break;
      }
    }
    else{
      let cml = obj.rangesCmlColor;
      let nbMoves = 0;
      let moves = [];
      let colors = [];
      if(obj.colorFunctions.distMod){
        let varCol = !this.nearMod.haveColor ? obj.params.varColDistModifs : this.nearMod.varOneColMod;
        move       = 360 * varCol * this.distMinModifiers / canvas.width;
        moves.push(move * cml.range_distMod);
        colors.push({h: move, s: sat, l: tint, a: 1, p: cml.range_distMod});
        nbMoves += cml.range_distMod;
      }
      if(obj.colorFunctions.center){
        move = this.colorByCenter(var_cent_col);
        moves.push(move * cml.range_center);
        colors.push({h: move, s: sat, l: tint, a: 1, p: cml.range_center});
        nbMoves += cml.range_center;
      }
      if(obj.colorFunctions.dir){
        move = this.colorByDir();
        moves.push(move * cml.range_dir);
        colors.push({h: move, s: sat, l: tint, a: 1, p: cml.range_dir});
        nbMoves += cml.range_dir;
      }
      if(obj.colorFunctions.qMove){
        move = 360 - (360*move*varMoveCol/(obj.relative ? move_max : 1));
        moves.push(move * cml.range_qMove);
        colors.push({h: move, s: sat, l: tint, a: 1, p: cml.range_qMove});
        nbMoves += cml.range_qMove;
      }

      if(moves.length == 0){ moves[0] = 0; nbMoves = 1; }

      switch(obj.colorCumulType[obj.params.colorCumulType]){
        case 'average':
          //let moveSum = moves.reduce( (acc, val) => acc + val );
          //move = moveSum / nbMoves;
          colorSum = hslaSum(colors);
          break;
        case 'average_mul':
          let moveMul = moves.reduce( (acc, val) => acc * val );
          move = moveMul / nbMoves;
          break;
        case 'average_div':
          let moveDiv = moves.reduce( (acc, val) => acc / val );
          move = moveDiv / nbMoves;
          break;
        case 'average_mul_fact':
          let moveMulFact = moves.reduce( (acc, val) => acc * val );
          move = moveMulFact / factDec(nbMoves);
          break;
        case 'average_mul_div':
          let moveDivFact = moves.reduce( (acc, val) => acc / val );
          move = moveDivFact / factDec(nbMoves);
          break;
        case 'test':
          let moveTest = moves.reduce( (acc, val) => acc / val );
          move = moveTest / factDec(nbMoves);
          break;
      }
    }

    if(colorSum){ move = colorSum.h; sat = colorSum.s; tint = colorSum.l; }

    //let tint_save        = tint;
    //let tint_stroke_save = tint_stroke;
    if(this.nearMod.haveColor){
      //tint = this.nearMod.color.l;
      if(obj.addWithTint){
        let t         = this.nearMod.color.l * move;
        let ts        = this.nearMod.tint_stroke * move;
        tint          = pow(t, this.nearMod.powColor);
        tint_stroke   = pow(ts, this.nearMod.powColor);
      }
      if(!obj.colorsAdd){ move = this.nearMod.color.h; }
      else{
        let w = canvas.width;
        let colors = [];

        let mods = activeGlo.modifiers;

        mods.forEach(mod => {
          let dist = this.dist_av(mod);

          if(obj.addWithTint){
            let t        = tint * move;
            let ts       = mod.tint_stroke * move;
            tint         = cpow(t, mod.powColor*0.9);
            tint_stroke  = cpow(ts, mod.powColor*0.9);
          }

          if(mod.params.lightByDistMod != 0){
            let k = 1;
            let d = mod.params.lightByDistMod >=0 ? 1+(dist*k) : 1/(1+(dist*k));
            let c = mod.params.lightByDistMod >=0 ? mod.params.lightByDistModCoeff / 100 : mod.params.lightByDistModCoeff * 100;
            //c = mod.params.lightByDistModCoeff / 100;
            //let c = mod.params.lightByDistMod >=0 ? mod.params.lightByDistModCoeff : 1/mod.params.lightByDistModCoeff;
            //let coeff = pow(mod.params.lightByDistModCoeff * d, abs(mod.params.lightByDistMod));
            let coeff = c * d;
            tint        *= coeff;
            tint_stroke *= coeff;
          }
          if(params.satByDistMod != 0){
            let d = mod.params.lightByDistMod >=0 ? 1+dist : 1/(1+dist);
            let coeff = pow(mod.params.satByDistModCoeff * d, abs(mod.params.satByDistMod));
            sat *= coeff;
          }

          let weight = pow(mod.weight * w/dist, mod.params.powColorAdd);

          colors.push({h: mod.color.h + mod.colorDec, s: mod.sat, l: tint, ls: tint_stroke, st: satStroke, a: 1, p: weight});
        });
        let color = hslaSum(colors);

        move = color.h;
        sat  = color.s;
        //tint = color.l;

        //tint        = obj.addWithTint ? color.l : tint_save;
        //tint_stroke = obj.addWithTint ? color.ls : tint_stroke_save;
      }
    }

    if(!obj.colorsAdd){ move += cd; }

    tint        = obj.color_white ? 100 : obj.color_black ? 0 : tint;
    tint_stroke = obj.color_white ? 100 : obj.color_black ? 0 : tint_stroke;
    satStroke   = obj.color_white ? 100 : obj.color_black ? 0 : satStroke;

    if(obj.alternColor && zeroOneCycle(activeGlo.nb_moves, params.alternColorSpeed)){
      move += params.alternColorVal;
      if(obj.color_white || obj.color_black){
        tint        = 100 - tint;
        tint_stroke = 100 - tint_stroke;
        satStroke   = 100 - satStroke;
      }
    }

    if(!obj.colorsAdd){
      if(params.lightByDistMod != 0){
        let coeff = pow(params.lightByDistModCoeff * this.distMinModifiers / canvas.width, params.lightByDistMod);
        tint        *= coeff;
        tint_stroke *= coeff;
      }
      if(params.satByDistMod != 0){
        let coeff = pow(params.satByDistModCoeff * this.distMinModifiers / canvas.width, params.satByDistMod);
        sat       *= coeff;
        satStroke *= coeff;
      }
    }

    if(params.lightByCenter != 0){
      let lightByCenter = params.lightByCenter;
      let coeff         = this.coeffSizeCenter();

      coeff = pow(lightByCenter > 0 ? coeff * (0.9+lightByCenter) : 1 / (coeff * (0.9+abs(lightByCenter))), 0.5);

      tint        *= coeff;
      tint_stroke *= coeff;
    }

    let a = 1;
    if(!obj.alphaAbs){
      a = obj.alpha ? 1/(1+move) : 1;
      a = a < obj.params.alpha_color ? obj.params.alpha_color : a;
    }
    else{ a = !this.nearMod.alpha ? obj.params.alpha_color : this.nearMod.alpha; }

    if(obj.alphaBySize){
      let c = this.sizeCalc.s - obj.params.alphaBySize;
      if(c > 1){ a /= pow(c, obj.params.powAlpha); }
    }

    if(obj.alphaRnd){ a /= (1 + rnd()); }

    if(obj.formuleColorMode && this.nearMod.formuleColor){
      let color = this.formuleColor(move, sat, tint, a, this.nearMod.formuleColor);
      move = color.move; sat = color.sat; tint = color.tint; a = color.a;
    }

    if(tint < 0){ tint = 0; }
    if(tint_stroke < 0){ tint_stroke = 0; }
    if(satStroke < 0){ satStroke = 0; }
    if(sat < 0){ sat = 0; }

    //if(obj.oneColor.state){ move = activeGlo.oneColor.color.h; sat = activeGlo.oneColor.color.s; tint = activeGlo.oneColor.color.l;  }
    if(activeGlo.oneColor.state){ move = activeGlo.oneColor.color.h; sat = activeGlo.oneColor.color.s; tint = activeGlo.oneColor.color.l;  }

    this.strokeStyle = 'hsla(' + (move + cdStroke) + ', ' + satStroke + '%, ' + tint_stroke + '%, ' + a +')';
    this.fillStyle   = 'hsla(' + move + ', ' + sat + '%, ' + tint + '%, ' + a +')';

    this.hsl       = {h: move, s: sat, l: tint, a: a, p: 1};
    this.hslStroke = {h: move + cdStroke, s: satStroke, l: tint_stroke, a: a, p: 1};
  }

  formuleColor(h, s, l, a, formuleColor){
    return {
      move : eval(formuleColor.h),
      sat  : eval(formuleColor.s),
      tint : eval(formuleColor.l),
      a    : eval(formuleColor.a)
    };
  }

}


//END CLASS
