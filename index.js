var puzzle = document.getElementById('puzzle');

var resize = function () {
    var w = document.body.clientWidth;
    var h = document.body.clientHeight;

    //set canvas
    puzzle.width = w;
    puzzle.height = h;
    window.jUtils.fixCanvasSmooth(puzzle);
};
window.onresize = resize;
resize();

var drewCircle = function () {
    var puzzleCtx = puzzle.getContext('2d');
    puzzleCtx.clearRect(0, 0, puzzle.width, puzzle.height);
    puzzleCtx.beginPath();
    puzzleCtx.arc(360, 100, 50, 0, 2 * Math.PI);
    puzzleCtx.closePath();
    puzzleCtx.fillStyle = '#000';
    puzzleCtx.fill();
};
