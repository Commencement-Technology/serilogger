import { LogEvent } from './logEvent';
import { PipelineStage } from './pipeline';

export class FilterStage implements PipelineStage {
	private readonly predicate: (e: LogEvent) => boolean;

	constructor(predicate: (e: LogEvent) => boolean) {
		this.predicate = predicate;
	}

	emit(events: LogEvent[]): LogEvent[] {
		return events.filter(this.predicate);
	}

	flush(): Promise<any> {
		return Promise.resolve();
	}
}
