import {
  Document,
  Model,
  Schema,
  Types,
  model,
  models,
} from "mongoose";

import { Event } from "./event.model";

export interface BookingAttributes {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingDocument extends BookingAttributes, Document {}

export type BookingModelType = Model<BookingDocument>;

/**
 * Simple email format check for basic validation.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, // index for efficient event-based queries
    },
    email: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string): boolean => EMAIL_REGEX.test(value),
        message: "Email must be a valid email address.",
      },
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Pre-save hook to ensure:
 * - referenced event exists
 * - email is non-empty (regex above ensures format)
 */
bookingSchema.pre<BookingDocument>("save", async function preSave(next) {
  try {
    const doc = this;

    if (!doc.eventId) {
      throw new Error("'eventId' is required.");
    }

    // Ensure the referenced Event exists before creating the booking.
    const exists = await Event.exists({ _id: doc.eventId }).lean().exec();
    if (!exists) {
      throw new Error("Cannot create booking: referenced event does not exist.");
    }

    if (typeof doc.email !== "string" || doc.email.trim().length === 0) {
      throw new Error("'email' is required and must be non-empty.");
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Booking: BookingModelType =
  (models.Booking as BookingModelType | undefined) ||
  model<BookingDocument, BookingModelType>("Booking", bookingSchema);
