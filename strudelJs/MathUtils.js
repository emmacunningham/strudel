'use strict';
var strudel = strudel || {};

strudel.MathUtils = function() {
  // This was defined as a constant in paul's demo.  ????
  this.b = 5/6;
};

// Returns absolute value for v and d.
// Use for wherever 't' occurs in paul's demo
// NOT TO BE CONFUSED WITH 't' for 'theta' here.
strudel.MathUtils.prototype.getT = function(d, v) {
  return Math.abs(d - v);
};

// Returns the value that controls the zoom variable, based on zoom range.
// Use for wherever 'p' occurs in paul's demo
strudel.MathUtils.prototype.getP = function(z, d, v) {
  var top = Math.log(1 - z);
  var bottom = this.getT(d, v);

  return top / bottom;
};

// Corresponds to the z function in paul's demo.
// We feed it into the arg that corresponds to z above when we use it.
strudel.MathUtils.prototype.getZ = function(d, v, l) {
  //var l = numRevolutions;
  var t = this.getT(d, v);
  return this.b * (1 - (t/l));
};

// Corresponds to the o function in paul's demo.
strudel.MathUtils.prototype.getO = function(d, v) {
  var t = this.getT(d, v);
  var bottom = 2 * Math.log(5);
  return t / bottom;
};

// Corresponds to 'w' function in paul's demo.
// Used in Paul's 'c'.
strudel.MathUtils.prototype.getW = function(d, v) {
  return (d + v) / 2;
};

// Corresponds to 'c' function in paul's demo.
strudel.MathUtils.prototype.getC = function(o, w, l, bigP) {
  //var l = numRevolutions;
  if (bigP >= 0) {
    return w - (o * Math.log(bigP));
  }

  if (bigP < 0) {
    return (3 * l) * ((w - (l *.5)) / (Math.abs(w - (l *.5))));
  }

};

strudel.MathUtils.prototype.getBigP = function(p, l, w) {
  var topPartOne = (2 * Math.exp(p * (l - w)));
  var topPartTwo = Math.exp(l * p);
  var top = topPartOne - topPartTwo - 1;
  var bottomPartOne = 2 * Math.exp(w * p);
  var bottomPartTwo = Math.exp(l * p);
  var bottom = bottomPartOne - bottomPartTwo - 1;

  return top / bottom;
};