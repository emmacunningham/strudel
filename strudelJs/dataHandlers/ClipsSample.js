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
strudel.dataHandlers.ClipsSample = function() {

};

// Group scoring instances by game_id.
// For each game_id, create an index value by which to multiply for
// rotation on spiral.
strudel.dataHandlers.ClipsSample.prototype.processData = function(data) {

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
  var result = [];
  for (var i = 0, l = processed_games_data.length; i < l; i++) {
    var rotation_id = processed_games_data[i].rotation_id;
    var time = processed_games_data[i].time + (rotation_id * 48);
    var spiralized_time = (time/48) * 2 * Math.PI;
    var instance = {
      'time': spiralized_time,
      'team': processed_games_data[i]['team'],
      'player': processed_games_data[i]['player'],
      'points': processed_games_data[i]['points']
    };
    result.push(instance);
  }

  //this.processedData = result;
  return result;
};

