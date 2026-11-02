# HB-2 — Robot hai chân nhân dạng (3D)

Demo tiếng Việt phong cách **bạc · trắng · đen** dựa trên ý tưởng “one machine, one page” của [elvarofficial/teardown](https://github.com/elvarofficial/teardown) (MIT).

## Xem trên GitHub Pages

- `index.html` ở gốc repo làm trang chủ, tải `sims/hb2-live/main.js` và `style.css`.
- Trang Pages: `https://xulytiengviet.github.io/teardown/` **sau khi** bật Pages (Settings → Pages → Deploy from a branch → `main` / `/ (root)`).
- Bản web dùng `three@0.186.1` từ jsDelivr nên cần mạng.

## Xuất bản một HTML chạy offline

```bash
npm ci
node sims/build.mjs hb2-live
```

Kết quả nằm ở `teardown-out/dist/hb2-live.html` (three.js, HTML, CSS và font sẽ được nhúng theo công cụ gốc).

## Điều khiển

- Kéo chuột: xoay góc nhìn, cuộn chuột: zoom, nhấp vào chi tiết robot: xem tên khớp.
- Squat / đứng thẳng, chạy / tạm dừng, chỉnh `u` 0…1, tốc độ 0.25–2×.
- Camera: toàn thân, trước, bên, hông, gối, cổ chân.
- Hiển thị: vỏ nguyên khối, X-ray, lưới dây, tách cụm; bật/tắt CoM và xoay tự động.
- Phím **Space**: chạy/dừng; **R**: đặt lại.

## Động học

Hai đốt chân bằng nhau `L = 350 mm`, chiều cao giữa hông và cổ chân `H = 600 - 100u` (mm); khớp gối dịch về phía trước:

```
kneeZ(u) = sqrt(L^2 - (H(u)/2)^2)
hipPitch(u) = acos(H(u)/(2 L))
kneeFlexion(u) = 2 * hipPitch(u)
```

Thân người, tay, vỏ, trọng lượng và tâm khối là thiết kế minh họa, **không phải mô hình CAD/động lực học đã được thẩm định**. Hai bàn chân cố định trên nền; chưa giải lực tiếp xúc, momen khớp, ZMP hoặc ổn định động.

Giữ nguyên `LICENSE` MIT và credit từ upstream repository. Phần demo bổ sung là mã nguồn minh họa độc lập.