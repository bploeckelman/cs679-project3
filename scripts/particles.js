var PARTICLES = {
    ENEMY_DEATH:     0,
    PLAYER_DEATH:    1,
    ARTIFACT_DAMAGE: 2,
    ARTIFACT_DEATH:  3
};
// ----------------------------------------------------------------------------
// spawnParticles helper function
// ----------------------------------------------------------------------------
function spawnParticles (type, centerPosition, description, game) {
    var numParticles = 0,
        intialSize   = 0,
        geometry     = null,
        material     = null,
        blendMode    = THREE.NormalBlending,
        color        = new THREE.Color(0xff00ff),
        velocityRange = null;

    // Setup parameters based on system type
    switch (type) {
        case PARTICLES.ENEMY_DEATH:
            numParticles = 50;
            initialSize  = 10;
            color = description.color;
            velocityRange = {
                min: new THREE.Vector3(-0.5, -0.5, 0),
                max: new THREE.Vector3( 0.5,  0.5, 0)
            };
        break;
        case PARTICLES.PLAYER_DEATH:
            numParticles = 500;
            initialSize  = 5;
            color = description.color;
            velocityRange = {
                min: new THREE.Vector3(-4.0, -4.0, -0.4),
                max: new THREE.Vector3( 4.0,  4.0,  0.4)
            };
        break;
        case PARTICLES.ARTIFACT_DAMAGE:
            numParticles = 25;
            initialSize  = 20;
            color = description.color;
            velocityRange = {
                min: new THREE.Vector3(-0.3, -0.3, -0.3),
                max: new THREE.Vector3( 0.3,  0.3,  0.3)
            };
        break;
        case PARTICLES.ARTIFACT_DEATH:
            numParticles = 1000;
            initialSize  = 8;
            color = description.color;
            velocityRange = {
                min: new THREE.Vector3(-2.5, -2.5, -3.0),
                max: new THREE.Vector3( 2.5,  2.5,  3.0)
            };
        break;
        // Add other particle types...
    }

    // Add particle geometry
    geometry = new THREE.Geometry();
    for (var i = 0; i < numParticles; ++i) {
        var particle = centerPosition.clone();
        particle.velocity = new THREE.Vector3(
            randomBetween(velocityRange.min.x, velocityRange.max.x),
            randomBetween(velocityRange.min.y, velocityRange.max.y),
            randomBetween(velocityRange.min.z, velocityRange.max.z));
        geometry.vertices.push(particle);
    }

    // Initialize particle material
    material = new THREE.ParticleBasicMaterial({
        size: initialSize,
        sizeAttenuation: true,
        blending: blendMode,
        color: color
    });

    // Create the explosion particle system
    var system = new THREE.ParticleSystem(geometry, material);
    system.sortParticles = true;
    system.complete = false;

    // TODO: switch tween behavior based on type
    // Shrink the size of the particles in the system over time
    var SHRINK_TIME = 2000; // in milliseconds
    new TWEEN.Tween({ size: system.material.size })
        .to({ size: 0.0 }, SHRINK_TIME)
        .easing(TWEEN.Easing.Circular.Out)
        .onUpdate(function () {
            system.material.size = this.size;
        })
        .onComplete(function () {
            system.complete = true;
        })
        .start();

    // Add the new particle system to the particles array and scene
    game.particles.push(system);
    game.scene.add(system);
}

