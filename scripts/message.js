// ----------------------------------------------------------------------------
// Message object
// ----------------------------------------------------------------------------
function Message (game, text, duration, position, size, margin, entranceTween, exitTween) {

    this.text     = null;
    this.size     = null;
    this.margin   = null;
    this.position = null;
    this.duration = null;
    this.inTween  = null;
    this.outTween = null;

    var self = this,
        DEFAULT_DURATION = 3000;


    this.render = function (context, canvas) {
        // Clear 2d canvas
        // NOTE: call this from Game.renderOverlayText() and canvas is already cleared
        /*
        context.save();
        context.setTransform(1,0,0,1,0,0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();
        */

        // Draw the message rectangle
        context.globalAlpha = 0.75;
        context.fillStyle = "#102010";
        context.strokeStyle = "#10f010";
        //context.fillRect(self.position.x, self.position.y, self.size.x, self.size.y);
        context.roundRect(self.position.x, self.position.y, self.size.x, self.size.y, 15).fill();
        context.roundRect(self.position.x, self.position.y, self.size.x, self.size.y, 15).stroke();
        context.globalAlpha = 1.0;

        // Draw the message text
        context.font      = "bold small-caps 30px Lucida Console";
        context.textBaseLine = "bottom";
        context.textAlign =  "left";
        context.fillStyle = "#e0ffe0";
        context.fillText(self.text, self.position.x + self.margin.left, self.position.y + self.margin.top);
    };


    (this.init = function (message) {
        message.text     = (text !== undefined) ? "" + text : "This is a generic message box";
        message.size     = (size instanceof THREE.Vector2) ? size
                         : new THREE.Vector2(window.innerWidth / 3, window.innerHeight / 3);

        message.margin   = (margin instanceof Rect) ? margin : new Rect(10, 10, 10, 10);

        message.position = (position instanceof THREE.Vector2) ? position
                         : new THREE.Vector2(window.innerWidth  / 2 - message.size.x / 2,
                                             window.innerHeight / 2 - message.size.y / 2);

        message.duration = (duration > 0) ? duration : DEFAULT_DURATION;

        message.inTween  = (entranceTween !== undefined) ? entranceTween
                         : new TWEEN.Tween({ x: -window.innerHeight })
                               .to({ x: message.position.x }, message.duration)
                               .easing(TWEEN.Easing.Back.Out)
                               .onUpdate(function () { message.position.x = this.x; });

        message.outTween = (exitTween !== undefined) ? exitTween 
                         : new TWEEN.Tween({ y: message.position.y })
                               .to({ y: window.innerHeight }, message.duration)
                               .easing(TWEEN.Easing.Back.Out)
                               .onUpdate(function () { message.position.y = this.y; });

        message.inTween.onComplete(function () {
            setTimeout(function () { message.outTween.start(); }, message.duration);
        });
        message.inTween.start();
    }) (self);

}

