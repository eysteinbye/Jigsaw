var Jigsaw = function() {
    
    var constructor = function Jigsaw(canvasID, rows, columns)
    {
        this.MODE = "HARD"; //HARD and EASY

        this.TOTAL_ROWS = rows;
        this.TOTAL_COLUMNS = columns; 

        this.background_image = document.getElementById("backgrond");
        
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext('2d');

        this.selectedPiece = null;

        this.ctx.canvas.width  = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
        

        this.PUZZLE_BOARD_WIDTH = this.ctx.canvas.width / 2; // 50% of the screen
        this.PUZZLE_BOARD_HEIGHT = this.ctx.canvas.height / 2;

        // Set jugsaw to middle
        this.PUZZLE_PADDING_TOP = this.PUZZLE_BOARD_HEIGHT / 2; //50% of the board = 25% of the screen
        this.PUZZLE_PADDING_LEFT = this.PUZZLE_BOARD_WIDTH / 2;

        this.PUZZLE_PIECE_WIDTH = Math.round(this.PUZZLE_BOARD_WIDTH / this.TOTAL_COLUMNS);
        this.PUZZLE_PIECE_HEIGHT = Math.round(this.PUZZLE_BOARD_HEIGHT / this.TOTAL_ROWS);

        var mySelf;
        this.loadGame = function () {
            mySelf = this; // eventene har annet "this" og må bruke denne

            this.drawBackGround();
            this.showIndex();
            
            this.registerTouchEvents();
        };

        this.registerTouchEvents = function() {
            
            var arrow = document.getElementById("backArrow");
            arrow.onclick = function() { 
                mySelf.showIndex();
            };
            
            var pig = document.getElementById("indexPig");
            pig.onclick = function() { 
                mySelf.puzzlePicture = document.getElementById("pig");
                mySelf.puzzlePictureShadow = document.getElementById("pigShadow");
                mySelf.startPuzzle();
            };     

            var sheep = document.getElementById("indexSheep");
            sheep.onclick = function() { 
                mySelf.puzzlePicture = document.getElementById("sheep");
                mySelf.puzzlePictureShadow = document.getElementById("sheepShadow");
                mySelf.startPuzzle();
            };   

            var duck = document.getElementById("indexDuck");
            duck.onclick = function() { 
                mySelf.puzzlePicture = document.getElementById("duck");
                mySelf.puzzlePictureShadow = document.getElementById("duckShadow");
                mySelf.startPuzzle();
            };   

            var donkey = document.getElementById("indexDonkey");
            donkey.onclick = function() { 
                mySelf.puzzlePicture = document.getElementById("donkey");
                mySelf.puzzlePictureShadow = document.getElementById("donkeyShadow");
                mySelf.startPuzzle();
            };   
            
            this.canvas.onmousedown = this.handleOnMouseDown;
            this.canvas.onmouseup = this.handleOnMouseUp;
            this.canvas.onmousemove = this.handleOnMouseMove;

            this.canvas.addEventListener("touchstart", this.handleOnMouseDown, false);
            this.canvas.addEventListener("touchend", this.handleOnMouseUp, false);
            this.canvas.addEventListener("touchmove", this.handleOnMouseMove, false);
        };

        this.numberOfPieces = function() {
          return this.TOTAL_ROWS * this.TOTAL_COLUMNS;
        };

        this.showIndex = function() {
            this.clearCanvas();
            this.drawBackGround();

            // Scale and place index animals
            var pig = document.getElementById("indexPig");
            pig.style.top = this.calcHeightFromReference(300); 
            pig.style.left = this.calcWidthFromReference(20); 
            pig.style.width = this.calcWidthFromReference(170); 

            var sheep = document.getElementById("indexSheep");
            sheep.style.top = this.calcHeightFromReference(300); 
            sheep.style.left = this.calcWidthFromReference(250);
            sheep.style.width = this.calcWidthFromReference(170);

            var duck = document.getElementById("indexDuck");
            duck.style.top = this.calcHeightFromReference(410);
            duck.style.left = this.calcWidthFromReference(690);
            duck.style.width = this.calcWidthFromReference(70);

            var donkey = document.getElementById("indexDonkey");
            donkey.style.top = this.calcHeightFromReference(300);
            donkey.style.left = this.calcWidthFromReference(430);
            donkey.style.width = this.calcWidthFromReference(170);

            // Show index
            document.getElementById("backArrow").style.display = 'none';
            document.getElementById("indexScreen").style.visibility = 'visible';
        }            
        
        this.calcHeightFromReference = function(p) {
            var refHeight = 577;
            return Math.round(p/refHeight * this.ctx.canvas.height) + "px";
        };
        this.calcWidthFromReference = function(p) {
            var refWidth = 962;
            return Math.round(p/refWidth * this.ctx.canvas.width) + "px";
        };
        
        this.startPuzzle = function() {
            // Hide index and show arrow
            document.getElementById("indexScreen").style.visibility = 'hidden';
            document.getElementById("backArrow").style.display = 'block';

            // Clear old pieces
            this.pieceList = [];
            this.slotList = [];

            this.makeBoardSlotsAndPieces();
            this.updateScreen();
        };

        this.makeBoardSlotsAndPieces = function() {
            for (var i = 0; i < this.numberOfPieces(); i++) {
                var piece = this.makePuzzlePiece(i);
                this.pieceList.push(piece);

                var slot = this.makeBoardSlot(i);
                this.slotList.push(slot);
            }
        };

        // Game is redrawn on every movement
        // If we could XOR the moved piece that would be faster.
        this.updateScreen = function() {
            this.clearCanvas();
            this.makeBoard();
            this.updateAllNonSelectedPieces();

            if (this.selectedPiece) {
                // Draw selected block while it is moving
                this.drawSection(this.selectedPiece);
            }
        };

        this.makeBoard = function() {
            this.drawBackGround();
            this.drawPreviewPicture();
            this.drawGridLines();
        };

        // Draw all pieces thats not selected
        this.updateAllNonSelectedPieces = function() {
            for (var i = 0; i < this.pieceList.length; i++) {
                var piece = this.pieceList[i];
                if (piece.isSelected === false) {
                    this.drawSection(piece);
                }
            }
        };

        this.finishGame = function() {
            intel.xdk.player.startAudio("Audio/finish.mp3",false);

            this.remove_width = this.PUZZLE_PIECE_WIDTH;
            this.remove_height = this.PUZZLE_PIECE_HEIGHT;
            this.interval = setInterval(function () { mySelf.endGame(); }, 100);
        };

        this.endGame = function () {
            this.remove_width -= this.PUZZLE_BOARD_WIDTH / 20;
            this.remove_height -= this.PUZZLE_BOARD_HEIGHT / 20;

            if (this.remove_width >= 0 && this.remove_height >= 0) {
                this.clearCanvas();
                this.drawBackGround();        

                // Redraw all pieces
                for (var i = 0; i < this.pieceList.length; i++) {
                    var imgBlock = this.pieceList[i];
                    imgBlock.x += this.PUZZLE_BOARD_WIDTH / 40;
                    imgBlock.y += this.PUZZLE_BOARD_HEIGHT / 40;
                    this.drawSection(imgBlock, this.remove_width, this.remove_height);
                }
            } else {
                clearInterval(this.interval);
                // Game and anim has ended. Go to index
                this.showIndex();
            }
        };

        this.handleOnMouseDown = function(e) {
            e.preventDefault();//Stops the default behavior
            // remove old selected
            if (mySelf.selectedPiece !== null) {
                mySelf.pieceList[mySelf.selectedPiece.no].isSelected = false;
            }

            mySelf.selectedPiece = mySelf.findSelectedPuzzlePiece(e.pageX, e.pageY);

            if (mySelf.selectedPiece) {
                mySelf.pieceList[mySelf.selectedPiece.no].isSelected = true;
                mySelf.offsetX = e.pageX - mySelf.selectedPiece.x;
                mySelf.offsetY = e.pageY - mySelf.selectedPiece.y;
            }
        };

        this.handleOnMouseUp = function(e) {  
            //In hard mode blocks will snapp to any slot, in easy they will not
            if (mySelf.selectedPiece) {
                var index = mySelf.selectedPiece.no;
                if(mySelf.MODE=="HARD"){

                    var hoverSlot = mySelf.checkIfWeHoverRightSlot();
                    if(hoverSlot){
                        // Snap
                        mySelf.pieceList[index].x = hoverSlot.x;
                        mySelf.pieceList[index].y = hoverSlot.y;
                    } else {
                        // Save position on drop
                        mySelf.pieceList[index].x = mySelf.selectedPiece.x;
                        mySelf.pieceList[index].y = mySelf.selectedPiece.y;
                    }
                }else{
                    // save position on drop
                    mySelf.pieceList[index].x = mySelf.selectedPiece.x;
                    mySelf.pieceList[index].y = mySelf.selectedPiece.y;        
                }

                // Unselect piece
                mySelf.pieceList[index].isSelected = false;
                mySelf.selectedPiece = null;
                mySelf.updateScreen();

                if (mySelf.isFinished()) {
                    mySelf.finishGame();
                }
            }
        };

        this.handleOnMouseMove = function(e) {
            e.preventDefault();//Stops the default behavior

            if (mySelf.selectedPiece) {
                var hoverSlot = mySelf.checkIfWeHoverRightSlot();
                if(hoverSlot){
                    if(mySelf.MODE=="EASY"){
                        // Easy mode and we hover the right slot.. lets snap
                        var i = mySelf.selectedPiece.no;
                        mySelf.pieceList[i].x = hoverSlot.x;
                        mySelf.pieceList[i].y = hoverSlot.y;

                        // Unselect piece
                        mySelf.pieceList[i].isSelected = false;
                        mySelf.selectedPiece = null;

                        mySelf.updateScreen();

                        // Player can be finnished as he does not need to let go of piece
                             if (mySelf.isFinished()) {
                                 mySelf.finishGame();
                           }
                    }else{
                        // Dont snap automatic in HARD mode
                        //Move
                        mySelf.selectedPiece.x = e.pageX - mySelf.offsetX;
                        mySelf.selectedPiece.y = e.pageY - mySelf.offsetY;
                        
                        mySelf.updateScreen();         
                    }
                }else{
                    // Not hovering the right slot
                    //Move
                    mySelf.selectedPiece.x = e.pageX - mySelf.offsetX;
                    mySelf.selectedPiece.y = e.pageY - mySelf.offsetY;

                    mySelf.updateScreen();                
                }
            }
        };

        // Check if selected piece is close to correct slot
        this.checkIfWeHoverRightSlot = function() {
            var correctSlot = this.slotList[this.selectedPiece.no];

            var offsetX = Math.abs(this.selectedPiece.x - correctSlot.x);
            var offsetY = Math.abs(this.selectedPiece.y - correctSlot.y);

            var errorMarginX = this.PUZZLE_BOARD_WIDTH / 20;
            var errorMarginY = this.PUZZLE_BOARD_HEIGHT / 20;
            
            if (offsetX <errorMarginX && offsetY <errorMarginY) {
                return correctSlot;
            }
            return null;
        };

        // todo: her kan vi velge noen "gode" plasser utenfor brettet og sette brikkene der før spillet (random)
        // Give pieces a random x and y start position (by index)
        this.makePuzzlePiece = function(index) {
                var randValX = (Math.random() * this.ctx.canvas.width);
                if (randValX>(this.ctx.canvas.width-this.PUZZLE_PIECE_WIDTH)) randValX=this.ctx.canvas.width-this.PUZZLE_PIECE_WIDTH;

                randValX = Math.round(randValX);

                var randValY;
                 if (yesNo()){
                    randValY=this.ctx.canvas.height / 70;
                }else{
                    randValY=this.ctx.canvas.height - this.PUZZLE_PIECE_HEIGHT;
                }
            return new puzzlePiece(index, randValX, randValY);
        };

        // Make a given slot (by its index)
        this.makeBoardSlot = function(index) {
            var x = this.PUZZLE_PADDING_LEFT + (index % this.TOTAL_COLUMNS) * this.PUZZLE_PIECE_WIDTH;
            var y = this.PUZZLE_PADDING_TOP + Math.floor(index / this.TOTAL_COLUMNS) * this.PUZZLE_PIECE_HEIGHT;

            return new puzzleSlot(index, x, y);        
        };

        // Get the piece given x and y
        this.findSelectedPuzzlePiece = function(x, y) {        
            for (var i = this.pieceList.length - 1; i >= 0; i--) {
                var piece = this.pieceList[i];

                var x1 = piece.x;
                var x2 = x1 + this.PUZZLE_PIECE_WIDTH;

                var y1 = piece.y;
                var y2 = y1 + this.PUZZLE_PIECE_HEIGHT;

                if ((x >= x1 && x <= x2) && (y >= y1 && y <= y2)) {
                    return piece;
                }
            }
            return null;
        };

        // Check if all pieces are in the right slot
        this.isFinished = function() {
            for (var i = 0; i < this.numberOfPieces(); i++) {
                var piece = this.pieceList[i];
                var slot = this.slotList[i];

                if ((piece.x != slot.x) || (piece.y != slot.y)) {
                    // If one img is not onits slot you are not finished
                    return false;
                }
            }
            return true;
        };

        // Clear all of the canvas
        this.clearCanvas = function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };

        this.drawGridLines = function() {
            this.ctx.strokeStyle = "#000000"; 
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();

            // draw verticle lines
            for (var i = 0; i <= this.TOTAL_COLUMNS; i++) {
                var x = this.PUZZLE_PADDING_LEFT + (this.PUZZLE_PIECE_WIDTH * i);
                this.ctx.moveTo(x, this.PUZZLE_PADDING_TOP);
                this.ctx.lineTo(x, this.PUZZLE_BOARD_HEIGHT+this.PUZZLE_PADDING_TOP);
            }

            // draw horizontal lines
            for (i = 0; i <= this.TOTAL_ROWS; i++) {
                var y = this.PUZZLE_PADDING_TOP + (this.PUZZLE_PIECE_HEIGHT * i);
                this.ctx.moveTo(this.PUZZLE_PADDING_LEFT, y);
                this.ctx.lineTo(this.PUZZLE_BOARD_WIDTH+this.PUZZLE_PADDING_LEFT, y);
            }

            this.ctx.closePath();
            this.ctx.stroke();
        };
        
        this.drawSection = function(piece, pieceWidthOnScreen, pieceHeightOnScreen) {
            this.ctx.save();
            
            // If width is not sendt we calulate.. we only send with and height on end-anim
            if (pieceWidthOnScreen == undefined) pieceWidthOnScreen = this.PUZZLE_PIECE_WIDTH; 
            if (pieceHeightOnScreen == undefined) pieceHeightOnScreen = this.PUZZLE_PIECE_HEIGHT;
            
            var pieceWidthOnPicture = Math.round(this.puzzlePicture.naturalWidth / this.TOTAL_COLUMNS);
            var pieceHeightOnPicture = Math.round(this.puzzlePicture.naturalHeight / this.TOTAL_ROWS);
            
            var srcX = (piece.no % this.TOTAL_COLUMNS) * pieceWidthOnPicture;
            var srcY = Math.floor(piece.no / this.TOTAL_COLUMNS) * pieceHeightOnPicture;
            
            this.ctx.drawImage(this.puzzlePicture, srcX, srcY, pieceWidthOnPicture, pieceHeightOnPicture, piece.x, piece.y, pieceWidthOnScreen, pieceHeightOnScreen);
            
            this.ctx.restore();
        };

        this.drawPreviewPicture = function() {
            this.ctx.drawImage(this.puzzlePictureShadow, this.PUZZLE_PADDING_LEFT, this.PUZZLE_PADDING_TOP, this.PUZZLE_BOARD_WIDTH, this.PUZZLE_BOARD_HEIGHT);
        };

        this.drawBackGround = function() {
            this.ctx.drawImage(this.background_image, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height)            
        };         
        
    };
    
    return constructor;
}();