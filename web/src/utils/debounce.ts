export function debounce<T extends (...args: unknown[]) => unknown>(
  cb: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      cb.apply(this, args);
    }, delay);
  };
}
