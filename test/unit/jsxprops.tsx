import { assert } from "@esm-bundle/chai";
import { jsx, init, jsxPropsModule } from "../../src/index";

const patch = init([jsxPropsModule], undefined, {
  experimental: {
    fragments: true
  }
});

describe("snabbdom", () => {
  describe("jsxprops", () => {
    it("forwards props to attributes", () => {
      const container = document.createElement("div");
      const vnode = <div title="foo" aria-hidden="true" />;

      patch(container, vnode);

      assert.deepStrictEqual(vnode, {
        sel: "div",
        data: { attrs: { title: "foo", "aria-hidden": "true" } },
        elm: undefined,
        text: undefined,
        key: undefined
      });
    });

    ["className", "id", "tabIndex"].forEach((prop) => {
      const values: Record<string, any> = {
        className: ".foo",
        id: "#foo",
        tabIndex: 0
      };

      it(`forwards ${prop} to props`, () => {
        const container = document.createElement("div");
        const props = { [prop]: values[prop] };
        const vnode = <div {...props} />;

        patch(container, vnode);

        assert.deepStrictEqual(vnode, {
          sel: "div",
          data: { props },
          elm: undefined,
          text: undefined,
          key: undefined
        });
      });
    });

    it("forwards declared hooks", () => {
      let created = false;
      const handleInsert = () => {
        created = true;
      };

      const container = document.createElement("div");
      const vnode = <div hook-insert={handleInsert} />;

      patch(container, vnode);

      assert.isTrue(created);
    });

    it("forwards declared event listeners", () => {
      let clicked = false;
      const onClick = () => {
        clicked = true;
      };

      const container = document.createElement("div");
      const vnode = <div on-click={onClick} />;

      patch(container, vnode);
      container.click();

      assert.isTrue(clicked);
    });

    it("forwards declared attributes", () => {
      const container = document.createElement("div");
      const vnode = <input attrs-tabindex={0} />;

      patch(container, vnode);

      assert.deepStrictEqual(vnode, {
        sel: "div",
        data: { attrs: { tabindex: 0 } },
        elm: undefined,
        text: undefined,
        key: undefined
      });
    });

    it("forwards declared props", () => {
      const container = document.createElement("div");
      const vnode = <input props-ariaLabel="foo" />;

      patch(container, vnode);

      assert.deepStrictEqual(vnode, {
        sel: "div",
        data: { props: { ariaLabel: "foo" } },
        elm: undefined,
        text: undefined,
        key: undefined
      });
    });

    it("forwards declared datasets", () => {
      const container = document.createElement("div");
      const vnode = <input data-foo-bar="baz" />;

      patch(container, vnode);

      assert.deepStrictEqual(vnode, {
        sel: "div",
        data: { dataset: { fooBar: "baz" } },
        elm: undefined,
        text: undefined,
        key: undefined
      });
    });

    it("doesn't forward 'key' prop", () => {
      const container = document.createElement("div");
      const vnode = <input key="key" />;

      patch(container, vnode);

      assert.deepStrictEqual(vnode, {
        sel: "div",
        data: { key: "key" },
        elm: undefined,
        text: undefined,
        key: undefined
      });
    });

    describe("module compatibility", () => {
      it("preserves 'hook' prop value", () => {
        let created = false,
          pre = false;
        const handlePre = () => {
          pre = true;
        };
        const handleCreate = () => {
          created = false;
        };

        const container = document.createElement("div");
        const vnode = (
          <div hook-insert={handlePre} hook={{ create: handleCreate }} />
        );

        patch(container, vnode);

        assert.isTrue(created);
        assert.isTrue(pre);
      });

      it("preserves 'on' prop value", () => {
        let clicked = false,
          hovered = false;
        const handleMouseEnter = () => {
          hovered = true;
        };
        const handleClick = () => {
          clicked = false;
        };

        const container = document.createElement("div");
        const vnode = (
          <div on-mouseEnter={handleMouseEnter} on={{ click: handleClick }} />
        );

        patch(container, vnode);

        container.click();
        container.dispatchEvent(new MouseEvent("mouseenter"));

        assert.isTrue(clicked);
        assert.isTrue(hovered);
      });

      it("preserves 'attrs' prop value", () => {
        const container = document.createElement("div");
        const vnode = <input attrs-tabindex={0} attrs={{ value: "bar" }} />;

        patch(container, vnode);

        assert.deepStrictEqual(vnode, {
          sel: "div",
          data: { attrs: { tabindex: 0, value: "bar" } },
          elm: undefined,
          text: undefined,
          key: undefined
        });
      });

      it("preserves 'props' prop value", () => {
        const container = document.createElement("div");
        const vnode = <input props-tabIndex={0} props={{ value: "bar" }} />;

        patch(container, vnode);

        assert.deepStrictEqual(vnode, {
          sel: "div",
          data: { props: { tabIndex: 0, value: "bar" } },
          elm: undefined,
          text: undefined,
          key: undefined
        });
      });

      it("preserves 'dataset' prop value", () => {
        const container = document.createElement("div");
        const vnode = (
          <input data-some-value="foo" dataset={{ anotherValue: "bar" }} />
        );

        patch(container, vnode);

        assert.deepStrictEqual(vnode, {
          sel: "div",
          data: { dataset: { someValue: "foo", anotherValue: "bar" } },
          elm: undefined,
          text: undefined,
          key: undefined
        });
      });
    });
  });
});
