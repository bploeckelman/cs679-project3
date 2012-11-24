var GAME_MODE = { BUILD: "build", DEFEND: "defend" };
// ----------------------------------------------------------------------------
// Game object 
// ----------------------------------------------------------------------------
function Game(canvas, renderer) {
    // Public properties ------------------------------------------------------
    this.frames = 0;            // number of frames drawn
    this.mode   = null;
    this.scene  = null; 
    this.camera = null;
    this.level  = null;
    this.player = null;
    this.wave   = null;
    this.particles = null;
    this.input  = {
        panUp:    false,
        panDown:  false,
        panLeft:  false,
        panRight: false,
        zoom:     false,
        zoomMod:  false,
        spin:     false,
        mode:     false,
        mousePos:  null,
        mousePrev: null,
        mouseButtonClicked:  -1,
        mouseWheelLastDelta: 0,
    };
    this.keymap = {
        panUp:    87, // W
        panDown:  83, // S
        panLeft:  65, // A
        panRight: 68, // D
        zoom:     90, // Z (shift switches between in/out)
        spin:     32, // Space
        mode:     49, // 1
    };


    // Private variables ------------------------------------------------------
    var self = this,
        GLOBAL_LIGHT0 = new THREE.AmbientLight(0x4f4f4f),
        GLOBAL_FOG0   = new THREE.Fog(0xa0a0a0, 1, 1000),
        FOV    = 67,
        ASPECT = canvas.width / canvas.height,
        NEAR   = 1,
        FAR    = 1000;


    // Game methods -----------------------------------------------------------
    // Update
    this.update = function () { 
        self.level.update();
        updateCamera(self);

        if (self.mode === GAME_MODE.DEFEND) {
            self.player.update(); 
            self.wave.update();
            handleCollisions(self);
            updateParticles(self);
        } else if (self.mode === GAME_MODE.BUILD) {
            // TODO
        }

        TWEEN.update();
    };


    // Render
    this.render = function () {
        renderer.render(self.scene, self.camera);
        ++self.frames;
    };


    // Switch modes
    this.switchMode = function () {
        // Build -> Defend
        if (self.mode === GAME_MODE.BUILD) {
            self.mode = GAME_MODE.DEFEND;

            // Add the player
            self.player = new Player(self);
            self.scene.add(self.player.mesh);

            // Create a new wave of enemies
            self.wave = new Wave(20, self);

            // Reposition camera
            self.camera.position.x = self.player.mesh.position.x - 50;
            self.camera.position.y = self.player.mesh.position.y - 50;
        }
        // Defend -> Build
        else if (self.mode === GAME_MODE.DEFEND) {
            self.mode = GAME_MODE.BUILD;

            // Remove the player mesh
            self.scene.remove(self.player.mesh);

            // Remove any remaining enemies
            self.wave.remove();

            // Remove any remaining particle systems
            for (var i = 0; i < self.particles.length; ++i) {
                self.scene.remove(self.particles[i]);
            }
            self.particles = [];

            // TODO: position camera above treasure/artifact @ center of base
            //self.camera.position.set(500,500,100);
        }
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
            case self.keymap.mode:
                self.input.mode = true;
                self.switchMode();
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
            case self.keymap.mode:     self.input.mode     = false; break;
        };
    };

    // Mouse Wheel
    function handleMouseWheel (event) {
        self.input.mouseWheelLastDelta = event.wheelDelta;
        //console.log("Mouse wheel moved: " + self.input.mouseWheelLastDelta);
    };

    // Mouse Click
    function handleMouseClick (event) {
        self.input.mouseButtonClicked = event.button;
        //console.log("Mouse button clicked: " + self.input.mouseButtonClicked);
    };

    // Mouse Move
    function handleMouseMove (event) {
        self.input.mousePrev = self.input.mousePos.clone();
        self.input.mousePos.set(event.clientX, event.clientY);
        //console.log("Mouse moved: " + self.input.mouseX + ", " + self.input.mouseY);
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (game) {
        console.log("Game initializing..."); 

        game.input.mousePos  = new THREE.Vector2();
        game.input.mousePrev = new THREE.Vector2();

        // Setup input handlers
        document.addEventListener("keyup",   handleKeyup,   false);
        document.addEventListener("keydown", handleKeydown, false);
        document.addEventListener("click",   handleMouseClick, false);
        document.addEventListener("mousemove", handleMouseMove, false);
        document.addEventListener("mousewheel", handleMouseWheel, false);

        // Set the initial game mode
        game.mode = GAME_MODE.DEFEND;

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

        // Initialize the level
        game.level  = new Level(game);

        // Initialize the player
        game.player = new Player(game);
        game.scene.add(game.player.mesh);

        // Initialize a new wave of enemies
        game.wave = new Wave(20, game);

        // Initialize particle system container
        game.particles = [];

        console.log("Game initialized.");
    })(self);

} // end Game object


// ----------------------------------------------------------------------------
// Update Functions -----------------------------------------------------------
// ----------------------------------------------------------------------------


// Handle Collisions ----------------------------------------------------------
function handleCollisions (game) {
    var player = game.player,
        playerMin = new THREE.Vector2(
            player.position.x - 9 / 2,
            player.position.y - 9 / 2),
        playerMax = new THREE.Vector2(
            player.position.x + 9 / 2,
            player.position.y + 9 / 2);

    // TODO: move player/enemy collision test to Wave object?
    for(var i = 0; i < game.wave.enemies.length; ++i) {
        var enemy = game.wave.enemies[i],
            enemyMin = new THREE.Vector2(
                enemy.position.x - enemy.size.x / 2,
                enemy.position.y - enemy.size.y / 2),
            enemyMax = new THREE.Vector2(
                enemy.position.x + enemy.size.x / 2,
                enemy.position.y + enemy.size.y / 2);

        if (playerMin.x > enemyMax.x 
         || playerMax.x < enemyMin.x
         || playerMin.y > enemyMax.y
         || playerMax.y < enemyMin.y) {
            enemy.mesh.material.wireframe = true;
        } else {
            if (player.isSpinning) {
                enemy.mesh.material.wireframe = false;
                // Damage enemy
                enemy.takeDamage(player.damageAmount);
            }
        }
    }
}


// Update the camera ----------------------------------------------------------
function updateCamera (game) {
    var ZOOM_SPEED = 1,
        KEY_PAN_SPEED  = 3,
        CAMERA_FRICTION = { x: 0.9, y: 0.9 };

    // Zoom the camera
    if (game.input.zoom) {
        if (game.input.zoomMod) {
            game.camera.position.z += ZOOM_SPEED;
        } else {
            game.camera.position.z -= ZOOM_SPEED;
        }
    }

    // DEFEND MODE - Camera Handling ------------------------------------------
    if (game.mode === GAME_MODE.DEFEND) {
        // Update the camera to follow the player
        var dx = game.player.position.x - game.camera.position.x,
            dy = game.player.position.y - game.camera.position.y,
            d  = Math.sqrt(dx*dx + dy*dy);

        // Note: this is a bit hacky, could be done better
        if (d < 100) {
            game.camera.position.x = game.player.mesh.position.x - 50;
            game.camera.position.y = game.player.mesh.position.y - 50;
        } else {
            if (game.player.velocity.x != 0) {
                game.camera.velocity.x = game.player.velocity.x;
            } else {
                game.camera.velocity.x = dx / d;
            }

            if (game.player.velocity.y != 0) {
                game.camera.velocity.y = game.player.velocity.y;
            } else {
                game.camera.velocity.y = dy / d;
            }

            game.camera.velocity.x *= CAMERA_FRICTION.x;
            game.camera.velocity.y *= CAMERA_FRICTION.y;

            game.camera.position.x += game.camera.velocity.x;
            game.camera.position.y += game.camera.velocity.y;
        }

        // Force camera to center on the player
        game.camera.up = new THREE.Vector3(0,0,1);
        game.camera.lookAt(game.player.mesh.position);
    }

    // BUILD MODE - Camera Handling -------------------------------------------
    else if (game.mode === GAME_MODE.BUILD) {
        // Pan camera directly with keyboard input
        if      (game.input.panUp)    game.camera.position.y += KEY_PAN_SPEED;
        else if (game.input.panDown)  game.camera.position.y -= KEY_PAN_SPEED;
        if      (game.input.panLeft)  game.camera.position.x -= KEY_PAN_SPEED;
        else if (game.input.panRight) game.camera.position.x += KEY_PAN_SPEED;

        // Pan camera by moving mouse to edges of screen
        var minEdge = new THREE.Vector2(
                window.innerWidth  / 4,  
                window.innerHeight / 4),
            maxEdge = new THREE.Vector2(
                window.innerWidth  * 3 / 4,
                window.innerHeight * 3 / 4),
            // TODO: recalculate min/max edges on window resize
            MOUSE_PAN_SPEED = 50,
            dx = 0,
            dy = 0;

        // Calculate delta for x edges
        if (game.input.mousePos.x < minEdge.x) {
            dx = (game.input.mousePos.x - minEdge.x) / MOUSE_PAN_SPEED;
        } else if (game.input.mousePos.x > maxEdge.x) {
            dx = (game.input.mousePos.x - maxEdge.x) / MOUSE_PAN_SPEED;
        }

        // Calculate delta for y edges
        if (game.input.mousePos.y < minEdge.y) {
            dy = -1 * (game.input.mousePos.y - minEdge.y) / MOUSE_PAN_SPEED;
        } else if (game.input.mousePos.y > maxEdge.y) {
            dy = -1 * (game.input.mousePos.y - maxEdge.y) / MOUSE_PAN_SPEED;
        }

        // Pan camera based on mouse movements
        game.camera.position.addSelf(new THREE.Vector3(dx, dy, 0));

        // Keep camera in level bounds
        // TODO: don't hardcode bounds, expose them in Level object instead
        if (game.camera.position.x < 0)    game.camera.position.x = 0;
        if (game.camera.position.x > 1000) game.camera.position.x = 1000;
        if (game.camera.position.y < 0)    game.camera.position.y = 0;
        if (game.camera.position.y > 1000) game.camera.position.y = 1000;

        // Look straight down from camera position, up vector -> +y
        game.camera.up = new THREE.Vector3(0,1,0);
        game.camera.lookAt(
            new THREE.Vector3(
                game.camera.position.x,
                game.camera.position.y,
                0)
        );
    }
}


// Update particle systems ----------------------------------------------------
function updateParticles (game) {
    for (var i = game.particles.length - 1; i >= 0; --i) {
        var system = game.particles[i];

        // Remove old systems
        if (system.complete) {
            game.scene.remove(system);
            game.particles.splice(i, 1);
        } else {
            // Update the particles
            for (var j = 0; j < system.geometry.vertices.length; ++j) {
                var particle = system.geometry.vertices[j];
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;
                particle.z += particle.velocity.z;
            }
            system.geometry.__dirtyVertices = true;
        }
    }
}

