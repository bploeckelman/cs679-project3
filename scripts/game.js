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
        zoomMod:  false,
        spin:     false,
    };
    this.keymap = {
        panUp:    87, // W
        panDown:  83, // S
        panLeft:  65, // A
        panRight: 68, // D
        zoom:     90, // Z (shift switches between in/out)
        spin:     32, // Space
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
            new THREE.MeshBasicMaterial({ color: 0x112211, wireframe: true })
        ),
        TEST_MESH2 = new THREE.Mesh(
            new THREE.PlaneGeometry(GRID_SIZE.w, GRID_SIZE.h,
                                    GRID_SIZE.xcells / 4, GRID_SIZE.ycells / 4),
            new THREE.MeshBasicMaterial({ color: 0x115511, wireframe: true })
        ),
        ZOOM_TIME  = 2500,
        PAN_SPEED  = 3,
        ZOOM_SPEED = 1,
        CAMERA_FRICTION = { x: 0.9, y: 0.9 };



    // Game methods -----------------------------------------------------------
    this.update = function () { 
        //this.level.update();
        this.player.update(); 
        //handleCollisions(this);

        // Pan the camera directly with wasd
        /*
        if      (this.input.panUp)    this.camera.position.y += PAN_SPEED;
        else if (this.input.panDown)  this.camera.position.y -= PAN_SPEED;
        if      (this.input.panLeft)  this.camera.position.x -= PAN_SPEED;
        else if (this.input.panRight) this.camera.position.x += PAN_SPEED;
        */

        // Zoom the camera
        if (this.input.zoom) {
            if (this.input.zoomMod) {
                this.camera.position.z += ZOOM_SPEED;
            } else {
                this.camera.position.z -= ZOOM_SPEED;
            }
        }

        // Update the camera to follow the player
        var dx = this.player.position.x - this.camera.position.x,
            dy = this.player.position.y - this.camera.position.y,
            d  = Math.sqrt(dx*dx + dy*dy);

        if (d < 0.5) {
            this.camera.position.x = this.player.mesh.position.x;
            this.camera.position.y = this.player.mesh.position.y;
        } else {
            if (this.player.velocity.x != 0) {
                this.camera.velocity.x = this.player.velocity.x;
            } else {
                this.camera.velocity.x = dx / d;
            }

            if (this.player.velocity.y != 0) {
                this.camera.velocity.y = this.player.velocity.y;
            } else {
                this.camera.velocity.y = dy / d;
            }

            this.camera.velocity.x *= CAMERA_FRICTION.x;
            this.camera.velocity.y *= CAMERA_FRICTION.y;

            this.camera.position.x += this.camera.velocity.x;
            this.camera.position.y += this.camera.velocity.y;
        }

        this.camera.lookAt(this.player.mesh.position);

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
            case game.keymap.spin:
                game.input.spin = true;
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
            case game.keymap.spin:     game.input.spin     = false; break;
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
        game.camera.velocity = new THREE.Vector3(0,0,0);
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
        game.scene.add(TEST_MESH2);

        // Reposition the grid so its bottom left corner at (0,0,0)
        TEST_MESH.position.set(GRID_SIZE.w / 2, GRID_SIZE.h / 2, 0);
        TEST_MESH2.position.set(GRID_SIZE.w / 2, GRID_SIZE.h / 2, 0.1);

        // Initialize the player
        game.player = new Player(game);
        game.scene.add(game.player.mesh);

        // Initialize the level
        //game.level  = new Level(game);

        console.log("Game initialized.");
    })(this);

} // end Game object

