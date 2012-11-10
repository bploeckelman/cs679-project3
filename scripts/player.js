// ----------------------------------------------------------------------------
// Player object
// ----------------------------------------------------------------------------
function Player (game) {

    // Public properties ------------------------------------------------------
    this.mesh     = null;
    this.position = null;
    this.velocity = null;


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

        if (this.velocity.x >  MAX_SPEED.x) this.velocity.x =  MAX_SPEED.x;
        if (this.velocity.x < -MAX_SPEED.x) this.velocity.x = -MAX_SPEED.x;

        if (this.velocity.y >  MAX_SPEED.y) this.velocity.y =  MAX_SPEED.y;
        if (this.velocity.y < -MAX_SPEED.y) this.velocity.y = -MAX_SPEED.y;

        this.mesh.position = this.position.addSelf(this.velocity).clone();
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (player) {
        console.log("Player initializing...");

        player.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PLAYER_SIZE.w, PLAYER_SIZE.h),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
        );
        player.mesh.position.set(PLAYER_SIZE.w / 2, PLAYER_SIZE.h / 2, PLAYER_Z);
        player.position = player.mesh.position;
        player.velocity = new THREE.Vector3(0,0,0);

        console.log("Player initialized.");
    })(this);

} // end Player object

