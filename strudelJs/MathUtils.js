/**
 * @fileoverview Class for utility math operations.
 */

'use strict';
var strudel = strudel || {};

var verbose = false;

var log = function(logstring) {
  if (verbose == true) {
    console.log(logstring);
  }

};

/**
 * Constructor for MathUtils.
 * @constructor
 */
strudel.MathUtils = function() {
  /**
   * Constant value which controls the focus of zoomability.
   * @type {Number}
   */
  this.b = 5/6;
};


/**
 * Use for wherever 't' occurs in paul's demo
 * @param {Number} d - zoom range point.
 * @param {Number} v - zoom range point.
 * @return {Number} - absolute value for v and d.
 */
strudel.MathUtils.prototype.getT = function(d, v) {
  return Math.abs(d - v);
};


/**
 * Use for wherever 'p' occurs in paul's demo
 * @param {Number} z - ?.
 * @param {Number} d - zoom range point.
 * @param {Number} v - zoom range point.
 * @return {Number} - the value that controls the zoom variable, based on zoom range.
 */
strudel.MathUtils.prototype.getP = function(z, d, v) {
  return Math.log(1 - z) / this.getT(d, v);
};


/**
 * Corresponds to the z function in paul's demo.
 * @param {Number} d - zoom range point.
 * @param {Number} v - zoom range point.
 * @param {Number} l - number of rotations.
 * @return {Number} - z?
 */
strudel.MathUtils.prototype.getZ = function(d, v, l) {
  var t = this.getT(d, v);
  return this.b * (1 - (t/l));
};

/**
 * Corresponds to the o function in paul's demo.
 * @param {Number} d - zoom range point.
 * @param {Number} v - zoom range point.
 * @return {Number} - o?
 */
strudel.MathUtils.prototype.getO = function(d, v) {
  return this.getT(d, v) / 2 * Math.log(5);
};

/**
 * Corresponds to the w function in paul's demo.
 * @param {Number} d - zoom range point.
 * @param {Number} v - zoom range point.
 * @return {Number} - halfway point between zoom points d and v.
 */
strudel.MathUtils.prototype.getW = function(d, v) {
  return (d + v) / 2;
};

/**
 * Corresponds to the c function in paul's demo.
 * @param {Number} o - ?.
 * @param {Number} w - halfway point between zoom points d and v.
 * @param {Number} l - number of rotations.
 * @param {Number} bigP - bigP value.
 * @return {Number} - c?
 */
strudel.MathUtils.prototype.getC = function(o, w, l, bigP) {
  if (bigP >= 0) {
    return w - (o * Math.log(bigP));
  }

  if (bigP < 0) {
    return (3 * l) * ((w - (l *.5)) / (Math.abs(w - (l *.5))));
  }

};

/**
 * Corresponds to the P function in paul's demo.
 * @param {Number} p - zoom variable, derived from range of zoom.
 * @param {Number} l - number of rotations.
 * @param {Number} w - halfway point between zoom points d and v.
 * @return {Number} - bigP?
 */
strudel.MathUtils.prototype.getBigP = function(p, l, w) {
  return (2 * Math.exp(p * (l - w))) - Math.exp(l * p) - 1 /
         (2 * Math.exp(w * p) - Math.exp(l * p) - 1);
};


/**
 * Determines radius value for a given theta, zoom range,
 * and number of rotations.
 * @param {Number} theta - theta coordinate.
 * @param {Number} d - zoom range point.
 * @param {Number} v - zoom range point.
 * @param {Number} l - number of rotations.
 * @return {Number} - radius value.
 */
strudel.MathUtils.prototype.getRadius = function(theta, d, v, l) {
  var z = this.getZ(d, v, l);
  var p = this.getP(z, d, v);
  var w = this.getW(d, v);
  var bigP = this.getBigP(p, l, w);
  var o = this.getO(d, v);
  var c = this.getC(o, w, l, bigP);
  var radius = (Math.exp(((theta / (2*Math.PI)) - c) / o) + Math.exp(p * (l - (theta / (2*Math.PI)))))/(Math.exp(((theta / (2*Math.PI)) - c) / o) + 1) * l*(Math.exp((theta*p)/(2*Math.PI))-1)/(Math.exp(p*l)-1);
  return radius;

};


/**
 * Determines the radius value necessary to
 * place the point on the polygonal path
 * for a given theta, zoom range, resolution
 * (number of path segments per rotation),
 * and number of rotations.
 * @param {Number} theta - theta coordinate.
 * @param {Number} d - zoom range point.
 * @param {Number} v - zoom range point.
 * @param {Number} l - number of rotations.
 * @param {Number} res - resolution.
 * @return {Number} - radius value.
 */
strudel.MathUtils.prototype.getPathRadius = function(theta, d, v, l, res) {

  /* Basic approach:
   * Get the on-circle radius of the point
   * Calculate the segment this point falls in
   * Get the theta and radius of the leftmost point 
   * Get the theta and radius of the rightmost point
   * Convert them all to Cartesian coordinates
   * Find the intersection
   * Convert the intersection to polar coordinates
   * Return the radius of the intersection point
   */

  // This is the radius of the point on the circle
  var circleRadius = this.getRadius(theta, d, v, l);
  var circleCartesian = this.polarToCartesian(circleRadius, theta);

  var binSize = (2 * Math.PI) / res;
  var leftBin = Math.floor((theta * res) / (2 * Math.PI));
  var rightBin = Math.ceil((theta * res) / (2 * Math.PI));

  // Handle the corner case (literally!) where the target point lies right on a
  // vertex of the path polygon, so Math.floor() and Math.ceil() return the same
  // value
  if (leftBin == rightBin) {
    rightBin += 1;
  }

  var leftTheta = leftBin * binSize;
  var rightTheta = rightBin * binSize;

  var leftRadius = this.getRadius(leftTheta, d, v, l);

  var rightRadius = this.getRadius(rightTheta, d, v, l);

  var leftCartesian = this.polarToCartesian(leftRadius, leftTheta);
  var rightCartesian = this.polarToCartesian(rightRadius, rightTheta);

  var segSlope = (rightCartesian['y'] - leftCartesian['y']) / (rightCartesian['x'] - leftCartesian['x']);

  var X = (leftCartesian['y'] - (leftCartesian['x'] * segSlope)) / ((circleCartesian['y'] / circleCartesian['x']) - segSlope);
  var Y = (leftCartesian['y'] - (leftCartesian['x'] * segSlope)) / (1 - ((circleCartesian['x'] / circleCartesian['y']) * segSlope));

  var targetPolar = this.cartesianToPolar(X, Y);
/*
  if (isNaN(targetPolar['r'])) {
    verbose = true;
    log("snapped radius is NaN for theta " + theta + ", d " + d + ", v " + v + ", rotations " + l + ", resolution " + res);
    log("circle radius: " + circleRadius + ", circle theta: " + theta);
    log("circle X: " + circleCartesian['x'] + ", Y: " + circleCartesian['y']);
    log("binSize is " + binSize);
    log("leftBin is " + leftBin + ", rightBin is " + rightBin);
    log("left radius: " + leftRadius + ", left theta: " + leftTheta);
    log("right radius: " + rightRadius + ", right theta: " + rightTheta);
    log("left X: " + leftCartesian['x'] + ", Y: " + leftCartesian['y']);
    log("right X: " + rightCartesian['x'] + ", Y:" + rightCartesian['y']);
    log("intersection X: " + X + ", Y: " + Y);
  log("original theta: " + theta + ", target theta: " + targetPolar['theta']);
  log("target radius: " + targetPolar['r']);
    verbose = false;
  }
*/
  return targetPolar['r'];

};

/* Maybe these two functions should be math utilities */

strudel.MathUtils.prototype.polarToCartesian = function(radius, theta) {

  // Note that theta is negative, to make sure the spiral is rotated correctly
  return { "x": (radius * Math.cos(-theta)), "y": (radius * Math.sin(-theta)) };

};

strudel.MathUtils.prototype.cartesianToPolar = function(x, y) {

  return { "r": (Math.sqrt(Math.pow(x,2) + Math.pow(y,2))), "theta": (Math.atan2(y,x)) };

};
