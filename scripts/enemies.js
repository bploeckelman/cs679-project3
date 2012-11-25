// ----------------------------------------------------------------------------
// Enemy object
// ----------------------------------------------------------------------------
function Enemy (game, description) {

    // Public properties ------------------------------------------------------
    this.mesh     = null;
  //  this.position = null;
  //  this.velocity = null;
    this.size     = null;
    this.speed    = null;
    this.maxspeed = null;
    this.target   = null;
	this.box2dObject = null;
	this.type = enemyType;
	
	//used by box2D
	this.width = null;
	this.height = null;


    // Private variables ------------------------------------------------------
    var self = this;


    // Player methods ---------------------------------------------------------
    this.getPosition = function () {
		//alert("enem position" + self.box2dObject.body.GetPosition().x);
		return self.box2dObject.body.GetPosition();
	};
	
	this.getVelocity = function () {
		return self.box2dObject.body.GetLinearVelocity();
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
		var velocity = new b2Vec2
		
		// Follow the target
		if(self.target !== null) {
			velocity.x = self.target.getPosition().x - self.getPosition().x;
			velocity.y = self.target.getPosition().y - self.getPosition().y;
			velocity.z = 0;
			
			
			//Normalize the velocity
			var d = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
			if(d < 0.1) d = 1;
			// Update the enemy's velocity
            velocity.x *= self.speed.x / d;
            velocity.y *= self.speed.y / d;
			
			var scale = 300.0;
			velocity.x = velocity.x * scale;
			velocity.y = velocity.y * scale;
			self.box2dObject.body.SetLinearVelocity(velocity);
			//console.log(self.getVelocity());
		}
		
		var position = self.box2dObject.body.GetPosition();
		this.mesh.position.set(position.x, position.y, this.mesh.position.z);
	}
			
    this.setFollowTarget = function (object) {
        if (object instanceof Player) {
            self.target = object;
        }
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (enemy, description) {
		
		var range = 100.0;
		/*var position = new THREE.Vector3(Math.random()*range,
					Math.random()*range, Math.random()*range);
					*/
		var position = new THREE.Vector3(0,0,0.1);
		var velocity = new THREE.Vector2(0,0);
       // enemy.position = new THREE.Vector3(0,0,0.1);
       // enemy.velocity = new THREE.Vector2(0,0);

        // Initialize properties from description object
        for(var prop in description) {
            if (prop === "color") {
                if (description[prop] instanceof THREE.Vector3) {
                    var rgb = description[prop].clone();
                    enemy.color = new THREE.Color(0x000000);
                    enemy.color.setRGB(rgb.x, rgb.y, rgb.z);
                }
            } else if (prop === "position") {
                if (description[prop] instanceof THREE.Vector3) {
                    //enemy.position = description[prop].clone();
					position = description[prop].clone();
                }
            } else if (prop === "size") {
                if (description[prop] instanceof THREE.Vector2) {
                    enemy.size = description[prop].clone();
                }
            } else if (prop === "speed") {
                if (description[prop] instanceof THREE.Vector2) {
                    enemy.speed = description[prop].clone();
                }
            } else if (prop === "maxspeed") {
                if (description[prop] instanceof THREE.Vector2) {
                    enemy.maxspeed = description[prop].clone();
                }
            }
        }

		
        // Generate a simple plane mesh for now
        // TODO: pass an enemy type value in the description object
        //       and pick from predefined geometry based on that 
        enemy.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(enemy.size.x, enemy.size.y),
            new THREE.MeshBasicMaterial({
                color: enemy.color.getHex(),
                wireframe: true
            })
        );
       // enemy.mesh.position = enemy.position;
        enemy.mesh.position = position;
		
		// Create box2D representation
		var SCALE = 5;
		self.width = self.size.x * 1.35 / SCALE;
		self.height = self.size.y * 1.35 / SCALE;
		self.box2dObject = new box2dObject(game, enemy);
		self.box2dObject.body.SetPosition(new b2Vec2(position.x, position.y));
		self.box2dObject.body.SetLinearVelocity(velocity);
		
		
		
        // Create "breathing" animation
        var BREATHE_TIME = 150 * Math.max(enemy.size.x, enemy.size.y),
            MAX_SCALE = 1.35,
            MIN_SCALE = 0.65,
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

        console.log("Enemy initialized.");
    })(self, description);

} // end Enemy object

