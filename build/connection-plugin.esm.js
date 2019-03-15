/*!
* rete-connection-plugin v0.4.5 
* (c) 2019  
* Released under the ISC license.
*/
function ___$insertStyle(css) {
  if (!css) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  var style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);

  return css;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function toTrainCase(str) {
  return str.toLowerCase().replace(/ /g, '-');
}

function defaultPath(points, curvature) {
  var _points = _slicedToArray(points, 4),
      x1 = _points[0],
      y1 = _points[1],
      x2 = _points[2],
      y2 = _points[3];

  var hx1 = x1 + Math.abs(x2 - x1) * curvature;
  var hx2 = x2 - Math.abs(x2 - x1) * curvature;
  return "M ".concat(x1, " ").concat(y1, " C ").concat(hx1, " ").concat(y1, " ").concat(hx2, " ").concat(y2, " ").concat(x2, " ").concat(y2);
}
function renderPathData(emitter, points, connection) {
  var data = {
    points: points,
    connection: connection,
    d: ''
  };
  emitter.trigger('connectionpath', data);
  return data.d || defaultPath(points, 0.4);
}
function updateConnection(_ref) {
  var el = _ref.el,
      d = _ref.d;
  var path = el.querySelector('.connection path');
  if (!path) throw new Error('Path of connection was broken');
  path.setAttribute('d', d);
}
function renderConnection(_ref2) {
  var _svg$classList;

  var el = _ref2.el,
      d = _ref2.d,
      connection = _ref2.connection;
  var classed = !connection ? [] : ['input-' + toTrainCase(connection.input.name), 'output-' + toTrainCase(connection.output.name), 'socket-input-' + toTrainCase(connection.input.socket.name), 'socket-output-' + toTrainCase(connection.output.socket.name)];
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  (_svg$classList = svg.classList).add.apply(_svg$classList, ['connection'].concat(classed));

  path.classList.add('main-path');
  path.setAttribute('d', d);
  svg.appendChild(path);
  el.appendChild(svg);
  updateConnection({
    el: el,
    d: d
  });
}

var Picker =
/*#__PURE__*/
function () {
  function Picker(editor) {
    _classCallCheck(this, Picker);

    _defineProperty(this, "el", void 0);

    _defineProperty(this, "editor", void 0);

    _defineProperty(this, "_output", null);

    this.el = document.createElement('div');
    this.editor = editor;
  }

  _createClass(Picker, [{
    key: "reset",
    value: function reset() {
      this.output = null;
    }
  }, {
    key: "pickOutput",
    value: function pickOutput(output) {
      if (this.output) this.reset();
      this.output = output;
    } // eslint-disable-next-line max-statements

  }, {
    key: "pickInput",
    value: function pickInput(input) {
      var _this = this;

      if (this.output === null) {
        if (input.hasConnection()) {
          this.output = input.connections[0].output;
          this.editor.removeConnection(input.connections[0]);
        }

        return true;
      }

      if (!input.multipleConnections && input.hasConnection()) this.editor.removeConnection(input.connections[0]);
      if (!this.output.multipleConnections && this.output.hasConnection()) this.editor.removeConnection(this.output.connections[0]);

      if (this.output.connectedTo(input)) {
        var connection = input.connections.find(function (c) {
          return c.output === _this.output;
        });

        if (connection) {
          this.editor.removeConnection(connection);
        }
      }

      this.editor.connect(this.output, input);
      this.reset();
    }
  }, {
    key: "pickConnection",
    value: function pickConnection(connection) {
      var output = connection.output;
      this.editor.removeConnection(connection);
      this.output = output;
    }
  }, {
    key: "getPoints",
    value: function getPoints(output) {
      var mouse = this.editor.view.area.mouse;
      if (!output.node) throw new Error('Node in output not found');
      var node = this.editor.view.nodes.get(output.node);
      if (!node) throw new Error('Node view not found');

      var _node$getSocketPositi = node.getSocketPosition(output),
          _node$getSocketPositi2 = _slicedToArray(_node$getSocketPositi, 2),
          x1 = _node$getSocketPositi2[0],
          y1 = _node$getSocketPositi2[1];

      return [x1, y1, mouse.x, mouse.y];
    }
  }, {
    key: "updateConnection",
    value: function updateConnection$$1() {
      if (!this.output) return;
      var d = renderPathData(this.editor, this.getPoints(this.output));

      updateConnection({
        el: this.el,
        d: d
      });
    }
  }, {
    key: "renderConnection",
    value: function renderConnection$$1() {
      if (!this.output) return;
      var d = renderPathData(this.editor, this.getPoints(this.output));

      renderConnection({
        el: this.el,
        d: d
      });
    }
  }, {
    key: "output",
    get: function get() {
      return this._output;
    },
    set: function set(val) {
      var area = this.editor.view.area;
      this._output = val;

      if (val !== null) {
        area.appendChild(this.el);
        this.renderConnection();
      } else if (this.el.parentElement) {
        area.removeChild(this.el);
        this.el.innerHTML = '';
      }
    }
  }]);

  return Picker;
}();

___$insertStyle(".connection {\n  overflow: visible !important;\n  width: 1px;\n  height: 1px;\n  position: absolute;\n  z-index: -1; }\n  .connection .main-path {\n    fill: none;\n    stroke-width: 5px;\n    stroke: steelblue; }\n");

var Flow =
/*#__PURE__*/
function () {
  function Flow(picker) {
    _classCallCheck(this, Flow);

    _defineProperty(this, "picker", void 0);

    _defineProperty(this, "target", null);

    this.picker = picker;
    this.target = null;
  }

  _createClass(Flow, [{
    key: "act",
    value: function act() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        input: null,
        output: null
      },
          input = _ref.input,
          output = _ref.output;

      if (this.unlock(input || output)) return;
      if (input) this.picker.pickInput(input);else if (output) this.picker.pickOutput(output);else this.picker.reset();
    }
  }, {
    key: "once",
    value: function once(params, io) {
      this.act(params);
      this.target = io;
    }
  }, {
    key: "unlock",
    value: function unlock(io) {
      var target = this.target;
      this.target = null;
      return target && target === io;
    }
  }]);

  return Flow;
}();

function install(editor) {
  editor.bind('connectionpath');
  var picker = new Picker(editor);
  var flow = new Flow(picker);
  editor.on('rendersocket', function (_ref2) {
    var el = _ref2.el,
        input = _ref2.input,
        output = _ref2.output;
    el._reteConnectionPlugin = {
      input: input,
      output: output
    };
    el.addEventListener('pointerdown', function (e) {
      editor.view.container.dispatchEvent(new PointerEvent('pointermove', e));
      e.stopPropagation();
      flow.once(el._reteConnectionPlugin, input);
    });
  });
  window.addEventListener('pointerup', function (e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);

    if (el) {
      flow.act(el._reteConnectionPlugin);
    }
  });
  editor.on('mousemove', function () {
    return picker.updateConnection();
  });
  editor.on('renderconnection', function (_ref3) {
    var el = _ref3.el,
        connection = _ref3.connection,
        points = _ref3.points;
    var d = renderPathData(editor, points, connection);
    renderConnection({
      el: el,
      d: d,
      connection: connection
    });
  });
  editor.on('updateconnection', function (_ref4) {
    var el = _ref4.el,
        connection = _ref4.connection,
        points = _ref4.points;
    var d = renderPathData(editor, points, connection);
    updateConnection({
      el: el,
      d: d
    });
  });
}

var index$1 = {
  name: 'connection',
  install: install
};

export default index$1;
export { defaultPath };
//# sourceMappingURL=connection-plugin.esm.js.map
