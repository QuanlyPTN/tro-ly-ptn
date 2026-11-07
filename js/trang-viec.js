/* Thông báo, việc đột xuất, việc giao đích danh, điểm cộng đồng (mục 5). */
(function () {
  const L = window.Logic;
  const { esc, ngay, ngayDu, gio, ngayGio, so, tyLe, nhan, xacNhan, moHop, thongBao } = window.UI;
  const toi = () => Store.troLy(Store.phien.mssv);
  const tenSV = (mssv) => Store.troLy(mssv)?.hoTen || mssv;
  const viecCua = (id) => Store.state.viec.find((v) => v.id === id);
  const homNay = () => L.ngayKey(new Date(Store.now()));
  const hocKyNay = () => L.hocKyHienTai(Store.state, Store.now());
  const dangTruc = () => Store.state.troLy.filter((t) => ['thu_viec', 'dang_hoat_dong'].includes(t.trangThai));

  const TT_THAM_GIA = {
    dang_ky: ['Chờ quản lý chọn', 'vang'], da_chot: ['Đã chốt', 'luc'], cho: ['Danh sách chờ', 'vang'], da_rut: ['Đã rút', 'xam'], co_mat: ['Đã xác nhận', 'luc'], khong_den: ['Không đến', 'do'],
    da_giao: ['Mới giao', 'tim'], da_nhan: ['Đã nhận', 'tim'], khong_nhan: ['Không nhận', 'xam'], dang_lam: ['Đang làm', 'tim'], bao_hoan_thanh: ['Chờ xác nhận', 'vang'], hoan_thanh: ['Hoàn thành', 'luc']
  };
  const TEN_MUC = { nho: 'Nhỏ', vua: 'Vừa', lon: 'Lớn' };
  const moTaMuc = (v) => `${TEN_MUC[v.mucDiem]}, ${Store.state.caiDat.mucDiem[v.mucDiem]} điểm`;

  /* ---------- Thông báo ---------- */
  const thongBaoCua = (mssv) => Store.state.thongBao.filter((b) => b.nguoiNhan.includes(mssv)).slice().reverse();

  App.trang['thong-bao'] = {
    ten: 'Thông báo',
    icon: 'chuong',
    dem() {
      const mssv = Store.phien.mssv;
      return thongBaoCua(mssv).filter((b) => !b.daDoc.includes(mssv)).length;
    },
    render() {
      const t = toi();
      const ds = thongBaoCua(t.mssv);
      const nhac = ['thu_viec', 'dang_hoat_dong'].includes(t.trangThai) ? L.nhacTuDong(Store.state, t.mssv, Store.now()) : [];
      return `
        ${nhac.length ? `<section class="the the-nhat"><h2>Nhắc việc</h2><ul class="ds-loi">${nhac.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section>` : ''}
        <section class="the">
          ${ds.length ? `<ul class="ds-canh-bao">${ds.map((b) => {
            const moi = !b.daDoc.includes(t.mssv);
            return `<li class="${moi ? 'chua-doc' : ''}">
              <div class="hang-dau"><strong>${esc(b.tieuDe)}</strong><small>${ngayGio(b.luc)}</small></div>
              ${b.noiDung ? `<p>${esc(b.noiDung)}</p>` : ''}
              ${moi ? `<button type="button" class="nut-chu" data-act="doc-thong-bao" data-id="${esc(b.id)}">Đánh dấu đã xem</button>` : ''}
            </li>`;
          }).join('')}</ul>` : '<p class="phu">Chưa có thông báo.</p>'}
        </section>`;
    }
  };

  App.act['doc-thong-bao'] = (el) => {
    Store.state.thongBao.find((b) => b.id === el.dataset.id).daDoc.push(Store.phien.mssv);
    App.xong();
  };

  App.trang['thong-bao-ql'] = {
    ten: 'Thông báo',
    icon: 'chuong',
    render() {
      const ds = Store.state.thongBao.slice().reverse().slice(0, 50);
      return `
        <section class="the">
          <h2>Soạn thông báo</h2>
          <form data-form="gui-thong-bao">
            <label>Tiêu đề <input name="tieuDe" required /></label>
            <label>Nội dung <textarea name="noiDung" rows="3" required></textarea></label>
            <fieldset class="chon-cot"><legend>Người nhận</legend>
              <label class="o-chon rong-het"><input type="checkbox" data-doi="chon-tat-ca" /><span><strong>Tất cả</strong></span></label>
              ${dangTruc().map((t) => `<label class="o-chon"><input type="checkbox" name="nguoiNhan" value="${esc(t.mssv)}" /><span>${esc(t.hoTen)}</span></label>`).join('')}
            </fieldset>
            <div class="hang-nut"><button class="nut">Gửi</button></div>
          </form>
          <p class="phu">Bản này lưu trong mục Thông báo của app. Thông báo đẩy về điện thoại cần máy chủ.</p>
        </section>
        <section class="the">
          <h2>Đã gửi</h2>
          ${ds.length ? `<ul class="ds-canh-bao">${ds.map((b) => {
            const chuaXem = b.nguoiNhan.filter((m) => !b.daDoc.includes(m));
            return `<li>
              <div class="hang-dau"><strong>${esc(b.tieuDe)}</strong><small>${ngayGio(b.luc)}</small></div>
              <p class="phu">Đã xem ${b.daDoc.length}/${b.nguoiNhan.length}${chuaXem.length ? `. Chưa xem: ${esc(chuaXem.map(tenSV).join(', '))}` : ''}</p>
            </li>`;
          }).join('')}</ul>` : '<p class="phu">Chưa gửi thông báo nào.</p>'}
        </section>`;
    }
  };

  App.doi['chon-tat-ca'] = (el) => {
    el.closest('form').querySelectorAll('[name=nguoiNhan]').forEach((c) => (c.checked = el.checked));
  };

  App.form['gui-thong-bao'] = (f, el) => {
    const nguoiNhan = new FormData(el).getAll('nguoiNhan');
    if (!nguoiNhan.length) return thongBao('Chọn ít nhất một người nhận.', 'loi');
    Store.guiThongBao({ tieuDe: f.tieuDe.trim(), noiDung: f.noiDung.trim(), nguoiNhan });
    Store.ghiNhatKy('Gửi thông báo', `${nguoiNhan.length} người`, f.tieuDe.trim());
    App.xong('Đã gửi thông báo.');
  };

  /* ---------- Việc của tôi ---------- */
  const thamGiaCua = (viecId, mssv) => Store.state.thamGiaViec.filter((t) => t.viecId === viecId && t.mssv === mssv).pop() || null;
  const dangHieuLuc = (tg) => tg && !['da_rut'].includes(tg.trangThai);

  function dongViecDangKy(tg) {
    const v = viecCua(tg.viecId);
    const khung = v.khungGio.find((k) => k.id === tg.khungId);
    const nut = [];
    const conHan = Store.now() <= v.hanDangKy;
    if (['dang_ky', 'da_chot', 'cho'].includes(tg.trangThai) && conHan) nut.push(`<button type="button" class="nut nut-phu nut-nho" data-act="rut-viec" data-id="${esc(tg.id)}">Rút</button>`);
    if (tg.trangThai === 'da_chot' && v.ngay === homNay()) {
      if (!tg.batDau) nut.push(`<button type="button" class="nut nut-nho" data-act="bat-dau-viec" data-id="${esc(tg.id)}">Bắt đầu</button>`);
      else if (!tg.ketThuc) nut.push(`<button type="button" class="nut nut-xanh nut-nho" data-act="ket-thuc-viec" data-id="${esc(tg.id)}">Kết thúc</button>`);
    }
    return `
      <li>
        <div class="hang-dau"><strong>${esc(v.ten)}</strong>${nhan(TT_THAM_GIA, tg.trangThai)}</div>
        <p class="phu">${ngay(v.ngay)}, ${khung.tu}–${khung.den} · ${esc(v.diaDiem)}${tg.diem ? ` · ${so(tg.diem, 0)} điểm` : ''}</p>
        ${nut.length ? `<div class="hang-nut">${nut.join('')}</div>` : ''}
      </li>`;
  }

  function dongViecGiao(tg) {
    const v = viecCua(tg.viecId);
    const nut = (hd, ten, kieu = 'nut-phu') => `<button type="button" class="nut ${kieu} nut-nho" data-act="viec-giao" data-id="${esc(tg.id)}" data-hd="${hd}">${ten}</button>`;
    const theo = {
      da_giao: nut('nhan', 'Nhận việc', '') + nut('khong_nhan', 'Không nhận'),
      da_nhan: nut('bat_dau', 'Bắt đầu làm', ''),
      dang_lam: nut('bao_xong', 'Báo hoàn thành', 'nut-xanh') + (tg.daBaoTre ? '' : `<button type="button" class="nut-chu" data-act="bao-tre" data-id="${esc(tg.id)}">Báo trước sẽ trễ hạn</button>`)
    };
    return `
      <li>
        <div class="hang-dau"><strong>${esc(v.ten)}</strong>${nhan(TT_THAM_GIA, tg.trangThai)}</div>
        <p class="phu">Hạn ${ngayDu(v.hanHoanThanh)} · ${moTaMuc(v)}${tg.diem ? ` · đã nhận ${so(tg.diem, tg.diem % 1 ? 1 : 0)} điểm` : ''}</p>
        ${v.moTa ? `<p>${esc(v.moTa)}</p>` : ''}
        ${tg.yeuCauLai ? `<p class="phu">Yêu cầu làm lại: ${esc(tg.yeuCauLai)}</p>` : ''}
        ${theo[tg.trangThai] ? `<div class="hang-nut">${theo[tg.trangThai]}</div>` : ''}
      </li>`;
  }

  App.trang['viec-cua-toi'] = {
    ten: 'Việc của tôi',
    icon: 'viec',
    dem() {
      return Store.state.thamGiaViec.filter((t) => t.mssv === Store.phien.mssv && t.trangThai === 'da_giao').length;
    },
    render() {
      const t = toi();
      const st = Store.state;
      const hk = hocKyNay();
      const cs = L.tinhChiSo(st, t.mssv, hk);
      const cuaToi = st.thamGiaViec.filter((x) => x.mssv === t.mssv).slice().reverse();
      const giao = cuaToi.filter((x) => viecCua(x.viecId).loai === 'giao');
      const dotXuat = cuaToi.filter((x) => viecCua(x.viecId).loai === 'dot_xuat');
      const moDangKy = st.viec.filter((v) => v.loai === 'dot_xuat' && !v.laMau && Store.now() <= v.hanDangKy && !dangHieuLuc(thamGiaCua(v.id, t.mssv)));
      return `
        <section class="the">
          <div class="luoi-chi-so">
            <div class="chi-so"><span>Điểm cộng đồng</span><strong>${so(cs.diemCongDong, cs.diemCongDong % 1 ? 1 : 0)}</strong></div>
            <div class="chi-so"><span>Bù lỗi nhẹ</span><strong>${Math.floor(cs.diemCongDong / st.caiDat.diemBuLoi)}</strong></div>
          </div>
        </section>
        <section class="the">
          <h2>Việc được giao</h2>
          ${giao.length ? `<ul class="ds-canh-bao">${giao.map(dongViecGiao).join('')}</ul>` : '<p class="phu">Chưa có việc được giao.</p>'}
        </section>
        <section class="the">
          <h2>Việc đột xuất đang mở</h2>
          ${moDangKy.length ? `<ul class="ds-canh-bao">${moDangKy.map((v) => `
            <li>
              <div class="hang-dau"><strong>${esc(v.ten)}</strong><button type="button" class="nut nut-nho" data-act="mo-dang-ky-viec" data-id="${esc(v.id)}">Đăng ký</button></div>
              <p class="phu">${ngay(v.ngay)} · ${esc(v.diaDiem)} · ${moTaMuc(v)} · hạn ${ngayGio(v.hanDangKy)}</p>
            </li>`).join('')}</ul>` : '<p class="phu">Hiện không có việc đang mở đăng ký.</p>'}
        </section>
        ${dotXuat.length ? `<section class="the"><h2>Việc đã đăng ký</h2><ul class="ds-canh-bao">${dotXuat.map(dongViecDangKy).join('')}</ul></section>` : ''}`;
    }
  };

  App.act['mo-dang-ky-viec'] = (el) => {
    const v = viecCua(el.dataset.id);
    const cau = (q) => {
      if (q.kieu === 'tra_loi_ngan') return `<label>${esc(q.cauHoi)} <input name="q-${esc(q.id)}" required /></label>`;
      const loai = q.kieu === 'chon_mot' ? 'radio' : 'checkbox';
      return `<fieldset><legend>${esc(q.cauHoi)}</legend>${q.luaChon.map((l) => `<label class="o-chon"><input type="${loai}" name="q-${esc(q.id)}" value="${esc(l)}"${loai === 'radio' ? ' required' : ''} /><span>${esc(l)}</span></label>`).join('')}</fieldset>`;
    };
    moHop(v.ten, `
      ${v.moTa ? `<p>${esc(v.moTa)}</p>` : ''}
      <p class="phu">${ngay(v.ngay)} · ${esc(v.diaDiem)} · ${moTaMuc(v)}</p>
      <form data-form="dang-ky-viec" data-id="${esc(v.id)}">
        <fieldset><legend>Khung giờ</legend>
          ${v.khungGio.map((k) => `<label class="o-chon"><input type="radio" name="khungId" value="${esc(k.id)}" required /><span>${k.tu}–${k.den} (${L.soDaChot(Store.state, v.id, k.id)}/${v.soNguoi} người)</span></label>`).join('')}
        </fieldset>
        ${v.cauHoiBieuMau.map(cau).join('')}
        <p id="loi-viec" class="loi" role="alert" hidden></p>
        <div class="hang-nut canh-phai"><button class="nut">Gửi đăng ký</button></div>
      </form>`);
  };

  App.form['dang-ky-viec'] = async (f, el) => {
    const v = viecCua(el.dataset.id);
    const t = toi();
    const kq = L.kiemTraDangKyViec(v, f.khungId, t.mssv, Store.state, Store.now());
    const baoLoi = document.getElementById('loi-viec');
    if (!kq.ok) {
      baoLoi.hidden = false;
      baoLoi.textContent = kq.loi[0];
      return;
    }
    if (kq.canhBao.length && !(await xacNhan(`${kq.canhBao.join(' ')} Vẫn đăng ký?`, 'Vẫn đăng ký'))) return;
    const du = new FormData(el);
    const traLoi = Object.fromEntries(v.cauHoiBieuMau.map((q) => [q.id, q.kieu === 'chon_nhieu' ? du.getAll(`q-${q.id}`) : du.get(`q-${q.id}`)]));
    Store.state.thamGiaViec.push({ id: Store.id('tg'), viecId: v.id, mssv: t.mssv, khungId: f.khungId, hocKyId: L.hocKyHienTai(Store.state, L.mocGio(v.ngay, '12:00')).id, traLoi, trangThai: kq.trangThai, diem: 0, danhGiaTot: false });
    App.xong(kq.trangThai === 'cho' ? 'Khung đã đủ người, bạn ở danh sách chờ.' : 'Đã đăng ký việc.');
  };

  App.act['rut-viec'] = async (el) => {
    const tg = Store.state.thamGiaViec.find((x) => x.id === el.dataset.id);
    if (!(await xacNhan('Rút khỏi việc này? Rút trước hạn đăng ký thì không tính gì.', 'Rút'))) return;
    const giuSuat = tg.trangThai === 'da_chot';
    tg.trangThai = 'da_rut';
    if (giuSuat) {
      const keTiep = L.nguoiChoKeTiep(Store.state, tg.viecId, tg.khungId);
      if (keTiep) {
        keTiep.trangThai = 'da_chot';
        Store.guiThongBao({ tieuDe: 'Bạn có suất việc đột xuất', noiDung: viecCua(tg.viecId).ten, loai: 'viec_dot_xuat', nguoiNhan: [keTiep.mssv] });
      }
    }
    App.xong('Đã rút.');
  };

  App.act['bat-dau-viec'] = (el) => {
    Store.state.thamGiaViec.find((x) => x.id === el.dataset.id).batDau = Store.now();
    App.xong(`Đã ghi giờ bắt đầu ${gio(Store.now())}.`);
  };
  App.act['ket-thuc-viec'] = (el) => {
    Store.state.thamGiaViec.find((x) => x.id === el.dataset.id).ketThuc = Store.now();
    App.xong('Đã ghi giờ kết thúc, chờ quản lý xác nhận.');
  };

  App.act['bao-tre'] = (el) => {
    const tg = Store.state.thamGiaViec.find((x) => x.id === el.dataset.id);
    App.hoiLyDo('Báo trước sẽ trễ hạn', 'Báo trước thì không bị trừ nửa số điểm.', (lyDo) => {
      Object.assign(tg, { daBaoTre: true, lyDoTre: lyDo });
      Store.ghiNhatKy('Báo trễ hạn', tg.mssv, `${viecCua(tg.viecId).ten}: ${lyDo}`);
      App.xong('Đã báo.');
    });
  };

  App.act['viec-giao'] = (el) => {
    const tg = Store.state.thamGiaViec.find((x) => x.id === el.dataset.id);
    const hd = el.dataset.hd;
    const chuyen = (them = {}) => {
      Object.assign(tg, { trangThai: L.chuyenViecGiao(tg.trangThai, hd) }, them);
      App.xong('Đã cập nhật.');
    };
    if (hd === 'khong_nhan') return App.hoiLyDo('Không nhận việc', 'Không trừ điểm, ghi lý do để PTN sắp xếp người khác.', (lyDo) => chuyen({ lyDoKhongNhan: lyDo }));
    if (hd === 'bao_xong') {
      return App.hoiLyDo('Báo hoàn thành', 'Mô tả kết quả công việc.', (lyDo) => chuyen({ ketQua: lyDo, baoXongLuc: Store.now() }));
    }
    chuyen();
  };

  /* ---------- Việc ngoài ca (quản lý) ---------- */
  const dongKhung = (k = {}) => `
    <div class="khung-dong">
      <label>Từ <input type="time" name="khungTu" value="${esc(k.tu)}" /></label>
      <label>Đến <input type="time" name="khungDen" value="${esc(k.den)}" /></label>
      <button type="button" class="nut-chu" data-act="xoa-dong">Xóa</button>
    </div>`;
  const dongCau = (q = {}) => `
    <div class="cau-dong">
      <label>Câu hỏi <input name="cauHoi" value="${esc(q.cauHoi)}" /></label>
      <label>Kiểu <select name="cauKieu">${[['tra_loi_ngan', 'Trả lời ngắn'], ['chon_mot', 'Chọn một'], ['chon_nhieu', 'Chọn nhiều']].map(([k, n]) => `<option value="${k}"${q.kieu === k ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>Lựa chọn (cách nhau dấu phẩy) <input name="cauLuaChon" value="${esc((q.luaChon || []).join(', '))}" /></label>
      <button type="button" class="nut-chu" data-act="xoa-dong">Xóa</button>
    </div>`;

  App.act['them-khung'] = () => document.getElementById('ds-khung').insertAdjacentHTML('beforeend', dongKhung());
  App.act['them-cau'] = () => document.getElementById('ds-cau').insertAdjacentHTML('beforeend', dongCau());
  App.act['xoa-dong'] = (el) => el.parentElement.remove();

  function formTaoViec() {
    const st = Store.state;
    const m = st.viec.find((v) => v.id === App.ui.mauViec) || {};
    const loai = m.loai || App.ui.loaiViec || 'dot_xuat';
    const mau = st.viec.filter((v) => v.laMau);
    return `
      <details class="the"${App.ui.moTaoViec ? ' open' : ''}>
        <summary>Tạo việc mới</summary>
        ${mau.length ? `<label>Dùng lại mẫu <select data-doi="chon-mau-viec"><option value="">Không dùng mẫu</option>${mau.map((v) => `<option value="${esc(v.id)}"${v.id === m.id ? ' selected' : ''}>${esc(v.ten)}</option>`).join('')}</select></label>` : ''}
        <form data-form="tao-viec">
          <div class="luoi-form">
            <label>Loại <select name="loai" data-doi="doi-loai-viec">
              <option value="dot_xuat"${loai === 'dot_xuat' ? ' selected' : ''}>Việc đột xuất (tự đăng ký)</option>
              <option value="giao"${loai === 'giao' ? ' selected' : ''}>Giao đích danh</option></select></label>
            <label>Tên việc <input name="ten" value="${esc(m.ten)}" required /></label>
            <label class="rong-het">Mô tả <textarea name="moTa" rows="2">${esc(m.moTa)}</textarea></label>
            <label>Địa điểm <input name="diaDiem" value="${esc(m.diaDiem)}" required /></label>
            <label>Mức điểm <select name="mucDiem">${Object.keys(st.caiDat.mucDiem).map((k) => `<option value="${k}"${m.mucDiem === k ? ' selected' : ''}>${TEN_MUC[k]} (${st.caiDat.mucDiem[k]} điểm)</option>`).join('')}</select></label>
          </div>
          ${loai === 'dot_xuat' ? `
            <div class="luoi-form">
              <label>Ngày làm <input type="date" name="ngay" min="${homNay()}" required /></label>
              <label>Hạn đăng ký <input type="datetime-local" name="hanDangKy" required /></label>
              <label>Số người mỗi khung <input type="number" name="soNguoi" min="1" value="${esc(m.soNguoi || 2)}" required /></label>
              <label>Cách chốt <select name="cachChot"><option value="thu_tu">Theo thứ tự đăng ký</option><option value="quan_ly"${m.cachChot === 'quan_ly' ? ' selected' : ''}>Quản lý chọn</option></select></label>
            </div>
            <h3>Khung giờ</h3>
            <div id="ds-khung">${(m.khungGio?.length ? m.khungGio : [{}]).map(dongKhung).join('')}</div>
            <button type="button" class="nut-chu" data-act="them-khung">Thêm khung giờ</button>
            <h3>Câu hỏi riêng</h3>
            <div id="ds-cau">${(m.cauHoiBieuMau || []).map(dongCau).join('')}</div>
            <button type="button" class="nut-chu" data-act="them-cau">Thêm câu hỏi</button>
            <label class="o-chon"><input type="checkbox" name="luuMau" /><span>Lưu thêm thành mẫu dùng lại</span></label>
          ` : `
            <div class="luoi-form"><label>Hạn hoàn thành <input type="date" name="hanHoanThanh" min="${homNay()}" required /></label></div>
            <fieldset class="chon-cot"><legend>Giao cho</legend>
              ${dangTruc().map((t) => `<label class="o-chon"><input type="checkbox" name="nguoiNhan" value="${esc(t.mssv)}" /><span>${esc(t.hoTen)}</span></label>`).join('')}
            </fieldset>`}
          <p id="loi-tao-viec" class="loi" role="alert" hidden></p>
          <div class="hang-nut"><button class="nut">Tạo việc</button></div>
        </form>
      </details>`;
  }

  App.doi['doi-loai-viec'] = (el) => {
    Object.assign(App.ui, { loaiViec: el.value, mauViec: null, moTaoViec: true });
    App.render();
  };
  App.doi['chon-mau-viec'] = (el) => {
    Object.assign(App.ui, { mauViec: el.value, loaiViec: 'dot_xuat', moTaoViec: true });
    App.render();
  };

  App.form['tao-viec'] = (f, el) => {
    const du = new FormData(el);
    const baoLoi = (noiDung) => {
      const p = document.getElementById('loi-tao-viec');
      p.hidden = false;
      p.textContent = noiDung;
    };
    const chung = { id: Store.id('viec'), loai: f.loai, ten: f.ten.trim(), moTa: f.moTa.trim(), diaDiem: f.diaDiem.trim(), mucDiem: f.mucDiem, laMau: false };

    if (f.loai === 'giao') {
      const nguoiNhan = du.getAll('nguoiNhan');
      if (!nguoiNhan.length) return baoLoi('Chọn người được giao.');
      const viec = { ...chung, ngay: homNay(), khungGio: [], soNguoi: nguoiNhan.length, hanDangKy: null, hanHoanThanh: f.hanHoanThanh, cachChot: 'quan_ly', cauHoiBieuMau: [] };
      Store.state.viec.push(viec);
      nguoiNhan.forEach((mssv) => Store.state.thamGiaViec.push({ id: Store.id('tg'), viecId: viec.id, mssv, hocKyId: hocKyNay().id, traLoi: {}, trangThai: 'da_giao', diem: 0 }));
      Store.guiThongBao({ tieuDe: 'Bạn được giao việc', noiDung: `${viec.ten}, hạn ${ngayDu(viec.hanHoanThanh)}.`, loai: 'viec_giao', nguoiNhan });
    } else {
      const tu = du.getAll('khungTu');
      const den = du.getAll('khungDen');
      const khungGio = tu.map((x, i) => ({ id: `k${i + 1}`, tu: x, den: den[i] })).filter((k) => k.tu && k.den);
      if (!khungGio.length) return baoLoi('Cần ít nhất một khung giờ.');
      if (khungGio.some((k) => L.phut(k.den) <= L.phut(k.tu))) return baoLoi('Giờ kết thúc phải sau giờ bắt đầu.');
      const hanDangKy = new Date(f.hanDangKy).getTime();
      if (hanDangKy >= L.mocGio(f.ngay, khungGio[0].tu)) return baoLoi('Hạn đăng ký phải trước giờ làm.');
      const kieu = du.getAll('cauKieu');
      const luaChon = du.getAll('cauLuaChon');
      const cauHoiBieuMau = du.getAll('cauHoi')
        .map((cauHoi, i) => ({ id: `q${i + 1}`, cauHoi: cauHoi.trim(), kieu: kieu[i], luaChon: luaChon[i].split(',').map((x) => x.trim()).filter(Boolean) }))
        .filter((q) => q.cauHoi);
      if (cauHoiBieuMau.some((q) => q.kieu !== 'tra_loi_ngan' && q.luaChon.length < 2)) return baoLoi('Câu chọn đáp án cần ít nhất 2 lựa chọn.');
      const viec = { ...chung, ngay: f.ngay, khungGio, soNguoi: Number(f.soNguoi), hanDangKy, hanHoanThanh: null, cachChot: f.cachChot, cauHoiBieuMau };
      Store.state.viec.push(viec);
      if ('luuMau' in f) Store.state.viec.push({ ...viec, id: Store.id('mau'), ngay: '', hanDangKy: null, laMau: true });
      Store.guiThongBao({ tieuDe: 'Mở đăng ký việc đột xuất', noiDung: `${viec.ten}, ${ngay(viec.ngay)}. Xem ở Việc của tôi.`, loai: 'viec_dot_xuat', nguoiNhan: dangTruc().map((t) => t.mssv) });
    }
    Store.ghiNhatKy('Tạo việc', chung.ten);
    Object.assign(App.ui, { mauViec: null, moTaoViec: false });
    App.xong('Đã tạo việc và gửi thông báo.');
  };

  App.trang['viec-ngoai-ca'] = {
    ten: 'Việc ngoài ca',
    icon: 'viec',
    dem() {
      return Store.state.thamGiaViec.filter((t) => t.trangThai === 'bao_hoan_thanh').length;
    },
    render() {
      const st = Store.state;
      const hk = hocKyNay();
      const ds = st.viec.filter((v) => !v.laMau).slice().reverse();
      const dem = (v) => st.thamGiaViec.filter((t) => t.viecId === v.id && t.trangThai !== 'da_rut').length;
      const canXuLy = (v) => st.thamGiaViec.filter((t) => t.viecId === v.id && ['dang_ky', 'bao_hoan_thanh'].includes(t.trangThai)).length;
      return `
        ${formTaoViec()}
        <section class="the">
          <h2>Danh sách việc</h2>
          ${ds.length ? `<ul class="ds-canh-bao">${ds.map((v) => `
            <li>
              <div class="hang-dau">
                <button type="button" class="nut-chu" data-act="chi-tiet-viec" data-id="${esc(v.id)}">${esc(v.ten)}</button>
                ${canXuLy(v) ? `<span class="nhan nhan-vang">${canXuLy(v)} cần xử lý</span>` : ''}
              </div>
              <p class="phu">${v.loai === 'giao' ? `Giao đích danh · hạn ${ngayDu(v.hanHoanThanh)}` : `Đột xuất · ${ngay(v.ngay)}`} · ${moTaMuc(v)} · ${dem(v)} người</p>
            </li>`).join('')}</ul>` : '<p class="phu">Chưa có việc nào.</p>'}
        </section>
        <section class="the">
          <div class="hang-dau"><h2>Thống kê ${esc(hk.ten)}</h2><button type="button" class="nut nut-phu nut-nho" data-act="xuat-thong-ke-viec">Xuất Excel</button></div>
          <div class="cuon-ngang"><table class="bang">
            <thead><tr><th>Trợ lý</th><th class="so">Đăng ký</th><th class="so">Đã làm</th><th class="so">Được giao</th><th class="so">Đúng hạn</th><th class="so">Không nhận</th><th class="so">Điểm</th></tr></thead>
            <tbody>${dangTruc().map((t) => {
              const k = L.thongKeViec(st, t.mssv, hk);
              return `<tr><td>${esc(t.hoTen)}</td><td class="so">${k.daDangKy}</td><td class="so">${k.daLam}</td><td class="so">${k.duocGiao}</td><td class="so">${tyLe(k.tyLeDungHan)}</td><td class="so">${k.khongNhan}</td><td class="so">${so(k.tongDiem, k.tongDiem % 1 ? 1 : 0)}</td></tr>`;
            }).join('')}</tbody>
          </table></div>
        </section>`;
    }
  };

  App.act['xuat-thong-ke-viec'] = () => {
    const hk = hocKyNay();
    const dong = dangTruc().map((t) => {
      const k = L.thongKeViec(Store.state, t.mssv, hk);
      return { MSSV: t.mssv, 'Họ tên': t.hoTen, 'Đã đăng ký': k.daDangKy, 'Đã làm': k.daLam, 'Được giao': k.duocGiao, 'Đúng hạn (%)': k.tyLeDungHan === null ? '' : Math.round(k.tyLeDungHan), 'Không nhận': k.khongNhan, 'Tổng điểm': k.tongDiem };
    });
    const sach = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(sach, XLSX.utils.json_to_sheet(dong), 'Việc ngoài ca');
    XLSX.writeFile(sach, `thong-ke-viec-${homNay()}.xlsx`);
  };

  function hanhDongThamGia(tg, v) {
    const nut = (act, ten, kieu = 'nut-phu', them = '') => `<button type="button" class="nut ${kieu} nut-nho" data-act="${act}" data-id="${esc(tg.id)}"${them}>${ten}</button>`;
    if (tg.trangThai === 'dang_ky') return nut('chot-nguoi', 'Chốt', '');
    if (v.loai === 'dot_xuat' && tg.trangThai === 'da_chot') {
      return nut('xac-nhan-viec', 'Có mặt', 'nut-xanh', ' data-kq="dat"') + nut('xac-nhan-viec', 'Có mặt, tốt (+1)', 'nut-xanh', ' data-kq="tot"') + nut('xac-nhan-viec', 'Không đến', 'nut-phu', ' data-kq="khong"');
    }
    if (tg.trangThai === 'bao_hoan_thanh') return nut('xac-nhan-giao', 'Đạt', 'nut-xanh', ' data-hd="dat"') + nut('xac-nhan-giao', 'Làm lại', 'nut-phu', ' data-hd="lam_lai"');
    return '';
  }

  App.act['chi-tiet-viec'] = (el) => {
    const v = viecCua(el.dataset.id);
    App.ui.viecDangXem = v.id;
    const ds = Store.state.thamGiaViec.filter((t) => t.viecId === v.id);
    const cauHoi = (tg) => v.cauHoiBieuMau.map((q) => `<small>${esc(q.cauHoi)}: ${esc([].concat(tg.traLoi[q.id] ?? '').join(', '))}</small>`).join('');
    moHop(v.ten, `
      <p class="phu">${v.loai === 'giao' ? `Hạn ${ngayDu(v.hanHoanThanh)}` : `${ngay(v.ngay)} · hạn đăng ký ${ngayGio(v.hanDangKy)}`} · ${esc(v.diaDiem)} · ${moTaMuc(v)}</p>
      ${v.moTa ? `<p>${esc(v.moTa)}</p>` : ''}
      ${ds.length ? `<ul class="ds-canh-bao">${ds.map((tg) => {
        const khung = v.khungGio.find((k) => k.id === tg.khungId);
        const gioLam = tg.batDau ? `Làm ${gio(tg.batDau)}–${gio(tg.ketThuc)}` : '';
        return `<li>
          <div class="hang-dau"><strong>${esc(tenSV(tg.mssv))}</strong>${nhan(TT_THAM_GIA, tg.trangThai)}</div>
          <p class="phu">${[khung ? `${khung.tu}–${khung.den}` : '', gioLam, tg.ketQua ? `Kết quả: ${esc(tg.ketQua)}` : '', tg.lyDoKhongNhan ? `Lý do: ${esc(tg.lyDoKhongNhan)}` : '', tg.daBaoTre ? 'Đã báo trước trễ hạn' : '', tg.diem ? `${tg.diem} điểm` : ''].filter(Boolean).join(' · ')}</p>
          ${cauHoi(tg)}
          <div class="hang-nut">${hanhDongThamGia(tg, v)}</div>
        </li>`;
      }).join('')}</ul>` : '<p class="phu">Chưa có ai đăng ký.</p>'}`, { rong: true });
  };

  /* Sau khi xử lý một người, giữ hộp chi tiết mở để xử lý tiếp. */
  const moLaiChiTiet = (viecId) => App.act['chi-tiet-viec']({ dataset: { id: viecId } });

  App.act['chot-nguoi'] = (el) => {
    const tg = Store.state.thamGiaViec.find((x) => x.id === el.dataset.id);
    const v = viecCua(tg.viecId);
    if (L.soDaChot(Store.state, v.id, tg.khungId) >= v.soNguoi) return UI.moHop('Không chốt được', '<p>Khung này đã đủ người.</p>');
    tg.trangThai = 'da_chot';
    Store.guiThongBao({ tieuDe: 'Bạn đã được chốt việc', noiDung: v.ten, loai: 'viec_dot_xuat', nguoiNhan: [tg.mssv] });
    App.xong();
    moLaiChiTiet(v.id);
  };

  App.act['xac-nhan-viec'] = (el) => {
    const st = Store.state;
    const tg = st.thamGiaViec.find((x) => x.id === el.dataset.id);
    const v = viecCua(tg.viecId);
    const kq = el.dataset.kq;
    if (kq === 'khong') {
      tg.trangThai = 'khong_den';
      st.soNeNep.push({ id: Store.id('nn'), mssv: tg.mssv, ngay: v.ngay, loai: 'loi_nhe', danhMuc: 'Được chốt việc đột xuất mà không đến, không báo', ghiChu: v.ten, nguoiGhi: Store.nguoiDung().id, phanHoi: '' });
      Store.ghiNhatKy('Không đến việc đột xuất', tg.mssv, v.ten);
    } else {
      const tot = kq === 'tot';
      Object.assign(tg, { trangThai: 'co_mat', danhGiaTot: tot, diem: L.diemDotXuat(v, st.caiDat, tot), gioNgoaiCa: L.gioNgoaiCa(st, v, tg) });
      Store.ghiNhatKy('Xác nhận việc đột xuất', tg.mssv, `${v.ten}: ${tg.diem} điểm`);
    }
    App.xong();
    moLaiChiTiet(v.id);
  };

  App.act['xac-nhan-giao'] = (el) => {
    const st = Store.state;
    const tg = st.thamGiaViec.find((x) => x.id === el.dataset.id);
    const v = viecCua(tg.viecId);
    if (el.dataset.hd === 'dat') {
      Object.assign(tg, { trangThai: L.chuyenViecGiao(tg.trangThai, 'dat'), diem: L.diemViecGiao(v, st.caiDat, tg) });
      Store.ghiNhatKy('Xác nhận việc giao', tg.mssv, `${v.ten}: ${tg.diem} điểm`);
      Store.guiThongBao({ tieuDe: 'Việc được giao đã hoàn thành', noiDung: `${v.ten}: +${tg.diem} điểm.`, nguoiNhan: [tg.mssv] });
      App.xong();
      return moLaiChiTiet(v.id);
    }
    App.hoiLyDo('Yêu cầu làm lại', tenSV(tg.mssv), (lyDo) => {
      Object.assign(tg, { trangThai: L.chuyenViecGiao(tg.trangThai, 'lam_lai'), yeuCauLai: lyDo });
      Store.ghiNhatKy('Yêu cầu làm lại', tg.mssv, `${v.ten}: ${lyDo}`);
      Store.guiThongBao({ tieuDe: 'Việc cần làm lại', noiDung: `${v.ten}: ${lyDo}`, nguoiNhan: [tg.mssv] });
      App.xong();
    });
  };
})();
