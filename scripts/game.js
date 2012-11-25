// ----------------------------------------------------------------------------
// Game object 
// ----------------------------------------------------------------------------
function Game(canvas, renderer) {
	//FIXME:
	//Delete me later, just for debugdraw
	var debugcanvas = document.getElementById("debugcanvas");
	 debugcanvas.width = 800;
	 debugcanvas.height = 300;
	var theContext = debugcanvas.getContext("2d");


    // Public properties ------------------------------------------------------
    this.frames = 0;            // number of frames drawn
    this.scene  = null; 
    this.camera = null;
    this.level  = null;
    this.player = null;
    this.enemies = null;
	this.box2d = {
		world: null,
		bodyDef: null,
		fixDef: null,
	};
		
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
        ZOOM_SPEED = 1,
        CAMERA_FRICTION = { x: 0.9, y: 0.9 };


    // Game methods -----------------------------------------------------------
    this.update = function () {
		//FIXME:
		//we need to centralize position and velocity update
		//shouldn't do it twice, once in box2d, and once in our game logic
		self.box2d.world.Step(1/60, 10, 10);
		self.box2d.world.DrawDebugData();
    	self.box2d.world.ClearForces();
		
        self.level.update();
        self.player.update();

        for(var i = 0; i < self.enemies.length; ++i) {
            self.enemies[i].update();
        }
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
        var dx = self.player.getPosition().x - self.camera.position.x,
            dy = self.player.getPosition().y - self.camera.position.y,
            d  = Math.sqrt(dx*dx + dy*dy);

        if (d < 150) {
            self.camera.position.x = self.player.mesh.position.x - 100;
            self.camera.position.y = self.player.mesh.position.y - 100;
        } else {
            if (self.player.getVelocity().x != 0) {
                self.camera.velocity.x = self.player.getVelocity().x;
            } else {
                self.camera.velocity.x = dx / d;
            }

            if (self.player.getVelocity().y != 0) {
                self.camera.velocity.y = self.player.getVelocity().y;
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


	this.initBox2d = function (){
		//zero gravity for the world
		self.box2d.world = new b2World(new b2Vec2(0,0), false);
		
		//set collision listener
		
		var collider = new b2ContactListener;
		collider.BeginContact = function(contact) {}
		collider.EndContact = function(contact) {
			alert("call colling function!");
			obj1 = contact.GetFixtureA().GetBody().GetUserData();
			obj2 = contact.GetFixtureB().GetBody().GetUserData();
			alert(contact.GetFixtureA().GetBody());
			alert(contact.GetFixtureB().GetBody());
			if (obj1 != null && obj2 != null){
				obj1.collide(obj2);
			}}
		collider.PostSolve = function(contact, impulse) {
			/*
			alert("call colling function!");
			obj1 = contact.GetFixtureA().GetBody().GetUserData();
			obj2 = contact.GetFixtureB().GetBody().GetUserData();
			if (obj1 != null && obj2 != null){
				obj1.collide(obj2);
			}*/
		}
		collider.PreSolve = function(contact, oldManifold) {}
		self.box2d.world.SetContactListener(collider);
		
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
		
		// Initialize the physics using Box2D
		game.initBox2d();
		
		
		   var debugDraw = new b2DebugDraw();
			debugDraw.SetSprite(theContext);
			debugDraw.SetDrawScale(1.0);
			debugDraw.SetFillAlpha(0.5);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			game.box2d.world.SetDebugDraw(debugDraw);

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

        // Initialize an enemy
        var NUM_ENEMIES = 1,
            enemy = null;

        game.enemies = [];
        for(var i = 0; i < NUM_ENEMIES; ++i){
            enemy = new Enemy(game, {
                color:    new THREE.Vector3(
                                Math.random(),
                                Math.random(),
                                Math.random()),
                position: new THREE.Vector3(
                                Math.floor(Math.random() * 1000),
                                Math.floor(Math.random() * 1000), 0.1),
                size:     new THREE.Vector2(
                                Math.floor(Math.random() * 40) + 10,
                                Math.floor(Math.random() * 40) + 10),
                speed:    new THREE.Vector2(
                                Math.random() * 1.5,
                                Math.random() * 1.5),
                maxspeed: new THREE.Vector2(5,5)
            });
            enemy.setFollowTarget(game.player);
            game.scene.add(enemy.mesh);

            game.enemies.push(enemy);
        }

        console.log("Game initialized.");
    })(self);

} // end Game object

