import * as assert from 'assert';
import {jsx} from '../jsx';

describe('snabbdom', function() {
  describe('jsx', function() {
    it('can be used as a jsxFactory method', function() {
      const vnode = <div title="Hello World">Hello World</div>;

      assert.equal(JSON.stringify(vnode), JSON.stringify({
        sel: 'div',
        data: {title: 'Hello World'},
        text: 'Hello World',
      }));
    });

    it('creates text property for text only child', function() {
      const vnode = <div>foo bar</div>;

      assert.equal(JSON.stringify(vnode), JSON.stringify({
        sel: 'div',
        data: {},
        text: 'foo bar',
      }));
    });

    it('creates an array of children for multiple children', function() {
      const vnode = <div>{'foo'}{'bar'}</div>;

      assert.equal(JSON.stringify(vnode), JSON.stringify({
        sel: 'div',
        data: {},
        children: [
          {text: 'foo'},
          {text: 'bar'},
        ]
      }));
    });

    it('flattens children', function() {
      const vnode = (
        <section>
          <h1>A Heading</h1>
          some description
          {['part1', 'part2'].map(part => <span>{part}</span>)}
        </section>
      );

      assert.equal(JSON.stringify(vnode), JSON.stringify({
        sel: 'section',
        data: {},
        children: [
          {sel: 'h1', data: {}, text: 'A Heading'},
          {text: 'some description'},
          {sel: 'span', data: {}, text: 'part1'},
          {sel: 'span', data: {}, text: 'part2'},
        ],
      }));
    });

    it('removes falsey children', function() {
      const showLogin = false;
      const showCaptcha = false;
      const loginAttempts = 0;
      const userName = ``;
      const profilePic = undefined;
      const isLoggedIn = true;
      const vnode = (
        <div>
          Login Form
          {showLogin && <login-form />}
          {showCaptcha ? <captcha-form /> : null}
          {userName}
          {profilePic}
          Login Attempts: {loginAttempts}
          Logged In: {isLoggedIn}
        </div>
      );

      assert.equal(JSON.stringify(vnode), JSON.stringify({
        sel: 'div',
        data: {},
        children: [
          {text: 'Login Form'},
          {text: 'Login Attempts: '},
          {text: '0'},
          {text: 'Logged In: '},
          {text: 'true'},
        ],
      }));
    });

    it('works with a function component', function() {
      const Part = ({part}: {part: string}) => <span>{part}</span>
      const vnode = (
        <div>
          <a attrs={{href: 'https://github.com/snabbdom/snabbdom'}}>Snabbdom</a>
          and tsx
          {['work', 'like', 'a', 'charm!'].map(part => <Part part={part}></Part>)}
          {'💃🕺🎉'}
        </div>
      );

      assert.equal(JSON.stringify(vnode), JSON.stringify({
        sel: 'div',
        data: {},
        children: [
          {sel: 'a', data: {attrs: {href: 'https://github.com/snabbdom/snabbdom'}}, text: 'Snabbdom'},
          {text: 'and tsx'},
          {sel: 'span', data: {}, text: 'work'},
          {sel: 'span', data: {}, text: 'like'},
          {sel: 'span', data: {}, text: 'a'},
          {sel: 'span', data: {}, text: 'charm!'},
          {text: '💃🕺🎉'},
        ],
      }));
    })
  });
});
