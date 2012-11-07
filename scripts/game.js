// ----------------------------------------------------------------------------
// Game object 
// ----------------------------------------------------------------------------
function Game(canvas, renderer) {

    // Public properties ------------------------------------------------------
    this.scene  = null; 
    this.camera = null;
    this.level  = null;
    this.player = null;
    this.frames = 0;            // number of frames drawn


    // Private variables ------------------------------------------------------
    var GLOBAL_LIGHT0 = new THREE.AmbientLight(0x4f4f4f),
        GLOBAL_FOG0   = new THREE.Fog(0xa0a0a0, 1, 1000),
        FOV    = 67,
        ASPECT = canvas.width / canvas.height,
        NEAR   = 1,
        FAR    = 1000,
        TEST_MESH = new THREE.Mesh(
            new THREE.PlaneGeometry(64, 64, 64, 64),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
        ),
        ZOOM_TIME = 2500;


    // Constructor ------------------------------------------------------------
    (this.init = function (game) {
        console.log("Game initializing..."); 

        game.scene  = new THREE.Scene();
        game.scene.add(GLOBAL_LIGHT0);
        game.scene.fog = GLOBAL_FOG0;

        game.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        game.camera.position.set(0, 0, 100);

        // Set up a few tweens to zoom the camera in and out
        var zoomIn = new TWEEN.Tween({ zoom: 100 })
                .to({ zoom: 0 }, ZOOM_TIME)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(function () { game.camera.position.z = this.zoom; })
                .onComplete(function () { this.zoom = 100 }),
            zoomOut = new TWEEN.Tween({ zoom: 0 })
                .to({ zoom: 100 }, ZOOM_TIME)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(function () { game.camera.position.z = this.zoom; })
                .onComplete(function () { this.zoom = 0 });

        zoomOut.chain(zoomIn);
        zoomIn.chain(zoomOut);
        zoomIn.start();

        //game.camera.lookAt(new THREE.Vector3(0,0,0));

        game.scene.add(game.camera);
        TEST_MESH.position.set(0,0,-1);
        game.scene.add(TEST_MESH);

        //game.player = new Player(game);
        //game.level  = new Level(game);

        console.log("Game initialized.");
    })(this);


    // Game methods -----------------------------------------------------------
    this.update = function (input) { 
        //updatePlayer(this, input);
        //this.level.update();
        //handleCollisions(this, input);

        // Spin the mesh around a bit
        //TEST_MESH.rotation.x += 0.01;
        //TEST_MESH.rotation.y += 0.001;
        TEST_MESH.rotation.z += 0.01;

        TWEEN.update();
    }


    this.render = function (input) { 
        renderer.render(this.scene, this.camera);
        ++this.frames;
    }

}

