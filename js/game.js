var gameProperties = {
    screenWidth: 800,
    screenHeight: 600,
    
    dashSize: 5,
    
    paddleLeft_x: 50,
    paddleRight_x: 750,
    paddleVelocity: 600,
    paddleSegmentsMax: 8,
    paddleSegmentHeight: 4,
    paddleSegmentAngle: 7,
    paddleTopGap: 5,
    
    ballVelocity: 300,
    ballRandomStartingAngleLeft: [-120, 120],
    ballRandomStartingAngleRight: [-60, 60],
    ballStartDelay: 2,
    ballVelocityIncrement: 25,
    ballReturnCount: 4,

    mineCount:4,

    scoreToWin: 11,
};

var graphicAssets = {
    ballURL: 'assets/Ball.png',
    ballName: 'ball',
    
    paddleURL: 'assets/HumanPaddle.png',
    paddleName: 'paddle',

    orcPaddleURL: 'assets/OrcPaddle.png',
    orcPaddleName: 'orcPaddle',

    mineURL: 'assets/GoldMine.png',
    mineName: 'mine',

    treesURL: 'assets/Trees.png',
    treesName: 'trees',

    humanURL: 'assets/Human.png',
    humanName: 'human',

    gruntURL: 'assets/Grunt.png',
    gruntName: 'grunt',

    humanChampionURL: 'assets/HumanChampion.png',
    humanChampionName: 'humanChampion',

    gruntChampionURL: 'assets/OrcChampion.png',
    gruntChampionName: 'gruntChampion',

    bkURL: 'assets/bk.jpg',
    bkName: 'bk',

    woodURL: 'assets/Wood.png',
    woodName: 'wood',

    goldURL: 'assets/Gold.png',
    goldName: 'gold'
};


var fontAssets = {
    scoreLeft_x: gameProperties.screenWidth * 0.25,
    scoreRight_x: gameProperties.screenWidth * 0.75 - 30,
    scoreTop_y: 10,
    
    scoreFontStyle:{font: '20px Courier New', fill: '#FFFFFF', align: 'left'},
    instructionsFontStyle:{font: '14px Courier New', fill: '#151515', align: 'center'},
}

var labels = {
    clickToStart: 'Humans: A to move up, Z to move down.\n S to summon militia(cost 5 gold).\n\nOrcs: UP and DOWN arrow keys.\n RIGHT to summon a grunt(cost 5 gold).\n\nAt 10 Gold a Champion will automatically be summoned.\nAt 50 Wood the base will be healed if possible.\n\n\nClick left side of screen for two players    - Click right side of screen for Single player',
    winner: 'Winner!',
};

var mainState = function(game) {
    this.backgroundGraphics;
    this.ballSprite;
    this.paddleLeftSprite;
    this.paddleRightSprite;
    this.paddleGroup;

    this.mineSprites;
    this.treesSprites;

    this.paddleLeft_up;
    this.paddleLeft_down;
    this.paddleLeft_summon;
    this.paddleRight_up;
    this.paddleRight_down;
    this.paddleRight_summon;
    
    this.missedSide;
    this.lastSide;
    
    this.scoreLeft;
    this.scoreRight;

    this.woodLeft;
    this.woodRight;
    
    this.tf_scoreLeft;
    this.tf_scoreRight;
    
    this.instructions;
    this.winnerLeft;
    this.winnerRight;
    
    this.ballVelocity;

    this.spaceKey;

    this.bkSprite;
    this.humans;
    this.orcs;

    this.healthBarLeft;
    this.healthBarRight;
    this.healthLeft;
    this.healthRight;

    this.isAI;
}

mainState.prototype = {
    preload: function () {
        game.load.image(graphicAssets.ballName, graphicAssets.ballURL);
        game.load.image(graphicAssets.paddleName, graphicAssets.paddleURL);
        game.load.image(graphicAssets.orcPaddleName, graphicAssets.orcPaddleURL);
        game.load.image(graphicAssets.mineName, graphicAssets.mineURL);
        game.load.image(graphicAssets.treesName, graphicAssets.treesURL);
        game.load.image(graphicAssets.bkName, graphicAssets.bkURL);
        game.load.image(graphicAssets.goldName, graphicAssets.goldURL);
        game.load.image(graphicAssets.woodName, graphicAssets.woodURL);
        game.load.image(graphicAssets.humanName, graphicAssets.humanURL);
        game.load.image(graphicAssets.gruntName, graphicAssets.gruntURL);
        game.load.image(graphicAssets.humanChampionName, graphicAssets.humanChampionURL);
        game.load.image(graphicAssets.gruntChampionName, graphicAssets.gruntChampionURL);

    },
    
    create: function () {
        this.initGraphics();
        this.initPhysics();
        this.initKeyboard();
        this.initSounds();
        this.startDemo();
        this.togglePause();
        this.isAI = 0;
    },
    
    update: function () {
        this.moveLeftPaddle();
        this.moveRightPaddle();
        game.physics.arcade.overlap(this.ballSprite, this.paddleGroup, this.collideWithPaddle, null, this);
        game.physics.arcade.overlap(this.ballSprite, this.mineGroup, this.collideWithMine, null, this);
        game.physics.arcade.overlap(this.ballSprite, this.treesGroup, this.collideWithTrees, null, this);

        if (this.ballSprite.body.blocked.up || this.ballSprite.body.blocked.down || this.ballSprite.body.blocked.left || this.ballSprite.body.blocked.right) {

        }

        if (this.healthLeft<90 && this.woodLeft>49) {
            this.healthLeft += 10;
            this.woodLeft -= 50;
            this.updateScoreTextFields();
            this.healthBarRight.width = this.healthRight*2;
        }
        if (this.healthRight<90 && this.woodRight>49) {
            this.healthRight += 10;
            this.woodRight -= 50;
            this.updateScoreTextFields();
            this.healthBarRight.width = this.healthRight*2;
        }
        if (this.scoreLeft>9) {
            this.scoreLeft-=10;
            this.updateScoreTextFields();
            var human = game.add.sprite(70, this.paddleLeftSprite.y, graphicAssets.humanChampionName);
            human.anchor.set(0.5, 0.5);
            game.physics.enable(human, Phaser.Physics.ARCADE);
            human.body.velocity.x = 250;
            human.checkWorldBounds = true;
            human.events.onOutOfBounds.add(this.humanChampionOutOfBounds, this);
            this.humans.add(human);
        }
        if (this.scoreRight>9) {
            this.scoreRight-=10;
            this.updateScoreTextFields();
            var orc = game.add.sprite(730, this.paddleRightSprite.y, graphicAssets.gruntChampionName);
            orc.anchor.set(0.5, 0.5);
            game.physics.enable(orc, Phaser.Physics.ARCADE);
            orc.body.velocity.x = -250;
            orc.checkWorldBounds = true;
            orc.events.onOutOfBounds.add(this.orcChampionOutOfBounds, this);
            this.orcs.add(orc);
        }

        if (this.paddleLeft_summon.isDown && this.scoreLeft>4) {
            this.scoreLeft-=5;
            this.updateScoreTextFields();
            var human = game.add.sprite(70, this.paddleLeftSprite.y, graphicAssets.humanName);
            human.anchor.set(0.5, 0.5);
            game.physics.enable(human, Phaser.Physics.ARCADE);
            human.body.velocity.x = 150;
            human.checkWorldBounds = true;
            human.events.onOutOfBounds.add(this.humanOutOfBounds, this);
            this.humans.add(human);
        }
        if ((this.paddleRight_summon.isDown ||  this.isAI) && this.scoreRight>4) {
            this.scoreRight-=5;
            this.updateScoreTextFields();
            var orc = game.add.sprite(730, this.paddleRightSprite.y, graphicAssets.gruntName);
            orc.anchor.set(0.5, 0.5);
            game.physics.enable(orc, Phaser.Physics.ARCADE);
            orc.body.velocity.x = -150;
            orc.checkWorldBounds = true;
            orc.events.onOutOfBounds.add(this.orcOutOfBounds, this);
            this.orcs.add(orc);
        }
    },
    
    initGraphics: function () {
        //this.bkSprite = game.add.sprite(0, 0, graphicAssets.bkName);

        game.add.sprite(fontAssets.scoreLeft_x-40, fontAssets.scoreTop_y-10, graphicAssets.goldName);
        game.add.sprite(fontAssets.scoreRight_x-40, fontAssets.scoreTop_y-10, graphicAssets.goldName);
        game.add.sprite(fontAssets.scoreLeft_x-40, fontAssets.scoreTop_y+32, graphicAssets.woodName);
        game.add.sprite(fontAssets.scoreRight_x-40, fontAssets.scoreTop_y+32, graphicAssets.woodName);

        this.backgroundGraphics = game.add.graphics(0, 0);
        this.backgroundGraphics.lineStyle(2, 0xFFFFFF, 1);
        this.game.stage.backgroundColor = "#7fbb7a";

        for (var y = 0; y < gameProperties.screenHeight; y += gameProperties.dashSize * 2) {
            this.backgroundGraphics.moveTo(game.world.centerX, y);
            this.backgroundGraphics.lineTo(game.world.centerX, y + gameProperties.dashSize);
        }
        
        this.ballSprite = game.add.sprite(game.world.centerX, game.world.centerY, graphicAssets.ballName);
        this.ballSprite.anchor.set(0.5, 0.5);



        this.paddleLeftSprite = game.add.sprite(gameProperties.paddleLeft_x, game.world.centerY, graphicAssets.paddleName);
        this.paddleLeftSprite.anchor.set(0.5, 0.5);
        
        this.paddleRightSprite = game.add.sprite(gameProperties.paddleRight_x, game.world.centerY, graphicAssets.orcPaddleName);
        this.paddleRightSprite.anchor.set(0.5, 0.5);
        
        this.tf_scoreLeft = game.add.text(fontAssets.scoreLeft_x, fontAssets.scoreTop_y, "0", fontAssets.scoreFontStyle);
        this.tf_scoreLeft.anchor.set(0, 0);

        this.tf_woodLeft = game.add.text(fontAssets.scoreLeft_x, fontAssets.scoreTop_y + 40, "0", fontAssets.scoreFontStyle);
        this.tf_woodLeft.anchor.set(0, 0);

        this.tf_scoreRight = game.add.text(fontAssets.scoreRight_x, fontAssets.scoreTop_y, "0", fontAssets.scoreFontStyle);
        this.tf_scoreRight.anchor.set(0, 0);

        this.tf_woodRight = game.add.text(fontAssets.scoreRight_x, fontAssets.scoreTop_y + 40, "0", fontAssets.scoreFontStyle);
        this.tf_woodRight.anchor.set(0, 0);
        
        this.instructions = game.add.text(game.world.centerX, game.world.centerY, labels.clickToStart, fontAssets.instructionsFontStyle);
        this.instructions.anchor.set(0.5, 0.5);
        
        this.winnerLeft = game.add.text(gameProperties.screenWidth * 0.25, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
        this.winnerLeft.anchor.set(0.5, 0.5);
        
        this.winnerRight = game.add.text(gameProperties.screenWidth * 0.75, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
        this.winnerRight.anchor.set(0.5, 0.5);
        
        this.hideTextFields();
    },
    
    initPhysics: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.enable(this.ballSprite, Phaser.Physics.ARCADE);

        this.ballSprite.checkWorldBounds = true;
        this.ballSprite.body.collideWorldBounds = true;
        this.ballSprite.body.immovable = true;
        this.ballSprite.body.bounce.set(1);
        this.ballSprite.events.onOutOfBounds.add(this.ballOutOfBounds, this);
        
        this.paddleGroup = game.add.group();

        this.paddleGroup.enableBody = true;
        this.paddleGroup.physicsBodyType = Phaser.Physics.ARCADE;

        this.paddleGroup.add(this.paddleLeftSprite);
        this.paddleGroup.add(this.paddleRightSprite);
        
        this.paddleGroup.setAll('checkWorldBounds', true);
        this.paddleGroup.setAll('body.collideWorldBounds', true);
        this.paddleGroup.setAll('body.immovable', true);

        this.humans = game.add.group();
        this.orcs = game.add.group();
    },
    
    initKeyboard: function () {
        this.paddleLeft_up = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.paddleLeft_down = game.input.keyboard.addKey(Phaser.Keyboard.Z);
        this.paddleLeft_summon = game.input.keyboard.addKey(Phaser.Keyboard.S);

        this.paddleRight_up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.paddleRight_down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.paddleRight_summon = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.spaceKey.onDown.add(this.togglePause, this);
    },
    
    initSounds: function () {
    },
    
    startDemo: function () {
        this.ballSprite.visible = false;
        this.resetBall();
        this.enablePaddles(false);
        this.enableBoundaries(true);
        game.input.onDown.add(this.startGame, this);
        
        this.instructions.visible = true;

    },
    
    startGame: function () {
        if(game.input.x>400)
        {
            this.isAI = 1;
        } else
        {
            this.isAI = 0;
        }
        this.healthLeft = 100;
        this.healthRight = 100;
        game.input.onDown.remove(this.startGame, this);
        
        this.enablePaddles(true);
        this.enableBoundaries(false);
        this.resetBall();
        this.resetScores();
        this.hideTextFields();

        this.mineSprites = new Array(gameProperties.mineCount);

        for(var i = 0; i<gameProperties.mineCount; i++)
        {
            this.mineSprites[i] = game.add.sprite(game.rnd.integerInRange(200, game.world.width-200), game.rnd.integerInRange(80, game.world.height-80), graphicAssets.mineName);
            this.mineSprites[i].anchor.set(0.5, 0.5);
        }
        this.mineGroup = game.add.group();
        this.mineGroup.enableBody = true;
        this.mineGroup.physicsBodyType = Phaser.Physics.ARCADE;

        for(var i = 0; i<gameProperties.mineCount; i++)
        {
            this.mineGroup.add(this.mineSprites[i]);
        }


        this.mineGroup.setAll('checkWorldBounds', true);
        this.mineGroup.setAll('body.collideWorldBounds', true);
        this.mineGroup.setAll('body.immovable', true);

        this.treesSprites = new Array(gameProperties.mineCount);

        for(var i = 0; i<gameProperties.mineCount; i++)
        {
            this.treesSprites[i] = game.add.sprite(game.rnd.integerInRange(200, game.world.width-200), game.rnd.integerInRange(80, game.world.height-80), graphicAssets.treesName);
            this.treesSprites[i].anchor.set(0.5, 0.5);
        }
        this.treesGroup = game.add.group();
        this.treesGroup.enableBody = true;
        this.treesGroup.physicsBodyType = Phaser.Physics.ARCADE;

        this.treesGroup.setAll('body.immovable', true);

        for(var i = 0; i<gameProperties.mineCount; i++)
        {
            this.treesGroup.add(this.treesSprites[i]);
        }

        var bmdBk = game.add.bitmapData(210,25);
        bmdBk.ctx.beginPath();
        bmdBk.ctx.rect(0,0,210,30);
        bmdBk.ctx.fillStyle = '#151515';
        bmdBk.ctx.fill();
        game.add.sprite(45,545,bmdBk);

        var bmdrBk = game.add.bitmapData(210,25);
        bmdrBk.ctx.beginPath();
        bmdrBk.ctx.rect(0,0,210,30);
        bmdrBk.ctx.fillStyle = '#151515';
        bmdrBk.ctx.fill();
        game.add.sprite(545,545,bmdrBk);

        var bmdBk = game.add.bitmapData(200,15);
        bmdBk.ctx.beginPath();
        bmdBk.ctx.rect(0,0,200,30);
        bmdBk.ctx.fillStyle = '#a63d2d';
        bmdBk.ctx.fill();
        game.add.sprite(50,550,bmdBk);

        var bmdrBk = game.add.bitmapData(200,15);
        bmdrBk.ctx.beginPath();
        bmdrBk.ctx.rect(0,0,200,30);
        bmdrBk.ctx.fillStyle = '#a63d2d';
        bmdrBk.ctx.fill();
        game.add.sprite(550,550,bmdrBk);

        var bmd = game.add.bitmapData(200,15);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,200,30);
        bmd.ctx.fillStyle = '#23956e';
        bmd.ctx.fill();

        var bmdr = game.add.bitmapData(200,15);
        bmdr.ctx.beginPath();
        bmdr.ctx.rect(0,0,200,30);
        bmdr.ctx.fillStyle = '#23956e';
        bmdr.ctx.fill();

        this.healthBarLeft = game.add.sprite(50,550,bmd);
        this.healthBarRight = game.add.sprite(550,550,bmdr);
    },
    
    startBall: function () {
        this.ballVelocity = gameProperties.ballVelocity;
        this.ballReturnCount = 0;
        this.ballSprite.visible = true;
        this.lastSide=0;
        var randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight.concat(gameProperties.ballRandomStartingAngleLeft));
        
        if (this.missedSide == 'right') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight);
        } else if (this.missedSide == 'left') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleLeft);
        }

        game.physics.arcade.velocityFromAngle(randomAngle, gameProperties.ballVelocity, this.ballSprite.body.velocity);
    },
    
    resetBall: function () {
        this.ballSprite.reset(game.world.centerX, game.rnd.between(0, gameProperties.screenHeight));
        this.ballSprite.visible = false;
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballStartDelay, this.startBall, this);
    },
    
    enablePaddles: function (enabled) {
        this.paddleGroup.setAll('visible', enabled);
        this.paddleGroup.setAll('body.enable', enabled);
        
        this.paddleLeft_up.enabled = enabled;
        this.paddleLeft_down.enabled = enabled;
        this.paddleRight_up.enabled = enabled;
        this.paddleRight_down.enabled = enabled;
        
        this.paddleLeftSprite.y = game.world.centerY;
        this.paddleRightSprite.y = game.world.centerY;
    },
    
    enableBoundaries: function (enabled) {
        game.physics.arcade.checkCollision.left = enabled;
        game.physics.arcade.checkCollision.right = enabled;
    },
    
    moveLeftPaddle: function () {
        if (this.paddleLeft_up.isDown)
        {
            this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_down.isDown)
        {
            this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
            this.paddleLeftSprite.body.velocity.y = 0;
        }
        
        if (this.paddleLeftSprite.body.y < gameProperties.paddleTopGap) {
            this.paddleLeftSprite.body.y = gameProperties.paddleTopGap;
        }
    },
    
    moveRightPaddle: function () {


        if (this.paddleRight_up.isDown)
        {
            this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_down.isDown)
        {
            this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
            this.paddleRightSprite.body.velocity.y = 0;
        }
        if(this.isAI)
        {
            if(this.ballSprite.position.y + 15 < this.paddleRightSprite.y)
            {
                this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
            }
            else if(this.ballSprite.position.y - 15> this.paddleRightSprite.y)
            {
                this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
            }
            else
            {
                this.paddleRightSprite.body.velocity.y = 0;
            }
        }


        if (this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
            this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
        }
    },
    
    collideWithPaddle: function (ball, paddle) {
        console.log("paddle hit");
        
        var returnAngle;
        var segmentHit = Math.floor((ball.y - paddle.y)/gameProperties.paddleSegmentHeight);
        
        if (segmentHit >= gameProperties.paddleSegmentsMax) {
            segmentHit = gameProperties.paddleSegmentsMax - 1;
        } else if (segmentHit <= -gameProperties.paddleSegmentsMax) {
            segmentHit = -(gameProperties.paddleSegmentsMax - 1);
        }
        
        if (paddle.x < gameProperties.screenWidth * 0.5) {
            returnAngle = segmentHit * gameProperties.paddleSegmentAngle;
            game.physics.arcade.velocityFromAngle(returnAngle+game.rnd.between(0, 10), this.ballVelocity, this.ballSprite.body.velocity);
        } else {
            returnAngle = 180 - (segmentHit * gameProperties.paddleSegmentAngle);
            if (returnAngle > 180) {
                returnAngle -= 360;
            }
            
            game.physics.arcade.velocityFromAngle(returnAngle+game.rnd.between(0, 10), this.ballVelocity, this.ballSprite.body.velocity);
        }
        
        this.ballReturnCount ++;
        if(this.ballSprite.x<400){
            this.lastSide=-1;
        } else
        {
            this.lastSide=1;
        }
        if(this.ballReturnCount >= gameProperties.ballReturnCount) {
            this.ballReturnCount = 0;
            this.ballVelocity += gameProperties.ballVelocityIncrement;
        }
    },
    togglePause: function () {
        game.physics.arcade.isPaused = (game.physics.arcade.isPaused) ? false : true;

    },
    collideWithMine: function (ball, mine) {

        var returnAngle;
        var segmentHit = Math.floor((ball.y - mine.y)/gameProperties.paddleSegmentHeight);

        if (segmentHit >= gameProperties.paddleSegmentsMax) {
            segmentHit = gameProperties.paddleSegmentsMax - 1;
        } else if (segmentHit <= -gameProperties.paddleSegmentsMax) {
            segmentHit = -(gameProperties.paddleSegmentsMax - 1);
        }

        if (mine.x < gameProperties.screenWidth * 0.5) {
            returnAngle = segmentHit * gameProperties.paddleSegmentAngle;
            game.physics.arcade.velocityFromAngle(returnAngle+game.rnd.between(0, 10), this.ballVelocity, this.ballSprite.body.velocity);
        } else {
            returnAngle = 180 - (segmentHit * gameProperties.paddleSegmentAngle);
            if (returnAngle > 180) {
                returnAngle -= 360;
            }

            game.physics.arcade.velocityFromAngle(returnAngle+game.rnd.between(0, 10), this.ballVelocity, this.ballSprite.body.velocity);
        }

        if(this.lastSide==1){
            this.scoreRight++;
            this.mineText(mine);
        } else
        if(this.lastSide==-1){
            this.scoreLeft++;
            this.mineText(mine);
        }
        this.updateScoreTextFields();

        this.ballReturnCount ++;

        if(this.ballReturnCount >= gameProperties.ballReturnCount) {
            this.ballReturnCount = 0;
            this.ballVelocity += gameProperties.ballVelocityIncrement;
        }
    },
    mineText: function (mine) {
        this.instructions = this.add.text( -10 + mine.x + game.rnd.between(0, 20), mine.y- 20 - game.rnd.between(0, 20),
            '+1 Gold',
            {font: '14px Courier New', fill: '#fffa31', align: 'center'}
        );
        this.instructions.anchor.setTo(0.5, 0.5);
        this.time.events.add(1000, this.instructions.destroy, this.instructions);
    },

    collideWithTrees: function (ball, tree) {


        if(this.lastSide==1){
            this.woodRight++;
            this.treeText(tree);
        } else
        if(this.lastSide==-1){
            this.woodLeft++;
            this.treeText(tree);
        }
        this.updateScoreTextFields();

    },

    treeText: function (tree) {
        this.instructions = this.add.text( -10 + tree.x + game.rnd.between(0, 20), tree.y- 20 - game.rnd.between(0, 20),
            '+1 Wood',
            {font: '14px Courier New', fill: '#7e2e0b', align: 'center'}
        );
        this.instructions.anchor.setTo(0.5, 0.5);
        this.time.events.add(1000, this.instructions.destroy, this.instructions);
    },

    humanOutOfBounds: function () {
        var barWidth = this.healthBarLeft.width;
        this.healthRight -=8;
        this.healthBarRight.width = this.healthRight*2;
        if(this.healthRight <= 0){
            this.humans.forEach(function (c) { c.kill(); });
            this.orcs.forEach(function (c) { c.kill(); });
            this.mineSprites.forEach(function (c) { c.kill(); });
            this.startDemo();
            this.winnerLeft.visible = true;
        }
    },

    orcOutOfBounds: function () {
        var barWidth = this.healthBarLeft.width;
        this.healthLeft -=8;
        this.healthBarLeft.width = this.healthLeft*2;
        if(this.healthLeft <= 0){
            this.orcs.forEach(function (c) { c.kill(); });
            this.humans.forEach(function (c) { c.kill(); });
            this.mineSprites.forEach(function (c) { c.kill(); });
            this.startDemo();
            this.winnerRight.visible = true;
        }
    },

    humanChampionOutOfBounds: function () {
        var barWidth = this.healthBarLeft.width;
        this.healthRight -=20;
        this.healthBarRight.width = this.healthRight*2;
        if(this.healthRight <= 0){
            this.humans.forEach(function (c) { c.kill(); });
            this.orcs.forEach(function (c) { c.kill(); });
            this.mineSprites.forEach(function (c) { c.kill(); });
            this.startDemo();
            this.winnerLeft.visible = true;
        }
    },

    orcChampionOutOfBounds: function () {
        var barWidth = this.healthBarLeft.width;
        this.healthLeft -=20;
        this.healthBarLeft.width = this.healthLeft*2;
        if(this.healthLeft <= 0){
            this.orcs.forEach(function (c) { c.kill(); });
            this.humans.forEach(function (c) { c.kill(); });
            this.mineSprites.forEach(function (c) { c.kill(); });
            this.treesSprites.forEach(function (c) { c.kill(); });
            this.startDemo();
            this.winnerRight.visible = true;
        }
    },

    ballOutOfBounds: function () {
        this.lastSide=0;
        
        if (this.ballSprite.x < 0) {
            this.missedSide = 'left';
            this.scoreLeft=0;
        } else if (this.ballSprite.x > gameProperties.screenWidth) {
            this.missedSide = 'right';
            this.scoreRight=0;
        }
        
        this.updateScoreTextFields();

        this.resetBall();
        /*
        if (this.scoreLeft >= gameProperties.scoreToWin) {
            this.winnerLeft.visible = true;
            this.startDemo();
        } else if (this.scoreRight >= gameProperties.scoreToWin) {
            this.winnerRight.visible = true;
            this.startDemo();
        } else {

        }*/
    },
    
    resetScores: function () {
        this.scoreLeft = 0;
        this.scoreRight = 0;
        this.woodRight = 0;
        this.woodLeft = 0;
        this.updateScoreTextFields();
    },
    
    updateScoreTextFields: function () {
        this.tf_scoreLeft.text = "Gold: " + this.scoreLeft;
        this.tf_scoreRight.text = "Gold: " + this.scoreRight;
        this.tf_woodLeft.text = "Wood: " + this.woodLeft;
        this.tf_woodRight.text = "Wood: " + this.woodRight ;
    },
    
    hideTextFields: function () {
        this.instructions.visible = false;
        this.winnerLeft.visible = false;
        this.winnerRight.visible = false;
    },
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');