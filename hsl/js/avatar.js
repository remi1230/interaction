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
    this.dist_moy     = 1;
    this.size         = options.size;
    this.sizeCalc     = {s: options.size, x: options.size, y: options.size};
    this.fillStyle    = options.fillStyle;
    this.strokeStyle  = options.fillStyle;
    this.form         = glo.form;
    this.colorMod     = glo.modifiersColor;
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

    this.distMinModifiers = 9999;

    if(options.center){ this.center = options.center; }
    if(options.virtual){ this.virtual = options.virtual; }

    this.path     = new Path2D();
    this.selfPath = new Path2D();
    this.savePath = [];
    this.pathIt   = 0;
    this.nPath    = 19;

    avatars.push(this);

    num_avatar++;
  }

  lim_x(){ let dec = glo.mode.far_rebound.state ? this.size * 2 : 0; return canvas.width - this.size + dec; }
  lim_y(){ let dec = glo.mode.far_rebound.state ? this.size * 2 : 0; return canvas.height - this.size + dec; }

  vit(){
    let vx = this.x - this.last_x;
    let vy = this.y - this.last_y;
    let v  = pow(pow(vx,2) + pow(vy,2), 0.5);

    return {x: vx, y: vy, v: v};
  }

  sizeIt(){
    let size, size_x, size_y;

    ctx.lineWidth = glo.params.line_size;

    if(glo.growDecrease){
      if(zeroOneCycle(this.it, glo.params.growDecrease)){ this.size += glo.params.growDecreaseCoeff; }
      else if(this.size - glo.params.growDecreaseCoeff >= 0) { this.size -= glo.params.growDecreaseCoeff; }
    }

    let lim_line = glo.params.lim_line;
    if(!glo.mode.var_size.state){
      size   = this.size + this.grow;
      if(size <= 0){ size = 0.1; }
      size_x = size;
      size_y = size;
      this.grow = 0;
    }
    else{
      let vit = this.vit();
      size   = pow(pow(vit.x,2) + pow(vit.y,2), 0.5) * this.size;
      size_x = abs(vit.x) * this.size;
      size_y = abs(vit.y) * this.size;

      size   = size < lim_line ? size : lim_line;
      size_x = size_x < lim_line ? size_x : lim_line;
      size_y = size_y < lim_line ? size_y : lim_line;
    }

    let coeff = 1, coeffLn = 1;
    if(glo.dimSizeCenter){
      coeff = this.coeffSizeCenter();

      size   *= coeff;
      size_x *= coeff;
      size_y *= coeff;
    }
    if(glo.params.distNearDrawMods){
      coeffLn = this.coeffSizeMinMod();

      size   *= coeffLn;
      size_x *= coeffLn;
      size_y *= coeffLn;
    }

    if(glo.sizeDirCoeff && this.lasts[this.lasts.length - 2]){ size *= this.dirSizeCoeff; }

    if(glo.growDecrease){
      if(zeroOneCycle(this.it, glo.params.growDecrease)){
        glo.params.line_size += 0.01*glo.params.growDecreaseCoeff;
      }
      else if(ctx.lineWidth - glo.params.growDecreaseCoeff >= 0){
        glo.params.line_size -= 0.01*glo.params.growDecreaseCoeff;
      }
      ctx.lineWidth = glo.params.line_size;
    }

    if(glo.perm_var_size){
      let lvs = glo.params.level_var_size;
      if(rnd() > 0.5){
        size = size * (1+rnd()) * lvs;
        ctx.lineWidth = ctx.lineWidth * (1+rnd()) * glo.params.level_var_size;
      }
      else{
        size = size / (1+rnd()) / lvs;
        ctx.lineWidth = ctx.lineWidth / (1+rnd()) / glo.params.level_var_size;
      }
    }

    ctx.lineWidth *= coeff * coeffLn;
    this.sizeCalc  = {s: size, x: size_x, y: size_y};
  }


  draw_avatar(form = glo.form){
    let size   = this.sizeCalc.s;
    let size_x = this.sizeCalc.x;
    let size_y = this.sizeCalc.y;

    let x = this.x, y = this.y;

    if(glo.doubleAvatar){
      let dir = this.direction;
      let dec = direction(dir + half_pi, glo.params.dblAvDist);
      x -= dec.x;
      y -= dec.y;
    }

    let isPath = glo.curve && !glo.mode.clear.state;
    let p;
    if(isPath){
      p = new Path2D();
      p.moveTo(x, y);
    }

    let addAngle = 0;
    ctx.beginPath();
    switch(form){
      case 'circle':
        if(glo.params.arcRotAngle > 0){
          addAngle = cyclicNumber(-0.1 * glo.nb_moves * glo.params.arcRotAngle, glo.params.arcEndAngle - glo.params.arcStartAngle - rad);
        }
        ctx.arc(x, y, size, glo.params.arcStartAngle + addAngle, glo.params.arcEndAngle);
        break;
      case 'ellipse':
        let oval_size = glo.params.oval_size;
        let sx = !glo.mode.sameSizeEllipse.state ? (1+size) * (1 + this.speed*oval_size) : (1+size) * (1 + oval_size);
        let sy = !glo.mode.sameSizeEllipse.state ? 1+size*oval_size : size * oval_size;

        let dir = this.direction;

        if(glo.params.arcRotAngle > 0){
          addAngle = cyclicNumber(-0.1 * glo.nb_moves * glo.params.arcRotAngle, glo.params.arcEndAngle - glo.params.arcStartAngle - rad);
        }
        ctx.ellipse(x, y, sx, sy, dir, glo.params.arcStartAngle + addAngle, glo.params.arcEndAngle);

        if(isPath){ p.ellipse(x, y, sx, sy, dir, glo.params.arcStartAngle + addAngle, glo.params.arcEndAngle); this.dealPath(p); }
        break;
      case 'square':
        ctx.rect(x, y, size_x, size_y);
        break;
      case 'poly':
        ctx.polygone({pos: {x: x, y: y}, size: size, nb_edges: glo.params.nb_edges, color: this.fillStyle});
        break;
      case 'cloud':
        ctx.cloud({pos: {x: x, y: y}, size: size, nb_points: glo.params.nb_points_cloud,
                   sz_point: glo.params.sz_points_cloud, withLine: glo.mode.withLine.state, color: this.fillStyle});
        break;
      case 'alea_form':
        ctx.alea_form({pos: {x: x, y: y}, size: size, nb_edges: glo.params.nb_edges, color: this.fillStyle});
        break;
      case 'line':
      case 'bezier':
        let last = this.lasts[this.lasts.length - 1];
        if(glo.mode.secondMove.state && this.lasts[this.lasts.length - 2]){ last = this.lasts[this.lasts.length - 2]; }
        let last_x = last.x;
        let last_y = last.y;
        let dx     = x - last_x;
        let dy     = y - last_y;
        let dist   = pow(pow(dx, 2) + pow(dy, 2), 0.5);

        if(glo.doubleAvatar){
          let dir = this.direction;
          let dec = direction(dir + half_pi, glo.params.dblAvDist);

          if(glo.sizeDirCoeff && this.lasts[this.lasts.length - 2]){ dec.x *= this.dirSizeCoeff; dec.y *= this.dirSizeCoeff; }

          last_x -= dec.x;
          last_y -= dec.y;
        }

        if(!glo.noLimLine){
          last_x = dist < glo.params.lim_line ? last_x : last_x + dx/glo.params.div_line;
          last_y = dist < glo.params.lim_line ? last_y : last_y + dy/glo.params.div_line;
        }

        if(glo.dash > 0){ ctx.setLineDash([glo.dash, glo.dash]); }

        ctx.lineCap     = glo.lineCap[glo.numLineCap%3];
        ctx.fillStyle   = this.fillStyle;
        ctx.strokeStyle = this.fillStyle;

        if(form == 'line'){
          ctx.moveTo(last_x, last_y);
          ctx.lineTo(x, y);
          if(isPath){ p.moveTo(last_x, last_y); p.lineTo(x, y); this.dealPath(p); }
        }
        else{
          let ln = redimLine({x: last_x, y: last_y}, {x: x, y: y}, 10);
          ctx.bezier(ln.startPt, ln.endPt);
        }

        break;
      case 'cross':
        ctx.crossDiag({x: x, y: y}, size);
        break;
    }

    var stroke = glo.mode.stroke.state;
    if(glo.alea_stroke){ stroke = rnd() < 0.5 ? true : false; }
    if(glo.mode.strokeAndFill.state){
      if(glo.perm_var_size || glo.growDecrease){ ctx.lineWidth = glo.sizeLineSave; }
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
      ctx.strokeStyle = this.fillStyle;
      ctx.stroke();
    }

    if(glo.mode.tail.state && this.draw){ this.drawTail(); }

    if(glo.doubleAvatar){
      glo.doubleAvatar = false;
      let posSave  = {x: this.x, y: this.y};
      let lastSave = {x: this.lasts[this.lasts.length - 1].x, y: this.lasts[this.lasts.length - 1].y};
      let dir      = this.direction;
      let dec      = direction(dir + half_pi, glo.params.dblAvDist);

      if(glo.sizeDirCoeff && this.lasts[this.lasts.length - 2]){ dec.x *= this.dirSizeCoeff; dec.y *= this.dirSizeCoeff; }

      this.x += dec.x;
      this.y += dec.y;
      this.lasts[this.lasts.length - 1].x += dec.x;
      this.lasts[this.lasts.length - 1].y += dec.y;

      this.draw_avatar();

      this.x = posSave.x;
      this.y = posSave.y;
      this.lasts[this.lasts.length - 1].x = lastSave.x;
      this.lasts[this.lasts.length - 1].y = lastSave.y;

      glo.doubleAvatar = true;
    }
  }

  drawTail(){
    ctx.beginPath();
    ctx.strokeStyle = this.fillStyle;
    let lastsSz = this.lasts.length;
    for(let i = 0; i < lastsSz; i++){ ctx.lineTo(this.lasts[i].x, this.lasts[i].y); }
    ctx.stroke();
  }

  dealPath(p){
    this.path.addPath(p);
    if(this.pathIt == this.nPath){
      this.nPath = 10;
      for(let i = 0; i < 10; i++){ this.selfPath.addPath(this.savePath[i]); }
      this.savePath.splice(0, 10);
      this.pathIt   = 0;
    }
    this.savePath.push(p);
    this.pathIt++;
  }

  secondMove(){
    if(this.secondMovePos){
      this.lastSm = {x: this.secondMovePos.x, y: this.secondMovePos.y};
      this.lastsSm.push(this.lastSm);
      if(this.lastsSm.length > 2){ this.lastsSm.shift(); }
    }
    else{
      this.lastSm = {x: this.x, y: this.y};
      this.lastsSm.push(this.lastSm);
    }

    let d   = cos(this.it * glo.params.secondMoveIt * rad) * glo.params.secondMoveRange;
    let dir = direction(this.direction + half_pi, d);
    this.secondMovePos = {x: this.x + dir.x, y: this.y + dir.y};
  }

  coeffDirSize(){
    this.speedDir();
    this.dirSizeCoeff = pow(pow(1 - this.dirSpeed/two_pi, glo.params.sizeDirCoeff), abs(glo.params.sizeDirCoeff));
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

    let k     = glo.params.coeffDimSizeCenter;
    let coeff = dist_to_center/h;

    return pow(coeff,k);
  }

  coeffSizeMinMod(){
    let coeff = 1;

    //this.distMinMods();

    if(this.distMinModifiers < glo.params.distNearDrawMods){
      coeff = this.distMinModifiers / glo.params.distNearDrawMods;
    }
    return coeff;
  }

  nearAvatars(){
    this.nears = []; let lim = glo.lim_dist;
    for(let i = 0; i < avatars.length; i++){
      if(this.dist_av(avatars[i]) <= lim && avatars[i] != this){ this.nears.push(avatars[i]); }
    }
  }

  collidBorder(){
    let x = this.x;
    let y = this.y;
    let size  = glo.mode.far_rebound.state ? -this.size*2 : this.size;

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
    if(!glo.mode.normalCollid.state){
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
      let modifiersSz = glo.modifiers.length;
      for(let i = 0; i < modifiersSz; i++){
        let mod  = glo.modifiers[i];
        let dist = pow(pow(this.x - mod.x, 2) + pow(this.y - mod.y, 2), 0.5);
        if(dist < this.distMinModifiers){ this.distMinModifiers = dist; this.nearMod = mod; }
      }
    }
    else{
      args.map(arg =>{
        glo.modifiers.filter(mod => mod.type == arg).map(mod => {
          let dist = pow(pow(this.x - mod.x, 2) + pow(this.y - mod.y, 2), 0.5);
          if(dist < this.distMinModifiers){ this.distMinModifiers = dist; this.nearMod = mod; }
        });
      });
    }
    return this.distMinModifiers;
  }

  interaction(obj = !glo.mode.hyperAlea.state ? glo : this.glo){
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
    let alea_attract   = obj.mode.alea_attract.state;
    let attract_size   = obj.mode.attract_size.state;
    let inv_g          = obj.mode.inverse_g.state ? -1 : 1;
    let dist_mean      = obj.mode.dist_mean.state;
    let dist_moy       = glo.dist_moy;
    let dist_mean_inv  = obj.mode.dist_mean_inv.state;
    let dist_mean_one  = obj.mode.dist_mean_one.state;
    let is_chaos       = obj.chaos;
    let breakAdd       = obj.params.breakAdd;

    if(glo.mode.alea_inv_g.state){ inv_g = glo.nb_moves%dep_dir == 0 ? -glo.params.inv_g_force : 1; }

    this.ax = 0;
    this.ay = 0;
    let nb_nears = 0;

    let avatar, x_avatar, y_avatar, x_av, y_av, dist, lim, brake, att, siz, vit, x, y;

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
          att = alea_attract ? getRandomIntInclusive(1, attract*10) : attract;
          siz = attract_size ? pow(this.size, 2) : this.size;

          vit = !obj.mode.gSpeed.state ? 1 : avatar.vit().v;

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

          this.ax += inv_g*x*att*(outF + siz+vit*obj.params.gSpeed)/brake;
          this.ay += inv_g*y*att*(outF + siz+vit*obj.params.gSpeed)/brake;
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

    let point;
    let size = glo.params.rAleaPos;

    point = size >= 1 ? getRandomPoint(size) : getRandomPointInCircle(size);
    this.x = point.x;
    this.y = point.y;
  }

  mouse_attract(pause = false){
    let brake_pow = glo.params.brake_pow;
    let mouseG    = glo.params.wheel_force;

    if(glo.mode.attract_center.state){ mouse.x = canvas.width/2; mouse.y = canvas.height/2; }

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
    let angle  = glo.params.wheel_force / (this.mouse_dist()**2);

    if(glo.mode.attract_center.state){ mouse.x = canvas.width/2; mouse.y = canvas.height/2; }

    this.rotate(angle, mouse, {x: 1, y:1});
  }

  mouse_growing(){ this.grow = glo.params.wheel_force/(2+ pow(this.mouse_dist(), 0.7)); }
  mouse_darking(){ this.dark = glo.params.wheel_force/(2+ pow(this.mouse_dist(), 0.7)); }

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
    if(glo.style == 0){
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

      if(glo.formule.x != 0 && !glo.formule.error.x){
        let form_x = this.eval_formule(glo.formule.x);
        if(!isNaN(form_x)){ x_val = form_x; }
      }
      if(glo.formule.y != 0 && !glo.formule.error.y){
        let form_y = this.eval_formule(glo.formule.y);
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
    if(glo.style == 1){
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
      if(glo.style == 1){ avToOrbite.number_orbite = this.n_avatars; }
      else{ avToOrbite.avToOrbite = this; }
      this.rotate(glo.params.orbite_angle/10, {x: avToOrbite.x, y: avToOrbite.y});
    }
  }

  attractByOne(){
    let avToGo;
    if(this.it%glo.params.keep_dir==0) {
      this.avToGo = this.nears[getRandomIntInclusive(0, this.nears.length - 1, true)];
    }
    avToGo = this.avToGo;

    if(typeof(avToGo) != 'undefined'){
      let dist = this.dist_av(avToGo);
      let x    = avToGo.x - this.x;
      let y    = avToGo.y - this.y;

      let brake = pow(dist, glo.params.brake_pow);

      let k = 100;
      this.ax += k*x/brake;
      this.ay += k*y/brake;
    }
  }

  matrix(pt, mat){
    return { x: pt.x * mat[0][0] + pt.y * mat[0][1], y: pt.x * mat[1][0] + pt.y * mat[1][1] };
  }

  rotate(angle   = glo.params.rotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
         ellipse = {x: glo.params.ellipse_x, y: glo.params.ellipse_y}, spiral = glo.params.spiral_force) {
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

    this.modifiersValues.x += (new_x - this.x);
    this.modifiersValues.y += (new_y - this.y);
  }

  rotateEllipse(angle = glo.params.rotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
         ellipse = {x: glo.params.ellipse_x, y: glo.params.ellipse_y}, angleEllipse = 0, spiral = glo.params.spiral_force, numMod = false) {
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

  rotateEllipseSave(angle = glo.params.rotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
         ellipse = {x: glo.params.ellipse_x, y: glo.params.ellipse_y}, angleEllipse = 0, spiral = glo.params.spiral_force, numMod = false) {
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

  rotateCalc(angle   = glo.params.rotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
         ellipse = {x: glo.params.ellipse_x, y: glo.params.ellipse_y}, spiral = glo.params.spiral_force) {
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

  rotPoly(speed = glo.params.trirotate_angle, center = { x: canvas.width/2, y: canvas.height/2 },
    noAvCenter = false, nbEdges = glo.params.polyRotNbEdges, brake = false, polyRotAngle = glo.params.polyRotAngle){
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

    let midR = abs(d*cos(a + firstAngle - angle));
    let r    = midR/cos(firstAngle);

    if(brake){ speed /= pow(r, brake/1.18); }
    speed*=midR;

    let k = a - polyRotAngle + firstAngle;

    x =  speed * cos(k);
    y = -speed * sin(k);

    if(glo.polyPrecision){
      let new_d = h(dx + x, dy + y);
      if(new_d > r){
        let newAngle = atan2pi(dx + x, dy + y);
        a -= polyRotAngle;

        let nextAngle = newAngle   > a + edgeAngle || a + edgeAngle == two_pi ? a + edgeAngle : a;
        if(a + edgeAngle == two_pi){ newAngle+=two_pi; }
        let coeff = (nextAngle - angle + polyRotAngle) / (newAngle - angle + polyRotAngle);

        //let restAngle = newAngle - nextAngle;

        if(coeff != 0){
          x*=coeff;
          y*=coeff;

          this.speedBf = true;
        }
      }
    }

    this.modifiersValues.x += x;
    this.modifiersValues.y += y;
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
    let rCurve = glo.params.rCurve;

    glo.drawMulti = false;

    if(!this.curveRot){
      this.curveAngle = glo.params.curveAngle;
    }

    let angle = this.curveAngle;
    if(glo.nb_moves%glo.params.changeCurve==0 || !this.curveRot){
      this.curveRot = {x: pos.x + rnd_sign()*rCurve, y: pos.y + rnd_sign()*rCurve};
    }

    /*let blank = true;
    for(let i = 0; i < glo.params.curveRnd; i += glo.params.curveTestCoeff){
      let ptTest = this.rotateCalc(1.2*angle + i*rad, this.curveRot);
      blank      = ctx.isBlank({x: ptTest.x, y: ptTest.y});
      if(!blank){break;}
    }*/

    let ptTest = this.rotateCalc(angle + glo.params.curveStartTest, this.curveRot);
    let blank  = !ctx.isPointInPath(this.selfPath, ptTest.x, ptTest.y);
    if(blank){
      for(let i = 0; i < avatars.length; i++){
        if(avatars[i] != this && ctx.isPointInPath(avatars[i].path, ptTest.x, ptTest.y)){
          blank = false;
          break;
        }
      }
    }


    /*let blank = true;
    for(let i = 0; i < glo.params.curveRnd*rad; i += glo.params.curveTestCoeff*rad){
      let ptTest = this.rotateCalc(angle + i, this.curveRot);
      blank      = ctx.isBlank({x: ptTest.x, y: ptTest.y});
      if(!blank){break;}
    }*/

    /*let blank = true;
    for(let i = 0; i < 5*rad; i += 0.1*rad){
      let ptTest = this.rotateCalc(angle + i, this.curveRot);
      blank      = ctx.isBlank({x: ptTest.x, y: ptTest.y}, this.id);
      if(!blank){break;}
    }*/

    if(blank){
      let pt = this.rotateCalc(angle, this.curveRot);
      let addVal = {x: pt.x - pos.x, y: pt.y - pos.y};
      this.modifiersValues.curve.x += addVal.x;
      this.modifiersValues.curve.y += addVal.y;
    }
    else{
      //this.moveOnAlea();

      this.draw    = false;
      this.draw_ok = false;

      let point = getRandomPoint(1);
      let addVal = {x: point.x - pos.x, y: point.y - pos.y};

      this.modifiersValues.curve.x += addVal.x;
      this.modifiersValues.curve.y += addVal.y;

      this.curveRot = {x: this.curveRot.x + addVal.x, y: this.curveRot.y + addVal.y};

      /*let addVal = {x: rCurve*rnd_sign(), y: rCurve*rnd_sign()};
      //let addVal = {x: 0, y: 0};

      this.curveAngle = -this.curveAngle;
      this.tuch = true;

      this.curveRot = {x: this.curveRot.x + addVal.x, y: this.curveRot.y + addVal.y};*/
    }
  }

  curveSave(){
    let startCurve = glo.params.startCurve;
    let limCurve   = glo.params.limCurve;
    let powCurve   = glo.params.powCurve;
    let divCurve   = glo.params.divCurve;
    let speedCurve = glo.params.speedCurve;

    if(!glo.numCurve){ glo.numCurve = startCurve; }
    if(!this.nbCurves){
      this.nbCurves = glo.numCurve;
      glo.numCurve++;
    }
    if(this.nbCurves > limCurve){ this.nbCurves = startCurve; }
    if(!this.direction){ this.dir(); }

    //let dir = direction(powCurve**(this.nbCurves/divCurve), speedCurve);
    let dir = direction(this.direction+this.nbCurves/divCurve, speedCurve);

    let dirTest = dir;

    let blank = true;
    /*for(let i = 1; i < 5; i++){
      let dirTestAngle = atan2piZ(dirTest.x, dirTest.y);
      dirTest          = direction(dirTestAngle+(this.nbCurves + i)/divCurve, speedCurve);
      blank            = ctx.isBlank({x: ceil(this.x + dirTest.x), y: ceil(this.y + dirTest.y)}, img);
    }
    blank = ctx.isBlank({x: ceil(this.x + dirTest.x), y: ceil(this.y + dirTest.y)}, img);
    */
    if(!blank || 1 == 0){
      dir = direction(-2*(this.direction-this.nbCurves)/divCurve, speedCurve);
      this.draw    = false;
      this.draw_ok = false;
    }

    this.modifiersValues.curve.x += dir.x;
    this.modifiersValues.curve.y += dir.y;

    this.nbCurves++;
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

  spiral(inv_spiral = glo.mode.inv_spiral.state){
    let center = !this.center ? { x: canvas.width/2, y: canvas.height/2 } : { x: this.center.x, y: this.center.y };
    let dx     = center.x - this.x, dy = center.y - this.y;
    let d      = this.dist_to_center(center);

    let exp  = glo.params.spiral_exp;
    let turn = 1;
    if(inv_spiral){ d = -d; turn = -turn; }

    let x_move = cpow(dx,exp)/cpow(d,exp);
    let y_move = cpow(dy,exp)/cpow(d,exp);

    let k = glo.params.spiral_speed;
    let pRot = {x: this.x + k*x_move, y: this.y + k*y_move};

    if(!glo.nb_spirals)  { glo.nb_spirals = 0; }

    let nb_spirals = glo.mode.cos_spiral.state ? glo.nb_spirals : 0;
    let angle      = glo.params.spiral_angle;
    let dev_angle  = glo.params.dev_angle;

    if(!glo.mode.cos_spiral.state && !glo.mode.spiral_cross.state){ this.rotate(turn*angle, pRot); }
    else if(!glo.mode.spiral_cross.state){ this.rotate(turn*(angle * (1 + cos(nb_spirals))), pRot); }
    else{
      turn = this.n_avatars % 2 == 0 ? -1 : 1;
      this.rotate(turn*angle, pRot);
    }

    if(glo.mode.cos_spiral.state){ glo.nb_spirals+=dev_angle; }
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

      let exp  = glo.params.spiral_exp;
      let turn = 1;
      if(glo.mode.inv_spiral.state){ d = -d; turn = -turn; }

      let x_move = cpow(dx,exp)/pow(d,exp);
      let y_move = cpow(dy,exp)/pow(d,exp);

      let pRot = {x: this.x + x_move, y: this.y + y_move};

      if(!glo.nb_spirals){ glo.nb_spirals = 0; }

      let nb_spirals = glo.mode.cos_spiral.state ? glo.nb_spirals : 0;
      let angle      = glo.params.spirAvatar_angle;
      let dev_angle  = glo.params.dev_angle;

      if(!glo.mode.cos_spiral.state){ this.rotate(turn*angle, pRot); }
      else{ this.rotate(turn*(angle * (1 + cos(nb_spirals))), pRot); }

      glo.nb_spirals+=dev_angle;
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
  colorByDir(){
    let vit = this.vit();
    return glo.params.dirColorCoeff * 180 * atan2pi(vit.x, vit.y) / PI;
  }

  colorByDistMod(){
    return glo.params.varColDistModifs  * PI * this.distMinModifiers / canvas.width;
  }

  colorBySpeedOrAccel(move, relOrAbs, moyOrMax, move_moy, move_max, maxCol, varCol){
    return 360-(360*move/move_max);
  }

  colorHsl(obj = glo){
    if(this.glo){ obj = this.glo; }

    let params = this.nearMod.params ? this.nearMod.params : obj.params;

    let tint          = params.tint_color;
    let sat           = !this.nearMod.sat  ? obj.params.saturation : this.nearMod.sat;
    let tint_stroke   = !this.nearMod.tint_stroke  ? obj.params.tint_stroke : this.nearMod.tint_stroke;
    let var_cent_col  = obj.params.var_center_col;
    let varMoveCol    = obj.params.varMoveCol;
    let move          = obj.mode.speed_color.state ? this.speed : this.accel;
    let move_max      = obj.mode.speed_color.state ? obj.speed_max : obj.accel_max;

    let colorSum;

    if(!glo.mode.colorCumul.state){
      let switchColor = this.nearMod.colorFunction != undefined ? this.nearMod.colorFunction : glo.colorFunction;
      switch(switchColor){
        case 'distMod' :
          let varCol = !this.nearMod.haveColor ? glo.params.varColDistModifs : this.nearMod.varOneColMod;
          if(!glo.colorsAdd || this.nearMod.haveColor){ move = 360 * varCol * this.distMinModifiers / canvas.width; }
          else{
            let colors = [];
            this.distMods.forEach(d => {
              move = 360 * varCol * d.dist / canvas.width;
              colors.push({h: move, s: sat, l: tint, a: 1, p: pow(canvas.width/d.dist, glo.params.powColorAdd)});
            });
            let color = hslaSum(colors);
            move = color.h;
            sat  = color.s;
            tint = color.l;
          }
          break;
        case 'center'  : move = this.colorByCenter(var_cent_col); break;
        case 'dir'     : move = this.colorByDir(); break;
        case 'qMove'   : move = 360 - (360*move*varMoveCol/move_max); break;
      }
    }
    else{
      let cml = glo.rangesCmlColor;
      let nbMoves = 0;
      let moves = [];
      let colors = [];
      if(obj.colorFunctions.distMod){
        let varCol = !this.nearMod.haveColor ? glo.params.varColDistModifs : this.nearMod.varOneColMod;
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
        move = 360 - (360*move*varMoveCol/move_max);
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

    if(this.nearMod.haveColor){
      let t        = this.nearMod.color.l * move;
      tint         = pow(t, this.nearMod.powColor);
      tint_stroke  = tint;
      if(!glo.colorsAdd){ move = this.nearMod.color.h; }
      else{
        let w = canvas.width;
        let colors = [];
        glo.modifiers.forEach(mod => {
          let dist  = this.dist_av(mod);
          let t        = mod.tint * move;
          tint         = cpow(t, mod.powColor*0.9);
          tint_stroke  = tint;
          move         = mod.color.h;

          if(mod.params.lightByDistMod != 0){
            let coeff = pow(mod.params.lightByDistModCoeff * dist / canvas.width, mod.params.lightByDistMod);
            tint        *= coeff;
            tint_stroke *= coeff;
          }
          if(params.satByDistMod != 0){
            let coeff = pow(mod.params.satByDistModCoeff * dist / canvas.width, mod.params.satByDistMod);
            sat *= coeff;
          }

          let weight = pow(mod.weight * w/dist, mod.params.powColorAdd);

          colors.push({h: move, s: mod.sat, l: tint, a: 1, p: weight});
        });
        let color = hslaSum(colors);
        move = color.h;
        sat  = color.s;
        tint = color.l;
      }
    }

    let cd = !this.nearMod.colorDec && this.nearMod.colorDec != 0 ? obj.params.colorDec : this.nearMod.colorDec;
    if(obj == this.glo){ cd += obj.params.colorDec; }
    move += cd;

    tint        = obj.mode.color_white.state ? 100 : obj.mode.color_black.state ? 0 : tint;
    tint_stroke = obj.mode.color_white.state ? 100 : obj.mode.color_black.state ? 0 : tint_stroke;

    if(glo.alternColor && zeroOneCycle(glo.nb_moves, glo.params.alternColorSpeed)){
      move = abs(glo.params.alternColorVal - move);
      if(obj.mode.color_white.state || obj.mode.color_black.state){
        tint        = 100 - tint;
        tint_stroke = 100 - tint_stroke;
      }
    }

    if(!glo.colorsAdd){
      if(params.lightByDistMod != 0){
        let coeff = pow(params.lightByDistModCoeff * this.distMinModifiers / canvas.width, params.lightByDistMod);
        tint        *= coeff;
        tint_stroke *= coeff;
      }
      if(params.satByDistMod != 0){
        let coeff = pow(params.satByDistModCoeff * this.distMinModifiers / canvas.width, params.satByDistMod);
        sat *= coeff;
      }
    }

    let a = 1;
    if(!obj.mode.alphaAbs.state){
      a = obj.mode.alpha.state ? 1/(1+move) : 1;
      a = a < obj.params.alpha_color ? obj.params.alpha_color : a;
    }
    else{ a = !this.nearMod.alpha ? obj.params.alpha_color : this.nearMod.alpha ; }

    if(obj.mode.alphaBySize.state){
      let c = this.sizeCalc.s - glo.params.alphaBySize;
      if(c > 0){ a /= pow(c, glo.params.powAlpha); }
    }

    if(glo.formuleColorMode){
      let color = this.formuleColor(move, sat, tint, a);
      move = color.move; sat = color.sat; tint = color.tint; a = color.a;
    }

    if(tint < 0){ tint = 0; }
    if(tint_stroke < 0){ tint_stroke = 0; }
    if(sat < 0){ sat = 0; }

    if(obj.mode.strokeAndFill.state){
      this.strokeStyle = 'hsla(' + move + ', ' + sat + '%, ' + tint_stroke + '%, ' + a +')';
    }

    this.fillStyle = 'hsla(' + move + ', ' + sat + '%, ' + tint + '%, ' + a +')';
  }

  formuleColor(h, s, l, a){
    let hTest = replacesInFormuleColor(glo.formuleColor.h, this);
    let sTest = replacesInFormuleColor(glo.formuleColor.s, this);
    let lTest = replacesInFormuleColor(glo.formuleColor.l, this);
    let aTest = replacesInFormuleColor(glo.formuleColor.a, this);
    return {
      move : eval(hTest),
      sat  : eval(sTest),
      tint : eval(lTest),
      a    : eval(aTest)
    };

    function replacesInFormuleColor(colorElem, av){
      let colorElemTest = colorElem.replaceAll('H', h);

      colorElemTest = colorElemTest.replaceAll('S', s);
      colorElemTest = colorElemTest.replaceAll('L', l);
      colorElemTest = colorElemTest.replaceAll('A', a);

      let xy = av.x*av.y;
      colorElemTest = colorElemTest.replaceAll('xy', xy);
      colorElemTest = colorElemTest.replaceAll('yx', xy);

      colorElemTest = colorElemTest.replace(/(?<!\.)x/g, av.x);
      colorElemTest = colorElemTest.replace(/(?<!\.)y/g, av.y);

      return colorElemTest.replaceAll('A', a);
    }
  }

}


//END CLASS
