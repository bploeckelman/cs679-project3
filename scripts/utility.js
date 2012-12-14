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

/*
 * Changes the velocity that allows an object to "slide" on other objects
 * @param object The object that is moving
 * @param wall The object that is stationary
 * @param velocity that is to be adjusted
 */
function slide (object, wall, velocity) {
            var wallPosition = wall.position;
            var objectPosition = object.position;
            
            //Get the vector from the center of the player to the center of structure
            var diff = new THREE.Vector2().sub(wallPosition, objectPosition);
            
            //Get the vectors along the axes
            var vx = new THREE.Vector2(object.velocity.x,0);
            var vy = new THREE.Vector2(0,object.velocity.y);
            
            //Calulate the angles between the diff vector and the axes
            var thetaX = Math.acos(diff.dot(vx) / vx.length() / diff.length());
            var thetaY = Math.acos(diff.dot(vy) / vy.length() / diff.length());
            //console.log(thetaX * 180 / Math.PI + " " + (thetaY * 180 / Math.PI));
            
            //If X axis is farther, so go along x
            if( thetaX > thetaY ) {
                velocity.x = object.velocity.x / 2;
            } 
            //else Y axis is farther, so go along Y
            else {
                velocity.y = object.velocity.y / 2;
            }
};


/*
 * Rounded rectangle for canvas 2d
 */
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
};

