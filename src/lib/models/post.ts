import mongoose, { Document, Schema } from "mongoose"

export interface IPost extends Document {
    post_id: string
    title: string
    slug: string
    description: string
    content_html: string
    thumbnail_url: string
    createdAt: Date
    updatedAt: Date
}

const PostSchema: Schema = new Schema(
    {
        post_id: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        },
        title: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        },
        slug: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        },
        content_html: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        },
        thumbnail_url: {
            type: String,
            required: [true, "Please provide"],
            trim: true
        }
    },
    { timestamps: true }
)

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema)
