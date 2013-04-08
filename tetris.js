(function($){

  var tetris = tetris || {};
  var game = {};

  var stage, layer, currentBlock, layerHUD;


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
    game.data.speed  = 1;
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
      }
    ];

    keypress.register_many(combos);
    tetris.run();
  }


  // Begin game
  tetris.run = function() {

    console.log("Running Tetris");

    tetris.createBlock();

  }


  tetris.reset = function() {
    
    console.log("Resetting Game");

    layer.removeChildren();
    layer.draw();
    tetris.setScore(0);

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
      y: 19,
//      offset: {
//        x: 19,
//        y: 19
//      }
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


    // test point - remove later
    blockPiece.add( new Kinetic.Circle({

      x:0,
      y:0,
      radius: 1,
      fill: 'red',
      stroke: 'red',
      strokeWidth: 1

    }));
    blockPiece.setSize(blockWidth, blockHeight);

    currentBlock = blockPiece;
    layer.add(currentBlock);
    layer.draw();

    return;

  }


  // Remedial Collision detection - returns BOOL
  tetris.testForHit = function(xMove, yMove){

    
    var LeftBounds = 205;
    var RightBounds = 395;
    var BottomBounds = 437;

    var blockSize = currentBlock.getSize();
    var xPos  = currentBlock.attrs.x;
    var yPos  = currentBlock.attrs.y;
    var xDest = xPos + xMove;
    var yDest = yPos + yMove;
    var currWidth, currHeight;

    console.log("xPos: " + xPos);
    console.log("yPos: " + yPos);
    console.log("xMove: " + xMove);
    console.log("yMove: " + yMove);


    var rotation = currentBlock.getRotationDeg();

    switch (rotation) {
      case 0:
        console.log("rotation 0");
        console.log("current width: " + (blockSize.width/19) + " : current height: " + (blockSize.height/19));
        currWidth = blockSize.width;
        currHeight = blockSize.height;
        if( xDest < LeftBounds || ( xDest + currWidth ) > RightBounds || ( yDest + currHeight) > BottomBounds )
          return true;
        break;
      case 90:
        console.log("rotation 90");
        console.log("current width: -" + (blockSize.height/19) + " : current height: " + (blockSize.width/19));
        currWidth = -blockSize.height;
        currHeight = blockSize.width;
        if( ( xDest + currWidth ) < LeftBounds || xDest > RightBounds || ( yDest + currHeight ) > BottomBounds )
          return true;
        break;
      case 180:
        console.log("rotation 180");
        console.log("current width: -" + (blockSize.width/19) + " : current height: -" + (blockSize.height/19));
        currWidth = -blockSize.width;
        currHeight = blockSize.height;
        if( ( xDest + currWidth ) < LeftBounds || xDest > RightBounds || yDest > BottomBounds )
          return true;
        break;
      case 270:
        console.log("rotation 270");
        console.log("current width: " + (blockSize.height/19) + " : current height: -" + (blockSize.width/19));
        currWidth = blockSize.height;
        currHeight = -blockSize.width;
        if( xDest < LeftBounds || ( xDest + currWidth ) > RightBounds || yDest > BottomBounds )
          return true;
        break;
    }

    return false;

  }


  // Input Control logic
  //

  // Move Block
  tetris.moveBlock = function(xD,yD) {

    console.log("moveBlock fired");
    if(!tetris.testForHit(xD,yD)) {
      currentBlock.transitionTo({
        x: currentBlock.attrs.x + xD,
        y: currentBlock.attrs.y + yD,
        duration: .05
      });
    }

  }

  // Rotate Block
  tetris.rotateBlock = function() {
    console.log("Space fired");

    currentR = currentBlock.getRotationDeg();

    if( currentR === 0 || currentR === 90 || currentR === 180 )
      currentBlock.setRotationDeg(currentR + 90);
    else if ( currentR === 270 )
      currentBlock.setRotationDeg(0);
    
    layer.draw();
    return;
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
    var scoreText = new Kinetic.Text({
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

    

  }

  window.tetris = tetris;

})(jQuery);
