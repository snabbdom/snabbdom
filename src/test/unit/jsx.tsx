import { assert } from 'chai'
// workaround linter issue
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from '../../package/jsx'
import '../../package/jsx-global'

describe('snabbdom', function () {
  describe('jsx', function () {
    it('can be used as a jsxFactory method', function () {
      const vnode = <div title="Hello World">Hello World</div>

      assert.deepStrictEqual(vnode, {
        sel: 'div',
        data: { title: 'Hello World' },
        children: undefined,
        elm: undefined,
        text: 'Hello World',
        key: undefined
      })
    })

    it('creates text property for text only child', function () {
      const vnode = <div>foo bar</div>

      assert.deepStrictEqual(vnode, {
        sel: 'div',
        data: {},
        children: undefined,
        elm: undefined,
        text: 'foo bar',
        key: undefined
      })
    })

    it('creates an array of children for multiple children', function () {
      const vnode = <div>{'foo'}{'bar'}</div>

      assert.deepStrictEqual(vnode, {
        sel: 'div',
        data: {},
        children: [
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: 'foo',
            key: undefined
          },
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: 'bar',
            key: undefined
          },
        ],
        elm: undefined,
        text: undefined,
        key: undefined
      })
    })

    it('flattens children', function () {
      const vnode = (
        <section>
          <h1>A Heading</h1>
          some description
          {['part1', 'part2'].map(part => <span>{part}</span>)}
        </section>
      )

      assert.deepStrictEqual(vnode, {
        sel: 'section',
        data: {},
        children: [
          {
            sel: 'h1',
            data: {},
            children: undefined,
            elm: undefined,
            text: 'A Heading',
            key: undefined
          },
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: 'some description',
            key: undefined
          },
          {
            sel: 'span',
            data: {},
            children: undefined,
            elm: undefined,
            text: 'part1',
            key: undefined
          },
          {
            sel: 'span',
            data: {},
            children: undefined,
            elm: undefined,
            text: 'part2',
            key: undefined
          },
        ],
        elm: undefined,
        text: undefined,
        key: undefined
      })
    })

    it('removes falsey children', function () {
      const showLogin = false
      const showCaptcha = false
      const loginAttempts = 0
      const userName = ''
      const profilePic = undefined
      const isLoggedIn = true
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
      )

      assert.deepStrictEqual(vnode, {
        sel: 'div',
        data: {},
        children: [
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: 'Login Form',
            key: undefined
          },
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: 'Login Attempts: ',
            key: undefined
          },
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: '0',
            key: undefined
          },
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: 'Logged In: ',
            key: undefined
          },
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: 'true',
            key: undefined
          },
        ],
        elm: undefined,
        text: undefined,
        key: undefined
      })
    })

    it('works with a function component', function () {
      // workaround linter issue
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const Part = ({ part }: {part: string}) => <span>{part}</span>
      const vnode = (
        <div>
          <a attrs={{ href: 'https://github.com/snabbdom/snabbdom' }}>Snabbdom</a>
          and tsx
          {['work', 'like', 'a', 'charm!'].map(part => <Part part={part}></Part>)}
          {'💃🕺🎉'}
        </div>
      )

      assert.deepStrictEqual(vnode, {
        sel: 'div',
        data: {},
        children: [
          {
            sel: 'a',
            data: { attrs: { href: 'https://github.com/snabbdom/snabbdom' } },
            children: undefined,
            elm: undefined,
            text: 'Snabbdom',
            key: undefined
          },
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: 'and tsx',
            key: undefined
          },
          {
            sel: 'span',
            data: {},
            children: undefined,
            elm: undefined,
            text: 'work',
            key: undefined
          },
          {
            sel: 'span',
            data: {},
            children: undefined,
            elm: undefined,
            text: 'like',
            key: undefined
          },
          {
            sel: 'span',
            data: {},
            children: undefined,
            elm: undefined,
            text: 'a',
            key: undefined
          },
          {
            sel: 'span',
            data: {},
            children: undefined,
            elm: undefined,
            text: 'charm!',
            key: undefined
          },
          {
            sel: undefined,
            data: undefined,
            children: undefined,
            elm: undefined,
            text: '💃🕺🎉',
            key: undefined
          },
        ],
        elm: undefined,
        text: undefined,
        key: undefined
      })
    })
  })
})
