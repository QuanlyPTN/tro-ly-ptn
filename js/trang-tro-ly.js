/* Phần trợ lý: đăng ký, thông tin, ca hôm nay, lịch trực, tiến độ (mục 8). */
(function () {
  const L = window.Logic;
  const { esc, ngay, ngayDu, gio, ngayGio, so, tyLe, nhan, xacNhan, thongBao } = window.UI;
  const toi = () => Store.troLy(Store.phien.mssv);
  const homNay = () => L.ngayKey(new Date(Store.now()));

  /* ---------- Đăng ký theo đợt tuyển ---------- */
  App.trang['dang-ky'] = {
    ten: 'Đăng ký trợ lý',
    icon: 'nguoi',
    render() {
      const dot = L.dotTuyenMo(Store.state, Store.now());
      if (!dot) {
        return `
          <section class="the">
            <h2>Chưa đến đợt tuyển</h2>
            <p class="phu">Để lại tên và số điện thoại, PTN sẽ báo khi mở đợt tuyển mới.</p>
            <form data-form="nhan-tin" class="luoi-form">
              <label>Họ tên <input name="hoTen" required /></label>
              <label>Số điện thoại <input name="sdt" type="tel" required pattern="[0-9]{9,11}" title="9 đến 11 chữ số" /></label>
              <div class="hang-nut"><button class="nut">Nhận tin khi mở đợt</button></div>
            </form>
          </section>`;
      }
      return `
        <section class="the">
          <h2>${esc(dot.ten)}</h2>
          <p class="phu">Nhận đăng ký đến ${ngayDu(dot.denNgay)}. Thông tin lưu luôn, lần sau không phải nhập lại. Sau khi gửi, bạn làm bài khảo sát tuyển.</p>
          <form data-form="dang-ky" class="luoi-form">
            <label>Họ tên <input name="hoTen" required autocomplete="name" /></label>
            <label>Ngày sinh <input name="ngaySinh" type="date" required /></label>
            <label>MSSV <input name="mssv" required pattern="[0-9A-Za-z]{6,15}" title="6 đến 15 ký tự chữ hoặc số" /></label>
            <label>Lớp <input name="lop" required /></label>
            <label>Ngành <input name="nganh" required /></label>
            <label>Năm dự kiến ra trường <input name="namRaTruong" type="number" min="2026" max="2040" required /></label>
            <label>Số điện thoại <input name="sdt" type="tel" required pattern="[0-9]{9,11}" title="9 đến 11 chữ số" /></label>
            <label>Email <input name="email" type="email" required /></label>
            <p id="loi-dang-ky" class="loi rong-het" role="alert" hidden></p>
            <div class="hang-nut rong-het"><button class="nut">Gửi đăng ký</button></div>
          </form>
        </section>`;
    }
  };

  App.form['nhan-tin'] = (f, el) => {
    Store.state.dangKyNhanTin.push({ id: Store.id('nt'), hoTen: f.hoTen.trim(), sdt: f.sdt.trim(), luc: Store.now() });
    el.reset();
    App.xong('Đã ghi nhận. PTN sẽ báo khi mở đợt tuyển.');
  };

  App.form['dang-ky'] = async (f) => {
    const mssv = f.mssv.trim();
    const loi = document.getElementById('loi-dang-ky');
    let tinhTrang;
    try {
      tinhTrang = await Store.kiemTraMssv(mssv);
    } catch {
      return thongBao('Không kết nối được máy chủ, thử lại sau.', 'loi');
    }
    if (tinhTrang !== 'chua_co') {
      if (tinhTrang === 'may_nay') {
        Store.phien.mssv = mssv;
        Store.luuPhien();
        App.ui.trang = null;
        return App.xong('Đã nhận lại tài khoản trên máy này.');
      }
      loi.hidden = false;
      const daGui = Store.state.deNghi.some((d) => d.mssv === mssv && d.maMayMoi === Store.maMay() && d.trangThai === 'cho_duyet');
      loi.innerHTML = daGui
        ? 'Đã gửi đề nghị chuyển máy, đang chờ PTN duyệt.'
        : `MSSV này đã đăng ký ở thiết bị khác. <button type="button" class="nut nut-phu nut-nho" data-act="gui-chuyen-may" data-mssv="${esc(mssv)}">Gửi đề nghị chuyển máy</button>`;
      return;
    }
    Store.state.troLy.push({
      mssv, hoTen: f.hoTen.trim(), ngaySinh: f.ngaySinh, lop: f.lop.trim(), nganh: f.nganh.trim(), namRaTruong: Number(f.namRaTruong),
      sdt: f.sdt.trim(), email: f.email.trim(), maMay: Store.maMay(), trangThai: 'cho_duyet', ngayDangKy: homNay(), ngayDuyet: null, nguoiDuyet: null, ngayChinhThuc: null
    });
    Store.phien.mssv = mssv;
    Store.luuPhien();
    Store.ghiNhatKy('Đăng ký trợ lý', mssv);
    App.ui.trang = 'tap-huan';
    App.xong('Đã gửi đăng ký. Mời bạn làm bài khảo sát tuyển.');
  };

  /* ---------- Thông tin của tôi ---------- */
  App.trang['thong-tin'] = {
    ten: 'Thông tin của tôi',
    icon: 'nguoi',
    render() {
      const t = toi();
      const tkb = Store.state.thoiKhoaBieu.filter((m) => m.mssv === t.mssv).sort((a, b) => a.thu - b.thu || a.tu.localeCompare(b.tu));
      const dong = (k, v) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`;
      const THU = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const moiGio = () => {
        const ds = [];
        for (let p = L.phut('07:00'); p <= L.phut('17:30'); p += 30) ds.push(L.hhmm(p));
        return ds.map((x) => `<option>${x}</option>`).join('');
      };
      return `
        <section class="the">
          <div class="hang-dau"><h2>${esc(t.hoTen)}</h2>${nhan(UI.TRANG_THAI_TRO_LY, t.trangThai)}</div>
          ${t.trangThai === 'cho_duyet' ? '<p class="phu">Đơn đang chờ PTN xét. Kết quả hiện ở đây sau khi quản lý duyệt. Đăng ký lịch trực mở sau khi được PTN duyệt.</p>' : ''}
          <dl class="luoi-thong-tin">
            ${dong('MSSV', t.mssv)}${dong('Ngày sinh', ngayDu(t.ngaySinh))}${dong('Lớp', t.lop)}${dong('Ngành', t.nganh)}
            ${dong('Năm ra trường', t.namRaTruong)}${dong('Điện thoại', t.sdt)}${dong('Email', t.email)}${dong('Mã máy', t.maMay)}
          </dl>
        </section>
        <section class="the">
          <h2>Thời khóa biểu</h2>
          <p class="phu">Dùng để cảnh báo khi bạn chọn khung trực trùng giờ học.</p>
          ${tkb.length ? `<ul class="ds-gon">${tkb.map((m) => `
            <li><span><strong>${THU[m.thu - 1]}</strong> ${esc(m.tu)}–${esc(m.den)} · ${esc(m.monHoc)}</span>
            <button type="button" class="nut-chu" data-act="xoa-tkb" data-id="${esc(m.id)}">Xóa</button></li>`).join('')}</ul>` : ''}
          <form data-form="them-tkb" class="luoi-form cot-4">
            <label>Thứ <select name="thu">${THU.map((x, i) => `<option value="${i + 1}">${x}</option>`).join('')}</select></label>
            <label>Từ <select name="tu">${moiGio()}</select></label>
            <label>Đến <select name="den">${moiGio()}</select></label>
            <label>Môn học <input name="monHoc" required /></label>
            <div class="hang-nut rong-het"><button class="nut nut-phu">Thêm môn</button></div>
          </form>
        </section>`;
    }
  };

  App.form['them-tkb'] = (f) => {
    if (L.phut(f.den) <= L.phut(f.tu)) return thongBao('Giờ kết thúc phải sau giờ bắt đầu.', 'loi');
    Store.state.thoiKhoaBieu.push({ id: Store.id('tkb'), mssv: toi().mssv, thu: Number(f.thu), tu: f.tu, den: f.den, monHoc: f.monHoc.trim() });
    App.xong('Đã thêm vào thời khóa biểu.');
  };
  App.act['xoa-tkb'] = (el) => {
    Store.state.thoiKhoaBieu = Store.state.thoiKhoaBieu.filter((m) => m.id !== el.dataset.id);
    App.xong();
  };

  /* ---------- Ca hôm nay ---------- */
  const luotCuaCa = (caId) => Store.state.luotTruc.find((l) => l.caTrucId === caId) || null;

  function banGiaoTruoc(mssv) {
    const cuaToi = new Set(Store.state.luotTruc.filter((l) => l.mssv === mssv && !l.ketThuc).map((l) => l.id));
    const ds = Store.state.banGiao.filter((b) => !cuaToi.has(b.luotTrucId) && b.noiDung.trim());
    return ds.length ? ds[ds.length - 1].noiDung : '';
  }

  function theChecklist(ca, luot) {
    const st = Store.state;
    const dongMuc = (m) => {
      if (m.banGiao) {
        const bg = st.banGiao.find((b) => b.luotTrucId === luot.id);
        return `<li class="muc-ban-giao"><label for="ban-giao">${esc(m.noiDung)}</label>
          <textarea id="ban-giao" rows="3" data-doi="ban-giao" data-luot="${esc(luot.id)}" placeholder="Việc còn dở, lưu ý cho ca sau">${esc(bg?.noiDung)}</textarea></li>`;
      }
      const dat = st.checklistCa.some((c) => c.luotTrucId === luot.id && c.mucId === m.id && c.daLam);
      return `<li><label class="o-chon"><input type="checkbox" data-doi="tick-checklist" data-luot="${esc(luot.id)}" data-muc="${esc(m.id)}"${dat ? ' checked' : ''} /><span>${esc(m.noiDung)}</span></label></li>`;
    };
    return `
      <section class="the">
        <h2>Checklist cuối ca</h2>
        <ul class="ds-checklist">${L.mucChecklist(st, ca).map(dongMuc).join('')}</ul>
      </section>`;
  }

  function theCa(ca) {
    const now = Store.now();
    const cfg = Store.state.caiDat;
    const luot = luotCuaCa(ca.id);
    const moLuc = L.mocGio(ca.ngay, ca.tu) - cfg.phutBatDauSom * L.PHUT;
    const hetLuc = L.mocGio(ca.ngay, ca.den);
    const dau = `<div class="hang-dau"><h2>${ca.tu}–${ca.den}</h2>`;

    if (!luot) {
      if (ca.trangThai !== 'da_dang_ky') return `<section class="the">${dau}${nhan(UI.TRANG_THAI_CA, ca.trangThai)}</div></section>`;
      const chuaToi = now < moLuc;
      const daQua = now > hetLuc;
      return `
        <section class="the">
          ${dau}${nhan(UI.TRANG_THAI_CA, ca.trangThai)}</div>
          <p class="phu">${chuaToi ? `Bấm được từ ${gio(moLuc)}.` : daQua ? 'Ca đã kết thúc mà chưa bấm Bắt đầu. Liên hệ quản lý.' : 'Chỉ bấm khi bạn đã có mặt ở PTN.'}</p>
          <button type="button" class="nut nut-lon" data-act="bat-dau-truc" data-id="${esc(ca.id)}"${chuaToi || daQua ? ' disabled' : ''}>Bắt đầu trực</button>
        </section>`;
    }
    if (!luot.ketThuc) {
      return `
        <section class="the">
          ${dau}<span class="nhan nhan-luc">Đang trực từ ${gio(luot.batDau)}</span></div>
          <button type="button" class="nut nut-lon nut-xanh" data-act="ket-thuc-truc" data-id="${esc(luot.id)}">Kết thúc trực</button>
        </section>
        ${theChecklist(ca, luot)}`;
    }
    return `
      <section class="the">
        ${dau}${luot.daDuyet ? '<span class="nhan nhan-luc">Đã duyệt</span>' : '<span class="nhan nhan-vang">Chờ quản lý duyệt</span>'}</div>
        <p class="phu">Vào ${gio(luot.batDau)}, ra ${gio(luot.ketThuc)}. Ca chưa duyệt chưa được tính.</p>
      </section>`;
  }

  App.trang['ca-hom-nay'] = {
    ten: 'Ca hôm nay',
    icon: 'ca',
    render() {
      const t = toi();
      const hn = homNay();
      const ca = Store.state.caTruc.filter((c) => c.mssv === t.mssv && c.ngay === hn).sort((a, b) => a.tu.localeCompare(b.tu));
      const dangCo = ca.filter((c) => !['huy_truoc', 'huy_muon'].includes(c.trangThai));
      const bg = banGiaoTruoc(t.mssv);
      const keTiep = Store.state.caTruc
        .filter((c) => c.mssv === t.mssv && c.trangThai === 'da_dang_ky' && L.mocGio(c.ngay, c.tu) > Store.now() && !luotCuaCa(c.id))
        .sort((a, b) => L.mocGio(a.ngay, a.tu) - L.mocGio(b.ngay, b.tu))[0];
      return `
        <p class="phu">${ngay(hn)} · ${gio(Store.now())}</p>
        ${bg ? `<section class="the the-nhat"><h2>Bàn giao ca trước</h2><p>${esc(bg)}</p></section>` : ''}
        ${dangCo.map(theCa).join('')}
        ${dangCo.length ? '' : `<section class="the trong">
          <h2>Hôm nay bạn không có ca</h2>
          ${keTiep ? `<p class="phu">Ca kế tiếp: ${ngay(keTiep.ngay)}, ${keTiep.tu}–${keTiep.den}.</p>
            <button type="button" class="nut nut-phu" data-act="tua-den-ca" data-ms="${L.mocGio(keTiep.ngay, keTiep.tu)}">Bản demo: tua đồng hồ đến ca này</button>` : '<p class="phu">Vào Đăng ký lịch trực để chọn khung giờ.</p>'}
        </section>`}`;
    }
  };

  App.act['tua-den-ca'] = (el) => {
    Store.datDongHo(Number(el.dataset.ms));
    App.render();
  };

  App.act['bat-dau-truc'] = (el) => {
    const ca = Store.state.caTruc.find((c) => c.id === el.dataset.id);
    if (luotCuaCa(ca.id)) return;
    Store.state.luotTruc.push({ id: Store.id('lt'), caTrucId: ca.id, mssv: ca.mssv, batDau: Store.now(), ketThuc: null, ketThucBoi: null, daDuyet: false });
    App.xong(`Đã ghi giờ vào ${gio(Store.now())}.`);
  };

  App.act['ket-thuc-truc'] = async (el) => {
    const st = Store.state;
    const luot = st.luotTruc.find((l) => l.id === el.dataset.id);
    const ca = st.caTruc.find((c) => c.id === luot.caTrucId);
    if (!L.checklistXong(st, luot, ca)) {
      const ok = await xacNhan('Checklist chưa xong. Ca sẽ bị tính trực thiếu dù giờ vẫn được cộng. Vẫn kết thúc?', 'Vẫn kết thúc');
      if (!ok) return;
    }
    luot.ketThuc = Store.now();
    luot.ketThucBoi = 'tro_ly';
    App.xong('Đã kết thúc trực. Chờ quản lý duyệt.');
  };

  App.doi['tick-checklist'] = (el) => {
    const { luot, muc } = el.dataset;
    const ds = Store.state.checklistCa;
    const dong = ds.find((c) => c.luotTrucId === luot && c.mucId === muc);
    if (dong) dong.daLam = el.checked;
    else ds.push({ luotTrucId: luot, mucId: muc, daLam: el.checked });
    Store.luu();
  };

  App.doi['ban-giao'] = (el) => {
    const ds = Store.state.banGiao;
    const dong = ds.find((b) => b.luotTrucId === el.dataset.luot);
    if (dong) dong.noiDung = el.value;
    else ds.push({ id: Store.id('bg'), luotTrucId: el.dataset.luot, noiDung: el.value });
    Store.luu();
  };

  /* ---------- Lịch trực ---------- */
  function khungTrongNgay() {
    const cfg = Store.state.caiDat;
    return cfg.buoi.flatMap((b) => {
      const ds = [];
      for (let p = L.phut(b.tu); p < L.phut(b.den); p += cfg.buocPhut) ds.push(p);
      return ds;
    });
  }

  const lichUi = () => {
    if (!App.ui.lich) {
      const tuanSau = L.congNgay(L.dauTuan(homNay()), 7);
      const dangKhoa = Store.now() >= L.hanKhoaTuan(tuanSau, Store.state.caiDat);
      const tuan = dangKhoa ? L.congNgay(tuanSau, 7) : tuanSau;
      App.ui.lich = { tuan, ngay: tuan, tu: '07:00', den: '09:00' };
    }
    return App.ui.lich;
  };

  function bangKhung(ui, t) {
    const st = Store.state;
    const cfg = st.caiDat;
    const ngayTuan = cfg.thuLamViec.map((thu) => L.congNgay(ui.tuan, thu - 1));
    const tkb = st.thoiKhoaBieu.filter((m) => m.mssv === t.mssv);
    const cuaToi = st.caTruc.filter((c) => c.mssv === t.mssv && L.CA_GIU_CHO.includes(c.trangThai));
    const dau = ngayTuan.map((n) => `<th scope="col">${ngay(n).replace(', ', '<br />')}</th>`).join('');
    const dong = khungTrongNgay().map((p) => {
      const o = ngayTuan.map((n) => {
        const soNguoi = L.soNguoiTrongKhung(st, n, p);
        const cuaMinh = cuaToi.some((c) => c.ngay === n && L.phut(c.tu) <= p && p < L.phut(c.den));
        const hoc = tkb.some((m) => m.thu === L.docNgay(n).getDay() && L.phut(m.tu) <= p && p < L.phut(m.den));
        const lop = cuaMinh ? 'o-cua-toi' : soNguoi >= cfg.soNguoiMoiKhung ? 'o-day' : hoc ? 'o-hoc' : soNguoi ? 'o-co' : '';
        const moTa = `${ngay(n)}, ${L.hhmm(p)}: ${soNguoi} trên ${cfg.soNguoiMoiKhung} người${cuaMinh ? ', ca của bạn' : ''}${hoc ? ', trùng lịch học' : ''}`;
        return `<td><button type="button" class="o-khung ${lop}" data-act="chon-khung" data-ngay="${n}" data-tu="${L.hhmm(p)}" aria-label="${moTa}" title="${moTa}">${soNguoi}/${cfg.soNguoiMoiKhung}</button></td>`;
      }).join('');
      return `<tr><th scope="row">${L.hhmm(p)}</th>${o}</tr>`;
    }).join('');
    return `<div class="cuon-ngang"><table class="bang-khung"><thead><tr><th></th>${dau}</tr></thead><tbody>${dong}</tbody></table></div>
      <p class="chu-thich"><span class="o-mau o-cua-toi"></span>Ca của bạn <span class="o-mau o-co"></span>Có người <span class="o-mau o-hoc"></span>Trùng lịch học <span class="o-mau o-day"></span>Đã đủ</p>`;
  }

  App.trang['lich-truc'] = {
    ten: 'Đăng ký lịch trực',
    icon: 'lich',
    render() {
      const t = toi();
      const st = Store.state;
      const cfg = st.caiDat;
      const ui = lichUi();
      const han = L.hanKhoaTuan(ui.tuan, cfg);
      const khoa = Store.now() >= han;
      const cacNgay = cfg.thuLamViec.map((thu) => L.congNgay(ui.tuan, thu - 1));
      const gioChon = [];
      cfg.buoi.forEach((b) => {
        for (let p = L.phut(b.tu); p <= L.phut(b.den); p += cfg.buocPhut) gioChon.push(L.hhmm(p));
      });
      const opt = (ds, chon, nhanHam = (x) => x) => ds.map((x) => `<option value="${x}"${x === chon ? ' selected' : ''}>${nhanHam(x)}</option>`).join('');
      const caSapToi = st.caTruc
        .filter((c) => c.mssv === t.mssv && c.trangThai === 'da_dang_ky' && L.mocGio(c.ngay, c.tu) > Store.now())
        .sort((a, b) => L.mocGio(a.ngay, a.tu) - L.mocGio(b.ngay, b.tu));
      return `
        <section class="the">
          <div class="hang-dau">
            <h2>Tuần ${ngayDu(ui.tuan).slice(0, 5)} – ${ngayDu(L.congNgay(ui.tuan, 5)).slice(0, 5)}</h2>
            <div class="hang-nut">
              <button type="button" class="nut nut-phu nut-nho" data-act="doi-tuan" data-buoc="-7" aria-label="Tuần trước">‹</button>
              <button type="button" class="nut nut-phu nut-nho" data-act="doi-tuan" data-buoc="7" aria-label="Tuần sau">›</button>
            </div>
          </div>
          <p class="phu">${khoa ? 'Tuần này đã khóa đăng ký.' : `Khóa đăng ký lúc ${ngayGio(han)}.`} Mỗi lần tối thiểu ${cfg.phutToiThieuCa / 60} giờ, chọn một ô để điền nhanh.</p>
          ${bangKhung(ui, t)}
          <form data-form="dang-ky-ca" class="luoi-form cot-4">
            <label>Ngày <select name="ngay">${opt(cacNgay, ui.ngay, ngay)}</select></label>
            <label>Từ <select name="tu">${opt(gioChon, ui.tu)}</select></label>
            <label>Đến <select name="den">${opt(gioChon, ui.den)}</select></label>
            <div class="canh-day"><button class="nut nut-rong"${khoa ? ' disabled' : ''}>Đăng ký ca</button></div>
          </form>
        </section>
        <section class="the">
          <h2>Ca sắp tới của tôi</h2>
          ${caSapToi.length ? `<ul class="ds-gon">${caSapToi.map((c) => `
            <li><span><strong>${ngay(c.ngay)}</strong> ${c.tu}–${c.den}</span>
            <span class="hang-nut">${App.nutDoiCa(c)}<button type="button" class="nut nut-phu nut-nho" data-act="huy-ca" data-id="${esc(c.id)}">Hủy</button></span></li>`).join('')}</ul>` : '<p class="phu">Chưa có ca nào.</p>'}
        </section>
        ${App.theCaCanNguoiNhan(t)}`;
    }
  };

  App.act['doi-tuan'] = (el) => {
    const ui = lichUi();
    const moi = L.congNgay(ui.tuan, Number(el.dataset.buoc));
    const dau = L.dauTuan(homNay());
    if (moi < dau || moi > L.congNgay(dau, 28)) return;
    Object.assign(ui, { tuan: moi, ngay: moi });
    App.render();
  };

  App.act['chon-khung'] = (el) => {
    const ui = lichUi();
    const cfg = Store.state.caiDat;
    const tu = L.phut(el.dataset.tu);
    const buoi = cfg.buoi.find((b) => tu >= L.phut(b.tu) && tu < L.phut(b.den));
    const den = Math.min(tu + cfg.phutToiThieuCa, L.phut(buoi.den));
    Object.assign(ui, { ngay: el.dataset.ngay, tu: el.dataset.tu, den: L.hhmm(den) });
    const y = window.scrollY;
    App.render();
    window.scrollTo(0, y);
  };

  App.form['dang-ky-ca'] = async (f) => {
    Object.assign(lichUi(), f);
    const t = toi();
    const yc = { mssv: t.mssv, ngay: f.ngay, tu: f.tu, den: f.den };
    const kq = L.kiemTraDangKyCa(yc, Store.state, Store.now());
    if (!kq.ok) return thongBao(kq.loi[0], 'loi');
    if (kq.canhBao.length && !(await xacNhan(`${kq.canhBao.join(' ')} Vẫn đăng ký ca này?`, 'Vẫn đăng ký'))) return;
    const hk = L.hocKyHienTai(Store.state, L.mocGio(f.ngay, f.tu));
    Store.state.caTruc.push({ id: Store.id('ca'), ...yc, trangThai: 'da_dang_ky', hocKyId: hk.id });
    App.xong(`Đã đăng ký ${ngay(f.ngay)}, ${f.tu}–${f.den}.`);
  };

  App.act['huy-ca'] = async (el) => {
    const ca = Store.state.caTruc.find((c) => c.id === el.dataset.id);
    const loai = L.loaiHuy(ca, Store.now());
    const hoi = loai === 'huy_truoc'
      ? `Hủy ca ${ngay(ca.ngay)}, ${ca.tu}–${ca.den}? Hủy trước 24 giờ nên không tính lỗi.`
      : `Ca ${ngay(ca.ngay)}, ${ca.tu}–${ca.den} còn dưới 24 giờ nên sẽ tính "hủy muộn". 2 lần hủy muộn bằng 1 ca bỏ. Vẫn hủy?`;
    if (!(await xacNhan(hoi, 'Hủy ca'))) return;
    ca.trangThai = loai;
    App.dongDonCuaCa(ca.id);
    Store.ghiNhatKy(loai === 'huy_truoc' ? 'Hủy ca' : 'Hủy ca muộn', ca.mssv, `${ca.ngay} ${ca.tu}–${ca.den}`);
    App.xong('Đã hủy ca.');
  };

  /* ---------- Tiến độ ---------- */
  function theDeXuat(t) {
    const dx = Store.state.deXuatMat.find((d) => d.mssv === t.mssv && d.trangThai === 'cho_phan_hoi');
    if (!dx) return '';
    if (dx.phanHoi) return `<section class="the the-do"><h2>Đã gửi phản hồi</h2><p>${esc(dx.phanHoi)}</p><p class="phu">Admin sẽ xem xét và quyết định.</p></section>`;
    return `
      <section class="the the-do">
        <h2>Đề xuất mất tư cách</h2>
        <p>Bạn có đến ${ngayGio(dx.hanPhanHoi)} để phản hồi trước khi Admin quyết định.</p>
        <form data-form="phan-hoi-de-xuat" data-id="${esc(dx.id)}">
          <label>Nội dung phản hồi <textarea name="noiDung" rows="3" required></textarea></label>
          <div class="hang-nut"><button class="nut">Gửi phản hồi</button></div>
        </form>
      </section>`;
  }

  App.form['phan-hoi-de-xuat'] = (f, el) => {
    Store.state.deXuatMat.find((d) => d.id === el.dataset.id).phanHoi = f.noiDung.trim();
    App.xong('Đã gửi phản hồi.');
  };

  App.trang['tien-do'] = {
    ten: 'Tiến độ của tôi',
    icon: 'tien',
    render() {
      const t = toi();
      const st = Store.state;
      const cfg = st.caiDat;
      const hk = L.hocKyHienTai(st, Store.now());
      const cs = L.tinhChiSo(st, t.mssv, hk);
      const tuan = L.tuanThu(hk, Store.now());
      const tt = L.trangThaiNeNep(cs, cfg, tuan);
      const phanTram = Math.min(100, (cs.tongGio / cfg.gioToiThieu) * 100);
      const tb = L.diemDanhGiaTB(st.danhGia.find((d) => d.mssv === t.mssv && d.hocKyId === hk.id));
      const chot = st.xepLoaiKy.find((x) => x.mssv === t.mssv && x.hocKyId === hk.id);
      const the = (nhanThe, gt, phu = '') => `<div class="chi-so"><span>${nhanThe}</span><strong>${gt}</strong>${phu ? `<small>${phu}</small>` : ''}</div>`;
      const nenep = st.soNeNep.filter((n) => n.mssv === t.mssv).sort((a, b) => b.ngay.localeCompare(a.ngay));
      return `
        ${theDeXuat(t)}
        <section class="the">
          <div class="hang-dau"><h2>${esc(hk.ten)} · tuần ${tuan}</h2>${nhan(UI.MUC_NE_NEP, tt.muc)}</div>
          ${tt.lyDo.length ? `<p class="phu">${esc(tt.lyDo.join('; '))}.</p>` : ''}
          <div class="tien-trinh" role="progressbar" aria-valuenow="${Math.round(phanTram)}" aria-valuemin="0" aria-valuemax="100" aria-label="Giờ trực so với mức tối thiểu"><div style="width:${phanTram}%"></div></div>
          <p class="phu">${so(cs.tongGio)} / ${cfg.gioToiThieu} giờ tối thiểu</p>
          <div class="luoi-chi-so">
            ${the('Tham gia', tyLe(cs.tyLeThamGia), `${cs.caTrucDu}/${cs.caTinh} ca đủ`)}
            ${the('Đúng giờ', tyLe(cs.tyLeDungGio), `${cs.caDenDungGio}/${cs.caCoDen} ca`)}
            ${the('Ca bỏ', cs.soCaBo, cs.soLanHuyMuon ? `${cs.soLanHuyMuon} lần hủy muộn` : '')}
            ${the('Lỗi', `${cs.loiNheConLai} nhẹ · ${cs.loiNang} nặng`)}
            ${the('Điểm cộng đồng', cs.diemCongDong, `Bù ${Math.floor(cs.diemCongDong / cfg.diemBuLoi)} lỗi nhẹ`)}
            ${the('Đánh giá', tb === null ? '–' : so(tb, 2), chot ? `Xếp loại: ${esc(chot.xepLoai)}` : '')}
          </div>
        </section>
        <section class="the">
          <h2>Còn thiếu gì để đạt từng loại</h2>
          <div class="luoi-xep-loai">
            ${L.tieuChiXepLoai(cs, cfg, tb).map((x) => `
              <div><h3>${x.loai}</h3><ul class="ds-tieu-chi">
                ${x.tieuChi.map((c) => `<li class="${c.dat ? 'dat' : ''}"><span>${c.dat ? '✓' : '○'}</span><div>${esc(c.nhan)}${c.conThieu ? `<small>${esc(c.conThieu)}</small>` : ''}</div></li>`).join('')}
              </ul></div>`).join('')}
          </div>
        </section>
        <section class="the">
          <h2>Sổ nề nếp</h2>
          ${nenep.length ? `<ul class="ds-gon cot">${nenep.map((n) => `
            <li>
              <div><strong>${UI.LOAI_NE_NEP[n.loai]}</strong> · ${ngayDu(n.ngay)}<br />${esc(n.danhMuc)}${n.ghiChu ? ` – ${esc(n.ghiChu)}` : ''}</div>
              ${n.phanHoi ? `<p class="phu">Phản hồi của bạn: ${esc(n.phanHoi)}</p>` : `
              <form data-form="phan-hoi-nen-nep" data-id="${esc(n.id)}" class="hang-form">
                <input name="noiDung" aria-label="Phản hồi" placeholder="Phản hồi nếu có" required />
                <button class="nut nut-phu nut-nho">Gửi</button>
              </form>`}
            </li>`).join('')}</ul>` : '<p class="phu">Chưa có ghi nhận nào.</p>'}
        </section>`;
    }
  };

  App.form['phan-hoi-nen-nep'] = (f, el) => {
    Store.state.soNeNep.find((n) => n.id === el.dataset.id).phanHoi = f.noiDung.trim();
    App.xong('Đã gửi phản hồi.');
  };
})();
