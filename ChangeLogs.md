# TSG.BPM_APPS.V1

## Trang chủ

    - Danh sách các quy trình theo Nhóm:
        . Nhân sự
        . Hành chính
        . Tài chính-Kế toán

## Dashboard

    - Thống kê các yêu cầu của User
    - Thống kê SLA hoàn thành các task của User đã phê duyệt

## Link Process

    - Cho phép cấu hình các quy trình con trên các Step của quy trình cha

### Đồng bộ

    - Cho phép link nhiều quy trình, mỗi quy trình cho phép nhiều instance
    - Khởi tạo quy trình con:
        · Khởi tạo khi người dùng của quy trình main lựa chọn người khởi tạo (assignment)
        · Cho phép khởi tạo thêm instance trên main theo quyền (tự chủ khởi tạo và đính vào quy trình cha)
        · Cho phép khởi tạo quy trình con từ quy trình tra (tương tự assignment)
    - Các quy trình con kết thúc thì quy trình cha mới chuyển sang bước kế tiếp (nếu có)
    - Cho phép đồng bộ cả 3 lọa dữ liệu (cha ==> con, cha <== con, cha <==> con)

### Bất đồng bộ

    - Cho phép link nhiều quy trình, mỗi quy trình cho phép nhiều instance
    - Khởi tao quy trinh được cấu hình khi phê duyệt tại buoc. Quy trình Chính: đi tiếp bước tiếp theo
        · Khởi tạo khi người dùng của quy trình main lựa chọn người khởi tạo (assignment)
        · Cho phép khởi tạo thêm instance trên main theo quyền (tự chủ khởi tạo và đính vào quy trình cha)
        · Cho phép khởi tạo quy trình con từ quy trình tra (tương tự assignment)
    - Cho phép đồng bộ cả 3 lọa dữ liệu (cha ==> con, cha <== con, cha <==> con)

## Điều kiện chuyển hướng

    - Chuyển hướng theo nhiều điều kiện chuyển hướng
    - Order ưu tiên theo thứ tự sắp xếp (có cho nhập số nguyên ưu tiên)
    - Thêm điều kiện chuyển bước: !=, OR (chưa kết hợp điều kiện)

## Phân quyền theo phòng ban: Chỉ có quản lý thuộc phòng (hoặc có cấu hình)

        > "BPM Admins": Admin của BPM MGR
        > "BPM Managers": Admin của BPM MGR -> là người quản lý hoặc đồng quản lý - có tất cả các quyền như quản lý của phòng ban (bao gồm cả phòng ban con)
        > "BPM Members": giống member cũ
        + Roles "quản lý thuộc phòng (hoặc có cấu hình)": chỉ xem các quy trình thuộc về phòng
        + EU: None -> Thông báo "không được phân quyền"

## Reports

    - Báo cáo thống kê theo cấp:
        . Admin: thống kê toàn bộ quy trình của nhân viên (cho phép tìm kiếm theo phòng ban)
        . Manager: thống kê toàn bộ quy trình của nhân viên trong phòng ban (cho phép tìm kiếm theo phòng ban, phòng ban con)
        . User: thống kê toàn bộ quy trình của User
    - Thống kê request theo quy trình
    - Thống kê SLA của các quy trình theo trạng thái:
        . Chưa tính SLA: các quy trình ở trạng thái lưu khởi tạo
        . Đạt: các quy trình đã kết thúc và có SLA thực tế <= SLA quy trình
        . Không đạt SLA: các quy trình đã kết thúc và có SLA thực tế > SLA quy trình
        . Trong thời hạn: các quy trình chưa kết thúc và có SLA thực tế <= SLA quy trình
        . Ngoài thời hạn: các quy trình chưa kết thúc và có SLA thực tế > SLA quy trình
