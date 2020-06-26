export function isOptionalString(x: unknown): x is string | undefined {
  return typeof x === "string" || typeof x === "undefined";
}

export function isUnknownObject(x: unknown): x is Record<string, unknown> {
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

export function filter<A, B>(
  collection: Array<A | B>,
  typeGuard: TypeGuard<A, B>
): Array<A> {
  return collection.filter(typeGuard);
}

export type TypeGuard<A, B> = (e: A | B) => e is A;

/**
 * Text can be a simple string with no implied language, or you can provide a dictionary of the text in
 * multiple languages, with an ISO lang code as the key.
 */
export type Text = string | Record<string, string>;

export function isText(t: unknown): t is Text {
  return (
    typeof t === "string" ||
    (typeof t === "object" &&
      t &&
      Object.entries(t)
        .filter(([k]) => typeof k === "string")
        .every(([, v]) => typeof v === "string"))
  );
}

export function isOptionalText(t: unknown): t is Text | undefined {
  return typeof t === "undefined" || isText(t);
}
