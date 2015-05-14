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
			app.player = new Player(300,300,50,50,1);

			// Setup controls (please work)
			$(window).keypress(function(e){
				switch(e.which) {
					case 87:
						//move up
						app.player.moveUp();
						break;
					case 65:
						//move left
						app.player.moveLeft();
						break;
					case 83:
						//move down
						app.player.moveDown();
						break;
					case 68:
						//move right
						app.player.moveRight();
						break;
				}
			});

			if(typeof app.gameLoop != 'undefined') clearInterval(app.gameLoop);
			app.gameLoop = setInterval(app.gLoop, 17);
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
		app.player.update();
	}
};

var Player = function(x, y, boundX, boundY, speed) {
	this.x = x;
	this.y = y;
	this.boundX = boundX;
	this.boundY = boundY;
	this.speed = speed;
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