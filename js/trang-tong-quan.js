/* Trang chủ của trợ lý và Tổng quan của quản lý: số liệu chính, biểu đồ giờ trực, việc cần xử lý. */
(function () {
  const L = window.Logic;
  const { esc, ngay, gio, so, tyLe, nhan, avatar, bieuTuong } = window.UI;
  const homNay = () => L.ngayKey(new Date(Store.now()));

  /* Một chuỗi số liệu nên chỉ một màu, không cần chú giải; ghi số ở tuần gần nhất có giờ, các cột khác xem khi rê chuột. */
  function bieuDoGio(ds, tieuDe) {
    const lonNhat = Math.max(...ds.map((x) => x.gio), 1);
    const dinh = Math.ceil(lonNhat / 10) * 10;
    const nhanTuan = (k) => k.split('-').reverse().slice(0, 2).join('/');
    const coNhan = ds.map((x) => x.gio > 0).lastIndexOf(true);
    return `
      <figure class="bieu-do" aria-label="${esc(tieuDe)}">
        <div class="vung-cot">
          <div class="luoi-cot" aria-hidden="true"><span>${dinh}</span><span>${dinh / 2}</span><span>0</span></div>
          <div class="cac-cot">
            ${ds.map((x, i) => {
              const noiDung = `Tuần ${nhanTuan(x.tuan)}: ${so(x.gio)} giờ`;
              return `<div class="cot" tabindex="0" data-tip="${esc(noiDung)}" aria-label="${esc(noiDung)}">
                ${i === coNhan ? `<b>${so(x.gio)}</b>` : ''}
                <i style="height:${(x.gio / dinh) * 100}%"></i>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="truc-cot" aria-hidden="true">${ds.map((x) => `<span>${nhanTuan(x.tuan)}</span>`).join('')}</div>
      </figure>
      <details class="bang-so-lieu"><summary>Xem bảng số liệu</summary>
        <table class="bang"><thead><tr><th>Tuần bắt đầu</th><th class="so">Giờ</th></tr></thead>
        <tbody>${ds.map((x) => `<tr><td>${nhanTuan(x.tuan)}</td><td class="so">${so(x.gio)}</td></tr>`).join('')}</tbody></table>
      </details>`;
  }

  const oSo = (ten, giaTri, phu, icon, trang) => {
    const than = `<span class="o-so-icon" aria-hidden="true">${bieuTuong(icon)}</span>
      <span class="o-so-nhan">${esc(ten)}</span><strong>${giaTri}</strong>${phu ? `<small>${esc(phu)}</small>` : ''}`;
    return trang
      ? `<button type="button" class="o-so" data-act="di-den" data-trang="${trang}">${than}</button>`
      : `<div class="o-so">${than}</div>`;
  };

  /* Vòng tiến độ: một con số chính nên dùng cung tròn đơn giản, không phải biểu đồ tròn. */
  function vongTienDo(phanTram, giua, duoi) {
    const r = 52;
    const chuVi = 2 * Math.PI * r;
    return `<div class="vong" role="img" aria-label="${esc(`${giua} ${duoi}`)}">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="${r}" class="vong-nen" />
        <circle cx="60" cy="60" r="${r}" class="vong-gia-tri" stroke-dasharray="${(Math.min(100, phanTram) / 100) * chuVi} ${chuVi}" />
      </svg>
      <div><strong>${esc(giua)}</strong><small>${esc(duoi)}</small></div>
    </div>`;
  }

  /* ---------- Trang chủ trợ lý ---------- */
  function caKeTiep(t) {
    return Store.state.caTruc
      .filter((c) => c.mssv === t.mssv && c.trangThai === 'da_dang_ky' && L.mocGio(c.ngay, c.den) > Store.now())
      .sort((a, b) => L.mocGio(a.ngay, a.tu) - L.mocGio(b.ngay, b.tu))[0] || null;
  }

  function viecCanLam(t) {
    const st = Store.state;
    const ds = L.nhacTuDong(st, t.mssv, Store.now()).map((noiDung) => ({ noiDung, trang: 'thong-bao', icon: 'chuong' }));
    const moiGiao = st.thamGiaViec.filter((x) => x.mssv === t.mssv && x.trangThai === 'da_giao').length;
    if (moiGiao) ds.push({ noiDung: `${moiGiao} việc mới được giao`, trang: 'viec-cua-toi', icon: 'viec' });
    const chuaDoc = st.thongBao.filter((b) => b.nguoiNhan.includes(t.mssv) && !b.daDoc.includes(t.mssv)).length;
    if (chuaDoc) ds.push({ noiDung: `${chuaDoc} thông báo chưa xem`, trang: 'thong-bao', icon: 'chuong' });
    if (!L.daXacNhanNoiQuy(st, t.mssv)) ds.push({ noiDung: 'Nội quy cần cam kết', trang: 'noi-quy', icon: 'khien' });
    return ds;
  }

  const dongViec = (x) => `
    <li><button type="button" class="dong-viec" data-act="di-den" data-trang="${x.trang}">
      <span class="dong-viec-icon" aria-hidden="true">${bieuTuong(x.icon)}</span><span>${esc(x.noiDung)}</span><span class="mui-ten" aria-hidden="true">›</span>
    </button></li>`;

  App.trang['trang-chu'] = {
    ten: 'Trang chủ',
    icon: 'nha',
    render() {
      const st = Store.state;
      const t = Store.troLy(Store.phien.mssv);
      const hk = L.hocKyHienTai(st, Store.now());
      const cs = L.tinhChiSo(st, t.mssv, hk);
      const tuan = L.tuanThu(hk, Store.now());
      const tt = L.trangThaiNeNep(cs, st.caiDat, tuan);
      const ca = caKeTiep(t);
      const viec = viecCanLam(t);
      const ten = t.hoTen.trim().split(/\s+/).slice(-2).join(' ');
      const homNayCo = ca?.ngay === homNay();
      return `
        <section class="hero">
          <div>
            <p class="hero-phu">${esc(hk.ten)} · tuần ${tuan}</p>
            <h2>Chào ${esc(ten)}</h2>
            ${ca ? `<p>Ca ${homNayCo ? 'hôm nay' : 'kế tiếp'}: <b>${ngay(ca.ngay)}, ${ca.tu}–${ca.den}</b></p>` : '<p>Bạn chưa có ca sắp tới.</p>'}
            <button type="button" class="nut nut-sang" data-act="di-den" data-trang="${ca ? 'ca-hom-nay' : 'lich-truc'}">${ca ? 'Xem ca trực' : 'Đăng ký ca trực'}</button>
          </div>
          ${vongTienDo((cs.tongGio / st.caiDat.gioToiThieu) * 100, so(cs.tongGio), `/ ${st.caiDat.gioToiThieu} giờ`)}
        </section>
        <div class="luoi-o-so">
          ${oSo('Tham gia', tyLe(cs.tyLeThamGia), `${cs.caTrucDu}/${cs.caTinh} ca đủ`, 'ca')}
          ${oSo('Đúng giờ', tyLe(cs.tyLeDungGio), `${cs.caDenDungGio}/${cs.caCoDen} ca`, 'tien')}
          ${oSo('Điểm cộng đồng', so(cs.diemCongDong, cs.diemCongDong % 1 ? 1 : 0), '', 'sao', 'viec-cua-toi')}
          ${oSo('Nề nếp', UI.MUC_NE_NEP[tt.muc][0], tt.lyDo[0] || 'Không có lưu ý', 'khien', 'tien-do')}
        </div>
        <div class="hai-cot">
          <section class="the">
            <div class="hang-dau"><h2>Giờ trực 8 tuần gần đây</h2></div>
            ${bieuDoGio(L.gioTheoTuan(st, t.mssv, Store.now()), 'Giờ trực theo tuần')}
          </section>
          <section class="the">
            <h2>Cần làm</h2>
            ${viec.length ? `<ul class="ds-viec">${viec.map(dongViec).join('')}</ul>` : '<p class="phu">Bạn đã xử lý hết.</p>'}
          </section>
        </div>`;
    }
  };

  /* ---------- Tổng quan quản lý ---------- */
  App.trang['tong-quan'] = {
    ten: 'Tổng quan',
    icon: 'nha',
    render() {
      const st = Store.state;
      const now = Store.now();
      const hn = homNay();
      const hk = L.hocKyHienTai(st, now);
      const tuan = L.tuanThu(hk, now);
      const dangTruc = st.troLy.filter((t) => ['thu_viec', 'dang_hoat_dong'].includes(t.trangThai));
      const nenep = dangTruc.map((t) => L.trangThaiNeNep(L.tinhChiSo(st, t.mssv, hk), st.caiDat, tuan).muc);
      const dem = (m) => nenep.filter((x) => x === m).length;
      const caHomNay = st.caTruc.filter((c) => c.ngay === hn && L.CA_GIU_CHO.includes(c.trangThai)).sort((a, b) => a.tu.localeCompare(b.tu));
      const dangO = st.luotTruc.filter((l) => !l.ketThuc && st.caTruc.find((c) => c.id === l.caTrucId)?.ngay === hn);
      const choDuyet = st.luotTruc.filter((l) => !l.daDuyet && l.ketThuc).length + st.luotTruc.filter((l) => !l.daDuyet && !l.ketThuc && st.caTruc.find((c) => c.id === l.caTrucId)?.ngay < hn).length;
      const don = st.donVang.filter((d) => d.trangThai === 'cho_duyet').length + st.doiCa.filter((d) => d.trangThai === 'cho_duyet').length + st.deNghi.filter((d) => d.trangThai === 'cho_duyet').length;
      const ungVien = st.troLy.filter((t) => t.trangThai === 'cho_duyet').length;
      const choCham = st.baiLam.filter((b) => b.ketQua === 'cho_cham' && !b.moLaiBoi).length;
      const viecCho = st.thamGiaViec.filter((t) => t.trangThai === 'bao_hoan_thanh').length;
      const ds = [
        choDuyet && { noiDung: `${choDuyet} ca trực chờ duyệt`, trang: 'bang-ca', icon: 'ca' },
        don && { noiDung: `${don} đơn chờ xử lý`, trang: 'duyet-don', icon: 'don' },
        ungVien && { noiDung: `${ungVien} ứng viên đang chờ xét`, trang: 'danh-sach', icon: 'nguoi' },
        choCham && { noiDung: `${choCham} bài tự luận chờ chấm`, trang: 'quan-ly-tap-huan', icon: 'hoc' },
        viecCho && { noiDung: `${viecCho} việc chờ xác nhận`, trang: 'viec-ngoai-ca', icon: 'viec' }
      ].filter(Boolean);
      return `
        <div class="luoi-o-so">
          ${oSo('Ca hôm nay', caHomNay.length, dangO.length ? `${dangO.length} người đang trực` : 'Chưa có ai đang trực', 'ca', 'bang-ca')}
          ${oSo('Chờ duyệt ca', choDuyet, '', 'don', 'bang-ca')}
          ${oSo('Đơn chờ xử lý', don, '', 'don', 'duyet-don')}
          ${oSo('Trợ lý đang hoạt động', dangTruc.length, ungVien ? `${ungVien} ứng viên chờ xét` : '', 'nhom', 'danh-sach')}
        </div>
        <div class="hai-cot">
          <section class="the">
            <div class="hang-dau"><h2>Tổng giờ trực đã duyệt, 8 tuần gần đây</h2></div>
            ${bieuDoGio(L.gioTheoTuan(st, null, now), 'Tổng giờ trực theo tuần')}
          </section>
          <section class="the">
            <h2>Cần xử lý</h2>
            ${ds.length ? `<ul class="ds-viec">${ds.map(dongViec).join('')}</ul>` : '<p class="phu">Không còn việc tồn đọng.</p>'}
          </section>
        </div>
        <div class="hai-cot">
          <section class="the">
            <div class="hang-dau"><h2>Nề nếp học kỳ</h2><button type="button" class="nut-chu" data-act="di-den" data-trang="canh-bao">Xem danh sách</button></div>
            <p class="phu">${esc(hk.ten)}, tuần ${tuan}</p>
            <div class="luoi-ne-nep">
              ${['binh_thuong', 'nhac_nho', 'canh_bao', 'mat_tu_cach'].map((m) => `<div><strong>${dem(m)}</strong>${nhan(UI.MUC_NE_NEP, m)}</div>`).join('')}
            </div>
          </section>
          <section class="the">
            <h2>Ca hôm nay</h2>
            ${caHomNay.length ? `<ul class="ds-gon">${caHomNay.slice(0, 6).map((c) => {
              const l = st.luotTruc.find((x) => x.caTrucId === c.id);
              const ten = Store.troLy(c.mssv)?.hoTen || c.mssv;
              return `<li><span class="dong-nguoi">${avatar(ten)}<span>${esc(ten)}<small>${c.tu}–${c.den}</small></span></span>
                ${l && !l.ketThuc ? `<span class="nhan nhan-luc">Vào ${gio(l.batDau)}</span>` : ''}</li>`;
            }).join('')}</ul>` : '<p class="phu">Hôm nay chưa có ai đăng ký ca.</p>'}
          </section>
        </div>`;
    }
  };
})();
