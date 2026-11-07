/* Nội dung mặc định của Tài liệu tập huấn và Nội quy; Admin sửa được trên web.
   Biên soạn từ: Hướng dẫn sử dụng hệ thống (HDHT), Quy định PTN, Quy định làm việc của trợ lý,
   Quy trình xử lý công việc PTN, sheet Nề nếp và file TRIEN-KHAI-WEB-TRO-LY-PTN.md.
   Không chứa câu hỏi hay đáp án nên được phép nằm trong web công khai. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NoiDung = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const bai = (id, phan, thuTu, tieuDe, phut, chuDe, nguon, noiDung) => ({
    id, phan, thuTu, tieuDe, phut, chuDe, nguon, noiDung: noiDung.trim(), batBuoc: phan === 'tuyen', hoatDong: true, duongDan: ''
  });

  const taiLieu = [
    bai('tl-01', 'tuyen', 1, 'Trợ lý PTN làm gì?', 5, 'Vai trò – thái độ trợ lý', 'Quy định làm việc của trợ lý, HDHT', `
## Công việc chính
- Hỗ trợ sinh viên, giảng viên mượn phòng, thiết bị, dụng cụ trên hệ thống.
- Hỗ trợ lấy nước cất, nước rửa chén cho lớp thực hành.
- Soạn hóa chất cho lớp thực hành: tìm đúng hóa chất, cân đúng, ghi đúng tên, tránh nhầm lẫn.
- Soạn dụng cụ cho lớp thực hành và đồ án: tìm đúng loại, ghi số lượng thực tế và nhà sản xuất.
- Sắp xếp dụng cụ trong phòng và các việc khác khi cán bộ PTN giao.

## Nguyên tắc quan trọng nhất
> Không chắc cách xử lý thì báo cán bộ PTN để được hướng dẫn, không tự quyết.

- Hồ sơ đề tài (QR7) và đơn mượn thêm dụng cụ (QR8) do quản lý PTN xử lý. Trợ lý hướng dẫn và chuyển cho quản lý.
- Đi đúng lịch trực đã đăng ký. Không trực được thì báo sớm trên app để PTN sắp xếp.

## Khi người dùng gặp lỗi trên trang
1. Đầu tiên hướng dẫn tải lại trang: kéo xuống trên điện thoại, F5 trên máy tính.
2. Vẫn lỗi thì gửi cán bộ PTN: ảnh chụp màn hình (thấy rõ mã đơn nếu có), đang ở trang nào, bấm nút gì, thông báo lỗi là gì.
`),
    bai('tl-02', 'tuyen', 2, 'Hệ thống quản lý PTN', 10, 'Hệ thống chung', 'HDHT phần A', `
## Hai trang, một cơ sở dữ liệu
- **Trang dùng chung:** cho sinh viên, học viên, giảng viên. Mở bằng trình duyệt, không cần cài phần mềm.
- **Trang quản lý:** cho cán bộ PTN duyệt và xử lý đơn. Đơn gửi ở trang dùng chung hiện ngay ở trang quản lý.

Hệ thống của Viện độc lập với hệ thống của Khoa Khoa học Sức khỏe. Quét nhầm mã của Khoa thì đơn không về PTN Viện, phải gửi lại trên trang của Viện. Thấy mã QR của Khoa dán ở phòng của Viện thì báo cán bộ PTN để thay.

Mất mạng khi đang điền thì đơn chưa được gửi; có mạng lại phải bấm gửi lần nữa. Dữ liệu tự sao lưu lúc 6 giờ mỗi sáng sang Google Sheet của Viện.

## Những từ cần biết
| Từ | Nghĩa |
|---|---|
| Mã đơn | Dạng D000123, in ở góc đơn, dùng để tra cứu |
| Mã máy | Dạng TB-XXXXXX, gắn với điện thoại hoặc máy tính đã dùng trang |
| Hồ sơ đề tài | Mã dạng KL-2627-001. KL: khóa luận, luận văn; DA: đồ án; NC: NCKH; NG: SV ngoài đơn vị |

## Vòng đời một đơn
**Chờ duyệt → Đã duyệt → Đang mượn / Đang dùng → Đã trả – hoàn tất**

- Chữ đỏ "… · quá hạn": đã quá giờ hoặc ngày trả mà chưa trả.
- Màu xám "Từ chối": PTN không duyệt; xem lý do trong đơn, ở mục Đơn của tôi.
- Mọi thao tác của cán bộ đều lưu ở Lịch sử xử lý của đơn và mục Nhật ký.
`),
    bai('tl-03', 'tuyen', 3, 'Các mã QR và biểu mẫu', 10, 'Các mã QR', 'HDHT mục A.2, phần B', `
| Mã | Dùng để | Ai dùng |
|---|---|---|
| QR1 | Mượn phòng; mượn – trả thiết bị, dụng cụ trong ngày | GV, SV |
| QR2 | Mượn thiết bị dài ngày, từ 02 ngày đến tối đa 03 tháng | GV |
| QR3 | Cấp hóa chất – vật tư bổ sung ngoài dự trù | GV |
| QR4 | Mượn chìa khóa tại phòng Bảo vệ | GV |
| QR5 | Nhật ký sử dụng phòng, thiết bị | GV, SV |
| QR6 | Đăng ký sử dụng tủ | GV, SV |
| QR7 | Hồ sơ đề tài KLTN – NCKH | SV |
| QR8 | Đăng ký mượn thêm dụng cụ | GV, SV |

Phiếu của giảng viên: GV-BH báo hỏng, GV-SC đề nghị sửa chữa, GV-BS đề nghị bổ sung, GV-TS mang tài sản vào / ra cơ quan. DT là dự trù hóa chất môn học.

## Những điểm hay nhầm
> QR5 BẮT BUỘC quét trước khi dùng thiết bị, kể cả giảng viên. Dữ liệu này cho biết ai dùng thiết bị nào, bao lâu, tình trạng trước và sau, làm căn cứ khi có hư hỏng.

- Sinh viên cần phòng và thiết bị, trả trong ngày: QR1, chọn "Mượn phòng + thiết bị – dụng cụ".
- Thiết bị mang đi dài ngày chỉ giải quyết cho **giảng viên đứng tên mượn** qua QR2. Sinh viên không tự mượn dài ngày được.
- Giảng viên không thấy ô QR2: thường do lúc khai thông tin chưa chọn đối tượng Giảng viên.
- Mang máy ra khỏi trường: cần thêm phiếu GV-TS.
`),
    bai('tl-04', 'tuyen', 4, 'Giờ làm việc và các mốc thời gian', 5, 'Giờ làm việc – thời gian', 'Quy định PTN Điều 9, 10, Quy trình 13', `
| Việc | Mốc |
|---|---|
| Giờ làm việc PTN | Sáng 07h00 – 11h30, chiều 13h00 – 16h30, Thứ 2 – Thứ 7 |
| Giữ chìa khóa để mở cửa | 5 đến 10 phút |
| Báo trả phòng buổi chiều | Trước 16g20 |
| Người rời phòng cuối khóa phòng và trả xong | Trước 16g30, trước khi PTN hết giờ |
| Không kịp trả đồ mượn buổi sáng | Báo trả vào đầu giờ chiều cùng ngày |
| Không kịp trả đồ mượn buổi chiều | Báo trả vào sáng hôm sau |

## Chìa khóa giữ quá lâu
Quá 5 – 10 phút mà chưa trả chìa thì liên hệ nhắc bạn trả ngay và báo cán bộ PTN.

> Các mốc 16g20, 16g30 và giữ chìa 5 – 10 phút đang lấy theo Quy định Khoa KHSK, chờ PTN Viện xác nhận.
`),
    bai('tl-05', 'tuyen', 5, 'Thông tin cá nhân và quy tắc một máy', 5, 'Thông tin cá nhân – một máy', 'HDHT mục B.1, B.14', `
- Thông tin cá nhân khai **một lần** trên điện thoại của mình, sau đó tự điền vào mọi biểu mẫu.
- MSSV, mã học viên hoặc mã viên chức là "chìa khóa" nhận diện trên hệ thống.

> Mọi đơn gửi từ một máy được coi là của chủ máy. Không gửi đơn hộ người khác bằng máy mình; đăng ký thay bị xử lý như vi phạm.

## Tình huống thường gặp
- **Bạn nhờ dùng điện thoại của trợ lý gửi đơn giùm:** từ chối nhẹ nhàng, giải thích đơn từ máy nào là của chủ máy đó, hướng dẫn bạn sạc pin hoặc báo cán bộ PTN.
- **Đổi điện thoại:** khai lại trên máy mới, bấm Gửi đề nghị chuyển máy, chờ PTN duyệt. Máy cũ hết hiệu lực.
- **Máy khác khai cùng MSSV:** hệ thống báo "đã đăng ký ở thiết bị khác" kèm nút Gửi đề nghị chuyển máy.
- **Sửa số điện thoại:** bấm Thông tin → Đề nghị sửa thông tin, ghi lý do, chờ PTN duyệt.
`),
    bai('tl-06', 'tuyen', 6, 'Quy định chung và an toàn', 10, 'Quy định chung – an toàn', 'Quy định PTN Điều 4, 14, 17, 18, Quy trình 6', `
## Khi làm việc trong phòng
- Mọi hoạt động phải bảo đảm an toàn lao động, hóa chất, sinh học, phòng cháy chữa cháy, môi trường và duy trì 5S.
- Trang bị và sử dụng bảo hộ theo yêu cầu: áo blouse, khẩu trang, găng tay, kính.
- Không tự ý vận hành, tháo lắp, di chuyển thiết bị khi chưa được GVHD và GV QLP đồng ý.
- Chuyển thiết bị sang phòng khác: phải được Bộ môn và GV QLP đồng ý, đồng thời báo PTN ghi nhận.
- Không dùng thiết bị chưa đăng ký trong đơn. Một số thiết bị quan trọng cần giấy chứng nhận đã qua tập huấn vận hành.
- Hóa chất thuộc danh mục kiểm soát đặc biệt được quản lý riêng, có sổ theo dõi xuất – nhập.

## Nhóm rời phòng cuối cùng
Chịu trách nhiệm vệ sinh phòng, tắt đèn – quạt, ngắt điện thiết bị không dùng, khóa nước, khóa gas, chốt cửa sổ, khóa cửa chính.

## Khi tràn đổ hóa chất
> An toàn con người trước, sau đó mới khoanh vùng và làm sạch.

1. Sơ tán vùng bị nhiễm bẩn; làm sạch ngay vùng mắt và da tiếp xúc.
2. Báo người có trách nhiệm; xác định tính chất chất tràn đổ.
3. Sơ tán người không liên quan, sơ cứu, khoanh vùng.
4. Chỉ dọn khi đã có bảo hộ phù hợp với tính chất hóa chất.
5. Thu gom, làm sạch, lau khô. Bị phơi nhiễm thì đến cơ sở y tế.

## Hư hỏng, mất mát và vi phạm
- Phát hiện hư hỏng: báo ngay PTN và GV QLP để lập biên bản, xác định thời điểm, hiện trạng, nguyên nhân.
- Lỗi chủ quan: bồi thường theo giá trị thiệt hại thực tế hoặc theo thỏa thuận và cam kết trong đơn. Việc này xử lý độc lập với công nhận kết quả học tập.
- Vi phạm, tùy mức độ: nhắc nhở, tạm đình chỉ quyền sử dụng phòng hoặc đề nghị xử lý theo quy định Trường.
`),
    bai('tl-07', 'thu_viec', 1, 'Trang quản lý: đăng nhập và phân quyền', 5, 'Trang quản lý – đăng nhập, quyền', 'HDHT mục C.1', `
- Đăng nhập bằng Gmail do admin đăng ký và mật khẩu được cấp. Mật khẩu mới dài 8 – 32 ký tự, có cả chữ và số.
- Máy tính chung ở bàn trực: **không** đánh dấu Ghi nhớ đăng nhập; phiên tự hết hạn sau 12 giờ.
- Sai mật khẩu 5 lần liên tiếp: khóa tạm 15 phút. Quên mật khẩu thì liên hệ admin.
- Mất điện thoại đang đăng nhập: vào Tài khoản → Các máy đang đăng nhập để đăng xuất máy đó và đổi mật khẩu.
- Quyền "Xem" chỉ được xem, in, tải file. Cài đặt, Cán bộ, Nhật ký, sao lưu và xóa dữ liệu là của admin.
- Số đỏ cạnh "Đơn đăng ký QR1 – QR8" là số đơn đang chờ xử lý.
`),
    bai('tl-08', 'thu_viec', 2, 'Trang Hôm nay và việc đầu, cuối ngày', 5, 'Hôm nay – Cần chú ý', 'HDHT mục C.2', `
Trang Hôm nay mở ra đầu tiên sau khi đăng nhập, nên xem đầu mỗi buổi làm việc.

- **Cần chú ý:** gom mọi việc cần xử lý: đơn, thiết bị, tủ quá hạn; thiết bị hỏng, đến hạn kiểm định; hóa chất sắp hết.
- **QR1 đã qua ngày chưa báo trả:** đồ đã trả mà quên bấm thì dùng Xác nhận đã trả; nhắc người mượn thì bấm Đã đòi để lưu vết.
- **Đang sử dụng – đang mượn:** xem đơn đang mở và xử lý nhanh Nhận trả / Kết thúc.
- **Phòng đang học thực hành:** lấy từ thời khóa biểu đã nhập.

> Cuối ngày kiểm tra mục Đang sử dụng – đang mượn, kết thúc hộ lượt QR5 bị quên và ghi chú lý do.
`),
    bai('tl-09', 'thu_viec', 3, 'Xử lý đơn trên trang quản lý', 5, 'Danh sách và chi tiết đơn', 'HDHT mục C.3', `
- Bộ lọc mặc định là "Chưa xong": mọi đơn chưa hoàn tất.
- Nhãn đỏ "⚠ nghi đăng ký thay": một máy đã gửi đơn đứng tên người khác. Dòng đầu chi tiết đơn có mã máy đã gửi để đối chiếu.
- Từ chối đơn: bắt buộc ghi Lý do từ chối rồi mới bấm Từ chối.
- Thêm ghi chú: ghi nội bộ vào lịch sử xử lý của đơn.
- Đơn khác của người này: xem nhanh đơn trước, ví dụ còn đơn quá hạn chưa trả.
- Xóa nhầm: khôi phục ở Lịch sử tải file → Thu hồi, khi dữ liệu chưa được dùng tiếp.
`),
    bai('tl-10', 'thu_viec', 4, 'QR1: đơn mượn trong ngày', 15, 'QR1 – xử lý đơn mượn trong ngày', 'HDHT mục B.4, C.3, Quy trình 13–16, Quy trình xử lý công việc PTN', `
## Các bước trên hệ thống
**Duyệt → Đã giao → Nhận trả** (chọn tình trạng khi trả). Khi Đã giao đơn có thiết bị, hệ thống tự ghi nhật ký QR5.

## Kiểm tra trước khi giải quyết
- Đối chiếu MSSV và thông tin người nhận với đơn trên hệ thống, không giữ thẻ sinh viên.
- Nhắc SV điền đúng thông tin người trực tiếp sử dụng, không dùng tên bạn khác.
- SV đồ án mượn phòng: kiểm tra đơn có đủ chữ ký và mộc đã kiểm tra.
- Mượn thiết bị cố định ở phòng: đơn không đăng ký hoặc không có chữ ký GV QLP thì không giải quyết.

## Các trường hợp thường gặp
| Tình huống | Cách xử lý |
|---|---|
| Nhóm thứ hai vào phòng đã mở cửa | Xác nhận với cán bộ trực rồi lên phòng, không cần mượn chìa |
| SV đang học thực hành mượn chìa mở thêm phòng | Không giải quyết; nhờ liên hệ GV đang dạy |
| SV khóa luận làm sau 16 giờ | GVHD quét QR1 cho SV và chịu trách nhiệm về phòng |
| Lớp thực hành dùng phòng ngoài TKB, không có GV | Cần danh sách đã được GVTH và GV QLP ký, gửi PTN trước |
| SV chọn F4.02 để làm thí nghiệm | F4.01, F4.02, F4.03 là phòng điều phối chung, không phải phòng làm thí nghiệm |
| Mượn trong ngày nhưng cần dùng thêm nhiều ngày | Hoàn tất báo trả trong ngày; mang đi dài ngày thì GV đứng tên QR2 |
| Thiết bị chưa sẵn | Chuyển trạng thái chờ, liên lạc khi có thiết bị |

Không đủ thiết bị, dụng cụ thì ưu tiên: lớp thực hành, rồi đồ án, sau đó GV làm nghiên cứu.

## Thiết bị mượn theo khung giờ
- Khung dài 30 – 180 phút, chỉ trong giờ làm việc. Mỗi người tối đa 2 khung liền nhau / thiết bị / ngày.
- Quá 10 phút từ giờ bắt đầu khung mà PTN chưa bấm Đã giao thì đơn tự đóng.
- Thiết bị đang cho mượn QR2 thì khung những ngày đó bị khóa.
`),
    bai('tl-11', 'thu_viec', 5, 'QR2 và QR4: thiết bị dài ngày, chìa khóa', 10, 'QR2 – giảng viên mượn dài ngày', 'HDHT mục B.9, B.11, C.3', `
## QR2
- Bước xử lý: **Duyệt → Đã giao** (thiết bị "Đang cho mượn") **→ Nhận trả** (về "Đang sử dụng").
- Thiết bị đặt tại F4.02, mượn tối đa 03 tháng. Có sẵn thì giao liền, chưa sẵn thì hẹn lại theo lịch cụ thể.
- "Dùng cho" gồm: Lớp thực hành; Đồ án – đề tài của sinh viên; Đề tài cá nhân.
- Quá hạn: nhắc GV trả hoặc liên hệ PTN gia hạn, bấm Đã đòi, báo cán bộ PTN.
- Mang ra khỏi trường: thêm Giấy báo mang tài sản ra cơ quan (GV-TS) kèm tờ trình Ban Giám hiệu.
- Nhận trả thiếu phụ kiện: ghi rõ tình trạng, chưa xác nhận đủ, báo cán bộ PTN và GV để lập biên bản.

## QR4
- Bước xử lý: **Duyệt → Giao chìa khóa → Nhận lại chìa khóa**.
- GV dạy thực hành mượn chìa tại phòng Bảo vệ, PTN không giải quyết trường hợp này.
- PTN cập nhật danh sách GV mượn chìa tại Bảo vệ theo TKB từng học kỳ.
- Quá giờ dự kiến trả: nhắc trả, bấm Đã đòi, báo cán bộ PTN nếu kéo dài.
`),
    bai('tl-12', 'thu_viec', 6, 'QR3: cấp hóa chất bổ sung', 10, 'QR3 – cấp hóa chất bổ sung', 'HDHT mục B.10, Quy trình 17, Quy trình xử lý công việc PTN', `
> Chỉ cấp cho lớp thực hành, khi chưa đủ số lượng theo biên bản bàn giao ban đầu. Đồ án: PTN không cấp, sinh viên tự chuẩn bị.

## Các bước
1. Xác nhận lớp thực hành hay đồ án.
2. Xác nhận có phiếu xuất kho và chữ ký GV thực hành.
3. **Duyệt** (chọn biên bản hóa chất cần ghi) **→ Đã cấp** (nhập số thực cấp). Không có bước trả.
4. Số thực cấp tự cộng vào cột Bổ sung của biên bản.
5. Giữ lại phiếu xuất kho sau khi cấp.

## Lưu ý
- GV dạy thực hành ghi đầy đủ phiếu xuất kho, sinh viên chỉ mang phiếu xuống PTN.
- Báo "Chọn biên bản hóa chất để ghi": môn chưa có biên bản trong học kỳ; kiểm tra TKB, dự trù của môn hoặc chọn "không ghi biên bản".
- GV không thấy môn của mình: chọn "✎ Môn khác – nhập thủ công".
- Nước cất, nước rửa chén: lớp thực hành thì dẫn SV lên phòng F05.05; đồ án không cấp.
- GV báo nhận hóa chất đầu môn trước 01 tuần. Khi bàn giao kiểm tra đúng loại, đủ số lượng, còn hạn.

> Mốc 01 tuần đang lấy theo Quy định Khoa KHSK, chờ PTN Viện xác nhận.
`),
    bai('tl-13', 'thu_viec', 7, 'QR5 và QR6: nhật ký thiết bị, tủ', 10, 'QR5 – nhật ký sử dụng', 'HDHT mục B.5, B.6, C.3, C.7', `
## QR5
- Không cần duyệt: đơn "Đang dùng" ngay khi gửi. Thiết bị có vấn đề thì chọn Bất thường và mô tả rõ.
- Quên kết thúc: mở đơn → Kết thúc sử dụng, chọn tình trạng, ghi chú "kết thúc hộ".
- SV dùng thiết bị mà không có lượt QR5 và không mượn qua QR1: yêu cầu dừng, báo cán bộ PTN; quy định là buộc ngừng sử dụng và lập biên bản.
- GV dạy thực hành điền QR5 vào mỗi buổi thực hành.
- Thuộc hồ sơ đề tài: để giờ sử dụng được tính cho đề tài của nhóm.

## QR6
- Bước xử lý: **Duyệt → Giao chìa tủ → Trả tủ**. Mỗi phòng chọn một tủ.
- Tủ không có trong danh sách: đang có người dùng hoặc đang có đơn chờ.
- Sơ đồ tủ có các trạng thái: Trống, Đang dùng, Hỏng, Quá hạn trả.
- Tủ hư: bấm tủ, chọn Hỏng, ghi chú, báo cán bộ PTN.
- Trả tủ còn đồ, mẫu: **chưa** bấm Trả tủ; yêu cầu dọn sạch, hủy mẫu rồi mới nhận chìa.
- Quá hạn: nhắc trả hoặc xin gia hạn với PTN, lưu vết lần nhắc.
`),
    bai('tl-14', 'thu_viec', 8, 'Thiết bị hư hỏng', 5, 'Thiết bị – hư hỏng', 'HDHT mục C.9, Quy định PTN Điều 18, Quy trình 7, 8', `
- Không tự tháo, sửa thiết bị hỏng; báo PTN, GV QLP theo quy trình.
- Sự cố khắc phục nhanh (điện, nước…): báo trực tiếp về PTN.
- Trên hồ sơ thiết bị, ghi sự kiện Báo hỏng: thiết bị chuyển "Hỏng – chờ sửa", tự hiện ở Cần chú ý.
- GV dùng phiếu GV-BH để báo hỏng.
- Sau sửa chữa, chỉ dùng lại khi nghiệm thu đạt, do GV QLP trực tiếp nghiệm thu.
- Quá hạn kiểm định hiện ở Cần chú ý cho đến khi ghi kiểm định mới.
- Lỗi chủ quan (ví dụ sơ ý làm vỡ dụng cụ): báo PTN, GV QLP lập biên bản, bồi thường theo cam kết trong đơn.
- Lỗi khách quan: các bên cùng đại diện PTN lập biên bản, trình BLĐ xem xét.
`),
    bai('tl-15', 'thu_viec', 9, 'Kho hóa chất và an toàn hóa chất', 15, 'Hóa chất – kho – an toàn', 'HDHT mục C.12, Quy trình 1–6', `
## Làm việc trong kho F4.01
> Mở hệ thống thông gió 01 giờ trước khi làm việc trong kho và mặc đầy đủ bảo hộ.

- Axit, bazơ, chất độc, chất oxy hóa ưu tiên để tầng thấp.
- Hệ thống cảnh báo xếp sai khi cùng kệ: axit – bazơ; chất oxy hóa – dễ cháy; phản ứng với nước – axit / bazơ; độc – axit.
- Xuất kho trừ lô có hạn dùng gần nhất trước.
- Nhãn lô: vàng là sắp hết hạn (≤ 90 ngày), đỏ là hết hạn.

## Hóa chất cần xử lý
- Kiểm tra định kỳ 3 tháng / lần. Hóa chất hết hạn chuyển sang quy trình xử lý hóa chất không còn sử dụng.
- Hóa chất chờ hủy đóng thùng chắc chắn, để khu vực riêng, không lẫn với hóa chất đang dùng.
- Chai mất nhãn: không dùng, tách riêng, báo cán bộ PTN.

## Nhận hàng và sổ sách
- Hàng không đạt: không ký nhận, đề nghị đổi trả hoặc bổ sung.
- Sổ hóa chất kiểm soát đặc biệt ghi: ngày, nội dung, số lô, nhập, xuất, tồn, chứng từ, người nhận, người ghi.

## Sự cố tràn đổ
Đưa người ra khỏi vùng đổ, rửa ngay vùng da tiếp xúc; báo người có trách nhiệm; khoanh vùng; dọn khi có bảo hộ. Giảng viên phụ trách phối hợp GV QLP và PTN lập biên bản, trình BLĐ.

> Mốc thông gió 01 giờ và kiểm tra kho 3 tháng / lần đang lấy theo Quy định Khoa KHSK, chờ PTN Viện xác nhận.
`),
    bai('tl-16', 'thu_viec', 10, 'Dụng cụ lớp thực hành', 10, 'Dụng cụ lớp thực hành', 'Quy trình 18, 19', `
## Giao đầu kỳ
- GV báo PTN trước 02 ngày để soạn và chuẩn bị. **Không cần quét mã**: nhận và ký theo biên bản bàn giao đã lập từ thời khóa biểu. QR2 chỉ dùng khi GV mượn thêm thiết bị.
- PTN bố trí tủ và giao chìa cho GV dạy thực hành.
- Đại diện lớp kiểm tra số lượng, chủng loại, tình trạng (nứt, mẻ, bể); phát hiện lỗi thì phản hồi ngay để đổi trước khi ký.
- Biên bản lưu 2 bản: lớp giữ 01, PTN lưu 01. Mã trên hệ thống có dạng DC-HKI2627-M08…

## Trả cuối kỳ
- Lớp báo trả trước ít nhất 01 ngày.
- Đại diện nhóm vệ sinh sạch và khô, đếm theo biên bản, tách dụng cụ nứt mẻ khác tình trạng ban đầu.
- Thiếu dụng cụ: ghi số lượng thực tế; nhóm bổ sung, PTN chỉ xác nhận trả đủ khi đã đủ.
- Đối chiếu hãng sản xuất, quy cách để bảo đảm trả đúng loại đã giao, tránh tráo đổi.

> Mốc báo trả trước 01 ngày đang lấy theo Quy định Khoa KHSK, chờ PTN Viện xác nhận.
`),
    bai('tl-17', 'thu_viec', 11, 'Phân việc, người dùng, thông báo', 5, 'Phân việc – đề tài, người dùng, thông báo', 'HDHT mục C.4, C.5, C.6', `
- Hồ sơ QR7 và đơn QR8: trợ lý ghi nhận, hướng dẫn và chuyển quản lý PTN, không tự duyệt.
- Một sinh viên chỉ thuộc một hồ sơ đề tài đang thực hiện.
- F4.01, F4.02, F4.03 không ghi trên đơn mượn phòng của đề tài.
- Giấy xác nhận hoàn thành chỉ hiện ở máy đã khai hồ sơ khi hồ sơ đã đóng; trưởng nhóm tải Excel gửi cả nhóm.
- Bỏ đăng ký người dùng: xóa liên kết người – máy, người đó phải khai lại từ đầu.
- SV khai nhầm MSSV của bạn: kiểm tra, Bỏ đăng ký máy khai sai, hướng dẫn bạn thật khai lại.
- Thông báo "Quan trọng" hiện khung nổi đến khi người nhận bấm Đã đọc.
- Người mới đăng ký thấy 3 tin cũ gần nhất và mọi tin gửi sau lúc đăng ký.
`)
  ];

  const muc = (id, nhom, thuTu, noiDung, xuLy, nguon) => ({ id, nhom, thuTu, noiDung, xuLy, nguon, hoatDong: true });
  const NHE = 'Lỗi nhẹ';
  const NANG = 'Lỗi nặng';
  const LV = 'Quy định làm việc';
  const NN = 'Sheet Nề nếp';
  const TK = 'Quy định nề nếp Trợ lý PTN';

  const noiQuy = [
    muc('nq-01', 'Lịch trực và chuyên cần', 1, 'Đăng ký khung trực trước 20:00 Chủ nhật cho tuần sau; mỗi lần tối thiểu 2 giờ, trong giờ PTN, Thứ 2 – Thứ 7.', 'Quá hạn không đăng ký được', TK),
    muc('nq-02', 'Lịch trực và chuyên cần', 2, 'Đi đúng lịch đã đăng ký. Không trực được thì hủy trước 24 giờ, xin vắng có minh chứng hoặc nhờ bạn đổi ca.', 'Hủy trong 24 giờ: hủy muộn, 2 lần tính 1 ca bỏ. Vắng không báo: bỏ ca', `${LV}, ${TK}`),
    muc('nq-03', 'Lịch trực và chuyên cần', 3, 'Chỉ bấm Bắt đầu trực khi đã có mặt ở PTN.', NANG, TK),
    muc('nq-04', 'Lịch trực và chuyên cần', 4, 'Đến đúng giờ: trễ không quá 10 phút. Trực đủ: trễ không quá 30 phút, ra sớm không quá 15 phút, đã làm checklist.', 'Không đủ điều kiện: ca không tính vào tỷ lệ tham gia', TK),
    muc('nq-05', 'Lịch trực và chuyên cần', 5, 'Bấm Kết thúc trực khi hết ca.', 'Quên quá 2 lần/kỳ: 1 lỗi nhẹ', TK),
    muc('nq-06', 'Lịch trực và chuyên cần', 6, 'Trực tối thiểu 120 giờ mỗi học kỳ.', 'Không đủ giờ thì không xếp loại Đạt', TK),

    muc('nq-07', 'Thực hiện công việc', 1, 'Không giải quyết bất kỳ trường hợp nào không có đơn.', NANG, LV),
    muc('nq-08', 'Thực hiện công việc', 2, 'Giao chìa khóa đúng quy định. Chìa không dùng cất dưới gầm bàn thầy Sơn để tránh lạc, mất.', 'Giao chìa sai quy định: lỗi nặng', LV),
    muc('nq-09', 'Thực hiện công việc', 3, 'Kiểm tra đúng người, đúng đơn; nhắc người mượn điền đúng thông tin của chính mình. Không gửi đơn hộ bằng máy của mình.', 'Tùy mức độ, quản lý xem xét', LV),
    muc('nq-10', 'Thực hiện công việc', 4, 'Hóa chất, vật tư tiêu hao chỉ cấp cho lớp thực hành, có phiếu xuất kho và chữ ký GV; ghi số thực cấp và giữ lại phiếu.', 'Tùy mức độ, quản lý xem xét', LV),
    muc('nq-11', 'Thực hiện công việc', 5, 'Soạn hóa chất, dụng cụ cẩn thận: đúng hóa chất, cân đúng, ghi đúng tên; đúng loại dụng cụ, ghi số lượng thực tế và nhà sản xuất.', 'Tùy mức độ, quản lý xem xét', LV),
    muc('nq-12', 'Thực hiện công việc', 6, 'Cuối ngày kiểm tra phòng, thiết bị, dụng cụ trong ngày đã trả đủ trên hệ thống mượn trả.', 'Bỏ kiểm tra để phòng chưa khóa: lỗi nặng', TK),
    muc('nq-13', 'Thực hiện công việc', 7, 'Trường hợp không nằm trong quy định hoặc chưa chắc: hỏi cán bộ PTN, không tự quyết.', 'Tùy mức độ, quản lý xem xét', LV),

    muc('nq-14', 'An toàn', 1, 'Trang bị và sử dụng bảo hộ theo yêu cầu; bảo đảm an toàn lao động, hóa chất, sinh học, phòng cháy chữa cháy.', 'Vi phạm an toàn nghiêm trọng: có thể mất tư cách ngay', 'Quy định PTN Điều 4, 14'),
    muc('nq-15', 'An toàn', 2, 'Không tự ý vận hành, tháo lắp, di chuyển thiết bị khi chưa được đồng ý.', 'Vi phạm an toàn nghiêm trọng: có thể mất tư cách ngay', 'Quy định PTN Điều 14'),
    muc('nq-16', 'An toàn', 3, 'Khi có sự cố, ưu tiên an toàn con người, rồi báo ngay cán bộ PTN.', 'Vi phạm an toàn nghiêm trọng: có thể mất tư cách ngay', 'Quy trình 6'),
    muc('nq-17', 'An toàn', 4, 'Phát hiện mất mát, hư hỏng thì báo ngay PTN và GV QLP. Lỗi chủ quan phải bồi thường.', 'Bồi thường theo quy định', 'Quy định PTN Điều 18'),

    muc('nq-18', 'Vệ sinh và nề nếp phòng', 1, 'Khu nước uống, pha chế: để đúng vị trí; pha xong vệ sinh, lau sạch mặt bàn.', NHE, NN),
    muc('nq-19', 'Vệ sinh và nề nếp phòng', 2, 'Bồn rửa: rửa dụng cụ ngay sau khi ăn uống; sàn ướt phải lau khô.', NHE, NN),
    muc('nq-20', 'Vệ sinh và nề nếp phòng', 3, 'Nấu nướng: cùng nhau phụ một tay; cuối ngày dọn sạch bếp, bồn rửa, sàn; kệ chén gọn, đồ khô cất vào tủ.', NHE, NN),
    muc('nq-21', 'Vệ sinh và nề nếp phòng', 4, 'Tủ, ngăn kệ dùng xong phải đóng kỹ.', NHE, NN),
    muc('nq-22', 'Vệ sinh và nề nếp phòng', 5, 'Tư trang: cặp sách, áo khoác treo gọn hoặc cất vào cặp, không để trên bàn, lối đi.', NHE, NN),
    muc('nq-23', 'Vệ sinh và nề nếp phòng', 6, 'Vật dụng chung dùng xong đặt lại đúng vị trí.', NHE, NN),
    muc('nq-24', 'Vệ sinh và nề nếp phòng', 7, 'Cuối ngày quét dọn phòng, sắp xếp không gian chung, đóng cửa đầy đủ trước khi về.', NHE, NN),
    muc('nq-25', 'Vệ sinh và nề nếp phòng', 8, 'Mẫu thí nghiệm gửi tại phòng để đúng vị trí; làm xong nhớ dọn hủy mẫu.', NHE, NN),

    muc('nq-26', 'Mức xử lý chung', 1, 'Nhắc nhở: tham gia dưới 80%, hoặc bỏ 1 ca, hoặc 2 lỗi nhẹ.', 'Web đề xuất, quản lý chốt', TK),
    muc('nq-27', 'Mức xử lý chung', 2, 'Cảnh báo: tham gia dưới 70%, hoặc bỏ 2 ca, hoặc 1 lỗi nặng, hoặc 4 lỗi nhẹ.', 'Web đề xuất, quản lý chốt', TK),
    muc('nq-28', 'Mức xử lý chung', 3, 'Mất tư cách: tham gia dưới 60% (xét từ tuần 6), hoặc bỏ 3 ca, hoặc 2 lỗi nặng, hoặc vi phạm an toàn nghiêm trọng.', 'Trợ lý phản hồi trong 3 ngày, Admin quyết định', TK)
  ];

  return { taiLieu, noiQuy };
});
