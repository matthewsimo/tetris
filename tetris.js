(function($){

  var tetris = tetris || {};


  // Init canvas, add to page
  // Set controls key binds
  // Left: [a], Right: [d], Down: [s], Rotate: [space]
  tetris.init = function() {

    console.log("Initializing");

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 480;

    document.getElementById("game").appendChild(canvas);

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

  }



  // Input Control logic
  //

  // Move left
  tetris.moveLeft = function() {

    console.log("Left fired");

  }

  // Move down
  tetris.moveDown = function() {

    console.log("Down fired");

  }

  // Move right
  tetris.moveRight = function() {

    console.log("Right fired");

  }

  // Move rotate
  tetris.moveRotate = function() {

    console.log("Space fired");

  }


  window.tetris = tetris;

})(jQuery);




