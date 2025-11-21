/// <reference path="../node_modules/@types/jest/index.d.ts" />

import { EnrichStage } from '../src/enrichStage';
import { LogEvent, LogEventLevel } from '../src/logEvent';
import { MessageTemplate } from '../src/messageTemplate';

describe('EnrichStage', () => {
	it('enriches events with properties returned from a function', () => {
		const enricher = () => ({ b: 2 });
		const enrichStage = new EnrichStage(enricher);
		const events = [
			new LogEvent('', LogEventLevel.information, new MessageTemplate('Message 1'), { a: 1 }),
			new LogEvent('', LogEventLevel.information, new MessageTemplate('Message 2'), { a: 1 })
		];
		const enrichedEvents = enrichStage.emit(events);
		expect(enrichedEvents).toHaveLength(2);
		expect(enrichedEvents[0]).toHaveProperty('properties.b', 2);
		expect(enrichedEvents[1]).toHaveProperty('properties.b', 2);
	});

	it('passes the event properties to the enricher to allow conditional masking', () => {
		const extraParams = { url: 'testUrl2' };
		const enricher = (properties: any) => {
			return {
				password: 'REDACTED',
				url: properties.url,
				url2: extraParams.url
			};
		};
		const enrichStage = new EnrichStage(enricher);
		const events = [
			new LogEvent('', LogEventLevel.information, new MessageTemplate('Message 1'), { a: 1, password: 'secret', url: 'testUrl' }),
		];
		const enrichedEvents = enrichStage.emit(events);
		expect(enrichedEvents).toHaveLength(1);
		expect(enrichedEvents[0]).toHaveProperty('properties.password', 'REDACTED');
		expect(enrichedEvents[0]).toHaveProperty('properties.a', 1);
		expect(enrichedEvents[0]).toHaveProperty('properties.url', 'testUrl');
		expect(enrichedEvents[0]).toHaveProperty('properties.url2', 'testUrl2');
	});

	it('does not allow direct manipulation of the event properties', () => {
		const enricherParams = [];
		const enricher = (properties: any) => {
			delete properties.password;
		};
		const enrichStage = new EnrichStage(enricher);
		const events = [
			new LogEvent('', LogEventLevel.information, new MessageTemplate('Message 1'), { password: 'secret' }),
		];
		const enrichedEvents = enrichStage.emit(events);
		expect(enrichedEvents).toHaveLength(1);
		expect(enrichedEvents[0]).toHaveProperty('properties.password', 'secret');
	});

	it('enriches events with properties from a plain object', () => {
		const enricher = { b: 2 };
		const enrichStage = new EnrichStage(enricher);
		const events = [
			new LogEvent('', LogEventLevel.information, new MessageTemplate('Message 1'), { a: 1 }),
			new LogEvent('', LogEventLevel.information, new MessageTemplate('Message 2'), { a: 1 })
		];
		const enrichedEvents = enrichStage.emit(events);
		expect(enrichedEvents).toHaveLength(2);
		expect(enrichedEvents[0]).toHaveProperty('properties.b', 2);
		expect(enrichedEvents[1]).toHaveProperty('properties.b', 2);
	});

	it('does nothing when flushed', () => {
		return new EnrichStage({}).flush();
	});
});
