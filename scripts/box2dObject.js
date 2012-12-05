
//------------------------------//
//	Box2D Shortcuts				//
//------------------------------//
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2AABB = Box2D.Collision.b2AABB;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2WeldJoint = Box2D.Dynamics.Joints.b2WeldJoint;
var b2WeldJointDef =  Box2D.Dynamics.Joints.b2WeldJointDef;
var b2ContactListener = Box2D.Dynamics.b2ContactListener;


function box2dObject (game, obj, type) {
    // Public properties ------------------------------------------------------
	this.body = null;
	this.fixture = null;
	this.fixDef = null;
	
	
    // Private variables ------------------------------------------------------
    var self = this;
	var ddensity = 1000;
	var dfriction = 0.5;
//	var drestituion = 0.2;
	var drestituion = 100.0;
	
	// Constructor ------------------------------------------------------------
    (this.init = function (box2dObject) {
	
		type = typeof type !== 'undefined' ? type : b2Body.b2_dynamicBody;
		var bodyDef = new b2BodyDef;
		bodyDef.allowSleep = true;
		bodyDef.type = type;
		self.body = game.box2d.world.CreateBody(bodyDef);
		self.body.SetUserData(obj);
			
			
		var fixDef = new b2FixtureDef;
		self.fixDef = fixDef;
		fixDef.density = ddensity;
		fixDef.friction = dfriction;
		fixDef.resitution = drestituion;
		//Default to box if it has width and height attribute
		if( typeof obj.width !== 'undefined' && typeof obj.height !== 'undefined'){
			fixDef.shape = new b2PolygonShape();
			fixDef.shape.SetAsBox(obj.width/2, obj.height/2);
			self.fixture = self.body.CreateFixture(fixDef);
		}
	})(self);
}