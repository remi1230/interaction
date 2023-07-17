//------------------ VARIABLES GLOBALES ----------------- //
class Glob {
    constructor() {
        let _this = this;
        this.params =
            {
                selectCanvas: 0,
                nb: 512,
                keep_dir: 50,
                speed_alea_pos: 50,
                rAleaPos: 1.125,
                rAleaPosMin: 0,
                brake_pow: 2.12,
                attract: 0,
                lim_attract: 0,
                radius_attract: 0,
                upd_size: 6,
                same_dir: 0,
                resist: 0,
                alpha_color: 0.1,
                saturation: 77,
                lim_line: 32,
                line_size: 1,
                tint_color: 42,
                lightByCenter: 0,
                satImg: 2,
                var_center_col: 1,
                var_tint: 2,
                rotate_angle: 0,
                orbite_angle: 0,
                spiral_exp: 1,
                spiral_angle: 0,
                maxAngleMod: 360,
                rotPoly_angle: 0,
                inv_g_force: 50,
                out_dir: 0,
                dev_angle: 0,
                greyColor: 3,
                circle_size: 0.212,
                nb_circles: 1,
                div_line: 1,
                gSpeed: 1,
                crossPointsLim: 0.01,
                oval_size: 0.5,
                modsDevDir: 90,
                chaos_dist: 0,
                chaos_force: 8,
                follow_force_x: 1,
                follow_force_y: 1,
                tint_stroke: 33,
                satStroke: 77,
                ellipse_x: 1,
                ellipse_y: 1,
                level_var_size: 1,
                level_var_s_size: 1,
                nb_edges: 3,
                modsDevForce: 0,
                tail_memory: 20,
                nb_modifiers: 12,
                out_force: 1,
                nears_calc: 60,
                minAngleMod: 0,
                breakAdd: 1,
                avatars_form: 5,
                mod_force_upd: 6,
                ell_x_mod_upd: 6,
                ell_y_mod_upd: 6,
                nb_points_cloud: 4,
                sz_points_cloud: 1,
                rot_spi_upd: 6,
                director_angle: 0,
                director_angle_upd: 0,
                arcStartAngle: 0,
                arcEndAngle: 360,
                var_tint_r: 0.5,
                var_tint_g: 0.5,
                var_tint_b: 0.5,
                var_alpha_img: 0.5,
                arcRotAngle: 0,
                color_angle: 0,
                modifiers_angle: 0,
                shell_img: 6,
                turnModifiers: 0,
                ctxComposition: 0,
                rotCircleModifiers: 0,
                rotModifiersMax: 0,
                varColDistModifs: 2,
                colorCumulType: 0,
                coeffDimSizeCenter: 1,
                spiral_force: 1,
                trirotate_angle: 0,
                trirotate_angle2: 0,
                spiral_speed: 10,
                gridStep: 96,
                thirdGridStep: 2,
                circleGridStep: 24,
                gridEquiStep: 20,
                circleRep: 4,
                brake_mod_upd: 6,
                selModsByType: 0,
                areneOpacity: 1,
                structureOpacity: 1,
                bgInterfaceOpacity: 0.5,
                distNearDrawMods: 20,
                distNearClearMods: 6,
                modifierPos: 1,
                formModType: 0,
                polyNbEdges: 3,
                polyRotNbEdges: 3,
                polyRotNbEdges2: 3,
                polyAvNbEdges: 3,
                posModsNbEdges: 3,
                modPolyRotAngle: 0,
                polyRotAngle: 0,
                polyRotAngle2: 0,
                rotPosPolyAv: 0,
                alternColorSpeed: 100,
                varOneColMod: 2,
                colorDec: 0,
                colorStrokeDec: 0,
                nearColorPow: 0.62,
                colorFunction: 0,
                limSpeedMax: 2,
                limSpeedMin: 0,
                alternatorSpeed: 100,
                alternColorVal: 180,
                growDecrease: 50,
                growDecreaseCoeff: 0.02,
                growLineDecreaseCoeff: 0.05,
                speedRndDraw: 5,
                spiralAv: 1,
                changeCurve: 200,
                rCurve: 180,
                curveAngle: 1,
                curveTestCoeff: 0.1,
                curveRnd: 5,
                curveStartTest: 0,
                dblAngleUpd: 180,
                dblModDist: 15,
                dirColorCoeff: 1,
                dblAvDist: 2,
                sizeDirCoeff: 15,
                alphaBySize: 2,
                powAlpha: 1,
                rotColorX: 0.5,
                rotColorY: 0.5,
                rotColorZ: 0.5,
                secondMoveIt: 1,
                secondMoveRange: 1,
                powColorAdd: 1.8,
                angleEllipse: 0,
                lightByDistMod: 0,
                satByDistMod: 0,
                lightByDistModCoeff : 0.5,
                satByDistModCoeff : 0.5,
                angleEllipseMod : 0,
                thirdGridFrac : 3,
                weightMods : 1,
                varMoveCol : 1,
                asyncTime : 1,
                dirAngle : 0,
                dirForce : 0,
                attractForce : 0,
                colorFormule_H : 'H',
                colorFormule_S : 'S',
                colorFormule_L : 'L',
                colorFormule_A : 'A',
                mods_formule : 0,
            };
        this.alea = {
            colorDec       : true,
            colorStrokeDec : true,
            alpha_color    : true,
            saturation     : true,
            tint_color     : true,
            tint_stroke    : true,
            satStroke      : true,
        };
        this.mode = {
            //alpha: { name: 'Alpha', state: false, key: 'a', noAlea: true, },
            //alea_attract: { name: 'Alea attract', state: false, key: 'h' },
            //alea_form: { name: 'Alea form', state: false, key: 'l', noAlea: true, },
            //alea_inv_g: { name: 'Alea inv G', state: false, key: 'p' },
            //alea_size: { name: 'Alea size', state: false, key: 's', noAlea: true, callback: function() { alea_size(); } },
            //attract_size: { name: 'Attract size', state: false, key: 'z' },
            //clear: { name: 'Clear', state: true, key: 'e', noAlea: true, callback: function(){ razAvPaths(); } },
            collid_bord: { name: 'Collid border', state: false, key: '$', noAlea: true, },
            color_white: { name: 'Color white', state: false, key: 'w', noAlea: true, callback: function() { buttonCheckPropToAnother(_this.mode, this.state, "color_black"); }, },
            color_black: { name: 'Color black', state: false, key: 'n', noAlea: true, callback: function() { buttonCheckPropToAnother(_this.mode, this.state, "color_white"); }, },
            global_alea: { name: 'Global aléa', state: false, key: 'g', noAlea: true, },
            far_rebound: { name: 'Far rebound', state: false, key: 'd' },
            follow: { name: 'Follow', state: false, key: 'f' },
            inverse_g: { name: 'Inverse G', state: false, key: 'i' },
            normalCollid: { name: 'Normal collid', state: false, key: 'x' },
            orbite: { name: 'Orbite', state: false, key: 'o' },
            relative: { name: 'Relative', state: true, key: '!' },
            speed_color: { name: 'Speed color', state: true, key: 'v', noAlea: true, },
            stroke: { name: 'Stroke', state: false, key: 'k' },
            var_size: { name: 'Var size', state: false, key: 'm', noAlea: true, },
            break: { name: 'Simple break', state: false, key: ' ', specialKey: 'ctrl', noAlea: true, callback: function() { dealBreakAvatars(); } },
            totalBreak: { name: 'Total break', state: false, key: ' ', noAlea: true, },
            //alphaAbs: { name: 'Alpha absolu', state: false, key: 'Q', noAlea: true, },
            gSpeed: { name: 'Attract by speed', state: false, key: 'Y' },
            clearForm: { name: 'Clear form', state: true, key: 'R', noAlea: true, },
            color_max: { name: 'Color by max', state: false, key: 'P', noAlea: true, },
            colorGradient: { name: 'Color gradient', state: false, key: 'K', noAlea: true, },
            drawAltern: { name: 'Draw altern', state: false, key: 'N', noAlea: true, },
            attract_center: { name: 'Mouse attract center', state: false, key: 'T', noAlea: true, },
            alphaBySize: { name: 'Alpha by size', state: false, key: 'O', noAlea: true, },
            spiral: { name: 'Spiral', state: false, key: 'S', noAlea: true, }, 
            spiral_cross: { name: 'Spiral cross', state: false, key: 'M', noAlea: true, },
            spiral_cross_rotate: { name: 'Spiral cross rotate', state: false, key: 'H', noAlea: true, },
            inv_spiral: { name: 'Spiral inv', state: false, key: 'D', noAlea: true, },
            cos_spiral: { name: 'Spiral cos', state: false, key: 'W', noAlea: true, },
            spirAvatar: { name: 'Spiral avatar', state: false, key: 'J', noAlea: true, },
            stopNear: { name: 'Stop near', state: false, key: 'B', noAlea: true, },
            strokeAndFill: { name: 'stroke and fill', state: false, key: 'E' },
            tail: { name: 'Tail', state: false, key: 'U', noAlea: true, },
            invModifiersAtt: { name: 'Pos inv modifiers', state: true, key: 'i', specialKey: 'ctrl', noAlea: true, },
            pos_rnd_modifiers: { name: 'Pos rnd modifiers', state: false, key: 'h', specialKey: 'ctrl', noAlea: true, },
            withLine: { name: 'Cloud with line', state: false, key: ':', specialKey: 'ctrl', noAlea: true, },
            orientByPos: { name: 'Orient by pos', state: false, key: 'à', specialKey: 'ctrl', noAlea: true, },
            colorByDistModifs: { name: 'Color by dist mods', state: false, key: 'é', specialKey: 'ctrl', noAlea: true, },
            rotSquare: { name: 'Rot square', state: false, key: 'ç', specialKey: 'ctrl', noAlea: true, },
            colorCumul: { name: 'Color cumul mods', state: false, key: '"', specialKey: 'ctrl', noAlea: true, },
            colorBySpdOrAcc: { name: 'Color by spd or acc', state: true, key: '\'', specialKey: 'ctrl', noAlea: true, },
            infoOnMouse: { name: 'Infos on mouse', state: false, key: '(', specialKey: 'ctrl', noAlea: true, },
            sameSizeEllipse: { name: 'Same size ellipse', state: true, key: '2', specialKey: 'ctrl' },
            dist_mean: { name: 'Dist mean', state: false, key: '3', specialKey: 'ctrl' },
            dist_mean_inv: { name: 'Dist mean inv', state: false, key: '4', specialKey: 'ctrl' },
            dist_mean_one: { name: 'Dist mean one', state: false, key: '5', specialKey: 'ctrl' },
            secondMove: { name: 'Second move', state: false, key: '6', specialKey: 'ctrl', noAlea: true, },
            growByMouse: { name: 'Grow by mouse', state: false, key: '7', specialKey: 'ctrl', noAlea: true, },
            moveOnAlea: { name: 'Move on alea', state: true, key: '8', specialKey: 'ctrl', noAlea: true, },
            hyperAlea: { name: 'Hyper alea', state: false, key: '9', specialKey: 'ctrl', noAlea: true, callback: function() { switchHyperAlea(); } },
        };
        this.attract_mouse = {
            state: true,
            mouseup: true,
            mousedown: false,
        };
        this.modifierSelect = {
            isOneSelect: function() {
                for (let prop in this) {
                    if (typeof (this[prop]) != 'function' && this[prop] == true) {
                        return true;
                    }
                }
                return false;
            },
            whatIsSelect: function() {
                for (let prop in this) {
                    if (typeof (this[prop]) != 'function' && this[prop] == true) {
                        return prop;
                    }
                }
                return 'none';
            },
            update: function(propToUpd) {
                if (!this[propToUpd]) {
                    this[propToUpd] = false;
                }
                this[propToUpd] = !this[propToUpd];
                for (let prop in this) {
                    if (typeof (this[prop]) != 'function' && propToUpd != prop && this[propToUpd]) {
                        this[prop] = false;
                    }
                }
            },
        };
        this.modifiers = [];
        this.posOnMouse = {};
        this.virtual = {};
        this.shortcut = {};
        this.mods_formule = {};
        this.grid = { draw: false, type: 'none' };
        this.formule = { x: 0, y: 0, error: { x: true, y: true } };
        this.formuleColor = { h: 'h', s: 's', l: 'l', a: 'a' };
        this.formuleColorHisto = { h: 'h', s: 's', l: 'l', a: 'a' };
        this.formuleColorTest = true;
        this.selectCanvas = 0;
        this.num_params = 0;
        this.nb_moves = 0;
        this.size = 2;
        this.lim_out = 10;
        this.speed_moy = 0;
        this.style = 0;
        this.numLineCap = 0;
        this.dash = 0;
        this.rotPoly_angle = 0;
        this.dist_moy = 1;
        this.invFollow = 1;
        this.nb_edges = 3;
        this.persp_cent_x = 0;
        this.persp_cent_y = 0;
        this.moveOnAleaIt = 0;
        this.form = 'ellipse';
        this.forms = ['circle', 'square', 'line', 'bezier', 'poly', 'ellipse', 'alea_form', 'cloud', 'cross'];
        this.colorCumulType = ['average', 'average_mul', 'average_div', 'average_mul_fact', 'average_div_fact', 'test'];
        this.pos_modifiers = 'rotator';
        this.modifierTypes = ['none', 'rotator', 'attractor', 'polygonator', 'spiralor', 'invertor', 'alternator', 'magnetor', 'formulator', 'director'];
        this.selModsByType = ['none', 'rotator', 'attractor', 'polygonator', 'spiralor', 'invertor', 'alternator', 'magnetor', 'formulator', 'director'];
        this.formModTypes  = ['one', 'circle', 'square', 'rectangle', 'polygone'];
        this.ctxCompositions  = ["source-over", "destination-over", "lighter", "xor"];
        this.selectCanvas  = [];
        this.colorFunctionLabels = ['distMod', 'center', 'dir', 'qMove'];
        this.rangesCmlColor = {range_qMove: 1, range_center: 1, range_dir: 1, range_distMod: 1,};
        this.colorFunctions = {qMove: true};
        this.colorFunction  = 'distMod';
        this.is_canvas_menu = false;
        this.other_menu = false;
        this.clear = true;
        this.modifiersDrawNear = true;
        this.orientedPoly = true;
        this.posMods = true;
        this.uiDisplay = true;
        this.persistModsInfo = true;
        this.spiralOnlyInvrot = true;
        this.addWithTint = true;
        this.perm_var_size = false;
        this.oneColor = {state: false, color: {h: 100, s:77, l:42} };
        this.trans = {};
        this.lineCap = ["butt", "round", "square"];
        this.avsOneColor = {h:180, s:50, l: 50};
        this.modifiersColor  = {h:180, s:50, l: 50};
        this.canvasLoveBg    = {color: "rgb(0, 0, 32)"};
        this.thirdGridColor  = '#fc4e03';
    }
}

let getById = function(id){ return document.getElementById(id); };

let gco = [ 'source-over','source-in','source-out','source-atop',
            'destination-over','destination-in','destination-out','destination-atop',
            'lighter', 'copy','xor', 'multiply', 'screen', 'overlay', 'darken',
            'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light',
            'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
          ];

let glo       = new Glob();
let glos      = [glo];
let gloStart  = new Glob();
let activeGlo = new Glob();

if(getById('avatars_form')){ getById('avatars_form').max = activeGlo.forms.length - 1; }

let int = parseInt;

let rnd   = Math.random;
let abs   = Math.abs;
let pow   = Math.pow;
let sqr   = Math.sqrt;
let cos   = Math.cos;
let sin   = Math.sin;
let tan   = Math.tan;
let atan  = Math.atan;
let atan2 = Math.atan2;
let floor = Math.floor;
let ceil  = Math.ceil;

var hypo = function(a,b){ return pow(pow(a,2)+pow(b,2), 0.5); };
var h    = hypo;

const PI       = Math.PI;
const two_pi   = 2*PI;
const half_pi  = PI/2;
const quart_pi = PI/4;
const rad      = PI/180;

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

var avatars     = [];
var crossPoints = [];
var tuchs       = [];
var HTags       = [];

avatars.apply = function(func){ this.forEach(avatar => { avatar[func](); }); };

var path = new Path2D();

var num_avatar   = 1;
var num_modifier = 1;

var canvas                = getById('arene');
var structure             = getById('structure');
var ui                    = getById('ui');
var canvas_menu           = getById('canvas_menu');
var canvas_menu_button    = getById('canvas_menu_button');
var ctrl_canvas_container = getById('ctrl_canvas_container');
var formule_container     = getById('formule_container');
var formule_x             = getById('formule_x');
var formule_y             = getById('formule_y');
var export_json           = getById('export_json_container');
var import_json           = getById('import_json_container');
var import_image          = getById('import_image_container');
var interfaces            = [...document.getElementsByClassName('interface')];
var helpDialog            = getById('helpDialog');
var helpDialogGrid        = getById('helpDialogGrid');
let containerInt          = getById('othersInterfaceContainer');
let toggleInt             = getById('showHideInterfaceTxt');

let helpDialogVisible = false;

var mouse =  { click: {x: 0, y: 0} };

formule_x.value = 0;
formule_y.value = 0;

var stopWindowEvents = [...document.getElementsByClassName('stopWindowEvents')];
var input_params     = [...document.getElementsByClassName('input_params')];

//canvas_bg.children[0].value = "#ffffff";

var objectUrl;

var dpi = window.devicePixelRatio;
