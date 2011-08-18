if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback,  duration ) {
			window.setTimeout( callback, duration || (1000/60) );
		};
	} )();
}

//Game Model
JPE.GameModel = {
	levelData:[[1, 5],[2, 10],[4,15],[6,20],[10,25],[15,30],[18,35],[22,40],[30,45],[37,50],[54,60]],
	level: 0,
	levelScore: 0,
	totalScore: 0,
	maxRadius: 40,
	chainCount: 0,
	growing: false,
	mouseEnabled: false,
	ballRadius: 10,
	welcomeRadius: 60,
	collisionSignal: new JPE.Signal(),
	growStartSignal: new JPE.Signal(),
	growOverSignal: new JPE.Signal(),
	levelChangedSignal: new JPE.Signal(),
	mouseSignal: new JPE.Signal(),
	computeScore: function(count){
		return 100 * count;
	},
	BEST_SCORE_KEY: 'domino:best_score',
	init: function(){
		gameModel.bestScore = localStorage.getItem(this.BEST_SCORE_KEY) || 0;
	},
	saveScore: function(score){
		 localStorage.setItem(this.BEST_SCORE_KEY, score)
	}
}
//Define Ball
JPE.declare("Ball", {
	superclass: JPE.CircleParticle,

	update: function(){
		JPE.Ball.superclass.prototype.update.apply(this, arguments);
		var pos = this.getPosition(),
			vel = this.getVelocity(),
			r = this.getRadius(),
			model = JPE.GameModel,
			frame = model.frame;
		if((pos.x-r) < frame.x || (pos.x+r) > frame.width){
			vel.x *= -1;
		}
		if((pos.y-r) < frame.y || (pos.y+r) > frame.height){
			vel.y *= -1;
		}
		this.setVelocity(vel);
	}
});
JPE.declare("GrowBall", {
	superclass: JPE.CircleParticle,
	minRadius: null,
	maxRadius: null,
	growed:false,
	inHolding: false,
	constructor: function(minRadius, maxRadius){
		this.minRadius = minRadius;
		this.maxRadius = maxRadius;
		this.destroySignal = new JPE.Signal();
		JPE.GrowBall.superclass.prototype.constructor.apply(this, null);
		this.setRadius(JPE.GameModel.ballRadius);
	},
	update: function(){
		var self = this;
			r = this.getRadius();
		if(this.growed && !this.inHolding){
			if(r > this.minRadius){
				this.setRadius(r-1);
			}else{
				this.destroySignal.dispatch();
			}
		}else if(!this.growed){
			if(r < this.maxRadius){
				this.setRadius(r+1);
			}else{
				this.growed = true;
				this.inHolding = true;
				setTimeout(function(){
					self.inHolding = false;
				}, 2000);
			}
		}
		JPE.GrowBall.superclass.prototype.update.call(this, arguments);
	}
});

//Ball Group
JPE.declare("BallGroup", {
	superclass: JPE.Group,
	maxSpeed: 1.6,
	constructor: function(){
		JPE.BallGroup.superclass.prototype.constructor.apply(this, arguments);
		this.colors = [0x5500ff, 0x99ccaa, 0xff6600, 0x224499, 0x4499cc];
	},
	initializeBalls: function(count, radius){
		this.clearBalls();
		for(var i = 0; i < count; i++){
			this.addBall(radius);
		}
	},
	addBall: function(radius){
		var frame = JPE.GameModel.frame,
			width = frame.width,
			height = frame.height,
			speed = this.maxSpeed,
			r = radius || JPE.GameModel.ballRadius,
			randomColor = this.colors[Math.floor(Math.random()*this.colors.length)],
			px = 2*r + Math.random()*(width-4*r),
			py = 2*r + Math.random()*(height-4*r),
			sx = Math.random()*speed*2 - speed,
			sy =  Math.sqrt(speed* speed - sx * sx) * (Math.random()>0.5?1:-1),
			vel = new JPE.Vector(sx, sy);
			ball = new JPE.Ball(px, py, r);
		
		ball.setFill(randomColor);
		ball.setVelocity(vel);
		ball.setCollidable(false);
		this.addParticle(ball);
	},
	clearBalls: function(){
		while(this.particles.length > 0){
			this.removeParticle(this.particles[0]);
		}
	}
});
//EffectGroup
JPE.declare("EffectGroup", {
	superclass: JPE.Group,
	minRadius: 1,
	maxRadius: JPE.GameModel.maxRadius,
	duration: 5000,
	timer: null,
	constructor: function(){
		JPE.EffectGroup.superclass.prototype.constructor.apply(this, arguments);
	},
	addGrow: function(options){
		var self = this,
			ball = new JPE.GrowBall(this.minRadius, this.maxRadius);
		
		ball.setPosition(new JPE.Vector(options.x, options.y));
		ball.setFill(options.color || 0xa11111, 0.8);
		ball.setCollidable(false);
		ball.destroySignal.add(function(){
			setTimeout(function(){
				self.removeParticle(ball);
				if(self.particles.length == 0){
					JPE.GameModel.growing = false;
					JPE.GameModel.growOverSignal.dispatch();
				}
			},0);
			
		});
		this.addParticle(ball);
	},
	clearBalls: function(){
		while(this.particles.length > 0){
			this.removeParticle(this.particles[0]);
		}
	}
});

//Domino
JPE.declare("Domino", {

	constructor: function(){
		var self = this,
			canvas = this.canvas = document.getElementById("myCanvas"),
			stage = this.stage = new Stage(canvas),
			width = this.width = canvas.clientWidth,
			height = this.height = canvas.clientHeight,
			Engine = JPE.Engine,
			EaselRenderer = JPE.EaselRenderer,
			WorldFrame = JPE.WorldFrame,
			BallGroup = JPE.BallGroup,
			EffectGroup = JPE.EffectGroup;
		
		Engine.init(1/4);
		JPE.GameModel.frame = {
			x: 0, 
			y: 0, 
			width: width,
			height: height
		}
		// set the renderer to easel renderer
		Engine.renderer = new EaselRenderer(stage);

		var ballGroup = this.ballGroup = new BallGroup();
		Engine.addGroup(ballGroup);
		
		var effectGroup = this.effectGroup = new EffectGroup();
		Engine.addGroup(effectGroup);
		this.init();
	},
	init: function(){
		var self = this,
			animate = function(){
				window.requestAnimationFrame(function(){
					if(self.running){
						self.update();
					}
					animate();
				});
			}
		animate();
		this.addEvents();
	},
	addEvents: function(){
		var onClicked = function(e){
			if(!JPE.GameModel.mouseEnabled){
				return;
			}
			JPE.GameModel.growing = true;
			JPE.GameModel.mouseEnabled = false;
			JPE.GameModel.mouseSignal.dispatch({
				x: e.clientX,
				y: e.clientY
			});
			
			JPE.GameModel.growStartSignal.dispatch();
		}
		this.canvas.addEventListener("click", onClicked, false);
		this.canvas.addEventListener("touch", onClicked, false);
	},
	addGrow: function(options){
		this.effectGroup.addGrow(options);
	},
	start: function(level){
		level = level || 0;
		var levelData = JPE.GameModel.levelData[level];
		JPE.GameModel.level = level;
		JPE.GameModel.chainCount = 0;
		JPE.GameModel.mouseEnabled = true;
		this.ballGroup.initializeBalls(levelData[1]);
		this.running = true;
	},
	welcome: function(){
		this.ballGroup.initializeBalls(3, JPE.GameModel.welcomeRadius);
		this.running = true;
	},
	isCollision: function(p1, p2){
		var r1 = p1.getRadius(),
			r2 = p2.getRadius(),
			p1x = p1.getPx(),
			p1y = p1.getPy(),
			p2x = p2.getPx(),
			p2y = p2.getPy(),
			dx = p1x - p2x,
			dy = p1y - p2y,
			d = r1+r2;

		return (dx*dx + dy*dy) <= d * d;
	},
	checkCollision: function(){
		var balls = this.ballGroup.particles,
			effectBalls = this.effectGroup.particles,
			p1,
			p2,
			temp = [];

		for(var i = 0, l = balls.length; i<l; i++){
			for(var j = 0, m = effectBalls.length; j < m;j++){
				p1 = balls[i];
				p2 = effectBalls[j];
				if(this.isCollision(p1, p2)){
					var option = {
						x: p1.getPx(),
						y: p1.getPy(),
						color:p1.fillColor
					};
					this.effectGroup.addGrow(option);
					JPE.GameModel.chainCount ++;
					JPE.GameModel.collisionSignal.dispatch(option);
					temp.push(p1);
				}
			}
		}
		for(var ti = 0, tl = temp.length; ti < tl; ti++){
			this.ballGroup.removeParticle(temp[ti])
		}
	},
	stop: function(){
		this.update();
		this.running = false;
	},
	update: function(){
		if(JPE.GameModel.growing){
			this.checkCollision();
		}
		JPE.Engine.step();
		JPE.Engine.paint();
		this.stage.update();
	}
});
JPE.declare("GameView", {
	constructor: function(){
		
		this.levelWin = this.query(".level-win");
		this.enterPage = this.query(".welcome-page");
		this.levelEndWin = this.query(".level-end-win");
		this.gameOverWin = this.query(".game-over-win");
		this.levelStartSignal = new JPE.Signal();
		this.levelEndSignal = new JPE.Signal();
		this.enterGameSignal = new JPE.Signal();
		this.gameOverSignal = new JPE.Signal();
		this.initView();
	},
	initView: function(){
		var self = this,
			enterButton = this.query(".welcome-page .pay-button"),
			playButton = this.query(".level-win .play-button");

		this.addTap(enterButton, function(){
			self.addClass(self.enterPage, 'hidden');
			self.enterGameSignal.dispatch();
		});
		this.addTap(playButton, function(){
			self.addClass(self.levelWin, 'hidden');
			self.onLevelStart();
			self.levelStartSignal.dispatch();
		});
		this.addTap(this.levelEndWin, function(){
			self.addClass(self.levelEndWin, 'hidden');
			self.levelEndSignal.dispatch();
		});
		this.addTap(this.gameOverWin, function(){
			self.addClass(self.gameOverWin, 'hidden');
			self.gameOverSignal.dispatch();
		});
	},
	showGameStartPage: function(options){
		this.query(".best-score .score").innerHTML = options.bestScore;
		this.removeClass(this.enterPage, 'hidden');
	},
	showLevelStartPage: function(options){
		this.query(".level-win .level").innerHTML = "第"+(options.level+1)+"关";
		this.removeClass(this.levelWin, 'hidden');
	},
	showLevelEndPage: function(options){
		var html;
		if(options.passed){
			html = "总得分："+ options.totalScore;
		}else{
			html = "还差"+ (options.requiredCount - options.chainCount)+"个";
		}
		this.query(".level-end-win .content").innerHTML = html;
		this.removeClass(this.levelEndWin, 'hidden');
		this.onLevelEnd();
	},
	showGameEndPage: function(options){
		var totalScore = options.totalScore;
		this.query(".game-over-win .content").innerHTML = "你的总得分是："+totalScore;
		this.removeClass(this.gameOverWin, 'hidden');
	},
	updateTip: function(chain, required){
		var html;
		if(chain < required){
			html = "还差"+(required-chain)+"个";
		}else if(chain == required){
			html = "到达个数";
		}else{
			html = "超出" + (chain-required)+"个";
		}
		this.query(".tip").innerHTML = html;
	},
	updateScore: function(score){
		this.query(".my-score").innerHTML = score;
	},
	onLevelStart: function(){
		this.removeClass(this.query(".my-score"), 'hidden');
		this.removeClass(this.query(".tip"), 'hidden');
	},
	onLevelEnd: function(){
		this.addClass(this.query(".my-score"), 'hidden');
		this.addClass(this.query(".tip"), 'hidden');
	},
	add: function(el, type, callback){
		el.addEventListener(type, callback, false);
	},
	remove: function(el, type, callback){
		el.removeEventListener(type, callbak, false);
	},
	addTap: function(el, callback){
		this.add(el, 'click', callback);
		this.add(el, 'touch', callback);
	},
	removeTap: function(el){
		this.remove(el, 'click', callback);
		this.remove(el, 'touch', callback);
	},
	addClass: function(el, cls){
		el.className = el.className ? (el.className + " " + cls) : cls
	},
	removeClass: function(el, cls){
		el.className = el.className.replace(new RegExp('(?:^|\\s+)' +cls + '(?:\\s+|$)'), "");
	},
	query: function(path, all){
		if(all){
			document.querySelector(path);
		}
		return document.querySelector(path);
	}
});
//entry point;
var domino = new JPE.Domino(),
	gameModel = JPE.GameModel,
	gameView = new JPE.GameView(),
	showLevelAt = function(level){
		var data = gameModel.levelData[level];
		gameView.showLevelStartPage({
			level: gameModel.level,
			totalBall: data[0],
			requireBall: data[1]
		});
	},
	updateViewState = function(){
		var chainCount = gameModel.chainCount,
			requiredCount = gameModel.levelData[gameModel.level][0];
		gameView.updateTip(chainCount, requiredCount);
		gameView.updateScore(gameModel.computeScore(chainCount));
	};

//model signal
gameModel.mouseSignal.add(function(signal, options){
	domino.addGrow(options);
});
gameModel.growOverSignal.add(function(signal){
	domino.stop();
	var chainCount = gameModel.chainCount,
		requiredCount = gameModel.levelData[gameModel.level][0],
		passed = (chainCount >= requiredCount);
	
	if(passed){
		gameModel.levelScore = gameModel.computeScore(chainCount);
		gameModel.totalScore += gameModel.levelScore;
		if(gameModel.level == gameModel.levelData.length-1){
			var bestScore = gameModel.bestScore;
			if(gameModel.totalScore > bestScore){
				gameModel.saveScore(gameModel.totalScore);
			}
			gameView.showGameEndPage({
				totalScore: gameModel.totalScore
			});
			return;
		}else{
			gameModel.level++;
		}
	}
	gameView.showLevelEndPage({
		passed: passed,
		chainCount: chainCount,
		requiredCount: requiredCount,
		totalScore: gameModel.totalScore
	});
	
});
gameModel.collisionSignal.add(updateViewState);
//view signal
gameView.enterGameSignal.add(function(){
	gameModel.ballRadius = 10;
	showLevelAt(0);
});
gameView.levelEndSignal.add(function(){
	showLevelAt(gameModel.level);
});
gameView.levelStartSignal.add(function(){
	domino.start(gameModel.level);
	updateViewState();
});
gameView.gameOverSignal.add(function(){
	gameModel.init();
	gameView.showGameStartPage({bestScore: gameModel.bestScore});
	domino.welcome();
});
gameView.gameOverSignal.dispatch();