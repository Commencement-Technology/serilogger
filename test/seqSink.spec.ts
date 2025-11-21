/// <reference path="../node_modules/@types/jest/index.d.ts" />

import { SeqSink } from '../src/seqSink';


describe('SeqSink', () => {
	it('should throw if options are missing', () => {
		expect(() => new SeqSink({ url: '' })).toThrow();
	});

	it('should strip trailing slash from the provided URL', () => {
		const sink = new SeqSink({ url: 'https://test/' });
		expect(sink.url).toEqual('https://test');
	})
});