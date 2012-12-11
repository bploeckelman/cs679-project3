//-----------------------------------------------------------------------------
// Instructions
//-----------------------------------------------------------------------------
var styles = {
    title: { 
        font: "bold small-caps 50px Arial",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ff100f",
        xOffset: 0,
        yOffset: 100,
    },  
    highlight: {
        font: "bold 30px Arial",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ffff00",
        xOffset: 0,
        yOffset: 60,
    },
    image: { },
    style1: {
        font: "25px Arial",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ffffff",
        xOffset: 0,
        yOffset: 50,
    },  
    style2: {
        font: "25px Arial",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ffffff",
        xOffset: 0,
        yOffset: 50,
    }
};

function getImage (src) {
    var img = new Image();
    img.src = src;
    return img;
}

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
            { image: getImage("images/mouse-left.png"), text: "Place structure", style: styles.highlight },
            { image: getImage("images/mouse-right.png"), text: "Discard structure", style: styles.highlight},
            { text: "Build in green 'claimed' cells to...", style: styles.highlight},
            { text: "    - Defend your cube!", style: styles.style2 },
            { text: "    - Expand your territory", style: styles.style2 },
            { text: "    - Earn more build credits", style: styles.style2 }
        ],
        position: new THREE.Vector2(25, window.innerHeight / 10)
    },


    defend: {
        draw: true,
        alpha: 1.0,
        lines: [
            { text: "Defend Phase...", style: styles.title },
            { text: "Move the player:", style: styles.highlight },
            { image: getImage("images/wasd.png"), style: styles.image },
            { image: getImage("images/mouse.png"), text: "Mouse move", style: styles.highlight },
            { image: getImage("images/mouse-left.png"), text: "Spin attack", style: styles.highlight },
            { text: "Destroy enemies to...", style: styles.highlight },
            { text: "   - Protect your cube", style: styles.style2 },
            { text: "   - Protect your structures", style: styles.style2 },
        ],
        position: new THREE.Vector2(25, window.innerHeight / 10),
    }
};

