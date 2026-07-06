/**
 * Minimal in-memory fake of the Firebase Admin `Firestore` surface used by
 * `lib/users/register-candidate.ts` and `lib/chat/session.ts` — just enough
 * of `collection().doc().withConverter().get()/.set()` and `db.batch()` to
 * exercise the real create-vs-update / merge branching logic in those
 * modules without touching a live Firestore instance.
 *
 * Not a general-purpose Firestore emulator — only implements the subset of
 * the SDK surface those two callers actually use. `FieldValue.serverTimestamp()`
 * is represented by a sentinel object so tests can assert "a timestamp was
 * set" without depending on wall-clock time.
 */

export const SERVER_TIMESTAMP_SENTINEL = { __serverTimestamp: true } as const;

type ConverterLike<T> = {
  toFirestore: (data: unknown) => unknown;
  fromFirestore: (snapshot: { data: () => unknown; ref: { path: string } }) => T;
};

class FakeDocRef<T = unknown> {
  constructor(
    private readonly store: Map<string, unknown>,
    public readonly path: string,
    public readonly converter: ConverterLike<T> | null = null,
  ) {}

  withConverter<U>(converter: ConverterLike<U>): FakeDocRef<U> {
    return new FakeDocRef<U>(this.store, this.path, converter as unknown as ConverterLike<U>);
  }

  async get() {
    const raw = this.store.get(this.path);
    const exists = raw !== undefined;
    const converter = this.converter;
    return {
      exists,
      data: () =>
        !exists ? undefined : converter ? converter.fromFirestore({ data: () => raw, ref: { path: this.path } }) : raw,
    };
  }

  /** Direct (non-batched) set — used by `createCvUploadSession`. */
  async set(data: unknown, options?: { merge?: boolean }) {
    applySet(this.store, this.path, data, this.converter, options);
  }
}

class FakeCollectionRef {
  constructor(
    private readonly store: Map<string, unknown>,
    private readonly name: string,
  ) {}

  doc(id: string): FakeDocRef {
    return new FakeDocRef(this.store, `${this.name}/${id}`);
  }
}

function applySet(
  store: Map<string, unknown>,
  path: string,
  data: unknown,
  converter: ConverterLike<unknown> | null,
  options?: { merge?: boolean },
) {
  const toWrite = converter ? converter.toFirestore(data) : data;
  if (options?.merge) {
    const existing = (store.get(path) as Record<string, unknown> | undefined) ?? {};
    store.set(path, deepMerge(existing, toWrite as Record<string, unknown>));
  } else {
    store.set(path, toWrite);
  }
}

function deepMerge(
  base: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !("__serverTimestamp" in (value as object)) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

class FakeWriteBatch {
  private readonly ops: Array<() => void> = [];

  constructor(private readonly store: Map<string, unknown>) {}

  set(ref: FakeDocRef, data: unknown, options?: { merge?: boolean }) {
    // Capture the converter + path from the ref at call time (matches real
    // batch semantics: writes are queued, applied on commit()).
    const docRef = ref as unknown as { path: string; converter: ConverterLike<unknown> | null };
    this.ops.push(() => applySet(this.store, docRef.path, data, docRef.converter, options));
    return this;
  }

  async commit() {
    for (const op of this.ops) op();
  }
}

/**
 * Fake Firestore instance. Cast to `Firestore` at call sites (the real admin
 * type) since we only implement the subset those two modules call.
 */
export class FakeFirestore {
  readonly store = new Map<string, unknown>();

  collection(name: string): FakeCollectionRef {
    return new FakeCollectionRef(this.store, name);
  }

  batch(): FakeWriteBatch {
    return new FakeWriteBatch(this.store);
  }

  /** Test helper: seed a document directly (bypasses converters). */
  seed(path: string, data: unknown) {
    this.store.set(path, data);
  }

  /** Test helper: read the raw stored document (bypasses converters). */
  raw(path: string): unknown {
    return this.store.get(path);
  }
}
