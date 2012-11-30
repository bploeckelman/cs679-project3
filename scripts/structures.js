var STRUCTURE_TYPES = {
        ONE_BY_ONE:     0,
        TWO_BY_TWO:     1,
        THREE_BY_THREE: 2,
        FOUR_BY_FOUR:   3
    },
    STRUCTURE_COSTS = [10, 20, 30, 40];
    
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


    // Private variables ------------------------------------------------------
    var self = this;


    // Structure methods ------------------------------------------------------
    this.update = function () {
        // TODO...
    };


    this.place = function () {
        self.placed = true;
        self.gridindices = Object.freeze(self.gridindices);
        game.level.cells[gridindices.y][gridindices.x] = 1;
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
        structure.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({ color: 0xff00ff })
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

        console.log("Structure initialized.");
    })(self);

} // end Structure object

