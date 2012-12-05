// ----------------------------------------------------------------------------
// Player object
// ----------------------------------------------------------------------------
function Player (game) {

    // Public properties ------------------------------------------------------
    this.mesh     = null;
    this.money    = null;
    this.isSpinning = false;
	this.box2dObject = null;
	this.type = playerType;
	
	//used by box2D
	this.width = null;
	this.height = null;
     this.damageAmount = 10;
	
    // Private variables ------------------------------------------------------
    var self = this,
        PLAYER_SIZE = { w: 9, h: 9 },
        MOVE_SPEED  = { x: 0.25, y: 0.25 },
        MAX_SPEED   = { x: 3, y: 3 },
        PLAYER_Z    = 0.2,
        SPIN_SLOWDOWN = 0.85;


    // Player methods ---------------------------------------------------------
	this.getPosition = function (){
		//alert("player position" + self.box2dObject.body.GetPosition().x);
		return self.box2dObject.body.GetPosition();
	};
	
	this.getVelocity = function() {
		return self.box2dObject.body.GetLinearVelocity();
	};
	
	this.setPosition = function (position){
		self.box2dObject.body.SetPosition(new b2Vec2(position.x, position.y));
		self.mesh.position.set(position.x, position.y, this.mesh.position.z);
	};
	
	this.setVelocity = function (velocity){
		self.box2dObject.body.SetLinearVelocity(velocity);
	};
	
	this.collide = function(obj){
		if(obj.type == enemyType) {
			alert("Player collides with enemy!");
		}else{
			//collide with unknow object
			//do nothing
		}
	};
	
	
    this.update = function () {
	
	   
		var velocity = new b2Vec2;
		
        // Move the player
        if      (game.input.panLeft)  velocity.x -= MOVE_SPEED.x;
        else if (game.input.panRight) velocity.x += MOVE_SPEED.x;
        else                          velocity.x  = 0;

        if      (game.input.panUp)    velocity.y += MOVE_SPEED.y;
        else if (game.input.panDown)  velocity.y -= MOVE_SPEED.y;
        else                          velocity.y  = 0;

        // Slow the player down if they are spinning
        if (this.isSpinning) {
            velocity.x *= SPIN_SLOWDOWN;
            velocity.y *= SPIN_SLOWDOWN;
        }

        // Limit the players maximum velocity
        if (velocity.x >  MAX_SPEED.x) velocity.x =  MAX_SPEED.x;
        if (velocity.x < -MAX_SPEED.x) velocity.x = -MAX_SPEED.x;

        if (velocity.y >  MAX_SPEED.y) velocity.y =  MAX_SPEED.y;
        if (velocity.y < -MAX_SPEED.y) velocity.y = -MAX_SPEED.y;
		
		
	
		var scale = 400.0;
		velocity.x = velocity.x * scale;
		velocity.y = velocity.y * scale;
		
		self.box2dObject.body.SetLinearVelocity(velocity);

		
        // Position the mesh to correspond with players updated position
	        this.mesh.rotation.z = this.box2dObject.body.GetAngle();
		var position = self.box2dObject.body.GetPosition();
		this.mesh.position.set(position.x, position.y, this.mesh.position.z);

        // Handle spin move
        if (game.input.spin && !this.isSpinning) {
            var currentZoom = game.camera.position.z;

            self.isSpinning = true;
	    this.scale(5,5);
            
	    //FIXME:
	    //Not quite sure whether this would work or not..
    
            // Rotate the player
            var ROT_AMOUNT = -8 * Math.PI,
                ROT_TIME   = 500;
	    
	    

	    
	 
            new TWEEN.Tween({ rot: 0 })
                .to({ rot: ROT_AMOUNT }, ROT_TIME)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () { self.rotate(this.rot); })
     
		.onComplete(function () { self.isSpinning = false; })
                .start();

        }
    };

    this.rotate = function (angle) {
    	this.box2dObject.body.SetAngle(angle + this.box2dObject.body.GetAngle());
    };		
    
    this.scale = function (scale_w, scale_h) {
    	var fixDef = this.box2dObject.fixDef;
	fixDef.shape.SetAsBox(this.width * scale_w / 2, this.height * scale_h / 2);
	this.box2dObject.fixture = this.body.CreateFixture(fixDef);
	
	this.mesh.scale.x = scale_w;
	this.mesh.scale.y = scale_h;
    };

    this.reset = function() {
        self.mesh.position.set(PLAYER_SIZE.w / 2, PLAYER_SIZE.h / 2, PLAYER_Z);
        self.setPosition(b2Vec2(self.mesh.position.x, self.mesh.position.y));
        self.setVelocity (b2Vec2(0,0));
    };
    
    // Constructor ------------------------------------------------------------
    (this.init = function (player) {
		
		// Create Box2D representation
		player.width = PLAYER_SIZE.w  / box2DPosScale;
		player.height = PLAYER_SIZE.h  / box2DPosScale;
		self.box2dObject = new box2dObject(game, player);
		var position = new b2Vec2(PLAYER_SIZE.w / 2, PLAYER_SIZE.h / 2);
		self.box2dObject.body.SetPosition(position);
		
        // Create player mesh
        player.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PLAYER_SIZE.w, PLAYER_SIZE.h),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
        );

        player.mesh.position.set(position.x, position.y, PLAYER_Z);
		
	player.money = 100;
		/*
        // Create "breathing" animation
        var BREATHE_TIME = 1000,
            MAX_SCALE = 1.05,
            MIN_SCALE = 0.95,
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
		*/
        console.log("Player initialized.");
    })(self);

} // end Player object

