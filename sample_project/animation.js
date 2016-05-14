// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// very little in it - you will fill it in with all your shape drawing calls and any extra key / mouse controls.  

// Now go down to display() to see where the sample shapes are drawn, and to see where to fill in your own code.

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), 	looking = false, prev_time = 0, animate = false, animation_time = 0;
		var gouraud = false, color_normals = false, solid = false;
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( vec4( .8,.3,.8,1 ), .5, 1, 1, 40, "" ) ); }


// *******************************************************
// IMPORTANT -- In the line below, add the filenames of any new images you want to include for textures!

var texture_filenames_to_load = [ "text.png", "turtleBody.png", "turtleSide.png", "turtleSkin.png", "skin.jpeg", 
									"sky.jpg", "grass.jpg", "trunkSkin.jpg", "leafGreen.jpg", "stone.jpg", "riverBlue.jpg"];

// *******************************************************	
// When the web page's window loads it creates an "Animation" object.  It registers itself as a displayable object to our other class "GL_Context" -- which OpenGL is told to call upon every time a
// draw / keyboard / mouse event happens.

window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self) 
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );
		
		gl.clearColor( 0, 0, 0, 1 );			// Background color
		
		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );
		
		self.m_cube = new cube();
		self.m_obj = new shape_from_file( "teapot.obj" )
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 4 );	
		self.m_fan = new triangle_fan_full( 10, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_cylinder = new cylindrical_strip( 10, mat4() );
		//self.m_triangle = new triangle();
		self.m_triangle = new triangle( mat4());
		self.m_cappedCyliner = new capped_cylinder();
		self.m_squarePyramid = new squarePyramid();
		self.m_textLine = new text_line(100);
		self.m_square = new square();
		self.m_newSound = new Audio("./backgroundSound.mp3");

		// background music
		//self.music = new Audio("./backgroundSound.mp3");
		//self.music.loop = true;
		//self.music.addEventListener("loadeddata", function(){self.music.currentTime=3;});

		
		
		

		

		
		// 1st parameter is camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, 0,-40), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );

		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);
		
		self.context.render();	
	} ) ( this );	

	canvas.addEventListener('mousemove', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});

/*
	canvas.addEventListener("mousedown", ( function(self) { return function(e) { e = e || window.event; self.
	anchor = [e.clientX, e.clientY]; }; } ) (this), false );
	canvas.addEventListener("mouseup", ( function(self) { return function(e) { e = e || window.event; self.
	anchor = undefined; }; } ) (this), false );
	canvas.addEventListener("mousemove", ( function(self) { return function(e) {
	e = e || window.event; // Use whichever is non-null
	movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0); // Old flyaround camera steering
	if( !self.anchor ) return; // We're done if this isn't a mouse drag
	var dragging_vector = subtract( [e.clientX, e.clientY], self.anchor);
	if( length( dragging_vector ) > 0 )
	self.graphicsState.camera_transform = mult( self.graphicsState.camera_transform,
	rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ) );
	}; } ) (this), false ); // Arcball camera: Spin the scene around the world origin, on a tilted axis	
*/
}

// *******************************************************	
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	
	shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "f",     function() { looking = !looking; } );
	shortcut.add( ",",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;
	shortcut.add( ".",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;

	shortcut.add( "r",     ( function(self) { return function() { self.graphicsState.camera_transform = mat4(); }; } ) (this) );
	shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);	
																		gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	shortcut.add( "ALT+a", function() { animate = !animate; } );
	
	shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
	shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );		
}

function update_camera( self, animation_delta_time )
	{
		var leeway = 70, border = 50;
		var degrees_per_frame = .0002 * animation_delta_time;
		var meters_per_frame  = .01 * animation_delta_time;
																					// Determine camera rotation movement first
		var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
		var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
		var outside_border = false;
		
		for( var i = 0; i < 2; i++ )
			if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

		for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

Animation.prototype.draw_half_sphere_one_colume = function(self, model_transform)
{
	var turtleBody = new Material( vec4(.81, .65, .43, 1), .1, .4, .2, 20, "turtleBody.png");
	var stack = [];

	for(var i = 0; i < 8; i++)
	{
		model_transform = mult(model_transform, rotation(20, 0, 0, 1));
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(0, -4, 0));
		model_transform = mult(model_transform, rotation(45, 0, 1, 0));
		self.m_squarePyramid.draw(self.graphicsState, model_transform, turtleBody);
		model_transform = stack.pop();
	}
}

Animation.prototype.draw_half_sphere = function(self, model_transform)
{
	model_transform = mult(model_transform, rotation(90, 0, 0, 1));
	model_transform = mult(model_transform, translation(4, 0, 0));
	for(var i = 0; i < 9; i++)
	{
		model_transform = mult(model_transform, rotation(20, 1, 0, 0));
		self.draw_half_sphere_one_colume(self, model_transform);
	}
}

Animation.prototype.draw_leg = function(self, model)
{
	var purplePlastic = new Material( vec4( .9,.5,.9,1 ), .2, .5, .8, 40 ), 
		greyPlastic = new Material( vec4( .5,.5,.5,1 ), .2, .8, .5, 20 ), 
		turtleSkin = new Material( vec4(.36, .9, .16, 1), .1, .4, .05, 100,"skin.jpeg");

	var stack = [];

	stack.push(model);
	model = mult(model, rotation(-90, 1, 0, 0));
	model = mult(model, scale(1, 1, 2));
	self.m_cylinder.draw(self.graphicsState, model, turtleSkin);
	model = stack.pop();

	stack.push(model);
	model = mult(model, translation(0, -2, 0));
	model = mult(model, scale(1.5, 1.5, 1.5));
	self.m_sphere.draw(self.graphicsState, model, turtleSkin);
	model = stack.pop();
}

Animation.prototype.draw_left_eye = function(self, model_transform, emotion)
{
	var white = new Material(vec4(1, 1, 1, 1), .5, .5, 1, 20),
		black = new Material(vec4(0, .1, 0, 1), .5, .5, 1, 20),
		turtleSkin = new Material( vec4(.36, .9, .16, 1), .1, .4, .05, 100,"skin.jpeg");

	var stack = [];
	stack.push(model_transform);
	model_transform = mult(model_transform, scale(1, 1, 1));
	self.m_sphere.draw(self.graphicsState, model_transform, white);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 0, .6));
	model_transform = mult(model_transform, scale(.5, .5, .5));
	self.m_sphere.draw(self.graphicsState, model_transform, black);
	model_transform = stack.pop();

	if(emotion == "sad" || emotion == "astonish")
	{
		stack.push(model_transform);
		model_transform = mult(model_transform, rotation(-20, 0, 0, 1));
		model_transform = mult(model_transform, translation(0, .8, 0));
		model_transform = mult(model_transform, scale(1, .3, .6));
		self.m_sphere.draw(self.graphicsState, model_transform, turtleSkin);
		model_transform = stack.pop();
	}
	else 
	{
		stack.push(model_transform);
		model_transform = mult(model_transform, rotation(-5, 0, 0, 1));
		model_transform = mult(model_transform, translation(0, .8, 0));
		model_transform = mult(model_transform, scale(1, .3, .6));
		self.m_sphere.draw(self.graphicsState, model_transform, turtleSkin);
		model_transform = stack.pop();
	}
}

Animation.prototype.draw_right_eye = function(self, model_transform, emotion)
{
	var white = new Material(vec4(1, 1, 1, 1), .5, .5, 1, 20),
		black = new Material(vec4(0, .1, 0, 1), .5, .5, 1, 20),
		turtleSkin = new Material( vec4(.36, .9, .16, 1), .1, .4, .05, 100,"skin.jpeg");

	var stack = [];
	stack.push(model_transform);
	model_transform = mult(model_transform, scale(1, 1, 1));
	self.m_sphere.draw(self.graphicsState, model_transform, white);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 0, .6));
	model_transform = mult(model_transform, scale(.5, .5, .5));
	self.m_sphere.draw(self.graphicsState, model_transform, black);
	model_transform = stack.pop();

	if(emotion == "sad" || emotion == "astonish")
	{
		stack.push(model_transform);
		model_transform = mult(model_transform, rotation(20, 0, 0, 1));
		model_transform = mult(model_transform, translation(0, .8, 0));
		model_transform = mult(model_transform, scale(1, .3, .6));
		self.m_sphere.draw(self.graphicsState, model_transform, turtleSkin);
		model_transform = stack.pop();
	}
	else
	{
		stack.push(model_transform);
		model_transform = mult(model_transform, rotation(5, 0, 0, 1));
		model_transform = mult(model_transform, translation(0, .8, 0));
		model_transform = mult(model_transform, scale(1, .3, .6));
		self.m_sphere.draw(self.graphicsState, model_transform, turtleSkin);
		model_transform = stack.pop();
	}
}

Animation.prototype.draw_mouth_base = function(self, model_transform)
{
	var red = new Material(vec4(1, 0, 0, 1), .5, .2, 1, 20);
	model_transform = mult(model_transform, rotation(45, 0, 1, 0));
	model_transform = mult(model_transform, scale(.2, .2, .2));
	self.m_square.draw(self.graphicsState, model_transform, red);
}

Animation.prototype.draw_smail_mouth = function(self, model_transform)
{
	var stack = [];

	model_transform = mult(model_transform, rotation(-90, 0, 1, 0));
	model_transform = mult(model_transform, rotation(90, 1, 0, 0));
	
	stack.push(model_transform);
	self.draw_mouth_base(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	for(var i = 0; i < 3; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, -.5));
		model_transform = mult(model_transform, rotation(15, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, .5));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

	stack.push(model_transform);
	for(var i = 0; i < 3; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, -.5));
		model_transform = mult(model_transform, rotation(-15, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, .5));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();
}

Animation.prototype.draw_sad_mouth = function(self, model_transform)
{
	var stack = [];

	model_transform = mult(model_transform, rotation(-90, 0, 1, 0));
	model_transform = mult(model_transform, rotation(90, 1, 0, 0));
	
	stack.push(model_transform);
	self.draw_mouth_base(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	for(var i = 0; i < 4; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, .5));
		model_transform = mult(model_transform, rotation(15, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, -.5));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

	stack.push(model_transform);
	for(var i = 0; i < 4; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, .5));
		model_transform = mult(model_transform, rotation(-15, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, -.5));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

}

Animation.prototype.draw_astonish_mouth = function(self, model_transform)
{
	var stack = [];

	model_transform = mult(model_transform, rotation(-90, 0, 1, 0));
	model_transform = mult(model_transform, rotation(90, 1, 0, 0));
	
	stack.push(model_transform);
	self.draw_mouth_base(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	for(var i = 0; i < 11; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, .5));
		model_transform = mult(model_transform, rotation(15, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, -.5));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

	stack.push(model_transform);
	for(var i = 0; i < 12; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, .5));
		model_transform = mult(model_transform, rotation(-15, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, -.5));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

}

Animation.prototype.draw_happy_mouth = function(self, model_transform)
{
	var stack = [];

	model_transform = mult(model_transform, rotation(-90, 0, 1, 0));
	model_transform = mult(model_transform, rotation(90, 1, 0, 0));
	
	stack.push(model_transform);
	self.draw_mouth_base(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	for(var i = 0; i < 5; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, -.5));
		model_transform = mult(model_transform, rotation(15, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, .5));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

	stack.push(model_transform);
	for(var i = 0; i < 5; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, -.5));
		model_transform = mult(model_transform, rotation(-15, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, .5));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 0, -.1));
	for(var i = 0; i < 4; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, -.4));
		model_transform = mult(model_transform, rotation(20, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, .4));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 0, -.1));
	for(var i = 0; i < 4; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, -.4));
		model_transform = mult(model_transform, rotation(-20, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, .4));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 0, -.13));
	for(var i = 0; i < 3; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, -.3));
		model_transform = mult(model_transform, rotation(30, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, .3));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 0, -.13));
	for(var i = 0; i < 3; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, -.3));
		model_transform = mult(model_transform, rotation(-30, 0, 1, 0));
		model_transform = mult(model_transform, translation(0, 0, .3));
		self.draw_mouth_base(self, model_transform);
	}
	model_transform = stack.pop();

	model_transform = mult(model_transform, translation(0.1, 0, -0.4));
	self.draw_mouth_base(self, model_transform);
	model_transform = mult(model_transform, translation(-0.2, 0, 0));
	self.draw_mouth_base(self, model_transform);
}

Animation.prototype.draw_head = function(self, model, emotion)
{
	var greyPlastic = new Material( vec4( .5,.5,.5,1 ), .2, .8, .5, 20 ), 
		turtleSkin = new Material( vec4(.36, .9, .16, 1), .1, .4, .05, 100,"skin.jpeg");

	var stack = [];

	stack.push(model);
	model = mult(model, scale(3, 3, 3));
	self.m_sphere.draw(self.graphicsState, model, turtleSkin);
	model = stack.pop();

	// left eye
	stack.push(model);
	model = mult(model, rotation(-70, 0, 1, 0));
	model = mult(model, translation(0, 0, 2.5));
	model = mult(model, rotation(-5, 0, 1, 0));
	self.draw_left_eye(self, model, emotion);
	model = stack.pop();

	// right eye
	stack.push(model);
	model = mult(model, rotation(70, 0, 1, 0));
	model = mult(model, translation(0, 0, -2.5));
	model = mult(model, rotation(180, 0, 1, 0));
	model = mult(model, rotation(5, 0, 1, 0));
	self.draw_right_eye(self, model, emotion);
	model = stack.pop();

	// mouth
	if(emotion == "sad")
	{
		stack.push(model);
		model = mult(model, rotation(30, 0, 0, 1));
		model = mult(model, translation(-3, 0, 0));
		self.draw_sad_mouth(self, model);
		model = stack.pop();
	}
	else if(emotion == "happy")
	{
		stack.push(model);
		model = mult(model, rotation(40, 0, 0, 1));
		model = mult(model, translation(-3, 0, 0));
		//model = mult(model, scale(1.5, 1.5, 1.5));
		model = mult(model, scale(1, 1, .5));
		self.draw_happy_mouth(self, model);
		model = stack.pop();
	}
	else if(emotion == "astonish")
	{
		stack.push(model);
		model = mult(model, rotation(30, 0, 0, 1));
		model = mult(model, translation(-3, 0, 0));
		self.draw_astonish_mouth(self, model);
		model = stack.pop();
	}
	else
	{
		stack.push(model);
		model = mult(model, rotation(40, 0, 0, 1));
		model = mult(model, translation(-3, 0, 0));
		self.draw_smail_mouth(self, model);
		model = stack.pop();
	}
}

Animation.prototype.draw_neck = function(self, model)
{
	var purplePlastic = new Material( vec4( .9,.5,.9,1 ), .2, .5, .8, 40 ), 
		turtleSkin = new Material( vec4(.36, .9, .16, 1), .1, .4, .05, 100,"skin.jpeg");

	model = mult(model, scale(1.5, 1.5, 2));
	self.m_cylinder.draw(self.graphicsState, model, turtleSkin);
}

Animation.prototype.draw_turtle_flip = function(self, model_transform, time, emotion)
{
	var turtleBody = new Material( vec4(.81, .65, .43, 1), .1, .4, .2, 20, "turtleBody.png"), 
		turtleSide = new Material( vec4(.36, .1, .08, 1), .1, .4, .2, 20, "turtleSide.png"), 
		turtleSkin = new Material( vec4(.36, .9, .16, 1), .1, .4, .05, 100,"skin.jpeg");

	var stack = [];

	// body (custom half sphere)
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, -9, 0));
	model_transform = mult(model_transform, scale(1.9, 1.9, 1.4));
	self.draw_half_sphere(self, model_transform);
	model_transform = stack.pop();

	// body side
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, -1, 0));
	model_transform = mult(model_transform, scale(9, 3, 54/8));
	self.m_sphere.draw(self.graphicsState, model_transform, turtleSide);
	model_transform = stack.pop();

	// tail
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(8.5, -1, 0));
	model_transform = mult(model_transform, rotation(-90, 0, 0, 1));
	model_transform = mult(model_transform, rotation(10*Math.sin(self.graphicsState.animation_time / 500), 0, 0, 1));
	model_transform = mult(model_transform, scale(0.8, 2.5, 0.8));
	self.m_squarePyramid.draw(self.graphicsState, model_transform, turtleSkin);
	model_transform = stack.pop();

	// head + neck
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-9.5, 5, 0));
	model_transform = mult(model_transform, translation(3, -5, 0));
	model_transform = mult(model_transform, rotation(10 * Math.sin(time / 200), 0, 0, 1));
	model_transform = mult(model_transform, rotation(60, 0, 0, 1));
	model_transform = mult(model_transform, translation(-3, 5, 0));

	// head
	stack.push(model_transform);
	self.draw_head(self, model_transform, emotion);
	model_transform = stack.pop();

	// neck 
	var upperNeck_x = 1.5, upperNeck_y = -2.5, upperNeck_z = 0;

	// upper neck 
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(upperNeck_x, upperNeck_y, upperNeck_z));
	model_transform = mult(model_transform, rotation(35, 0, 0, 1));
	model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
	self.draw_neck(self, model_transform);
	model_transform = stack.pop();

	// lower neck
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(upperNeck_x+1, upperNeck_y-1.2, upperNeck_z));
	model_transform = mult(model_transform, rotation(45, 0, 0, 1));
	model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
	self.draw_neck(self, model_transform);
	model_transform = stack.pop();
	model_transform = stack.pop(); // head + neck end here

	// legs
	var legAngle1 = 20, legAngle2 = 45;
	var legX = 5, legY = 3, legZ = 4;

	// leg - left closer
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-legX, -legY, legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(-legAngle1, 1, 0, 1));
	model_transform = mult(model_transform, translation(0, 2, 0));
	model_transform = mult(model_transform, rotation(10 * Math.sin(time / 100), 1, 1, 1));
	model_transform = mult(model_transform, translation(0, -2, 0));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();

	// leg - left further
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-legX, -legY, -legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(-legAngle1, 1, 0, 1));
	model_transform = mult(model_transform, translation(0, 2, 0));
	model_transform = mult(model_transform, rotation(-10 * Math.cos(time / 100), 1, 1, 1));
	model_transform = mult(model_transform, translation(0, -2, 0));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();

	// leg - right closer
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(legX, -legY, legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(legAngle1, 1, 0, 1));
	model_transform = mult(model_transform, translation(0, 2, 0));
	model_transform = mult(model_transform, rotation(10 * Math.cos(time / 100), 1, 1, 1));
	model_transform = mult(model_transform, translation(0, -2, 0));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();

	// leg - right further 
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(legX, -legY, -legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(legAngle1, 1, 0, 1));
	model_transform = mult(model_transform, translation(0, 2, 0));
	model_transform = mult(model_transform, rotation(-10 * Math.sin(time / 100), 1, 1, 1));
	model_transform = mult(model_transform, translation(0, -2, 0));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();
}

Animation.prototype.draw_turtle_normal = function(self, model_transform, time, emotion, speed)
{
	var turtleBody = new Material( vec4(.81, .65, .43, 1), .1, .4, .2, 20, "turtleBody.png"), 
		turtleSide = new Material( vec4(.36, .1, .08, 1), .1, .4, .2, 20, "turtleSide.png"), 
		turtleSkin = new Material( vec4(.36, .9, .16, 1), .1, .4, .05, 100,"skin.jpeg");

	var stack = [];
	var motionSpeed = 500;

	// body (custom half sphere)
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, -9, 0));
	model_transform = mult(model_transform, scale(1.9, 1.9, 1.4));
	self.draw_half_sphere(self, model_transform);
	model_transform = stack.pop();

	// body side
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, -1, 0));
	model_transform = mult(model_transform, scale(9, 3, 54/8));
	self.m_sphere.draw(self.graphicsState, model_transform, turtleSide);
	model_transform = stack.pop();

	// tail
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(8.5, -1, 0));
	model_transform = mult(model_transform, rotation(-90, 0, 0, 1));
	model_transform = mult(model_transform, rotation(10*Math.sin(self.graphicsState.animation_time / 500), 0, 0, 1));
	model_transform = mult(model_transform, scale(0.8, 2.5, 0.8));
	self.m_squarePyramid.draw(self.graphicsState, model_transform, turtleSkin);
	model_transform = stack.pop();

	// head + neck
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-9.5, 5, 0));
	model_transform = mult(model_transform, translation(3, -5, 0));
	model_transform = mult(model_transform, rotation(5 * Math.sin(time / motionSpeed), 0, 0, 1));
	model_transform = mult(model_transform, translation(-3, 5, 0));

	// head
	stack.push(model_transform);
	self.draw_head(self, model_transform, emotion);
	model_transform = stack.pop();

	// neck 
	var upperNeck_x = 1.5, upperNeck_y = -2.5, upperNeck_z = 0;

	// upper neck 
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(upperNeck_x, upperNeck_y, upperNeck_z));
	model_transform = mult(model_transform, rotation(35, 0, 0, 1));
	model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
	self.draw_neck(self, model_transform);
	model_transform = stack.pop();

	// lower neck
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(upperNeck_x+1, upperNeck_y-1.2, upperNeck_z));
	model_transform = mult(model_transform, rotation(45, 0, 0, 1));
	model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
	self.draw_neck(self, model_transform);
	model_transform = stack.pop();
	model_transform = stack.pop(); // head + neck end here

	// legs
	var legAngle1 = 20, legAngle2 = 45;
	var legX = 5, legY = 3, legZ = 4;

	// leg - left closer
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-legX, -legY, legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(-legAngle1, 1, 0, 1));
	model_transform = mult(model_transform, translation(0, 2, 0));
	model_transform = mult(model_transform, rotation(10 * Math.sin(time / speed), 1, 1, 1));
	model_transform = mult(model_transform, translation(0, -2, 0));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();

	// leg - left further
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-legX, -legY, -legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(-legAngle1, 1, 0, 1));
	model_transform = mult(model_transform, translation(0, 2, 0));
	model_transform = mult(model_transform, rotation(-10 * Math.cos(time / speed), 1, 1, 1));
	model_transform = mult(model_transform, translation(0, -2, 0));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();

	// leg - right closer
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(legX, -legY, legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(legAngle1, 1, 0, 1));
	model_transform = mult(model_transform, translation(0, 2, 0));
	model_transform = mult(model_transform, rotation(10 * Math.cos(time / speed), 1, 1, 1));
	model_transform = mult(model_transform, translation(0, -2, 0));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();

	// leg - right further 
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(legX, -legY, -legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(legAngle1, 1, 0, 1));
	model_transform = mult(model_transform, translation(0, 2, 0));
	model_transform = mult(model_transform, rotation(-10 * Math.sin(time / speed), 1, 1, 1));
	model_transform = mult(model_transform, translation(0, -2, 0));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();
}

Animation.prototype.draw_turtle_normal_helpping = function(self, model_transform, time, emotion)
{
	var turtleBody = new Material( vec4(.81, .65, .43, 1), .1, .4, .2, 20, "turtleBody.png"), 
		turtleSide = new Material( vec4(.36, .1, .08, 1), .1, .4, .2, 20, "turtleSide.png"), 
		turtleSkin = new Material( vec4(.36, .9, .16, 1), .1, .4, .05, 100,"skin.jpeg");

	var stack = [];
	var motionSpeed = 500;

	// body (custom half sphere)
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, -9, 0));
	model_transform = mult(model_transform, scale(1.9, 1.9, 1.4));
	self.draw_half_sphere(self, model_transform);
	model_transform = stack.pop();

	// body side
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, -1, 0));
	model_transform = mult(model_transform, scale(9, 3, 54/8));
	self.m_sphere.draw(self.graphicsState, model_transform, turtleSide);
	model_transform = stack.pop();

	// tail
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(8.5, -1, 0));
	model_transform = mult(model_transform, rotation(-90, 0, 0, 1));
	model_transform = mult(model_transform, rotation(10*Math.sin(self.graphicsState.animation_time / 500), 0, 0, 1));
	model_transform = mult(model_transform, scale(0.8, 2.5, 0.8));
	self.m_squarePyramid.draw(self.graphicsState, model_transform, turtleSkin);
	model_transform = stack.pop();

	// head + neck
	if(time < 14000) {
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-9, 5, 0));
		model_transform = mult(model_transform, translation(3, -5, 0));
		model_transform = mult(model_transform, rotation(10 * Math.cos(time / motionSpeed), 0, 0, 1));
		model_transform = mult(model_transform, rotation(70, 0, 0, 1));
		model_transform = mult(model_transform, translation(-3, 5, 0));
	}
	else 
	{
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-9, 5, 0));
		model_transform = mult(model_transform, translation(3, -5, 0));
		model_transform = mult(model_transform, rotation(20 * Math.sin(time / motionSpeed * 0.5), 0, 0, 1));
		model_transform = mult(model_transform, rotation(40, 0, 0, 1));
		model_transform = mult(model_transform, translation(-3, 5, 0));
	}

	// head
	stack.push(model_transform);
	self.draw_head(self, model_transform, emotion);
	model_transform = stack.pop();

	// neck 
	var upperNeck_x = 1.5, upperNeck_y = -2.5, upperNeck_z = 0;

	// upper neck 
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(upperNeck_x, upperNeck_y, upperNeck_z));
	model_transform = mult(model_transform, rotation(35, 0, 0, 1));
	model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
	self.draw_neck(self, model_transform);
	model_transform = stack.pop();

	// lower neck
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(upperNeck_x+1, upperNeck_y-1.2, upperNeck_z));
	model_transform = mult(model_transform, rotation(45, 0, 0, 1));
	model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
	self.draw_neck(self, model_transform);
	model_transform = stack.pop();
	model_transform = stack.pop(); // head + neck end here


	// legs
	var legAngle1 = 20, legAngle2 = 45;
	var legX = 5, legY = 3, legZ = 4;

	// leg - left closer
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-legX, -legY, legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(-legAngle1, 1, 0, 1));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();

	// leg - left further
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-legX, -legY, -legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(-legAngle1, 1, 0, 1));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();

	// leg - right closer
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(legX, -legY, legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(legAngle1, 1, 0, 1));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();

	// leg - right further 
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(legX, -legY, -legZ));
	model_transform = mult(model_transform, rotation(-legAngle2, 0, 1, 0));
	model_transform = mult(model_transform, rotation(legAngle1, 1, 0, 1));
	self.draw_leg(self, model_transform);
	model_transform = stack.pop();
}

// Generate one part of a curve. Returns an array of two points - a line segment of a curve. Repeatedly call this and increase the "segment" number to get the full
// curve. To specify the curve's location, supply endpoints a and b and tangents da and db. Adjust num_segments to increase / decrease granularity.
/*var curveSegment = function( a, b, da, db, segment, num_segments )
{
	var t = segment / num_segments, t_next = (segment+1) / num_segments,
	curveMatrix = [ b, a, db, da ];
	curveMatrix.matrix = true;
	var hermiteMatrix = mat4( -2, 3, 0, 0 , 2, -3, 0, 1, 1, -1, 0, 0, 1, -2, 1, 0 ),
		point1 = mult_vec( mult( transpose( curveMatrix ), hermiteMatrix ), vec4( t*t*t, t*t, t, 1 ) ), //Applying the hermite polynomial at time t to generate a point
		point2 = mult_vec( mult( transpose( curveMatrix ), hermiteMatrix ), vec4( t_next*t_next*t_next, t_next*t_next, t_next, 1 ) ); //Applying the hermite polynomial at time t_next to generate a point
	return [ point1, point2 ];
}

var canoe = function( self, model_transform, material ) // Calls the cube draw function a bunch of times in the shape of a canoe
{
	var canoeFront = vec4(0,0, 0,1), canoeBack = vec4(0,0,-15,1),
		leftFrontTangent = vec4(15,0,0,0), leftBackTangent = vec4(-15,0,0,0),
		rightFrontTangent = vec4(-15,0,0,0), rightBackTangent = vec4( 15,0,0,0);

	self.m_sphere.draw( self.graphicsState, mult( model_transform, translation( vec3(canoeFront) ) ), material, 2 );
	self.m_sphere.draw( self.graphicsState, mult( model_transform, translation( vec3(canoeBack) ) ), material, 2 );
	var num_ribs = 15;
	for( var i = 1; i < num_ribs; i++ )
	{
		var left_segment = curveSegment( canoeFront, canoeBack, leftFrontTangent, leftBackTangent, i, num_ribs );
		var right_segment = curveSegment( canoeFront, canoeBack, rightFrontTangent, rightBackTangent, i, num_ribs );
		var num_segments = 10; // Number of cubes per rib
		for( var j = 0; j < num_segments; j++ )
		{
			var interpolated_segment = curveSegment( left_segment[0], right_segment[0], [0, -15, 0, 0], [0, 15, 0, 0], j, num_segments);
			var M = inverse( lookAt( vec3( interpolated_segment[0] ), vec3( interpolated_segment[1] ), vec3(0,1,0) ) );
			self.m_triangle.draw( self.graphicsState, mult( model_transform, mult( M, scale( 1.2, .1, 1.2 ) ) ), material );
		}
	}
}*/

Animation.prototype.groundBase = function(self, model_transform)
{
	var grass = new Material( vec4(0, .56, .1, 1), .5, .5, 1, 20, "grass.jpg");
	model_transform = mult(model_transform, scale(10, 10, 10));
	self.m_square.draw(self.graphicsState, model_transform, grass);
}

Animation.prototype.draw_ground_alongX = function(self, model_transform) 
{
	var length = 10;
	
	self.groundBase(self, model_transform);

	for(var i=0; i < length; i++)
	{
		model_transform = mult(model_transform, translation(20, 0, 0));
		self.groundBase(self, model_transform);
	}
}

Animation.prototype.draw_ground_alongZ = function(self, model_transform)
{
	var length = 10;
	self.draw_ground_alongX(self, model_transform);
	for(var i=0; i < length; i++)
	{
		model_transform = mult(model_transform, translation(0, 0, 20));
		self.draw_ground_alongX(self, model_transform);
	}

}

Animation.prototype.draw_ground = function(self, model_transform)
{
	self.draw_ground_alongZ(self, model_transform);
	model_transform = mult(model_transform, translation(10, 0, 10));
	self.draw_ground_alongZ(self, model_transform);

}

Animation.prototype.draw_trunk_base = function(self, model_transform)
{
	var trunkSkin = new Material(vec4(.76, .545, .35, 1), .5, .2, 1, 20, "trunkSkin.jpg");
	model_transform = mult(model_transform, rotation(90, 1, 0, 0));
	model_transform = mult(model_transform, scale(2, 2, 5));
	self.m_cylinder.draw(self.graphicsState, model_transform, trunkSkin);

}

Animation.prototype.draw_branch = function(self, model_transform)
{
	var trunkSkin = new Material(vec4(.76, .545, .35, 1), .5, .2, 1, 20, "trunkSkin.jpg");
	var stack = [];

	model_transform = mult(model_transform, rotation(30, 0, 0, 1));
	stack.push(model_transform);
	model_transform = mult(model_transform, scale(1, 5, 1));
	this.m_squarePyramid.draw(self.graphicsState, model_transform, trunkSkin);
	model_transform = stack.pop();
}

Animation.prototype.draw_trunk = function(self, model_transform)
{
	var trunkSkin = new Material(vec4(.76, .545, .35, 1), .5, .2, 1, 20, "trunkSkin.jpg");
	var stack = [];

	stack.push(model_transform);
	model_transform = mult(model_transform, scale(2.5, 20, 2.5));
	this.m_squarePyramid.draw(self.graphicsState, model_transform, trunkSkin);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 10, 0));
	this.draw_branch(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 10, 0));
	model_transform = mult(model_transform, rotation(190, 0, 1, 0));
	model_transform = mult(model_transform, scale(1, 2, 1));
	this.draw_branch(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 15, 0));
	model_transform = mult(model_transform, rotation(100, 0, 1, 0));
	model_transform = mult(model_transform, scale(.4, .6, .4));
	this.draw_branch(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 8, 0));
	model_transform = mult(model_transform, rotation(100, 0, 1, 0));
	model_transform = mult(model_transform, scale(1, 2, 1));
	this.draw_branch(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 13, 0));
	model_transform = mult(model_transform, rotation(-90, 0, 1, 0));
	model_transform = mult(model_transform, scale(.8, .8, .8));
	this.draw_branch(self, model_transform);
	model_transform = stack.pop();
}

Animation.prototype.draw_leaf = function(self, model_transform, color)
{
	var leafGreen = new Material(color, .5, .2, 1, 20, "leafGreen.jpg");

	model_transform = mult(model_transform, scale(1, 2, 1));
	model_transform = mult(model_transform, rotation(45, 0, 0, 1));

	self.m_triangle.draw(self.graphicsState, model_transform, leafGreen);
	model_transform = mult(model_transform, translation(1, 1, 0));
	model_transform = mult(model_transform, rotation(180, 0, 0, 1));
	self.m_triangle.draw(self.graphicsState, model_transform, leafGreen);
}

Animation.prototype.draw_leaves = function(self, model_transform, color)
{
	var lightGreen = vec4(.6, 1, .36, 1),
		darkGreen = vec4(.26, .6, .07);
	var stack = [];

	//model_transform = mult(model_transform, translation(0, 5, 10));
	stack.push(model_transform);

	self.draw_leaf(self, model_transform, lightGreen); 
	
	model_transform = mult(model_transform, rotation(90, 0, 0, 1));
	self.draw_leaf(self, model_transform, lightGreen); 

	model_transform = mult(model_transform, rotation(-180, 0, 0, 1));
	self.draw_leaf(self, model_transform, lightGreen); 
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, rotation(-30, 0, 0, 1));
	for(var i = 0; i < 5; i ++)
	{
		model_transform = mult(model_transform, rotation(36, 1, 0, 0));
		self.draw_leaf(self, model_transform, lightGreen); 
	}
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 1, 0));
	model_transform = mult(model_transform, rotation(45, 0, 0, 1));
	for(var i = 0; i < 4; i ++)
	{
		model_transform = mult(model_transform, rotation(60, 1, 0, 0));
		self.draw_leaf(self, model_transform, darkGreen); 
	}
	model_transform = stack.pop();
}

Animation.prototype.draw_tree = function(self, model_transform)
{
	var stack = [];

	// trunk
	self.draw_trunk(self, model_transform);

	// leaves
	model_transform = mult(model_transform, translation(0, 15, 0));

	stack.push(model_transform);
	self.draw_leaves(self, model_transform);

	model_transform = mult(model_transform, translation(0, 3, 0));
	self.draw_leaves(self, model_transform);

	model_transform = mult(model_transform, translation(3, -3, 0));
	self.draw_leaves(self, model_transform);

	model_transform = mult(model_transform, translation(-3, 0, 3));
	self.draw_leaves(self, model_transform);

	model_transform = mult(model_transform, translation(3, -2, -3));
	self.draw_leaves(self, model_transform);

	model_transform = mult(model_transform, translation(-3, 2, 3));
	self.draw_leaves(self, model_transform);

	model_transform = mult(model_transform, translation(0, 0, -6));
	self.draw_leaves(self, model_transform);

	model_transform = mult(model_transform, translation(-3, 0, 6));
	self.draw_leaves(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-1, -3, -2));
	self.draw_leaves(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(1, -3, 3));
	self.draw_leaves(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 5, 0));
	self.draw_leaves(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-2, 3, -2));
	self.draw_leaves(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(2, 3, 2));
	self.draw_leaves(self, model_transform);
	model_transform = stack.pop();
}

Animation.prototype.draw_stone = function(self, model_transform)
{
	var stone = new Material(vec4(.2, .2, .2, 1), .5, .2, .2, 20, "stone.jpg");
	var stack = [];

	model_transform = mult(model_transform, scale(2, 1.5, 1.8));
	self.m_sphere.draw(self.graphicsState, model_transform, stone);

	model_transform = mult(model_transform, translation(2, 0, .6));
	model_transform = mult(model_transform, scale(1.3, 1.3, 1.8));
	self.m_sphere.draw(self.graphicsState, model_transform, stone);
}

Animation.prototype.draw_river_base = function(self, model_transform)
{
	var riverBlue = new Material(vec4(.2, .5, 1, 1), .5, .2, 1, 20, "riverBlue.jpg");
	model_transform = mult(model_transform, rotation(45, 0, 1, 0));
	self.m_square.draw(self.graphicsState, model_transform, riverBlue);
}

Animation.prototype.draw_river = function(self, model_transform)
{
	var stack = [];

	for(var i = 0; i < 5; i++)
	{
		model_transform = mult(model_transform, rotation(20, 0, 1, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(0, 0, -3));
		self.draw_river_base(self, model_transform);
		model_transform = stack.pop();
	}

	model_transform = mult(model_transform, translation(6, 0, 1));
	for(var i = 0; i < 5; i++)
	{
		model_transform = mult(model_transform, rotation(-20, 0, 1, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(0, 0, 3));
		self.draw_river_base(self, model_transform);
		model_transform = stack.pop();
	}
}

Animation.prototype.draw_grass_baseElement = function(self, model_transform)
{
	var green = new Material(vec4(.24, .85, .08, 1), .5, .2, .6, 40);
	model_transform = mult(model_transform, scale(1, 3, 1));
	self.m_squarePyramid.draw(self.graphicsState, model_transform, green);
}

Animation.prototype.draw_grass_base = function(self, model_transform)
{
	self.draw_grass_baseElement(self, model_transform);

	for(var i = 0; i < 10; i++)
	{
		model_transform = mult(model_transform, translation(0, .5, 0));
		model_transform = mult(model_transform, translation(3, 0, 0));
		model_transform = mult(model_transform, rotation(-5, 0, 0, 1));
		model_transform = mult(model_transform, translation(-3, 0, 0));
		model_transform = mult(model_transform, scale(.95, .95, .95));
		self.draw_grass_baseElement(self, model_transform);
	}
}

Animation.prototype.draw_grass = function(self, model_transform)
{
	var stack = [];

	model_transform = mult(model_transform, scale(.5, .5, .5));
	stack.push(model_transform);
	for(var i = 0; i < 3; i++)
	{
		model_transform = mult(model_transform, rotation(120, 0, 1, 0));
		model_transform = mult(model_transform, translation(1, 0, 0))
		self.draw_grass_base(self, model_transform);
	}
	stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, scale(1, 1.5, 1));
	self.draw_grass_base(self, model_transform);
	stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, rotation(150, 0, 1, 0));
	model_transform = mult(model_transform, scale(1, 1.2, 1));
	self.draw_grass_base(self, model_transform);
	stack.pop();
	
}

Animation.prototype.draw_pink_base = function(self, model_transform)
{
	var pink = new Material(vec4(1, .57, .54, 1), .5, .4, .2, 40);

	model_transform = mult(model_transform, scale(.5, 1, .5));
	self.m_sphere.draw(self.graphicsState, model_transform, pink);
}

Animation.prototype.draw_flower = function(self, model_transform)
{
	var white = new Material(vec4(1, 1, 1, 1), .5, .4, .2, 40);

	var stack = [];
	stack.push(model_transform);
	model_transform = mult(model_transform, rotation(30, 0, 0, 1));
	self.draw_pink_base(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, 0, .5))
	model_transform = mult(model_transform, scale(.3, .3, .3));
	self.m_sphere.draw(self.graphicsState, model_transform, white);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, rotation(-30, 0, 0, 1));
	self.draw_pink_base(self, model_transform);
	model_transform = stack.pop();

	stack.push(model_transform);
	model_transform = mult(model_transform, rotation(-90, 0, 0, 1));
	self.draw_pink_base(self, model_transform);
	model_transform = stack.pop();
}

// *******************************************************	
// display(): called once per frame, whenever OpenGL decides it's time to redraw.

Animation.prototype.display = function(time)
	{
		
		if(!time) time = 0;
		this.animation_delta_time = time - prev_time;
		if(animate) this.graphicsState.animation_time += this.animation_delta_time;
		prev_time = time;
		
		update_camera( this, this.animation_delta_time );
			
		this.basis_id = 0;
		
		var model_transform = mat4();
		
		

		// Materials: Declare new ones as needed in every function.
		// 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
		// Omit the final (string) parameter if you want no texture
		
		var	sky = new Material( vec4(.5, .8, 1, 1), .5, .5, 1, 20, "sky.jpg" );
			
		/**********************************
		Start coding here!!!!
		**********************************/


	/*
		model_transform = mult( model_transform, translation( -75, -30, -130 ) );

		if( !this.pathPoint ) this.pathPoint = vec3();
		if( !this.prev_positions) this.prev_positions = [];

		var seconds = this.graphicsState.animation_time/1000;
		var pathPoint = vec3();

		for( var axis = 0; axis < 3; axis++ ) // An attempt to generate points from a space-filling Morton Curve - Google those?
			for( var j = 0; j < 6; j++ )
				if( (Math.floor( Math.floor(seconds)/Math.pow(2,axis) ) >> (2*j)) % 2 )
					pathPoint[axis] += Math.pow(2, j);

		if( ! equal( pathPoint, this.pathPoint ) ) // Is this a new curve? (Is our time in a new second?)
		{
			this.prev_pathPoint = this.pathPoint;
			this.pathPoint = pathPoint;
		}
		if( this.prev_pathPoint )
		{
			var num_segments = 20;
			var points = [ vec4( scale_vec( 10, this.prev_pathPoint) ), vec4( scale_vec( 10, pathPoint) ) ], // Build parameters of current curve using pathPoint
			tangents = [ vec4(20,0,0,0), vec4(20,0,0,0) ],
			// // Use the fraction of a second we're at to progress along the current curve
			segment = curveSegment( points[0], points[1], tangents[0], tangents[1], ( seconds - Math.floor(seconds) ) * num_segments, num_segments ) // Curve's most recent path segment
			var transform = inverse( lookAt( vec3( segment[0] ), vec3( segment[1] ), vec3( segment[0] ) ) ); // Align the canoe with the path by looking towards segment[1]
			canoe( this, mult( model_transform, transform ), new Material( vec4( 1,.7,.3,1 ), .2, 1, 1, 20 ) ); // Draw the canoe
			this.prev_positions.unshift( segment[0] ); // Insert a record that we've been here
		}

		for( var i = 0; i < this.prev_positions.length-1; i++ )
		{ // Align each box with the path by looking toward next box
			var transform = inverse( lookAt( vec3( this.prev_positions[i] ), vec3( this.prev_positions[i+1] ), vec3(0,1,0) ) );
			this.m_cube.draw( this.graphicsState, mult( model_transform, transform ), greyPlastic ); // Draw the path in boxes
		}

		if( this.prev_positions.length > 100 ) // Limit the path's length by removing old boxes
			this.prev_positions.pop();
		*/
		
		var scene1Length = 3, // 3 sec
			scene2Length = 5, // 5 sec
			scene3Length = 5, // 5 sec
			scene4Length = 4, // 4 sec
			scene5Length = 4, // 4 sec
			scene6Length = 10; // 10 sec

		var scene1 = scene1Length, 
			scene2 = scene1 + scene2Length,
			scene3 = scene2 + scene3Length,
			scene4 = scene3 + scene4Length,
			scene5 = scene4 + scene5Length,
			scene6 = scene5 + scene6Length;

		var flippedTurtle_x = -20,
			flippedTurtle_z = -30; 

		var currentTimeInSecond = this.graphicsState.animation_time / 1000; 

		var stack = [];

		var groundLevel = -6.3;


		console.log(Math.floor(this.graphicsState.animation_time/100));
		if(Math.floor(this.graphicsState.animation_time/100) == 1)
			this.m_newSound.play();
		
		if(animate == false)
			this.m_newSound.pause();

		// sky
		stack.push(model_transform);
		model_transform = mult(model_transform, rotation(this.graphicsState.animation_time / 1000, 0, 1, 0));
		model_transform = mult(model_transform, scale(100, 100, 100));
		this.m_sphere.draw(this.graphicsState, model_transform, sky);
		model_transform = stack.pop();

		// ground
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-100, 0, -100));
		model_transform = mult(model_transform, translation(0, groundLevel, 0));
		this.draw_ground(this, model_transform);
		model_transform = stack.pop();

		// tree
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(20, groundLevel, -30));
		model_transform = mult(model_transform, scale(1.8, 1.8, 1.8));
		this.draw_tree(this, model_transform);
		model_transform = stack.pop();

		// river
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-20, groundLevel+.1, 5));
		model_transform = mult(model_transform, scale(15, 0, 25));
		model_transform = mult(model_transform, rotation(15, 0, 1, 0));
		this.draw_river(this, model_transform);
		model_transform = stack.pop();

		// stones - nearby river
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-15, groundLevel+.5, -60));
		model_transform = mult(model_transform, rotation(70, 0, 1, 0));
		this.draw_stone(this, model_transform);
		model_transform = stack.pop();

		// grass + flowers - nearby river
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-15, groundLevel, -65));
		model_transform = mult(model_transform, rotation(20, 0, 1, 0));
		this.draw_grass(this, model_transform);
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.5, 4, 0));
		this.draw_flower(this, model_transform); // flower
		model_transform = stack.pop();
		model_transform = stack.pop();

		// stones - nearby tree
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(18, groundLevel+.5, -28));
		model_transform = mult(model_transform, rotation(160, 0, 1, 0));
		this.draw_stone(this, model_transform);
		model_transform = stack.pop();

		// grass + flowers - nearby tree
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(22, groundLevel, -20));
		this.draw_grass(this, model_transform);
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.5, 4, 0));
		this.draw_flower(this, model_transform); // flower
		model_transform = stack.pop();
		model_transform = stack.pop();

		stack.push(model_transform);
		model_transform = mult(model_transform, translation(28, groundLevel, -25));
		model_transform = mult(model_transform, rotation(45, 0, 1, 0));
		this.draw_grass(this, model_transform);
		model_transform = stack.pop();

		stack.push(model_transform);
		model_transform = mult(model_transform, translation(28, groundLevel, -30));
		model_transform = mult(model_transform, rotation(-45, 0, 1, 0));
		this.draw_grass(this, model_transform);
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.5, 5, 0));
		this.draw_flower(this, model_transform); // flower
		model_transform = stack.pop();
		model_transform = stack.pop();

		stack.push(model_transform);
		model_transform = mult(model_transform, translation(13, groundLevel, -34));
		model_transform = mult(model_transform, rotation(-45, 0, 1, 0));
		this.draw_grass(this, model_transform);
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.5, 3, 0));
		this.draw_flower(this, model_transform); // flower
		model_transform = stack.pop();
		model_transform = stack.pop();

		stack.push(model_transform);
		model_transform = mult(model_transform, translation(15, groundLevel, -25));
		model_transform = mult(model_transform, rotation(35, 0, 1, 0));
		this.draw_grass(this, model_transform);
		model_transform = stack.pop();

		

		// Scene #1
		// Turtle A cannot flip over. He needs help!!
		if( currentTimeInSecond <= scene1 )
		{
			var stack = [];

			// flipped turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(flippedTurtle_x, 0, flippedTurtle_z));
			model_transform = mult(model_transform, rotation(10 * Math.sin(2 * currentTimeInSecond), 0, 0, 1));
			model_transform = mult(model_transform, rotation(10 * Math.sin(5/4 * currentTimeInSecond), 0, 1, 0));
			model_transform = mult(model_transform, rotation(70, 0, 1, 0));
			model_transform = mult(model_transform, rotation(200, 1, 0, 0));
			this.draw_turtle_flip(this, model_transform, this.graphicsState.animation_time, "sad");
			model_transform = stack.pop();
			
			// normal turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(-2/3 * currentTimeInSecond, 0, 0));
			model_transform = mult(model_transform, translation(25, 0, 0));
			this.draw_turtle_normal(this, model_transform, this.graphicsState.animation_time, "normal", 500);
			model_transform = stack.pop();

		}
		// Scene #2
		// Turtle B see turtle A is in trouble. He feel soory for his friend. 
		else if( currentTimeInSecond <= scene2 )
		{
			this.graphicsState.camera_transform = lookAt(vec3(0, 5, 10), vec3(25, 0, 0), vec3(0, 1, 0));

			var stack = [];
			
			// flipped turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(flippedTurtle_x, 0, flippedTurtle_z));
			model_transform = mult(model_transform, rotation(10 * Math.sin(2 * currentTimeInSecond), 0, 0, 1));
			model_transform = mult(model_transform, rotation(10 * Math.sin(5/4 * currentTimeInSecond), 0, 1, 0));
			model_transform = mult(model_transform, rotation(70, 0, 1, 0));
			model_transform = mult(model_transform, rotation(200, 1, 0, 0));
			this.draw_turtle_flip(this, model_transform, this.graphicsState.animation_time, "sad");
			model_transform = stack.pop();

			// normal turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(25 - 2/3 * scene1, 0, 0));
			this.draw_turtle_normal(this, model_transform, 0, "astonish", 500);
			model_transform = stack.pop();

			// text line
			stack.push(model_transform);
			this.m_textLine.set_string("OMG! This is terrible!");
			model_transform = mult(model_transform, translation(35, 8, 0));
			model_transform = mult(model_transform, rotation(200, 0, 1, 0));
			this.m_textLine.draw(this.graphicsState, model_transform, false, vec4(0, 0, 0, 1));
			model_transform = stack.pop();

			stack.push(model_transform);
			this.m_textLine.set_string("My friend needs me!!");
			model_transform = mult(model_transform, translation(35, 6, 0));
			model_transform = mult(model_transform, rotation(200, 0, 1, 0));
			this.m_textLine.draw(this.graphicsState, model_transform, false, vec4(0, 0, 0, 1));
			model_transform = stack.pop();

		}
		// Scene #3
		// In Turtle B's view. Turtle B is walking towards turtle A.
		else if( currentTimeInSecond <= scene3)
		{
			if(currentTimeInSecond <= scene2 + 1)
				this.graphicsState.camera_transform = lookAt(vec3(((25 - 2/3 * scene1) - 4 * (currentTimeInSecond-scene2))-10, 0, -6 * (currentTimeInSecond-scene2)), vec3(flippedTurtle_x, 0, flippedTurtle_z), vec3(0, 1, 0));
			else
				this.graphicsState.camera_transform = lookAt(vec3(-10, 5, 30), vec3(-10, 0, -30), vec3(0, 1, 0));

			var stack = [];
			
			// flipped turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(flippedTurtle_x, 0, flippedTurtle_z));
			model_transform = mult(model_transform, rotation(10 * Math.sin(2 * currentTimeInSecond), 0, 0, 1));
			model_transform = mult(model_transform, rotation(10 * Math.sin(5/4 * currentTimeInSecond), 0, 1, 0));
			model_transform = mult(model_transform, rotation(70, 0, 1, 0));
			model_transform = mult(model_transform, rotation(200, 1, 0, 0));
			this.draw_turtle_flip(this, model_transform, this.graphicsState.animation_time, "sad");
			model_transform = stack.pop();

			// normal turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(((25 - 2/3 * scene1) - 4 * (currentTimeInSecond-scene2)), 0, -6 * (currentTimeInSecond-scene2)));
			this.draw_turtle_normal(this, model_transform, this.graphicsState.animation_time, "sad", 200);
			model_transform = stack.pop();


		}
		// Scene #4
		// Turtle B is helping turtle A to flip over.
		else if( currentTimeInSecond <= scene4)
		{
			this.graphicsState.camera_transform = lookAt(vec3(-10, 5, 30), vec3(-10, 0, -30), vec3(0, 1, 0));

			var stack = [];

			// flipped turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(flippedTurtle_x-.8, 0, flippedTurtle_z));
			model_transform = mult(model_transform, translation(0, -0.7*(currentTimeInSecond - scene3), 0));
			model_transform = mult(model_transform, rotation(70, 0, 1, 0));
			model_transform = mult(model_transform, rotation(200, 1, 0, 0));

			model_transform = mult(model_transform, translation(0, -1, 2));
			model_transform = mult(model_transform, rotation(220 * Math.sin(currentTimeInSecond * 1/scene4Length), 1, 0, 0));
			model_transform = mult(model_transform, translation(0, 1, -2));
			this.draw_turtle_flip(this, model_transform, this.graphicsState.animation_time, "normal");
			model_transform = stack.pop();

			// normal turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(0, 0, -30));
			this.draw_turtle_normal_helpping(this, model_transform, this.graphicsState.animation_time, "normal");
			model_transform = stack.pop();

		}
		// Scene #5
		// They secusses!
		else if( currentTimeInSecond <= scene5)
		{
			this.graphicsState.camera_transform = lookAt(vec3(-20, 5, 10), vec3(-15, 0, -30), vec3(0, 1, 0));
			var stack = [];

			// flipped turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(flippedTurtle_x - 3*scene4Length, 0, flippedTurtle_z));
			model_transform = mult(model_transform, rotation(50 * Math.sin((currentTimeInSecond-scene4) * 1/scene5Length), 0, 1, 0));
			model_transform = mult(model_transform, rotation(70, 0, 1, 0));
			this.draw_turtle_normal(this, model_transform, this.graphicsState.animation_time, "happy", 300);
			model_transform = stack.pop();

			// normal turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(0, 0, flippedTurtle_z));
			model_transform = mult(model_transform, rotation(90 * Math.sin((currentTimeInSecond-scene4) * 1/scene5Length), 0, 1, 0));
			this.draw_turtle_normal(this, model_transform, this.graphicsState.animation_time, "happy", 200);
			model_transform = stack.pop();
		}
		// Scene #6
		// Happing ending.
		else if( currentTimeInSecond <= scene6)
		{
			this.graphicsState.camera_transform = lookAt(vec3(-10, 5, 10+(3*currentTimeInSecond-scene5)), vec3(-10, 0, -30), vec3(0, 1, 0));
			var stack = [];

			// flipped turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(flippedTurtle_x - 2*scene4Length, 0, flippedTurtle_z));
			model_transform = mult(model_transform, rotation(120, 0, 1, 0));
			model_transform = mult(model_transform, translation(0, 3 * Math.abs(Math.sin(currentTimeInSecond * 2 * 0.8)), 0));
			this.draw_turtle_normal(this, model_transform, 0, "happy", 500);
			model_transform = stack.pop();

			// normal turtle
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(0, 0, flippedTurtle_z));
			model_transform = mult(model_transform, rotation(80, 0, 1, 0));
			model_transform = mult(model_transform, translation(0, 2 * Math.abs(Math.sin(currentTimeInSecond * 0.8)), 0));
			this.draw_turtle_normal(this, model_transform, 0, "happy", 500);
			model_transform = stack.pop();
		}
	}	


Animation.prototype.update_strings = function( debug_screen_strings )		// Strings this particular class contributes to the UI
{
	debug_screen_strings.string_map["frame_rate"] = "Frame rate: " + 1000/this.animation_delta_time;
	debug_screen_strings.string_map["time"] = "Animation Time: " + this.graphicsState.animation_time/1000 + "s";
	debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
}