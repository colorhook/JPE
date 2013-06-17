/**
 * Copyright (c) 2013 http://colorhook.com
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 */

/**
 * Provides requestAnimationFrame in a cross browser way.
 * @see https://gist.github.com/838785
 */
if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback,  element ) {
			window.setTimeout( callback, 1000/60);
		};
	} )();
}

define("Domino", function(require, exports, module){
	
	var JPE = require("JPE/JPE");
	var Engine = require("JPE/Engine");
	var Vector = require("JPE/Vector");
	var Signal = require("JPE/Signal");
	var EaselRenderer = require("JPE/EaselRenderer");
	var Group = require("JPE/Group");
	var CircleParticle = require("JPE/CircleParticle");

	//数据模型
	var GameModel = {
		levelData:[[1, 5],[2, 10],[4,15],[6,20],[10,25],[15,30],[18,35],[22,40],[30,45],[37,50],[48,55],[54,60]],
		level: 0,
		levelScore: 0,
		totalScore: 0,
		maxRadius: 40,
		chainCount: 0,
		growing: false,
		mouseEnabled: false,
		ballRadius: 10,
		welcomeRadius: 60,
		collisionSignal: new Signal(),
		growStartSignal: new Signal(),
		growOverSignal: new Signal(),
		levelChangedSignal: new Signal(),
		mouseSignal: new Signal(),
		computeScore: function(count){
			return 100 * count;
		},
		BEST_SCORE_KEY: 'domino:best_score',
		init: function(){
			this.level = 0;
			this.chainCount = 0;
			this.levelScore = 0;
			this.totalScore = 0;
			this.mouseEnabled = false;
			this.bestScore = localStorage.getItem(this.BEST_SCORE_KEY) || 0;
		},
		saveScore: function(score){
			 localStorage.setItem(this.BEST_SCORE_KEY, score)
		}
	}
	
/**
 * 游戏中的小球
 */
 var Ball = JPE.newClass(null, CircleParticle, {

		update: function(){
			CircleParticle.prototype.update.apply(this, arguments);
			var pos = this.getPosition(),
				vel = this.getVelocity(),
				r = this.getRadius(),
				model = GameModel,
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

/**
 * 碰到小球后能变大的球
 */
 var GrowBall = JPE.newClass(function(minRadius, maxRadius){
			this.minRadius = minRadius;
			this.maxRadius = maxRadius;
			this.destroySignal = new Signal();
			CircleParticle.prototype.constructor.apply(this, null);
			this.setRadius(GameModel.ballRadius);
		}, CircleParticle, {

		minRadius: null,
		maxRadius: null,
		growed:false,
		inHolding: false,
		update: function(){
			var self = this;
				r = this.getRadius();
			if(this.growed && !this.inHolding){
				if(r > (this.minRadius)){
					this.setRadius(r -1);
				}else{
					this.setVisible(false);
					this.destroySignal.dispatch();
				}
			}else if(!this.growed){
				if(r < (this.maxRadius-0.1)){
					this.setRadius(r+ (this.maxRadius-r)*0.15);
				}else{
					this.growed = true;
					this.inHolding = true;
					setTimeout(function(){
						self.inHolding = false;
					}, 2000);
				}
			}
			CircleParticle.prototype.update.call(this, arguments);
		}
	});

	/**
	 * 小球的Group
	 */
	var BallGroup = JPE.newClass(null, Group, {

		maxSpeed: 1.6,

		initializeBalls: function(count, radius){
			this.clearBalls();
			for(var i = 0; i < count; i++){
				this.addBall(radius);
			}
		},
		getRandomColor: function(){
			return Math.random() * 0xffffff;
		},
		addBall: function(radius){
			var frame = GameModel.frame,
				width = frame.width,
				height = frame.height,
				speed = this.maxSpeed,
				r = radius || GameModel.ballRadius,
				randomColor = this.getRandomColor(),
				px = 2*r + Math.random()*(width-4*r),
				py = 2*r + Math.random()*(height-4*r),
				sx = Math.random()*speed*2 - speed,
				sy =  Math.sqrt(speed* speed - sx * sx) * (Math.random()>0.5?1:-1),
				vel = new Vector(sx, sy),
				ball = new Ball(px, py, r);
			
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

	/**
	 * 大球的Group
	 */
	var EffectGroup = JPE.newClass(null, Group, {

		minRadius: 1,
		maxRadius: GameModel.maxRadius,
		duration: 5000,
		timer: null,

		addGrow: function(options){
			var self = this,
				ball = new GrowBall(this.minRadius, this.maxRadius);
			
			ball.setPosition(new Vector(options.x, options.y));
			ball.setFill(options.color, 0.8);
			ball.setCollidable(false);
			ball.destroySignal.add(function(){
				setTimeout(function(){
					self.removeParticle(ball);
					if(self.particles.length == 0){
						GameModel.growing = false;
						GameModel.growOverSignal.dispatch();
					}
				}, 0);
			});
			this.addParticle(ball);
		},
		clearBalls: function(){
			while(this.particles.length > 0){
				this.removeParticle(this.particles[0]);
			}
		}
	});


	/**
   * Domino Game
   */
  var Domino = JPE.newClass(function(){

		var self = this,
			canvas = this.canvas = document.getElementById("myCanvas"),
			stage = this.stage = new Stage(canvas),
			width = this.width = canvas.clientWidth,
			height = this.height = canvas.clientHeight;
		
		Engine.init(1/4);

		GameModel.frame = {
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

	}, null, {

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
			var globalXY = {
				x:this.canvas.offsetParent.offsetLeft,
				y:this.canvas.offsetParent.offsetTop
			};
			var onClicked = function(e){
				if(!GameModel.mouseEnabled){
					return;
				}
				GameModel.growing = true;
				GameModel.mouseEnabled = false;
				GameModel.mouseSignal.dispatch({
					x: e.clientX - globalXY.x,
					y: e.clientY - globalXY.y
				});
				
				GameModel.growStartSignal.dispatch();
			}
			this.canvas.addEventListener("click", onClicked, false);
			this.canvas.addEventListener("touch", onClicked, false);
		},
		addGrow: function(options){
			this.effectGroup.addGrow(options);
		},
		start: function(level){
			level = level || 0;
			var levelData = GameModel.levelData[level];
			GameModel.level = level;
			GameModel.chainCount = 0;
			GameModel.mouseEnabled = true;
			this.ballGroup.initializeBalls(levelData[1]);
			this.running = true;
		},
		welcome: function(){
			this.ballGroup.initializeBalls(3, GameModel.welcomeRadius);
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
						GameModel.chainCount ++;
						GameModel.collisionSignal.dispatch(option);
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
			if(GameModel.growing){
				this.checkCollision();
			}
			Engine.step();
			Engine.paint();
			this.stage.update();
		}
	});

	var GameView = JPE.newClass(function(){
		this.canvas = document.getElementById("myCanvas");
		this.levelWin = this.query(".level-win");
		this.enterPage = this.query(".welcome-page");
		this.levelEndWin = this.query(".level-end-win");
		this.gameOverWin = this.query(".game-over-win");
		this.aboutWin = this.query(".about-win");
		this.levelStartSignal = new Signal();
		this.levelEndSignal = new Signal();
		this.enterGameSignal = new Signal();
		this.gameOverSignal = new Signal();
		this.initView();
	}, null, {

		initView: function(){
			var self = this,
				enterButton = this.query(".welcome-page .pay-button"),
				playButton = this.query(".level-win .play-button"),
				aboutButton = this.query(".welcome-page .about-button");

			this.addTap(enterButton, function(){
				self.addClass(self.enterPage, 'hidden');
				self.enterGameSignal.dispatch();
			});
			this.addTap(playButton, function(){
				self.addClass(self.levelWin, 'hidden');
				self.onLevelStart();
				self.levelStartSignal.dispatch();
			});
			this.addTap(aboutButton, function(){
				self.addClass(self.enterPage, 'hidden');
				self.removeClass(self.aboutWin, 'hidden');
			});
			this.addTap(this.levelEndWin, function(){
				self.addClass(self.levelEndWin, 'hidden');
				self.levelEndSignal.dispatch();
			});
			this.addTap(this.gameOverWin, function(){
				self.addClass(self.gameOverWin, 'hidden');
				self.gameOverSignal.dispatch();
			});
			this.addTap(this.aboutWin, function(){
				self.removeClass(self.enterPage, 'hidden');
				self.addClass(self.aboutWin, 'hidden');
			});
		},
		showGameStartPage: function(options){
			this.query(".best-score .score").innerHTML = options.bestScore;
			this.removeClass(this.enterPage, 'hidden');
			this.removeClass(this.canvas, 'hidden');
		},
		showLevelStartPage: function(options){
			this.query(".level-win .title").innerHTML = "Level "+(options.level+1);
			this.query(".level-win .content").innerHTML ="Need explode " + options.required + " Of " + options.amount;
			this.removeClass(this.levelWin, 'hidden');
		},
		showLevelEndPage: function(options){
			var html, title;
			if(options.passed){
				title = "Mission Accomplished";
				html = "Total score: "+ options.totalScore;
			}else{
				title = "Mission Not Accomplished";
				if(options.requiredCount - options.chainCount == 1){
					html = "Last one ball required.";
				}else{
					html = (options.requiredCount - options.chainCount)+" more balls required.";
				}
			}
			this.query(".level-end-win .title").innerHTML = title;
			this.query(".level-end-win .content").innerHTML = html;
			this.removeClass(this.levelEndWin, 'hidden');
			this.onLevelEnd();
		},
		showGameEndPage: function(options){
			var totalScore = options.totalScore;
			this.query(".game-over-win .content").innerHTML = "Your total score is: "+totalScore;
			this.removeClass(this.gameOverWin, 'hidden');
			this.onLevelEnd();
		},
		updateTip: function(chain, required){
			var html;
			if((required - chain) == 1){
				html = "last one ball";
			}else if(chain < required){
				html = (required-chain)+" more balls...";
			}else{
				html = "Extra bouns";
			}
			this.query(".tip").innerHTML = html;
		},
		updateScore: function(score){
			this.query(".my-score").innerHTML = score;
		},
		onLevelStart: function(){
			this.removeClass(this.query(".my-score"), 'hidden');
			this.removeClass(this.query(".tip"), 'hidden');
			this.removeClass(this.canvas, "hidden");
		},
		onLevelEnd: function(){
			this.addClass(this.query(".my-score"), 'hidden');
			this.addClass(this.query(".tip"), 'hidden');
			this.addClass(this.canvas, "hidden");
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
	exports.start = function(){
		var domino = new Domino(),
			gameView = new GameView(),
			gameModel = GameModel,
			showLevelAt = function(level){
				var data = gameModel.levelData[level];
				gameView.showLevelStartPage({
					level: gameModel.level,
					required: data[0],
					amount: data[1]
				});
			},
			updateViewState = function(){
				var chainCount = gameModel.chainCount,
					requiredCount = gameModel.levelData[gameModel.level][0];
				gameView.updateTip(chainCount, requiredCount);
				gameView.updateScore(gameModel.computeScore(chainCount));
			};

		//model signal
		gameModel.mouseSignal.add(function(options){
			options.color = Math.random() * 0xffffff;
			domino.addGrow(options);
		});
		gameModel.growOverSignal.add(function(){
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
	}

});



