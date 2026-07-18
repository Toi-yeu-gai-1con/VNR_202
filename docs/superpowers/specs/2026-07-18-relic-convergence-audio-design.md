# Thiết kế âm thanh cinematic hội tụ năm tín vật

## Phạm vi

Chỉ thay đổi nhạc và hiệu ứng âm thanh của cinematic hội tụ năm tín vật. Giữ nguyên animation, bản đồ, thời lượng 14 giây và luật chuyển Good, Neutral, Secret Corruption hoặc Bad Ending hiện tại.

## Mục tiêu cảm xúc

Ba kết quả dùng chung motif năm nhịp tương ứng năm tín vật nhưng phải khác rõ về hòa âm, chất liệu và cách kết thúc:

- **Good:** ấm, sáng và giải tỏa. Năm tiếng gõ gỗ/chuông mềm đi lên; lúc hợp nhất xuất hiện một hợp âm sáng; khi bản đồ mở ra, lớp pad ấm nâng nhẹ rồi kết thúc trọn vẹn.
- **Neutral:** suy tư, chưa hoàn tất nhưng không u ám hay đáng sợ. Năm nốt giữ quãng gần, tốc độ nhẹ; lúc hợp nhất có hòa âm ấm vừa phải; đoạn bản đồ kết bằng hợp âm treo, không dùng noise, drone tối hoặc âm méo.
- **Secret Corruption/Bad:** u tối lịch sử. Năm tiếng kim loại trầm nặng dần, kèm nhịp bánh răng và trống thấp; khi bản đồ chuyển đỏ, hòa âm lệch và sức căng tăng; khi bản đồ tách, nhạc hụt xuống để nhường chỗ cho tiếng vỡ.

## Timeline âm thanh

| Thời gian | Hình ảnh | Good | Neutral | Secret/Bad |
| --- | --- | --- | --- | --- |
| 0–4,8 giây | Năm tín vật bay vào | Năm nốt sáng đi lên | Năm nốt ấm, gần nhau | Năm tiếng kim loại trầm nặng dần |
| 4,8–6 giây | Hợp thành lõi | Hợp âm sáng, có độ mở | Hợp âm ấm nhưng chưa giải quyết | Cú cộng hưởng kim loại + trống thấp |
| 6–8 giây | Bản đồ xuất hiện | Pad ấm và motif mở rộng | Pad nhẹ, tiết chế | Âm nền căng nhưng chưa vỡ |
| 8–10 giây | Secret chuyển đỏ | Giữ cảm giác hoàn thành | Giữ cảm giác suy tư | Dissonance tăng, bánh răng chậm lại |
| 10–13 giây | Secret tách bản đồ | Kết trọn vẹn | Kết treo | Tiếng nứt–vỡ riêng, sau đó âm trầm đổ xuống |

## Hiệu ứng nứt–vỡ

Tạo file SFX riêng cho khoảnh khắc bản đồ tách, không trộn cố định vào bản nhạc nền. Hiệu ứng gồm ba lớp ngắn:

1. Gỗ khô rạn ở transient đầu.
2. Đá/giấy dày xé vỡ ở thân âm.
3. Kim loại căng bật và dư âm trầm rất ngắn để phù hợp khung cơ khí.

SFX chỉ phát một lần khi `fractureSplit` bắt đầu, vào khoảng giây 10. Nó tuân theo mute và SFX volume, không dùng kênh dialogue/UI và không phát ở Good hoặc Neutral.

## Tích hợp runtime

- Cue hội tụ bắt đầu ngay trong sự kiện E/click để giữ quyền phát audio của trình duyệt.
- Mỗi ending dùng một file cue riêng; không dùng filter runtime để giả lập khác biệt cảm xúc.
- Trạng thái cinematic có cờ riêng để ngăn tiếng nứt phát lặp qua nhiều frame.
- Khi link debug bị autoplay block, lần click đầu tiên sẽ retry cue; tiếng nứt vẫn phát đúng theo timeline sau khi cue đã được mở khóa.
- Chuyển sang nhạc ending hiện có sau cinematic mà không chồng hai bản nhạc kéo dài.

## Asset và nguồn

- Tạo lại ba cue hội tụ và một SFX nứt–vỡ bằng pipeline âm thanh gốc của dự án.
- Không nhập nhạc hoặc SFX bên thứ ba.
- Cập nhật `ASSET_SOURCES.md` với mục đích, cấu trúc lớp âm và phạm vi sử dụng.

## Kiểm thử

- Unit regression xác nhận cue bắt đầu trong `beginRelicConvergence`.
- Unit regression xác nhận Secret có SFX nứt riêng và cờ one-shot; Good/Neutral không gọi SFX này.
- Kiểm tra WAV có duration hợp lệ và có năng lượng âm thanh ở từng pha timeline.
- Browser probe xác nhận file cue được load và `play()` chạy trong user activation.
- Playtest Good, Neutral và Secret ở âm lượng mặc định, mute, SFX volume thấp/cao và link debug.

## Tiêu chí hoàn tất

- Good nghe ấm, sáng, không đáng sợ.
- Neutral nghe suy tư và bỏ lửng, không giống Bad Ending.
- Secret tạo cảm giác lịch sử bị tha hóa ngay từ lúc hội tụ.
- Khoảnh khắc tách bản đồ có tiếng nứt–vỡ rõ, đồng bộ hình ảnh và chỉ phát một lần.
- Không xuất hiện tiếng bíp input hoặc âm thanh chồng lặp.
