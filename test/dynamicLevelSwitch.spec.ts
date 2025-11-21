/// <reference path="../node_modules/@types/jest/index.d.ts" />

import { DynamicLevelSwitch, DynamicLevelSwitchStage } from '../src/dynamicLevelSwitch';
import { LogEvent, LogEventLevel } from '../src/logEvent';
import { MessageTemplate } from '../src/messageTemplate';

describe('DynamicLevelSwitch', () => {
	it('constructor(LogEventLevel.information)', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch(LogEventLevel.information);
		expect(dynamicLevelSwitch.isEnabled(LogEventLevel.information)).toBeTruthy();
		expect(dynamicLevelSwitch.isEnabled(LogEventLevel.debug)).toBeFalsy();
	})

	it('constructor()', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch();
		expect(dynamicLevelSwitch.isEnabled(LogEventLevel.verbose)).toBeTruthy();
	})

	it('sets the minimum level to fatal', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch();
		return dynamicLevelSwitch.fatal().then(() => {
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.fatal)).toBeTruthy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.error)).toBeFalsy();
		});
	});

	it('sets the minimum level to error', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch();
		return dynamicLevelSwitch.error().then(() => {
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.error)).toBeTruthy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.warning)).toBeFalsy();
		});
	});

	it('sets the minimum level to warning', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch();
		return dynamicLevelSwitch.warning().then(() => {
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.warning)).toBeTruthy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.information)).toBeFalsy();
		});
	});

	it('sets the minimum level to information', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch();
		return dynamicLevelSwitch.information().then(() => {
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.information)).toBeTruthy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.debug)).toBeFalsy();
		});
	});

	it('sets the minimum level to information with set', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch();
		return dynamicLevelSwitch.set(LogEventLevel.information).then(() => {
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.information)).toBeTruthy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.debug)).toBeFalsy();
		});
	});

	it('sets the minimum level to debug', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch();
		return dynamicLevelSwitch.debug().then(() => {
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.debug)).toBeTruthy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.verbose)).toBeFalsy();
		});
	});

	it('sets the minimum level to verbose', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch();
		return dynamicLevelSwitch.verbose().then(() => {
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.verbose)).toBeTruthy();
		});
	});

	it('turns logging off', () => {
		const dynamicLevelSwitch = new DynamicLevelSwitch();
		return dynamicLevelSwitch.off().then(() => {
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.fatal)).toBeFalsy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.error)).toBeFalsy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.warning)).toBeFalsy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.information)).toBeFalsy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.debug)).toBeFalsy();
			expect(dynamicLevelSwitch.isEnabled(LogEventLevel.verbose)).toBeFalsy();
		});
	});
});

describe('DynamicLevelSwitchStage', () => {
	describe('constructor()', () => {
		it('sets the switch to be used for filtering', () => {
			const dynamicLevelSwitch = new DynamicLevelSwitch();
			const stage = new DynamicLevelSwitchStage(dynamicLevelSwitch);
			const events = [
				new LogEvent('', LogEventLevel.verbose, new MessageTemplate('Message 1')),
				new LogEvent('', LogEventLevel.debug, new MessageTemplate('Message 2')),
				new LogEvent('', LogEventLevel.warning, new MessageTemplate('Message 3'))
			];
			return dynamicLevelSwitch.debug().then(() => {
				const filteredEvents = stage.emit(events);
				expect(filteredEvents).toHaveLength(2);
				expect(filteredEvents[0]).toHaveProperty('messageTemplate.raw', 'Message 2');
				expect(filteredEvents[1]).toHaveProperty('messageTemplate.raw', 'Message 3');
			});
		});
	});

	describe('setFlushDelegate()', () => {
		it('sets the flush delegate of the switch', () => {
			const dynamicLevelSwitch = new DynamicLevelSwitch();
			const stage = new DynamicLevelSwitchStage(dynamicLevelSwitch);
			let flushDelegateCalled: boolean = false;
			const flushDelegate = () => Promise.resolve(flushDelegateCalled = true);
			stage.setFlushDelegate(flushDelegate);

			return dynamicLevelSwitch.debug().then(() => expect(flushDelegateCalled).toBeTruthy());
		});
	});
});
