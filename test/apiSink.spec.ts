/// <reference path="../node_modules/@types/jest/index.d.ts" />

import { ApiSink } from '../src/apiSink';

describe('ApiSink', () => {
	it('should throw if options are missing', () => {
		expect(() => new ApiSink({ url: '' })).toThrow();
	});

	it('should strip trailing slash from the provided URL', () => {
		const sink = new ApiSink({ url: 'https://test/' });
		expect(sink.url).toEqual('https://test');
	})
});