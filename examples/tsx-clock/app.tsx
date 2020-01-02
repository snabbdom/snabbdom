import { jsx } from "../../src/jsx";
import { init as snabbdomInit } from "../../src/snabbdom";
import toVNode from "../../src/tovnode";
import { VNode } from "../../src/vnode";
import attrsModule from "../../src/modules/attributes";
import classModule from "../../src/modules/class";
import styleModule from "../../src/modules/style";
import propsModule from "../../src/modules/props";
import onModule from "../../src/modules/eventlisteners";

// initialize snabbdom
const patch = snabbdomInit([
  attrsModule,
  classModule,
  styleModule,
  onModule,
  propsModule
]);

interface ClockState {
  date?: Date;
}

interface ClockProps {
  renderCallback?: (vnode: VNode) => void;
}

interface TimeUnitProps {
  unit: "hours" | "minutes" | "seconds";
  value: number;
  maxValue?: number;
}

const ProgressCircle = ({ unit, value, maxValue }: TimeUnitProps) => {
  const radiusForUnit = {
    seconds: 185,
    minutes: 150,
    hours: 115
  };

  const radius = radiusForUnit[unit];
  const circumference = Math.PI * 2 * radius;
  const progress = 1 - value / maxValue;

  return (
    <circle
      attrs={{ class: unit, r: radius, cx: 200, cy: 200 }}
      style={{
        strokeDasharray: String(circumference),
        strokeDashoffset: String(progress * circumference)
      }}
    ></circle>
  );
};

const TimeSpan = ({ unit, value }: TimeUnitProps) => (
  <span attrs={{ class: unit }}>{String(value).padStart(2, "0")}</span>
);

class ClockApp {
  private props: ClockProps = {};
  private state: ClockState = {};

  constructor(props: ClockProps) {
    this.props = props;
    this.update({ date: new Date() });

    // update date every second
    setInterval(() => this.update({ date: new Date() }), 1000);
  }

  update(stateUpdate: any) {
    // simple update -> render -> callback loop
    this.state = Object.assign(this.state, stateUpdate);
    this.props.renderCallback(this.render());
  }

  render() {
    // inspired from https://codepen.io/prathameshkoshti/pen/Rwwaqgv
    const hours =
      new Date().getHours() > 12
        ? new Date().getHours() - 12
        : new Date().getHours();
    const minutes = new Date().getMinutes();
    const seconds = new Date().getSeconds();
    const ampm = new Date().getHours() >= 12 ? "PM" : "AM";

    return (
      <div sel=".clock">
        <svg
          sel=".progress"
          attrs={{
            width: "400",
            height: "400",
            viewport: "0 0 400 400"
          }}
        >
          <ProgressCircle unit="seconds" value={seconds} maxValue={60} />
          <ProgressCircle unit="minutes" value={minutes} maxValue={60} />
          <ProgressCircle unit="hours" value={hours} maxValue={12} />
        </svg>
        <div sel=".text_grid">
          <TimeSpan unit="hours" value={hours} />
          <TimeSpan unit="minutes" value={minutes} />
          <TimeSpan unit="seconds" value={seconds} />
          <span sel=".am_pm">{ampm}</span>
        </div>
      </div>
    );
  }
}

function bindRender(el: HTMLElement) {
  // append empty vnode
  let vnode = toVNode(document.createComment(``));
  el.appendChild(vnode.elm);

  function renderCallback(newVNode: VNode) {
    vnode = patch(vnode, newVNode);
  }

  return renderCallback;
}

new ClockApp({
  renderCallback: bindRender(document.body)
});
