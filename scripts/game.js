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
    var self = this,
        GLOBAL_LIGHT0 = new THREE.AmbientLight(0x4f4f4f),
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
        ZOOM_SPEED = 1,
        CAMERA_FRICTION = { x: 0.9, y: 0.9 };


    // Game methods -----------------------------------------------------------
    this.update = function () { 
        //self.level.update();
        self.player.update(); 
        //handleCollisions(self);

        // Zoom the camera
        if (self.input.zoom) {
            if (self.input.zoomMod) {
                self.camera.position.z += ZOOM_SPEED;
            } else {
                self.camera.position.z -= ZOOM_SPEED;
            }
        }

        // Update the camera to follow the player
        var dx = self.player.position.x - self.camera.position.x,
            dy = self.player.position.y - self.camera.position.y,
            d  = Math.sqrt(dx*dx + dy*dy);

        if (d < 150) {
            self.camera.position.x = self.player.mesh.position.x - 100;
            self.camera.position.y = self.player.mesh.position.y - 100;
        } else {
            if (self.player.velocity.x != 0) {
                self.camera.velocity.x = self.player.velocity.x;
            } else {
                self.camera.velocity.x = dx / d;
            }

            if (self.player.velocity.y != 0) {
                self.camera.velocity.y = self.player.velocity.y;
            } else {
                self.camera.velocity.y = dy / d;
            }

            self.camera.velocity.x *= CAMERA_FRICTION.x;
            self.camera.velocity.y *= CAMERA_FRICTION.y;

            self.camera.position.x += self.camera.velocity.x;
            self.camera.position.y += self.camera.velocity.y;
        }

        // Force camera to center on the player
        self.camera.lookAt(self.player.mesh.position);

        TWEEN.update();
    };


    this.render = function () {
        renderer.render(self.scene, self.camera);
        ++self.frames;
    };


    // Input handlers ---------------------------------------------------------
    // Key Down
    function handleKeydown (event) {
        self.input.zoomMod = event.shiftKey;

        switch (event.keyCode) {
            case self.keymap.panUp:
                self.input.panUp   = true;
                self.input.panDown = false;
            break;
            case self.keymap.panDown:
                self.input.panDown = true;
                self.input.panUp   = false;
            break;
            case self.keymap.panLeft:
                self.input.panLeft  = true;
                self.input.panRight = false;
            break;
            case self.keymap.panRight:
                self.input.panRight = true;
                self.input.panLeft  = false;
            break;
            case self.keymap.zoom:
                self.input.zoom = true;
            break;
            case self.keymap.spin:
                self.input.spin = true;
            break;
        };
    };

    // Key Up
    function handleKeyup (event) {
        self.input.zoomMod = event.shiftKey;

        switch (event.keyCode) {
            case self.keymap.panUp:    self.input.panUp    = false; break;
            case self.keymap.panDown:  self.input.panDown  = false; break;
            case self.keymap.panLeft:  self.input.panLeft  = false; break;
            case self.keymap.panRight: self.input.panRight = false; break;
            case self.keymap.zoom:     self.input.zoom     = false; break;
            case self.keymap.spin:     self.input.spin     = false; break;
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
        game.camera.up = new THREE.Vector3(0,0,1);
        game.camera.lookAt(new THREE.Vector3(0,0,0));

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
    })(self);

} // end Game object

