
//these should never be changed during the course of the program
var constants = {
        width: 700,
        height: 700,
        color: "#f0f0b8",
        boardPadding: 30, //space on sides of the board
        starPointRadius: 6,
        stoneRadius: 13,
}

//everything needs access to the canvas and context
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext('2d');


function drawInitialBoard() { 

   var bp = constants.boardPadding;

   var canvas = document.getElementById("mainCanvas");
   //canvas.width = constants.width+bp*2;
   //canvas.height= constants.height+bp*2;
   canvas.setAttribute('width',constants.width+bp*2);
   canvas.setAttribute('height',constants.height+bp*2);

   
   ctx.fillStyle=constants.color;
   ctx.fillRect(bp,bp,constants.width,constants.height);
   var horizSpacing = constants.width/18;

   function drawGridLines() {
      for (i = 0; i <= 19; i++) {
             ctx.beginPath();
             ctx.moveTo(bp,bp+i*horizSpacing);
             ctx.lineTo(bp+constants.height,bp+i*horizSpacing);
             ctx.stroke();
      }

      var vertSpacing = constants.height/18;
      for (i = 0; i <= 19; i++) {
             ctx.beginPath();
             ctx.moveTo(bp+i*vertSpacing,bp);
             ctx.lineTo(bp+i*vertSpacing,bp+constants.width);
             ctx.stroke();
      }

     ctx.fillStyle="black";
     function drawStar(x,y) {
        ctx.beginPath(); 
        ctx.moveTo(x-constants.starPointRadius,y);
        ctx.arc(x,y, constants.starPointRadius, 0, Math.PI*2,true);
        ctx.fill();
     }

     //draw the nine star points
     //it would be nice to, later, make this a bit nicer instead of specifying all
     //9 points by hand, but since this is just simply the way that a go board is layed
     //out, it makes some sense to hard code it for right now
     drawStar(bp + 3*horizSpacing,bp + 3*vertSpacing);
     drawStar(bp + 9*horizSpacing,bp + 3*vertSpacing);
     drawStar(bp + 15*horizSpacing,bp + 3*vertSpacing);

     drawStar(bp + 3*horizSpacing,bp + 9*vertSpacing);
     drawStar(bp + 9*horizSpacing,bp + 9*vertSpacing);
     drawStar(bp + 15*horizSpacing,bp + 9*vertSpacing);

     drawStar(bp + 3*horizSpacing,bp + 15*vertSpacing);
     drawStar(bp + 9*horizSpacing,bp + 15*vertSpacing);
     drawStar(bp + 15*horizSpacing,bp + 15*vertSpacing);
   }

   drawGridLines();


}

//takes in go coordinates, places a piece of the specificed 
//color at there
//note that placePiece doesn't care about the current state of the game
//or who the player is, it just puts down a piece of whatever color
function placePiece(x,y,color) {

   //convert back from go coordinates to canvas pixels
   var canvasX = constants.boardPadding+(constants.width/18)*(x-1); 
   var canvasY = constants.boardPadding+(constants.height/18)*(y-1);
   console.log("Moved to: ",canvasX-constants.stoneRadius,",",canvasY);

   if (color == "black") ctx.fillStyle = "black";
   else if (color == "white") ctx.fillStyle = "white";
   else console.log("Invalid Color in placePiece");

   ctx.beginPath();
   ctx.moveTo(canvasX-constants.stoneRadius,canvasY);
   ctx.arc(canvasX,canvasY,constants.stoneRadius,0,Math.PI*2,true);
   ctx.fill();
                   
}

//switiches the current player state and updates the gameboard
//accordingly
function switchPlayer() {
   printBoard();//this is just diagnostic it doesn't need to be here

   if (currentPlayer == "black") {
        console.log("Switching from black to white player");
        currentPlayer = "white";
        $('#currentPlayer').text("Next to Play: White");
   }
   else {
      currentPlayer = "black";
      console.log("Switching from white to black player");
      $('#currentPlayer').text("Next to Play: Black");
   }
}

//takes raw canvas coordinates and converts them
//into the nearest node on the go board that the user clicked on
//and then calls attemptMove() with coords in the go space instead of pixels 
function clickToGoCoordinates(mouseX, mouseY) {

    //first remove the padding
    mouseX = mouseX - constants.boardPadding;
    mouseY = mouseY - constants.boardPadding;
    var goX = Math.round(mouseX /(constants.width/18)) + 1; 
    var goY = Math.round(mouseY /(constants.height/18)) + 1; 

    //fixing up out of bounds cases
    if (goX < 1) goX = 1;
    if (goY < 1) goY =1;
    if (goX > 19) goX = 19;
    if (goY > 19) goY=19;

    console.log("Go coordinates clicked on: " + goX + "," +goY);
    attemptMove(goX, goY, currentPlayer);
}

//attempts to make a move and alerts the player if it's
//illegal or something's wrong, etc.
function attemptMove(x,y,player) {
      //for mapping of numeric codes returned by makeMove
      //to outcomes, see the definition of makeMove within
      //the closure storing the gameboard state

      var makeMoveReturnCode = makeMove(x,y,player);

      if (makeMoveReturnCode == 0) {
        //place the piece on the gameboard canvas
        placePiece(x,y,player);

        //remove dead stones (if necessary - removeDeadStones figures that out)
        //and add the total captured to total
        playerData[player].enemyPiecesCaptured += removeDeadStones(x,y);
        console.log("Player " + playerData[player].name + " has now captured " + playerData[player].enemyPiecesCaptured + " stones in total");

        switchPlayer();
      }
      else if (makeMoveReturnCode == 1) { //ko rule
        console.log("Ko rule, can't play here");

      }
      else if (makeMoveReturnCode == 2){
        console.log("Can't place stone here because this spot has already had a stone played on it");
      }
}


//places handicap stones appropriately according to the rules of go
//TODO figure out what the fuck the rules are for placing handicap stones :\

function placeHandicapStones(numStones, player) {

    if (numStones < 1) {
        return true;
    }

    else if (numStones == 1) 
        gbfunc.makeArbitraryMove(4,4,player);
    else if (numStones == 2)
        gbfunc.makeArbitraryMove(10,4,player);
    else if (numStones == 3)
        gbfunc.makeArbitraryMove(16,4,player);

    placeHandicapStones(numStones - 1,player);
}


//removes a piece from the canvas and also the gameboard state
function removePiece(x,y) {

   function removePieceFromCanvas(x,y) {
      //convert back from go coordinates to canvas pixels
      var canvasX = constants.boardPadding+(constants.width/18)*(x-1); 
      var canvasY = constants.boardPadding+(constants.height/18)*(y-1);

      //fill in circle with background
      ctx.beginPath();
      ctx.fillStyle=constants.color;
      ctx.moveTo(canvasX-constants.stoneRadius,canvasY);
      ctx.arc(canvasX,canvasY,constants.stoneRadius+1,0,Math.PI*2,true);//need the +1 to ensure the stone is wholly erased
      ctx.fill();
      ctx.closePath();
      //and redraw grid lines

      ctx.strokeStyle="black";
      //vertical line
      ctx.beginPath();
      if (y == 1) 
        ctx.moveTo(canvasX,canvasY);
      
      else 
        ctx.moveTo(canvasX,canvasY-constants.stoneRadius-1);
      if (y == 19) 
        ctx.lineTo(canvasX,canvasY);
      
      else 
        ctx.lineTo(canvasX,canvasY+constants.stoneRadius+1);
      
      ctx.stroke();
      ctx.closePath();
      //horizontal line
      ctx.beginPath();
      if (x == 1)
        ctx.moveTo(canvasX,canvasY);
      else
        ctx.moveTo(canvasX-constants.stoneRadius-1,canvasY);
      if (x == 19)
        ctx.lineTo(canvasX,canvasY);
      else
        ctx.lineTo(canvasX+constants.stoneRadius+1,canvasY);
      ctx.stroke();
      ctx.closePath();
      
   }

     if (gbfunc.pieceAt(x,y)) {
        removePieceFromState(x,y);
        removePieceFromCanvas(x,y);

     }
     else {
        console.log("There's no piece at location " + x + "," + y  + " to remove");
     }
}



//player data, used to calculate score when the game ends 
var playerData = new Object();
playerData.black = { enemyPiecesCaptured:0, name:"black"};
playerData.white = { enemyPiecesCaptured:0, name:"white"};

//establish a closure to store the gameboard
//and binds its return to gbfunc
var gbfunc = function () {
        var board = new Array(19);
        for (i=0; i < 19; i++) {
            board[i] = new Array(19);
        }

        //much like makeMoveFunction, except this doesn't bother to check if 
        //the move is according to the rules of Go and just changes the
        //state of the board, for debugging/handicaps/etc.
        function makeArbitraryMoveFunction(x,y,player) {
                console.log("Making arbitrary move");
                board[x-1][y-1] = player;
                //recall, placePiece updates the canvas gameboard
                placePiece(x,y,player);
        }

        //this function goes through the logic of a move and determines whether
        //or not it is a legal move, updating the game state iff it is
        function makeMoveFunction(x,y,player) {

            //return 0 if it's a legal move and everything is fine
            if(board[x-1][y-1] == null) {
                board[x-1][y-1] = player;
                return 0;
            }

            //return 1 if this move would violate the ko rule
            else if (false) {

                return 1;
            }
            //return 2 if there's a piece already at the spot you're trying to play at
            else if (board[x-1][y-1] == "black" || board[x-1][y-1] == "white"){
                return 2;
             }

            else {
                throw "Man, something within the makeMove function is jacked up yo";
            }

        }

        //removeDeadStones takes in the coordinates of a piece that was just played
        //it errors if there is no piece at those coordinates
        //it determines the color of that stone, and then, working outwards from
        //that stone, removes stones that are dead
        //it returns the number of stones that were taken
        function removeDeadStones(x, y) {

           var stonesRemoved = 0;


           //sanity check
           if (!(0 <= x-1 && x-1 <= board.length && 0 <= y-1 && y-1 <= board.length))
               throw "Something is jacked up in removeDeadStones";

           //x-1, y-1 guaranteed to be okay b/c x,y are go coordinates
           var oppColor = (board[x-1][y-1] == "white") ? "black" : "white";

           //surrounding gets the 4 surrounding spots and converts them from 
           //go coords to array coords
           var surrounding = new Array(4);
           surrounding[0] = {i: x-2, j: y-1};
           surrounding[1] = {i: x, j: y-1};
           surrounding[2] = {i: x-1, j: y-2};
           surrounding[3] = {i: x-1, j: y};


           for (var i = 0; i < surrounding.length; i++) {
               var potentialDeadStones = new Array();
               var cur = surrounding[i];
               if ((board[cur.i] !== undefined) && (board[cur.i][cur.j] == oppColor)) {
                  //10000 are dummy values for the prevI and prevJ of recurseCheck
                  if (recurseCheck(cur.i,cur.j,oppColor,10000,10000) == false) {
                      for (var c = 0; c < potentialDeadStones.length; c++) {
                           //we add pieces to potentialDeadStones in array coords
                           //so here we need to convert to go coords for removePiece
                           removePiece(potentialDeadStones[c].x+1,potentialDeadStones[c].y+1);
                           stonesRemoved += 1;
                      }
                  }
               }
           }

           //returns true if there are liberties remaining for the stone here
           function recurseCheck(i,j,color,prevI,prevJ) {


              //remember this stone is only *potentially* dead
              potentialDeadStones.push({x:i,y:j});
                      
              if (i-1 >= 0 && !(i-1 == prevI && j == prevJ)){
                 if (board[i-1][j] == null)
                  return true;
                 if (board[i-1][j] == color) {
                     if (recurseCheck(i-1,j,color,i,j)) { return true; }
                }}

              if (i+1 <= board.length && !(i+1 == prevI && j == prevJ)){
                 if (board[i+1][j] == null)
                  return true;
                 if (board[i+1][j] == color) {
                     if (recurseCheck(i+1,j,color,i,j)) { return true; }
                }}
              if (j-1 >= 0 && !(i == prevI && j-1 == prevJ)){
                 if (board[i][j-1] == null)
                  return true;
                 if (board[i][j-1] == color) {
                     if (recurseCheck(i,j-1,color,i,j)) { return true; }
                }}
              if (j+1 <= board.length && !(prevI == j && j+1 == prevJ)){
                 if (board[i][j+1] == null)
                  return true;
                 if (board[i][j+1] == color) {
                     if (recurseCheck(i,j+1,color,i,j)) { return true; }
                }}

              return false;
        }


           return stonesRemoved;
        }

        return {makeMove: makeMoveFunction, 
                removePieceFromState: function(x,y) {
                        console.log("Removed a piece of color " + board[x-1][y-1] + "at " + x+","+y);
                        board[x-1][y-1] = null; },

                printBoard: function () { console.log(board);},
                pieceAt : function (x,y) {
                        if (board[x-1][y-1] == null) { return false; }
                        else { return board[x-1][y-1]; }
                        },
                makeArbitraryMove: makeArbitraryMoveFunction,
                removeDeadStones: removeDeadStones,
              };
}();

//parcel out individual functions from the gbfunc wrapper
//and bind them to variables in the global namespace
var makeMove = gbfunc.makeMove;
var removePieceFromState = gbfunc.removePieceFromState;
var printBoard = gbfunc.printBoard;
var removeDeadStones = gbfunc.removeDeadStones;



//currentPlayer is the global arbitor of whose turn it is
$('#currentPlayer').text("Next to Play: Black");
var currentPlayer = "black";//initialized to black on game start 
                            //because that's how you play Go 


//it all begins here...
//that is, execution begins here
drawInitialBoard();


//attach a function to canvas to listen for clicks, get the coords, and pass
//it off to the piece adding/subtracting function

$("#mainCanvas").click(function (e) {
        console.log(e.pageX);
        var x = e.pageX - $("#mainCanvas").offset().left;
        var y = e.pageY - $("#mainCanvas").offset().top;
        console.log("Click at: " + x + "," + y);
        clickToGoCoordinates(x,y);
});


//$("#mainCanvas").rightClick(function (e) {alert("rightclick!");});
