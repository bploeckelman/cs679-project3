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
        BANELING : 3
};
/*
 * Possible description elements along with enemy specific methods:
 * type, color, position, size, speed, maxspeed, health
 */
var ENEMY_DESCRIPTIONS= [
    {
        type     : ENEMY_TYPES.BRUTE,
        health   : 10,
        speed    : 1.0,
        init     :  function(self) {
            
                    },
        update   :  function(self) {
                        var range = self.calculateRange(self.vision);
                        if ( range.intersects(game.player.boundingBox) ) {
                            self.setFollowTarget(game.player.position);
                        }
                        else {
                            self.target = new THREE.Vector2(game.player.position.x, game.player.position.y);
                        }                            
                    },
        handleCollision : function (self, object) {
                        if (object instanceof Player) {
                            if (object.isSpinning) {
                                self.takeDamage(object.enemyDamage);
                            }
                        }
                        else if ( object instanceof Structure) {
                            self.stuck = true;
                        }
                        else if (object instanceof Artifact) {
                            self.stuck = true;
                        }
                    }
    },
    {
        type     : ENEMY_TYPES.LUNATIC,
        health   : 10,
        speed    : 1.0,
        maxspeed : new THREE.Vector2(20,20),
        init     :  function(self) {
                        //self.target = new THREE.Vector2(
                        //Math.floor(Math.random() * 1000),
                        //Math.floor(Math.random() * 1000));
                    },
        update   :  function(self) {
                        var range = self.calculateRange(self.vision);
                        if ( range.intersects(game.player.boundingBox) ) {
                            self.setFollowTarget(game.player.position);
                        }
                        else { 
                            var nearest = self.getNearestPlayerObject(Structure, range);
                            if ( nearest !== null) {
                                self.target = new THREE.Vector2(nearest.position.x, nearest.position.y);
                            }
                            else if (game.frames % 60 === 0 || !self.target) {
                                self.target = new THREE.Vector2(
                                    Math.floor(Math.random() * 1000),
                                    Math.floor(Math.random() * 1000));
                            }
                        }
                    },
        handleCollision : function (self, object) {
                        if (object instanceof Player) {
                            if (object.isSpinning) {
                                self.takeDamage(object.enemyDamage);
                            }
                        }
                        else if ( object instanceof Structure) {
                            //self.stuck = true;
                        }
                        else if (object instanceof Artifact) {
                            self.stuck = true;
                        }
                    }
    },
    {
        type     : ENEMY_TYPES.ARTIPHILE,
        health   : 10,
        speed    : 1.0,
        init     :  function(self) {
                        var nearest = self.getNearestPlayerObject(Artifact, null);
                        self.setPathToTake(self.findPathTo(nearest.position));
                    },
        update   :  function(self) {
                        if ( self.path === null ) {
                            var nearest = self.getNearestPlayerObject(Artifact, null);
                            self.setPathToTake(self.findPathTo(nearest.position));
                        }
                        else {
                            self.progressAlongPath();
                        }
                    },
        handleCollision : function (self, object) {
                        if (object instanceof Player) {
                            if (object.isSpinning) {
                                self.takeDamage(object.enemyDamage);
                            }
                        }
                        else if ( object instanceof Structure) {
                            self.stuck = true;
                        }
                        else if (object instanceof Artifact) {
                            self.stuck = true;
                        }
                    }
    },
    {
        type     : ENEMY_TYPES.BANELING,
        health   : 10,
        speed    : 2.0,
        init     :  function(self) {
                        self.target = new THREE.Vector2(500,500);
                         //       game.level.artifact.mesh.position.x, 
                         ///       game.level.artifact.mesh.position.y);
                        self.damage = self.playerDamage = self.structDamage = self.artifactDamage = 30;
                    },
        update   :  function(self) {
                        console.log(self.speed);
                    },
        handleCollision : function (self, object) {
                        self.takeDamage(object.health+100);                        
                    }
    },
];

// ----------------------------------------------------------------------------
// Enemy object
// ----------------------------------------------------------------------------
function Enemy (description) {

    // Public properties ------------------------------------------------------
    this.mesh     = null;
    this.position = null;
    this.velocity = null;
    this.size     = null;
    this.speed    = null;
    this.maxspeed = null;
    this.target   = null;
    this.health   = null;
    
    this.type     = null;
    this.structDamage = 0.02;
    this.artifactDamage = 10;
    this.playerDamage = 0.1;
    this.vision = 20;

    this.path = null;
    
    this.EPSILON = 4;

    this.collidable = true;
    this.boundingBox = null;
    this.stuck = false;
	
    // Private variables ------------------------------------------------------
    var self = this;


    // Enemy methods ---------------------------------------------------------
    this.update = function () {
    	        
        ENEMY_DESCRIPTIONS[self.type].update(self);
    	
        // Follow the target
        if (self.target !== null) {
            // Velocity is a vector to the target in the xy plane
            self.velocity.x = self.target.x - self.position.x;
            self.velocity.y = self.target.y - self.position.y;
            self.velocity.z = 0;

            // Normalize the velocity 
            var d = Math.sqrt(self.velocity.x * self.velocity.x
                            + self.velocity.y * self.velocity.y);
            if (d < 0.1) d = 1;

            // Update the enemy's velocity
            self.velocity.x *= self.speed.x / d;
            self.velocity.y *= self.speed.y / d;
        } else {
        	self.target = new THREE.Vector2(
                Math.floor(Math.random() * 1000),
                Math.floor(Math.random() * 1000));
        }

        // Integrate velocity
        if (!self.stuck) {
            self.position.addSelf(self.velocity);

            // Rotate towards target
            self.mesh.rotation.z = Math.atan2(
                self.target.y - self.mesh.position.y,
                self.target.x - self.mesh.position.x);
        }
    
        // Update the BoundingBox
        self.boundingBox = new Rect(
                self.position.x - 9 / 2,
                self.position.y - 9 / 2,
                self.position.x + 9 / 2,
                self.position.y + 9 / 2);
                
        //Allow it to move and check again for collision
        self.stuck = false;
    };

    this.collidesWith = function (object) {
        if (this.collidable) {
            return self.boundingBox.intersects(object.boundingBox);
        }
        else {
            return false;
        }
    };

    this.handleCollision = function (object) {
        if (object instanceof Player || object instanceof Structure || object instanceof Artifact) {
            ENEMY_DESCRIPTIONS[self.type].handleCollision(self, object);
            
        }        
    };

    this.setPathToTake = function (path) {
            if (path !== null && path.length >= 1) {
                    self.path = path;
            }
    };

    this.progressAlongPath = function () {
            if (self.path === null) {
                self.target = null;
                return;
            }
            else if (self.target === null) {
                self.path.shift();
                self.target = new THREE.Vector2(self.path[0][0], self.path[0][1]).toRealCoords();
                self.path.shift();
                //console.log(self.path[0]);
            }
            else if (self.path.length === 0) {
                //console.log(self.path[0]);
            }
            else {
                var now = self.position;
                var target = self.target;
                //console.log(target);
                if ( Math.abs(target.x - now.x) < self.EPSILON && Math.abs(target.y - now.y) < self.EPSILON ) {
                    var next = new THREE.Vector2(self.path[0][0], self.path[0][1]).toRealCoords();
                    self.path.shift();
                    //console.log(target);
                    //console.log(now);
                    self.target = next;
                }
            }
            //console.log(self.path.length);
    };

    this.findPathTo = function (object, range) {
        var level = game.level;		
        var from = self.position.toGridCoords();
        var to = object.toGridCoords();
        
        var grid = new PF.Grid(level.size.xcells, level.size.ycells, level.grid);

        if (range != null) {
            var gridRange = range.toGridCoords();
            //console.log(gridRange);
            //Block the area beyond range
            for (var i= gridRange.left ; i <= gridRange.right; ++i) {
                grid.nodes[i][gridRange.top].walkable = false;
                grid.nodes[i][gridRange.bottom].walkable = false;
            }
            for (var j= gridRange.top ; j <= gridRange.bottom; ++j) {
                grid.nodes[gridRange.left][j].walkable = false;
                grid.nodes[gridRange.right][j].walkable = false;
            }
    
        }
        var finder = new PF.AStarFinder();

        if ( from === null || to === null ) {
            self.target = null;
        } else {
            var path = finder.findPath(from.x, from.y, to.x, to.y, grid);

            if (path.length > 1 ) { 
                path = PF.Util.smoothenPath(grid, path);
                return path;
            }
                else {
                    path.push([from.x, from.y]);
                    path.push([to.x, to.y]);
                    console.log("OK");
                    return path;
                }

        }
    };
	
    this.setFollowTarget = function (object, range) {
        var path = this.findPathTo(object, range);
        self.target = new THREE.Vector2(path[1][0], path[1][1]).toRealCoords();
    };

    this.takeDamage = function (amount) {
	self.health = self.health - amount;
        if (self.health <= 0) {
            self.die();
        } else {
            //new Audio("sounds/enemy_damage.wav").play();
        }
    };

    this.getNearestPlayerObject = function (Type, range, fn) {
        var nearest = null;
        var minLength = 100000;
        var objects;
        if ( Type === Structure ) {
            objects = game.level.structures;
        }
        else if ( Type === Artifact) {
            objects = game.level.artifacts;
        }

        for (var i=0; i<objects.length; ++i) {
            var obj = objects[i];
            var length = new THREE.Vector2().sub(obj.position, self.position).length();
            var rangeIntersects = false;
            if ( range !== null ) rangeIntersects = range.intersects( obj.boundingBox);
            if ( nearest === null || (
                     rangeIntersects &&
                     length < minLength) ) {
                nearest = obj;
                minLength = length;
            }
        }            

        return nearest;
    };

    this.die = function () {
		new Audio("sounds/enemy_die.wav").play();
    };

    this.calculateRange = function (vision) {
        var from = self.position;
        var range = new Rect(
                Math.max(0,from.x-vision),
                Math.max(0,from.y-vision),
                Math.min(game.level.size.width-1, from.x+vision),
                Math.min(game.level.size.height-1, from.y+vision));
        return range;
    };

    // Constructor ------------------------------------------------------------
    (this.init = function (enemy, description) {

        enemy.position = new THREE.Vector3(0,0,0.1);
        enemy.velocity = new THREE.Vector2(0,0);

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
            enemy.position = description["position"].clone();      
        } else {
            // Only start at edges
            var edge = Math.floor(Math.random() * 4);
            switch (edge) {
                case 0: enemy.position = new THREE.Vector3(Math.floor(Math.random() * 1000), 0, 0.1); break;
                case 1: enemy.position = new THREE.Vector3(Math.floor(Math.random() * 1000), 999, 0.1); break;
                case 2: enemy.position = new THREE.Vector3(0, Math.floor(Math.random() * 1000), 0.1); break;
                case 3: enemy.position = new THREE.Vector3(999, Math.floor(Math.random() * 999), 0.1); break;
                default: enemy.position = new THREE.Vector3(Math.floor(Math.random() * 1000),
                            Math.floor(Math.random() * 1000), 0.1);
            }
        }
        
        if ("size" in description && description["size"] instanceof THREE.Vector2) {
            enemy.size = description["size"].clone();       
        } else {
            enemy.size = new THREE.Vector2( Math.floor(Math.random() * 40) + 10,
            Math.floor(Math.random() * 40) + 10);
        }
        
        if ("speed" in description && description["speed"] instanceof THREE.Vector2) {
            var s = description["speed"].clone();        
            enemy.speed = new THREE.Vector2(Math.random() * 1.2 + 0.1 + s.x, Math.random() * 1.2 + 0.1 + s.y);
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
            alert("");
        }
    
        if ("type" in description) {
            enemy.type = description["type"];
        } else {
            enemy.type = ENEMY_TYPES.BRUTE;
        }

        if ("vision" in description) {
            enemy.vision = description["vision"];
        } else {
            enemy.vision = 100;
        }
        
        //Do specific initial things based on the type of enemy
        ENEMY_DESCRIPTIONS[self.type].init(self);
		
        // Generate a mesh for the enemy
        enemy.mesh = new THREE.Mesh(
            // PYRAMID, // Note: 3d geometry requires rotation/translation
            TRIANGLE,
            new THREE.MeshBasicMaterial({
                color: enemy.color.getHex()
            })
        );
        enemy.mesh.position = enemy.position;

        enemy.stuck = false;

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

        //Set the bounding box
        self.boundingBox = new Rect(
                self.position.x - 9 / 2,
                self.position.y - 9 / 2,
                self.position.x + 9 / 2,
                self.position.y + 9 / 2);
                
        console.log("Enemy initialized.");
    })(self, description);

} // end Enemy object
