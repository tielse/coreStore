export abstract class Command {
  readonly timestamp: number;

  protected constructor() {
    this.timestamp = Date.now();
  }
}
