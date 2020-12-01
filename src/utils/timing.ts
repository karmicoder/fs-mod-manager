export function debounce<TFn extends (...args: any[]) => unknown>(
  fn: TFn,
  wait = 500,
  ...args: Parameters<TFn>
) {
  let handle: NodeJS.Timeout | null = null;
  return function(this: unknown) {
    const later = function(this: unknown) {
      handle = null;
      fn.bind(this)(...args);
    };
    if (handle !== null) {
      clearTimeout(handle);
    }
    handle = setTimeout(later.bind(this), wait);
  };
}
