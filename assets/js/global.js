var Ooge = Ooge || {};
Ooge.global = {
	sWidth: window.innerWidth,
	sHeight: window.innerHeight,
	canvas: null,
	ctx: null,
	gameLoop: null,
	player: null,

	handlers: {},
	Init: function() {
		var app = Ooge.global;
		$('canvas#world').attr({
			width: app.sWidth,
			height: app.sHeight
		});

		app.canvas = document.getElementById('world');
		if(app.canvas.getContext) {
			app.ctx = app.canvas.getContext('2d');
			app.player = new Player(300,300,50,50,5);

			// Setup controls (please work)
			$(window).keydown(function(e){
				switch(e.which) {
					case 87:
						//move up
						app.player.moving.up = true;
						break;
					case 65:
						//move left
						app.player.moving.left = true;
						break;
					case 83:
						//move down
						app.player.moving.down = true;
						break;
					case 68:
						//move right
						app.player.moving.right = true;
						break;
				}
			});

			$(window).keyup(function(e){
				switch(e.which) {
					case 87:
						//move up
						app.player.moving.up = false;
						break;
					case 65:
						//move left
						app.player.moving.left = false;
						break;
					case 83:
						//move down
						app.player.moving.down = false;
						break;
					case 68:
						//move right
						app.player.moving.right = false;
						break;
				}
			});

			if(typeof app.gameLoop != 'undefined') clearInterval(app.gameLoop);
			app.gameLoop = setInterval(app.gLoop, 15);
		} else {
			// Canvas not supported
		}
	},
	gLoop: function() {
		var app = Ooge.global;
		// Clear screen to white
		app.ctx.fillStyle = 'white';
		app.ctx.fillRect(0, 0, app.sWidth, app.sHeight);

		app.Update();
		app.Render();
	},

	Render: function() {
		var app = Ooge.global;
		app.player.render();
	},

	Update: function() {
		var app = Ooge.global;
		
		if(app.player.moving.up) {
			app.player.moveUp();
		}
		if(app.player.moving.down) {
			app.player.moveDown();
		}

		if(app.player.moving.right) {
			app.player.moveRight();
		}
		if(app.player.moving.left) {
			app.player.moveLeft();
		}
	}
};

var Player = function(x, y, boundX, boundY, speed) {
	this.x = x;
	this.y = y;
	this.boundX = boundX;
	this.boundY = boundY;
	this.speed = speed;

	this.moving = {
		left: false,
		up: false,
		right: false,
		down: false
	};
};

Player.prototype.render = function() {
	var app = Ooge.global;
	app.ctx.fillStyle = 'rgb(255,0,0)';
	app.ctx.fillRect(this.x, this.y, this.boundX, this.boundY);
}

Player.prototype.update = function() {
	
}

Player.prototype.moveLeft = function() {
	this.x -= this.speed;
};

Player.prototype.moveRight = function() {
	this.x += this.speed;
};

Player.prototype.moveUp = function() {
	this.y -= this.speed;
};

Player.prototype.moveDown = function() {
	this.y += this.speed;
};

Ooge.global.Init();