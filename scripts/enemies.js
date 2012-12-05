// Cylinder: topRadius, bottomRadius, height, radiusSegments, heightSegments
var PYRAMID = new THREE.CylinderGeometry(0, 10, 10, 4, 1),
    TRIANGLE = (function initializeTriangleGeometry () {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-5, -5, 0.2));
        geometry.vertices.push(new THREE.Vector3( 5, -5, 0.2));
        geometry.vertices.push(new THREE.Vector3( 0,  5, 0.2));
        geometry.faces.push(new THREE.Face3(0, 1, 2));
        return geometry;
    }) ();
    
// ----------------------------------------------------------------------------
// Enemy Types & their Description
// ----------------------------------------------------------------------------
var ENEMY_TYPES = {
	BRUTE : 0,
	LUNATIC : 1,
	ARTIPHILE : 2,
};
/*
 * Possible description elements :
 * type, color, position, size, speed, maxspeed, health
 */
var ENEMY_DESCRIPTIONS= [
	{
        type: ENEMY_TYPES.BRUTE,
    },
    {
        type: ENEMY_TYPES.LUNATIC,
        maxspeed: new THREE.Vector2(20,20)
    },
    {
        type: ENEMY_TYPES.ARTIPHILE,
    },
];

// ----------------------------------------------------------------------------
// Enemy object
// ----------------------------------------------------------------------------
function Enemy (description) {

    // Public properties ------------------------------------------------------
    this.mesh     = null;
  //  this.position = null;
  //  this.velocity = null;
    this.size     = null;
    this.speed    = null;
    this.maxspeed = null;
    this.target   = null;
    this.health   = null;
    this.intersects = null;
    this.box2dObject = null;
    this.enemyType     = null;
    this.type = enemyType;
	
	//used by box2D
	this.width = null;
	this.height = null;


    // Private variables ------------------------------------------------------
    var self = this;


    // Enemy methods ---------------------------------------------------------
    this.getPosition = function () {
		return self.box2dObject.body.GetPosition();
	};
	
	this.getVelocity = function () {
		return self.box2dObject.body.GetLinearVelocity();
	};
	
	this.setPosition = function (position){
		self.box2dObject.body.SetPosition(new b2Vec2(position.x, position.y));
		self.mesh.position.set(position.x, position.y, self.mesh.position.z);
	};
	
	this.setVelocity = function (velocity){
		self.box2dObject.body.SetLinearVelocity(velocity);
	};
	
	this.collide = function(obj){
		if(obj.type == playerType) {
			alert("Enemy collides with player!");
		}else if(obj.type == playerType){
			alert("Enemy collides with enemy!");
		}else{
			//collide with unknow object
			//do nothing
		}
	};
	
	this.update = function () {
		
		switch(self.enemyType) {
        	case ENEMY_TYPES.BRUTE :
				self.setFollowTarget(game.player);
				break;
			case ENEMY_TYPES.LUNATIC :
				if (game.frames % 60 == 0 || !self.target) {
					self.target = new THREE.Vector2(
						Math.floor(Math.random() * 1000),
						Math.floor(Math.random() * 1000));
				}
				break;
			case ENEMY_TYPES.ARTIPHILE :
				self.setFollowTarget(game.level.artifact.mesh.position);
				break;
		}	
		var velocity = new b2Vec2
		
		// Follow the target
		if(self.target !== null) {
			velocity.x = self.target.x - self.getPosition().x;
			velocity.y = self.target.y - self.getPosition().y;
			
			//Normalize the velocity
			var d = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
			if(d < 0.1 || d == NaN) d = 1;
			// Update the enemy's velocity
            velocity.x *= self.speed.x / d;
            velocity.y *= self.speed.y / d;
			var scale = 100.0;
			velocity.x = velocity.x * scale;
			velocity.y = velocity.y * scale;
			self.setVelocity(velocity);
		}
		else {
        	self.target = new THREE.Vector2(
                Math.floor(Math.random() * 1000),
                Math.floor(Math.random() * 1000));
		}
		
		
		var position = self.getPosition();
		 // Integrate velocity
		 //FIXME: if the intersects is just some hacking way of detecting collison
		 //we should move the rotation to the collide function
		 //yangsuli
       	 if (!self.intersects) {
            // Rotate towards target
			var angle =  Math.atan2(
                self.target.y - self.mesh.position.y,
                self.target.x - self.mesh.position.x);
         
			self.rotate(angle);
        }
		
			self.mesh.rotation.z = self.box2dObject.body.GetAngle();
			self.mesh.position.set(position.x, position.y, self.mesh.position.z);
			
			console.log(self.box2dObject.body);
	};
	
    this.rotate = function (angle) {
    //	this.box2dObject.body.SetAngle(angle + this.box2dObject.body.GetAngle);
    };		
    
    this.scale = function (scale_w, scale_h) {
    	var fixDef = this.box2dObject.fixDef;
	fixDef.shape.SetAsBox(this.width * scale_w / 2, this.height * scale_h / 2);
	this.box2dObject.fixture = this.body.CreateFixture(fixDef);
	
	this.mesh.scale.x = scale_w;
	this.mesh.scale.y = scale_h;
    };
	  
    		
    this.setFollowTarget = function (object) {
        var level = game.level;
        var grid = new PF.Grid(level.size.xcells, level.size.ycells, level.cells);
        var finder = new PF.AStarFinder();
		var from = new THREE.Vector3(self.getPosition().x, self.getPosition().y, self.mesh.position.z).toGridCoords();
        var to = object.toGridCoords();
        
        if ( from == null || to == null ) {
            self.target = null;
        } else {
            var path = finder.findPath(from.x, from.y, to.x, to.y, grid);

            if (path.length > 1 ) { 
                path = PF.Util.smoothenPath(grid, path);
                self.target = new THREE.Vector2(path[1][0], path[1][1]).toRealCoords();
            }
            //console.log(path, self.target);
        }
    };


    //FIXME:
    //Move this to collide function
    this.takeDamage = function (amount) { 
        if ((self.health = self.health - amount) <= 0) {
            self.die();
        } else {
            // TODO: handle non-lethal damage
        }
    };


    this.die = function () {
        // TODO: add any special handling for enemy death here
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (enemy, description) {
		
		var range = 100.0;
		/*var position = new THREE.Vector3(Math.random()*range,
					Math.random()*range, Math.random()*range);
					*/
		var threePosition = new THREE.Vector3(0,0,0.1);
		var position = new b2Vec2(0,0);
		var velocity = new b2Vec2(0,0);
       // enemy.position = new THREE.Vector3(0,0,0.1);
       // enemy.velocity = new THREE.Vector2(0,0);

        // Initialize properties from description object if available else 
        // assign randomly
		if ("color" in description && description["color"] instanceof THREE.Vector3) {
        	var rgb = description["color"].clone();
            enemy.color = new THREE.Color(0x000000);
            enemy.color.setRGB(rgb.x, rgb.y, rgb.z);       
        } else {
        	enemy.color = new THREE.Color(0x000000);
        	enemy.color.setRGB(Math.random(), Math.random(), Math.random());
        }
        
		if ("position" in description && description["position"] instanceof THREE.Vector3) {
			threePosition = description["position"].clone();
        
        } else {
			threePosition = new THREE.Vector3(Math.floor(Math.random() * 1000),
                        Math.floor(Math.random() * 1000), 0.1);
        }
        
        if ("size" in description && description["size"] instanceof THREE.Vector2) {
        	enemy.size = description["size"].clone();       
        } else {
        	enemy.size = new THREE.Vector2( Math.floor(Math.random() * 40) + 10,
                        Math.floor(Math.random() * 40) + 10);
        }
        
        if ("speed" in description && description["speed"] instanceof THREE.Vector2) {
        	enemy.speed = description["speed"].clone();        
        } else {
        	enemy.speed = new THREE.Vector2( Math.random() * 1.5, Math.random() * 1.5);
        }
        
        if ("maxspeed" in description && description["maxspeed"] instanceof THREE.Vector2) {
        	enemy.maxspeed = description["maxspeed"].clone();        
        }else {
        	enemy.maxspeed = new THREE.Vector2(5,5);	
        }
        if ("health" in description) {
        	enemy.health = description["health"];
        } else {
        	enemy.health = 100;
        }
        if ("type" in description) {
        	enemy.enemyType = description["type"];
        } else {
        	enemy.enemyType = ENEMY_TYPES.BRUTE;
        }
		

        // Generate a mesh for the enemy
        // TODO: pass an enemy type value in the description object
        //       and pick from predefined geometry based on that 
        enemy.mesh = new THREE.Mesh(
            // PYRAMID, // Note: 3d geometry requires rotation/translation
            TRIANGLE,
            new THREE.MeshBasicMaterial({
                color: enemy.color.getHex(),
                //wireframe: true
            })
        );
       // enemy.mesh.position = enemy.position;
	
        enemy.mesh.position = threePosition;
	    enemy.intersects = false;
		// Create box2D representation
		//self.width = self.size.x * 1.35 / SCALE;
		//self.height = self.size.y * 1.35 / SCALE;
		self.width = self.size.x  / box2DPosScale;
		self.height = self.size.y / box2DPosScale;
		self.box2dObject = new box2dObject(game, enemy);
		//self.box2dObject.body.SetPosition(new b2Vec2(position.x, position.y));
		position.x = threePosition.x;
		position.y = threePosition.y;
		self.setPosition(position);
		self.box2dObject.body.SetLinearVelocity(velocity);
		
		
		/*
        // Create "breathing" animation
        var BREATHE_TIME = 150 * Math.max(enemy.size.x, enemy.size.y),
            MAX_SCALE = 1.1,
            MIN_SCALE = 0.9,
            breatheIn = new TWEEN.Tween({ scale: MIN_SCALE })
                .to({ scale: MAX_SCALE }, BREATHE_TIME)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    enemy.mesh.scale.x = this.scale;
                    enemy.mesh.scale.y = this.scale;
                })
                .onComplete(function () { this.scale = MIN_SCALE; }),
            breatheOut = new TWEEN.Tween({ scale: MAX_SCALE })
                .to({ scale: MIN_SCALE }, BREATHE_TIME)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    enemy.mesh.scale.x = this.scale;
                    enemy.mesh.scale.y = this.scale;
                })
                .onComplete(function () { this.scale = MAX_SCALE; });

        breatheIn.chain(breatheOut);
        breatheOut.chain(breatheIn);
        breatheIn.start();
		*/
        console.log("Enemy initialized.");
    })(self, description);

} // end Enemy object

