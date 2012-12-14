// ----------------------------------------------------------------------------
// Level object
// ----------------------------------------------------------------------------
function Level (game, numXCells, numYCells) {

    // Public properties ------------------------------------------------------
    this.grid0 = null;
    this.grid1 = null;
    this.grid2 = null;
    this.grid  = null;
    this.cells = null;
    this.size  = null;
    this.artifacts   = null;
    this.structures = null;
    this.territory  = null;
    this.territoryDirty = null;
    this.cellsClaimed   = null;
    this.clock = null;

    // Private variables ------------------------------------------------------
    var self = this,
        CELL_SIZE = 10,
        MIN_NUM_X_CELLS = 40,
        MIN_NUM_Y_CELLS = 40,
        TERRITORY_GEOMETRY = null, // Created on init()
        TERRITORY_MATERIAL = new THREE.ShaderMaterial(shaders.noise),
        //TODO : Send in as a parameter!!
        artifactPositions = [
            new THREE.Vector2(numXCells * CELL_SIZE / 2, numYCells * CELL_SIZE / 2),
            new THREE.Vector2(numXCells * CELL_SIZE / 4, numYCells * CELL_SIZE / 4),
            new THREE.Vector2(numXCells * CELL_SIZE * 3 / 4, numYCells * CELL_SIZE * 3 / 4),
            // ...
        ];


	// Utility variables and methods --------------------------------------------------
	THREE.Vector2.prototype.toGridCoords = function () {
		var ans = new THREE.Vector2();
		ans.x = Math.floor(this.x / self.size.cellw);
		ans.y = Math.floor(this.y / self.size.cellh);
		
		if (ans.x < 0 || ans.y < 0 || ans.x > self.size.xcells || ans.y > self.size.ycells )
			return null;
		else return ans;
	};
	
	THREE.Vector2.prototype.toRealCoords = function () {
		var ans = new THREE.Vector2();
		ans.x = this.x * self.size.cellw ;
		ans.y = this.y * self.size.cellh ;
		
		if (ans.x < 0 || ans.y < 0 || ans.x > self.size.width || ans.y > self.size.height )
			return null;
		else return ans;
	};
	
	THREE.Vector3.prototype.toGridCoords = function () {
		var ans = new THREE.Vector3();
		ans.x = Math.floor(this.x / self.size.cellw);
		ans.y = Math.floor(this.y / self.size.cellh);
		ans.z = this.z;
		
		if (ans.x < 0 || ans.y < 0 || ans.x > self.size.xcells || ans.y > self.size.ycells )
			return null;
		else return ans;
	};
	
	THREE.Vector3.prototype.toRealCoords = function () {
		var ans = new THREE.Vector3();
		ans.x = this.x * self.size.cellw;
		ans.y = this.y * self.size.cellh;
		ans.z = this.z;
		
		if (ans.x < 0 || ans.y < 0 || ans.x > self.size.width || ans.y > self.size.height )
			return null;
		else return ans;
	};
	
        Rect.prototype.toRealCoords = function () {
            var ans = new Rect(0,0,0,0);
            ans.left = this.left * self.size.cellw;
            ans.right = this.right * self.size.cellw;
            ans.top = this.top * self.size.cellh;
            ans.bottom = this.bottom * self.size.cellh;
            
            return ans;
        };
    
        Rect.prototype.toGridCoords = function () {
            var ans = new Rect(0,0,0,0);
            ans.left = Math.floor(this.left / self.size.cellw);
            ans.right = Math.floor(this.right / self.size.cellw);
            ans.top = Math.floor(this.top / self.size.cellh);
            ans.bottom = Math.floor(this.bottom / self.size.cellh);
            
            return ans;
        };
	
	
    // Level methods ----------------------------------------------------------
    this.update = function () {
        // Update shader uniforms
        var delta = 0.01 * self.clock.getDelta();
        shaders.noise.uniforms.time.value += delta;

        // Update claimed territory meshes
        self.updateClaimedTerritory();

        // Update structures
        for (var i = 0; i < self.structures.length; ++i) {
            self.structures[i].update();
        }

        // Update artifacts
        for (var i = 0; i < self.artifacts.length; ++i) {
            self.artifacts[i].update();
        }
        
    };


    this.updateClaimedTerritory = function () {
        if (self.territoryDirty) {
            // Remove previous meshes
            game.scene.remove(self.territory);
            self.territory = null;
            self.cellsClaimed = 0;

            // Create new meshes for buildable grid cells
            var mergedGeom = new THREE.Geometry(),
                mesh = new THREE.Mesh(TERRITORY_GEOMETRY, TERRITORY_MATERIAL),
                buildableCellIndices = [],
			    all_buildable = true;

            for (var y = 0; y < self.size.ycells; ++y) {
                for (var x = 0; x < self.size.xcells; ++x) {
                    if (self.cells[y][x].buildable) {
                        // Save indices for later
                        buildableCellIndices.push(new THREE.Vector2(x, y));

                        // Position mesh and merge with rest of claimed territory geometry
                        mesh.position.set(
                            x * self.size.cellw + self.size.cellw / 2,
                            y * self.size.cellh + self.size.cellh / 2,
                            0.001);
                        THREE.GeometryUtils.merge(mergedGeom, mesh);

                        // Update the claimed cell counter
                        ++self.cellsClaimed;
                    } else {
						all_buildable = false;
					}
                }
            }

            // Add newly merged territory to the scene
            self.territory = new THREE.Mesh(mergedGeom, TERRITORY_MATERIAL);
            game.scene.add(self.territory);

            // Check for claimed artifacts
            for (var i = 0; i < self.artifacts.length; ++i) {
                var artifact = self.artifacts[i];
                // Skip already claimed artifacts
                if (artifact.claimed)
                    continue;
                
                var allClaimed = true,
                    indices = new Rect(
                        Math.floor(artifact.boundingBox.left   / self.size.cellw),
                        Math.floor(artifact.boundingBox.bottom / self.size.cellh),
                        Math.floor(artifact.boundingBox.right  / self.size.cellw),
                        Math.floor(artifact.boundingBox.top    / self.size.cellh));

                // Check grid indices corresponding to artifact bounding box
                for (var yy = indices.bottom; yy <= indices.top; ++yy) {
                    for (var xx = indices.left; xx <= indices.right; ++xx) {
                        var cell = self.cells[yy][xx];
                        // If this artifact is above this cell and it isn't buildable...
                        if (cell.artifact == i && !cell.buildable)
                            allClaimed = false;
                    }
                }

                // Set claimed flags
                if (allClaimed) {
                    artifact.claimed = true;
                    artifact.justClaimed = true;
                    console.log("claimed artifact #" + i);
                    spawnParticles(
                        PARTICLES.ARTIFACT_CLAIMED,
                        artifact.mesh.position.clone(),
                        { 
                            color: new THREE.Color(0x0000ff),
                            target: self.artifacts[0].mesh.position.clone(),
                        },
                        game
                    );
                }
            }
	
            // TODO: Check for and handle 'all claimed' win state

            self.territoryDirty = false;
        }
    };
	
	
	this.removeLevel = function() {
		//Remove from member objects from scene
		game.scene.remove(self.territory);
		for (var i = 0; i < self.artifacts.length; ++i) {
			game.scene.remove(self.artifacts[i].mesh);
		}
		for (var i = 0; i < self.structures.length; ++i) {
			game.scene.remove(self.structures[i].mesh);
			game.scene.remove(self.structures[i].node);
		}
		game.scene.remove(self.grid0);
        game.scene.remove(self.grid1);
        game.scene.remove(self.grid2);
	};


	// Constructor ------------------------------------------------------------
    (this.init = function (level) {
        // Specify level sizes
        level.size = {
            cellw:  CELL_SIZE,
            cellh:  CELL_SIZE,
            // Note: num cells in either dimension must be multiples of 4
            //       in order for grid to look right
            xcells: closestMultiple(Math.max(numXCells, MIN_NUM_X_CELLS), 4),
            ycells: closestMultiple(Math.max(numYCells, MIN_NUM_Y_CELLS), 4) 
        };
        level.size.width  = level.size.cellw * level.size.xcells;
        level.size.height = level.size.cellh * level.size.ycells;
        level.size = Object.freeze(level.size);

        // Create level meshes
        TERRITORY_GEOMETRY = new THREE.PlaneGeometry(self.size.cellw, self.size.cellh);

        level.grid0 = new THREE.Mesh(
            new THREE.PlaneGeometry(level.size.width, level.size.height), 
            new THREE.MeshBasicMaterial({ color: 0x001100, wireframe: false })
        );

        level.grid1 = new THREE.Mesh(
            new THREE.PlaneGeometry(level.size.width, level.size.height,
                                    level.size.xcells, level.size.ycells),
            new THREE.MeshBasicMaterial({ color: 0x223322, wireframe: true })
        );

        level.grid2 = new THREE.Mesh(
            new THREE.PlaneGeometry(level.size.width, level.size.height,
                                    Math.floor(level.size.xcells / 4), Math.floor(level.size.ycells / 4)),
            new THREE.MeshBasicMaterial({ color: 0x116611, wireframe: true })
        );

        // Reposition the grid so its bottom left corner at (0,0,0)
        level.grid0.position.set(level.size.width / 2, level.size.height / 2, -0.2);
        level.grid1.position.set(level.size.width / 2, level.size.height / 2, -0.1);
        level.grid2.position.set(level.size.width / 2, level.size.height / 2,  0.0);

        // Add the meshes to the scene
        game.scene.add(level.grid0);
        game.scene.add(level.grid1);
        game.scene.add(level.grid2);

        // Initialize the structures container
        level.structures = [];

        // Initialize the artifacts
        level.artifacts = [];
        for (var i = 0; i < artifactPositions.length; ++i) {
            level.artifacts.push(new Artifact(artifactPositions[i], level, game));
        }
        // Initial artifact starts claimed
        level.artifacts[0].claimed = true; 

        // Non-buildable region in center underneath artifact
        var artifactRegion = new Rect(
                level.size.xcells / 2 - 2, level.size.ycells / 2 + 1,
                level.size.xcells / 2 + 1, level.size.ycells / 2 - 2),
            BUILDABLE_OFFSET = 7,
            buildableRegion = new Rect(
                artifactRegion.left  - BUILDABLE_OFFSET, artifactRegion.top + BUILDABLE_OFFSET,
                artifactRegion.right + BUILDABLE_OFFSET, artifactRegion.bottom - BUILDABLE_OFFSET);
        //console.log(artifactRegion);
        //console.log(buildableRegion);

        // Create level grid and cells
        // grid  : 0 - Empty, 1 - Obstacle
        // cells : buildability status of grid cells
        level.cellsClaimed = 0;
        level.grid  = [];
        level.cells = [];
        for(var y = 0; y < level.size.ycells; ++y) {
            level.grid.push([]);
            level.cells.push([]);
            for(var x = 0; x < level.size.xcells; ++x) {
                level.grid[y].push(0);
                level.cells[y].push({
                    occupied: false,
                    buildable: false,
                    artifact: -1 // indicates no artifact
                });

                // Enable building for some initial buildable region
                //   excluding the center under the artifact
                if (!(x >= artifactRegion.left   && x <= artifactRegion.right
                   && y >= artifactRegion.bottom && y <= artifactRegion.top)
                 && (x >= buildableRegion.left   && x <= buildableRegion.right
                  && y >= buildableRegion.bottom && y <= buildableRegion.top)) {
                    level.cells[y][x].buildable = true;
                    ++level.cellsClaimed;
                }

                // Mark grid cells under the artifacts
                for (var i = 0; i < level.artifacts.length; ++i) {
                    var artifact = level.artifacts[i],
                        indices = new Rect(
                            artifact.boundingBox.left   / level.size.cellw,
                            artifact.boundingBox.bottom / level.size.cellh,
                            artifact.boundingBox.right  / level.size.cellw,
                            artifact.boundingBox.top    / level.size.cellh);
                    if (x >= indices.left   && x <= indices.right
                     && y >= indices.bottom && y <= indices.top) {
                        level.cells[y][x].artifact = i;
                    }
                }
            }
        }

        // Initialize the territory visualization meshes
        level.territory = [];
        level.territoryDirty = true;

        level.clock = new THREE.Clock();

        console.log("Level initialized.");
    })(self);

} // end Level object

