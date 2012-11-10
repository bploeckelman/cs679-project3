// ----------------------------------------------------------------------------
// Player object
// ----------------------------------------------------------------------------
function Player (game) {

    // Public properties ------------------------------------------------------
    this.mesh     = null;
    this.position = null;
    this.velocity = null;
    this.isSpinning = false;


    // Private variables ------------------------------------------------------
    var PLAYER_SIZE = { w: 9, h: 9 },
        MOVE_SPEED  = { x: 0.25, y: 0.25 },
        MAX_SPEED   = { x: 3, y: 3 },
        PLAYER_Z    = 0.2;


    // Player methods ---------------------------------------------------------
    this.update = function () {
        // Move the player
        if      (game.input.panLeft)  this.velocity.x -= MOVE_SPEED.x;
        else if (game.input.panRight) this.velocity.x += MOVE_SPEED.x;
        else                          this.velocity.x  = 0;

        if      (game.input.panUp)    this.velocity.y += MOVE_SPEED.y;
        else if (game.input.panDown)  this.velocity.y -= MOVE_SPEED.y;
        else                          this.velocity.y  = 0;

        // Limit the players maximum velocity
        if (this.velocity.x >  MAX_SPEED.x) this.velocity.x =  MAX_SPEED.x;
        if (this.velocity.x < -MAX_SPEED.x) this.velocity.x = -MAX_SPEED.x;

        if (this.velocity.y >  MAX_SPEED.y) this.velocity.y =  MAX_SPEED.y;
        if (this.velocity.y < -MAX_SPEED.y) this.velocity.y = -MAX_SPEED.y;

        // Position the mesh to correspond with players updated position
        this.mesh.position = this.position.addSelf(this.velocity).clone();

        // Handle spin move
        if (game.input.spin && !this.isSpinning) {
            var player = this,
                currentZoom = game.camera.position.z;

            player.isSpinning = true;
            
            // Rotate the player
            var ROT_AMOUNT = -8 * Math.PI,
                ROT_TIME   = 2000;

            new TWEEN.Tween({ rot: 0 })
                .to({ rot: ROT_AMOUNT }, ROT_TIME)
                .easing(TWEEN.Easing.Quadratic.InOut)
                // TODO: swap the next two statements this for a standup square
                .onUpdate(function () { player.mesh.rotation.z = this.rot })
                //.onUpdate(function () { player.mesh.rotation.y = this.rot })
                //.onComplete(function () { player.isSpinning = false; })
                .start();

            // NOTE: just messing around here, don't need to keep this....
            var ZOOM_IN          = 100,
                ZOOM_OUT         = 100,
                ZOOM_IN_TIME     = 1500,
                ZOOM_OUT_TIME    = 700,
                ZOOM_RETURN_TIME = 400;

            // Zoom the camera in...
            new TWEEN.Tween({ zoom: currentZoom })
                .to({ zoom: currentZoom - ZOOM_IN }, ZOOM_IN_TIME)
                .easing(TWEEN.Easing.Elastic.Out)
                .onUpdate(function () { game.camera.position.z = this.zoom; })
                .onComplete(function () {
                    game.camera.position.z = currentZoom - ZOOM_IN;
                    // ...Then zoom farther out...
                    new TWEEN.Tween({ zoom: currentZoom - ZOOM_IN})
                        .to({ zoom: currentZoom + ZOOM_OUT }, ZOOM_OUT_TIME)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .onUpdate(function () {
                            game.camera.position.z = this.zoom;
                        })
                        .onComplete(function () {
                            game.camera.position.z = currentZoom + ZOOM_OUT;
                            // ...Then zoom back to the starting level...
                            new TWEEN.Tween({ zoom: currentZoom + ZOOM_OUT})
                                .to({ zoom: currentZoom }, ZOOM_RETURN_TIME)
                                .easing(TWEEN.Easing.Cubic.In)
                                .onUpdate(function () {
                                    game.camera.position.z = this.zoom;
                                })
                                .onComplete(function () {
                                    game.camera.position.z = currentZoom;
                                    player.isSpinning = false;
                                })
                                .start();
                        })
                        .start();
                })
                .start();
        }
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (player) {
        console.log("Player initializing...");

        player.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PLAYER_SIZE.w, PLAYER_SIZE.h),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
        );
        player.mesh.position.set(PLAYER_SIZE.w / 2, PLAYER_SIZE.h / 2, PLAYER_Z);
        // TODO: uncomment this for a standup square
        //player.mesh.rotation.x = Math.PI / 2;
        player.position = player.mesh.position;
        player.velocity = new THREE.Vector3(0,0,0);

        console.log("Player initialized.");
    })(this);

} // end Player object

