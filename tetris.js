(function($){

  var tetris = tetris || {};
  var game = {};
  var isMoveHappening = false;

  var darkColor = '#00A299';
  var lightColor = '#00D0C6';

  var stage, layer, currentBlock, deadBlocks, deadBlocksObj, layerHUD, scoreText, gameInterval, gameTimerThen, gameTimerNow, pauseGameNotification, gameOverGroup;

  // Blue prints for all the block options
  var blueprints = [ [[ 1, 1, 1, 1 ],[ 0, 0, 0, 0 ]], [[ 1, 1, 1, 0 ],[ 0, 0, 1, 0 ]], [[ 1, 1, 1, 0 ],[ 1, 0, 0, 0 ]], [[ 1, 1, 1, 0 ],[ 0, 1, 0, 0 ]],[[ 1, 1, 0, 0 ],[ 0, 1, 1, 0 ]],[[ 0, 1, 1, 0 ],[ 1, 1, 0, 0 ]],[[ 1, 1, 0, 0 ],[ 1, 1, 0, 0 ]] ];


  // Init canvas, add to page
  // Set controls key binds
  // Left: [a], Right: [d], Down: [s], Rotate: [space]
  tetris.init = function() {

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
    game.data.gameover = false;
    game.data.width  = stage.attrs.width;
    game.data.height = stage.attrs.height;

    var combos = [
      {
        "keys"          : "a",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          if(!game.data.pause && !game.data.gameover)
            tetris.moveBlock(-19,0);
        }
      },
      {
        "keys"          : "s",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          if(!game.data.pause && !game.data.gameover)
            tetris.moveBlock(0,19);
        }
      },
      {
        "keys"          : "d",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          if(!game.data.pause && !game.data.gameover)
            tetris.moveBlock(19,0);
        }
      },
      {
        "keys"          : "w",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          if(!game.data.pause && !game.data.gameover)
            tetris.rotateBlock();
        }
      },
      {
        "keys"          : "enter",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          if(!game.data.gameover && game.data)
            tetris.pauseGame();
        }
      },
      {
        "keys"          : "escape",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          if(game.data.gameover) {
            tetris.reset();
            tetris.run();
          }
        }
      }
    ];

    keypress.register_many(combos);

    tetris.reset();
    tetris.run();
  }


  // Begin game
  tetris.run = function() {

    then = Date.now();
    gameInterval = setInterval(tetris.gameLoop, 10); 

  }


  // Main Game Loop
  tetris.gameLoop = function(){

      now = Date.now();
      var delta = now - then;

      if( delta >= (1000 - game.data.speed)){
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
      tetris.checkForGameOver();
    }
  }

  tetris.render = function() {
    stage.draw();
  }

  tetris.checkForGameOver = function() {

    if(deadBlocksObj[38]){
      if(console.log) console.log("game over sucker");
      game.data.gameover = true;
      clearInterval(gameInterval);
      gameOverGroup = new Kinetic.Group({
        width: 200,
        height: 120,
        x: game.data.width/2,
        y: game.data.height/2,
        offset: {
          x: 100,
          y: 60
        }
      });
      gameOverBox  = new Kinetic.Rect({
        x: 0,
        y: 0,
        fill: darkColor,
        width: 200,
        height: 120
      });
      gameOverText = new Kinetic.Text({
        x: 6,
        y: 42,
        text: "GAME OVER\n[ESC] TO RESTART",
        lineHeight: 1.3,
        fontSize: 20,
        fontFamily: "Helvetica",
        fontStyle: "bold",
        align: 'center',
        fill: lightColor
      });

      gameOverGroup.add(gameOverBox);
      gameOverGroup.add(gameOverText);
      layer.add(gameOverGroup);
      layer.draw();
    }

  }


  tetris.reset = function() {
    
    if(gameInterval)
      clearInterval(gameInterval);

    game.data = {};
    game.data.score  = 0;
    game.data.speed  = 100;
    game.data.pause = false;
    game.data.gameover = false;
    game.data.width  = stage.attrs.width;
    game.data.height = stage.attrs.height;

    layer.removeChildren();

    tetris.setScore(0);
    tetris.createBlock();

    if(deadBlocksObj) {
      layer.add(deadBlocks);
      deadBlocksObj = {};
      tetris.rebuildDeadBlocks();
    }

    if(gameOverGroup)
      gameOverGroup.destroy();

  }


  // Sets currentBlock as part of oldBlocks, spawns new block
  tetris.killBlock = function() {

    // If we haven't made the deadBlocks group, init it
    if(!deadBlocks){
      deadBlocksObj = {};
      deadBlocks = new Kinetic.Group();
      layer.add(deadBlocks);
      deadBlocks.moveToTop();
      layer.draw();
    }

    // Make currentBlock part of the deadBlocks
    tetris.convertToDeadBlocks();

    currentBlock.destroy();
    
    // Check for Complete Lines
    tetris.checkLines();

    // Make a new currentBlock
    tetris.createBlock();

    return;
    
  }


  // Spawn a block set it as main piece
  tetris.createBlock = function() {

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
            fill: darkColor,
            stroke: lightColor,
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


  tetris.correctForRotation = function(rotation){

      var cX = 0;
      var cY = 0; 

      // Corrent for rotation of parent
      switch (rotation){
        case 0:
          cX = 0;
          cY = 0;
          break;
        case 90:
          cX = -19;
          cY = 0;
          break;
        case 180:
          cX = -19;
          cY = -19;
          break;
        case 270:
          cX = 0;
          cY = -19;
          break;
      }
      return {x: cX, y: cY};

  }


  tetris.convertToDeadBlocks = function() {

    // Add pixels from currentBlock to deadBlocks group
    var pixels = currentBlock.getChildren();
    pixels.forEach(function(v, i, a){

      pixelR = currentBlock.getRotationDeg();
      deadCoords = {};

      correctBy = tetris.correctForRotation(pixelR);
      deadCoords.x = v.getAbsolutePosition().x + correctBy.x;
      deadCoords.y = v.getAbsolutePosition().y + correctBy.y;
      deadBlocks.add(v.clone({ x: deadCoords.x , y: deadCoords.y }));

      if(!deadBlocksObj['' + deadCoords.y])
        deadBlocksObj['' + deadCoords.y] = [];

      deadBlocksObj[''+ deadCoords.y].push(''+ deadCoords.x);

    });

    tetris.util();

  }


  tetris.checkLines = function() {

    var completedLines = [];

    if(!deadBlocksObj)
      return false;
    else {

      // Break obj into it's rows, each row's key is it's y value
      $.each(deadBlocksObj, function(i, v) {
        if(v.length === 10) { // If a line has 10 items, it's whole, remove it
          completedLines.push(i)
          v = [];
        }
      });

    }

    if(completedLines.length !== 0){
      tetris.removeLines(completedLines);
    }

  }


  tetris.removeLines = function(y){

    tetris.calculateDeadBlocksObj(y);

    tetris.rebuildDeadBlocks();

    tetris.setScore(game.data.score + y.length);
    layer.draw();

  }


  tetris.calculateDeadBlocksObj = function(y) {

    newDeadBlocksObj = {};

    // Iterate over the remaining deadBlockObj keys
    $.each(deadBlocksObj, function(i, v){

      // if this key is less that the one we removed (i.e. above)
      if( parseInt(i) < parseInt( y.sort()[0] ) ) {

        // copy it to the 'next' key depending on the number of rows we're removing
        newDeadBlocksObj['' + (parseInt(i) + (y.length * 19) )] = deadBlocksObj['' + parseInt(i)];

      // if this key is greater than the one we're removing (i.e. below)
      } else if (parseInt(i) > parseInt( y.sort().reverse()[0] )) {

        // copy it over to the same key
        newDeadBlocksObj['' + (parseInt(i))] = deadBlocksObj['' + parseInt(i)];

      // If the key is the one we are removing, don't move it over to new obj
      } else {
      }

    });

    // Reset our Obj  & set to the one we just rebuilt
    deadBlocksObj = {};
    deadBlocksObj = newDeadBlocksObj;
    
  }


  tetris.rebuildDeadBlocks = function() {

    deadBlocks.removeChildren();

    $.each(deadBlocksObj, function(y, xArray){

      xArray.forEach(function(x,i,a){
        
        var newDeadBlock = new Kinetic.Rect({
          x: x,
          y: y,
          width: 19,
          height: 19,
          fill: darkColor,
          stroke: lightColor,
          strokeWidth: 1,
          opacity: 1
        });
        deadBlocks.add(newDeadBlock);

      });

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

      return !(tetris.checkForDeadBlockCollision(xMove, yMove, degree));

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
        yFix = -((yDest + currHeight) - BottomBounds);
      }

      tetris.resolveRotate( xFix, yFix, degree);
      return true;
    } else {
      return false;
    }

  }


  // Check for collisions with dead blocks, returns BOOL
  tetris.checkForDeadBlockCollision = function(xMove, yMove, degree){

    var didCollide = false;

    if(!deadBlocksObj)
      return didCollide;

    pixelR = currentBlock.getRotationDeg();

    pixels = currentBlock.getChildren();
    pixels.forEach(function(v,i,a){

      newCoords = {};
      correctBy = tetris.correctForRotation(pixelR);
      newCoords.x = v.getAbsolutePosition().x + correctBy.x + xMove;
      newCoords.y = v.getAbsolutePosition().y + correctBy.y + yMove;

      // Check if a row of pixels is even at the newCoords.y
      if(deadBlocksObj['' + newCoords.y ]) {

        deadBlocksObj['' + newCoords.y ].forEach(function(v,i,a){

          if(parseInt(v) == parseInt(newCoords.x))
            didCollide = true;

        });

      }
      

    });
    
    return didCollide;

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
      points: [ 200, 40, 200, 442, 400, 442, 400, 40 ],
      stroke: darkColor,
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
      fill: darkColor
    });
    scoreText = new Kinetic.Text({
      x: 0,
      y: 30,
      text: '0',
      fontSize: 20,
      fontFamily: "Helvetica",
      fill: darkColor
    });

    scoreGroup.add(scoreTitle);
    scoreGroup.add(scoreText);

    layerHUD.add(scoreGroup);
    layerHUD.add(container);
    stage.add(layerHUD);

  }


  // Util game functions
  //
  tetris.setSpeed = function(speed) {

    game.data.speed = 100 + (speed * 10);

  }


  tetris.setScore = function(score) {

    game.data.score = score;
    scoreText.setText(score);
    layerHUD.draw();
    tetris.setSpeed(score);

  }


  tetris.pauseGame = function(){
  
    // Game is already paused, restart interval
    if(game.data.pause) {

      pauseGameNotification.destroy();
      gameInterval = setInterval(tetris.gameLoop, 10);
      game.data.pause = false;

    } else {
      pauseGameNotification = new Kinetic.Group({
        width: 200,
        height: 120,
        x: game.data.width/2,
        y: game.data.height/2,
        offset: {
          x: 100,
          y: 60
        }
      });
      pauseBox  = new Kinetic.Rect({
        x: 0,
        y: 0,
        fill: darkColor,
        width: 200,
        height: 120
      });
      pauseText = new Kinetic.Text({
        x: 6,
        y: 42,
        text: "GAME PAUSED\n[ENTER] TO RESUME",
        lineHeight: 1.3,
        fontSize: 18,
        fontFamily: "Helvetica",
        fontStyle: "bold",
        align: 'center',
        fill: lightColor
      });

      pauseGameNotification.add(pauseBox);
      pauseGameNotification.add(pauseText);

      layer.add(pauseGameNotification);
      layer.draw();
      clearInterval(gameInterval);
      game.data.pause = true;
    }

  }


  tetris.util = function() {
//    console.log("deadBlocksObj:");
//    console.log(deadBlocksObj);
//
//    console.log("deadBlocks:");
//    console.log(deadBlocks);
  }

  window.tetris = tetris;

})(jQuery);
