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
    this.artifact   = null;
    this.structures = null;
    this.territory  = null;
    this.territoryDirty = null;


    // Private variables ------------------------------------------------------
    var self = this,
        TERRITORY_MATERIAL = new THREE.MeshBasicMaterial({
            color: 0x003000,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

	// Utility variables ------------------------------------------------------
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
	
	
	
    // Level methods ----------------------------------------------------------
    this.update = function () {
        // NOTE: this is inefficient, it should be extracted to a function
        // player should be able to switch the territory visualization on/off
        if (self.territoryDirty) { // then regenerate territory meshes...
            // Remove all previous meshes
            for (var i = 0; i < self.territory.length; ++i) {
                game.scene.remove(self.territory[i]);
            }
            self.territory = [];

            // Create new meshes for buildable grid cells
            for (var y = 0; y < self.size.ycells; ++y) {
                for (var x = 0; x < self.size.xcells; ++x) {
                    if (self.cells[y][x].buildable) {
                        var mesh = new THREE.Mesh(
                                new THREE.PlaneGeometry(self.size.cellw, self.size.cellh),
                                TERRITORY_MATERIAL);
                        mesh.position.set(
                            x * self.size.cellw + self.size.cellw / 2,
                            y * self.size.cellh + self.size.cellh / 2,
                            0.05);
                        game.scene.add(mesh);
                        self.territory.push(mesh);
                    }
                }
            }

            self.territoryDirty = false;
        }

        for (var i = 0; i < self.structures.length; ++i) {
            self.structures[i].update();
        }

        self.artifact.update();
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
                if (x >= 44 && x <= 55 && y >= 44 && y <= 55) {
                    level.cells[y][x].buildable = true;
                }
            }
        }

        // Initialize the structures container
        level.structures = [];

        // Initialize the artifact
        level.artifact = new Artifact(level, game);

        // Initialize the territory visualization meshes
        level.territory = [];
        level.territoryDirty = true;

        console.log("Level initialized.");
    })(self);

} // end Level object

