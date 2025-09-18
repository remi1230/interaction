//------------------ EXPORT JSON ----------------- //
function expt_json(){
  let exp_json = getById('export_json');

	if(objectUrl) { window.URL.revokeObjectURL(objectUrl); }

	var filename = exp_json.value;
	var exportFormat = 'json';
  if (filename.toLowerCase().lastIndexOf("." + exportFormat) !== filename.length - exportFormat.length || filename.length < exportFormat.length + 1){
      filename += "." + exportFormat;
  }

  /*glos.forEach((gl,i) => { gl.backgroundColor = canvasContext[i].canvas.style.backgroundColor; });
  canvasContext.forEach(ct => { delete(ct.saveImage); });
  let meta = {glos: glos, canvasContext: canvasContext};*/

	var strMesh = JSON.stringify(glos);

	var blob = new Blob ( [ strMesh ], { type : "octet/stream" } );
	objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

  //let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(blob);
  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', objectUrl);
  linkElement.setAttribute('download', filename);
  linkElement.click();
}
//------------------ IMPORT JSON ----------------- //
function impt_json(){
  var file_to_read = getById("import_json").files[0];
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var content = e.target.result;
    var contentJsonFiles = JSON.parse(content);

    glos          = [];
    canvasContext = [];

    let cans = [...document.getElementsByClassName('arenaCanvas')];
    while(cans.length){
      cans[cans.length - 1].remove();
      cans = [...document.getElementsByClassName('arenaCanvas')];
    }

    let start = true;
    contentJsonFiles.forEach(contentJsonFile => {
      activeGlo.modifiers = [];
      let glo_save = deepCopy(activeGlo);
      activeGlo = Object.assign({}, activeGlo, contentJsonFile);
      glos.push(activeGlo);
      addCanvas(start, false, true); start = false;
      activeGlo = mergeDeep(activeGlo, glo_save, true);
      let upd_size     = getById('upd_size');
      let upd_size_val = upd_size.value;
      params_interface(false);
      let nb = activeGlo.params.nb;
      deleteAvatar(avatars.length);
      activeGlo.params.nb = nb;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if(activeGlo.backgroundColor){ canvas.style.backgroundColor = activeGlo.backgroundColor; }
      createAvatar();
      upd_size.dataset.last_value = upd_size_val;
      updateSize(upd_size);
      if(activeGlo.modifiers.some(mod => mod.type == 'magnetor' || mod.type == 'mimagnetor' || mod.double)){ activeGlo.magnetors = true; }
      activeGlo.modifiers.forEach(mod => { mod.modify = makeModifierFunction(mod.type); });
    });
  };
  fileread.readAsText(file_to_read);
  activeGlo.import_json = false;
}
//------------------ IMPORT JSON ----------------- //
function impt_image(event){
  //if(!activeGlo.break){ button_check('pause'); }
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var img = new Image();
    img.onload = function(){
      ctx.drawImage(img,0,0);
    };
    img.src = e.target.result;
  };
  fileread.readAsDataURL(event.target.files[0]);
  activeGlo.import_image = false;
  //showHideCtrl(import_image);
}

function flash(){
  localStorage.clear();
  localStorage.setItem('glo', JSON.stringify(activeGlo));
  localStorage.setItem('img', canvas.toDataURL());
}

function unflash(){
  localStorage.clear();
}

function restoreFlash(){
  glos          = [];
  canvasContext = [];

  let cans = [...document.getElementsByClassName('arenaCanvas')];
  while(cans.length){
    cans[cans.length - 1].remove();
    cans = [...document.getElementsByClassName('arenaCanvas')];
  }

  let start = true;
  activeGlo.modifiers = [];
  let glo_save = deepCopy(activeGlo);
  activeGlo = Object.assign({}, activeGlo, JSON.parse(localStorage.getItem('glo')));
  glos.push(activeGlo);
  addCanvas(start, false, true); start = false;
  activeGlo = mergeDeep(activeGlo, glo_save, true);
  let upd_size     = getById('upd_size');
  let upd_size_val = upd_size.value;
  params_interface(false);
  let nb = activeGlo.params.nb;
  deleteAvatar(avatars.length);
  activeGlo.params.nb = nb;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(activeGlo.backgroundColor){ canvas.style.backgroundColor = activeGlo.backgroundColor; }
  createAvatar();
  upd_size.dataset.last_value = upd_size_val;
  updateSize(upd_size);
  if(activeGlo.modifiers.some(mod => mod.type == 'magnetor' || mod.type == 'mimagnetor' || mod.double)){ activeGlo.magnetors = true; }
  activeGlo.modifiers.forEach(mod => { mod.modify = makeModifierFunction(mod.type); });

  var dataURL = localStorage.getItem('img');
  var img     = new Image;
  img.src     = dataURL;
  img.onload  = function () { ctx.drawImage(img, 0, 0); };
}