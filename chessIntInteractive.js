//create a 2D array to represent the chessboard
chessboard = new Array(8);
for(var i=0; i<8;i++){
	chessboard[i] = new Array(8);
}

//keep track of all the info needed to successfully implement drag and drop
var dropid;
var dropelement;
var startid;
var startelement;
var currentrow;
var currentcolumn;
var desiredrow;
var desiredcolumn;

var chessboardspots = [];
var elementids = [];
var chesspieceids = [];

function setup()
{
	//variables that I've used in this method: c, r
	
	//create a chessspot object that will contain the information needed for each chess spot
	for(var row=0; row<8;row++){
		for(var col=0; col<8; col++){
			spot = {};
			if(row===1){
				spot.piece = "p";//black pawns here..."p"
			} else if (row===6){
				spot.piece = "P";//white pawns here..."P"
			} else if(row!=0 || row!=7) {
				spot.piece = "e";
			}
			chessboard[row][col] = spot;
		}
	}
	chessboard[0][0].piece = "r";//rook
	chessboard[0][1].piece = "k";//knight
	chessboard[0][2].piece = "b";//bishop
	chessboard[0][3].piece = "q";//queen
	chessboard[0][4].piece = "a";//king
	chessboard[0][5].piece = "b";//bishop
	chessboard[0][6].piece = "k";//knight
	chessboard[0][7].piece = "r";//rook
	
	chessboard[7][0].piece = "R";//rook
	chessboard[7][1].piece = "K";//knight
	chessboard[7][2].piece = "B";//bishop
	chessboard[7][3].piece = "A";//queen
	chessboard[7][4].piece = "Q";//king
	chessboard[7][5].piece = "B";//bishop
	chessboard[7][6].piece = "K";//knight
	chessboard[7][7].piece = "R";//rook
	
	//store all of the id's of the chess pieces in an array for later use (we use them to move pieces around on board)
	$( ".chesspiece" ).each(
		function(index)
		{
			chesspieceid = $(this).attr( "id" );
			console.log(chesspieceid);
			chesspieceids[index] = chesspieceid;
		}
	);
	
	//store all of the spots of the chessboard into an array for later use (used to help move pieces around)
	//add the event listeners so that the drag and drop functionality will work
	$( ".chessboardspot" ).each (
		function(index){
			elementids[index] = $(this).attr( "id" );
			chessboardspots[index] = document.getElementById(elementids[index]);
			chessboardspots[index].addEventListener("dragenter",dragenter,false);
			chessboardspots[index].addEventListener("dragleave",dragleave,false);
			chessboardspots[index].addEventListener("dragover",function(event){event.preventDefault();},false);
			chessboardspots[index].addEventListener("drop",dropped,false);
		}
	);
	
	//add the piece id's and the node's id's to each chessboard spot for later use (help moving pieces around)
	var idcounter = 0;
	var pieceidcounter = 0;
	for(var i = 0; i < 8; i++){
		for(var j = 0; j < 8; j++){	
			chessboard[i][j].id = elementids[idcounter];
			if(chessboard[i][j].piece!="e"){
				chessboard[i][j].pieceid = chesspieceids[pieceidcounter];
				console.log(chessboard[i][j].pieceid+"here");
				pieceidcounter++;
			} else {
				chessboard[i][j].pieceid = "null";
			}
			idcounter++;		
		}
	}
}


// the callback function for getWhiteMove; says what move to make

function moveWhite(move)
{
	
	// get the suggested move from the server and parse the info
    var whitemove = move.move;
    var currwhiterow = parseInt(whitemove.substring(0,1));
    var currwhitecol = parseInt(whitemove.substring(1,2));
    var deswhiterow = parseInt(whitemove.substring(2,3));
    var deswhitecol = parseInt(whitemove.substring(3,4));
    
    // get the ids of the spots on the chessboard you're moving from and moving to, then get the corresponding nodes
    var currid = chessboard[currwhiterow][currwhitecol].id;
    var currelem = document.getElementById(currid);
    var desid = chessboard[deswhiterow][deswhitecol].id;
    var deselem = document.getElementById(desid);
  
	// get the id of the piece that you want, then get the corresponding node
	var currpieceid = chessboard[currwhiterow][currwhitecol].pieceid;
	var currpiecelem = document.getElementById(currpieceid);
	
	//move the piece to the desired chessboard spot
    deselem.innerHTML = currelem.innerHTML;
	
	//remove the piece from the spot you moved it from
	var parent = currelem;
	console.log(parent);
	var child = currpiecelem;
	console.log(currpieceid);
	console.log(currpiecelem);
	console.log(child);
	parent.removeChild(child);
	
	//change the .pieceid values of the spots
	chessboard[deswhiterow][deswhitecol].pieceid = chessboard[currwhiterow][currwhitecol].pieceid;
	chessboard[currwhiterow][currwhitecol].pieceid = "null";
	
	//change the .piece values of the spots
	chessboard[deswhiterow][deswhitecol].piece = chessboard[currwhiterow][currwhitecol].piece;
	chessboard[currwhiterow][currwhitecol].piece = "e";
	
}

// sends a request for a move to the Chess "AI" service
function getWhiteMove()
{
	//get a move
    var path;
    path = "move.html";

    // use jQuery to make the request, calling moveWhite with the returned object when the response arrives
    $.getJSON( "http://connerreilly.com/" +  path + "?" + encodeGameState(), moveWhite );
}

// encodes the current state of the game in a string (for sending as the
// query to the AI service)...in this case it's just sending the current
// state of the board to the web service

function encodeGameState()
{	
	//all our Chess AI Engine will need to know is current state of board	
    var state = "";
    
    // encode the chessboard as is
    for (var row = 0; row < 8; row++)
	{
		for(var col = 0; col < 8; col++){
			state = state + chessboard[row][col].piece;	
		}
	}
	
    return state;
}

//prevent defaults from occurring w/ dragenter and dragleave
function dragenter(event)
{
	event.preventDefault();	
}

function dragleave(event)
{
	event.preventDefault();
}

//set the id of the table cell from which you are picking up a piece
function setStartId(startid)
{
	this.startid = startid;
	this.startelement = document.getElementById(startid);
}

function dropped(event)
{	
//	if(allowedMove()===true){
//		allowedMove();
		event.preventDefault();
		
		//get the row and column of the node that the piece starts and drops in
		var startrowstr = startid.substring(0,1);
		var startrow = parseInt(startrowstr);
		var startcolstr = startid.substring(1,2);
		var startcol = parseInt(startcolstr);
		var droprowstr = dropid.substring(0,1);
		var droprow = parseInt(droprowstr);
		var dropcolstr = dropid.substring(1,2);
		var dropcol = parseInt(dropcolstr);	
		
		//now get the piece
		var pieceid = chessboard[startrow][startcol].pieceid;
		var piece = document.getElementById(pieceid);
		
		//check if the new spot has a white piece in it
		var droppieceid = chessboard[droprow][dropcol].pieceid;
		//if the new spot is not null, then remove it
		var parent = document.getElementById(chessboard[droprow][dropcol].id);
		var child = document.getElementById(chessboard[droprow][dropcol].pieceid);
		var removedPiece = "empty";
		var removedPieceId = "";
		if(droppieceid!="null"){
			removedPiece = chessboard[droprow][dropcol].piece;
			removedPieceId = chessboard[droprow][dropcol].pieceid;
			parent.removeChild(child);
		}
		
		//now move the piece to the new spot
		var dropparent = dropelement;
		console.log(piece);
		dropparent.appendChild(piece);

		//now update the .pieceid element of the chessboard array	
		chessboard[droprow][dropcol].pieceid = pieceid;
		chessboard[startrow][startcol].pieceid = "null";
		
		//update the .piece part of the chessboardarray
		chessboard[droprow][dropcol].piece = chessboard[startrow][startcol].piece;
		chessboard[startrow][startcol].piece = "e";
		if(confirm("Press ok if this is the move you want to make (cancel otherwise)")){
			getWhiteMove();
		} else {
			undoMove(startrow,startcol,droprow,dropcol, child, removedPiece, removedPieceId);
		}

//	}
}

function undoMove(oldrow,oldcol,newrow,newcol, child, removedPiece, removedPieceId){
	//now get the piece
	var pieceid = chessboard[newrow][newcol].pieceid;
	console.log(pieceid+"this is pieceid");
	var piece = document.getElementById(pieceid);
	
	//now move the piece to the new spot
	var startparent = startelement;
	console.log(piece);
	startparent.appendChild(piece);

	//now update the .pieceid element of the chessboard array	
	chessboard[oldrow][oldcol].pieceid = pieceid;
	chessboard[newrow][newcol].pieceid = "null";
		
	//update the .piece part of the chessboardarray
	chessboard[oldrow][oldcol].piece = chessboard[newrow][newcol].piece;
	chessboard[newrow][newcol].piece = "e";
	
	//restore if we had a removedPiece
	var dropparent = dropelement;
	if(removedPiece!="empty"){
		dropparent.appendChild(child);
		chessboard[newrow][newcol].piece=removedPiece;
		chessboard[newrow][newcol].pieceid=removedPieceId;
	}
}

//set the id of the table cell into which you are dropping the piece
function setDropId(dropid)
{
	this.dropid = dropid;
	this.dropelement = document.getElementById(dropid);
}

//window.addEventListener("load",doFirst(),false);
