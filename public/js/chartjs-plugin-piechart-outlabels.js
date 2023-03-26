/*!
 * @energiency/chartjs-plugin-piechart-outlabels v1.3.2
 * http://www.chartjs.org
 * (c) 2017-2023 @energiency/chartjs-plugin-piechart-outlabels contributors
 * Released under the MIT license
 */
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js'), require('chart.js/helpers')) :
typeof define === 'function' && define.amd ? define(['chart.js', 'chart.js/helpers'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ChartPieChartOutlabels = factory(global.Chart, global.Chart.helpers));
})(this, (function (chart_js, helpers) { 'use strict';

/**
 * @module Options
 */

var customDefaults = {

  PLUGIN_KEY: '$outlabels',

  /**
	 * The color used to draw the background of the label rect.
	 * @member {String|Array|Function|null}
	 * @default null (adaptive background)
	 */
  backgroundColor: function(context) {
    return context.dataset.backgroundColor;
  },

  /**
	 * The color used to draw the border of the label rect.
	 * @member {String|Array|Function|null}
	 * @default null (adaptive border color)
	 */
  borderColor: function(context) {
    return context.dataset.backgroundColor;
  },

  /**
	 * The color used to draw the line between label and arc of the chart.
	 * @member {String|Array|Function|null}
	 * @default null (adaptive line color)
	 */
  lineColor: function(context) {
    return context.dataset.backgroundColor;
  },

  /**
	 * The border radius used to add rounded corners to the label rect.
	 * @member {Number|Array|Function}
	 * @default 0 (not rounded)
	 */
  borderRadius: 0,

  /**
	 * The border width of the surrounding frame.
	 * @member {Number|Array|Function}
	 * @default 0 (no border)
	 */
  borderWidth: 0,

  /**
	 * The width (thickness) of the line between label and chart arc.
	 * @member {Number|Array|Function}
	 * @default 2
	 */
  lineWidth: 2,

  /**
	 * The color used to draw the label text.
	 * @member {String|Array|Function}
	 * @default white
	 */
  color: 'white',

  /**
	 * Whether to display labels global (boolean) or per data (function)
	 * @member {Boolean|Array|Function}
	 * @default true
	 */
  display: true,

  /**
	 * The font options used to draw the label text.
	 * @member {Object|Array|Function}
	 * @prop {Boolean} font.family - defaults to Chart.defaults.global.defaultFontFamily
	 * @prop {Boolean} font.size - defaults to Chart.defaults.global.defaultFontSize
	 * @prop {Boolean} font.style - defaults to Chart.defaults.global.defaultFontStyle
	 * @prop {Boolean} font.weight - defaults to 'normal'
	 * @prop {Boolean} font.maxSize - defaults to undefined (unlimited)
	 * @prop {Boolean} font.minSize - defaults to undefined (unlimited)
	 * @prop {Boolean} font.resizable - defaults to true
	 * @default Chart.defaults.global.defaultFont.*
	 */
  font: {
    family: undefined,
    size: undefined,
    style: undefined,
    weight: null,
    maxSize: null,
    minSize: null,
    resizable: true,
  },

  /**
	 * The line height (in pixel) to use for multi-lines labels.
	 * @member {Number|Array|Function|undefined}
	 * @default 1.2
	 */
  lineHeight: 1.2,


  /**
	 * The padding (in pixels) to apply between the text and the surrounding frame.
	 * @member {Number|Object|Array|Function}
	 * @prop {Number} padding.top - Space above the text.
	 * @prop {Number} padding.right - Space on the right of the text.
	 * @prop {Number} padding.bottom - Space below the text.
	 * @prop {Number} padding.left - Space on the left of the text.
	 * @default 4 (all values)
	 */
  padding: {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2
  },

  /**
	 * Text alignment for multi-lines labels ('left'|'right'|'start'|'center'|'end').
	 * @member {String|Array|Function}
	 * @default 'center'
	 */
  textAlign: 'center',

  /**
	 * The radius of distance where the label will be drawn
	 * @member {Number|Array|Function|undefined}
	 * @default 30
	 */
  stretch: 12,

  /**
	 * The length of the horizontal part of line between label and chart arc.
	 * @member {Number}
	 * @default 30
	 */
  horizontalStrechPad: 12,

  /**
	 * The text of the label.
	 * @member {String}
	 * @default '%l %p' (label name and value percentage)
	 */
  text: '%l %p',

  /**
	 * The max level of zoom (out) for pie/doughnut chart in percent.
	 * @member {Number}
	 * @default 50 (%)
	 */
  maxZoomOutPercentage: 50,

  /**
	 * The count of numbers after the point separator for float values of percent property
	 * @member {Number}
	 * @default 1
	 */
  percentPrecision: 1,

  /**
	 * The count of numbers after the point separator for float values of value property
	 * @member {Number}
	 * @default 3
	 */
  valuePrecision: 3
};

const chartStates = new WeakMap();

function getState(chart) {
  let state = chartStates.get(chart);
  if (!state) {
    state = {
      sizeChanged: false,
      fitting: false,
    };
    chartStates.set(chart, state);
  }
  return state;
}

function removeState(chart) {
  chartStates.delete(chart);
}

var positioners = {
  center: function(arc, stretch) {
    var angle = (arc.startAngle + arc.endAngle) / 2;
    var cosA = Math.cos(angle);
    var sinA = Math.sin(angle);
    var d = arc.outerRadius;

    var stretchedD = d + stretch;
    return {
      x: arc.x + cosA * stretchedD,
      y: arc.y + sinA * stretchedD,
      d: stretchedD,
      arc: arc,
      anchor: {
        x: arc.x + cosA * d,
        y: arc.y + sinA * d,
      },
      copy: {
        x: arc.x + cosA * stretchedD,
        y: arc.y + sinA * stretchedD
      }
    };
  },

  moveFromAnchor: function(center, dist) {
    var arc = center.arc;
    var d = center.d;
    var angle = (arc.startAngle + arc.endAngle) / 2;
    var cosA = Math.cos(angle);
    var sinA = Math.sin(angle);

    d += dist;

    return {
      x: arc.x + cosA * d,
      y: arc.y + sinA * d,
      d: d,
      arc: arc,
      anchor: center.anchor,
      copy: {
        x: arc.x + cosA * d,
        y: arc.y + sinA * d
      }
    };
  }
};

function toFontString(font) {
  if (!font || helpers.isNullOrUndef(font.size) || helpers.isNullOrUndef(font.family)) {
    return null;
  }

  return (font.style ? font.style + ' ' : '')
    + (font.weight ? font.weight + ' ' : '')
    + font.size + 'px '
    + font.family;
}

function textSize(ctx, lines, font) {
  var items = [].concat(lines);
  var ilen = items.length;
  var prev = ctx.font;
  var width = 0;
  var i;

  ctx.font = font.string;

  for (i = 0; i < ilen; ++i) {
    width = Math.max(ctx.measureText(items[i]).width, width);
  }

  ctx.font = prev;

  return {
    height: ilen * font.lineHeight,
    width: width
  };
}

function adaptTextSizeToHeight(height, minimum, maximum) {
  var size = (height / 100) * 2.5;
  if (minimum && size < minimum) {
    return minimum;
  }
  if (maximum && size > maximum) {
    return maximum;
  }
  return size;
}

function parseFont(value, height) {
  var size = helpers.valueOrDefault(value.size, chart_js.Chart.defaults.defaultFontSize);

  if (value.resizable) {
    size = adaptTextSizeToHeight(height, value.minSize, value.maxSize);
  }

  var font = {
    family: helpers.valueOrDefault(value.family, chart_js.Chart.defaults.defaultFontFamily),
    lineHeight: helpers.toLineHeight(value.lineHeight, size),
    size: size,
    style: helpers.valueOrDefault(value.style, chart_js.Chart.defaults.defaultFontStyle),
    weight: helpers.valueOrDefault(value.weight, null),
    string: ''
  };

  font.string = toFontString(font);
  return font;
}

var PLUGIN_KEY$1 = customDefaults.PLUGIN_KEY;

function collides(rect, otherRect) {
  return (
    rect.x < otherRect.x + otherRect.width &&
    rect.x + rect.width > otherRect.x &&
    rect.y < otherRect.y + otherRect.height &&
    rect.y + rect.height > otherRect.y
  );
}

var classes = {
  OutLabel: function (chart, index, ctx, config, context) {
    // Check whether the label should be displayed
    if (!helpers.resolve([config.display, true], context, index)) {
      throw new Error("Label display property is set to false.");
    }

    // Init text
    var value = context.dataset.data[index];
    var label = context.labels[index];
    var text = helpers.resolve([config.text, customDefaults.text], context, index);
    /* Replace label marker */
    text = text.replace(/%l/gi, label);

    /* Replace value marker with possible precision value */
    (text.match(/%v\.?(\d*)/gi) || [])
      .map(function (val) {
        var prec = val.replace(/%v\./gi, "");
        if (prec.length) {
          return +prec;
        }
        return config.valuePrecision || customDefaults.valuePrecision;
      })
      .forEach(function (val) {
        text = text.replace(/%v\.?(\d*)/i, value.toFixed(val));
      });

    /* Replace percent marker with possible precision value */
    (text.match(/%p\.?(\d*)/gi) || [])
      .map(function (val) {
        var prec = val.replace(/%p\./gi, "");
        if (prec.length) {
          return +prec;
        }
        return config.percentPrecision || customDefaults.percentPrecision;
      })
      .forEach(function (val) {
        text = text.replace(
          /%p\.?(\d*)/i,
          (context.percent * 100).toFixed(val) + "%"
        );
      });

    // Count lines
    var lines = text.match(/[^\r\n]+/g) || [];

    // Remove unnecessary spaces
    for (var i = 0; i < lines.length; ++i) {
      lines[i] = lines[i].trim();
    }

    /* ===================== CONSTRUCTOR ==================== */
    this.init = function (text, lines) {
      // If everything ok -> begin initializing
      this.encodedText = config.text;
      this.text = text;
      this.lines = lines;
      this.label = label;
      this.value = value;
      this.ctx = ctx;

      // Init style
      this.style = {
        backgroundColor: helpers.resolve(
          [config.backgroundColor, customDefaults.backgroundColor, "black"],
          context,
          index
        ),
        borderColor: helpers.resolve(
          [config.borderColor, customDefaults.borderColor, "black"],
          context,
          index
        ),
        borderRadius: helpers.resolve([config.borderRadius, 0], context, index),
        borderWidth: helpers.resolve([config.borderWidth, 0], context, index),
        lineWidth: helpers.resolve([config.lineWidth, 2], context, index),
        lineColor: helpers.resolve(
          [config.lineColor, customDefaults.lineColor, "black"],
          context,
          index
        ),
        color: helpers.resolve([config.color, "white"], context, index),
        font: parseFont(
          helpers.resolve([config.font, { resizable: true }]),
          ctx.canvas.style.height.slice(0, -2)
        ),
        padding: helpers.toPadding(helpers.resolve([config.padding, 0], context, index)),
        textAlign: helpers.resolve([config.textAlign, "left"], context, index),
      };

      this.stretch = helpers.resolve(
        [config.stretch, customDefaults.stretch],
        context,
        index
      );
      this.horizontalStrechPad = helpers.resolve(
        [config.horizontalStrechPad, customDefaults.horizontalStrechPad],
        context,
        index
      );
      this.size = textSize(ctx, this.lines, this.style.font);

      this.offsetStep = this.size.width / 20;
      this.offset = {
        x: 0,
        y: 0,
      };
    };

    this.init(text, lines);

    /* COMPUTING RECTS PART */
    this.computeLabelRect = function () {
      var width =
        this.textRect.width +
        2 * this.style.borderWidth +
        this.style.padding.left +
        this.style.padding.right;
      var height =
        this.textRect.height +
        2 * this.style.borderWidth +
        this.style.padding.top +
        this.style.padding.bottom;

      var x = this.textRect.x - this.style.borderWidth;
      var y = this.textRect.y - this.style.borderWidth;

      return {
        x: x,
        y: y,
        width: width,
        height: height,
        isLeft: this.textRect.isLeft,
        isTop: this.textRect.isTop,
      };
    };

    this.computeTextRect = function () {
      const isLeft = this.center.x - this.center.anchor.x < 0;
      const isTop = this.center.y - this.center.anchor.y < 0;
      const shift = isLeft
        ? -(this.horizontalStrechPad + this.size.width)
        : this.horizontalStrechPad;
      return {
        x: this.center.x - this.style.padding.left + shift,
        y: this.center.y - this.size.height / 2,
        width: this.size.width,
        height: this.size.height,
        isLeft,
        isTop,
      };
    };

    /* ======================= DRAWING ======================= */
    // Draw label text
    this.drawText = function () {
      var align = this.style.textAlign;
      var font = this.style.font;
      var lh = font.lineHeight;
      var color = this.style.color;
      var ilen = this.lines.length;
      var x, y, idx;

      if (!ilen || !color) {
        return;
      }

      x = this.textRect.x;
      y = this.textRect.y + lh / 2;

      if (align === "center") {
        x += this.textRect.width / 2;
      } else if (align === "end" || align === "right") {
        x += this.textRect.width;
      }

      this.ctx.font = this.style.font.string;
      this.ctx.fillStyle = color;
      this.ctx.textAlign = align;
      this.ctx.textBaseline = "middle";

      for (idx = 0; idx < ilen; ++idx) {
        this.ctx.fillText(
          this.lines[idx],
          Math.round(x) + this.style.padding.left,
          Math.round(y),
          Math.round(this.textRect.width)
        );
        y += lh;
      }
    };

    this.ccw = function (A, B, C) {
      return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    };

    this.intersects = function (A, B, C, D) {
      return (
        this.ccw(A, C, D) !== this.ccw(B, C, D) &&
        this.ccw(A, B, C) !== this.ccw(A, B, D)
      );
    };

    this.drawLine = function () {
      if (!this.lines.length) {
        return;
      }
      this.ctx.save();

      this.ctx.strokeStyle = this.style.lineColor;
      this.ctx.lineWidth = this.style.lineWidth;
      this.ctx.lineJoin = "miter";
      this.ctx.beginPath();
      this.ctx.moveTo(this.center.anchor.x, this.center.anchor.y);
      this.ctx.lineTo(this.center.copy.x, this.center.copy.y);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(this.center.copy.x, this.center.copy.y);
      const xOffset = this.textRect.width + this.style.padding.width;
      const intersect = this.intersects(
        this.textRect,
        {
          x: this.textRect.x + this.textRect.width,
          y: this.textRect.y + this.textRect.height,
        },
        this.center.copy,
        {
          x: this.textRect.x,
          y: this.textRect.y + this.textRect.height / 2,
        }
      );
      this.ctx.lineTo(
        this.textRect.x + (intersect ? xOffset : 0),
        this.textRect.y + this.textRect.height / 2
      );
      this.ctx.stroke();
      this.ctx.restore();
    };

    this.draw = function () {
      if (chart.getDataVisibility(index)) {
        this.drawText();
        this.drawLine();
      }
    };

    // eslint-disable-next-line max-statements
    this.update = function (view, elements, max) {
      this.center = positioners.center(view, this.stretch);

      let valid = false;
      let steps = 30;

      while (!valid && steps > 0) {
        this.textRect = this.computeTextRect();
        this.labelRect = this.computeLabelRect();

        valid = true;

        for (var e = 0; e < max; ++e) {
          var element = elements[e][PLUGIN_KEY$1];
          if (!element || !chart.getDataVisibility(index)) {
            continue;
          }

          if (collides(this.labelRect, element.labelRect)) {
            valid = false;
            break;
          }
        }

        if (!valid) {
          this.center = positioners.moveFromAnchor(this.center, 5);
        }

        steps--;
      }
    };
  },
};

chart_js.defaults.plugins.outlabels = customDefaults;

var PLUGIN_KEY = customDefaults.PLUGIN_KEY;

function configure(dataset, options) {
  var override = dataset.outlabels;
  var config = {};

  if (override === false) {
    return null;
  }
  if (override === true) {
    override = {};
  }

  return Object.assign({}, config, options, override);
}

/**
 * Returns the bounding box of the given label elements.
 *
 * @param {*} elements List of chart elements
 * @returns Bounding box
 */
function getBoundingBox(elements) {
  const rect = {
    left: Infinity,
    right: -Infinity,
    top: Infinity,
    bottom: -Infinity,
  };

  for (let i = 0, l = elements.length; i < l; i++) {
    const outlabel = elements[i][PLUGIN_KEY];
    if (!outlabel || !outlabel.labelRect) {
      continue;
    }

    const { labelRect } = outlabel;
    const { x, y, width, height } = labelRect;

    rect.left = Math.min(rect.left, x);
    rect.right = Math.max(rect.right, x + width);
    rect.top = Math.min(rect.top, y);
    rect.bottom = Math.max(rect.bottom, y + height);
  }

  return {
    ...rect,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
  };
}

/**
 * Returns the zoom percentage required to fit the given bounding box within the given bounding box.
 *
 * @param {*} boundingBoxToResize
 * @param {*} boundingBoxToFitWithin
 * @returns Zoom percentage
 */
function getResizeZoomPercentage(boundingBoxToResize, boundingBoxToFitWithin) {
  const { width, height } = boundingBoxToFitWithin;
  const deltas = [
    ((boundingBoxToFitWithin.left - boundingBoxToResize.left) / width) * 2,
    ((boundingBoxToFitWithin.top - boundingBoxToResize.top) / height) * 2,
    ((boundingBoxToResize.right - boundingBoxToFitWithin.right) / width) * 2,
    ((boundingBoxToResize.bottom - boundingBoxToFitWithin.bottom) / height) * 2,
  ];

  const maxDelta = Math.max(0, ...deltas);
  return 1 - maxDelta;
}

/**
 * Updates the labels of the given elements.
 * @param {*} elements
 */
function updateLabels(elements) {
  for (let i = 0, l = elements.length; i < l; i++) {
    const element = elements[i];
    const outlabel = element[PLUGIN_KEY];
    if (!outlabel) {
      continue;
    }

    outlabel.update(element, elements, i);
  }
}

function fitChartArea(chart) {
  const ctrl = chart._metasets[0].controller;
  const meta = ctrl.getMeta();
  const elements = meta.data || [];

  const boundingBox = getBoundingBox(elements);
  const zoom = getResizeZoomPercentage(boundingBox, chart.chartArea);

  if (zoom && zoom !== 1) {
    ctrl.outerRadius = ctrl.outerRadius * zoom;
    ctrl.innerRadius *= zoom;

    ctrl.updateElements(meta.data, 0, meta.data.length, "none");
    return true;
  }

  return false;
}

var plugin = {
  id: "outlabels",
  resize: function (chart) {
    getState(chart).sizeChanged = true;
  },
  afterUpdate: (chart) => {
    const ctrl = chart._metasets[0].controller;
    const meta = ctrl.getMeta();
    const elements = meta.data || [];

    let fit = false;
    // Limit the number of steps to prevent infinite loops
    // It seems that using the number of elements will ensure that the chart
    // fits by positioning all labels in successive resizes
    let maxSteps = elements.length;

    // Avoid to draw labels while fitting the chart area
    getState(chart).fitting = true;

    while (!fit && maxSteps-- > 0) {
      updateLabels(elements);
      fit = !fitChartArea(chart);
    }

    getState(chart).fitting = false;
  },
  afterDatasetUpdate: function (chart, args, options) {
    var labels = chart.config.data.labels;
    var dataset = chart.data.datasets[args.index];
    var config = configure(dataset, options);
    var display = config && config.display;
    var elements = args.meta.data || [];
    var ctx = chart.ctx;
    var el, label, percent, newLabel, context, i;
    ctx.save();

    for (i = 0; i < elements.length; ++i) {
      el = elements[i];
      label = el[PLUGIN_KEY];
      percent = dataset.data[i] / args.meta.total;
      newLabel = null;

      if (display && el && !el.hidden) {
        try {
          context = {
            chart: chart,
            dataIndex: i,
            dataset: dataset,
            labels: labels,
            datasetIndex: args.index,
            percent: percent,
          };
          newLabel = new classes.OutLabel(chart, i, ctx, config, context);
        } catch (e) {
          newLabel = null;
        }
      }

      if (
        label &&
        newLabel &&
        !getState(chart).sizeChanged &&
        label.label === newLabel.label &&
        label.encodedText === newLabel.encodedText
      ) {
        newLabel.offset = label.offset;
      }
      el[PLUGIN_KEY] = newLabel;
    }

    ctx.restore();
    getState(chart).sizeChanged = false;
  },
  afterDatasetDraw: function (chart, args) {
    var elements = args.meta.data || [];
    var ctx = chart.ctx;

    if (getState(chart).fitting) {
      return;
    }

    elements.forEach((el, index) => {
      const outlabelPlugin = el[PLUGIN_KEY];
      if (!outlabelPlugin) {
        return;
      }
      outlabelPlugin.update(el, elements, index);
      outlabelPlugin.draw(ctx);
    });
  },
  afterDestroy: function (chart) {
    removeState(chart);
  },
};

return plugin;

}));
