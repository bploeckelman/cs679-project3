// ----------------------------------------------------------------------------
// Level object
// ----------------------------------------------------------------------------
function Level (game) {

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
    this.clock = null;

    //TODO : Send in as a parameter!!
    var artifactPositions = [
        new THREE.Vector2(500,500),
        new THREE.Vector2(700,400),
        //new THREE.Vector2(400,700),
    ];

    // Private variables ------------------------------------------------------
    var self = this,
        TERRITORY_GEOMETRY = null, // Created on init()
        TERRITORY_MATERIAL = new THREE.ShaderMaterial(shaders.noise);
        /*
        TERRITORY_MATERIAL = new THREE.MeshBasicMaterial({
            color: 0x003000,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        */

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
        var delta = 0.01 * self.clock.getDelta();
        shaders.noise.uniforms.time.value += delta;
        shaders.cells.uniforms.time.value += 10 * delta;

        // NOTE: this is inefficient, it should be extracted to a function
        // player should be able to switch the territory visualization on/off
        if (self.territoryDirty) { // then regenerate territory meshes...
            // Remove all previous meshes
            for (var i = 0; i < self.territory.length; ++i) {
                game.scene.remove(self.territory[i]);
            }
            self.territory = [];

            // Create new meshes for buildable grid cells
			var all_buildable = true;
            for (var y = 0; y < self.size.ycells; ++y) {
                for (var x = 0; x < self.size.xcells; ++x) {
                    if (self.cells[y][x].buildable) {
                        var mesh = new THREE.Mesh(TERRITORY_GEOMETRY, TERRITORY_MATERIAL);
                        mesh.position.set(
                            x * self.size.cellw + self.size.cellw / 2,
                            y * self.size.cellh + self.size.cellh / 2,
                            0.05);
                        game.scene.add(mesh);
                        self.territory.push(mesh);
                    }else{
						all_buildable = false;
					}
                }
            }
	
	/*
			if(all_buildable = true){
				game.gamewon = true;
			}
			*/
            self.territoryDirty = false;
        }

        for (var i = 0; i < self.structures.length; ++i) {
            self.structures[i].update();
        }

        for (var i = 0; i < self.structures.length; ++i) {
            self.artifacts[i].update();
        }
        
    };

	// Constructor ------------------------------------------------------------
    (this.init = function (level) {
        // Specify level sizes
        level.size = {
            width:  1000,
            height: 1000,
            cellw:  10,
            cellh:  10,
            xcells: 100,
            ycells: 100
        };
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
                                    level.size.xcells / 4, level.size.ycells / 4),
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

        // Create level grid and cells
        // grid  : 0 - Empty, 1 - Obstacle
        // cells : buildability status of grid cells
        level.grid  = [];
        level.cells = [];
        for(var y = 0; y < level.size.ycells; ++y) {
            level.grid.push([]);
            level.cells.push([]);
            for(var x = 0; x < level.size.xcells; ++x) {
                level.grid[y].push(0);
                level.cells[y].push({
                    occupied: false,
                    buildable: false
                });

                // Enable building for some initial buildable region
                // Note: this isn't really ideal, but it gets the job done
                if (x >= 41 && x <= 58 && y >= 41 && y <= 58) {
                    if (x >= 48 && x <= 51 && y >= 48 && y <= 51) // keep center region non-buildable
                        level.cells[y][x].buildable = false;
                    else
                        level.cells[y][x].buildable = true;
                }
            }
        }

        // Initialize the structures container
        level.structures = [];

        // Initialize the artifact
        level.artifacts = [];
        for (var i=0; i < artifactPositions.length; ++i) {
            level.artifacts.push(new Artifact(artifactPositions[i], level, game));
        }

        // Initialize the territory visualization meshes
        level.territory = [];
        level.territoryDirty = true;

        level.clock = new THREE.Clock();

        console.log("Level initialized.");
    })(self);

} // end Level object

