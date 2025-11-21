/// <reference path="../node_modules/@types/jest/index.d.ts" />

import * as serilogger from '../src/index';
import { LoggerConfiguration } from '../src/loggerConfiguration';

describe('configure()', () => {
	it('returns a new LoggerConfiguration instance', () => {
		const loggerConfiguration = serilogger.configure();
		expect(loggerConfiguration).toBeInstanceOf(LoggerConfiguration);
	});
});