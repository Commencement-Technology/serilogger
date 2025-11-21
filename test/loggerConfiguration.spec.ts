/// <reference path="../node_modules/@types/jest/index.d.ts" />
/// <reference path="../node_modules/typemoq/dist/typemoq.d.ts" />

import * as TypeMoq from 'typemoq';
import { DynamicLevelSwitch } from '../src/dynamicLevelSwitch';
import { LogEventLevel } from '../src/logEvent';
import { Logger } from '../src/logger';
import { LoggerConfiguration } from '../src/loggerConfiguration';
// @ts-ignore
import { ConsoleSink, defaultConsoleSinkOptions } from '../src/consoleSink';
import { PipelineStage } from '../src/pipeline';
import { SinkStage } from '../src/sink';
import { ConcreteSink } from './helpers';

describe('LoggerConfiguration', () => {
	describe('create()', () => {
		it('creates a new logger instance', () => {
			const loggerConfiguration = new LoggerConfiguration();
			const logger = loggerConfiguration.create();
			expect(logger).toBeInstanceOf(Logger);
		});
	});

	describe('readFromConfiguration()', () => {
		it('requires a valid configuration object', () => {
			let loggerConfiguration = new LoggerConfiguration();
			const invalidBaseName = {
				invalid: {}
			};
			expect(() => loggerConfiguration.readFromConfiguration(invalidBaseName)).toThrow('Argument "config" must contain a property of "serilogger"');

			const invalidProperty = {
				serilogger: {
					badProperty: []
				}
			};
			expect(() => loggerConfiguration.readFromConfiguration(invalidProperty)).toThrow('Argument "config" must contain a sub-property of "writeTo"');

			const writeToNotAnArray = {
				serilogger: {
					writeTo: 'INVALID'
				}
			};
			expect(() => loggerConfiguration.readFromConfiguration(writeToNotAnArray)).toThrow('"writeTo" property must be an Array');

			const writeToArrayEmpty = {
				serilogger: {
					writeTo: []
				}
			};
			expect(() => loggerConfiguration.readFromConfiguration(writeToArrayEmpty)).toThrow('"writeTo" property must have at least one element');
		});

		it('adds a base ConsoleSink', () => {
			let loggerConfiguration = new LoggerConfiguration();
			const config = {
				serilogger: {
					writeTo: [
						{
							name: 'Console'
						}
					]
				}
			};
			loggerConfiguration = loggerConfiguration.readFromConfiguration(config);
			const sinks: PipelineStage[] = loggerConfiguration['_sinks'];
			expect(sinks.length).toEqual(1);
			const consoleSink = (sinks as SinkStage[])[0]['sink'] as ConsoleSink;

			expect(consoleSink['options'].includeProperties).toEqual(defaultConsoleSinkOptions.includeProperties);
			expect(consoleSink['options'].includeTimestamps).toEqual(defaultConsoleSinkOptions.includeTimestamps);
			expect(consoleSink['options'].removeLogLevelPrefix).toEqual(defaultConsoleSinkOptions.removeLogLevelPrefix);
		});

		it('adds a configured ConsoleSink', () => {
			let loggerConfiguration = new LoggerConfiguration();
			const config = {
				serilogger: {
					writeTo: [
						{
							name: 'Console',
							args: {
								removeLogLevelPrefix: true,
								includeTimestamps: true,
								includeProperties: true
							}
						}
					]
				}
			};
			loggerConfiguration = loggerConfiguration.readFromConfiguration(config);
			const sinks: PipelineStage[] = loggerConfiguration['_sinks'];
			expect(sinks.length).toEqual(1);
			const consoleSink = (sinks as SinkStage[])[0]['sink'] as ConsoleSink;

			expect(consoleSink['options'].includeProperties).toEqual(true);
			expect(consoleSink['options'].includeTimestamps).toEqual(true);
			expect(consoleSink['options'].removeLogLevelPrefix).toEqual(true);
		});
	});

	describe('enrich()', () => {
		it('adds an enricher to the pipeline', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.enrich({ c: 3 })
				.enrich(() => ({ d: 4 }))
				.writeTo(sink.object)
				.create();

			logger.info('C is the third letter');

			return logger.flush().then(() => {
				expect(emittedEvents[0]).toHaveProperty('properties.c', 3);
				expect(emittedEvents[0]).toHaveProperty('properties.d', 4);
			});
		});

		it('requires an enricher to be provided', () => {
			const loggerConfiguration = new LoggerConfiguration();
			expect(() => loggerConfiguration.enrich(undefined)).toThrow();
			expect(() => loggerConfiguration.enrich(null)).toThrow();
		});
	});

	describe('filter()', () => {
		it('adds a filter to the pipeline', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.filter(e => e.messageTemplate.raw.indexOf('C') === 0)
				.writeTo(sink.object)
				.create();

			logger.info('A is the first letter');
			logger.info('B is the second letter');
			logger.info('C is the third letter');
			logger.info('D is the fourth letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(1);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'C is the third letter');
			});
		});

		it('requires a filter to be provided', () => {
			const loggerConfiguration = new LoggerConfiguration();
			expect(() => loggerConfiguration.filter(undefined)).toThrow();
			expect(() => loggerConfiguration.filter(null)).toThrow();
		});
	});

	describe('minLevel()', () => {
		it('throws if no level or switch is provided', () => {
			const loggerConfiguration = new LoggerConfiguration();
			expect(() => loggerConfiguration.minLevel(undefined)).toThrow();
			expect(() => loggerConfiguration.minLevel(null)).toThrow();
		});

		it('sets the minimum level', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.minLevel(LogEventLevel.debug)
				.writeTo(sink.object)
				.create();

			logger.fatal('A is the first letter');
			logger.verbose('B is the second letter');
			logger.info('C is the third letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(2);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'A is the first letter');
				expect(emittedEvents[1]).toHaveProperty('messageTemplate.raw', 'C is the third letter');
			});
		});

		it('sets the minimum by bit flags', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.minLevel(23)
				.writeTo(sink.object)
				.create();

			logger.error('A is the first letter');
			logger.info('B is the second letter');
			logger.debug('C is the third letter');
			logger.warn('D is the fourth letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(2);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'A is the first letter');
				expect(emittedEvents[1]).toHaveProperty('messageTemplate.raw', 'D is the fourth letter');
			});
		});

		it('sets the minimum level by label (case-insensitive)', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.minLevel('WaRninG')
				.writeTo(sink.object)
				.create();

			logger.fatal('A is the first letter');
			logger.warn('B is the second letter');
			logger.info('C is the third letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(2);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'A is the first letter');
				expect(emittedEvents[1]).toHaveProperty('messageTemplate.raw', 'B is the second letter');
			});
		});

		it('throws if an invalid label is provided', () => {
			const loggerConfiguration = new LoggerConfiguration();
			expect(() => loggerConfiguration.minLevel('oogabooga')).toThrow();
		});

		it('sets the specified dynamic switch', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const dynamicLevelSwitch = new DynamicLevelSwitch();
			const logger = new LoggerConfiguration()
				.minLevel(dynamicLevelSwitch)
				.writeTo(sink.object)
				.create();

			logger.fatal('A is the first letter');
			logger.verbose('B is the second letter');

			return dynamicLevelSwitch.information()
				.then(() => {
					logger.verbose('C is the third letter');
					logger.info('D is the fourth letter');
				})
				.then(() => logger.flush())
				.then(() => {
					expect(emittedEvents).toHaveLength(3);
					expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'A is the first letter');
					expect(emittedEvents[1]).toHaveProperty('messageTemplate.raw', 'B is the second letter');
					expect(emittedEvents[2]).toHaveProperty('messageTemplate.raw', 'D is the fourth letter');
				});
		});

		it('sets minimum level through the fatal() alias', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.minLevel.fatal()
				.writeTo(sink.object)
				.create();

			logger.error('A is the first letter');
			logger.fatal('B is the second letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(1);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'B is the second letter');
			});
		});

		it('sets minimum level through the error() alias', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.minLevel.error()
				.writeTo(sink.object)
				.create();

			logger.warn('A is the first letter');
			logger.error('B is the second letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(1);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'B is the second letter');
			});
		});

		it('sets minimum level through the warning() alias', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.minLevel.warning()
				.writeTo(sink.object)
				.create();

			logger.info('A is the first letter');
			logger.warn('B is the second letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(1);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'B is the second letter');
			});
		});

		it('sets minimum level through the information() alias', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.minLevel.information()
				.writeTo(sink.object)
				.create();

			logger.debug('A is the first letter');
			logger.info('B is the second letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(1);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'B is the second letter');
			});
		});

		it('sets minimum level through the debug() alias', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.minLevel.debug()
				.writeTo(sink.object)
				.create();

			logger.verbose('A is the first letter');
			logger.debug('B is the second letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(1);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'B is the second letter');
			});
		});

		it('sets minimum level through the verbose() alias', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.minLevel.verbose()
				.writeTo(sink.object)
				.create();

			logger.verbose('A is the first letter');
			logger.debug('B is the second letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(2);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'A is the first letter');
				expect(emittedEvents[1]).toHaveProperty('messageTemplate.raw', 'B is the second letter');
			});
		});
	});

	describe('suppressErrors()', () => {
		it('enables suppression when true or undefined', () => {
			const logger1 = new LoggerConfiguration()
				.suppressErrors(true)
				.create();

			const logger2 = new LoggerConfiguration()
				.suppressErrors()
				.create();

			expect(logger1.suppressErrors).toBeTruthy();
			expect(logger2.suppressErrors).toBeTruthy();
		});

		it('disables suppression when false', () => {
			const logger = new LoggerConfiguration()
				.suppressErrors(false)
				.create();

			expect(logger.suppressErrors).toBeFalsy();
		});

		it('uses the value of the last call', () => {
			const logger = new LoggerConfiguration()
				.suppressErrors(false)
				.suppressErrors(true)
				.suppressErrors(false)
				.suppressErrors()
				.suppressErrors(false)
				.create();

			expect(logger.suppressErrors).toBeFalsy();
		});
	});

	describe('writeTo()', () => {
		it('adds a sink to the pipeline', () => {
			let emittedEvents: any[] = [];
			const sink = TypeMoq.Mock.ofType(ConcreteSink);
			sink.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = emittedEvents.concat(events));

			const logger = new LoggerConfiguration()
				.writeTo(sink.object)
				.create();

			logger.info('A is the first letter');
			logger.info('B is the second letter');
			logger.info('C is the third letter');

			return logger.flush().then(() => {
				expect(emittedEvents).toHaveLength(3);
				expect(emittedEvents[0]).toHaveProperty('messageTemplate.raw', 'A is the first letter');
				expect(emittedEvents[1]).toHaveProperty('messageTemplate.raw', 'B is the second letter');
				expect(emittedEvents[2]).toHaveProperty('messageTemplate.raw', 'C is the third letter');
			});
		});
	});
});
