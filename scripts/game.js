// ----------------------------------------------------------------------------
// Game object 
// ----------------------------------------------------------------------------
function Game(canvas, renderer) {

    // Public properties ------------------------------------------------------
    this.frames = 0;            // number of frames drawn
    this.scene  = null; 
    this.camera = null;
    this.level  = null;
    this.player = null;
    this.input  = {
        panUp:    false,
        panDown:  false,
        panLeft:  false,
        panRight: false,
        zoom:     false,
        zoomMod:  false
    };
    this.keymap = {
        panUp:    87, // W
        panDown:  83, // S
        panLeft:  65, // A
        panRight: 68, // D
        zoom:     32, // Space (shift switches between in/out)
    };



    // Private variables ------------------------------------------------------
    var GLOBAL_LIGHT0 = new THREE.AmbientLight(0x4f4f4f),
        GLOBAL_FOG0   = new THREE.Fog(0xa0a0a0, 1, 1000),
        FOV    = 67,
        ASPECT = canvas.width / canvas.height,
        NEAR   = 1,
        FAR    = 1000,
        GRID_SIZE = { w: 1000, h: 1000, xcells: 100, ycells: 100 },
        TEST_MESH = new THREE.Mesh(
            new THREE.PlaneGeometry(GRID_SIZE.w, GRID_SIZE.h,
                                    GRID_SIZE.xcells, GRID_SIZE.ycells),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
        ),
        ZOOM_TIME  = 2500,
        PAN_SPEED  = 3,
        ZOOM_SPEED = 1;

    // Game methods -----------------------------------------------------------
    this.update = function () { 
        //this.level.update();
        //updatePlayer(this);
        //handleCollisions(this);

        // Pan the camera
        if      (this.input.panUp)    this.camera.position.y += PAN_SPEED;
        else if (this.input.panDown)  this.camera.position.y -= PAN_SPEED;
        if      (this.input.panLeft)  this.camera.position.x -= PAN_SPEED;
        else if (this.input.panRight) this.camera.position.x += PAN_SPEED;

        // Zoom the camera
        if (this.input.zoom) {
            if (this.input.zoomMod) {
                this.camera.position.z += ZOOM_SPEED;
            } else {
                this.camera.position.z -= ZOOM_SPEED;
            }
        }

        //TODO: remove WASD camera movement once player tracking is in place:
        //updateCamera(this); {
        //  this.camera.position.set(this.player.center);
        //  this.camera.position.z = ZOOM_LEVEL;
        //  this.camera.lookAt(this.player.center);
        //}

        // Spin the mesh around a bit
        //TEST_MESH.rotation.x += 0.01;
        //TEST_MESH.rotation.y += 0.001;
        //TEST_MESH.rotation.z += 0.01;

        TWEEN.update();
    };


    this.render = function () {
        renderer.render(this.scene, this.camera);
        ++this.frames;
    };


    // Input handlers ---------------------------------------------------------
    var game = this;

    // Key Down
    function handleKeydown (event) {
        game.input.zoomMod = event.shiftKey;

        switch (event.keyCode) {
            case game.keymap.panUp:
                game.input.panUp   = true;
                game.input.panDown = false;
            break;
            case game.keymap.panDown:
                game.input.panDown = true;
                game.input.panUp   = false;
            break;
            case game.keymap.panLeft:
                game.input.panLeft  = true;
                game.input.panRight = false;
            break;
            case game.keymap.panRight:
                game.input.panRight = true;
                game.input.panLeft  = false;
            break;
            case game.keymap.zoom:
                game.input.zoom = true;
            break;
        };
    };

    // Key Up
    function handleKeyup (event) {
        game.input.zoomMod = event.shiftKey;

        switch (event.keyCode) {
            case game.keymap.panUp:    game.input.panUp    = false; break;
            case game.keymap.panDown:  game.input.panDown  = false; break;
            case game.keymap.panLeft:  game.input.panLeft  = false; break;
            case game.keymap.panRight: game.input.panRight = false; break;
            case game.keymap.zoom:     game.input.zoom     = false; break;
        };
    };

    // TODO: mouse handling


    // Constructor ------------------------------------------------------------
    (this.init = function (game) {
        console.log("Game initializing..."); 

        // Setup input handlers
        document.addEventListener("keyup",   handleKeyup,   false);
        document.addEventListener("keydown", handleKeydown, false);

        // Initialize the camera
        game.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        game.camera.position.set(0, 0, 200);
        game.camera.lookAt(new THREE.Vector3(0,0,0));

        // Set up a few tweens to zoom the camera in and out
        /*
        var zoomIn = new TWEEN.Tween({ zoom: 100 })
                .to({ zoom: 0 }, ZOOM_TIME)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(function () { game.camera.position.z = this.zoom; })
                .onComplete(function () { this.zoom = 100 }),
            zoomOut = new TWEEN.Tween({ zoom: 0 })
                .to({ zoom: 100 }, ZOOM_TIME)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(function () { game.camera.position.z = this.zoom; })
                .onComplete(function () { this.zoom = 0 });

        zoomOut.chain(zoomIn);
        zoomIn.chain(zoomOut);
        zoomIn.start();
        */

        // Initialize the three.js scene
        game.scene  = new THREE.Scene();
        game.scene.add(GLOBAL_LIGHT0);
        game.scene.fog = GLOBAL_FOG0;

        // Add stuff to the scene
        game.scene.add(game.camera);
        game.scene.add(new THREE.AxisHelper());
        game.scene.add(TEST_MESH);

        // Reposition the grid so its bottom left corner at (0,0,0)
        TEST_MESH.position.set(GRID_SIZE.w / 2, GRID_SIZE.h / 2, 0);

        // Initialize the player and level
        //game.player = new Player(game);
        //game.level  = new Level(game);

        console.log("Game initialized.");
    })(this);

} // end Game object

