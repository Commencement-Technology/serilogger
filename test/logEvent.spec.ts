/// <reference path="../node_modules/@types/jest/index.d.ts" />

import { LogEventLevel, isEnabled } from '../src/logEvent';

describe('LogEventLevel', () => {
	it('off includes nothing', () => {
		expect(LogEventLevel.off & LogEventLevel.fatal).toEqual(LogEventLevel.off);
	});

	it('error includes fatal', () => {
		expect(LogEventLevel.error & LogEventLevel.fatal).toEqual(LogEventLevel.fatal);
	});

	it('warning includes error', () => {
		expect(LogEventLevel.warning & LogEventLevel.error).toEqual(LogEventLevel.error);
	});

	it('information includes warning', () => {
		expect(LogEventLevel.information & LogEventLevel.warning).toEqual(LogEventLevel.warning);
	});

	it('debug includes information', () => {
		expect(LogEventLevel.debug & LogEventLevel.information).toEqual(LogEventLevel.information);
	});

	it('verbose includes debug', () => {
		expect(LogEventLevel.verbose & LogEventLevel.debug).toEqual(LogEventLevel.debug);
	});
});

describe('isEnabled()', () => {
	it('shows which levels are enabled', () => {
		expect(isEnabled(LogEventLevel.information, LogEventLevel.fatal)).toBeTruthy();
		expect(isEnabled(LogEventLevel.information, LogEventLevel.error)).toBeTruthy();
		expect(isEnabled(LogEventLevel.information, LogEventLevel.information)).toBeTruthy();
		expect(isEnabled(LogEventLevel.information, LogEventLevel.debug)).toBeFalsy();
		expect(isEnabled(LogEventLevel.information, LogEventLevel.verbose)).toBeFalsy();
	});

	it('supports custom log levels', () => {
		const customLogEventLevel = LogEventLevel.warning | 1 << 10;
		expect(isEnabled(LogEventLevel.warning, customLogEventLevel)).toBeFalsy();
		expect(isEnabled(customLogEventLevel, LogEventLevel.fatal)).toBeTruthy();
		expect(isEnabled(customLogEventLevel, LogEventLevel.error)).toBeTruthy();
		expect(isEnabled(customLogEventLevel, LogEventLevel.information)).toBeFalsy();
		expect(isEnabled(customLogEventLevel, LogEventLevel.debug)).toBeFalsy();
		expect(isEnabled(customLogEventLevel, LogEventLevel.verbose)).toBeFalsy();
		expect(isEnabled(customLogEventLevel, customLogEventLevel)).toBeTruthy();
	});
});
