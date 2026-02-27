import { Spin } from "antd"

export default function Loading() {
    return (
        <div className="h-screen w-full util-flex-center">
            <Spin size="large" />
        </div>
    )
}
