export const AFTER_CREDITS = Object.freeze({
  title: "HẬU DANH ĐỀ",
  kicker: "Hành trình khép lại",
  teamLabel: "Thực hiện",
  team: Object.freeze([
    "Nguyễn Hoàng Viết Đô",
    "Võ Nam Sang",
    "Đặng Thành Đạt",
    "Thạch Nhân",
  ]),
  sourcesLabel: "Nguồn tư liệu & kiểm chứng lịch sử",
  sourcesIntro: "Các mốc và diễn giải lịch sử trong hành trình được đối chiếu từ những tư liệu sau.",
  roll: Object.freeze({
    minDuration: 18_000,
    maxDuration: 42_000,
    millisecondsPerPixel: 26,
  }),
  sources: Object.freeze([
    {
      chapter: "Khu 1 — Le Paria",
      label: "Bảo tàng Hồ Chí Minh — Nguyễn Ái Quốc–Hồ Chí Minh và báo Người cùng khổ",
      href: "https://baotanghochiminh.vn/nguyen-ai-quoc-ho-chi-minh-va-bao-nguoi-cung-kho-le-paria.htm",
    },
    {
      chapter: "Khu 2 — Hợp nhất các tổ chức cộng sản",
      label: "Tư liệu–Văn kiện Đảng — Ngày thành lập Đảng Cộng sản Việt Nam 3/2/1930",
      href: "https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/ngay-thanh-lap-dang-cong-san-viet-nam-3-2-1930-3342",
    },
    {
      chapter: "Khu 2 — Hợp nhất các tổ chức cộng sản",
      label: "Tư liệu về diễn tiến ngày 24/02/1930",
      href: "https://tulieuvankien.dangcongsan.vn/upload/3000006/20251024/04ca7dc64206d3a455480cf392bbf12bnguyenaiquoc.pdf",
    },
    {
      chapter: "Khu 3A — Cách mạng Tháng Tám",
      label: "Tư liệu–Văn kiện Đảng — Cách mạng Tháng Tám và Quốc khánh 2/9/1945",
      href: "https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/cach-mang-thang-8-va-quoc-khanh-291945-cua-nuoc-viet-nam-dan-chu-cong-hoa-3310",
    },
    {
      chapter: "Khu 3B — Hiệp định Genève và Vĩ tuyến 17",
      label: "Báo Chính phủ — Hiệp định Genève 1954: Một mốc son lịch sử của nền ngoại giao Việt Nam",
      href: "https://baochinhphu.vn/hiep-dinh-geneve-1954-mot-moc-son-lich-su-cua-nen-ngoai-giao-viet-nam-102240425094504794.htm",
    },
    {
      chapter: "Khu 4 — Đại hội VI và Khoán 10",
      label: "Báo Chính phủ — Đảng Cộng sản Việt Nam qua các kỳ Đại hội",
      href: "https://baochinhphu.vn/dang-cong-san-viet-nam-qua-cac-ky-dai-hoi-102286517.htm",
    },
    {
      chapter: "Khu 4 — Đại hội VI và Khoán 10",
      label: "Tư liệu–Văn kiện Đảng — Nghị quyết 10 và nông nghiệp",
      href: "https://tulieuvankien.dangcongsan.vn/c-mac-angghen-lenin-ho-chi-minh/ho-chi-minh/nghien-cuu-hoc-tap-tu-tuong/ho-chi-minh-ve-vai-tro-nen-tang-cua-nong-nghiep-trong-qua-trinh-cong-nghiep-hoa-dat-nuoc-2038",
    },
  ]),
});

export function supportsAfterCredits(endingId) {
  return endingId === "good" || endingId === "neutral";
}
