/**
 * @fileoverview Class for utility math operations.
 */

'use strict';
var strudel = strudel || {};


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
strudel.MathUtils.prototype.newHotness = function(theta, d, v, l) {
  var z = this.getZ(d, v, l);
  var p = this.getP(z, d, v);
  var w = this.getW(d, v);
  var bigP = this.getBigP(p, l, w);
  var o = this.getO(d, v);
  var c = this.getC(o, w, l, bigP);
  return (Math.exp(((theta / (2*Math.PI)) - c) / o) + Math.exp(p * (l - (theta / (2*Math.PI)))))/(Math.exp(((theta / (2*Math.PI)) - c) / o) + 1) * l*(Math.exp((theta*p)/(2*Math.PI))-1)/(Math.exp(p*l)-1);

};

