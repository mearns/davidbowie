export function isOptionalString(x: unknown): x is string | undefined {
  return typeof x === "string" || typeof x === "undefined";
}

export function isUnknownObject(x: unknown): x is { [key: string]: unknown } {
  return x !== null && typeof x === "object";
}

export function isArrayOf<T>(
  isElement: (e: unknown) => boolean,
  x: unknown
): x is Array<T> {
  return Array.isArray(x) && x.every(isElement);
}

export function isOptionalArrayOf<T>(
  isElement: (e: unknown) => boolean,
  x: unknown
): x is Array<T> | undefined {
  return typeof x === "undefined" || isArrayOf<T>(isElement, x);
}
