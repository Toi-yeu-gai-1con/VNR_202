# Hướng dẫn tạo thoại cho AI

Tài liệu này là quy ước để AI hoặc người viết mới thêm hội thoại mà không phá
typewriter, tiếng blip, lựa chọn, nhịp truyện, hoặc tiêu chuẩn nội dung của VNR_202.

## Nguồn sự thật

- Nội dung thoại nằm trong 'src/data/story-content.js'.
- Luồng hiển thị, typewriter và âm thanh nằm trong 'src/runtime/game-runtime.js'.
- Blip nam: 'assets/audio/sfx/sfx-blipmale.wav'.
- Blip nữ: 'assets/audio/sfx/sfx-blipfemale.wav'.
- Kiểm tra hồi quy: 'tests/dialogue-typewriter-check.mjs' và các test trong
  'tests/e2e/game-flow.spec.mjs'.

Không tạo một hệ thống thoại thứ hai trong file mới. Hãy thêm dữ liệu vào các
export hiện có hoặc thêm helper trong runtime nếu luồng mới thật sự cần logic.

## Các dạng dữ liệu thoại

### Hội thoại tương tác

INTERACTION_DIALOGUES dùng key của interactable trong level:

~~~js
export const INTERACTION_DIALOGUES = {
  "new-interactable-id": {
    speaker: "Người gác kho",
    lines: [
      "Cổng này đã khóa từ sáng.",
      { speaker: "David", text: "Có ai còn giữ chìa khóa không?" },
    ],
  },
};
~~~

- speaker ở cấp hội thoại là người nói mặc định.
- Một phần tử trong lines có thể là chuỗi (dùng speaker mặc định) hoặc object
  { speaker, text } (dùng khi đổi người nói).
- Mỗi lượt nói nên là một ý trọn vẹn. Tách lượt nói thay vì nhét nhiều nhân
  vật vào cùng một text.
- Nếu tạo key mới, phải kiểm tra interactable có trỏ đúng key đó và có test
  hoặc playtest mở được hội thoại.

### Hội thoại TVA có lựa chọn

Lựa chọn có dạng:

~~~js
choices: [
  { id: "choice-id", label: "Nhãn hiển thị" },
  { id: "dangerous-choice", label: "Lựa chọn nguy hiểm", tone: "danger" },
]
~~~

id không chỉ là text hiển thị. Nó được xử lý trong
resolveDialogueChoice()/resolveTvaDialogueChoice() ở runtime. Vì vậy:

1. Tái sử dụng một id đã có nếu lựa chọn có cùng ý nghĩa.
2. Nếu cần id mới, phải thêm nhánh xử lý tương ứng và cập nhật test.
3. Không tự ý thêm lựa chọn vào một hội thoại không có luồng xử lý.

### Intro và bad ending

- OPENING_DIALOGUE dùng object { speaker, text, stage }.
- BAD_ENDING_RECOVERY.lines là mảng chuỗi và dùng BAD_ENDING_RECOVERY.speaker.
  Không đổi thành một schema khác nếu không sửa cả runtime.
- David trong bad ending là người nói nam; đừng đổi speaker chỉ để thay đổi
  giọng blip.

## Typewriter và tiếng blip

Runtime hiện dùng cadence tham chiếu kiểu Phoenix Wright:

| Ngữ cảnh | Nhịp nền |
| --- | ---: |
| Thoại thường | 32 ms/ký tự |
| Intro | 34 ms/ký tự |
| Bad-ending recovery | 40 ms/ký tự |

Nhịp nền không phải thời gian cố định cho cả câu. Runtime tự cộng pause:

- dấu phẩy, chấm phẩy, dấu hai chấm: khoảng 70 ms;
- gạch ngang: khoảng 90 ms;
- dấu chấm, chấm than, chấm hỏi: khoảng 130 ms;
- dấu ba chấm hoặc …: khoảng 160 ms;
- xuống dòng: khoảng 100 ms.

Tiếng blip không phát cho mọi ký tự. Runtime bỏ qua khoảng trắng và dấu câu,
sau đó phát cách 2 rồi 3 chữ luân phiên. Giọng phải được khai báo rõ trong
`DIALOGUE_VOICE_BY_SPEAKER`: David và các vai nam đã xác nhận dùng blip nam,
vai nữ đã xác nhận dùng blip nữ. Người kể, đồ vật và speaker chưa xác định giới
tính không được tự động gán giọng nữ.

Khi người chơi bấm tiếp trong lúc câu đang chạy, lần bấm đầu hoàn tất câu hiện
tại; lần bấm sau mới chuyển câu. Không thêm timer riêng vào từng line và không
gọi trực tiếp file WAV từ dữ liệu story.

Timeline của Bad Ending được runtime tính từ độ dài thật và dấu câu của từng
line. Không hardcode mốc kết thúc hoặc chia đều thời lượng giữa các line trong
test; dùng các mốc `complaintAt`, `resetAt`, `completeAt` từ debug snapshot.

## Quy tắc viết nhịp tự nhiên

- Dùng dấu phẩy để tạo nhịp nghỉ ngắn, dấu chấm để tạo nhịp kết câu.
- Không lạm dụng ..., !!!, hoặc nhiều dấu câu liên tiếp chỉ để tạo drama.
- Mỗi line nên ngắn đủ để đọc trong một lượt; nếu có hai ý đối lập, cân nhắc
  tách thành hai line.
- Câu cao trào nên kết thúc bằng dấu chấm hỏi hoặc dấu chấm than có chủ ý,
  không dùng viết hoa toàn bộ để thay cho nhịp diễn.
- Giữ đúng tiếng Việt có dấu, UTF-8, giọng kể lịch sử và bối cảnh Việt Nam
  của dự án. Tránh từ hiện đại/anachronism nếu câu chuyện không cố ý dùng chúng.
- Không thêm markup HTML vào text; renderer dùng textContent và typewriter sẽ
  hiển thị markup như chữ thường.

Ví dụ có nhịp tốt:

~~~js
lines: [
  { speaker: "Người đưa tin", text: "Tôi đã tìm thấy bản đồ, nhưng nó bị rách mất một góc." },
  { speaker: "David", text: "Đưa tôi xem. Nếu còn tọa độ, chúng ta vẫn có thể lần theo dấu vết." },
]
~~~

## Checklist trước khi hoàn tất

1. Đã sửa đúng 'src/data/story-content.js', không hard-code thoại mới trong
   render loop.
2. Mỗi line có speaker đúng; David chỉ dùng khi nhân vật thật sự là David.
3. Dấu câu đã được đặt để tạo nhịp đọc tự nhiên.
4. Nếu có choices, mọi id đều có handler hoặc đã tái sử dụng handler hiện có.
5. Không thêm audio blip mới nếu không có yêu cầu thiết kế rõ ràng.
6. Chạy:

~~~powershell
npm run test:unit
npm run build
npx playwright test tests/e2e/game-flow.spec.mjs -g "dialogue|ending"
~~~

7. Mở browser, chụp screenshot và kiểm tra ít nhất một line mới đang chạy dở,
   một line đã hoàn tất, và lựa chọn cuối (nếu có).
8. Khi sửa logic typewriter, cập nhật test hồi quy thay vì chỉ kiểm tra bằng
   mắt.

Nếu thay đổi làm một line dài hơn đáng kể, hãy kiểm tra lại screenshot ở kích
thước cửa sổ game thật; đừng coi việc build thành công là đủ.
