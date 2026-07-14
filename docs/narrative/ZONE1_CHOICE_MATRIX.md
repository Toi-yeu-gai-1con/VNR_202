# Ma trận lựa chọn–hậu quả — Khu 1

> Vertical slice cho mục 49, 50, 54, 56.1 và 58. Các tên flag bên dưới là hợp đồng thiết kế; tên export cuối cùng được chốt cùng schema Đợt 2.

## Mục tiêu trải nghiệm

Người chơi hiểu rằng Khu 1 nói về nhu cầu tìm một đường lối và cách bảo vệ sự thức tỉnh của người lao động. Họ không bị ép phải chọn "đáp án đúng" ngay; họ nhìn thấy tác động lên công nhân, bến cảng, La Bàn Đỏ và lời David trước khi đến điểm khóa.

## Biến nội bộ

| Biến | Giá trị khởi đầu | Ý nghĩa |
|---|---:|---|
| `zone1.direction` | 0 | Mức người chơi bảo vệ/xa rời mục tiêu chung |
| `zone1.workerTrust` | 0 | Niềm tin của nhóm công nhân bến cảng |
| `zone1.complicity` | 0 | Mức độ hợp tác với bộ máy đàn áp |
| `zone1.badRisk` | 0 | Nguy cơ nhánh “Con tàu không la bàn” |
| `zone1.recoveryOffered` | false | Người chơi đã được trao cơ hội sửa sai hợp lý |

## Điểm rẽ

| ID thiết kế | Tình huống | Các hướng giải quyết | Hậu quả thật |
|---|---|---|---|
| `recruiter-offer` | Lính tuần tra Pháp mời giao nộp/đốt *Le Paria* | Từ chối; nhận lời để đổi an toàn; trì hoãn để tìm chứng cứ | Từ chối tăng `direction`/`workerTrust`; nhận lời tăng `complicity`/`badRisk` nhưng chưa khóa ending; trì hoãn mở nhánh chứng cứ |
| `dock-workers` | Ba công nhân cần nhận báo giữa mưa và tuần tra | Hộ tống/bảo vệ; dùng chứng cứ thuyết phục cai phu cho qua; đi đường hàng hóa nguy hiểm hơn nhưng ít chiến đấu; bỏ mặc | Ba hướng đầu đều có thể tiến quest với chi phí khác nhau; bỏ mặc làm một NPC vắng mặt ở TVA và tăng risk |
| `last-issue` | Tờ báo cuối bị truy lùng, một công nhân bị bắt | Giải cứu bằng chiến đấu; đổi hướng tuần tra bằng chứng cứ; thỏa hiệp tạm thời rồi quay lại cứu; giao nộp | Ba hướng đầu giữ hoặc khôi phục trust theo cách khác nhau; giao nộp chỉ tăng risk, không kết thúc ngay |
| `compass-verdict` | La Bàn Đỏ mất ổn định trước khi nhận tín vật | Khẳng định bảo vệ đường lối chung; nhận lỗi và sửa hậu quả; xác nhận đổi lấy lợi ích cá nhân | Hai hướng đầu dẫn đến tiến trình thường/neutral Khu 1; xác nhận chỉ khóa bad ending khi `badRisk` đã đạt ngưỡng |

## Điều kiện bad ending 56.1 — “Con tàu không la bàn”

Bad ending chỉ đủ điều kiện khi tất cả đều đúng:

1. `zone1.badRisk >= 3` từ ít nhất hai điểm rẽ khác nhau.
2. `zone1.complicity >= 2` hoặc người chơi đã giao nộp số báo cuối.
3. Người chơi chọn xác nhận lợi ích cá nhân ở `compass-verdict` sau khi UI/world/NPC đã cảnh báo rõ.

Nếu risk cao nhưng người chơi chọn nhận lỗi/sửa hậu quả, game đặt `recoveryOffered = true`, cho phép hoàn thành Khu 1 với hậu quả nhìn thấy được; không khóa ending.

## Hậu quả hiển thị

| Trạng thái | Trong Khu 1 | Khi về TVA |
|---|---|---|
| Trust cao | Công nhân hỗ trợ đường đi, mưa dịu ở khu cứu trợ, La Bàn sáng ổn định | Một công nhân xuất hiện gần Cổng, David phản hồi cụ thể, relic sáng rõ |
| Trust thấp nhưng đã sửa | Một công nhân dè dặt, đường đi khó hơn, La Bàn chớp không đều | David ghi nhận việc sửa sai; relic sáng yếu nhưng không bị Tha hóa |
| Risk cao chưa khóa | Tuần tra dày hơn, báo bị ướt/cháy cục bộ, NPC cảnh báo | Cổng có vết nhiễu nhẹ; David không tiết lộ điều kiện ending |
| Bad ending | Cinematic nhánh giả định, báo cháy, sương dày, La Bàn vỡ | Ending được ghi vào bộ sưu tập; David phục hồi checkpoint hợp lệ và đưa Tha hóa về 0% |

## Nội dung “Những gì có thể đã khác”

Sau Khu 1, bản tổng kết chỉ nêu điểm rẽ đã gặp, hậu quả đã thấy và một gợi ý không tiết lộ đáp án. Ví dụ: “Cậu đã chọn giữ an toàn trước mắt khi tờ báo cuối bị truy lùng. Hãy thử nói chuyện với người công nhân đã mất niềm tin trước khi đưa ra quyết định cuối.”

## Cổng kiểm thử Đợt 3

- Mỗi hướng giải quyết thay đổi ít nhất một flag, một phản ứng nhìn/nghe thấy được và dữ liệu save.
- Một lựa chọn danger đơn lẻ không kích hoạt ending.
- Checkpoint recovery không mất save chính, không reset nhạc sai và không kẹt input.
- Ảnh/animation của NPC, relic, effect và cinematic đều là asset động hợp lệ; không có rectangle hoặc placeholder.
