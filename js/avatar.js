//------------------ CLASSE POUR INSTANCIER CHAQUE ÉLÉMENT DE DESSIN----------------- //
/**
 * @description Classe pour instancier chaque élément de dessin
 * @param {Object} options - Options de l'avatar
 * @memberof module:avatar
 */
class Avatar {

  constructor(options = {}) {
    this.__colorFns = null;   // {h?,s?,l?,a?, __src}
    this.__exprFns = new Map(); // cache optionnel pour d’autres formules

    this.n_avatars = avatars.length;
    this.x = options.x;
    this.y = options.y;
    this.origin = { x: options.x, y: options.y };
    this.direction = 0;
    this.speed = 0;
    this.size = options.size;
    this.form = activeGlo.form;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.grow = 0;
    this.growLine = 0;
    this.dist_moy = 1
    this.sizeCalc = { s: options.size, x: options.size, y: options.size };
    this.fillStyle = options.fillStyle;
    this.strokeStyle = options.fillStyle;
    this.hsl = { h: 0, s: 0, l: 0, a: 1, p: 1 };
    this.colorMod = activeGlo.modifiersColor;
    this.lasts = [];
    this.lastsSm = [];
    this.multi = [];
    this.nears = [];
    this.numsMod = [];
    this.nearMod = {};
    this.draw = true;
    this.it = num_avatar;
    this.id = num_avatar;
    this.goToNearMod = true;
    this.z = 0;
    this.curveInfos = { nbMoves: 0, proba: 0.5 };

    this.distMinModifiers = 9999;

    if (options.center) { this.center = options.center; }
    if (options.virtual) { this.virtual = options.virtual; }

    avatars.push(this);

    num_avatar++;
  }

  __ensureCompiledColorFormulas = function (formuleColor) {
    let __COLOR_PARAMS__ = ['h', 's', 'l', 'a'];
    if (!formuleColor) { this.__colorFns = null; return; }
    if (!this.__colorFns || this.__colorFns.__src !== formuleColor) {
      this.__colorFns = {
        __src: formuleColor,
        h: formuleColor.h ? createEvalFunctionWithThis(formuleColor.h, __COLOR_PARAMS__) : null,
        s: formuleColor.s ? createEvalFunctionWithThis(formuleColor.s, __COLOR_PARAMS__) : null,
        l: formuleColor.l ? createEvalFunctionWithThis(formuleColor.l, __COLOR_PARAMS__) : null,
        a: formuleColor.a ? createEvalFunctionWithThis(formuleColor.a, __COLOR_PARAMS__) : null,
      };
    }
  };

  __GEN_PARAMS__ = ['x', 'y', 'vx', 'vy', 'ax', 'ay', 'dir', 'size', 'speed', 'accel', 'it', 'id', 'rand'];

  eval_formule = function (expr, overrides = {}) {
    if (!expr) return 0;

    // compile 1x
    let fn = this.__exprFns.get(expr);
    if (!fn) {
      const compiled = new Function(...__GEN_PARAMS__, `return (${expr});`);
      fn = (...args) => compiled.apply(this, args); // `this` utilisable dans l'expression
      this.__exprFns.set(expr, fn);
    }

    // args depuis l’instance, surchargés par overrides si fournis
    const args = [
      overrides.x ?? this.x,
      overrides.y ?? this.y,
      overrides.vx ?? this.vx,
      overrides.vy ?? this.vy,
      overrides.ax ?? this.ax,
      overrides.ay ?? this.ay,
      overrides.dir ?? this.direction,
      overrides.size ?? (this.sizeCalc?.s ?? this.size),
      overrides.speed ?? (this.speed_avatar ? this.speed_avatar() : 0),
      overrides.accel ?? (this.accel_avatar ? this.accel_avatar() : 0),
      overrides.it ?? this.it,
      overrides.id ?? this.id,
      overrides.rand ?? Math.random(),
    ];
    return fn(...args);
  };



  /**
   * @description Renvoie la limite en x pour la collision avec les bords
   * @returns {number} La limite maximale en X.
   */
  lim_x() { let dec = activeGlo.far_rebound ? this.size * 2 : 0; return canvas.width - this.size + dec; }

  /**
   * @description Renvoie la limite en y pour la collision avec les bords
   * @returns {number} La limite maximale en Y.
   */
  lim_y() { let dec = activeGlo.far_rebound ? this.size * 2 : 0; return canvas.height - this.size + dec; }

  /**
   * @description Renvoie les coordonnées d'un vecteur à partir d'un angle et d'une distance
   * @param {number} angle - L'angle du vecteur
   * @param {number} dist - La distance du vecteur
   * @returns {Object} - Un objet représentant les coordonnées du vecteur
   */
  direct(angle, dist) {
    return {
      x: cos(angle) * dist,
      y: sin(angle) * dist
    };
  }

  /**
   * @description Modifie la direction de l'avatar
   */
  gloDir() {
    let angle, force;
    if (this.nearMod.params) {
      angle = this.nearMod.params.dirAngle;
      force = this.nearMod.params.dirForce;
    }
    else {
      angle = activeGlo.params.dirAngle;
      force = activeGlo.params.dirForce;
    }

    force /= 10;

    let dec = this.direct(angle, force);

    this.modifiersValues.x += dec.x;
    this.modifiersValues.y += dec.y;
  }

  /**
   * @description Attire l'avatar vers le centre du canvas
   */
  gloAttract() {
    let force;
    if (this.nearMod.params) {
      force = this.nearMod.params.attractForce;
    }
    else {
      force = activeGlo.params.attractForce;
    }

    let center = { x: canvas.width / 2, y: canvas.height / 2 };

    let angle = atan2piZ(center.x - this.x, center.y - this.y);

    force /= 10;

    let dec = this.direct(angle, force);

    this.modifiersValues.x += dec.x;
    this.modifiersValues.y += dec.y;
  }

  /**
   * @description Retourne la distance de l'avatar avec le centre
   * @returns {number} La distance depuis le centre
   */
  r() {
    return ((this.x - this.center.x) ** 2 + (this.y - this.center.y) ** 2) ** 0.5;
  }

  /**
   * @description Calcule la vitesse de l'avatar
   * @returns {{x: number, y: number, v: number}} - Un objet représentant la vitesse de l'avatar en x, y et la vitesse totale
   */
  vit() {
    let vx = this.x - this.last_x;
    let vy = this.y - this.last_y;
    let v = pow(pow(vx, 2) + pow(vy, 2), 0.5);

    return { x: vx, y: vy, v: v };
  }

  /**
   * @description Modifie la taille de l'avatar
   * @param {*} obj - L'objet contenant les paramètres de taille : soit le nearMod.glo (modifier le plus proche), soit activeGlo qui contient les variables globales du canvas actif
   */
  sizeIt(obj = this.nearMod.num_modifier ? this.nearMod.glo : activeGlo) {
    let size, size_x, size_y;

    ctx.lineWidth = obj.params.line_size;

    if (obj.growDecrease) {
      if (zeroOneCycle(this.it, obj.params.growDecrease)) {
        this.grow += obj.params.growDecreaseCoeff;
        this.growLine += obj.params.growLineDecreaseCoeff * obj.params.growDecreaseCoeff;
      }
      else if (obj.size - obj.params.growDecreaseCoeff >= 0) {
        this.grow -= obj.params.growDecreaseCoeff;
        this.growLine -= obj.params.growLineDecreaseCoeff * obj.params.growDecreaseCoeff;
      }
      ctx.lineWidth = obj.params.line_size + this.growLine;
    }

    let lim_line = obj.params.lim_line;
    if (!obj.var_size) {
      size = obj.size + this.grow;
      if (size <= 0) { size = 0.1; }
      size_x = size;
      size_y = size;
    }
    else {
      let vit = this.vit();
      size = pow(pow(vit.x, 2) + pow(vit.y, 2), 0.5) * obj.size;
      size_x = abs(vit.x) * obj.size;
      size_y = abs(vit.y) * obj.size;

      size = size < lim_line ? size : lim_line;
      size_x = size_x < lim_line ? size_x : lim_line;
      size_y = size_y < lim_line ? size_y : lim_line;
    }

    let coeff = 1, coeffLn = 1;
    if (obj.dimSizeCenter) {
      coeff = this.coeffSizeCenter();

      size *= coeff;
      size_x *= coeff;
      size_y *= coeff;
    }
    if (obj.params.distNearDrawMods) {
      coeffLn = this.coeffSizeMinMod();

      size *= coeffLn;
      size_x *= coeffLn;
      size_y *= coeffLn;
    }

    if (obj.sizeDirCoeff && this.lasts[this.lasts.length - 2]) { size *= this.dirSizeCoeff; }

    if (obj.perm_var_size) {
      let lvs = obj.params.level_var_size;
      if (rnd() > 0.5) {
        size = size * (1 + rnd()) * lvs;
        ctx.lineWidth = ctx.lineWidth * (1 + rnd()) * obj.params.level_var_size;
      }
      else {
        size = size / (1 + rnd()) / lvs;
        ctx.lineWidth = ctx.lineWidth / (1 + rnd()) / obj.params.level_var_size;
      }
    }

    if (this.infoSelect) { size *= 4; }

    ctx.lineWidth *= coeff * coeffLn;
    this.sizeCalc = { s: size, x: size_x, y: size_y };
    this.nearMod.size = size;
  }

  /**
   * @description Dessine l'avatar sur le canvas
   * @param {string} form - La forme de l'avatar
   * @param {object} objGlo - Les paramètres globaux de l'avatar
   */
  draw_avatar(form = this.nearMod.glo ? this.nearMod.glo.form : activeGlo.form, objGlo = this.nearMod.glo ? this.nearMod.glo : activeGlo) {
    let size = this.sizeCalc.s;
    let size_x = this.sizeCalc.x;
    let size_y = this.sizeCalc.y;

    let x = this.x, y = this.y;

    if (objGlo.doubleAvatar) {
      let dir = this.direction;
      let dec = direction(dir + half_pi, objGlo.params.dblAvDist);
      x -= dec.x;
      y -= dec.y;
    }

    let addAngle = 0;
    ctx.beginPath();
    switch (form) {
      case 'circle':
        if (objGlo.params.arcRotAngle > 0) {
          addAngle = cyclicNumber(-0.1 * objGlo.nb_moves * objGlo.params.arcRotAngle, objGlo.params.arcEndAngle - objGlo.params.arcStartAngle - rad);
        }
        ctx.arc(x, y, size, objGlo.params.arcStartAngle + addAngle, objGlo.params.arcEndAngle);
        break;
      case 'ellipse':
        let oval_size = objGlo.params.oval_size;
        let sx = !objGlo.sameSizeEllipse ? (1 + size) * (1 + this.speed * oval_size) : (1 + size) * (1 + oval_size);
        let sy = !objGlo.sameSizeEllipse ? 1 + size * oval_size : size * oval_size;

        this.sizeCalc.x = sx;
        this.sizeCalc.y = sy;

        let dir = this.direction;
        if (!objGlo.rotateBrush) { dir = 0; }

        if (objGlo.params.arcRotAngle > 0) {
          addAngle = cyclicNumber(-0.1 * this.it * objGlo.params.arcRotAngle, objGlo.params.arcEndAngle - objGlo.params.arcStartAngle - rad);
        }
        ctx.ellipse(x, y, sx, sy, dir, objGlo.params.arcStartAngle + addAngle, objGlo.params.arcEndAngle);
        break;
      case 'square':
        ctx.rect(x, y, size_x, size_y);
        break;
      case 'poly':
        ctx.polygone({ pos: { x: x, y: y }, size: size, nb_edges: objGlo.params.nb_edges, color: this.fillStyle });
        break;
      case 'cloud':
        ctx.cloud({
          pos: { x: x, y: y }, size: size, nb_points: objGlo.params.nb_points_cloud,
          sz_point: objGlo.params.sz_points_cloud, withLine: objGlo.withLine, color: this.fillStyle
        });
        break;
      case 'alea_form':
        ctx.alea_form({ pos: { x: x, y: y }, size: size, nb_edges: objGlo.params.nb_edges, color: this.fillStyle });
        break;
      case 'line':
      case 'bezier':
        let last = this.lasts[this.lasts.length - 1];
        if (objGlo.secondMove && this.lasts[this.lasts.length - 2]) { last = this.lasts[this.lasts.length - 2]; }
        let last_x = last.x;
        let last_y = last.y;
        let dx = x - last_x;
        let dy = y - last_y;
        let dist = pow(pow(dx, 2) + pow(dy, 2), 0.5);

        if (objGlo.doubleAvatar) {
          let dir = this.direction;
          let dec = direction(dir + half_pi, objGlo.params.dblAvDist);

          if (objGlo.sizeDirCoeff && this.lasts[this.lasts.length - 2]) { dec.x *= this.dirSizeCoeff; dec.y *= this.dirSizeCoeff; }

          last_x -= dec.x;
          last_y -= dec.y;
        }

        if (!objGlo.noLimLine) {
          last_x = dist < objGlo.params.lim_line ? last_x : last_x + dx / objGlo.params.div_line;
          last_y = dist < objGlo.params.lim_line ? last_y : last_y + dy / objGlo.params.div_line;
        }

        if (objGlo.dash > 0) { ctx.setLineDash([objGlo.dash, objGlo.dash]); }

        ctx.lineCap = objGlo.lineCap[objGlo.numLineCap % 3];
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.fillStyle;

        if (form == 'line') {
          ctx.moveTo(last_x, last_y);
          ctx.lineTo(x, y);
        }
        else {
          let ln = redimLine({ x: last_x, y: last_y }, { x: x, y: y }, 10);
          ctx.bezier(ln.startPt, ln.endPt);
        }

        break;
      case 'cross':
        ctx.crossDiag({ x: x, y: y }, size);
        break;
      case 'brush':
        if (objGlo.stepsBrush && objGlo.stepsBrush[0]) {
          let ptsB = deepCopy(objGlo.stepsBrush);

          if (objGlo.rotateBrush) {
            ptsB.forEach((ptBrush, i) => {
              ptsB[i].vector = rotate(ptBrush.vector, { x: 0, y: 0 }, this.direction);
            });
          }

          if (activeGlo.params.formVarLevel) {
            let formVarLevel = activeGlo.params.formVarLevel / 10;
            ptsB.forEach((ptBrush, i) => {
              ptsB[i].vector = { x: ptBrush.vector.x + rnd_sign() * formVarLevel, y: ptBrush.vector.y + rnd_sign() * formVarLevel };
            });
          }

          ctx.brush({ x: x, y: y }, size / 2, ptsB);
        }
        break;
    }

    var stroke = objGlo.stroke;
    if (objGlo.alea_stroke) { stroke = rnd() < 0.5 ? true : false; }
    if (objGlo.strokeAndFill) {
      ctx.strokeStyle = this.strokeStyle;
      ctx.fillStyle = this.fillStyle;
      ctx.stroke();
      ctx.fill();
    }
    else if (!stroke && form != 'line' && form != 'cross' && form != 'bezier') {
      ctx.fillStyle = this.fillStyle;
      ctx.fill();
    }
    else {
      ctx.strokeStyle = this.strokeStyle;
      ctx.stroke();
    }

    if (objGlo.tail && this.draw && !this.lapWithoutDraw) { this.drawTail(); }

    if (objGlo.doubleAvatar) {
      objGlo.doubleAvatar = false;
      let posSave = { x: this.x, y: this.y };
      let lastSave = { x: this.lasts[this.lasts.length - 1].x, y: this.lasts[this.lasts.length - 1].y };
      let dir = this.direction;
      let dec = direction(dir + half_pi, objGlo.params.dblAvDist);

      if (objGlo.sizeDirCoeff && this.lasts[this.lasts.length - 2]) { dec.x *= this.dirSizeCoeff; dec.y *= this.dirSizeCoeff; }

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

  /**
   * @description Limite la vitesse maximale d'un vecteur
   * @param {{x: number, y: number}} v - Le vecteur à limiter
   * @param {number} lim - La limite de vitesse
   */
  limSpeedMax(v = this.modifiersValues, lim = this.nearMod.params ? this.nearMod.params.limSpeedMax : activeGlo.params.limSpeedMax) {
    if (lim > 0) {
      let d = h(v.x, v.y);
      if (d > lim) {
        let lim_d = lim / d;

        v.x *= lim_d;
        v.y *= lim_d;
      }
    }
  }

  /**
   * @description Limite la vitesse minimale d'un vecteur
   * @param {{x: number, y: number}} v - Le vecteur à limiter
   * @param {number} lim - La limite de vitesse
   */
  limSpeedMin(v = this.modifiersValues, lim = this.nearMod.params ? this.nearMod.params.limSpeedMin : activeGlo.params.limSpeedMin) {
    if (lim > 0) {
      let d = h(v.x, v.y);
      if (d < lim) {
        let lim_d = lim / d;

        v.x *= lim_d;
        v.y *= lim_d;
      }
    }
  }

  /**
   * @description Limite la vitesse d'un vecteur en fonction de sa taille
   * @param {{x: number, y: number}} v - Le vecteur à limiter
   * @param {number} lim - La limite de vitesse
   */
  limSpeedBySize(v = this.modifiersValues, lim = this.sizeCalc.x * 2) {
    let d = h(v.x, v.y);
    let lim_d = lim / d;

    v.x *= lim_d;
    v.y *= lim_d;
  }

  /**
   * @description Dessine la queue de l'avatar
   */
  drawTail() {
    let lastsSz = this.lasts.length;
    let tailDec = -activeGlo.params.tailDec;

    let dec = { x: 0, y: 0 };

    if ((this.nearMod.glo && this.nearMod.glo.form === 'ellipse') || activeGlo.form === 'ellipse') {
      dec = { x: tailDec * this.sizeCalc.x * cos(this.direction), y: tailDec * this.sizeCalc.x * sin(this.direction) };
    }

    if (lastsSz) {
      ctx.beginPath();
      ctx.strokeStyle = this.fillStyle;
      for (let i = 0; i < lastsSz; i++) {
        ctx.lineTo(this.lasts[i].x + dec.x, this.lasts[i].y + dec.y);
      }
      ctx.stroke();
    }
  }

  /**
   * @description Calcule la position secondaire de l'avatar pour un mouvement additionnel
   */
  secondMove() {
    if (this.secondMovePos) {
      this.lastSm = { x: this.secondMovePos.x, y: this.secondMovePos.y };
      this.lastsSm.push(this.lastSm);
      if (this.lastsSm.length > activeGlo.params.tail_memory) { this.lastsSm.shift(); }
    }
    else {
      this.lastSm = { x: this.x, y: this.y };
      this.lastsSm.push(this.lastSm);
    }

    let d = cos(this.it * activeGlo.params.secondMoveIt * rad) * activeGlo.params.secondMoveRange;
    let dir = direction(this.direction + half_pi, d);
    this.secondMovePos = { x: this.x + dir.x, y: this.y + dir.y };
  }

  /**
   * Vérifie si l'avatar est proche de la souris
   * @param {number} dist - La distance à vérifier
   * @returns {number|boolean} La distance entre l'avatar et la souris ou false si l'avatar n'est pas proche de la souris
   */
  nearMouse(dist) {
    if (this.x < mouse.x + dist && this.x > mouse.x - dist && this.y < mouse.y + dist && this.y > mouse.y - dist) { return h(this.x - mouse.x, this.y - mouse.y); }

    return false;
  }

  /**
   * @description Calcule le coefficient de taille en fonction de la vitesse de direction
   */
  coeffDirSize() {
    this.speedDir();
    this.dirSizeCoeff = pow(pow(1 - this.dirSpeed / two_pi, activeGlo.params.sizeDirCoeff), abs(activeGlo.params.sizeDirCoeff));
  }

  /**
   * @description Calcule la vitesse de changement de direction de l'avatar
   */
  speedDir() {
    if (!this.direction) { this.dir(); }
    let dirAv = atan2piZ(this.x - this.lasts[this.lasts.length - 2].x, this.y - this.lasts[this.lasts.length - 2].y);
    this.dirSpeed = abs(this.direction - dirAv);
  }

  /**
   * @description Calcule un coefficient de taille en fonction de la distance de l'avatar par rapport au centre
   * @returns {number} Le coefficient de taille
   */
  coeffSizeCenter() {
    let center = !this.center ? { x: canvas.width / 2, y: canvas.height / 2 } : this.center;
    let dist_to_center = this.dist_to_center(center) + 1;
    let h = canvas.height / 2;

    let k = activeGlo.params.coeffDimSizeCenter;
    let coeff = dist_to_center / h;

    return pow(coeff, k);
  }

  /**
   * @description Calcule un coefficient de taille en fonction de la distance minimale aux modifiers
   * @returns {number} Le coefficient de taille
   */
  coeffSizeMinMod() {
    let coeff = 1;

    if (this.distMinModifiers < activeGlo.params.distNearDrawMods) {
      coeff = this.distMinModifiers / activeGlo.params.distNearDrawMods;
    }
    return coeff;
  }

  /**
   * @description Met à jour la liste des avatars proches de cet avatar
   */
  nearAvatars() {
    this.nears = []; let lim = activeGlo.lim_dist;
    for (let i = 0; i < avatars.length; i++) {
      if (this.dist_av(avatars[i]) <= lim && avatars[i] != this) { this.nears.push(avatars[i]); }
    }
  }

  /**
   * @description Change la direction de l'avatar en cas de collision avec les bords du canvas
   */
  collidBorder() {
    let x = this.x;
    let y = this.y;
    let size = activeGlo.far_rebound ? -this.size * 2 : this.size;

    var is_inv = false;

    let lim_x = this.lim_x();
    let lim_y = this.lim_y();

    if (x < size) { x = size; this.invDir(); is_inv = true; }
    else if (x > lim_x) { x = lim_x; this.invDir(); is_inv = true; }
    if (y < size) { y = size; if (!is_inv) { this.invDir(false); } }
    else if (y > lim_y) { y = lim_y; if (!is_inv) { this.invDir(false); } }

    if (x > lim_x && y > lim_y) { x = lim_x - this.size; y = lim_y - this.size; }

    this.x = x;
    this.y = y;
  }

  /**
   * @description Inverse la direction de la vitesse de l'avatar en cas de collision
   * @param {boolean} axe_x - Si vrai, inverse la direction sur l'axe X, sinon sur l'axe Y
   */
  invDir(axe_x = true) {
    if (!activeGlo.normalCollid) {
      this.vx = -this.vx;
      this.vy = -this.vy;
    }
    else {
      if (axe_x) { this.vx = -this.vx; }
      else { this.vy = -this.vy; }
    }
  }

  /**
   * @description Calcule la distance entre cet avatar et le modifier le plus proche
   * @param {...string} args - Types de modifiers à prendre en compte (optionnel)
   * @returns {number} La distance minimale du modifier le plus proche
   */
  distMinMods(...args) {
    this.distMinModifiers = 9999;

    let weightDistMinMod = mod.glo.params.weightDistMinMod;
    if (args.length == 0) {
      let modifiersSz = activeGlo.modifiers.length;
      for (let i = 0; i < modifiersSz; i++) {
        let mod = activeGlo.modifiers[i];
        let dist = pow(pow(this.x - mod.x, 2) + pow(this.y - mod.y, 2), 0.5) / weightDistMinMod;
        if (dist < this.distMinModifiers) { this.distMinModifiers = dist; this.nearMod = mod; }
      }
    }
    else {
      args.map(arg => {
        activeGlo.modifiers.filter(mod => mod.type == arg).map(mod => {
          let dist = pow(pow(this.x - mod.x, 2) + pow(this.y - mod.y, 2), 0.5) / weightDistMinMod;
          if (dist < this.distMinModifiers) { this.distMinModifiers = dist; this.nearMod = mod; }
        });
      });
    }
    return this.distMinModifiers;
  }

  /**
   * @description Trouve le second modifier le plus proche de l'avatar
   * @returns {Object} Le second modifier le plus proche et sa distance
   */
  secondNearMod() {
    let nearMod, nearModSecond;
    let distMinModifiers = 9999;
    let modifiersSz = activeGlo.modifiers.length;
    for (let i = 0; i < modifiersSz; i++) {
      let mod = activeGlo.modifiers[i];
      let dist = h(this.x - mod.x, this.y - mod.y);
      if (dist < distMinModifiers) { distMinModifiers = dist; nearMod = mod; }
    }
    distMinModifiers = 9999;
    for (let i = 0; i < modifiersSz; i++) {
      let mod = activeGlo.modifiers[i];
      let dist = h(this.x - mod.x, this.y - mod.y);
      if (dist < distMinModifiers && mod != nearMod) { distMinModifiers = dist; nearModSecond = mod; }
    }

    return { secondNearMod: nearModSecond, secondDistMinModifiers: distMinModifiers };
  }

  /**
   * @description Calcule et applique les forces d’interaction entre cet avatar et ses voisins proches
   * @param {Object} [obj] - Contexte de paramètres à utiliser.
   * Par défaut, prend `activeGlo` si `activeGlo.hyperAlea` est désactivé, sinon `this.glo`.
   */
  interaction(obj = !activeGlo.hyperAlea ? activeGlo : this.glo) {
    let attract = obj.params.attract / 100;
    let lim_attract = obj.params.lim_attract;
    let same_dir = obj.params.same_dir;
    let out_dir = obj.params.out_dir;
    let out_force = obj.params.out_force;
    let dep_dir = obj.params.dep_dir;
    let brake_pow = obj.params.brake_pow;
    let chaos_lim = obj.params.chaos_dist;
    let chaos_force = obj.params.chaos_force;
    let follow_force_x = obj.params.follow_force_x;
    let follow_force_y = obj.params.follow_force_y;
    let alea_attract = activeGlo.alea_attract;
    let inv_g = obj.inverse_g ? -1 : 1;
    let dist_mean = obj.dist_mean;
    let dist_moy = activeGlo.dist_moy;
    let dist_mean_inv = obj.dist_mean_inv;
    let dist_mean_one = obj.dist_mean_one;
    let is_chaos = obj.chaos;
    let breakAdd = obj.params.breakAdd;

    if (activeGlo.alea_inv_g) { inv_g = activeGlo.nb_moves % dep_dir == 0 ? -activeGlo.params.inv_g_force : 1; }

    this.ax = 0;
    this.ay = 0;
    let nb_nears = 0;
    let att = attract;

    let avatar, x_avatar, y_avatar, x_av, y_av, dist, lim, brake, siz, vit, x, y;

    for (let i = 0; i < this.nears.length; i++) {
      avatar = this.nears[i];
      if (this != avatar) {
        x_avatar = avatar.x;
        y_avatar = avatar.y;
        x_av = this.x;
        y_av = this.y;
        lim = (avatar.size + this.size) / 2;

        x = x_avatar - x_av; y = y_avatar - y_av;
        dist = this.dist_av(avatar);
        this.dist += dist;

        if (obj.crossPoints && dist < obj.params.crossPointsLim) {
          let arrCol = this.fillStyle.split(',');
          arrCol[0] = arrCol[0].substring(4);
          arrCol.forEach((col, i) => { if (i < 3) { arrCol[i] = 255 - parseInt(col); } });

          let strCol = "rgb(" + arrCol[0] + "," + arrCol[1] + "," + arrCol[2] + "," + arrCol[3];

          crossPoints.push({ x: x_av, y: y_av, color: strCol });
          if (crossPoints.length > 2048) { crossPoints.shift(); }
        }

        if (dist <= lim * same_dir) {
          this.vx += follow_force_x * avatar.vx;
          this.vy += follow_force_y * avatar.vy;
          nb_nears++;
        }
        if (dist >= lim_attract) {
          brake = breakAdd + pow(dist, brake_pow);
          if (attract && alea_attract) {
            if (!this.signAleaAttract || this.signAleaAttract.nbLaps >= activeGlo.params.aleaAttractLaps) {
              this.signAleaAttract = { sign: Math.sign(rnd_sign()), nbLaps: 1, att: rnd() };
            }
            else {
              this.signAleaAttract.nbLaps++;
            }
            att = 10 * attract * this.signAleaAttract.sign * this.signAleaAttract.att;
          }

          siz = this.size;
          vit = !obj.gSpeed ? 1 : avatar.vit().v;

          if (isNaN(vit)) { vit = 1; }

          let outF = 0;
          if (dist <= lim * out_dir) { outF = -out_force * inv_g; }

          if (dist_mean && dist_moy) {
            if (!dist_mean_inv && this.dist_moy < dist_moy) { inv_g = -inv_g; }
            else if (dist_mean_inv && this.dist_moy > dist_moy) { inv_g = -inv_g; }
          }
          else if (dist_mean_one && dist_moy) {
            if (!dist_mean_inv && this.dist_moy < dist) { inv_g = -inv_g; }
            else if (dist_mean_inv && this.dist_moy > dist) { inv_g = -inv_g; }
          }

          let f = inv_g * att * (outF + siz + vit * obj.params.gSpeed) / brake;
          let addX = f * x;
          let addY = f * y;

          this.ax += addX;
          this.ay += addY;

          let modsDevForce = activeGlo.params.modsDevForce;
          modsDevForce = this.n_avatars % 2 ? modsDevForce : -modsDevForce;
          if (modsDevForce != '0') {
            let modsDevDir = activeGlo.params.modsDevDir;

            let dist = h(addX, addY);
            let dir = atan2piZ(addX, addY);
            let dec = direction(dir + modsDevDir, dist * modsDevForce);

            this.ax += dec.x;
            this.ay += dec.y;
          }
        }
        if (is_chaos && dist <= lim * chaos_lim) {
          let chaos = chaos_force / (1 + dist);
          this.ax += chaos * rnd_sign();
          this.ay += chaos * rnd_sign();
        }
      }
    }

    if (nb_nears > 0) {
      this.vx /= nb_nears;
      this.vy /= nb_nears;
    }
  }

  /**
   * @description Déplace l'avatar à une position aléatoire dans un cercle de rayon défini
   */
  moveOnAlea() {
    this.draw = false;
    this.draw_ok = false;
    this.lasts = [];
    this.lastsSm = [];

    let point;
    let size = activeGlo.params.rAleaPos;
    if (!activeGlo.moveOnOrigin) {
      point = getRandomPointInCircle(size, activeGlo.modifiers.length ?
        activeGlo.randomPointByMod : false, activeGlo.followAvatar, activeGlo.followAvatar ? this.avToFollow : false);
    }
    else {
      if (!activeGlo.params.avToOriginOffset) {
        point = this.origin;
      }
      else {
        point = getRandomPointInCircle(activeGlo.params.avToOriginOffset / 10, false, this.origin, false);
      }
    }

    this.x = point.x;
    this.y = point.y;
  }

  /**
   * Applique une force d'attraction vers la souris
   * @param {boolean} [pause=false] - Si vrai, met en pause l'attraction (réinitialise l'accélération)
   */
  mouse_attract(pause = false) {
    let brake_pow = activeGlo.params.brake_pow;
    let mouseG = activeGlo.params.wheel_force;

    if (activeGlo.attract_center) { mouse.x = canvas.width / 2; mouse.y = canvas.height / 2; }

    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;

    let brake = 216 + (pow(this.mouse_dist(), brake_pow));
    if (!pause) {
      this.ax += dx * mouseG / brake;
      this.ay += dy * mouseG / brake;
    }
    else {
      this.ax = dx * mouseG / brake;
      this.ay = dy * mouseG / brake;
    }
  }

  /**
   * @description Applique une force de rotation autour de la souris
   */
  mouse_rotate() {
    let angle = activeGlo.params.wheel_force / (this.mouse_dist() ** 2);

    if (activeGlo.attract_center) { mouse.x = canvas.width / 2; mouse.y = canvas.height / 2; }

    this.rotate(angle, mouse, { x: 1, y: 1 });
  }

  /**
   * @description Applique une force de croissance autour de la souris
   */
  mouse_growing() { this.grow = activeGlo.params.wheel_force / (2 + pow(this.mouse_dist(), 0.7)); }

  /**
   * @description Applique une force d'assombrissement autour de la souris
   */
  mouse_darking() { this.dark = activeGlo.params.wheel_force / (2 + pow(this.mouse_dist(), 0.7)); }

  /**
   * @description Calcule la distance entre l'avatar et la souris
   * @returns {number} La distance entre l'avatar et la souris
   */
  mouse_dist() { return pow(pow(mouse.x - this.x, 2) + pow(mouse.y - this.y, 2), 0.5); }

  /**
   * @description Applique une translation à l'avatar
   * @param {string} dir - La direction de la translation ('left', 'right', 'up', 'down')
   */
  trans(dir) {
    switch (dir) {
      case 'left':
        this.x -= 2;
        break;
      case 'right':
        this.x += 2;
        break;
      case 'up':
        this.y -= 2;
        break;
      case 'down':
        this.y += 2;
        break;
    }
  }

  /**
   * @description Fait suivre un avatar par un autre
   */
  follow() {
    if (activeGlo.style == 0) {
      if (this.nears.length > 0) {
        let avToFollow;
        if (typeof (this.avToFollow) == 'undefined') {
          this.avToFollow = this.nears[getRandomIntInclusive(0, this.nears.length - 1, true)];
          this.avToFollow.avToFollow = this;
        }
        if (typeof (this.avToFollow) != 'undefined') {
          if (this.avToFollow == this) { this.avToFollow = undefined; this.follow(); }

          this.vx = -this.avToFollow.vx;
          this.vy = -this.avToFollow.vy;
        }
      }
    }
    else {
      let x = this.x, y = this.y;
      let cx = cos(x * rad);
      let cy = cos(y * rad);

      let x_val = cy, y_val = cx;

      if (activeGlo.formule.x != 0 && !activeGlo.formule.error.x) {
        let form_x = this.eval_formule(activeGlo.formule.x);
        if (!isNaN(form_x)) { x_val = form_x; }
      }
      if (activeGlo.formule.y != 0 && !activeGlo.formule.error.y) {
        let form_y = this.eval_formule(activeGlo.formule.y);
        if (!isNaN(form_y)) { y_val = form_y; }
      }

      this.x += x_val;
      this.y += y_val;

      this.x = this.x;
      this.y = this.y;
    }
  }

  /**
   * @description Fait orbiter l'avatar autour d'un autre avatar
   */
  orbite() {
    let avToOrbite;
    if (activeGlo.style == 1) {
      if (typeof (this.number_orbite) == 'undefined' || typeof (this.nears[this.number_orbite]) == 'undefined') {
        this.number_orbite = getRandomIntInclusive(0, this.nears.length - 1, true);
      }
      avToOrbite = this.nears[this.number_orbite];
    }
    else {
      if (typeof (this.avToOrbite) == 'undefined') {
        this.avToOrbite = this.nears[getRandomIntInclusive(0, this.nears.length - 1, true)];
      }
      avToOrbite = this.avToOrbite;
    }

    if (typeof (avToOrbite) != 'undefined') {
      if (activeGlo.style == 1) { avToOrbite.number_orbite = this.n_avatars; }
      else { avToOrbite.avToOrbite = this; }
      this.rotate(activeGlo.params.orbite_angle / 10, { x: avToOrbite.x, y: avToOrbite.y });
    }
  }

  /**
   * @description Fait attirer l'avatar par un autre avatar pris au hasard parmi les voisins proches
   */
  attractByOne() {
    let avToGo;
    if (this.it % activeGlo.params.keep_dir == 0) {
      this.avToGo = this.nears[getRandomIntInclusive(0, this.nears.length - 1, true)];
    }
    avToGo = this.avToGo;

    if (typeof (avToGo) != 'undefined') {
      let dist = this.dist_av(avToGo);
      let x = avToGo.x - this.x;
      let y = avToGo.y - this.y;

      let brake = pow(dist, activeGlo.params.brake_pow);

      let k = 100;
      this.ax += k * x / brake;
      this.ay += k * y / brake;
    }
  }

  /**
   * Applique une transformation matricielle à un point
   * @param {{x: number, y: number}} pt - Le point à transformer
   * @param {number[][]} mat - La matrice de transformation
   * @returns {{x: number, y: number}} Le point transformé
   */
  matrix(pt, mat) {
    return { x: pt.x * mat[0][0] + pt.y * mat[0][1], y: pt.x * mat[1][0] + pt.y * mat[1][1] };
  }

  /**
   * @description Applique une rotation éventuellement elliptique et/ou spiralée à l'avatar
   * @param {number} angle - L'angle de rotation
   * @param {{x: number, y: number}} center - Le centre de rotation
   * @param {{x: number, y: number}} ellipse - Les paramètres de l'ellipse
   * @param {number} spiral - La force de la spirale
   * @param {{force: number, dir: number}} modsDev - Les modifications à appliquer par les modifiers
   */
  rotate(angle = activeGlo.params.rotate_angle, center = { x: canvas.width / 2, y: canvas.height / 2 },
    ellipse = { x: activeGlo.params.ellipse_x, y: activeGlo.params.ellipse_y }, spiral = activeGlo.params.spiral_force, modsDev = { force: 0, dir: 0 }) {
    let xM, yM;
    let k = ellipse.x / ellipse.y;

    xM = (this.x - center.x) / spiral;
    yM = (this.y - center.y) / spiral;

    let mat = [
      [cos(angle), -k * sin(angle)],
      [1 / k * sin(angle), cos(angle)]
    ];

    let pt = this.matrix({ x: xM, y: yM }, mat);

    let new_x = pt.x + center.x;
    let new_y = pt.y + center.y;

    let addX = new_x - this.x;
    let addY = new_y - this.y;

    this.modifiersValues.x += addX;
    this.modifiersValues.y += addY;

    if (modsDev.force != '0') {
      let dist = h(addX, addY);
      let dir = atan2piZ(addX, addY);
      let dec = direction(dir + modsDev.dir, dist * modsDev.force);

      this.modifiersValues.x += dec.x;
      this.modifiersValues.y += dec.y;
    }
  }

  /**
   * @description Applique une rotation elliptique à l'avatar, éventuellement orientée par le modifier le plus proche
   * @param {number} angle - L'angle de rotation
   * @param {{x: number, y: number}} center - Le centre de rotation
   * @param {{x: number, y: number}} ellipse - Les paramètres de l'ellipse
   * @param {number} angleEllipse - L'angle de l'ellipse
   * @param {number} spiral - La force de la spirale
   * @param {boolean} fromMod - Indique si la rotation provient d'un modificateur
   */
  rotateEllipse(angle = activeGlo.params.rotate_angle, center = { x: canvas.width / 2, y: canvas.height / 2 },
    ellipse = { x: activeGlo.params.ellipse_x, y: activeGlo.params.ellipse_y }, angleEllipse = 0, spiral = activeGlo.params.spiral_force, fromMod = true) {
    let xM, yM;
    let k = ellipse.x / ellipse.y;

    if (this.nearMod.glo && this.nearMod.glo.orientedPoly) {
      angleEllipse = this.nearMod.dir_angle;
    }
    else if (activeGlo.orientedPoly && fromMod) {
      angleEllipse = activeGlo.params.dirAngle;
    }

    let paramsObj = this.nearMod.params ? this.nearMod.params : activeGlo.params;

    if (paramsObj.orientedPoly && fromMod) { angleEllipse = paramsObj.dir_angle; }

    let mat = [
      [cos(angle), -k * sin(angle)],
      [1 / k * sin(angle), cos(angle)]
    ];

    let pt;
    if (!this.firstRotDone) {
      this.firstRotDone = true;
      xM = (this.x - center.x) / spiral;
      yM = (this.y - center.y) / spiral;
    }
    else {
      pt = rotate({ x: this.x, y: this.y }, center, -angleEllipse);
      xM = (pt.x - center.x) / spiral;
      yM = (pt.y - center.y) / spiral;
    }

    pt = this.matrix({ x: xM, y: yM }, mat);
    pt = { x: pt.x + center.x, y: pt.y + center.y };
    pt = rotate(pt, center, angleEllipse);

    this.modifiersValues.x += (pt.x - this.x);
    this.modifiersValues.y += (pt.y - this.y);
  }

  /**
   * @description Applique une rotation éventuellement elliptique à l'avatar, mais ne modifie rien et renvoie la nouvelle position calculée
   * @param {number} angle - L'angle de rotation
   * @param {{x: number, y: number}} center - Le centre de rotation
   * @param {{x: number, y: number}} ellipse - Les paramètres de l'ellipse
   * @param {number} spiral - La force de la spirale
   * @returns {{x: number, y: number}} La nouvelle position calculée
   */
  rotateCalc(angle = activeGlo.params.rotate_angle, center = { x: canvas.width / 2, y: canvas.height / 2 },
    ellipse = { x: activeGlo.params.ellipse_x, y: activeGlo.params.ellipse_y }, spiral = activeGlo.params.spiral_force) {
    let xM, yM;
    let k = ellipse.x / ellipse.y;

    xM = (this.x - center.x) / spiral;
    yM = (this.y - center.y) / spiral;

    let mat = [
      [cos(angle), -k * sin(angle)],
      [1 / k * sin(angle), cos(angle)]
    ];

    let pt = this.matrix({ x: xM, y: yM }, mat);

    return { x: pt.x + center.x, y: pt.y + center.y };
  }

  /**
   * @description Applique une rotation polygonale à l'avatar
   * @param {number} speed
   * @param {{x: number, y: number}} center
   * @param {boolean} noAvCenter
   * @param {number} nbEdges
   * @param {boolean} brake
   * @param {number} polyRotAngle
   * @param {{force: number, dir: number}} modsDev
   */
  rotPoly(speed = activeGlo.params.trirotate_angle, center = { x: canvas.width / 2, y: canvas.height / 2 },
    noAvCenter = false, nbEdges = activeGlo.params.polyRotNbEdges, brake = false, polyRotAngle = activeGlo.params.polyRotAngle, modsDev = { force: 0, dir: 0 }) {
    if (this.center && !noAvCenter) { center = this.center; }
    speed /= 15;

    let dx = this.x - center.x;
    let dy = this.y - center.y;
    let d = h(dx, dy);

    let angle = atan2pi(dx, dy) + polyRotAngle;

    let x = 0, y = 0;

    let edgeAngle = two_pi / nbEdges;
    let firstAngle = edgeAngle / 2;

    let a = flatNumber(angle, edgeAngle);

    let numSide = round(a / edgeAngle, 0);
    let midR = abs(d * cos(a + firstAngle - angle));
    let r = midR / cos(firstAngle);

    if (brake) { speed /= pow(r, brake / 1.18); }
    speed *= midR;

    let k = a - polyRotAngle + firstAngle;

    x = speed * cos(k);
    y = -speed * sin(k);

    if (activeGlo.polyPrecision) {
      let nextSide = { x: center.x + r * cos(two_pi * numSide / nbEdges), y: center.y + r * sin(two_pi * numSide / nbEdges) };

      let distToNextSide = h(nextSide.x - this.x, nextSide.y - this.y);
      let distToNextPoint = h(x, y);

      if (distToNextPoint > distToNextSide) {
        x = nextSide.x - this.x;
        y = nextSide.y - this.y;
      }
    }

    this.modifiersValues.x -= x;
    this.modifiersValues.y -= y;

    if (modsDev.force != '0') {
      let dist = h(x, y);
      let dir = atan2piZ(x, y);
      let dec = direction(dir + modsDev.dir, dist * modsDev.force);

      this.modifiersValues.x += dec.x;
      this.modifiersValues.y += dec.y;
    }
  }

  /**
   * @description Vérifie si la prochaine position de l'avatar est dans une zone blanche (sans dessin)
   * @returns {boolean} Vrai si la prochaine position de l'avatar est dans une zone blanche (sans dessin), sinon faux
   */
  nextIsBlank() {
    let obj = this.nearMod.num_modifier ? this.nearMod.glo : activeGlo;

    for (let i = 0; i < obj.params.sizeToSearchBlank; i++) {
      for (let j = 0; j < obj.params.sizeToSearchBlank; j++) {
        if (!ctx.isBlank({ x: this.x + i, y: this.y + j })) { return false; }
        if (!ctx.isBlank({ x: this.x + i, y: this.y - j })) { return false; }
        if (!ctx.isBlank({ x: this.x - i, y: this.y + j })) { return false; }
        if (!ctx.isBlank({ x: this.x - i, y: this.y - j })) { return false; }
      }
    }
    return true;
  }

  /**
   * @description Courbe la trajectoire de l'avatar
   */
  curve() {
    let speed = { x: 0, y: 0 };
    const baseSpeed = 1;

    if (!this.curveInfos.nbMoves) {
      this.curveInfos.nbMoves = 1;
      this.curveInfos.proba = (rnd() + 0.5) / 2;
      speed = { x: baseSpeed * rnd_sign(), y: baseSpeed * rnd_sign() };
    }
    else {
      if (this.curveInfos.nbMoves % (2 * NB_FPS) == 0) { this.curveInfos.proba = 0.75 - this.curveInfos.proba; }
      if (this.curveInfos.nbMoves % (8 * NB_FPS) == 0) { this.curveInfos.proba = (rnd() + 0.5) / 2; }
      if (this.curveInfos.nbMoves % (16 * NB_FPS) == 0) { this.curveInfos.proba = 0.5; }

      speed = direction(this.direction + (rnd_sign(this.curveInfos.proba) / (activeGlo.params.rCurve / 40)), baseSpeed);
    }

    this.modifiersValues.curve.x += speed.x;
    this.modifiersValues.curve.y += speed.y;

    this.curveInfos.nbMoves++;
  }

  /**
   * @description Récupère la vitesse de l'avatar avant le dernier mouvement
   * @returns {number} La vitesse de l'avatar avant le dernier mouvement
   */
  speedBefore() {
    let lastsSz = this.lasts.length;
    if (lastsSz > 1) {
      let last = this.lasts[lastsSz - 1];
      let lastBf = this.lasts[lastsSz - 2];

      return pow(pow(last.x - lastBf.x, 2) + pow(last.y - lastBf.y, 2), 0.5);
    }
  }

  /**
   * @description Calcule la distance entre cet avatar et un autre avatar
   * @param {Object} avatar - L'autre avatar
   * @returns {number} La distance entre les deux avatars
   */
  distanceTo(avatar) {
    let dx = this.x - avatar.x;
    let dy = this.y - avatar.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * @description Calcule l'arête opposée d'un polygone régulier
   * @param {number} nbEdges - Le nombre d'arêtes du polygone
   * @returns {number} L'arête opposée
   */
  oppositeEdge(nbEdges) {
    let angle = (PI * (nbEdges - 2)) / (2 * nbEdges);
    let coeff = pow((1 / sin(angle)) ** 2 - 1, 0.5);

    if (abs(parseInt(coeff) - coeff) < 0.0001) { return parseInt(coeff); }

    return coeff;
  }

  /**
   * @description Fait osciller l'avatar selon une trajectoire circulaire
   */
  oscille() {
    let y = this.y;
    this.x += cos(this.it * rad);
    this.y += sin(this.it * rad);
    this.rotate(this.direction, { x: this.x, y: y }, true);
  }

  /**
   * @description Calcule la direction de l'avatar en fonction de sa position actuelle et de sa dernière position
   */
  dir() { this.direction = atan2piZ(this.x - this.last_x, this.y - this.last_y); }

  /**
   * @description Calcule la direction de l'avatar lors de son dernier second mouvement
   */
  dirSecond() {
    if (this.lastsSm.length > 0) {
      let last = this.lastSm;
      let curr = this.secondMovePos;
      this.dirSecMove = atan2piZ(curr.x - last.x, curr.y - last.y);
    }
    else {
      this.dirSecMove = 0;
    }
  }

  /**
   * @description Calcule l'angle entre l'avatar et son centre de rotation
   */
  angle() { this.angle = atan2piZ(this.x - this.center.x, this.y - this.center.y); }

  /**
   * @description Calcule une trajectoire en spirale vers le centre ou en spirale inversée
   * @param {boolean} [inv_spiral=false] - Si vrai, fait une spirale inversée (éloignement du centre)
   */
  spiral(inv_spiral = activeGlo.inv_spiral) {
    let center = !this.center ? { x: canvas.width / 2, y: canvas.height / 2 } : { x: this.center.x, y: this.center.y };
    let dx = center.x - this.x, dy = center.y - this.y;
    let d = this.dist_to_center(center);

    let exp = activeGlo.params.spiral_exp;
    let turn = 1;
    if (inv_spiral) { d = -d; turn = -turn; }

    let x_move = cpow(dx, exp) / cpow(d, exp);
    let y_move = cpow(dy, exp) / cpow(d, exp);

    let k = activeGlo.params.spiral_speed;
    let pRot = { x: this.x + k * x_move, y: this.y + k * y_move };

    if (!activeGlo.nb_spirals) { activeGlo.nb_spirals = 0; }

    let nb_spirals = activeGlo.cos_spiral ? activeGlo.nb_spirals : 0;
    let angle = activeGlo.params.spiral_angle;
    let dev_angle = activeGlo.params.dev_angle;

    if (!activeGlo.cos_spiral && !activeGlo.spiral_cross) { this.rotate(turn * angle, pRot); }
    else if (!activeGlo.spiral_cross) { this.rotate(turn * (angle * (1 + cos(nb_spirals))), pRot); }
    else {
      turn = this.n_avatars % 2 == 0 ? -1 : 1;
      this.rotate(turn * angle, pRot);
    }

    if (activeGlo.cos_spiral) { activeGlo.nb_spirals += dev_angle; }
  }

  /**
   * @description Calcule une trajectoire en spirale vers un avatar voisin pris au hasard
   */
  spiralToAvatar() {
    if (typeof (this.avToSpiral) == 'undefined') {
      this.avToSpiral = this.nears[getRandomIntInclusive(0, this.nears.length - 1, true)];
    }
    var avToSpiral = this.avToSpiral;

    if (typeof (avToSpiral) != 'undefined') {
      avToSpiral.avToSpiral = this;
      let center = { x: avToSpiral.x, y: avToSpiral.y };
      let dx = center.x - this.x, dy = center.y - this.y;
      let d = pow(pow(dx, 2) + pow(dy, 2), 0.5);

      let exp = activeGlo.params.spiral_exp;
      let turn = 1;
      if (activeGlo.inv_spiral) { d = -d; turn = -turn; }

      let x_move = cpow(dx, exp) / pow(d, exp);
      let y_move = cpow(dy, exp) / pow(d, exp);

      let pRot = { x: this.x + x_move, y: this.y + y_move };

      if (!activeGlo.nb_spirals) { activeGlo.nb_spirals = 0; }

      let nb_spirals = activeGlo.cos_spiral ? activeGlo.nb_spirals : 0;
      let angle = activeGlo.params.spirAvatar_angle;
      let dev_angle = activeGlo.params.dev_angle;

      if (!activeGlo.cos_spiral) { this.rotate(turn * angle, pRot); }
      else { this.rotate(turn * (angle * (1 + cos(nb_spirals))), pRot); }

      activeGlo.nb_spirals += dev_angle;
    }
  }

  /**
   * @description Calcule la distance entre cet avatar et le centre du canvas ou un point central donné
   * @param {{x: number, y: number}} center - Le point central
   * @returns {number} La distance entre l'avatar et le point central
   */
  dist_to_center(center = { x: canvas.width / 2, y: canvas.height / 2 }) { return pow(pow(center.x - this.x, 2) + pow(center.y - this.y, 2), 0.5); }

  /**
   * @description Calcule la longueur de la queue de l'avatar (distance totale entre les positions enregistrées)
   * @returns {number} La longueur de la queue de l'avatar (distance totale entre les positions enregistrées)
   */
  tail_length() {
    let dist_tail = 0;
    let avLastLength = this.lasts.length;
    if (avLastLength > 1) {
      for (var i = 1; i < avLastLength; i++) {
        dist_tail += hypo(this.lasts[i].x - this.lasts[i - 1].x, this.lasts[i].y - this.lasts[i - 1].y);
      }
    }
    return dist_tail;
  }

  /**
   * @description Ajuste un angle en fonction du quadrant défini par un vecteur directionnel
   * @param {number} angle - L'angle de rotation
   * @param {{x: number, y: number}} d - La direction
   * @returns {number} L'angle de rotation ajusté
   */
  turnAngle(angle, d) {
    let pos_y = d.y < 0 ? true : false;
    let pos_x = d.x < 0 ? true : false;

    if (!pos_x && pos_y) { angle = half_pi + angle; }
    else if (pos_x && pos_y) { angle = angle + half_pi; }
    else { angle = 3 * half_pi + angle; }

    return angle;
  }

  /**
   * @description Calcule la vitesse actuelle de l'avatar
   * @returns {number} La vitesse actuelle de l'avatar
   */
  speed_avatar() { return pow(pow(this.x - this.last_x, 2) + pow(this.y - this.last_y, 2), 0.5); }

  /**
   * @description Calcule l'accélération actuelle de l'avatar
   * @returns {number} L'accélération actuelle de l'avatar
   */
  accel_avatar() {
    if (this.lasts[this.lasts.length - 1] && this.lasts[this.lasts.length - 2]) {
      let last = this.lasts[this.lasts.length - 1];
      let av_last = this.lasts[this.lasts.length - 2];
      let last_vit = { x: last.x - av_last.x, y: last.y - av_last.y };
      let vit = { x: this.x - last.x, y: this.y - last.y };

      const ax = vit.x - last_vit.x;
      const ay = vit.y - last_vit.y;

      this.ax = ax;
      this.ay = ay;

      return (ax ** 2 + ay ** 2) ** 0.5;
    }
    return pow(pow(this.ax, 2) + pow(this.ay, 2), 0.5);
  }

  /**
   * @description Calcule la distance entre cet avatar et un autre avatar
   * @param {*} av - L'autre avatar
   * @returns {number} La distance entre les deux avatars
   */
  dist_av(av) { return pow(pow(this.x - av.x, 2) + pow(this.y - av.y, 2), 0.5); }

  /**
   * @description Calcule la composante hue de la couleur de l'avatar en fonction de sa distance au centre
   * @param {*} var_cent_col - La variable de couleur centrée
   * @returns {number} La couleur de l'avatar en fonction de sa distance au centre
   */
  colorByCenter(var_cent_col) {
    let d_max = pow(pow(canvas.width / 2, 2) + pow(canvas.height / 2, 2), 0.5);
    let center = !this.center ? { x: canvas.width / 2, y: canvas.height / 2 } : this.center;
    return 360 * this.dist_to_center(center) / (d_max / var_cent_col);
  }

  /**
   * @description Calcule la composante hue de la couleur de l'avatar en fonction de sa direction
   * @param {*} v - Le vecteur directionnel
   * @returns {number} La couleur de l'avatar en fonction de sa direction
   */
  colorByDir(v = this.vit()) {
    return activeGlo.params.dirColorCoeff * 180 * atan2pi(v.x, v.y) / PI;
  }

  /**
   * @description Calcule la composante hue de la couleur de l'avatar en fonction de la distance aux modificateurs
   * @returns {number} La couleur de l'avatar en fonction de la distance aux modificateurs
   */
  colorByDistMod() {
    return activeGlo.params.varColDistModifs * PI * this.distMinModifiers / canvas.width;
  }

  /**
   * @description Calcule la composante hue de la couleur de l'avatar en fonction de sa vitesse ou de son accélération
   * @param {number} move - La valeur de mouvement (vitesse ou accélération)
   * @param {boolean} relOrAbs - Indique si la valeur est relative ou absolue
   * @param {boolean} moyOrMax - Indique si la valeur est la moyenne ou le maximum
   * @param {number} move_moy - La valeur de mouvement moyenne
   * @param {number} move_max - La valeur de mouvement maximale
   * @param {number} maxCol - La valeur maximale de couleur
   * @param {number} varCol - La variable de couleur
   * @returns {number} La couleur de l'avatar en fonction de sa vitesse ou de son accélération
   */
  colorBySpeedOrAccel(move, relOrAbs, moyOrMax, move_moy, move_max, maxCol, varCol) {
    return 360 - (360 * move / move_max);
  }

  /**
   * @description Modifie la couleur de l'avatar en fonction de la couleur d'un avatar suivi
   */
  colorByFollow() {
    this.colorHsl();

    let newStrokeH = this.hslStroke.h + (rnd_sign() * activeGlo.params.avToFollowColorStrokeH);
    let newFillH = this.hsl.h + (rnd_sign() * activeGlo.params.avToFollowColorH);
    let newStrokeS = this.hslStroke.s + (rnd_sign() * activeGlo.params.avToFollowColorStrokeS);
    let newFillS = this.hsl.s + (rnd_sign() * activeGlo.params.avToFollowColorS);
    let newStrokeL = this.hslStroke.l + (rnd_sign() * activeGlo.params.avToFollowColorStrokeL);
    let newFillL = this.hsl.l + (rnd_sign() * activeGlo.params.avToFollowColorL);

    this.strokeStyle = 'hsla(' + newStrokeH + ', ' + newStrokeS + '%, ' + newStrokeL + '%, ' + this.hslStroke.a + ')';
    this.fillStyle = 'hsla(' + newFillH + ', ' + newFillS + '%, ' + newFillL + '%, ' + this.hsl.a + ')';

    this.hslStroke = { h: newStrokeH, s: newStrokeS, l: newStrokeL, a: this.hslStroke.a, p: 1 };
    this.hsl = { h: newFillH, s: newFillS, l: newFillL, a: this.hsl.a, p: 1 };
  }

  colorByNum(coeff) {
    return avatars.length * this.n_avatars * coeff / 360;
  }

  /**
   * @description Calcule la couleur de l'avatar en fonction de sa vitesse ou de son accélération
   * @param {number} move - La valeur de mouvement (vitesse ou accélération)
   * @param {boolean} relOrAbs - Indique si la valeur est relative ou absolue
   * @param {boolean} moyOrMax - Indique si la valeur est la moyenne ou le maximum
   * @param {number} move_moy - La valeur de mouvement moyenne
   * @param {number} move_max - La valeur de mouvement maximale
   * @param {number} maxCol - La valeur maximale de couleur
   * @param {number} varCol - La variable de couleur
   * @returns {number} La couleur de l'avatar en fonction de sa vitesse ou de son accélération
   */
  colorBySpeedOrAccel(move, relOrAbs, moyOrMax, move_moy, move_max, maxCol, varCol) {
    return 360 - (360 * move / move_max);
  }

  /**
   * @description Modifie la couleur de l'avatar en fonction de la couleur d'un avatar suivi
   */
  colorByFollow() {
    this.colorHsl();

    let newStrokeH = this.hslStroke.h + (rnd_sign() * activeGlo.params.avToFollowColorStrokeH);
    let newFillH = this.hsl.h + (rnd_sign() * activeGlo.params.avToFollowColorH);
    let newStrokeS = this.hslStroke.s + (rnd_sign() * activeGlo.params.avToFollowColorStrokeS);
    let newFillS = this.hsl.s + (rnd_sign() * activeGlo.params.avToFollowColorS);
    let newStrokeL = this.hslStroke.l + (rnd_sign() * activeGlo.params.avToFollowColorStrokeL);
    let newFillL = this.hsl.l + (rnd_sign() * activeGlo.params.avToFollowColorL);

    this.strokeStyle = 'hsla(' + newStrokeH + ', ' + newStrokeS + '%, ' + newStrokeL + '%, ' + this.hslStroke.a + ')';
    this.fillStyle = 'hsla(' + newFillH + ', ' + newFillS + '%, ' + newFillL + '%, ' + this.hsl.a + ')';

    this.hslStroke = { h: newStrokeH, s: newStrokeS, l: newStrokeL, a: this.hslStroke.a, p: 1 };
    this.hsl = { h: newFillH, s: newFillS, l: newFillL, a: this.hsl.a, p: 1 };
  }

  /**
   * @description Calcule la couleur courante de l’avatar en HSL/OKLCH selon de multiples critères
   * @param {{}} obj
   */
  colorHsl(obj = this.nearMod.num_modifier ? this.nearMod.glo : activeGlo) {
    if (obj.hyperAlea) { obj = this.glo; }

    let params = this.nearMod.params ? this.nearMod.params : obj.params;

    let tint = !obj.hyperAlea ? params.tint_color : obj.params.tint_color;
    let sat = !this.nearMod.sat ? obj.params.saturation : this.nearMod.sat;
    let satStroke = !this.nearMod.satStroke ? obj.params.satStroke : this.nearMod.satStroke;
    let tint_stroke = !this.nearMod.tint_stroke ? obj.params.tint_stroke : this.nearMod.tint_stroke;
    let var_cent_col = obj.params.var_center_col;
    let varMoveCol = obj.params.varMoveCol;
    let move = obj.speed_color ? this.speed : this.accel;
    let move_max = obj.speed_color ? activeGlo.speed_max : activeGlo.accel_max;


    let cd = !this.nearMod.colorDec && this.nearMod.colorDec != 0 ? obj.params.colorDec : this.nearMod.colorDec;
    if (obj == this.glo) { cd += obj.params.colorDec; }
    let cdStroke = !this.nearMod.colorStrokeDec && this.nearMod.colorStrokeDec != 0 ? obj.params.colorStrokeDec : this.nearMod.colorStrokeDec;
    if (obj == this.glo) { cd += obj.params.colorStrokeDec; }

    let colorSum;

    if (!obj.colorCumul) {
      let switchColor = this.nearMod.colorFunction != undefined ? this.nearMod.colorFunction : obj.colorFunction;
      switch (switchColor) {
        case 'distMod':
          let varCol = !this.nearMod.haveColor ? obj.params.varColDistModifs : this.nearMod.varOneColMod;
          if (!obj.colorsAdd || this.nearMod.haveColor) { move = 360 * varCol * this.distMinModifiers / canvas.width; }
          else {
            let colors = [];
            this.distMods.forEach(d => {
              move = 360 * d.varColDistModifs * d.dist / canvas.width;
              colors.push({ h: move + d.colorDec, s: sat, st: satStroke, l: d.l, ls: d.ls, a: 1, p: pow(canvas.width / d.dist, obj.params.powColorAdd) * d.w });
            });
            let color = hslaSum(colors);
            move = color.h;
            sat = color.s;
            satStroke = color.st;
            tint = color.l;
            tint_stroke = color.ls;
          }
          break;
        case 'center': move = this.colorByCenter(var_cent_col); break;
        case 'dir': move = this.colorByDir(); break;
        case 'qMove': move = 360 - (360 * move * varMoveCol / (obj.relative ? move_max : 1)); break;
        case 'byNumAv': move = this.colorByNum(obj.params.varColByNum); break;
      }
    }
    else {
      let cml = obj.rangesCmlColor;
      let nbMoves = 0;
      let moves = [];
      let colors = [];
      if (obj.colorFunctions.distMod) {
        let varCol = !this.nearMod.haveColor ? obj.params.varColDistModifs : this.nearMod.varOneColMod;
        move = 360 * varCol * this.distMinModifiers / canvas.width;
        moves.push(move * cml.range_distMod);
        colors.push({ h: move, s: sat, l: tint, a: 1, p: cml.range_distMod });
        nbMoves += cml.range_distMod;
      }
      if (obj.colorFunctions.center) {
        move = this.colorByCenter(var_cent_col);
        moves.push(move * cml.range_center);
        colors.push({ h: move, s: sat, l: tint, a: 1, p: cml.range_center });
        nbMoves += cml.range_center;
      }
      if (obj.colorFunctions.dir) {
        move = this.colorByDir();
        moves.push(move * cml.range_dir);
        colors.push({ h: move, s: sat, l: tint, a: 1, p: cml.range_dir });
        nbMoves += cml.range_dir;
      }
      if (obj.colorFunctions.qMove) {
        move = 360 - (360 * move * varMoveCol / (obj.relative ? move_max : 1));
        moves.push(move * cml.range_qMove);
        colors.push({ h: move, s: sat, l: tint, a: 1, p: cml.range_qMove });
        nbMoves += cml.range_qMove;
      }
      if (obj.colorFunctions.byNumAv) {
        move = this.n_avatars;
        moves.push(move * cml.range_qMove);
        colors.push({ h: move, s: sat, l: tint, a: 1, p: cml.range_qMove });
        nbMoves += cml.range_qMove;
      }

      if (moves.length == 0) { moves[0] = 0; nbMoves = 1; }

      switch (obj.colorCumulType[obj.params.colorCumulType]) {
        case 'average':
          //let moveSum = moves.reduce( (acc, val) => acc + val );
          //move = moveSum / nbMoves;
          colorSum = hslaSum(colors);
          break;
        case 'average_mul':
          let moveMul = moves.reduce((acc, val) => acc * val);
          move = moveMul / nbMoves;
          break;
        case 'average_div':
          let moveDiv = moves.reduce((acc, val) => acc / val);
          move = moveDiv / nbMoves;
          break;
        case 'average_mul_fact':
          let moveMulFact = moves.reduce((acc, val) => acc * val);
          move = moveMulFact / factDec(nbMoves);
          break;
        case 'average_mul_div':
          let moveDivFact = moves.reduce((acc, val) => acc / val);
          move = moveDivFact / factDec(nbMoves);
          break;
        case 'test':
          let moveTest = moves.reduce((acc, val) => acc / val);
          move = moveTest / factDec(nbMoves);
          break;
      }
    }

    if (colorSum) { move = colorSum.h; sat = colorSum.s; tint = colorSum.l; }

    if (this.nearMod.haveColor) {
      if (obj.addWithTint) {
        let t = this.nearMod.color.l * move;
        let ts = this.nearMod.tint_stroke * move;
        tint = pow(t, this.nearMod.powColor);
        tint_stroke = pow(ts, this.nearMod.powColor);
      }
      if (!obj.colorsAdd) { move = this.nearMod.color.h; }
      else {
        let w = canvas.width;
        let colors = [];

        let mods = activeGlo.modifiers;

        mods.forEach(mod => {
          let dist = this.dist_av(mod);

          if (obj.addWithTint) {
            let t = tint * move;
            let ts = mod.tint_stroke * move;
            tint = cpow(t, mod.powColor * 0.9);
            tint_stroke = cpow(ts, mod.powColor * 0.9);
          }

          if (mod.params.lightByDistMod != 0) {
            let k = 1;
            let d = mod.params.lightByDistMod >= 0 ? 1 + (dist * k) : 1 / (1 + (dist * k));
            let c = mod.params.lightByDistMod >= 0 ? mod.params.lightByDistModCoeff / 100 : mod.params.lightByDistModCoeff * 100;
            let coeff = c * d;
            tint *= coeff;
            tint_stroke *= coeff;
          }
          if (params.satByDistMod != 0) {
            let d = mod.params.lightByDistMod >= 0 ? 1 + dist : 1 / (1 + dist);
            let coeff = pow(mod.params.satByDistModCoeff * d, abs(mod.params.satByDistMod));
            sat *= coeff;
          }

          let weight = pow(mod.weight * w / dist, mod.params.powColorAdd);

          colors.push({ h: mod.color.h + mod.colorDec, s: mod.sat, l: tint, ls: tint_stroke, st: satStroke, a: 1, p: weight });
        });
        let color = hslaSum(colors);

        move = color.h;
        sat = color.s;
      }
    }

    if (!obj.colorsAdd) { move += cd; }

    if (obj.alternTint && zeroOneCycle(activeGlo.nb_moves, params.alternTintSpeed)) {
      tint = 100 - tint;
      tint_stroke = 100 - tint_stroke;
    }
    if (obj.alternSat && zeroOneCycle(activeGlo.nb_moves, params.alternSatSpeed)) {
      sat = 100 - sat;
      satStroke = 100 - satStroke;
    }

    if (!obj.colorsAdd) {
      if (params.lightByDistMod != 0) {
        let coeff = pow(params.lightByDistModCoeff * this.distMinModifiers / canvas.width, params.lightByDistMod);
        tint *= coeff;
        tint_stroke *= coeff;
      }
      if (params.satByDistMod != 0) {
        let coeff = pow(params.satByDistModCoeff * this.distMinModifiers / canvas.width, params.satByDistMod);
        sat *= coeff;
        satStroke *= coeff;
      }
    }

    if (params.lightByCenter != 0) {
      let lightByCenter = params.lightByCenter;
      let coeff = this.coeffSizeCenter();

      coeff = pow(lightByCenter > 0 ? coeff * (0.9 + lightByCenter) : 1 / (coeff * (0.9 + abs(lightByCenter))), 0.5);

      tint *= coeff;
      tint_stroke *= coeff;
    }

    let a = 1;
    if (!obj.alphaAbs) {
      a = obj.alpha ? 1 / (1 + move) : 1;
      a = a < obj.params.alpha_color ? obj.params.alpha_color : a;
    }
    else { a = !this.nearMod.alpha ? obj.params.alpha_color : this.nearMod.alpha; }

    if (obj.alphaBySize) {
      let c = this.sizeCalc.s - obj.params.alphaBySize;
      if (c > 1) { a /= pow(c, obj.params.powAlpha); }
    }

    if (obj.alphaRnd) { a /= (1 + rnd()); }

    if (obj.formuleColorMode) {
      const color = this.formuleColor(move, sat, tint, a, obj.formuleColor);
      const colorStroke = this.formuleColor(cdStroke, satStroke, tint_stroke, a, obj.formuleColorStroke);
      move = color.move; sat = color.sat; tint = color.tint; a = color.a;
      cdStroke = colorStroke.move; satStroke = colorStroke.sat; tint_stroke = colorStroke.tint; a = colorStroke.a;
    }

    if (tint < 0 || isNaN(tint)) { tint = 0; }
    if (tint_stroke < 0 || isNaN(tint_stroke)) { tint_stroke = 0; }
    if (satStroke < 0 || isNaN(satStroke)) { satStroke = 0; }
    if (sat < 0 || isNaN(sat)) { sat = 0; }

    if (obj.color_white) { move = 0; sat = 0; tint = 100; satStroke = 0; tint_stroke = 100; }
    else if (obj.color_black) { move = 0; sat = 0; tint = 0; satStroke = 0; tint_stroke = 0; }
    else if (activeGlo.oneColor.state) { move = activeGlo.oneColor.color.h; sat = activeGlo.oneColor.color.s; tint = activeGlo.oneColor.color.l; }

    if (obj.alternColor && zeroOneCycle(activeGlo.nb_moves, params.alternColorSpeed)) {
      move += params.alternColorVal;
      if (obj.color_white || obj.color_black) {
        tint = 100 - tint;
        tint_stroke = 100 - tint_stroke;
        satStroke = 100 - satStroke;
      }
    }

    let roundMove = round(move, 2);

    let avatarColor = {
      strokeStyle: {
        hue: roundMove + cdStroke,
        saturation: satStroke / 200,
        light: tint_stroke,
        alpha: a,
      },
      fillStyle: {
        hue: roundMove,
        saturation: sat ? sat / 200 : 0,
        light: tint,
        alpha: a,
      }
    }

    this.strokeStyle = `oklch(${avatarColor.strokeStyle.light + '%'} ${avatarColor.strokeStyle.saturation} ${avatarColor.strokeStyle.hue} / ${avatarColor.strokeStyle.alpha})`;
    this.fillStyle = `oklch(${avatarColor.fillStyle.light + '%'} ${avatarColor.fillStyle.saturation} ${avatarColor.fillStyle.hue} / ${avatarColor.fillStyle.alpha})`;

    this.hsl = { h: move, s: sat, l: tint, a: a, p: 1 };
    this.hslStroke = { h: move + cdStroke, s: satStroke, l: tint_stroke, a: a, p: 1 };
  }

  /**
   * @description Convertit les valeurs HSL/HSLA en chaîne de caractères OKLCH pour CSS
   * @param {number} h
   * @param {number} s
   * @param {number} l
   * @param {number} a
   * @returns {string} Chaîne de caractères OKLCH pour CSS
   * @see {@link https://bottosson.github.io/posts/oklab/}
   * @see {@link https://bottosson.github.io/posts/colorpicker/}
   * @see {@link https://en.wikipedia.org/wiki/HSL_and_HSV}
   */
  hslaToOklch(h, s, l, a = 1) {
    // --- 1) HSL → RGB ---
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const f = n => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    let r = f(0), g = f(8), b = f(4);

    // --- 2) sRGB → linéaire ---
    const toLinear = c => {
      c = Math.max(0, Math.min(1, c));
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    r = toLinear(r);
    g = toLinear(g);
    b = toLinear(b);

    // --- 3) RGB lin → XYZ (D65) ---
    const X = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const Y = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const Z = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    // --- 4) XYZ → Oklab ---
    const l_ = Math.cbrt(0.8189330101 * X + 0.3618667424 * Y - 0.1288597137 * Z);
    const m_ = Math.cbrt(0.0329845436 * X + 0.9293118715 * Y + 0.0361456387 * Z);
    const s_ = Math.cbrt(0.0482003018 * X + 0.2643662691 * Y + 0.6338517070 * Z);

    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    // --- 5) Oklab → Oklch ---
    const C = Math.sqrt(A * A + B * B);
    let hRad = Math.atan2(B, A);
    let H = hRad * 180 / Math.PI;
    if (H < 0) H += 360;

    // --- 6) Format CSS string ---
    return `oklch(${(L * 100).toFixed(2)}% ${(C).toFixed(4)} ${H.toFixed(2)} / ${a})`;
  }

  /**
   * @description Calcule un coefficient en fonction de la taille de l'avatar et de sa distance au centre
   * @param {number} h - Composante hue
   * @param {number} s - Composante saturation
   * @param {number} l - Composante lightness
   * @param {number} a - Composante alpha
   * @param {{h: string, s: string, l: string, a: string}} formuleColor - Formules pour chaque composante
   * @returns {{move: number, sat: number, tint: number, a: number}} Objet contenant les nouvelles composantes de couleur
   */
  formuleColor = function (h, s, l, a, formuleColor) {
    // compile/charge les fonctions pour cet objet {h,s,l,a}
    this.__ensureCompiledColorFormulas(formuleColor);

    // Si pas de formules, on renvoie tel quel
    if (!this.__colorFns) return { move: h, sat: s, tint: l, a };

    // Appel ultra-rapide : (this, h,s,l,a)
    const f = this.__colorFns;
    const move = f.h ? f.h(this, h, s, l, a) : h;
    const sat = f.s ? f.s(this, h, s, l, a) : s;
    const tint = f.l ? f.l(this, h, s, l, a) : l;
    const alpha = f.a ? f.a(this, h, s, l, a) : a;

    return { move, sat, tint, a: alpha };
  };
}

/**
 * Classe pour gérer le mouvement des pinceaux
 * @constructor
 * @param {Object} options - Options pour configurer le mouvement du pinceau.
 * @param {{x: number, y: number}} options.vector - Vecteur de mouvement.
 * @param {string} options.type - Le type de brosse.
 * @param {Object} options.formType - Le forme de la brosse.
 * @param {number} options.size - La taille de la brosse.
 */
class BrushMovement {
  constructor(options = {}) {
    this.vector = options.vector;
    this.type = options.type;
    this.formType = options.formType;
    this.size = options.size;
  }
}

// ====== HELPERS GÉNÉRIQUES (AUCUNE SÉCURITÉ) ======

const __FN_CACHE__ = new Map();

/**
 * Compile une expression en fonction rapide.
 *   - Pas de "use strict"
 *   - Pas de shadow
 *   - Accès total aux globals
 * @param {string} expr        ex: "h + this.x * 0.05"
 * @param {string[]} params    noms des paramètres positionnels
 * @returns {Function}         (...args) => any
 */
function createEvalFunction(expr, params) {
  if (!expr) return null;
  const key = `NO_THIS::${expr}::${params.join(',')}`;
  let fn = __FN_CACHE__.get(key);
  if (!fn) {
    fn = new Function(...params, `return (${expr});`);
    __FN_CACHE__.set(key, fn);
  }
  return fn;
}

/**
 * Variante liée au `this` courant.
 *   - Appel : fnWithThis(thisArg, ...args)
 *   - Permet d’utiliser `this.x`, `this.y`, etc. dans l’expression.
 */
function createEvalFunctionWithThis(expr, params) {
  if (!expr) return null;
  const key = `WITH_THIS::${expr}::${params.join(',')}`;
  let runner = __FN_CACHE__.get(key);
  if (!runner) {
    const compiled = new Function(...params, `return (${expr});`);
    runner = (thisArg, ...args) => compiled.apply(thisArg, args);
    __FN_CACHE__.set(key, runner);
  }
  return runner;
}


//END CLASSES
