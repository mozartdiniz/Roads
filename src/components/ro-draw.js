/**
 * Created by adaltojunior on 8/17/15.
 */

(function () {
    xtag.register('ro-draw', {
        lifecycle: {
            inserted: function () {
                this.renderCanvas();
            }
        },
        events: {
            'touchstart:delegate(ro-draw > canvas)': function () {
                this.parentNode.movements = [];
            },
            'touchend:delegate(ro-draw > canvas)': function () {
                this.parentNode.movements = [];
            },
            'touchmove:delegate(ro-draw > canvas)': function (e) {
                this.parentNode.drawLine(e);
            },
            'mousedown:delegate(ro-draw > canvas)': function () {
                this.parentNode.movements = [];
            },
            'mouseup:delegate(ro-draw > canvas)': function () {
                this.parentNode.movements = [];
            },
            'mousemove:delegate(ro-draw > canvas)': function (e) {
                this.parentNode.drawLine(e);
            }

        },
        methods: {
            renderCanvas: function () {
                if (!this.querySelector('canvas')) {

                    var canvas = document.createElement('canvas');
                    canvas.width = this.offsetWidth;
                    canvas.height = this.offsetHeight;
                    this.appendChild(canvas);

                }
            },
            drawLine: function (e) {

                var changeTouch = e.changedTouches[0];
                var axisX = changeTouch.clientX - this.offsetLeft;
                var axisY = changeTouch.clientY - this.offsetTop;
                var movementsLength = this.movements.length;
                var context = this.querySelector('canvas').getContext('2d');

                if (Ro.Environment.platform.isIOS || Ro.Environment.platform.isWPhone) {
                    axisY -= 50;
                }

                context.strokeStyle = this.getAttribute('strokeStyle');
                context.lineJoin = this.getAttribute('lineJoin');
                context.lineWidth = this.getAttribute('lineWidth');
                context.beginPath();

                if (movementsLength) {
                    var lastIndex = movementsLength - 1;
                    var previousMovement = this.movements[lastIndex];
                    context.moveTo(previousMovement[0], previousMovement[1]);
                } else {
                    context.moveTo(axisX, axisY);
                }

                context.lineTo(axisX, axisY);
                context.closePath();
                context.stroke();
                this.movements.push([axisX, axisY]);

            },
            eraseAllcontent: function () {
                var context = this.querySelector('canvas').getContext('2d');
                context.clearRect(0,0, this.offsetWidth, this.offsetHeight);
            },
            getDraw: function () {
                return this.querySelector('canvas').getContext('2d').canvas.toDataURL();
            }
        }
    });
})();