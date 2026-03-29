import mongoose, { Document, Schema } from "mongoose"

export interface ICategory extends Document {
    name: string
    slug: string
    description: string
    createdAt: Date
    updatedAt: Date
}

const CategorySchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        },
        slug: {
            type: String,
            required: [true, "Please provide"],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
    },
    { timestamps: true }
)

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)
