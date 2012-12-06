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
    ];
    
// ----------------------------------------------------------------------------
// Structure object
// ----------------------------------------------------------------------------
function Structure (type, game) {

    // Public properties ------------------------------------------------------
    this.type     = null;
    this.mesh     = null;
    this.node     = null;
    this.placed   = null;
    this.gridindices = null;
	this.box2dObject = null;
	this.type = structureType;
	
	//used by box2D
	this.width = null;
	this.height = null;


    // Private variables ------------------------------------------------------
    var self = this;


    // Structure methods ------------------------------------------------------
    this.update = function () {
        // TODO...
    };
	
	 this.getPosition = function () {
		return self.box2dObject.body.GetPosition();
	};
	
	this.setPosition = function (position){
		self.box2dObject.body.SetPosition(new b2Vec2(position.x, position.y));
		self.mesh.position.set(position.x, position.y, self.mesh.position.z);
	};
	
	this.collide = function(obj){
		alert("structure collide with type:" + type);
		if(obj.type == playerType) {
			//alert("Structure collides with player!");
		}else if(obj.type == enemyType){
			alert("Enemy collides with enemy!");
		}else{
			//collide with unknow object
			//do nothing
		}
	};

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

                    // Set cell as buildable
                    game.level.cells[iy][ix].buildable = true;
                }
            }


            self.placed = true;
            game.level.territoryDirty = true; // Regenerate territory geometry
        }

        return buildable;
    };
    
    this.scale = function (scale_w, scale_h) {
    	var fixDef = this.box2dObject.fixDef;
		fixDef.shape.SetAsBox(this.width * scale_w / 2, this.height * scale_h / 2);
		this.box2dObject.fixture = this.body.CreateFixture(fixDef);
	
		this.mesh.scale.x = scale_w;
		this.mesh.scale.y = scale_h;
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
            new THREE.MeshBasicMaterial({ color: STRUCTURE_COLORS[structure.type] })
        );

        // Create a node to offset the mesh "center" to bottom left
        structure.node = new THREE.Object3D();
        structure.node.add(structure.mesh);

		//Create box2D representation
		self.width = width / box2DPosScale;
		self.height = height / box2DPosScale;
		self.box2dObject = new box2dObject(game, self, b2Body.b2_staticBody);
		
        // Offset the mesh center to bottom left of mesh
        // +1 makes it fit inside a cell instead of partially overlapping
		structure.setPosition(new b2Vec2(width / 2 + 1, height / 2 + 1));
		//z posiiton should always be 0
        structure.mesh.position.z = 0;

        // Add some helpful properties to the mesh for later use
		//I can't allow mesh width/height change without going through box2d
		//call structure.scale if needed
		//yangsuli
		/*
        structure.mesh.width  = width;
        structure.mesh.height = height;
		*/
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

        console.log("Structure initialized.");
    })(self);

} // end Structure object

