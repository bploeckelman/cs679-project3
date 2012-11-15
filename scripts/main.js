// ----------------------------------------------------------------------------
// Global Constants
// ----------------------------------------------------------------------------
var MAX_LIGHTS = 20;


// ----------------------------------------------------------------------------
// Initialize Game
// ----------------------------------------------------------------------------
(function initializeGame() {
    var canvas       = document.getElementById("canvas"),
        canvasWidth  = window.innerWidth,
        canvasHeight = window.innerHeight,
        renderer = new THREE.WebGLRenderer({
            antialias:  true,
            canvas:     canvas,
            clearColor: 0x000001,
            clearAlpha: 1,
            maxLights:  MAX_LIGHTS // default is 4
        }),
        stats = new Stats(),
        game  = null,
        input = null,
        requestFrame = null;

    requestFrame = window.requestAnimationFrame
                || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.oRequestAnimationFrame
                || window.msRequestAnimationFrame
                || function (callback) { window.setTimeout(callback, 1000 / 60); };

    // Style html a bit
    document.getElementsByTagName("body")[0].style.background = "rgb(64,64,64)";
    document.getElementsByTagName("body")[0].style.margin     = "0";
    document.getElementsByTagName("body")[0].style.padding    = "0";
    document.getElementsByTagName("body")[0].style.overflow   = "hidden";

    // Setup sizes and add the renderer to the document 
  //  canvas.width  = canvasWidth;
  //  canvas.height = canvasHeight;
  //for debug purpos, make canvas smaller
     canvas.width = 800;
	 canvas.height = 600;
    renderer.setSize(canvasWidth, canvasHeight);
    document.getElementById("container").appendChild(renderer.domElement);

    // Setup window resizing handler 
    //window.onresize = function (event) {
    window.addEventListener('resize', function (event) {
        var width  = window.innerWidth,
            height = window.innerHeight;

        canvas.width  = width;
        canvas.height = height;
        renderer.setSize(width, height);
        game.camera.aspect = width / height;
        game.camera.updateProjectionMatrix();
        //console.info("Resized canvas to fit window: " 
        //          + width + "," + height);
    }, false);

    // Setup stats (fps and ms render time graphs)
    stats.setMode(0); // mode 0 = fps, mode 1 = ms render time
    stats.domElement.style.position = "absolute";
    stats.domElement.style.top = canvas.offsetTop + 4 + "px";
    stats.domElement.style.left = canvas.offsetLeft + "px";
    document.getElementById("container").appendChild(stats.domElement);

    // Create the game object
    game = new Game(canvas, renderer);

    // Enter main loop
    // ---------------
    (function mainLoop() {
        stats.begin();
        requestFrame(mainLoop);
        game.update();
        game.render();
        stats.end();
    })();

})();

