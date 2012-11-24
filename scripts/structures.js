var STRUCTURE_TYPES = {
        ONE_BY_ONE: 0,
        TWO_BY_TWO: 1,
        THREE_BY_THREE: 2
    };
// ----------------------------------------------------------------------------
// Structure object
// ----------------------------------------------------------------------------
function Structure (type, game) {

    // Public properties ------------------------------------------------------
    this.type     = null;
    this.mesh     = null;
    this.node     = null;
    this.position = null;


    // Private variables ------------------------------------------------------
    var self = this;


    // Structure methods ------------------------------------------------------
    this.update = function () {
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

            /*
            self.mesh.position.x = mouseWorldPos.x;
            self.mesh.position.y = mouseWorldPos.y;
            self.mesh.position.z = 1; // Above grid
            */
            self.node.position.x = mouseWorldPos.x;
            self.node.position.y = mouseWorldPos.y;
            self.node.position.z = 1; // Above grid
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
            default:
                console.log("Error: unhandled structure type!");
        }

        // Create structure mesh
        structure.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({ color: 0xff00ff })
        );
        structure.mesh.position.x = width  / 2;//0;
        structure.mesh.position.y = height / 2;//0;
        structure.mesh.position.z = 1;

        // Add some helpful properties to the mesh for later use
        structure.mesh.width  = width;
        structure.mesh.height = height;

        // Create a node to offset the mesh "center" to bottom left
        structure.node = new THREE.Object3D();
        structure.node.add(structure.mesh);

        // Add the mesh to the scene
        game.scene.add(structure.node);//structure.mesh);

        console.log("Structure initialized.");
    })(self);

} // end Structure object

