import { assert } from "@esm-bundle/chai";
import { jsx, init, jsxPropsModule } from "../../src/index";
import { DOM_PROPS } from "../../src/modules/jsxprops";

const patch = init([jsxPropsModule], undefined, {
  experimental: {
    fragments: true
  }
});

describe("snabbdom", () => {
  describe("jsxprops", () => {
    it("forwards props to attributes", () => {
      const elm = document.createElement("div");
      const vnode = <div title="foo" aria-hidden="true" />;

      patch(elm, vnode);

      assert.strictEqual(vnode, {
        sel: "div",
        data: { attrs: { title: "foo", "aria-hidden": "true" } },
        elm,
        text: undefined,
        key: undefined,
        children: []
      });
      assert.strictEqual(vnode.data.title, undefined);
      assert.strictEqual(vnode.data["aria-hidden"], undefined);
    });

    DOM_PROPS.forEach((prop) => {
      const values: Record<string, any> = {
        className: "foo",
        id: "bar",
        tabIndex: 0
      };

      it(`forwards ${prop} to props`, () => {
        const elm = document.createElement("div");
        const props = { [prop]: values[prop] };
        const vnode = <div {...props} />;

        patch(elm, vnode);

        assert.strictEqual(vnode, {
          sel: "div",
          data: { props: { [prop]: values[prop] } },
          elm,
          text: undefined,
          key: undefined,
          children: []
        });
      });
    });

    it("forwards declared hooks", () => {
      let update = false;
      const handleUpdate = () => {
        update = true;
      };

      const elm = document.createElement("div");
      const vnode = <div hook-update={handleUpdate} />;

      patch(elm, vnode);

      assert.strictEqual(update, true);
      assert.strictEqual(vnode, {
        sel: "div",
        data: { hook: { update: handleUpdate } },
        elm,
        text: undefined,
        key: undefined,
        children: []
      });
      assert.strictEqual(vnode.data["hook-update"], undefined);
    });

    it("forwards declared event listeners", () => {
      const onClick = () => {};
      const elm = document.createElement("div");
      const vnode = <div on-click={onClick} />;
      patch(elm, vnode);

      elm.click();

      assert.strictEqual(vnode, {
        sel: "div",
        data: { on: { click: onClick } },
        elm,
        text: undefined,
        key: undefined,
        children: []
      });
      assert.strictEqual(vnode.data["on-click"], undefined);
    });

    it("forwards declared attributes", () => {
      const elm = document.createElement("div");
      const vnode = <div attrs-tabindex={0} />;

      patch(elm, vnode);

      assert.strictEqual(vnode, {
        sel: "div",
        data: { attrs: { tabindex: 0 } },
        elm,
        text: undefined,
        key: undefined,
        children: []
      });
    });

    it("forwards declared props", () => {
      const elm = document.createElement("div");
      const vnode = <div props-ariaLabel="foo" />;

      patch(elm, vnode);

      assert.strictEqual(vnode, {
        sel: "div",
        data: { props: { ariaLabel: "foo" } },
        elm,
        text: undefined,
        key: undefined,
        children: []
      });
    });

    it("forwards declared datasets", () => {
      const elm = document.createElement("div");
      const vnode = <div data-foo-bar="baz" />;

      patch(elm, vnode);

      assert.strictEqual(vnode, {
        sel: "div",
        data: { dataset: { fooBar: "baz" } },
        elm,
        text: undefined,
        key: undefined,
        children: []
      });
    });

    it("doesn't forward 'key' prop", () => {
      const elm = document.createElement("div");
      const vnode = <div key="key" />;

      patch(elm, vnode);

      assert.strictEqual(vnode, {
        sel: "div",
        data: { key: "key" },
        elm,
        text: undefined,
        key: "key",
        children: []
      });
    });

    describe("module compatibility", () => {
      it("preserves 'hook' prop value", () => {
        const handlePost = () => {};
        const handleUpdate = () => {};

        const elm = document.createElement("div");
        const vnode = (
          <div hook-post={handlePost} hook={{ update: handleUpdate }} />
        );

        patch(elm, vnode);

        assert.strictEqual(vnode, {
          sel: "div",
          data: { hook: { post: handlePost, update: handleUpdate } },
          elm,
          text: undefined,
          key: undefined,
          children: []
        });
      });

      it("preserves 'on' prop value", () => {
        const handleMouseEnter = () => {};
        const handleClick = () => {};

        const elm = document.createElement("div");
        const vnode = (
          <div on-mouseEnter={handleMouseEnter} on={{ click: handleClick }} />
        );

        patch(elm, vnode);

        assert.strictEqual(vnode, {
          sel: "div",
          data: { on: { click: handleClick, mouseEnter: handleMouseEnter } },
          elm,
          text: undefined,
          key: undefined,
          children: []
        });
      });

      it("preserves 'attrs' prop value", () => {
        const elm = document.createElement("div");
        const vnode = <div attrs-tabindex={0} attrs={{ value: "bar" }} />;

        patch(elm, vnode);

        assert.strictEqual(vnode, {
          sel: "div",
          data: { attrs: { tabindex: 0, value: "bar" } },
          elm,
          text: undefined,
          key: undefined,
          children: []
        });
      });

      it("preserves 'props' prop value", () => {
        const elm = document.createElement("div");
        const vnode = <div props-tabIndex={0} props={{ value: "bar" }} />;

        patch(elm, vnode);

        assert.strictEqual(vnode, {
          sel: "div",
          data: { props: { tabIndex: 0, value: "bar" } },
          elm,
          text: undefined,
          key: undefined,
          children: []
        });
      });

      it("preserves 'dataset' prop value", () => {
        const elm = document.createElement("div");
        const vnode = (
          <div data-some-value="foo" dataset={{ anotherValue: "bar" }} />
        );

        patch(elm, vnode);

        assert.strictEqual(vnode, {
          sel: "div",
          data: { dataset: { someValue: "foo", anotherValue: "bar" } },
          elm,
          text: undefined,
          key: undefined,
          children: []
        });
      });
    });
  });
});
