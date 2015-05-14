var Ooge = Ooge || {};
Ooge.global = {
	sWidth: window.innerWidth,
	sHeight: window.innerHeight,
	canvas: null,
	ctx: null,
	gameLoop: null,
	player: null,
	players: {},

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
			app.player = new Player(300,300,0,0,5,50);

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
		app.Socket.setup();

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

		for (var index in app.players) {
			if (app.players.hasOwnProperty(index)) {
				app.players[index].render();
			}
		}
	},

	Update: function() {
		var app = Ooge.global,
			positionChanged = false;

		if(app.player.moving.up) {
			app.player.moveUp();
			positionChanged = true;
		}
		if(app.player.moving.down) {
			app.player.moveDown();
			positionChanged = true;
		}

		if(app.player.moving.right) {
			app.player.moveRight();
			positionChanged = true;
		}
		if(app.player.moving.left) {
			app.player.moveLeft();
			positionChanged = true;
		}

		if (positionChanged === true) {
			app.Socket.updatePosition();
		}
	},
	Socket: {
		socket: null,

		setup: function() {
			var socket = Ooge.global.Socket;
			socket.socket = new WebSocket('ws://g.ooge.uk:9001/game');
			socket.socket.onopen = socket.event.onopen;
			socket.socket.onerror = socket.event.onerror;
			socket.socket.onmessage = socket.event.onmessage;
			socket.socket.onclose = socket.event.onclose;
		},
		updatePosition: function() {
			var player = Ooge.global.player,
				socket = Ooge.global.Socket,
				position = { type: 'position', x: player.x, y: player.y };
			socket.socket.send(JSON.stringify(position));
		},
		event: {
			onopen: function(e) {
				console.log('Websocket connected successfully');
			},
			onerror: function(error) {
				console.log(error);
			},
			onmessage: function(e) {
				var app = Ooge.global;
				console.log(e.data);
				try {
					var data = JSON.parse(e.data);
					switch (data.type) {
						case 'connect':
							for (var index in data.players) {
								var pl = data.players[index];
								app.players[pl.player] = new Player(pl.x, pl.y, 0, 0, 5, pl.radius);
							}
							app.player.x = data.x;
							app.player.y = data.y;
							app.player.colour = data.colour;
							break;
						case 'client_open':
							app.players[data.player] = new Player(data.x, data.y, 0, 0, 5, data.player.radius);
							app.players[data.player].colour = data.colour;
							break;
						case 'client_close':
							app.players[data.player].destroy();
							delete app.players[data.player];
							break;
						case 'position_update':
							var player = app.players[data.player];
							player.x = data.x;
							player.y = data.y;
							player.radius = data.radius;
							break;
						case 'position':
							app.player.x = data.x;
							app.player.y = data.y;
							app.player.radius = data.radius;
							break;
					}
				} catch (error) {
					console.log(error);
				}
			},
			onclose: function() {
				alert('The socket was closed :(');
			}
		}
	}
};

var Player = function(x, y, boundX, boundY, speed, radius) {
	this.x = x;
	this.y = y;
	this.boundX = boundX;
	this.boundY = boundY;
	this.radius = radius;
	this.speed = speed;
	this.colour = {};

	this.moving = {
		left: false,
		up: false,
		right: false,
		down: false
	};
};

Player.prototype.render = function() {
	var app = Ooge.global;
	app.ctx.fillStyle = 'rgb(' + this.colour.r + ',' + this.colour.g + ',' + this.colour.b + ')';
	app.ctx.beginPath();
    app.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
    app.ctx.fill();
};

Player.prototype.update = function() {

};

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

Player.prototype.destroy = function() {

};

Ooge.global.Init();
