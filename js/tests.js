function testOnMouse(){
  testIsBlank();
  //testColor();
  //testAngle();
  //testAv();
  //testSumHsl();
}

function testIsBlank(){
  const x = Math.min(canvas.width  - 1, Math.max(0, Math.floor(mouse.x)));
  const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(mouse.y)));

  const imgData = ctx.getImageData(x, y, 1, 1);
  const d = imgData.data; // longueur 4
  const [r,g,b,a] = d;

  const isBlank = (r|g|b|a) === 0;

  msg(
    "Mouse x : " + x,
    "Mouse y : " + y,
    `RGB${!isBlank ? 'A' : ''} : ` + (!isBlank ? [r,g,b,a].join(", ") : canvas.style.backgroundColor.slice(4, -1)),
    "Couleur de fond: " + (isBlank ? 'Oui' : 'Non')
  );
}

function testSumHsl(cs  = [{h: 220, s: 77, l: 42, a: 1}, {h: 350, s: 77, l: 42, a: 1},]){
  let cSum = hslaSum(...cs);

  cs.forEach((c,i) => {
    ctx.fillStyle = 'hsla(' + c.h + ', ' + c.s + '%, ' + c.l + '%, ' + c.a +')';
    ctx.beginPath();
    ctx.arc(300 + i*100, 300, 50, 0, two_pi);
    ctx.fill();
  });

  ctx.fillStyle = 'hsla(' + cSum.h + ', ' + cSum.s + '%, ' + cSum.l + '%, ' + cSum.a +')';
  ctx.beginPath();
  ctx.arc(300, 400, 50, 0, two_pi);
  ctx.fill();
}

function testAv(){
  let av = avatars[0];
  let diff = av.direction - av.dirSecMove;
  msg(
    'Direction  : ' + av.direction,
    'Dir second : ' + av.dirSecMove,
    'Dir - sec  : ' + diff,
  );
}

function testAngle(){
  let dx = mouse.x - canvas.width/2;
  let dy = mouse.y - canvas.height/2;

  msg('Angle : ' + atan2piZ(dx, dy));
}

function testColor(){
  let data = ctx.getImageData(mouse.x,mouse.y,1,1).data;

  msg('Color : ' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3]);
}