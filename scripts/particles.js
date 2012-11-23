var PARTICLES = { ENEMY_DEATH: 0 };
// ----------------------------------------------------------------------------
// spawnParticles helper function
// ----------------------------------------------------------------------------
function spawnParticles (type, centerPosition, description, game) {
    var numParticles = 0,
        intialSize   = 0,
        geometry     = null,
        material     = null,
        blendMode    = THREE.NormalBlending,
        color        = new THREE.Color(0xff00ff);

    // Setup parameters based on system type
    switch (type) {
        case PARTICLES.ENEMY_DEATH:
            numParticles = 50;
            initialSize  = 10;
        break;
        // add cases for other particle system types here...
    };

    // Parse description object
    if (description !== undefined) {
        if (description.color !== undefined) {
            color = description.color;
        }
        // ...
    }

    // Add particle geometry
    geometry = new THREE.Geometry();
    for (var i = 0; i < numParticles; ++i) {
        var particle = centerPosition.clone();
        // TODO: specify velocity range based on type
        particle.velocity = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            0);
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
    var SHRINK_TIME = 3000; // in milliseconds
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

