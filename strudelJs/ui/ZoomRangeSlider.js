/**
 * @fileoverview Controller class for Spiral Timeline generator.
 */


'use strict';
var strudel = strudel || {};
strudel.ui = strudel.ui || {};

/**
 * Constructor for ZoomRangeSlider UI.
 * Currently using noUiSlider, but may just do it all in D3?
 * @param {Number} max - max value of slider.
 * @param {Number} start - start of range.
 * @param {Number} end - end of range.
 * @constructor
 */
strudel.ui.ZoomRangeSlider = function(max, start, end) {

  this.controller = $('#range').noUiSlider({
    start: [ start, end ],
    step: .1,
    snap: false,
    margin: .1,
    connect: true,
    direction: 'ltr',
    orientation: 'horizontal',

    // Configure tapping, or make the selected range dragable.
    behaviour: 'tap-drag',

    // Full number format support.
    format: wNumb({
      mark: '.',
      decimals: 1
    }),

    // Support for non-linear ranges by adding intervals.
    range: {
      'min': 0,
      'max': max
    }
  });


  // Optional addon: creating Pips (Percentage In Point);
  $('#range').noUiSlider_pips({
    mode: 'count',
    values: 6,
    density: 4
  });

  this.element = $("#range");

};


/**
 * Update values to re-render slider.
 * @param {Number} max - max value of slider.
 * @param {Number} start - start of range.
 * @param {Number} end - end of range.
 */
strudel.ui.ZoomRangeSlider.prototype.updateValues = function(max, start, end) {
  $('#range').noUiSlider({
    start: [ start, end ],
    range: {
      'min': 0,
      'max': max
    }
  }, true);

  // Optional addon: creating Pips (Percentage In Point);
  $('#range').noUiSlider_pips({
    mode: 'count',
    values: 6,
    density: 4
  });

};
