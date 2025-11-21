import { expect } from 'chai';
import * as serilogger from '../src/index';
import { LoggerConfiguration } from '../src/loggerConfiguration';

describe('configure()', () => {
	it('returns a new LoggerConfiguration instance', () => {
		const loggerConfiguration = serilogger.configure();
		expect(loggerConfiguration).to.be.an.instanceof(LoggerConfiguration);
	});
});