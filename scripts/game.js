// ----------------------------------------------------------------------------
// Game object 
// ----------------------------------------------------------------------------
function Game(canvas, renderer) {

    // Public properties ------------------------------------------------------
    this.frames = 0;            // number of frames drawn
    this.scene  = null; 
    this.camera = null;
    this.level  = null;
    this.player = null;
    this.enemies = null;
    this.particles = null;
    this.input  = {
        panUp:    false,
        panDown:  false,
        panLeft:  false,
        panRight: false,
        zoom:     false,
        zoomMod:  false,
        spin:     false,
    };
    this.keymap = {
        panUp:    87, // W
        panDown:  83, // S
        panLeft:  65, // A
        panRight: 68, // D
        zoom:     90, // Z (shift switches between in/out)
        spin:     32, // Space
    };



    // Private variables ------------------------------------------------------
    var self = this,
        GLOBAL_LIGHT0 = new THREE.AmbientLight(0x4f4f4f),
        GLOBAL_FOG0   = new THREE.Fog(0xa0a0a0, 1, 1000),
        FOV    = 67,
        ASPECT = canvas.width / canvas.height,
        NEAR   = 1,
        FAR    = 1000,
        ZOOM_SPEED = 1,
        CAMERA_FRICTION = { x: 0.9, y: 0.9 };


    // Game methods -----------------------------------------------------------
    // Update
    this.update = function () { 
        self.level.update();
        self.player.update(); 

        // Update enemies
        for(var i = self.enemies.length - 1; i >= 0; --i) {
            var enemy = self.enemies[i];
            enemy.update();

            // Handle dead enemies
            if (enemy.health <= 0) {
                // Spawn a particle system
                // TODO: Make particle system spawning functions in utilities.js
                var pgeom = new THREE.Geometry();
                for (var j = 0; j < 100; ++j) { // TODO remove magic #
                    var particle = new THREE.Vector3(
                            enemy.mesh.position.x,
                            enemy.mesh.position.y,
                            enemy.mesh.position.z
                        );
                    particle.velocity = new THREE.Vector3(
                        Math.random() * 0.5 - 0.25,
                        Math.random() * 0.5 - 0.25,
                        0);
                    pgeom.vertices.push(particle);
                }

                var pmat = new THREE.ParticleBasicMaterial({
                    size: 10,
                    sizeAttenuation: true,
                    blending: THREE.NormalBlending, //AdditiveBlending,
                    color: enemy.color
                });

                var psys = new THREE.ParticleSystem(pgeom, pmat);
                psys.sortParticles = true;
                psys.complete = false;

                // Shrink the size of the particles in the system over time
                var tween = new TWEEN.Tween({ size: psys.material.size })
                    .to({ size: 0.0 }, 3000)
                    .easing(TWEEN.Easing.Circular.Out)
                    .onUpdate(function () {
                        psys.material.size = this.size;
                    })
                    .onComplete(function () {
                        psys.complete = true;
                    })
                    .start();

                self.particles.push(psys);
                self.scene.add(psys);

                // Remove the dead enemy from the game
                self.scene.remove(enemy.mesh);
                self.enemies.splice(i, 1);
            }
        }

        handleCollisions(self);

        // Zoom the camera
        if (self.input.zoom) {
            if (self.input.zoomMod) {
                self.camera.position.z += ZOOM_SPEED;
            } else {
                self.camera.position.z -= ZOOM_SPEED;
            }
        }

        // Update the camera to follow the player
        var dx = self.player.position.x - self.camera.position.x,
            dy = self.player.position.y - self.camera.position.y,
            d  = Math.sqrt(dx*dx + dy*dy);

        if (d < 100) {
            self.camera.position.x = self.player.mesh.position.x - 50;
            self.camera.position.y = self.player.mesh.position.y - 50;
        } else {
            if (self.player.velocity.x != 0) {
                self.camera.velocity.x = self.player.velocity.x;
            } else {
                self.camera.velocity.x = dx / d;
            }

            if (self.player.velocity.y != 0) {
                self.camera.velocity.y = self.player.velocity.y;
            } else {
                self.camera.velocity.y = dy / d;
            }

            self.camera.velocity.x *= CAMERA_FRICTION.x;
            self.camera.velocity.y *= CAMERA_FRICTION.y;

            self.camera.position.x += self.camera.velocity.x;
            self.camera.position.y += self.camera.velocity.y;
        }

        // Force camera to center on the player
        self.camera.lookAt(self.player.mesh.position);

        // Update particle systems
        for (var i = self.particles.length - 1; i >= 0; --i) {
            var system = self.particles[i];

            // Remove old systems
            if (system.complete) {
                self.scene.remove(system);
                self.particles.splice(i, 1);
            } else {
                // Update the particles
                for (var j = 0; j < system.geometry.vertices.length; ++j) {
                    var particle = system.geometry.vertices[j];
                    particle.x += particle.velocity.x;
                    particle.y += particle.velocity.y;
                    particle.z += particle.velocity.z;
                }
                system.geometry.__dirtyVertices = true;
            }
        }

        TWEEN.update();
    };


    // Render
    this.render = function () {
        renderer.render(self.scene, self.camera);
        ++self.frames;
    };

    // Handle Collisions
    function handleCollisions (game) {
        var player = game.player,
            playerMin = new THREE.Vector2(
                player.position.x - 9 / 2,
                player.position.y - 9 / 2),
            playerMax = new THREE.Vector2(
                player.position.x + 9 / 2,
                player.position.y + 9 / 2);

        for(var i = 0; i < game.enemies.length; ++i) {
            var enemy = game.enemies[i],
                enemyMin = new THREE.Vector2(
                    enemy.position.x - enemy.size.x / 2,
                    enemy.position.y - enemy.size.y / 2),
                enemyMax = new THREE.Vector2(
                    enemy.position.x + enemy.size.x / 2,
                    enemy.position.y + enemy.size.y / 2);

            if (playerMin.x > enemyMax.x 
             || playerMax.x < enemyMin.x
             || playerMin.y > enemyMax.y
             || playerMax.y < enemyMin.y) {
                enemy.mesh.material.wireframe = true;
            } else {
                if (player.isSpinning) {
                    enemy.mesh.material.wireframe = false;
                    // Damage enemy
                    enemy.takeDamage(player.damageAmount);
                }
            }
        }
    }


    // Input handlers ---------------------------------------------------------
    // Key Down
    function handleKeydown (event) {
        self.input.zoomMod = event.shiftKey;

        switch (event.keyCode) {
            case self.keymap.panUp:
                self.input.panUp   = true;
                self.input.panDown = false;
            break;
            case self.keymap.panDown:
                self.input.panDown = true;
                self.input.panUp   = false;
            break;
            case self.keymap.panLeft:
                self.input.panLeft  = true;
                self.input.panRight = false;
            break;
            case self.keymap.panRight:
                self.input.panRight = true;
                self.input.panLeft  = false;
            break;
            case self.keymap.zoom:
                self.input.zoom = true;
            break;
            case self.keymap.spin:
                self.input.spin = true;
            break;
        };
    };

    // Key Up
    function handleKeyup (event) {
        self.input.zoomMod = event.shiftKey;

        switch (event.keyCode) {
            case self.keymap.panUp:    self.input.panUp    = false; break;
            case self.keymap.panDown:  self.input.panDown  = false; break;
            case self.keymap.panLeft:  self.input.panLeft  = false; break;
            case self.keymap.panRight: self.input.panRight = false; break;
            case self.keymap.zoom:     self.input.zoom     = false; break;
            case self.keymap.spin:     self.input.spin     = false; break;
        };
    };

    // TODO: mouse handling


    // Constructor ------------------------------------------------------------
    (this.init = function (game) {
        console.log("Game initializing..."); 

        // Setup input handlers
        document.addEventListener("keyup",   handleKeyup,   false);
        document.addEventListener("keydown", handleKeydown, false);

        // Initialize the camera
        game.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        game.camera.position.set(0, 0, 200);
        game.camera.velocity = new THREE.Vector3(0,0,0);
        game.camera.up = new THREE.Vector3(0,0,1);
        game.camera.lookAt(new THREE.Vector3(0,0,0));

        // Initialize the three.js scene
        game.scene  = new THREE.Scene();
        game.scene.add(GLOBAL_LIGHT0);
        game.scene.fog = GLOBAL_FOG0;

        // Add stuff to the scene
        game.scene.add(game.camera);
        game.scene.add(new THREE.AxisHelper());

        // Initialize the level
        game.level  = new Level(game);

        // Initialize the player
        game.player = new Player(game);
        game.scene.add(game.player.mesh);

        // TODO : Move this to some Config file maybe Wave.js
        var NUM_ENEMIES = 20;

        game.enemies = [];
        for(var i = 0; i < NUM_ENEMIES; ++i){
            var enemy = new Enemy({
                color:    new THREE.Vector3(
                                Math.random(),
                                Math.random(),
                                Math.random()),
                position: new THREE.Vector3(
                                Math.floor(Math.random() * 1000),
                                Math.floor(Math.random() * 1000), 0.1),
                size:     new THREE.Vector2(
                                Math.floor(Math.random() * 40) + 10,
                                Math.floor(Math.random() * 40) + 10),
                speed:    new THREE.Vector2(
                                Math.random() * 1.5,
                                Math.random() * 1.5),
                maxspeed: new THREE.Vector2(5,5)
            });
            enemy.setFollowTarget(game.player);
            game.scene.add(enemy.mesh);

            game.enemies.push(enemy);
        }

        // Initialize particle system container
        game.particles = [];

        console.log("Game initialized.");
    })(self);

} // end Game object

