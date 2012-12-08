// ----------------------------------------------------------------------------
// Player object
// ----------------------------------------------------------------------------
function Player (game) {

    // Public properties ------------------------------------------------------
    this.mesh     	= null;
    this.position 	= null;
    this.velocity 	= null;
    this.money		= null;
    this.isSpinning = false;
	this.health		= 100;
    this.enemyDamage = 10;
	this.damageEffect = null;
	this.canSpin = true;


    // Private variables ------------------------------------------------------
    var self = this,
        TEXTURE     = THREE.ImageUtils.loadTexture("images/player.png"),
        PLAYER_SIZE = { w: 9, h: 9 },
        MOVE_SPEED  = { x: 0.25, y: 0.25 },
        MAX_SPEED   = { x: 3, y: 3 },
        PLAYER_Z    = 0.2,
        SPIN_SLOWDOWN = 0.85,
        CONTROL_ROTATION = -Math.PI / 8;


    // Player methods ---------------------------------------------------------
    this.update = function () {	
        // Move the player using keyboard
		var keydx = 0, keydy = 0;
        if      (game.input.panLeft)  { this.velocity.x -= MOVE_SPEED.x; keydx -= MOVE_SPEED.x; }
        else if (game.input.panRight) { this.velocity.x += MOVE_SPEED.x; keydx += MOVE_SPEED.x; }
        else                          { this.velocity.x  = 0; keydx = 0; }

        if      (game.input.panUp)    { this.velocity.y += MOVE_SPEED.y; keydy += MOVE_SPEED.y; }
        else if (game.input.panDown)  { this.velocity.y -= MOVE_SPEED.y; keydy -= MOVE_SPEED.y; }
        else                          { this.velocity.y  = 0; keydy = 0; }

		// Rotate the keyboard movement vector by 45 deg for nicer control
		/*
		var kx = this.velocity.x + keydx,
			ky = this.velocity.y + keydy,
			keyrotx = kx * Math.cos(CONTROL_ROTATION) - ky * Math.sin(CONTROL_ROTATION),
			keyroty = kx * Math.sin(CONTROL_ROTATION) + ky * Math.cos(CONTROL_ROTATION);

		// Move player based on mouse movements
		this.velocity.x = keyrotx;
		this.velocity.y = keyroty;
		*/		
        // Move the player by moving mouse to edges of screen
        if (game.input.mouseMove && !game.countdown) {
            var minEdge = new THREE.Vector2(
                    window.innerWidth  / 2,
                    window.innerHeight / 2),
                maxEdge = new THREE.Vector2(
                    window.innerWidth  / 2,
                    window.innerHeight / 2),
                // TODO: recalculate min/max edges on window resize
                MOUSE_PAN_SPEED = 125,
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

            // Rotate the mouse movement vector by 45 deg for nicer control
            var x = this.velocity.x + dx,
                y = this.velocity.y + dy,
                rotx = x * Math.cos(CONTROL_ROTATION) - y * Math.sin(CONTROL_ROTATION),
                roty = x * Math.sin(CONTROL_ROTATION) + y * Math.cos(CONTROL_ROTATION);

            // Move player based on mouse movements
            this.velocity.x = rotx;
            this.velocity.y = roty;
        }

        // Slow the player down if they are spinning
        if (this.isSpinning) {
            this.velocity.x *= SPIN_SLOWDOWN;
            this.velocity.y *= SPIN_SLOWDOWN;
        }

        // Limit the players maximum velocity
        if (this.velocity.x >  MAX_SPEED.x) this.velocity.x =  MAX_SPEED.x;
        if (this.velocity.x < -MAX_SPEED.x) this.velocity.x = -MAX_SPEED.x;

        if (this.velocity.y >  MAX_SPEED.y) this.velocity.y =  MAX_SPEED.y;
        if (this.velocity.y < -MAX_SPEED.y) this.velocity.y = -MAX_SPEED.y;
		
        // Position the mesh to correspond with players updated position
        this.mesh.position = this.position.addSelf(this.velocity).clone();
		
		//Check structure collisions
		this.checkStructCollisions();
		//this.checkArtifactCollision();

        // Handle spin move
        if (game.input.spin && !self.isSpinning && self.canSpin) {
            var currentZoom = game.camera.position.z;

            self.isSpinning = true;
			self.canSpin = true;  // DISABLED FOR NOW
            self.mesh.scale.x = 5;
            self.mesh.scale.y = 5;
            
            // Rotate the player
            var ROT_AMOUNT = -8 * Math.PI,
                ROT_TIME   = 500;

			setTimeout(function () { self.canSpin = true; }, 2 * ROT_TIME);
            new TWEEN.Tween({ rot: 0 })
                .to({ rot: ROT_AMOUNT }, ROT_TIME)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () { self.mesh.rotation.z = this.rot; })
                .onComplete(function () { self.isSpinning = false;})
                .start();

            var snd = new Audio("sounds/saw1.mp3");
            snd.play();
        }
    };
	
	this.checkStructCollisions = function() {
		var playerMin = new THREE.Vector2(
            self.position.x - 9 / 2,
            self.position.y - 9 / 2),
        playerMax = new THREE.Vector2(
            self.position.x + 9 / 2,
            self.position.y + 9 / 2);
			
		for (var i = 0; i < game.level.structures.length; i++) {
			var struct = game.level.structures[i];

			if (playerMin.x > struct.positionMax.x
			 || playerMax.x < struct.positionMin.x
			 || playerMin.y > struct.positionMax.y
			 || playerMax.y < struct.positionMin.y) {
				continue;
			} else {
				self.velocity.x = -self.velocity.x;
				self.velocity.y = -self.velocity.y;
				self.mesh.position = self.position.addSelf(self.velocity).clone();
			}
		}
	};
	
	this.checkArtifactCollision = function() {
		var playerMin = new THREE.Vector2(
            self.position.x - 9 / 2,
            self.position.y - 9 / 2),
        playerMax = new THREE.Vector2(
            self.position.x + 9 / 2,
            self.position.y + 9 / 2);
			
		var artifact = game.level.artifact;

		if (playerMin.x > artifact.positionMax.x
		 || playerMax.x < artifact.positionMin.x
		 || playerMin.y > artifact.positionMax.y
		 || playerMax.y < artifact.positionMin.y) {
			//Do nothing
		} else {
			self.velocity.x = -self.velocity.x;
			self.velocity.y = -self.velocity.y;
			self.mesh.position = self.position.addSelf(self.velocity).clone();
		}
	};
	
	
	this.takeDamage = function (amount) {
		self.health = self.health - amount;
        if (self.health <= 0) {
            self.die();
        } else {
            //Damage effect?
			 if (!self.damageEffect.running) {
			    var snd = new Audio("sounds/player_hurt.wav");
				snd.play();
                self.damageEffect.tween.start();
                self.damageEffect.running = true;
            }
        }
    };


    this.die = function () {
        spawnParticles(
            // TODO: make a new particle system type for this
            PARTICLES.ENEMY_DEATH,
            self.mesh.position,
            { color: new THREE.Color(0xff0000) },
            game
        );
        game.scene.remove(self.mesh);
		
        var snd = new Audio("sounds/player_die.wav");
        snd.play();
		//End game
		game.gamelost = true;
    };
	

	this.reset = function() {
		self.mesh.position.set(PLAYER_SIZE.w / 2, PLAYER_SIZE.h / 2, PLAYER_Z);
        self.position = self.mesh.position;
        self.velocity = new THREE.Vector3(0,0,0);
	};

    // Constructor ------------------------------------------------------------
    (this.init = function (player) {
		var playerColor =  new THREE.Color(0xff0000);
        // Create player mesh
        player.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PLAYER_SIZE.w, PLAYER_SIZE.h),
            new THREE.MeshBasicMaterial({
                color: playerColor,
                map: TEXTURE,
                transparent: true,
                wireframe: false
            })
        );
        player.mesh.position.set(PLAYER_SIZE.w / 2, PLAYER_SIZE.h / 2, PLAYER_Z);
        player.position = player.mesh.position;
        player.velocity = new THREE.Vector3(0,0,0);
		
		player.positionMin = new THREE.Vector2(
            self.position.x - 9 / 2,
            self.position.y - 9 / 2);
        player.positionMax = new THREE.Vector2(
            self.position.x + 9 / 2,
            self.position.y + 9 / 2);

        player.money = 250;
		
		player.damageEffect = {
            running: false,
            tween: null
        };
        player.damageEffect.tween = new TWEEN.Tween({ red: 1 })
            .to({ red: 0 }, 250)
            .onUpdate(function () {
                player.mesh.material.color.setRGB(this.red, playerColor.g, playerColor.b);
            })
            .onComplete(function () {
                this.red = 1;
				player.mesh.material.color.setRGB(1, playerColor.g, playerColor.b);
				player.damageEffect.running = false;
            });


        // Create "breathing" animation
        var BREATHE_TIME = 1000,
            MAX_SCALE = 1.2,
            MIN_SCALE = 0.8,
            breatheIn = new TWEEN.Tween({ scale: MIN_SCALE })
                .to({ scale: MAX_SCALE }, BREATHE_TIME)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    player.mesh.scale.x = this.scale;
                    player.mesh.scale.y = this.scale;
                })
                .onComplete(function () { this.scale = MIN_SCALE; }),
            breatheOut = new TWEEN.Tween({ scale: MAX_SCALE })
                .to({ scale: MIN_SCALE }, BREATHE_TIME)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    player.mesh.scale.x = this.scale;
                    player.mesh.scale.y = this.scale;
                })
                .onComplete(function () { this.scale = MAX_SCALE; });

        breatheIn.chain(breatheOut);
        breatheOut.chain(breatheIn);
        breatheIn.start();

        console.log("Player initialized.");
    })(self);

} // end Player object

