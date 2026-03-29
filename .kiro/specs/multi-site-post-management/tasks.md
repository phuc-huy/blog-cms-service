# Kế hoạch Triển khai: Hệ thống Quản lý Bài viết Đa Website

## Tổng quan

Triển khai hệ thống quản lý bài viết đa website bằng cách mở rộng model Post hiện có, tạo model Category mới, thêm CRUD cho Domain/Category, mở rộng admin UI với bộ lọc, và tạo Public API với Redis caching. Ngôn ngữ: TypeScript, framework: Next.js + MongoDB + Redis.

## Tasks

- [x] 1. Mở rộng Data Models
  - [x] 1.1 Mở rộng Post model với các trường mới
    - Thêm `domain_ids` (ObjectId[] ref Domain), `category_id` (ObjectId ref Category, default null), `status` (enum draft/published, default draft), `published_at` (Date, default null) vào `src/lib/models/post.ts`
    - Cập nhật interface `IPost` tương ứng
    - _Requirements: 2.1, 3.1, 3.2, 4.5_

  - [x] 1.2 Tạo Category model
    - Tạo file `src/lib/models/category.ts` với interface `ICategory` và schema: `name` (required), `slug` (required, unique), `description` (default '')
    - Thêm `{ timestamps: true }`
    - _Requirements: 4.1, 4.3_

  - [x] 1.3 Thêm unique index cho Domain key
    - Cập nhật `src/lib/models/domain.ts` thêm unique index cho trường `key`
    - _Requirements: 1.5_

- [x] 2. Thêm Cache invalidation utility
  - [x] 2.1 Thêm hàm `cacheDelPattern` vào `src/utils/cache.ts`
    - Implement hàm xóa tất cả Redis keys theo pattern (sử dụng `redis.keys()` + `redis.del()`)
    - Dùng cho invalidation cache khi admin tạo/sửa/xóa bài viết (pattern `posts:*`)
    - _Requirements: 6.7_

  - [ ]* 2.2 Viết property test cho cache invalidation
    - **Property 16: Cache invalidation on post mutation**
    - **Validates: Requirements 6.7**

- [x] 3. Admin API - Domain CRUD
  - [x] 3.1 Tạo API route GET/POST cho Domain
    - Tạo file `src/app/api/nimda/domain/route.ts`
    - GET: trả về danh sách tất cả domains
    - POST: tạo domain mới, kiểm tra unique key, trả lỗi 409 nếu key đã tồn tại
    - _Requirements: 1.1, 1.2, 1.5, 1.6_

  - [x] 3.2 Tạo API route PUT/DELETE cho Domain
    - Tạo file `src/app/api/nimda/domain/[id]/route.ts`
    - PUT: cập nhật domain theo ID
    - DELETE: xóa domain, đồng thời xóa domain ID khỏi `domain_ids` của tất cả Post liên quan
    - _Requirements: 1.3, 1.4_

  - [ ]* 3.3 Viết property test cho Domain CRUD round-trip
    - **Property 1: Domain CRUD round-trip**
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 3.4 Viết property test cho Domain key uniqueness
    - **Property 2: Domain key uniqueness**
    - **Validates: Requirements 1.5, 1.6**

  - [ ]* 3.5 Viết property test cho Domain deletion
    - **Property 3: Domain deletion removes domain**
    - **Validates: Requirements 1.4**

- [x] 4. Admin API - Category CRUD
  - [x] 4.1 Tạo API route GET/POST cho Category
    - Tạo file `src/app/api/nimda/category/route.ts`
    - GET: trả về danh sách tất cả categories
    - POST: tạo category mới, tự động sinh slug từ tên bằng `generateSlug()`, kiểm tra unique slug
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.2 Tạo API route PUT/DELETE cho Category
    - Tạo file `src/app/api/nimda/category/[id]/route.ts`
    - PUT: cập nhật category theo ID
    - DELETE: xóa category, đặt `category_id = null` cho tất cả Post liên quan trước khi xóa
    - _Requirements: 4.6_

  - [ ]* 4.3 Viết property test cho Category slug generation
    - **Property 8: Category slug generation from name**
    - **Validates: Requirements 4.2**

  - [ ]* 4.4 Viết property test cho Category slug uniqueness
    - **Property 9: Category slug uniqueness**
    - **Validates: Requirements 4.3**

  - [ ]* 4.5 Viết property test cho Category deletion nullifies references
    - **Property 10: Category deletion nullifies post references**
    - **Validates: Requirements 4.6**

- [x] 5. Checkpoint - Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 6. Mở rộng Admin API - Post CRUD
  - [x] 6.1 Mở rộng POST `/api/nimda/post` để hỗ trợ trường mới
    - Cập nhật `src/app/api/nimda/post/route.ts` POST handler: nhận thêm `domain_ids`, `category_id`, `status`
    - Mặc định `status = 'draft'`, `published_at = null`
    - Sau khi tạo post thành công, gọi `cacheDelPattern('posts:*')` để invalidate cache
    - _Requirements: 2.1, 3.2, 6.7, 7.2, 7.3_

  - [x] 6.2 Mở rộng GET `/api/nimda/post` với filter và pagination
    - Cập nhật `src/app/api/nimda/post/route.ts` GET handler: hỗ trợ query params `domain_id`, `category_id`, `status`, `search`, `page`, `limit`
    - Kết hợp tất cả filter bằng AND logic
    - Populate `domain_ids` và `category_id` để trả về tên domain/category
    - Sắp xếp theo `createdAt` descending mặc định
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 8.2_

  - [x] 6.3 Mở rộng PUT `/api/nimda/post/[id]` để hỗ trợ trường mới
    - Cập nhật `src/app/api/nimda/post/[id]/route.ts` PUT handler: nhận thêm `domain_ids`, `category_id`, `status`
    - Khi chuyển status từ `draft` sang `published`: set `published_at = new Date()`
    - Khi chuyển status từ `published` sang `draft`: giữ nguyên `published_at`
    - Sau khi cập nhật, gọi `cacheDelPattern('posts:*')`
    - _Requirements: 2.3, 3.3, 3.4, 6.7_

  - [x] 6.4 Mở rộng DELETE `/api/nimda/post/[id]` để invalidate cache
    - Cập nhật DELETE handler: sau khi xóa post, gọi `cacheDelPattern('posts:*')`
    - _Requirements: 6.7_

  - [ ]* 6.5 Viết property test cho Post references round-trip
    - **Property 4: Post references round-trip**
    - **Validates: Requirements 2.1, 4.5**

  - [ ]* 6.6 Viết property test cho new post defaults to draft
    - **Property 5: New post defaults to draft status**
    - **Validates: Requirements 3.2**

  - [ ]* 6.7 Viết property test cho publishing sets published_at
    - **Property 6: Publishing sets published_at timestamp**
    - **Validates: Requirements 3.3**

  - [ ]* 6.8 Viết property test cho unpublishing preserves published_at
    - **Property 7: Unpublishing preserves published_at**
    - **Validates: Requirements 3.4**

  - [ ]* 6.9 Viết property test cho post slug uniqueness
    - **Property 17: Post slug uniqueness with suffix**
    - **Validates: Requirements 7.2, 7.3**

  - [ ]* 6.10 Viết property test cho required field validation
    - **Property 18: Required field validation**
    - **Validates: Requirements 7.4**

  - [ ]* 6.11 Viết property test cho filter results
    - **Property 11: Filter results satisfy all conditions**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

  - [ ]* 6.12 Viết property test cho pagination invariants
    - **Property 12: Pagination invariants**
    - **Validates: Requirements 5.6, 6.4, 8.3**

  - [ ]* 6.13 Viết property test cho default sort order
    - **Property 19: Default sort order is newest first**
    - **Validates: Requirements 8.2**

- [x] 7. Checkpoint - Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 8. Public API - Phân phối Bài viết
  - [x] 8.1 Tạo API route GET `/api/posts` (danh sách)
    - Tạo file `src/app/api/posts/route.ts`
    - Chỉ trả về bài viết có `status === 'published'`
    - Hỗ trợ query params: `domain_key`, `category_slug`, `page` (default 1), `limit` (default 10)
    - Nếu có `domain_key`: lookup Domain theo key, filter Post theo `domain_ids`
    - Nếu có `category_slug`: lookup Category theo slug, filter Post theo `category_id`
    - Populate `domain_ids` và `category_id` để trả về thông tin đầy đủ
    - Cache kết quả bằng Redis với key pattern `posts:list:{domain_key}:{category_slug}:{page}:{limit}`, TTL 300s
    - Graceful degradation: nếu Redis lỗi, query trực tiếp MongoDB
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

  - [x] 8.2 Tạo API route GET `/api/posts/[slug]` (chi tiết)
    - Tạo file `src/app/api/posts/[slug]/route.ts`
    - Trả về chi tiết bài viết theo slug, chỉ khi `status === 'published'`
    - Trả về 404 nếu bài viết không tồn tại hoặc là draft
    - Cache kết quả với key `posts:detail:{slug}`, TTL 300s
    - _Requirements: 6.5, 6.6_

  - [ ]* 8.3 Viết property test cho public API returns only published
    - **Property 13: Public API returns only published posts**
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ]* 8.4 Viết property test cho public API detail returns published only
    - **Property 14: Public API detail returns published only**
    - **Validates: Requirements 6.5**

  - [ ]* 8.5 Viết property test cho cache populated after request
    - **Property 15: Cache is populated after public API request**
    - **Validates: Requirements 6.6**

- [x] 9. Checkpoint - Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 10. UI - Trang quản lý Domain
  - [x] 10.1 Tạo trang quản lý Domain
    - Tạo file `src/app/(page)/nimda/domain/page.tsx`
    - Hiển thị bảng danh sách domain (tên, key, link) với nút sửa/xóa
    - Nút "Thêm website mới" mở dialog/form tạo domain (nhập name, key, link)
    - Nút sửa mở dialog/form chỉnh sửa domain
    - Nút xóa hiển thị AlertDialog xác nhận trước khi xóa
    - Hiển thị thông báo lỗi khi key đã tồn tại
    - Gọi API `/api/nimda/domain` cho CRUD operations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

- [x] 11. UI - Trang quản lý Category
  - [x] 11.1 Tạo trang quản lý Category
    - Tạo file `src/app/(page)/nimda/category/page.tsx`
    - Hiển thị bảng danh sách category (tên, slug, mô tả) với nút sửa/xóa
    - Nút "Thêm danh mục mới" mở dialog/form tạo category (nhập name, description; slug tự sinh)
    - Nút xóa hiển thị AlertDialog xác nhận
    - Gọi API `/api/nimda/category` cho CRUD operations
    - _Requirements: 4.1, 4.2, 4.3, 4.6_

- [x] 12. UI - Mở rộng trang danh sách Bài viết
  - [x] 12.1 Thêm bộ lọc vào trang danh sách bài viết
    - Cập nhật `src/app/(page)/nimda/post/page.tsx`
    - Thêm dropdown lọc theo Domain (fetch từ `/api/nimda/domain`)
    - Thêm dropdown lọc theo Category (fetch từ `/api/nimda/category`)
    - Thêm dropdown lọc theo Status (draft/published)
    - Thêm ô tìm kiếm theo tiêu đề (debounce input)
    - Gửi filter params khi gọi API GET `/api/nimda/post`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 12.2 Thêm cột mới vào bảng danh sách bài viết
    - Thêm cột Danh mục (hiển thị tên category)
    - Thêm cột Website (hiển thị tên domains dưới dạng Badge components)
    - Thêm cột Trạng thái (Badge màu xanh cho published, xám cho draft)
    - Thêm cột Ngày tạo (format datetime)
    - _Requirements: 8.1, 8.5, 3.5_

- [x] 13. UI - Mở rộng Form tạo/chỉnh sửa Bài viết
  - [x] 13.1 Mở rộng form tạo bài viết
    - Cập nhật `src/app/(page)/nimda/post/create/page.tsx`
    - Thêm dropdown chọn Category (fetch từ `/api/nimda/category`)
    - Thêm danh sách checkbox chọn Domains (fetch từ `/api/nimda/domain`)
    - Thêm dropdown chọn Status (draft/published), mặc định draft
    - Gửi `domain_ids`, `category_id`, `status` khi submit form
    - _Requirements: 2.2, 2.4, 4.4, 7.1, 7.4_

  - [x] 13.2 Mở rộng form chỉnh sửa bài viết
    - Cập nhật `src/app/(page)/nimda/post/edit/[id]/page.tsx`
    - Thêm dropdown chọn Category (pre-select category hiện tại)
    - Thêm danh sách checkbox chọn Domains (pre-check domains hiện tại)
    - Thêm dropdown chọn Status (pre-select status hiện tại)
    - Gửi `domain_ids`, `category_id`, `status` khi submit form
    - _Requirements: 2.3, 4.4, 7.1_

- [x] 14. Cập nhật Admin Layout Navigation
  - Cập nhật navigation trong admin layout để thêm link đến trang Domain (`/nimda/domain`) và Category (`/nimda/category`)
  - _Requirements: 1.1_

- [x] 15. Final Checkpoint - Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

## Ghi chú

- Tasks đánh dấu `*` là optional và có thể bỏ qua để triển khai MVP nhanh hơn
- Mỗi task tham chiếu đến requirements cụ thể để đảm bảo traceability
- Checkpoints đảm bảo kiểm tra tăng dần sau mỗi nhóm chức năng
- Property tests sử dụng thư viện `fast-check` để kiểm tra tính đúng đắn
- Unit tests kiểm tra các trường hợp cụ thể và edge cases
