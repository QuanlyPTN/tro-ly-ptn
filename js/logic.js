/* Quy tắc nghiệp vụ theo TRIEN-KHAI-WEB-TRO-LY-PTN.md (mục 3, 4, 7).
   Chỉ gồm hàm thuần, không đụng DOM hay lưu trữ, để test được bằng `node --test tests/logic.test.js`. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Logic = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const PHUT = 60000;
  const GIO = 60 * PHUT;
  const NGAY = 24 * GIO;

  const CAI_DAT_MAC_DINH = {
    buoi: [
      { ten: 'Sáng', tu: '07:00', den: '11:30' },
      { ten: 'Chiều', tu: '13:00', den: '16:30' }
    ],
    thuLamViec: [1, 2, 3, 4, 5, 6],
    phutToiThieuCa: 120,
    buocPhut: 30,
    gioKhoaDangKy: '20:00',
    phutDungGio: 10,
    phutTreToiDa: 30,
    phutRaSomToiDa: 15,
    phutBatDauSom: 30,
    soLanQuenKetThuc: 2,
    gioToiThieu: 120,
    gioXuatSac: 160, // chờ chốt (mục 12)
    soCaTinhToiThieu: 4,
    tuanXetMatTuCach: 6,
    diemBuLoi: 5,
    ngayPhanHoi: 3,
    mucDiem: { nho: 1, vua: 2, lon: 4 },
    choOnTruocKhaoSat: true,
    phienBanNoiQuy: 1,
    moc: {
      nhacNho: { thamGia: 80, boCa: 1, loiNhe: 2 },
      canhBao: { thamGia: 70, boCa: 2, loiNang: 1, loiNhe: 4 },
      matTuCach: { thamGia: 60, boCa: 3, loiNang: 2 }
    }
  };

  const DOT_KIEM_TRA_MAC_DINH = [
    { id: 'khao_sat', ten: 'Khảo sát tuyển', doiTuong: 'cho_duyet', nguon: [{ bo: 'Tuyển', soCau: 30 }], soTuLuan: 2, boTuLuan: 'Tuyển', phut: 40, dat: { tn: 70, tlMoiCau: 5 } },
    { id: 'giua_thu_viec', ten: 'Giữa thử việc', doiTuong: 'thu_viec', nguon: [{ bo: 'Thử việc', soCau: 30, uuTien: true }], soTuLuan: 1, boTuLuan: 'Thử việc', phut: 35, dat: { tn: 75 } },
    { id: 'cuoi_thu_viec', ten: 'Cuối thử việc', doiTuong: 'thu_viec', nguon: [{ bo: 'Thử việc', soCau: 40 }, { bo: 'Tuyển', soCau: 10 }], soTuLuan: 3, boTuLuan: 'Thử việc', phut: 75, dat: { tn: 80, tlTB: 6 } }
  ];

  const CHECKLIST_MAC_DINH = [
    'Khu nước uống, pha chế gọn, lau bàn',
    'Bồn rửa: dụng cụ đã rửa, sàn ướt đã lau khô',
    'Tủ, kệ đã đóng kỹ',
    'Tư trang cá nhân gọn',
    'Vật dụng chung về vị trí',
    'Mẫu gửi đúng chỗ, mẫu xong đã hủy',
    'Chìa khóa không dùng cất dưới gầm bàn thầy Sơn',
    'Đã kiểm tra phòng, thiết bị, dụng cụ trong ngày trả đủ (trên hệ thống mượn trả)'
  ].map((noiDung, i) => ({ id: `m${i + 1}`, noiDung, chiCuoiBuoiChieu: false, thuTu: i + 1, hoatDong: true })).concat([
    { id: 'm9', noiDung: 'Người trực cuối buổi chiều: dọn bếp, quét phòng, sắp xếp không gian chung, đóng cửa', chiCuoiBuoiChieu: true, thuTu: 9, hoatDong: true },
    { id: 'm10', noiDung: 'Ghi bàn giao ca sau', chiCuoiBuoiChieu: false, thuTu: 10, hoatDong: true, banGiao: true }
  ]);

  const DANH_MUC_LOI_MAC_DINH = {
    loi_nhe: ['Chưa dọn khu pha chế', 'Tư trang bừa bãi', 'Không đóng tủ', 'Chưa làm checklist', 'Được chốt việc đột xuất mà không đến, không báo'],
    loi_nang: ['Giao chìa sai quy định', 'Giải quyết trường hợp không có đơn', 'Bỏ kiểm tra cuối ngày để phòng chưa khóa', 'Bấm Bắt đầu trực khi chưa có mặt'],
    an_toan: ['Vi phạm an toàn nghiêm trọng'],
    diem_tot: ['Xử lý tốt tình huống khó', 'Hỗ trợ ngoài ca', 'Nhận thay ca gấp']
  };

  /* ---------- Thời gian ---------- */
  const phut = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  const hhmm = (soPhut) => `${String(Math.floor(soPhut / 60)).padStart(2, '0')}:${String(soPhut % 60).padStart(2, '0')}`;
  const ngayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const docNgay = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const mocGio = (key, gio) => {
    const d = docNgay(key);
    d.setMinutes(phut(gio));
    return d.getTime();
  };
  const congNgay = (key, n) => {
    const d = docNgay(key);
    d.setDate(d.getDate() + n);
    return ngayKey(d);
  };
  const dauTuan = (key) => congNgay(key, -((docNgay(key).getDay() + 6) % 7));
  const hanKhoaTuan = (key, cfg) => mocGio(congNgay(dauTuan(key), -1), cfg.gioKhoaDangKy);
  const tuanThu = (hocKy, nowMs) => Math.floor((nowMs - docNgay(hocKy.tuNgay).getTime()) / (7 * NGAY)) + 1;
  const hocKyHienTai = (st, nowMs) => {
    const key = ngayKey(new Date(nowMs));
    return st.hocKy.find((k) => k.tuNgay <= key && key <= k.denNgay) || st.hocKy[st.hocKy.length - 1];
  };
  const dotTuyenMo = (st, nowMs) => {
    const key = ngayKey(new Date(nowMs));
    return st.dotTuyen.find((d) => d.moDangKy && d.tuNgay <= key && key <= d.denNgay) || null;
  };

  /* ---------- Đăng ký ca (mục 3.2) ---------- */
  const CA_GIU_CHO = ['da_dang_ky', 'da_truc'];
  const giao = (a1, b1, a2, b2) => a1 < b2 && a2 < b1;

  function soNguoiTrongKhung(st, ngay, tuPhut, boQuaMssv) {
    return st.caTruc.filter(
      (c) => c.ngay === ngay && CA_GIU_CHO.includes(c.trangThai) && c.mssv !== boQuaMssv && phut(c.tu) <= tuPhut && tuPhut < phut(c.den)
    ).length;
  }

  function kiemTraDangKyCa(yc, st, nowMs) {
    const cfg = st.caiDat;
    const loi = [];
    const canhBao = [];
    const a = phut(yc.tu);
    const b = phut(yc.den);
    const thu = docNgay(yc.ngay).getDay();

    if (!cfg.thuLamViec.includes(thu)) loi.push('PTN chỉ làm việc từ Thứ 2 đến Thứ 7.');
    if (!cfg.buoi.some((x) => a >= phut(x.tu) && b <= phut(x.den))) loi.push('Khung giờ phải nằm trọn trong buổi sáng hoặc buổi chiều.');
    if (b - a < cfg.phutToiThieuCa) loi.push(`Mỗi lần trực tối thiểu ${cfg.phutToiThieuCa / 60} giờ.`);
    if (a % cfg.buocPhut || b % cfg.buocPhut) loi.push(`Giờ chọn theo bước ${cfg.buocPhut} phút.`);
    if (nowMs >= hanKhoaTuan(yc.ngay, cfg)) loi.push('Đã qua hạn đăng ký của tuần này (khóa 20:00 Chủ nhật tuần trước).');

    const caCuaToi = st.caTruc.filter((c) => c.mssv === yc.mssv && c.ngay === yc.ngay && CA_GIU_CHO.includes(c.trangThai));
    if (caCuaToi.some((c) => giao(a, b, phut(c.tu), phut(c.den)))) loi.push('Bạn đã có ca trùng khung giờ này.');

    st.thoiKhoaBieu
      .filter((m) => m.mssv === yc.mssv && m.thu === thu && giao(a, b, phut(m.tu), phut(m.den)))
      .forEach((m) => canhBao.push(`Trùng lịch học: ${m.monHoc} (${m.tu}–${m.den}).`));

    return { ok: loi.length === 0, loi, canhBao };
  }

  const loaiHuy = (ca, nowMs) => (mocGio(ca.ngay, ca.tu) - nowMs >= NGAY ? 'huy_truoc' : 'huy_muon');

  /* ---------- Vào ca (mục 3.3, 3.4) ---------- */
  function mucChecklist(st, ca) {
    const cuoiChieu = st.caiDat.buoi[st.caiDat.buoi.length - 1].den;
    return st.checklistMau
      .filter((m) => m.hoatDong && (!m.chiCuoiBuoiChieu || ca.den === cuoiChieu))
      .sort((x, y) => x.thuTu - y.thuTu);
  }

  function checklistXong(st, luot, ca) {
    return mucChecklist(st, ca).every((m) => {
      if (m.banGiao) return st.banGiao.some((b) => b.luotTrucId === luot.id && b.noiDung.trim());
      return st.checklistCa.some((c) => c.luotTrucId === luot.id && c.mucId === m.id && c.daLam);
    });
  }

  function danhGiaLuot(ca, luot, cfg, { daXongChecklist, raSomCoPhep }) {
    const tre = Math.max(0, luot.batDau - mocGio(ca.ngay, ca.tu));
    const som = Math.max(0, mocGio(ca.ngay, ca.den) - luot.ketThuc);
    const cuoiBuoi = cfg.buoi.some((b) => b.den === ca.den);
    const choPhepSom = cuoiBuoi ? 0 : cfg.phutRaSomToiDa;
    return {
      phutTre: Math.ceil(tre / PHUT),
      phutSom: Math.ceil(som / PHUT),
      dungGio: tre <= cfg.phutDungGio * PHUT,
      trucDu: tre <= cfg.phutTreToiDa * PHUT && (raSomCoPhep || som <= choPhepSom * PHUT) && daXongChecklist
    };
  }

  /* ---------- Chỉ số học kỳ (mục 4) ---------- */
  function tinhChiSo(st, mssv, hocKy) {
    const cfg = st.caiDat;
    const trongKy = (ngay) => hocKy.tuNgay <= ngay && ngay <= hocKy.denNgay;
    const cac = st.caTruc.filter((c) => c.mssv === mssv && trongKy(c.ngay));
    const dem = (tt) => cac.filter((c) => c.trangThai === tt).length;
    const idCa = new Set(cac.map((c) => c.id));
    const luot = st.luotTruc.filter((l) => l.mssv === mssv && idCa.has(l.caTrucId) && l.daDuyet);

    // Ca chưa duyệt hoặc chưa diễn ra (da_dang_ky) chưa vào hệ thống, không vào cả tử lẫn mẫu.
    const caVangCoPhep = dem('vang_phep');
    const caHuyTruoc = dem('huy_truoc');
    const caPTNHuy = dem('ptn_huy');
    const soLanHuyMuon = dem('huy_muon');
    const caVangKhongBao = dem('vang_khong_bao');
    const caDaDangKy = cac.length - dem('da_dang_ky');
    const caTinh = caDaDangKy - caVangCoPhep - caHuyTruoc - caPTNHuy;
    const caTrucDu = luot.filter((l) => l.trucDu).length;
    const caCoDen = luot.length;
    const caDenDungGio = luot.filter((l) => l.dungGio).length;
    const soCaBo = caVangKhongBao + Math.floor(soLanHuyMuon / 2);
    const viecTrongKy = (st.thamGiaViec || []).filter((t) => t.mssv === mssv && t.hocKyId === hocKy.id);
    const tongGio = luot.reduce((s, l) => s + (l.ketThuc - l.batDau) / GIO, 0) + viecTrongKy.reduce((s, t) => s + (t.gioNgoaiCa || 0), 0);

    const nenep = st.soNeNep.filter((n) => n.mssv === mssv && trongKy(n.ngay));
    const quenKetThuc = luot.filter((l) => l.ketThucBoi === 'quan_ly').length;
    const loiNhe = nenep.filter((n) => n.loai === 'loi_nhe').length + (quenKetThuc > cfg.soLanQuenKetThuc ? 1 : 0);
    const loiNang = nenep.filter((n) => n.loai === 'loi_nang').length;
    const anToan = nenep.filter((n) => n.loai === 'an_toan').length;
    const diemTot = nenep.filter((n) => n.loai === 'diem_tot').length;
    const diemCongDong = viecTrongKy.reduce((s, t) => s + (t.diem || 0), 0);
    const loiNheConLai = Math.max(0, loiNhe - Math.floor(diemCongDong / cfg.diemBuLoi));

    return {
      caDaDangKy, caVangCoPhep, caHuyTruoc, caPTNHuy, caTinh, caTrucDu, caCoDen, caDenDungGio,
      caVangKhongBao, soLanHuyMuon, soCaBo, tongGio, quenKetThuc,
      loiNhe, loiNang, anToan, diemTot, diemCongDong, loiNheConLai,
      tyLeThamGia: caTinh > 0 ? (caTrucDu / caTinh) * 100 : null,
      tyLeDungGio: caCoDen > 0 ? (caDenDungGio / caCoDen) * 100 : null
    };
  }

  function trangThaiNeNep(cs, cfg, tuan) {
    const { nhacNho, canhBao, matTuCach } = cfg.moc;
    const xetTyLe = cs.caTinh >= cfg.soCaTinhToiThieu && cs.tyLeThamGia !== null;
    const thamGia = xetTyLe ? cs.tyLeThamGia : null;
    const tl = thamGia === null ? '' : `${Math.round(thamGia)}%`;
    const ketQua = (muc, lyDo) => ({ muc, lyDo });

    const mat = [];
    if (thamGia !== null && thamGia < matTuCach.thamGia && tuan >= cfg.tuanXetMatTuCach) mat.push(`Tham gia ${tl} < ${matTuCach.thamGia}%`);
    if (cs.soCaBo >= matTuCach.boCa) mat.push(`Bỏ ${cs.soCaBo} ca`);
    if (cs.loiNang >= matTuCach.loiNang) mat.push(`${cs.loiNang} lỗi nặng`);
    if (cs.anToan > 0) mat.push('Vi phạm an toàn nghiêm trọng');
    if (mat.length) return ketQua('mat_tu_cach', mat);

    const cb = [];
    if (thamGia !== null && thamGia < canhBao.thamGia) cb.push(`Tham gia ${tl} < ${canhBao.thamGia}%`);
    if (cs.soCaBo >= canhBao.boCa) cb.push(`Bỏ ${cs.soCaBo} ca`);
    if (cs.loiNang >= canhBao.loiNang) cb.push(`${cs.loiNang} lỗi nặng`);
    if (cs.loiNheConLai >= canhBao.loiNhe) cb.push(`${cs.loiNheConLai} lỗi nhẹ`);
    if (cb.length) return ketQua('canh_bao', cb);

    const nn = [];
    if (thamGia !== null && thamGia < nhacNho.thamGia) nn.push(`Tham gia ${tl} < ${nhacNho.thamGia}%`);
    if (cs.soCaBo >= nhacNho.boCa) nn.push(`Bỏ ${cs.soCaBo} ca`);
    if (cs.loiNheConLai >= nhacNho.loiNhe) nn.push(`${cs.loiNheConLai} lỗi nhẹ`);
    if (nn.length) return ketQua('nhac_nho', nn);

    return ketQua('binh_thuong', []);
  }

  /* Từng tiêu chí của ba loại. `danhGia` là điểm thang 5, null khi chưa chấm (giai đoạn 2). */
  function tieuChiXepLoai(cs, cfg, danhGia) {
    const nang = cs.loiNang + cs.anToan;
    const moc = (nhan, dat, conThieu) => ({ nhan, dat, conThieu });
    const tyLe = (ten, gtri, nguong) =>
      moc(`${ten} ≥ ${nguong}%`, gtri !== null && gtri >= nguong, gtri === null ? 'Chưa có dữ liệu' : gtri >= nguong ? '' : `Hiện ${Math.round(gtri)}%`);
    const gio = (nguong) => moc(`Giờ ≥ ${nguong}`, cs.tongGio >= nguong, cs.tongGio >= nguong ? '' : `Còn thiếu ${(nguong - cs.tongGio).toFixed(1).replace('.', ',')} giờ`);
    const boCa = (nguong) => moc(`Ca bỏ ≤ ${nguong}`, cs.soCaBo <= nguong, cs.soCaBo <= nguong ? '' : `Hiện ${cs.soCaBo} ca`);
    const dg = (nguong) => moc(`Đánh giá ≥ ${String(nguong).replace('.', ',')}`, danhGia !== null && danhGia >= nguong, danhGia === null ? 'Chờ đánh giá cuối kỳ' : '');
    const khongNang = moc('Không lỗi nặng', nang === 0, nang ? `Hiện ${nang} lỗi` : '');

    return [
      { loai: 'Đạt', tieuChi: [tyLe('Tham gia', cs.tyLeThamGia, 80), boCa(1), gio(cfg.gioToiThieu), khongNang, dg(3)] },
      {
        loai: 'Tốt',
        tieuChi: [
          tyLe('Tham gia', cs.tyLeThamGia, 90), boCa(0), tyLe('Đúng giờ', cs.tyLeDungGio, 90), gio(cfg.gioToiThieu), khongNang,
          moc('Lỗi nhẹ ≤ 1', cs.loiNheConLai <= 1, cs.loiNheConLai <= 1 ? '' : `Hiện ${cs.loiNheConLai} lỗi`), dg(4)
        ]
      },
      {
        loai: 'Xuất sắc',
        tieuChi: [
          tyLe('Tham gia', cs.tyLeThamGia, 95), boCa(0), tyLe('Đúng giờ', cs.tyLeDungGio, 95), gio(cfg.gioXuatSac),
          moc('Không lỗi', nang === 0 && cs.loiNheConLai === 0, nang + cs.loiNheConLai ? `Hiện ${nang + cs.loiNheConLai} lỗi` : ''),
          dg(4.5), moc('Điểm cộng đồng ≥ 6', cs.diemCongDong >= 6, cs.diemCongDong >= 6 ? '' : `Hiện ${cs.diemCongDong} điểm`)
        ]
      }
    ];
  }

  /* Điểm thang 5 gợi ý cho quản lý (mục 4); An toàn và Kỹ năng do quản lý tự chấm. */
  function goiYDanhGia(cs) {
    const gioiHan = (n) => Math.max(1, Math.min(5, Math.round(n * 2) / 2));
    return {
      chuyenCan: cs.tyLeThamGia === null ? null : gioiHan((((cs.tyLeThamGia + (cs.tyLeDungGio ?? 0)) / 2) / 100) * 5 - cs.soCaBo * 0.5),
      trachNhiem: gioiHan(5 - cs.loiNheConLai * 0.5 - cs.loiNang * 1.5 - cs.anToan * 3),
      anToan: null,
      kyNang: null,
      thaiDo: gioiHan(3.5 + cs.diemCongDong / 4)
    };
  }

  const TIEU_CHI_DANH_GIA = ['chuyenCan', 'trachNhiem', 'anToan', 'kyNang', 'thaiDo'];
  function diemDanhGiaTB(dg) {
    if (!dg || TIEU_CHI_DANH_GIA.some((k) => typeof dg[k] !== 'number')) return null;
    return Math.round((TIEU_CHI_DANH_GIA.reduce((s, k) => s + dg[k], 0) / TIEU_CHI_DANH_GIA.length) * 100) / 100;
  }

  function xepLoaiKy(cs, cfg, tb, { daTapHuan, datThuViec, matTuCach }) {
    if (!daTapHuan || !datThuViec || matTuCach) return 'Chưa đủ điều kiện';
    const dat = tieuChiXepLoai(cs, cfg, tb).filter((x) => x.tieuChi.every((t) => t.dat));
    return dat.length ? dat[dat.length - 1].loai : 'Chưa đạt';
  }

  /* ---------- Đổi ca (mục 3.2) ---------- */
  function kiemTraNhanCa(ca, mssv, st, nowMs) {
    const loi = [];
    const a = phut(ca.tu);
    const b = phut(ca.den);
    if (ca.mssv === mssv) loi.push('Đây là ca của bạn.');
    if (nowMs >= mocGio(ca.ngay, ca.tu)) loi.push('Ca này đã bắt đầu.');
    const caCuaToi = st.caTruc.filter((c) => c.mssv === mssv && c.ngay === ca.ngay && CA_GIU_CHO.includes(c.trangThai));
    if (caCuaToi.some((c) => giao(a, b, phut(c.tu), phut(c.den)))) loi.push('Bạn đã có ca trùng khung giờ này.');
    const thu = docNgay(ca.ngay).getDay();
    const canhBao = st.thoiKhoaBieu
      .filter((m) => m.mssv === mssv && m.thu === thu && giao(a, b, phut(m.tu), phut(m.den)))
      .map((m) => `Trùng lịch học: ${m.monHoc} (${m.tu}–${m.den}).`);
    return { ok: loi.length === 0, loi, canhBao };
  }

  /* ---------- Việc ngoài ca (mục 5) ---------- */
  const SUAT_DA_GIU = ['da_chot', 'co_mat', 'khong_den'];
  const DANG_THAM_GIA = ['dang_ky', 'da_chot', 'cho', 'co_mat'];
  const soDaChot = (st, viecId, khungId) => st.thamGiaViec.filter((t) => t.viecId === viecId && t.khungId === khungId && SUAT_DA_GIU.includes(t.trangThai)).length;

  function kiemTraDangKyViec(viec, khungId, mssv, st, nowMs) {
    const loi = [];
    const canhBao = [];
    const khung = viec.khungGio.find((k) => k.id === khungId);
    if (!khung) loi.push('Chọn một khung giờ.');
    if (nowMs > viec.hanDangKy) loi.push('Đã qua hạn đăng ký.');
    if (st.thamGiaViec.some((t) => t.viecId === viec.id && t.mssv === mssv && DANG_THAM_GIA.includes(t.trangThai))) loi.push('Bạn đã đăng ký việc này.');
    if (khung) {
      const a = phut(khung.tu);
      const b = phut(khung.den);
      const thu = docNgay(viec.ngay).getDay();
      st.thoiKhoaBieu.filter((m) => m.mssv === mssv && m.thu === thu && giao(a, b, phut(m.tu), phut(m.den)))
        .forEach((m) => canhBao.push(`Trùng lịch học: ${m.monHoc}.`));
      st.caTruc.filter((c) => c.mssv === mssv && c.ngay === viec.ngay && CA_GIU_CHO.includes(c.trangThai) && giao(a, b, phut(c.tu), phut(c.den)))
        .forEach((c) => canhBao.push(`Trùng ca trực ${c.tu}–${c.den}.`));
    }
    const trangThai = viec.cachChot === 'quan_ly' ? 'dang_ky' : khung && soDaChot(st, viec.id, khungId) < viec.soNguoi ? 'da_chot' : 'cho';
    return { ok: loi.length === 0, loi, canhBao, trangThai };
  }

  const nguoiChoKeTiep = (st, viecId, khungId) => st.thamGiaViec.find((t) => t.viecId === viecId && t.khungId === khungId && t.trangThai === 'cho') || null;

  /* Giờ được cộng là phần không trùng ca trực của chính trợ lý, để không tính hai lần. */
  function gioNgoaiCa(st, viec, tg) {
    const khung = viec.khungGio.find((k) => k.id === tg.khungId);
    const a = tg.batDau || mocGio(viec.ngay, khung.tu);
    const b = tg.ketThuc || mocGio(viec.ngay, khung.den);
    const trung = st.caTruc
      .filter((c) => c.mssv === tg.mssv && c.ngay === viec.ngay && CA_GIU_CHO.includes(c.trangThai))
      .reduce((s, c) => s + Math.max(0, Math.min(b, mocGio(c.ngay, c.den)) - Math.max(a, mocGio(c.ngay, c.tu))), 0);
    return Math.max(0, b - a - trung) / GIO;
  }

  const diemDotXuat = (viec, cfg, tot) => cfg.mucDiem[viec.mucDiem] + (tot ? 1 : 0);

  const CHUYEN_VIEC_GIAO = {
    da_giao: { nhan: 'da_nhan', khong_nhan: 'khong_nhan' },
    da_nhan: { bat_dau: 'dang_lam' },
    dang_lam: { bao_xong: 'bao_hoan_thanh' },
    bao_hoan_thanh: { dat: 'hoan_thanh', lam_lai: 'dang_lam' }
  };
  const chuyenViecGiao = (trangThai, hanhDong) => CHUYEN_VIEC_GIAO[trangThai]?.[hanhDong] || null;

  function diemViecGiao(viec, cfg, tg) {
    const goc = cfg.mucDiem[viec.mucDiem];
    const hetHan = mocGio(congNgay(viec.hanHoanThanh, 1), '00:00');
    return tg.baoXongLuc >= hetHan && !tg.daBaoTre ? goc / 2 : goc;
  }

  function thongKeViec(st, mssv, hocKy) {
    const ds = st.thamGiaViec.filter((t) => t.mssv === mssv && t.hocKyId === hocKy.id);
    const viec = (t) => st.viec.find((v) => v.id === t.viecId);
    const dotXuat = ds.filter((t) => viec(t)?.loai === 'dot_xuat');
    const giaoViec = ds.filter((t) => viec(t)?.loai === 'giao');
    const xong = giaoViec.filter((t) => t.trangThai === 'hoan_thanh');
    const dungHan = xong.filter((t) => t.baoXongLuc < mocGio(congNgay(viec(t).hanHoanThanh, 1), '00:00')).length;
    return {
      daDangKy: dotXuat.filter((t) => t.trangThai !== 'da_rut').length,
      daLam: dotXuat.filter((t) => t.trangThai === 'co_mat').length,
      duocGiao: giaoViec.length,
      khongNhan: giaoViec.filter((t) => t.trangThai === 'khong_nhan').length,
      tyLeDungHan: xong.length ? (dungHan / xong.length) * 100 : null,
      tongDiem: ds.reduce((s, t) => s + (t.diem || 0), 0)
    };
  }

  /* Giờ đã duyệt theo từng tuần, tính ở tuần của ngày ca; mssv null là cộng cả phòng. */
  function gioTheoTuan(st, mssv, nowMs, soTuan = 8) {
    const tuanNay = dauTuan(ngayKey(new Date(nowMs)));
    const ds = Array.from({ length: soTuan }, (_, i) => ({ tuan: congNgay(tuanNay, -7 * (soTuan - 1 - i)), gio: 0 }));
    st.luotTruc.filter((l) => l.daDuyet && l.ketThuc && (!mssv || l.mssv === mssv)).forEach((l) => {
      const ca = st.caTruc.find((c) => c.id === l.caTrucId);
      const muc = ca && ds.find((x) => x.tuan === dauTuan(ca.ngay));
      if (muc) muc.gio += (l.ketThuc - l.batDau) / GIO;
    });
    return ds;
  }

  /* Nhắc tự động (cuối mục 8). Tính lại mỗi lần mở trang, không lưu. */
  function nhacTuDong(st, mssv, nowMs) {
    const nhac = [];
    const cfg = st.caiDat;
    st.caTruc.filter((c) => c.mssv === mssv && c.trangThai === 'da_dang_ky').forEach((c) => {
      const con = mocGio(c.ngay, c.tu) - nowMs;
      if (con > 0 && con <= GIO) nhac.push(`Ca ${c.tu}–${c.den} bắt đầu trong vòng 1 giờ.`);
    });
    const tuanSau = congNgay(dauTuan(ngayKey(new Date(nowMs))), 7);
    const conHan = hanKhoaTuan(tuanSau, cfg) - nowMs;
    const coCaTuanSau = st.caTruc.some((c) => c.mssv === mssv && c.ngay >= tuanSau && c.ngay < congNgay(tuanSau, 7) && CA_GIU_CHO.includes(c.trangThai));
    if (conHan > 0 && conHan <= 2 * NGAY && !coCaTuanSau) nhac.push('Bạn chưa đăng ký ca tuần sau, sắp đến hạn khóa.');
    st.thamGiaViec.filter((t) => t.mssv === mssv && ['da_giao', 'da_nhan', 'dang_lam'].includes(t.trangThai)).forEach((t) => {
      const v = st.viec.find((x) => x.id === t.viecId);
      const con = mocGio(congNgay(v.hanHoanThanh, 1), '00:00') - nowMs;
      if (con > 0 && con <= 2 * NGAY) nhac.push(`Việc "${v.ten}" đến hạn ${v.hanHoanThanh.split('-').reverse().join('/')}.`);
    });
    const hk = hocKyHienTai(st, nowMs);
    const tuan = tuanThu(hk, nowMs);
    const cs = tinhChiSo(st, mssv, hk);
    if (tuan >= 8 && cs.tongGio < cfg.gioToiThieu / 2) nhac.push(`Chậm tiến độ giờ: mới có ${Math.round(cs.tongGio)} giờ, mốc tuần 8 là ${cfg.gioToiThieu / 2} giờ.`);
    return nhac;
  }

  /* ---------- Ngân hàng câu hỏi và đề thi (mục 7) ---------- */
  function xao(mang, rng = Math.random) {
    const a = mang.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const laCauUuTien = (q) => /^Trang quản lý/.test(q.chuDe) || ['QR1', 'QR5'].includes(q.maQR);

  function chonCau(ds, soCau, nhomDaDung, uuTien, rng) {
    const tron = xao(ds, rng);
    const sap = uuTien ? [...tron.filter(laCauUuTien), ...tron.filter((q) => !laCauUuTien(q))] : tron;
    const chon = [];
    for (const q of sap) {
      if (chon.length === soCau) break;
      if (nhomDaDung.has(q.nhomY)) continue;
      nhomDaDung.add(q.nhomY);
      chon.push(q);
    }
    if (chon.length < soCau) throw new Error(`Ngân hàng không đủ nhóm ý để lấy ${soCau} câu.`);
    return chon;
  }

  function sinhDe(nganHang, dot, rng = Math.random) {
    const nhomDaDung = new Set();
    const cau = dot.nguon.flatMap((n) => chonCau(nganHang.cauHoi.filter((q) => q.bo === n.bo), n.soCau, nhomDaDung, n.uuTien, rng));
    const tracNghiem = xao(cau, rng).map((q) => {
      const luaChon = xao(['A', 'B', 'C', 'D'], rng).map((goc) => ({ goc, noiDung: q[goc] }));
      return {
        ma: q.ma, chuDe: q.chuDe, maQR: q.maQR, cauHoi: q.cauHoi, luaChon,
        dapAn: luaChon.findIndex((l) => l.goc === q.dapAn), giaiThich: q.giaiThich, nguon: q.nguon
      };
    });
    const dsTuLuan = xao(nganHang.tuLuan.filter((q) => q.bo === dot.boTuLuan), rng);
    if (dsTuLuan.length < dot.soTuLuan) throw new Error(`Ngân hàng không đủ ${dot.soTuLuan} câu tự luận.`);
    const tuLuan = dsTuLuan.slice(0, dot.soTuLuan).map((q) => ({
      ma: q.ma, tinhHuong: q.tinhHuong, yChinh: q.yChinh, diemToiDa: q.diemToiDa, traLoi: '', yDat: [], diem: null
    }));
    return { tracNghiem, tuLuan };
  }

  const chamTN = (bai) => bai.de.tracNghiem.filter((q) => bai.traLoi[q.ma] === q.dapAn).length;

  function chamTuLuan(cau, yDat) {
    const n = cau.yChinh.length;
    return Math.round((yDat.length / n) * cau.diemToiDa * 10) / 10;
  }

  function ketLuanBai(bai, dot) {
    const cau = bai.de.tuLuan;
    if (cau.some((c) => c.diem === null)) return 'cho_cham';
    const tn = (bai.diemTN / bai.de.tracNghiem.length) * 100;
    const diem10 = cau.map((c) => (c.diem / c.diemToiDa) * 10);
    const { dat } = dot;
    const datTN = tn >= dat.tn;
    const datMoiCau = dat.tlMoiCau === undefined || diem10.every((d) => d >= dat.tlMoiCau);
    const datTB = dat.tlTB === undefined || (diem10.length > 0 && diem10.reduce((s, d) => s + d, 0) / diem10.length >= dat.tlTB);
    return datTN && datMoiCau && datTB ? 'dat' : 'khong_dat';
  }

  /* ---------- Quản lý ngân hàng nhiều file ---------- */
  const NGAN_HANG_TRONG = () => ({ files: [], cauHoi: [], tuLuan: [] });

  /* Mã câu và nhóm ý chỉ có nghĩa trong một file: trùng với file khác thì tự thêm tiền tố để hai câu không lẫn nhau. */
  function themFileNganHang(bank, tenFile, kq, { id, luc, nguoi, thayFileId = null }) {
    const giu = {
      files: bank.files.filter((f) => f.id !== thayFileId),
      cauHoi: bank.cauHoi.filter((q) => q.fileId !== thayFileId),
      tuLuan: bank.tuLuan.filter((q) => q.fileId !== thayFileId)
    };
    const maDaCo = new Set([...giu.cauHoi, ...giu.tuLuan].map((q) => q.ma));
    const nhomDaCo = new Set(giu.cauHoi.map((q) => q.nhomY));
    const trung = [...kq.cauHoi, ...kq.tuLuan].filter((q) => maDaCo.has(q.ma)).length;
    let so = giu.files.length + 1;
    while ([...maDaCo].some((m) => m.startsWith(`F${so}-`))) so += 1;
    const tienTo = `F${so}-`;
    const doiMa = (q) => (maDaCo.has(q.ma) ? `${tienTo}${q.ma}` : q.ma);
    const cauHoi = kq.cauHoi.map((q) => ({ ...q, ma: doiMa(q), nhomY: nhomDaCo.has(q.nhomY) ? `${tienTo}${q.nhomY}` : q.nhomY, fileId: id }));
    const tuLuan = kq.tuLuan.map((q) => ({ ...q, ma: doiMa(q), fileId: id }));
    return {
      soDoiMa: trung,
      bank: {
        files: [...giu.files, { id, ten: tenFile, luc, nguoi }],
        cauHoi: [...giu.cauHoi, ...cauHoi],
        tuLuan: [...giu.tuLuan, ...tuLuan]
      }
    };
  }

  const xoaFileNganHang = (bank, id) => ({
    files: bank.files.filter((f) => f.id !== id),
    cauHoi: bank.cauHoi.filter((q) => q.fileId !== id),
    tuLuan: bank.tuLuan.filter((q) => q.fileId !== id)
  });

  function thongKeNganHang(bank) {
    const { cauHoi, tuLuan } = bank;
    const dem = (bo) => cauHoi.filter((q) => q.bo === bo).length;
    return {
      tuyen: dem('Tuyển'), thuViec: dem('Thử việc'), tuLuan: tuLuan.length, thieuGiaiThich: cauHoi.filter((q) => !q.giaiThich).length,
      chuDe: [...new Set(cauHoi.map((q) => q.chuDe))], maQR: [...new Set(cauHoi.map((q) => q.maQR))],
      files: bank.files.map((f) => ({ ...f, soTN: cauHoi.filter((q) => q.fileId === f.id).length, soTL: tuLuan.filter((q) => q.fileId === f.id).length }))
    };
  }

  /* Dùng để báo trước khi ngân hàng không còn đủ câu cho một đợt. */
  function canhBaoDuDe(bank, dsDot) {
    return dsDot.flatMap((dot) => {
      try {
        sinhDe(bank, dot);
        return [];
      } catch (loi) {
        return [`${dot.ten}: ${loi.message}`];
      }
    });
  }

  function kiemTraCauHoi(q, bank, maCu) {
    const loi = [];
    if (!q.ma) loi.push('Thiếu mã câu.');
    if (q.ma !== maCu && bank.cauHoi.concat(bank.tuLuan).some((x) => x.ma === q.ma)) loi.push('Mã câu đã có.');
    if (!['Tuyển', 'Thử việc'].includes(q.bo)) loi.push('Bộ phải là Tuyển hoặc Thử việc.');
    if (!q.nhomY) loi.push('Thiếu nhóm ý.');
    if (!q.cauHoi || !q.A || !q.B || !q.C || !q.D) loi.push('Thiếu nội dung câu hỏi hoặc phương án.');
    if (!['A', 'B', 'C', 'D'].includes(q.dapAn)) loi.push('Đáp án phải là A, B, C hoặc D.');
    return loi;
  }

  function kiemTraTuLuan(q, bank, maCu) {
    const loi = [];
    if (!q.ma) loi.push('Thiếu mã câu.');
    if (q.ma !== maCu && bank.cauHoi.concat(bank.tuLuan).some((x) => x.ma === q.ma)) loi.push('Mã câu đã có.');
    if (!['Tuyển', 'Thử việc'].includes(q.bo)) loi.push('Bộ phải là Tuyển hoặc Thử việc.');
    if (!q.tinhHuong) loi.push('Thiếu tình huống.');
    if (!q.yChinh?.length) loi.push('Cần ít nhất một ý chính.');
    if (!(q.diemToiDa > 0)) loi.push('Điểm tối đa phải lớn hơn 0.');
    return loi;
  }

  /* ---------- Lộ trình tuyển ---------- */
  const daXacNhanNoiQuy = (st, mssv) => (st.xacNhanNoiQuy || []).some((x) => x.mssv === mssv && x.phienBan === (st.caiDat.phienBanNoiQuy || 1));

  function loTrinhTuyen(st, mssv) {
    const batBuoc = (st.taiLieu || []).filter((t) => t.hoatDong && t.batBuoc);
    const daDoc = new Set((st.daDocTaiLieu || []).filter((d) => d.mssv === mssv).map((d) => d.taiLieuId));
    const soDaDoc = batBuoc.filter((t) => daDoc.has(t.id)).length;
    const docXong = soDaDoc === batBuoc.length;
    const noiQuyXong = daXacNhanNoiQuy(st, mssv);
    const dangKy = (st.thamGiaBuoi || []).filter((x) => x.mssv === mssv).map((x) => x.buoiId);
    const buoi = (st.buoiKhaoSat || []).find((b) => dangKy.includes(b.id)) || null;
    return { tongBatBuoc: batBuoc.length, soDaDoc, docXong, noiQuyXong, sanSang: docXong && noiQuyXong, buoi };
  }

  function kiemTraDangKyBuoi(st, buoi, mssv, nowMs) {
    const lt = loTrinhTuyen(st, mssv);
    if (!lt.sanSang) return 'Đọc xong tài liệu bắt buộc và cam kết nội quy trước.';
    if (lt.buoi) return 'Bạn đã đăng ký một buổi rồi.';
    if (buoi.dongDangKy || nowMs >= mocGio(buoi.ngay, buoi.den)) return 'Buổi này đã đóng đăng ký.';
    if ((st.thamGiaBuoi || []).filter((x) => x.buoiId === buoi.id).length >= buoi.soCho) return 'Buổi này đã đủ chỗ.';
    return null;
  }

  function kiemTraVaoKhaoSat(st, mssv, maVao) {
    const lt = loTrinhTuyen(st, mssv);
    if (!lt.sanSang) return 'Đọc xong tài liệu bắt buộc và cam kết nội quy trước.';
    if (!lt.buoi) return 'Bạn chưa đăng ký buổi khảo sát.';
    if (!lt.buoi.dangMo) return 'Buổi khảo sát chưa mở.';
    if (String(maVao || '').trim() !== lt.buoi.maVao) return 'Mã vào bài không đúng.';
    return null;
  }

  /* Ôn luyện có đáp án: ứng viên chỉ ôn bộ Tuyển, sau khi đã đọc xong tài liệu. */
  function duocOnLuyen(st, troLy) {
    if (['thu_viec', 'dang_hoat_dong'].includes(troLy.trangThai)) return true;
    return troLy.trangThai === 'cho_duyet' && st.caiDat.choOnTruocKhaoSat !== false && loTrinhTuyen(st, troLy.mssv).docXong;
  }

  /* Trợ lý do Admin thêm vào app chỉ bằng mã. Bỏ các ký tự dễ nhầm như 0/O, 1/I/L. */
  const KY_TU_MA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  function taoMaKichHoat(dsTroLy, rng = Math.random) {
    for (;;) {
      const ma = Array.from({ length: 6 }, () => KY_TU_MA[Math.floor(rng() * KY_TU_MA.length)]).join('');
      if (!dsTroLy.some((t) => t.maKichHoat === ma)) return ma;
    }
  }
  const chuanHoaMa = (ma) => String(ma || '').trim().toUpperCase();
  const timTheoMa = (dsTroLy, ma) => (chuanHoaMa(ma) ? dsTroLy.find((t) => t.maKichHoat === chuanHoaMa(ma)) || null : null);

  /* Đợt còn được làm khi chưa có bài nào, hoặc mọi bài trước đã được quản lý mở lại. */
  const baiHieuLuc = (st, mssv, dotId) => st.baiLam.filter((b) => b.mssv === mssv && b.dotId === dotId && !b.moLaiBoi).pop() || null;

  function docNganHang(dongTN, dongTL) {
    const loi = [];
    const chuoi = (v) => (v === undefined || v === null ? '' : String(v).trim());
    const maDaCo = new Set();
    const canCot = ['Mã câu', 'Bộ', 'Chủ đề', 'Mã QR', 'Mức độ', 'Nhóm ý', 'Câu hỏi', 'A', 'B', 'C', 'D', 'Đáp án'];
    if (!dongTN.length || canCot.some((c) => !(c in dongTN[0]))) {
      return { cauHoi: [], tuLuan: [], loi: ['Sheet "Trắc nghiệm" thiếu cột theo mẫu (mục 7.1).'] };
    }
    const cauHoi = dongTN.map((r, i) => {
      const q = {
        ma: chuoi(r['Mã câu']), bo: chuoi(r['Bộ']), chuDe: chuoi(r['Chủ đề']), maQR: chuoi(r['Mã QR']), mucDo: chuoi(r['Mức độ']),
        nhomY: chuoi(r['Nhóm ý']), cauHoi: chuoi(r['Câu hỏi']), A: chuoi(r.A), B: chuoi(r.B), C: chuoi(r.C), D: chuoi(r.D),
        dapAn: chuoi(r['Đáp án']).toUpperCase(), giaiThich: chuoi(r['Giải thích']), nguon: chuoi(r['Nguồn'])
      };
      const dong = i + 2;
      if (!q.ma || maDaCo.has(q.ma)) loi.push(`Dòng ${dong}: mã câu trống hoặc trùng.`);
      maDaCo.add(q.ma);
      if (!['A', 'B', 'C', 'D'].includes(q.dapAn)) loi.push(`Dòng ${dong}: đáp án phải là A, B, C hoặc D.`);
      if (!q.nhomY) loi.push(`Dòng ${dong}: thiếu nhóm ý.`);
      if (!q.cauHoi || !q.A || !q.B || !q.C || !q.D) loi.push(`Dòng ${dong}: thiếu nội dung câu hỏi hoặc phương án.`);
      return q;
    });
    const cotY = dongTL.length ? Object.keys(dongTL[0]).find((k) => k.startsWith('Ý chính cần có')) : null;
    if (dongTL.length && !cotY) loi.push('Sheet "Tự luận" thiếu cột "Ý chính cần có".');
    const tuLuan = dongTL.map((r, i) => {
      const yChinh = chuoi(r[cotY]).split('\n').map((y) => y.trim().replace(/^\d+[.)]\s*/, '')).filter(Boolean);
      const diemToiDa = Number(r['Điểm tối đa']);
      if (!yChinh.length || !diemToiDa) loi.push(`Tự luận dòng ${i + 2}: thiếu ý chính hoặc điểm tối đa.`);
      return { ma: chuoi(r['Mã câu']), bo: chuoi(r['Bộ']), chuDe: chuoi(r['Chủ đề']), maQR: chuoi(r['Mã QR']), tinhHuong: chuoi(r['Tình huống']), yChinh, diemToiDa, phutGoiY: Number(r['Thời gian gợi ý (phút)']) || 0, nguon: chuoi(r['Nguồn']) };
    });
    return { cauHoi, tuLuan, loi };
  }

  /* ---------- Phân quyền tài khoản quản lý ----------
     trang: mục menu được mở; tap: dữ liệu được ghi; xoa: dữ liệu được xóa. Admin luôn có mọi quyền.
     Tài khoản cũ chưa được phân quyền giữ đúng phần việc trước đây (QUYEN_MAC_DINH). */
  const QUYEN = [
    { ma: 'ca_truc', nhom: 'Vận hành', ten: 'Bảng ca: theo dõi, duyệt giờ trực, ghi vắng', trang: ['bang-ca'], tap: ['caTruc', 'luotTruc', 'checklistCa', 'banGiao'] },
    { ma: 'tro_ly', nhom: 'Vận hành', ten: 'Danh sách trợ lý: xem hồ sơ, đổi trạng thái, xuất Excel', trang: ['danh-sach'], tap: ['troLy'] },
    { ma: 'them_tro_ly', nhom: 'Vận hành', ten: 'Thêm trợ lý và cấp mã vào web', trang: ['danh-sach'], tap: ['troLy'] },
    { ma: 'duyet_don', nhom: 'Vận hành', ten: 'Duyệt đơn: xin vắng, đổi ca, chuyển máy, PTN hủy ca', trang: ['duyet-don'], tap: ['donVang', 'doiCa', 'deNghi', 'caTruc', 'troLy'] },
    { ma: 'ne_nep', nhom: 'Vận hành', ten: 'Ghi sổ nề nếp, xem cảnh báo, mở phản hồi', trang: ['so-ne-nep', 'canh-bao'], tap: ['soNeNep', 'deXuatMat'] },
    { ma: 'quyet_mat', nhom: 'Vận hành', ten: 'Quyết định mất tư cách, xóa ghi nhận nề nếp', trang: ['so-ne-nep', 'canh-bao'], tap: ['deXuatMat', 'troLy'], xoa: ['soNeNep'] },
    { ma: 'thong_bao', nhom: 'Việc và tin', ten: 'Soạn thông báo', trang: ['thong-bao-ql'], tap: ['dangKyNhanTin'] },
    { ma: 'viec', nhom: 'Việc và tin', ten: 'Việc ngoài ca: tạo việc, chốt người, xác nhận', trang: ['viec-ngoai-ca'], tap: ['viec', 'thamGiaViec', 'soNeNep'] },
    { ma: 'tap_huan', nhom: 'Tập huấn', ten: 'Buổi khảo sát, chấm và mở lại bài', trang: ['quan-ly-tap-huan'], tap: ['buoiKhaoSat', 'baiLam'], xoa: ['buoiKhaoSat'] },
    { ma: 'ngan_hang', nhom: 'Tập huấn', ten: 'Ngân hàng câu hỏi: xem, nạp file, sửa câu', trang: ['ngan-hang'] },
    { ma: 'xoa_ngan_hang', nhom: 'Tập huấn', ten: 'Xóa file và câu hỏi trong ngân hàng', trang: ['ngan-hang'] },
    { ma: 'noi_dung', nhom: 'Tập huấn', ten: 'Sửa tài liệu tập huấn và nội quy', trang: [], tap: ['taiLieu', 'noiQuy'], xoa: ['taiLieu', 'noiQuy'] },
    { ma: 'cuoi_ky', nhom: 'Tập huấn', ten: 'Đánh giá cuối kỳ', trang: ['cuoi-ky'], tap: ['danhGia'] },
    { ma: 'chot_xep_loai', nhom: 'Tập huấn', ten: 'Chốt xếp loại học kỳ', trang: ['cuoi-ky'], tap: ['xepLoaiKy'], xoa: ['xepLoaiKy'] },
    { ma: 'cai_dat', nhom: 'Hệ thống', ten: 'Cài đặt: đợt tuyển, học kỳ, mốc, đề, checklist, danh mục', trang: ['cai-dat'], tap: ['hocKy', 'dotTuyen', 'dotKiemTra', 'checklistMau'], xoa: ['checklistMau'] },
    { ma: 'nhat_ky', nhom: 'Hệ thống', ten: 'Xem nhật ký thao tác', trang: ['nhat-ky'] }
  ];
  const QUYEN_MAC_DINH = ['ca_truc', 'tro_ly', 'duyet_don', 'ne_nep', 'thong_bao', 'viec', 'tap_huan', 'ngan_hang', 'cuoi_ky'];

  function quyenCua(tk) {
    if (!tk) return [];
    if (tk.vaiTro === 'admin') return QUYEN.map((q) => q.ma);
    const co = Array.isArray(tk.quyen) ? tk.quyen : QUYEN_MAC_DINH;
    return QUYEN.map((q) => q.ma).filter((ma) => co.includes(ma));
  }
  const coQuyen = (tk, ma) => quyenCua(tk).includes(ma);
  const duocGhi = (tk, tap, loai = 'tap') => QUYEN.some((q) => (q[loai] || []).includes(tap) && coQuyen(tk, q.ma));

  return {
    QUYEN, QUYEN_MAC_DINH, quyenCua, coQuyen, duocGhi,
    PHUT, GIO, NGAY, CAI_DAT_MAC_DINH, DOT_KIEM_TRA_MAC_DINH, CHECKLIST_MAC_DINH, DANH_MUC_LOI_MAC_DINH, CA_GIU_CHO,
    phut, hhmm, ngayKey, docNgay, mocGio, congNgay, dauTuan, hanKhoaTuan, tuanThu, hocKyHienTai, dotTuyenMo,
    soNguoiTrongKhung, kiemTraDangKyCa, loaiHuy, mucChecklist, checklistXong, danhGiaLuot,
    tinhChiSo, trangThaiNeNep, tieuChiXepLoai, goiYDanhGia, diemDanhGiaTB, xepLoaiKy, TIEU_CHI_DANH_GIA,
    kiemTraNhanCa, kiemTraDangKyViec, nguoiChoKeTiep, soDaChot, gioNgoaiCa, diemDotXuat, chuyenViecGiao, diemViecGiao, thongKeViec, nhacTuDong, gioTheoTuan,
    xao, laCauUuTien, sinhDe, chamTN, chamTuLuan, ketLuanBai, baiHieuLuc, docNganHang,
    NGAN_HANG_TRONG, themFileNganHang, xoaFileNganHang, thongKeNganHang, canhBaoDuDe, kiemTraCauHoi, kiemTraTuLuan,
    taoMaKichHoat, timTheoMa, daXacNhanNoiQuy, loTrinhTuyen, kiemTraDangKyBuoi, kiemTraVaoKhaoSat, duocOnLuyen
  };
});
