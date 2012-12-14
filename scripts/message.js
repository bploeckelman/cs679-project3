// ----------------------------------------------------------------------------
// Message object
// ----------------------------------------------------------------------------
function Message (game, text, duration, size, margin, position, entranceTween, exitTween) {

    this.text     = null;
    this.size     = null;
    this.margin   = null;
    this.position = null;
    this.duration = null;
    this.inTween  = null;
    this.outTween = null;
    this.finished = null;

    var self = this,
        ROUNDED_CORNER         = 15,
        DEFAULT_DURATION       = 3000,
        DEFAULT_EXIT_DURATION  = 1500,
        DEFAULT_ENTER_DURATION = 3000;


    // NOTE: call this from Game.renderOverlayText() so the canvas is already cleared
    this.render = function (context, canvas) {
        var fontStyle = "bold small-caps 30px Lucida Console",
            maxPixelWidth = self.size.x - self.margin.left - self.margin.right,
            lines = getLines(context, self.text, maxPixelWidth, fontStyle);

        // Draw the message rectangle
        context.globalAlpha = 0.75;
        context.fillStyle = "#102010";
        context.strokeStyle = "#10f010";
        context.roundRect(self.position.x, self.position.y,
                          self.size.x, self.size.y, ROUNDED_CORNER).fill();
        context.roundRect(self.position.x, self.position.y,
                          self.size.x, self.size.y, ROUNDED_CORNER).stroke();
        context.globalAlpha = 1.0;

        // Draw the message text
        context.font         = fontStyle;
        context.textAlign    = "left";
        context.textBaseLine = "bottom";
        context.fillStyle    = "#e0ffe0";

        var yOffset = 0;
        for(var i = 0; i < lines.length; ++i) {
            var line = lines[i];
            context.fillText(line,
                    self.position.x + self.margin.left,
                    self.position.y + self.margin.top + yOffset);

            // Context.measureText("text") only measures width, not height
            // so we just have to hardcode the y-offset between lines...
            yOffset += 30; 
        }
    };


    (this.init = function (message) {
        message.text     = (text !== undefined) ? "" + text : "This is a generic message box";
        message.size     = (size instanceof THREE.Vector2) ? size
                         : new THREE.Vector2(window.innerWidth / 3, window.innerHeight / 3);

        message.margin   = (margin instanceof Rect) ? margin : new Rect(20, 20, 20, 20);

        message.position = (position instanceof THREE.Vector2) ? position
                         : new THREE.Vector2(window.innerWidth  / 2 - message.size.x / 2,
                                             window.innerHeight / 2 - message.size.y / 2);

        message.duration = (duration > 0) ? duration : DEFAULT_DURATION;

        message.inTween  = (entranceTween !== undefined) ? entranceTween
                         : new TWEEN.Tween({ x: -window.innerWidth })
                               .to({ x: message.position.x }, DEFAULT_ENTER_DURATION)
                               .easing(TWEEN.Easing.Back.Out)
                               .onUpdate(function () { message.position.x = this.x; });

        message.outTween = (exitTween !== undefined) ? exitTween 
                         : new TWEEN.Tween({ y: message.position.y })
                               .to({ y: window.innerHeight }, DEFAULT_EXIT_DURATION)
                               .easing(TWEEN.Easing.Back.In)
                               .onUpdate(function () { message.position.y = this.y; })
                               .onComplete(function () { message.finished = true; });

        message.inTween.onComplete(function () {
            setTimeout(function () { message.outTween.start(); }, message.duration);
        });
        message.inTween.start();

        message.finished = false;
    }) (self);

}

