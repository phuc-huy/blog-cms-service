import mongoose, { Document, Schema } from "mongoose"

export interface IDomain extends Document {
    name: string
    key: string
    link: string
    createdAt: Date
    updatedAt: Date
}

const DomainSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        },
        key: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        },
        link: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        },
    },
    { timestamps: true }
)

export default mongoose.models.Domain || mongoose.model<IDomain>("Domain", DomainSchema)
