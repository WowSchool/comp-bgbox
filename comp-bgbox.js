cc.Class({
  name: 'BgBox',
  extends: cc.Component,

  properties: {
    borderRadius: 0,
    //box#1 as foreground
    color: cc.Color.BLACK,
    offset: 0,
    translateX: 0,
    translateY: 0,
    fill: false,
    //box#2 as background
    bgBorderRadius: 0,
    bgColor: cc.Color.WHITE,
    bgOffset: 0,
    bgTranslateX: 0,
    bgTranslateY: 0,
    bgFill: true
  },
  onLoad() {
    var g = this.node.getComponent(cc.Graphics);
    if (!g) {
      g = this.node.addComponent(cc.Graphics);
      g.lineWidth = 0;
    }
    this.g = g;

    // init foreground points
    let points = this.createPoints(this.borderRadius);
    this.fgPoints = transformPoints(points, this.offset, this.translateX, this.translateY);

    // init background points
    points = this.createPoints(this.bgBorderRadius);
    this.bgPoints = transformPoints(points, this.bgOffset, this.bgTranslateX, this.bgTranslateY);
  },
  /**
   * Create matrix of points
   * @param {Number} r
   * @see https://www.w3.org/TR/2002/WD-css3-border-20021107/#the-border-radius
   */
  createPoints (r) {
    const n = this.node;
    const w = n.width, h = n.height;
    //g.quadraticCurveTo(p1, p2); g.lineTo(p3);
    return [
      /* [p1, p2, p3] */
      [[0, 0],[0, r],[0, h - r]], //0:left
      [[0, h],[r, h],[w - r, h]], //1:top
      [[w, h],[w, h - r],[w, r]], //2:right
      [[w, 0],[w - r, 0],[r, 0]]  //3:bottom
    ];
  },
  /**
   * Draw rounded rectangle from given points
   * @param {Array} points
   * @param {Boolean} fill
   */
  draw (points, fill) {
    const g = this.g;
    const last = points[3][2]
    g.moveTo(last[0], last[1]);
    points.forEach((a, index) => {
      const p1 = a[0], p2 = a[1], p3 = a[2];
      g.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
      g.lineTo(p3[0], p3[1]);
    })
    g.stroke();
    if (fill) g.fill();
  },
  /**
   * Draw 2 boxes on start
   */
  start() {
    const g = this.g;
    const savedLineWidth = g.lineWidth;
    const savedFillColor = g.fillColor;
    g.fillColor = this.color;
    this.draw(this.fgPoints, this.fill);

    g.fillColor = this.bgColor;
    this.draw(this.bgPoints, this.bgFill);

    g.lineWidth = savedLineWidth;
    g.fillColor = savedFillColor;
  }
});

/**
 * Clone points matrix
 * @param {Number} points
 */
function clonePoints (points) {
  return JSON.parse(JSON.stringify(points));
}

/**
 * Transform points with offset, translateX/Y
 * @param {Array} points
 * @param {Number} d offset from origin coordinates
 * @param {*} tx translate X
 * @param {*} ty translate Y
 */
function transformPoints (points, d, tx, ty) {
  points = clonePoints(points)
  points.forEach((a, index) => {
    const p1 = a[0], p2 = a[1], p3 = a[2];
    //offset
    if (d !== 0) {
      if (index === 0 || index === 2) {
        //vertical
        let sign = index === 0 ? -1 : 1;
        p1[1] = p1[1] + sign * d;
        p2[1] = p2[1] + sign * d;

        p1[0] = p1[0] + sign * d;
        p2[0] = p2[0] + sign * d;
        p3[0] = p3[0] + sign * d;
      } else {
        //horizontal
        let sign = index === 3 ? -1 : 1;
        p1[0] = p1[0] - sign * d;
        p2[0] = p2[0] - sign * d;

        p1[1] = p1[1] + sign * d;
        p2[1] = p2[1] + sign * d;
        p3[1] = p3[1] + sign * d;
      }
    }
    //translate X/Y
    if (tx != 0) {
      p1[0] += tx;
      p2[0] += tx;
      p3[0] += tx;
    }
    if (ty != 0) {
      p1[1] += ty;
      p2[1] += ty;
      p3[1] += ty;
    }
  });
  return points;
}