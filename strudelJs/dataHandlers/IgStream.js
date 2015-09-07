/**
 * @fileoverview Controller class for example Clippers score data handler.
 */


'use strict';
var strudel = strudel || {};
strudel.dataHandlers = strudel.dataHandlers || {};

/**
 * Constructor for ClipsSample data handler.
 * This example class will parse the clips_sample.js file and produce
 * a sequence of arrays which can be used for data entry into spiral timeline.
 * @constructor
 */
strudel.dataHandlers.IgStream = function() {

  //this.seed = seed;

  this.limit = 100;

  this.processedData = [];

  //this.makeRequest(this.seed);

};

/* IG API limits us to 32 posts per request
 * So for now, our quick hack will cycle through a few rounds of
 * pagination links until we get our shit sorted
 * @params {String} url - somewhere to start.
 */
strudel.dataHandlers.IgStream.prototype.makeRequest = function(url) {
  var self = this;
  $.ajax({
    url: url,
    dataType: 'jsonp'
  }).done(function(result) {
    self.megaData.push(result['data']);
    self.limit--;
    if (self.limit > 0) {
      var nextPage = result['pagination']['next_url'];
      setTimeout(function() {
        self.makeRequest(nextPage);
      }, 1000);
    }

  });


};

// Group scoring instances by game_id.
// For each game_id, create an index value by which to multiply for
// rotation on spiral.
strudel.dataHandlers.IgStream.prototype.processData = function(data) {


  var flatData = _.flatten(data);
  var result = {};
  //console.log(flatData);
  result['points'] = [];
  result['attributes'] = {};
  result.attributes['colorVar'] = {'label': 'temp', 'lowColor': 'blue', 'highColor': 'red'};
  result.attributes['tooltipLabels'] = ['date', 'temp'];
  result.attributes['timeSeries'] = {'label': 'timestamp', 'type': 'calendrical', 'unitsPerRotation': 31556900};
  var start_time = flatData[0]['created_time'];

  for (var i = 0; i < 30; i++) {
    var time = flatData[i]['created_time'] - start_time;
    var instance = {
      'time': time
    };
    result.points.push(instance);
  }


  return result;


  /*
  // Remove all non-clipper scoring instances
  var clipScores = _.filter(data, {'scoring_team': 'Los Angeles Clippers'});

  this.rawData = clipScores;

  // Fetch game_ids
  var ids_array = _.uniq(_.pluck(this.rawData, 'game_id'));

  var games_array = [];
  // Split initial raw data into individual game arrays
  for (var i = 0, l = ids_array.length; i < l; i++) {
    var game = _.filter(this.rawData, { 'game_id': ids_array[i] });
    games_array.push(game);
  }

  var processed_games_data = [];
  // Create mega array of values based on games_array
  for (var i = 0, l = games_array.length; i < l; i++) {
    for (var a = 0, b = games_array[i].length; a < b; a++) {
      var instance = {
        'time': games_array[i][a]["time"],
        'rotation_id': i,
        'team': games_array[i][a]['scoring_team'],
        'player': games_array[i][a]['scoring_player'],
        'points': games_array[i][a]['scoring_points']
      };
      processed_games_data.push(instance);
    }
  }

  // Now create the final array.
  var result = {};
  result['points'] = [];
  result['attributes'] = {};
  // PMB: Other ideas for point attributes: opacityVar, strokeVar
  // Also could specify the colormap parameters here somehow
  result.attributes['timeSeries'] = {'label': 'time', 'type': 'recurrent', 'unitsPerRotation': 48};
  result.attributes['colorVar'] = {'label': 'player'};
  result.attributes['sizeVar'] = {'label': 'points', 'maxSize': 9};
  result.attributes['tooltipLabels'] = ['player', 'points'];
  for (var i = 0; i < processed_games_data.length; i++) {
    var rotation_id = processed_games_data[i].rotation_id;
    var time = processed_games_data[i].time + (rotation_id * 48);
    var instance = {
      'time': time,
      'team': processed_games_data[i]['team'],
      'player': processed_games_data[i]['player'],
      'points': processed_games_data[i]['points']
    };
    result.points.push(instance);
  }

  //this.processedData = result;
  return result;
  */

};
