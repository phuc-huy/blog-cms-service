# Tài liệu Yêu cầu - Hệ thống Quản lý Bài viết Đa Website

## Giới thiệu

Hệ thống quản lý bài viết đa website (Multi-Site Post Management) cho phép quản trị viên tạo, chỉnh sửa, xóa và phân phối bài viết cho nhiều website khác nhau từ một giao diện quản trị duy nhất. Hệ thống được xây dựng trên nền tảng Next.js hiện có với MongoDB, Redis, và admin panel tại route `/nimda`.

### Phân tích hiện trạng dự án

Dự án hiện tại đã có:
- Model `Post` (post_id, title, slug, description, content_html, thumbnail_url) — chưa hỗ trợ đa website
- Model `Domain` (name, key, link) — đã có nhưng chưa liên kết với Post
- CRUD bài viết cơ bản tại `/nimda/post`
- API routes tại `/api/nimda/post`
- Rich text editor (TipTap) với upload ảnh
- Hệ thống cache Redis và slug generation

### Cần mở rộng

- Liên kết Post với Domain để hỗ trợ đa website
- CRUD quản lý Domain trong admin panel
- Lọc/phân loại bài viết theo website
- API phân phối bài viết cho từng website
- Quản lý trạng thái bài viết (nháp, đã xuất bản)
- Hệ thống danh mục (category) cho bài viết

## Thuật ngữ

- **Hệ_thống**: Ứng dụng web quản lý bài viết đa website (Next.js + MongoDB + Redis)
- **Quản_trị_viên**: Người dùng có quyền truy cập admin panel tại `/nimda`
- **Bài_viết**: Đối tượng Post chứa tiêu đề, mô tả, nội dung HTML, ảnh đại diện, slug
- **Website**: Đối tượng Domain đại diện cho một website đích nhận bài viết
- **Danh_mục**: Đối tượng Category dùng để phân loại bài viết
- **Trình_soạn_thảo**: Rich text editor (TipTap) dùng để soạn nội dung bài viết
- **API_công_khai**: API endpoint cho phép website bên ngoài lấy bài viết
- **Bộ_lọc**: Chức năng lọc danh sách bài viết theo website, danh mục, trạng thái

## Yêu cầu

### Yêu cầu 1: Quản lý Website (Domain)

**User Story:** Là Quản_trị_viên, tôi muốn quản lý danh sách các website, để tôi có thể phân phối bài viết cho từng website.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL hiển thị danh sách tất cả Website đã đăng ký trong trang quản lý Website tại `/nimda/domain`.
2. WHEN Quản_trị_viên gửi form tạo Website với đầy đủ thông tin (tên, key, link), THE Hệ_thống SHALL lưu Website mới vào cơ sở dữ liệu và hiển thị Website trong danh sách.
3. WHEN Quản_trị_viên gửi form chỉnh sửa Website, THE Hệ_thống SHALL cập nhật thông tin Website trong cơ sở dữ liệu.
4. WHEN Quản_trị_viên xác nhận xóa một Website, THE Hệ_thống SHALL xóa Website khỏi cơ sở dữ liệu.
5. THE Hệ_thống SHALL đảm bảo trường `key` của Website là duy nhất trong cơ sở dữ liệu.
6. IF Quản_trị_viên tạo Website với `key` đã tồn tại, THEN THE Hệ_thống SHALL trả về thông báo lỗi "Key đã tồn tại".

### Yêu cầu 2: Liên kết Bài viết với Website

**User Story:** Là Quản_trị_viên, tôi muốn gán bài viết cho một hoặc nhiều website, để bài viết được phân phối đúng nơi.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL mở rộng model Bài_viết với trường `domain_ids` chứa danh sách ID của các Website được gán.
2. WHEN Quản_trị_viên tạo Bài_viết mới, THE Hệ_thống SHALL hiển thị danh sách Website dưới dạng checkbox để Quản_trị_viên chọn một hoặc nhiều Website.
3. WHEN Quản_trị_viên chỉnh sửa Bài_viết, THE Hệ_thống SHALL hiển thị các Website đã được gán ở trạng thái đã chọn và cho phép thay đổi.
4. IF Quản_trị_viên không chọn Website nào khi tạo Bài_viết, THEN THE Hệ_thống SHALL cho phép lưu Bài_viết mà không gán Website (bài viết chung).

### Yêu cầu 3: Quản lý Trạng thái Bài viết

**User Story:** Là Quản_trị_viên, tôi muốn quản lý trạng thái bài viết (nháp/đã xuất bản), để tôi có thể kiểm soát bài viết nào hiển thị trên website.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL mở rộng model Bài_viết với trường `status` có giá trị `draft` hoặc `published`.
2. WHEN Quản_trị_viên tạo Bài_viết mới, THE Hệ_thống SHALL đặt trạng thái mặc định là `draft`.
3. WHEN Quản_trị_viên thay đổi trạng thái Bài_viết từ `draft` sang `published`, THE Hệ_thống SHALL cập nhật trạng thái và ghi nhận thời gian xuất bản (`published_at`).
4. WHEN Quản_trị_viên thay đổi trạng thái Bài_viết từ `published` sang `draft`, THE Hệ_thống SHALL cập nhật trạng thái và giữ nguyên giá trị `published_at` trước đó.
5. THE Hệ_thống SHALL hiển thị trạng thái của mỗi Bài_viết trong danh sách bài viết bằng badge màu (xanh cho `published`, xám cho `draft`).

### Yêu cầu 4: Quản lý Danh mục Bài viết

**User Story:** Là Quản_trị_viên, tôi muốn phân loại bài viết theo danh mục, để bài viết được tổ chức có hệ thống.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL cung cấp model Danh_mục với các trường: tên, slug, mô tả.
2. WHEN Quản_trị_viên tạo Danh_mục mới, THE Hệ_thống SHALL tự động sinh slug từ tên danh mục.
3. THE Hệ_thống SHALL đảm bảo slug của Danh_mục là duy nhất trong cơ sở dữ liệu.
4. WHEN Quản_trị_viên tạo hoặc chỉnh sửa Bài_viết, THE Hệ_thống SHALL hiển thị dropdown cho phép chọn một Danh_mục.
5. THE Hệ_thống SHALL mở rộng model Bài_viết với trường `category_id` tham chiếu đến Danh_mục.
6. IF Quản_trị_viên xóa Danh_mục đang được gán cho Bài_viết, THEN THE Hệ_thống SHALL đặt trường `category_id` của các Bài_viết liên quan thành null.

### Yêu cầu 5: Lọc và Tìm kiếm Bài viết

**User Story:** Là Quản_trị_viên, tôi muốn lọc và tìm kiếm bài viết theo nhiều tiêu chí, để tôi có thể quản lý bài viết hiệu quả.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL cung cấp Bộ_lọc theo Website trên trang danh sách bài viết.
2. THE Hệ_thống SHALL cung cấp Bộ_lọc theo Danh_mục trên trang danh sách bài viết.
3. THE Hệ_thống SHALL cung cấp Bộ_lọc theo trạng thái (`draft`, `published`) trên trang danh sách bài viết.
4. WHEN Quản_trị_viên nhập từ khóa vào ô tìm kiếm, THE Hệ_thống SHALL lọc danh sách Bài_viết theo tiêu đề chứa từ khóa.
5. WHEN Quản_trị_viên áp dụng nhiều Bộ_lọc cùng lúc, THE Hệ_thống SHALL kết hợp tất cả điều kiện lọc (AND logic) để hiển thị kết quả.
6. THE Hệ_thống SHALL duy trì phân trang khi áp dụng Bộ_lọc.

### Yêu cầu 6: API Công khai Phân phối Bài viết

**User Story:** Là Quản_trị_viên, tôi muốn cung cấp API cho các website bên ngoài lấy bài viết, để bài viết được hiển thị trên các website đích.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL cung cấp API endpoint `GET /api/posts` trả về danh sách Bài_viết có trạng thái `published`.
2. WHEN API_công_khai nhận tham số `domain_key`, THE Hệ_thống SHALL trả về danh sách Bài_viết được gán cho Website có key tương ứng.
3. WHEN API_công_khai nhận tham số `category_slug`, THE Hệ_thống SHALL trả về danh sách Bài_viết thuộc Danh_mục có slug tương ứng.
4. THE Hệ_thống SHALL hỗ trợ phân trang cho API_công_khai với tham số `page` và `limit`.
5. WHEN API_công_khai nhận tham số `slug`, THE Hệ_thống SHALL trả về chi tiết một Bài_viết có slug tương ứng và trạng thái `published`.
6. THE Hệ_thống SHALL cache kết quả API_công_khai bằng Redis với TTL 5 phút để giảm tải cơ sở dữ liệu.
7. WHEN Quản_trị_viên tạo, cập nhật, hoặc xóa Bài_viết, THE Hệ_thống SHALL xóa cache Redis liên quan để đảm bảo dữ liệu mới nhất.

### Yêu cầu 7: Cải thiện Form Tạo/Chỉnh sửa Bài viết

**User Story:** Là Quản_trị_viên, tôi muốn form tạo và chỉnh sửa bài viết hỗ trợ đầy đủ các trường mới, để tôi có thể quản lý bài viết toàn diện.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL hiển thị các trường sau trong form tạo/chỉnh sửa Bài_viết: tiêu đề, mô tả, nội dung (Trình_soạn_thảo), ảnh đại diện, danh mục, website, trạng thái.
2. WHEN Quản_trị_viên gửi form tạo Bài_viết, THE Hệ_thống SHALL tự động sinh `post_id` duy nhất và `slug` từ tiêu đề.
3. IF slug được sinh ra đã tồn tại trong cơ sở dữ liệu, THEN THE Hệ_thống SHALL thêm hậu tố số tăng dần vào slug (ví dụ: `bai-viet-2`, `bai-viet-3`).
4. WHEN Quản_trị_viên gửi form mà thiếu trường bắt buộc (tiêu đề, mô tả, nội dung), THE Hệ_thống SHALL hiển thị thông báo lỗi cụ thể cho trường bị thiếu.
5. WHEN Quản_trị_viên upload ảnh đại diện, THE Hệ_thống SHALL chuyển đổi ảnh sang định dạng WebP với chất lượng 80% và lưu vào thư mục uploads.

### Yêu cầu 8: Hiển thị Danh sách Bài viết trong Admin

**User Story:** Là Quản_trị_viên, tôi muốn xem danh sách bài viết với đầy đủ thông tin, để tôi có cái nhìn tổng quan về tất cả bài viết.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL hiển thị bảng danh sách Bài_viết với các cột: STT, ảnh đại diện, tiêu đề, danh mục, website được gán, trạng thái, ngày tạo.
2. THE Hệ_thống SHALL sắp xếp danh sách Bài_viết theo ngày tạo mới nhất mặc định.
3. THE Hệ_thống SHALL phân trang danh sách Bài_viết với 10 bài viết mỗi trang.
4. WHEN Quản_trị_viên nhấn nút xóa Bài_viết và xác nhận, THE Hệ_thống SHALL xóa Bài_viết khỏi cơ sở dữ liệu và cập nhật danh sách.
5. THE Hệ_thống SHALL hiển thị tên các Website được gán dưới dạng badge trong cột website.
