var STRUCTURE_TYPES = {
        ONE_BY_ONE:     0,
        TWO_BY_TWO:     1,
        THREE_BY_THREE: 2,
        FOUR_BY_FOUR:   3
    },
    STRUCTURE_COSTS = [10, 20, 30, 40],
    STRUCTURE_SIZES = [1,2,3,4],
    STRUCTURE_AREAS = [3,6,8,10], // These territory sizes work pretty well
    STRUCTURE_COLORS = [
        new THREE.Color(0x008000),
        new THREE.Color(0x2e8b57),
        new THREE.Color(0x3cb371),
        new THREE.Color(0x8fbc8f)
    ],
    TEXTURE = THREE.ImageUtils.loadTexture("images/structure.png");
    
// ----------------------------------------------------------------------------
// Structure object
// ----------------------------------------------------------------------------
function Structure (type, game) {

    // Public properties ------------------------------------------------------
    this.type     = null;
    this.mesh     = null;
    this.node     = null;
    this.placed   = null;
    this.position = null;
    this.gridindices = null;
    this.health      = null;
    this.maxHealth   = null;
    this.damageEffect = null;

    this.collidable = true;
    this.boundingBox = null;
    
    this.dead = false;

    this.extent = 1;
    // Private variables ------------------------------------------------------
    var self = this;


    // Structure methods ------------------------------------------------------
    this.update = function () {
        // TODO...
    };

    this.expand = function () {
        var loc = self.gridindices;
        self.extent+=1;
        for (var i = loc.y-self.extent; i <= loc.y+self.extent; ++i) {
            for (var j = loc.x-self.extent; j <= loc.x+self.extent; ++j) {
                game.level.cells[i][j].buildable = true;
            }
        }
    }

    this.place = function () {
        self.gridindices = Object.freeze(self.gridindices);
        console.log(self.gridindices);

        var structureSize = STRUCTURE_SIZES[self.type],
            structureArea = STRUCTURE_AREAS[self.type],
            occupiedCellIndices = [],
            buildable = true;

        for (var i=0; i < structureSize; ++i) {
            for (var j=0; j < structureSize; ++j) {
                var indices = { x: self.gridindices.x + i, y: self.gridindices.y + j },
                    cell    = game.level.cells[indices.y][indices.x];

                // Save the indices for later
                occupiedCellIndices.push(indices);

                // Is this grid cell buildable?
                if (cell.occupied || !cell.buildable) {
                    buildable = false;
                    break;
                }
            }
        }

        if (buildable) { // then build...
            var min = new THREE.Vector2(game.level.size.xcells, game.level.size.ycells),
                max = new THREE.Vector2(-1, -1);

            // Set pathfinder grid, occupied flag, and calculate min/max indices
            for (var i = 0; i < occupiedCellIndices.length; ++i) {
                game.level.grid[occupiedCellIndices[i].y][occupiedCellIndices[i].x] = 1;
                game.level.cells[occupiedCellIndices[i].y][occupiedCellIndices[i].x].occupied = true;

                if (occupiedCellIndices[i].x < min.x) min.x = occupiedCellIndices[i].x;
                if (occupiedCellIndices[i].y < min.y) min.y = occupiedCellIndices[i].y;
                if (occupiedCellIndices[i].x > max.x) max.x = occupiedCellIndices[i].x;
                if (occupiedCellIndices[i].y > max.y) max.y = occupiedCellIndices[i].y;
            }

            //console.log("min/max indices: "
            // + "min(" + min.x + ", " + min.y + ") "
            // + "max(" + max.x + ", " + max.y + ") ");

            // TODO: should be a member of Artifact object
            var artifactRegion = new Rect(
                    game.level.size.xcells / 2 - 2, game.level.size.ycells / 2 + 1,
                    game.level.size.xcells / 2 + 1, game.level.size.ycells / 2 - 2);

            // Set buildability status of neighbor cells
            var halfArea = Math.floor(structureArea / 2);
            for (var y = min.y - halfArea; y <= max.y + halfArea; ++y) {
                for (var x = min.x - halfArea; x <= max.x + halfArea; ++x) {
                    // Keep indices in bounds
                    var ix, iy;
                    if      (x < 0)                       ix = 0;
                    else if (x >= game.level.size.xcells) ix = game.level.size.xcells - 1;
                    else                                  ix = x;
                    if      (y < 0)                       iy = 0;
                    else if (y >= game.level.size.ycells) iy = game.level.size.ycells - 1;
                    else                                  iy = y;

                    // Set cell as buildable, but keep area under artifact non-buildable
                    if (x >= artifactRegion.left   && x <= artifactRegion.right
                     && y >= artifactRegion.bottom && y <= artifactRegion.top)
                        game.level.cells[iy][ix].buildable = false;
                    else
                        game.level.cells[iy][ix].buildable = true;
                }
            }
			
            var all_buildable = true;
            for(var y = 0; y < game.level.size.ycells; y++){
                    for(var x = 0; x < game.level.size.xcells; x++){
                        if (x >= artifactRegion.left   && x <= artifactRegion.right
                         && y >= artifactRegion.bottom && y <= artifactRegion.top) {
                            continue;
                        } else if(game.level.cells[y][x].buildable === false) {
                                all_buildable = false;
                        }
                    }
            }

            if(all_buildable){
                    game.gamewon = true;
            }

            self.position = new THREE.Vector2(
                    self.node.position.x + self.mesh.position.x,
                    self.node.position.y + self.mesh.position.y);

            //alert("mesh postion: " + self.mesh.position.x + "," + self.mesh.position.y);
            //alert("node postion: " + self.node.position.x + "," + self.node.position.y);
            //alert("center postion: " + self.position.x + "," + self.position.y);
            
           self.boundingBox = new Rect(
                    self.node.position.x,
                    self.node.position.y,
                    self.node.position.x + (game.level.size.cellw * STRUCTURE_SIZES[self.type]),
                    self.node.position.y + (game.level.size.cellh * STRUCTURE_SIZES[self.type]));

            // Add a little pop to the mesh to indicate that it is placed
            new TWEEN.Tween({
                    scale: 1.0,
                    red:   self.mesh.material.color.r,
                    green: self.mesh.material.color.g,
                    blue:  self.mesh.material.color.b
                })
                .to({ scale: 0.8, red: 0.0, green: 1.0, blue: 0.0 }, 100)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    self.mesh.scale.x = this.scale;
                    self.mesh.scale.y = this.scale;
                    self.mesh.scale.z = 1.0;
                    self.mesh.material.color.setRGB(this.red, this.green, this.blue);
                })
                .onComplete(function () {
                    new TWEEN.Tween({ scale: 0.8 })
                        .to({ scale: 1.0 }, 100)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(function () {
                            self.mesh.scale.x = this.scale;
                            self.mesh.scale.y = this.scale;
                            self.mesh.scale.z = 1.0;
                        })
                        .onComplete(function () {
                            self.mesh.material.color = STRUCTURE_COLORS[self.type].clone();
                        })
                        .start();
                })
                .start();
			
            self.placed = true;
            game.level.territoryDirty = true; // Regenerate territory geometry
			new Audio("sounds/structure_built_yes.wav").play();
        } else { // !buildable
			new Audio("sounds/structure_built_no.wav").play();

            // Add a little pop to the mesh to indicate that it can't be placed
            new TWEEN.Tween({
                    scale: 1.0,
                    red:   self.mesh.material.color.r,
                    green: self.mesh.material.color.g,
                    blue:  self.mesh.material.color.b
                })
                .to({ scale: 1.2, red: 1.0, green: 0.0, blue: 0.0 }, 100)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    self.mesh.scale.x = this.scale;
                    self.mesh.scale.y = this.scale;
                    self.mesh.scale.z = 1.0;
                    self.mesh.material.color.setRGB(this.red, this.green, this.blue);
                })
                .onComplete(function () {
                    new TWEEN.Tween({ scale: 1.2 })
                        .to({ scale: 1.0 }, 100)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(function () {
                            self.mesh.scale.x = this.scale;
                            self.mesh.scale.y = this.scale;
                            self.mesh.scale.z = 1.0;
                        })
                        .onComplete(function () {
                            self.mesh.material.color = STRUCTURE_COLORS[self.type].clone();
                        })
                        .start();
                })
                .start();
        }

        return buildable;
    };


    this.move = function () {
        if (self.placed) {
            return;
        }

        if (game.mode === GAME_MODE.BUILD) {
            // Unproject mouse pos from normalized device coords to world coords
            var mouseWorldPos = new THREE.Vector3(
                    (game.input.mousePos.x / window.innerWidth)  *  2 - 1,
                    (game.input.mousePos.y / window.innerHeight) * -2 + 1,
                    0.992);
            // Note: z value should be 0.5 or 1, but that doesn't work correctly,
            // has something to do with projection matrix and camera z pos
            // need to figure out exactly what's going on
            game.projector.unprojectVector(mouseWorldPos, game.camera);

            // Keep inside level bounds
            if (mouseWorldPos.x < 0) mouseWorldPos.x = 0;
            if (mouseWorldPos.x > game.level.size.width - self.mesh.width)
                mouseWorldPos.x = game.level.size.width - self.mesh.width;
            if (mouseWorldPos.y < 0) mouseWorldPos.y = 0;
            if (mouseWorldPos.y > game.level.size.height - self.mesh.height)
                mouseWorldPos.y = game.level.size.height - self.mesh.height;

            // Snap to grid
            self.gridindices = mouseWorldPos.toGridCoords();
			
            self.node.position.x = self.gridindices.x * game.level.size.cellw; 
            self.node.position.y = self.gridindices.y * game.level.size.cellh;
            self.node.position.z = 0.1; // Above grid
        }
    };
	
	
    this.takeDamage = function (amount) { 
        if (amount > 0) {
            self.health = self.health - amount;

            if (self.health <= 0) {
                self.dead = true;
                //self.die(arrayIndex);
            } else {
                if (!self.damageEffect.running) {
                                    new Audio("sounds/structure_damage.wav").play();
                    self.damageEffect.tween.start();
                    self.damageEffect.running = true;
                }
            }
        }            
    };

	
    this.die = function (arrayIndex) {
        //FIXME: Particles not getting displayed
        new Audio("sounds/structure_die.wav").play();

        spawnParticles(
            PARTICLES.ENEMY_DEATH,
            self.mesh.position,
            { color: new THREE.Color(0xff0000) },
            game
        );

        var structureSize = STRUCTURE_SIZES[self.type];

        for (var i=0; i < structureSize; ++i) {
            for (var j=0; j < structureSize; ++j) {
                var indices = { x: self.gridindices.x + i, y: self.gridindices.y + j };
				game.level.grid[indices.y][indices.x] = 0;
                game.level.cells[indices.y][indices.x].occupied = false;

            }
        }
        game.level.structures.splice(arrayIndex, 1);
        game.scene.remove(self.mesh);
        game.scene.remove(self.node);
		
        //Free up the grid cell
        var structureSize = STRUCTURE_SIZES[self.type];

        for (var i=0; i < structureSize; ++i) {
            for (var j=0; j < structureSize; ++j) {
                var indices = { x: self.gridindices.x + i, y: self.gridindices.y + j };

                game.level.cells[indices.y][indices.x].occupied = false;
            }
        }
        game.level.territoryDirty = true; // Regenerate territory geometry
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
            self.takeDamage(object.structDamage);
        }
    };

    // Constructor ------------------------------------------------------------
    (this.init = function (structure) {
        structure.type = type;

        // Calculate the structure's size
        var width  = game.level.size.cellw,
            height = game.level.size.cellh;
        switch (structure.type) {
            case STRUCTURE_TYPES.ONE_BY_ONE: // for completeness...
                width  *= 1;
                height *= 1;
                break;
            case STRUCTURE_TYPES.TWO_BY_TWO:
                width  *= 2;
                height *= 2;
                break;
            case STRUCTURE_TYPES.THREE_BY_THREE:
                width  *= 3;
                height *= 3;
                break;
            case STRUCTURE_TYPES.FOUR_BY_FOUR:
                width  *= 4;
                height *= 4;
                break;
            default:
                console.log("Error: unhandled structure type!");
        }
        // -2 makes it fit inside a cell instead of partially overlapping
        width  -= 2;
        height -= 2;

        // Create structure mesh
        var structureColor = STRUCTURE_COLORS[structure.type];
        structure.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({ color: structureColor, map: TEXTURE, transparent: true })
        );

        // Create a node to offset the mesh "center" to bottom left
        structure.node = new THREE.Object3D();
        structure.node.add(structure.mesh);

        // Offset the mesh center to bottom left of mesh
        // +1 makes it fit inside a cell instead of partially overlapping
        structure.mesh.position.x = width  / 2 + 1;
        structure.mesh.position.y = height / 2 + 1;
        structure.mesh.position.z = 0;

        // Add some helpful properties to the mesh for later use
        structure.mesh.width  = width;
        structure.mesh.height = height;

        structure.gridindices = new THREE.Vector2(-1,-1);
        structure.placed = false;

        // Add the mesh to the scene
        game.scene.add(structure.node);

        new TWEEN.Tween({ scale: 0.0 })
            .to({ scale: 1.0 }, 350)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(function () {
                structure.mesh.scale.x = this.scale;
                structure.mesh.scale.y = this.scale;
                structure.mesh.scale.z = 1.0;
            })
            .onComplete(function () { })
            .start();
			
        // Initialize health
        structure.maxHealth = width;
		structure.health = structure.maxHealth;

        // Initialize damage effect tween
        structure.damageEffect = {
            running: false,
            tween: null
        };
        structure.damageEffect.tween = new TWEEN.Tween({ red: structureColor.r })
            .to({ red: 1 }, 300)
            .onUpdate(function () {
                structure.mesh.material.color.setRGB(this.red, structureColor.g, structureColor.b);
            })
            .onComplete(function () {
                var red = Math.max(1 - (structure.health / structure.maxHealth), structureColor.r);
                structure.mesh.material.color.setRGB(red, structureColor.g, structureColor.b);
                this.red = structureColor.r;
                structure.damageEffect.running = false;
            });

        console.log("Structure initialized.");
    })(self);

} // end Structure object

