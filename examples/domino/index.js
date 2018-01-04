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

import {
	Engine,
	Vector,
	Group,
	CircleParticle,
} from '../../src/'

import EaselRenderer from '../../src/EaselRenderer'

const Signal = signals.Signal;
const Stage = createjs.Stage;

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

class Ball extends CircleParticle {
	update(dt2){
		super.update(dt2)
		var pos = this.position,
			vel = this.velocity,
			r = this.radius,
			model = GameModel,
			frame = model.frame;
		if((pos.x-r) < frame.x || (pos.x+r) > frame.width){
			vel.x *= -1;
		}
		if((pos.y-r) < frame.y || (pos.y+r) > frame.height){
			vel.y *= -1;
		}
		this.velocity = vel;
	}
}

/**
 * 碰到小球后能变大的球
 */
 class GrowBall extends CircleParticle{
	 	constructor(minRadius, maxRadius) {
	 		super()
			this.minRadius = minRadius;
			this.maxRadius = maxRadius;
			this.destroySignal = new Signal();
			this.radius = GameModel.ballRadius;
		}
		update(){
			var r = this.radius;
			if(this.growed && !this.inHolding){
				if(r > (this.minRadius)){
					this.radius = r -1;
				}else{
					this.visible = false;
					this.destroySignal.dispatch();
				}
			}else if(!this.growed){
				if(r < (this.maxRadius-0.1)){
					this.radius = r + (this.maxRadius-r)*0.15;
				}else{
					this.growed = true;
					this.inHolding = true;
					setTimeout(() => {
						this.inHolding = false;
					}, 2000);
				}
			}
			super.update()
		}
 }

	/**
	 * 小球的Group
	 */
	class BallGroup extends Group {

		constructor() {
			super();
			this.maxSpeed = 1.6
		}

		initializeBalls(count, radius){
			this.clearBalls();
			for(var i = 0; i < count; i++){
				this.addBall(radius);
			}
		}
		getRandomColor(){
			return Math.random() * 0xffffff;
		}
		addBall(radius){
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
			ball.velocity = vel;
			ball.collidable = false;
			this.addParticle(ball);
		}
		clearBalls(){
			while(this.particles.length > 0){
				this.removeParticle(this.particles[0]);
			}
		}
}

	/**
	 * 大球的Group
	 */
class EffectGroup extends Group {
	constructor() {
		super()
		this.minRadius = 1
		this.maxRadius = GameModel.maxRadius
		this.duration = 5000
	}
	addGrow(options){
		var self = this,
			ball = new GrowBall(this.minRadius, this.maxRadius);
		
		ball.position = new Vector(options.x, options.y);
		ball.setFill(options.color, 0.8);
		ball.collidable = false;
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
	}
	clearBalls() {
		while(this.particles.length > 0){
			this.removeParticle(this.particles[0]);
		}
	}
};


	/**
   * Domino Game
   */
class Domino {
		constructor() {
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
	  }
		init(){
			const animate = () => {
				window.requestAnimationFrame(() => {
					if(this.running){
						this.update();
					}
					animate();
				});
			}
			animate();
			this.addEvents();
		}
		addEvents(){
			var globalXY = {
				x: this.canvas.offsetParent.offsetLeft,
				y: this.canvas.offsetParent.offsetTop
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
		}
		addGrow(options){
			this.effectGroup.addGrow(options);
		}
		start(level){
			level = level || 0;
			var levelData = GameModel.levelData[level];
			GameModel.level = level;
			GameModel.chainCount = 0;
			GameModel.mouseEnabled = true;
			this.ballGroup.initializeBalls(levelData[1]);
			this.running = true;
		}
		welcome(){
			this.ballGroup.initializeBalls(3, GameModel.welcomeRadius);
			this.running = true;
		}
		isCollision(p1, p2){
			var r1 = p1.radius,
				r2 = p2.radius,
				p1x = p1.px,
				p1y = p1.py,
				p2x = p2.px,
				p2y = p2.py,
				dx = p1x - p2x,
				dy = p1y - p2y,
				d = r1+r2;

			return (dx*dx + dy*dy) <= d * d;
		}
		checkCollision(){
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
							x: p1.px,
							y: p1.py,
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
		}
		stop(){
			this.update();
			this.running = false;
		}
		update(){
			if(GameModel.growing){
				this.checkCollision();
			}
			Engine.step();
			Engine.paint();
			this.stage.update();
		}
}

class GameView {
		constructor() {
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
		}
		initView(){
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
		}
		showGameStartPage(options){
			this.query(".best-score .score").innerHTML = options.bestScore;
			this.removeClass(this.enterPage, 'hidden');
			this.removeClass(this.canvas, 'hidden');
		}
		showLevelStartPage(options){
			this.query(".level-win .title").innerHTML = "Level "+(options.level+1);
			this.query(".level-win .content").innerHTML ="Need explode " + options.required + " Of " + options.amount;
			this.removeClass(this.levelWin, 'hidden');
		}
		showLevelEndPage(options){
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
		}
		showGameEndPage(options){
			var totalScore = options.totalScore;
			this.query(".game-over-win .content").innerHTML = "Your total score is: "+totalScore;
			this.removeClass(this.gameOverWin, 'hidden');
			this.onLevelEnd();
		}
		updateTip(chain, required){
			var html;
			if((required - chain) == 1){
				html = "last one ball";
			}else if(chain < required){
				html = (required-chain)+" more balls...";
			}else{
				html = "Extra bouns";
			}
			this.query(".tip").innerHTML = html;
		}
		updateScore(score){
			this.query(".my-score").innerHTML = score;
		}
		onLevelStart(){
			this.removeClass(this.query(".my-score"), 'hidden');
			this.removeClass(this.query(".tip"), 'hidden');
			this.removeClass(this.canvas, "hidden");
		}
		onLevelEnd(){
			this.addClass(this.query(".my-score"), 'hidden');
			this.addClass(this.query(".tip"), 'hidden');
			this.addClass(this.canvas, "hidden");
		}
		add(el, type, callback){
			el.addEventListener(type, callback, false);
		}
		remove(el, type, callback){
			el.removeEventListener(type, callbak, false);
		}
		addTap(el, callback){
			this.add(el, 'click', callback);
			this.add(el, 'touch', callback);
		}
		removeTap(el){
			this.remove(el, 'click', callback);
			this.remove(el, 'touch', callback);
		}
		addClass(el, cls){
			el.className = el.className ? (el.className + " " + cls) : cls
		}
		removeClass(el, cls){
			el.className = el.className.replace(new RegExp('(?:^|\\s+)' +cls + '(?:\\s+|$)'), "");
		}
		query(path, all){
			if(all){
				document.querySelector(path);
			}
			return document.querySelector(path);
		}
}




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
	



