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
    this.health		= 1000;
    this.enemyDamage = 10;
    this.damageEffect = null;
    this.canSpin = true;

    this.collidable = true;
    this.boundingBox = null;
        
    // Private variables ------------------------------------------------------
    var self = this,
        TEXTURE     = THREE.ImageUtils.loadTexture("images/player.png"),
        PLAYER_SIZE = { w: 10, h: 10 },
        MOVE_SPEED  = { x: 1.0, y: 1.0 },
        MAX_SPEED   = { x: 3, y: 3 },
        PLAYER_Z    = 0.2,
        SPIN_SLOWDOWN      = 0.85,
        MOUSE_PAN_SPEED    = 8,
        KEYBOARD_PAN_SPEED = 1.0,
        KEYBOARD_FRICTION  = 0.85,
        CONTROL_ROTATION   = -Math.PI / 4; // 45 degrees counter-clockwise for defend phase
    var keydx = 0, keydy = 0; // TODO: should just be acceleration


    // Player methods ---------------------------------------------------------
    this.update = function () {	
        // KEYBOARD MOVEMENT ----------------------------------------

        // Move the player using keyboard
        if      (game.input.panLeft)  { keydx -= KEYBOARD_PAN_SPEED; }
        else if (game.input.panRight) { keydx += KEYBOARD_PAN_SPEED; }
        else                          { this.velocity.x = 0; keydx *= KEYBOARD_FRICTION; }
        if      (game.input.panUp)    { keydy += KEYBOARD_PAN_SPEED; }
        else if (game.input.panDown)  { keydy -= KEYBOARD_PAN_SPEED; }
        else                          { this.velocity.y = 0; keydy *= KEYBOARD_FRICTION; }

        if (keydx >  MAX_SPEED.x) keydx =  MAX_SPEED.x;
        if (keydx < -MAX_SPEED.x) keydx = -MAX_SPEED.x;
        if (keydy >  MAX_SPEED.y) keydy =  MAX_SPEED.y;
        if (keydy < -MAX_SPEED.y) keydy = -MAX_SPEED.y;

        // Rotate the keyboard movement vector by 45 deg for nicer control
        var keyrotx = keydx * Math.cos(CONTROL_ROTATION) - keydy * Math.sin(CONTROL_ROTATION),
            keyroty = keydx * Math.sin(CONTROL_ROTATION) + keydy * Math.cos(CONTROL_ROTATION);

        // Move player based on keyboard movements
        this.velocity.x = keyrotx;
        this.velocity.y = keyroty;

        // MOUSE MOVEMENT -------------------------------------------

        // Move the player by moving mouse to edges of screen
        // Note: commented input flag so mouse always moves player
        if (game.input.mouseMove && !game.countdown) {
            var dx = 0, dy = 0,
                halfWidth  = window.innerWidth  * 0.5,
                halfHeight = window.innerHeight * 0.5,
                minEdge = new THREE.Vector2(halfWidth, halfHeight),
                maxEdge = new THREE.Vector2(halfWidth, halfHeight);

            // Calculate delta for x edges
            if (game.input.mousePos.x < minEdge.x) {
                dx = ((game.input.mousePos.x - minEdge.x) / halfWidth) * MOUSE_PAN_SPEED;
            } else if (game.input.mousePos.x > maxEdge.x) {
                dx = ((game.input.mousePos.x - maxEdge.x) / halfWidth) * MOUSE_PAN_SPEED;
            }

            // Calculate delta for y edges
            if (game.input.mousePos.y < minEdge.y) {
                dy = -1 * ((game.input.mousePos.y - minEdge.y) / halfHeight) * MOUSE_PAN_SPEED;
            } else if (game.input.mousePos.y > maxEdge.y) {
                dy = -1 * ((game.input.mousePos.y - maxEdge.y) / halfHeight) * MOUSE_PAN_SPEED;
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
		
        // Update the BoundingBox
	self.boundingBox = new Rect(
                self.position.x - PLAYER_SIZE.w / 2,
                self.position.y - PLAYER_SIZE.h / 2,
                self.position.x + PLAYER_SIZE.w / 2,
                self.position.y + PLAYER_SIZE.h / 2);
        //console.log(self.position);
        // Handle spin move
        if (game.input.spin && !self.isSpinning && self.canSpin) {
            var currentZoom = game.camera.position.z;

            self.isSpinning = true;
            // Note: set canSpin to false to force a pause between attacks
			self.canSpin = true;  // Continuous attacking currently enabled...
            
            // Rotate the player
            var ROT_AMOUNT = -8 * Math.PI,
                ROT_TIME   = 1000;

			setTimeout(function () { self.canSpin = true; }, 2 * ROT_TIME);
            new TWEEN.Tween({ rot: 0 })
                .to({ rot: ROT_AMOUNT }, ROT_TIME)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () { self.mesh.rotation.z = this.rot; })
                .onComplete(function () { self.isSpinning = false;})
                .start();

            new Audio("sounds/saw.wav").play();
        }
    
    };
    
    /*
     * Checks to see if this object collides with the passed object
     */
    this.collidesWith = function (object) {
        if (this.collidable) {
            return self.boundingBox.intersects(object.boundingBox);
        }
        else {
            return false;
        }
            
    };

    this.handleCollision = function (object) {
        if (object instanceof Enemy) {
            //if (!self.isSpinning) {
            self.takeDamage(object.playerDamage);
            //}
        }
        else if (object instanceof Structure) {
            var velocity = new THREE.Vector3(-self.velocity.x,-self.velocity.y,0);

            var structPosition = object.position;
            var enemyPosition = self.position;
            
            //Get the vector from the center of the player to the center of structure
            var diff = new THREE.Vector2().sub(structPosition, enemyPosition);
            
            //Get the vectors along the axes
            var vx = new THREE.Vector2(self.velocity.x,0);
            var vy = new THREE.Vector2(0,self.velocity.y);
            
            //Calulate the angles between the diff vector and the axes
            var thetaX = Math.acos(diff.dot(vx) / vx.length() / diff.length());
            var thetaY = Math.acos(diff.dot(vy) / vy.length() / diff.length());
            //console.log(thetaX * 180 / Math.PI + " " + (thetaY * 180 / Math.PI));
            
            //If X axis is farther, so go along x
            if( thetaX > thetaY ) {
                velocity.x = self.velocity.x / 2;
            } 
            //else Y axis is farther, so go along Y
            else {
                velocity.y = self.velocity.y / 2;
            }
            
            self.mesh.position = self.position.addSelf(velocity).clone();
        }
    }

    this.takeDamage = function (amount) {
            self.health = self.health - amount;
    if (self.health <= 0) {
        self.die();
    } else {
        //Damage effect?
                     if (!self.damageEffect.running) {
                        new Audio("sounds/player_hurt.wav").play();
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
		
        new Audio("sounds/player_die.wav").play();

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
        //console.log(player.position);
        player.velocity = new THREE.Vector3(0,0,0);
		
	player.boundingBox = new Rect(
                self.position.x - PLAYER_SIZE.w / 2, 
                self.position.y - PLAYER_SIZE.h / 2,
                self.position.x + PLAYER_SIZE.w / 2,
                self.position.y + PLAYER_SIZE.h / 2
            );

        // Set initial money
        player.money = 250;
		
        // Create damage effect animation
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
            MAX_SCALE = 1.0,
            MIN_SCALE = 0.7,
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

        //Set the bounding box
        self.boundingBox = new Rect(
                self.position.x - PLAYER_SIZE.w / 2,
                self.position.y - PLAYER_SIZE.h / 2,
                self.position.x + PLAYER_SIZE.w / 2,
                self.position.y + PLAYER_SIZE.h / 2);
                
        console.log("Player initialized.");
    })(self);

} // end Player object

