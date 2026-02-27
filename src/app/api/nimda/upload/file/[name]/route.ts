import fs from "fs"
import path from "path"
import mime from "mime-types"

const UPLOAD_DIR = '/opt/app/uploads'

export async function GET(req: Request, { params }: { params: { name: string } }) {
    const filename = path.basename(params.name)
    const filePath = path.join(UPLOAD_DIR, filename)

    if (!fs.existsSync(filePath)) {
        return new Response("File not found", { status: 404 })
    }

    const stat = fs.statSync(filePath)
    if (!stat.isFile()) {
        return new Response("Invalid file", { status: 400 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const contentType = mime.lookup(filename) || "application/octet-stream"

    return new Response(fileBuffer, {
        headers: {
            "Content-Type": contentType,
            "Content-Length": stat.size.toString(),
            "Cache-Control": "public, max-age=31536000, immutable"
        }
    })
}
