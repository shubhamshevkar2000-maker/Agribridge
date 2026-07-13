import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAiInteraction extends Document {
  userId: Types.ObjectId;
  intent: string;
  inputText?: string;
  imageUrl?: string;
  responseText: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiInteractionSchema = new Schema<IAiInteraction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    intent: { type: String, required: true },
    inputText: { type: String },
    imageUrl: { type: String },
    responseText: { type: String, required: true },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

aiInteractionSchema.index({ userId: 1 });
aiInteractionSchema.index({ intent: 1 });

export const AiInteraction = mongoose.model<IAiInteraction>('AiInteraction', aiInteractionSchema);
