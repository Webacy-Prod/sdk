import { describe, it, expect, vi, afterEach } from 'vitest';
import { printResult, parseListInput } from '../output';

describe('printResult', () => {
  const spy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

  afterEach(() => {
    spy.mockClear();
  });

  it('writes compact JSON by default', () => {
    printResult({ foo: 'bar' }, {});
    expect(spy).toHaveBeenCalledWith('{"foo":"bar"}\n');
  });

  it('writes pretty JSON when --pretty is set', () => {
    printResult({ foo: 'bar' }, { pretty: true });
    expect(spy).toHaveBeenCalledWith('{\n  "foo": "bar"\n}\n');
  });
});

describe('parseListInput', () => {
  it('parses a comma-separated list', () => {
    expect(parseListInput('a, b ,c')).toEqual(['a', 'b', 'c']);
  });

  it('drops empty entries', () => {
    expect(parseListInput('a,,b,')).toEqual(['a', 'b']);
  });
});
