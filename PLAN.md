# Kế hoạch nâng cấp hợp nhất dự án — Hạng mục 43–118

> Trạng thái: Roadmap đã được hiệu chỉnh ngày 15/07/2026 theo hiện trạng `main` và quyết định dùng David làm Người giữ thời gian/điều phối viên TVA. Tài liệu định hướng các đợt triển khai tiếp theo; không đồng nghĩa toàn bộ hạng mục 43–118 đã hoàn thành hoặc được phép triển khai trong một đợt duy nhất.

## 1. Mục tiêu

Tích hợp đề xuất mới về hội thoại, visual novel, định vị thời gian, David trong vai trò Người giữ thời gian/điều phối viên TVA và các nhánh ending vào nhóm 43–58, đồng thời giữ đầy đủ roadmap nâng cấp từ 43 đến 118 để đội dự án có một tài liệu theo dõi thống nhất.

Kết quả cuối cần biến cốt truyện hiện nay từ một chuỗi nhiệm vụ tuyến tính với hai ending chung thành một hệ thống lựa chọn–hậu quả rõ ràng, có chiều sâu lịch sử, nhưng vẫn giữ nhịp chơi của một game hành động–RPG 2D trên trình duyệt.

Tài liệu bao phủ các nhóm kể chuyện–lịch sử, trung tâm thế giới, UI–accessibility, hình ảnh–chuyển động, khả năng chơi lại và nền tảng kỹ thuật. Các nhóm này liên kết với nhau nhưng vẫn giữ nguyên số roadmap để không phá lịch sử theo dõi tiến độ.

## 2. Phạm vi và nguyên tắc cố định

- Giữ nguyên kiến trúc Canvas 2D và cấu trúc bốn khu hiện tại; không đổi engine.
- Giữ cấu trúc 5 tín vật trong 4 khu; Khu 3 tiếp tục có hai tín vật và hai chương lịch sử.
- Giữ nguyên số thứ tự 43–118 để không phá lịch sử theo dõi tiến độ.
- David là nhân vật hư cấu cố định, đảm nhiệm đồng thời vai trò Người giữ thời gian và điều phối viên TVA; không tạo thêm một nhân vật dẫn truyện thứ hai có chức năng trùng lặp.
- David không phải nhân vật lịch sử có thật, không được đứng thay nhân vật lịch sử hoặc được trình bày như nguồn kiến thức lịch sử.
- Phải phân biệt rõ sự kiện lịch sử, phép biểu tượng hóa gameplay và nhánh phản lịch sử giả định.
- Không dùng một lựa chọn vô tình hoặc một lần tương tác đơn lẻ để kích hoạt ending mà không có cảnh báo và ngữ cảnh.
- Không dùng ảnh tĩnh, hình khối, lời thoại chung chung hoặc fallback chất lượng thấp thay cho nhân vật, cảnh, vật thể hay hiệu ứng cần chuyển động.
- Nội dung tiếng Việt phải đúng chính tả, có dấu, mã hóa UTF-8 và phù hợp bối cảnh, văn hóa, thuần phong mỹ tục Việt Nam.
- Mọi dữ kiện lịch sử hiển thị như kiến thức phải được kiểm chứng và có nguồn; nội dung giả định phải được gắn nhãn rõ.

### Trạng thái tiến độ sau khi đối chiếu `main` ngày 15/07/2026

- Nhóm 43–58 đã có nguyên mẫu opening TVA, David, lựa chọn hội thoại, good/bad ending và cơ chế phục hồi bad ending; chưa có schema lựa chọn–hậu quả tổng quát, neutral ending hoặc sáu bad ending riêng.
- Nhóm 59–68 đã có portal, khóa đường về khi nhiệm vụ chưa hoàn thành và luồng báo cáo tín vật; trung tâm TVA chưa phản ánh đầy đủ NPC, tín vật, Tha hóa và ending.
- Nhóm 69–82 đã có mute tổng, pause, minimap và loading/retry; các tùy chỉnh âm lượng, accessibility và điều khiển vẫn còn thiếu.
- Nhóm 83–94 là nhóm có nền tảng hoàn thiện nhất nhờ các đợt nâng cấp player, quái, sprite hướng, combat effect và cinematic good/bad cơ bản; vẫn thiếu portrait visual novel và cinematic theo tám ending mục tiêu.
- Nhóm 95–104 hầu như chưa triển khai và chỉ nên bắt đầu sau khi ending resolver cùng save migration ổn định.
- Nhóm 105–118 đã có nền tảng đáng kể trên `main` qua các đợt refactor, test, debug, tối ưu, asset audit và cache, nhưng chưa được coi là hoàn thành tuyệt đối.
- Việc nhóm 105–118 có nền tảng không có nghĩa nhóm 43–104 đã hoàn thành.
- Các mục 106, 107, 112, 113, 115 và 117 cần được mở rộng thêm khi hệ thống lựa chọn–hậu quả 43–58 được triển khai.

## 3. Hiện trạng dự án đã đối chiếu

Game đã có nền móng cần thiết nhưng chưa đủ cho thiết kế mới:

- Màn mở đầu TVA, Nhà du hành và David đã tồn tại. David hiện là nhân viên điều phối hồ sơ; nội dung cần được mở rộng để thể hiện rõ trách nhiệm Người giữ thời gian mà không biến TVA thành nguồn lịch sử có thật.
- Hộp hội thoại đã hỗ trợ lựa chọn ở TVA và một phần Khu 1, nhưng chưa có portrait, biểu cảm, lịch sử hội thoại, điều kiện phân nhánh tổng quát hoặc visual novel hoàn chỉnh.
- Game có 5 tín vật trong 4 khu; Khu 3 chứa hai tín vật và hai giai đoạn lịch sử.
- Quest đã lưu một số quyết định cụ thể như lựa chọn với lính tuần tra Khu 1, nhưng chủ yếu vẫn là biến đúng/sai và các tập hợp vật phẩm; chưa có mô hình lưu chuỗi lựa chọn, động cơ, quan hệ NPC, điểm chủ đề hoặc hậu quả dài hạn.
- Ending hiện chỉ có `good` và `bad`.
- Bad ending đã có cinematic động, nhạc và luồng David đưa người chơi về điểm kiểm soát, nhưng điều kiện ending vẫn cần thay bằng bộ phân giải lựa chọn–hậu quả để không kết thúc vì một lần bấm đơn lẻ.
- Portal trở về TVA hiện đã khóa khi nhiệm vụ khu chưa hoàn thành; quy tắc này phải được giữ khi hệ thống scene và quest được mở rộng.
- Khu 4 đang nén Đại hội VI năm 1986 và Khoán 10 năm 1988 thành một thời điểm, nên cần chỉnh lại cách trình bày niên đại.

Các điểm mã nguồn liên quan:

- `src/data/story-content.js`: hội thoại, tín vật, nội dung ending và phần mở đầu.
- `src/data/quests.js`: trạng thái nhiệm vụ hiện tại.
- `src/runtime/game-runtime.js`: trình phát hội thoại, tương tác nhiệm vụ, Tha hóa và bộ chọn ending hiện tại.
- `src/systems/save-system.js`: dữ liệu tiến trình cần mở rộng khi lựa chọn phân nhánh được triển khai.
- `src/core/scene-controller.js`, `src/core/asset-manager.js` và `src/core/page-lifecycle.js`: nền tảng scene, tải asset và vòng đời trình duyệt cần được mở rộng theo feature thay vì thay thế.

## 4. Phân tích thiết kế

### 4.1. David — Người giữ thời gian/điều phối viên TVA

David là nhân vật dẫn truyện cố định của game. Vai trò nhân viên TVA hiện tại được mở rộng thành Người giữ thời gian/điều phối viên phụ trách hồ sơ Việt Nam bị lệch nhánh. David phải:

- Giới thiệu quy tắc du hành qua các nhánh thời gian.
- Giao nhiệm vụ thu thập 5 tín vật và điều phối cổng tới từng khu/chương.
- Nhắc người chơi rằng họ đang chứng kiến những lát cắt lịch sử đã được biểu tượng hóa.
- Cảnh báo rằng lựa chọn có thể tạo ra nhánh giả định, nhưng không nói sẵn đáp án đạo đức.
- Thay đổi lời thoại theo tín vật, Tha hóa, lựa chọn, ending đã mở và hậu quả người chơi mang về TVA.

David không được đứng thay nhân vật lịch sử, không trực tiếp “sáng tạo” hay “quyết định” lịch sử Việt Nam và không được trình bày như nguồn kiến thức lịch sử. Kiến thức do game cung cấp phải gắn với codex, tư liệu và nguồn kiểm chứng; lời David chỉ dẫn đường, đặt câu hỏi và phản hồi hành trình.

### 4.2. Ba lớp nội dung

Mỗi khu phải tách nội dung thành ba lớp:

1. **Sự kiện lịch sử:** Nội dung đã xảy ra, có niên đại và nguồn kiểm chứng.
2. **Biểu tượng gameplay:** Cách game rút gọn sự kiện thành mê cung, tín vật, chiến đấu, thuyết phục hoặc khôi phục môi trường.
3. **Nhánh giả định:** Hậu quả phản lịch sử dùng cho bad ending, luôn được ghi rõ là giả định và không được trình bày như điều chắc chắn đã xảy ra.

### 4.3. Lựa chọn và hậu quả

- Một lựa chọn nhỏ có thể thay đổi Tha hóa, quan hệ NPC hoặc một cờ nội dung.
- Một chuỗi lựa chọn cùng hướng mới tạo thành nguy cơ ending.
- Trước điểm không thể quay lại phải có dấu hiệu trong thế giới, lời cảnh báo hoặc xác nhận phù hợp ngữ cảnh.
- Hậu quả nên xuất hiện qua NPC, môi trường, âm thanh và nhiệm vụ trước khi game giải thích ý nghĩa.
- Không hiện ngay các thông báo phán xét kiểu “đúng/sai”.
- Các biến chủ đề như `đoàn kết`, `thời cơ`, `thống nhất` và `đổi mới` có thể được lưu ẩn, không nhất thiết biến thành bốn thanh HUD mới.

### 4.4. Cấu trúc Khu 3

Khu 3 hiện gộp hai giai đoạn xa nhau nên phải được tổ chức thành hai chương rõ ràng trong cùng khu:

- **Chương A — 1941–1945:** Việt Minh, đại đoàn kết, chuẩn bị lực lượng và chớp thời cơ Tổng khởi nghĩa.
- **Chương B — 1954–1975:** giới tuyến quân sự tạm thời, phối hợp hai miền, đấu tranh thống nhất đất nước.

Hai chương dùng hai bộ biến lựa chọn và hai nhánh bad ending riêng. Không được để lựa chọn ở chương 1945 trực tiếp kích hoạt ending về chia cắt 1954–1975 nếu không có quan hệ cốt truyện rõ.

### 4.5. Nguyên tắc ending

Hệ thống mục tiêu gồm tối thiểu tám ending ở quy mô toàn game:

- 1 good ending.
- 1 neutral ending.
- 5 bad ending theo khu/chương: Khu 1, Khu 2, Khu 3A, Khu 3B và Khu 4.
- 1 bad ending bí mật do Tha hóa cực hạn.

Ending phải được chọn bởi một bộ phân giải điều kiện dựa trên trạng thái đã lưu, không dựa vào một biến `good/bad` đơn lẻ.

## 5. Kiểm chứng và hiệu chỉnh lịch sử

### 5.1. Khu 1 — Le Paria

- Báo *Le Paria* (*Người cùng khổ*) ra số đầu ngày 01/04/1922.
- Báo từng được vận chuyển tới các thuộc địa bằng nhiều con đường, trong đó có các tuyến bí mật đường biển do thủy thủ có cảm tình hỗ trợ.
- Nhiệm vụ “phát báo cho ba công nhân” có thể giữ như biểu tượng gameplay, nhưng không được mô tả là phục dựng chính xác một sự kiện cụ thể đã được ghi nhận.

Nguồn: [Bảo tàng Hồ Chí Minh — Nguyễn Ái Quốc–Hồ Chí Minh và báo Người cùng khổ](https://baotanghochiminh.vn/nguyen-ai-quoc-ho-chi-minh-va-bao-nguoi-cung-kho-le-paria.htm).

### 5.2. Khu 2 — Hợp nhất các tổ chức cộng sản

- Hội nghị hợp nhất diễn ra đầu tháng 02/1930 tại Cửu Long, Hương Cảng, dưới sự chủ trì của Nguyễn Ái Quốc.
- Đông Dương Cộng sản Liên đoàn được quyết định gia nhập ngày 24/02/1930.
- Hình ảnh “ba cánh cửa” hoặc “ba ngọn lửa” có thể giữ như biểu tượng, nhưng sổ tay phải trình bày đủ diễn tiến và không làm người chơi hiểu rằng mọi đại biểu, thủ tục và thời điểm đều diễn ra trong đúng một phiên họp duy nhất.

Nguồn:

- [Tư liệu–Văn kiện Đảng — Ngày thành lập Đảng Cộng sản Việt Nam 3/2/1930](https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/ngay-thanh-lap-dang-cong-san-viet-nam-3-2-1930-3342).
- [Tư liệu về diễn tiến ngày 24/02/1930](https://tulieuvankien.dangcongsan.vn/upload/3000006/20251024/04ca7dc64206d3a455480cf392bbf12bnguyenaiquoc.pdf).

### 5.3. Khu 3A — Cách mạng Tháng Tám

- Việt Minh là hạt nhân quy tụ sức mạnh đoàn kết dân tộc.
- Thắng lợi tháng Tám năm 1945 gắn với quá trình chuẩn bị lực lượng, tổ chức quần chúng và nắm bắt thời cơ.
- Nhánh thất bại phải dùng ngôn ngữ thận trọng: người chơi bỏ lỡ một thời cơ cụ thể hoặc khiến lực lượng bị phân tán; không khẳng định dân tộc vĩnh viễn không thể giành độc lập.

Nguồn: [Tư liệu–Văn kiện Đảng — Cách mạng Tháng Tám và Quốc khánh 2/9/1945](https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/cach-mang-thang-8-va-quoc-khanh-291945-cua-nuoc-viet-nam-dan-chu-cong-hoa-3310).

### 5.4. Khu 3B — Hiệp định Genève và Vĩ tuyến 17

- Hiệp định Genève xác định giới tuyến quân sự chỉ có tính tạm thời, không phải biên giới quốc gia.
- Bad ending “Vĩ tuyến thành biên giới” phải được trình bày là một nhánh giả định trong đó sự chia cắt tạm thời bị kéo dài và cố định hóa.
- Trọng tâm cảm xúc nên là gia đình và đời sống người dân bị chia cắt, không chỉ là hình ảnh quân sự.

Nguồn: [Báo Chính phủ — Hiệp định Genève 1954: Một mốc son lịch sử của nền ngoại giao Việt Nam](https://baochinhphu.vn/hiep-dinh-geneve-1954-mot-moc-son-lich-su-cua-nen-ngoai-giao-viet-nam-102240425094504794.htm).

### 5.5. Khu 4 — Đại hội VI và Khoán 10

- Đại hội VI diễn ra tháng 12/1986 và mở ra đường lối Đổi Mới.
- Nghị quyết 10 của Bộ Chính trị, thường gọi là Khoán 10, được ban hành ngày 05/04/1988.
- Title card phù hợp là **“1986–1988: Từ đường lối Đổi Mới đến cơ chế khoán trong nông nghiệp”**, không phải một mốc 1986 duy nhất.
- Nhiệm vụ trao Khoán 10 cần được kể như bước triển khai tiếp theo của quá trình đổi mới, không phải một sự kiện đồng thời với Đại hội VI.

Nguồn:

- [Báo Chính phủ — Đảng Cộng sản Việt Nam qua các kỳ Đại hội](https://baochinhphu.vn/dang-cong-san-viet-nam-qua-cac-ky-dai-hoi-102286517.htm).
- [Tư liệu–Văn kiện Đảng — Nghị quyết 10 và nông nghiệp](https://tulieuvankien.dangcongsan.vn/c-mac-angghen-lenin-ho-chi-minh/ho-chi-minh/nghien-cuu-hoc-tap-tu-tuong/ho-chi-minh-ve-vai-tro-nen-tang-cua-nong-nghiep-trong-qua-trinh-cong-nghiep-hoa-dat-nuoc-2038).

## 6. Các phương án tích hợp đã cân nhắc

### Phương án A — Chèn mục mới và đánh lại toàn bộ roadmap

Ưu điểm: mỗi ý tưởng mới có một số riêng, dễ chia việc nhỏ.

Nhược điểm: phá lịch sử tiến độ 43–118, gây nhầm lẫn với các mục 105–118 đã triển khai và làm đội dự án khó đối chiếu trao đổi cũ.

### Phương án B — Giữ số cũ, mở rộng nội dung 43–58

Ưu điểm: giữ lịch sử roadmap, gom đúng các thay đổi kể chuyện vào nhóm kể chuyện–lịch sử và dễ đối chiếu với tiến độ hiện tại.

Nhược điểm: một số mục, đặc biệt mục 56, sẽ có nhiều nhánh con và cần được chia thành nhiều task khi lập kế hoạch triển khai.

### Phương án C — Tạo roadmap cốt truyện độc lập

Ưu điểm: tài liệu narrative sạch và có thể giao riêng cho nhóm nội dung.

Nhược điểm: dễ tách rời gameplay, UI, save-state, asset và kiểm thử; có nguy cơ tạo thiết kế không phù hợp runtime hiện tại.

### Phương án được chọn

Chọn **Phương án B**: giữ nguyên 43–58 và mở rộng tiêu chí bên trong. Khi triển khai, mỗi mục lớn có thể được tách thành nhiều task kỹ thuật, nội dung, asset và playtest nhưng số roadmap gốc không thay đổi.

## 7. Roadmap hợp nhất 43–118

### 43. Làm lại phần mở đầu và giới thiệu từng khu

- Giữ opening TVA và David hiện có, nhưng viết lại vai trò để David được nhận diện rõ là Người giữ thời gian/điều phối viên phụ trách các hồ sơ Việt Nam bị lệch nhánh.
- Không tạo thêm một nhân vật dẫn truyện thứ hai. David giao nhiệm vụ thu thập 5 tín vật, vận hành cổng và giải thích giới hạn can thiệp vào các nhánh lịch sử.
- Mở đầu phải có chuyển cảnh, sprite animation, âm thanh và nhịp dựng cinematic; không dùng chuỗi ảnh tĩnh đơn thuần.
- Cho phép bỏ qua cinematic và xem lại từ codex hoặc phòng ký ức tại TVA.
- Khi qua cổng, hiện title card khoảng 5–10 giây gồm:
  - Tên khu/chương.
  - Địa điểm hoặc không gian lịch sử được biểu tượng hóa.
  - Khoảng thời gian.
  - Câu hỏi lịch sử trung tâm của khu.
- Không dùng một năm đơn lẻ cho khu trải dài nhiều giai đoạn.
- Đề xuất mốc hiển thị:
  - Khu 1: đầu thế kỷ XX, trọng tâm 1922–1929.
  - Khu 2: 1929–02/1930.
  - Khu 3A: 1941–1945.
  - Khu 3B: 1954–1975.
  - Khu 4: 1986–1988, đặt trong bối cảnh khó khăn sau 1975.

### 44. Phát triển hội thoại gameplay và visual novel

- Mở rộng hộp hội thoại và lựa chọn hiện có thay vì xây một hệ thống song song.
- Hội thoại gameplay thường phải ngắn, rõ và không chặn điều khiển quá lâu.
- Visual novel chỉ dùng cho:
  - Mở màn.
  - Gặp nhân vật quan trọng.
  - Tranh luận hoặc bước ngoặt.
  - Lựa chọn lớn.
  - Cảnh trước ending.
- Hộp visual novel cần có tên người nói, portrait, biểu cảm, tiến độ, hiệu ứng chữ vừa phải và âm thanh tượng trưng.
- David là portrait dẫn truyện chính; NPC/nhân chứng quan trọng có portrait riêng theo đúng giai đoạn và phong cách pixel của dự án.
- Hội thoại phải hỗ trợ lựa chọn có điều kiện và thay đổi theo trạng thái nhiệm vụ.
- Loại bỏ lời thoại fallback chung chung như “nhân vật này còn một câu chuyện chưa kể”. Nếu thiếu nội dung hoặc asset cần thiết, phải chặn phát hành phần đó hoặc bổ sung nội dung hoàn chỉnh.
- Cho phép tua nhanh, xem lại lịch sử hội thoại và dùng bàn phím/chuột nhất quán.

### 45. Chia kiến thức thành ba lớp

- **Cần biết:** thông tin ngắn để hiểu mục tiêu hiện tại.
- **Đọc thêm:** bối cảnh, nhân vật, diễn tiến, nguồn và khái niệm trong sổ tay.
- **Nhánh giả định:** mô tả hậu quả phản lịch sử và luôn có nhãn rõ.
- Không dồn văn bản dài vào modal giữa chiến đấu.
- Luôn nêu rõ phần nào là sự kiện thật và phần nào là phép biểu tượng hóa của game.

### 46. Nâng cấp sổ tay thành codex lịch sử

Codex lưu và mở khóa dần:

- Nhân vật.
- Sự kiện.
- Tổ chức.
- Địa danh.
- Tín vật.
- Khái niệm.
- Các nhánh giả định đã phát hiện.
- Nguồn tham khảo.

Nội dung chưa gặp không được tiết lộ trước. Mỗi mục cần có trạng thái chưa biết, vừa phát hiện và đã đọc.

### 47. Thêm timeline lịch sử trực quan

Timeline tối thiểu gồm:

- 1911–1929: hành trình tìm đường cứu nước và hoạt động báo chí.
- 1929–1930: quá trình thống nhất các tổ chức cộng sản.
- 1941–1945: Việt Minh, đại đoàn kết và Cách mạng Tháng Tám.
- 1954–1975: chia cắt tạm thời, phối hợp hai miền và thống nhất đất nước.
- 1975–1988: hậu quả chiến tranh, khó khăn kinh tế–xã hội, Đại hội VI và Khoán 10.

Timeline phải cho biết khu/chương nào đang kể giai đoạn nào, tín vật nào liên quan và mục nào người chơi đã mở khóa.

### 48. Nâng cấp trang ký ức của 5 tín vật

Mỗi tín vật mở một trang ký ức gồm:

- Tranh minh họa động, sprite animation hoặc cảnh nhiều lớp có chuyển động.
- Lời dẫn ngắn.
- Bối cảnh lịch sử.
- Ý nghĩa biểu tượng của tín vật.
- Cách game đã rút gọn sự kiện thành gameplay.
- Nguồn tham khảo.
- Những lựa chọn của người chơi liên quan đến tín vật.
- Trạng thái bình thường hoặc bị Tha hóa của tín vật nếu có.

### 49. Xây dựng hệ thống lựa chọn có hậu quả

- Thay mô hình các biến quyết định riêng lẻ bằng schema dữ liệu thống nhất gồm `choices`, `branchFlags`, `npcRelations`, `themeScores` và `endingRisks`; tên trường cuối cùng phải được chốt trong đặc tả kỹ thuật trước khi viết migration.
- Lưu lựa chọn theo khu và chương.
- Lựa chọn có thể ảnh hưởng:
  - Tha hóa.
  - Quan hệ hoặc niềm tin của NPC.
  - Cách giải quyết nhiệm vụ.
  - Trạng thái môi trường.
  - Tín vật.
  - Ending có thể đạt.
- Các biến chủ đề như đoàn kết, thời cơ, thống nhất và đổi mới nên được lưu dưới dạng cờ hoặc điểm nội bộ.
- Không thêm thanh HUD cho mọi biến; chỉ hiển thị điều người chơi cần ra quyết định công bằng.
- Save/load phải giữ đầy đủ lựa chọn và hậu quả; save hiện tại phải được nâng version và migrate có kiểm thử thay vì bị xóa hoặc âm thầm gán sai.

### 50. Cho nhiệm vụ có nhiều cách giải quyết

Tùy nhiệm vụ, người chơi có thể:

- Chiến đấu.
- Thuyết phục.
- Thu thập và trình bày bằng chứng.
- Bảo vệ hoặc hỗ trợ dân thường.
- Hòa giải các nhóm.
- Tránh bạo lực khi không cần thiết.

Các cách giải quyết phải có chi phí, rủi ro và hậu quả thật; không được chỉ thay một câu thoại rồi hội tụ ngay về cùng trạng thái.

### 51. Thể hiện hậu quả tại khu trung tâm

- NPC đã cứu hoặc thuyết phục có thể xuất hiện.
- NPC bị bỏ lại hoặc mất niềm tin có thể vắng mặt.
- Tín vật, ánh sáng, âm thanh, môi trường và hoạt động dân cư thay đổi.
- Hậu quả tích cực lẫn tiêu cực đều phải nhìn và nghe thấy được.
- Không dùng nhãn chữ đặt giữa bản đồ để thay cho thay đổi môi trường thật.

### 52. Cho NPC trung tâm nhận xét hành động gần nhất

- Nhận xét phải chỉ ra hành động hoặc hậu quả cụ thể.
- Tránh lời thoại chung kiểu “bạn đã làm tốt” hoặc “bạn đã làm sai”.
- Cùng một lựa chọn có thể được nhiều NPC nhìn nhận khác nhau.
- Lời thoại phải thay đổi khi người chơi quay lại sau một khu/chương hoặc sau khi mở một ending.

### 53. Thêm hội thoại tranh luận giữa NPC

- Các NPC có thể bất đồng về phương pháp, thời điểm hoặc ưu tiên.
- Quan điểm phải phù hợp bối cảnh lịch sử, không dùng lập luận hiện đại một cách lỗi thời.
- Không tạo “bia rơm” chỉ để người chơi dễ chọn đáp án hiển nhiên.
- Người chơi được nghe các phía trước khi quyết định.
- Kết quả tranh luận có thể mở cách giải quyết chiến đấu, thuyết phục hoặc thu thập bằng chứng.

### 54. Để hậu quả giải thích thông điệp

- Không hiện ngay phán xét đạo đức sau mỗi lựa chọn.
- Dùng phản ứng NPC, môi trường, âm thanh, nhiệm vụ và trạng thái tín vật để thể hiện hậu quả.
- Sau chương mới tổng kết ý nghĩa lịch sử.
- Lựa chọn nguy hiểm phải có cảnh báo hợp lý trước điểm không thể quay lại.
- Cho phép người chơi nhận ra sai lầm và sửa chữa ở mức hợp lý trước khi ending bị khóa.

### 55. Good ending phản ánh cụ thể hành trình

Good ending phải thay đổi theo:

- NPC nào được cứu.
- Lực lượng nào được thuyết phục.
- Nhiệm vụ nào được giải quyết bằng chiến đấu, thuyết phục hoặc bằng chứng.
- Mức Tha hóa.
- Trạng thái của 5 tín vật.
- Những hậu quả đã xuất hiện tại trung tâm.

Cinematic không được giống hệt nhau trong mọi lượt chơi. Có thể dùng một cấu trúc chung nhưng phải chọn cảnh, nhân vật, lời dẫn và chi tiết môi trường dựa trên dữ liệu hành trình.

### 56. Xây dựng sáu bad ending riêng

#### 56.1. Khu 1 — “Con tàu không la bàn”

**Mắt xích bị mất:** Đường lối cứu nước.

**Điều kiện tích lũy:**

- Nhận lợi ích hoặc lời mời cộng tác từ bộ máy quan lại bù nhìn.
- Đốt, giấu, giao nộp hoặc không truyền báo *Le Paria*.
- Chọn vinh hoa cá nhân thay vì thức tỉnh và bảo vệ người lao động.

Một hành động đơn lẻ chỉ làm tăng nguy cơ. Ending được khóa khi người chơi tiếp tục xác nhận con đường đó tại điểm quyết định của chương.

**Cảnh kết:**

- Những tờ báo cháy trong mưa.
- Sương mù bao phủ toàn bộ mê cung.
- Các bóng người lần lượt đứng lên rồi biến mất trong những lối cụt.
- Bến cảng vẫn hoạt động, người lao động vẫn bị xiềng xích và lá cờ thực dân chưa hạ xuống.
- Chiếc La Bàn Đỏ quay loạn rồi vỡ.

**Nội dung kết:**

Các phong trào yêu nước vẫn tiếp tục, nhưng thiếu một đường lối đủ sức xác định mục tiêu, lực lượng và phương pháp đấu tranh thống nhất. Những nỗ lực rời rạc có nguy cơ tiếp tục bị đàn áp, khiến con đường giải phóng dân tộc kéo dài trong bế tắc.

**Câu chốt:**

> “Lòng yêu nước là ngọn lửa, nhưng ngọn lửa không có phương hướng vẫn có thể tắt giữa màn đêm.”

Thông điệp cần trả lời: không có “la bàn” không có nghĩa dân tộc không đấu tranh, mà các cuộc đấu tranh khó chuyển thành một phong trào có đường hướng chung.

#### 56.2. Khu 2 — “Ba ngọn lửa lụi tàn”

**Mắt xích bị mất:** Tổ chức lãnh đạo thống nhất.

**Điều kiện tích lũy:**

- Sử dụng Lưỡi dao chia rẽ.
- Thiên vị một tổ chức và tìm cách loại bỏ hai tổ chức còn lại.
- Dùng bạo lực hoặc cưỡng ép để áp đặt thay vì thuyết phục hợp nhất.

**Cảnh kết:**

- Ba cánh cửa của căn nhà đóng sầm lại.
- Các nhóm tranh giành biểu tượng và công kích nhau.
- Búa và Liềm không thể ghép lại.
- Từng gian phòng lần lượt bị lực lượng đàn áp bao vây.
- Bàn tròn phủ bụi, ba mảnh huy hiệu mất ánh sáng.

**Nội dung kết:**

Các tổ chức cùng hướng tới cách mạng nhưng tiếp tục hoạt động biệt lập và cạnh tranh ảnh hưởng. Khi không hình thành được một đội tiên phong thống nhất, lực lượng bị phân tán, phong trào suy yếu và khủng hoảng lãnh đạo chưa được giải quyết.

**Câu chốt:**

> “Ba ngọn lửa cháy riêng có thể bị dập tắt từng ngọn; chỉ khi hợp lại, chúng mới trở thành một ngọn đuốc.”

Đây nên là bad ending trực diện nhất về vai trò của sự thống nhất tổ chức, nhưng phần kiến thức phải giữ đúng diễn tiến lịch sử tháng 02/1930.

#### 56.3. Khu 3A — “Thời cơ Tháng Tám vụt qua”

**Mắt xích bị mất:** Đại đoàn kết và khả năng chớp thời cơ.

**Điều kiện tích lũy:**

- Phát động khởi nghĩa khi chưa quy tụ đủ các lực lượng cần thiết.
- Loại bỏ trí thức, tư sản dân tộc hoặc những lực lượng có thể liên hiệp.
- Tấn công trung nông hoặc địa chủ yêu nước thay vì đánh giá đúng khả năng đoàn kết.
- Trì hoãn quá lâu sau khi thời cơ đã xuất hiện.

**Cơ chế Đồng hồ Thời cơ:**

- Chỉ bắt đầu khi điều kiện lịch sử trong chương đã chín muồi, không đếm vô lý từ lúc vào bản đồ.
- Có tín hiệu bằng hình ảnh, âm thanh và lời thoại.
- Cho người chơi đủ thông tin để biết họ đang thiếu lực lượng nào.
- Áp lực tăng dần nhưng không biến thành quick-time event thiếu công bằng.

**Cảnh kết:**

- Quảng trường rộng nhưng trống vắng.
- Những nhóm nhỏ nổi dậy riêng lẻ và lần lượt thất bại.
- Chuông thời cơ vang lên rồi im bặt.
- Các lực lượng bên ngoài tiến vào khoảng trống quyền lực.
- Sợi Chỉ Đỏ đứt thành nhiều đoạn.

**Nội dung kết:**

Thời cơ lịch sử chỉ có thể biến thành thắng lợi khi lực lượng quần chúng đã được tổ chức và có sự chỉ đạo thống nhất. Khi các tầng lớp còn phân tán, cuộc nổi dậy có nguy cơ chỉ diễn ra cục bộ hoặc không kịp giành chính quyền trên phạm vi cả nước.

**Câu chốt:**

> “Thời cơ có thể xuất hiện trong một khoảnh khắc, nhưng sức mạnh để nắm lấy nó phải được chuẩn bị trong nhiều năm.”

Ending thể hiện việc bỏ lỡ một thời cơ cụ thể, không khẳng định dân tộc vĩnh viễn không thể giành độc lập.

#### 56.4. Khu 3B — “Vĩ tuyến thành biên giới”

**Mắt xích bị mất:** Mục tiêu và chiến lược thống nhất đất nước.

**Điều kiện tích lũy:**

- Chấp nhận biến giới tuyến quân sự tạm thời thành chia cắt vĩnh viễn trong nhánh giả định.
- Từ bỏ mục tiêu thống nhất.
- Để hậu phương và tiền tuyến hoạt động hoàn toàn tách rời.
- Chỉ giải cứu một miền rồi rời khỏi chương.

**Cảnh kết:**

- Cây cầu gãy hoàn toàn và bị nước cuốn đi.
- Bản đồ Việt Nam bị xé đôi.
- Gia đình đứng ở hai bờ nhưng không thể gặp nhau.
- Giới tuyến tạm thời dần biến thành hàng rào, tháp canh và biên giới cố định trong nhánh giả định.
- Hiệu ứng lịch cho thấy nhiều năm trôi qua nhưng cây cầu không được phục hồi.

**Nội dung kết:**

Giới tuyến vốn mang tính tạm thời dần trở thành một sự chia cắt kéo dài. Khi thiếu mục tiêu chung và sự phối hợp trên phạm vi cả nước, sức mạnh đấu tranh thống nhất suy yếu, còn sự lệ thuộc vào các lực lượng bên ngoài ngày càng sâu sắc.

**Câu chốt:**

> “Một dân tộc bị chia đôi không chỉ mất lãnh thổ; mỗi ngày trôi qua còn làm vết cắt sâu thêm trong lòng con người.”

Đây là bad ending giàu cảm xúc nhất; tập trung vào gia đình và người dân thay vì chỉ dùng hình ảnh quân sự. Mọi nội dung phải ghi rõ đây là nhánh giả định và giới tuyến theo Hiệp định Genève vốn chỉ có tính tạm thời.

#### 56.5. Khu 4 — “Cỗ máy đứng im”

**Mắt xích bị mất:** Khả năng tự đổi mới và sửa chữa khuyết điểm.

**Điều kiện tích lũy:**

- Giữ nguyên các hàng rào quan liêu bao cấp.
- Chọn bảo vệ cơ chế cũ để giữ lợi ích hoặc quyền lực cá nhân.
- Trao vật tư cho người tham nhũng thay vì người trực tiếp sản xuất.
- Từ chối trao quyền chủ động hợp lý cho nông dân.

**Cảnh kết:**

- Bánh răng cố quay rồi gãy răng.
- Nhà máy tắt lửa, ruộng đồng khô héo.
- Người dân tiếp tục xếp hàng với tem phiếu.
- Bảng giá tăng liên tục nhưng cửa hàng ngày càng trống.
- Thung lũng mất màu, chỉ còn chợ đen và kho hàng bị khóa.

**Nội dung kết:**

Khi những yếu kém không được nhìn nhận và cơ chế cũ không được thay đổi, sức sản xuất tiếp tục bị kìm hãm. Khủng hoảng, lạm phát, thiếu thốn và tình trạng cô lập có nguy cơ kéo dài, khiến đất nước bỏ lỡ cơ hội phát triển và hội nhập.

**Câu chốt:**

> “Người cầm lái không chỉ cần giữ đúng hướng; còn phải biết sửa con tàu trước khi nó ngừng chuyển động.”

Ending tập trung vào việc không có khả năng tự đổi mới. Lựa chọn “đa nguyên chính trị” đột ngột hiện tại không còn là nguyên nhân chính hoặc nút kết thúc tức thì vì nó không liên kết chặt với luận điểm của khu.

#### 56.6. Bad ending bí mật — “Có ngọn cờ nhưng mất lòng dân”

**Điều kiện tích lũy:**

- Nhận hối lộ.
- Tấn công dân thường hoặc các lực lượng có thể đoàn kết.
- Lạm dụng quyền lực.
- Lặp lại lựa chọn xa rời lợi ích nhân dân.
- Để Tha hóa đạt 100%.

**Cảnh kết:**

- Năm tín vật vẫn được thu thập nhưng ánh sáng chuyển dần thành màu đen.
- Các NPC đã từng đồng hành lần lượt rời khỏi trung tâm.
- Cổng Dòng Thời gian TVA mở ra nhưng phía sau chỉ là một quảng trường trống và câm lặng.
- Biểu tượng vẫn tồn tại, nhưng không còn người dân đứng quanh nó.

**Nội dung kết:**

Một tổ chức có thể tồn tại về hình thức, nhưng nếu quan liêu, tham nhũng và xa rời nhân dân, nó sẽ tự đánh mất nguồn sức mạnh đã làm nên những thắng lợi trước đó.

Thông điệp của ending không chỉ đặt câu hỏi về sự tồn tại của vai trò lãnh đạo, mà còn nhấn mạnh những điều kiện để vai trò ấy tiếp tục có ý nghĩa.

#### Quy tắc chung cho sáu bad ending

- Không kích hoạt vì một lần bấm nhầm.
- Có tín hiệu cảnh báo và điểm xác nhận trước khi khóa nhánh.
- Lưu chính xác nguyên nhân thất bại để chọn cinematic và lời kết đúng.
- Tận dụng cơ chế David phục hồi nhánh hiện có để cho phép quay lại checkpoint trước điểm quyết định sau khi ending đã được xem; cinematic và trạng thái phục hồi không được reset sai animation hoặc âm nhạc.
- Ghi ending đã mở vào bộ sưu tập.
- Không thay thế cinematic bằng ảnh tĩnh, khối màu hoặc văn bản dài trên nền trống.

### 57. Thêm neutral ending

Neutral ending xảy ra khi:

- Người chơi có đủ 5 tín vật.
- Không khóa một bad ending theo khu/chương.
- Tha hóa hoặc tổng hậu quả tiêu cực vẫn quá cao để đạt good ending.
- Người chơi chưa mất hoàn toàn lòng dân đến mức kích hoạt ending bí mật.

Kết thúc cho thấy dòng lịch sử đã được nối lại nhưng tương lai còn nhiều vết nứt. Một số NPC vẫn hiện diện, một số rời đi; tín vật sáng yếu hoặc không đồng bộ; Cổng Dòng Thời gian TVA mở nhưng không đạt trạng thái huy hoàng của good ending.

Ngưỡng cụ thể phải được đặt trong cấu hình cân bằng và kiểm thử, không hard-code rải rác trong runtime.

### 58. Thêm phần “Những gì có thể đã khác”

Sau ending, hiển thị một bản tổng kết gồm:

- Những điểm rẽ quan trọng người chơi đã gặp.
- Lựa chọn nào tạo hậu quả lớn.
- Những phương án khác có thể thử, nhưng không biến game thành bảng đáp án từ đầu.
- Phần phân biệt rõ lựa chọn gameplay, nhánh giả định và sự kiện lịch sử thật.
- Nút quay lại checkpoint trước điểm quyết định nếu save còn hợp lệ.
- Ending vừa mở và tiến độ bộ sưu tập ending.
- Liên kết tới codex và nguồn lịch sử liên quan.

## Trung tâm thế giới — 59–68

Trong roadmap mới, “trung tâm thế giới” là văn phòng TVA hiện có. Không tạo thêm một hub cạnh tranh với TVA; mọi phòng, cổng, trưng bày tín vật và trạng thái hậu truyện đều được bố trí như các khu chức năng của TVA.

### 59. Cho trung tâm thay đổi sau mỗi khu hoàn thành

- Mỗi tín vật được thu hồi phải tạo một thay đổi nhìn thấy hoặc nghe thấy được tại trung tâm.
- Ánh sáng, âm thanh, mật độ NPC, hoạt động môi trường và trạng thái Cổng Dòng Thời gian TVA thay đổi theo tiến trình.
- Trạng thái phải được lưu và khôi phục đúng sau khi tải lại game.
- Trung tâm không được trở về hình ảnh ban đầu khi người chơi đã hoàn thành một khu.

### 60. Trưng bày 5 tín vật quanh Cổng Dòng Thời gian TVA

- Có 5 vị trí cố định tương ứng La Bàn Đỏ, Huy hiệu thống nhất, Sợi Chỉ Đỏ Việt Minh, Bản đồ hàn gắn và Bánh răng Đổi Mới.
- Khu 3 đóng góp hai tín vật và hai vị trí riêng.
- Tín vật chưa có không được hiển thị như đã hoàn thành.
- Tín vật đã thu thập phải có animation, ánh sáng hoặc phản ứng môi trường thật.
- Trạng thái Tha hóa của tín vật phải được thể hiện nếu ending bí mật còn khả dụng.

### 61. Đưa NPC đã cứu hoặc thuyết phục về trung tâm

- NPC xuất hiện dựa trên cờ nhiệm vụ và lựa chọn thật của người chơi.
- NPC có vị trí, chuyển động và hội thoại hậu nhiệm vụ phù hợp.
- NPC bị bỏ lại, mất niềm tin hoặc thuộc một nhánh thất bại không được xuất hiện như đã cứu.
- Không dùng sprite tĩnh hoặc khối màu làm đại diện tạm thời.
- David có lời thoại nhận xét riêng khi một NPC mới xuất hiện, vắng mặt hoặc mất niềm tin; lời thoại không thay thế thay đổi hình ảnh thật trong TVA.

### 62. Thêm bảng nhiệm vụ theo khu và chương

- Hiển thị khu chưa vào, đang làm, hoàn thành hoặc có điểm rẽ chưa giải quyết.
- Khu 3 phải tách tiến độ Chương A và Chương B.
- Chỉ hiển thị mục tiêu người chơi đã biết; không tiết lộ trước lựa chọn hoặc ending.
- Cho phép chọn một mục tiêu làm mục tiêu theo dõi trên HUD/minimap.

### 63. Thêm phòng ký ức

- Cho phép nghe lại nhạc đã mở.
- Xem tranh lịch sử, trang ký ức tín vật và cinematic đã mở.
- Xem lại hội thoại quan trọng và ending đã đạt.
- Nội dung chưa mở phải có trạng thái khóa rõ nhưng không tiết lộ hình ảnh hoặc văn bản chính.
- Phòng ký ức là một khu chức năng của TVA, dùng asset hoàn chỉnh và animation phù hợp, không phải gallery ảnh tĩnh thô sơ.

### 64. Thêm phòng luyện tập

- Cho phép thử đòn đánh thường, kỹ năng, parry và phản đòn.
- Có mục tiêu luyện tập không ảnh hưởng Tha hóa, máu hoặc tiến trình chính.
- Hướng dẫn timing bằng tín hiệu hình ảnh và âm thanh rõ ràng.
- Cho phép reset bài tập ngay và rời phòng an toàn.
- Phòng luyện tập nằm trong TVA và tái sử dụng combat runtime thật; không tạo một bộ điều khiển chiến đấu thứ hai chỉ dành cho tutorial.

### 65. Cổng từng khu phản ánh trạng thái

- Dùng màu kết hợp biểu tượng cho các trạng thái chưa vào, đang làm, hoàn thành và có nhánh nguy hiểm.
- Hiển thị title card thời gian khi người chơi tương tác hoặc đi qua cổng.
- Không chỉ dựa vào màu để truyền đạt trạng thái.
- Animation cổng phải ổn định, không jitter và không ảnh hưởng collider.

### 66. Tạo chuỗi animation khi đủ 5 tín vật

- Năm tín vật phản ứng theo thứ tự và hội tụ về Cổng Dòng Thời gian TVA.
- Ánh sáng, âm nhạc và môi trường trung tâm chuyển lớp dần thay vì đổi đột ngột.
- Chuỗi animation phản ánh trạng thái bình thường, trung tính hoặc Tha hóa.
- Cho phép bỏ qua sau lần xem đầu tiên nhưng vẫn cập nhật trạng thái chính xác.

### 67. Cho Cổng Dòng Thời gian TVA phản ứng với Tha hóa và lựa chọn

- Cổng thay đổi ánh sáng, âm thanh, vết nứt và nhịp chuyển động theo tiến trình.
- Trạng thái cổng không được tiết lộ chính xác ending trước điểm quyết định.
- Bộ phân giải ending dùng cùng dữ liệu với hình ảnh cổng để tránh mâu thuẫn.
- Debug overlay phải giải thích được vì sao cổng đang ở trạng thái hiện tại.

### 68. Tạo trung tâm hậu truyện sau ending

- Sau good, neutral hoặc từng bad ending, trung tâm chuyển sang epilogue tương ứng.
- NPC, tín vật, âm thanh, ánh sáng và Cổng Dòng Thời gian TVA phản ánh ending vừa đạt.
- Người chơi có thể xem nội dung đã mở, chọn chơi lại hoặc quay về checkpoint nếu được phép.
- Không reset âm thầm về trạng thái trước ending.

## Giao diện và khả năng tiếp cận — 69–82

### 69. Tách âm lượng nhạc, hiệu ứng và hội thoại

- Giữ nút mute tổng đang hoạt động và mở rộng từ `soundMuted`; không làm mất khả năng tiếp tục nhạc đúng vị trí đã có.
- Có thanh riêng cho Music, SFX và Dialogue/Voice.
- Giữ nút tắt/bật âm thanh tổng.
- Lưu thiết lập giữa các phiên chơi.
- Thay đổi âm lượng áp dụng ngay mà không khởi động lại bài nhạc.

### 70. Thêm phụ đề cho âm thanh quan trọng

- Phụ đề cho chuông Thời cơ, tiếng cổng, cảnh báo boss, tín hiệu ngoài màn hình và lời thoại có âm thanh.
- Mô tả ngắn nguồn và hướng tương đối khi cần thiết.
- Cho phép bật/tắt độc lập với hội thoại văn bản.

### 71. Cho phép đổi phím điều khiển

- Hỗ trợ di chuyển, tương tác, tấn công, parry, kỹ năng, minimap, pause và sổ tay.
- Phát hiện xung đột phím trước khi lưu.
- Có nút khôi phục mặc định.
- Prompt trong game phải tự cập nhật theo phím mới.

### 72. Thêm tùy chọn giảm rung và chớp

- Tách hoặc nhóm rõ camera shake, screen flash và glitch Tha hóa.
- Chế độ reduced motion làm yếu hoặc tắt các hiệu ứng gây khó chịu nhưng vẫn giữ tín hiệu gameplay.
- Không được làm mất telegraph cần thiết của boss hoặc parry.

### 73. Thêm chế độ chữ lớn

- Áp dụng cho HUD quan trọng, hội thoại, visual novel, title card, codex và ending.
- Bố cục phải reflow thay vì phóng to làm tràn khung.
- Kiểm tra ở viewport nhỏ và tỷ lệ zoom trình duyệt phổ biến.

### 74. Dùng màu kết hợp biểu tượng

- Portal, nhiệm vụ, lựa chọn và trạng thái ending phải có cả màu, icon và/hoặc nhãn.
- Không truyền thông tin bắt buộc chỉ bằng đỏ–xanh.
- Kiểm tra độ tương phản và khả năng đọc ở minimap lẫn HUD chính.

### 75. Làm thanh máu boss rõ hơn

- Hiển thị tên, máu, pha chiến đấu và trạng thái dễ đọc.
- Thanh máu không che khuất vùng chiến đấu hoặc minimap.
- Telegraph chuyển pha dùng thêm biểu tượng/animation, không chỉ đổi màu.

### 76. Thêm tooltip giải thích Tha hóa

- Giải thích Tha hóa tăng vì loại hành động nào và ảnh hưởng tổng quát đến thế giới.
- Không tiết lộ chính xác điều kiện ending bí mật.
- Hỗ trợ bàn phím, chuột và cảm ứng.
- Nội dung thay đổi nếu người chơi đã mở mục codex liên quan.

### 77. Pause game thật sự khi mở UI chặn gameplay

- Mở rộng `scene-controller` và `page-lifecycle` hiện có; không tạo thêm biến pause độc lập cạnh tranh với `state.mode`.
- Menu, codex, visual novel, màn lựa chọn và modal quan trọng phải dừng simulation phù hợp.
- Xóa trạng thái phím giữ khi mở/đóng UI để tránh khóa hướng di chuyển.
- Âm thanh nền giảm hoặc tạm dừng theo loại scene mà không reset vị trí phát.
- Đóng UI phải khôi phục đúng scene trước đó.

### 78. Xác nhận trước hành động làm mất tiến trình

- Restart, xóa save và quay về checkpoint cũ phải có mô tả phần tiến trình sẽ mất.
- Nút mặc định không được là hành động phá hủy.
- Hỗ trợ bàn phím và focus rõ ràng.

### 79. Thêm điều khiển cảm ứng nếu tiếp tục hỗ trợ điện thoại

- Joystick và nút hành động không che HUD, minimap hoặc hội thoại.
- Có vùng chạm đủ lớn và phản hồi nhấn rõ.
- Chỉ tải/hiển thị khi thiết bị phù hợp hoặc người chơi bật thủ công.
- Nếu không thể bảo đảm chất lượng, ghi rõ desktop-first thay vì cung cấp điều khiển cảm ứng nửa vời.

### 80. Cho phép tùy biến minimap

- Giữ renderer minimap và hệ tọa độ hiện tại làm nền; bổ sung cấu hình hiển thị thay vì vẽ một minimap thứ hai trong UI.
- Có thể ẩn, hiện, thu nhỏ, phóng to và thay đổi độ trong.
- Lưu thiết lập.
- Các icon quan trọng vẫn dễ phân biệt ở mọi kích thước hỗ trợ.
- Minimap không được bắt input di chuyển khi người chơi đang thao tác UI.

### 81. Thêm loading screen có nội dung hữu ích

- Mở rộng overlay loading/retry theo asset group hiện có.
- Hiển thị mẹo chơi theo khu/chương và dữ kiện lịch sử đã kiểm chứng.
- Không tiết lộ nội dung chưa mở.
- Loading screen phản ánh tiến trình tải thật và có trạng thái retry khi asset lỗi.
- Dữ kiện lịch sử phải trỏ tới nguồn trong codex.

### 82. Thông báo khi trình duyệt chặn âm thanh

- Tái sử dụng cơ chế cảnh báo tải audio và resume audio hiện có, nhưng tách rõ lỗi tải file với trường hợp trình duyệt chặn autoplay.
- Hiển thị hướng dẫn ngắn, dễ hiểu và nút thử bật lại.
- Không chặn người chơi vào game chỉ vì audio không phát.
- Khi người chơi tương tác, tiếp tục nhạc đúng vị trí logic thay vì luôn bắt đầu lại.

## Hình ảnh và cảm giác chuyển động — 83–94

### 83. Bổ sung animation nhân vật đầy đủ

- Giữ toàn bộ bộ sprite player và quái chuyên biệt Khu 1–4 đã tích hợp; hạng mục còn lại tập trung vào NPC, David, trạng thái parry/skill thiếu và các animation mới do cốt truyện yêu cầu.
- Player và các NPC/địch cần thiết có idle, walk/run, attack, hurt, death, parry và skill phù hợp vai trò.
- Các frame dùng chung canvas, tỷ lệ, pixel density và bottom-center anchor ổn định.
- Không dùng ảnh đứng yên giả làm chuyển động.
- Kiểm tra loop ở kích thước thật trong game.

### 84. Khớp hướng tấn công với hướng nhìn

- Bảo toàn routing sprite hướng và projectile/parry reflect hiện có; mọi nhân vật hoặc kỹ năng mới phải đi qua cùng quy ước facing.
- Hitbox, hiệu ứng, projectile và sprite phải cùng hướng.
- Chuyển hướng giữa lúc giữ phím không tạo hitbox sai hoặc animation ngược.
- Có test cho bốn hướng và trường hợp nhấn nhiều phím.

### 85. Thêm bóng dưới nhân vật và NPC

- Bóng thống nhất theo góc nhìn, tỷ lệ và độ cao giả lập.
- Bóng thay đổi hợp lý khi nhảy/knockback hoặc bị che khuất.
- Không dùng bóng quá đậm làm bẩn pixel art.

### 86. Thêm hiệu ứng bước chân theo bề mặt

- Phân biệt bùn/đất, đá, nước và cỏ bằng particle nhỏ và âm thanh.
- Đồng bộ với frame đặt chân, không phát theo timer độc lập gây lệch.
- Giới hạn số particle và âm thanh để không ảnh hưởng hiệu năng.

### 87. Làm môi trường chuyển động thật

- Cây, cờ, khói, lửa, mưa, nước và máy móc dùng sprite animation, particle hoặc chuyển động phù hợp renderer.
- Focal landmark và vật thể tương tác không được thay bằng Canvas shape giả animation.
- Chuyển động phải tinh tế, không làm người chơi khó đọc chiến đấu.

### 88. Thêm parallax nhẹ

- Dùng cho bầu trời, sương hoặc cảnh xa nơi phù hợp.
- Giữ mức rất nhẹ để không phá góc nhìn top-down và không gây say chuyển động.
- Reduced motion phải giảm hoặc tắt parallax.

### 89. Nâng cấp chuyển màn qua portal

- Kết hợp fade, time-warp, âm thanh và title card thời gian.
- Khóa input trong đúng khoảng chuyển cảnh rồi giải phóng sạch.
- Không để player va chạm hoặc nhận sát thương khi scene chưa sẵn sàng.
- Preload asset cần thiết trước khi hoàn tất transition.

### 90. Thêm portrait visual novel

- Tối thiểu gồm David trong vai Người giữ thời gian/điều phối viên TVA và các NPC/nhân chứng quan trọng.
- Mỗi nhân vật có silhouette, palette và một số biểu cảm nhất quán.
- Portrait phải cùng phong cách pixel, bối cảnh và văn hóa của game.
- Nếu asset chưa đạt chất lượng, không dùng portrait tĩnh chung chung làm bản phát hành.

### 91. Tạo nhận diện riêng cho NPC quan trọng

- Dùng silhouette, trang phục, phụ kiện và bảng màu riêng.
- Thiết kế phải phù hợp giai đoạn lịch sử hoặc được giải thích rõ nếu là nhân vật hư cấu.
- Không dựa vào màu da, định kiến vùng miền hoặc biểu tượng ngoại lai để phân vai.

### 92. Làm vật phẩm nhiệm vụ nổi bật tự nhiên

- Dùng animation, ánh sáng, phản xạ môi trường hoặc chuyển động nhỏ.
- Không dùng khối chữ nhật, màu neon thô hoặc nhãn chữ giữa thế giới.
- Mức nổi bật phải tăng khi người chơi ở gần hoặc đang theo dõi mục tiêu.

### 93. Thêm hiệu ứng màn hình theo Tha hóa

- Tăng dần theo ngưỡng nhưng có giới hạn cường độ.
- Kết hợp vignette, sai lệch màu nhẹ, âm thanh hoặc biến đổi môi trường thay vì rung liên tục.
- Hỗ trợ reduced motion và bảo đảm HUD vẫn đọc được.

### 94. Làm cinematic ending theo dữ liệu hành trình

- Mở rộng cinematic good/bad và overlay animation hiện có thành hệ thống dữ liệu cho tám ending; không bỏ cơ chế David phục hồi bad ending đã ổn định.
- Có cinematic cho good, neutral và sáu bad ending.
- Tái sử dụng cảnh, NPC, tín vật và trạng thái thật từ lượt chơi.
- Mỗi cinematic có chuyển động nhân vật, môi trường, camera và âm thanh phù hợp.
- Không dùng ảnh tĩnh, rectangle hoặc văn bản dài trên nền trống làm cảnh kết.
- Cho phép bỏ qua sau lần xem đầu và xem lại trong phòng ký ức.

## Khả năng chơi lại — 95–104

### 95. Chấm điểm cuối game

- Tính theo tín vật, Tha hóa, NPC đã cứu, lựa chọn, thời gian và phương pháp giải quyết.
- Điểm phải giải thích được bằng các hạng mục rõ ràng.
- Không khuyến khích speedrun nếu điều đó làm người chơi bỏ qua nội dung lịch sử bắt buộc.

### 96. Thêm achievement theo lối chơi

- Thành tích cho hòa giải, bảo vệ dân thường, parry, hoàn thành ít Tha hóa và khám phá codex.
- Achievement không được thưởng cho hành vi mâu thuẫn thông điệp lịch sử chỉ để tạo độ khó.
- Hiển thị tiến độ khi phù hợp nhưng không tiết lộ ending bí mật.

### 97. Thêm New Game+

- Quái mạnh hơn hoặc có hành vi mới ở mức hợp lý.
- Mở hội thoại bổ sung, lựa chọn hoặc góc nhìn mới thay vì chỉ tăng máu địch.
- Giữ bộ sưu tập/codex phù hợp nhưng reset tiến trình cốt truyện cần thiết.
- Save phải phân biệt lượt chơi thường và New Game+.

### 98. Cho phép chọn lại khu/chương sau khi hoàn thành

- Cho chọn Khu 1, Khu 2, Khu 3A, Khu 3B và Khu 4.
- Nêu rõ chơi lại có ghi đè trạng thái campaign hiện tại hay chạy trong chế độ ký ức.
- Mặc định ưu tiên chế độ ký ức không phá save chính.

### 99. Thêm challenge tùy chọn

- Không bị đánh trúng.
- Không vượt ngưỡng Tha hóa.
- Hạn chế bạo lực khi có thể thuyết phục.
- Nắm đúng thời cơ ở Khu 3A.
- Challenge phải có luật, tiến độ và điều kiện thất bại rõ.

### 100. Thêm bộ sưu tập ending

- Tối thiểu 8 ending: 1 good, 1 neutral, 5 bad theo khu/chương và 1 bad Tha hóa bí mật.
- Ending đã mở có tên, hình đại diện động hoặc preview phù hợp, nguyên nhân tổng quát và ngày mở.
- Ending chưa mở không tiết lộ toàn bộ điều kiện.
- Bộ sưu tập được lưu bền vững qua New Game và New Game+ theo quyết định thiết kế đã chốt.

### 101. Thêm codex quái và boss

- Ghi silhouette, hành vi, khu vực, telegraph và ghi chú chủ đề.
- Chỉ mở sau khi gặp hoặc đánh bại theo điều kiện.
- Không biến quái hư cấu thành dữ kiện lịch sử có thật.

### 102. Thêm vật phẩm bí mật sau lượt đầu

- Vật phẩm mở thêm góc nhìn, hội thoại hoặc thử thách chứ không sửa nội dung lịch sử chính.
- Vị trí và điều kiện phải công bằng, có dấu hiệu khám phá.
- Không khóa good ending cơ bản sau nội dung New Game+.

### 103. Random nhẹ vật phẩm phụ

- Chỉ random vật phẩm phụ, tài nguyên hoặc vị trí tương tác không thiết yếu.
- Không random sự kiện lịch sử, tín vật chính, thứ tự bắt buộc hoặc nguồn kiến thức.
- Seed phải được lưu nếu cần tái hiện và debug.

### 104. Thêm thống kê cuối game

- Timeline lựa chọn.
- NPC đã cứu, thuyết phục hoặc bỏ lỡ.
- Tỷ lệ chiến đấu/thuyết phục.
- Tha hóa cao nhất và cuối cùng.
- Ending, thời gian và challenge.
- Gợi ý điểm rẽ có thể thử lại mà không đưa đáp án sẵn từ đầu.

## Nền tảng kỹ thuật — 105–118

> Các mục 105–118 đã có nền tảng trên `main`. Nội dung dưới đây ghi tiêu chí đầy đủ và phần mở rộng cần thiết để hỗ trợ roadmap hợp nhất, không phủ nhận những commit đã hoàn thành.

### 105. Tiếp tục tách runtime theo trách nhiệm

- `src/runtime/game-runtime.js` vẫn lớn hơn 10.000 dòng tại lần rà soát này. Chỉ tách các phần story, dialogue, ending, save bridge và UI state khi đợt 2–3 cần chỉnh trực tiếp các phần đó.
- `game.js` tiếp tục chỉ là entrypoint composition.
- Phần runtime còn lớn cần dần tách story, dialogue, ending, combat, UI và rendering khi các tính năng tương ứng được triển khai.
- Không refactor lan rộng nếu không phục vụ task đang làm.
- Mỗi module có API rõ và test độc lập.

### 106. Dữ liệu hóa nội dung

- Dữ liệu mới phải mở rộng các module `src/data/` hiện có và không tạo một kho nội dung song song khó đồng bộ.
- Quest, NPC, hội thoại, lựa chọn, title card, chronology, nguồn lịch sử và điều kiện ending nằm trong các module dữ liệu phù hợp.
- Không hard-code nội dung mới rải rác trong `game-runtime.js`.
- Schema phải hỗ trợ điều kiện, biến thể, hậu quả và migration.
- Nội dung tiếng Việt được kiểm tra UTF-8 và thuật ngữ nhất quán.

### 107. Mở rộng scene system

- Dùng `src/core/scene-controller.js` hiện có làm nguồn chuyển trạng thái thống nhất.
- Hỗ trợ start, cinematic opening, zone intro, playing, dialogue/visual novel, choice, paused, modal và ending.
- Chuyển scene phải xác định rõ input, simulation, audio và focus UI nào đang hoạt động.
- Không dùng gán `state.mode` tùy tiện ngoài controller được thống nhất.

### 108. Duy trì asset manager theo nhóm

- Giữ asset manager và các nhóm core/hub/khu đang hoạt động; đăng ký thêm portrait, title card và cinematic vào đúng nhóm.
- Nhóm asset theo core, hub, từng khu, portrait và cinematic.
- Có trạng thái loading, success, failure và retry.
- Giới hạn tải đồng thời phù hợp trình duyệt.
- Asset mới phải được đăng ký trước khi runtime tham chiếu.

### 109. Phục hồi asset lỗi mà không dùng fallback xấu

- Giữ màn retry/chặn scene hiện có cho asset bắt buộc và mở rộng cùng quy tắc sang portrait/cinematic.
- Ảnh hoặc sprite quan trọng lỗi phải giữ người chơi ở màn phục hồi có retry.
- Audio lỗi không chặn gameplay nhưng phải có hướng dẫn và cơ chế thử lại.
- Không dựng rectangle, static placeholder hoặc sprite không liên quan để giả vờ asset đã tải.
- Ghi rõ asset nào lỗi trong debug và log.

### 110. Preload khu/chương tiếp theo

- `ensureLevelAssets` hiện tải theo khu khi chuyển cảnh; hạng mục này bổ sung preload dự đoán sau khi luồng chapter/title card được chốt, không thay cơ chế tải theo nhóm.
- Preload theo hướng di chuyển hoặc mục tiêu tiếp theo, không tải toàn bộ game ngay đầu.
- Bao gồm asset title card, portrait và cinematic sắp dùng.
- Không làm giật khung hình hoặc tranh băng thông với asset khu hiện tại.

### 111. Tạm dừng runtime khi tab bị ẩn

- Nền `page-lifecycle` đã xử lý blur/visibility và resume audio; tiếp tục bổ sung regression test khi visual novel, choice và cinematic mới được thêm.
- Dừng update/render không cần thiết và suspend looping audio.
- Xóa input giữ khi blur/visibility change.
- Khi trở lại, không nhảy delta-time, không khóa hướng và không reset nhạc sai.

### 112. Mở rộng regression tests

- Giữ toàn bộ unit/E2E hiện có làm baseline; mỗi đợt 2–4 phải thêm test trước khi thay behavior.
- Chuyển khu/chương.
- Checkpoint và save/load.
- Lựa chọn và hậu quả.
- Đồng hồ Thời cơ.
- Good, neutral và sáu bad ending.
- Không mở khóa hình ảnh hoặc epilogue trước điều kiện.
- Held input, key release, blur, visibility, pause/modal và scene reload.
- Canvas-heavy changes luôn có browser screenshot/playtest bổ sung.

### 113. Mở rộng debug overlay

- Mở rộng `src/debug/debug-overlay.js` hiện có, không tạo overlay debug thứ hai.
- FPS, vị trí, collider, scene và nhiệm vụ.
- Branch flags, lựa chọn, Tha hóa và biến chủ đề.
- Bộ đếm Thời cơ.
- Trạng thái asset/audio.
- Lý do ending resolver chọn hoặc loại từng ending.
- Overlay không được ảnh hưởng input hoặc save chính.

### 114. Duy trì hệ tọa độ chuẩn

- Giữ `src/rendering/coordinate-system.js` và minimap renderer hiện có làm nguồn chuyển đổi chuẩn.
- Camera zoom không làm sai collider, minimap hoặc tương tác.
- Dùng chuyển đổi world/screen nhất quán cho portrait overlay, cinematic, hitbox và debug.
- Không nhân/chia zoom rải rác trong từng renderer.

### 115. Tách cân bằng thành cấu hình

- Giữ `GAMEPLAY_BALANCE` bất biến hiện có; bổ sung ngưỡng lựa chọn, ending và Đồng hồ Thời cơ vào cấu hình có schema/test thay vì quay lại hằng số rải rác.
- Tốc độ, sát thương, boss, Tha hóa, điểm lựa chọn, ngưỡng ending và Đồng hồ Thời cơ nằm trong config.
- Config là nguồn sự thật duy nhất, không bị runtime mutate.
- Test xác nhận ngưỡng hợp lệ và không tạo ending bất khả thi.

### 116. Nén ảnh và âm thanh

- Dùng script audit/optimize hiện có làm baseline và ghi số liệu trước/sau cho asset mới của visual novel/cinematic.
- Tối ưu sprite sheet, portrait, cinematic art, background và audio mà không phá pixel art hoặc tạo artifact nghe thấy rõ.
- Giữ source cần thiết theo quy tắc asset của dự án.
- Audit kích thước trước/sau và thời gian tải trên kết nối chậm.

### 117. Version hóa save, content và cache

- Save hiện tại mới chấp nhận đúng version và chưa có migration đầy đủ. Đợt 2 phải tạo migration cho schema lựa chọn–hậu quả trước khi dữ liệu mới được ghi vào save thật.
- Build version gắn vào asset URL hoặc cơ chế cache hiện có.
- Save có version và migration cho branch flags, ending collection, settings và New Game+.
- Save cũ không hợp lệ phải được xử lý rõ, không crash hoặc âm thầm gán trạng thái sai.

### 118. Dọn asset và cập nhật nguồn

- Giữ `ASSET_SOURCES.md`, media-source data và script audit hiện có; cập nhật ledger trong cùng commit với asset mới.
- Phát hiện asset không dùng và tham chiếu bị thiếu.
- Chỉ xóa sau khi xác nhận không phải source, license hoặc asset được tải động.
- Ghi nguồn, tác giả, license, chỉnh sửa và mục đích sử dụng vào `ASSET_SOURCES.md`.
- Ghi nguồn lịch sử cho nội dung mới tại ledger phù hợp.
- Không nhập asset mạng nếu chưa xác nhận quyền sử dụng tương thích.

## 8. Phụ thuộc triển khai về sau

Các mục 43–58 sẽ cần phối hợp trực tiếp với các nhóm 59–118 khi đội dự án chốt thiết kế:

- Portrait và sprite animation cho David, NPC và cinematic.
- Scene cho opening, title card, visual novel, choice và ending.
- Dữ liệu cấu hình cho hội thoại, lựa chọn, niên đại, nguồn và điều kiện ending.
- Save migration để lưu branch flags mà không phá save cũ.
- Ending resolver có thể giải thích kết quả bằng dữ liệu debug.
- Asset manager và preload cho portrait, âm thanh và cinematic.
- Test tự động và playtest trình duyệt cho lựa chọn, checkpoint, save/load, từng ending và trạng thái hình ảnh.

Những phụ thuộc này đã được ghi thành các mục riêng trong roadmap 43–118; khi triển khai vẫn cần chia thành các đợt nhỏ, có thể kiểm thử và review độc lập.

## 9. Tiêu chí chất lượng và kiểm thử

Trước khi coi roadmap 43–118 hoàn thành, ngoài tiêu chí riêng của từng mục, tối thiểu phải xác nhận:

- Opening giới thiệu rõ David trong vai Người giữ thời gian/điều phối viên TVA, 5 tín vật và tính chất nhánh thời gian.
- Mỗi cổng hiện đúng tên, khoảng thời gian và câu hỏi lịch sử của khu/chương.
- Nội dung lịch sử và nội dung giả định được phân biệt trực quan.
- Hội thoại ngắn không cản trở gameplay; visual novel chỉ xuất hiện ở các điểm quan trọng.
- Không còn lời thoại, portrait, sprite, cinematic hoặc môi trường fallback xấu.
- Khu 3A và 3B lưu trạng thái độc lập.
- Khu 4 trình bày đúng quan hệ thời gian giữa Đại hội VI năm 1986 và Khoán 10 năm 1988.
- Một lựa chọn đơn lẻ không vô tình kích hoạt bad ending.
- Good, neutral và sáu bad ending được bộ phân giải chọn đúng theo dữ liệu đã lưu.
- Save/load giữ nguyên lựa chọn, Tha hóa, tín vật và khả năng đạt ending.
- Quay lại checkpoint không làm rò rỉ cờ ending hoặc mở khóa nội dung sớm.
- Mỗi ending có cinematic động, âm thanh, nội dung, câu kết và tổng kết phù hợp nguyên nhân.
- Canvas-heavy changes được kiểm tra bằng screenshot và playtest thật, không chỉ DOM assertion.
- Nội dung tiếng Việt không có mojibake, lỗi dấu hoặc thuật ngữ không nhất quán.
- Tất cả nguồn lịch sử và nguồn asset mới được ghi vào ledger phù hợp.

## 10. Thứ tự thiết kế và triển khai đề xuất

Roadmap 43–118 chứa nhiều hệ thống độc lập và phụ thuộc chéo, không được triển khai cả khối trong một commit hoặc một đợt duy nhất. Bốn đợt dưới đây là thứ tự ưu tiên; mỗi đợt phải có đặc tả riêng, test riêng và cổng duyệt trước khi chuyển tiếp.

### Đợt 1 — Chốt nền kể chuyện và lịch sử

**Mục tiêu:** Loại bỏ mâu thuẫn giữa PLAN cũ với opening TVA hiện tại và tạo một narrative bible đủ rõ để nội dung không phải viết lại khi vào runtime.

- Chốt David là Người giữ thời gian/điều phối viên TVA cố định; giữ nhận diện và sprite hiện có làm mốc, không tạo người dẫn truyện thứ hai.
- Chốt vai trò Nhà du hành, động cơ trở về nhà, giới hạn can thiệp của TVA và quan hệ giữa David với năm tín vật.
- Chốt title card, mốc thời gian, câu hỏi trung tâm và thuật ngữ cho Khu 1, Khu 2, Khu 3A, Khu 3B và Khu 4.
- Giữ nguyên và dùng phần **Kiểm chứng và hiệu chỉnh lịch sử** của tài liệu này làm baseline; mọi thay đổi câu chữ kiến thức phải được đối chiếu nguồn trước khi duyệt.
- Tách rõ ba lớp `sự kiện lịch sử`, `biểu tượng gameplay` và `nhánh giả định` cho từng khu/chương.
- Lập ma trận lựa chọn–hậu quả Khu 1, bao gồm cảnh báo, điểm xác nhận, nguy cơ bad ending 56.1 và khả năng sửa sai hợp lý.
- Xác nhận quy tắc bad ending là một “nhánh gãy” có cảnh báo, cinematic và phục hồi về checkpoint qua David; đồng thời chốt các quyết định còn mở ảnh hưởng trực tiếp tới vertical slice như mức công khai biến chủ đề, thời lượng opening/visual novel/cinematic và quy trình duyệt nội dung.

**Đầu ra bắt buộc:** narrative bible; bảng chronology/title card; glossary; source ledger lịch sử; ma trận lựa chọn–hậu quả Khu 1; danh sách nội dung và asset cần sản xuất. Đợt này chưa thay behavior runtime ngoài các sửa lỗi dữ kiện hiển nhiên đã được duyệt.

### Đợt 2 — Xây nền dữ liệu lựa chọn, save và ending

**Mục tiêu:** Biến các quyết định rời rạc hiện có thành hệ thống dữ liệu có thể lưu, giải thích và kiểm thử trước khi viết thêm nhánh nội dung.

- Thiết kế schema cho hội thoại có điều kiện, `choices`, `branchFlags`, `npcRelations`, `themeScores`, `endingRisks`, title card, chronology và nguồn lịch sử.
- Nâng version save và viết migration giữ nguyên save hiện tại; không xóa tiến trình người chơi chỉ vì thêm schema mới.
- Tạo ending resolver dữ liệu hóa, trả được ending được chọn, điều kiện thỏa, điều kiện bị loại và nguyên nhân dùng cho debug/tổng kết.
- Mở rộng scene controller cho zone intro, visual novel, choice và ending mà không tạo thêm nguồn `state.mode` cạnh tranh.
- Đưa ngưỡng lựa chọn, Tha hóa, ending và Đồng hồ Thời cơ vào cấu hình cân bằng bất biến.
- Mở rộng debug overlay để xem branch flags, quan hệ NPC, điểm chủ đề, ending risk và lời giải thích từ resolver.
- Viết regression test cho schema, migration, save/load, rollback checkpoint, ending resolver và trường hợp một lựa chọn đơn lẻ không khóa bad ending.
- Chỉ tách phần story/dialogue/ending khỏi `game-runtime.js` khi việc tách trực tiếp phục vụ các interface trên; không refactor toàn bộ runtime trong đợt này.

**Đầu ra bắt buộc:** module dữ liệu có schema rõ; save migration; ending resolver; scene bridge; debug state; unit test xanh. Chưa tích hợp hàng loạt nội dung Khu 2–4.

### Đợt 3 — Hoàn thiện vertical slice Khu 1

**Mục tiêu:** Chứng minh toàn bộ vòng lặp kể chuyện mới bằng một khu hoàn chỉnh trước khi nhân rộng.

- Hoàn thiện opening TVA/David và title card Khu 1 theo trọng tâm 1922–1929.
- Viết hội thoại gameplay ngắn, visual novel tại bước ngoặt, portrait/biểu cảm cần thiết và lịch sử hội thoại.
- Cho nhiệm vụ Khu 1 có nhiều cách xử lý thực sự: truyền báo, bảo vệ/hỗ trợ công nhân, đối thoại hoặc chọn lợi ích cá nhân; mỗi cách có chi phí và hậu quả riêng.
- Đưa phản ứng hậu quả vào NPC, môi trường, âm thanh, tín vật và lời David khi trở về TVA.
- Thay kích hoạt bad ending trực tiếp bằng chuỗi nguy cơ và điểm xác nhận cho **56.1 — Con tàu không la bàn**.
- Giữ cinematic động, nhạc ending và luồng phục hồi David hiện có, nhưng chọn nội dung theo nguyên nhân thất bại đã lưu.
- Thêm phần “Những gì có thể đã khác” cho Khu 1, liên kết codex, nguồn lịch sử và checkpoint hợp lệ.
- Sản xuất mọi portrait, sprite, effect hoặc cinematic cần thiết theo pipeline animation chuẩn; không dùng ảnh tĩnh/hình khối/fallback xấu.
- Test save/load ở từng điểm rẽ, portal khóa/mở, held input, blur, pause/modal, audio resume, bad-ending recovery và reload scene.

**Cổng duyệt:** automated tests xanh; screenshot và browser playtest chứng minh lựa chọn dễ hiểu, hậu quả nhìn/nghe thấy được, bad ending công bằng và không có fallback xấu. Không mở rộng nội dung sang Khu 2 nếu vertical slice chưa đạt cổng này.

### Đợt 4 — Playtest, hiệu chỉnh và mở rộng toàn roadmap

**Mục tiêu:** Dùng vertical slice đã duyệt làm mẫu dữ liệu và chất lượng cho các khu còn lại, rồi hoàn thiện các nhóm trải nghiệm phụ thuộc vào hệ ending.

1. Playtest Khu 1 với người chơi thật hoặc test charter rõ ràng; chỉnh nhịp hội thoại, độ rõ cảnh báo, mức công bằng và độ dài cinematic.
2. Mở rộng schema/nội dung sang Khu 2 và bad ending 56.2.
3. Tách Khu 3 thành Chương A 1941–1945 và Chương B 1954–1975; triển khai Đồng hồ Thời cơ, bad ending 56.3 và 56.4 độc lập.
4. Chỉnh Khu 4 theo chuỗi 1986–1988 và triển khai bad ending 56.5 thay cho kết thúc đột ngột không gắn chặt với chủ đề đổi mới.
5. Hoàn thiện bad ending bí mật 56.6, neutral ending, good ending biến thể và cinematic theo dữ liệu hành trình.
6. Hoàn thiện codex, timeline, năm trang ký ức và phần “Những gì có thể đã khác”.
7. Nâng cấp trung tâm TVA 59–68 dựa trên dữ liệu lựa chọn và ending đã ổn định.
8. Triển khai UI/accessibility 69–82 theo từng cụm độc lập có test; ưu tiên audio settings, true pause, reduced motion, chữ lớn và minimap settings trước touch controls.
9. Bổ sung portrait, NPC, môi trường, quest item và cinematic còn thiếu trong 83–94 theo sprite pipeline chuẩn; giữ các bộ player/quái đã đạt chất lượng.
10. Chỉ triển khai replayability 95–104 sau khi ending resolver, ending collection và save migration đã ổn định.
11. Mở rộng 105–118 đúng lúc từng feature cần; không dùng roadmap kỹ thuật làm lý do trì hoãn giá trị chơi được.
12. Chạy toàn bộ automated tests, browser playtest, screenshot regression, asset audit, kiểm tra UTF-8, nguồn lịch sử và license asset sau mỗi cụm.

Chỉ đánh dấu roadmap hoàn thành sau khi kiểm kê từng số 43–118 bằng bằng chứng test, asset và trải nghiệm thực tế.

## 11. Quyết định dự án đã chốt và còn mở

### Quyết định đã chốt

- David là nhân vật cố định, đảm nhiệm vai trò Người giữ thời gian/điều phối viên TVA và là người dẫn truyện chính.
- Không tạo thêm một Người giữ thời gian thứ hai hoặc thay hình thức nhân vật dẫn truyện theo từng thời đại.
- Giữ văn phòng TVA hiện có làm trung tâm thế giới; Cổng Dòng Thời gian TVA thay cho khái niệm Cánh Cửa Lịch Sử tách biệt trong bản PLAN cũ.
- Giữ kiến trúc Canvas 2D, bốn khu, năm tín vật và hai chương độc lập của Khu 3.
- Sprite/nhận diện David hiện có là baseline; nâng cấp sau này phải giữ khả năng nhận diện và vai trò đã chốt.
- Bad ending theo khu là một “nhánh gãy”: chỉ khóa sau chuỗi lựa chọn và điểm xác nhận, phát cinematic tương ứng, ghi nhận ending đã mở rồi để David đưa người chơi về checkpoint hợp lệ trước điểm quyết định.

### Quyết định còn mở

- Mức độ công khai của các biến đoàn kết, thời cơ, thống nhất và đổi mới.
- Thời lượng tối đa cho opening, visual novel quan trọng và mỗi ending cinematic.
- Phạm vi lồng tiếng hoặc âm thanh giọng tượng trưng.
- Cách đội nội dung muốn duyệt câu chữ lịch sử và các nhánh giả định trước khi tích hợp.
- Phạm vi hỗ trợ điện thoại và có triển khai mục 79 trong đợt hiện tại hay không.
- Quy tắc giữ bộ sưu tập ending, codex và achievement khi bắt đầu New Game/New Game+.
- Chế độ chơi lại khu là ký ức không ảnh hưởng campaign hay có thể ghi đè tiến trình chính.
- Mục tiêu hiệu năng và dung lượng tải cho desktop/mobile trước khi triển khai 110 và 116.

Không triển khai các quyết định này bằng giả định đơn phương khi chúng chưa được đội dự án thống nhất.
