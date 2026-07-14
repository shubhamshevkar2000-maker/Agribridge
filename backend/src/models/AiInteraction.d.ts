import mongoose, { Document, Types } from 'mongoose';
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
export declare const AiInteraction: mongoose.Model<IAiInteraction, {}, {}, {}, Document<unknown, {}, IAiInteraction, {}, mongoose.DefaultSchemaOptions> & IAiInteraction & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAiInteraction>;
//# sourceMappingURL=AiInteraction.d.ts.map