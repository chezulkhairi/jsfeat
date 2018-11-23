
var stats;
//var canvas;
var ctx;
var scene;


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
var img= new Image();
var image = new Image();
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
    useJSFeat: true,
    jsFeatThreshold: 20,
    randomAmount: 3000,
    useFill: true,
    lineWidth: 1,
    overDraw: 0,
    forceRedraw: false,
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

    canvas = document.getElementById("canvas"); 
    ctx = canvas.getContext('2d');
  
  ctx = canvas.getContext("2d");
  ctx.fillStyle = "green";
  ctx.fillRect(20, 80, 30, 30);
    document.body.appendChild(canvas);
    imgCanvas = document.getElementById("canvas");
    imgCtx = imgCanvas.getContext('2d');
    speakUtils.addImageDropListener(canvas, onImageDrop);
  
  //scene = document.getElementById("canvas");
//var CANVAS_WIDTH = 600;
//var CANVAS_HEIGHT = 300;
//scene = new THREE.Scene();

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = 0;
    stats.domElement.style.top = 0;
    document.body.appendChild( stats.domElement );

    opener = document.querySelector('.opener');
    opener.addEventListener('change', readImage);

    var gui = new dat.GUI();
    gui.add(config, 'useJSFeat');
    gui.add(config, 'jsFeatThreshold', 5, 50);
    gui.add(config, 'randomAmount', 8, 5000);
    gui.add(config, 'useFill');
    gui.add(config, 'lineWidth', 0, 5);
    gui.add(config, 'overDraw', 0, 3);
    gui.add(config, 'forceRedraw');
    gui.add(config, 'useCamera');
    gui.add(config, 'openFile');
    gui.add(config, 'saveAsPNG');
    gui.add(config, 'saveAsSVG');
    window.onresize = onResize;
    animate();
}

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
          var c=document.getElementById("canvas");
          imgCtx=c.getContext("2d");
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
//imgCtx.drawImage(img, 0, 0, width, height);
          
          
          
//var image = new Image(); // or document.createElement('img'); 
//image.src = 'path/to/your/image.png';

// Next, find (or create/add) our canvas, and get its drawing context.
//var canvas = document.getElementById('canvas');
//var ctx = canvas.getContext('2d');

// Finally, draw our image onto the canvas with a given x & y position.
//var x = 0, y = 0;
//ctx.drawImage(image, x, y);
          
    //var c=document.getElementById("canvas");
    //imgCtx=c.getContext("2d");
    //var img=document.getElementById("scream");
    //imgCtx.drawImage(img, 0, 0, width, height);
          
          
          
          
        } else {
            
          img.onload = function() {
            var c=document.getElementById("canvas");
            imgCtx=c.getContext("2d");
            imgCtx.drawImage(img, 0, 0, width, height);;
            };
          //imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
        }

        if(hasDimensionChanged) {
            onResize();
        }
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
  setTimeout(processData, 100);
} else {
    img.onload = init;
  setTimeout(processData, 100);
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

var c = document.getElementById("canvas"); 
var ctx = c.getContext("2d");
ctx.fillStyle = "red";
ctx.fillRect(30, 50, 50, 50);

function copy() {
    var imgData = ctx.getImageData(10, 10, 50, 50);
    //ctx.putImageData(imgData, 10, 70);
  imgData.onload = function() {
          imgCtx.drawImage(imgData, 0, 0, width, height);
          };
  
}
<button onclick="copy()">Copy</button>

//imgData = ctx.getImageData(30, 50, 50, 50);


c = document.getElementById("canvas"); 
ctx = c.getContext("2d");
ctx.fillStyle = "green";
ctx.fillRect(20, 80, 30, 30);



// ----------------------------------->>>>>>

//setTimeout(processData, 100);

function processData() {
	document.title = 'Getting image data';
	//data = getImageData(img[0]);
  
  //------>>
  canvas = document.getElementById("canvas"); //document.createElement('canvas');
	//canvas.width = W;
	//canvas.height = H;
	canvas.getContext('2d').drawImage(img, 0, 0, W, H);
	var ctx = canvas.getContext('2d');
	data = ctx.getImageData(0, 0, W, H); 
	//data= d.data;
  console.log(data);
  console.log(W, H);
  //------->>

	makeMesh();
}

function transform(h) {
	return h;
}



function makeMesh() {
	scene.remove(mesh);
	geom = new THREE.Geometry(); 
	
	var x, y, height;
	height = 0.1;
	
	var limit = 513;
	
	var Hscale = 1;
	var Wscale = 1;
	var Wmax = W;
	var Hmax = H;
	
	if (W > limit) {Wscale = W / limit; Wmax = limit;}
	if (H > limit) {Hscale = H / limit; Hmax = limit;}
	
	
	var cnt = 0;
	for (y = 0; y < Hmax; y++) {
		document.title = Math.round(y*100/(Hmax-1)) + '% - adding vertices';
		for (x = 0; x < Wmax; x++) {
			idx = (Math.floor(x * Wscale) + Math.floor(y * Hscale) * W ) * 4;
			geom.vertices.push(new THREE.Vector3(
				x / (Wmax - 1) - 0.5, 
				transform(1 + data[idx] + data[idx +1] + data[idx + 2]) * height / 768,
				y / (Hmax - 1) - 0.5
			));
			cnt++;
		}
	}

	for (x = 0; x < Wmax - 1; x++) {
		document.title = Math.round(x*100/(Wmax-2)) + '% - adding faces';
		for (y = 0; y < Hmax - 1; y++) {
			var idx = x + y * Wmax;
			// Triangle one
			geom.faces.push(new THREE.Face3( idx + 1, idx, idx + Wmax + 1 ));
			// Triangle two
			geom.faces.push( new THREE.Face3( idx + Wmax + 1, idx, idx + Wmax ) );
		}
	}
	
	document.title = 'Computing normals';
	geom.computeFaceNormals();

	document.title = 'Creating mesh object';
	//mesh = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
	mesh = new THREE.Mesh( geom, new THREE.MeshLambertMaterial({'color': 0xffffff}));

	mesh.rotation.y = -Math.PI * .2;

	document.title = 'Adding to the scene';
	scene.add(mesh);
	geom.dispose();
}

function getImageData(img) {
	canvas = document.getElementById("canvas"); //document.createElement('canvas');
	//canvas.width = W;
	//canvas.height = H;
	canvas.getContext('2d').drawImage(img, 0, 0, W, H);
	var ctx = canvas.getContext('2d');
	var d = ctx.getImageData(0, 0, W, H); 
	return d.data;
}

//------------------->>
//scene = document.getElementById("canvas");

// SCENE

//scene = new THREE.Scene();

// CAMERA 

// RENDERER

// GEOMETRY & MATERIALS

var cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff55ff});
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);
cube.position.z = 4;

//renderer.render(scene, camera);

function fill_canvas(img) {
            // CREATE CANVAS CONTEXT.
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);       // DRAW THE IMAGE TO THE CANVAS.
        }