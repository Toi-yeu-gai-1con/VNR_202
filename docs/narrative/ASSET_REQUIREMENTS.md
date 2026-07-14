# Yêu cầu asset cho narrative vertical slice

> Không sản xuất asset trong Đợt 1. Đây là backlog bắt buộc cho Đợt 3–4 để không sinh ảnh rời rạc hoặc dùng fallback tĩnh.

| Asset pack | Trạng thái/action | Nội dung tối thiểu |
|---|---|---|
| David visual-novel portrait | Tạo mới từ nhận diện David đã duyệt | idle/speaking/concerned, blink/nhịp thở nhẹ, canvas và palette thống nhất |
| Nhà du hành portrait | Tạo mới từ player hiện có | neutral/resolve/regret, animation chuyển biểu cảm không jitter |
| NPC công nhân Khu 1 | Nâng cấp hoặc tạo mới khi chưa có silhouette phù hợp | idle/walk/gesture, ít nhất một trạng thái sau hậu quả |
| Khu 1 title card | Cảnh nhiều lớp dùng background dự án và effect động | mưa, sương, giấy bay nhẹ, typography; không chỉ là ảnh tĩnh |
| La Bàn Đỏ | Bổ sung state strip | normal, unstable, corrupted, restored; neo chân/khung nhất quán |
| Khu 1 bad-ending cinematic | Dùng scene động và sprite/effect thật | báo cháy, sương, bóng người, La Bàn vỡ; không dùng rectangle/text trên nền trống |
| Cổng TVA và trưng bày relic | Mở rộng asset group hub | state theo tín vật/Tha hóa, ánh sáng/particle chuyển động |

Mọi sprite mới phải đi qua `sprite-pipeline`: seed được duyệt, full strip cho các hành động liên quan trong một lượt, fixed canvas, alpha sạch, bottom-center anchor, preview và kiểm tra ở kích thước in-game.
