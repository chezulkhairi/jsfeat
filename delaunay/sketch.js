var ctracker;
var slider;
var val = 5;
var positions;

function setup() {

  // setup camera capture
  var videoInput = createCapture();
  videoInput.size(400, 300);
  videoInput.position(0, 0);
  
  // setup canvas
  var cnv = createCanvas(400, 400);
  cnv.position(0, 0);

  // setup tracker
  ctracker = new clm.tracker();
  ctracker.init(pModel);
  ctracker.start(videoInput.elt);
  
  fill(255);
}

function draw() {
  clear();
  
  // get array of face marker positions [x, y] format
  positions = ctracker.getCurrentPosition();
  
  for (var i=0; i<positions.length; i++) {
    
    // draw ellipse at each position point
    ellipse(positions[i][0], positions[i][1], val, val);
  }
}