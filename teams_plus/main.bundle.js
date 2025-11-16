/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/canvas-confetti/dist/confetti.module.mjs":
/*!***************************************************************!*\
  !*** ./node_modules/canvas-confetti/dist/confetti.module.mjs ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   create: () => (/* binding */ create),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// canvas-confetti v1.9.3 built on 2024-04-30T22:19:17.794Z
var module = {};

// source content
/* globals Map */

(function main(global, module, isWorker, workerSize) {
  var canUseWorker = !!(
    global.Worker &&
    global.Blob &&
    global.Promise &&
    global.OffscreenCanvas &&
    global.OffscreenCanvasRenderingContext2D &&
    global.HTMLCanvasElement &&
    global.HTMLCanvasElement.prototype.transferControlToOffscreen &&
    global.URL &&
    global.URL.createObjectURL);

  var canUsePaths = typeof Path2D === 'function' && typeof DOMMatrix === 'function';
  var canDrawBitmap = (function () {
    // this mostly supports ssr
    if (!global.OffscreenCanvas) {
      return false;
    }

    var canvas = new OffscreenCanvas(1, 1);
    var ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, 1, 1);
    var bitmap = canvas.transferToImageBitmap();

    try {
      ctx.createPattern(bitmap, 'no-repeat');
    } catch (e) {
      return false;
    }

    return true;
  })();

  function noop() {}

  // create a promise if it exists, otherwise, just
  // call the function directly
  function promise(func) {
    var ModulePromise = module.exports.Promise;
    var Prom = ModulePromise !== void 0 ? ModulePromise : global.Promise;

    if (typeof Prom === 'function') {
      return new Prom(func);
    }

    func(noop, noop);

    return null;
  }

  var bitmapMapper = (function (skipTransform, map) {
    // see https://github.com/catdad/canvas-confetti/issues/209
    // creating canvases is actually pretty expensive, so we should create a
    // 1:1 map for bitmap:canvas, so that we can animate the confetti in
    // a performant manner, but also not store them forever so that we don't
    // have a memory leak
    return {
      transform: function(bitmap) {
        if (skipTransform) {
          return bitmap;
        }

        if (map.has(bitmap)) {
          return map.get(bitmap);
        }

        var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        map.set(bitmap, canvas);

        return canvas;
      },
      clear: function () {
        map.clear();
      }
    };
  })(canDrawBitmap, new Map());

  var raf = (function () {
    var TIME = Math.floor(1000 / 60);
    var frame, cancel;
    var frames = {};
    var lastFrameTime = 0;

    if (typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function') {
      frame = function (cb) {
        var id = Math.random();

        frames[id] = requestAnimationFrame(function onFrame(time) {
          if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
            lastFrameTime = time;
            delete frames[id];

            cb();
          } else {
            frames[id] = requestAnimationFrame(onFrame);
          }
        });

        return id;
      };
      cancel = function (id) {
        if (frames[id]) {
          cancelAnimationFrame(frames[id]);
        }
      };
    } else {
      frame = function (cb) {
        return setTimeout(cb, TIME);
      };
      cancel = function (timer) {
        return clearTimeout(timer);
      };
    }

    return { frame: frame, cancel: cancel };
  }());

  var getWorker = (function () {
    var worker;
    var prom;
    var resolves = {};

    function decorate(worker) {
      function execute(options, callback) {
        worker.postMessage({ options: options || {}, callback: callback });
      }
      worker.init = function initWorker(canvas) {
        var offscreen = canvas.transferControlToOffscreen();
        worker.postMessage({ canvas: offscreen }, [offscreen]);
      };

      worker.fire = function fireWorker(options, size, done) {
        if (prom) {
          execute(options, null);
          return prom;
        }

        var id = Math.random().toString(36).slice(2);

        prom = promise(function (resolve) {
          function workerDone(msg) {
            if (msg.data.callback !== id) {
              return;
            }

            delete resolves[id];
            worker.removeEventListener('message', workerDone);

            prom = null;

            bitmapMapper.clear();

            done();
            resolve();
          }

          worker.addEventListener('message', workerDone);
          execute(options, id);

          resolves[id] = workerDone.bind(null, { data: { callback: id }});
        });

        return prom;
      };

      worker.reset = function resetWorker() {
        worker.postMessage({ reset: true });

        for (var id in resolves) {
          resolves[id]();
          delete resolves[id];
        }
      };
    }

    return function () {
      if (worker) {
        return worker;
      }

      if (!isWorker && canUseWorker) {
        var code = [
          'var CONFETTI, SIZE = {}, module = {};',
          '(' + main.toString() + ')(this, module, true, SIZE);',
          'onmessage = function(msg) {',
          '  if (msg.data.options) {',
          '    CONFETTI(msg.data.options).then(function () {',
          '      if (msg.data.callback) {',
          '        postMessage({ callback: msg.data.callback });',
          '      }',
          '    });',
          '  } else if (msg.data.reset) {',
          '    CONFETTI && CONFETTI.reset();',
          '  } else if (msg.data.resize) {',
          '    SIZE.width = msg.data.resize.width;',
          '    SIZE.height = msg.data.resize.height;',
          '  } else if (msg.data.canvas) {',
          '    SIZE.width = msg.data.canvas.width;',
          '    SIZE.height = msg.data.canvas.height;',
          '    CONFETTI = module.exports.create(msg.data.canvas);',
          '  }',
          '}',
        ].join('\n');
        try {
          worker = new Worker(URL.createObjectURL(new Blob([code])));
        } catch (e) {
          // eslint-disable-next-line no-console
          typeof console !== undefined && typeof console.warn === 'function' ? console.warn('🎊 Could not load worker', e) : null;

          return null;
        }

        decorate(worker);
      }

      return worker;
    };
  })();

  var defaults = {
    particleCount: 50,
    angle: 90,
    spread: 45,
    startVelocity: 45,
    decay: 0.9,
    gravity: 1,
    drift: 0,
    ticks: 200,
    x: 0.5,
    y: 0.5,
    shapes: ['square', 'circle'],
    zIndex: 100,
    colors: [
      '#26ccff',
      '#a25afd',
      '#ff5e7e',
      '#88ff5a',
      '#fcff42',
      '#ffa62d',
      '#ff36ff'
    ],
    // probably should be true, but back-compat
    disableForReducedMotion: false,
    scalar: 1
  };

  function convert(val, transform) {
    return transform ? transform(val) : val;
  }

  function isOk(val) {
    return !(val === null || val === undefined);
  }

  function prop(options, name, transform) {
    return convert(
      options && isOk(options[name]) ? options[name] : defaults[name],
      transform
    );
  }

  function onlyPositiveInt(number){
    return number < 0 ? 0 : Math.floor(number);
  }

  function randomInt(min, max) {
    // [min, max)
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function toDecimal(str) {
    return parseInt(str, 16);
  }

  function colorsToRgb(colors) {
    return colors.map(hexToRgb);
  }

  function hexToRgb(str) {
    var val = String(str).replace(/[^0-9a-f]/gi, '');

    if (val.length < 6) {
        val = val[0]+val[0]+val[1]+val[1]+val[2]+val[2];
    }

    return {
      r: toDecimal(val.substring(0,2)),
      g: toDecimal(val.substring(2,4)),
      b: toDecimal(val.substring(4,6))
    };
  }

  function getOrigin(options) {
    var origin = prop(options, 'origin', Object);
    origin.x = prop(origin, 'x', Number);
    origin.y = prop(origin, 'y', Number);

    return origin;
  }

  function setCanvasWindowSize(canvas) {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }

  function setCanvasRectSize(canvas) {
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  function getCanvas(zIndex) {
    var canvas = document.createElement('canvas');

    canvas.style.position = 'fixed';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = zIndex;

    return canvas;
  }

  function ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(radiusX, radiusY);
    context.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
    context.restore();
  }

  function randomPhysics(opts) {
    var radAngle = opts.angle * (Math.PI / 180);
    var radSpread = opts.spread * (Math.PI / 180);

    return {
      x: opts.x,
      y: opts.y,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
      velocity: (opts.startVelocity * 0.5) + (Math.random() * opts.startVelocity),
      angle2D: -radAngle + ((0.5 * radSpread) - (Math.random() * radSpread)),
      tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
      color: opts.color,
      shape: opts.shape,
      tick: 0,
      totalTicks: opts.ticks,
      decay: opts.decay,
      drift: opts.drift,
      random: Math.random() + 2,
      tiltSin: 0,
      tiltCos: 0,
      wobbleX: 0,
      wobbleY: 0,
      gravity: opts.gravity * 3,
      ovalScalar: 0.6,
      scalar: opts.scalar,
      flat: opts.flat
    };
  }

  function updateFetti(context, fetti) {
    fetti.x += Math.cos(fetti.angle2D) * fetti.velocity + fetti.drift;
    fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
    fetti.velocity *= fetti.decay;

    if (fetti.flat) {
      fetti.wobble = 0;
      fetti.wobbleX = fetti.x + (10 * fetti.scalar);
      fetti.wobbleY = fetti.y + (10 * fetti.scalar);

      fetti.tiltSin = 0;
      fetti.tiltCos = 0;
      fetti.random = 1;
    } else {
      fetti.wobble += fetti.wobbleSpeed;
      fetti.wobbleX = fetti.x + ((10 * fetti.scalar) * Math.cos(fetti.wobble));
      fetti.wobbleY = fetti.y + ((10 * fetti.scalar) * Math.sin(fetti.wobble));

      fetti.tiltAngle += 0.1;
      fetti.tiltSin = Math.sin(fetti.tiltAngle);
      fetti.tiltCos = Math.cos(fetti.tiltAngle);
      fetti.random = Math.random() + 2;
    }

    var progress = (fetti.tick++) / fetti.totalTicks;

    var x1 = fetti.x + (fetti.random * fetti.tiltCos);
    var y1 = fetti.y + (fetti.random * fetti.tiltSin);
    var x2 = fetti.wobbleX + (fetti.random * fetti.tiltCos);
    var y2 = fetti.wobbleY + (fetti.random * fetti.tiltSin);

    context.fillStyle = 'rgba(' + fetti.color.r + ', ' + fetti.color.g + ', ' + fetti.color.b + ', ' + (1 - progress) + ')';

    context.beginPath();

    if (canUsePaths && fetti.shape.type === 'path' && typeof fetti.shape.path === 'string' && Array.isArray(fetti.shape.matrix)) {
      context.fill(transformPath2D(
        fetti.shape.path,
        fetti.shape.matrix,
        fetti.x,
        fetti.y,
        Math.abs(x2 - x1) * 0.1,
        Math.abs(y2 - y1) * 0.1,
        Math.PI / 10 * fetti.wobble
      ));
    } else if (fetti.shape.type === 'bitmap') {
      var rotation = Math.PI / 10 * fetti.wobble;
      var scaleX = Math.abs(x2 - x1) * 0.1;
      var scaleY = Math.abs(y2 - y1) * 0.1;
      var width = fetti.shape.bitmap.width * fetti.scalar;
      var height = fetti.shape.bitmap.height * fetti.scalar;

      var matrix = new DOMMatrix([
        Math.cos(rotation) * scaleX,
        Math.sin(rotation) * scaleX,
        -Math.sin(rotation) * scaleY,
        Math.cos(rotation) * scaleY,
        fetti.x,
        fetti.y
      ]);

      // apply the transform matrix from the confetti shape
      matrix.multiplySelf(new DOMMatrix(fetti.shape.matrix));

      var pattern = context.createPattern(bitmapMapper.transform(fetti.shape.bitmap), 'no-repeat');
      pattern.setTransform(matrix);

      context.globalAlpha = (1 - progress);
      context.fillStyle = pattern;
      context.fillRect(
        fetti.x - (width / 2),
        fetti.y - (height / 2),
        width,
        height
      );
      context.globalAlpha = 1;
    } else if (fetti.shape === 'circle') {
      context.ellipse ?
        context.ellipse(fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI) :
        ellipse(context, fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI);
    } else if (fetti.shape === 'star') {
      var rot = Math.PI / 2 * 3;
      var innerRadius = 4 * fetti.scalar;
      var outerRadius = 8 * fetti.scalar;
      var x = fetti.x;
      var y = fetti.y;
      var spikes = 5;
      var step = Math.PI / spikes;

      while (spikes--) {
        x = fetti.x + Math.cos(rot) * outerRadius;
        y = fetti.y + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = fetti.x + Math.cos(rot) * innerRadius;
        y = fetti.y + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
    } else {
      context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
      context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
      context.lineTo(Math.floor(x2), Math.floor(y2));
      context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
    }

    context.closePath();
    context.fill();

    return fetti.tick < fetti.totalTicks;
  }

  function animate(canvas, fettis, resizer, size, done) {
    var animatingFettis = fettis.slice();
    var context = canvas.getContext('2d');
    var animationFrame;
    var destroy;

    var prom = promise(function (resolve) {
      function onDone() {
        animationFrame = destroy = null;

        context.clearRect(0, 0, size.width, size.height);
        bitmapMapper.clear();

        done();
        resolve();
      }

      function update() {
        if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
          size.width = canvas.width = workerSize.width;
          size.height = canvas.height = workerSize.height;
        }

        if (!size.width && !size.height) {
          resizer(canvas);
          size.width = canvas.width;
          size.height = canvas.height;
        }

        context.clearRect(0, 0, size.width, size.height);

        animatingFettis = animatingFettis.filter(function (fetti) {
          return updateFetti(context, fetti);
        });

        if (animatingFettis.length) {
          animationFrame = raf.frame(update);
        } else {
          onDone();
        }
      }

      animationFrame = raf.frame(update);
      destroy = onDone;
    });

    return {
      addFettis: function (fettis) {
        animatingFettis = animatingFettis.concat(fettis);

        return prom;
      },
      canvas: canvas,
      promise: prom,
      reset: function () {
        if (animationFrame) {
          raf.cancel(animationFrame);
        }

        if (destroy) {
          destroy();
        }
      }
    };
  }

  function confettiCannon(canvas, globalOpts) {
    var isLibCanvas = !canvas;
    var allowResize = !!prop(globalOpts || {}, 'resize');
    var hasResizeEventRegistered = false;
    var globalDisableForReducedMotion = prop(globalOpts, 'disableForReducedMotion', Boolean);
    var shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, 'useWorker');
    var worker = shouldUseWorker ? getWorker() : null;
    var resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize;
    var initialized = (canvas && worker) ? !!canvas.__confetti_initialized : false;
    var preferLessMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion)').matches;
    var animationObj;

    function fireLocal(options, size, done) {
      var particleCount = prop(options, 'particleCount', onlyPositiveInt);
      var angle = prop(options, 'angle', Number);
      var spread = prop(options, 'spread', Number);
      var startVelocity = prop(options, 'startVelocity', Number);
      var decay = prop(options, 'decay', Number);
      var gravity = prop(options, 'gravity', Number);
      var drift = prop(options, 'drift', Number);
      var colors = prop(options, 'colors', colorsToRgb);
      var ticks = prop(options, 'ticks', Number);
      var shapes = prop(options, 'shapes');
      var scalar = prop(options, 'scalar');
      var flat = !!prop(options, 'flat');
      var origin = getOrigin(options);

      var temp = particleCount;
      var fettis = [];

      var startX = canvas.width * origin.x;
      var startY = canvas.height * origin.y;

      while (temp--) {
        fettis.push(
          randomPhysics({
            x: startX,
            y: startY,
            angle: angle,
            spread: spread,
            startVelocity: startVelocity,
            color: colors[temp % colors.length],
            shape: shapes[randomInt(0, shapes.length)],
            ticks: ticks,
            decay: decay,
            gravity: gravity,
            drift: drift,
            scalar: scalar,
            flat: flat
          })
        );
      }

      // if we have a previous canvas already animating,
      // add to it
      if (animationObj) {
        return animationObj.addFettis(fettis);
      }

      animationObj = animate(canvas, fettis, resizer, size , done);

      return animationObj.promise;
    }

    function fire(options) {
      var disableForReducedMotion = globalDisableForReducedMotion || prop(options, 'disableForReducedMotion', Boolean);
      var zIndex = prop(options, 'zIndex', Number);

      if (disableForReducedMotion && preferLessMotion) {
        return promise(function (resolve) {
          resolve();
        });
      }

      if (isLibCanvas && animationObj) {
        // use existing canvas from in-progress animation
        canvas = animationObj.canvas;
      } else if (isLibCanvas && !canvas) {
        // create and initialize a new canvas
        canvas = getCanvas(zIndex);
        document.body.appendChild(canvas);
      }

      if (allowResize && !initialized) {
        // initialize the size of a user-supplied canvas
        resizer(canvas);
      }

      var size = {
        width: canvas.width,
        height: canvas.height
      };

      if (worker && !initialized) {
        worker.init(canvas);
      }

      initialized = true;

      if (worker) {
        canvas.__confetti_initialized = true;
      }

      function onResize() {
        if (worker) {
          // TODO this really shouldn't be immediate, because it is expensive
          var obj = {
            getBoundingClientRect: function () {
              if (!isLibCanvas) {
                return canvas.getBoundingClientRect();
              }
            }
          };

          resizer(obj);

          worker.postMessage({
            resize: {
              width: obj.width,
              height: obj.height
            }
          });
          return;
        }

        // don't actually query the size here, since this
        // can execute frequently and rapidly
        size.width = size.height = null;
      }

      function done() {
        animationObj = null;

        if (allowResize) {
          hasResizeEventRegistered = false;
          global.removeEventListener('resize', onResize);
        }

        if (isLibCanvas && canvas) {
          if (document.body.contains(canvas)) {
            document.body.removeChild(canvas); 
          }
          canvas = null;
          initialized = false;
        }
      }

      if (allowResize && !hasResizeEventRegistered) {
        hasResizeEventRegistered = true;
        global.addEventListener('resize', onResize, false);
      }

      if (worker) {
        return worker.fire(options, size, done);
      }

      return fireLocal(options, size, done);
    }

    fire.reset = function () {
      if (worker) {
        worker.reset();
      }

      if (animationObj) {
        animationObj.reset();
      }
    };

    return fire;
  }

  // Make default export lazy to defer worker creation until called.
  var defaultFire;
  function getDefaultFire() {
    if (!defaultFire) {
      defaultFire = confettiCannon(null, { useWorker: true, resize: true });
    }
    return defaultFire;
  }

  function transformPath2D(pathString, pathMatrix, x, y, scaleX, scaleY, rotation) {
    var path2d = new Path2D(pathString);

    var t1 = new Path2D();
    t1.addPath(path2d, new DOMMatrix(pathMatrix));

    var t2 = new Path2D();
    // see https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix/DOMMatrix
    t2.addPath(t1, new DOMMatrix([
      Math.cos(rotation) * scaleX,
      Math.sin(rotation) * scaleX,
      -Math.sin(rotation) * scaleY,
      Math.cos(rotation) * scaleY,
      x,
      y
    ]));

    return t2;
  }

  function shapeFromPath(pathData) {
    if (!canUsePaths) {
      throw new Error('path confetti are not supported in this browser');
    }

    var path, matrix;

    if (typeof pathData === 'string') {
      path = pathData;
    } else {
      path = pathData.path;
      matrix = pathData.matrix;
    }

    var path2d = new Path2D(path);
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');

    if (!matrix) {
      // attempt to figure out the width of the path, up to 1000x1000
      var maxSize = 1000;
      var minX = maxSize;
      var minY = maxSize;
      var maxX = 0;
      var maxY = 0;
      var width, height;

      // do some line skipping... this is faster than checking
      // every pixel and will be mostly still correct
      for (var x = 0; x < maxSize; x += 2) {
        for (var y = 0; y < maxSize; y += 2) {
          if (tempCtx.isPointInPath(path2d, x, y, 'nonzero')) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      width = maxX - minX;
      height = maxY - minY;

      var maxDesiredSize = 10;
      var scale = Math.min(maxDesiredSize/width, maxDesiredSize/height);

      matrix = [
        scale, 0, 0, scale,
        -Math.round((width/2) + minX) * scale,
        -Math.round((height/2) + minY) * scale
      ];
    }

    return {
      type: 'path',
      path: path,
      matrix: matrix
    };
  }

  function shapeFromText(textData) {
    var text,
        scalar = 1,
        color = '#000000',
        // see https://nolanlawson.com/2022/04/08/the-struggle-of-using-native-emoji-on-the-web/
        fontFamily = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';

    if (typeof textData === 'string') {
      text = textData;
    } else {
      text = textData.text;
      scalar = 'scalar' in textData ? textData.scalar : scalar;
      fontFamily = 'fontFamily' in textData ? textData.fontFamily : fontFamily;
      color = 'color' in textData ? textData.color : color;
    }

    // all other confetti are 10 pixels,
    // so this pixel size is the de-facto 100% scale confetti
    var fontSize = 10 * scalar;
    var font = '' + fontSize + 'px ' + fontFamily;

    var canvas = new OffscreenCanvas(fontSize, fontSize);
    var ctx = canvas.getContext('2d');

    ctx.font = font;
    var size = ctx.measureText(text);
    var width = Math.ceil(size.actualBoundingBoxRight + size.actualBoundingBoxLeft);
    var height = Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent);

    var padding = 2;
    var x = size.actualBoundingBoxLeft + padding;
    var y = size.actualBoundingBoxAscent + padding;
    width += padding + padding;
    height += padding + padding;

    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext('2d');
    ctx.font = font;
    ctx.fillStyle = color;

    ctx.fillText(text, x, y);

    var scale = 1 / scalar;

    return {
      type: 'bitmap',
      // TODO these probably need to be transfered for workers
      bitmap: canvas.transferToImageBitmap(),
      matrix: [scale, 0, 0, scale, -width * scale / 2, -height * scale / 2]
    };
  }

  module.exports = function() {
    return getDefaultFire().apply(this, arguments);
  };
  module.exports.reset = function() {
    getDefaultFire().reset();
  };
  module.exports.create = confettiCannon;
  module.exports.shapeFromPath = shapeFromPath;
  module.exports.shapeFromText = shapeFromText;
}((function () {
  if (typeof window !== 'undefined') {
    return window;
  }

  if (typeof self !== 'undefined') {
    return self;
  }

  return this || {};
})(), module, false));

// end source content

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (module.exports);
var create = module.exports.create;


/***/ }),

/***/ "./node_modules/twemoji/dist/twemoji.esm.js":
/*!**************************************************!*\
  !*** ./node_modules/twemoji/dist/twemoji.esm.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*! Copyright Twitter Inc. and other contributors. Licensed under MIT */
var twemoji=function(){"use strict";var twemoji={base:"https://twemoji.maxcdn.com/v/14.0.2/",ext:".png",size:"72x72",className:"emoji",convert:{fromCodePoint:fromCodePoint,toCodePoint:toCodePoint},onerror:function onerror(){if(this.parentNode){this.parentNode.replaceChild(createText(this.alt,false),this)}},parse:parse,replace:replace,test:test},escaper={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"},re=/(?:\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffc-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb\udffd-\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb-\udffd\udfff]|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffc-\udfff]|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb\udffd-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb-\udffd\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d[\udc68\udc69]|\ud83e\udef1\ud83c\udffb\u200d\ud83e\udef2\ud83c[\udffc-\udfff]|\ud83e\udef1\ud83c\udffc\u200d\ud83e\udef2\ud83c[\udffb\udffd-\udfff]|\ud83e\udef1\ud83c\udffd\u200d\ud83e\udef2\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\udef1\ud83c\udffe\u200d\ud83e\udef2\ud83c[\udffb-\udffd\udfff]|\ud83e\udef1\ud83c\udfff\u200d\ud83e\udef2\ud83c[\udffb-\udffe]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d[\udc68\udc69]|\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1|\ud83d\udc6b\ud83c[\udffb-\udfff]|\ud83d\udc6c\ud83c[\udffb-\udfff]|\ud83d\udc6d\ud83c[\udffb-\udfff]|\ud83d\udc8f\ud83c[\udffb-\udfff]|\ud83d\udc91\ud83c[\udffb-\udfff]|\ud83e\udd1d\ud83c[\udffb-\udfff]|\ud83d[\udc6b-\udc6d\udc8f\udc91]|\ud83e\udd1d)|(?:\ud83d[\udc68\udc69]|\ud83e\uddd1)(?:\ud83c[\udffb-\udfff])?\u200d(?:\u2695\ufe0f|\u2696\ufe0f|\u2708\ufe0f|\ud83c[\udf3e\udf73\udf7c\udf84\udf93\udfa4\udfa8\udfeb\udfed]|\ud83d[\udcbb\udcbc\udd27\udd2c\ude80\ude92]|\ud83e[\uddaf-\uddb3\uddbc\uddbd])|(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75]|\u26f9)((?:\ud83c[\udffb-\udfff]|\ufe0f)\u200d[\u2640\u2642]\ufe0f)|(?:\ud83c[\udfc3\udfc4\udfca]|\ud83d[\udc6e\udc70\udc71\udc73\udc77\udc81\udc82\udc86\udc87\ude45-\ude47\ude4b\ude4d\ude4e\udea3\udeb4-\udeb6]|\ud83e[\udd26\udd35\udd37-\udd39\udd3d\udd3e\uddb8\uddb9\uddcd-\uddcf\uddd4\uddd6-\udddd])(?:\ud83c[\udffb-\udfff])?\u200d[\u2640\u2642]\ufe0f|(?:\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83d\ude36\u200d\ud83c\udf2b\ufe0f|\u2764\ufe0f\u200d\ud83d\udd25|\u2764\ufe0f\u200d\ud83e\ude79|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc15\u200d\ud83e\uddba|\ud83d\udc3b\u200d\u2744\ufe0f|\ud83d\udc41\u200d\ud83d\udde8|\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83d\ude2e\u200d\ud83d\udca8|\ud83d\ude35\u200d\ud83d\udcab|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|\ud83e\uddde\u200d\u2640\ufe0f|\ud83e\uddde\u200d\u2642\ufe0f|\ud83e\udddf\u200d\u2640\ufe0f|\ud83e\udddf\u200d\u2642\ufe0f|\ud83d\udc08\u200d\u2b1b)|[#*0-9]\ufe0f?\u20e3|(?:[©®\u2122\u265f]\ufe0f)|(?:\ud83c[\udc04\udd70\udd71\udd7e\udd7f\ude02\ude1a\ude2f\ude37\udf21\udf24-\udf2c\udf36\udf7d\udf96\udf97\udf99-\udf9b\udf9e\udf9f\udfcd\udfce\udfd4-\udfdf\udff3\udff5\udff7]|\ud83d[\udc3f\udc41\udcfd\udd49\udd4a\udd6f\udd70\udd73\udd76-\udd79\udd87\udd8a-\udd8d\udda5\udda8\uddb1\uddb2\uddbc\uddc2-\uddc4\uddd1-\uddd3\udddc-\uddde\udde1\udde3\udde8\uddef\uddf3\uddfa\udecb\udecd-\udecf\udee0-\udee5\udee9\udef0\udef3]|[\u203c\u2049\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23ed-\u23ef\u23f1\u23f2\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26a7\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f8\u26fa\u26fd\u2702\u2708\u2709\u270f\u2712\u2714\u2716\u271d\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u2764\u27a1\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299])(?:\ufe0f|(?!\ufe0e))|(?:(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75\udd90]|[\u261d\u26f7\u26f9\u270c\u270d])(?:\ufe0f|(?!\ufe0e))|(?:\ud83c[\udf85\udfc2-\udfc4\udfc7\udfca]|\ud83d[\udc42\udc43\udc46-\udc50\udc66-\udc69\udc6e\udc70-\udc78\udc7c\udc81-\udc83\udc85-\udc87\udcaa\udd7a\udd95\udd96\ude45-\ude47\ude4b-\ude4f\udea3\udeb4-\udeb6\udec0\udecc]|\ud83e[\udd0c\udd0f\udd18-\udd1c\udd1e\udd1f\udd26\udd30-\udd39\udd3d\udd3e\udd77\uddb5\uddb6\uddb8\uddb9\uddbb\uddcd-\uddcf\uddd1-\udddd\udec3-\udec5\udef0-\udef6]|[\u270a\u270b]))(?:\ud83c[\udffb-\udfff])?|(?:\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f|\ud83c\udde6\ud83c[\udde8-\uddec\uddee\uddf1\uddf2\uddf4\uddf6-\uddfa\uddfc\uddfd\uddff]|\ud83c\udde7\ud83c[\udde6\udde7\udde9-\uddef\uddf1-\uddf4\uddf6-\uddf9\uddfb\uddfc\uddfe\uddff]|\ud83c\udde8\ud83c[\udde6\udde8\udde9\uddeb-\uddee\uddf0-\uddf5\uddf7\uddfa-\uddff]|\ud83c\udde9\ud83c[\uddea\uddec\uddef\uddf0\uddf2\uddf4\uddff]|\ud83c\uddea\ud83c[\udde6\udde8\uddea\uddec\udded\uddf7-\uddfa]|\ud83c\uddeb\ud83c[\uddee-\uddf0\uddf2\uddf4\uddf7]|\ud83c\uddec\ud83c[\udde6\udde7\udde9-\uddee\uddf1-\uddf3\uddf5-\uddfa\uddfc\uddfe]|\ud83c\udded\ud83c[\uddf0\uddf2\uddf3\uddf7\uddf9\uddfa]|\ud83c\uddee\ud83c[\udde8-\uddea\uddf1-\uddf4\uddf6-\uddf9]|\ud83c\uddef\ud83c[\uddea\uddf2\uddf4\uddf5]|\ud83c\uddf0\ud83c[\uddea\uddec-\uddee\uddf2\uddf3\uddf5\uddf7\uddfc\uddfe\uddff]|\ud83c\uddf1\ud83c[\udde6-\udde8\uddee\uddf0\uddf7-\uddfb\uddfe]|\ud83c\uddf2\ud83c[\udde6\udde8-\udded\uddf0-\uddff]|\ud83c\uddf3\ud83c[\udde6\udde8\uddea-\uddec\uddee\uddf1\uddf4\uddf5\uddf7\uddfa\uddff]|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c[\udde6\uddea-\udded\uddf0-\uddf3\uddf7-\uddf9\uddfc\uddfe]|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c[\uddea\uddf4\uddf8\uddfa\uddfc]|\ud83c\uddf8\ud83c[\udde6-\uddea\uddec-\uddf4\uddf7-\uddf9\uddfb\uddfd-\uddff]|\ud83c\uddf9\ud83c[\udde6\udde8\udde9\uddeb-\udded\uddef-\uddf4\uddf7\uddf9\uddfb\uddfc\uddff]|\ud83c\uddfa\ud83c[\udde6\uddec\uddf2\uddf3\uddf8\uddfe\uddff]|\ud83c\uddfb\ud83c[\udde6\udde8\uddea\uddec\uddee\uddf3\uddfa]|\ud83c\uddfc\ud83c[\uddeb\uddf8]|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c[\uddea\uddf9]|\ud83c\uddff\ud83c[\udde6\uddf2\uddfc]|\ud83c[\udccf\udd8e\udd91-\udd9a\udde6-\uddff\ude01\ude32-\ude36\ude38-\ude3a\ude50\ude51\udf00-\udf20\udf2d-\udf35\udf37-\udf7c\udf7e-\udf84\udf86-\udf93\udfa0-\udfc1\udfc5\udfc6\udfc8\udfc9\udfcf-\udfd3\udfe0-\udff0\udff4\udff8-\udfff]|\ud83d[\udc00-\udc3e\udc40\udc44\udc45\udc51-\udc65\udc6a\udc6f\udc79-\udc7b\udc7d-\udc80\udc84\udc88-\udc8e\udc90\udc92-\udca9\udcab-\udcfc\udcff-\udd3d\udd4b-\udd4e\udd50-\udd67\udda4\uddfb-\ude44\ude48-\ude4a\ude80-\udea2\udea4-\udeb3\udeb7-\udebf\udec1-\udec5\uded0-\uded2\uded5-\uded7\udedd-\udedf\udeeb\udeec\udef4-\udefc\udfe0-\udfeb\udff0]|\ud83e[\udd0d\udd0e\udd10-\udd17\udd20-\udd25\udd27-\udd2f\udd3a\udd3c\udd3f-\udd45\udd47-\udd76\udd78-\uddb4\uddb7\uddba\uddbc-\uddcc\uddd0\uddde-\uddff\ude70-\ude74\ude78-\ude7c\ude80-\ude86\ude90-\udeac\udeb0-\udeba\udec0-\udec2\uded0-\uded9\udee0-\udee7]|[\u23e9-\u23ec\u23f0\u23f3\u267e\u26ce\u2705\u2728\u274c\u274e\u2753-\u2755\u2795-\u2797\u27b0\u27bf\ue50a])|\ufe0f/g,UFE0Fg=/\uFE0F/g,U200D=String.fromCharCode(8205),rescaper=/[&<>'"]/g,shouldntBeParsed=/^(?:iframe|noframes|noscript|script|select|style|textarea)$/,fromCharCode=String.fromCharCode;return twemoji;function createText(text,clean){return document.createTextNode(clean?text.replace(UFE0Fg,""):text)}function escapeHTML(s){return s.replace(rescaper,replacer)}function defaultImageSrcGenerator(icon,options){return"".concat(options.base,options.size,"/",icon,options.ext)}function grabAllTextNodes(node,allText){var childNodes=node.childNodes,length=childNodes.length,subnode,nodeType;while(length--){subnode=childNodes[length];nodeType=subnode.nodeType;if(nodeType===3){allText.push(subnode)}else if(nodeType===1&&!("ownerSVGElement"in subnode)&&!shouldntBeParsed.test(subnode.nodeName.toLowerCase())){grabAllTextNodes(subnode,allText)}}return allText}function grabTheRightIcon(rawText){return toCodePoint(rawText.indexOf(U200D)<0?rawText.replace(UFE0Fg,""):rawText)}function parseNode(node,options){var allText=grabAllTextNodes(node,[]),length=allText.length,attrib,attrname,modified,fragment,subnode,text,match,i,index,img,rawText,iconId,src;while(length--){modified=false;fragment=document.createDocumentFragment();subnode=allText[length];text=subnode.nodeValue;i=0;while(match=re.exec(text)){index=match.index;if(index!==i){fragment.appendChild(createText(text.slice(i,index),true))}rawText=match[0];iconId=grabTheRightIcon(rawText);i=index+rawText.length;src=options.callback(iconId,options);if(iconId&&src){img=new Image;img.onerror=options.onerror;img.setAttribute("draggable","false");attrib=options.attributes(rawText,iconId);for(attrname in attrib){if(attrib.hasOwnProperty(attrname)&&attrname.indexOf("on")!==0&&!img.hasAttribute(attrname)){img.setAttribute(attrname,attrib[attrname])}}img.className=options.className;img.alt=rawText;img.src=src;modified=true;fragment.appendChild(img)}if(!img)fragment.appendChild(createText(rawText,false));img=null}if(modified){if(i<text.length){fragment.appendChild(createText(text.slice(i),true))}subnode.parentNode.replaceChild(fragment,subnode)}}return node}function parseString(str,options){return replace(str,function(rawText){var ret=rawText,iconId=grabTheRightIcon(rawText),src=options.callback(iconId,options),attrib,attrname;if(iconId&&src){ret="<img ".concat('class="',options.className,'" ','draggable="false" ','alt="',rawText,'"',' src="',src,'"');attrib=options.attributes(rawText,iconId);for(attrname in attrib){if(attrib.hasOwnProperty(attrname)&&attrname.indexOf("on")!==0&&ret.indexOf(" "+attrname+"=")===-1){ret=ret.concat(" ",attrname,'="',escapeHTML(attrib[attrname]),'"')}}ret=ret.concat("/>")}return ret})}function replacer(m){return escaper[m]}function returnNull(){return null}function toSizeSquaredAsset(value){return typeof value==="number"?value+"x"+value:value}function fromCodePoint(codepoint){var code=typeof codepoint==="string"?parseInt(codepoint,16):codepoint;if(code<65536){return fromCharCode(code)}code-=65536;return fromCharCode(55296+(code>>10),56320+(code&1023))}function parse(what,how){if(!how||typeof how==="function"){how={callback:how}}return(typeof what==="string"?parseString:parseNode)(what,{callback:how.callback||defaultImageSrcGenerator,attributes:typeof how.attributes==="function"?how.attributes:returnNull,base:typeof how.base==="string"?how.base:twemoji.base,ext:how.ext||twemoji.ext,size:how.folder||toSizeSquaredAsset(how.size||twemoji.size),className:how.className||twemoji.className,onerror:how.onerror||twemoji.onerror})}function replace(text,callback){return String(text).replace(re,callback)}function test(text){re.lastIndex=0;var result=re.test(text);re.lastIndex=0;return result}function toCodePoint(unicodeSurrogates,sep){var r=[],c=0,p=0,i=0;while(i<unicodeSurrogates.length){c=unicodeSurrogates.charCodeAt(i++);if(p){r.push((65536+(p-55296<<10)+(c-56320)).toString(16));p=0}else if(55296<=c&&c<=56319){p=c}else{r.push(c.toString(16))}}return r.join(sep||"-")}}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (twemoji);

/***/ }),

/***/ "./src/api/authorizationProvider.ts":
/*!******************************************!*\
  !*** ./src/api/authorizationProvider.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./src/config.ts");
/* harmony import */ var _safeTunnel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./safeTunnel */ "./src/api/safeTunnel.ts");



const LOGIN_CONTAINER = `
<div class="main-login-container">
    <div class="rel">
        <div class="loader-container" id="loader" style="display: none;">
            <div class="rel">
                <span class="loader login-loader"></span>
            </div>

        </div>
        <form action="">
            <h3 class="login-title">Login</h3>
            <p class="login-title">An action requires you to login to your account.</p>
            <div class="login-align-center">
                <input type="text" name="username" id="loginUsername" autocomplete="username" placeholder="Username" required>
                <input type="password" name="password" id="loginPassword" placeholder="Password" required>
                <button type="submit" class="login-btn-submit normal-button" id="submitBtn">Submit</button>
                <a href="https://apiteamsplus.pythonanywhere.com/" target="_blank">Visit website to register</a>
            </div>
        </form>
    </div>

</div>
`;
class AuthProvider {
    currentToken = null;
    success = null;
    loginContainer = null;
    awaitAuth = false;
    constructor() {
        this.p_createLoginContainer();
        this.p_initButtons();
        this.p_asyncInit();
    }
    async p_asyncInit() {
        this.currentToken = await this.p_loadToken();
    }
    async p_loadToken() {
        return (await chrome.storage.local.get(["teamsplusToken"])).teamsPlusToken;
    }
    p_saveToken() {
        chrome.storage.local.set({ "teamsplusToken": this.currentToken });
    }
    p_createLoginContainer() {
        if (this.loginContainer == null) {
            this.loginContainer = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(LOGIN_CONTAINER);
            this.loginContainer.style.display = "none";
            document.body.appendChild(this.loginContainer);
        }
        else {
            console.error("Login container already exists!");
        }
    }
    p_showLoginContainer() {
        if (this.loginContainer) {
            this.loginContainer.style.opacity = "0";
            this.loginContainer.style.display = "block";
            // Show animation
            this.loginContainer.animate([
                { transform: 'translateY(-65%) translateX(-50%)', opacity: "0", filter: "blur(10px)" },
                { transform: 'translateY(-50%) translateX(-50%)', opacity: "1", filter: "blur(0px)" }
            ], {
                duration: 1000,
                easing: "ease-out",
                iterations: 1,
                fill: "forwards"
            });
        }
        else {
            console.error("Login container not found!");
        }
    }
    p_hideLoginContainer() {
        if (this.loginContainer) {
            // Animate
            this.loginContainer.animate([
                { opacity: "1", filter: "blur(0px)", transform: 'translateY(-50%) translateX(-50%)' },
                { opacity: "0", filter: "blur(10px)", transform: 'translateY(-65%) translateX(-50%)' }
            ], {
                duration: 1000,
                easing: "ease-in",
                iterations: 1,
                fill: "forwards"
            });
            setTimeout(() => {
                if (this.loginContainer == null)
                    return;
                this.loginContainer.style.display = "none";
            }, 1000);
        }
        else {
            console.error("Login container not found!");
        }
    }
    p_showLoader() {
        if (this.loginContainer == null)
            return;
        const loader = this.loginContainer.querySelector("#loader");
        if (loader) {
            loader.style.display = "block";
        }
    }
    p_hideLoader() {
        if (this.loginContainer == null)
            return;
        const loader = this.loginContainer.querySelector("#loader");
        if (loader) {
            loader.style.display = "none";
        }
    }
    p_initButtons() {
        if (this.loginContainer == null)
            return;
        const submitBtn = this.loginContainer.querySelector("#submitBtn");
        if (submitBtn) {
            submitBtn.addEventListener("click", async (event) => {
                console.log("The button has been clicked!");
                event.preventDefault();
                if (this.loginContainer == null) {
                    console.error("no login container");
                    return;
                }
                ;
                if (this.awaitAuth == false) {
                    console.error("not awaiting auth");
                    return;
                }
                ;
                this.success = null;
                this.currentToken = null;
                const usernameElement = this.loginContainer.querySelector("#loginUsername");
                const passwordElement = this.loginContainer.querySelector("#loginPassword");
                if (usernameElement == null || passwordElement == null) {
                    console.error("Username / password element not found");
                    return;
                }
                ;
                // Post
                this.p_showLoader();
                const safeTunnel = new _safeTunnel__WEBPACK_IMPORTED_MODULE_2__.SafeTunnel();
                const body = JSON.stringify({
                    username: usernameElement.value,
                    password: passwordElement.value,
                    transfer: true // Tells API to transfer back token in .data field
                });
                const encrypted = await safeTunnel.safeTunnelEncrypt(body);
                fetch(`${_config__WEBPACK_IMPORTED_MODULE_1__.API_ENDPOINT}/api/v1/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(encrypted)
                })
                    .then(response => response.json())
                    .then((data) => {
                    if (data.message && data.success == true && data.data) {
                        this.currentToken = data.data;
                        this.p_saveToken();
                        //this.currentToken =" yay";
                        this.p_hideLoader();
                        //alert("OK");
                    }
                    else {
                        this.p_hideLoader();
                        throw new Error("not OK");
                    }
                })
                    .catch((error) => {
                    this.p_hideLoader();
                    console.error('Error:', error);
                    if (error instanceof Error) {
                        alert(`Error: ${error.message}`);
                    }
                    else {
                        alert("Error");
                    }
                });
            });
        }
        else {
            console.error("Oneor many elements null");
        }
    }
    waitUntilToken(checkInterval = 100) {
        this.awaitAuth = true;
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (this.currentToken != null || this.success || null) {
                    clearInterval(interval);
                    this.success = null;
                    this.awaitAuth = false;
                    resolve(this.currentToken);
                }
            }, checkInterval);
        });
    }
    async getToken() {
        if (this.currentToken) {
            console.log("Found token! returning");
            return this.currentToken;
        }
        console.log("No token! creating new login container");
        this.p_createLoginContainer();
        this.p_showLoginContainer();
        if (this.loginContainer == null)
            return;
        this.loginContainer.style.display = "block";
        await this.waitUntilToken();
        this.p_hideLoginContainer();
        const tok = this.currentToken;
        if (tok == null) {
            console.error("Still no token");
        }
        return tok;
    }
}


/***/ }),

/***/ "./src/api/encryptionProvider.ts":
/*!***************************************!*\
  !*** ./src/api/encryptionProvider.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EncryptionProvider: () => (/* binding */ EncryptionProvider)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./src/config.ts");
/* harmony import */ var _safeTunnel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./safeTunnel */ "./src/api/safeTunnel.ts");
/* harmony import */ var _ui_pwdPrompt__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ui/pwdPrompt */ "./src/ui/pwdPrompt.ts");




const ENCRYPTION_UI_WINDOW = `
<div class="encryption-ui-window">
    <div class="title-container">
        <div class="title-sub-container">
            <img src="https://www.svgrepo.com/show/513833/lock.svg" alt="" class="lock-icon-title">
            <h2 class="encryption-title">Encryption</h2>

        </div>
        <button id="encryptionCloseButton" class="encryption-close-button">
            <img src="https://www.svgrepo.com/show/12848/x-symbol.svg" alt="X">
        </button>   
        
    </div>
    
    <input type="text" name="search" id="encrypt-search" class="encryption-ui-search" placeholder="Search for accounts..." autocomplete="off">
    <div class="encryption-ui-people">


    </div>
    <p id="selected">Selected: null</p>
    <div class="center">
        <textarea name="encrypt-message" id="encrypt-message" rows="5" placeholder="Type your message here"></textarea>
    </div>

    <div class="center">
        <button type="button" id="encrypt-btn">
            <div class="btn-with-icon">
                <img src="https://www.svgrepo.com/show/513833/lock.svg" alt="" class="btn-icon">
                <span>Encrypt</span>
            </div>
        </button>
    </div>
    
    <div class="center">
        <textarea name="" id="encrypt-output" placeholder="Output will appear here" rows="2"></textarea>
    </div>
    
</div>
`;
const ENCRYPTION_ACCOUNT = `
<div class="person">
    <p id="account-info">Bob</p>
    <span id="account-id">ID: 17</span>
    <div class="center">
        <button type="button" id="select">Select</button>
    </div>
</div>
`;
const DECRYPT_BUTTON = `
<button type="button" id="decrypt-btn">Decrypt</button>
`;
const LONG_YAP = `
**Important information before proceeding**:
Your message will be protected using military-grade encryption: RSA-OAEP 2048 for secure key exchange, AES-GCM 256 for encrypting the content, and RSA-PSS for digitally signing it to guarantee authenticity. Without access to your account’s login credentials (where passwords are hashed using bcrypt, soon to be upgraded to Argon2), decrypting your message would take millions of years, even with super computers. All communications between your device and the API are encrypted with HTTPS (TLS), ensuring top-level security. If you're on a proxy (such as school Wi-Fi), your data remains encrypted at all times between you and the API. No message history is stored on the server.

Please note that we are not able to provide the decrypted message or private key for anyone registered in our database as private keys are encrypted using account passwords which are hashed using secure algorithms that are very difficult to reverse.
`;
class EncryptionProvider {
    visible = false;
    win;
    currentSearch = "";
    currentSelected = null;
    authProvider;
    constructor(authProvider) {
        this.win = this.createWindow();
        this.hideWindowInstant();
        this.authProvider = authProvider;
        this.injectTab();
        this.refreshAccounts();
        this.searchEvents();
        this.encryptEvent();
        this.messageObserver();
        this.closeButtonEvent();
    }
    termsOfServiceAgree() {
        // Is it alreay present
        if (localStorage.getItem("tos_agree") != null)
            return true;
        const agree = confirm("By using TeamsPlus encryption services, you agree to our terms of service, which can be found on our website at https://apiteamsplus.pythonanywhere.com/terms_of_service. Confirm below if you agree.");
        if (agree) {
            localStorage.setItem("tos_agree", "yes");
            return true;
        }
        return false;
    }
    hideWindow() {
        this.win.animate([
            { transform: 'translateY(-50%) translateX(-50%)', opacity: "1" },
            { transform: 'translateY(-60%) translateX(-50%)', opacity: "0" }
        ], {
            duration: 500,
            easing: "ease-in",
            iterations: 1,
            fill: "forwards"
        });
        setTimeout(() => {
            if (this.win)
                this.win.style.display = "none";
        }, 500);
    }
    hideWindowInstant() {
        this.win.style.display = "none";
    }
    showWindow() {
        this.win.style.opacity = "0";
        this.win.style.display = "block";
        this.win.animate([
            { transform: 'translateY(-60%) translateX(-50%)', opacity: "0" },
            { transform: 'translateY(-50%) translateX(-50%)', opacity: "1" }
        ], {
            duration: 500,
            easing: "ease-out",
            iterations: 1,
            fill: "forwards"
        });
        const messageField = this.win.querySelector("#encrypt-message");
        if (messageField == null)
            return;
        messageField.value = "";
        this.currentSelected = null;
        this.currentSearch = '';
        const selectedP = this.win.querySelector("#selected");
        if (selectedP != null)
            selectedP.innerHTML = "Selected: <strong>No account selected. Please select an account to encrypt.</strong>";
        const input = this.win.querySelector("#encrypt-search");
        if (input != null)
            input.value = '';
        this.refreshAccounts();
    }
    async injectTab() {
        const btns = await window.teamsPlusAppsManager.addAppAndGetButton("Encryption", "https://www.svgrepo.com/show/501247/lock.svg", `
            <svg fill="var(--colorNeutralForeground3)" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
    <path d="M1016.588 1242.353v338.823h-112.94v-338.823h112.94ZM960.118 112.94c217.976 0 395.294 177.318 395.294 395.294V903.53H564.824V508.235c0-217.976 177.317-395.294 395.294-395.294Zm508.235 790.588V508.235C1468.353 228.028 1240.325 0 960.118 0S451.882 228.028 451.882 508.235V903.53H226v790.589C226 1818.692 327.308 1920 451.882 1920h1016.47c124.575 0 225.883-101.308 225.883-225.882V903.529h-225.882Z" fill-rule="evenodd"/>
</svg>`);
        btns.forEach(btn => {
            btn.addEventListener("click", () => {
                this.visible = !this.visible;
                if (this.visible) {
                    this.showWindow();
                }
                else {
                    this.hideWindow();
                }
            });
        });
    }
    createWindow() {
        const win = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(ENCRYPTION_UI_WINDOW);
        document.body.appendChild(win);
        return win;
    }
    refreshAccounts() {
        const list = this.win.querySelector(".encryption-ui-people");
        if (list == null) {
            throw new Error("List not found");
        }
        ;
        const selectedP = this.win.querySelector("#selected");
        if (selectedP == null)
            return;
        list.innerHTML = '';
        fetch(`${_config__WEBPACK_IMPORTED_MODULE_1__.API_ENDPOINT}/api/v1/auth/search?search=${this.currentSearch}`, {
            method: 'GET'
        })
            .then(response => response.json())
            .then((data) => {
            if (data.message && data.success == true && data.data) {
                const resp = data.data;
                for (const user in resp) {
                    const id = resp[user];
                    const newEl = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(ENCRYPTION_ACCOUNT);
                    const p = newEl.querySelector("#account-info");
                    const p2 = newEl.querySelector("#account-id");
                    if (p == null || p2 == null) {
                        throw new Error("Account info not found!");
                    }
                    ;
                    p.textContent = `${user}`;
                    p2.textContent = `ID: ${id}`;
                    const selectBtn = newEl.querySelector("#select");
                    if (selectBtn == null) {
                        throw new Error("select btn");
                    }
                    selectBtn.addEventListener("click", () => {
                        this.currentSelected = id;
                        //alert(`Selected ${id}`);
                        selectedP.textContent = `Selected: ${user}/${id}`;
                    });
                    list.appendChild(newEl);
                    newEl.style.opacity = "0";
                    newEl.style.transform = "translateY(-15px)";
                    newEl.animate([
                        { transform: 'translateY(-15px)', opacity: "0" },
                        { transform: 'translateY(0px)', opacity: "1" }
                    ], {
                        duration: 500,
                        easing: "ease-out",
                        iterations: 1,
                        fill: "forwards"
                    });
                    console.log(`Added: ${user}`);
                }
            }
            else {
                throw new Error(data.message);
            }
        })
            .catch((error) => {
            console.error('Error:', error);
            if (error instanceof Error) {
                alert(`Error: ${error.message}`);
            }
            else {
                alert("Error");
            }
        });
    }
    searchEvents() {
        const input = this.win.querySelector("#encrypt-search");
        if (input == null)
            return;
        input.addEventListener("input", () => {
            this.currentSearch = input.value;
            this.refreshAccounts();
        });
    }
    encryptEvent() {
        const encryptBtn = this.win.querySelector("#encrypt-btn");
        if (encryptBtn == null)
            return;
        const messageField = this.win.querySelector("#encrypt-message");
        if (messageField == null)
            return;
        encryptBtn.addEventListener("click", async () => {
            if (this.currentSelected == null) {
                alert("Please select an account before encrypting!");
                return;
            }
            //alert(LONG_YAP);
            this.termsOfServiceAgree();
            const safeTunnel = new _safeTunnel__WEBPACK_IMPORTED_MODULE_2__.SafeTunnel();
            const body = JSON.stringify({
                destination: [this.currentSelected],
                body: messageField.value,
                pwd: await (0,_ui_pwdPrompt__WEBPACK_IMPORTED_MODULE_3__.promptAndWait)()
            });
            const encryptedBody = await safeTunnel.safeTunnelEncrypt(body);
            fetch(`${_config__WEBPACK_IMPORTED_MODULE_1__.API_ENDPOINT}/api/v1/encryption/encrypt`, {
                method: 'POST',
                body: JSON.stringify(encryptedBody),
                headers: {
                    'Authorization': `Bearer ${await this.authProvider.getToken()}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then((data) => {
                if (data.message && data.success == true && data.data) {
                    if (data.note) {
                        alert(`Note: ${data.note}`);
                    }
                    const finalStr = `[Encrypted Message]\\\\\\\\${JSON.stringify(data.data)}\\\\\\\\[END]`;
                    const encryptOutput = this.win.querySelector("#encrypt-output");
                    if (encryptOutput) {
                        encryptOutput.value = finalStr;
                    }
                    navigator.clipboard.writeText(finalStr);
                    alert("Copied to clipboard");
                }
                else {
                    throw new Error(data.message);
                }
            })
                .catch((error) => {
                console.error('Error:', error);
                if (error instanceof Error) {
                    alert(`Error: ${error.message}`);
                }
                else {
                    alert("Error");
                }
            });
        });
    }
    isValidEncrypted(str) {
        const splitted = str.split("\\\\\\\\");
        if (splitted.length != 3)
            return false;
        const second = splitted[1];
        try {
            JSON.parse(second);
        }
        catch (e) {
            return false;
        }
        finally {
            return true;
        }
    }
    async attemptDecrypt(jsonData) {
        this.termsOfServiceAgree();
        const safeTunnel = new _safeTunnel__WEBPACK_IMPORTED_MODULE_2__.SafeTunnel();
        const content = JSON.stringify({
            body: jsonData["body"],
            key: jsonData["keys"],
            iv: jsonData["iv"],
            signature: jsonData["signature"],
            pwd: await (0,_ui_pwdPrompt__WEBPACK_IMPORTED_MODULE_3__.promptAndWait)(),
            author: jsonData["author"]
        });
        fetch(`${_config__WEBPACK_IMPORTED_MODULE_1__.API_ENDPOINT}/api/v1/encryption/decrypt`, {
            method: 'POST',
            body: JSON.stringify(await safeTunnel.safeTunnelEncrypt(content)),
            headers: {
                'Authorization': `Bearer ${await this.authProvider.getToken()}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(async (a) => {
            const data = await safeTunnel.safeTunnelDecrypt(a.ct, a.iv);
            if (data.message && data.success == true && data.data) {
                alert(`Message was: ${data.data}`);
            }
            else {
                throw new Error(data.message);
            }
        })
            .catch((error) => {
            console.error('Error:', error);
            if (error instanceof Error) {
                alert(`Error: ${error.message}`);
            }
            else {
                alert("Error");
            }
        });
    }
    onMessage(element) {
        const subDiv = element.querySelector('[id^="content-"]');
        if (subDiv == null) {
            console.log("Mut observer warn: content- element not found under message");
            return;
        }
        console.log(subDiv.ariaLabel);
        const message = subDiv.ariaLabel || "";
        const isValid = this.isValidEncrypted(subDiv.ariaLabel || "");
        // Now do stuff
        if (isValid && subDiv.querySelector("#decrypt-btn") == null) {
            const newBtn = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(DECRYPT_BUTTON);
            subDiv.appendChild(newBtn);
            newBtn.addEventListener("click", () => {
                try {
                    const splitted = message.split("\\\\\\\\");
                    const theActualMessage = splitted[1];
                    this.attemptDecrypt(JSON.parse(theActualMessage));
                }
                catch (e) {
                    alert(`Failed: ${e}`);
                }
            });
        }
    }
    messageObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof HTMLElement &&
                        node.dataset.tid === 'chat-pane-message') {
                        console.log('New chat message detected:', node);
                        this.onMessage(node);
                    }
                    if (node instanceof HTMLElement || node instanceof DocumentFragment) {
                        const wrappers = node.querySelectorAll('[data-tid="chat-pane-message"]');
                        wrappers.forEach((wrapper, index) => this.onMessage(wrapper));
                    }
                }
            }
        });
        console.log("Starting Mutation observer on Body!");
        observer.observe(document.body, { childList: true, subtree: true });
    }
    closeButtonEvent() {
        const closeButton = this.win.querySelector("#encryptionCloseButton");
        if (closeButton == null)
            return;
        closeButton.addEventListener("click", () => {
            this.hideWindow();
            this.visible = false;
        });
    }
}


/***/ }),

/***/ "./src/api/safeTunnel.ts":
/*!*******************************!*\
  !*** ./src/api/safeTunnel.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SafeTunnel: () => (/* binding */ SafeTunnel)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config */ "./src/config.ts");

async function exportKeyToPEM(key, type = "public") {
    const format = type === "public" ? "spki" : "pkcs8";
    const label = type === "public" ? "PUBLIC KEY" : "PRIVATE KEY";
    const buf = await window.crypto.subtle.exportKey(format, key);
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const pem = [
        `-----BEGIN ${label}-----`,
        ...b64.match(/.{1,64}/g),
        `-----END ${label}-----`
    ].join("\n");
    return pem;
}
function base64toBytes(b64) {
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes; // Uint8Array of decoded bytes
}
class SafeTunnel {
    keypair;
    aesKey;
    aesKeyString;
    constructor() {
        this.asyncInit();
    }
    async waitForKey() {
        while (this.aesKey == null || this.aesKey == undefined) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return true;
    }
    async asyncInit() {
        await this.createRSAKeypair();
        await this.getSharedAESKey();
    }
    async createRSAKeypair() {
        console.log("Creating RSA keypair");
        this.keypair = await window.crypto.subtle.generateKey({
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        }, true, // extractable
        ["encrypt", "decrypt"]);
        console.log("Keypair OK");
    }
    async getSharedAESKey() {
        console.log("Attempt to establish safe-tunnel connection");
        //const b = true;
        //if (b == false) {
        //    throw new Error("Server authenticity unproven, client refused connection");
        //}
        const resp = await fetch(`${_config__WEBPACK_IMPORTED_MODULE_0__.API_ENDPOINT}/api/v1/safe_tunnel/handshake`, {
            method: 'POST',
            body: JSON.stringify({
                publicKey: await exportKeyToPEM(this.keypair.publicKey, "public")
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const response_json = await resp.json();
        if (response_json.message == null) {
            throw new Error("Invalid server response");
        }
        if (response_json.success == false) {
            throw new Error(`Failed to establish secure connection: ${response_json.message}`);
        }
        if (response_json.data == null) {
            throw new Error(`Server returned an invalid response`);
        }
        this.aesKeyString = response_json.data.ks;
        console.log(this.aesKeyString);
        const decrypted = await window.crypto.subtle.decrypt({
            name: "RSA-OAEP"
        }, this.keypair.privateKey, // previously imported/generated private CryptoKey
        base64toBytes(response_json.data.k) // an ArrayBuffer (not base64 or string)
        );
        this.aesKey = await window.crypto.subtle.importKey("raw", decrypted, { name: "AES-GCM" }, // or AES-GCM
        false, // not extractable
        ["encrypt", "decrypt"]);
        console.log("Successfully established safe-tunnel connection");
    }
    async safeTunnelEncrypt(content) {
        try {
            console.log("Wait for AES finish creation");
            await this.waitForKey();
            console.log("AES Creation is done");
            console.log("AES key:", this.aesKey);
            const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for GCM
            const data = new TextEncoder().encode(content);
            const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, this.aesKey, data);
            const b64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
            const b642 = btoa(String.fromCharCode(...new Uint8Array(iv)));
            return {
                iv: b642,
                ct: b64,
                k: this.aesKeyString,
            };
        }
        catch (e) {
            alert("Safe-tunnel encryption failed. Please refresh and try again.");
            throw new Error(`Safe-tunnel encryption failed: ${e}`);
        }
    }
    async safeTunnelDecrypt(ct, iv) {
        try {
            const algorithm = {
                name: "AES-GCM",
                iv: base64toBytes(iv), // Initialization Vector
            };
            const decryptedData = await window.crypto.subtle.decrypt(algorithm, this.aesKey, base64toBytes(ct));
            const decoder = new TextDecoder();
            const plain = decoder.decode(decryptedData);
            return JSON.parse(plain);
        }
        catch (e) {
            alert("Safe-tunnel decryption failed. Please refresh and try again.");
            throw new Error(`Safe-tunnel decryption failed: ${e}`);
        }
    }
}


/***/ }),

/***/ "./src/api/themesShop.ts":
/*!*******************************!*\
  !*** ./src/api/themesShop.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ThemesShopHandler: () => (/* binding */ ThemesShopHandler)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./src/config.ts");


const BUTTON_ELEMENT_HTML = `
<button id="themeShopBtn">Shop</button>
`;
const THEME_CARD_LISTING = `
<div class="listing-card">
    <h3 class="theme-name">Theme</h3>
    <p class="theme-description">This theme will make your Teams look very pretty! This theme will make your Teams look very pretty! This theme will make your Teams look very pretty! This theme will make your Teams look very pretty! This theme will make your Teams look
        very pretty!</p>
    <div class="actions">
        <button class="theme-install" id="theme-install">Install</button>
        <button class="star" id="star-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none" class="star-icon">
                <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            <span>30k</span>
        </button>
    </div>
</div>
`;
const THEME_SHOP = `
<div class="main-container">
    <div class="top-navbar">
        <input type="text" name="" id="container-search" class="container-search" placeholder="Search" autocomplete="off">
        <button class="container-search-submit" id="search-submit">Search</button>
        <p class="container-n-points" id="coins">0 coins</p>
        <button class="shop-close-button" id="shopCloseButton">
            <img src="https://www.svgrepo.com/show/12848/x-symbol.svg" alt="X">
        </button>
    </div>
    <div class="listings">
        <div class="listings-loader-parent" id="listings-loader">
            <span class="listings-loader"></span>
        </div>
    </div>
</div>
`;
class ThemesShopHandler {
    parser;
    themeShopUI = null;
    shopUiVisible = false;
    authProvider;
    currentSearchQuery;
    themeProvider;
    constructor(themeProvider, appsMenuManager, authProvider) {
        this.parser = new DOMParser();
        this.authProvider = authProvider;
        this.currentSearchQuery = '';
        this.themeProvider = themeProvider;
        this.p_init(appsMenuManager);
    }
    async p_injectButton(appsMenuManager) {
        // Get the thing element and inject a poor button in it
        /*const element: HTMLDivElement = await waitForElement('[data-tid="titlebar-end-slot"]') as HTMLDivElement;

        console.log("Found button element");

        const buttonElement = p_stringToElement(BUTTON_ELEMENT_HTML);



        element.appendChild(buttonElement);*/
        /*const buttonElement = await injectTab("Browse themes", `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="var(--colorNeutralForeground3)" height="24px" width="24px" version="1.1" id="XMLID_269_" viewBox="0 0 24 24" xml:space="preserve">
<g id="shop-cart">
    <g>
        <circle cx="9" cy="21" r="2"/>
    </g>
    <g>
        <circle cx="19" cy="21" r="2"/>
    </g>
    <g>
        <path d="M21,18H7.2l-4-16H0V0h4.8l0.8,3H24l-3.2,11H8.3l0.5,2H21V18z M7.8,12h11.5l2-7H6L7.8,12z"/>
    </g>
</g>
</svg>`);
        if (buttonElement == null) return;
        buttonElement.addEventListener("click", () => {
            if (this.shopUiVisible) {
                this.shopUiVisible = false;

                this.p_hideThemeShopUI();
            } else {
                this.shopUiVisible = true;

                this.p_showThemeShopUI();
            }
        })
        console.log("Injected button");*/
        const buttonElements = await appsMenuManager.addAppAndGetButton("Browse Themes", "https://www.svgrepo.com/show/148598/shop-cart.svg", `
            <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 44.16 44.16" xml:space="preserve">
<g>
	<path style="fill:var(--colorNeutralForeground3);" d="M44.16,6.6H11.592L10.66,1.179H2.408C1.076,1.179,0,2.257,0,3.588v2.408h6.602l4.248,24.709
		c0.094,0.544,0.617,0.985,1.17,0.985h28.527c1.332,0,2.41-1.077,2.41-2.411v-2.406H15.078l-0.587-3.414h22.042
		c2.66,0,5.172-2.128,5.611-4.75L44.16,6.6z"/>
	<circle style="fill:var(--colorNeutralForeground3);" cx="19.47" cy="38.817" r="4.165"/>
	<path style="fill:var(--colorNeutralForeground3);" d="M29.762,38.816c0,2.299,1.863,4.164,4.162,4.164c2.301,0,4.168-1.865,4.168-4.164
		c0-2.299-1.867-4.166-4.168-4.166C31.625,34.65,29.762,36.518,29.762,38.816z"/>
</g>
</svg>
            `);
        //if (buttonElement == null) return;
        buttonElements.forEach(buttonElement => {
            buttonElement.addEventListener("click", () => {
                if (this.shopUiVisible) {
                    this.shopUiVisible = false;
                    this.p_hideThemeShopUI();
                }
                else {
                    this.shopUiVisible = true;
                    this.p_showThemeShopUI();
                }
            });
        });
        console.log("Injected button");
    }
    loaderState(visibility) {
        if (this.themeShopUI == null)
            return;
        const loader = this.themeShopUI.querySelector("#listings-loader");
        if (loader == null)
            return;
        if (visibility) {
            loader.style.display = "block";
            loader.animate([
                { transform: 'translateY(-15px)', opacity: "0" },
                { transform: 'translateY(0px)', opacity: "1" }
            ], {
                duration: 500,
                easing: "ease-out",
                iterations: 1,
                fill: "forwards"
            });
        }
        else {
            loader.animate([
                { transform: 'translateY(0px)', opacity: "1" },
                { transform: 'translateY(-15px)', opacity: "0" }
            ], {
                duration: 500,
                easing: "ease-in",
                iterations: 1,
                fill: "forwards"
            });
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }
    }
    p_didIstarThis(name) {
        return new Promise((resolve, reject) => {
            if (this.authProvider.currentToken == null) {
                reject("no token");
                return;
            }
            ;
            fetch(`${_config__WEBPACK_IMPORTED_MODULE_1__.API_ENDPOINT}/api/v1/themes/wait_did_i_star_this?name=${name}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authProvider.currentToken}`
                }
            })
                .then(response => {
                console.log(response);
                return response.json();
            })
                .then(data => {
                if (data.success == null || data.success == false) {
                    throw new Error("Success field not found or unsuccessfull");
                }
                if (data.message == null) {
                    throw new Error("No message field found");
                }
                if (data.data == null) {
                    throw new Error("No data field found");
                }
                resolve(data.data);
            })
                .catch(error => {
                console.error('Error:', error);
                reject(error);
            });
        });
    }
    async star(name) {
        fetch(`${_config__WEBPACK_IMPORTED_MODULE_1__.API_ENDPOINT}/api/v1/themes/star`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                token: await this.authProvider.getToken()
            })
        })
            .then(response => {
            console.log(response);
            return response.json();
        })
            .then(data => {
            if (data.success == null || data.success == false) {
                throw new Error("Success field not found or unsuccessfull");
            }
            if (data.message == null) {
                throw new Error("No message field found");
            }
            console.log("Liked!");
            this.p_refreshListings(this.currentSearchQuery);
        })
            .catch(error => {
            console.error('Error:', error);
        });
    }
    async changeIconStroke(name, starSvg) {
        try {
            const isStarred = await this.p_didIstarThis(name);
            if (isStarred == true) {
                starSvg.classList.add("starred");
                console.log("Starred");
            }
            else {
                console.log("Not starred");
            }
        }
        catch (e) {
            console.error("Failed", e);
        }
    }
    p_createCard(name, desc, data, author, stars) {
        const element = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(THEME_CARD_LISTING);
        const themeNameEl = element.querySelector(".theme-name");
        const themeDescEl = element.querySelector(".theme-description");
        const starsEl = element.querySelector("span");
        const starBtn = element.querySelector("#star-btn");
        const themeInstallBtn = element.querySelector("#theme-install");
        if (themeNameEl == null || themeDescEl == null || starsEl == null || starBtn == null || themeInstallBtn == null)
            return;
        const starsSvg = starBtn.querySelector("svg");
        if (starsSvg == null)
            return;
        themeNameEl.textContent = name;
        themeDescEl.textContent = desc;
        starsEl.textContent = stars.toString();
        this.changeIconStroke(name, starsSvg);
        starBtn.addEventListener("click", async () => {
            console.log("The button got clicked!");
            const tok = await this.authProvider.getToken();
            if (!tok) {
                alert("You must be logged in to do this");
                return;
            }
            this.star(name);
        });
        themeInstallBtn.addEventListener("click", async () => {
            try {
                await this.themeProvider.dataManager.loadThemes();
                this.themeProvider.p_syncInstanceWithDataManager();
                const parsed = this.themeProvider.p_isThemeValid(data);
                if (parsed) {
                    let counter = 1;
                    const baseName = parsed.name;
                    let newName = baseName;
                    while (this.themeProvider.dataManager.currentThemes[newName]) {
                        newName = `${baseName} (${counter})`;
                        counter++;
                    }
                    this.themeProvider.addTheme(newName, data);
                    alert("Added theme");
                }
                else {
                    alert('Failed to parse theme');
                }
            }
            catch (e) {
                console.error("Failed to add theme: ", e);
                alert(`Failed to add theme: ${e}`);
            }
        });
        return element;
    }
    p_refreshListings(searchQuery) {
        if (this.themeShopUI == null)
            return;
        const listingsElement = this.themeShopUI.querySelector(".listings");
        if (listingsElement == null)
            return;
        listingsElement.innerHTML = '';
        // Fetch
        this.loaderState(true);
        fetch(`${_config__WEBPACK_IMPORTED_MODULE_1__.API_ENDPOINT}/api/v1/themes/get?search=${searchQuery}`)
            .then(response => response.json())
            .then((data) => {
            console.log('Data:', data["data"]);
            for (const themeName in data["data"]) {
                const d = data["data"][themeName];
                const a = this.p_createCard(d.name, d.desc, d.data, d.author, d.stars);
                if (a) {
                    a.style.opacity = "0";
                    a.style.transform = "translateY(-15px)";
                    listingsElement.appendChild(a);
                    // Do the anmimation
                    a.animate([
                        { transform: 'translateY(-15px)', opacity: "0" },
                        { transform: 'translateY(0px)', opacity: "1" }
                    ], {
                        duration: 500,
                        easing: "ease-out",
                        iterations: 1,
                        fill: "forwards"
                    });
                }
            }
            this.loaderState(false);
        })
            .catch(error => {
            this.loaderState(false);
            console.error('Error:', error);
            alert("Error");
        });
    }
    async p_hideThemeShopUI() {
        if (this.themeShopUI) {
            // Animatoin
            this.themeShopUI.animate([
                { transform: 'translateY(-50%) translateX(-50%)', opacity: "1" },
                { transform: 'translateY(-60%) translateX(-50%)', opacity: "0" }
            ], {
                duration: 500,
                easing: "ease-in",
                iterations: 1,
                fill: "forwards"
            });
            setTimeout(() => {
                if (this.themeShopUI == null)
                    return;
                this.themeShopUI.style.display = "none";
            }, 500);
        }
    }
    p_hideThemeShopUIInstant() {
        if (this.themeShopUI == null)
            return;
        this.themeShopUI.style.display = "none";
    }
    async p_updateCoinCount() {
        if (this.themeShopUI == null)
            return;
        const element = this.themeShopUI.querySelector("#coins");
        if (element == null)
            return;
        if (this.authProvider.currentToken == null) {
            element.textContent = "Logged out";
            return;
        }
        ;
        const tok = this.authProvider.currentToken;
        fetch(`${_config__WEBPACK_IMPORTED_MODULE_1__.API_ENDPOINT}/api/v1/user/get_coins`, {
            headers: {
                "Authorization": `Bearer ${tok}`
            }
        })
            .then(res => {
            if (res.status != 200)
                throw new Error("Failed to get coin count");
            return res.json();
        })
            .then(data => {
            const coniCount = data.data;
            element.textContent = `${coniCount} coins`;
        })
            .catch(err => {
            console.error(err);
            alert("Failed to fetch number of coins: " + err);
        });
    }
    async p_showThemeShopUI() {
        if (this.themeShopUI) {
            this.themeShopUI.style.display = "flex";
            this.themeShopUI.style.opacity = "0";
            // Animation
            this.themeShopUI.animate([
                { transform: 'translateY(-65%) translateX(-50%)', opacity: "0" },
                { transform: 'translateY(-50%) translateX(-50%)', opacity: "1" }
            ], {
                duration: 500,
                easing: "ease-out",
                iterations: 1,
                fill: "forwards"
            });
            this.p_refreshListings(this.currentSearchQuery);
            this.p_updateCoinCount();
        }
    }
    async p_injectUi() {
        this.themeShopUI = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(THEME_SHOP);
        document.body.appendChild(this.themeShopUI);
        // Hide it
        this.p_hideThemeShopUIInstant();
    }
    async p_searchBar() {
        if (this.themeShopUI == null)
            return;
        const searchBar = this.themeShopUI.querySelector("#container-search");
        const submitBtn = this.themeShopUI.querySelector("#search-submit");
        if (searchBar == null || submitBtn == null)
            return;
        submitBtn.addEventListener("click", () => {
            this.currentSearchQuery = searchBar.value;
            this.p_refreshListings(this.currentSearchQuery);
        });
        searchBar.addEventListener("input", () => {
            this.currentSearchQuery = searchBar.value;
            this.p_refreshListings(this.currentSearchQuery);
        });
    }
    p_closeButton() {
        if (this.themeShopUI == null)
            return;
        const closeButton = this.themeShopUI.querySelector("#shopCloseButton");
        closeButton.addEventListener("click", () => {
            this.shopUiVisible = false;
            this.p_hideThemeShopUI();
        });
    }
    async p_init(appsMenuManager) {
        this.p_injectButton(appsMenuManager);
        this.p_injectUi();
        this.p_searchBar();
        this.p_closeButton();
    }
}


/***/ }),

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   API_ENDPOINT: () => (/* binding */ API_ENDPOINT),
/* harmony export */   CERT_KEY: () => (/* binding */ CERT_KEY)
/* harmony export */ });
const API_ENDPOINT = "https://apiteamsplus.pythonanywhere.com";
//export const API_ENDPOINT = "http://127.0.0.1:5000";
const CERT_KEY = 'b1cb85820e071d396b784b49767cb390938426f5f59b88d32736ee1fbf03a0a7';


/***/ }),

/***/ "./src/contribution/defaultThemes.ts":
/*!*******************************************!*\
  !*** ./src/contribution/defaultThemes.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_THEMES: () => (/* binding */ DEFAULT_THEMES)
/* harmony export */ });
/**
 * File: contribution/defaultThemes.ts
 * Contribute to creating default themes for the extension.
 *
 * Example of how to write a theme
 *
 * const aDefaultThemes: {[key: string]: string} = { // Varaiable declaration
 * ... more themes above ...
 * '<Your theme name>': `<Your theme data> (you can get it through theme export, just paste the data here)`,
 * }
 * This is probably very unclear. Just follow examples on the bottom.
 * Read the docs for more info.
 *
 */
// VERY IMPORTANT! Please make sure to replace all your single backward slash ('\') with double backward slashes ('\\'). If this is not done, your theme will not load properly!
const aDEFAULT_THEMES = {
    // Themes go here:
    'Default Teams Theme': `{"data":{"varColors":{},"classColors":{},"fonts":{"fontFamily":"-apple-system, BlinkMacSystemFont, \\"Segoe UI\\", system-ui, \\"Apple Color Emoji\\", \\"Segoe UI Emoji\\", sans-serif","imports":""},"otherSettings":{},"twemojiSupport":false},"name":"Default Teams Theme","data_version":1}`,
    'Cozy Dark Blue theme': `{"data":{"varColors":{"--colorNeutralForeground1":"#FFFFFF","--colorNeutralForeground2":"#FFFFFF","--colorNeutralForeground3":"#777AC6","--colorBrandForegroundLink":"#54D0FF","--colorBrandForegroundLinkHover":"#FFFFFF","--colorBrandForeground1":"#FFFFFF","--colorBrandForeground2":"#FFFFFF","--colorBrandForeground2Hover":"#FFFFFF","--colorNeutralForegroundInverted":"#FFFFFF","--colorNeutralBackground1":"#002457","--colorNeutralBackground2":"#000000","--colorNeutralBackground3":"#000E57","--colorNeutralBackground4":"#000000","--colorNeutralBackground5":"#001271","--colorBrandBackground":"#000000","--colorBrandBackgroundHover":"#828282","--colorBrandBackground2":"#00527C","--colorBrandBackgroundInverted":"#FFFFFF","--colorNeutralCardBackground":"#202020","--colorNeutralStrokeAccessibleSelected":"#FFFFFF","--colorNeutralStroke1":"#00000000","--colorNeutralStroke2":"#0756AE00","--colorNeutralStroke3":"#002B7C00","--colorNeutralStrokeSubtle":"#E0E0E000","--colorNeutralStrokeOnBrand":"#FFFFFF00","--colorNeutralStrokeOnBrand2":"#FFFFFF00","--backgroundCanvas":"#002985","--colorAvatar":"#FFFFFF","--colorAvatarBackground":"#C9CFFF","--colorDefaultBackground7":"#001D54","--colorTeamsBrand1Hover":"#FFFFFF"},"classColors":{"ff":"#FFFFFF","oh":"#FFFFFF","jg":"#00000000","ui-toolbar__item":"#FFFFFF","oi":"#FFFFFF","fui-StyledText":"#FFFFFF"},"fonts":{"fontFamily":"\\"Inter\\", courier","imports":"@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');"},"otherSettings":{"--borderRadiusMedium":"20px"},"twemojiSupport":true},"name":"Cozy Dark Blue theme","data_version":1}`,
};
////// Do not change anything under this line  /////////
////// unless you know what you are doing      /////////
const DEFAULT_THEMES = aDEFAULT_THEMES; /*Module export*/


/***/ }),

/***/ "./src/contribution/descriptions.ts":
/*!******************************************!*\
  !*** ./src/contribution/descriptions.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   aGROUP_DESCRIPTIONS: () => (/* binding */ aGROUP_DESCRIPTIONS)
/* harmony export */ });
/*
File: descriptions.ts

Stores the description for each group name.
Null = no description.
Description must be string.

Surround description in quotes ("Description here!")


*/
const dGROUP_DESCRIPTIONS = {
    "--colorNeutralForeground1": null,
    "--colorNeutralForeground1Hover": null,
    "--colorNeutralForeground1Pressed": null,
    "--colorNeutralForeground1Selected": null,
    "--colorNeutralForeground2": "Used for certain icons",
    "--colorNeutralForeground2Hover": null,
    "--colorNeutralForeground2Pressed": null,
    "--colorNeutralForeground2Selected": null,
    "--colorNeutralForeground2BrandHover": null,
    "--colorNeutralForeground2BrandPressed": null,
    "--colorNeutralForeground2BrandSelected": null,
    "--colorNeutralForeground3": "Used for slightly greyed out text",
    "--colorNeutralForeground3Hover": null,
    "--colorNeutralForeground3Pressed": null,
    "--colorNeutralForeground3Selected": null,
    "--colorNeutralForeground3BrandHover": null,
    "--colorNeutralForeground3BrandPressed": null,
    "--colorNeutralForeground3BrandSelected": null,
    "--colorNeutralForeground4": null,
    "--colorNeutralForegroundDisabled": null,
    "--colorNeutralForegroundInvertedDisabled": null,
    "--colorBrandForegroundLink": null,
    "--colorBrandForegroundLinkHover": null,
    "--colorBrandForegroundLinkPressed": null,
    "--colorBrandForegroundLinkSelected": null,
    "--colorNeutralForeground2Link": null,
    "--colorNeutralForeground2LinkHover": null,
    "--colorNeutralForeground2LinkPressed": null,
    "--colorNeutralForeground2LinkSelected": null,
    "--colorCompoundBrandForeground1": null,
    "--colorCompoundBrandForeground1Hover": null,
    "--colorCompoundBrandForeground1Pressed": null,
    "--colorBrandForeground1": null,
    "--colorBrandForeground2": null,
    "--colorBrandForeground2Hover": null,
    "--colorBrandForeground2Pressed": null,
    "--colorNeutralForeground1Static": null,
    "--colorNeutralForegroundStaticInverted": null,
    "--colorNeutralForegroundInverted": null,
    "--colorNeutralForegroundInvertedHover": null,
    "--colorNeutralForegroundInvertedPressed": null,
    "--colorNeutralForegroundInvertedSelected": null,
    "--colorNeutralForegroundInverted2": null,
    "--colorNeutralForegroundOnBrand": null,
    "--colorNeutralForegroundInvertedLink": null,
    "--colorNeutralForegroundInvertedLinkHover": null,
    "--colorNeutralForegroundInvertedLinkPressed": null,
    "--colorNeutralForegroundInvertedLinkSelected": null,
    "--colorBrandForegroundInverted": null,
    "--colorBrandForegroundInvertedHover": null,
    "--colorBrandForegroundInvertedPressed": null,
    "--colorBrandForegroundOnLight": null,
    "--colorBrandForegroundOnLightHover": null,
    "--colorBrandForegroundOnLightPressed": null,
    "--colorBrandForegroundOnLightSelected": null,
    "--colorNeutralBackground1": "Used for background color in chat tab",
    "--colorNeutralBackground1Hover": null,
    "--colorNeutralBackground1Pressed": null,
    "--colorNeutralBackground1Selected": null,
    "--colorNeutralBackground2": "Backgroud color used for widgets, like search and reply.",
    "--colorNeutralBackground2Hover": null,
    "--colorNeutralBackground2Pressed": null,
    "--colorNeutralBackground2Selected": null,
    "--colorNeutralBackground3": null,
    "--colorNeutralBackground3Hover": null,
    "--colorNeutralBackground3Pressed": null,
    "--colorNeutralBackground3Selected": null,
    "--colorNeutralBackground4": null,
    "--colorNeutralBackground4Hover": null,
    "--colorNeutralBackground4Pressed": null,
    "--colorNeutralBackground4Selected": null,
    "--colorNeutralBackground5": null,
    "--colorNeutralBackground5Hover": null,
    "--colorNeutralBackground5Pressed": null,
    "--colorNeutralBackground5Selected": null,
    "--colorNeutralBackground6": null,
    "--colorNeutralBackgroundInverted": null,
    "--colorNeutralBackgroundStatic": null,
    "--colorNeutralBackgroundAlpha": null,
    "--colorNeutralBackgroundAlpha2": null,
    "--colorSubtleBackgroundHover": null,
    "--colorSubtleBackgroundPressed": null,
    "--colorSubtleBackgroundSelected": null,
    "--colorSubtleBackgroundLightAlphaHover": null,
    "--colorSubtleBackgroundLightAlphaPressed": null,
    "--colorSubtleBackgroundInvertedHover": null,
    "--colorSubtleBackgroundInvertedPressed": null,
    "--colorSubtleBackgroundInvertedSelected": null,
    "--colorNeutralBackgroundDisabled": null,
    "--colorNeutralBackgroundInvertedDisabled": null,
    "--colorNeutralStencil1": null,
    "--colorNeutralStencil2": null,
    "--colorNeutralStencil1Alpha": null,
    "--colorNeutralStencil2Alpha": null,
    "--colorBackgroundOverlay": null,
    "--colorScrollbarOverlay": null,
    "--colorBrandBackground": "Used for buttons that use the brand color (brand color is purple by default)",
    "--colorBrandBackgroundHover": null,
    "--colorBrandBackgroundPressed": null,
    "--colorBrandBackgroundSelected": null,
    "--colorCompoundBrandBackground": null,
    "--colorCompoundBrandBackgroundHover": null,
    "--colorCompoundBrandBackgroundPressed": null,
    "--colorBrandBackgroundStatic": null,
    "--colorBrandBackground2": null,
    "--colorBrandBackground2Hover": null,
    "--colorBrandBackground2Pressed": null,
    "--colorBrandBackground3Static": null,
    "--colorBrandBackground4Static": null,
    "--colorBrandBackgroundInverted": null,
    "--colorBrandBackgroundInvertedHover": null,
    "--colorBrandBackgroundInvertedPressed": null,
    "--colorBrandBackgroundInvertedSelected": null,
    "--colorNeutralCardBackground": null,
    "--colorNeutralCardBackgroundHover": null,
    "--colorNeutralCardBackgroundPressed": null,
    "--colorNeutralCardBackgroundSelected": null,
    "--colorNeutralCardBackgroundDisabled": null,
    "--colorNeutralStrokeAccessible": null,
    "--colorNeutralStrokeAccessibleHover": null,
    "--colorNeutralStrokeAccessiblePressed": null,
    "--colorNeutralStrokeAccessibleSelected": null,
    "--colorNeutralStroke1": null,
    "--colorNeutralStroke1Hover": null,
    "--colorNeutralStroke1Pressed": null,
    "--colorNeutralStroke1Selected": null,
    "--colorNeutralStroke2": null,
    "--colorNeutralStroke3": null,
    "--colorNeutralStrokeSubtle": null,
    "--colorNeutralStrokeOnBrand": null,
    "--colorNeutralStrokeOnBrand2": null,
    "--colorNeutralStrokeOnBrand2Hover": null,
    "--colorNeutralStrokeOnBrand2Pressed": null,
    "--colorNeutralStrokeOnBrand2Selected": null,
    "--colorBrandStroke1": null,
    "--colorBrandStroke2": null,
    "--colorBrandStroke2Hover": null,
    "--colorBrandStroke2Pressed": null,
    "--colorBrandStroke2Contrast": null,
    "--colorCompoundBrandStroke": null,
    "--colorCompoundBrandStrokeHover": null,
    "--colorCompoundBrandStrokePressed": null,
    "--colorNeutralStrokeDisabled": null,
    "--colorNeutralStrokeInvertedDisabled": null,
    "--colorNeutralStrokeAlpha": null,
    "--colorNeutralStrokeAlpha2": null,
    "--colorStrokeFocus1": null,
    "--colorStrokeFocus2": null,
    "--colorNeutralShadowAmbient": null,
    "--colorNeutralShadowKey": null,
    "--colorNeutralShadowAmbientLighter": null,
    "--colorNeutralShadowKeyLighter": null,
    "--colorNeutralShadowAmbientDarker": null,
    "--colorNeutralShadowKeyDarker": null,
    "--colorBrandShadowAmbient": null,
    "--colorBrandShadowKey": null,
    "--colorPaletteRedBackground1": null,
    "--colorPaletteRedBackground2": null,
    "--colorPaletteRedBackground3": null,
    "--colorPaletteRedForeground1": null,
    "--colorPaletteRedForeground2": null,
    "--colorPaletteRedForeground3": null,
    "--colorPaletteRedBorderActive": null,
    "--colorPaletteRedBorder1": null,
    "--colorPaletteRedBorder2": null,
    "--colorPaletteGreenBackground1": null,
    "--colorPaletteGreenBackground2": null,
    "--colorPaletteGreenBackground3": null,
    "--colorPaletteGreenForeground1": null,
    "--colorPaletteGreenForeground2": null,
    "--colorPaletteGreenForeground3": null,
    "--colorPaletteGreenBorderActive": null,
    "--colorPaletteGreenBorder1": null,
    "--colorPaletteGreenBorder2": null,
    "--colorPaletteDarkOrangeBackground1": null,
    "--colorPaletteDarkOrangeBackground2": null,
    "--colorPaletteDarkOrangeBackground3": null,
    "--colorPaletteDarkOrangeForeground1": null,
    "--colorPaletteDarkOrangeForeground2": null,
    "--colorPaletteDarkOrangeForeground3": null,
    "--colorPaletteDarkOrangeBorderActive": null,
    "--colorPaletteDarkOrangeBorder1": null,
    "--colorPaletteDarkOrangeBorder2": null,
    "--colorPaletteYellowBackground1": null,
    "--colorPaletteYellowBackground2": null,
    "--colorPaletteYellowBackground3": null,
    "--colorPaletteYellowForeground1": null,
    "--colorPaletteYellowForeground2": null,
    "--colorPaletteYellowForeground3": null,
    "--colorPaletteYellowBorderActive": null,
    "--colorPaletteYellowBorder1": null,
    "--colorPaletteYellowBorder2": null,
    "--colorPaletteBerryBackground1": null,
    "--colorPaletteBerryBackground2": null,
    "--colorPaletteBerryBackground3": null,
    "--colorPaletteBerryForeground1": null,
    "--colorPaletteBerryForeground2": null,
    "--colorPaletteBerryForeground3": null,
    "--colorPaletteBerryBorderActive": null,
    "--colorPaletteBerryBorder1": null,
    "--colorPaletteBerryBorder2": null,
    "--colorPaletteLightGreenBackground1": null,
    "--colorPaletteLightGreenBackground2": null,
    "--colorPaletteLightGreenBackground3": null,
    "--colorPaletteLightGreenForeground1": null,
    "--colorPaletteLightGreenForeground2": null,
    "--colorPaletteLightGreenForeground3": null,
    "--colorPaletteLightGreenBorderActive": null,
    "--colorPaletteLightGreenBorder1": null,
    "--colorPaletteLightGreenBorder2": null,
    "--colorPaletteMarigoldBackground1": null,
    "--colorPaletteMarigoldBackground2": null,
    "--colorPaletteMarigoldBackground3": null,
    "--colorPaletteMarigoldForeground1": null,
    "--colorPaletteMarigoldForeground2": null,
    "--colorPaletteMarigoldForeground3": null,
    "--colorPaletteMarigoldBorderActive": null,
    "--colorPaletteMarigoldBorder1": null,
    "--colorPaletteMarigoldBorder2": null,
    "--colorPaletteRedForegroundInverted": null,
    "--colorPaletteGreenForegroundInverted": null,
    "--colorPaletteYellowForegroundInverted": null,
    "--colorPaletteDarkRedBackground2": null,
    "--colorPaletteDarkRedForeground2": null,
    "--colorPaletteDarkRedBorderActive": null,
    "--colorPaletteCranberryBackground2": null,
    "--colorPaletteCranberryForeground2": null,
    "--colorPaletteCranberryBorderActive": null,
    "--colorPalettePumpkinBackground2": null,
    "--colorPalettePumpkinForeground2": null,
    "--colorPalettePumpkinBorderActive": null,
    "--colorPalettePeachBackground2": null,
    "--colorPalettePeachForeground2": null,
    "--colorPalettePeachBorderActive": null,
    "--colorPaletteGoldBackground2": null,
    "--colorPaletteGoldForeground2": null,
    "--colorPaletteGoldBorderActive": null,
    "--colorPaletteBrassBackground2": null,
    "--colorPaletteBrassForeground2": null,
    "--colorPaletteBrassBorderActive": null,
    "--colorPaletteBrownBackground2": null,
    "--colorPaletteBrownForeground2": null,
    "--colorPaletteBrownBorderActive": null,
    "--colorPaletteForestBackground2": null,
    "--colorPaletteForestForeground2": null,
    "--colorPaletteForestBorderActive": null,
    "--colorPaletteSeafoamBackground2": null,
    "--colorPaletteSeafoamForeground2": null,
    "--colorPaletteSeafoamBorderActive": null,
    "--colorPaletteDarkGreenBackground2": null,
    "--colorPaletteDarkGreenForeground2": null,
    "--colorPaletteDarkGreenBorderActive": null,
    "--colorPaletteLightTealBackground2": null,
    "--colorPaletteLightTealForeground2": null,
    "--colorPaletteLightTealBorderActive": null,
    "--colorPaletteTealBackground2": null,
    "--colorPaletteTealForeground2": null,
    "--colorPaletteTealBorderActive": null,
    "--colorPaletteSteelBackground2": null,
    "--colorPaletteSteelForeground2": null,
    "--colorPaletteSteelBorderActive": null,
    "--colorPaletteBlueBackground2": null,
    "--colorPaletteBlueForeground2": null,
    "--colorPaletteBlueBorderActive": null,
    "--colorPaletteRoyalBlueBackground2": null,
    "--colorPaletteRoyalBlueForeground2": null,
    "--colorPaletteRoyalBlueBorderActive": null,
    "--colorPaletteCornflowerBackground2": null,
    "--colorPaletteCornflowerForeground2": null,
    "--colorPaletteCornflowerBorderActive": null,
    "--colorPaletteNavyBackground2": null,
    "--colorPaletteNavyForeground2": null,
    "--colorPaletteNavyBorderActive": null,
    "--colorPaletteLavenderBackground2": null,
    "--colorPaletteLavenderForeground2": null,
    "--colorPaletteLavenderBorderActive": null,
    "--colorPalettePurpleBackground2": null,
    "--colorPalettePurpleForeground2": null,
    "--colorPalettePurpleBorderActive": null,
    "--colorPaletteGrapeBackground2": null,
    "--colorPaletteGrapeForeground2": null,
    "--colorPaletteGrapeBorderActive": null,
    "--colorPaletteLilacBackground2": null,
    "--colorPaletteLilacForeground2": null,
    "--colorPaletteLilacBorderActive": null,
    "--colorPalettePinkBackground2": null,
    "--colorPalettePinkForeground2": null,
    "--colorPalettePinkBorderActive": null,
    "--colorPaletteMagentaBackground2": null,
    "--colorPaletteMagentaForeground2": null,
    "--colorPaletteMagentaBorderActive": null,
    "--colorPalettePlumBackground2": null,
    "--colorPalettePlumForeground2": null,
    "--colorPalettePlumBorderActive": null,
    "--colorPaletteBeigeBackground2": null,
    "--colorPaletteBeigeForeground2": null,
    "--colorPaletteBeigeBorderActive": null,
    "--colorPaletteMinkBackground2": null,
    "--colorPaletteMinkForeground2": null,
    "--colorPaletteMinkBorderActive": null,
    "--colorPalettePlatinumBackground2": null,
    "--colorPalettePlatinumForeground2": null,
    "--colorPalettePlatinumBorderActive": null,
    "--colorPaletteAnchorBackground2": null,
    "--colorPaletteAnchorForeground2": null,
    "--colorPaletteAnchorBorderActive": null,
    "--colorStatusSuccessBackground1": null,
    "--colorStatusSuccessBackground2": null,
    "--colorStatusSuccessBackground3": null,
    "--colorStatusSuccessForeground1": null,
    "--colorStatusSuccessForeground2": null,
    "--colorStatusSuccessForeground3": null,
    "--colorStatusSuccessForegroundInverted": null,
    "--colorStatusSuccessBorderActive": null,
    "--colorStatusSuccessBorder1": null,
    "--colorStatusSuccessBorder2": null,
    "--colorStatusWarningBackground1": null,
    "--colorStatusWarningBackground2": null,
    "--colorStatusWarningBackground3": null,
    "--colorStatusWarningForeground1": null,
    "--colorStatusWarningForeground2": null,
    "--colorStatusWarningForeground3": null,
    "--colorStatusWarningForegroundInverted": null,
    "--colorStatusWarningBorderActive": null,
    "--colorStatusWarningBorder1": null,
    "--colorStatusWarningBorder2": null,
    "--colorStatusDangerBackground1": null,
    "--colorStatusDangerBackground2": null,
    "--colorStatusDangerBackground3": null,
    "--colorStatusDangerForeground1": null,
    "--colorStatusDangerForeground2": null,
    "--colorStatusDangerForeground3": null,
    "--colorStatusDangerForegroundInverted": null,
    "--colorStatusDangerBorderActive": null,
    "--colorStatusDangerBorder1": null,
    "--colorStatusDangerBorder2": null,
    "--colorStatusDangerBackground3Hover": null,
    "--colorStatusDangerBackground3Pressed": null,
    "--backgroundCanvas": "Top ribbon band in the 'Chat' tab",
    "--colorAvatar": null,
    "--colorAvatarBackground": null,
    "--colorDefaultBackground7": "Used for left panel in chat tab",
    "--colorTeamsBrand1Hover": null,
    "--colorTeamsBrand1Pressed": null,
    "--colorTeamsBrand1Selected": null,
    "--colorTeamsNeutralStrokeSubtleAlpha": null,
    "--colorPaletteRedForeground1HCBlack": null,
    "--colorPaletteRedBackground3Hover": null,
    "--colorPaletteRedBackground3Pressed": null,
    "--colorTeamsButtonCompositeHoverShadow1": "Shadow color when focused",
    "--colorTeamsButtonCompositeHoverShadow2": "Shadow color when focused",
    "--colorTeamsButtonCompositeHoverShadow3": "Shadow color when focused",
    "--colorTeamsButtonCompositeHoverShadow4": "Shadow color when focused",
    "--colorTeamsButtonCompositeFocusShadow1": "Shadow color when focused",
    "--colorTeamsButtonCompositeFocusShadow2": "Shadow color when focused",
    "--colorTeamsButtonCompositeFocusShadow3": "Shadow color when focused",
    "--colorTeamsButtonCompositeFocusShadow4": "Shadow color when focused",
    "--colorTeamsCompositeHoverShadow1": "Shadow color when hovered",
    "--colorTeamsCompositeHoverShadow2": "Shadow color when hovered",
    "--colorTeamsCompositeHoverShadow3": "Shadow color when hovered",
    "--colorTeamsCompositeHoverShadow4": "Shadow color when hovered",
    "--colorTeamsCompositeActiveShadow1": null,
    "--colorTeamsCompositeActiveShadow2": null,
    "--colorTeamsCompositeActiveShadow3": null,
    "--colorTeamsCompositeActiveShadow4": null
};
const aGROUP_DESCRIPTIONS = dGROUP_DESCRIPTIONS;


/***/ }),

/***/ "./src/dataManagement.ts":
/*!*******************************!*\
  !*** ./src/dataManagement.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DataManager: () => (/* binding */ DataManager),
/* harmony export */   ThemeKeysList: () => (/* binding */ ThemeKeysList)
/* harmony export */ });
/* harmony import */ var _shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shared */ "./src/shared.ts");
/* harmony import */ var _contribution_defaultThemes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contribution/defaultThemes */ "./src/contribution/defaultThemes.ts");


async function p_basicDataLoad(key) {
    const result = (await chrome.storage.local.get([key]))[key];
    if (result == null) {
        console.log("Nothing with basic key loaded: ", key);
        return;
    }
    console.log("loaded key");
    return result;
}
async function p_basicDataLoad2(key) {
    const result = (await chrome.storage.local.get([key]))[key];
    if (result == null) {
        console.log("Nothing with basic key loaded: ", key);
        return;
    }
    console.log("loaded key");
    return result;
}
function p_basicDataRepair(data, defaults) {
    //console.log(data);
    //console.log(defaults);
    if (data == undefined) {
        console.warn("Data is undefined. Returning defaults");
        return defaults;
    }
    if (data == null) {
        console.warn("Data is undefined. Returning defaults");
        return defaults;
    }
    data = JSON.parse(JSON.stringify(data));
    if (data == undefined) {
        console.warn("Data is undefined. Returning defaults");
        return defaults;
    }
    if (data == null) {
        console.warn("Data is undefined. Returning defaults");
        return defaults;
    }
    console.log("List: ", data);
    console.log("Defaults: ", defaults);
    const result = { ...defaults };
    for (const property in defaults) {
        if (data[property] !== undefined) {
            result[property] = data[property];
        }
        else {
            //console.log(`Property "${property}" missing/undefined, using default`, data[property], " where property is: ", property, " and data is: ", data);
            console.log("Property ", property, " is missing");
        }
    }
    return result;
}
const ThemeKeysList = ["colors", "classColors", "fonts", "pixelValues", "backgrounds", "emojis"];
const DEFAULT_DATA = {
    colors: _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_COLORS,
    classColors: _shared__WEBPACK_IMPORTED_MODULE_0__.CLASS_COLORS,
    fonts: _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_FONTS,
    pixelValues: _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_PIXEL_VALUES,
    backgrounds: _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_BACKGROUNDS,
    emojis: _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_EMOJIS
};
class DataManager {
    currentData = DEFAULT_DATA;
    currentThemes = _contribution_defaultThemes__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_THEMES;
    constructor() {
        console.log("Created new DataManager instance");
    }
    async loadAll() {
        await this.loadData();
        await this.loadThemes();
    }
    async loadData() {
        const data = await p_basicDataLoad("themeData");
        if (data == null) {
            console.warn("No data found, returning default data");
            return DEFAULT_DATA;
        }
        console.log(data);
        const repairedData = {
            colors: p_basicDataRepair(data["colors"], _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_COLORS),
            classColors: p_basicDataRepair(data["classColors"], _shared__WEBPACK_IMPORTED_MODULE_0__.CLASS_COLORS),
            fonts: p_basicDataRepair(data["fonts"], _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_FONTS),
            pixelValues: p_basicDataRepair(data["pixelValues"], _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_PIXEL_VALUES),
            backgrounds: p_basicDataRepair(data["backgrounds"], _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_BACKGROUNDS),
            emojis: p_basicDataRepair(data["emojis"], _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_EMOJIS)
        };
        this.currentData = repairedData;
        console.log("Loaded: ", repairedData);
        return repairedData;
    }
    async loadThemes() {
        const data = await p_basicDataLoad2("themes");
        if (data != null) {
            console.log("themes loaded: ", data);
            this.currentThemes = data;
            this.saveThemes();
            return data;
        }
        console.error("No themes loaded: ", data);
        return;
    }
    exportThemeData() {
        let newList = {};
        for (const propertyName of Object.keys(this.currentData)) {
            const propertyNameTyped = propertyName;
            const dataCurrent = this.currentData[propertyNameTyped];
            const dataDefault = DEFAULT_DATA[propertyNameTyped];
            newList[propertyName] = this.u_onlyExportChanged(dataCurrent, dataDefault);
        }
        return newList;
    }
    u_onlyExportChanged(currentData, defaultData) {
        let outputData = {};
        let numberChanged = 0;
        console.log("Data: ", defaultData);
        console.log("Current data: ", currentData);
        for (const property in defaultData) {
            const dataCurrent = currentData[property];
            const dataDefault = defaultData[property];
            if (dataCurrent != dataDefault) {
                outputData[property] = dataCurrent;
                numberChanged++;
            }
        }
        console.log("Exporting ", numberChanged, " attributes");
        return outputData;
    }
    saveThemes() {
        console.log("Save themes: ", this.currentThemes);
        chrome.storage.local.set({ "themes": this.currentThemes });
    }
    saveData() {
        console.log("Save: ", this.currentData);
        chrome.storage.local.set({ "themeData": this.currentData });
    }
    saveAll() {
        this.saveData();
    }
}


/***/ }),

/***/ "./src/games/gamble.ts":
/*!*****************************!*\
  !*** ./src/games/gamble.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GamblingGame: () => (/* binding */ GamblingGame)
/* harmony export */ });
/* harmony import */ var canvas_confetti__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! canvas-confetti */ "./node_modules/canvas-confetti/dist/confetti.module.mjs");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _soundEngine__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./soundEngine */ "./src/games/soundEngine.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../config */ "./src/config.ts");




const BUTTON_ELEMENT_HTML = `
<button id="gambleGameButton">Game</button>
`;
const GAMBLING_GAME_HTML = `
        <div class="window">
        <img class="window-background" src="assets/gamble_bg_normal.png">
        <div class="counters">
            <div class="counter-container" id="counter0">
                <div id="counter" class="counter" data-counter-id="0">
                    <img src="assets/digit0.png" alt="0" class="digit" data-number="0">
                    <img src="assets/digit1.png" alt="1" class="digit" data-number="1">
                    <img src="assets/digit2.png" alt="2" class="digit" data-number="2">
                    <img src="assets/digit3.png" alt="3" class="digit" data-number="3">
                    <img src="assets/digit4.png" alt="4" class="digit" data-number="4">
                    <img src="assets/digit5.png" alt="5" class="digit" data-number="5">
                    <img src="assets/digit6.png" alt="6" class="digit" data-number="6">
                    <img src="assets/digit7.png" alt="7" class="digit" data-number="7">
                    <img src="assets/digit8.png" alt="8" class="digit" data-number="8">
                    <img src="assets/digit9.png" alt="9" class="digit" data-number="9">
                </div>
            </div>
            <div class="counter-container "  id="counter1">
                <div id="counter " class="counter " data-counter-id="1">
                    <img src="assets/digit0.png" alt="0" class="digit" data-number="0">
                    <img src="assets/digit1.png" alt="1" class="digit" data-number="1">
                    <img src="assets/digit2.png" alt="2" class="digit" data-number="2">
                    <img src="assets/digit3.png" alt="3" class="digit" data-number="3">
                    <img src="assets/digit4.png" alt="4" class="digit" data-number="4">
                    <img src="assets/digit5.png" alt="5" class="digit" data-number="5">
                    <img src="assets/digit6.png" alt="6" class="digit" data-number="6">
                    <img src="assets/digit7.png" alt="7" class="digit" data-number="7">
                    <img src="assets/digit8.png" alt="8" class="digit" data-number="8">
                    <img src="assets/digit9.png" alt="9" class="digit" data-number="9">
                </div>
            </div>
            <div class="counter-container "  id="counter2">
                <div id="counter " class="counter " data-counter-id="2">
                    <img src="assets/digit0.png" alt="0" class="digit" data-number="0">
                    <img src="assets/digit1.png" alt="1" class="digit" data-number="1">
                    <img src="assets/digit2.png" alt="2" class="digit" data-number="2">
                    <img src="assets/digit3.png" alt="3" class="digit" data-number="3">
                    <img src="assets/digit4.png" alt="4" class="digit" data-number="4">
                    <img src="assets/digit5.png" alt="5" class="digit" data-number="5">
                    <img src="assets/digit6.png" alt="6" class="digit" data-number="6">
                    <img src="assets/digit7.png" alt="7" class="digit" data-number="7">
                    <img src="assets/digit8.png" alt="8" class="digit" data-number="8">
                    <img src="assets/digit9.png" alt="9" class="digit" data-number="9">
                </div>
            </div>
        </div>
        <button id="roll">Roll</button>
        <button id="gambling_login">Login</button>
        <img src="assets/gamble_handle.png" alt="" class="handle-img">

    </div>
`;
const GAMBLING_CLAIM_REWARD_HTML = `
    <div class="gamblingReward">
        <h3>You got money</h3>
        <p>Click below to get your $$$</p>
        <button type="button" class="gamblingClaimReward">Claim reward</button>
    </div>
`;
const DIGITS = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
];
const DigitToPicture = {
    0: "assets/digit0.png",
    1: "assets/digit1.png",
    2: "assets/digit2.png",
    3: "assets/digit3.png",
    4: "assets/digit4.png",
    5: "assets/digit5.png",
    6: "assets/digit6.png",
    7: "assets/digit7.png",
    8: "assets/digit8.png",
    9: "assets/digit9.png",
};
const BgPicture = "assets/digitBg.png";
class GamblingGame {
    windowElement;
    currentDigits;
    audio = new _soundEngine__WEBPACK_IMPORTED_MODULE_2__.Audio(new AudioContext());
    placeAudio = new _soundEngine__WEBPACK_IMPORTED_MODULE_2__.Audio(new AudioContext());
    loseAudio = new _soundEngine__WEBPACK_IMPORTED_MODULE_2__.Audio(new AudioContext());
    winAudio = new _soundEngine__WEBPACK_IMPORTED_MODULE_2__.Audio(new AudioContext());
    rolling = false;
    windowVisible = false;
    authProvider;
    noRewardPopupShown = false;
    constructor(authProvider) {
        // Initialize the variables
        this.currentDigits = {};
        this.authProvider = authProvider;
        // Create the fucking window
        this.windowElement = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.p_stringToElement)(GAMBLING_GAME_HTML);
        // Put the fucking window in the fucking body
        document.body.appendChild(this.windowElement);
        // Hide it
        this.windowVisiblity(this.windowVisible);
        this.p_fixImages();
        this.onLoad();
        this.p_injectButton();
        this.loginButtonRegister();
    }
    async p_fixImages() {
        for (let i = 0; i < 10; i++) {
            const selector = `[data-number="${i}"]`;
            const elements = this.windowElement.querySelectorAll(selector);
            for (const element of elements) {
                if (element instanceof HTMLImageElement) {
                    const url = chrome.runtime.getURL(DigitToPicture[i]);
                    console.log(`Fix url: ${url}`);
                    element.src = url;
                }
            }
        }
        //Backgrounds
        const backgrounds = this.windowElement.querySelectorAll(".counter");
        for (const element of backgrounds) {
            const url = chrome.runtime.getURL(BgPicture);
            console.log("Fix background on: ", element);
            element.style.backgroundImage = `url(${url})`;
        }
        // Window background
        const img = this.windowElement.querySelector(".window-background");
        const counters = this.windowElement.querySelector(".counters");
        img.src = chrome.runtime.getURL("assets/gamble_bg_normal.png");
        const img2 = this.windowElement.querySelector(".handle-img");
        img2.src = chrome.runtime.getURL("assets/gamble_handle.png");
    }
    async p_injectButton() {
        // Get the thing element and inject a poor button in it
        /*const buttonElement = await injectTab("Game", `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Icons" viewBox="0 0 32 32" xml:space="preserve" width="24px" height="24px" fill="var(--colorNeutralForeground3)">
<style type="text/css">
    .st0{fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
</style>
<g>
    <path d="M6,13H4c-0.6,0-1,0.4-1,1c0,0.5,0.4,0.9,0.8,1C3.3,15.9,3,16.9,3,18c0,0.6,0.4,1,1,1s1-0.4,1-1c0-1,0.4-2,1.1-2.7l0.6-0.6   C7,14.4,7.1,14,6.9,13.6C6.8,13.2,6.4,13,6,13z"/>
    <path d="M14,13h-2c-0.6,0-1,0.4-1,1c0,0.5,0.4,0.9,0.8,1c-0.5,0.9-0.8,1.9-0.8,3c0,0.6,0.4,1,1,1s1-0.4,1-1c0-1,0.4-2,1.1-2.7   l0.6-0.6c0.3-0.3,0.4-0.7,0.2-1.1C14.8,13.2,14.4,13,14,13z"/>
    <path d="M20,19c0.6,0,1-0.4,1-1c0-1,0.4-2,1.1-2.7l0.6-0.6c0.3-0.3,0.4-0.7,0.2-1.1C22.8,13.2,22.4,13,22,13h-2c-0.6,0-1,0.4-1,1   c0,0.5,0.4,0.9,0.8,1c-0.5,0.9-0.8,1.9-0.8,3C19,18.6,19.4,19,20,19z"/>
    <path d="M29,2c-1.7,0-3,1.3-3,3c0,1.3,0.8,2.4,2,2.8V18h-2v-7V9c0-3.9-3.1-7-7-7H7C3.1,2,0,5.1,0,9v2v10v8c0,0.6,0.4,1,1,1h24   c0.6,0,1-0.4,1-1v-8v-1h3c0.6,0,1-0.4,1-1V7.8c1.2-0.4,2-1.5,2-2.8C32,3.3,30.7,2,29,2z M10,12h6v8h-6V12z M2,12h6v8H2V12z M17,26   H9c-0.6,0-1-0.4-1-1s0.4-1,1-1h8c0.6,0,1,0.4,1,1S17.6,26,17,26z M24,20h-6v-8h6V20z"/>
</g>
</svg>`);*/
        const buttonElements = await window.teamsPlusAppsManager.addAppAndGetButton("Fun Minigame", "https://www.svgrepo.com/show/402695/slot-machine.svg");
        buttonElements.forEach((buttonElement) => {
            buttonElement.addEventListener("click", () => {
                if (this.windowVisible == true) {
                    this.windowVisible = false;
                    this.windowVisiblity(false);
                }
                else if (this.windowVisible == false) {
                    this.windowVisible = true;
                    this.windowVisiblity(true);
                }
            });
        });
        console.log("Injected button");
    }
    loginButtonRegister() {
        const button = this.windowElement.querySelector("#gambling_login");
        if (button) {
            if (this.authProvider.currentToken != null) {
                button.remove();
                return;
            }
            ;
            button.addEventListener("click", async () => {
                if (this.authProvider.currentToken != null) {
                    button.remove();
                    return;
                }
                await this.authProvider.getToken();
                button.remove();
            });
        }
    }
    loginButtonUpdate() {
        const button = this.windowElement.querySelector("#gambling_login");
        if (button) {
            if (this.authProvider.currentToken != null) {
                button.remove();
                return;
            }
        }
    }
    windowVisiblity(state) {
        if (state == true) {
            this.windowElement.style.display = "block";
            this.windowElement.style.opacity = "0";
            this.loginButtonUpdate();
            this.windowElement.animate([
                { opacity: "0", filter: "blur(10px)" },
                { opacity: "1", filter: "blur(0px)" }
            ], {
                duration: 1000,
                easing: "ease-out",
                iterations: 1,
                fill: "forwards"
            });
        }
        else if (state == false) {
            this.windowElement.animate([
                { opacity: "1", filter: "blur(0px)" },
                { opacity: "0", filter: "blur(10px)" }
            ], {
                duration: 1000,
                easing: "ease-in",
                iterations: 1,
                fill: "forwards"
            });
            setTimeout(() => {
                this.windowElement.style.display = "none";
            }, 1000);
        }
        else {
            throw new Error(`Unknown window visibility state: ${state}`);
        }
    }
    hideDigits(counterElement) {
        for (const i of DIGITS) {
            const numberElement = counterElement.querySelector(`[data-number="${i}"]`);
            if (numberElement) {
                numberElement.style.display = "none";
            }
            else {
                console.error("Number ", i, "not found");
            }
        }
    }
    countUp(counterElement, digitId, DIGIT_ANIMATION_TIME, state) {
        return new Promise((resolve) => {
            this.currentDigits[digitId] += 1;
            if (this.currentDigits[digitId] > DIGITS.length - 1) {
                this.currentDigits[digitId] = 0;
            }
            let lastDigit = this.currentDigits[digitId] - 1;
            if (this.currentDigits[digitId] === 0) {
                lastDigit = DIGITS.length - 1;
            }
            this.hideDigits(counterElement);
            const lastElement = counterElement.querySelector(`[data-number="${DIGITS[lastDigit]}"]`);
            const currentElement = counterElement.querySelector(`[data-number="${DIGITS[this.currentDigits[digitId]]}"]`);
            if (!currentElement || !lastElement) {
                console.error("Elements not found: ", DIGITS[lastDigit], DIGITS[this.currentDigits[digitId]]);
                console.error(lastDigit, this.currentDigits[digitId]);
                resolve();
                return;
            }
            currentElement.style.zIndex = "1";
            lastElement.style.zIndex = "0";
            currentElement.style.display = "flex";
            lastElement.style.display = "flex";
            let easingStyle = 'linear';
            if (state == 0) {
                console.log("Set ease in");
                easingStyle = 'ease-in';
            }
            else if (state == 1) {
                console.log("Set ease out");
                easingStyle = 'ease-out';
            }
            console.log("Easing style: ", easingStyle);
            const currentAnimation = currentElement.animate([
                { transform: 'translateY(100%)' },
                { transform: 'translateY(-50%)' }
            ], {
                duration: DIGIT_ANIMATION_TIME,
                fill: 'forwards',
                easing: easingStyle
            });
            const lastAnimation = lastElement.animate([
                { transform: 'translateY(-50%)' },
                { transform: 'translateY(-150%)' }
            ], {
                duration: DIGIT_ANIMATION_TIME,
                fill: 'forwards',
                easing: easingStyle
            });
            this.audio.playSound(.1);
            Promise.all([currentAnimation.finished, lastAnimation.finished]).then(() => {
                lastElement.style.display = "none";
                resolve();
            });
        });
    }
    sharpEase(t) {
        return Math.sin(t * Math.PI) ** 0.2;
    }
    waitTimeCalc(i, x) {
        return Math.max((1 - this.sharpEase(x / i)), 0.06);
    }
    async countBy(i, digitId, counterElement) {
        let digitAnimTime = 2000;
        for (let x = 0; x < i; x++) {
            let ease;
            if (x == 0) {
                console.log("Ease in");
                ease = 0;
            }
            if (x == i - 1) {
                console.log("Ease out");
                ease = 1;
            }
            const animationTime = this.waitTimeCalc(i, x) * digitAnimTime;
            console.log("Animation time: ", animationTime);
            await this.countUp(counterElement, digitId, animationTime, ease);
        }
        this.placeAudio.playSound(0.5);
    }
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    confettiFireworks() {
        var duration = 15 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }
        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            var particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            (0,canvas_confetti__WEBPACK_IMPORTED_MODULE_0__["default"])({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            (0,canvas_confetti__WEBPACK_IMPORTED_MODULE_0__["default"])({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }
    confettiSides() {
        var end = Date.now() + (15 * 1000);
        // go Buckeyes!
        var colors = ['#bb0000', '#ffffff'];
        (function frame() {
            (0,canvas_confetti__WEBPACK_IMPORTED_MODULE_0__["default"])({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            (0,canvas_confetti__WEBPACK_IMPORTED_MODULE_0__["default"])({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
    shuffleArray(arr) {
        let shuffledArray = arr.slice(); // Create a copy of the array to avoid mutating the original
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
        }
        return shuffledArray;
    }
    generateRandomOrder(x) {
        const numbers = Array.from({ length: x + 1 }, (_, index) => index); // Create array [0, 1, ..., x]
        return this.shuffleArray(numbers);
    }
    randomizeFunction() {
        const shouldTryTrickChance = 50;
        const trickChance = 70;
        const numDigits = 3;
        const spinOrder = this.generateRandomOrder(numDigits - 1);
        console.log(spinOrder);
        if (this.getRandomInt(1, 100) <= shouldTryTrickChance) {
            if (this.getRandomInt(1, 100) <= trickChance) {
                console.log("Trick");
                let returnValue = [];
                const target = this.getRandomInt(1, DIGITS.length);
                for (const i of spinOrder) {
                    const currentDigit = this.currentDigits[i] + 1;
                    const amountToAdd = DIGITS.length - (currentDigit - target);
                    if (Number.isNaN(amountToAdd)) {
                        console.error(this.currentDigits);
                        throw new Error(`Amount to add is NaN: 
                        i: ${i},
                        currentDigit: ${currentDigit},
                        target: ${target}
                            `);
                    }
                    console.log("Amount to add: ", amountToAdd);
                    console.log("For: ", i);
                    if (i == numDigits - 1) {
                        const b = this.getRandomInt(1, 3);
                        if (b == 1) {
                            returnValue.push(amountToAdd + 1);
                        }
                        else if (b == 2) {
                            returnValue.push(amountToAdd + -1);
                        }
                        else {
                            console.error("Randomizer chose: ", b);
                            returnValue.push(amountToAdd + -1);
                        }
                    }
                    else {
                        returnValue.push(amountToAdd);
                    }
                }
                return {
                    values: returnValue,
                    order: spinOrder
                };
                //return returnValue;
            }
            else {
                console.log("All three should be the same");
                let returnValue = [];
                const target = this.getRandomInt(1, DIGITS.length);
                for (const i of spinOrder) {
                    const currentDigit = this.currentDigits[i] + 1;
                    const amountToAdd = DIGITS.length - (currentDigit - target);
                    console.log("Amount to add: ", amountToAdd);
                    returnValue.push(amountToAdd);
                }
                return {
                    values: returnValue,
                    order: spinOrder
                };
            }
        }
        else {
            let returnValue = [];
            for (let i = 0; i < numDigits; i++) {
                returnValue.push(this.getRandomInt(1, DIGITS.length));
            }
            return {
                values: returnValue,
                order: spinOrder
            };
        }
    }
    async countTo(digits, isTricked) {
        const tasks = [];
        const a = 70;
        const trickedK = isTricked ? 10 : 1;
        for (let i = 0; i < digits.length; i++) {
            let digitDelay = digits[i][1] * 2 * trickedK;
            if (digits[i][1] == 2) {
                digitDelay = digits[i][1] * 4 * trickedK;
            }
            const offset = (digits[i][0] - (this.currentDigits[i] + (digitDelay + a))) % 10;
            const shuffleAmount = (digitDelay + a) + offset;
            const task = this.countBy(shuffleAmount, i, this.windowElement.querySelector(`[data-counter-id="${i}"]`));
            tasks.push(task);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await Promise.all(tasks);
    }
    async shuffle() {
        if (this.rolling == true)
            return;
        this.rolling = true;
        // Get the API request
        let token = this.authProvider.currentToken;
        if (token == null && this.noRewardPopupShown == false) {
            alert("Note: You will not receive any reward from winning when you are not logged in. This message will not show again in this session.");
            this.noRewardPopupShown = true;
        }
        const img = this.windowElement.querySelector(".window-background");
        img.src = chrome.runtime.getURL("assets/gamble_bg_normal.png");
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${_config__WEBPACK_IMPORTED_MODULE_3__.API_ENDPOINT}/api/v1/fun_minigame/game_next`, {
            method: 'GET',
            headers: headers,
        }).then(res => {
            if (res.status != 200)
                throw new Error("Response not successfull");
            return res.json();
        });
        const responseData = response.data;
        if (!responseData)
            throw new Error("Bad response");
        const digits = responseData.digits;
        const winToken = responseData.winToken;
        const isTricked = responseData.isTricked;
        if (!digits || isTricked == null || winToken == null)
            throw new Error("Bad response");
        await this.countTo(digits, isTricked);
        console.log("All digits finished counting.");
        if (!(digits[0][0] == digits[1][0] && digits[1][0] == digits[2][0])) {
            this.loseAudio.playSound(.2);
            console.log("LOSE");
            //confetti();
            //confettiSides();
            //confettiFireworks();
        }
        else {
            console.log("WIN!");
            const img = this.windowElement.querySelector(".window-background");
            img.src = chrome.runtime.getURL("assets/gamble_bg_win.png");
            this.winAudio.playSound(1);
            (0,canvas_confetti__WEBPACK_IMPORTED_MODULE_0__["default"])();
            this.confettiSides();
            this.confettiFireworks();
            // Create claim reward window
            if (winToken != "") {
                const element = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.p_stringToElement)(GAMBLING_CLAIM_REWARD_HTML);
                document.body.appendChild(element);
                const claimRewardButton = element.querySelector("button");
                if (claimRewardButton) {
                    claimRewardButton.addEventListener("click", async () => {
                        fetch(`${_config__WEBPACK_IMPORTED_MODULE_3__.API_ENDPOINT}/api/v1/fun_minigame/redeem_token`, {
                            method: 'POST',
                            body: JSON.stringify({
                                rewardToken: winToken
                            }),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            }
                        })
                            .then(res => {
                            if (res.status != 200)
                                throw new Error("Failed to redeem token");
                            alert(`Successfully redeemed token!`);
                        }).catch(err => {
                            alert(`Failed to redeem token: ${err}`);
                        }).finally(() => {
                            element.remove();
                        });
                    });
                }
            }
        }
        this.rolling = false;
    }
    init() {
        this.audio.loadSound("sounds/gamble/beep.wav");
        this.placeAudio.loadSound("sounds/gamble/boom.mp3");
        this.loseAudio.loadSound("sounds/gamble/lost.mp3");
        this.winAudio.loadSound("sounds/gamble/win.mp3");
        const numDigits = 3;
        for (let i = 0; i < numDigits; i++) {
            this.currentDigits[i] = 0;
        }
    }
    async onLoad() {
        this.init();
        const btn = this.windowElement.querySelector("#roll");
        if (btn) {
            btn.addEventListener("click", async () => {
                try {
                    await this.shuffle();
                }
                catch (e) {
                    console.error(e);
                    alert(`An error occured while trying to connect to the server: ${e}`);
                }
            });
        }
        else {
            throw new Error("Roll button is null");
        }
    }
}


/***/ }),

/***/ "./src/games/snake.ts":
/*!****************************!*\
  !*** ./src/games/snake.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SnakeGame: () => (/* binding */ SnakeGame)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _snake_game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./snake/game */ "./src/games/snake/game.ts");


const SNAKE_GAME_HTML = `
    <div class="snake">
        <button type="button">Close</button>
        <div class="containement">
        <canvas id="game"></canvas>
    <div class="information" id="info">
        <h1>TeamsPlus <s style="color:rgba(255,255, 255,0.3);font-size: small;">gambling</s> snake game - Temporary
            settings menu</h1>
        <p>Game size</p><button id="small">SMall</button> <button id="medium">Medium</button> <button
            id="large">Large</button> <button id="largest">Largest</button>
        <p>Impossible difficulty (double snakes)</p>
        <p>Control one with arrow keys, control the other with WSAD.</p><input type="checkbox" name=""
            id="double-snakes"><br>
        <p>Number of apples</p><input type="range" name="" id="apples" min="1" max="10" value="1"><br><button
            id="begin">Begin</button>
    </div>
    <div class="score"><span id="score">Score: 0</span></div>
        </div>
    </div>
`;
const SNAKE_TAB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="24px" width="24px" version="1.1" id="_x32_" viewBox="0 0 512 512" xml:space="preserve" fill="var(--colorNeutralForeground3)">
<style type="text/css">
	.st0{fill:var(--colorNeutralForeground3);}
</style>
<g>
	<path class="st0" d="M506.705,405.481C509.495,406.787,503.595,403.971,506.705,405.481L506.705,405.481z"/>
	<path class="st0" d="M506.705,405.481c-5.599-2.719-21.469,17.541-24.916,20.58c-10.414,9.197-23.086,17.63-37.393,18.465   c-33.091,1.928-45.372-33.918-54.578-58.745c-21.611-57.857-68.085-116.461-137.378-83.111   c-29.2,14.058-47.718,41.782-64.05,68.609c-10.362,16.99-26.374,54.605-49.94,56.186c-29.928,2.008-47.914-27.272-45.088-54.365   c3.199-30.701,27.333-52.828,49.086-72.164c45.675-40.591,93.161-73.026,107.592-135.716   c14.751-64.139-16.012-132.446-80.702-153.195c-23.94-7.669-63.837-28.942-102.421,14.315c-65.97,73.932-10.006,66.645,9.846,65.97   c66.734-2.275,95.08,10.281,85.696,45.506c-3.038,11.374-9.81,23.024-16.474,31.128c-4.266,5.545-22.802,22.996-31.012,30.132   c-18.714,16.27-37.676,32.354-54.898,50.224C28.033,282.525,4.307,322.761,2.761,369.972   C-0.225,460.627,96.419,548.2,184.924,496.679c41.782-24.322,56.71-71.16,79.903-110.534c9.668-16.431,27.564-37.801,47.789-21.212   c16.776,13.845,25.344,37.384,35.544,55.964c19.55,35.597,53.05,68.218,97.551,59.341c21.362-4.265,39.294-18.607,50.687-36.841   C499.277,438.777,515.538,409.613,506.705,405.481z"/>
</g>
</svg>`;
class SnakeGame {
    isVisible = false;
    snakeGame;
    window;
    constructor() {
        this.window = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(SNAKE_GAME_HTML);
        this.window.style.display = "none";
        document.body.appendChild(this.window);
        // Inject the bundle
        this.asyncInit();
    }
    async asyncInit() {
        try {
            const gameEl = await (async () => { while (!document.querySelector("#game"))
                await new Promise(r => setTimeout(r, 50)); return document.querySelector("#game"); })();
            this.snakeGame = new _snake_game__WEBPACK_IMPORTED_MODULE_1__.Game();
            this.snakeGame.setVisibility(false);
        }
        catch (e) {
            console.error("Failed to create an instance of SnakeGame: ", e);
        }
        //const buttonElement = await (injectTab("Snake", SNAKE_TAB_SVG)) as HTMLButtonElement;
        const buttonElements = await window.teamsPlusAppsManager.addAppAndGetButton("Snake", "https://www.svgrepo.com/show/296787/snake.svg");
        buttonElements.forEach(buttonElement => {
            buttonElement.addEventListener("click", () => {
                this.isVisible = !this.isVisible;
                if (this.isVisible) {
                    this.window.style.display = "block";
                    this.snakeGame.setVisibility(true);
                    const iframe = this.window.querySelector("iframe");
                    iframe.src = chrome.runtime.getURL("pages/snake/index.html");
                }
                else {
                    this.window.style.display = "none";
                    this.snakeGame.setVisibility(false);
                }
            });
        });
    }
}


/***/ }),

/***/ "./src/games/snake/assets/food.png":
/*!*****************************************!*\
  !*** ./src/games/snake/assets/food.png ***!
  \*****************************************/
/***/ ((module) => {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsSAAALEgHS3X78AAACKklEQVRYhe2YMU/bQBTH/25JhbrYDIwII+SZILp0ilkSMgGfAPINInWP+AiBLwD5AKhsljzB2qVEYiIgLMGCYLhMlQqVqysPYUzsO/vuRFTlLznDvcu7X967e/ccK45jjLM+jDXdBFCDjAJ2GvZRp2FXVXwYA+w0bB/AOoCfnYa9kbY7oVt1QtcR+ZkyBcgZ3gyE7jYAnx4uYXRNAj4vPtz7NoO90I0AzCfsq6weMZETk4Au/7if/XgG4HvKtsvq0bGME5OH5B/gj6/Ty6nxPqtHbVknShEcNB0O8byvaklbBcCvihVfeJ8+J4Z3AewUWaMUIIHxhbay5jwAuFqsWLXLB6zcPOLL9eOhd/en6wVMuO+SKnwXD5oOLxkHAOysObcxEMYxfMvCnPXKNATQ9gJ2YARw0HR4OvdF834DuI6BRStzSksWUhqQIpc+jSra9AJ2pAWQ9txpXlpLiKe76gUsyvuqbJnZ0QwH8ic80cIIUvSudJKltJAXRZkIbpsiI+UWbRlAX2KOinL9ywDWJOaoaEkV8F01FoCDppOZ5rEA9AKW2Xr9Fyk+MczQzzPKAJ7qYxmp3M5aBrBrjk3sXwhI11BPK9KLejqbhaFGMJA/YbMgBUi/Uved3BZFD0XKDDWXLWWsJ0l31IXqIDltKaR7WAQOZQo1Oa+WODg96qCl4VDmrS4pambb1DKN6kr6VOe6MvttpDigzud8zfZ1+pv8R62qCaCSAPwF+ckaGyeX8ZQAAAAASUVORK5CYII=";

/***/ }),

/***/ "./src/games/snake/assets/head_down.png":
/*!**********************************************!*\
  !*** ./src/games/snake/assets/head_down.png ***!
  \**********************************************/
/***/ ((module) => {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsSAAALEgHS3X78AAACWklEQVRYhe2YP0/bQBiHf4HowHQgqKoKUqV0zYbowkY+QrsWfwAGBjLjoYM700gMXbp5h7EjLIgFVKasRKpEKoaAWtXEonX1mjtzjXPmcraxkPJIGe5P3veJc3fvJZUwDDGM7QTJzkfAc1llOMtUGSLjMBHMytMTtJ1gqxyV0bnjXWw7QR3AMYDFMuQkegBWPZd1Y0Eu1wFglSwn8AE0SLLKO45lOWsGWFv5i3fNP1F772Aah6dT8Af5ZNeIb3Gnpcr69oC+9x0x8mIhhLtxOzKw87mKy37iLB2LMeO3aJNsyp9M9WaCxmiOKQbxN0mwLlr02B9CZ44Kg/h1EhTrMF4TaejMUWEQv1pVTfz45RKd87tV+6ZhofX+ubFYlvj0BONFQbuJ+Hr0K34zcdLxoz55jgkG8W9JsCtatNWJ3zfJtdLtBf/NMcEgfpdau6JF5xBt9bnZpER9kUVjWc5Cg/i7opJcyCXOmgkxy67x/Uc/ar96uYCboJbjQa0Vv+e5bElsklW51PmDCvxBDc/matFg/2c+YgKN+D53urvN8MLc4IW6bHqiDkO+zQj4lWenJMmW57JPcsfkR1NWJoJZmQhmRSV4XYLLyJwqwW/FuujnVAnuF+uin/NpCnouO6erWeFK9xzynAnSdvFj/gWizKUU9FxGi7ZdmNI9bZ5rJA+dgx8AnBUod8ZzKEkV9Fx2BaBZkCTFbPIcZoIoTlJLDrqlTpLMY022deWgurCmYTvBMgC69a6NKUbH1lbahshFUGA7wWsAb/mLpOeHplBtJRk6gPdV51wqAP4Bq4oVsts6YbQAAAAASUVORK5CYII=";

/***/ }),

/***/ "./src/games/snake/assets/head_left.png":
/*!**********************************************!*\
  !*** ./src/games/snake/assets/head_left.png ***!
  \**********************************************/
/***/ ((module) => {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsSAAALEgHS3X78AAACeUlEQVRYhe2ZP2/TQBiHfwnBxQhESlUBE6xZoJQlQpXaMWxlBX8ABiTSGQ8MnqFIDHwAz9CxU5VKqO1S/i0doRISRR1iECLUSmP0lnM4p2ffOTm3V4lHymD7nHt8vntz75tSFEUoCscNmwAeArgKoMK66QLYBvDC96xFWdeFCDpuSEIbAC5Lmu4AqPuetX1kgkxuC4CteEsHQC1NsiI6OSIbvJw9BsxO93B3bv/g+HXrFFbfltHZ63dis3uuiLrVOoJszj2LjyfHI3gPusK27ssKdtsl/tSCaE4qCTpueA3APPtMAbggu8cei9CoB/j1u4ezZ8po3D53qE3z6Wl+JIVkCjpuSDL0VLPSpxhg/HyAL9/a/ZO3ajYW7k0kGtHrXl4vZ36PcA46blgF8ATAo7xiMbwcsbnVwW7QxWT1X5c0L3MLMrkWgBvDyqXBy6mS0Ncpd2kiOU3pFQ9Cr1hG/5F0j9x+7yKcO6XMRULhRlmQzTltr5VW55uP1cwwI1vBiFcxW63vdMnxKARqJcHWMKHkKCjdf7xHQfiTiXJgq3jeAI9UToTglAEeqZRVfviPE3mk/C+YzYkQ/G6ARyok+N5QtwNIcMkAj1TMF/Q96zNtzQxwERLvB5tGb7fwd0e9OEqSJCJnXiyEj4O0o/6gS47y4pnrAV6t/MDy2s9D10mcRldGIi/WmZfoyosTV33PCgDM6RjJtLyYJ56XyoIDks9HlRxk5Lw4hiR9z6KVfXPYEKQrLy6weAQ06u1ii0d5ObbyWx4cN/zKl34VA/WO71nCAmYRFdY6XwImEQolGeGkw+4Ron3DymrNNVYgl0FtUuvThNl/QwD4AwphHynh/q+DAAAAAElFTkSuQmCC";

/***/ }),

/***/ "./src/games/snake/assets/head_right.png":
/*!***********************************************!*\
  !*** ./src/games/snake/assets/head_right.png ***!
  \***********************************************/
/***/ ((module) => {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsSAAALEgHS3X78AAACUUlEQVRYhe2Zv2/TQBSAv4TIJQhBMyBAQgLGLPyaCkJqxNQRWMkfwIBEYMUDg/emEgPsFiN0zNggBFkogaUrlZAoQihUoJqE0qAXOcGxHN/VuSYe8klWdI59/vLsO997yXS7XVSU7U4FuAecBXL+4bvAJvDEdayqspOExAqW7Y4INYBTiu63gAXXsTYnJujLbQB5zb48oGhaMhfzXSMol5+DxSt73Cr97bVfrh2ivp7Faw+Oz/vnnDYpGBlB/5lb7rdPFLo4d3cjO7Cf5vjWygR3PTD5TGbuPGrHjhKJXPXhn6F9O7/3eLW+0/s8cjhLrVEIRjKObaAJrMrmOtansQWXrv6/rX2Wn3/n3YY3aJ85WaD1c17LMEQdqLiO1Rx1QFbVQ1hOCMoJn7+2ksgJi8D7st2plu1O5C9UCk6I+8BalKRSUEZrmOK5uaE9cosNcDFKMtEgEWpvfiUZJDp8AEquY/1AJ4JyYZlKwixdO8rtG8d4/XHepBx+JB/3G8oI9tGYqE1zWUZ33JtkCBGpvc32tgkhk31JO4JT4nxapplR3JwJjsmltAseT7tgat7FI5kJjsl22gWbaRdcnQmOQV2SKu3VzBSWW5L66q0H95kXm2DFdayeoDKCErmwXDAvvn7hQJb8gxW1UlBua5hnL1qhvDiD106UF0fJDfIRUpAXx8ppCU6IlSg5LcEDzovrfnJUiZJjCnnx/otHqS+/xVRYvwRLv5oT9ZbrWEYLmHHTzEKwBKyRF3v+OUYZeTW/1lz0C+Qq5Bjj9Wkh3X9DAP8AE6su5f4dqmsAAAAASUVORK5CYII=";

/***/ }),

/***/ "./src/games/snake/assets/head_up.png":
/*!********************************************!*\
  !*** ./src/games/snake/assets/head_up.png ***!
  \********************************************/
/***/ ((module) => {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsSAAALEgHS3X78AAACYklEQVRYhe2YPU/bQBjH/3mRSxBSiSoEkSqFjpnCy1J14G3qmFadkD8AAxJhrTxk8A5IDHwAz20/QRUmmHhbWJBopqYDFUEqBCuQ6nHvUsexY/suxq2Uv2QlFz/3f34+393jONFutyEiVTOnAZTYMQPgucOmAeAEwBc6DF35JpInNKCqmQSzDWAxZK59AGVDV04iAVQ1cxxABcBGSDCndsjH0JXrgQEyuCqAoiQc1ymApSCQyRjgwLyqzLuv+gJGBBcK0m8EKxHBcRVZDk95zkG2Wo8jhLNr1mt19xvB7cixAuRyHUG2CV9GTeXQK7fN3GsES09J1i/nfws4Ey1L8JxegM7C/xRyzelbSeLWEFBWQ0BZ9QCqmlmOC8Ytd6fUqZqZB3AIYCoOOJvqAF4bulLrADK4cwCZmOG47gAUCDLNfji0w2WeAankT/y4aljtl5NZNM1x3N0PJnsA/wxjyqUuWh/pvn/gZyaybazMX+PgrNGJvvnVxPtl4OpmBLfNhBRcCP+xT18fGrRI1u1Xpq+1cNt87DGu1U3rHMWISsB/nQDzvLU496fj6Ejv7pOfUrpiRCTgn6dIPg/xbunB+lyYG8V84e96oe9v34x1xYhIwD+ddstDV7i5+kIYxE9h/GkEW7zxuZry7RAkRqavI6ZFgDXe2j/yr3xBYmT6OmJq1NrlLdqHtD3Xu26JzsnshQL+u7ySfLeXOFrqtJr4hKVhpysb5EYdwL9u6Eruny911g1nhbnACnXcqnM4uP1xZ488WzFBbhq60vWWwevNgth7YUkZutJT6IeP/LIaAkoJwG/mlAbwfxLuDwAAAABJRU5ErkJggg==";

/***/ }),

/***/ "./src/games/snake/config.ts":
/*!***********************************!*\
  !*** ./src/games/snake/config.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CELL_HEIGHT: () => (/* binding */ CELL_HEIGHT),
/* harmony export */   CELL_WIDTH: () => (/* binding */ CELL_WIDTH),
/* harmony export */   FPS: () => (/* binding */ FPS),
/* harmony export */   FramesPerCell: () => (/* binding */ FramesPerCell),
/* harmony export */   MOVEMENT_SPEED: () => (/* binding */ MOVEMENT_SPEED),
/* harmony export */   SUBDIVISIONS: () => (/* binding */ SUBDIVISIONS),
/* harmony export */   TURN_REJECT_THRESHOLD: () => (/* binding */ TURN_REJECT_THRESHOLD)
/* harmony export */ });
const CELL_WIDTH = 40;
const CELL_HEIGHT = 40;
const TURN_REJECT_THRESHOLD = 0.2;
const FPS = 60;
const MOVEMENT_SPEED = 0.1 * FPS;
const SUBDIVISIONS = 10;
const FramesPerCell = 1 / (MOVEMENT_SPEED / FPS);


/***/ }),

/***/ "./src/games/snake/game.ts":
/*!*********************************!*\
  !*** ./src/games/snake/game.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Game: () => (/* binding */ Game)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./src/games/snake/config.ts");
/* harmony import */ var _snake__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./snake */ "./src/games/snake/snake.ts");
/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vec2 */ "./src/games/snake/vec2.ts");
/* harmony import */ var _assets_food_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./assets/food.png */ "./src/games/snake/assets/food.png");




class Game {
    doubleSnakes = false;
    foods = [];
    snakes = [];
    nextGameDoubleSnakes = false;
    numberOfFoods = 1;
    gameStarted = false;
    isVisible = false;
    lastTime = Date.now();
    deltaTime = 1 / 60;
    canvas = document.querySelector("#game");
    areaX = this.canvas.width / _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH;
    areaY = this.canvas.height / _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT;
    ctx = this.canvas.getContext("2d");
    FoodImage = new Image();
    constructor() {
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        this.FoodImage.src = _assets_food_png__WEBPACK_IMPORTED_MODULE_3__;
        this.foodCallback = this.foodCallback.bind(this);
        this.lostCallback = this.lostCallback.bind(this);
        // FOCUS!@!
        const enforceFocus = () => {
            if (document.activeElement != this.canvas) {
                this.canvas.focus();
            }
        };
        this.canvas.addEventListener("blur", () => {
            if (this.gameStarted == false)
                return;
            setTimeout(enforceFocus, 0);
        });
        this.initialize();
        this.gameStartedEvent();
        this.resetGame();
        this.showWindow();
        window.onresize = () => {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.areaX = this.canvas.width / _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH;
            this.areaY = this.canvas.height / _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT;
        };
    }
    nextGameDoubleSnakesSet(v) {
        this.nextGameDoubleSnakes = v;
    }
    createFood() {
        while (this.foods.length < this.numberOfFoods) {
            let valid = false;
            let attempts = 0;
            while (!valid) {
                console.log("Attempt to place food...");
                const position = new _vec2__WEBPACK_IMPORTED_MODULE_2__.Vector2(Math.floor(Math.random() * (this.areaX - 2)) + 1, Math.floor(Math.random() * (this.areaY - 2)) + 1);
                console.log("Placed at: ", position);
                const exists = this.foods.some(f => f.equals(position));
                if (exists) {
                    continue;
                }
                this.foods.push(position);
                valid = true;
                attempts += 1;
                if (attempts > 100) {
                    console.warn("Too many attempts exhausted; giving up");
                    for (const snake of this.snakes) {
                        snake.updateFoodPositions(this.foods);
                    }
                    return;
                }
            }
        }
        for (const snake of this.snakes) {
            snake.updateFoodPositions(this.foods);
        }
    }
    gameStartedEvent() {
        document.addEventListener("keydown", () => {
            const win = document.querySelector("#info");
            if (!win)
                return;
            if (win.style.display != "none")
                return;
            this.gameStarted = true;
            for (const snake of this.snakes) {
                snake.setGameStarted(true);
            }
        });
    }
    updateScore() {
        let totalLength = 0;
        for (const snake of this.snakes) {
            totalLength += snake.getPoints().length / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS;
        }
        const a = document.querySelector("#score");
        if (!a)
            return;
        a.textContent = `Score: ${totalLength}`;
    }
    drawGrid() {
        for (let x = 0; x < this.areaX; x++) {
            for (let y = 0; y < this.areaY; y++) {
                if (y % 2 == 0) {
                    if (x % 2 == 0) {
                        this.ctx.fillStyle = "#E7E7E8";
                        this.ctx.fillRect(x * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH, y * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT, _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH, _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT);
                    }
                    else {
                        this.ctx.fillStyle = "#D4D4D4";
                        this.ctx.fillRect(x * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH, y * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT, _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH, _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT);
                    }
                }
                else {
                    if (x % 2 == 1) {
                        this.ctx.fillStyle = "#E7E7E8";
                        this.ctx.fillRect(x * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH, y * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT, _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH, _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT);
                    }
                    else {
                        this.ctx.fillStyle = "#D4D4D4";
                        this.ctx.fillRect(x * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH, y * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT, _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH, _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT);
                    }
                }
            }
        }
    }
    createSnakes() {
        this.doubleSnakes = this.nextGameDoubleSnakes;
        if (this.doubleSnakes) {
            this.snakes = [
                new _snake__WEBPACK_IMPORTED_MODULE_1__.Snake(new _vec2__WEBPACK_IMPORTED_MODULE_2__.Vector2(Math.round(this.areaX / 2), Math.round(this.areaY / 2)), new _vec2__WEBPACK_IMPORTED_MODULE_2__.Vector2(0, -1), 4, this.areaX, this.areaY, this.foodCallback, this.lostCallback),
                new _snake__WEBPACK_IMPORTED_MODULE_1__.Snake(new _vec2__WEBPACK_IMPORTED_MODULE_2__.Vector2(Math.round(this.areaX / 3), Math.round(this.areaY / 3)), new _vec2__WEBPACK_IMPORTED_MODULE_2__.Vector2(0, -1), 4, this.areaX, this.areaY, this.foodCallback, this.lostCallback, 1)
            ];
            this.snakes[1].setUseWSAD(true);
            if (this.doubleSnakes) {
                this.snakes[0].updateOtherPoints(this.snakes[1].getPoints());
                this.snakes[1].updateOtherPoints(this.snakes[0].getPoints());
            }
        }
        else {
            this.snakes = [
                new _snake__WEBPACK_IMPORTED_MODULE_1__.Snake(new _vec2__WEBPACK_IMPORTED_MODULE_2__.Vector2(Math.round(this.areaX / 2), Math.round(this.areaY / 2)), new _vec2__WEBPACK_IMPORTED_MODULE_2__.Vector2(0, -1), 4, this.areaX, this.areaY, this.foodCallback, this.lostCallback)
            ];
        }
        for (const snake of this.snakes) {
            snake.updateFoodPositions(this.foods);
        }
    }
    foodCallback(position) {
        console.warn("GOT THE FOOD!!!");
        const idx = this.foods.findIndex(f => f.equals(position));
        if (idx !== -1)
            this.foods.splice(idx, 1);
        if (this.doubleSnakes) {
            this.snakes[0].updateOtherPoints(this.snakes[1].getPoints());
            this.snakes[1].updateOtherPoints(this.snakes[0].getPoints());
        }
        this.createFood();
        this.updateScore();
    }
    lostCallback(length) {
        console.warn("Lost with length: ", length);
        let totalLength = 0;
        for (const snake of this.snakes) {
            totalLength += snake.getPoints().length / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS;
        }
        alert("(Temporary UI) Total score of: " + totalLength.toString());
        this.lostFunction();
    }
    lostFunction() {
        this.snakes.length = 0;
        this.resetGame();
        this.showWindow();
    }
    drawFood() {
        this.foods.forEach((position, index) => {
            const foodWidth = _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH * 0.5;
            const foodHeight = _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT * 0.5;
            const x = position.x * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH;
            const y = position.y * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT;
            //this.ctx.fillStyle = "green";
            //this.ctx.fillRect(x + foodWidth / 2, y + foodHeight / 2, foodWidth, foodHeight);
            this.ctx.drawImage(this.FoodImage, x, y);
            //console.log("Fill at: ", x, y);
        });
        //console.log(foods[0]);
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawFood();
        for (const snake of this.snakes) {
            snake.render(this.ctx);
        }
    }
    update(deltaTime) {
        this.render();
        for (const snake of this.snakes) {
            snake.update(deltaTime);
        }
    }
    renderLoop = () => {
        this.deltaTime = (Date.now() - this.lastTime) / 1000;
        if (this.isVisible) {
            this.update(this.deltaTime);
        }
        this.lastTime = Date.now();
        requestAnimationFrame(this.renderLoop);
    };
    updateCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.areaX = this.canvas.width / _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH;
        this.areaY = this.canvas.height / _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT;
    }
    resetGame() {
        this.gameStarted = false;
        this.createSnakes();
        this.foods.length = 0;
        this.createFood();
        this.updateScore();
    }
    showWindow() {
        const win = document.querySelector("#info");
        if (!win)
            return;
        win.style.display = "block";
    }
    windowHandler() {
        const win = document.querySelector("#info");
        if (!win)
            return;
        const small = document.querySelector("#small");
        const medium = document.querySelector("#medium");
        const large = document.querySelector("#large");
        const largest = document.querySelector("#largest");
        small.addEventListener("click", () => {
            this.canvas.style.width = "240px";
            this.canvas.style.height = "240px";
            this.updateCanvas();
            this.resetGame();
        });
        medium.addEventListener("click", () => {
            this.canvas.style.width = "480px";
            this.canvas.style.height = "480px";
            this.updateCanvas();
            this.resetGame();
        });
        large.addEventListener("click", () => {
            this.canvas.style.width = "800px";
            this.canvas.style.height = "800px";
            this.updateCanvas();
            this.resetGame();
        });
        largest.addEventListener("click", () => {
            this.canvas.style.width = "1600px";
            this.canvas.style.height = "800px";
            this.updateCanvas();
            this.resetGame();
        });
        const hard = document.querySelector("#double-snakes");
        hard.addEventListener("input", () => {
            this.nextGameDoubleSnakesSet(hard.checked);
            this.resetGame();
        });
        const apples = document.querySelector("#apples");
        apples.addEventListener("input", () => {
            this.numberOfFoods = parseInt(apples.value);
            this.resetGame();
        });
        const begin = document.querySelector("#begin");
        begin.addEventListener("click", () => {
            win.style.display = "none";
            this.gameStartedEvent();
        });
    }
    setVisibility(value) {
        this.isVisible = value;
    }
    initialize() {
        this.windowHandler();
        this.createSnakes();
        this.createFood();
        this.updateScore();
        this.renderLoop();
    }
}


/***/ }),

/***/ "./src/games/snake/snake.ts":
/*!**********************************!*\
  !*** ./src/games/snake/snake.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Snake: () => (/* binding */ Snake)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./src/games/snake/config.ts");
/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vec2 */ "./src/games/snake/vec2.ts");
/* harmony import */ var _assets_head_right_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./assets/head_right.png */ "./src/games/snake/assets/head_right.png");
/* harmony import */ var _assets_head_left_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./assets/head_left.png */ "./src/games/snake/assets/head_left.png");
/* harmony import */ var _assets_head_up_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./assets/head_up.png */ "./src/games/snake/assets/head_up.png");
/* harmony import */ var _assets_head_down_png__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./assets/head_down.png */ "./src/games/snake/assets/head_down.png");






const headRightImage = new Image();
headRightImage.src = _assets_head_right_png__WEBPACK_IMPORTED_MODULE_2__;
const headLeftImage = new Image();
headLeftImage.src = _assets_head_left_png__WEBPACK_IMPORTED_MODULE_3__;
const headUpImage = new Image();
headUpImage.src = _assets_head_up_png__WEBPACK_IMPORTED_MODULE_4__;
const headDownImage = new Image();
headDownImage.src = _assets_head_down_png__WEBPACK_IMPORTED_MODULE_5__;
function lerpHex(hexA, hexB, t) {
    const parse = (h) => {
        h = h.replace(/^#/, '');
        if (h.length === 3)
            h = h.split('').map(c => c + c).join('');
        return [
            parseInt(h.substring(0, 2), 16),
            parseInt(h.substring(2, 4), 16),
            parseInt(h.substring(4, 6), 16)
        ];
    };
    const [r1, g1, b1] = parse(hexA);
    const [r2, g2, b2] = parse(hexB);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    const toHex = (v) => {
        let s = v.toString(16);
        return s.length === 1 ? '0' + s : s;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
class Snake {
    position;
    direction;
    numX;
    numY;
    frameCounter = 0;
    pendingTurns = [];
    snakePoints = [];
    previousPoints = [];
    foods = [];
    foodCallback;
    lostCallback;
    otherPoints = [];
    useWSADControls = false;
    gameStarted = false;
    lastTurningCell = new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(1100, 100);
    index = 0;
    constructor(initialPosition, initialDirection, initialLength, numX, numY, eatenFoodCallback, lostCallback, index = 0) {
        this.position = initialPosition;
        this.direction = initialDirection;
        this.foodCallback = eatenFoodCallback;
        this.lostCallback = lostCallback;
        this.numX = numX;
        this.numY = numY;
        this.index = index;
        this.keyEvents();
        this.generateSnake(initialLength);
    }
    setUseWSAD(value) {
        this.useWSADControls = value;
    }
    setGameStarted(value) {
        this.gameStarted = value;
    }
    generateSnake(length) {
        const beginParts = 40;
        this.frameCounter = _config__WEBPACK_IMPORTED_MODULE_0__.FramesPerCell * beginParts;
        for (let i = 0; i < beginParts; i++) {
            this.snakePoints.push(this.position.sub(new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(0, i)));
        }
        for (let i = 0; i < beginParts * _config__WEBPACK_IMPORTED_MODULE_0__.FramesPerCell; i++) {
            this.previousPoints.push({ p: this.position.sub(new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(i / _config__WEBPACK_IMPORTED_MODULE_0__.FramesPerCell)), c: i });
        }
        //console.log(this.previousPoints);
        //console.log(this.snakePoints);
    }
    updateSegments() {
        const interval = _config__WEBPACK_IMPORTED_MODULE_0__.FramesPerCell / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS;
        const bufLen = this.previousPoints.length;
        const newest = bufLen - 1;
        this.snakePoints.forEach((part, i) => {
            // how many frames back this segment should trail
            const idx = Math.round(newest - i * interval);
            // clamp to [0, newest]
            const clamped = Math.max(0, Math.min(idx, newest));
            const point = this.previousPoints[clamped];
            part.x = point.p.x;
            part.y = point.p.y;
        });
    }
    snakeUpdate(deltaTime) {
        this.frameCounter += 1;
        if (this.gameStarted) {
            this.position = this.position.add(this.direction.multiplyScalar(_config__WEBPACK_IMPORTED_MODULE_0__.MOVEMENT_SPEED).multiplyScalar(deltaTime));
        }
        //console.log(this.position);
        // Previous points
        this.updateSegments();
        // Distance to previous
        // Euler's distance squared
        this.previousPoints.push({ p: this.position, c: this.frameCounter });
        if (this.previousPoints.length > this.snakePoints.length * (_config__WEBPACK_IMPORTED_MODULE_0__.FramesPerCell / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS) + (_config__WEBPACK_IMPORTED_MODULE_0__.FramesPerCell / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS) * 3) {
            this.previousPoints.splice(0, 1);
        }
        //console.log(this.previousPoints);
        //console.log(this.position);
    }
    getFood() {
        let index = 0;
        for (const food of this.foods) {
            const difference = Math.max(Math.abs(food.x - this.position.x), Math.abs(food.y - this.position.y));
            if (difference < _config__WEBPACK_IMPORTED_MODULE_0__.TURN_REJECT_THRESHOLD) {
                for (let i = 0; i < _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS; i++) {
                    this.snakePoints.push(new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(-10, -10)); // Add a new segment
                }
                this.foods.splice(index, 1);
                this.foodCallback(food);
            }
            index++;
        }
    }
    drawSnake(ctx) {
        const snakeWidth = _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH * 0.5;
        const snakeHeight = _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT * 0.5;
        //ctx.fillStyle = "blue";
        //ctx.fillRect(this.position.x * CELL_WIDTH + snakeWidth / 2, this.position.y * CELL_HEIGHT + snakeHeight / 2, snakeWidth, snakeHeight);
        //ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        //ctx.shadowBlur = 0;
        //ctx.shadowOffsetX = CELL_WIDTH * 0.1;
        //ctx.shadowOffsetY = CELL_HEIGHT * 0.1;
        const headColor = [91, 123, 249];
        const tailColor = [57, 99, 255];
        ctx.beginPath();
        const shadowOffsetX = _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH * 0.1;
        const shadowOffsetY = _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT * 0.1;
        const len = this.snakePoints.length;
        const radiusBase = snakeWidth * 0.75;
        let i = 0;
        for (const part of this.snakePoints) {
            const x = part.x * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH + _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH / 2;
            const r = (snakeWidth * 0.75) * (1 - (i / this.snakePoints.length) * 0.15);
            const y = part.y * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT + _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT / 2;
            ctx.moveTo(x + r + shadowOffsetX, y + shadowOffsetY);
            ctx.arc(x + shadowOffsetX, y + shadowOffsetY, r, 0, Math.PI * 2);
            const t = i / (this.snakePoints.length - 1);
            //const t = ;
            //ctx.fillStyle = `rgb(${lerp(headColor[0], tailColor[0], t)}, ${lerp(headColor[1], tailColor[1], t)}, ${lerp(headColor[2], tailColor[2], t)})`;
            //ctx.fillStyle = `rgb(${t * 255}, ${t * 255}, ${t * 255})`
            //ctx.fill();
            i++;
        }
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fill();
        // Real pass, draw segments on top of shadow
        i = 0;
        let nBatches = 0;
        let previousColor = "hahahaihiah";
        for (const part of this.snakePoints) {
            const t = i / (this.snakePoints.length - 1);
            const colorR = Math.round(lerp(headColor[0], tailColor[0], t));
            const colorG = Math.round(lerp(headColor[1], tailColor[1], t));
            const colorB = Math.round(lerp(headColor[2], tailColor[2], t));
            const currentColor = `rgb(${colorR}, ${colorG}, ${colorB})`;
            if (currentColor != previousColor) {
                ctx.fill();
                ctx.beginPath();
                ctx.fillStyle = currentColor;
                nBatches++;
            }
            const x = part.x * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH + _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH / 2;
            const r = (snakeWidth * 0.75) * (1 - (i / this.snakePoints.length) * 0.15);
            const y = part.y * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT + _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT / 2;
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, Math.PI * 2);
            //const t = ;
            ctx.fillStyle =
                ctx.filter = `hue-rotate(${this.index * 45 + this.index * 90}deg)`;
            //ctx.fillStyle = `rgb(${t * 255}, ${t * 255}, ${t * 255})`
            //ctx.fill();
            previousColor = currentColor;
            i++;
        }
        //console.log("# Segments: ", this.snakePoints.length, " seperated into ", nBatches, " batches for rendering");
        ctx.fill();
        ctx.shadowColor = "transparent";
        // Draw the head
        const x = this.position.x * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_WIDTH;
        const y = this.position.y * _config__WEBPACK_IMPORTED_MODULE_0__.CELL_HEIGHT;
        if (this.direction.equals(new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(-1, 0))) {
            // Going left
            ctx.drawImage(headLeftImage, x, y);
        }
        if (this.direction.equals(new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(1, 0))) {
            // Going right
            ctx.drawImage(headRightImage, x, y);
        }
        if (this.direction.equals(new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(0, -1))) {
            // Going up
            ctx.drawImage(headUpImage, x, y);
        }
        if (this.direction.equals(new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(0, 1))) {
            // Going down
            ctx.drawImage(headDownImage, x, y);
        }
        ctx.filter = "none";
    }
    isWithinBorders() {
        if (this.position.x < 0 || this.position.y < 0) {
            return false;
        }
        if (this.position.x > this.numX - 1 || this.position.y > this.numY - 1) {
            return false;
        }
        return true;
    }
    ensureTurningOnCell() {
        const closestCellX = Math.round(this.position.x + this.direction.x * 0);
        const closestCellY = Math.round(this.position.y + this.direction.y * 0);
        const difference = Math.max(Math.abs(closestCellX - this.position.x), Math.abs(closestCellY - this.position.y));
        if (difference > _config__WEBPACK_IMPORTED_MODULE_0__.TURN_REJECT_THRESHOLD) {
            return false;
        }
        // Teleport to cell, snap back for lower input latency
        const newPosition = new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(closestCellX, closestCellY);
        if (this.lastTurningCell.equals(newPosition))
            return false;
        const differenceP = this.position.sub(newPosition);
        // COMPLEX BACKTRACKING SYSTEM
        // Prevent weird artifacts by deleting instances of frame positions where a closest one is found (backtracking) in order to prevent bump and flickering from snaping back.
        const MAX_SEARCH = _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS;
        let closestDistance = Infinity;
        let closestPoint = this.previousPoints[this.previousPoints.length - 1];
        let closestPointIndex = -1;
        for (let i = this.previousPoints.length - 1; i >= this.previousPoints.length - MAX_SEARCH; i--) {
            const point = this.previousPoints[i];
            if (!point)
                break;
            if (!closestPoint) {
                throw Error("No closest point");
            }
            const dx = point.p.x - newPosition.x;
            const dy = point.p.y - newPosition.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < closestDistance) {
                closestPoint = point;
                closestDistance = d;
                closestPointIndex = i;
                //console.log("Set closest distance to: ", d, closestDistance);
            }
            else {
                //console.log("No distance change: ", d, closestDistance);
            }
        }
        // Do not delete if frameCounter is less advanced than closestPoint somehow (or just equal)
        // DeepSeek fix test
        if (this.frameCounter > closestPoint.c) {
            // FIXED: Delete newer points (c > closestPoint.c) using reverse iteration
            this.previousPoints.splice(closestPointIndex + 1);
            // FIXED: Also adjust snakePoints to match the backtracked state
            this.updateSegments();
            const diff = this.frameCounter - closestPoint.c;
            console.log("Backtracked by ", diff, " segments");
            this.frameCounter -= diff;
        }
        this.position = newPosition;
        console.log("Allowing turning");
        return true;
    }
    verifyTurn(newTurn) {
        const dirMap = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        const nd = dirMap[newTurn];
        let ndt = { x: 0, y: 0 };
        if (this.pendingTurns.length > 0) {
            ndt = dirMap[this.pendingTurns[Math.max(0, this.pendingTurns.length - 1)]];
        }
        else {
            ndt = this.direction;
        }
        if (nd.x == ndt.x && nd.y == ndt.y) {
            return false;
        }
        if (!(nd.x === -ndt.x && nd.y === -ndt.y)) {
            return true;
        }
        return false;
    }
    keyEvents() {
        document.addEventListener("keydown", (e) => {
            let newTurn = null;
            if (this.useWSADControls) {
                if (e.key === "w" || e.key === "W")
                    newTurn = "up";
                else if (e.key === "s" || e.key === "S")
                    newTurn = "down";
                else if (e.key === "a" || e.key === "A")
                    newTurn = "left";
                else if (e.key === "d" || e.key === "D")
                    newTurn = "right";
            }
            else {
                if (e.key === "ArrowUp")
                    newTurn = "up";
                else if (e.key === "ArrowDown")
                    newTurn = "down";
                else if (e.key === "ArrowLeft")
                    newTurn = "left";
                else if (e.key === "ArrowRight")
                    newTurn = "right";
            }
            if (newTurn) {
                if (this.verifyTurn(newTurn) && this.pendingTurns.length < 2) {
                    this.pendingTurns.push(newTurn);
                }
            }
        });
    }
    updatePendingTurn() {
        const pendingTurn = this.pendingTurns[0];
        if (!pendingTurn)
            return;
        if (this.ensureTurningOnCell() == false) {
            // Failed to turn, not close enough to cell center or next cell center
            return;
        }
        switch (pendingTurn) {
            case 'up':
                if (this.direction.y != 0)
                    break;
                this.direction = new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(0, -1);
                break;
            case 'down':
                if (this.direction.y != 0)
                    break;
                this.direction = new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(0, 1);
                break;
            case 'left':
                if (this.direction.x != 0)
                    break;
                this.direction = new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(-1, 0);
                break;
            case 'right':
                if (this.direction.x != 0)
                    break;
                this.direction = new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(1, 0);
                break;
            default:
                console.warn("Unknown value: ", pendingTurn);
        }
        console.log("Processed pending turn: ", pendingTurn);
        this.lastTurningCell = this.position;
        this.pendingTurns.splice(0, 1);
    }
    reset() {
        this.pendingTurns = [];
        this.snakePoints.length = 0;
        this.previousPoints.length = 0;
        this.position = new _vec2__WEBPACK_IMPORTED_MODULE_1__.Vector2(Math.round(this.numX / 2), Math.round(this.numY / 2));
        //this.generateSnake(4);
    }
    rebuild() {
        this.generateSnake(4);
    }
    hasCollidedWithSelf() {
        let index = 0;
        for (const position of this.snakePoints) {
            //if (index < SUBDIVISIONS) continue; // Don't collide with head;
            //Does not work
            const actualPosition = this.position.add(this.direction.multiplyScalar(0.5));
            const dSquared = (actualPosition.x - position.x) ** 2 + (actualPosition.y - position.y) ** 2;
            if (dSquared < (1 / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS) ** 2) {
                console.log("Collided with: ", position, " distance squared of: ", dSquared);
                return true;
            }
            index++;
        }
        return false;
    }
    hasCollidedWithOthers() {
        for (const position of this.otherPoints) {
            const actualPosition = this.position.add(this.direction.multiplyScalar(0.5));
            const dSquared = (actualPosition.x - position.x) ** 2 + (actualPosition.y - position.y) ** 2;
            if (dSquared < (1 / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS) ** 2) {
                console.log("Collided with: ", position, " distance squared of: ", dSquared);
                return true;
            }
        }
        return false;
    }
    update(deltaTime) {
        this.updatePendingTurn();
        this.snakeUpdate(deltaTime);
        this.getFood();
        if (this.isWithinBorders() == false) {
            // Reset everything
            this.lostCallback(this.snakePoints.length / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS);
            //this.reset();
        }
        if (this.hasCollidedWithSelf() == true) {
            this.lostCallback(this.snakePoints.length / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS);
            //this.reset();
        }
        if (this.hasCollidedWithOthers() == true) {
            this.lostCallback(this.snakePoints.length / _config__WEBPACK_IMPORTED_MODULE_0__.SUBDIVISIONS);
        }
    }
    getPoints() {
        return this.snakePoints;
    }
    updateFoodPositions(foods) {
        this.foods = foods;
    }
    updateOtherPoints(others) {
        this.otherPoints = others;
    }
    render(ctx) {
        this.drawSnake(ctx);
    }
}


/***/ }),

/***/ "./src/games/snake/vec2.ts":
/*!*********************************!*\
  !*** ./src/games/snake/vec2.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Vector2: () => (/* binding */ Vector2)
/* harmony export */ });
class Vector2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    multiply(other) {
        return new Vector2(this.x * other.x, this.y * other.y);
    }
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    multiplyScalar(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    sub(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    equals(other) {
        return (this.x == other.x && this.y == other.y);
    }
}


/***/ }),

/***/ "./src/games/soundEngine.ts":
/*!**********************************!*\
  !*** ./src/games/soundEngine.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Audio: () => (/* binding */ Audio)
/* harmony export */ });
class Audio {
    audioCtx;
    audioBuffer;
    constructor(audioCtx) {
        this.audioCtx = audioCtx;
    }
    async loadSound(url) {
        try {
            // Validate input
            if (!url)
                throw new Error('No audio file path provided');
            // Get absolute URL for extension resource
            const soundUrl = chrome.runtime.getURL(url);
            console.log("Attempt to fetch at: ", soundUrl);
            if (soundUrl == 'chrome-extension://invalid/') {
                throw new Error(`Chrome runtime returned INVALID url while trying to fetch ${url}`);
            }
            // Fetch the audio file
            const response = await fetch(soundUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
            }
            // Convert to array buffer
            const arrayBuffer = await response.arrayBuffer();
            // Decode audio data
            this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
        }
        catch (error) {
            console.error('Error loading sound:', error);
            // Add your error handling/recovery logic here
            throw error; // Re-throw if you want calling code to handle it
        }
    }
    playSound(volume) {
        if (this.audioBuffer == undefined) {
            throw new Error("Audio buffer has not been defined yet");
        }
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.audioBuffer;
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = volume; // 🎚️ Set the volume
        source.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        source.start();
    }
}


/***/ }),

/***/ "./src/popup/themes.ts":
/*!*****************************!*\
  !*** ./src/popup/themes.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ThemeManager: () => (/* binding */ ThemeManager)
/* harmony export */ });
/* harmony import */ var _shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared */ "./src/shared.ts");
/* harmony import */ var _dataManagement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../dataManagement */ "./src/dataManagement.ts");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ui */ "./src/popup/ui.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");




//const THEME_NECESSARY_MAIN_KEYS = {"data": {"classColors": null, "varColors": null, "fonts": {"fontFamily": null}, "otherSettings": null, "twemojiSupport": null}, "version": null, "name": null};
const THEME_VERSION_CURRENT = 2;
const THEME_CARD_HTML = `
                <div class="theme">
                    <h3 class="theme-title">Dark cozy blue</h3>
                    <p class="theme-descripton">Color and fonts theme</p>
                    <div class="actions">
                        <button class="text-btn" id="apply-btn">Apply</button>
                        <button class="text-btn" id="export-theme">
                            Export
                        </button>
                        <button class="text-btn" id="delete-theme">
                            Delete
                        </button>
                    </div>

                </div>
`;
class ThemeManager {
    dataManager;
    constructor(dataManager) {
        this.dataManager = dataManager;
    }
    isStringDict(obj) {
        return (typeof obj === "object" &&
            obj !== null &&
            !Array.isArray(obj) &&
            Object.values(obj).every(val => typeof val === "string"));
    }
    p_syncDataManager() {
    }
    p_syncInstanceWithDataManager() {
    }
    p_dataManagerExists() {
        if (this.dataManager == null) {
            throw new Error("Where is data manager");
        }
    }
    p_isThemeValid_dataLegacy_parser(themeString) {
        let themeDataParsed = JSON.parse(themeString);
        // Check data
        if (themeDataParsed["data"] == null) {
            console.error("Data field not found; failed to load theme");
            return;
        }
        let data = {
            colors: themeDataParsed["data"]["varColors"],
            classColors: themeDataParsed["data"]["classColors"],
            fonts: themeDataParsed["data"]["fonts"],
            pixelValues: themeDataParsed["data"]['otherSettings'],
            backgrounds: themeDataParsed["data"]["backgrounds"],
            emojis: { set: themeDataParsed["data"]["twemojiSupport"] ? "twemoji" : "default" }
        };
        // Fix theme if needed
        if (themeDataParsed["data"]["classColors"] == null) {
            console.error("Field not found. Override with default.");
            data.classColors = _shared__WEBPACK_IMPORTED_MODULE_0__.CLASS_COLORS;
        }
        if (themeDataParsed["data"]["varColors"] == null) {
            console.error("Field not found. Override with default.");
            data.colors = _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_COLORS;
        }
        if (themeDataParsed["data"]["fonts"] == null) {
            console.error("Field not found. Override with default.");
            data.fonts = _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_FONTS;
        }
        if (themeDataParsed["data"]["otherSettings"] == null) {
            console.error("Field not found. Override with default.");
            data.pixelValues = _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_PIXEL_VALUES;
        }
        if (themeDataParsed["data"]["twemojiSupport"] == null) {
            console.error("Field not found. Override with default.");
            data.emojis = _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_EMOJIS;
        }
        ;
        if (themeDataParsed["data"]["backgrounds"] == null) {
            console.error("Backgrounds field not found. Overriding with default.");
            data.backgrounds = _shared__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_BACKGROUNDS;
        }
        console.log(data);
        return {
            data: data,
            name: themeDataParsed["name"],
            data_version: themeDataParsed["data_version"]
        };
    }
    p_isThemeValid(themeString) {
        let themeDataParsed = JSON.parse(themeString);
        // Check data
        if (themeDataParsed["data"] == null) {
            console.error("Data field not found; failed to load theme");
            return;
        }
        if (themeDataParsed["data_version"] == 1) {
            console.log("Using legacy parser");
            return this.p_isThemeValid_dataLegacy_parser(themeString);
        }
        // Fix theme if needed
        for (const key of Object.keys(themeDataParsed["data"])) {
            if (_dataManagement__WEBPACK_IMPORTED_MODULE_1__.ThemeKeysList.includes(key) == false) {
                console.error("Error: invalid theme. Contains unrecognized theme.");
                return;
            }
            if (this.isStringDict(themeDataParsed["data"][key]) == false) {
                console.error("Error: Theme is not of valid type");
                return;
            }
        }
        for (const key of _dataManagement__WEBPACK_IMPORTED_MODULE_1__.ThemeKeysList) {
            if (themeDataParsed["data"][key] == null) {
                console.warn("Fixing missing key: ", key);
                themeDataParsed["data"][key] = {};
            }
        }
        return themeDataParsed;
        // Check version
    }
    addTheme(themeName, themeData_JSON) {
        console.log(themeName, themeData_JSON);
        this.p_syncInstanceWithDataManager();
        this.p_dataManagerExists();
        console.log("Adding theme ", themeName, " to current themes");
        this.dataManager.currentThemes[themeName] = themeData_JSON;
        this.p_syncDataManager();
        this.dataManager.saveThemes();
        this.dataManager.loadThemes();
        this.p_syncDataManager();
        console.log("Added theme");
        // this.updateThemeList()
    }
    async p_generateThemeData(themeName) {
        console.log("GENERATE DATA");
        const themeDict = {
            data: this.dataManager.exportThemeData(),
            name: themeName,
            data_version: THEME_VERSION_CURRENT // Change this everytime format is updated
        };
        console.log("EXPORT: ", themeDict.data.backgrounds);
        return JSON.stringify(themeDict);
    }
    async applyTheme(themeName) {
        this.p_dataManagerExists();
        console.log(this.dataManager.currentThemes);
        const themeDataUnparsed = this.dataManager.currentThemes[themeName];
        console.log(themeDataUnparsed);
        let themeDataParsed = this.p_isThemeValid(themeDataUnparsed);
        if (themeDataParsed == null) {
            throw Error("error");
        }
        const currentDataTemp = { ...this.dataManager.currentData };
        try {
            this.dataManager.currentData = (themeDataParsed.data);
            const i = document.querySelector("#twemojiSupport");
            if (i) {
                i.checked = await this.dataManager.currentData["emojis"]["set"] == "twemoji";
                i.addEventListener("input", function () {
                    console.log("Save Twemoji state");
                    chrome.storage.local.set({ "twemoji": i.checked });
                });
            }
            this.dataManager.saveAll();
            console.log("Successfully loaded theme.");
        }
        catch (error) {
            console.error("Failed to apply theme ", error);
            console.error("Reverting to original state.");
            this.dataManager.currentData = currentDataTemp;
            console.log("Reverted to original state.");
        }
        finally {
            console.log("Successfully applied theme with no issues.");
        }
    }
    async updateThemesList() {
        this.p_dataManagerExists();
        console.log("Updating theme list");
        const availableThemesElement = document.querySelector("#availableThemes");
        if (availableThemesElement == null) {
            console.error("Failed to update available themes: element not found");
            return;
        }
        availableThemesElement.innerHTML = ""; // Clear existing buttons
        await this.dataManager.loadThemes();
        for (const themeName in this.dataManager.currentThemes) {
            // Create new element thing
            const a = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.p_stringToElement)(THEME_CARD_HTML);
            const themeNameH3 = a.querySelector(".theme-title");
            const applyButton = a.querySelector("#apply-btn");
            const exportButton = a.querySelector("#export-theme");
            const deleteButton = a.querySelector("#delete-theme");
            if (themeNameH3 == null || exportButton == null || applyButton == null || deleteButton == null)
                return;
            themeNameH3.textContent = `${themeName}`;
            applyButton.textContent = "Load";
            deleteButton.textContent = "Delete";
            exportButton.textContent = "Export";
            // Button functions
            /*Applies the theme*/
            applyButton.addEventListener("click", async () => {
                if ((0,_ui__WEBPACK_IMPORTED_MODULE_2__.confirmation)() == false) {
                    alert("User has not confirmed");
                    return;
                }
                await this.dataManager.loadThemes();
                this.dataManager.currentThemes = this.dataManager.currentThemes;
                await this.applyTheme(themeName);
                alert("Successfully applied theme. Please close and reopen the popup to see changes in the advanced tab.");
            });
            /*Deletes the theme*/
            deleteButton.addEventListener("click", async () => {
                if ((0,_ui__WEBPACK_IMPORTED_MODULE_2__.confirmation)() == false) {
                    alert("User has not confirmed");
                    return;
                }
                // Delete the thing
                try {
                    delete this.dataManager.currentThemes[themeName];
                    this.dataManager.saveThemes();
                }
                catch (error) {
                    console.error("Failed to delete: ", error);
                    alert("Failed to delete theme");
                    return;
                }
                finally {
                    await this.updateThemesList();
                    alert("Successfully deleted the theme");
                }
            });
            /*Exports the theme*/
            exportButton.addEventListener("click", async () => {
                if (this.dataManager.currentThemes[themeName] == null) {
                    console.error("Current theme not found");
                    alert("Current theme not found");
                    return;
                }
                await navigator.clipboard.writeText(this.dataManager.currentThemes[themeName]);
                alert("Theme copied to clipboard");
            });
            // Add to final element
            availableThemesElement.appendChild(a);
        }
        console.log("Done updating theme list");
    }
}


/***/ }),

/***/ "./src/popup/ui.ts":
/*!*************************!*\
  !*** ./src/popup/ui.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   confirmation: () => (/* binding */ confirmation)
/* harmony export */ });
function m_confirmation() {
    return prompt("Confirm? Type 'y' or 'n'") === 'y';
}
const confirmation = m_confirmation;


/***/ }),

/***/ "./src/runtime/imageLoadingOptimizer.ts":
/*!**********************************************!*\
  !*** ./src/runtime/imageLoadingOptimizer.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ImageLoadingOptimizer: () => (/* binding */ ImageLoadingOptimizer)
/* harmony export */ });
class ImageLoadingOptimizer {
    constructor() {
    }
    handleNewImage(image) {
        image.loading = "lazy";
        image.decoding = "async";
    }
    createMutationObserver() {
        const callback = (mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "childList" && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            if (node.tagName == 'IMG') {
                                this.handleNewImage(node);
                            }
                        }
                    });
                }
            }
        };
        const observer = new MutationObserver(callback);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    processCurrentImages() {
        document.querySelectorAll("img").forEach((img) => {
            this.handleNewImage(img);
        });
    }
    onLoad() {
        console.log("Begin optimizing image loading");
        this.processCurrentImages();
        this.createMutationObserver();
    }
}


/***/ }),

/***/ "./src/runtime/loadingScreen.ts":
/*!**************************************!*\
  !*** ./src/runtime/loadingScreen.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LoadingScreen: () => (/* binding */ LoadingScreen)
/* harmony export */ });
class LoadingScreen {
    textMutationObserver = null;
    textSlideInElement = null;
    updateAvailableText = "";
    currentVersion = "";
    constructor() {
    }
    checkForUpdates() {
        this.currentVersion = "v" + chrome.runtime.getManifest().version;
        fetch("https://api.github.com/repos/CariLT01/teamsplus-extension/releases/latest")
            .then(response => response.json())
            .then((data) => {
            const tagName = data.tag_name;
            if (tagName && tagName != this.currentVersion) {
                this.updateAvailableText = "Update available: " + this.currentVersion + " → " + tagName;
                this.setTextContent();
            }
            else if (tagName == this.currentVersion) {
                this.updateAvailableText = "<p style='font-weight: normal; font-size: 12px'>Up to date</p>";
                this.setTextContent();
            }
        }).catch((err) => {
            console.error("Failed to check for updates: ", err);
        });
    }
    setTextContent() {
        if (!this.textSlideInElement)
            return;
        const extensionVersion = chrome.runtime.getManifest().version;
        this.textSlideInElement.innerHTML = "Loading Microsoft Teams...<br><br><p style='font-weight: normal; font-size: 16px;'>TeamsPlus v" + extensionVersion + "</p>" + this.updateAvailableText;
    }
    startMutationObserver() {
        this.checkForUpdates();
        this.textMutationObserver = new MutationObserver((mutations) => {
            const textSlideIn = document.querySelector(".text-slide-in");
            if (textSlideIn) {
                this.textSlideInElement = textSlideIn;
                this.setTextContent();
                if (this.textMutationObserver) {
                    this.textMutationObserver.disconnect();
                }
            }
        });
        this.textMutationObserver.observe(document.body, {
            subtree: true,
            childList: true,
        });
    }
}


/***/ }),

/***/ "./src/runtime/realtimeUpdates.ts":
/*!****************************************!*\
  !*** ./src/runtime/realtimeUpdates.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RealtimeUpdatesManager: () => (/* binding */ RealtimeUpdatesManager)
/* harmony export */ });
class RealtimeUpdatesManager {
    stylesRuntime;
    dataManager;
    constructor(dataManager, stylesRuntime) {
        this.stylesRuntime = stylesRuntime;
        this.dataManager = dataManager;
    }
    detectChange() {
        console.log("start change detect");
        chrome.storage.onChanged.addListener(async (changes, areaName) => {
            if (areaName === 'local') { // 'sync' refers to chrome.storage.sync
                // Loop through the changed items
                for (let key in changes) {
                    if (changes.hasOwnProperty(key)) {
                        if (key == "themeData") {
                            console.log("Change detected!");
                            await this.dataManager.loadAll();
                            this.stylesRuntime.deleteStyle();
                            this.stylesRuntime.applyBackgrounds();
                            this.stylesRuntime.applyColors();
                            this.stylesRuntime.applyFonts(null);
                        }
                    }
                }
            }
        });
    }
}


/***/ }),

/***/ "./src/runtime/styles.ts":
/*!*******************************!*\
  !*** ./src/runtime/styles.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RuntimeStyles: () => (/* binding */ RuntimeStyles)
/* harmony export */ });
/* harmony import */ var _shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared */ "./src/shared.ts");

let USE_FULL_BACKGROUND = true;
class RuntimeStyles {
    styleElement = null;
    emojithis = null;
    dataManager;
    observer = null;
    blurBackgroundObserver = null;
    blurElementQueue = [];
    constructor(dataManager) {
        this.dataManager = dataManager;
    }
    p_dataManagerExists() {
        if (this.dataManager == null) {
            throw new Error("Where is data manager");
        }
    }
    p_emojiThisExists() {
        if (this.emojithis == null) {
            throw new Error("where emojithis");
        }
    }
    p_addBackgroundImageToMessageBackground(target) {
        // Get the thing
        if (this.dataManager == null) {
            throw new Error("No data manager");
        }
        ;
        const backgroundStyle = this.dataManager.currentData["backgrounds"]["channelAndChatBackground"];
        if (backgroundStyle == null) {
            throw new Error("Data style failed to find");
        }
        ;
        if (backgroundStyle == "none") {
            target.style.background = "";
            console.log("Backgrounds: none applied");
            return;
        }
        target.style.background = backgroundStyle;
        console.log("Backgrounds: applied: ", backgroundStyle);
    }
    p_getBackgroundRGBA(el) {
        const bg1 = window.getComputedStyle(el);
        const bg = bg1.backgroundColor;
        // matches rgb(r,g,b) or rgba(r,g,b,a)
        const match = bg.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
        if (!match)
            return null;
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] !== undefined ? (Math.min(parseFloat(match[4]), parseFloat(bg1.opacity))) : 1
        };
    }
    blurProcessElement(el) {
        // Ignore apps menu
        if (el.closest(".apps-menu") != null)
            return;
        if (el instanceof HTMLButtonElement)
            return;
        if (this.dataManager == null)
            return;
        const elementColor = this.p_getBackgroundRGBA(el);
        if (elementColor == null)
            return;
        const elementTransparency = Math.min(elementColor.a, parseFloat(this.dataManager.currentData["backgrounds"]["interfaceOpacity"]));
        if (el.style.backgroundColor != "") {
            el.style.backgroundColor = "";
            console.log("Removing bg");
        }
        el.style.backgroundColor = `rgba(${elementColor.r}, ${elementColor.g}, ${elementColor.b}, ${elementTransparency})`;
        if (elementTransparency > 0) {
            el.style.backdropFilter = this.dataManager.currentData["backgrounds"]["backdropFilter"];
        }
    }
    p_applyFullBackground() {
        if (this.dataManager == null)
            return;
        const backgroundStyle = this.dataManager.currentData["backgrounds"]["channelAndChatBackground"];
        if (backgroundStyle == null) {
            throw new Error("Data style failed to find");
        }
        ;
        const app = document.getElementById("app");
        if (app == null) {
            throw new Error("App not found");
        }
        if (backgroundStyle == "none") {
            app.style.background = "";
        }
        else {
            app.style.background = backgroundStyle;
        }
    }
    p_blurQueueProcess() {
        /*requestIdleCallback(() => {
            console.log("Batch process blur");
            const batch = this.blurElementQueue.splice(0, 50);
            batch.forEach((element) => this.blurProcessElement(element));
            if (this.blurElementQueue.length > 0) this.p_blurQueueProcess();
        }, {timeout: 50})*/
        this.blurElementQueue.forEach(element => this.blurProcessElement(element));
        this.blurElementQueue.length = 0;
    }
    p_createBlurMutationObserver() {
        const app = document.querySelector("#app");
        app.querySelectorAll("*").forEach((element) => {
            this.blurElementQueue.push(element);
        });
        this.blurBackgroundObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type == "childList") {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType == Node.ELEMENT_NODE) {
                            const element = node;
                            this.blurElementQueue.push(element);
                            element.querySelectorAll("*").forEach((childElement) => {
                                this.blurElementQueue.push(childElement);
                                //this.blurProcessElement(childElement as HTMLElement)
                            });
                        }
                    });
                }
            }
            this.p_blurQueueProcess();
        });
        this.blurBackgroundObserver.observe(document.querySelector("#app"), {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"]
        });
    }
    p_createMutationObserver() {
        const targetSelector = '[data-tid="message-pane-layout"]';
        this.observer = new MutationObserver((mutations) => {
            // Only need to check if the target appeared
            const target = document.querySelector(targetSelector);
            if (target) {
                this.p_addBackgroundImageToMessageBackground(target);
            }
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    getFui() {
        let fluentProvider = ".fui-FluentProviderr0";
        if (window.location.hostname == "assignments.onenote.com") {
            console.log("Detected assignments tab, set fluent provider to EDUASSIGN-r0");
            fluentProvider = ".fui-FluentProviderEDUASSIGN-r0";
        }
        else if (window.location.hostname == "outlook.office.com") {
            fluentProvider = ".fui-FluentProviderr0";
        }
        else {
            console.log("Detected main Teams interface, set fluent provider to r0");
        }
        return fluentProvider;
    }
    applyColors() {
        this.p_dataManagerExists();
        console.log("applying");
        const EMOJI_STYLE = `
        
        .emoji{
            width: 1em;
            height: 1em;
            margin-right: 2px;
            vertical-align: middle;
        }
        `;
        this.styleElement = document.createElement("style");
        this.styleElement.type = "text/css";
        let cssContent = "";
        for (const property in this.dataManager.currentData["colors"]) {
            console.log("co: applying ", property);
            cssContent += `${property}: ${this.dataManager.currentData["colors"][property]} !important;\n`;
        }
        for (const property in this.dataManager.currentData["pixelValues"]) {
            console.log("px: applying ", property);
            cssContent += `${property}: ${this.dataManager.currentData["pixelValues"][property]} !important; \n`;
        }
        let classCSSContent = "";
        for (const property in this.dataManager.currentData["classColors"]) {
            const propertyName = _shared__WEBPACK_IMPORTED_MODULE_0__.CLASS_PROPERTIES[property];
            classCSSContent += `.${property}{${propertyName}: ${this.dataManager.currentData["classColors"][property]} !important;}\n`;
        }
        // Inject the CSS content into the <style> element
        this.styleElement.innerHTML = `${this.getFui()} {\n${cssContent}\n} ${classCSSContent}\n${EMOJI_STYLE}`;
        console.log(this.styleElement.innerHTML);
        document.head.appendChild(this.styleElement);
    }
    applyBackgrounds() {
        if (this.dataManager == null)
            return;
        this.p_applyFullBackground();
        const isFullBackgroundExperienceEnabled = this.dataManager.currentData["backgrounds"]["fullBackgroundExperience"] === "true";
        if (this.observer == null && isFullBackgroundExperienceEnabled == false) {
            console.log("INITIALIZE MUTATION OBSERVER");
            this.p_createMutationObserver();
            const chatBoxes = document.querySelectorAll('[data-tid="message-pane-layout"]');
            chatBoxes.forEach((v) => {
                this.p_addBackgroundImageToMessageBackground(v);
            });
        }
        if (this.blurBackgroundObserver == null && isFullBackgroundExperienceEnabled == true) {
            console.log("INITIALIZE BLUR MUTATION OBSERVER");
            this.p_createBlurMutationObserver();
        }
    }
    applyFonts(parent) {
        this.p_dataManagerExists();
        this.emojithis = document.createElement("style");
        this.emojithis.type = "text/css";
        this.p_emojiThisExists();
        if (this.dataManager.currentData["fonts"] == null) {
            return;
        }
        this.emojithis = document.createElement("style");
        this.emojithis.type = "text/css";
        let cssContent = `--fontFamilyBase: ${this.dataManager.currentData["fonts"]["fontFamily"]} !important;}`;
        let additionalImports = this.dataManager.currentData["fonts"]["imports"];
        let fuiContent = `${this.getFui()} {\n${cssContent}\n}`;
        let bodyContent = `* {\n${cssContent}\n}`;
        this.emojithis.innerHTML = `${additionalImports}\n${bodyContent}\n${fuiContent}`;
        console.log(this.emojithis.innerHTML);
        if (parent == null) {
            document.head.appendChild(this.emojithis);
            return this.emojithis;
        }
        else {
            parent.appendChild(this.emojithis);
            return this.emojithis;
        }
    }
    deleteFontsStyle() {
        if (this.emojithis == null)
            return;
        this.emojithis.remove();
        this.emojithis = null;
    }
    deleteStyle() {
        if (this.styleElement == null)
            return;
        this.styleElement.remove();
        this.styleElement = null;
    }
}


/***/ }),

/***/ "./src/runtime/twemoji.ts":
/*!********************************!*\
  !*** ./src/runtime/twemoji.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TwemojiRuntime: () => (/* binding */ TwemojiRuntime)
/* harmony export */ });
/* harmony import */ var twemoji__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! twemoji */ "./node_modules/twemoji/dist/twemoji.esm.js");

const onNewEmojiWrapper = (element) => {
    if (element.getAttribute("twemoji-processed") == "true")
        return; // Avoid twemoji.parse()
    //console.log("New emoji IMG warpper detected, parsing twemoji");
    try {
        const parent = element.parentElement;
        if (parent == null)
            return;
        const originalParent = parent.parentNode;
        if (originalParent == null) {
            console.log(parent);
            throw new Error("No original parent");
        }
        const unicode = element.getAttribute("alt");
        const originalRect = element.getBoundingClientRect();
        if (unicode == null) {
            console.error(`Unicode not found`);
        }
        else {
            if (element.querySelector(".fui-ChatMyMessage") == null) {
                parent.outerHTML = `${unicode}`;
            }
            else {
                parent.innerHTML = `${unicode}`;
            }
            const parsedImg = twemoji__WEBPACK_IMPORTED_MODULE_0__["default"].parse(originalParent, {
                base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/15.1.0/",
                folder: "svg", // or "svg" for vector format
                ext: ".svg" // or ".svg"
            });
            parsedImg.style.width = `${originalRect.width}px !important`;
            parsedImg.style.height = `${originalRect.height}px !important`;
        }
    }
    catch (err) {
        console.error("Failed to convert emoji img to chr", err);
    }
    finally {
        //console.log("Convert img to char success");
        element.setAttribute("twemoji-processed", "true");
    }
};
class TwemojiRuntime {
    dataManager;
    nodeProcessQueueEmoji = [];
    nodeProcessQueueMessages = [];
    constructor(dataManager) {
        this.dataManager = dataManager;
    }
    p_dataManagerExists() {
        if (this.dataManager == null) {
            throw new Error("Where is data manager");
        }
    }
    async applyTwemoji() {
        this.p_dataManagerExists();
        const twemojiEnabled = await this.dataManager.currentData.emojis["set"] == "twemoji";
        if (twemojiEnabled == false) {
            console.error("Twemoji is not enabled.Skipping Twemoji");
            return;
        }
        this.detectNewMessages();
    }
    processQueueEmojis() {
        requestIdleCallback(() => {
            const batch = this.nodeProcessQueueEmoji.splice(0, 50);
            batch.forEach((element) => onNewEmojiWrapper(element));
            if (this.nodeProcessQueueEmoji.length > 0)
                this.processQueueEmojis();
        }, { timeout: 500 });
    }
    processQueueMessages() {
        requestIdleCallback(() => {
            const batch = this.nodeProcessQueueMessages.splice(0, 50);
            batch.forEach((element) => onNewEmojiWrapper(element));
            if (this.nodeProcessQueueMessages.length > 0)
                this.processQueueMessages();
        }, { timeout: 500 });
    }
    emojiPrebatchProcess(element) {
        if (element instanceof HTMLImageElement) {
            element.removeAttribute("src"); // stops the browser from fetching the image
            element.style.display = "none";
        }
    }
    detectNewMessages() {
        // Target the parent container where messages are added (e.g., a chat container)
        const targetNode = document.body; // Replace with a specific parent if possible
        // Observer configuration
        const config = {
            childList: true, // Watch for direct child additions/removals
            subtree: true, // Watch all descendants (not just direct children)
        };
        // Callback when mutations are detected
        const callback = (mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check each added node for the target element
                    mutation.addedNodes.forEach((node) => {
                        if (!(node instanceof HTMLElement || node instanceof DocumentFragment))
                            return;
                        // Handle direct matches (if the node itself is the wrapper)
                        if (node instanceof HTMLElement && node.dataset.testid === 'message-wrapper') {
                            this.emojiPrebatchProcess(node);
                            this.nodeProcessQueueEmoji.push(node);
                        }
                        if (node instanceof HTMLElement && node.dataset.tid === 'chat-pane-compose-message-footer') {
                            this.emojiPrebatchProcess(node);
                            this.nodeProcessQueueEmoji.push(node);
                        }
                        if (node instanceof HTMLElement && node.getAttribute("itemtype") == "http://schema.skype.com/Emoji") {
                            this.emojiPrebatchProcess(node);
                            this.nodeProcessQueueEmoji.push(node);
                        }
                        if (node instanceof HTMLElement && node.dataset.inp === 'message-hover-reactions') {
                            this.emojiPrebatchProcess(node);
                            this.nodeProcessQueueEmoji.push(node);
                        }
                        if (node instanceof HTMLElement && node.dataset.tid === 'emoji-tab-category-grid') {
                            this.emojiPrebatchProcess(node);
                            this.nodeProcessQueueEmoji.push(node);
                        }
                        // Handle nested matches (if the wrapper is inside the added node)
                        if (node instanceof HTMLElement || node instanceof DocumentFragment) {
                            const wrappers = node.querySelectorAll('[data-testid="message-wrapper"]');
                            wrappers.forEach((wrapper, index) => this.nodeProcessQueueMessages.push(wrapper));
                            const emojiImgs = node.querySelectorAll('[itemtype="http://schema.skype.com/Emoji"]');
                            emojiImgs.forEach((img, index) => {
                                this.emojiPrebatchProcess(img);
                                this.nodeProcessQueueEmoji.push(img);
                            });
                            const messageHoverReactions = node.querySelectorAll('[data-inp="message-hover-reactions"]');
                            messageHoverReactions.forEach((img, index) => this.nodeProcessQueueMessages.push(img));
                            const emojiTab = node.querySelectorAll('[data-tid="emoji-tab-category-grid"]');
                            emojiTab.forEach((img, index) => this.nodeProcessQueueMessages.push(img));
                        }
                    });
                }
            }
            if (this.nodeProcessQueueMessages.length > 0)
                this.processQueueMessages();
            if (this.nodeProcessQueueEmoji.length > 0)
                this.processQueueEmojis();
        };
        // Return a cleanup function to disconnect later
        const onNewMessageWrapper = (element) => {
            console.log('New message wrapper detected:', element, ", parsing twemoji");
            twemoji__WEBPACK_IMPORTED_MODULE_0__["default"].parse(element, {
                base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/15.1.0/",
                folder: "72x72", // or "svg" for vector format
                ext: ".png" // or ".svg"
            });
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }
}


/***/ }),

/***/ "./src/shared.ts":
/*!***********************!*\
  !*** ./src/shared.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CLASS_COLORS: () => (/* binding */ CLASS_COLORS),
/* harmony export */   CLASS_PROPERTIES: () => (/* binding */ CLASS_PROPERTIES),
/* harmony export */   DEFAULT_BACKGROUNDS: () => (/* binding */ DEFAULT_BACKGROUNDS),
/* harmony export */   DEFAULT_COLORS: () => (/* binding */ DEFAULT_COLORS),
/* harmony export */   DEFAULT_EMOJIS: () => (/* binding */ DEFAULT_EMOJIS),
/* harmony export */   DEFAULT_FONTS: () => (/* binding */ DEFAULT_FONTS),
/* harmony export */   DEFAULT_PIXEL_VALUES: () => (/* binding */ DEFAULT_PIXEL_VALUES),
/* harmony export */   GROUP_DESCRIPTIONS: () => (/* binding */ GROUP_DESCRIPTIONS)
/* harmony export */ });
/* harmony import */ var _contribution_descriptions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./contribution/descriptions */ "./src/contribution/descriptions.ts");
/**
 * File: shared.ts
 *
 * Stores shared variables / constants between main.ts and popup.ts
 *
 */

// CSS Variables for colors
const DefaultColors = {
    "--colorNeutralForeground1": "#242424",
    "--colorNeutralForeground1Hover": "#242424",
    "--colorNeutralForeground1Pressed": "#242424",
    "--colorNeutralForeground1Selected": "#242424",
    "--colorNeutralForeground2": "#424242",
    "--colorNeutralForeground2Hover": "#242424",
    "--colorNeutralForeground2Pressed": "#242424",
    "--colorNeutralForeground2Selected": "#242424",
    "--colorNeutralForeground2BrandHover": "#5b5fc7",
    "--colorNeutralForeground2BrandPressed": "#4f52b2",
    "--colorNeutralForeground2BrandSelected": "#5b5fc7",
    "--colorNeutralForeground3": "#616161",
    "--colorNeutralForeground3Hover": "#424242",
    "--colorNeutralForeground3Pressed": "#424242",
    "--colorNeutralForeground3Selected": "#424242",
    "--colorNeutralForeground3BrandHover": "#5b5fc7",
    "--colorNeutralForeground3BrandPressed": "#4f52b2",
    "--colorNeutralForeground3BrandSelected": "#5b5fc7",
    "--colorNeutralForeground4": "#707070",
    "--colorNeutralForegroundDisabled": "#bdbdbd",
    "--colorNeutralForegroundInvertedDisabled": "rgba(255, 255, 255, 0.4)",
    "--colorBrandForegroundLink": "#4f52b2",
    "--colorBrandForegroundLinkHover": "#444791",
    "--colorBrandForegroundLinkPressed": "#383966",
    "--colorBrandForegroundLinkSelected": "#4f52b2",
    "--colorNeutralForeground2Link": "#424242",
    "--colorNeutralForeground2LinkHover": "#242424",
    "--colorNeutralForeground2LinkPressed": "#242424",
    "--colorNeutralForeground2LinkSelected": "#242424",
    "--colorCompoundBrandForeground1": "#5b5fc7",
    "--colorCompoundBrandForeground1Hover": "#4f52b2",
    "--colorCompoundBrandForeground1Pressed": "#444791",
    "--colorBrandForeground1": "#5b5fc7",
    "--colorBrandForeground2": "#4f52b2",
    "--colorBrandForeground2Hover": "#444791",
    "--colorBrandForeground2Pressed": "#333357",
    "--colorNeutralForeground1Static": "#242424",
    "--colorNeutralForegroundStaticInverted": "#ffffff",
    "--colorNeutralForegroundInverted": "#ffffff",
    "--colorNeutralForegroundInvertedHover": "#ffffff",
    "--colorNeutralForegroundInvertedPressed": "#ffffff",
    "--colorNeutralForegroundInvertedSelected": "#ffffff",
    "--colorNeutralForegroundInverted2": "#ffffff",
    "--colorNeutralForegroundOnBrand": "#ffffff",
    "--colorNeutralForegroundInvertedLink": "#ffffff",
    "--colorNeutralForegroundInvertedLinkHover": "#ffffff",
    "--colorNeutralForegroundInvertedLinkPressed": "#ffffff",
    "--colorNeutralForegroundInvertedLinkSelected": "#ffffff",
    "--colorBrandForegroundInverted": "#7f85f5",
    "--colorBrandForegroundInvertedHover": "#9299f7",
    "--colorBrandForegroundInvertedPressed": "#7f85f5",
    "--colorBrandForegroundOnLight": "#5b5fc7",
    "--colorBrandForegroundOnLightHover": "#4f52b2",
    "--colorBrandForegroundOnLightPressed": "#3d3e78",
    "--colorBrandForegroundOnLightSelected": "#444791",
    "--colorNeutralBackground1": "#ffffff",
    "--colorNeutralBackground1Hover": "#f5f5f5",
    "--colorNeutralBackground1Pressed": "#e0e0e0",
    "--colorNeutralBackground1Selected": "#ebebeb",
    "--colorNeutralBackground2": "#fafafa",
    "--colorNeutralBackground2Hover": "#f0f0f0",
    "--colorNeutralBackground2Pressed": "#dbdbdb",
    "--colorNeutralBackground2Selected": "#e6e6e6",
    "--colorNeutralBackground3": "#f5f5f5",
    "--colorNeutralBackground3Hover": "#ebebeb",
    "--colorNeutralBackground3Pressed": "#d6d6d6",
    "--colorNeutralBackground3Selected": "#e0e0e0",
    "--colorNeutralBackground4": "#f0f0f0",
    "--colorNeutralBackground4Hover": "#fafafa",
    "--colorNeutralBackground4Pressed": "#f5f5f5",
    "--colorNeutralBackground4Selected": "#ffffff",
    "--colorNeutralBackground5": "#ebebeb",
    "--colorNeutralBackground5Hover": "#f5f5f5",
    "--colorNeutralBackground5Pressed": "#f0f0f0",
    "--colorNeutralBackground5Selected": "#fafafa",
    "--colorNeutralBackground6": "#e6e6e6",
    "--colorNeutralBackgroundInverted": "#292929",
    "--colorNeutralBackgroundStatic": "#333333",
    "--colorNeutralBackgroundAlpha": "rgba(255,255,255,0.50)",
    "--colorNeutralBackgroundAlpha2": "rgba(255,255,255,0.80)",
    "--colorSubtleBackgroundHover": "#f5f5f5",
    "--colorSubtleBackgroundPressed": "#e0e0e0",
    "--colorSubtleBackgroundSelected": "#ebebeb",
    "--colorSubtleBackgroundLightAlphaHover": "rgba(255, 255, 255, 0.7)",
    "--colorSubtleBackgroundLightAlphaPressed": "rgba(255, 255, 255, 0.5)",
    "--colorSubtleBackgroundInvertedHover": "rgba(0, 0, 0, 0.1)",
    "--colorSubtleBackgroundInvertedPressed": "rgba(0, 0, 0, 0.3)",
    "--colorSubtleBackgroundInvertedSelected": "rgba(0, 0, 0, 0.2)",
    "--colorNeutralBackgroundDisabled": "#f0f0f0",
    "--colorNeutralBackgroundInvertedDisabled": "rgba(255, 255, 255, 0.1)",
    "--colorNeutralStencil1": "#e6e6e6",
    "--colorNeutralStencil2": "#fafafa",
    "--colorNeutralStencil1Alpha": "rgba(0, 0, 0, 0.1)",
    "--colorNeutralStencil2Alpha": "rgba(0, 0, 0, 0.05)",
    "--colorBackgroundOverlay": "rgba(0, 0, 0, 0.4)",
    "--colorScrollbarOverlay": "rgba(0, 0, 0, 0.5)",
    "--colorBrandBackground": "#5b5fc7",
    "--colorBrandBackgroundHover": "#4f52b2",
    "--colorBrandBackgroundPressed": "#383966",
    "--colorBrandBackgroundSelected": "#444791",
    "--colorCompoundBrandBackground": "#5b5fc7",
    "--colorCompoundBrandBackgroundHover": "#4f52b2",
    "--colorCompoundBrandBackgroundPressed": "#444791",
    "--colorBrandBackgroundStatic": "#5b5fc7",
    "--colorBrandBackground2": "#E8EBFA",
    "--colorBrandBackground2Hover": "#dce0fa",
    "--colorBrandBackground2Pressed": "#b6bcfa",
    "--colorBrandBackground3Static": "#444791",
    "--colorBrandBackground4Static": "#383966",
    "--colorBrandBackgroundInverted": "#ffffff",
    "--colorBrandBackgroundInvertedHover": "#e8ebfa",
    "--colorBrandBackgroundInvertedPressed": "#c5cbfa",
    "--colorBrandBackgroundInvertedSelected": "#dce0fa",
    "--colorNeutralCardBackground": "#fafafa",
    "--colorNeutralCardBackgroundHover": "#ffffff",
    "--colorNeutralCardBackgroundPressed": "#f5f5f5",
    "--colorNeutralCardBackgroundSelected": "#ebebeb",
    "--colorNeutralCardBackgroundDisabled": "#f0f0f0",
    "--colorNeutralStrokeAccessible": "#616161",
    "--colorNeutralStrokeAccessibleHover": "#575757",
    "--colorNeutralStrokeAccessiblePressed": "#4d4d4d",
    "--colorNeutralStrokeAccessibleSelected": "#5b5fc7",
    "--colorNeutralStroke1": "#d1d1d1",
    "--colorNeutralStroke1Hover": "#c7c7c7",
    "--colorNeutralStroke1Pressed": "#b3b3b3",
    "--colorNeutralStroke1Selected": "#bdbdbd",
    "--colorNeutralStroke2": "#e0e0e0",
    "--colorNeutralStroke3": "#f0f0f0",
    "--colorNeutralStrokeSubtle": "#e0e0e0",
    "--colorNeutralStrokeOnBrand": "#ffffff",
    "--colorNeutralStrokeOnBrand2": "#ffffff",
    "--colorNeutralStrokeOnBrand2Hover": "#ffffff",
    "--colorNeutralStrokeOnBrand2Pressed": "#ffffff",
    "--colorNeutralStrokeOnBrand2Selected": "#ffffff",
    "--colorBrandStroke1": "#5b5fc7",
    "--colorBrandStroke2": "#c5cbfa",
    "--colorBrandStroke2Hover": "#aab1fa",
    "--colorBrandStroke2Pressed": "#5b5fc7",
    "--colorBrandStroke2Contrast": "#c5cbfa",
    "--colorCompoundBrandStroke": "#5b5fc7",
    "--colorCompoundBrandStrokeHover": "#4f52b2",
    "--colorCompoundBrandStrokePressed": "#444791",
    "--colorNeutralStrokeDisabled": "#e0e0e0",
    "--colorNeutralStrokeInvertedDisabled": "rgba(255, 255, 255, 0.4)",
    "--colorNeutralStrokeAlpha": "rgba(0, 0, 0, 0.05)",
    "--colorNeutralStrokeAlpha2": "rgba(255, 255, 255, 0.2)",
    "--colorStrokeFocus1": "#ffffff",
    "--colorStrokeFocus2": "#000000",
    "--colorNeutralShadowAmbient": "rgba(0,0,0,0.12)",
    "--colorNeutralShadowKey": "rgba(0,0,0,0.14)",
    "--colorNeutralShadowAmbientLighter": "rgba(0,0,0,0.06)",
    "--colorNeutralShadowKeyLighter": "rgba(0,0,0,0.07)",
    "--colorNeutralShadowAmbientDarker": "rgba(0,0,0,0.20)",
    "--colorNeutralShadowKeyDarker": "rgba(0,0,0,0.24)",
    "--colorBrandShadowAmbient": "rgba(0,0,0,0.30)",
    "--colorBrandShadowKey": "rgba(0,0,0,0.25)",
    "--colorPaletteRedBackground1": "#fdf6f6",
    "--colorPaletteRedBackground2": "#f1bbbc",
    "--colorPaletteRedBackground3": "#d13438",
    "--colorPaletteRedForeground1": "#bc2f32",
    "--colorPaletteRedForeground2": "#751d1f",
    "--colorPaletteRedForeground3": "#d13438",
    "--colorPaletteRedBorderActive": "#d13438",
    "--colorPaletteRedBorder1": "#f1bbbc",
    "--colorPaletteRedBorder2": "#d13438",
    "--colorPaletteGreenBackground1": "#f1faf1",
    "--colorPaletteGreenBackground2": "#9fd89f",
    "--colorPaletteGreenBackground3": "#107c10",
    "--colorPaletteGreenForeground1": "#0e700e",
    "--colorPaletteGreenForeground2": "#094509",
    "--colorPaletteGreenForeground3": "#107c10",
    "--colorPaletteGreenBorderActive": "#107c10",
    "--colorPaletteGreenBorder1": "#9fd89f",
    "--colorPaletteGreenBorder2": "#107c10",
    "--colorPaletteDarkOrangeBackground1": "#fdf6f3",
    "--colorPaletteDarkOrangeBackground2": "#f4bfab",
    "--colorPaletteDarkOrangeBackground3": "#da3b01",
    "--colorPaletteDarkOrangeForeground1": "#c43501",
    "--colorPaletteDarkOrangeForeground2": "#7a2101",
    "--colorPaletteDarkOrangeForeground3": "#da3b01",
    "--colorPaletteDarkOrangeBorderActive": "#da3b01",
    "--colorPaletteDarkOrangeBorder1": "#f4bfab",
    "--colorPaletteDarkOrangeBorder2": "#da3b01",
    "--colorPaletteYellowBackground1": "#fffef5",
    "--colorPaletteYellowBackground2": "#fef7b2",
    "--colorPaletteYellowBackground3": "#fde300",
    "--colorPaletteYellowForeground1": "#817400",
    "--colorPaletteYellowForeground2": "#817400",
    "--colorPaletteYellowForeground3": "#fde300",
    "--colorPaletteYellowBorderActive": "#fde300",
    "--colorPaletteYellowBorder1": "#fef7b2",
    "--colorPaletteYellowBorder2": "#fde300",
    "--colorPaletteBerryBackground1": "#fdf5fc",
    "--colorPaletteBerryBackground2": "#edbbe7",
    "--colorPaletteBerryBackground3": "#c239b3",
    "--colorPaletteBerryForeground1": "#af33a1",
    "--colorPaletteBerryForeground2": "#6d2064",
    "--colorPaletteBerryForeground3": "#c239b3",
    "--colorPaletteBerryBorderActive": "#c239b3",
    "--colorPaletteBerryBorder1": "#edbbe7",
    "--colorPaletteBerryBorder2": "#c239b3",
    "--colorPaletteLightGreenBackground1": "#f2fbf2",
    "--colorPaletteLightGreenBackground2": "#a7e3a5",
    "--colorPaletteLightGreenBackground3": "#13a10e",
    "--colorPaletteLightGreenForeground1": "#11910d",
    "--colorPaletteLightGreenForeground2": "#0b5a08",
    "--colorPaletteLightGreenForeground3": "#13a10e",
    "--colorPaletteLightGreenBorderActive": "#13a10e",
    "--colorPaletteLightGreenBorder1": "#a7e3a5",
    "--colorPaletteLightGreenBorder2": "#13a10e",
    "--colorPaletteMarigoldBackground1": "#fefbf4",
    "--colorPaletteMarigoldBackground2": "#f9e2ae",
    "--colorPaletteMarigoldBackground3": "#eaa300",
    "--colorPaletteMarigoldForeground1": "#d39300",
    "--colorPaletteMarigoldForeground2": "#835b00",
    "--colorPaletteMarigoldForeground3": "#eaa300",
    "--colorPaletteMarigoldBorderActive": "#eaa300",
    "--colorPaletteMarigoldBorder1": "#f9e2ae",
    "--colorPaletteMarigoldBorder2": "#eaa300",
    "--colorPaletteRedForegroundInverted": "#dc5e62",
    "--colorPaletteGreenForegroundInverted": "#359b35",
    "--colorPaletteYellowForegroundInverted": "#fef7b2",
    "--colorPaletteDarkRedBackground2": "#d69ca5",
    "--colorPaletteDarkRedForeground2": "#420610",
    "--colorPaletteDarkRedBorderActive": "#750b1c",
    "--colorPaletteCranberryBackground2": "#eeacb2",
    "--colorPaletteCranberryForeground2": "#6e0811",
    "--colorPaletteCranberryBorderActive": "#c50f1f",
    "--colorPalettePumpkinBackground2": "#efc4ad",
    "--colorPalettePumpkinForeground2": "#712d09",
    "--colorPalettePumpkinBorderActive": "#ca5010",
    "--colorPalettePeachBackground2": "#ffddb3",
    "--colorPalettePeachForeground2": "#8f4e00",
    "--colorPalettePeachBorderActive": "#ff8c00",
    "--colorPaletteGoldBackground2": "#ecdfa5",
    "--colorPaletteGoldForeground2": "#6c5700",
    "--colorPaletteGoldBorderActive": "#c19c00",
    "--colorPaletteBrassBackground2": "#e0cea2",
    "--colorPaletteBrassForeground2": "#553e06",
    "--colorPaletteBrassBorderActive": "#986f0b",
    "--colorPaletteBrownBackground2": "#ddc3b0",
    "--colorPaletteBrownForeground2": "#50301a",
    "--colorPaletteBrownBorderActive": "#8e562e",
    "--colorPaletteForestBackground2": "#bdd99b",
    "--colorPaletteForestForeground2": "#294903",
    "--colorPaletteForestBorderActive": "#498205",
    "--colorPaletteSeafoamBackground2": "#a8f0cd",
    "--colorPaletteSeafoamForeground2": "#00723b",
    "--colorPaletteSeafoamBorderActive": "#00cc6a",
    "--colorPaletteDarkGreenBackground2": "#9ad29a",
    "--colorPaletteDarkGreenForeground2": "#063b06",
    "--colorPaletteDarkGreenBorderActive": "#0b6a0b",
    "--colorPaletteLightTealBackground2": "#a6e9ed",
    "--colorPaletteLightTealForeground2": "#00666d",
    "--colorPaletteLightTealBorderActive": "#00b7c3",
    "--colorPaletteTealBackground2": "#9bd9db",
    "--colorPaletteTealForeground2": "#02494c",
    "--colorPaletteTealBorderActive": "#038387",
    "--colorPaletteSteelBackground2": "#94c8d4",
    "--colorPaletteSteelForeground2": "#00333f",
    "--colorPaletteSteelBorderActive": "#005b70",
    "--colorPaletteBlueBackground2": "#a9d3f2",
    "--colorPaletteBlueForeground2": "#004377",
    "--colorPaletteBlueBorderActive": "#0078d4",
    "--colorPaletteRoyalBlueBackground2": "#9abfdc",
    "--colorPaletteRoyalBlueForeground2": "#002c4e",
    "--colorPaletteRoyalBlueBorderActive": "#004e8c",
    "--colorPaletteCornflowerBackground2": "#c8d1fa",
    "--colorPaletteCornflowerForeground2": "#2c3c85",
    "--colorPaletteCornflowerBorderActive": "#4f6bed",
    "--colorPaletteNavyBackground2": "#a3b2e8",
    "--colorPaletteNavyForeground2": "#001665",
    "--colorPaletteNavyBorderActive": "#0027b4",
    "--colorPaletteLavenderBackground2": "#d2ccf8",
    "--colorPaletteLavenderForeground2": "#3f3682",
    "--colorPaletteLavenderBorderActive": "#7160e8",
    "--colorPalettePurpleBackground2": "#c6b1de",
    "--colorPalettePurpleForeground2": "#341a51",
    "--colorPalettePurpleBorderActive": "#5c2e91",
    "--colorPaletteGrapeBackground2": "#d9a7e0",
    "--colorPaletteGrapeForeground2": "#4c0d55",
    "--colorPaletteGrapeBorderActive": "#881798",
    "--colorPaletteLilacBackground2": "#e6bfed",
    "--colorPaletteLilacForeground2": "#63276d",
    "--colorPaletteLilacBorderActive": "#b146c2",
    "--colorPalettePinkBackground2": "#f7c0e3",
    "--colorPalettePinkForeground2": "#80215d",
    "--colorPalettePinkBorderActive": "#e43ba6",
    "--colorPaletteMagentaBackground2": "#eca5d1",
    "--colorPaletteMagentaForeground2": "#6b0043",
    "--colorPaletteMagentaBorderActive": "#bf0077",
    "--colorPalettePlumBackground2": "#d696c0",
    "--colorPalettePlumForeground2": "#43002b",
    "--colorPalettePlumBorderActive": "#77004d",
    "--colorPaletteBeigeBackground2": "#d7d4d4",
    "--colorPaletteBeigeForeground2": "#444241",
    "--colorPaletteBeigeBorderActive": "#7a7574",
    "--colorPaletteMinkBackground2": "#cecccb",
    "--colorPaletteMinkForeground2": "#343231",
    "--colorPaletteMinkBorderActive": "#5d5a58",
    "--colorPalettePlatinumBackground2": "#cdd6d8",
    "--colorPalettePlatinumForeground2": "#3b4447",
    "--colorPalettePlatinumBorderActive": "#69797e",
    "--colorPaletteAnchorBackground2": "#bcc3c7",
    "--colorPaletteAnchorForeground2": "#202427",
    "--colorPaletteAnchorBorderActive": "#394146",
    "--colorStatusSuccessBackground1": "#f1faf1",
    "--colorStatusSuccessBackground2": "#9fd89f",
    "--colorStatusSuccessBackground3": "#107c10",
    "--colorStatusSuccessForeground1": "#0e700e",
    "--colorStatusSuccessForeground2": "#094509",
    "--colorStatusSuccessForeground3": "#107c10",
    "--colorStatusSuccessForegroundInverted": "#54b054",
    "--colorStatusSuccessBorderActive": "#107c10",
    "--colorStatusSuccessBorder1": "#9fd89f",
    "--colorStatusSuccessBorder2": "#107c10",
    "--colorStatusWarningBackground1": "#fff9f5",
    "--colorStatusWarningBackground2": "#fdcfb4",
    "--colorStatusWarningBackground3": "#f7630c",
    "--colorStatusWarningForeground1": "#bc4b09",
    "--colorStatusWarningForeground2": "#8a3707",
    "--colorStatusWarningForeground3": "#bc4b09",
    "--colorStatusWarningForegroundInverted": "#faa06b",
    "--colorStatusWarningBorderActive": "#f7630c",
    "--colorStatusWarningBorder1": "#fdcfb4",
    "--colorStatusWarningBorder2": "#bc4b09",
    "--colorStatusDangerBackground1": "#fdf3f4",
    "--colorStatusDangerBackground2": "#eeacb2",
    "--colorStatusDangerBackground3": "#c50f1f",
    "--colorStatusDangerForeground1": "#b10e1c",
    "--colorStatusDangerForeground2": "#6e0811",
    "--colorStatusDangerForeground3": "#c50f1f",
    "--colorStatusDangerForegroundInverted": "#dc626d",
    "--colorStatusDangerBorderActive": "#c50f1f",
    "--colorStatusDangerBorder1": "#eeacb2",
    "--colorStatusDangerBorder2": "#c50f1f",
    "--colorStatusDangerBackground3Hover": "#b10e1c",
    "--colorStatusDangerBackground3Pressed": "#960b18",
    "--backgroundCanvas": "#fff",
    "--colorAvatar": "#5b5fc7",
    "--colorAvatarBackground": "#c5cbfa",
    "--colorDefaultBackground7": "#F5F5F5",
    "--colorTeamsBrand1Hover": "#4f52b2",
    "--colorTeamsBrand1Pressed": "#444791",
    "--colorTeamsBrand1Selected": "#444791",
    "--colorTeamsNeutralStrokeSubtleAlpha": "rgba(0,0,0,.95)",
    "--colorPaletteRedForeground1HCBlack": "#bc2f32",
    "--colorPaletteRedBackground3Hover": "#BC2E2E",
    "--colorPaletteRedBackground3Pressed": "#9F282B",
    "--colorTeamsButtonCompositeHoverShadow1": "rgba(93, 91, 212, 0.05)",
    "--colorTeamsButtonCompositeHoverShadow2": "rgba(159, 162, 252, 0.08)",
    "--colorTeamsButtonCompositeHoverShadow3": "rgba(251, 174, 164, 0.08)",
    "--colorTeamsButtonCompositeHoverShadow4": "rgba(121, 207, 255, 0.08)",
    "--colorTeamsButtonCompositeFocusShadow1": "rgba(93, 91, 212, 0.1)",
    "--colorTeamsButtonCompositeFocusShadow2": "rgba(159, 162, 252, 0.15)",
    "--colorTeamsButtonCompositeFocusShadow3": "rgba(251, 174, 164, 0.1)",
    "--colorTeamsButtonCompositeFocusShadow4": "rgba(121, 207, 255, 0.1)",
    "--colorTeamsCompositeHoverShadow1": "rgba(93, 91, 212, 0.1)",
    "--colorTeamsCompositeHoverShadow2": "rgba(159, 162, 252, 0.06)",
    "--colorTeamsCompositeHoverShadow3": "rgba(251, 174, 164, 0.1)",
    "--colorTeamsCompositeHoverShadow4": "rgba(121, 207, 255, 0.05)",
    "--colorTeamsCompositeActiveShadow1": "rgba(93, 91, 212, 0.2)",
    "--colorTeamsCompositeActiveShadow2": "rgba(159, 162, 252, 0.12)",
    "--colorTeamsCompositeActiveShadow3": "rgba(251, 174, 164, 0.2)",
    "--colorTeamsCompositeActiveShadow4": "rgba(121, 207, 255, 0.2)"
};
// CSS Variables for other settings
const aDEFAULT_PIXEL_VALUES = {
    "--borderRadiusNone": "0",
    "--borderRadiusSmall": "2px",
    "--borderRadiusMedium": "4px",
    "--borderRadiusLarge": "6px",
    "--borderRadiusXLarge": "8px",
    "--borderRadiusCircular": "10000px",
    "--fontSizeBase100": "10px",
    "--fontSizeBase200": "12px",
    "--fontSizeBase300": "14px",
    "--fontSizeBase400": "16px",
    "--fontSizeBase500": "20px",
    "--fontSizeBase600": "24px",
    "--fontSizeHero700": "28px",
    "--fontSizeHero800": "32px",
    "--fontSizeHero900": "40px",
    "--fontSizeHero1000": "68px",
    "--lineHeightBase100": "14px",
    "--lineHeightBase200": "16px",
    "--lineHeightBase300": "20px",
    "--lineHeightBase400": "22px",
    "--lineHeightBase500": "28px",
    "--lineHeightBase600": "32px",
    "--lineHeightHero700": "36px",
    "--lineHeightHero800": "40px",
    "--lineHeightHero900": "52px",
    "--lineHeightHero1000": "92px",
    "--fontWeightRegular": "400",
    "--fontWeightMedium": "500",
    "--fontWeightSemibold": "600",
    "--fontWeightBold": "700",
    "--strokeWidthThin": "1px",
    "--strokeWidthThick": "2px",
    "--strokeWidthThicker": "3px",
    "--strokeWidthThickest": "4px",
    "--spacingHorizontalNone": "0",
    "--spacingHorizontalXXS": "2px",
    "--spacingHorizontalXS": "4px",
    "--spacingHorizontalSNudge": "6px",
    "--spacingHorizontalS": "8px",
    "--spacingHorizontalMNudge": "10px",
    "--spacingHorizontalM": "12px",
    "--spacingHorizontalL": "16px",
    "--spacingHorizontalXL": "20px",
    "--spacingHorizontalXXL": "24px",
    "--spacingHorizontalXXXL": "32px",
    "--spacingVerticalNone": "0",
    "--spacingVerticalXXS": "2px",
    "--spacingVerticalXS": "4px",
    "--spacingVerticalSNudge": "6px",
    "--spacingVerticalS": "8px",
    "--spacingVerticalMNudge": "10px",
    "--spacingVerticalM": "12px",
    "--spacingVerticalL": "16px",
    "--spacingVerticalXL": "20px",
    "--spacingVerticalXXL": "24px",
    "--spacingVerticalXXXL": "32px",
    "--shadow2": "0 0 2px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.14)",
    "--shadow4": "0 0 2px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.14)",
    "--shadow8": "0 0 2px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.14)",
    "--shadow16": "0 0 2px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.14)",
    "--shadow28": "0 0 8px rgba(0,0,0,0.12), 0 14px 28px rgba(0,0,0,0.14)",
    "--shadow64": "0 0 8px rgba(0,0,0,0.12), 0 32px 64px rgba(0,0,0,0.14)",
    "--shadow2Brand": "0 0 2px rgba(0,0,0,0.30), 0 1px 2px rgba(0,0,0,0.25)",
    "--shadow4Brand": "0 0 2px rgba(0,0,0,0.30), 0 2px 4px rgba(0,0,0,0.25)",
    "--shadow8Brand": "0 0 2px rgba(0,0,0,0.30), 0 4px 8px rgba(0,0,0,0.25)",
    "--shadow16Brand": "0 0 2px rgba(0,0,0,0.30), 0 8px 16px rgba(0,0,0,0.25)",
    "--shadow28Brand": "0 0 8px rgba(0,0,0,0.30), 0 14px 28px rgba(0,0,0,0.25)",
    "--shadow64Brand": "0 0 8px rgba(0,0,0,0.30), 0 32px 64px rgba(0,0,0,0.25)"
};
// CSS Classes
// - Some may not work due to random class gen
const aCLASS_COLORS = {
    "ff": "rgb(36, 36, 36)",
    "oh": "rgb(36, 36, 36)",
    "jg": "rgb(250, 250, 250)",
    "ui-toolbar__item": "rgb(36, 36, 36)",
    "oi": "rgb(36, 36, 36)",
    "fui-StyledText": "rgb(36, 36, 36)",
    "ui-popup__content__content": "#F5F5F5",
    "ui-list__item:hover": "rgb(245, 245, 245)"
};
// Fonts
const aDEFAULT_FONTS = {
    "fontFamily": '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
    "imports": ""
};
// CSS Class property to change
const aCLASS_PROPERTIES = {
    "ff": "color",
    "oh": "color",
    "jg": "background",
    "ui-toolbar__item": "color",
    "oi": "color",
    "fui-StyledText": "color",
    "ui-popup__content__content": "background",
    "ui-list__item:hover": "background"
};
const aDEFAULT_BACKGROUNDS = {
    "channelAndChatBackground": "none",
    "fullBackgroundExperience": "false",
    "backdropFilter": "",
    "interfaceOpacity": "0.1"
};
const aDEFAULT_EMOJIS = {
    "set": "default"
};
////////// EXPORTS //////////
const DEFAULT_COLORS = DefaultColors;
const DEFAULT_PIXEL_VALUES = aDEFAULT_PIXEL_VALUES;
const DEFAULT_FONTS = aDEFAULT_FONTS;
const CLASS_COLORS = aCLASS_COLORS;
const GROUP_DESCRIPTIONS = _contribution_descriptions__WEBPACK_IMPORTED_MODULE_0__.aGROUP_DESCRIPTIONS;
const CLASS_PROPERTIES = aCLASS_PROPERTIES;
const DEFAULT_BACKGROUNDS = aDEFAULT_BACKGROUNDS;
const DEFAULT_EMOJIS = aDEFAULT_EMOJIS;


/***/ }),

/***/ "./src/ui/appsMenuManager.ts":
/*!***********************************!*\
  !*** ./src/ui/appsMenuManager.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppsMenuManager: () => (/* binding */ AppsMenuManager)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _tabInject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tabInject */ "./src/ui/tabInject.ts");


const APP_LIST_APP_ELEMENT_HTML = `
<span class="apps-list-app">
    <span class="apps-list-app-card" id="appListCard">
        <img src="https://cdn-icons-png.flaticon.com/512/1144/1144760.png" alt="App Icon" class="app-icon" id="appIcon">
        <span class="apps-list-filler"></span>
        <span class="app-name" id="appName">Bob app that is really really cool</span>
    </span>
    <span type="button" class="app-pin-button" id="pinApp">
        <img src="https://www.svgrepo.com/show/501306/pin.svg" alt="" class="pin-icon">
    </span>
</span>
`;
const APP_MENU_ELEMENT_HTML = `
<span class="apps-menu" id="appsMenu">
    <span class="apps-menu-header">
        <h3 class="apps-menu-title">TeamsPlus apps</h3>
    </span>
    <span class="apps-list" id="appList">


    </span>
</span>
`;
const APP_MENU_ICON_SVG = `
<?xml version="1.0" encoding="UTF-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>apps</title>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon" fill="var(--colorNeutralForeground3)" transform="translate(64.000000, 64.000000)">
            <path d="M64,32 C64,49.664 49.664,64 32,64 C14.336,64 -4.26325641e-14,49.664 -4.26325641e-14,32 C-4.26325641e-14,14.336 14.336,-4.26325641e-14 32,-4.26325641e-14 C49.664,-4.26325641e-14 64,14.336 64,32 Z M224,32 C224,49.664 209.664,64 192,64 C174.336,64 160,49.664 160,32 C160,14.336 174.336,-4.26325641e-14 192,-4.26325641e-14 C209.664,-4.26325641e-14 224,14.336 224,32 Z M64,352 C64,369.664 49.664,384 32,384 C14.336,384 -4.26325641e-14,369.664 -4.26325641e-14,352 C-4.26325641e-14,334.336 14.336,320 32,320 C49.664,320 64,334.336 64,352 Z M224,352 C224,369.664 209.664,384 192,384 C174.336,384 160,369.664 160,352 C160,334.336 174.336,320 192,320 C209.664,320 224,334.336 224,352 Z M64,192 C64,209.664 49.664,224 32,224 C14.336,224 -4.26325641e-14,209.664 -4.26325641e-14,192 C-4.26325641e-14,174.336 14.336,160 32,160 C49.664,160 64,174.336 64,192 Z M224,192 C224,209.664 209.664,224 192,224 C174.336,224 160,209.664 160,192 C160,174.336 174.336,160 192,160 C209.664,160 224,174.336 224,192 Z M384,32 C384,49.664 369.664,64 352,64 C334.336,64 320,49.664 320,32 C320,14.336 334.336,-4.26325641e-14 352,-4.26325641e-14 C369.664,-4.26325641e-14 384,14.336 384,32 Z M384,352 C384,369.664 369.664,384 352,384 C334.336,384 320,369.664 320,352 C320,334.336 334.336,320 352,320 C369.664,320 384,334.336 384,352 Z M384,192 C384,209.664 369.664,224 352,224 C334.336,224 320,209.664 320,192 C320,174.336 334.336,160 352,160 C369.664,160 384,174.336 384,192 Z" id="Combined-Shape">

</path>
        </g>
    </g>
</svg>
`;
const ANIMATION_DURATION = 250;
class AppsMenuManager {
    appMenuElement;
    appMenuButton;
    appMenuCreated = false;
    constructor() {
        this.initializeAppMenu();
        window.teamsPlusAppsManager = this;
    }
    async initializeAppMenu() {
        await this.createAppMenu();
        this.createButtonListeners();
        this.appMenuCreated = true;
    }
    async isApplicationPinned(name) {
        const result = await chrome.storage.local.get(["pinnedApplications"]);
        if (!result.pinnedApplications) {
            return false;
        }
        if (!result.pinnedApplications[name]) {
            return false;
        }
        return true;
    }
    async createAppMenu() {
        this.appMenuElement = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(APP_MENU_ELEMENT_HTML);
        this.appMenuButton = await (0,_tabInject__WEBPACK_IMPORTED_MODULE_1__.injectTab)("TeamsPlus", APP_MENU_ICON_SVG);
        if (this.appMenuButton == null) {
            throw new Error("Failed to inject app menu tab");
        }
        document.body.appendChild(this.appMenuElement);
    }
    animateVisibility(visibility) {
        if (visibility) {
            this.appMenuElement.animate([
                { transform: "translateY(-5%)", opacity: 0 },
                { transform: "translateY(0%)", opacity: 1 }
            ], {
                duration: ANIMATION_DURATION,
                easing: "ease-out",
                iterations: 1,
                fill: "forwards"
            });
        }
        else {
            this.appMenuElement.animate([
                { transform: "translateY(0%)", opacity: 1 },
                { transform: "translateY(-5%)", opacity: 0 }
            ], {
                duration: ANIMATION_DURATION,
                easing: "ease-in",
                iterations: 1,
                fill: "forwards"
            });
        }
    }
    toggleVisibility() {
        //this.appMenuElement.classList.toggle("active");
        if (this.appMenuElement.classList.contains("active")) {
            this.setVisiblity(false);
        }
        else {
            this.setVisiblity(true);
        }
    }
    setVisiblity(visibility) {
        if (visibility == false && this.appMenuElement.classList.contains("active") == true) {
            this.animateVisibility(false);
            setTimeout(() => {
                this.appMenuElement.classList.remove("active");
            }, ANIMATION_DURATION);
        }
        else {
            if (this.appMenuElement.classList.contains("active") == false && visibility == true) {
                this.appMenuElement.classList.add("active");
                // Set position
                const left = this.appMenuButton.clientLeft + this.appMenuButton.clientWidth;
                const top = this.appMenuButton.clientTop + this.appMenuButton.clientHeight;
                this.appMenuElement.style.left = `${left}px`;
                this.appMenuElement.style.top = `${top}px`;
                this.animateVisibility(true);
            }
        }
    }
    createButtonListeners() {
        this.appMenuButton.addEventListener("click", (event) => {
            this.toggleVisibility();
            if (event.target !== event.currentTarget && this.appMenuElement.contains(event.target)) {
                // click was inside the menu -> ignore
                return;
            }
            event.stopPropagation();
        });
        document.addEventListener("click", (event) => this.handleDocumentClick(event));
        this.appMenuElement.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }
    handleDocumentClick(event) {
        if (this.appMenuButton.classList.contains("active") == false)
            return;
        // check if the click is outside the menu and the button
        if (!this.appMenuElement.contains(event.target) &&
            !this.appMenuButton.contains(event.target)) {
            this.setVisiblity(false);
        }
    }
    async addAppAndGetButton(appName, imageSource, svgSource) {
        await new Promise(resolve => { const check = () => (this.appMenuCreated ? resolve(undefined) : setTimeout(check, 50)); check(); });
        if (this.appMenuCreated == false) {
            throw new Error("Attempt to create and add app before app menu initialization!");
        }
        const buttons = [];
        /// Create app thing
        const appElement = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(APP_LIST_APP_ELEMENT_HTML);
        const appIconElement = appElement.querySelector("#appIcon");
        const appNameElement = appElement.querySelector("#appName");
        appNameElement.textContent = appName;
        appIconElement.src = imageSource;
        const appMenuAppList = this.appMenuElement.querySelector("#appList");
        appMenuAppList.appendChild(appElement);
        console.log("Successfully added app in app menu");
        const cardButton = appElement.querySelector("#appListCard");
        cardButton.addEventListener("click", () => {
            this.setVisiblity(false);
        });
        const pinButton = appElement.querySelector("#pinApp");
        if (await this.isApplicationPinned(appName)) {
            pinButton.style.backgroundColor = "#655bffff";
        }
        pinButton.addEventListener("click", async () => {
            const r = await chrome.storage.local.get(["pinnedApplications"]);
            let pinnedApplications = r.pinnedApplications || {};
            pinnedApplications[appName] = !(pinnedApplications[appName] || false);
            if (pinnedApplications[appName] == true) {
                pinButton.style.backgroundColor = "#655bffff";
            }
            else {
                pinButton.style.backgroundColor = "transparent";
            }
            chrome.storage.local.set({ pinnedApplications });
        });
        buttons.push(cardButton);
        // If pinned, the tab button
        if (await this.isApplicationPinned(appName)) {
            const tabButton = await (0,_tabInject__WEBPACK_IMPORTED_MODULE_1__.injectTab)(appName, svgSource || `<img src="${imageSource}" alt="Icon">`);
            buttons.push(tabButton);
        }
        return buttons;
    }
}


/***/ }),

/***/ "./src/ui/pwdPrompt.ts":
/*!*****************************!*\
  !*** ./src/ui/pwdPrompt.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   promptAndWait: () => (/* binding */ promptAndWait)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");

const code = `
    <div class="password-popup" id="pwd-popup">
        <h3>Enter password</h3>
        <p>Enter password to encryption key</p>

        <input type="text" name="popup-pwd" id="popup-pwd-input" class="popup-pwd" autocomplete="off">

        <button type="button" id="ok-btn">OK</button>
    </div>`;
async function promptAndWait() {
    const popupElement = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(code);
    document.body.appendChild(popupElement);
    const input = popupElement.querySelector('input.popup-pwd');
    const okBtn = popupElement.querySelector('button');
    input.focus();
    return new Promise((resolve) => {
        const cleanup = () => {
            okBtn.removeEventListener('click', onOk);
            input.removeEventListener('keyup', onKeyUp);
            if (popupElement.parentNode) {
                popupElement.parentNode.removeChild(popupElement);
            }
        };
        const onOk = () => {
            resolve(input.value);
            cleanup();
        };
        const onKeyUp = (e) => {
            if (e.key === 'Enter') {
                onOk();
            }
        };
        okBtn.addEventListener('click', onOk);
        input.addEventListener('keyup', onKeyUp);
    });
}


/***/ }),

/***/ "./src/ui/tabInject.ts":
/*!*****************************!*\
  !*** ./src/ui/tabInject.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   injectTab: () => (/* binding */ injectTab)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");

const TAB_HTML = `


<div>
    <div class="injected-parent-div">
        <button type="button" class="injected-parent-button">
            <span class="injected-tab-upper-span">
              <div class=".injected-tab-div2">
                <div class="injected-tab-upper-div"></div>
                <span class="injected-tab-span">Delayed Send</span>
              </div>
            </span>
        </button>
    </div>
</div>
`;
async function injectTab(tabName, svgSrc) {
    const parent = await (0,_utils__WEBPACK_IMPORTED_MODULE_0__.waitForElement)('[role="navigation"]');
    const newElement = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(TAB_HTML);
    const span = newElement.querySelector(".injected-tab-span");
    const div = newElement.querySelector(".injected-tab-upper-div");
    //const img: HTMLImageElement | null = newElement.querySelector(".injected-tab-img");
    const btn = newElement.querySelector("button");
    if (span == null || btn == null || div == null) {
        throw new Error("Span or img or btn not found in injected tab");
    }
    const svg = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.p_stringToElement)(svgSrc);
    svg.classList.add("injected-tab-img");
    div.prepend(svg);
    span.textContent = tabName;
    parent.appendChild(newElement);
    return btn;
}


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p_stringToElement: () => (/* binding */ p_stringToElement),
/* harmony export */   waitForElement: () => (/* binding */ waitForElement)
/* harmony export */ });
const parser = new DOMParser();
function waitForElement(selector) {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver((mutations) => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect(); // Stop observing once the element is found
                resolve(element);
            }
        });
        observer.observe(document.body, {
            childList: true, // Observe direct children being added or removed
            subtree: true, // Observe all descendants
        });
        // Optional: Set a timeout to reject the promise if the element doesn't appear
        setTimeout(() => {
            observer.disconnect();
            reject(new Error('Element not found within time limit'));
        }, 20000); // 20 seconds timeout
    });
}
function p_stringToElement(str) {
    return parser.parseFromString(str, "text/html").body.firstElementChild;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dataManagement__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dataManagement */ "./src/dataManagement.ts");
/* harmony import */ var _runtime_twemoji__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./runtime/twemoji */ "./src/runtime/twemoji.ts");
/* harmony import */ var _runtime_styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./runtime/styles */ "./src/runtime/styles.ts");
/* harmony import */ var _runtime_realtimeUpdates__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./runtime/realtimeUpdates */ "./src/runtime/realtimeUpdates.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony import */ var _api_themesShop__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./api/themesShop */ "./src/api/themesShop.ts");
/* harmony import */ var _popup_themes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./popup/themes */ "./src/popup/themes.ts");
/* harmony import */ var _games_gamble__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./games/gamble */ "./src/games/gamble.ts");
/* harmony import */ var _api_encryptionProvider__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./api/encryptionProvider */ "./src/api/encryptionProvider.ts");
/* harmony import */ var _api_authorizationProvider__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./api/authorizationProvider */ "./src/api/authorizationProvider.ts");
/* harmony import */ var _games_snake__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./games/snake */ "./src/games/snake.ts");
/* harmony import */ var _runtime_loadingScreen__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./runtime/loadingScreen */ "./src/runtime/loadingScreen.ts");
/* harmony import */ var _ui_appsMenuManager__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ui/appsMenuManager */ "./src/ui/appsMenuManager.ts");
/* harmony import */ var _runtime_imageLoadingOptimizer__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./runtime/imageLoadingOptimizer */ "./src/runtime/imageLoadingOptimizer.ts");
/**
 * File: main.ts
 *
 * Applies styles during runtime.
 */
///////// IMPORTS //////////














// Important objects
const appsMenuManager = new _ui_appsMenuManager__WEBPACK_IMPORTED_MODULE_12__.AppsMenuManager();
const dataManager = new _dataManagement__WEBPACK_IMPORTED_MODULE_0__.DataManager();
const twemojiRuntime = new _runtime_twemoji__WEBPACK_IMPORTED_MODULE_1__.TwemojiRuntime(dataManager);
const stylesRuntime = new _runtime_styles__WEBPACK_IMPORTED_MODULE_2__.RuntimeStyles(dataManager);
const realtimeUpdatesRuntime = new _runtime_realtimeUpdates__WEBPACK_IMPORTED_MODULE_3__.RealtimeUpdatesManager(dataManager, stylesRuntime);
const loadingScreenRuntime = new _runtime_loadingScreen__WEBPACK_IMPORTED_MODULE_11__.LoadingScreen();
const imageLoadingOptimizer = new _runtime_imageLoadingOptimizer__WEBPACK_IMPORTED_MODULE_13__.ImageLoadingOptimizer();
const authProvider = new _api_authorizationProvider__WEBPACK_IMPORTED_MODULE_9__.AuthProvider();
if (window.self === window.top) { // Don't initialize in iframes!
    const themesShopHandler = new _api_themesShop__WEBPACK_IMPORTED_MODULE_5__.ThemesShopHandler(new _popup_themes__WEBPACK_IMPORTED_MODULE_6__.ThemeManager(dataManager), appsMenuManager, authProvider);
    const gamblingGame = new _games_gamble__WEBPACK_IMPORTED_MODULE_7__.GamblingGame(authProvider);
    const encryptionProvider = new _api_encryptionProvider__WEBPACK_IMPORTED_MODULE_8__.EncryptionProvider(authProvider);
    const snakeGame = new _games_snake__WEBPACK_IMPORTED_MODULE_10__.SnakeGame();
}
/////// Utility functions ////////
//////// On window load functions //////////
async function onWindowLoad() {
    console.log("window loaded, wait for main");
    imageLoadingOptimizer.onLoad();
    loadingScreenRuntime.startMutationObserver();
    if (window.self !== window.top) {
        throw new Error("Reject loading in iframe, feature not stable");
    }
    if (window.self === window.top) {
        await (0,_utils__WEBPACK_IMPORTED_MODULE_4__.waitForElement)('[data-tid="app-layout-area--main"]');
    }
    else {
        console.log("Skip wait in iframe");
    }
    console.log("window found main");
    await dataManager.loadAll();
    stylesRuntime.applyFonts(null);
    console.log("Apply colors on win load");
    realtimeUpdatesRuntime.detectChange();
    twemojiRuntime.applyTwemoji();
    stylesRuntime.applyColors();
    stylesRuntime.applyBackgrounds();
}
// Detects when contents in storage changed. Used for live updates. //
/////// Init ////////
window.onload = onWindowLoad;
console.log("Hello");

})();

/******/ })()
;
//# sourceMappingURL=main.bundle.js.map