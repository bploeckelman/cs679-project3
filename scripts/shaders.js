
var shaders = {

    cells: {
        uniforms: {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2(1000,1000) }
        },

        vertexShader: [
            "void main() {",
            "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform float time;",
            "uniform vec2 resolution;",

            "float round(float v)",
            "{",
            "	if(v - floor(v) >= 0.5) return floor(v)+1.0;",
            "	else return floor(v);",
            "}",

            "vec2 round(vec2 v)",
            "{",
            "	vec2 ret = vec2(0.0);",
            "	if(v.x - floor(v.x) >= 0.5) ret.x = floor(v.x)+1.0;",
            "	else ret.x = floor(v.x);",
            "	if(v.y - floor(v.y) >= 0.5) ret.y = floor(v.y)+1.0;",
            "	else ret.y = floor(v.y);",
            "	return ret;",
            "}",

            "float triwave(float x)",
            "{",
            "	return 1.0-4.0*abs(0.5-fract(0.5*x + 0.25));",
            "}",

            "float rand(vec2 co){",
            "	float t = round(time*4.0);",
            "    return fract(sin(dot(co.xy ,vec2(1.9898,7.233))) * t*t);",
            "}",

            "float pixelsize = 16.0;",

            "void main( void ) {",
            "	vec2 position = ( gl_FragCoord.xy);",
            "	vec3 color = vec3(0.0);",
            "	vec2 rposition = round(((position-(pixelsize/2.0))/pixelsize));",
            "	color = vec3(rand(rposition),rand(rposition-12.0),rand(rposition+46.0));",
            "	//color *= vec3(abs(sin((position.x+2.0))) * abs(sin((position.y+2.0))));",
            "	color *= vec3(clamp( abs(triwave(position.x/pixelsize))*2.0 , 0.0 , 1.0 ));",
            "	color *= vec3(clamp( abs(triwave(position.y/pixelsize))*2.0 , 0.0 , 1.0 ));",
            "	gl_FragColor = vec4( color, 1.0 );",
            "}"
        ].join("\n")
    },

    //-------------------------------------------------------------------------
    noise: {
        uniforms: {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2(1000,1000) }
        },

        vertexShader: [
            "void main() {",
            "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform float time;",
            "uniform vec2 resolution;",

            "//Old TV by curiouschettai",
            "float rand(vec2 co){",
            "	float t = time+100.0;",
            "    return fract(sin(dot(co.xy ,vec2(1.9898,7.233))) * t*t);",
            "}",

            "void main( void ) {",
            "	float time = time / 10000.0;",

            "	float borderDarkness = mix(sin(gl_FragCoord.x/resolution.x*3.14) , sin(gl_FragCoord.y/resolution.y*3.14), 0.9);",
            "	float scaline = mix(borderDarkness/2.0, abs(sin(gl_FragCoord.y/0.5 + time * 2.0))/2.0, 0.3);",
            "	float dimming = (sin(time) * cos(time*1000.0) * sin(time))/4.0;",
            "	float noise = rand(vec2(floor(gl_FragCoord.x/1.0), floor(gl_FragCoord.y/1.0)));",

            "	float color = mix(borderDarkness , scaline, 0.9) + dimming + noise*0.5;",

            "	gl_FragColor = vec4(0.1, color * noise, 0.1, 0.3);",
            "}"
        ].join("\n"),

        transparent: true

    },

    // ------------------------------------------------------------------------
    grid: {
        uniforms: {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2(100,100) },
        },

        vertexShader: [
            "void main() {",
            "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join("\n"),

        fragmentShader: [
            "// Vlt / Dfm ",
            "// Grid function from here: http://www.cs.uaf.edu/2010/spring/cs481/section/2/lecture/04_13_procedural.html",
            "// replaced texture2D with noise function, then played around a bit.",
            "uniform float time;",
            "uniform vec2 resolution;",
            "",
            "vec2 noise(vec2 n) {",
            "	vec2 ret;",
            "	ret.x=fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);",
            "	ret.y=fract(cos(dot(n.yx, vec2(34.9865, 65.946)))* 28618.3756);",
            "	return ret;",
            "}",
            "",
            "float grid(vec2 loc) {",
            "	float dist=10.; // distance to closest grid cell",
            "	vec2 gridcorner=floor(loc);",
            "	for (float dy=-1.0;dy<=1.0;dy++)",
            "		for (float dx=-1.0;dx<=1.0;dx++)",
            "		{",
            "			vec2 thiscorner=gridcorner+vec2(dx,dy);",
            "			vec2 gridshift=noise(thiscorner);",
            "			if (gridshift.x>.5) gridshift.x = .8;else gridshift.x=0.2; // pick some weird grid offsets",
            "			if (gridshift.y>.5) gridshift.y = .1;else gridshift.y=0.7; // pick some weird grid offsets",
            "			vec2 center=thiscorner+gridshift;",
            "			vec2 delta = loc - center;",
            "			float d = abs(delta.x)+abs(delta.y);",
            "			dist=min(d,dist);",
            "		}",
            "	return dist;",
            "}",
            "",
            "vec3 hsv(float h,float s,float v) {",
            "	return mix(vec3(1.),clamp((abs(fract(h+vec3(3.,2.,1.)/3.)*6.-3.)-1.),0.,1.),s)*v;",
            "}",
            "",
            "void main( void ) {",
            "	vec2 position = gl_FragCoord.xy / resolution.xy * 0.5;",//(( gl_FragCoord.xy / resolution.y )*2.0)-1.0;",

            "	// get cellular",
            "	float c=grid(position*2.0+time);",

            "	// emphasize bright and dark",
            "	c=pow(c*2.0,2.)*0.5;",

            "	//gl_FragColor = c > 0.98 ? vec4(c*.1, 0.0, 0.0, 1.0)  : vec4(c*.1);",
            "	gl_FragColor = vec4(hsv(sin(c*15.-time)*.5+.5,1.,1.),1.);",
            "}"
        ].join("\n")

    },


    // ------------------------------------------------------------------------
    plasma: {
        uniforms: {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2(1000,1000) },
        },

        vertexShader: [
            "void main() {",
            "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform float time;",
            "uniform vec2 resolution;",

            "float rand (float x) {",
            "    return fract(sin(x * 24614.63) * 36817.342 + 2000000.);	",
            "}",
            "float wave (in vec2 p, in vec2 dir, in float size) {",
            "    dir += vec2(rand(size)) - vec2(0.5);",
            "    return sin(dot(p, dir) / (size + rand(size)) + time) * (size + rand(size));		",
            "}",
            "float f(in vec2 p){",
            "    p *= 80.0;",
            "    float res = 0.0;",
            "    res += wave (p, vec2(0.0, 1.0), 8.0);",
            "    res += wave (p, vec2(-1.0, -1.0), 9.0);",
            "    res += wave (p, vec2(0.0, -1.0), 8.0);",
            "    res += wave (p, vec2(0.0, 1.0), 9.0);",
            "    res += wave (p, vec2(1.0, 0.0), 9.0);",
            "    res += wave (p, vec2(-1.0, 0.0), 3.0);",
            "    res += wave (p, vec2(-1.0, 1.0), 9.0);",
            "    res += wave (p, vec2(1.0, 1.0), 9.0);",
            "    return res * 0.1;",
            "}",
            "void main( void ) {",
            "    vec2 p = (gl_FragCoord.xy / resolution.xy );",
            "    float c = 0.1;//f(p);",
            "    gl_FragColor = vec4(c/f(p-1.), c/f(p-2.), c/f(p-3.), 0.25);",
            "}"
        ].join("\n"),

        transparent: true
    },

    //-------------------------------------------------------------------------
    glow_plasma: {
        uniforms: {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2(100,100) },
        },

        vertexShader: [
            "void main() {",
            "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform float time;",
            "uniform vec2 resolution;",
            "const float COUNT = 3.0;",
            "//MoltenMetal by CuriousChettai@gmail.com",
            "void main( void ) {  ",
            "	vec2 uPos = ( gl_FragCoord.xy / resolution.y );//normalize wrt y axis",
            "	uPos -= vec2((resolution.x/resolution.y)/2.0, 0.5);//shift origin to center",
            "	",
            "	float vertColor = 0.0;",
            "	for(float i=0.0; i<COUNT; i++){",
            "		float t = time*(i*0.1+1.)/3.0 + (i*0.1+0.1); ",
            "		uPos.y += sin(-t+uPos.x*2.0)*0.45 -t*0.3;",
            "		uPos.x += sin(-t+uPos.y*5.0)*0.25 ;",
            "		float value = (sin(uPos.y*10.0*0.5)+sin(uPos.x*10.1+t*0.3) );",
            "		",
            "		//float d=1./pow(distance(mouse,uPos),2.);",
            "		",
            "		float stripColor = 1.0/sqrt(abs(value));",
            "		",
            "		vertColor += stripColor/10.0;",
            "	}",
            "	",
            "	float temp = vertColor;	",
            "	vec3 color = vec3(temp*max(0.1,abs(sin(time*0.1))), max(0.1,temp*abs(sin(time*0.03+1.))), max(0.1,temp*abs(sin(time*0.02+3.))));	",
            "	color *= color.r+color.g+color.b;",
            "	gl_FragColor = vec4(color, 0.2);",
            "}"
        ].join("\n"),

        transparent: true

    }

};

