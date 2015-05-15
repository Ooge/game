var Ooge = Ooge || {};
Ooge.global = {
	sWidth: window.innerWidth,
	sHeight: window.innerHeight,
	canvas: null,
	ctx: null,
	gameLoop: null,
	player: null,
	players: {},
	map: null,

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
			app.player = new Ooge.Player(300,300,0,0,5,50);

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
		app.camera = new Ooge.Camera(0, 0, app.sWidth, app.sHeight, 5000, 5000);
		app.map = new Ooge.Map(null, 5000, 5000);

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
		app.camera.update();

		app.player.render(app.camera.cameraX, app.camera.cameraY);
		app.map.draw_grid(app.camera.cameraX, app.camera.cameraY);
		for (var index in app.players) {
			if (app.players.hasOwnProperty(index)) {
				app.players[index].render(app.camera.cameraX, app.camera.cameraY);
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
			socket.send(JSON.stringify(position));
		},
		send: function(msg) {
			try {
				var socket = Ooge.global.Socket;
				socket.socket.send(msg);
			} catch (ex) {}
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
								app.players[pl.player] = new Ooge.Player(pl.x, pl.y, 0, 0, 5, pl.radius);
								app.players[pl.player].colour = pl.colour;
							}
							app.player.x = data.x;
							app.player.y = data.y;
							app.player.colour = data.colour;
							break;
						case 'client_open':
							app.players[data.player] = new Ooge.Player(data.x, data.y, 0, 0, 5, data.radius);
							app.players[data.player].colour = data.colour;
							break;
						case 'client_close':
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
						case 'alert':
							alert(data.alert);
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

(function() {

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

	Player.prototype.render = function(cameraX, cameraY) {
		var app = Ooge.global;
		app.ctx.fillStyle = 'rgb(' + this.colour.r + ',' + this.colour.g + ',' + this.colour.b + ')';
		app.ctx.beginPath();
	    app.ctx.arc(this.x - cameraX,this.y - cameraY,this.radius,0,Math.PI*2,true);
	    app.ctx.fill();
	};

	Player.prototype.update = function() {

	};

	Player.prototype.moveLeft = function() {
		this.x -= this.speed;
		this.x = (this.x < 0 ? 0 : this.x);
	};

	Player.prototype.moveRight = function() {
		this.x += this.speed;
	};

	Player.prototype.moveUp = function() {
		this.y -= this.speed;
		this.y = (this.y < 0 ? 0 : this.y);
	};

	Player.prototype.moveDown = function() {
		this.y += this.speed;
	};

	Ooge.Player = Player;

	var Rectangle = function(left, top, width, height) {
		this.left = left || 0;
		this.top = top || 0;
		this.width = width || 0;
		this.height = height || 0;
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;
	};
	Rectangle.prototype.set = function(left, top, width, height){
	    this.left = left;
	    this.top = top;
	    this.width = width || this.width;
	    this.height = height || this.height;
	    this.right = (this.left + this.width);
	    this.bottom = (this.top + this.height);
	};

	Rectangle.prototype.within = function(r) {
	    return (r.left <= this.left &&
	            r.right >= this.right &&
	            r.top <= this.top &&
	            r.bottom >= this.bottom);
	};

	Rectangle.prototype.overlaps = function(r) {
	    return (this.left < r.right &&
	            r.left < this.right &&
	            this.top < r.bottom &&
	            r.top < this.bottom);
	};

	Ooge.Rectangle = Rectangle;

	var Camera = function(initialX, initialY, canvasWidth, canvasHeight, worldWidth, worldHeight) {
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;

		this.cameraX = initialX || 0;
		this.cameraY = initialY || 0;

		this.viewportRect = new Ooge.Rectangle(this.cameraX, this.cameraY, this.canvasWidth, this.canvasHeight);

		this.worldRect = new Ooge.Rectangle(0, 0, this.worldWidth, this.worldHeight);
	};

	Camera.prototype.update = function() {
		var app = Ooge.global;
		// horizontal
		if (app.player.x - this.cameraX + (this.canvasWidth/2) > this.canvasWidth) {
			this.cameraX = app.player.x - (this.canvasWidth - (this.canvasWidth/2));
		} else if (app.player.x < this.cameraX) {
			this.cameraX = app.player.x;
		}

		// vertical
		if (app.player.y - this.cameraY + (this.canvasHeight/2) > this.canvasHeight) {
			this.cameraY = app.player.y - (this.canvasHeight - (this.canvasHeight/2));
		} else if (app.player.y < this.cameraY) {
			this.cameraY = app.player.y;
		}

		this.viewportRect.set(this.cameraX, this.cameraY);
		if (!this.viewportRect.within(this.worldRect)) {
			if(this.viewportRect.left < this.worldRect.left)
                this.cameraX = this.worldRect.left;
            if(this.viewportRect.top < this.worldRect.top)
                this.cameraY = this.worldRect.top;
            if(this.viewportRect.right > this.worldRect.right)
                this.cameraX = this.worldRect.right - this.canvasWidth;
            if(this.viewportRect.bottom > this.worldRect.bottom)
                this.cameraY = this.worldRect.bottom - this.canvasHeight;
		}
	};

	Ooge.Camera = Camera;

	var Map = function(image, width, height) {
		this.image = image;
		this.width = width;
		this.height = height;
	};
	Map.prototype.draw_image = function(cameraX, cameraY) {
		var app = Ooge.global;
		var sx = cameraX,
			sy = cameraY, dx = 0, dy = 0;
		var sWidth = app.sWidth,
			sHeight = app.sHeight, dWidth, dHeight;
		sWidth = (this.image.width - sx < sWidth ? this.image.width - sx : sWidth);
		sHeight = (this.image.height - sy < sHeight ? this.image.height - sy : sHeight);
		dWidth = sWidth;
		dHeight = sHeight;

		app.ctx.drawImage(this.image, sx, sy, sWidth, sHeight, dx ,dy, dWidth, dHeight);
	};
	Map.prototype.draw_grid = function(cameraX, cameraY) {
		var app = Ooge.global,
			ctx = app.canvas.getContext('2d');
		for (var x = 0; x <= this.width; x += 40) {
			ctx.moveTo(0.5 + x, 0);
			ctx.lineTo(this.width, 0.5 + x);
		}
		for (var y = 0; y <= this.height; y += 40) {
			ctx.moveTo(0, 0.5 + y);
			ctx.lineTo(this.height, 0.5 + y);
		}
		ctx.strokeStyle = 'black';
		ctx.stroke();
	};

	Ooge.Map = Map;
})();
Ooge.global.Init();
