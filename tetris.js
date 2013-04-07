(function($){

  var tetris = tetris || {};
  var game = {};

  var stage, layer, currentBlock;


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
    console.log(stage);

    layer = new Kinetic.Layer();
    stage.add(layer);
    console.log(layer);

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

    currentBlock = tetris.createBlock();
    layer.add(currentBlock);
    layer.draw();

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

    block = new Kinetic.Rect({
      x: game.data.width/2,
      y: 0,
      width: 19,
      height: 19,
      fill: '#00A299',
      stroke: '#00D0C6',
      strokeWidth: 1,
      opacity: 1
    });
    return block;
    

  }


  // Input Control logic
  //

  // Move left
  tetris.moveLeft = function() {

    console.log("Left fired");
    currentBlock.transitionTo({
      x: currentBlock.attrs.x - 19,
      y: currentBlock.attrs.y,
      duration: .07
    });

  }

  // Move down
  tetris.moveDown = function() {

    console.log("Down fired");
    currentBlock.transitionTo({
      x: currentBlock.attrs.x,
      y: currentBlock.attrs.y + 19,
      duration: .07
    });


  }

  // Move right
  tetris.moveRight = function() {

    console.log("Right fired");
    currentBlock.transitionTo({
      x: currentBlock.attrs.x + 19,
      y: currentBlock.attrs.y,
      duration: .07
    });

  }

  // Move rotate
  tetris.moveRotate = function() {

    console.log("Space fired");

  }


  window.tetris = tetris;

})(jQuery);




