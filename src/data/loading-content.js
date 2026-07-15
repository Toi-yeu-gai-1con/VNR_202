const LOADING_CONTENT = Object.freeze({
  core: { tip: "Mẹo: giữ phím di chuyển để đổi hướng, rồi nhả phím để dừng ngay.", history: "" },
  hub: { tip: "Mẹo: David và bảng hồ sơ ở TVA sẽ nhắc lại mục tiêu đang mở.", history: "" },
  zone1: { tip: "Mẹo: phản đòn đúng lúc quái lóe đỏ để tạo khoảng trống an toàn.", history: "Tư liệu: Báo Người cùng khổ (Le Paria) ra số đầu năm 1922; xem nguồn trong Sách lịch sử khi đã mở khóa." },
  zone2: { tip: "Mẹo: quan sát các điểm tương tác trước khi chọn cách xử lý hồ sơ.", history: "Tư liệu: Hội nghị hợp nhất các tổ chức cộng sản diễn ra đầu tháng 02/1930; xem nguồn trong Sách lịch sử khi đã mở khóa." },
  zone3: { tip: "Mẹo: ưu tiên cứu người dân và giữ khoảng cách trước đòn diện rộng.", history: "Tư liệu: Khu này tách các lát cắt 1941–1945 và 1954–1975; xem nguồn theo từng chương trong Sách lịch sử." },
  zone4: { tip: "Mẹo: dùng môi trường và nhiệm vụ phụ để mở đường tới mục tiêu chính.", history: "Tư liệu: Đổi Mới bắt đầu từ Đại hội VI năm 1986, còn Khoán 10 ban hành năm 1988; xem nguồn trong Sách lịch sử khi đã mở khóa." },
  ending: { tip: "Mẹo: các lựa chọn đã lưu sẽ được tổng hợp vào hồ sơ kết thúc.", history: "" },
});

const FALLBACK = Object.freeze({ tip: "Đang chuẩn bị hành trình. Các asset bắt buộc sẽ được kiểm tra trước khi vào khu vực.", history: "" });

export function getLoadingContent(groupId) {
  return LOADING_CONTENT[groupId] ?? FALLBACK;
}
