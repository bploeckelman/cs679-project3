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

