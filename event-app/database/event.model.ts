import {
  Document,
  Model,
  Schema,
  model,
  models,
} from "mongoose";

/**
 * Fields required to create or persist an Event document.
 */
export interface EventAttributes {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // normalized date-only ISO string (e.g. 2026-01-13)
  time: string; // normalized 24h time (e.g. 14:30)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventDocument extends EventAttributes, Document {}

export type EventModelType = Model<EventDocument>;

/**
 * Create a URL-friendly slug from a title.
 */
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Normalize time strings to 24-hour HH:mm format.
 * Accepts basic formats like "14:30", "2:30 pm", "2pm".
 */
const normalizeTime = (value: string): string => {
  const trimmed = value.trim();

  // 24h HH:mm
  const directMatch = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (directMatch) {
    const [, h, m] = directMatch;
    return `${h.padStart(2, "0")}:${m}`;
  }

  // 12h with optional minutes + am/pm (e.g. "2pm", "2:30 pm")
  const ampmMatch = /^(\d{1,2})(?::([0-5]\d))?\s*([ap]m)$/i.exec(trimmed);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ?? "00";
    const meridiem = ampmMatch[3].toLowerCase();

    if (hour < 1 || hour > 12) {
      throw new Error("Invalid hour value for time.");
    }

    if (meridiem === "pm" && hour !== 12) {
      hour += 12;
    } else if (meridiem === "am" && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  }

  throw new Error("Invalid time format. Use HH:mm (24h) or a common 12h format like '2:30 pm'.");
};

/**
 * Basic non-empty string validation used in the pre-save hook.
 */
const assertNonEmpty = (fieldName: string, value: unknown): void => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Field '${fieldName}' is required and must be a non-empty string.`);
  }
};

const assertNonEmptyArray = (fieldName: string, value: unknown): void => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Field '${fieldName}' is required and must be a non-empty array.`);
  }
  if (!value.every((item) => typeof item === "string" && item.trim().length > 0)) {
    throw new Error(`All items in '${fieldName}' must be non-empty strings.`);
  }
};

const eventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  {
    timestamps: true,
  },
);

// Explicit unique index on slug for fast lookups and uniqueness guarantee.
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook to:
 * - validate required fields
 * - generate / update slug when title changes
 * - normalize date to an ISO date-only string
 * - normalize time to HH:mm 24-hour format
 */
eventSchema.pre<EventDocument>("save", function preSave(next) {
  try {
    const doc = this;

    // Validate required strings.
    assertNonEmpty("title", doc.title);
    assertNonEmpty("description", doc.description);
    assertNonEmpty("overview", doc.overview);
    assertNonEmpty("image", doc.image);
    assertNonEmpty("venue", doc.venue);
    assertNonEmpty("location", doc.location);
    assertNonEmpty("mode", doc.mode);
    assertNonEmpty("audience", doc.audience);
    assertNonEmpty("organizer", doc.organizer);

    // Validate arrays.
    assertNonEmptyArray("agenda", doc.agenda);
    assertNonEmptyArray("tags", doc.tags);

    // Generate slug only when title has changed or slug is missing.
    if (doc.isModified("title") || !doc.slug) {
      const generatedSlug = slugify(doc.title);
      if (!generatedSlug) {
        throw new Error("Unable to generate slug from title.");
      }
      doc.slug = generatedSlug;
    }

    // Normalize and validate date string.
    const parsedDate = new Date(doc.date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date value. Use a parseable date string.");
    }
    // Store ISO date-only portion (YYYY-MM-DD) for consistency.
    doc.date = parsedDate.toISOString().split("T")[0];

    // Normalize time string to a consistent format.
    doc.time = normalizeTime(doc.time);

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Event: EventModelType =
  (models.Event as EventModelType | undefined) ||
  model<EventDocument, EventModelType>("Event", eventSchema);
