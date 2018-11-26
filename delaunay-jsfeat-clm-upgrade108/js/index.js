var curr_img_pyr, prev_img_pyr, point_count, point_status, prev_xy, curr_xy;

var scene;
var stats;

var canvas;
var canvas2;
var context2;

var ctx;

var windowWidth;
var windowHeight;
var width;
var height;
var imgUint8;
var data;

var mesh;

var triangles;
var vertices;
var verticesBase;

var opener;
var img;
var video;
var imgSource;
var imgCanvas;
var imgCtx;
var imgScale = 1;
var imgOffsetX = 1;
var imgOffsetY = 1;
var prevConfig = {}; 

var svg;

var needUpdateSource = true; 
var needIndexing = true;
var needDraw = true;
var dumpSvg = false;

var config = {
  boxy:false,
  useFlow:false,
  win_size : 20,
                max_iterations :30,
                epsilon : 0.01,
                min_eigen :0.001,
  useCorner: false,
    useJSFeat: true,
    jsFeatThreshold: 20,
    randomAmount: 3000,
    useFill: true,
    lineWidth: 1,
    overDraw: 0,
    forceRedraw: true,
  Trackcanny:false,
  blur_radius:1,
  low_threshold:1,
                high_threshold:1,
    useCamera: false,
    openFile: function() {
        opener.click();
    },
    saveAsPNG: function() {
        onResize(0, img.width, img.height);
        render();
        // window.open(canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
        window.open(canvas.toDataURL('image/png'));
        onResize();
    },
    saveAsSVG: function() {
        svg = '<?xml version="1.0" encoding="utf-8"?>\n';
        svg += '<svg version="1.2" id="svg" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 ' + width + ' ' + height + '" xml:space="preserve">\n';
        dumpSvg = true;
        draw();
        dumpSvg = false;
        svg += '</svg>';
        window.open('data:image/svg+xml,'+encodeURIComponent(svg));
        draw();
    }
};

function init() {

    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    imgCanvas = document.createElement('canvas');
    imgCtx = imgCanvas.getContext('2d');
  
  //var img3 = new Image();
  //var img3 = imgCtx.getImageData(0, 0, width, height);
  //var ctrack = new clm.tracker({stopOnConvergence : true});
	//ctrack.init();
  
  //-------------------------->>>>>>>>>>>
   //scene = new THREE.Scene();
  //const canvasElement = document.getElementById("scene");
  //const drawingContext = canvasElement.getContext("2d");
  
   //canvas = document.getElementById("canvas");
   //ctx = canvas.getContext("2d");
  //ctx.rect(20, 20, 50, 50);
  
  
//var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//var renderer = new THREE.WebGLRenderer();
//renderer.setSize( window.innerWidth, window.innerHeight );
//document.body.appendChild( renderer.domElement );
  
  
  //-------------------------->>>>>>>>>>>
  
  
  
  
  
    speakUtils.addImageDropListener(canvas, onImageDrop);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = 0;
    stats.domElement.style.top = 0;
    document.body.appendChild( stats.domElement );

    opener = document.querySelector('.opener');
    opener.addEventListener('change', readImage);

    var gui = new dat.GUI();
  gui.add(config, 'boxy');
  gui.add(config, 'useFlow');
  gui.add(config, 'win_size');
                gui.add(config, 'max_iterations');
                gui.add(config, 'epsilon');
                gui.add(config, 'min_eigen');
  gui.add(config, 'useCorner');
    gui.add(config, 'useJSFeat');
    gui.add(config, 'jsFeatThreshold', 5, 50);
    gui.add(config, 'randomAmount', 8, 5000);
    gui.add(config, 'useFill');
    gui.add(config, 'lineWidth', 0, 5);
    gui.add(config, 'overDraw', 0, 3);
    gui.add(config, 'forceRedraw');
    gui.add(config, 'useCamera');
  gui.add(config,'Trackcanny');
  gui.add(config,'blur_radius');
                gui.add(config, 'low_threshold');
                gui.add(config, 'high_threshold');
    gui.add(config, 'openFile');
    gui.add(config, 'saveAsPNG');
    gui.add(config, 'saveAsSVG');
    window.onresize = onResize; 
    animate();
}

PrismGeometry = function ( vertices, height ) {

    var Shape = new THREE.Shape();

    ( function f( ctx ) {

        ctx.moveTo( vertices[0].x, vertices[0].y );
        for (var i=1; i < vertices.length; i++) {
            ctx.lineTo( vertices[i].x, vertices[i].y );
        }
        ctx.lineTo( vertices[0].x, vertices[0].y );

    } )( Shape );

    var settings = { };
    settings.amount = height;
    settings.bevelEnabled = false;
    THREE.ExtrudeGeometry.call( this, Shape, settings );
};
//PrismGeometry.prototype = Object.create( THREE.ExtrudeGeometry.prototype );
//var A = new THREE.Vector2( 0, 0 );
//var B = new THREE.Vector2( 30, 10 );
//var C = new THREE.Vector2( 20, 50 );
//var height = 12;                   
//var geometry = new PrismGeometry( [ A, B, C ], height ); 
//var material = new THREE.MeshPhongMaterial( { color: 0x00b2fc, specular: 0x00ffff, shininess: 20 } );
//var prism1 = new THREE.Mesh( geometry, material );
//prism1.rotation.x = -Math.PI  /  2;
//scene.add( prism1 );



function readImage() {
    if(this.files && this.files[0]) {
        var fileReader= new FileReader();
        fileReader.onload = function(e) {
            var photo = new Image();
            photo.onload = onImageDrop;
            photo.src = e.target.result;
        };
        fileReader.readAsDataURL( this.files[0] );
    }
}

function onResize(evt, forceWidth, forceHeight) {
    var windowWidth = canvas.width = forceWidth || window.innerWidth;
    var windowHeight = canvas.height = forceHeight || window.innerHeight;
    imgScale = Math.min(windowWidth / img.width, windowHeight / img.height);
    imgOffsetX = (windowWidth - img.width * imgScale) / 2;
    imgOffsetY = (windowHeight - img.height * imgScale) / 2;
    needDraw = true;
}

function animate() {
    window.requestAnimationFrame(animate);
    stats.begin();
    render();
    stats.end();
}

function onImageDrop() {
    img = imgSource = this;
    needUpdateSource = true;
}

function render() {

    useCamera(config.useCamera);
    if(needUpdateSource) {
        updateSource();
    }

    if(config.useJSFeat && (prevConfig.jsFeatThreshold !== config.jsFeatThreshold)) {
        needIndexing = true;
    } else if(!config.useJSFeat && (prevConfig.randomAmount !== config.randomAmount)) {
        needIndexing = true;
    } else if(prevConfig.useJSFeat !== config.useJSFeat) {
        needIndexing = true;
    }

    if(needIndexing) {
        indexing();
    }

    if(prevConfig.useFill !== config.useFill) {
        needDraw = true;
    } else if(prevConfig.lineWidth !== config.lineWidth) {
        needDraw = true;
    } else if(prevConfig.overDraw !== config.overDraw) {
        needDraw = true;
    } else if(prevConfig.useCamera !== config.useCamera) {
        needDraw = true;
    }

    if(needDraw || config.forceRedraw) {
        draw();
    }

    for(var id in config) {
        if(prevConfig[id] !== config[id]) {
            prevConfig[id] = config[id];
        }
    }
}


function updateSource() {
    if(img.width) {
        needUpdateSource = false;
        needIndexing = true;

        var hasDimensionChanged = (width !== img.width) || (height !== img.height);
        if(hasDimensionChanged) {
            width = imgCanvas.width = img.width;
            height = imgCanvas.height = img.height;
        }

        var imageData;
        if(config.useJSFeat) {
            imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
            if(hasDimensionChanged) {
                imgUint8 = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
                corners = [];
                var i = width*height;
                while(--i >= 0) {
                    corners[i] = new jsfeat.keypoint_t(0,0,0,0);
                }
              
              
            }
            jsfeat.imgproc.grayscale(data, width, height, imgUint8);
          
//imageData = imgCtx.getImageData(0, 0, width, height);
threshold = 20;           
jsfeat.fast_corners.set_threshold(threshold);    
jsfeat.imgproc.grayscale(imageData.data, width, height, imgUint8);
//stat.stop("grayscale");         
jsfeat.fast_corners.set_threshold(threshold);
//stat.start("fast corners");
var count = jsfeat.fast_corners.detect(imgUint8, corners, 5);
//stat.stop("fast corners");
 // render result back to canvas
var data_u32 = new Uint32Array(imageData.data.buffer);
render_corners(corners, count, data_u32, 640);
imgCtx.drawImage(img, 0, 0, width, height);
          
          
          
          
        } else {
            imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
        }

        if(hasDimensionChanged) {
            onResize();
        }
    }
  
  if(config.useCorner) {
            imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
            if(hasDimensionChanged) {
                imgUint8 = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
                corners = [];
                var i = width*height;
                while(--i >= 0) {
                    corners[i] = new jsfeat.keypoint_t(0,0,0,0);
                }
                          }
            jsfeat.imgproc.grayscale(data, width, height, imgUint8);       
//imageData = imgCtx.getImageData(0, 0, width, height);
threshold = 20;           
jsfeat.fast_corners.set_threshold(threshold);    
jsfeat.imgproc.grayscale(imageData.data, width, height, imgUint8);
//stat.stop("grayscale");         
jsfeat.fast_corners.set_threshold(threshold);
//stat.start("fast corners");
var count = jsfeat.fast_corners.detect(imgUint8, corners, 5);
//stat.stop("fast corners");
 // render result back to canvas
var data_u32 = new Uint32Array(imageData.data.buffer);
render_corners(corners, count, data_u32, 640);
imgCtx.drawImage(img, 0, 0, width, height);   
          
        } else {
            imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
        }
      
        if(hasDimensionChanged) {
            onResize();
        }
  
    if(config.Trackcanny){
      imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
      
                    jsfeat.imgproc.grayscale(imageData.data, 640, 480, img_u8); 
                    var r = options.blur_radius|0;
                    var kernel_size = (r+1) << 1;
                    jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernel_size, 0);
                    jsfeat.imgproc.canny(img_u8, img_u8, options.low_threshold|0, options.high_threshold|0);
                    // render result back to canvas
                    var data_u32 = new Uint32Array(imageData.data.buffer);
                    var alpha = (0xff << 24);
                    var i = img_u8.cols*img_u8.rows, pix = 0;
                    while(--i >= 0) {
                        pix = img_u8.data[i];
                        data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
                    }
                    imgCtx.drawImage(img, 0, 0, width, height); 
  } else {
            imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
        }
      
        if(hasDimensionChanged) {
            onResize();
        }
    //----------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      if(config.useFlow){
            imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
            var c=document.getElementById("canvas");
            var ctx=c.getContext("2d");
            //ctx.fillStyle="red";
            //ctx.fillRect(10,10,50,50);
                ctx.fillStyle = "rgb(0,255,0)";
                ctx.strokeStyle = "rgb(0,255,0)";
                //img_u8 = new jsfeat.matrix_t(640, 480, jsfeat.U8_t | jsfeat.C1_t);
                imgUint8 = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
                curr_img_pyr = new jsfeat.pyramid_t(3);
                prev_img_pyr = new jsfeat.pyramid_t(3);
                curr_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);
                prev_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);
                point_count = 0;
                point_status = new Uint8Array(100);
                prev_xy = new Float32Array(100*2);
                curr_xy = new Float32Array(100*2);
        
                ctx.drawImage(video, 0, 0, 640, 480);
                var imageData = ctx.getImageData(0, 0, 640, 480);
                    
                    //
                    
                    stat.start("grayscale");
                    jsfeat.imgproc.grayscale(imageData.data, 640, 480, img_u8);
                    stat.stop("grayscale");

                    // render result back to canvas
                    var data_u32 = new Uint32Array(imageData.data.buffer);
                    var alpha = (0xff << 24);
                    var i = img_u8.cols*img_u8.rows, pix = 0;
                    while(--i >= 0) {
                        pix = img_u8.data[i];
                        data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
                    }

                    ctx.putImageData(imageData, 0, 0);

                    // swap flow data
                    var _pt_xy = prev_xy;
                    prev_xy = curr_xy;
                    curr_xy = _pt_xy;
                    var _pyr = prev_img_pyr;
                    prev_img_pyr = curr_img_pyr;
                    curr_img_pyr = _pyr;
                    jsfeat.imgproc.grayscale(imageData.data, 640, 480, curr_img_pyr.data[0]);
                    stat.stop("grayscale");
                    curr_img_pyr.build(curr_img_pyr.data[0], true);
                    jsfeat.optical_flow_lk.track(prev_img_pyr, curr_img_pyr, prev_xy, curr_xy, point_count, options.win_size|0, options.max_iterations|0, point_status, options.epsilon, options.min_eigen);
                    prune_oflow_points(ctx);
        
                    ctx.drawImage(img, 0, 0, width, height); 
  } else {
            imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
        }
      
        if(hasDimensionChanged) {
            onResize();
        }
  
  
  
}

function indexing() {
    needIndexing = false;
    needDraw = true;
    var i, len;
    vertices = [];
    if(config.useJSFeat) {
        prevConfig.jsFeatThreshold = config.jsFeatThreshold;
        jsfeat.fast_corners.set_threshold(~~config.jsFeatThreshold);
        len = jsfeat.fast_corners.detect(imgUint8, corners, 0);

        var corner;
        for( i = 0; i < len; i++) {
            corner = corners[i];
            vertices.push([corner.x, corner.y]); 
        }
    } else {
        for( i = 0, len = config.randomAmount - 8 ; i < len; i++) {
            vertices[i] = [(1 - Math.pow(Math.random(), 2)) * width | 0, Math.random() * height | 0];
        }
    }
  

    vertices.push([0, 0]);
    vertices.push([width >> 1, 0]);
    vertices.push([width, 0]);
    vertices.push([0, height >> 1]);
    vertices.push([0, height]);
    vertices.push([width >> 1, height]);
    vertices.push([width, height >> 1]);
    vertices.push([width, height]);

    triangles = Delaunay.triangulate( vertices );

    // optimization
    // flatten vertices
    var tmp = vertices;
    vertices = new Float32Array(tmp.length * 2);
    verticesBase = new Float32Array(tmp.length * 2);
    i = vertices.length / 2;
    while(i--) {
        vertices[i * 2] = verticesBase[i * 2] = tmp[i][0];
        vertices[i * 2+ 1] = verticesBase[i * 2+ 1] = tmp[i][1];
    }
    triangles = new Int32Array(triangles);
    i = triangles.length;
    while(i--) {
        triangles[i]*= 2;
    }
}

function draw() {

    needDraw = false;

    ctx.clearRect(0,0, canvas.width, canvas.height);
    var triangle, x, y, sumX, sumY, p0X, p0Y, p1X, p1Y, p2X, p2Y, dX, dY, color, r, g, b, area;
    var dataIndex;
    var useFill = config.useFill;
    var lineWidth = ctx.lineWidth = config.lineWidth / imgScale;
    var overDraw = config.overDraw / imgScale;
    var useJSFeat = config.useJSFeat;
    var i = triangles.length;

    ctx.lineJoin = 'bevel';
    ctx.save();
    ctx.translate(imgOffsetX, imgOffsetY);
    ctx.scale(imgScale, imgScale);
    var min = 1000000000;
    var max = 0;
    var count = 0;
    while(i > 0) {
        triangle = triangles[--i];
        p0X = vertices[triangle];
        p0Y = vertices[triangle + 1];
        triangle = triangles[--i];
        p1X = vertices[triangle];
        p1Y = vertices[triangle + 1];
        triangle = triangles[--i];
        p2X = vertices[triangle];
        p2Y = vertices[triangle + 1];

        if(overDraw) {
            dX = p1X - p0X;
            dY = p1Y - p0Y;
            det = dX * dX + dY * dY;
            det = overDraw / Math.sqrt( det );
            dX *= det;
            dY *= det; 
            p0X -= dX;
            p0Y -= dY;
            p1X += dX;
            p1Y += dY;

            dX = p2X - p1X;
            dY = p2Y - p1Y;
            det = dX * dX + dY * dY;
            det = overDraw / Math.sqrt( det );
            dX *= det;
            dY *= det;
            p1X -= dX;
            p1Y -= dY;
            p2X += dX;
            p2Y += dY;

            dX = p0X - p2X;
            dY = p0Y - p2Y;
            det = dX * dX + dY * dY;
            det = overDraw / Math.sqrt( det );
            dX *= det;
            dY *= det;
            p2X -= dX;
            p2Y -= dY;
            p0X += dX;
            p0Y += dY;
        }
        dataIndex = (~~((p0X + p1X + p2X) / 3) + ~~((p0Y + p1Y + p2Y) / 3) * width) * 4;
        r = data[dataIndex]; 
        g = data[dataIndex + 1];
        b = data[dataIndex + 2];
        color = '#' + ('000000' +(r << 16 ^ g << 8 ^ b << 0).toString( 16 )).slice( - 6 );
      if(config.boxy) {
        ctx.fillRect(p0X, p1X, 100, 100);}
      
      

        if(dumpSvg) { 
            svg += '<polygon points="' + p0X  + ',' + p0Y + ' ' + p1X  + ',' + p1Y + ' ' + p2X  + ',' + p2Y + '"' + (lineWidth ? ' stroke="' + color + '"' : '') + (useFill ? ' fill="' + color + '"' : '') + ' />\n';
        } else {
            ctx.beginPath();
            ctx.moveTo(p0X, p0Y);
            ctx.lineTo(p1X, p1Y);
            ctx.lineTo(p2X, p2Y);
            ctx.fillStyle = ctx.strokeStyle = color;
            if(useFill) ctx.fill();
            if(lineWidth) ctx.stroke();
            ctx.closePath();
        }
        count ++;
    }
    ctx.restore();
}

img = imgSource = new Image();
img.crossOrigin = 'Anonymous';
img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/6043/the_pearl_girl.jpg';
if(img.width) {
    init();
} else {
    img.onload = init;
}

function useCamera(isEnable) {
    if(isEnable) {
        if(!video) {
            video = document.createElement('video');

            video.addEventListener('loadeddata', function() {
                var readyDirtyCheck = setInterval(function(){
                    if(video.videoWidth) {
                        video.width = video.videoWidth;
                        video.height = video.videoHeight;
                        clearInterval(readyDirtyCheck);
                    }
                }, 16);
            });
            navigator.getUserMedia = ( navigator.getUserMedia ||
                               navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia ||
                               navigator.msGetUserMedia);
            navigator.getUserMedia({video: true}, function(stream) {
                video.src = window.URL.createObjectURL(stream);
                setTimeout(function() {
                    if(config.useCamera) {
                        img = video;
                        video.play();
                        needUpdateSource = true;
                    }
                }, 500);
            }, function(err){console.log(err);});
        } else if(video.videoWidth) {
            if(video.paused) {
                video.play();
            }
            img = video;
            needUpdateSource = true;
        }
    } else {
        img = imgSource;
        if(video) {
            if(video.videoWidth) {
                video.pause();
            }
        }
        if(isEnable !== prevConfig.useCamera) {
            needUpdateSource = true;
        }
    }
}

function render_corners(corners, count, img, step) {
                var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;
                for(var i=0; i < count; ++i)
                {
                    var x = corners[i].x;
                    var y = corners[i].y;
                    var off = (x + y * step);
                    img[off] = pix;
                    img[off-1] = pix;
                    img[off+1] = pix;
                    img[off-step] = pix;
                    img[off+step] = pix;
                }
            } 

var c=document.getElementById("canvas");
var ctx=c.getContext("2d");
ctx.fillStyle="red";
ctx.fillRect(10,10,50,50);

ctx.fillStyle = "green";
ctx.fillRect(30, 50, 50, 50); 

function copy()
{
var imgData=ctx.getImageData(10,10,50,50);
ctx.putImageData(imgData,10,70);
}

<button onclick="copy()">Copy</button>  

var cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff55ff});
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);
cube.position = (15,10,4);

//return array with height data from img
function getHeightData(img,scale) {
  
 if (scale == undefined) scale=1;
  
    //var canvas = document.createElement( 'canvas' );
    //canvas.width = img.width;
    //canvas.height = img.height;
    //var context = canvas.getContext( '2d' );
  var c=document.getElementById("canvas");
var context=c.getContext("2d");
 
    var size = img.width * img.height;
    var data = new Float32Array( size );
 
    context.drawImage(img,0,0);
 
    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0
    }
 
    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;
 
    var j=0;
    for (var i = 0; i<pix.length; i +=4) {
        var all = pix[i]+pix[i+1]+pix[i+2];
        data[j++] = all/(12*scale);
    }
     
    return data;
}

       // terrain 
var img2 = new Image();
img2.onload = function () {
  
    //get height data from img
    var data = getHeightData(img2);
  
    // plane
    var geometry = new THREE.PlaneGeometry(10,10,9,9);
    var texture = THREE.ImageUtils.loadTexture( 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/6043/the_pearl_girl.jpg' );
    var material = new THREE.MeshLambertMaterial( { map: texture } );
    plane = new THREE.Mesh( geometry, material );
     
    //set height of vertices
    for ( var i = 0; i<plane.geometry.vertices.length; i++ ) {
         plane.geometry.vertices[i].z = data[i];
    }
 
    scene.add(plane);
   
};
// load img source 
img2.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/6043/the_pearl_girl.jpg";




var length = 12, width = 8;

var shape = new THREE.Shape(); 
shape.moveTo( 0,0 );
shape.lineTo( 0, width );
shape.lineTo( length, width );
shape.lineTo( length, 0 );
shape.lineTo( 0, 0 );

var extrudeSettings = {
	steps: 2,
	depth: 16,
	bevelEnabled: true,
	bevelThickness: 1,
	bevelSize: 1,
	bevelSegments: 1
};

var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var mesh2 = new THREE.Mesh( geometry, material ) ;
scene.add( mesh2 );

            function on_canvas_click(e) {
                var coords = canvas.relMouseCoords(e);
                if(coords.x > 0 & coords.y > 0 & coords.x < canvasWidth & coords.y < canvasHeight) {
                    curr_xy[point_count<<1] = coords.x;
                    curr_xy[(point_count<<1)+1] = coords.y;
                    point_count++;
                }
            }
            canvas.addEventListener('click', on_canvas_click, false);

            function draw_circle(ctx, x, y) {
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI*2, true);
                ctx.closePath();
                ctx.fill();
            }

            function prune_oflow_points(ctx) {
                var n = point_count;
                var i=0,j=0;

                for(; i < n; ++i) {
                    if(point_status[i] == 1) {
                        if(j < i) {
                            curr_xy[j<<1] = curr_xy[i<<1];
                            curr_xy[(j<<1)+1] = curr_xy[(i<<1)+1];
                        }
                        draw_circle(ctx, curr_xy[j<<1], curr_xy[(j<<1)+1]);
                        ++j;
                    }
                }
                point_count = j;
            }

            function relMouseCoords(event) {
                var totalOffsetX=0,totalOffsetY=0,canvasX=0,canvasY=0;
                var currentElement = this;

                do {
                    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
                    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
                } while(currentElement = currentElement.offsetParent)

                canvasX = event.pageX - totalOffsetX;
                canvasY = event.pageY - totalOffsetY;

                return {x:canvasX, y:canvasY}
            }
            HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

var canvas2 = document.getElementById("canvas2");
var W = 500;
var H = 500;
var scene2= new THREE.Scene();
// SCENE

//scene = new THREE.Scene();

// CAMERA 

camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
camera.position.x = 17;
camera.position.y = 12;
camera.position.z = 13;
camera.lookAt(scene2.position);

// RENDERER

renderer = new THREE.WebGLRenderer({canvas: canvas2});
renderer.setClearColor(0x000, 1.0);
renderer.setSize(W,H);

// GEOMETRY & MATERIALS

var cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff55ff});
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene2.add(cube);
cube.position.z = 4;

// LIGHT

var spot1 = new THREE.SpotLight(0xffffff);
spot1.position.set(10, 100, -50);
scene2.add(spot1);

// FINISH SCENE SETUP

renderer.render(scene2, camera);