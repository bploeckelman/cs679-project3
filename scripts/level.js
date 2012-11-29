// ----------------------------------------------------------------------------
// Level object
// ----------------------------------------------------------------------------
function Level (game) {

    // Public properties ------------------------------------------------------
    this.grid0 = null;
    this.grid1 = null;
    this.grid2 = null;
    this.cells = null;
    this.size  = null;
    this.artifact   = null;
    this.structures = null;


    // Private variables ------------------------------------------------------
    var self = this;


    // Level methods ----------------------------------------------------------
    this.update = function () {
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


        // Create level cells
        level.cells = [];
        for(var y = 0; y < level.size.ycells; ++y) {
            level.cells.push([]);
            for(var x = 0; x < level.size.xcells; ++x) {
                level.cells[y].push({ // cell[y][x]
                    indices: new THREE.Vector2(x,y),
                    pos: new THREE.Vector3(
                            x * level.size.cellw,
                            y * level.size.celly, 0)
                });
            }
        }

        // Initialize the structures container
        // TODO: add initial structures
        level.structures = [];

        // Initialize the artifact
        level.artifact = new Artifact(level, game);

        console.log("Level initialized.");
    })(self);

} // end Level object

