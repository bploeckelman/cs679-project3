// ----------------------------------------------------------------------------
// Level object
// ----------------------------------------------------------------------------
function Level (game) {

    // Public properties ------------------------------------------------------
    this.grid1 = null;
    this.grid2 = null;
    this.cells = null;


    // Private variables ------------------------------------------------------
    var self = this,
        LEVEL_SIZE = {
            width:  1000,
            height: 1000,
            cellw:  10,
            cellh:  10,
            xcells: 100,
            ycells: 100
        };

    // Level methods ----------------------------------------------------------
    this.update = function () {
        // ...
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (level) {
        // Create level meshes
        level.grid1 = new THREE.Mesh(
            new THREE.PlaneGeometry(LEVEL_SIZE.width, LEVEL_SIZE.height,
                                    LEVEL_SIZE.xcells, LEVEL_SIZE.ycells),
            new THREE.MeshBasicMaterial({ color: 0x112211, wireframe: true })
        );

        level.grid2 = new THREE.Mesh(
            new THREE.PlaneGeometry(LEVEL_SIZE.width, LEVEL_SIZE.height,
                                    LEVEL_SIZE.xcells / 4, LEVEL_SIZE.ycells / 4),
            new THREE.MeshBasicMaterial({ color: 0x115511, wireframe: true })
        );

        // Reposition the grid so its bottom left corner at (0,0,0)
        level.grid1.position.set(LEVEL_SIZE.width / 2, LEVEL_SIZE.height / 2, 0);
        level.grid2.position.set(LEVEL_SIZE.width / 2, LEVEL_SIZE.height / 2, 0.1);

        // Add the meshes to the scene
        game.scene.add(level.grid1);
        game.scene.add(level.grid2);


        // Create level cells
        level.cells = [];
        for(var y = 0; y < LEVEL_SIZE.ycells; ++y) {
            level.cells.push([]);
            for(var x = 0; x < LEVEL_SIZE.xcells; ++x) {
                level.cells[y].push({ // cell[y][x]
                    indices: new THREE.Vector2(x,y),
                    pos: new THREE.Vector3(
                            x * LEVEL_SIZE.cellw,
                            y * LEVEL_SIZE.celly, 0)
                });
            }
        }

        console.log("Level initialized.");
    })(self);

} // end Level object

