/* Đồng bộ với máy chủ Apps Script. Trang vẫn sửa Store.state như bản chạy trên máy;
   ở đây so với bản máy chủ gần nhất, gửi phần thay đổi rồi nhận lại phần dữ liệu đã được máy chủ kiểm tra. */
(function () {
  const KHOA_CACHE = `tlptn-tu-xa-${window.CAU_HINH?.trangWeb}-v1`; // Hai web chung tên miền, mỗi web một bản.
  const KHOA_TOKEN = 'tlptn-token-v1';
  const TAP = {
    troLy: ['mssv'], thoiKhoaBieu: ['id'], caTruc: ['id'], luotTruc: ['id'], checklistMau: ['id'], checklistCa: ['luotTrucId', 'mucId'],
    banGiao: ['id'], soNeNep: ['id'], baiLam: ['id'], deXuatMat: ['id'], dangKyNhanTin: ['id'], nhatKy: ['id'], donVang: ['id'], doiCa: ['id'],
    deNghi: ['id'], thongBao: ['id'], viec: ['id'], thamGiaViec: ['id'], danhGia: ['mssv', 'hocKyId'], xepLoaiKy: ['mssv', 'hocKyId'],
    taiKhoan: ['id'], hocKy: ['id'], dotTuyen: ['id'], dotKiemTra: ['id'],
    taiLieu: ['id'], noiQuy: ['id'], daDocTaiLieu: ['mssv', 'taiLieuId'], xacNhanNoiQuy: ['mssv', 'phienBan'], buoiKhaoSat: ['id'], thamGiaBuoi: ['buoiId', 'mssv']
  };
  const KHOA_CHUNG = ['caiDat', 'danhMucLoi'];
  const GIAY_THU_LAI = 15;
  const GIAY_KEO = 60;

  let goc = null; // Bản máy chủ gần nhất.
  let dangDay = false;
  let henThuLai = null;
  let henLuuBai = null;
  let dangNop = false;

  const banSao = (x) => JSON.parse(JSON.stringify(x));
  const khoaCua = (tap, r) => TAP[tap].map((k) => r[k]).join('|');
  const docToken = () => (Store.trangWeb === 'quan_ly' ? localStorage.getItem(KHOA_TOKEN) || '' : '');

  async function goi(hd, du = {}) {
    const tra = await fetch(window.CAU_HINH.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Tránh bước kiểm tra CORS mà Apps Script không trả lời.
      body: JSON.stringify({ hd, maMay: Store.maMay(), token: docToken(), ...du })
    });
    const kq = await tra.json();
    if (kq.loi === 'HET_PHIEN') {
      localStorage.removeItem(KHOA_TOKEN);
      UI.thongBao('Phiên đăng nhập đã hết, mời đăng nhập lại.', 'loi');
      return goi(hd, du);
    }
    if (kq.loi) {
      const loi = new Error(kq.loi);
      loi.tuMayChu = true;
      throw loi;
    }
    return kq;
  }

  function thayDoi(cu, moi) {
    const upserts = {};
    const deletes = {};
    const quanLy = Store.phien.vaiTro !== 'tro_ly';
    Object.keys(TAP).forEach((tap) => {
      if (tap === 'baiLam' && !quanLy) return; // Bài làm của trợ lý đi bằng luuBai, nopBai.
      const banCu = new Map((cu[tap] || []).map((r) => [khoaCua(tap, r), JSON.stringify(r)]));
      const banMoi = new Set();
      (moi[tap] || []).forEach((r) => {
        const k = khoaCua(tap, r);
        banMoi.add(k);
        if (banCu.get(k) !== JSON.stringify(r)) (upserts[tap] ||= []).push(r);
      });
      banCu.forEach((_, k) => {
        if (!banMoi.has(k)) (deletes[tap] ||= []).push(k);
      });
    });
    KHOA_CHUNG.forEach((k) => {
      if (JSON.stringify(cu[k]) !== JSON.stringify(moi[k])) upserts[k] = moi[k];
    });
    return { upserts, deletes, trong: !Object.keys(upserts).length && !Object.keys(deletes).length };
  }

  /* Áp dụng bản máy chủ, giữ lại phần người dùng vừa sửa trong lúc chờ và bài đang làm dở. */
  function nhanVe(kq, daGui) {
    const chuaGui = daGui ? thayDoi(daGui, Store.state) : null;
    const baiDo = Store.state ? (Store.state.baiLam || []).filter((b) => b.ketQua === 'dang_lam') : [];
    goc = kq.state;
    const moi = banSao(kq.state);
    if (chuaGui && !chuaGui.trong) {
      Object.entries(chuaGui.upserts).forEach(([tap, ds]) => {
        if (KHOA_CHUNG.includes(tap)) return void (moi[tap] = ds);
        ds.forEach((r) => {
          const i = moi[tap].findIndex((x) => khoaCua(tap, x) === khoaCua(tap, r));
          if (i >= 0) moi[tap][i] = r;
          else moi[tap].push(r);
        });
      });
      Object.entries(chuaGui.deletes).forEach(([tap, ds]) => {
        moi[tap] = moi[tap].filter((x) => !ds.includes(khoaCua(tap, x)));
      });
    }
    baiDo.forEach((cu) => {
      const b = moi.baiLam.find((x) => x.id === cu.id);
      if (!b || b.ketQua !== 'dang_lam') return;
      b.traLoi = cu.traLoi;
      b.roiManHinh = Math.max(b.roiManHinh, cu.roiManHinh);
      b.de.tuLuan.forEach((c, i) => (c.traLoi = cu.de.tuLuan[i].traLoi));
    });
    Store.state = moi;
    Store.lechDongHo = kq.gioMayChu - Date.now();
    const doiPhien = JSON.stringify(Store.phien) !== JSON.stringify(kq.phien);
    Store.phien = kq.phien;
    luuCache();
    return doiPhien;
  }

  function luuCache() {
    try {
      localStorage.setItem(KHOA_CACHE, JSON.stringify({ goc, state: Store.state, phien: Store.phien }));
    } catch {
      /* Hết chỗ lưu chỉ mất khả năng mở khi không có mạng. */
    }
  }

  function henLai() {
    clearTimeout(henThuLai);
    henThuLai = setTimeout(() => DongBo.day(), GIAY_THU_LAI * 1000);
    App.baoMang(true);
  }

  const DongBo = {
    goi,

    async khoiTao() {
      const cache = (() => {
        try {
          return JSON.parse(localStorage.getItem(KHOA_CACHE));
        } catch {
          return null;
        }
      })();
      if (cache) {
        goc = cache.goc;
        Object.assign(Store, { state: cache.state, phien: cache.phien });
      }
      try {
        nhanVe(await goi('keo'));
      } catch (loi) {
        if (!cache) throw loi;
      }
      const keo = () => {
        if (!document.hidden && !dangDay) this.keo();
      };
      setInterval(keo, GIAY_KEO * 1000);
      document.addEventListener('visibilitychange', keo);
      window.addEventListener('online', () => this.day());
    },

    async keo() {
      try {
        const td = thayDoi(goc, Store.state);
        if (!td.trong) return this.day();
        const daGui = banSao(Store.state);
        nhanVe(await goi('keo'), daGui);
        App.baoMang(false);
        App.sauDongBo();
      } catch {
        App.baoMang(true);
      }
    },

    /* Trang gọi Store.luu() sau mỗi thao tác; gửi tuần tự để không ghi đè lẫn nhau. */
    async day() {
      luuCache();
      if (dangDay) return;
      dangDay = true;
      try {
        for (;;) {
          const td = thayDoi(goc, Store.state);
          if (td.trong) break;
          const daGui = banSao(Store.state);
          const kq = await goi('day', { upserts: td.upserts, deletes: td.deletes });
          const doiPhien = nhanVe(kq, daGui);
          App.baoMang(false);
          if (kq.tuChoi?.length) UI.thongBao(kq.tuChoi[0], 'loi');
          if (doiPhien || kq.tuChoi?.length) App.ui.canVeLai = true;
          App.sauDongBo();
        }
      } catch (loi) {
        if (loi.tuMayChu) {
          UI.thongBao(loi.message, 'loi');
          Store.state = banSao(goc);
          App.ui.canVeLai = true;
          App.sauDongBo();
        } else henLai();
      } finally {
        dangDay = false;
      }
    },

    /* Thao tác cần kết quả ngay, ví dụ phát đề: chạy rồi nhận lại dữ liệu mới. */
    async thucHien(hd, du) {
      const kq = await goi(hd, du);
      nhanVe(kq, banSao(Store.state));
      return kq;
    },

    async dangNhap(email, matKhau) {
      const kq = await goi('dangNhap', { email, matKhau });
      localStorage.setItem(KHOA_TOKEN, kq.token);
      nhanVe(kq);
    },

    async dangXuat() {
      localStorage.removeItem(KHOA_TOKEN);
      nhanVe(await goi('keo'));
    },

    /* Lưu tạm bài đang làm: giữ trên máy ngay, gom lại gửi máy chủ sau vài giây. */
    luuBai(bai) {
      luuCache();
      clearTimeout(henLuuBai);
      henLuuBai = setTimeout(async () => {
        try {
          await goi('luuBai', { id: bai.id, traLoi: bai.traLoi, tuLuan: bai.de.tuLuan.map((c) => c.traLoi), roiManHinh: bai.roiManHinh });
          App.baoMang(false);
        } catch {
          App.baoMang(true);
          this.luuBai(bai);
        }
      }, 3000);
    },

    async nopBai(bai) {
      if (dangNop) return false;
      dangNop = true;
      clearTimeout(henLuuBai);
      try {
        await this.thucHien('nopBai', { id: bai.id, traLoi: bai.traLoi, tuLuan: bai.de.tuLuan.map((c) => c.traLoi), roiManHinh: bai.roiManHinh });
        App.baoMang(false);
        return true;
      } catch {
        App.baoMang(true);
        return false;
      } finally {
        dangNop = false;
      }
    }
  };

  window.DongBo = DongBo;
})();
