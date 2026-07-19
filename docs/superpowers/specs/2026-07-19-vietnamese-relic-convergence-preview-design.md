# Thiết kế bản thử nhạc hội tụ năm tín vật

## Mục tiêu

Tạo ba bản nhạc thử dài 13,2 giây cho cinematic năm tín vật hợp nhất và mở ra bản đồ Việt Nam. Bộ thử dùng nhạc cụ Việt làm chất liệu chủ đạo, giữ cùng một motif năm nốt nhưng tạo ba kết quả cảm xúc riêng cho Good, Neutral và Secret/Bad.

Các bản thử được lưu riêng và không thay thế asset đang chạy trong game cho đến khi người dùng nghe và chọn.

## Hướng âm nhạc

Phong cách **Mộc – ký ức** đặt đàn tranh mô phỏng ở tiền cảnh, đàn bầu mô phỏng làm đường dẫn cảm xúc, kết hợp mõ hoặc tiếng gõ gỗ nhẹ, trống thấp tiết chế và bè dây ấm. Không dùng âm sắc koto, shakuhachi hoặc mô-típ “Á Đông” chung chung. Chất cơ khí TVA chỉ xuất hiện rất nhẹ ở Secret/Bad.

Ba cue dùng chung một căn tính giai điệu:

- **Good — “Mạch Non Sông”:** năm nốt đi lên, hòa âm mở rộng và kết sáng, trọn vẹn.
- **Neutral — “Vết Hàn Chưa Khép”:** cùng motif nhưng quãng hẹp hơn, bè thưa và kết bằng hợp âm treo có hy vọng.
- **Secret/Bad — “Mạch Sử Rạn Vỡ”:** motif đảo chiều, hạ âm vực và lệch dần; nhạc rút xuống trước tiếng nứt ở giây 10.

## Timeline 13,2 giây

| Thời gian | Hình ảnh | Thiết kế âm thanh |
| --- | --- | --- |
| 0–4,8 giây | Năm tín vật bay vào | Năm tiếng đàn tranh, mỗi tiếng có vị trí stereo nhẹ và chung một motif nhận diện. |
| 4,8–6 giây | Hợp thành lõi | Một tiếng trống thấp tiết chế, đàn bầu vuốt và cộng hưởng hòa âm. |
| 6–8 giây | Bản đồ xuất hiện | Bè dây ấm mở rộng trường âm; đàn bầu hoặc đàn tranh nhắc lại motif. |
| 8–10 giây | Kết quả bắt đầu lộ rõ | Good giữ độ sáng; Neutral thưa dần; Secret tăng lệch hòa âm và chất kim loại nhẹ. |
| 10–13,2 giây | Hoàn tất hoặc rạn vỡ | Good giải quyết trọn vẹn; Neutral giữ hợp âm treo; Secret hạ năng lượng để nhường chỗ cho SFX nứt hiện có. |

## Sản xuất và file đầu ra

- Sinh âm thanh bằng pipeline Python tiêu chuẩn của repository, không tải sample hoặc nhạc bên thứ ba.
- Dùng tổng hợp vật lý đơn giản cho tiếng dây gảy, cộng hưởng nhiều họa âm cho đàn bầu, gõ gỗ, trống thấp, bè dây và reverb ngắn.
- Xuất stereo PCM WAV, 44,1 kHz, 16-bit, đúng 13,2 giây.
- Lưu ba file trong `assets/audio/previews/` với tên riêng cho Good, Neutral và Secret/Bad.
- Giữ nguyên ba file `assets/audio/sfx/relic-convergence*.wav` và runtime hiện tại trong giai đoạn nghe thử.

## Kiểm thử và nghe thử

- Viết regression test trước khi thêm generator; test phải thất bại vì ba preview chưa tồn tại.
- Test xác nhận định dạng stereo PCM, sample rate, bit depth, thời lượng, năng lượng ở ba pha cinematic và hash khác nhau giữa ba cue.
- Kiểm tra peak để tránh clipping và bảo đảm Secret chừa headroom cho `relic-fracture.wav`.
- Chạy generator hai lần và xác nhận hash không đổi để giữ tính tái lập.
- Dùng trình duyệt phát ba file preview và xác nhận WAV tải/phát được; không tích hợp runtime trong vòng thử này.

## Tiêu chí chấp nhận

- Cả ba bản nghe rõ cùng một motif năm tín vật nhưng phân biệt được ending ngay từ cách diễn tấu.
- Good ấm, trang trọng và giải tỏa mà không giống fanfare fantasy.
- Neutral suy tư, chưa khép lại nhưng không buồn tuyệt vọng hoặc đáng sợ.
- Secret/Bad mang cảm giác ký ức lịch sử bị tha hóa, không biến thành horror sci-fi hoặc jumpscare.
- Không có clipping, khoảng lặng ngoài ý muốn, tiếng bíp UI hay âm thanh vượt khỏi slot thời gian.
- Người dùng có ba file độc lập để nghe và chọn trước khi bất kỳ asset production nào bị thay thế.
