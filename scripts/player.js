// ----------------------------------------------------------------------------
// Player object
// ----------------------------------------------------------------------------
function Player (game) {

    // Public properties ------------------------------------------------------
    this.mesh     = null;
    this.isSpinning = false;
	this.box2dObject = null;
	//this.position = null;
	//this.velocity = null;
	//used by box2D
	this.width = null;
	this.height = null;

	
    // Private variables ------------------------------------------------------
    var self = this,
        PLAYER_SIZE = { w: 9, h: 9 },
        MOVE_SPEED  = { x: 0.25, y: 0.25 },
        MAX_SPEED   = { x: 3, y: 3 },
        PLAYER_Z    = 0.2;


    // Player methods ---------------------------------------------------------
	this.getPosition = function (){
		return self.box2dObject.body.GetPosition();
	}
	
	this.getVelocity = function() {
		return self.box2dObject.body.GetLinearVelocity();
	}
	
    this.update = function () {
	
	    //FIXME:
		//need to scale the velocity....
		var velocity = new b2Vec2;
		
        // Move the player
		
        if      (game.input.panLeft)  velocity.x -= MOVE_SPEED.x;
        else if (game.input.panRight) velocity.x += MOVE_SPEED.x;
        else                          velocity.x  = 0;

        if      (game.input.panUp)    velocity.y += MOVE_SPEED.y;
        else if (game.input.panDown)  velocity.y -= MOVE_SPEED.y;
        else                          velocity.y  = 0;

        // Limit the players maximum velocity
        if (velocity.x >  MAX_SPEED.x) velocity.x =  MAX_SPEED.x;
        if (velocity.x < -MAX_SPEED.x) velocity.x = -MAX_SPEED.x;

        if (velocity.y >  MAX_SPEED.y) velocity.y =  MAX_SPEED.y;
        if (velocity.y < -MAX_SPEED.y) velocity.y = -MAX_SPEED.y;
		
		
	
		var scale = 100.0;
		velocity.x = velocity.x * scale;
		velocity.y = velocity.y * scale;
		self.box2dObject.body.SetLinearVelocity(velocity);
		//self.velocity = velocity;
		
        // Position the mesh to correspond with players updated position
		var position = self.box2dObject.body.GetPosition();
		this.mesh.position.set(position.x, position.y, this.mesh.position.z);
		//this.position = this.mesh.position;
		console.log(position);

        // Handle spin move
        if (game.input.spin && !this.isSpinning) {
            var currentZoom = game.camera.position.z;

            self.isSpinning = true;
            
            // Rotate the player
            var ROT_AMOUNT = -8 * Math.PI,
                ROT_TIME   = 2000;

            new TWEEN.Tween({ rot: 0 })
                .to({ rot: ROT_AMOUNT }, ROT_TIME)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () { self.mesh.rotation.z = this.rot })
                .start();

            // NOTE: just messing around here, don't need to keep this....
            var ZOOM_IN          = 100,
                ZOOM_OUT         = 100,
                ZOOM_IN_TIME     = 1500,
                ZOOM_OUT_TIME    = 700,
                ZOOM_RETURN_TIME = 400;

            // Zoom the camera in...
            new TWEEN.Tween({ zoom: currentZoom })
                .to({ zoom: currentZoom - ZOOM_IN }, ZOOM_IN_TIME)
                .easing(TWEEN.Easing.Elastic.Out)
                .onUpdate(function () { game.camera.position.z = this.zoom; })
                .onComplete(function () {
                    game.camera.position.z = currentZoom - ZOOM_IN;
                    // ...Then zoom farther out...
                    new TWEEN.Tween({ zoom: currentZoom - ZOOM_IN})
                        .to({ zoom: currentZoom + ZOOM_OUT }, ZOOM_OUT_TIME)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .onUpdate(function () {
                            game.camera.position.z = this.zoom;
                        })
                        .onComplete(function () {
                            game.camera.position.z = currentZoom + ZOOM_OUT;
                            // ...Then zoom back to the starting level...
                            new TWEEN.Tween({ zoom: currentZoom + ZOOM_OUT})
                                .to({ zoom: currentZoom }, ZOOM_RETURN_TIME)
                                .easing(TWEEN.Easing.Cubic.In)
                                .onUpdate(function () {
                                    game.camera.position.z = this.zoom;
                                })
                                .onComplete(function () {
                                    game.camera.position.z = currentZoom;
                                    self.isSpinning = false;
                                })
                                .start();
                        })
                        .start();
                })
                .start();
        }
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (player) {
		
		// Create Box2D representation
		player.width = PLAYER_SIZE.w;
		player.height = PLAYER_SIZE.h;
		self.box2dObject = new box2dObject(game, player);
		var position = new b2Vec2(PLAYER_SIZE.w / 2, PLAYER_SIZE.h / 2);
		self.position = position;
		self.box2dObject.body.SetPosition(position);
		
        // Create player mesh
        player.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PLAYER_SIZE.w, PLAYER_SIZE.h),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
        );
        player.mesh.position.set(position.x, position.y, PLAYER_Z);
		
	

        // Create "breathing" animation
        var BREATHE_TIME = 1000,
            MAX_SCALE = 1.25,
            MIN_SCALE = 0.75,
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

