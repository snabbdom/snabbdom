var snabbdom = require('../../snabbdom.js');
var patch = snabbdom.init([
  require('../../modules/attributes').default,
  require('../../modules/style').default,
  require('../../modules/eventlisteners').default
]);
var h = require('../../h.js').default;

var vnode;

var data = {
  degRotation: 0
};

function gRotation () {
  // console.log("gRotation: %s", data.degRotation);
  return "rotate(" + data.degRotation + "deg)";
}

function triangleClick (id) {
  console.log("triangleClick: %s", id);
  render();
}

function handleRotate (degs) {
  data.degRotation += degs;
  console.log("handleRotate: %s, %s", degs, data.degRotation);
  render();
}

function handleReset (degs) {
  data.degRotation = degs;
  console.log("handleReset: %s", degs);
  render();
}

function render () {
  vnode = patch(vnode, view(data));
}

const hTriangle = (id, degRotation) =>
  h("polygon#" + id, {
    attrs: {
      points: "-50,-88 0,-175 50,-88",
      transform: "rotate(" + degRotation + ")",
      "stroke-width": 3
    },
    on: { click: [triangleClick, id] }
  });

const view = (data) =>
  h("div.view", [
    h("h1", "Snabbdom SVG Carousel"),
    h("svg", { attrs: { width: 380, height: 380, viewBox: [-190, -190, 380, 380] } }, [
      h("g#carousel",
        { style: { "-webkit-transform": gRotation(), transform: gRotation() } }, [
          hTriangle("yellow", 0),
          hTriangle("green", 60),
          hTriangle("magenta", 120),
          hTriangle("red", 180),
          hTriangle("cyan", 240),
          hTriangle("blue", 300)
        ])
    ]),
    h("button", { on: { click: [handleRotate, 60] } }, "Rotate Clockwise"),
    h("button", { on: { click: [handleRotate, -60] } }, "Rotate Anticlockwise"),
    h("button", { on: { click: [handleReset, 0] } }, "Reset")
  ]);

window.addEventListener("DOMContentLoaded", () => {
  var container = document.getElementById("container");
  vnode = patch(container, view(data));
  render();
});
