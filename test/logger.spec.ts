/// <reference path="../node_modules/@types/jest/index.d.ts" />
/// <reference path="../node_modules/typemoq/dist/typemoq.d.ts" />

import * as TypeMoq from 'typemoq';
import { LogEvent, LogEventLevel } from '../src/logEvent';
import { Logger } from '../src/logger';
import { MessageTemplate } from '../src/messageTemplate';
import { Pipeline } from '../src/pipeline';

function verifyLevel(level: LogEventLevel) {
	return (events: LogEvent[]) => events.length > 0 && events[0].level === level;
}

describe('Logger', () => {
	it('logs with fatal severity', () => {
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		mockPipeline.setup(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.fatal))));
		const logger = new Logger(mockPipeline.object);
		logger.fatal('Test');
		mockPipeline.verify(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.fatal))), TypeMoq.Times.once());
	});

	it('logs with error severity', () => {
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		mockPipeline.setup(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.error))));
		const logger = new Logger(mockPipeline.object);
		logger.error('Test');
		mockPipeline.verify(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.error))), TypeMoq.Times.once());
	});

	it('logs with warning severity', () => {
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		mockPipeline.setup(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.warning))));
		const logger = new Logger(mockPipeline.object);
		logger.warn('Test');
		mockPipeline.verify(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.warning))), TypeMoq.Times.once());
	});

	it('logs with information severity', () => {
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		mockPipeline.setup(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.information))));
		const logger = new Logger(mockPipeline.object);
		logger.info('Test');
		mockPipeline.verify(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.information))), TypeMoq.Times.once());
	});

	it('logs with debug severity', () => {
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		mockPipeline.setup(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.debug))));
		const logger = new Logger(mockPipeline.object);
		logger.debug('Test');
		mockPipeline.verify(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.debug))), TypeMoq.Times.once());
	});

	it('logs with verbose severity', () => {
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		mockPipeline.setup(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.verbose))));
		const logger = new Logger(mockPipeline.object);
		logger.verbose('Test');
		mockPipeline.verify(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.verbose))), TypeMoq.Times.once());
	});

	it('includes logged properties', () => {
		let loggedEvents: any[] = [];
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		mockPipeline.setup(m => m.emit(TypeMoq.It.is(verifyLevel(LogEventLevel.information))))
			.callback(events => loggedEvents = loggedEvents.concat(events));
		const logger = new Logger(mockPipeline.object);
		logger.info('Test {word}', 'banana');
		expect(loggedEvents).toHaveLength(1);
		expect(loggedEvents[0]).toHaveProperty('properties.word', 'banana');
	});

	it('includes logged error', () => {
		let loggedEvents: any[] = [];
		const error = new Error('Sample');
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		mockPipeline.setup(m => m.emit(TypeMoq.It.isAny()))
			.callback(events => loggedEvents = loggedEvents.concat(events));
		const logger = new Logger(mockPipeline.object);
		logger.fatal(error, 'Test');
		logger.error(error, 'Test');
		logger.warn(error, 'Test');
		logger.info(error, 'Test');
		logger.debug(error, 'Test');
		logger.verbose(error, 'Test');
		expect(loggedEvents).toHaveLength(6);
		expect(loggedEvents[0]).toHaveProperty('error', error);
		expect(loggedEvents[1]).toHaveProperty('error', error);
		expect(loggedEvents[2]).toHaveProperty('error', error);
		expect(loggedEvents[3]).toHaveProperty('error', error);
		expect(loggedEvents[4]).toHaveProperty('error', error);
		expect(loggedEvents[5]).toHaveProperty('error', error);
	});

	it('catches errors when suppressed', () => {
		let loggedEvents = [];
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		const logger = new Logger(TypeMoq.Mock.ofType(Pipeline).object);
		expect(() => logger.fatal(undefined)).not.toThrow();
		expect(() => logger.error(undefined)).not.toThrow();
		expect(() => logger.warn(undefined)).not.toThrow();
		expect(() => logger.info(undefined)).not.toThrow();
		expect(() => logger.debug(undefined)).not.toThrow();
		expect(() => logger.verbose(undefined)).not.toThrow();
	});

	it('throws errors when not suppressed', () => {
		let loggedEvents = [];
		const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		const logger = new Logger(TypeMoq.Mock.ofType(Pipeline).object, false);
		expect(() => logger.fatal(undefined)).toThrow();
		expect(() => logger.error(undefined)).toThrow();
		expect(() => logger.warn(undefined)).toThrow();
		expect(() => logger.info(undefined)).toThrow();
		expect(() => logger.debug(undefined)).toThrow();
		expect(() => logger.verbose(undefined)).toThrow();
	});

	// describe('createChild()', () => {
	//     it('adds the new enrichment values to the pipeline', () => {
	//         let emittedEvents = [];
	//         const pipeline = new Pipeline();

	//         const pipelineStage1 = TypeMoq.Mock.ofInstance(new EnrichStage({ b: 2 }));
	//         const pipelineStage2 = TypeMoq.Mock.ofType(ConcretePipelineStage);
	//         // pipelineStage1.setup(m => m['enricher']).returns(() => { return { b: 2 }; });
	//         // pipelineStage1.setup(m => m.emit(TypeMoq.It.isAny())).returns(events => events);
	//         pipelineStage2.setup(m => m.emit(TypeMoq.It.isAny())).callback(events => emittedEvents = events);

	//         pipeline.addStage(pipelineStage1.object);
	//         pipeline.addStage(pipelineStage2.object);

	//         const logger = new Logger(pipeline);
	//         logger.emit([new LogEvent('', LogEventLevel.information, new MessageTemplate('Test'), {})]);
	//         // expect(emittedEvents).to.have.length(1);
	//         expect(logger['pipeline']['stages']).to.have.length(2);
	//         // expect(emittedEvents[0]).to.have.nested.property('properties.b', 2);
	//     });
	// });

	describe('emit()', () => {
		it('emits events to the pipeline', () => {
			const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
			mockPipeline.setup(m => m.emit(TypeMoq.It.isAny()));
			const logger = new Logger(mockPipeline.object);
			logger.emit([new LogEvent('', LogEventLevel.information, new MessageTemplate('Test'))]);
			mockPipeline.verify(m => m.emit(TypeMoq.It.isAny()), TypeMoq.Times.once());
		});

		it('catches errors when suppressed', () => {
			const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
			mockPipeline.setup(m => m.emit(TypeMoq.It.isAny())).throws(new Error('Error'));
			const logger = new Logger(mockPipeline.object);
			expect(() => logger.emit([])).not.toThrow();
		});

		it('throws errors when not suppressed', () => {
			const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
			mockPipeline.setup(m => m.emit(TypeMoq.It.isAny())).throws(new Error('Error'));
			const logger = new Logger(mockPipeline.object, false);
			expect(() => logger.emit([])).toThrow();
		});
	});

	describe('flush()', () => {
		it('flushes the pipeline', () => {
			const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
			mockPipeline.setup(m => m.flush()).returns(() => Promise.resolve());
			const logger = new Logger(mockPipeline.object);
			logger.flush();
			mockPipeline.verify(m => m.flush(), TypeMoq.Times.once());
		});

		it('catches errors when suppressed', () => {
			const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
			mockPipeline.setup(m => m.flush()).returns(() => Promise.reject('Error'));
			const logger = new Logger(mockPipeline.object);
			return logger.flush();
		});

		// it('throws errors when not suppressed', () => {
		// 	const mockPipeline = TypeMoq.Mock.ofType(Pipeline);
		// 	mockPipeline.setup(m => m.flush()).returns(() => Promise.reject('Error'));
		// 	const logger = new Logger(mockPipeline.object, false);
		// 	return logger.flush().then(
		// 		ok => expect.,
		// 		error => expect(error).to.exist
		// 	);
		// });
	});
});
