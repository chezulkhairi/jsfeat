function getX(i) {
  return points[i][0];
}
function getY(i) {
  return points[i][1];
}

var srcImage, delaunay, canvas2, ctx2;
var maxX = 500;
var maxY = 500;
var count = 20;
var points = [];

function addBounds() {
  points.push([0, 0]);
  points.push([maxX / 2, 0]);
  points.push([maxX, 0]);
  points.push([maxX, maxY / 2]);
  points.push([maxX, maxY]);
  points.push([maxX / 2, maxY]);
  points.push([0, maxY / 2]);
  points.push([0, maxY]);
}

function draw() {
  addBounds();
  delaunay = new Delaunator(points);
  var triangles = delaunay.triangles;
  var coordinates = [];
  for (var i = 0; i < triangles.length; i += 3) {
    coordinates.push([
    points[triangles[i]],
    points[triangles[i + 1]],
    points[triangles[i + 2]]]);

  }

  canvas2 = document.getElementById("canvas2");
  ctx2 = canvas2.getContext("2d");
  canvas2.width = maxX;
  canvas2.height = maxY;

  ctx2.drawImage(srcImage, 0, 0);

  // ctx.beginPath();
  // for (var i = 0; i < coordinates.length; i ++) {
  //   var coordinate = coordinates[i];
  //   var p0 = coordinate[0];
  //   var p1 = coordinate[1];
  //   var p2 = coordinate[2];
  //   ctx.moveTo(p0[0], p0[1]);
  //   ctx.lineTo(p1[0], p1[1]);
  //   ctx.lineTo(p2[0], p2[1]);
  //   ctx.closePath();

  // }
  // ctx.strokeStyle = 'rgba(0,0,0,1)';
  // ctx.lineWidth = 1;
  // ctx.stroke();

  imageData = ctx2.getImageData(0, 0, maxX, maxY);
  drawColors(coordinates, ctx2);
}

var options = {
  tolerance: 0.76,
  distance: 23,
  contrast: 0.8 };


var imageData;

function getEdges() {
  console.log('getEdges');
  var src = document.getElementById("source-image").src;
  srcImage = new Image();
  srcImage.crossOrigin = "";
  // srcImage.crossOrigin = "Anonymous";


  srcImage.addEventListener("load", function (e) {
    console.log('loaded');
    var filter = new WebGLImageFilter();
    filter.addFilter("desaturate");
    filter.addFilter("detectEdges");
    filter.addFilter("contrast", parseFloat(options.contrast));
    filter.addFilter("sharpen", parseFloat(options.sharpen));
    var filteredImage = filter.apply(srcImage);

    var newCanvas = document.getElementById("filter-canvas");
    newCanvas.width = srcImage.width;
    newCanvas.height = srcImage.height;
    var fCtx = newCanvas.getContext("2d");
    fCtx.drawImage(filteredImage, 0, 0);
    console.log('fCtx.drawImage');

    var filterData = fCtx.getImageData(0, 0, srcImage.width, srcImage.height);

    var edgePoints = [];
    var data = filterData.data;
    for (var i = 0; i < data.length; i += 4) {
      var r = data[i] / 255;
      var g = data[i + 1] / 255;
      var b = data[i + 2] / 255;

      if (r + g + b > parseFloat(options.tolerance)) {
        var x = (i / 4 >> 0) % srcImage.width;
        var y = (i / 4 >> 0) / srcImage.width >> 0;
        edgePoints.push([x, y]);
      }
    }

    points = [];
    for (var i = 0; i < edgePoints.length; i++) {
      var a = edgePoints[i];
      if (points.length < 0) {
        points.push(a);
        continue;
      }
      var addPoint = true;
      for (var j = 0; j < points.length; j++) {
        if (points[j]) {
          var d = distanceBetween(a, points[j]);
          if (d < parseFloat(options.distance)) {
            addPoint = false;
            break;
          }
        }
      }
      if (addPoint) {
        points.push(a);
      }
    }

    maxX = srcImage.width;
    maxY = srcImage.height;

    draw();
  });
  srcImage.addEventListener("error", function (e) {
    document.body.insertAdjacentText('beforeend', 'ERROR :( - probably CORS');
  });
  srcImage.src = src;

}

function getColorAtPoint(p) {
  var x = p[0] >> 0;
  var y = p[1] >> 0;
  var i = y * maxX * 4 + x * 4;
  var r = imageData.data[i];
  var g = imageData.data[i + 1];
  var b = imageData.data[i + 2];
  return "rgb(" + r + "," + g + "," + b + ")";
}

function drawColors(coordinates, ctx2) {
  for (var i = 0; i < coordinates.length; i++) {
    ctx2.beginPath();
    var coordinate = coordinates[i];
    var p0 = coordinate[0];
    var p1 = coordinate[1];
    var p2 = coordinate[2];
    ctx2.moveTo(p0[0], p0[1]);
    ctx2.lineTo(p1[0], p1[1]);
    ctx2.lineTo(p2[0], p2[1]);
    ctx2.closePath();

    var center = centroid(p0, p1, p2);
    var c = getColorAtPoint(center);
    ctx2.fillStyle = c;
    ctx2.fill();
  }

  // ctx.beginPath();
  // for (var i = 0; i < coordinates.length; i ++) {
  //   var coordinate = coordinates[i];
  //   var p0 = coordinate[0];
  //   var p1 = coordinate[1];
  //   var p2 = coordinate[2];
  //   var center = centroid(p0, p1, p2);
  //   var c = getColorAtPoint(center);
  //   ctx.fillStyle = c; //'black';// c;
  //   ctx.fillRect(center[0] - 2, center[1] - 2, 4, 4);
  // }
}

function distanceBetween(a, b) {
  var x = a[0] - b[0];
  var y = a[1] - b[1];
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}
console.log(' --- ');
getEdges();

var controls = document.querySelectorAll(".range-input");var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
  for (var _iterator = controls[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var control = _step.value;
    control.addEventListener("change", function (e) {
      var id = e.target.id;
      console.log(e.target.id, e.target.value, options[id]);
      options[id] = e.target.value;
      getEdges();
    });
  }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}

function centroid(p1, p2, p3) {
  var cx = (p1[0] + p2[0] + p3[0]) / 3;
  var cy = (p1[1] + p2[1] + p3[1]) / 3;

  return [cx, cy];
}

var videoWidth = void 0,videoHeight = void 0;

// whether streaming video from the camera.
var streaming = false;

var video = document.getElementById('video');
var canvasOutput = document.getElementById('canvasOutput');
var canvasOutputCtx = canvasOutput.getContext('2d');

/////////
var canvasOutput2 = document.getElementById('canvasOutput2');
var canvasOutputCtx2 = canvasOutput.getContext('2d');
/////////
var stream = null;

var detectFace = document.getElementById('face');
var detectEye = document.getElementById('eye');

function startCamera() {
  if (streaming) return;
  navigator.mediaDevices.getUserMedia({ video: true, audio: false }).
  then(function (s) {
    stream = s;
    video.srcObject = s;
    video.play();
  }).
  catch(function (err) {
    console.log("An error occured! " + err);
  });

  video.addEventListener("canplay", function (ev) {
    if (!streaming) {
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
      video.setAttribute("width", videoWidth);
      video.setAttribute("height", videoHeight);
      canvasOutput.width = videoWidth;
      canvasOutput.height = videoHeight;
      streaming = true;
    }
    startVideoProcessing();
  }, false);
}

var faceClassifier = null;
var eyeClassifier = null;

var src = null;
var dstC1 = null;
var dstC3 = null;
var dstC4 = null;

var canvasInput = null;
var canvasInputCtx = null;

var canvasBuffer = null;
var canvasBufferCtx = null;

function startVideoProcessing() {
  if (!streaming) {console.warn("Please startup your webcam");return;}
  stopVideoProcessing();
  canvasInput = document.createElement('canvas');
  canvasInput.width = videoWidth;
  canvasInput.height = videoHeight;
  canvasInputCtx = canvasInput.getContext('2d');

  canvasBuffer = document.createElement('canvas');
  canvasBuffer.width = videoWidth;
  canvasBuffer.height = videoHeight;
  canvasBufferCtx = canvasBuffer.getContext('2d');

  srcMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
  grayMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);

  faceClassifier = new cv.CascadeClassifier();
  faceClassifier.load('haarcascade_frontalface_default.xml');

  eyeClassifier = new cv.CascadeClassifier();
  eyeClassifier.load('haarcascade_eye.xml');

  requestAnimationFrame(processVideo);
}

function processVideo() {
  stats.begin();
  canvasInputCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
  var imageData = canvasInputCtx.getImageData(0, 0, videoWidth, videoHeight);
  srcMat.data.set(imageData.data);
  cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);
  var faces = [];
  var eyes = [];
  var size = void 0;
  if (detectFace.checked) {
    var faceVect = new cv.RectVector();
    var faceMat = new cv.Mat();
    if (detectEye.checked) {
      cv.pyrDown(grayMat, faceMat);
      size = faceMat.size();
    } else {
      cv.pyrDown(grayMat, faceMat);
      cv.pyrDown(faceMat, faceMat);
      size = faceMat.size();
    }
    faceClassifier.detectMultiScale(faceMat, faceVect);
    for (var i = 0; i < faceVect.size(); i++) {
      var face = faceVect.get(i);
      faces.push(new cv.Rect(face.x, face.y, face.width, face.height));
      if (detectEye.checked) {
        var eyeVect = new cv.RectVector();
        var eyeMat = faceMat.getRoiRect(face);
        eyeClassifier.detectMultiScale(eyeMat, eyeVect);
        for (var _i = 0; _i < eyeVect.size(); _i++) {
          var eye = eyeVect.get(_i);
          eyes.push(new cv.Rect(face.x + eye.x, face.y + eye.y, eye.width, eye.height));
        }
        eyeMat.delete();
        eyeVect.delete();
      }
    }
    faceMat.delete();
    faceVect.delete();
  } else {
    if (detectEye.checked) {
      var _eyeVect = new cv.RectVector();
      var _eyeMat = new cv.Mat();
      cv.pyrDown(grayMat, _eyeMat);
      size = _eyeMat.size();
      eyeClassifier.detectMultiScale(_eyeMat, _eyeVect);
      for (var _i2 = 0; _i2 < _eyeVect.size(); _i2++) {
        var _eye = _eyeVect.get(_i2);
        eyes.push(new cv.Rect(_eye.x, _eye.y, _eye.width, _eye.height));
      }
      _eyeMat.delete();
      _eyeVect.delete();
    }
  }
  canvasOutputCtx.drawImage(canvasInput, 0, 0, videoWidth, videoHeight);
  drawResults(canvasOutputCtx, faces, 'red', size);
  drawResults(canvasOutputCtx, eyes, 'yellow', size);
  ////////////////

  ////////////////
  stats.end();
  requestAnimationFrame(processVideo);
}

function drawResults(ctx, results, color, size) {
  for (var i = 0; i < results.length; ++i) {
    var rect = results[i];
    var xRatio = videoWidth / size.width;
    var yRatio = videoHeight / size.height;
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.strokeRect(rect.x * xRatio, rect.y * yRatio, rect.width * xRatio, rect.height * yRatio);
  }
}

function stopVideoProcessing() {
  if (src != null && !src.isDeleted()) src.delete();
  if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
  if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
  if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
}

function stopCamera() {
  if (!streaming) return;
  stopVideoProcessing();
  document.getElementById("canvasOutput").getContext("2d").clearRect(0, 0, width, height);
  video.pause();
  video.srcObject = null;
  stream.getVideoTracks()[0].stop();
  streaming = false;
}

function initUI() {
  stats = new Stats();
  stats.showPanel(0);
  document.getElementById('container').appendChild(stats.dom);
}

function opencvIsReady() {
  console.log('OpenCV.js is ready');
  initUI();
  startCamera();
}