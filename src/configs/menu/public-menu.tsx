import {
    PAGE_ROUTE_CALCULATE_PRICE_TODAY,
    PAGE_ROUTE_CONTACT,
    PAGE_ROUTE_CONVERT_SALARY_TO_GOLD,
    PAGE_ROUTE_DEMO,
    PAGE_ROUTE_FAQ,
    PAGE_ROUTE_GOLD_INVEST_CALCULATOR,
    PAGE_ROUTE_GOLD_INVEST_PER_MONTH,
    PAGE_ROUTE_HOMEPAGE,
    AUTH_PAGE_ROUTE_LOGIN,
    PAGE_ROUTE_PRIVACY_POLICY,
    PAGE_ROUTE_TERM,
    PAGE_ROUTE_DISCLAIMER,
    PAGE_ROUTE_WORLD_GOLD_PRICE,
    PAGE_ROUTE_GOLD_PRICE_TODAY
} from "../page-route"
import { COMMON_CONFIG } from "configs/common-config"

export const public_route_menu = [
    {
        path: PAGE_ROUTE_HOMEPAGE,
        name: "",
        priority: 1,
        meta: {
            title: COMMON_CONFIG.brand_name,
            description: COMMON_CONFIG.meta.description
        },
        icon: null
    },
    {
        path: PAGE_ROUTE_DISCLAIMER,
        name: "Miễn trừ trách nhiệm",
        priority: 1,
        meta: {
            title: "Miễn trừ trách nhiệm",
            description: COMMON_CONFIG.meta.description
        },
        icon: null
    },
    {
        path: PAGE_ROUTE_GOLD_PRICE_TODAY,
        name: "Giá vàng hôm nay",
        priority: 1,
        meta: {
            title: "Giá vàng hôm nay",
            description: COMMON_CONFIG.meta.description
        },
        icon: null
    },
    {
        path: PAGE_ROUTE_WORLD_GOLD_PRICE,
        name: "Giá vàng thế giới",
        priority: 1,
        meta: {
            title: "Giá vàng thế giới",
            description: COMMON_CONFIG.meta.description
        },
        icon: null
    },
    {
        path: AUTH_PAGE_ROUTE_LOGIN,
        name: "Đăng  nhập",
        priority: 1,
        meta: {
            title: "Đăng  nhập",
            description: COMMON_CONFIG.meta.description
        },
        icon: null
    },

    {
        path: PAGE_ROUTE_GOLD_INVEST_CALCULATOR,
        name: "Giả lập đầu tư vàng",
        priority: 1,
        meta: {
            title: "Giả lập đầu tư vàng",
            description: `Tính năng giả lập đầu tư vàng trên quanlyvang.vn giúp bạn kiểm tra hiệu quả đầu tư vàng theo thời gian. Chỉ cần nhập số tiền đầu tư và ngày mua vàng, hệ thống sẽ tự động tính lãi/lỗ, giá trị hiện tại và tỷ lệ phần trăm thay đổi theo giá vàng mới nhất. Công cụ hữu ích cho nhà đầu tư muốn phân tích xu hướng, đánh giá lợi nhuận và lên kế hoạch đầu tư thông minh. Dữ liệu chính xác, cập nhật theo từng thương hiệu lớn như SJC, DOJI, giúp bạn nắm bắt thị trường dễ dàng và hiệu quả.`
        },
        icon: null,
        is_feature: true
    },
    {
        path: PAGE_ROUTE_GOLD_INVEST_PER_MONTH,
        name: "Giả lập đầu tư hằng tháng",
        priority: 1,
        meta: {
            title: "Giả lập đầu tư hằng tháng",
            description: `Tính năng giả lập đầu tư vàng hằng tháng trên quanlyvang.vn giúp bạn hình dung rõ hiệu quả khi đầu tư định kỳ vào vàng. Chỉ cần nhập số tiền đầu tư mỗi tháng và ngày bắt đầu đầu tư, hệ thống sẽ tự động tính toán tổng số tiền đã đầu tư, giá trị hiện tại, lãi/lỗ và tỷ lệ phần trăm thay đổi dựa trên giá vàng thực tế. Đây là công cụ lý tưởng để đánh giá hiệu quả chiến lược đầu tư dài hạn, theo dõi lợi nhuận và lên kế hoạch tài chính thông minh theo thời gian.`
        },
        icon: null,
        is_feature: true
    },
    {
        path: PAGE_ROUTE_CALCULATE_PRICE_TODAY,
        name: "Tính giá vàng hôm nay",
        priority: 1,
        meta: {
            title: "Tính giá vàng hôm nay",
            description: `Tính năng tính giá vàng hôm nay trên quanlyvang.vn giúp bạn dễ dàng biết được giá trị thực tế của số vàng bạn đang sở hữu. Chỉ cần nhập số chỉ vàng, hệ thống sẽ tự động tính toán giá mua và giá bán theo từng thương hiệu lớn như SJC, DOJI, PNJ... Cập nhật theo giá vàng mới nhất hôm nay, công cụ hỗ trợ người dùng nắm bắt nhanh lãi/lỗ khi mua bán vàng. Giao diện dễ sử dụng, chính xác và tiện lợi, phù hợp cho cả nhà đầu tư và người tiêu dùng theo dõi thị trường vàng mỗi ngày.`
        },
        icon: null,
        is_feature: true
    },
    {
        path: PAGE_ROUTE_CONVERT_SALARY_TO_GOLD,
        name: "Đổi lương sang vàng",
        priority: 1,
        meta: {
            title: "Đổi lương sang vàng",
            description: `Tính năng đổi lương sang vàng trên quanlyvang.vn giúp bạn hình dung sức mua của đồng lương theo thời gian. Chỉ cần nhập lương hằng tháng và tháng bắt đầu, hệ thống sẽ tự động quy đổi sang số chỉ vàng mua được mỗi tháng, tính tổng số tiền từ lương, tổng số chỉ vàng quy đổi, giá trị số vàng hiện tại theo giá vàng hôm nay, và so sánh chỉ vàng mua được lúc đầu và lúc cuối. Ngoài ra, công cụ còn tính tỷ lệ lạm phát ẩn giúp bạn đánh giá mức độ mất giá của đồng tiền theo thời gian một cách trực quan và chính xác.`
        },
        icon: null,
        is_feature: true
    }
]
