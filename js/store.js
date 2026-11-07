/* Lớp dữ liệu. Giao diện chỉ gọi Store; giai đoạn 2 thay `boLuu` và `Store.now` bằng máy chủ
   (đồng hồ bài kiểm tra phải theo giờ máy chủ, mục 7.2) mà không sửa các trang. */
(function () {
  const L = window.Logic;
  /* Tiền tố riêng: web này chung tên miền quanlyptn.github.io với hai web mượn trả. */
  const KHOA = { duLieu: 'tlptn-du-lieu-v1', phien: 'tlptn-phien-v1', dongHo: 'tlptn-lech-dong-ho-v1', maMay: 'tlptn-ma-may' };

  const boLuu = {
    doc(khoa) {
      try {
        return JSON.parse(localStorage.getItem(khoa));
      } catch {
        return null;
      }
    },
    ghi(khoa, giaTri) {
      localStorage.setItem(khoa, JSON.stringify(giaTri));
    }
  };

  const TU_XA = Boolean(window.CAU_HINH?.apiUrl);

  /* Bản chạy trên máy mới cần ngân hàng; bản thật không được tải file có đáp án. */
  const taiNganHang = () => new Promise((xong, loi) => {
    const the = document.createElement('script');
    the.src = 'data/ngan-hang.js';
    the.onload = xong;
    the.onerror = () => loi(new Error('Không tải được ngân hàng câu hỏi.'));
    document.head.appendChild(the);
  });

  /* Bộ sưu tập thêm ở giai đoạn 2; dữ liệu đã lưu từ bản trước được bổ sung khi mở app. */
  const BO_SUU_TAP_MOI = ['donVang', 'doiCa', 'deNghi', 'thongBao', 'viec', 'thamGiaViec', 'danhGia', 'xepLoaiKy', 'daDocTaiLieu', 'xacNhanNoiQuy', 'buoiKhaoSat', 'thamGiaBuoi'];

  let dem = 0;
  const taoId = (tienTo) => `${tienTo}-${Date.now().toString(36)}-${(dem++).toString(36)}`;

  /* Dữ liệu mẫu để xem thử; tên và MSSV đều là giả định. */
  function taoDuLieuMau(nowMs) {
    const homNay = L.ngayKey(new Date(nowMs));
    const tuan0 = L.congNgay(L.dauTuan(homNay), -9 * 7);
    const hocKy = { id: 'hk1-2026', ten: 'Học kỳ 1, 2026–2027', tuNgay: tuan0, denNgay: L.congNgay(tuan0, 18 * 7 - 1) };

    const st = {
      caiDat: JSON.parse(JSON.stringify(L.CAI_DAT_MAC_DINH)),
      dotKiemTra: JSON.parse(JSON.stringify(L.DOT_KIEM_TRA_MAC_DINH)),
      danhMucLoi: JSON.parse(JSON.stringify(L.DANH_MUC_LOI_MAC_DINH)),
      hocKy: [hocKy],
      dotTuyen: [{ id: 'dt-1', ten: 'Đợt tuyển học kỳ 1', tuNgay: L.congNgay(homNay, -7), denNgay: L.congNgay(homNay, 21), moDangKy: true }],
      taiKhoan: [
        { id: 'admin', email: 'admin@ptn.demo', ten: 'Admin PTN', vaiTro: 'admin', khoa: false },
        { id: 'ql-1', email: 'quanly1@ptn.demo', ten: 'Quản lý 1', vaiTro: 'quan_ly', khoa: false }
      ],
      troLy: [],
      thoiKhoaBieu: [],
      caTruc: [],
      luotTruc: [],
      checklistMau: JSON.parse(JSON.stringify(L.CHECKLIST_MAC_DINH)),
      checklistCa: [],
      banGiao: [],
      soNeNep: [],
      baiLam: [],
      caiSai: {},
      deXuatMat: [],
      dangKyNhanTin: [],
      nganHang: null,
      nhatKy: [],
      taiLieu: JSON.parse(JSON.stringify(window.NoiDung.taiLieu)),
      noiQuy: JSON.parse(JSON.stringify(window.NoiDung.noiQuy)),
      ...Object.fromEntries(BO_SUU_TAP_MOI.map((k) => [k, []]))
    };

    const hoSo = [
      ['2200100001', 'Trần Minh Anh', '2004-03-14', 'DH22CNSH1', 'Công nghệ sinh học', 2026, 'dang_hoat_dong', { soCa: 4 }],
      ['2200100002', 'Lê Hoàng Nam', '2004-07-02', 'DH22CNTP1', 'Công nghệ thực phẩm', 2027, 'dang_hoat_dong', { soCa: 3, vang: [3] }],
      ['2200100003', 'Phạm Thu Hà', '2003-11-21', 'DH22CNSH2', 'Công nghệ sinh học', 2026, 'dang_hoat_dong', { soCa: 3, tre: true, loi: ['loi_nang', 'Giao chìa sai quy định'] }],
      ['2200100004', 'Võ Quốc Bảo', '2004-11-05', 'DH22CNTP2', 'Công nghệ thực phẩm', 2027, 'dang_hoat_dong', { soCa: 2, vang: [1, 4, 6] }],
      ['2300100005', 'Đặng Ngọc Mai', '2005-01-30', 'DH23CNSH1', 'Công nghệ sinh học', 2027, 'thu_viec', { soCa: 2, tuTuan: 8 }],
      ['2300100006', 'Bùi Gia Hân', '2005-06-18', 'DH23CNTP1', 'Công nghệ thực phẩm', 2028, 'cho_duyet', { soCa: 0 }]
    ];

    hoSo.forEach(([mssv, hoTen, ngaySinh, lop, nganh, namRaTruong, trangThai, hs], i) => {
      st.troLy.push({
        mssv, hoTen, ngaySinh, lop, nganh, namRaTruong, sdt: `09000000${String(i + 1).padStart(2, '0')}`, email: `${mssv}@demo.ptn`,
        maMay: `TB-DEMO0${i + 1}`, trangThai, ngayDangKy: tuan0, ngayDuyet: trangThai === 'cho_duyet' ? null : tuan0,
        nguoiDuyet: trangThai === 'cho_duyet' ? null : 'ql-1', ngayChinhThuc: trangThai === 'dang_hoat_dong' ? L.congNgay(tuan0, 14) : null
      });
      themLichSuMau(st, mssv, i, hs, tuan0, homNay);
      if (hs.loi) st.soNeNep.push({ id: taoId('nn'), mssv, ngay: L.congNgay(homNay, -10), loai: hs.loi[0], danhMuc: hs.loi[1], ghiChu: 'Ghi nhận mẫu', nguoiGhi: 'ql-1', phanHoi: '' });
    });

    themCaGanDay(st, homNay);
    themViecMau(st, homNay, nowMs);
    st.buoiKhaoSat.push({ id: 'buoi-1', ten: 'Buổi khảo sát 1', ngay: L.congNgay(homNay, 4), tu: '08:00', den: '09:30', diaDiem: 'F4.02', soCho: 10, maVao: '', dangMo: false });
    return st;
  }

  function themLichSuMau(st, mssv, thuTu, hs, tuan0, homNay) {
    const CA = [['07:30', '11:00'], ['13:00', '16:30'], ['08:00', '11:30'], ['13:30', '16:00']];
    let stt = 0;
    for (let tuan = hs.tuTuan || 0; tuan < 10; tuan++) {
      for (let k = 0; k < hs.soCa; k++) {
        const ngay = L.congNgay(tuan0, tuan * 7 + ((thuTu + k * 2) % 6));
        if (ngay >= homNay) continue;
        const [tu, den] = CA[(thuTu + k) % CA.length];
        const id = taoId('ca');
        stt += 1;
        if ((hs.vang || []).includes(stt)) {
          st.caTruc.push({ id, mssv, ngay, tu, den, trangThai: 'vang_khong_bao', hocKyId: st.hocKy[0].id });
          continue;
        }
        const tre = hs.tre && stt % 3 === 0 ? 12 : 2;
        const ca = { id, mssv, ngay, tu, den, trangThai: 'da_truc', hocKyId: st.hocKy[0].id };
        const batDau = L.mocGio(ngay, tu) + tre * L.PHUT;
        const ketThuc = L.mocGio(ngay, den);
        const luot = { id: taoId('lt'), caTrucId: id, mssv, batDau, ketThuc, ketThucBoi: 'tro_ly', daDuyet: true, nguoiDuyet: 'ql-1', gioDuyet: ketThuc };
        Object.assign(luot, pick(L.danhGiaLuot(ca, luot, st.caiDat, { daXongChecklist: true, raSomCoPhep: false })));
        st.caTruc.push(ca);
        st.luotTruc.push(luot);
      }
    }
  }

  const pick = ({ dungGio, trucDu }) => ({ dungGio, trucDu });

  /* Ca hôm nay, ca chờ duyệt và ca tuần sau để mở lên là có việc để thử ngay. */
  function themCaGanDay(st, homNay) {
    const hk = st.hocKy[0].id;
    const ngayLam = (n) => {
      let k = L.congNgay(homNay, n);
      while (!st.caiDat.thuLamViec.includes(L.docNgay(k).getDay())) k = L.congNgay(k, n < 0 ? -1 : 1);
      return k;
    };
    const homTruoc = ngayLam(-1);
    if (st.caiDat.thuLamViec.includes(L.docNgay(homNay).getDay())) {
      st.caTruc.push(
        { id: taoId('ca'), mssv: '2200100002', ngay: homNay, tu: '08:00', den: '11:30', trangThai: 'da_dang_ky', hocKyId: hk },
        { id: taoId('ca'), mssv: '2200100003', ngay: homNay, tu: '13:00', den: '16:30', trangThai: 'da_dang_ky', hocKyId: hk }
      );
    }
    const caCho = { id: taoId('ca'), mssv: '2200100002', ngay: homTruoc, tu: '13:00', den: '16:30', trangThai: 'da_dang_ky', hocKyId: hk };
    const caQuen = { id: taoId('ca'), mssv: '2200100003', ngay: homTruoc, tu: '08:00', den: '11:30', trangThai: 'da_dang_ky', hocKyId: hk };
    st.caTruc.push(caCho, caQuen);
    st.luotTruc.push(
      { id: taoId('lt'), caTrucId: caCho.id, mssv: caCho.mssv, batDau: L.mocGio(homTruoc, '13:04'), ketThuc: L.mocGio(homTruoc, '16:30'), ketThucBoi: 'tro_ly', daDuyet: false },
      { id: taoId('lt'), caTrucId: caQuen.id, mssv: caQuen.mssv, batDau: L.mocGio(homTruoc, '08:02'), ketThuc: null, ketThucBoi: null, daDuyet: false }
    );
    const ngayCa = ngayLam(1);
    st.caTruc.push(
      { id: taoId('ca'), mssv: '2200100001', ngay: ngayCa, tu: '07:30', den: '11:00', trangThai: 'da_dang_ky', hocKyId: hk },
      { id: taoId('ca'), mssv: '2200100002', ngay: ngayCa, tu: '13:00', den: '16:30', trangThai: 'da_dang_ky', hocKyId: hk }
    );
    const tuanSau = L.congNgay(L.dauTuan(homNay), 7);
    [['2200100001', 1, '08:00', '11:30'], ['2200100002', 1, '08:00', '10:00'], ['2200100003', 1, '09:00', '11:30'], ['2200100002', 3, '13:00', '16:30'], ['2200100003', 4, '07:30', '11:00']].forEach(([mssv, n, tu, den]) =>
      st.caTruc.push({ id: taoId('ca'), mssv, ngay: L.congNgay(tuanSau, n), tu, den, trangThai: 'da_dang_ky', hocKyId: hk }));
    st.banGiao.push({ id: taoId('bg'), luotTrucId: st.luotTruc[0].id, noiDung: 'Tủ hóa chất số 2 đã kiểm đếm xong, còn thiếu nhãn 3 chai.' });
  }

  function themViecMau(st, homNay, nowMs) {
    const homSau = L.congNgay(homNay, 3);
    st.viec.push(
      {
        id: 'viec-1', loai: 'dot_xuat', ten: 'Soạn dụng cụ lớp thực hành Vi sinh', moTa: 'Soạn và kiểm đếm dụng cụ cho 2 lớp.', ngay: homSau, diaDiem: 'F4.02',
        khungGio: [{ id: 'k1', tu: '13:00', den: '15:00' }, { id: 'k2', tu: '15:00', den: '16:30' }], soNguoi: 2, hanDangKy: nowMs + 2 * L.NGAY, hanHoanThanh: null,
        mucDiem: 'vua', cachChot: 'thu_tu', cauHoiBieuMau: [{ id: 'q1', cauHoi: 'Bạn đã từng soạn dụng cụ chưa?', kieu: 'chon_mot', luaChon: ['Rồi', 'Chưa'] }], laMau: false
      },
      {
        id: 'viec-2', loai: 'giao', ten: 'Kiểm kê tủ hóa chất số 2', moTa: 'Đối chiếu số chai với sổ kho.', ngay: homNay, diaDiem: 'Kho F4.02', khungGio: [], soNguoi: 1,
        hanDangKy: null, hanHoanThanh: L.congNgay(homNay, 5), mucDiem: 'vua', cachChot: 'quan_ly', cauHoiBieuMau: [], laMau: false
      },
      {
        id: 'mau-1', loai: 'dot_xuat', ten: 'Chuyển đồ về kho', moTa: '', ngay: '', diaDiem: 'F4.02', khungGio: [{ id: 'k1', tu: '13:00', den: '14:00' }], soNguoi: 2,
        hanDangKy: null, hanHoanThanh: null, mucDiem: 'nho', cachChot: 'thu_tu', cauHoiBieuMau: [], laMau: true
      }
    );
    st.thamGiaViec.push({ id: 'tg-1', viecId: 'viec-2', mssv: '2200100001', hocKyId: st.hocKy[0].id, trangThai: 'da_giao', traLoi: {}, diem: 0 });
    st.thongBao.push(
      { id: 'tb-1', tieuDe: 'Mở đăng ký việc đột xuất', noiDung: 'Soạn dụng cụ lớp thực hành Vi sinh, xem ở mục Việc của tôi.', loai: 'viec_dot_xuat', nguoiNhan: st.troLy.map((t) => t.mssv), daDoc: [], taoBoi: 'Quản lý 1', luc: nowMs },
      { id: 'tb-2', tieuDe: 'Bạn được giao việc', noiDung: 'Kiểm kê tủ hóa chất số 2.', loai: 'viec_giao', nguoiNhan: ['2200100001'], daDoc: [], taoBoi: 'Quản lý 1', luc: nowMs }
    );
  }

  const Store = {
    tuXa: TU_XA,
    state: null,
    phien: null,
    lechDongHo: 0,

    /* Mọi chỗ cần giờ đều qua đây, không gọi Date.now() ở giao diện. */
    now() {
      return Date.now() + this.lechDongHo;
    },

    async khoiTao() {
      if (TU_XA) {
        this.phien = { vaiTro: 'tro_ly', mssv: null, taiKhoanId: null };
        return DongBo.khoiTao();
      }
      await taiNganHang();
      this.lechDongHo = boLuu.doc(KHOA.dongHo) || 0;
      this.phien = boLuu.doc(KHOA.phien) || { vaiTro: 'tro_ly', mssv: '2200100001', taiKhoanId: 'ql-1' };
      this.state = boLuu.doc(KHOA.duLieu);
      if (!this.state) {
        this.state = taoDuLieuMau(this.now());
        this.luu();
      }
      BO_SUU_TAP_MOI.forEach((k) => (this.state[k] ||= []));
      this.state.caiDat.mucDiem ||= { ...L.CAI_DAT_MAC_DINH.mucDiem };
      this.state.taiLieu ||= JSON.parse(JSON.stringify(window.NoiDung.taiLieu));
      this.state.noiQuy ||= JSON.parse(JSON.stringify(window.NoiDung.noiQuy));
    },

    taiLai() {
      this.state = boLuu.doc(KHOA.duLieu) || this.state;
    },

    luu() {
      if (TU_XA) return void DongBo.day();
      boLuu.ghi(KHOA.duLieu, this.state);
    },

    luuPhien() {
      if (!TU_XA) boLuu.ghi(KHOA.phien, this.phien);
    },

    datDongHo(msMoi) {
      this.lechDongHo = msMoi === null ? 0 : msMoi - Date.now();
      boLuu.ghi(KHOA.dongHo, this.lechDongHo);
    },

    datLaiDuLieu() {
      this.lechDongHo = 0;
      boLuu.ghi(KHOA.dongHo, 0);
      this.state = taoDuLieuMau(this.now());
      this.phien = { vaiTro: 'admin', mssv: '2200100001', taiKhoanId: 'admin' };
      this.luu();
      this.luuPhien();
    },

    maMay() {
      let ma = boLuu.doc(KHOA.maMay);
      if (!ma) {
        const kyTu = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        ma = `TB-${Array.from({ length: 6 }, () => kyTu[Math.floor(Math.random() * kyTu.length)]).join('')}`;
        boLuu.ghi(KHOA.maMay, ma);
      }
      return ma;
    },

    id: taoId,

    /* Bản trên máy: ngân hàng mặc định được coi là file đầu tiên, sửa xóa được như file nạp vào. */
    nganHang() {
      const b = this.state.nganHang;
      if (b?.files) return b;
      const goc = b || window.NGAN_HANG_MAC_DINH;
      this.state.nganHang = L.themFileNganHang(L.NGAN_HANG_TRONG(), 'Ngân hàng câu hỏi tập huấn Trợ lý PTN.xlsx', goc, { id: 'f-goc', luc: this.now(), nguoi: 'Hệ thống' }).bank;
      return this.state.nganHang;
    },

    thongKeBank() {
      return TU_XA ? this.state.bankMeta : L.thongKeNganHang(this.nganHang());
    },

    async layBank() {
      if (TU_XA) return (await DongBo.thucHien('layNganHang')).bank;
      return this.nganHang();
    },

    async napBank(tenFile, { cauHoi, tuLuan }, thayFileId) {
      if (TU_XA) return DongBo.thucHien('napNganHang', { tenFile, cauHoi, tuLuan, thayFileId });
      const kq = L.themFileNganHang(this.nganHang(), tenFile, { cauHoi, tuLuan }, { id: taoId('f'), luc: this.now(), nguoi: this.nguoiDung().ten, thayFileId });
      this.state.nganHang = kq.bank;
      this.ghiNhatKy(thayFileId ? 'Thay file câu hỏi' : 'Nạp file câu hỏi', tenFile, `${cauHoi.length} TN, ${tuLuan.length} TL`);
      return kq;
    },

    async xoaFileBank(id) {
      if (TU_XA) return (await DongBo.thucHien('xoaFileNganHang', { id })).bank;
      const ten = this.nganHang().files.find((f) => f.id === id)?.ten;
      this.state.nganHang = L.xoaFileNganHang(this.nganHang(), id);
      this.ghiNhatKy('Xóa file câu hỏi', ten);
      return this.state.nganHang;
    },

    async luuCau(loai, cau, maCu) {
      if (TU_XA) return (await DongBo.thucHien('luuCau', { loai, cau, maCu })).bank;
      const bank = this.nganHang();
      const tap = loai === 'tl' ? 'tuLuan' : 'cauHoi';
      const cu = bank[tap].find((q) => q.ma === maCu);
      if (cu) bank[tap][bank[tap].indexOf(cu)] = { ...cau, fileId: cu.fileId };
      else {
        if (!bank.files.some((f) => f.id === 'soan-tren-web')) bank.files.push({ id: 'soan-tren-web', ten: 'Câu soạn trên web', luc: this.now(), nguoi: this.nguoiDung().ten });
        bank[tap].push({ ...cau, fileId: 'soan-tren-web' });
      }
      this.ghiNhatKy(cu ? 'Sửa câu hỏi' : 'Thêm câu hỏi', cau.ma);
      return bank;
    },

    async xoaCau(loai, ma) {
      if (TU_XA) return (await DongBo.thucHien('xoaCau', { loai, ma })).bank;
      const bank = this.nganHang();
      const tap = loai === 'tl' ? 'tuLuan' : 'cauHoi';
      bank[tap] = bank[tap].filter((q) => q.ma !== ma);
      this.ghiNhatKy('Xóa câu hỏi', ma);
      return bank;
    },

    async kiemTraMssv(mssv) {
      if (TU_XA) return (await DongBo.goi('kiemTraMssv', { mssv })).ketQua;
      const t = this.troLy(mssv);
      return !t ? 'chua_co' : t.maMay === this.maMay() ? 'may_nay' : 'may_khac';
    },

    /* Phát đề, lưu, nộp: bản thật do máy chủ làm vì đáp án chỉ nằm ở đó. */
    async batDauBai(dot, mssv, maVao) {
      if (TU_XA) return DongBo.thucHien('batDauBai', { dotId: dot.id, maVao });
      if (dot.id === 'khao_sat') {
        const chan = L.kiemTraVaoKhaoSat(this.state, mssv, maVao);
        if (chan) throw new Error(chan);
      }
      const de = L.sinhDe(this.nganHang(), dot);
      const batDau = this.now();
      this.state.baiLam.push({
        id: taoId('bl'), dotId: dot.id, mssv, de, traLoi: {}, batDau, hetHan: batDau + dot.phut * L.PHUT,
        nopLuc: null, tuDongNop: false, roiManHinh: 0, diemTN: null, ketQua: 'dang_lam', moLaiBoi: null, lyDoMoLai: ''
      });
      this.luu();
    },

    luuBaiTam(bai) {
      if (TU_XA) DongBo.luuBai(bai);
      else this.luu();
    },

    async nopBai(bai, tuDong) {
      if (TU_XA) return DongBo.nopBai(bai);
      bai.nopLuc = tuDong ? bai.hetHan : this.now();
      bai.tuDongNop = tuDong;
      bai.diemTN = L.chamTN(bai);
      bai.ketQua = L.ketLuanBai(bai, this.state.dotKiemTra.find((d) => d.id === bai.dotId));
      return true;
    },

    async layCauOn(f) {
      const xaoDapAn = (q) => {
        const luaChon = L.xao(['A', 'B', 'C', 'D']).map((goc) => ({ goc, noiDung: q[goc] }));
        return { ...q, luaChon, dapAn: luaChon.findIndex((l) => l.goc === q.dapAn) };
      };
      if (TU_XA) {
        const { cau } = await DongBo.goi('cauOn', { bo: f.bo, chuDe: f.chuDe, maQR: f.maQR, soCau: Number(f.soCau), chiCauSai: 'chiCauSai' in f });
        return cau.map(xaoDapAn);
      }
      const sai = this.state.caiSai[this.phien.mssv] || {};
      const bo = this.troLy(this.phien.mssv)?.trangThai === 'cho_duyet' ? 'Tuyển' : f.bo;
      const ds = this.nganHang().cauHoi.filter((q) =>
        (!bo || q.bo === bo) && (!f.chuDe || q.chuDe === f.chuDe) && (!f.maQR || q.maQR === f.maQR) && (!('chiCauSai' in f) || sai[q.ma]));
      return L.xao(ds).slice(0, Number(f.soCau)).map(xaoDapAn);
    },

    ghiCauSai(ma) {
      const sai = (this.state.caiSai[this.phien.mssv] ||= {});
      sai[ma] = (sai[ma] || 0) + 1;
      if (TU_XA) DongBo.goi('ghiCauSai', { ma }).catch(() => {});
      else this.luu();
    },

    troLy(mssv) {
      return this.state.troLy.find((t) => t.mssv === mssv) || null;
    },

    nguoiDung() {
      const { vaiTro, mssv, taiKhoanId } = this.phien;
      if (vaiTro === 'tro_ly') return { id: mssv || 'sv-moi', ten: this.troLy(mssv)?.hoTen || 'Sinh viên mới' };
      const tk = this.state.taiKhoan.find((t) => t.id === (vaiTro === 'admin' ? 'admin' : taiKhoanId));
      return { id: tk?.id, ten: tk?.ten };
    },

    /* Luôn lưu bản sao trong mục Thông báo (mục 5.1); Web Push cần máy chủ nên chưa gửi ra ngoài. */
    guiThongBao({ tieuDe, noiDung = '', loai = 'chung', nguoiNhan }) {
      this.state.thongBao.push({ id: taoId('tb'), tieuDe, noiDung, loai, nguoiNhan, daDoc: [], taoBoi: this.nguoiDung().ten, luc: this.now() });
    },

    ghiNhatKy(hanhDong, doiTuong, chiTiet = '') {
      this.state.nhatKy.unshift({ id: taoId('nk'), luc: this.now(), ai: this.nguoiDung().ten, hanhDong, doiTuong, chiTiet });
    }
  };

  window.Store = Store;
})();
