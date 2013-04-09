(function($){

  var tetris = tetris || {};
  var game = {};
  var isMoveHappening = false;

  var stage, layer, currentBlock, deadBlocks, layerHUD, scoreText, gameInterval, gameTimerThen, gameTimerNow;


  // Init canvas, add to page
  // Set controls key binds
  // Left: [a], Right: [d], Down: [s], Rotate: [space]
  tetris.init = function() {

    console.log("Initializing");

    stage = new Kinetic.Stage({
      container: 'game',
      width: 600,
      height: 480
    });

    layer = new Kinetic.Layer();
    stage.add(layer);


    tetris.initHUD();

    game.data = {};
    game.data.score  = 0;
    game.data.speed  = 100;
    game.data.pause = false;
    game.data.width  = stage.attrs.width;
    game.data.height = stage.attrs.height;

    var combos = [
      {
        "keys"          : "a",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          tetris.moveBlock(-19,0);
        }
      },
      {
        "keys"          : "s",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          tetris.moveBlock(0,19);
        }
      },
      {
        "keys"          : "d",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          tetris.moveBlock(19,0);
        }
      },
      {
        "keys"          : "space",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          tetris.rotateBlock();
        }
      },
      {
        "keys"          : "enter",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          tetris.pauseGame();
        }
      }
    ];

    keypress.register_many(combos);

    tetris.reset();
    tetris.run();
  }


  // Begin game
  tetris.run = function() {

    console.log("Running Tetris");

    then = Date.now();
    gameInterval = setInterval(tetris.gameLoop, 10); 

  }


  // Main Game Loop
  tetris.gameLoop = function(){

      now = Date.now();
      var delta = now - then;

      if( delta >= 1000 - game.data.speed){
        tetris.update(delta);
        then = now;
      }


  }


  tetris.update = function(mod) {
    var currentR = currentBlock.getRotationDeg();

    if(tetris.testForValidMove(0, 19, currentR)) {
      tetris.moveBlock(0,19, true);
    } else {
      tetris.killBlock();
    }
  }

  tetris.render = function() {
    stage.draw();
  }


  tetris.reset = function() {
    
    console.log("Resetting Game");

    if(gameInterval)
      clearInterval(gameInterval);
    game.data.speed = 1;
    game.data.pause = false;
    layer.removeChildren();
    layer.draw();
    tetris.setScore(0);
    tetris.createBlock();

    return;

  }


  // Sets currentBlock as part of oldBlocks, spawns new block
  tetris.killBlock = function() {

    // If we haven't made the deadBlocks group, init it
    if(!deadBlocks){
      deadBlocks = new Kinetic.Group();
      layer.add(deadBlocks);
      deadBlocks.moveToTop();
      layer.draw();
    }

    // Make currentBlock part of the deadBlocks
    tetris.convertToDeadBlocks();

    currentBlock.destroy();
    layer.draw();
    
    // Check for Complete Lines
    tetris.checkLines();

    // Make a new currentBlock
    tetris.createBlock();

    return;
    
  }


  // Spawn a block set it as main piece
  tetris.createBlock = function() {

    // Blue prints for all the block options
    blueprints = [
      [
        [ 1, 1, 1, 1 ],
        [ 0, 0, 0, 0 ]
      ],

      [
        [ 1, 1, 1, 0 ],
        [ 0, 0, 1, 0 ]
      ],

      [
        [ 1, 1, 1, 0 ],
        [ 1, 0, 0, 0 ]
      ],

      [
        [ 1, 1, 1, 0 ],
        [ 0, 1, 0, 0 ]
      ],

      [
        [ 1, 1, 0, 0 ],
        [ 0, 1, 1, 0 ]
      ],

      [
        [ 0, 1, 1, 0 ],
        [ 1, 1, 0, 0 ]
      ],

      [
        [ 1, 1, 0, 0 ],
        [ 1, 1, 0, 0 ]
      ]

    ];

    blueprint = blueprints[Math.floor(Math.random()*blueprints.length)];


    var blockPiece = new Kinetic.Group({
      x: game.data.width/2,
      y: 19
    });

    var blockWidth = 0;
    var blockHeight = 0;

    // for each 'row'
    blueprint.forEach(function(rowValue, rowIndex, blueprint){

      // for each 'pixel' in each 'row'
      rowValue.forEach(function(pixelValue, pixelIndex, row){

        if(pixelValue){

          pixel = new Kinetic.Rect({
            x: pixelIndex * 19,
            y: rowIndex * 19,
            width: 19,
            height: 19,
            fill: '#00A299',
            stroke: '#00D0C6',
            strokeWidth: 1,
            opacity: 1
          });

          blockPiece.add(pixel);
          if(blockWidth < 19 + (pixelIndex * 19))
            blockWidth = 19 + (pixelIndex * 19);
          if (blockHeight < 19 + (rowIndex * 19))
            blockHeight = 19 + (rowIndex * 19);

        }

      });

    });

    blockPiece.setSize(blockWidth, blockHeight);

    currentBlock = blockPiece;
    layer.add(currentBlock);
    layer.draw();

    return;

  }

  tetris.convertToDeadBlocks = function() {

    // Add pixels from currentBlock to deadBlocks group
    var pixels = currentBlock.getChildren();
    pixels.forEach(function(v, i, a){

      deadBlocks.add(v.clone({ x: v.getAbsolutePosition().x , y: v.getAbsolutePosition().y, rotationDeg: currentBlock.getRotationDeg() }));

    });

  }

  tetris.checkLines = function() {

    console.log("checking for completed lines");
    oldBlocks = deadBlocks.getChildren();
    oldBlocks.forEach(function(v,i,a){

    });

  }


  // Remedial Collision detection - returns BOOL
  tetris.testForValidMove = function(xMove, yMove, degree){

    
    var LeftBounds = 205;
    var RightBounds = 395;
    var BottomBounds = 437;
    var isValidMove = false;

    var blockSize = currentBlock.getSize();
    var xPos  = currentBlock.attrs.x;
    var yPos  = currentBlock.attrs.y;
    var xDest = xPos + xMove;
    var yDest = yPos + yMove;
    var currWidth, currHeight;


    // Calculate current width/height based on rotation
    var rotation = degree;
    switch (rotation) {
      case 0:
        currWidth = blockSize.width;
        currHeight = blockSize.height;
        if( xDest >= LeftBounds && ( xDest + currWidth ) <= RightBounds && ( yDest + currHeight) <= BottomBounds ) isValidMove = true;
        break;
      case 90:
        currWidth = -blockSize.height;
        currHeight = blockSize.width;
        if( ( xDest + currWidth ) >= LeftBounds && xDest <= RightBounds && ( yDest + currHeight ) <= BottomBounds ) isValidMove = true;
        break;
      case 180:
        currWidth = -blockSize.width;
        currHeight = blockSize.height;
        if( ( xDest + currWidth ) >= LeftBounds && xDest <= RightBounds && yDest <= BottomBounds ) isValidMove = true;
        break;
      case 270:
        currWidth = blockSize.height;
        currHeight = -blockSize.width;
        if( xDest >= LeftBounds && ( xDest + currWidth ) <= RightBounds && yDest <= BottomBounds ) isValidMove = true;
        break;
    }



    if(isValidMove) {
//      console.log("check for collisions with deadblocks");
      return true;
    } else if( !isValidMove && !xMove && !yMove ){
      xFix = 0;
      yFix = 0;

      // Breaking left bounds?
      if((xDest + currWidth) <= LeftBounds) { 
        xFix = -((xDest + currWidth) - LeftBounds);
      }

      // Breaking right bounds?
      if((xDest + currWidth) >= RightBounds) { 
        xFix = -((xDest + currWidth) - RightBounds);
      }

      // Breaking bottom bounds?
      if((yDest + currHeight) >= BottomBounds) { 
        console.log("broke the bottom");
        yFix = -((yDest + currHeight) - BottomBounds);
      }

      tetris.resolveRotate( xFix, yFix, degree);
      return true;
    } else {
      return false;
    }

  }


  // Input Control logic
  //

  // Move Block
  tetris.moveBlock = function(xD,yD, force) {

    var currentR = currentBlock.getRotationDeg();
    force ? force = force : force = false;

    if(force)  // Use force when you've already tested
      currentBlock.setPosition( currentBlock.attrs.x + xD, currentBlock.attrs.y + yD );
    else if(tetris.testForValidMove(xD, yD, currentR)) {
      currentBlock.setPosition( currentBlock.attrs.x + xD, currentBlock.attrs.y + yD );
    }

    layer.draw();

    return;
  }

  // Rotate Block
  tetris.rotateBlock = function() {
    var currentR = currentBlock.getRotationDeg();
    var targetR = 0;

    if( currentR === 0 || currentR === 90 || currentR === 180 )
      targetR = currentR + 90;
    else if ( currentR === 270 )
      targetR = 0;

    currentR = currentBlock.getRotationDeg();
    if(tetris.testForValidMove(0, 0, targetR)){
      currentBlock.setRotationDeg(targetR);
      stage.draw();
    }

    return;
  }

  // Resolve Rotates that break bounds
  tetris.resolveRotate = function(xD, yD, degree) {
      currentBlock.setRotationDeg(degree);
      currentBlock.setPosition(currentBlock.attrs.x + xD, currentBlock.attrs.y + yD);
      stage.draw();
  }

  tetris.initHUD = function() {

    layerHUD = new Kinetic.Layer();
    var container = new Kinetic.Line({
      points: [ 200, 40, 200, 440, 400, 440, 400, 40 ],
      stroke: '#00A299',
      strokeWidth: 1
    });

    var scoreGroup = new Kinetic.Group({
      x: 430,
      y: 370
    });
    var scoreTitle = new Kinetic.Text({
      x: 0,
      y: 0,
      text: 'Score:',
      fontSize: 20,
      fontFamily: "Helvetica",
      fill: '#00A299'
    });
    scoreText = new Kinetic.Text({
      x: 0,
      y: 30,
      text: '0',
      fontSize: 20,
      fontFamily: "Helvetica",
      fill: '#00A299'
    });

    scoreGroup.add(scoreTitle);
    scoreGroup.add(scoreText);

    layerHUD.add(scoreGroup);
    layerHUD.add(container);
    stage.add(layerHUD);

  }


  tetris.setScore = function(score) {

    game.data.score = score;
    scoreText.setText(score);
    layerHUD.draw();
    

  }

  tetris.pauseGame = function(){
  
    // Game is already paused, restart interval
    if(game.data.pause) {
      gameInterval = setInterval(tetris.gameLoop, 10);
      game.data.pause = false;
    }
    else {
      clearInterval(gameInterval);
      game.data.pause = true;
    }

    console.log("pause game " + game.data.pause);

  }

  tetris.util = function() {
    oldBlocks = deadBlocks.getChildren();

    oldBlocks.forEach(function(v,i,a){

      console.log("old block position:");
      console.log(v.getPosition());

    });
  }

  window.tetris = tetris;

})(jQuery);
