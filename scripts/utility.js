/* 
 * Useful Additions to THREE.js library and other utility functions
 */

var EPSILON = 0.1;

/*
 * THREE.js doesn't proved a good function to compare two vectors. 
 * Adding that feature with EPSILON degree of accuracy.
 */
THREE.Vector2.prototype.almostEquals = function ( other, epsilon ) {
    if (epsilon === null) {
        epsilon = EPSILON;
    }
    if ( Math.abs(this.x - other.x) < epsilon && 
            Math.abs(this.y - other.y) < epsilon ) {
        return true;
    }
    else return false;
};

THREE.Vector3.prototype.almostEquals = function ( other, epsilon ) {
    if (epsilon === null) {
        epsilon = EPSILON;
    }
    if ( Math.abs(this.x - other.x) < epsilon && 
            Math.abs(this.y - other.y) < epsilon &&
            Math.abs(this.z - other.z) < epsilon ) {
        return true;
    }
    else return false;
};

THREE.Vector3.prototype.almostEquals2D = function ( other, epsilon ) {
    if (epsilon === null) {
        epsilon = EPSILON;
    }
    if ( Math.abs(this.x - other.x) < epsilon && 
            Math.abs(this.y - other.y) < epsilon ) {
        return true;
    }
    else return false;
};

/*
 * Rectangle Class for rectangular collision detection
 */
function Rect (x1, y1, x2, y2) {
    
    
    this.left = x1;
    this.right = x2;
    this.top = y1;
    this.bottom = y2;
};

Rect.prototype.LEFT = 0;
Rect.prototype.RIGHT = 1;
Rect.prototype.TOP = 2;
Rect.prototype.BOTTOM = 3;

Rect.prototype.intersects = function( other ) {
    return !(other.left >= this.right || 
             other.right <= this.left || 
             other.top >= this.bottom ||
             other.bottom <= this.top);
};

/*
 * Random number function
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
};


/*
 * Next closest multiple
 */
function closestMultiple(x, multiplier) {
    return Math.ceil(x / multiplier) * multiplier;
}

/*
 * Creates a shallow copy of an object
 */
function shallowCopy(object) {
    var ans = {};
    for (var key in object) {
        ans[key] = object[key];
    }
    return ans;
}

function deepCopy(object) {
    var clone = {};

    for (var key in object) {
        if (typeof object[key] == 'object') {
            clone[key] = deepCopy(object[key]);
        } else {
            clone[key] = object[key];
        }
    }

    return clone;
}


/*
 * Get a new html5 image object with the specified src image
 */
function getImage (src) {
    var img = new Image();
    img.src = src;
    return img;
}

/*
 * Redefine the working of THREE.Color.getHex()
 */
THREE.Color.prototype.getHex = function () {
    var hex = 0;
    hex += this.r;    hex <<= 8;
    hex += this.g;    hex <<= 8;
    hex += this.b;    
    return hex;
};