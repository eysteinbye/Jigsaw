        function LoadGame() {            var totalRows = 2;            var totalColumns = 3;                     var canvasID = "canJigsaw";            var image1 = document.getElementById("img1");                       var game = new jigsaw(canvasID, image1, totalRows, totalColumns);            game.initDrawing();        }