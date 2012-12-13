var PARTICLES = {
    ENEMY_DEATH:      0,
    PLAYER_DEATH:     1,
    ARTIFACT_DAMAGE:  2,
    ARTIFACT_DEATH:   3,
    ARTIFACT_CLAIMED: 4
};
// ----------------------------------------------------------------------------
// spawnParticles helper function
// ----------------------------------------------------------------------------
function spawnParticles (type, centerPosition, description, game) {
    var numParticles  = 0,
        intialSize    = 0,
        geometry      = null,
        material      = null,
        blendMode     = THREE.NormalBlending,
        color         = new THREE.Color(0xff00ff),
        target        = null;
        velocityRange = null;

    // Setup parameters based on system type
    switch (type) {
        case PARTICLES.ENEMY_DEATH:
            numParticles  = 50;
            initialSize   = 10;
            color         = description.color;
            velocityRange = {
                min: new THREE.Vector3(-0.5, -0.5, 0),
                max: new THREE.Vector3( 0.5,  0.5, 0)
            };
        break;
        case PARTICLES.PLAYER_DEATH:
            numParticles  = 500;
            initialSize   = 5;
            color         = description.color;
            velocityRange = {
                min: new THREE.Vector3(-4.0, -4.0, -0.4),
                max: new THREE.Vector3( 4.0,  4.0,  0.4)
            };
        break;
        case PARTICLES.ARTIFACT_DAMAGE:
            numParticles  = 200;
            initialSize   = 20;
            color         = description.color;
            velocityRange = {
                min: new THREE.Vector3(-1.0, -1.0, -1.2),
                max: new THREE.Vector3( 1.0,  1.0,  0.7)
            };
        break;
        case PARTICLES.ARTIFACT_DEATH:
            numParticles  = 1000;
            initialSize   = 8;
            color         = description.color;
            velocityRange = {
                min: new THREE.Vector3(-1.5, -1.5, -2.0),
                max: new THREE.Vector3( 1.5,  1.5,  2.0)
            };
        break;
        case PARTICLES.ARTIFACT_CLAIMED:
            numParticles  = 500;
            initialSize   = 1;
            color         = description.color;
            target        = description.target;
            velocityRange = {
                min: new THREE.Vector3(-0.03, -0.03, 0.01),
                max: new THREE.Vector3( 0.03,  0.03, 0.5)
            };
        break;
        // Add other particle types...
    }

    // Add particle geometry
    geometry = new THREE.Geometry();
    for (var i = 0; i < numParticles; ++i) {
        var particle = centerPosition.clone();
        if (target !== null && target instanceof THREE.Vector3) {
            // Set velocity to move particles towards target
            var position = new THREE.Vector3(particle.x, particle.y, particle.z),
                velocity = new THREE.Vector3().sub(target, position).normalize();
            // Spread out a bit TODO: unhack this, make it a 'spread' property in description
            particle.x += Math.random() * 20 - 10;
            particle.y += Math.random() * 20 - 10;
            particle.z += Math.random() * 20 - 10;

            // TODO: this isn't applied properly during updateParticles() during the first tween
            //       have to do more debugging to figure out why
            var SPEED = 1.0;
            velocity.x = Math.random() * 0.4 - 0.2 + velocity.x; 
            velocity.y = Math.random() * 0.4 - 0.2 + velocity.y; 
            velocity.z = Math.random() * 0.4 - 0.2 + velocity.z; 
            particle.velocity = velocity.multiplyScalar(SPEED);
        } else {
            particle.velocity = new THREE.Vector3(
                randomBetween(velocityRange.min.x, velocityRange.max.x),
                randomBetween(velocityRange.min.y, velocityRange.max.y),
                randomBetween(velocityRange.min.z, velocityRange.max.z));
        }
        // TODO: add acceleration and associated range
        geometry.vertices.push(particle);
    }

    // Tweak special colors
    if (type === PARTICLES.ARTIFACT_DEATH) {
        color = (function () {
            var color = new THREE.Color(0x00000);
            var rgb = new THREE.Vector3(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                0);
            color.setRGB(rgb.x, rgb.y, rgb.z);
            return color;
        }) ();
    } else if (type === PARTICLES.ARTIFACT_CLAIMED) {
        color = (function () {
            var color = new THREE.Color(0x00000);
            var rgb = new THREE.Vector3(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5);
            color.setRGB(rgb.x, rgb.y, rgb.z);
            return color;
        }) ();
    }

    // Initialize particle material
    material = new THREE.ParticleBasicMaterial({
        size: initialSize,
        sizeAttenuation: true,
        blending: blendMode,
        color: color
    });

    // Create the particle system
    var system = new THREE.ParticleSystem(geometry, material);
    system.sortParticles = true;
    system.complete = false;

    // Shrink the size of the particles in the system over time
    if (type === PARTICLES.ARTIFACT_CLAIMED) {
        var TIME = 5000,
            END_SIZE = 5;

        var tween = new TWEEN.Tween({ size: system.material.size })
            .to({ size: END_SIZE }, TIME)
            .onUpdate(function () { system.material.size = this.size; })
            .onComplete(function () {
                // Reset tween and material to initial sizes
                this.size = initialSize;
                system.material.size = initialSize;

                // Reset particle position to initial position
                for (var i = 0; i < numParticles; ++i) {
                    var particle = system.geometry.vertices[i];

                    // Spread out
                    particle.x = centerPosition.x + Math.random() * 20 - 10;
                    particle.y = centerPosition.y + Math.random() * 20 - 10;
                    particle.z = centerPosition.z + Math.random() * 20 - 10;
                }
                system.geometry.__dirtyVertices = true;

                // Restart tween
                tween.start();
            })
            .start();
    } else {
        // Shrink particles
        var SHRINK_TIME = 2000; // in milliseconds
        new TWEEN.Tween({ size: system.material.size })
            .to({ size: 0.0 }, SHRINK_TIME)
            .easing(TWEEN.Easing.Circular.Out)
            .onUpdate(function () { system.material.size = this.size; })
            .onComplete(function () { system.complete = true; })
            .start();
    }

    // Add the new particle system to the particles array and scene
    game.particles.push(system);
    game.scene.add(system);
}

