# Peaceful Low-Poly Village — 3D System Design Specification (3d_system_design.md)

Đặc tả kỹ thuật thiết kế không gian 3D, kiến trúc giao diện tương tác và tiêu chuẩn hiệu năng cho ứng dụng Web 3D "Ngôi làng bình yên".

---

## 1. 3D Product & Spatial Context

- **Product Category**: Interactive Web3D Diorama / Virtual World
- **Target Medium**: Web3D (Three.js r128+, WebGL 2.0 / WebGL 1.0 fallback)
- **Display & Viewing Modality**: 2D Monoscopic Screen (Desktop / Mobile / Tablet)
- **Primary Input Mechanics**: Mouse Raycast (Hover & Left Click), Touch Drag (Orbit/Pinch Zoom), UI Buttons
- **Spatial Comfort Bounds**: 
  - Viewing Distance: 15m - 40m (Isometric / Diorama perspective)
  - Camera FOV: 45° (Perspective)
  - OrbitControls Bounds: Polar angle `min: 0.2 rad`, `max: Math.PI / 2 - 0.05 rad` (tránh chìm xuống dưới mặt đất)
  - Distance Bounds: `minDistance: 8m`, `maxDistance: 60m`

---

## 2. Spatial UX Architecture & Classification

### 2.1. 4-Tier UI Classification Matrix
| Element Name | Classification | Spatial Anchor & Coordinates | Fiction Integration | Interaction Modality |
| :--- | :--- | :--- | :--- | :--- |
| **Cửa sổ phát sáng / Cánh quạt cối xay** | **Diegetic** | Gắn cố định trên mô hình nhà, cối xay trong world space | Thuộc hoàn toàn vào bối cảnh làng quê | Tự động phát sáng / Quay trục Z liên tục |
| **Bong bóng cảm xúc & Nhãn động vật (Speech bubble / Emoji)** | **Spatial** | Tọa độ world-space phía trên đầu vật nuôi (Y + 1.2m), billboarding hướng về camera | Overlay trực quan gắn với thực thể | Raycast hover / Click nảy lên kèm emoji |
| **Thanh HUD Glassmorphism (Thời gian, Camera POV, Audio)** | **Non-Diegetic** | Orthographic screen-space HTML/CSS overlay trên Canvas | Nằm ngoài thế giới ảo | Chuột / Chạm màn hình 2D |
| **Chuyển đổi Chu kỳ Ngày/Đêm & Tone màu Sương mù** | **Meta** | Toàn bộ viewport (Sky gradient, Fog density, Directional color) | Cảm nhận thị giác của người xem | Tác động qua bộ chọn thời gian trên HUD |

### 2.2. Spatial Depth Planes
- **Tiền cảnh / Mặt nước & Cầu (Z: -5m đến +5m, Y: 0m đến 3m)**: Khu vực cầu gỗ, dòng suối uốn lượn, cối xay gió và bờ cỏ hoa dại.
- **Trung cảnh / Làng quê & Nông trại (Z: -10m đến 10m, X: -10m đến 10m)**: Các ngôi nhà Ghibli có ống khói, hàng rào gỗ và bầy gia súc (bò, cừu, gà).
- **Hậu cảnh / Bầu trời & Sương mù (> 25m)**: Chân trời diorama, các hạt phấn hoa/đom đóm phát sáng bay lơ lửng, sương mù làm mềm đường viền.

---

## 3. 3D Design Tokens & Materials

### 3.1. Spatial Scale & Unit Standards
- **World Metric**: 1 unit = 1 meter (Đường kính đảo diorama ~ 24m, chiều cao nhà ~ 3.5m, người/cừu ~ 0.8m - 1.2m).
- **Spatial Elevation Layers**:
  - `Base Water Level`: Y = -0.3m
  - `River Bed`: Y = -0.6m
  - `Ground Surface`: Y = 0.0m đến +0.8m (gồ ghề tự nhiên)
  - `Hill & Windmill Mound`: Y = +1.5m
  - `Roof Peaks`: Y = +3.8m đến +6.5m

### 3.2. Bảng màu & 3D Tokens (Color Palette)
- **Cỏ & Cây cối (Grass & Foliage)**: `#55a630`, `#2b9348`, `#80b918`, `#a7c957` (Pastel phong cách Ghibli)
- **Dòng suối (River Water)**: `#48cae4`, `#0096c7` (trong mờ, bọt trắng `#caf0f8`)
- **Gỗ & Cầu (Wood & Bridge)**: `#8b5e3c`, `#a06cd5`, `#6f4e37`
- **Tường nhà & Đá (Stone & Walls)**: `#e9ecef`, `#ced4da`, `#f8f9fa`
- **Mái nhà (Roofs)**: `#d90429`, `#e76f51`, `#f4a261` (đất nung & rơm ấm áp)
- **Ánh đèn ban đêm (Lantern Glow)**: `#ffb703`, `#fb8500` (Emissive ấm)

### 3.3. Vật liệu & Shading (Materials & Shaders)
- **Phong cách**: Low-poly Flat Shading (`MeshStandardMaterial` / `MeshLambertMaterial` với `flatShading: true`).
- **Nước**: `MeshStandardMaterial` với `transparent: true, opacity: 0.75, roughness: 0.1, metalness: 0.1` kết hợp vertex displacement nhẹ mô phỏng dòng chảy.
- **Khói & Bụi phát sáng**: Particle system dùng Point/Sprite vật liệu additive không tiêu hao hiệu năng.

---

## 4. Đặc tả Thực thể & Chuyển động (Entities & Animation Matrix)

| Thực thể | Geometries | Vật liệu | Chuyển động (Animation) | Tương tác Raycaster |
| :--- | :--- | :--- | :--- | :--- |
| **Cối xay gió** | Trụ nón cụt (Thân) + Nón (Mái) + Hộp (4 Cánh quạt) | Đá cuội, Gỗ sồi, Vải buồm kem | Cánh quạt quay trục Z liên tục tốc độ 0.6 rad/s | Hover phát sáng viền; Click tăng tốc quay nhẹ |
| **Cầu gỗ** | Vòm cung Cylinder cong, ván gỗ Box, cọc chống | Gỗ mộc mạc | Tĩnh | Click di chuyển camera đến bến cầu |
| **Nhà thôn quê** | Khối hộp biến dạng, mái chữ V dốc, dầm gỗ | Tường kem, ngói đất nung, kính vàng | Ống khói sinh ra các cụm khói nở dần và bay lên | Hover sáng rực cửa sổ; Click tạo âm thanh chuông |
| **Cừu** | Khối cầu méo (Lông xù) + Hộp (Chân) + Đầu | Lông trắng kem, mặt hồng | Gật gù đầu ăn cỏ, nhịp thở thân mình | Hover/Click: Cừu kêu "beee" & nhảy lên 0.3m |
| **Bò sữa** | Thân hình hộp bo góc, chân, sừng, tai | Đốm trắng đen / Đất sét | Đung đưa đầu, ve vẩy đuôi chậm rãi | Hover/Click: Bò gật đầu, phát icon cỏ xanh |
| **Gà con** | Khối cầu nhỏ màu vàng/trắng, mỏ cam, mào đỏ | Pastel kem vàng | Cúi mổ hạt trên đất, nhảy lắt nhắt | Hover/Click: Gà nhảy tưng tưng & chạy vòng quanh |

---

## 5. Ngân sách Hiệu năng (Performance & QA Budget)
- **Target Frame Rate**: 60 FPS ổn định trên cả máy tính văn phòng và thiết bị di động.
- **Draw Call Limit**: Tối đa < 45 Draw Calls (sử dụng `THREE.InstancedMesh` cho 150+ cây cối, 200+ khóm hoa và 80+ viên sỏi đá).
- **Polygon Count**: Tổng tam giác (triangles) toàn cảnh < 45,000 polygons.
- **Zero External HTTP Asset Risk**: Không tải model .glb/.gltf ngoài; không tải texture ảnh ngoài; toàn bộ 100% sinh tự động trong RAM khi mở trang web.
