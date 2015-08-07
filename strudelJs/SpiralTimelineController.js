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
   * Degree of rotations around the origin.
   * @type {Number}
   */
  this.rotationOrigin = 0;

  /**
   * Degree of rotations around the X axis.
   * @type {Number}
   */
  this.rotationX = 0;

  /**
   * Degree of rotations around the Y axis.
   * @type {Number}
   */
  this.rotationY = 0;

  /**
   * Number of path points per rotation of the spiral
   * @type {Number}
   */
  this.resolution = 6;
  
  /**
   * Default number of test points per rotation of the spiral
   * @type {Number}
   */
  this.testpoints = 6;

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
   * Whether to display the data points.
   * @type {boolean}
   */
  this.showPoints = true;
  
  /**
   * Whether to display the test points.
   * @type {boolean}
   */
  this.showTestpoints = false;

  /**
   * Whether to display the path of the spiral.
   * @type {boolean}
   */
  this.displayLine = true;

  /**
   * Whether to animate the points on an interval.
   * @type {boolean}
   */
  this.animatePoints = false;

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
   * Whether to snap the points to the path polygon
   * @type {boolean}
   */
  this.snapPoints = true;
  
  /**
   * Whether to lock the number of test points to the
   * resolution (i.e., plot one type of test point per
   * segment of the path polygon). 
   * @type {boolean}
   */
  this.lockTestpoints = true;

  /**
   * Background opacity
   * @type {Number}
   */
  this.bgOpacity = .5;

  /**
   * Point opacity
   * @type {Number}
   */
  this.pointOpacity = .5;

  /**
   * Point opacity
   * @type {Number}
   */
  this.pointScale = 3;


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
   * Custom polar-to-Cartesian conversion function for the 
   * spiral doman, returning the X coordinate only
   * @type {function}
   */
  this.polarToCarX = function(d) {
    var carX = self.graphScale(d['polarCoords'][1]) * Math.cos(-d['polarCoords'][0]);
    return carX;
  };
  
  /**
   * Custom polar-to-Cartesian conversion function for the 
   * spiral doman, returning the Y coordinate only
   * @type {function}
   */
  this.polarToCarY = function(d) {
    var carY = self.graphScale(d['polarCoords'][1]) * Math.sin(-d['polarCoords'][0]);
    return carY;
  };

  /**
   * Custom polar-to-Cartesian conversion function for the 
   * spiral doman, returning both X and Y coordinates
   * @type {function}
   */
  this.polarToCar = function(d) {
    var carX = this.polarToCarX(d);
    var carY = this.polarToCarY(d);
    return [carX, carY];
  };

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
  if (this.animatePoints) {
    this.animationLoop = setInterval(function() {
      self.setPointColors();
    }, self.animationInterval * 2);
  }

};


/**
 * Update path of curve.  Called whenever any data integral to
 * the rendering of the curve are updated.
 */
strudel.SpiralTimelineController.prototype.updatePath = function() {

  var newData = d3.range(0, this.numRotations * 2 * Math.PI, Math.PI * 2 / this.resolution)
          .map(this.newDataGenerator(this.zoomRangeEnd, this.zoomRangeStart, this.numRotations, false));

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

  /* PMB - it would be nice to have something like this (but hopefully less
   * of a hack) to keep the zoom range from jamming at .1 when the number of 
   * rotations drops to ~2
  if ((zoomRangeEnd - zoomRangeStart <= .1)) {
    zoomRangeEnd = zoomRangeStart + 1;
  }
  */

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
 * Update number of test points per rotation
 * @param {Number} n - number of test points per rotation.
 */
strudel.SpiralTimelineController.prototype.updateTestpoints = function(n) {

  var intN = Math.floor(n);

  // adjust the text on the range slider
  d3.select("#testpoints-value").text(n);
  d3.select("#testpointsSlider").property("value", n);

  this.testpoints = n;

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
  this.updateTestpoints(this.testpoints);
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

    if (self.lockTestpoints == true) {
      self.updateTestpoints(+Number(this.value));      
    }

  });

  // Select the <input> testpoints element and attaches a listener to when the input
  // value changes.  On input change, call "updateTestpoints" function with the new value.
  d3.select("#testpointsSlider").on("input", function() {
    self.updateTestpoints(+Number(this.value));
    
    if (self.lockTestpoints == true) {
      self.updateResolution(+Number(this.value));      
    }

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

  // Listen for checkbox changes on show-points
  $('#show-points').change(function(e) {

    if (e.currentTarget.checked) {
      $('circle.datapoints').show();
      self.showPoints = true;
    }
    else {
      $('circle.datapoints').hide();
      self.showPoints = false;
    }
  });
  
  // Listen for checkbox changes on show-testpoints
  $('#show-testpoints').change(function(e) {
    if (e.currentTarget.checked) {
      $('circle.testpoints').show();
      self.showTestpoints = true;
      self.drawTestpoints();
    }
    else {
      $('circle.testpoints').hide();
      self.svg.selectAll("#delaunay").remove(); 
      self.showTestpoints = false;
    }
  });

  // Listen for checkbox changes on snap-points
  $('#snap-points').change(function(e) {
    if (e.currentTarget.checked) {
      self.snapPoints = true;
    }
    else {
      self.snapPoints = false;
    }

    self.updatePoints();
  });
  
  // Listen for checkbox changes on lock-testpoints
  $('#lock-testpoints').change(function(e) {
    if (e.currentTarget.checked) {
      self.lockTestpoints = true;
    }
    else {
      self.lockTestpoints = false;
    }

  });

  $('#update-color-map').click(function(e) {
    self.setPointColors();
  });

  d3.select("#bg-opacity").on("input", function() {
    self.bgOpacity = Number(this.value);
    self.updateBackground();
  });

  d3.select("#point-opacity").on("input", function() {
    self.pointOpacity = Number(this.value);
    self.updatePointOpacity();
  });

  d3.select("#point-scale").on("input", function() {
    self.pointScale = Number(this.value);
    self.updatePoints();
  });

  d3.select("#bg-blur").on("input", function() {
    self.bgBlur = Number(this.value);
    self.updateBackground();
  });

  d3.select("#bg-distance").on("input", function() {
    self.bgDistance = Number(this.value);
    self.updateBackground();
  });


  d3.select("#rotation-origin").on("input", function() {
    self.rotationOrigin = Number(this.value);

    $('svg').css({
      'transform': 'rotate(' + self.rotationOrigin + 'deg)'
    });

  });

  d3.select("#rotation-x").on("input", function() {
    self.rotationX = Number(this.value);

    $('svg').css({
      'transform': 'rotateX(' + self.rotationX + 'deg)'
    });

  });

  d3.select("#rotation-y").on("input", function() {
    self.rotationY = Number(this.value);

    $('svg').css({
      'transform': 'rotateY(' + self.rotationY + 'deg)'
    });

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
strudel.SpiralTimelineController.prototype.newDataGenerator = function(zoomRangeStart, zoomRangeEnd, l, isData) {
  var self = this;

  if (this.snapPoints == false) {
    var spiralDataGenerator = function(theta) {
      return [theta, self.utils.getRadius(theta, zoomRangeStart, zoomRangeEnd, l)];
    };
  } else {
    var spiralDataGenerator = function(theta) {
      if (isData == false) {
        return [theta, self.utils.getRadius(theta, zoomRangeStart, zoomRangeEnd, l)];
      } else {
        return [theta, self.utils.getPathRadius(theta, zoomRangeStart, zoomRangeEnd, l, self.resolution)];
      }
    };
  }

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
    var polarCoords = this.newDataGenerator(this.zoomRangeStart, this.zoomRangeEnd, this.numRotations, true)(time);

    // append to object
    array[i]['polarCoords'] = polarCoords;

  }

  return array;
};

/**
 * Assign color meaning based on some data.
 */
strudel.SpiralTimelineController.prototype.createColorMap = function (array, key) {

    // PMB
    if (self.colorPoints == false)
      return;

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
  var circle = this.svg.selectAll("circle.datapoints");
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
    return;
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
strudel.SpiralTimelineController.prototype.updatePointOpacity = function () {
  var self = this;
  var circle = this.svg.selectAll("circle.datapoints")
    .attr('opacity', function(d) {
      return self.pointOpacity;
    });
};

/**
 * Update test data points on curve.
 */
strudel.SpiralTimelineController.prototype.drawTestpoints = function () {
  var self = this;

  if (this.showTestpoints == false)
    return;

  // Total test points to plot is the number of revolutions * number of
  // test points per revolution
  var allTestPoints = Math.floor(this.testpoints * this.numRotations);
  var anglePoints = [];
  var midPoints = [];
  var cartesianMidpoints = [];
  
  for (var n=0; n<allTestPoints; n++) {

    // PMB This is the theta for the angle bisector points
//    var theta = ((2 * (n+1) - 1) * (Math.PI / this.testpoints);
    var theta = self.utils.getBisectingTheta(n+1, this.testpoints);
    var polarCoords = this.newDataGenerator(this.zoomRangeStart, this.zoomRangeEnd, this.numRotations, true)(theta);
    anglePoints[n] = {'polarCoords': polarCoords, 'color': '#FF0000'};

    var theta = self.utils.getMidpointTheta(n+1, this.zoomRangeStart, this.zoomRangeEnd, this.numRotations, this.testpoints);
    var polarCoords = this.newDataGenerator(this.zoomRangeStart, this.zoomRangeEnd, this.numRotations, true)(theta);

    midPoints[n] = {'polarCoords': polarCoords, 'color': '#0000FF'};

    // Keep track of the midpoints in Cartesian for plotting Delaunay triangles
    cartesianMidpoints.push(self.polarToCar({'polarCoords': polarCoords}));

  }

  var newPoints = anglePoints.concat(midPoints);
  this.plotPoints(newPoints, 'testpoints');

  /* Plot the mesh of Delaunay triangles built around the section midpoints */
  var delaunayPoints = d3.geom.delaunay(cartesianMidpoints);
  
  this.svg.selectAll("#delaunay").remove(); 

  var delaunayPath = this.svg.selectAll("delaunay")
    .data(delaunayPoints);

  delaunayPath.enter().append("path")
    .attr("class", function(d, i) { return "q" + (i % 9) + "-9"; })
    .attr("id", "delaunay")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("d", function(d) { return "M" + d.join("L") + "Z"; });
    
};

strudel.SpiralTimelineController.prototype.plotPoints = function (plotData, pointsName) {
  var self = this;
  var points = this.svg.selectAll('circle.' + pointsName)
      .data(plotData);

  points.exit().remove();

  points.enter().append("circle");
  points.attr('class', pointsName);
  points.attr('fill', function(d) {
    return d.color; 
  });
  points.attr('stroke-width', 1);
  points.attr('stroke', "black");
  points.attr('r', function(d) {
    return self.pointScale;
  });

  points 
      .attr("cx", function (d) { return self.polarToCarX(d); })
      .attr("cy", function (d) { return self.polarToCarY(d); });

  points.on('click', function() {
    console.log('cx: ' + $(this).attr('cx') + ', cy: ' + $(this).attr('cy'));
//    self.updateTooltip(this, {'player': $(this).attr('player'), 'points': $(this).attr('points')});
  });

}

/**
 * Update data points on curve.
 */
strudel.SpiralTimelineController.prototype.updatePoints = function () {
  var self = this;

  this.drawTestpoints();
  
  var points = this.getDataPoints(this.datapoints, 'time');
  var plotData = points;

  var colorMap = this.createColorMap(this.datapoints, 'player');
  
  // PMB -- test code for drawing barlines instead of points for data
  // Needs a lot of work
/*
  this.svg.selectAll("#datalines").remove(); 

  var point = this.svg.selectAll("dataline")
    .data(plotData);

  console.log("Running updatePoints");

  point.enter().append("line")
    .attr("id", "datalines")
    .attr("class", "dataline")
    .attr("x1", function (d) { return self.polarToCarX(d); })
    .attr("y1", function (d) { return self.polarToCarY(d); })
    .attr("x2", function (d) {
      var length = d['points'] * self.pointScale / self.numRotations;
      d['polarCoords'][1] = d['polarCoords'][1] + length;
      return self.polarToCarX(d); 
    })
    .attr("y2", function (d) {
      var length = d['points'] * self.pointScale / self.numRotations;
      d['polarCoords'][1] = d['polarCoords'][1] + length;
      return self.polarToCarY(d);
    })
    .attr("stroke-width", 2)
//    .attr("stroke", "black");
    .attr('stroke', function(d) {
      console.log("computing line color");
      var playerSlug = self.slugify(d['player']);
      var color = colorMap[playerSlug];
      return color;
    }); 

  return;  
*/
  var circle = this.svg.selectAll("circle.datapoints")
      .data(plotData);

  circle.exit().remove();

  circle.enter().append("circle")
    .attr('class', 'datapoints')
    .attr('player', function(d) {
      return d['player'];
    })
    .attr('points', function(d) {
      return d['points'];
    })
    .attr('opacity', function(d) {
      return self.pointOpacity;
    });

  if (!self.scalePoints) {
    circle.attr('r', function(d) {
      return self.pointScale;
    });
  }
  else {
    circle.attr('r', function(d) {
      var size = d['points'] * self.pointScale;
      return size;
    });
  }

  circle
      .attr("cx", function (d) { return self.polarToCarX(d); })
      .attr("cy", function (d) { return self.polarToCarY(d); });

  circle.on('click', function() {
    console.log('cx: ' + $(this).attr('cx') + ', cy: ' + $(this).attr('cy'));
    self.updateTooltip(this, {'player': $(this).attr('player'), 'points': $(this).attr('points')});
  });

};

/**
 * Update tooltip based on metadata.
 */
strudel.SpiralTimelineController.prototype.updateTooltip = function(el, data) {
  $('.tooltip').empty();
  var tooltipDetails = $('<div class="tooltip-player">Player: ' + data['player'] + '</div>' + '<div class="tooltip-points">Points: ' + data['points'] + '</div>');
  //console.log(tooltipDetails)
  $('.tooltip').append(tooltipDetails);
};


/**
 * Creates a UI element that updates the graph.
 *
 */
strudel.SpiralTimelineController.prototype.createUiElement = function(name, type, eventHandler) {

};
