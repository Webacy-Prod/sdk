import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticationError, NetworkError, ValidationError } from '@webacy-xyz/sdk-core';
import { handleError, parseJsonInput, parseListInput, printResult } from '../output';

describe('printResult', () => {
  const spy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const originalIsTTY = process.stdout.isTTY;

  afterEach(() => {
    spy.mockClear();
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      configurable: true,
    });
  });

  it('writes compact JSON when stdout is not a TTY and --pretty is not set', () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
    printResult({ foo: 'bar' }, {});
    expect(spy).toHaveBeenCalledWith('{"foo":"bar"}\n');
  });

  it('writes pretty JSON when stdout is a TTY and --pretty is not set', () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    printResult({ foo: 'bar' }, {});
    expect(spy).toHaveBeenCalledWith('{\n  "foo": "bar"\n}\n');
  });

  it('writes pretty JSON when --pretty is explicitly true, regardless of TTY', () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
    printResult({ foo: 'bar' }, { pretty: true });
    expect(spy).toHaveBeenCalledWith('{\n  "foo": "bar"\n}\n');
  });

  it('writes compact JSON when --pretty is explicitly false, regardless of TTY', () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    printResult({ foo: 'bar' }, { pretty: false });
    expect(spy).toHaveBeenCalledWith('{"foo":"bar"}\n');
  });
});

describe('parseListInput', () => {
  it('parses a comma-separated list', () => {
    expect(parseListInput('a, b ,c')).toEqual(['a', 'b', 'c']);
  });

  it('drops empty entries', () => {
    expect(parseListInput('a,,b,')).toEqual(['a', 'b']);
  });

  it('reads a JSON array from @file.json', () => {
    const tmp = path.join(os.tmpdir(), `cli-list-${Date.now()}.json`);
    fs.writeFileSync(tmp, JSON.stringify(['x', 'y', 'z']));
    try {
      expect(parseListInput(`@${tmp}`)).toEqual(['x', 'y', 'z']);
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('throws ValidationError when @file.json is not an array', () => {
    const tmp = path.join(os.tmpdir(), `cli-list-obj-${Date.now()}.json`);
    fs.writeFileSync(tmp, JSON.stringify({ not: 'an-array' }));
    try {
      expect(() => parseListInput(`@${tmp}`)).toThrow(ValidationError);
    } finally {
      fs.unlinkSync(tmp);
    }
  });
});

describe('parseJsonInput', () => {
  const tmpFiles: string[] = [];

  afterAll(() => {
    for (const f of tmpFiles) {
      try {
        fs.unlinkSync(f);
      } catch {
        /* ignore */
      }
    }
  });

  it('parses inline JSON', () => {
    expect(parseJsonInput('{"k":1}')).toEqual({ k: 1 });
  });

  it('reads JSON from @file.json', () => {
    const tmp = path.join(os.tmpdir(), `cli-json-${Date.now()}.json`);
    fs.writeFileSync(tmp, JSON.stringify({ hello: 'world' }));
    tmpFiles.push(tmp);
    expect(parseJsonInput(`@${tmp}`)).toEqual({ hello: 'world' });
  });

  it('throws ValidationError for missing file', () => {
    expect(() => parseJsonInput('@/nonexistent/path/to/file.json')).toThrow(ValidationError);
  });

  it('throws ValidationError for malformed JSON on disk', () => {
    const tmp = path.join(os.tmpdir(), `cli-bad-${Date.now()}.json`);
    fs.writeFileSync(tmp, '{not valid json');
    tmpFiles.push(tmp);
    expect(() => parseJsonInput(`@${tmp}`)).toThrow(ValidationError);
  });

  it('throws ValidationError for malformed inline JSON', () => {
    expect(() => parseJsonInput('{not json}')).toThrow(ValidationError);
  });

  it('throws ValidationError for empty @ reference', () => {
    expect(() => parseJsonInput('@')).toThrow(ValidationError);
  });

  it('expands ~ to the home directory', () => {
    const name = `cli-tilde-${Date.now()}.json`;
    const fullPath = path.join(os.homedir(), name);
    fs.writeFileSync(fullPath, JSON.stringify({ tilde: true }));
    tmpFiles.push(fullPath);
    expect(parseJsonInput(`@~/${name}`)).toEqual({ tilde: true });
  });
});

describe('handleError', () => {
  const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

  beforeAll(() => {
    // ensure spies are set up
  });

  afterEach(() => {
    stderrSpy.mockClear();
    exitSpy.mockClear();
  });

  afterAll(() => {
    stderrSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('formats WebacyError with name, message, and recovery hint', () => {
    expect(() => handleError(new AuthenticationError('bad key'))).not.toThrow();
    const output = stderrSpy.mock.calls.map((c) => c[0] as string).join('');
    expect(output).toContain('AuthenticationError: bad key');
    expect(output).toContain('Hint: ');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('formats WebacyError subclass without a recovery hint when not provided', () => {
    // ValidationError extends WebacyError and provides its own hint;
    // NetworkError likewise — confirm generic subclass path works.
    expect(() => handleError(new NetworkError('timeout'))).not.toThrow();
    const output = stderrSpy.mock.calls.map((c) => c[0] as string).join('');
    expect(output).toContain('NetworkError: timeout');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('formats a generic Error as "Error: <message>"', () => {
    expect(() => handleError(new Error('boom'))).not.toThrow();
    const output = stderrSpy.mock.calls.map((c) => c[0] as string).join('');
    expect(output).toContain('Error: boom');
    expect(output).not.toContain('Hint: ');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('formats a non-Error value via String(...)', () => {
    expect(() => handleError('raw string')).not.toThrow();
    const output = stderrSpy.mock.calls.map((c) => c[0] as string).join('');
    expect(output).toContain('Error: raw string');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
