//-----------------------------------------------------------------------------
// Instructions
//-----------------------------------------------------------------------------
var styles = {
    style0: { 
        font: "50px Arial",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ff100f",
        delay: 2000,
    },  
    style1: {
        font: "25px Arial",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ffffff",
        delay: 1000,
    },  
    style2: {
        font: "25px Arial",
        textBaseLine: "bottom",
        textAlign: "left",
        fillStyle: "#ffffff",
        delay: 5000,
    }
};

var instructions = {

    // --------------------------------

    build: {
        draw: true,
        text: { text: "Build Phase...", style: styles.style0 },
        lines: [
            { text: "Build Phase...", style: styles.style0 },
            { text: "W A S D keys move the viewpoint around", style: styles.style2 },
            { text: "1 2 3 4 keys or clicking a button below buys a new structure", style: styles.style2 },
            { text: "Left-Click to place structure, Right-Click to discard it", style: styles.style2 },
            { text: "Structures can only be placed inside green 'claimed' territory", style: styles.style2 },
            { text: "Placing structures expands your territory", style: styles.style2 },
            { text: "Large structures expand territory more than small ones", style: styles.style2 },
            { text: "More territory = more build credits", style: styles.style2 }
        ],
        line: 1,
        position: new THREE.Vector2(25, window.innerHeight / 6)
    },


    defend: {
        draw: true,
        text: { text: "Defend Phase...", style: styles.style0 },
        lines: [
            { text: "Defend Phase...", style: styles.style0 },
            { text: "HOLD Right-Mouse to move with the mouse, or...", style: styles.style2 },
            { text: "W, A, S, and D keys move also", style: styles.style2 },
            { text: "Left-Click to use your spin-attack!", style: styles.style2 },
            { text: "Protect your structures and artifact cube from enemies", style: styles.style2 },
        ],
        line: 1,
        position: new THREE.Vector2(25, window.innerHeight / 6),
    }
};

