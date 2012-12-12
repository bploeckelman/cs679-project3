//-----------------------------------------------------------------------------
// Instructions
//-----------------------------------------------------------------------------
var HELP_TIMEOUT   = 7500, // milliseconds for help to fade out
    SCROLL_TIMEOUT = 750,  // milliseconds for help to scroll off screen
    FROM_ALPHA     = 1.0,   // starting alpha for menu transition
    TO_ALPHA       = 0.25,  // ending alpha for menu transition
    TEXT_START     = new THREE.Vector2(50, window.innerHeight / 10);

// Style objects for canvas text ----------------
var styles = {
    title: { 
        font: "bold small-caps 50px Lucida Console",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ff100f",
        xOffset: 0,
        yOffset: 80,
    },  
    highlight: {
        font: "bold 28px Lucida Console",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ffff00",
        xOffset: 0,
        yOffset: 50,
    },
    image: {
        xOffset: 45,
        yOffset: 30,
    },
    imageHighlight: {
        font: "bold 28px Lucida Console",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ffff00",
        xOffset: 20,
        yOffset: 80,
    },
    style1: {
        font: "25px Lucida Console",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ffffff",
        xOffset: 0,
        yOffset: 40,
    },  
    style2: {
        font: "25px Lucida Console",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ffffff",
        xOffset: 0,
        yOffset: 40,
    }
};


// Instruction text/properties ------------------
var instructions = {

    build: {
        draw: true,
        alpha: 1.0,
        lines: [
            { text: "Build Phase...", style: styles.title},
            { text: "Move the viewpoint:", style: styles.highlight },
            { image: getImage("images/wasd.png"), style: styles.image },
            { text: "Buy a new structure:", style: styles.highlight },
            { image: getImage("images/1234.png"), style: styles.image },
            { image: getImage("images/mouse-left.png"), text: "Place structure", style: styles.imageHighlight },
            { image: getImage("images/mouse-right.png"), text: "Discard structure", style: styles.imageHighlight},
            { text: "Green cells are 'claimed'", style: styles.highlight},
            { text: "Build in claimed cells to:", style: styles.highlight},
            { text: "    - Defend your cube!", style: styles.style2 },
            { text: "    - Expand your territory", style: styles.style2 },
            { text: "    - Earn more build credits", style: styles.style2 }
        ],
        position: TEXT_START.clone(),
        tween:    new TWEEN.Tween({ alpha: FROM_ALPHA })
                    .to({ alpha: TO_ALPHA }, HELP_TIMEOUT)
                    .easing(TWEEN.Easing.Bounce.In)
                    .onStart(function () {
                        game.instructions.draw = true;
                        game.instructions.position = TEXT_START.clone();
                    })
                    .onUpdate(function () { game.instructions.alpha = this.alpha; })
                    .onComplete(function () {
                        this.alpha = FROM_ALPHA;
                        // Start scroll-up tween
                        new TWEEN.Tween({ y: TEXT_START.y })
                            .to({ y: -window.innerHeight }, SCROLL_TIMEOUT)
                            .easing(TWEEN.Easing.Exponential.In)
                            .onUpdate(function () { game.instructions.position.y = this.y })
                            .onComplete(function () {
                                this.y = TEXT_START.y;
                                game.instructions.draw = false;
                            })
                            .start();
                    })
    },


    defend: {
        draw: true,
        alpha: 1.0,
        lines: [
            { text: "Defend Phase...", style: styles.title },
            { text: "Move the player:", style: styles.highlight },
            { image: getImage("images/wasd.png"), style: styles.image },
            { image: getImage("images/mouse-right.png"), text: "Mouse move", style: styles.imageHighlight },
            { image: getImage("images/mouse-left.png"), text: "Spin attack", style: styles.imageHighlight },
            { text: "Destroy enemies to...", style: styles.highlight },
            { text: "   - Protect your cube", style: styles.style2 },
            { text: "   - Protect your structures", style: styles.style2 },
        ],
        position: TEXT_START.clone(),
        tween:    new TWEEN.Tween({ alpha: FROM_ALPHA })
                    .to({ alpha: TO_ALPHA }, HELP_TIMEOUT)
                    .easing(TWEEN.Easing.Bounce.In)
                    .onStart(function () {
                        game.instructions.draw = true;
                        game.instructions.position = TEXT_START.clone();
                    })
                    .onUpdate(function () { game.instructions.alpha = this.alpha; })
                    .onComplete(function () {
                        this.alpha = FROM_ALPHA;
                        // Start scroll-up tween
                        new TWEEN.Tween({ y: TEXT_START.y })
                            .to({ y: -window.innerHeight }, SCROLL_TIMEOUT)
                            .easing(TWEEN.Easing.Exponential.In)
                            .onUpdate(function () { game.instructions.position.y = this.y })
                            .onComplete(function () {
                                this.y = TEXT_START.y;
                                game.instructions.draw = false;
                            })
                            .start();
                    })

    }
};

