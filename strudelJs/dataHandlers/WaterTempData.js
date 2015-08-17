/**
 * @fileoverview Controller class for water temperature data handler.
 */

'use strict';
var strudel = strudel || {};
strudel.dataHandlers = strudel.dataHandlers || {};

/**
 * Constructor for water temperature data handler.
 * This class will parse the daily_water_temp.json file and produce
 * a sequence of arrays which can be used for data entry into spiral timeline.
 * @constructor
 */
strudel.dataHandlers.WaterTempData = function() {

};

/**
 * Format the data so that it can be visualized on the spiral timeline.
 * This includes designating attributes from the JSON data according to
 * their visual representation: sizeVar, colorVar, etc.
 */
strudel.dataHandlers.WaterTempData.prototype.processData = function(data) {

  // Create the output array.
  var result = {};
  result['points'] = [];
  result['attributes'] = {};
  // PMB Other ideas for point attributes: opacityVar, strokeVar
  // Also could specify the color map parameters here somehow
  // NOTE: A year has 31556900 seconds on average. Should be good enough for now
  result.attributes['timeSeries'] = {'label': 'timestamp', 'type': 'calendrical', 'unitsPerRotation': 31556900};
  result.attributes['colorVar'] = {'label': 'temp', 'lowColor': 'blue', 'highColor': 'red'};
  result.attributes['tooltipLabels'] = ['date', 'temp'];
  // Note that the earliest timestamp in the data set should be assigned
  // timeline time = 0, or something close to it.
  var start_time = data[0]['timestamp'];
  for (var i = 0; i < data.length; i++) {
    var time = data[i]['timestamp'] - start_time;
    var instance = {
      'timestamp': time,
      'temp': data[i]['temp'],
      'date': data[i]['date']
    };
    result.points.push(instance);
  }

  return result;
};

