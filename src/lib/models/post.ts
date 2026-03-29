import mongoose, { Document, Schema } from "mongoose"

export interface IPost extends Document {
    post_id: string
    title: string
    slug: string
    description: string
    content_html: string
    thumbnail_url: string
    domain_ids: mongoose.Types.ObjectId[]
    category_id: mongoose.Types.ObjectId | null
    status: 'draft' | 'published'
    published_at: Date | null
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
        },
        domain_ids: [{
            type: Schema.Types.ObjectId,
            ref: 'Domain'
        }],
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            default: null
        },
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft'
        },
        published_at: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
)

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema)
