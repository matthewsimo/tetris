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
          tetris.moveLeft();
        }
      },
      {
        "keys"          : "s",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          tetris.moveDown();
        }
      },
      {
        "keys"          : "d",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          tetris.moveRight();
        }
      },
      {
        "keys"          : "space",
        "is_exclusive"  : true,
        "on_keydown"    : function() {
          tetris.moveRotate();
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
      y: 0,
      offset: {
        x: 19,
        y: 19
      }
    });

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

        }

      });

    });


    currentBlock = blockPiece;
    layer.add(currentBlock);
    layer.draw();

    return;

  }


  // Input Control logic
  //

  // Move left
  tetris.moveLeft = function() {

    console.log("Left fired");
    currentBlock.transitionTo({
      x: currentBlock.attrs.x - 19,
      y: currentBlock.attrs.y,
      duration: .05
    });

  }

  // Move down
  tetris.moveDown = function() {

    console.log("Down fired");
    currentBlock.transitionTo({
      x: currentBlock.attrs.x,
      y: currentBlock.attrs.y + 19,
      duration: .05
    });


  }

  // Move right
  tetris.moveRight = function() {

    console.log("Right fired");
    currentBlock.transitionTo({
      x: currentBlock.attrs.x + 19,
      y: currentBlock.attrs.y,
      duration: .05
    });

  }

  // Move rotate
  tetris.moveRotate = function() {
    console.log("Space fired");
    currentBlock.rotateDeg(90);
    layer.draw();
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
