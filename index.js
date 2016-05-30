var puzzle = document.getElementById('puzzle');
var spaceW = document.body.clientWidth;
var spaceH = document.body.clientHeight;

var resize = function () {
    spaceW = document.body.clientWidth;
    spaceH = document.body.clientHeight;

    //set canvas
    puzzle.width = spaceW;
    puzzle.height = spaceH;
    window.jUtils.fixCanvasSmooth(puzzle);
};
window.onresize = resize;
resize();

var drawCircle = function (ctx, r, x, y) {
    ctx.arc(x, y, r, 0, 2 * Math.PI);
};

var ballFactory = function (r, x, y, v, left) {
    return {
        'id': window.jUtils.makeSimpleGUID(),
        'r': r,
        'x': x,
        'y': y,
        'v': v,
        'left': left
    };
};
var ballList = [];
var makeRandomBalls = function (count) {
    //create 3 balls
    for(var i = 0; i < count; i++) {
        var r = 30;
        var x = r + Math.round(Math.random() * (spaceW - 2 * r));
        var y = r + Math.round(Math.random() * (spaceH - 2 * r));
        var v = 2;
        var left = 2;
        var d = 2 * Math.PI * Math.random();
        var isCollided = false;
        for(var j = 0; j < ballList.length; j++) {
            if(Math.pow(x - ballList[j]['x'], 2) + Math.pow(y - ballList[j]['y'], 2) <= Math.pow(r + ballList[j]['r'], 2)) {
                isCollided = true;
                break;
            }
        }
        if(isCollided) {
            i--;
        } else {
            ballList.push(ballFactory(r, x, y, [v, d], left));
        }
    }
};
var drawBalls = function() {
    var puzzleCtx = puzzle.getContext('2d');
    puzzleCtx.clearRect(0, 0, puzzle.width, puzzle.height);
    puzzleCtx.fillStyle = '#000';
    for(i = 0; i < ballList.length; i++) {
        puzzleCtx.beginPath();
        drawCircle(puzzleCtx, ballList[i]['r'], ballList[i]['x'], ballList[i]['y']);
        puzzleCtx.closePath();
        puzzleCtx.fill();
    }
};
makeRandomBalls(3);
drawBalls();

//计算碰撞后失量
var calcCollideVector = function (v1, v2) {
    var v1x = v1[0] * Math.cos(v1[1]);
    var v1y = v1[0] * Math.sin(v1[1]);
    var v2x = v2[0] * Math.cos(v2[1]);
    var v2y = v2[0] * Math.sin(v2[1]);
    var v1xn = v2x;
    var v2xn = v1x;
    var v1yn = v2y;
    var v2yn = v1y;
    var v1n = [v2[0], Math.atan(v1yn / v1xn)];
    if(v1xn < 0) {
        v1n = [v2[0], Math.PI + Math.atan(v1yn / v1xn)];
    }
    var v2n = [v1[0], Math.atan(v2yn / v2xn)];
    if(v2xn < 0) {
        v2n = [v1[0], Math.PI + Math.atan(v2yn / v2xn)];
    }
    return [v1n, v2n];
};

var start = 0;
var animID;
var animLoop = function (timestamp) {
    if (timestamp && (timestamp - start > 30)) {
        start = timestamp;
        tick();
    } else if (timestamp === null) {
        tick();
    }
    animID = jUtils.requestAnimFrame.call(null, animLoop);
};
var tick = function () {
    var x, y, a;
    var collideList = [];
    var puzzleCtx = puzzle.getContext('2d');
    puzzleCtx.clearRect(0, 0, puzzle.width, puzzle.height);
    puzzleCtx.fillStyle = '#000';
    for(var i = 0; i < ballList.length; i++) {
        x = ballList[i]['x'] + ballList[i]['v'][0] * Math.cos(ballList[i]['v'][1]);
        y = ballList[i]['y'] + ballList[i]['v'][0] * Math.sin(ballList[i]['v'][1]);
        if(x < ballList[i]['r']) {
            ballList[i]['v'] = [ballList[i]['v'][0], Math.atan(Math.sin(ballList[i]['v'][1]) / -Math.cos(ballList[i]['v'][1]))];
        } else if(spaceW - x < ballList[i]['r']) {
            ballList[i]['v'] = [ballList[i]['v'][0], Math.PI + Math.atan(Math.sin(ballList[i]['v'][1]) / -Math.cos(ballList[i]['v'][1]))];
        } else if(y < ballList[i]['r']) {
            a = Math.atan(-Math.sin(ballList[i]['v'][1]) / Math.cos(ballList[i]['v'][1]));
            if(a < 0) {
                ballList[i]['v'] = [ballList[i]['v'][0], Math.PI + a];
            } else {
                ballList[i]['v'] = [ballList[i]['v'][0], a];
            }
        } else if(spaceH - y < ballList[i]['r']) {
            a = Math.atan(-Math.sin(ballList[i]['v'][1]) / Math.cos(ballList[i]['v'][1]));
            if(a > 0) {
                ballList[i]['v'] = [ballList[i]['v'][0], Math.PI + a];
            } else {
                ballList[i]['v'] = [ballList[i]['v'][0], a];
            }
        } else {
            for(var j = 0; j < ballList.length; j++) {
                if(ballList[i]['id'] !== ballList[j]['id'] && !(collideList.indexOf(ballList[i]['id']) > -1 && collideList.indexOf(ballList[j]['id'] > -1))) {
                    if(Math.pow(x - ballList[j]['x'], 2) + Math.pow(y - ballList[j]['y'], 2) <= Math.pow(ballList[i]['r'] + ballList[j]['r'], 2)) {
                        var afterCollide = calcCollideVector(ballList[i]['v'], ballList[j]['v']);
                        ballList[i]['v'] = afterCollide[0];
                        ballList[j]['v'] = afterCollide[1];
                        collideList.push(collideList.indexOf(ballList[i]['id']));
                        collideList.push(collideList.indexOf(ballList[j]['id']));
                        makeRandomBalls(1);
                        ballList[i]['left']--;
                        if(ballList[i]['left'] < 1) {
                            //删除小球
                        }
                    }
                }
            }
        }
        ballList[i]['x'] += ballList[i]['v'][0] * Math.cos(ballList[i]['v'][1]);
        ballList[i]['y'] += ballList[i]['v'][0] * Math.sin(ballList[i]['v'][1]);
        puzzleCtx.beginPath();
        drawCircle(puzzleCtx, ballList[i]['r'], ballList[i]['x'], ballList[i]['y']);
        puzzleCtx.closePath();
        puzzleCtx.fill();
    }
};
animID = jUtils.requestAnimFrame.call(null, animLoop);
