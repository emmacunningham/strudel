/**
 * @fileoverview Controller class for Spiral Timeline generator.
 */


'use strict';
var strudel = strudel || {};


/**
 * Constructor for SpiralTimelineController.
 * @params {Object} params - parameters for customizing an instance
 * of the timeline.
 * @constructor
 */
strudel.SpiralTimelineController = function(params) {

  /**
   * Namespace to use for elements.
   * @type {String}
   */
  this.namespace = 'strudel';

  /**
   * Whether the graph should be contained within the viewport.
   * @type {Boolean}
   */
  this.containWithinViewport = true;

  /**
   * Number of rotations around the origin.
   * @type {Number}
   */
  this.numRotations = 10;

  /**
   * Number of path points per rotation of the spiral
   * @type {Number}
   */
  this.resolution = 48;

  /**
   * Weight of the stroke used to draw the curve.
   * @type {Number}
   */
  this.pathWeight = 1;

  /**
   * Start of range to zoom over.
   * @type {Number}
   */
  this.zoomRangeStart = 2;

  /**
   * End of range to zoom over.
   * @type {Number}
   */
  this.zoomRangeEnd = 4;

  /**
   * Whether to display the path of the spiral.
   * @type {boolean}
   */
  this.displayLine = true;

  /**
   * Whether to animate the points on an interval.
   * @type {boolean}
   */
  this.animatePoints = true;

  /**
   * Whether to scale the points per some data.
   * @type {boolean}
   */
  this.scalePoints = true;

  /**
   * Whether to color the points per some data.
   * @type {boolean}
   */
  this.colorPoints = true;


  /**
   * Whether to show background image.
   * @type {boolean}
   */
  this.showBackground = false;

  /**
   * Background opacity
   * @type {Number}
   */
  this.bgOpacity = .5;

  /**
   * Background blur
   * @type {Number}
   */
  this.bgBlur = 0;

  /**
   * Background distance along z-axis from spiral.
   * @type {Number}
   */
  this.bgDistance = 0;


  /**
   * Math helpers.
   * @type {strudel.MathUtils}
   */
  this.utils = new strudel.MathUtils();

  /**
   * Graph container width.
   * @type {Number}
   */
  this.width = 800;

  /**
   * Graph container height.
   * @type {Number}
   */
  this.height = 800;

  /**
   * Graph container radius.
   * @type {Number}
   */
  this.radius = Math.min(this.width, this.height) / 2 - 30;

  /**
   * Function constraining domain and range of graph to fit within
   * graph container dimensions.
   * @type {function}
   */
  this.graphScale = d3.scale.linear()
      .domain([0, this.numRotations])
      .range([0, this.radius]);

  /**
   * For now, dummy data.  When we work with real data we'll want to
   * provide a method that allows you to import JSON or somethin.
   * @type {Array.<Number>}
   */
  this.datapoints = [];
  // Uncomment below to show circles.
  // this.datapoints = d3.range(0, 12 * Math.PI, .500);

  // Store 'this' object in variable name that won't get overwritten within
  // the scope of another function.
  var self = this;

  /**
   * Generates a function which will apply a transformation to the data points
   * generated by our spiral function and return cartesian coordinates
   * used by the <path> element.  The function used in the angle setter is
   * changing the data values to orient the graph correctly.
   * @type {function}
   */
  this.line = d3.svg.line.radial()
      .radius(function(data) {
        return self.graphScale(data[1]);
      })
      .angle(function(data) {
        return Math.PI / 2 - data[0];
      });

  /**
   * Create <svg> element, append it to body, set width and height based on variables
   * defined above.  Also create the <g> element which will contain the <path> element.
   * Apply transformations to center the graph within the parent container.
   * @type {Element}
   */
  this.svg = d3.select(".spiral-container").append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

  // Create <path> element with class line and append it to svg's last child <g>
  this.svg.append("path")
      .attr("class", "line");

  // Create <path> element with class line and append it to svg's last child <g>
  this.tooltip = $('body').append($('<div class="tooltip"></div>'));

  // We may wish to throw all of this into an init method.
  this.initSliders();
  this.addListeners();
  this.initColorPicker();
  this.updateBackground();

  this.animationInterval = 500;
  this.animationLoop = setInterval(function() {
    self.setPointColors();
  }, self.animationInterval * 2);
};


/**
 * Update path of curve.  Called whenever any data integral to
 * the rendering of the curve are updated.
 */
strudel.SpiralTimelineController.prototype.updatePath = function() {

  var newData = d3.range(0, this.numRotations * 2 * Math.PI, Math.PI * 2 / this.resolution)
          .map(this.newDataGenerator(this.zoomRangeEnd, this.zoomRangeStart, this.numRotations));

  // Apply those new data points.  D3 will use the radial line function
  // that we have previously defined above to map those values to Cartesian coordinates
  // so we need to update the value of the d attribute on the <path> element
  this.svg.selectAll(".line")
    .datum(newData);

  if (this.displayLine) {
    this.svg.selectAll(".line")
      .attr("d", this.line);
  }
  else {
    this.svg.selectAll(".line")
      .attr("d", null);
  }

  this.updatePoints(this.zoomRangeStart, this.zoomRangeEnd);

};


/**
 * Update zoom points.
 * @param {Number} zoomRangeStart - zoom range start point.
 * @param {Number} zoomRangeEnd - zoom range end point.
 */
strudel.SpiralTimelineController.prototype.updateZoomRange = function(zoomRangeStart, zoomRangeEnd) {

  this.zoomRangeStart = zoomRangeStart;
  this.zoomRangeEnd = zoomRangeEnd;

  this.updatePath();

};

/**
 * Update number of rotations.
 * @param {Number} n - number of rotations.
 */
strudel.SpiralTimelineController.prototype.updateRotations = function(n) {

  // Adjust the text on the range slider.
  d3.select("#r-value").text(n);
  d3.select("#rotationSlider").property("value", n);

  this.numRotations = n;

  // Update scale of graph to fit within viewport.
  if (this.containWithinViewport == true) {
    this.graphScale = d3.scale.linear()
        .domain([0, this.numRotations])
        .range([0, this.radius]);
  }
  // Sets the max value on range slider based on updated rotations value.
  this.updateZoomSlider();

  this.updatePath();
};


/**
 * Update range zoom slider.
 */
strudel.SpiralTimelineController.prototype.updateZoomSlider = function() {
  var self = this;
  this.zoomRangeSlider.updateValues(self.numRotations, self.zoomRangeStart, self.zoomRangeEnd);

};

/**
 * Update resolution of graph - basically the sampling rate of data points
 * to generate the curve.
 * @param {Number} n - resolution value.
 */
strudel.SpiralTimelineController.prototype.updateResolution = function(n) {

  // adjust the text on the range slider
  d3.select("#res-value").text(n);
  d3.select("#resolutionSlider").property("value", n);

  this.resolution = n;

  this.updatePath();

};

/**
 * Updates the path weight of the curve.
 * @param {Number} n - path weight value.
 */
strudel.SpiralTimelineController.prototype.updatePathWeight = function(n) {

  // adjust the text on the range slider
  d3.select("#path-weight-value").text(n);
  d3.select("#path-weight").property("value", n);

  this.pathWeight = n;

  // Apply new path weight here.
  this.svg.selectAll(".line")
      .style('stroke-width', this.pathWeight + 'px');

};

/**
 * Updates the color of the curve, based on values returned from color picker.
 */
strudel.SpiralTimelineController.prototype.updateColor = function(hsb,hex,rgb,el,bySetColor) {
  var hexStr = '#' + hex;
  d3.selectAll(".line")
      .style('stroke', hexStr);
};

/**
 * Initialize color picker.
 */
strudel.SpiralTimelineController.prototype.initColorPicker = function() {
  var self = this;
  $('#color-picker').colpick({
      flat:true,
      layout:'hex',
      submit:0,
      onChange: self.updateColor,
      color: '#b3b3b3'
  });
};


/**
 * Initialize starting value of input sliders and draw initial graph.
 */
strudel.SpiralTimelineController.prototype.initSliders = function() {

  this.zoomRangeSlider = new strudel.ui.ZoomRangeSlider(this.numRotations, this.zoomRangeStart, this.zoomRangeEnd);
/* this locks our resolution to divisions
  $('#resolutionSlider').attr('step', Math.PI / 32);
  $('#resolutionSlider').attr('max', Math.PI * 10);
*/

  this.updateRotations(this.numRotations);
  this.updateResolution(this.resolution);
  this.updatePathWeight(this.pathWeight);

  this.updatePath();

};

/**
 * Add listeners for each input slider.
 */
strudel.SpiralTimelineController.prototype.addListeners = function() {
  var self = this;

  /* Old slider stuff -- leaving for reference but we're changing the UI
  // Select the <input> range element and attaches a listener to when the input
  // value changes.  On input change, call "update" function with the new value.
  d3.selectAll(".rangeSlider").on("input", function() {
    var id = this.id;

    var zoomRangeStart = d3.select("#d")[0][0].value;
    var zoomRangeEnd = d3.select("#v")[0][0].value;

    // There's surely a better way to do this but saving that for a refactor
    switch (id) {
      case 'd':
        d3.select("#d-value").text(zoomRangeStart);
        d3.select("#d").property("value", zoomRangeStart);
        break;
      case 'v':
        d3.select("#v-value").text(zoomRangeEnd);
        d3.select("#v").property("value", zoomRangeEnd);
        break;
    }


    self.updateZoomRange(Number(zoomRangeStart), Number(zoomRangeEnd));

  });
  */
  // New listeners for range zoom value changes.

  this.zoomRangeSlider.element.on({
    slide: function(){
      var zoomRangeStart = $("#range").val()[0];
      var zoomRangeEnd = $("#range").val()[1];
      //console.log($("#range").val());
      self.updateZoomRange(Number(zoomRangeStart), Number(zoomRangeEnd));
    },
    set: function(){
      var zoomRangeStart = $("#range").val()[0];
      var zoomRangeEnd = $("#range").val()[1];
      //console.log($("#range").val());
      self.updateZoomRange(Number(zoomRangeStart), Number(zoomRangeEnd));
    },
    change: function(){
      var zoomRangeStart = $("#range").val()[0];
      var zoomRangeEnd = $("#range").val()[1];
      //console.log($("#range").val());
      self.updateZoomRange(Number(zoomRangeStart), Number(zoomRangeEnd));
    }
  });


  // Select the <input> rotation element and attaches a listener to when the input
  // value changes.  On input change, call "updateRotations" function with the new value.
  d3.select("#rotationSlider").on("input", function() {
    self.updateRotations(+Number(this.value));
  });

  // Select the <input> rotation element and attaches a listener to when the input
  // value changes.  On input change, call "updateResolution" function with the new value.
  d3.select("#resolutionSlider").on("input", function() {
    self.updateResolution(+Number(this.value));
  });


  // Select the <input> rotation element and attaches a listener to when the input
  // value changes.  On input change, call "updatePathWeight" function with the new value.
  d3.select("#path-weight").on("input", function() {
    self.updatePathWeight(+Number(this.value));
  });

  // Listen for checkbox changes on show-line
  $('#show-line').change(function(e) {
    if (e.currentTarget.checked) {
      self.displayLine = true;
    }
    else {
      self.displayLine = false;
    }
    self.updatePath();
  });

  // Listen for checkbox changes on show-animation
  $('#show-animation').change(function(e) {
    if (e.currentTarget.checked) {
      self.animatePoints = true;
      self.animationLoop = setInterval(function() {
        self.setPointColors();
      }, self.animationInterval * 2);
    }
    else {
      self.animatePoints = false;
      clearInterval(self.animationLoop);
    }

  });

  // Listen for checkbox changes on scale-points
  $('#scale-points').change(function(e) {
    if (e.currentTarget.checked) {
      self.scalePoints = true;
    }
    else {
      self.scalePoints = false;
    }

    self.updatePoints();
  });

  // Listen for checkbox changes on scale-points
  $('#color-points').change(function(e) {
    if (e.currentTarget.checked) {
      self.colorPoints = true;
    }
    else {
      self.colorPoints = false;
    }

    self.setPointColors();
  });

  // Listen for checkbox changes on scale-points
  $('#show-bg').change(function(e) {
    if (e.currentTarget.checked) {
      self.showBackground = true;
    }
    else {
      self.showBackground = false;
    }

    self.updateBackground();
  });


  $('#update-color-map').click(function(e) {
    self.setPointColors();
  });


  d3.select("#bg-opacity").on("input", function() {
    self.bgOpacity = Number(this.value);
    self.updateBackground();
  });

  d3.select("#bg-blur").on("input", function() {
    self.bgBlur = Number(this.value);
    self.updateBackground();
  });

  d3.select("#bg-distance").on("input", function() {
    self.bgDistance = Number(this.value);
    self.updateBackground();
  });


  $('.menu-toggle').click(function(e) {
    $('.strudel-options').toggle();
    $('body').toggleClass('menu-active');
  });

  $('.options-toggle').click(function(e) {
    $(this).next().toggle();
    $(this).toggleClass('options-active')
  });

};

/**
 * Update background.
 */
strudel.SpiralTimelineController.prototype.updateBackground = function() {

  if (this.showBackground) {
    $('.spiral-bg').show();
  }
  else {
    $('.spiral-bg').hide();
  }

  $('.spiral-bg').css({
    'opacity': this.bgOpacity,
    '-webkit-filter': 'blur(' + this.bgBlur + 'px)',
    'background-size': (100 - this.bgDistance) + '%'
  });

};


/**
 * Returns updated polar coordinates for updated zoom range variables and rotation.
 * @param {Number} zoomRangeStart - zoom range start point.
 * @param {Number} zoomRangeEnd - zoom range end point.
 * @param {Number} l - number of rotations.
 * @return {Array.<Number>} - polar coordinates for theta and radius of a point.
 */
strudel.SpiralTimelineController.prototype.newDataGenerator = function(zoomRangeStart, zoomRangeEnd, l) {
  var self = this;

  var spiralDataGenerator = function(theta) {
    return [theta, self.utils.getRadius(theta, zoomRangeStart, zoomRangeEnd, l)];
  };

  return spiralDataGenerator;

};


/**
 * Update data.
 * @param {Array.<Number>} data - array of datapoints to plot on graph.
 */
strudel.SpiralTimelineController.prototype.updateData = function(data) {

  this.datapoints = data;

  this.updatePoints();

};


/**
 * Attaches metadata to circles.
 */
strudel.SpiralTimelineController.prototype.attachMetadata = function () {
};


/**
 * Fetches relevant points data from complex data array.
 */
strudel.SpiralTimelineController.prototype.getDataPoints = function (array, key) {

  for (var i = 0, l = array.length; i < l; i++) {
    var time = array[i]['time'];

    // retrieve polar coords
    var polarCoords = this.newDataGenerator(this.zoomRangeStart, this.zoomRangeEnd, this.numRotations)(time);

    // append to object
    array[i]['polarCoords'] = polarCoords;

  }

  return array;
};


/**
 * Assign color meaning based on some data.
 */
strudel.SpiralTimelineController.prototype.createColorMap = function (array, key) {

    var uniquePlayers =  _.uniq(_.pluck(array, key));

    // doing some stuff with all unique scoring players so we can automate colors
    function getRandomColor() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    var colorMap = {};
    for (var i = 0, l = uniquePlayers.length; i < l; i++) {
      var key = this.slugify(uniquePlayers[i]);
      var value = getRandomColor();
      colorMap[key] = value;
    }

    return colorMap;

};



/*
 * Prolly could throw this into a utils class if we have more of these.
 */
strudel.SpiralTimelineController.prototype.slugify = function (text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};


strudel.SpiralTimelineController.prototype.setPointColors = function () {
  var circle = this.svg.selectAll("circle");
  var self = this;
  var colorMap = this.createColorMap(this.datapoints, 'player');

  if (self.colorPoints) {

    circle
      .transition().duration(self.animationInterval)
      .attr('fill', function(d, i) {
        var playerSlug = self.slugify(d['player']);
        var color = colorMap[playerSlug];
        return color;
      });

  }
  else {
    circle
      .transition().duration(self.animationInterval)
      .attr('fill', function(d, i) {
        var playerSlug = self.slugify(d['player']);
        var color = "#000";
        return color;
      });
  }
};


/**
 * Update data points on curve.
 */
strudel.SpiralTimelineController.prototype.updatePoints = function () {
  var self = this;

  var points = this.getDataPoints(this.datapoints, 'time');
  var plotData = points;

  var colorMap = this.createColorMap(this.datapoints, 'player');

  var polarToCarX = function(d) {
    return self.graphScale(d['polarCoords'][1]) * Math.cos(-d['polarCoords'][0]);
  };

  var polarToCarY = function(d) {
    return self.graphScale(d['polarCoords'][1]) * Math.sin(-d['polarCoords'][0]);
  };

  var circle = this.svg.selectAll("circle")
      .data(plotData);

  circle.exit().remove();

  circle.enter().append("circle")
    .attr('player', function(d) {
      return d['player'];
    })
    .attr('points', function(d) {
      return d['points'];
    })
    .attr('opacity', function(d) {
      return 1;
    });

  if (!self.scalePoints) {
    circle.attr('r', function(d) {
      return 5;
    });
  }
  else {
    circle.attr('r', function(d) {
      var size = d['points'] * 3;
      return size;
    });
  }

  circle
      .attr("cx", function (d) { return polarToCarX(d); })
      .attr("cy", function (d) { return polarToCarY(d); });

  circle.on('click', function() {
    self.updateTooltip(this, {'player': $(this).attr('player'), 'points': $(this).attr('points')});
  });

};

/**
 * Update tooltip based on metadata.
 */
strudel.SpiralTimelineController.prototype.updateTooltip = function(el, data) {
  $('.tooltip').empty();
  var tooltipDetails = $('<div class="tooltip-player">Player: ' + data['player'] + '</div>' +
                  '<div class="tooltip-points">Points: ' + data['points'] + '</div>');
  console.log(tooltipDetails)
  $('.tooltip').append(tooltipDetails);
};


/**
 * Creates a UI element that updates the graph.
 *
 */
strudel.SpiralTimelineController.prototype.createUiElement = function(name, type, eventHandler) {


};