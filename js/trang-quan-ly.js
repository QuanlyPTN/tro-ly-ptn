/* Phần quản lý: bảng ca, duyệt ca, danh sách trợ lý, sổ nề nếp, danh sách cảnh báo (mục 8). */
(function () {
  const L = window.Logic;
  const { esc, ngay, ngayDu, gio, ngayGio, so, tyLe, nhan, xacNhan, moHop, thongBao, avatar } = window.UI;
  const homNay = () => L.ngayKey(new Date(Store.now()));
  const tenTroLy = (mssv) => Store.troLy(mssv)?.hoTen || mssv;
  const luotCuaCa = (id) => Store.state.luotTruc.find((l) => l.caTrucId === id) || null;

  /* ---------- Bảng ca hôm nay ---------- */
  function duyetLuot(luot, ca, raSomCoPhep) {
    const st = Store.state;
    const danhGia = L.danhGiaLuot(ca, luot, st.caiDat, { daXongChecklist: L.checklistXong(st, luot, ca), raSomCoPhep });
    Object.assign(luot, { daDuyet: true, nguoiDuyet: Store.nguoiDung().id, gioDuyet: Store.now(), dungGio: danhGia.dungGio, trucDu: danhGia.trucDu, raSomCoPhep });
    ca.trangThai = 'da_truc';
    Store.ghiNhatKy('Duyệt ca', ca.mssv, `${ca.ngay} ${ca.tu}–${ca.den}: ${gio(luot.batDau)}–${gio(luot.ketThuc)}, ${danhGia.trucDu ? 'trực đủ' : 'trực thiếu'}`);
  }

  function dongCaHomNay(c) {
    const l = luotCuaCa(c.id);
    const tt = c.trangThai !== 'da_dang_ky' ? nhan(UI.TRANG_THAI_CA, c.trangThai)
      : !l ? (Store.now() > L.mocGio(c.ngay, c.tu) ? '<span class="nhan nhan-do">Chưa đến</span>' : '<span class="nhan nhan-xam">Sắp tới</span>')
      : !l.ketThuc ? `<span class="nhan nhan-luc">Đang trực từ ${gio(l.batDau)}</span>`
      : '<span class="nhan nhan-vang">Chờ duyệt</span>';
    return `<tr><td><span class="dong-nguoi">${avatar(tenTroLy(c.mssv))}${esc(tenTroLy(c.mssv))}</span></td><td>${c.tu}–${c.den}</td><td>${tt}</td></tr>`;
  }

  function dongChoDuyet(l) {
    const ca = Store.state.caTruc.find((c) => c.id === l.caTrucId);
    const dg = l.ketThuc ? L.danhGiaLuot(ca, l, Store.state.caiDat, { daXongChecklist: L.checklistXong(Store.state, l, ca), raSomCoPhep: false }) : null;
    const ghiChu = [];
    if (!l.ketThuc) ghiChu.push('Quên Kết thúc trực');
    if (dg?.phutTre) ghiChu.push(`Trễ ${dg.phutTre} phút`);
    if (dg?.phutSom) ghiChu.push(`Ra sớm ${dg.phutSom} phút`);
    if (!L.checklistXong(Store.state, l, ca)) ghiChu.push('Checklist chưa xong');
    return `
      <tr>
        <td>${l.ketThuc ? `<input type="checkbox" data-chon-duyet="${esc(l.id)}" aria-label="Chọn ca của ${esc(tenTroLy(l.mssv))}" />` : ''}</td>
        <td><span class="dong-nguoi">${avatar(tenTroLy(l.mssv))}<strong>${esc(tenTroLy(l.mssv))}</strong></span></td>
        <td data-nhan="Ca">${ngay(ca.ngay)}, ${ca.tu}–${ca.den}</td>
        <td data-nhan="Vào, ra">${l.ketThuc ? `${gio(l.batDau)}–${gio(l.ketThuc)}` : `${gio(l.batDau)}, chưa bấm ra`}</td>
        <td data-nhan="Ghi chú">${esc(ghiChu.join(', ')) || 'Đủ'}</td>
        <td class="hang-nut"><button type="button" class="nut nut-phu nut-nho" data-act="mo-duyet" data-id="${esc(l.id)}">Duyệt, chỉnh giờ</button></td>
      </tr>`;
  }

  function khungThieuNguoi() {
    const st = Store.state;
    const tuan = L.congNgay(L.dauTuan(homNay()), 7);
    const thieu = [];
    st.caiDat.thuLamViec.forEach((thu) => {
      const n = L.congNgay(tuan, thu - 1);
      st.caiDat.buoi.forEach((b) => {
        const coNguoi = st.caTruc.some((c) => c.ngay === n && L.CA_GIU_CHO.includes(c.trangThai) && L.phut(c.tu) < L.phut(b.den) && L.phut(c.den) > L.phut(b.tu));
        if (!coNguoi) thieu.push(`${ngay(n)} ${b.ten.toLowerCase()}`);
      });
    });
    return thieu;
  }

  App.trang['bang-ca'] = {
    ten: 'Bảng ca hôm nay',
    icon: 'ca',
    render() {
      const st = Store.state;
      const now = Store.now();
      const hn = homNay();
      const caHomNay = st.caTruc.filter((c) => c.ngay === hn).sort((a, b) => a.tu.localeCompare(b.tu));
      const choDuyet = st.luotTruc.filter((l) => !l.daDuyet && (l.ketThuc || now > L.mocGio(st.caTruc.find((c) => c.id === l.caTrucId).ngay, st.caTruc.find((c) => c.id === l.caTrucId).den)));
      const chuaXuLy = st.caTruc.filter((c) => c.trangThai === 'da_dang_ky' && now > L.mocGio(c.ngay, c.den) && !luotCuaCa(c.id));
      const thieu = khungThieuNguoi();
      return `
        <section class="the">
          <h2>${ngay(hn)}</h2>
          ${caHomNay.length ? `<div class="cuon-ngang"><table class="bang"><thead><tr><th>Trợ lý</th><th>Ca</th><th>Trạng thái</th></tr></thead><tbody>${caHomNay.map(dongCaHomNay).join('')}</tbody></table></div>` : '<p class="phu">Hôm nay chưa có ai đăng ký ca.</p>'}
        </section>
        <section class="the">
          <div class="hang-dau"><h2>Chờ duyệt (${choDuyet.length})</h2>
            ${choDuyet.length ? '<button type="button" class="nut nut-nho" data-act="duyet-da-chon">Duyệt các ca đã chọn</button>' : ''}</div>
          ${choDuyet.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr><th></th><th>Trợ lý</th><th>Ca</th><th>Vào, ra</th><th>Ghi chú</th><th></th></tr></thead><tbody>${choDuyet.map(dongChoDuyet).join('')}</tbody></table></div>` : '<p class="phu">Không có ca nào chờ duyệt.</p>'}
        </section>
        ${chuaXuLy.length ? `<section class="the">
          <h2>Ca đã qua, không có người trực (${chuaXuLy.length})</h2>
          <ul class="ds-gon">${chuaXuLy.map((c) => `
            <li><span><strong>${esc(tenTroLy(c.mssv))}</strong> · ${ngay(c.ngay)}, ${c.tu}–${c.den}</span>
              <span class="hang-nut">
                <button type="button" class="nut nut-phu nut-nho" data-act="ghi-vang" data-id="${esc(c.id)}" data-loai="vang_phep">Vắng có phép</button>
                <button type="button" class="nut nut-phu nut-nho" data-act="ghi-vang" data-id="${esc(c.id)}" data-loai="vang_khong_bao">Vắng không báo</button>
              </span></li>`).join('')}</ul>
        </section>` : ''}
        <section class="the">
          <h2>Buổi chưa có người trực tuần tới</h2>
          <p class="phu">${thieu.length ? esc(thieu.join(', ')) : 'Tất cả các buổi đã có người đăng ký.'}</p>
        </section>`;
    }
  };

  App.act['mo-duyet'] = (el) => {
    const st = Store.state;
    const l = st.luotTruc.find((x) => x.id === el.dataset.id);
    const ca = st.caTruc.find((c) => c.id === l.caTrucId);
    const bg = st.banGiao.find((b) => b.luotTrucId === l.id);
    const muc = L.mucChecklist(st, ca).filter((m) => !m.banGiao);
    moHop(`Duyệt ca của ${tenTroLy(l.mssv)}`, `
      <p class="phu">${ngay(ca.ngay)}, ca ${ca.tu}–${ca.den}</p>
      <form data-form="duyet-ca" data-id="${esc(l.id)}">
        <div class="luoi-form">
          <label>Giờ vào <input type="time" name="vao" value="${gio(l.batDau)}" required /></label>
          <label>Giờ ra <input type="time" name="ra" value="${l.ketThuc ? gio(l.ketThuc) : ''}" required /></label>
        </div>
        <label>Lý do chỉnh giờ <input name="lyDo" placeholder="Bắt buộc khi đổi giờ" /></label>
        <label class="o-chon"><input type="checkbox" name="raSomCoPhep" /><span>Ra sớm có phép</span></label>
        ${bg?.noiDung ? `<p class="phu">Bàn giao: ${esc(bg.noiDung)}</p>` : ''}
        <h3>Checklist (đánh dấu mục chưa đạt)</h3>
        <ul class="ds-checklist">${muc.map((m) => {
          const dong = st.checklistCa.find((c) => c.luotTrucId === l.id && c.mucId === m.id);
          return `<li><label class="o-chon"><input type="checkbox" name="chuaDat_${esc(m.id)}"${dong?.chuaDat ? ' checked' : ''} /><span>${dong?.daLam ? '✓' : '○'} ${esc(m.noiDung)}</span></label></li>`;
        }).join('')}</ul>
        <label>Ghi chú mục chưa đạt <input name="ghiChu" /></label>
        <p id="loi-duyet" class="loi" role="alert" hidden></p>
        <div class="hang-nut canh-phai"><button class="nut nut-xanh">Duyệt ca</button></div>
      </form>`);
  };

  App.form['duyet-ca'] = (f, el) => {
    const st = Store.state;
    const l = st.luotTruc.find((x) => x.id === el.dataset.id);
    const ca = st.caTruc.find((c) => c.id === l.caTrucId);
    const baoLoi = (noiDung) => {
      const p = document.getElementById('loi-duyet');
      p.hidden = false;
      p.textContent = noiDung;
    };
    const quenRa = !l.ketThuc;
    const doiVao = f.vao !== gio(l.batDau);
    const doiRa = !quenRa && f.ra !== gio(l.ketThuc);
    const vao = doiVao ? L.mocGio(ca.ngay, f.vao) : l.batDau;
    const ra = quenRa || doiRa ? L.mocGio(ca.ngay, f.ra) : l.ketThuc;
    if (ra <= vao) return baoLoi('Giờ ra phải sau giờ vào.');
    if ((doiVao || doiRa) && !f.lyDo.trim()) return baoLoi('Đổi giờ thì phải ghi lý do.');

    if (doiVao || doiRa) l.chinhGio = { cu: [l.batDau, l.ketThuc], moi: [vao, ra], lyDo: f.lyDo.trim() };
    if (quenRa) l.ketThucBoi = 'quan_ly';
    l.batDau = vao;
    l.ketThuc = ra;

    L.mucChecklist(st, ca).filter((m) => !m.banGiao).forEach((m) => {
      const chuaDat = `chuaDat_${m.id}` in f;
      let dong = st.checklistCa.find((c) => c.luotTrucId === l.id && c.mucId === m.id);
      if (!dong && chuaDat) st.checklistCa.push((dong = { luotTrucId: l.id, mucId: m.id, daLam: false }));
      if (dong) Object.assign(dong, { chuaDat, ghiChu: chuaDat ? f.ghiChu.trim() : '' });
    });

    duyetLuot(l, ca, 'raSomCoPhep' in f);
    if (doiVao || doiRa) Store.ghiNhatKy('Chỉnh giờ', ca.mssv, `${gio(vao)}–${gio(ra)}: ${f.lyDo.trim()}`);
    App.xong('Đã duyệt ca.');
  };

  App.act['duyet-da-chon'] = () => {
    const st = Store.state;
    const ids = [...document.querySelectorAll('[data-chon-duyet]:checked')].map((x) => x.dataset.chonDuyet);
    if (!ids.length) return thongBao('Chưa chọn ca nào.', 'loi');
    ids.forEach((id) => {
      const l = st.luotTruc.find((x) => x.id === id);
      duyetLuot(l, st.caTruc.find((c) => c.id === l.caTrucId), false);
    });
    App.xong(`Đã duyệt ${ids.length} ca.`);
  };

  App.act['ghi-vang'] = (el) => {
    const ca = Store.state.caTruc.find((c) => c.id === el.dataset.id);
    const loai = el.dataset.loai;
    const coPhep = loai === 'vang_phep';
    App.hoiLyDo(coPhep ? 'Ghi vắng có phép' : 'Ghi vắng không báo', coPhep ? 'Ca này không vào mẫu số.' : 'Ca này tính là bỏ ca.', (lyDo) => {
      ca.trangThai = loai;
      Store.ghiNhatKy(coPhep ? 'Ghi vắng có phép' : 'Ghi vắng không báo', ca.mssv, `${ca.ngay} ${ca.tu}–${ca.den}: ${lyDo}`);
      App.xong('Đã ghi nhận.');
    }, { batBuoc: coPhep });
  };

  /* ---------- Danh sách trợ lý ---------- */
  const COT_XUAT = [
    { id: 'mssv', ten: 'MSSV', lay: (t) => t.mssv, mo: true },
    { id: 'hoTen', ten: 'Họ tên', lay: (t) => t.hoTen, mo: true },
    { id: 'ngaySinh', ten: 'Ngày sinh', lay: (t) => ngayDu(t.ngaySinh), mo: true },
    { id: 'lop', ten: 'Lớp', lay: (t) => t.lop, mo: true },
    { id: 'nganh', ten: 'Ngành', lay: (t) => t.nganh, mo: true },
    { id: 'namRaTruong', ten: 'Năm ra trường', lay: (t) => t.namRaTruong, mo: true },
    { id: 'sdt', ten: 'Điện thoại', lay: (t) => t.sdt },
    { id: 'email', ten: 'Email', lay: (t) => t.email },
    { id: 'trangThai', ten: 'Trạng thái', lay: (t) => UI.TRANG_THAI_TRO_LY[t.trangThai][0], mo: true },
    { id: 'tongGio', ten: 'Tổng giờ', lay: (t, cs) => Math.round(cs.tongGio * 10) / 10, mo: true },
    { id: 'thamGia', ten: 'Tham gia (%)', lay: (t, cs) => (cs.tyLeThamGia === null ? '' : Math.round(cs.tyLeThamGia)), mo: true },
    { id: 'dungGio', ten: 'Đúng giờ (%)', lay: (t, cs) => (cs.tyLeDungGio === null ? '' : Math.round(cs.tyLeDungGio)) },
    { id: 'caBo', ten: 'Ca bỏ', lay: (t, cs) => cs.soCaBo },
    { id: 'loiNhe', ten: 'Lỗi nhẹ', lay: (t, cs) => cs.loiNheConLai },
    { id: 'loiNang', ten: 'Lỗi nặng', lay: (t, cs) => cs.loiNang }
  ];

  const locUi = () => (App.ui.loc ||= { hocKy: L.hocKyHienTai(Store.state, Store.now()).id, trangThai: '', nganh: '', nam: '', thang: '', tim: '', cot: COT_XUAT.filter((c) => c.mo).map((c) => c.id) });

  function dsDaLoc() {
    const loc = locUi();
    const tim = loc.tim.trim().toLowerCase();
    return Store.state.troLy.filter((t) =>
      (!loc.trangThai || t.trangThai === loc.trangThai) &&
      (!loc.nganh || t.nganh === loc.nganh) &&
      (!loc.nam || String(t.namRaTruong) === loc.nam) &&
      (!loc.thang || Number(String(t.ngaySinh).split('-')[1]) === Number(loc.thang)) &&
      (!tim || t.hoTen.toLowerCase().includes(tim) || t.mssv.includes(tim)));
  }

  App.trang['danh-sach'] = {
    ten: 'Danh sách trợ lý',
    icon: 'nhom',
    render() {
      const st = Store.state;
      const loc = locUi();
      const hk = st.hocKy.find((k) => k.id === loc.hocKy) || st.hocKy[0];
      const ds = dsDaLoc();
      const duyNhat = (k) => [...new Set(st.troLy.map((t) => t[k]))].sort();
      const chon = (ten, tatCa, muc) => `<select data-doi="doi-loc" data-loc="${ten}" aria-label="${tatCa}">
        <option value="">${tatCa}</option>${muc.map(([v, n]) => `<option value="${esc(v)}"${String(loc[ten]) === String(v) ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
      const choDuyet = st.troLy.filter((t) => t.trangThai === 'cho_duyet').length;
      return `
        ${choDuyet ? `<section class="the the-nhat"><p><strong>${choDuyet} đơn đăng ký mới</strong> đang chờ xét. Bấm vào tên để xem kết quả khảo sát và duyệt.</p></section>` : ''}
        ${st.dangKyNhanTin.length ? `<section class="the"><h2>Chờ tin đợt tuyển (${st.dangKyNhanTin.length})</h2><p class="phu">${esc(st.dangKyNhanTin.map((d) => `${d.hoTen} (${d.sdt})`).join(', '))}</p></section>` : ''}
        <section class="the">
          <div class="hang-dau"><h2>Trợ lý (${ds.length})</h2>${Store.coQuyen('them_tro_ly') ? '<button type="button" class="nut nut-nho" data-act="them-tro-ly">Thêm trợ lý</button>' : ''}</div>
          <div class="bo-loc">
            <input type="search" placeholder="Tìm tên hoặc MSSV" aria-label="Tìm tên hoặc MSSV" value="${esc(loc.tim)}" data-doi="doi-loc" data-loc="tim" />
            <select data-doi="doi-loc" data-loc="hocKy" aria-label="Học kỳ">${st.hocKy.map((k) => `<option value="${esc(k.id)}"${k.id === loc.hocKy ? ' selected' : ''}>${esc(k.ten)}</option>`).join('')}</select>
            ${chon('trangThai', 'Mọi trạng thái', Object.entries(UI.TRANG_THAI_TRO_LY).map(([k, v]) => [k, v[0]]))}
            ${chon('nganh', 'Mọi ngành', duyNhat('nganh').map((x) => [x, x]))}
            ${chon('nam', 'Mọi năm ra trường', duyNhat('namRaTruong').map((x) => [x, x]))}
            ${chon('thang', 'Mọi tháng sinh', Array.from({ length: 12 }, (_, i) => [i + 1, `Tháng ${i + 1}`]))}
          </div>
          <div class="cuon-ngang"><table class="bang">
            <thead><tr><th>Họ tên</th><th>MSSV</th><th>Ngành</th><th>Trạng thái</th><th class="so">Giờ</th><th class="so">Tham gia</th></tr></thead>
            <tbody>${ds.map((t) => {
              const cs = L.tinhChiSo(st, t.mssv, hk);
              return `<tr>
                <td><span class="dong-nguoi">${avatar(t.hoTen)}<button type="button" class="nut-chu" data-act="chi-tiet-tro-ly" data-mssv="${esc(t.mssv)}">${esc(t.hoTen)}</button></span></td>
                <td>${esc(t.mssv)}</td><td>${esc(t.nganh)}</td><td>${nhan(UI.TRANG_THAI_TRO_LY, t.trangThai)}</td>
                <td class="so">${so(cs.tongGio)}</td><td class="so">${tyLe(cs.tyLeThamGia)}</td></tr>`;
            }).join('') || '<tr><td colspan="6" class="phu">Không có trợ lý phù hợp bộ lọc.</td></tr>'}</tbody>
          </table></div>
        </section>
        <section class="the">
          <h2>Xuất Excel (${ds.length} trợ lý)</h2>
          <fieldset class="chon-cot"><legend>Chọn cột</legend>
            ${COT_XUAT.map((c) => `<label class="o-chon"><input type="checkbox" data-doi="doi-cot" value="${c.id}"${loc.cot.includes(c.id) ? ' checked' : ''} /><span>${esc(c.ten)}</span></label>`).join('')}
          </fieldset>
          <button type="button" class="nut" data-act="xuat-excel">Xuất file Excel</button>
        </section>`;
    }
  };

  App.doi['doi-loc'] = (el) => {
    locUi()[el.dataset.loc] = el.value;
    App.render();
  };
  App.doi['doi-cot'] = (el) => {
    const loc = locUi();
    loc.cot = el.checked ? [...loc.cot, el.value] : loc.cot.filter((c) => c !== el.value);
  };

  App.act['xuat-excel'] = () => {
    const st = Store.state;
    const loc = locUi();
    const hk = st.hocKy.find((k) => k.id === loc.hocKy) || st.hocKy[0];
    const cot = COT_XUAT.filter((c) => loc.cot.includes(c.id));
    if (!cot.length) return thongBao('Chọn ít nhất một cột.', 'loi');
    const dong = dsDaLoc().map((t) => {
      const cs = L.tinhChiSo(st, t.mssv, hk);
      return Object.fromEntries(cot.map((c) => [c.ten, c.lay(t, cs)]));
    });
    const sheet = XLSX.utils.json_to_sheet(dong, { header: cot.map((c) => c.ten) });
    const sach = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(sach, sheet, 'Trợ lý');
    XLSX.writeFile(sach, `danh-sach-tro-ly-${homNay()}.xlsx`);
    Store.ghiNhatKy('Xuất Excel danh sách trợ lý', `${dong.length} dòng`);
    Store.luu();
  };

  App.act['them-tro-ly'] = () => moHop('Thêm trợ lý', `
    <p class="phu">Thêm xong, hệ thống trả về một mã. Trợ lý mở web, nhập mã là vào được.</p>
    <form data-form="them-tro-ly" class="luoi-form">
      <label>Họ tên <input name="hoTen" required /></label>
      <label>MSSV <input name="mssv" required pattern="[0-9A-Za-z]{6,15}" title="6 đến 15 ký tự chữ hoặc số" /></label>
      <label>Trạng thái <select name="trangThai"><option value="dang_hoat_dong">Đang hoạt động</option><option value="thu_viec">Thử việc</option></select></label>
      <label>Ngành <input name="nganh" /></label>
      <label>Lớp <input name="lop" /></label>
      <label>Ngày sinh <input type="date" name="ngaySinh" /></label>
      <label>Năm ra trường <input type="number" name="namRaTruong" min="2020" max="2040" /></label>
      <label>Số điện thoại <input type="tel" name="sdt" pattern="[0-9]{9,11}" title="9 đến 11 chữ số" /></label>
      <p id="loi-them-tro-ly" class="loi rong-het" role="alert" hidden></p>
      <div class="hang-nut rong-het canh-phai"><button class="nut">Thêm và tạo mã</button></div>
    </form>`);

  const hienMa = (t) => moHop('Mã của trợ lý', `<p>${esc(t.hoTen)}, MSSV ${esc(t.mssv)}.</p><p class="ma-vao">Mã: <b>${esc(t.maKichHoat)}</b></p>
    <p class="phu">Trợ lý mở web, nhập mã này là vào được. Mã chỉ dùng một lần.</p>`);

  App.form['them-tro-ly'] = (f) => {
    const mssv = f.mssv.trim();
    if (Store.troLy(mssv)) {
      const p = document.getElementById('loi-them-tro-ly');
      p.hidden = false;
      p.textContent = 'MSSV này đã có trong danh sách.';
      return;
    }
    const hn = homNay();
    const t = {
      mssv, hoTen: f.hoTen.trim(), ngaySinh: f.ngaySinh, lop: f.lop.trim(), nganh: f.nganh.trim(), namRaTruong: Number(f.namRaTruong) || '', sdt: f.sdt.trim(), email: '',
      maMay: '', maKichHoat: L.taoMaKichHoat(Store.state.troLy), trangThai: f.trangThai, ngayDangKy: hn, ngayDuyet: hn, nguoiDuyet: Store.nguoiDung().id, ngayChinhThuc: f.trangThai === 'dang_hoat_dong' ? hn : null
    };
    Store.state.troLy.push(t);
    Store.ghiNhatKy('Thêm trợ lý', mssv);
    App.xong();
    hienMa(t);
  };

  App.act['cap-ma-moi'] = async (el) => {
    const t = Store.troLy(el.dataset.mssv);
    if (!(await xacNhan(`Cấp mã mới cho ${t.hoTen}? Máy đang dùng sẽ hết hiệu lực.`, 'Cấp mã mới'))) return;
    Object.assign(t, { maMay: '', maKichHoat: L.taoMaKichHoat(Store.state.troLy) });
    Store.ghiNhatKy('Cấp mã trợ lý mới', t.mssv);
    App.xong();
    hienMa(t);
  };

  function nutTrangThai(t) {
    const nut = (ten, moi, kieu = 'nut-phu') => `<button type="button" class="nut ${kieu} nut-nho" data-act="doi-trang-thai" data-mssv="${esc(t.mssv)}" data-moi="${moi}">${ten}</button>`;
    const theo = {
      cho_duyet: nut('Duyệt vào thử việc', 'thu_viec', 'nut-xanh') + nut('Từ chối', 'tu_choi'),
      thu_viec: nut('Đạt thử việc', 'dang_hoat_dong', 'nut-xanh') + nut('Không đạt, cho nghỉ', 'da_nghi'),
      dang_hoat_dong: nut('Tạm nghỉ', 'tam_nghi') + nut('Đã nghỉ', 'da_nghi') + nut('Đã ra trường', 'da_ra_truong'),
      tam_nghi: nut('Hoạt động lại', 'dang_hoat_dong', 'nut-xanh') + nut('Đã nghỉ', 'da_nghi')
    };
    return theo[t.trangThai] || '';
  }

  App.act['chi-tiet-tro-ly'] = (el) => {
    const st = Store.state;
    const t = Store.troLy(el.dataset.mssv);
    const hk = st.hocKy.find((k) => k.id === locUi().hocKy) || st.hocKy[0];
    const cs = L.tinhChiSo(st, t.mssv, hk);
    const bai = st.baiLam.filter((b) => b.mssv === t.mssv);
    const dong = (k, v) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`;
    moHop(t.hoTen, `
      <div class="hang-dau">${nhan(UI.TRANG_THAI_TRO_LY, t.trangThai)}<span class="phu">Đăng ký ${ngayDu(t.ngayDangKy)}</span></div>
      <dl class="luoi-thong-tin">
        ${dong('MSSV', t.mssv)}${dong('Ngày sinh', ngayDu(t.ngaySinh))}${dong('Lớp', t.lop)}${dong('Ngành', t.nganh)}
        ${dong('Năm ra trường', t.namRaTruong)}${dong('Điện thoại', t.sdt)}${dong('Email', t.email)}${dong('Mã máy', t.maMay || 'Chưa kích hoạt')}
        ${t.maKichHoat ? dong('Mã trợ lý', t.maKichHoat) : ''}
        ${dong('Tổng giờ', so(cs.tongGio))}${dong('Tham gia', tyLe(cs.tyLeThamGia))}${dong('Đúng giờ', tyLe(cs.tyLeDungGio))}${dong('Ca bỏ', cs.soCaBo)}
      </dl>
      ${t.trangThai === 'cho_duyet' ? `<p class="phu">Lộ trình: ${esc(App.moTaLoTrinh(t))}.</p>` : ''}
      <h3>Bài kiểm tra</h3>
      ${bai.length ? `<ul class="ds-gon">${bai.map((b) => `<li><span>${esc(st.dotKiemTra.find((d) => d.id === b.dotId).ten)}: ${b.diemTN ?? '–'}/${b.de.tracNghiem.length} câu</span>${nhan(UI.KET_QUA_BAI, b.ketQua)}</li>`).join('')}</ul>` : '<p class="phu">Chưa làm bài nào.</p>'}
      <div class="hang-nut">${nutTrangThai(t)}${Store.coQuyen('them_tro_ly') ? `<button type="button" class="nut nut-phu nut-nho" data-act="cap-ma-moi" data-mssv="${esc(t.mssv)}">Cấp mã mới</button>` : ''}</div>`);
  };

  App.act['doi-trang-thai'] = async (el) => {
    const t = Store.troLy(el.dataset.mssv);
    const moi = el.dataset.moi;
    const ten = UI.TRANG_THAI_TRO_LY[moi][0];
    if (t.trangThai === 'thu_viec' && moi === 'dang_hoat_dong') {
      const bai = L.baiHieuLuc(Store.state, t.mssv, 'cuoi_thu_viec');
      if (bai?.ketQua !== 'dat' && !(await xacNhan('Trợ lý chưa đạt bài kiểm tra cuối thử việc. Vẫn chuyển chính thức?', 'Vẫn chuyển'))) return;
    }
    App.hoiLyDo(`Chuyển sang "${ten}"`, t.hoTen, (lyDo) => {
      const cu = t.trangThai;
      t.trangThai = moi;
      if (cu === 'cho_duyet') Object.assign(t, { ngayDuyet: homNay(), nguoiDuyet: Store.nguoiDung().id });
      if (moi === 'dang_hoat_dong' && !t.ngayChinhThuc) t.ngayChinhThuc = homNay();
      Store.ghiNhatKy('Đổi trạng thái trợ lý', t.mssv, `${UI.TRANG_THAI_TRO_LY[cu][0]} → ${ten}${lyDo ? `: ${lyDo}` : ''}`);
      Store.guiThongBao({ tieuDe: `Trạng thái của bạn: ${ten}`, noiDung: lyDo, nguoiNhan: [t.mssv] });
      App.xong(`${t.hoTen}: ${ten}.`);
    }, { batBuoc: moi !== 'thu_viec' && moi !== 'dang_hoat_dong' });
  };

  /* ---------- Sổ nề nếp ---------- */
  App.trang['so-ne-nep'] = {
    ten: 'Sổ nề nếp',
    icon: 'so',
    render() {
      const st = Store.state;
      const loai = App.ui.loaiNeNep || 'loi_nhe';
      const dangTruc = st.troLy.filter((t) => ['thu_viec', 'dang_hoat_dong', 'tam_nghi'].includes(t.trangThai));
      const ds = st.soNeNep.slice().sort((a, b) => b.ngay.localeCompare(a.ngay));
      const admin = Store.coQuyen('quyet_mat');
      return `
        <section class="the">
          <h2>Ghi nhanh</h2>
          <form data-form="ghi-ne-nep" class="luoi-form">
            <label>Trợ lý <select name="mssv" required>${dangTruc.map((t) => `<option value="${esc(t.mssv)}">${esc(t.hoTen)}</option>`).join('')}</select></label>
            <label>Loại <select name="loai" data-doi="doi-loai-ne-nep">${Object.entries(UI.LOAI_NE_NEP).map(([k, v]) => `<option value="${k}"${k === loai ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
            <label>Danh mục <select name="danhMuc">${st.danhMucLoi[loai].map((d) => `<option>${esc(d)}</option>`).join('')}</select></label>
            <label>Ghi chú <input name="ghiChu" /></label>
            <div class="hang-nut rong-het"><button class="nut">Ghi vào sổ</button></div>
          </form>
        </section>
        <section class="the">
          <h2>Lịch sử</h2>
          ${ds.length ? `<div class="cuon-ngang"><table class="bang bang-the">
            <thead><tr><th>Ngày</th><th>Trợ lý</th><th>Loại</th><th>Nội dung</th><th>Phản hồi</th>${admin ? '<th></th>' : ''}</tr></thead>
            <tbody>${ds.map((n) => `<tr>
              <td data-nhan="Ngày">${ngayDu(n.ngay)}</td><td><strong>${esc(tenTroLy(n.mssv))}</strong></td><td data-nhan="Loại">${UI.LOAI_NE_NEP[n.loai]}</td>
              <td data-nhan="Nội dung">${esc(n.danhMuc)}${n.ghiChu ? ` – ${esc(n.ghiChu)}` : ''}</td><td data-nhan="Phản hồi">${esc(n.phanHoi) || '–'}</td>
              ${admin ? `<td class="hang-nut"><button type="button" class="nut-chu" data-act="xoa-ne-nep" data-id="${esc(n.id)}">Xóa</button></td>` : ''}</tr>`).join('')}</tbody>
          </table></div>` : '<p class="phu">Chưa có ghi nhận.</p>'}
        </section>`;
    }
  };

  App.doi['doi-loai-ne-nep'] = (el) => {
    App.ui.loaiNeNep = el.value;
    App.render();
  };

  App.form['ghi-ne-nep'] = (f) => {
    Store.state.soNeNep.push({ id: Store.id('nn'), mssv: f.mssv, ngay: homNay(), loai: f.loai, danhMuc: f.danhMuc, ghiChu: f.ghiChu.trim(), nguoiGhi: Store.nguoiDung().id, phanHoi: '' });
    Store.ghiNhatKy('Ghi sổ nề nếp', f.mssv, `${UI.LOAI_NE_NEP[f.loai]}: ${f.danhMuc}`);
    App.xong('Đã ghi vào sổ nề nếp.');
  };

  App.act['xoa-ne-nep'] = async (el) => {
    if (!(await xacNhan('Xóa ghi nhận này khỏi sổ nề nếp?', 'Xóa'))) return;
    const n = Store.state.soNeNep.find((x) => x.id === el.dataset.id);
    Store.state.soNeNep = Store.state.soNeNep.filter((x) => x !== n);
    Store.ghiNhatKy('Xóa ghi nhận sổ nề nếp', n.mssv, `${UI.LOAI_NE_NEP[n.loai]}: ${n.danhMuc}`);
    App.xong('Đã xóa.');
  };

  /* ---------- Danh sách cảnh báo ---------- */
  const THU_TU_MUC = { mat_tu_cach: 0, canh_bao: 1, nhac_nho: 2 };

  function hanhDongMatTuCach(t) {
    const dx = Store.state.deXuatMat.find((d) => d.mssv === t.mssv && d.trangThai === 'cho_phan_hoi');
    if (!dx) return `<button type="button" class="nut nut-phu nut-nho" data-act="mo-phan-hoi" data-mssv="${esc(t.mssv)}">Mở phản hồi ${Store.state.caiDat.ngayPhanHoi} ngày</button>`;
    const duocQuyet = dx.phanHoi || Store.now() > dx.hanPhanHoi;
    const trangThai = dx.phanHoi ? `Phản hồi: ${esc(dx.phanHoi)}` : `Chờ phản hồi đến ${ngayGio(dx.hanPhanHoi)}`;
    if (!Store.coQuyen('quyet_mat')) return `<span class="phu">${trangThai}. Người có quyền quyết định sẽ chốt.</span>`;
    return `<span class="phu">${trangThai}</span>
      ${duocQuyet ? `<span class="hang-nut">
        <button type="button" class="nut nut-nho" data-act="quyet-mat" data-id="${esc(dx.id)}" data-kq="mat">Mất tư cách</button>
        <button type="button" class="nut nut-phu nut-nho" data-act="quyet-mat" data-id="${esc(dx.id)}" data-kq="giu">Giữ lại</button></span>` : ''}`;
  }

  App.trang['canh-bao'] = {
    ten: 'Danh sách cảnh báo',
    icon: 'canhBao',
    render() {
      const st = Store.state;
      const now = Store.now();
      const hk = L.hocKyHienTai(st, now);
      const tuan = L.tuanThu(hk, now);
      const ds = st.troLy
        .filter((t) => ['thu_viec', 'dang_hoat_dong'].includes(t.trangThai))
        .map((t) => ({ t, cs: L.tinhChiSo(st, t.mssv, hk) }))
        .map((x) => ({ ...x, tt: L.trangThaiNeNep(x.cs, st.caiDat, tuan) }))
        .filter((x) => x.tt.muc !== 'binh_thuong')
        .sort((a, b) => THU_TU_MUC[a.tt.muc] - THU_TU_MUC[b.tt.muc]);
      const chamGio = st.troLy
        .filter((t) => t.trangThai === 'dang_hoat_dong' && tuan >= 8 && L.tinhChiSo(st, t.mssv, hk).tongGio < st.caiDat.gioToiThieu / 2);
      return `
        <section class="the">
          <p class="phu">${esc(hk.ten)}, tuần ${tuan}. Web chỉ đề xuất, quản lý chốt.</p>
          ${ds.length ? `<ul class="ds-canh-bao">${ds.map(({ t, tt, cs }) => `
            <li>
              <div class="hang-dau"><span class="dong-nguoi">${avatar(t.hoTen)}<strong>${esc(t.hoTen)}</strong></span>${nhan(UI.MUC_NE_NEP, tt.muc)}</div>
              <p class="phu">${esc(tt.lyDo.join('; '))} · ${so(cs.tongGio)} giờ</p>
              ${tt.muc === 'mat_tu_cach' ? `<div class="hang-hanh-dong">${hanhDongMatTuCach(t)}</div>` : ''}
            </li>`).join('')}</ul>` : '<p class="phu">Không có trợ lý nào cần lưu ý.</p>'}
        </section>
        ${chamGio.length ? `<section class="the"><h2>Chậm tiến độ giờ</h2><p class="phu">Đã qua tuần 8 mà chưa đủ ${st.caiDat.gioToiThieu / 2} giờ: ${esc(chamGio.map((t) => t.hoTen).join(', '))}.</p></section>` : ''}`;
    }
  };

  App.act['mo-phan-hoi'] = (el) => {
    const mssv = el.dataset.mssv;
    Store.state.deXuatMat.push({ id: Store.id('dx'), mssv, luc: Store.now(), hanPhanHoi: Store.now() + Store.state.caiDat.ngayPhanHoi * L.NGAY, phanHoi: '', trangThai: 'cho_phan_hoi' });
    Store.ghiNhatKy('Mở phản hồi đề xuất mất tư cách', mssv);
    App.xong('Đã mở phản hồi cho trợ lý.');
  };

  App.act['quyet-mat'] = (el) => {
    const dx = Store.state.deXuatMat.find((d) => d.id === el.dataset.id);
    const t = Store.troLy(dx.mssv);
    const mat = el.dataset.kq === 'mat';
    App.hoiLyDo(mat ? 'Quyết định mất tư cách' : 'Giữ lại trợ lý', t.hoTen, (lyDo) => {
      dx.trangThai = mat ? 'mat_tu_cach' : 'giu_lai';
      if (mat) t.trangThai = 'mat_tu_cach';
      Store.guiThongBao({ tieuDe: mat ? 'Quyết định mất tư cách' : 'Bạn được giữ lại', noiDung: lyDo, nguoiNhan: [t.mssv] });
      Store.ghiNhatKy(mat ? 'Quyết định mất tư cách' : 'Giữ lại sau đề xuất', t.mssv, lyDo);
      App.xong('Đã ghi quyết định.');
    });
  };
})();
