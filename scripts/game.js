var GAME_MODE = { BUILD: "build", DEFEND: "defend" };
// ----------------------------------------------------------------------------
// Game object 
// ----------------------------------------------------------------------------
function Game(canvas, renderer) {
    // Public properties ------------------------------------------------------
    this.frames = 0;            // number of frames drawn
    this.mode   = null;
    this.round  = null;
    this.scene  = null; 
    this.camera = null;
    this.level  = null;
    this.player = null;
    this.wave   = null;
    this.build  = null;
    this.particles = null;
    this.projector = null;
    this.input  = {
        panUp:    false,
        panDown:  false,
        panLeft:  false,
        panRight: false,
        zoom:     false,
        zoomMod:  false,
        spin:     false,
        mode:     false,
        action1:  false,
        action2:  false,
        action3:  false,
        action4:  false,
        mousePos:  null,
        mousePrev: null,
        mouseButtonClicked:  -1,
        mouseWheelLastDelta: 0,
		menuClicked: false,
    };
    this.keymap = {
        panUp:    87, // W
        panDown:  83, // S
        panLeft:  65, // A
        panRight: 68, // D
        zoom:     90, // Z (shift switches between in/out)
        spin:     32, // Space
        mode:     48, // 0
        action1:  49, // 1
        action2:  50, // 2
        action3:  51, // 3
        action4:  52, // 4
    };


    // Private variables ------------------------------------------------------
    var self = this,
        DIRECT_LIGHT0 = new THREE.DirectionalLight(0xffffff),
        GLOBAL_LIGHT0 = new THREE.AmbientLight(0x111111),
        GLOBAL_FOG0   = new THREE.Fog(0xa0a0a0, 1, 1000),
        FOV    = 67,
        ASPECT = window.innerWidth / window.innerHeight,
        NEAR   = 1,
        FAR    = 1000,
        COUNTDOWN = false,
        CANVAS2D  = null,
        CONTEXT2D = null;
    DIRECT_LIGHT0.position.set(1,1,1).normalize();

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

            if (self.wave.enemies.length == 0 && !COUNTDOWN) {
                setTimeout(function () {
                    self.switchMode();
                    COUNTDOWN = false;
                }, 5000);
                COUNTDOWN = true;
                // TODO: display some message about defend mode completion
                // ideally we'd display some stats here too, 
                //  - time it took to beat round
                //  - remaining artifact health
                //  - money gained
                //  - etc...
                // It should also be setup so that instead of counting 
                // down to mode switch, the player has to click through 
                // the completion message...
            }
        } else if (self.mode === GAME_MODE.BUILD) {
            // Move new structure around if one is waiting to be placed
            if (self.build.structure !== null) {
                self.build.structure.move();
            } else {
                if (self.player.money <= 0) {
                    self.switchMode();
                    self.round++;
                }
            }
        }

        TWEEN.update();
    };


    // Render
    this.render = function () {
        renderer.render(self.scene, self.camera);
        self.renderOverlayText():
        ++self.frames;
    };


    // Render Overlay Text
    this.renderOverlayText = function () {
        // Clear 2d canvas
        CONTEXT2D.save();
        CONTEXT2D.setTransform(1,0,0,1,0,0);
        CONTEXT2D.clearRect(0, 0, CANVAS2D.width, CANVAS2D.height);
        CONTEXT2D.restore();

        // Draw any hud info on the 2d canvas
        CONTEXT2D.font         = "20px Arial";
        CONTEXT2D.textBaseline = "top";
        CONTEXT2D.textAlign    = "center";
        CONTEXT2D.fillStyle    = "#ffffff";
        CONTEXT2D.fillText(
            "Build Credits: " + self.player.money,
            CANVAS2D.width / 2, 0);
        CONTEXT2D.fillText(
            "Artifact Health: " + self.level.artifact.health,
            CANVAS2D.width / 2, 20);
        if (COUNTDOWN) {
            CONTEXT2D.font = "40px Arial";
            CONTEXT2D.textBaseline = "center";
            CONTEXT2D.fillText("Defend phase complete!",
                CANVAS2D.width / 2, CANVAS2D.height / 2);
        }
    };


    // Switch modes
    this.switchMode = function () {
        // Build -> Defend
        if (self.mode === GAME_MODE.BUILD) {
            self.mode = GAME_MODE.DEFEND;

            // Add the player
            self.player = new Player(self);
            self.player.position = self.level.artifact.mesh.position.clone();
            self.player.mesh.position = self.level.artifact.mesh.position.clone();
            self.scene.add(self.player.mesh);

            // Create a new wave of enemies
            self.wave = new Wave(self.round, self);

            // Reposition camera
            self.camera.position.x = self.player.mesh.position.x - 50;
            self.camera.position.y = self.player.mesh.position.y - 50;
			
			//Hide the menus
			document.getElementById("buildMenus").style.display = "none";
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

            // Position camera above treasure/artifact @ center of base
            self.camera.position.set(500, 500, 200);
			
			// Display the menus
			/*var texture = new THREE.ImageUtils.loadTexture("images/structMenuButton2.png");
			var sprite = new THREE.Sprite( {
				map: texture,
				alignment: THREE.SpriteAlignment.topLeft, // otherwise position moves center of sprite
				useScreenCoordinates: true  // might not actually be necessary
			} );
			sprite.position.set(0,0,0);
			self.scene.add(sprite);*/
			document.getElementById("buildMenus").style.display = "block";
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
            case self.keymap.action1:
                self.input.action1 = true;
                createStructure(STRUCTURE_TYPES.ONE_BY_ONE, self);
            break;
            case self.keymap.action2:
                self.input.action2 = true;
                createStructure(STRUCTURE_TYPES.TWO_BY_TWO, self);
            break;
            break;
            case self.keymap.action3:
                self.input.action3 = true;
                createStructure(STRUCTURE_TYPES.THREE_BY_THREE, self);
            break;
            break;
            case self.keymap.action4:
                self.input.action4 = true;
                createStructure(STRUCTURE_TYPES.FOUR_BY_FOUR, self);
            break;
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
            case self.keymap.action1:  self.input.action1  = false; break;
            case self.keymap.action2:  self.input.action2  = false; break;
            case self.keymap.action3:  self.input.action3  = false; break;
            case self.keymap.action4:  self.input.action4  = false; break;
        };
    };

    // Mouse Wheel
    function handleMouseWheel (event) {
        self.input.mouseWheelLastDelta = event.wheelDelta;
        //console.log("Mouse wheel moved: " + self.input.mouseWheelLastDelta);
    };

    // Mouse Click
    function handleMouseClick (event) {
		// If a menu item was clicked, ignore the event
		if (self.input.menuClicked) {
			self.input.menuClicked = false;
			return
		}
		
        self.input.mouseButtonClicked = event.button;

        if (self.mode === GAME_MODE.BUILD) {
            // Place current structure and clear placeholder object
            if (self.build.structure !== null) {
                self.build.structure.place();
                self.level.structures.push(self.build.structure);
                self.build.structure = null;
            }
        }
        //console.log("Mouse button clicked: " + self.input.mouseButtonClicked);
    }

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

        game.projector = new THREE.Projector();

        // Set the initial game mode and round counter
        game.mode = GAME_MODE.BUILD;
        game.round = 1;

        // Initialize the camera
        game.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        game.camera.position.set(500, 500, 200);
        game.camera.velocity = new THREE.Vector3(0,0,0);
        game.camera.up = new THREE.Vector3(0,0,1);
        game.camera.lookAt(new THREE.Vector3(0,0,0));

        // Initialize the three.js scene
        game.scene  = new THREE.Scene();
        game.scene.add(GLOBAL_LIGHT0);
        game.scene.add(DIRECT_LIGHT0);
        //game.scene.fog = GLOBAL_FOG0;

        // Add stuff to the scene
        game.scene.add(game.camera);
        game.scene.add(new THREE.AxisHelper());

        // Initialize the level
        game.level  = new Level(game);

        // Initialize the player
        game.player = new Player(game);

        // Initialize particle system container
        game.particles = [];

        // Initialize the build mode object
        // Note: add other properties for current structure type
        //       and build menu and other stuff like that
        game.build = {
            structure: null
        };
		
		// Initialize the menus
		/*var texture = new THREE.ImageUtils.loadTexture("images/structMenuButton2.png");
		var sprite = new THREE.Sprite( {
			map: texture,
			alignment: THREE.SpriteAlignment.topLeft, // otherwise position moves center of sprite
			useScreenCoordinates: true  // might not actually be necessary
		} );
		sprite.position.set(0,0,0);
		
		alert("width: " + texture.image.width);
		alert("height: " + texture.image.height);
		game.scene.add(sprite);*/
		document.getElementById("initOneByOne").onclick = function () {
			self.input.menuClicked = true;
			createStructure(STRUCTURE_TYPES.ONE_BY_ONE, game);
		};
		document.getElementById("initTwoByTwo").onclick = function () {
			self.input.menuClicked = true;
			createStructure(STRUCTURE_TYPES.TWO_BY_TWO, game);
		};
		document.getElementById("initThreeByThree").onclick = function () {
			self.input.menuClicked = true;
			createStructure(STRUCTURE_TYPES.THREE_BY_THREE, game);
		};
		document.getElementById("initFourByFour").onclick = function () {
			self.input.menuClicked = true;
			createStructure(STRUCTURE_TYPES.FOUR_BY_FOUR, game);
		};

        CANVAS2D = document.createElement("canvas");
        CANVAS2D.id = "canvas2d";
        CANVAS2D.width  = window.innerWidth;
        CANVAS2D.height = window.innerHeight;
        CANVAS2D.style.position = "absolute";
        CANVAS2D.style.bottom   = 0;
        CANVAS2D.style.right    = 0;
        document.getElementById("container").appendChild(CANVAS2D);
        CONTEXT2D = CANVAS2D.getContext("2d");

        console.log("Game initialized.");
    })(self);

} // end Game object


// ----------------------------------------------------------------------------
// Update Functions -----------------------------------------------------------
// ----------------------------------------------------------------------------


// Create Structure -----------------------------------------------------------
function createStructure (structureType, game) {
    if (game.mode === GAME_MODE.BUILD) {
        if (game.build.structure === null) {
            // If player has enough money for this structure type, prep one
            if (game.player.money >= STRUCTURE_COSTS[structureType]) {
                game.player.money -= STRUCTURE_COSTS[structureType];
                game.build.structure = new Structure(structureType, game);
                // TODO: play some animation or sound
            }
        }
    }
}


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
                enemy.position.y + enemy.size.y / 2),
            FEATHER = 4;

        if (playerMin.x + FEATHER > enemyMax.x - FEATHER
         || playerMax.x - FEATHER < enemyMin.x + FEATHER
         || playerMin.y + FEATHER > enemyMax.y - FEATHER
         || playerMax.y - FEATHER < enemyMin.y + FEATHER) {
            enemy.intersects = false;
        } else {
            enemy.intersects = true;
            if (player.isSpinning) {
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

        // Only pan using mouse movement if a building is ready to be placed
        if (game.build.structure != null) {
            // Pan camera by moving mouse to edges of screen
            var minEdge = new THREE.Vector2(
                    window.innerWidth  / 4,  
                    window.innerHeight / 4),
                maxEdge = new THREE.Vector2(
                    window.innerWidth  * 3 / 4,
                    window.innerHeight * 3 / 4),
                // TODO: recalculate min/max edges on window resize
                MOUSE_PAN_SPEED = 75,
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
        }

        // Keep camera in level bounds
        if (game.camera.position.x < 0)
            game.camera.position.x = 0;
        if (game.camera.position.x > game.level.size.width)
            game.camera.position.x = game.level.size.width;
        if (game.camera.position.y < 0)
            game.camera.position.y = 0;
        if (game.camera.position.y > game.level.size.height)
            game.camera.position.y = game.level.size.height;

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

