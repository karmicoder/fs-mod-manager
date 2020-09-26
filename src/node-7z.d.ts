declare module 'node-7z' {
  // node-7z uses `when` promises which have a progress method, however they are deprecated
  // internally node-7z uses the progress events to emit files that are extracted,
  // (also the progress event emits an array of strings, which doesn't correlate with any promise<T>)
  // so instead of patching `when` promises I'm extending the generic Promise for use internally
  interface PromiseWithProgress<T> extends Promise<T> {
    progress(progress: (files: Array<string>) => void): this;
  }

  // Options are mapped to the 7z program so there is no idea to define all possible types here
  interface CommandLineSwitches {
    raw?: Array<string>;
    [key: string]: any;
  }

  interface FileSpec {
    path: string;
    type: string;
    method: string;
    physicalSize: number;
  }

  type ReadableEventStream = ReadableStream & NodeJS.EventEmitter;

  interface Zip {
    add(
      archive: string,
      files: string | Array<string>,
      options: CommandLineSwitches
    ): ReadableEventStream;
    delete(
      archive: string,
      files: string | Array<string>,
      options: CommandLineSwitches
    ): ReadableEventStream;
    extract(
      archive: string,
      dest: string,
      options: CommandLineSwitches
    ): ReadableEventStream;
    extractFull(
      archive: string,
      dest: string,
      options: CommandLineSwitches
    ): ReadableEventStream;
    list(archive: string, options: CommandLineSwitches): ReadableEventStream;
    test(archive: string, options: CommandLineSwitches): ReadableEventStream;
    update(
      archive: string,
      files: string | Array<string>,
      options: CommandLineSwitches
    ): ReadableEventStream;
  }
  const toExport: Zip;
  export default toExport;
}
