export abstract class Query {
  readonly timestamp: number;

  protected constructor() {
    this.timestamp = Date.now();
  }
}
