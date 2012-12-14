var GAME_MODE = { BUILD: "build", DEFEND: "defend" };
// ----------------------------------------------------------------------------
// Game object 
// ----------------------------------------------------------------------------
function Game(canvas, renderer) {
    // Public properties ------------------------------------------------------
    this.frames = 0;            // number of frames drawn
    this.mode   = null;
    this.round  = null;
	this.levelIndex = null;
    this.scene  = null; 
    this.camera = null;
    this.level  = null;
    this.player = null;
    this.wave   = null;
    this.build  = null;
	this.menus 	= null;
    this.message = null;
    this.particles = null;
    this.projector = null;
    this.countdown = false;
    this.instructions = null;
	this.gamelost = null;
	this.gamewon = null;
	this.won_music_played = false;
	this.lost_music_played = false;
    this.music  = null;
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
        esc:      false,
        mousePos:  null,
        mousePrev: null,
        mouseMove: false,
        mouseButtonClicked:  -1,
        mouseWheelLastDelta: 0,
		menuClicked: false,
        mouseButton1Down: false,
        mouseButton2Down: false,
        mouseButton3Down: false,
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
        esc:      27, // ESC
    };
    this.firstDefend = true;
    this.firstBuild  = false; // set to true when game intro text/credits are done


    // Private variables ------------------------------------------------------
    var self = this,
        DIRECT_LIGHT0 = new THREE.DirectionalLight(0xffffff),
        GLOBAL_LIGHT0 = new THREE.AmbientLight(0x111111),
        GLOBAL_FOG0   = new THREE.Fog(0xa0a0a0, 1, 1000),
        FOV    = 67,
        ASPECT = window.innerWidth / window.innerHeight,
        NEAR   = 1,
        FAR    = 1000,
        CANVAS2D  = null,
        CONTEXT2D = null;
    DIRECT_LIGHT0.position.set(1,1,1).normalize();

    // Game methods -----------------------------------------------------------
    // Update
    this.update = function () { 

        self.level.update();
        updateCamera(self);

        // Only update camera/level and tweens if drawing instructions
        if (self.instructions.draw) {
            // Still need to update input for moving structures in build phase
            if (self.build.structure !== null)
                self.build.structure.move();
            TWEEN.update();
            return;
        }

        if (self.mode === GAME_MODE.DEFEND) {
            if (self.gamelost) {
                //Menu display handled in renderOverlayText
                if(!self.lost_music_played){
                        self.lost_music_played = true;
                            new Audio("sounds/end_game.wav").play();
                }

                updateParticles(self);

                //Add replay button?
            }
            else if (self.gamewon) {
                //Menu display handled in renderOverlayText
                if(!self.won_music_played){
                        self.won_music_played = true;
                new Audio("sounds/won_game.mp3").play();
                }

                updateParticles(self);

                //Add replay button?
            }
            else {
                handleCollisions(self);
                self.player.update();
                self.wave.update();
                updateParticles(self);

                if (self.wave.enemies.length == 0 && !self.countdown){
                    setTimeout(function () {
                            self.switchMode();
                            self.countdown = false;
                    }, 4000);
                    self.countdown = true;
                    // TODO: display some message about defend mode completion
                    // ideally we'd display some stats here too, 
                    //  - time it took to beat round
                    //  - remaining artifact health
                    //  - money gained
                    //  - etc...
                    // It should also be setup so that instead of counting 
                    // down to mode switch, the player has to click through 
                    // the completion message...

                    //Game won if defeated all enemies on last round
                    if (self.round >= 6) {
                            self.gamewon = true;
                    }
                }
            }
        } else if (self.mode === GAME_MODE.BUILD) {		
            // Move new structure around if one is waiting to be placed
            if (self.build.structure !== null)
                self.build.structure.move();

            updateParticles(self);
        }

        TWEEN.update();
    };


    // Render
    this.render = function () {
        renderer.render(self.scene, self.camera);
        self.renderOverlayText();
        ++self.frames;
    };


    // Render Overlay Text
    this.renderOverlayText = function () {
        // Clear 2d canvas
        CONTEXT2D.save();
        CONTEXT2D.setTransform(1,0,0,1,0,0);
        CONTEXT2D.clearRect(0, 0, CANVAS2D.width, CANVAS2D.height);
        CONTEXT2D.restore();

		if (self.gamelost) {
			CONTEXT2D.font         = "40px Arial";
			CONTEXT2D.textBaseline = "top";
			CONTEXT2D.textAlign    = "center";
			CONTEXT2D.fillStyle    = "#ffffff";
			CONTEXT2D.fillText("GAME OVER", CANVAS2D.width / 2, CANVAS2D.height / 2);
		} else if (self.gamewon) {
			CONTEXT2D.font         = "40px Arial";
			CONTEXT2D.textBaseline = "top";
			CONTEXT2D.textAlign    = "center";
			CONTEXT2D.fillStyle    = "#ffffff";
			CONTEXT2D.fillText("YOU WIN", CANVAS2D.width  / 2, CANVAS2D.height / 2);
		} else {
			// Draw any hud info on the 2d canvas
			CONTEXT2D.font         = "20px Arial";
			CONTEXT2D.textBaseline = "top";
			CONTEXT2D.textAlign    = "center";
			CONTEXT2D.fillStyle    = "#ffffff";
			CONTEXT2D.fillText("Round #" + self.round, CANVAS2D.width / 2, 0);
            // TODO: setup a nicer interface for these
			CONTEXT2D.fillText("Build Credits: " + self.player.money, CANVAS2D.width / 2, 20);                        
			CONTEXT2D.fillText("Player Health: " + Math.floor(self.player.health), CANVAS2D.width / 2, 40);
			if (self.countdown) {
				CONTEXT2D.font = "40px Arial";
				CONTEXT2D.textBaseline = "center";
				CONTEXT2D.fillText("Defend phase complete!", CANVAS2D.width / 2, CANVAS2D.height / 2);
			}                        
			for (var i=0; i < self.level.artifacts.length; ++i) {
                CONTEXT2D.font = "20px Arial";
                CONTEXT2D.fillText("Artifact Health: " + Math.floor(self.level.artifacts[i].health), CANVAS2D.width / 2, 60 + i*20);
            }
			// Draw instructions on the 2d canvas
			if (self.instructions.draw) {
                var x = self.instructions.position.x,
                    y = self.instructions.position.y;

                // Draw a little partially transparent green background
                CONTEXT2D.globalAlpha = 0.25;
                CONTEXT2D.fillStyle = "rgb(16, 128, 64)"; 
                CONTEXT2D.fillRect(0, self.instructions.position.y - window.innerHeight / 10, window.innerWidth / 3, window.innerHeight);
                CONTEXT2D.globalAlpha = 1.0;

                // Draw the instruction text
                CONTEXT2D.globalAlpha = self.instructions.alpha;
                for (var i = 0; i < self.instructions.lines.length; ++i) {
                    var line = self.instructions.lines[i];

                    if (line.hasOwnProperty('image')) {
                        CONTEXT2D.drawImage(line.image, x, y);

                        // HACK: position text to display next to image
                        if (line.hasOwnProperty('text')) {
                            x += line.image.width + line.style.xOffset;
                            y += line.image.height / 4;
                        } else {
                            y += line.image.height + line.style.yOffset;
                        }
                    }

                    if (line.hasOwnProperty('text')) {
                        // Set style for the line
                        CONTEXT2D.font = line.style.font;
                        CONTEXT2D.textBaseLine = line.style.textBaseLine;
                        CONTEXT2D.textAlign = line.style.textAlign;
                        CONTEXT2D.fillStyle = line.style.fillStyle;

                        // Draw the line of text
                        CONTEXT2D.fillText(line.text, x, y);

                        // Update the position for the next line
                        //x += line.style.xOffset;
                        x = game.instructions.position.x;
                        y += line.style.yOffset;
                    }
                }
                CONTEXT2D.globalAlpha = 1.0;
			}
		}

        if (self.message !== null)
            self.message.render(CONTEXT2D, CANVAS2D);
    };


    // Switch modes
    this.switchMode = function () {
        // Build -> Defend
        if (self.mode === GAME_MODE.BUILD) {
            self.mode = GAME_MODE.DEFEND;
            self.round++;

            if (self.firstDefend) {
                self.instructions = instructions.defend;
                self.instructions.tween.start();
            } else { 
                self.instructions.draw = false;
                self.instructions.tween.stop();
            }

            document.getElementsByTagName('body')[0].style.cursor = 'url(\"images/defend-cursor.cur\"), default';

            // Toggle music track
            self.music.build.end();
            self.music.defend.begin();

            // Add the player
            if (self.player === null)
                self.player = new Player(self);
			var posX = self.level.artifacts[0].mesh.position.x,
				posY = self.level.artifacts[0].mesh.position.y,
				posZ = 0.1,
				pos = new THREE.Vector3(posX, posY, posZ);
			self.player.position = pos;
			self.player.mesh.position = pos;
            /*self.player.position = self.level.artifact.mesh.position.clone();
            self.player.mesh.position = self.level.artifact.mesh.position.clone();*/
            self.scene.add(self.player.mesh);

            // Create a new wave of enemies
            self.wave = new Wave(self.round, self);

            // Reposition camera
            self.camera.position.x = self.player.mesh.position.x - 50;
            self.camera.position.y = self.player.mesh.position.y - 50;

			//Hide the menus
			document.getElementById("buildMenus").style.display = "none";
			document.getElementById("switchMode").style.display = "none";

            // Zoom in a bit
            new TWEEN.Tween({ zoom: self.camera.position.z })
                .to({ zoom: self.camera.position.z - 100 }, 2000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () { self.camera.position.z = this.zoom; })
                .start();

            // Fire a message box
            if (self.message === null || self.message.finished)
                self.message = new Message(self, "Defend Flatland!", 750, new THREE.Vector2(200, 100));
		}
        // Defend -> Build
        else if (self.mode === GAME_MODE.DEFEND) {
            self.mode = GAME_MODE.BUILD;

            /*
            if (self.firstBuild) {
                self.instructions = instructions.build;
                self.instructions.tween.start();
            } else { 
            */
                self.instructions.draw = false;
                self.instructions.tween.stop();
            //}

            document.getElementsByTagName('body')[0].style.cursor = 'url(\"images/repair-cursor.cur\"), default';

            // Toggle music track
            self.music.defend.end();
            self.music.build.begin();

            // Add money based on territorial control + artifact health
			// Also, check if all artifacts have been claimed
			var allArtifactsClaimed = true;
            console.log("claimed = " + self.level.cellsClaimed);
            self.player.money += self.level.cellsClaimed * 0.15;
            for (var i = 0; i < self.level.artifacts.length; ++i) {
                self.player.money += self.level.artifacts[i].health / 50;
				if (!self.level.artifacts[i].claimed)
					allArtifactsClaimed = false;
            }
            self.player.money = Math.floor(self.player.money);
			
			if (allArtifactsClaimed) {
				//self.levelIndex++;
				self.levelIndex = 1;
				self.level.removeLevel();
				var levelDetails = LEVEL_DETAILS[game.levelIndex];
				self.level  = new Level(game, levelDetails.numXCells, levelDetails.numYCells, levelDetails.artifactPositions);

                // Remove any remaining particle systems
                for (var i = 0; i < self.particles.length; ++i) {
                    self.scene.remove(self.particles[i]);
                }
                self.particles = [];
			}

            // Remove the player mesh
            self.scene.remove(self.player.mesh);

            // Remove any remaining enemies
            self.wave.remove();

            // Position camera above treasure/artifact @ center of base
            self.camera.position.set(self.level.size.width / 2, self.level.size.height / 2, 200);
			
			// Display the menus
			document.getElementById("buildMenus").style.display = "block";
			document.getElementById("switchMode").style.display = "block";
	    	updateMenus(self);
                
            // Expand the creeper structure's claimed territory
            for (var i=0; i< self.level.structures.length; ++i) {
                if (self.level.structures[i].placed === true &&
                        self.level.structures[i].type === STRUCTURE_TYPES.ONE_BY_ONE) {
                    self.level.structures[i].expand();
                }
            }

            // Fire a message box
            if (self.message === null || self.message.finished)
                self.message = new Message(self, "Start building!", 750, new THREE.Vector2(200, 100));
        }
    };


    // Input handlers ---------------------------------------------------------
    // Key Down
    function handleKeydown (event) {
        self.input.zoomMod = event.shiftKey;

        switch (event.keyCode) {
            case self.keymap.panUp:    self.input.panUp    = true; break;
            case self.keymap.panDown:  self.input.panDown  = true; break;
            case self.keymap.panLeft:  self.input.panLeft  = true; break;
            case self.keymap.panRight: self.input.panRight = true; break;
            case self.keymap.zoom:     self.input.zoom     = true; break;
            case self.keymap.spin:     self.input.spin     = true; break;
            case self.keymap.mode:
                self.input.mode = true;
                if (self.mode === GAME_MODE.BUILD)
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
            case self.keymap.action3:
                self.input.action3 = true;
                createStructure(STRUCTURE_TYPES.THREE_BY_THREE, self);
            break;
            case self.keymap.action4:
                self.input.action4 = true;
                createStructure(STRUCTURE_TYPES.FOUR_BY_FOUR, self);
            break;
            case self.keymap.esc:
                self.input.esc = true;
                discardBuildStructure(self);
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
            case self.keymap.esc:      self.input.esc      = false; break;
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
                if (self.build.structure.place()) {
                    var type = self.build.structure.type;
                    self.level.structures.push(self.build.structure);
                    self.build.structure = null;
                    createStructure(type, self);
                } else {
                    // TODO: display "can't build here" message 
                    console.log("can't build here");
                }
            }
        }
        //console.log("Mouse button clicked: " + self.input.mouseButtonClicked);
    }

    // Mouse Down
    function handleMouseDown (event) {
        if      (event.button == 0) self.input.mouseButton1Down = true;
        else if (event.button == 1) self.input.mouseButton2Down = true;
        else if (event.button == 2) self.input.mouseButton3Down = true;

        self.input.spin = self.input.mouseButton1Down;
        self.input.mouseMove = self.input.mouseButton3Down;

        if (self.mode === GAME_MODE.BUILD) {
            if (self.input.mouseButton3Down) { // On Right Click...
                if (self.build.structure !== null) {
                    discardBuildStructure(self);
                }
            }
        }

        //console.log("mouse down event: " + event.button);
    }

    // Mouse Up
    function handleMouseUp (event) {
        if      (event.button == 0) self.input.mouseButton1Down = false;
        else if (event.button == 1) self.input.mouseButton2Down = false;
        else if (event.button == 2) self.input.mouseButton3Down = false;

        self.input.spin = self.input.mouseButton1Down;
        self.input.mouseMove = self.input.mouseButton3Down;
        //console.log("mouse up event: " + event.button);
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
        document.addEventListener("keyup",      handleKeyup,      false);
        document.addEventListener("keydown",    handleKeydown,    false);
        document.addEventListener("click",      handleMouseClick, false);
        document.addEventListener("mousedown",  handleMouseDown,  false);
        document.addEventListener("mouseup",    handleMouseUp,    false);
        document.addEventListener("mousemove",  handleMouseMove,  false);
        document.addEventListener("mousewheel", handleMouseWheel, false);

        game.projector = new THREE.Projector();

        // Set the initial game mode and round counter
        game.mode = GAME_MODE.BUILD;
        game.round = 1;
		game.levelIndex = 0;
        document.getElementsByTagName('body')[0].style.cursor = 'url(\"images/repair-cursor.cur\"), default';

        // Set initial 'instructions'
        game.instructions = {
            draw: true,
            alpha: 1.0,
            lines: [
                { text: "Flatland Defender", style: styles.title },
                { text: "A game by:", style: styles.style1 },
                { text: "    Brian Ploeckelman", style: styles.highlight },
                { text: "    Eric Satterness", style: styles.highlight },
                { text: "    Shreedhar Hardikar", style: styles.highlight },
                { text: "    Suli Yang", style: styles.highlight },
                { text: "Made at:", style: styles.style1 },
                { text: "    UW-Madison", style: styles.highlight },
                { text: "For CS 679:", style: styles.style1 },
                { text: "    Games Tech, Fall 2012", style: styles.highlight},
            ],
            position: new THREE.Vector2(25, window.innerHeight / 10),
            tween: new TWEEN.Tween({ alpha: 1.0 })
                        .to({ alpha: 0.0 }, 3500)
                        .easing(TWEEN.Easing.Cubic.In)
                        .onUpdate(function () { game.instructions.alpha = this.alpha; })
                        .onComplete(function () {
                            game.instructions = instructions.build;
                            game.instructions.tween.start();
                        })
                        .start()
        };
		
		//Draw the game over screen the same way we do the instruction
		game.gameover = false;

        // Initialize the camera
        game.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        game.camera.position.set(0,0,0);
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
		var levelDetails = LEVEL_DETAILS[game.levelIndex];
        game.level  = new Level(game, levelDetails.numXCells, levelDetails.numYCells, levelDetails.artifactPositions);

        // Move camera to center of level
        game.camera.position.set(game.level.size.width / 2, game.level.size.height / 2, 200);

        // Initialize the player
        game.player = new Player(game);

        // Initialize particle system container
        game.particles = [];

        // Initialize the build mode object
        // Note: add other properties for current structure type
        //       and build menu and other stuff like that
        game.build = {
            structure: null,
            readyTween1: null,
            readyTween2: null,
            tweenStarted: false
        };

        // Initialize the music tracks
        var FADE_TIME = 2000,
            DEFAULT_VOLUME = 0.25;
        game.music = {
            build:  { audio: new Audio("sounds/build_phase_music.mp3")  },
            defend: { audio: new Audio("sounds/defend_phase_music.mp3") }
        };
        game.music.build.audio.loop  = true;
        game.music.defend.audio.loop = true;

        // Setup music begin/end helper functions (fade in/out, start/stop/reset)
        game.music.build.begin = function () {
            game.music.build.audio.volume = 0;
            game.music.build.audio.play();
            new TWEEN.Tween({ volume: 0 })
                .to({ volume: DEFAULT_VOLUME }, FADE_TIME)
                .onUpdate(function () { game.music.build.audio.volume = this.volume; })
                .start();
        };
        game.music.build.end = function () {
            new TWEEN.Tween({ volume: DEFAULT_VOLUME })
                .to({ volume: 0 }, FADE_TIME)
                .onUpdate(function () { game.music.build.audio.volume = this.volume; })
                .onComplete(function () {
                    game.music.build.audio.pause();
                    game.music.build.audio.currentTime  = 0;
                })
                .start();
        };

        game.music.defend.begin = function () {
            game.music.defend.audio.volume = 0;
            game.music.defend.audio.play();
            new TWEEN.Tween({ volume: 0 })
                .to({ volume: DEFAULT_VOLUME }, FADE_TIME)
                .onUpdate(function () { game.music.defend.audio.volume = this.volume; })
                .start();
        };
        game.music.defend.end = function () {
            new TWEEN.Tween({ volume: DEFAULT_VOLUME })
                .to({ volume: 0 }, FADE_TIME)
                .onUpdate(function () { game.music.defend.audio.volume = this.volume; })
                .onComplete(function () {
                    game.music.defend.audio.pause();
                    game.music.defend.audio.currentTime  = 0;
                })
                .start();
        };
        // Start build music
        game.music.build.audio.volume = DEFAULT_VOLUME;
        game.music.build.audio.play();

		
		// Initialize the menus
		game.menus = [];
		var button = document.getElementById("initOneByOne");
		button.setAttribute('data-structType', STRUCTURE_TYPES.ONE_BY_ONE);
		button.setAttribute('data-structCost', STRUCTURE_COSTS[STRUCTURE_TYPES.ONE_BY_ONE]);
		button.onclick = function () {
			self.input.menuClicked = true;
			createStructure(STRUCTURE_TYPES.ONE_BY_ONE, game);
		};
        button.onmousedown = function () {
            document.getElementById("initOneByOne").style.background = "url(images/button-pressed.png) center";
            document.getElementById("initOneByOne").style.backgroundSize = "100% 100%";
        };
        button.onmouseup = function () {
            if (!document.getElementById("initOneByOne").disabled) {
                document.getElementById("initOneByOne").style.background = "url(images/button.png) center";
                document.getElementById("initOneByOne").style.backgroundSize = "100% 100%";
            }
        };
		game.menus.push(button);
		
		button = document.getElementById("initTwoByTwo");
		button.setAttribute('data-structType', STRUCTURE_TYPES.TWO_BY_TWO);
		button.setAttribute('data-structCost', STRUCTURE_COSTS[STRUCTURE_TYPES.TWO_BY_TWO]);
		button.onclick = function () {
			self.input.menuClicked = true;
			createStructure(STRUCTURE_TYPES.TWO_BY_TWO, game);
		};
        button.onmousedown = function () {
            document.getElementById("initTwoByTwo").style.background = "url(images/button-pressed.png) center";
            document.getElementById("initTwoByTwo").style.backgroundSize = "100% 100%";
        };
        button.onmouseup = function () {
            if (!document.getElementById("initTwoByTwo").disabled) {
                document.getElementById("initTwoByTwo").style.background = "url(images/button.png) center";
                document.getElementById("initTwoByTwo").style.backgroundSize = "100% 100%";
            }
        };
		game.menus.push(button);
		
		button = document.getElementById("initThreeByThree");
		button.setAttribute('data-structType', STRUCTURE_TYPES.THREE_BY_THREE);
		button.setAttribute('data-structCost', STRUCTURE_COSTS[STRUCTURE_TYPES.THREE_BY_THREE]);
		button.onclick = function () {
			self.input.menuClicked = true;
			createStructure(STRUCTURE_TYPES.THREE_BY_THREE, game);
		};
        button.onmousedown = function () {
            document.getElementById("initThreeByThree").style.background = "url(images/button-pressed.png) center";
            document.getElementById("initThreeByThree").style.backgroundSize = "100% 100%";
        };
        button.onmouseup = function () {
            if (!document.getElementById("initThreeByThree").disabled) {
                document.getElementById("initThreeByThree").style.background = "url(images/button.png) center";
                document.getElementById("initThreeByThree").style.backgroundSize = "100% 100%";
            }
        };
		game.menus.push(button);
		
		button = document.getElementById("initFourByFour");
		button.setAttribute('data-structType', STRUCTURE_TYPES.FOUR_BY_FOUR);
		button.setAttribute('data-structCost', STRUCTURE_COSTS[STRUCTURE_TYPES.FOUR_BY_FOUR]);
		button.onclick = function () {
			self.input.menuClicked = true;
			createStructure(STRUCTURE_TYPES.FOUR_BY_FOUR, game);
		};
        button.onmousedown = function () {
            document.getElementById("initFourByFour").style.background = "url(images/button-pressed.png) center";
            document.getElementById("initFourByFour").style.backgroundSize = "100% 100%";
        };
        button.onmouseup = function () {
            if (!document.getElementById("initFourByFour").disabled) {
                document.getElementById("initFourByFour").style.background = "url(images/button.png) center";
                document.getElementById("initFourByFour").style.backgroundSize = "100% 100%";
            }
        };
		game.menus.push(button);

        // ------- "Done Building" Button Handlers ------------
        document.getElementById("switchMode").onclick = function () {
            if (self.mode === GAME_MODE.BUILD) {
                // Reset the 'done building' button
                if (self.build.tweenStarted) {
                    self.build.readyTween1.stop();
                    self.build.readyTween2.stop();
                    self.build.readyTween1 = null;
                    self.build.readyTween2 = null;
                    self.build.tweenStarted = false;
                }
                self.switchMode();
            }
        };
        document.getElementById("switchMode").onmousedown = function () {
            document.getElementById("switchMode")
                    .getElementsByTagName("input")[0]
                    .style.background = "url(images/button-pressed.png) center";
            document.getElementById("switchMode")
                    .getElementsByTagName("input")[0]
                    .style.backgroundSize = "100% 100%";
        };
        document.getElementById("switchMode").onmouseup = function () {
            document.getElementById("switchMode")
                    .getElementsByTagName("input")[0]
                    .style.background = "url(images/button.png) center";
            document.getElementById("switchMode")
                    .getElementsByTagName("input")[0]
                    .style.backgroundSize = "100% 100%";
        };

        // --------- Help button handlers ------------------
        document.getElementById("help").onclick = function () {
            game.instructions.tween.stop();

            // Fill game.instructions with instruction text/styles
            if (self.mode === GAME_MODE.BUILD) {
                if (game.instructions === instructions.build) {
                    game.firstBuild = false;
                    game.instructions.draw = !game.instructions.draw;
                    if (game.instructions.draw)
                        game.instructions.tween.start();
                } else {
                    game.instructions = instructions.build;
                    game.instructions.tween.start();
                }
            } else if (self.mode === GAME_MODE.DEFEND) {
                if (game.instructions === instructions.defend) {
                    game.firstDefend = false;
                    game.instructions.draw = !game.instructions.draw;
                    if (game.instructions.draw)
                        game.instructions.tween.start();
                } else {
                    game.instructions = instructions.defend;
                    game.instructions.tween.start();
                }
            }
        };
        document.getElementById("help").onmousedown = function () {
            document.getElementById("help")
                    .getElementsByTagName("input")[0]
                    .style.background = "url(images/button-pressed.png) center";
            document.getElementById("help")
                    .getElementsByTagName("input")[0]
                    .style.backgroundSize = "100% 100%";
        };
        document.getElementById("help").onmouseup = function () {
            document.getElementById("help")
                    .getElementsByTagName("input")[0]
                    .style.background = "url(images/button.png) center";
            document.getElementById("help")
                    .getElementsByTagName("input")[0]
                    .style.backgroundSize = "100% 100%";
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

                new Audio("sounds/click.wav").play();
            }
        }
		
		//Check if any menus need to be disabled
		updateMenus(game);
    }
}


// Handle Collisions ----------------------------------------------------------
function handleCollisions (game) {
    var player = game.player;
    
    for(var i = game.level.artifacts.length-1; i>=0; --i) {
        var artifact = game.level.artifacts[i];
        for(var j = game.wave.enemies.length-1; j>=0; --j) {
            var enemy = game.wave.enemies[j];
            if ( enemy.collidesWith(artifact) ) {
                enemy.handleCollision(artifact);
                artifact.handleCollision(enemy);
            }
        }
    }
    // TODO: move player/enemy collision test to Wave object?
    for(var i = game.wave.enemies.length-1; i>=0; --i) {
        var enemy = game.wave.enemies[i];
        if ( enemy.collidesWith(player)) {
            enemy.handleCollision(player);
            player.handleCollision(enemy);
        }     
        
    }
    
    for(var i = game.level.structures.length-1; i>=0; --i) {
        var struct = game.level.structures[i];
        if ( player.collidesWith(struct) ) {
            player.handleCollision(struct);
            struct.handleCollision(player);
        }
        for(var j = game.wave.enemies.length-1; j>=0; --j) {
            var enemy = game.wave.enemies[j];
            if ( struct.collidesWith(enemy)) {
                struct.handleCollision(enemy);
                enemy.handleCollision(struct);
                //console.log("collide with enemy"+j)
            }
        } 
    }
    for(var i = game.level.structures.length-1; i>=0; --i) {
        var struct = game.level.structures[i];
        if ( struct.dead ) {
            struct.die(i);
        }
    }
}


// Update Menus ---------------------------------------------------------------
function updateMenus (game) {
    var allDisabled = true;

	for (var i=0; i<game.menus.length; i++)
	{
		var menuButton = game.menus[i];
		
		//Default to enabled
		menuButton.disabled = false;
		
		var structCost = menuButton.getAttribute("data-structCost");
		if (game.player.money < structCost)
			menuButton.disabled = true;

        menuButton.onmousedown();
        menuButton.onmouseup();

        if (!menuButton.disabled) 
            allDisabled = false;
	}

    if (allDisabled && !game.build.tweenStarted) {
        var button = document.getElementById("switchMode").getElementsByTagName("input")[0];
        var startSize1 = new THREE.Vector2(200, 64);
        var tween1 = new TWEEN.Tween({
                width: startSize1.x,
                height: startSize1.y
            })
            .to({ width: 256, height: 100 }, 450)
            .onUpdate(function () {
                button.style.width  = "" + this.width  + "px";
                button.style.height = "" + this.height + "px";
            })
            .onComplete(function () {
                this.width  = startSize1.x;
                this.height = startSize1.y;
            });

        var startSize2 = new THREE.Vector2(256, 100);
        var tween2 = new TWEEN.Tween({
                width: startSize2.x,
                height: startSize2.y 
            })
            .to({ width: startSize1.x, height: startSize1.y }, 450)
            .onUpdate(function () {
                button.style.width  = "" + this.width  + "px";
                button.style.height = "" + this.height + "px";
            })
            .onComplete(function () {
                this.width  = startSize2.x;
                this.height = startSize2.y;
            });

        tween1.chain(tween2);
        tween2.chain(tween1);

        game.build.readyTween1 = tween1;
        game.build.readyTween2 = tween2;
        game.build.readyTween1.start();
        game.build.tweenStarted = true;
    }
}


// Update the camera ----------------------------------------------------------
function updateCamera (game) {
    var ZOOM_SPEED = 1,
        KEY_PAN_SPEED  = 3,
        CAMERA_FRICTION = { x: 0.9, y: 0.9 };

    // Zoom the camera
    if (game.input.zoom) {
        if (game.input.zoomMod) game.camera.position.z += ZOOM_SPEED;
        else                    game.camera.position.z -= ZOOM_SPEED;
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
            if (game.player.velocity.x != 0) game.camera.velocity.x = game.player.velocity.x;
            else                             game.camera.velocity.x = dx / d;
            if (game.player.velocity.y != 0) game.camera.velocity.y = game.player.velocity.y;
            else                             game.camera.velocity.y = dy / d;

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

// discardBuildStructure ------------------------------------------------------
function discardBuildStructure (game) {
    if (game.mode === GAME_MODE.BUILD) {
        // Discard currently ready-to-place structure
        if (game.build.structure !== null) {
            // Reimburse the player for the stucture's cost
            game.player.money += STRUCTURE_COSTS[game.build.structure.type];

            // Shrink the mesh out of existence (opposite of new structure)
            new TWEEN.Tween({ scale: 1.0 })
                .to({ scale: 0.0 }, 350)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    game.build.structure.mesh.scale.x = this.scale;
                    game.build.structure.mesh.scale.y = this.scale;
                    game.build.structure.mesh.scale.z = 1.0;
                })
                .onComplete(function () {
                    // Cleanup the mesh and drop the structure object
                    game.scene.remove(game.build.structure.node);
                    game.build.structure = null;
                })
                .start();
        }

        // Update menu buttons
        updateMenus(game);
    }
};

