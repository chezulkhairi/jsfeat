
var stats;
var canvas;
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

//--->>
        var gui,options,ctx,canvasWidth,canvasHeight;
        var img_u8, corners, threshold;
//--->>

var config = {
    useJSFeat: true,
    useCorner: true,
    jsFeatThreshold: 20,
    randomAmount: 3000,
    useFill: true,
    lineWidth: 1,
    overDraw: 0,
    forceRedraw: false,
    useCamera: false,
    threshold = 20,
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
    speakUtils.addImageDropListener(canvas, onImageDrop);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = 0;
    stats.domElement.style.top = 0;
    document.body.appendChild( stats.domElement );

    opener = document.querySelector('.opener');
    opener.addEventListener('change', readImage);

    var gui = new dat.GUI();
    gui.add(config, 'useJSFeat');
    gui.add(config, 'useCorner');
    gui.add(config, 'jsFeatThreshold', 5, 50);
    gui.add(config, 'randomAmount', 8, 5000);
    gui.add(config, 'useFill');
    gui.add(config, 'lineWidth', 0, 5);
    gui.add(config, 'overDraw', 0, 3);
    gui.add(config, 'forceRedraw');
    gui.add(config, 'useCamera');
    gui.add(config, 'threshold');
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
        } else {
            imgCtx.drawImage(img, 0, 0, width, height);
            imageData = imgCtx.getImageData(0, 0, width, height);
            data = imageData.data;
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
                //--->>
                threshold = 20;
                jsfeat.fast_corners.set_threshold(threshold);
                
                //--->>
                    stat.start("fast corners");
                    var count = jsfeat.fast_corners.detect(img_u8, corners, 5);
                    stat.stop("fast corners");
                    // render result back to canvas
                    var data_u32 = new Uint32Array(imageData.data.buffer);
                    render_corners(corners, count, data_u32, 640);
                    imgCtx.putImageData(imageData, 0, 0);
                
                //--->>
                
            }
            jsfeat.imgproc.grayscale(data, width, height, imgUint8);
        } else {
            imgCtx.drawImage(img, 0, 0, width, height);
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

//--->>
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
//--->>

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
