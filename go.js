
//these should never be changed during the course of the program
var constants = {
        width: 700,
        height: 700,
        color: "#f0f0b8",
        boardPadding: 30, //space on sides of the board
        starPointRadius: 6,
        stoneRadius: 10,
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
function placePiece(x,y,color) {

   //convert back from go coordinates to canvas pixels
   var canvasX = constants.boardPadding+(constants.width/18)*(x-1); 
   var canvasY = constants.boardPadding+(constants.height/18)*(y-1);
   console.log("Moved to: ",canvasX-constants.stoneRadius,",",canvasY);

   if (currentPlayer == "black") ctx.fillStyle = "black";
   else if (currentPlayer == "white") ctx.fillStyle = "white";
   else console.log("Invalid player");

   ctx.beginPath();
   ctx.moveTo(canvasX-constants.stoneRadius,canvasY);
   ctx.arc(canvasX,canvasY,constants.stoneRadius,0,Math.PI*2,true);
   ctx.fill();
                   
}

//this function takes raw canvas coordinates and converts them
//into the nearest node on the go board that the user clicked on
function clickToGoCoordinates(mouseX, mouseY) {

    //first remove the padding
    mouseX = mouseX - 0.5*constants.boardPadding;
    mouseY = mouseY - 0.5*constants.boardPadding;
    var goX = Math.round(19*mouseX /constants.width); 
    var goY = Math.round(19*mouseY /constants.height); 

    //fixing up out of bounds cases
    if (goX < 1) goX = 1;
    if (goY < 1) goY =1;
    if (goX > 19) goX = 19;
    if (goY > 19) goY=19;

    console.log("Go coordinates: " + goX + "," +goY);
    placePiece(goX, goY, "black");
    switchPlayer();
}

//game state 

var currentPlayer = "black";//initialized to black on game start 
                            //because that's how you play Go 
$('#currentPlayer').text("Current Player: Black");

function switchPlayer() {
   if (currentPlayer == "black") {
        console.log("Switching from black to white player");
        currentPlayer = "white";
        $('#currentPlayer').text("Current Player: White");
   }
   else {
      currentPlayer = "black";
      console.log("Switching from white to black player");
      $('#currentPlayer').text("Current Player: Black");
   }
}



//it all begins here...
//that is, execution begins here
drawInitialBoard();

//attach a function to canvas to listen for clicks, get the coords, and pass
//it off to the piece adding/subtracting function
canvas.addEventListener('click', function (e) {
     console.log("Click at: " + e.offsetX + "," + e.offsetY);
     clickToGoCoordinates(e.offsetX,e.offsetY);
});



