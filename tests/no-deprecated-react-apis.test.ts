import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-deprecated-react-apis'] };

describe('no-deprecated-react-apis rule', () => {
  it('should detect componentWillMount', () => {
    const code = `
      class MyComponent extends Component {
        componentWillMount() {
          this.setup();
        }
        render() { return <div />; }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-deprecated-react-apis');
    expect(results[0].message).toContain('componentWillMount');
  });

  it('should detect componentWillReceiveProps', () => {
    const code = `
      class MyComponent extends Component {
        componentWillReceiveProps(nextProps) {
          this.update(nextProps);
        }
        render() { return <div />; }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect UNSAFE_ lifecycle methods', () => {
    const code = `
      class MyComponent extends Component {
        UNSAFE_componentWillMount() {}
        UNSAFE_componentWillUpdate() {}
        render() { return <div />; }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(2);
  });

  it('should detect static defaultProps', () => {
    const code = `
      class MyComponent extends Component {
        static defaultProps = { name: 'World' };
        render() { return <div />; }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('defaultProps');
  });

  it('should detect Component.defaultProps assignment', () => {
    const code = `
      function MyComponent({ name }) { return <div>{name}</div>; }
      MyComponent.defaultProps = { name: 'World' };
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect propTypes', () => {
    const code = `
      MyComponent.propTypes = { name: PropTypes.string };
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('propTypes');
  });

  it('should detect string refs', () => {
    const code = `
      function MyComponent() {
        return <input ref="myInput" />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('String refs');
  });

  it('should allow useRef', () => {
    const code = `
      function MyComponent() {
        const ref = useRef(null);
        return <input ref={ref} />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow callback refs', () => {
    const code = `
      function MyComponent() {
        return <input ref={(el) => { inputRef = el; }} />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow modern lifecycle methods', () => {
    const code = `
      class MyComponent extends Component {
        componentDidMount() {}
        componentDidUpdate() {}
        componentWillUnmount() {}
        render() { return <div />; }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
