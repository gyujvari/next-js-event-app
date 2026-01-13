import mongoose, { Connection, Mongoose } from "mongoose";

/**
 * Shape of the cached connection object we keep on the global scope.
 * This avoids creating new connections on every hot-reload in development.
 */
interface MongooseGlobalCache {
  conn: Connection | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the global object type so TypeScript knows about our cache.
 *
 * We use `var` on `globalThis` at runtime (see below) but describe it here
 * so that the compiler can type-check usages of `globalThis.mongoose`.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseGlobalCache | undefined;
}

/**
 * Reuse the existing global cache if it exists; otherwise initialize it.
 *
 * In production the global scope is not reloaded, so this effectively
 * behaves like a module-level singleton. In development, Next.js can
 * reload modules on every file change, but the global cache survives,
 * preventing connection storms.
 */
const globalCache: MongooseGlobalCache = globalThis.mongoose ?? {
  conn: null,
  promise: null,
};

if (!globalThis.mongoose) {
  globalThis.mongoose = globalCache;
}

/**
 * Connection options for Mongoose. Extend this as needed (e.g. timeouts,
 * pool size tuning, etc.) while keeping a single source of truth.
 */
const MONGOOSE_OPTIONS: Parameters<typeof mongoose.connect>[1] = {
  // Add any project-specific options here
};

/**
 * Establish (or reuse) a Mongoose connection.
 *
 * - Reads the MongoDB connection string from `MONGODB_URI`.
 * - Caches both the active `Connection` and the in-flight `Promise` so
 *   concurrent calls share the same work.
 * - Throws an error early if the environment variable is not defined.
 */
export async function connectToDatabase(): Promise<Connection> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // Fail fast if misconfigured rather than hanging on DB operations.
    throw new Error(
      "Please define the MONGODB_URI environment variable to connect to MongoDB.",
    );
  }

  // If we already have an active connection, reuse it.
  if (globalCache.conn) {
    return globalCache.conn;
  }

  // If a connection is already in progress, await it instead of starting another.
  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(uri, MONGOOSE_OPTIONS);
  }

  const mongooseInstance = await globalCache.promise;

  // Store the underlying driver connection for future reuse.
  globalCache.conn = mongooseInstance.connection;

  return globalCache.conn;
}
