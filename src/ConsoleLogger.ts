import { ILogger } from "ideariver.core";

export class ConsoleLogger implements ILogger {
  async info(message: string): Promise<void> {
    console.info(`INFO: ${message}`);
  }

  async warn(message: string): Promise<void> {
    console.warn(`WARNING: ${message}`);
  }

  async error(message: string, error: unknown): Promise<void> {
    if (error instanceof Error) {
      console.error(
        `ERROR: ${message} - ${error.message}\nStack trace:\n${error.stack}`
      );
    } else {
      console.error(`ERROR: ${message}`, error);
    }
  }
}
