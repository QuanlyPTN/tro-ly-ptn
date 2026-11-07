/* Tài liệu tập huấn, Nội quy, Lộ trình của ứng viên và trang Admin chỉnh nội dung. */
(function () {
  const L = window.Logic;
  const { esc, ngay, ngayDu, moHop, xacNhan, thongBao, vanBan } = window.UI;
  const toi = () => Store.troLy(Store.phien.mssv);
  const laAdmin = () => Store.phien.vaiTro === 'admin';
  const PHAN = [
    ['tuyen', 'Phần 1. Kiến thức nền', 'Bắt buộc đọc trước khi làm khảo sát tuyển.'],
    ['thu_viec', 'Phần 2. Nghiệp vụ trợ lý', 'Dùng trong 2 tuần thử việc và các bài kiểm tra thử việc.']
  ];
  const dsTaiLieu = (phan) => Store.state.taiLieu.filter((t) => t.phan === phan && t.hoatDong).sort((a, b) => a.thuTu - b.thuTu);
  const daDoc = (mssv, id) => Store.state.daDocTaiLieu.some((d) => d.mssv === mssv && d.taiLieuId === id);

  /* ---------- Trang đọc của trợ lý ---------- */
  function trangDoc(t, b) {
    const ds = dsTaiLieu(b.phan);
    const i = ds.findIndex((x) => x.id === b.id);
    const keTiep = ds[i + 1];
    const duocOn = L.duocOnLuyen(Store.state, t) && b.chuDe && (t.trangThai !== 'cho_duyet' || b.phan === 'tuyen');
    const xong = daDoc(t.mssv, b.id);
    return `
      <button type="button" class="nut-chu" data-act="dong-bai-doc">‹ Danh sách tài liệu</button>
      <article class="the bai-doc">
        <p class="phu">Bài ${i + 1}/${ds.length} · khoảng ${b.phut} phút đọc</p>
        <h2>${esc(b.tieuDe)}</h2>
        ${vanBan(b.noiDung)}
        ${b.duongDan ? `<p><a href="${esc(b.duongDan)}" target="_blank" rel="noopener">Mở tài liệu đính kèm</a></p>` : ''}
        <p class="phu">Nguồn: ${esc(b.nguon)}</p>
      </article>
      <div class="hang-nut">
        ${xong ? '<span class="nhan nhan-luc">Đã đọc</span>' : `<button type="button" class="nut nut-xanh" data-act="danh-dau-doc" data-id="${esc(b.id)}">Tôi đã đọc và hiểu</button>`}
        ${keTiep ? `<button type="button" class="nut nut-phu" data-act="mo-bai-doc" data-id="${esc(keTiep.id)}">Bài tiếp theo</button>` : ''}
        ${duocOn ? `<button type="button" class="nut nut-phu" data-act="on-chu-de" data-chu-de="${esc(b.chuDe)}">Ôn câu hỏi của bài này</button>` : ''}
      </div>`;
  }

  App.trang['tai-lieu'] = {
    ten: 'Tài liệu tập huấn',
    icon: 'sach',
    render() {
      const t = toi();
      const moi = Store.state.taiLieu.find((x) => x.id === App.ui.baiDoc);
      if (moi) return trangDoc(t, moi);
      return PHAN.map(([phan, ten, moTa]) => {
        const ds = dsTaiLieu(phan);
        const soDoc = ds.filter((b) => daDoc(t.mssv, b.id)).length;
        return `
          <section class="the">
            <div class="hang-dau"><h2>${esc(ten)}</h2><span class="phu">Đã đọc ${soDoc}/${ds.length}</span></div>
            <p class="phu">${esc(moTa)}</p>
            <div class="tien-trinh" aria-hidden="true"><div style="width:${ds.length ? (soDoc / ds.length) * 100 : 0}%"></div></div>
            <ul class="ds-gon luoi-bai">${ds.map((b, i) => `
              <li>
                <button type="button" class="nut-chu" data-act="mo-bai-doc" data-id="${esc(b.id)}">${i + 1}. ${esc(b.tieuDe)}</button>
                <span class="hang-nut"><small>${b.phut} phút</small>${daDoc(t.mssv, b.id) ? '<span class="nhan nhan-luc">Đã đọc</span>' : ''}</span>
              </li>`).join('')}</ul>
          </section>`;
      }).join('');
    }
  };

  App.act['mo-bai-doc'] = (el) => {
    App.ui.baiDoc = el.dataset.id;
    App.ui.trang = 'tai-lieu';
    App.render();
    window.scrollTo(0, 0);
  };
  App.act['dong-bai-doc'] = () => {
    App.ui.baiDoc = null;
    App.render();
  };
  App.act['danh-dau-doc'] = (el) => {
    Store.state.daDocTaiLieu.push({ mssv: toi().mssv, taiLieuId: el.dataset.id, luc: Store.now() });
    App.xong('Đã ghi nhận.');
  };
  App.act['on-chu-de'] = (el) => {
    App.ui.baiDoc = null;
    App.ui.trang = 'tap-huan';
    App.form['bat-dau-on']({ bo: '', chuDe: el.dataset.chuDe, maQR: '', soCau: '10' });
  };

  /* ---------- Nội quy ---------- */
  function bangNoiQuy() {
    const ds = Store.state.noiQuy.filter((n) => n.hoatDong);
    const nhom = [...new Set(ds.map((n) => n.nhom))];
    return nhom.map((ten) => `
      <section class="the">
        <h2>${esc(ten)}</h2>
        <div class="cuon-ngang"><table class="bang bang-the bang-noi-quy">
          <thead><tr><th>Quy định</th><th>Xử lý khi vi phạm</th><th>Nguồn</th></tr></thead>
          <tbody>${ds.filter((n) => n.nhom === ten).sort((a, b) => a.thuTu - b.thuTu).map((n) => `
            <tr><td>${esc(n.noiDung)}</td><td data-nhan="Xử lý">${esc(n.xuLy)}</td><td data-nhan="Nguồn"><small>${esc(n.nguon)}</small></td></tr>`).join('')}</tbody>
        </table></div>
      </section>`).join('');
  }

  App.trang['noi-quy'] = {
    ten: 'Nội quy PTN',
    icon: 'khien',
    dem() {
      return L.daXacNhanNoiQuy(Store.state, Store.phien.mssv) ? 0 : 1;
    },
    render() {
      const t = toi();
      const xong = L.daXacNhanNoiQuy(Store.state, t.mssv);
      return `
        ${bangNoiQuy()}
        <section class="the ${xong ? '' : 'the-nhat'}">
          ${xong ? '<p><strong>Bạn đã cam kết thực hiện nội quy này.</strong></p>' : `
            <p>Tôi đã đọc, hiểu và cam kết thực hiện đúng nội quy, quy định của PTN.</p>
            <button type="button" class="nut nut-xanh" data-act="cam-ket-noi-quy">Tôi cam kết</button>`}
        </section>`;
    }
  };

  App.act['cam-ket-noi-quy'] = () => {
    Store.state.xacNhanNoiQuy.push({ mssv: toi().mssv, phienBan: Store.state.caiDat.phienBanNoiQuy || 1, luc: Store.now() });
    App.xong('Đã ghi nhận cam kết.');
  };

  /* ---------- Lộ trình ứng viên (đầu trang Tập huấn) ---------- */
  function buocBuoi(t, lt) {
    const st = Store.state;
    if (lt.buoi) {
      const b = lt.buoi;
      return `<p class="phu">${esc(b.ten)}: ${ngay(b.ngay)}, ${esc(b.tu)}–${esc(b.den)}, ${esc(b.diaDiem)}.</p>
        ${b.dangMo ? '' : `<button type="button" class="nut-chu" data-act="huy-buoi" data-id="${esc(b.id)}">Đổi buổi khác</button>`}`;
    }
    if (!lt.sanSang) return '<p class="phu">Mở sau khi xong hai bước trên.</p>';
    const ds = st.buoiKhaoSat.filter((b) => !L.kiemTraDangKyBuoi(st, b, t.mssv, Store.now()));
    if (!ds.length) return '<p class="phu">Chưa có buổi nào mở đăng ký. PTN sẽ thông báo khi có lịch.</p>';
    return `<ul class="ds-gon">${ds.map((b) => {
      const con = b.soCho - st.thamGiaBuoi.filter((x) => x.buoiId === b.id).length;
      return `<li><span><strong>${esc(b.ten)}</strong><br />${ngay(b.ngay)}, ${esc(b.tu)}–${esc(b.den)}, ${esc(b.diaDiem)} · còn ${con} chỗ</span>
        <button type="button" class="nut nut-nho" data-act="dang-ky-buoi" data-id="${esc(b.id)}">Đăng ký</button></li>`;
    }).join('')}</ul>`;
  }

  App.theLoTrinh = (t) => {
    if (L.baiHieuLuc(Store.state, t.mssv, 'khao_sat')) return '';
    const lt = L.loTrinhTuyen(Store.state, t.mssv);
    const buoc = (xong, dangLam, ten, than) => `
      <li class="${xong ? 'xong' : dangLam ? 'dang-lam' : ''}">
        <span class="so-buoc" aria-hidden="true">${xong ? '✓' : ''}</span>
        <div><strong>${ten}</strong>${than}</div>
      </li>`;
    const duocOn = L.duocOnLuyen(Store.state, t);
    return `
      <section class="the">
        <h2>Lộ trình trở thành trợ lý</h2>
        <p class="phu">Đọc tài liệu trước, khảo sát làm tập trung tại PTN.</p>
        <ol class="lo-trinh">
          ${buoc(lt.docXong, !lt.docXong, `Đọc tài liệu Phần 1 (${lt.soDaDoc}/${lt.tongBatBuoc})`, lt.docXong ? '' : '<p><button type="button" class="nut nut-nho" data-act="di-den" data-trang="tai-lieu">Mở tài liệu</button></p>')}
          ${buoc(lt.noiQuyXong, lt.docXong && !lt.noiQuyXong, 'Đọc và cam kết nội quy', lt.noiQuyXong ? '' : '<p><button type="button" class="nut nut-phu nut-nho" data-act="di-den" data-trang="noi-quy">Xem nội quy</button></p>')}
          ${Store.state.caiDat.choOnTruocKhaoSat === false ? '' : buoc(false, duocOn, 'Ôn thử (không bắt buộc)', `<p class="phu">${duocOn ? 'Dùng mục Ôn luyện bên dưới, không tính điểm.' : 'Mở sau khi đọc xong tài liệu.'}</p>`)}
          ${buoc(Boolean(lt.buoi), lt.sanSang && !lt.buoi, 'Đăng ký buổi khảo sát', buocBuoi(t, lt))}
          ${buoc(false, lt.buoi?.dangMo, 'Làm khảo sát tại PTN', lt.buoi?.dangMo ? `
            <form data-form="vao-khao-sat" class="hang-form">
              <input name="maVao" inputmode="numeric" autocomplete="off" aria-label="Mã vào bài" placeholder="Mã do PTN công bố" required />
              <button class="nut nut-nho">Vào làm bài</button>
            </form>` : '<p class="phu">PTN công bố mã vào bài ngay tại buổi khảo sát.</p>')}
          ${buoc(false, false, 'PTN xét kết quả, phỏng vấn nếu cần', '')}
        </ol>
      </section>`;
  };

  App.act['dang-ky-buoi'] = (el) => {
    const buoi = Store.state.buoiKhaoSat.find((b) => b.id === el.dataset.id);
    const t = toi();
    const loi = L.kiemTraDangKyBuoi(Store.state, buoi, t.mssv, Store.now());
    if (loi) return thongBao(loi, 'loi');
    Store.state.thamGiaBuoi.push({ buoiId: buoi.id, mssv: t.mssv, luc: Store.now() });
    App.xong('Đã đăng ký buổi khảo sát.');
  };
  App.act['huy-buoi'] = (el) => {
    const mssv = toi().mssv;
    Store.state.thamGiaBuoi = Store.state.thamGiaBuoi.filter((x) => !(x.buoiId === el.dataset.id && x.mssv === mssv));
    App.xong();
  };

  /* ---------- Admin chỉnh nội dung ---------- */
  App.trang['noi-dung'] = {
    ten: 'Tài liệu, nội quy',
    icon: 'sach',
    render() {
      const st = Store.state;
      const nut = (act, id, ten) => (laAdmin() ? `<button type="button" class="nut nut-phu nut-nho" data-act="${act}" data-id="${esc(id)}">${ten}</button>` : '');
      return `
        ${laAdmin() ? '' : '<section class="the the-nhat"><p>Chỉ Admin được sửa nội dung trang này.</p></section>'}
        ${PHAN.map(([phan, ten]) => `
          <section class="the">
            <div class="hang-dau"><h2>${esc(ten)}</h2>${laAdmin() ? `<button type="button" class="nut nut-nho" data-act="sua-tai-lieu" data-id="" data-phan="${phan}">Thêm bài</button>` : ''}</div>
            <ul class="ds-gon">${st.taiLieu.filter((t) => t.phan === phan).sort((a, b) => a.thuTu - b.thuTu).map((t) => `
              <li><span class="${t.hoatDong ? '' : 'mo'}">${t.thuTu}. ${esc(t.tieuDe)}${t.batBuoc ? ' <small>(bắt buộc)</small>' : ''}</span>${nut('sua-tai-lieu', t.id, 'Sửa')}</li>`).join('')}</ul>
          </section>`).join('')}
        <section class="the">
          <div class="hang-dau"><h2>Nội quy (phiên bản ${st.caiDat.phienBanNoiQuy || 1})</h2>${laAdmin() ? '<button type="button" class="nut nut-nho" data-act="sua-noi-quy" data-id="">Thêm mục</button>' : ''}</div>
          <p class="phu">Sửa nội quy thì mọi người phải cam kết lại.</p>
          <ul class="ds-gon">${st.noiQuy.slice().sort((a, b) => a.nhom.localeCompare(b.nhom) || a.thuTu - b.thuTu).map((n) => `
            <li><span class="${n.hoatDong ? '' : 'mo'}"><small>${esc(n.nhom)}</small>${esc(n.noiDung)}</span>${nut('sua-noi-quy', n.id, 'Sửa')}</li>`).join('')}</ul>
        </section>`;
    }
  };

  App.act['sua-tai-lieu'] = (el) => {
    const t = Store.state.taiLieu.find((x) => x.id === el.dataset.id) || { id: '', phan: el.dataset.phan, thuTu: 99, phut: 5, tieuDe: '', chuDe: '', nguon: '', duongDan: '', noiDung: '', batBuoc: el.dataset.phan === 'tuyen', hoatDong: true };
    moHop(t.id ? 'Sửa bài tài liệu' : 'Thêm bài tài liệu', `
      <form data-form="luu-tai-lieu" data-id="${esc(t.id)}">
        <label>Tiêu đề <input name="tieuDe" value="${esc(t.tieuDe)}" required /></label>
        <div class="luoi-form cot-3">
          <label>Phần <select name="phan">${PHAN.map(([k, n]) => `<option value="${k}"${t.phan === k ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
          <label>Thứ tự <input type="number" name="thuTu" min="1" value="${t.thuTu}" required /></label>
          <label>Số phút đọc <input type="number" name="phut" min="1" value="${t.phut}" required /></label>
        </div>
        <label>Chủ đề câu hỏi liên quan <input name="chuDe" value="${esc(t.chuDe)}" /></label>
        <label>Nguồn <input name="nguon" value="${esc(t.nguon)}" /></label>
        <label>Đường dẫn file đính kèm (Google Drive…) <input type="url" name="duongDan" value="${esc(t.duongDan)}" placeholder="https://" /></label>
        <label>Nội dung <textarea name="noiDung" rows="14" required>${esc(t.noiDung)}</textarea></label>
        <p class="phu">Viết <strong>## Tiêu đề</strong>, <strong>- gạch đầu dòng</strong>, <strong>1. đánh số</strong>, <strong>> lưu ý</strong>, <strong>**chữ đậm**</strong>; bảng dùng dấu |.</p>
        <label class="o-chon"><input type="checkbox" name="batBuoc"${t.batBuoc ? ' checked' : ''} /><span>Bắt buộc đọc trước khảo sát</span></label>
        <label class="o-chon"><input type="checkbox" name="hoatDong"${t.hoatDong ? ' checked' : ''} /><span>Hiện cho trợ lý</span></label>
        <div class="hang-nut canh-phai">
          ${t.id ? `<button type="button" class="nut nut-phu" data-act="xoa-tai-lieu" data-id="${esc(t.id)}">Xóa bài</button>` : ''}
          <button class="nut">Lưu</button>
        </div>
      </form>`, { rong: true });
  };

  App.form['luu-tai-lieu'] = (f, el) => {
    const ds = Store.state.taiLieu;
    const du = { phan: f.phan, thuTu: Number(f.thuTu), phut: Number(f.phut), tieuDe: f.tieuDe.trim(), chuDe: f.chuDe.trim(), nguon: f.nguon.trim(), duongDan: f.duongDan.trim(), noiDung: f.noiDung.trim(), batBuoc: 'batBuoc' in f, hoatDong: 'hoatDong' in f };
    const cu = ds.find((x) => x.id === el.dataset.id);
    if (cu) Object.assign(cu, du);
    else ds.push({ id: Store.id('tl'), ...du });
    Store.ghiNhatKy(cu ? 'Sửa tài liệu' : 'Thêm tài liệu', du.tieuDe);
    App.xong('Đã lưu tài liệu.');
  };

  App.act['xoa-tai-lieu'] = async (el) => {
    const t = Store.state.taiLieu.find((x) => x.id === el.dataset.id);
    if (!(await xacNhan(`Xóa bài "${t.tieuDe}"?`, 'Xóa'))) return;
    Store.state.taiLieu = Store.state.taiLieu.filter((x) => x !== t);
    Store.ghiNhatKy('Xóa tài liệu', t.tieuDe);
    App.xong('Đã xóa.');
  };

  App.act['sua-noi-quy'] = (el) => {
    const n = Store.state.noiQuy.find((x) => x.id === el.dataset.id) || { id: '', nhom: '', thuTu: 99, noiDung: '', xuLy: '', nguon: '', hoatDong: true };
    const nhom = [...new Set(Store.state.noiQuy.map((x) => x.nhom))];
    moHop(n.id ? 'Sửa nội quy' : 'Thêm nội quy', `
      <form data-form="luu-noi-quy" data-id="${esc(n.id)}">
        <div class="luoi-form">
          <label>Nhóm <input name="nhom" list="ds-nhom-noi-quy" value="${esc(n.nhom)}" required /></label>
          <label>Thứ tự <input type="number" name="thuTu" min="1" value="${n.thuTu}" required /></label>
        </div>
        <datalist id="ds-nhom-noi-quy">${nhom.map((x) => `<option value="${esc(x)}"></option>`).join('')}</datalist>
        <label>Quy định <textarea name="noiDung" rows="3" required>${esc(n.noiDung)}</textarea></label>
        <label>Xử lý khi vi phạm <input name="xuLy" value="${esc(n.xuLy)}" required /></label>
        <label>Nguồn <input name="nguon" value="${esc(n.nguon)}" /></label>
        <label class="o-chon"><input type="checkbox" name="hoatDong"${n.hoatDong ? ' checked' : ''} /><span>Đang áp dụng</span></label>
        <div class="hang-nut canh-phai"><button class="nut">Lưu</button></div>
      </form>`);
  };

  App.form['luu-noi-quy'] = (f, el) => {
    const st = Store.state;
    const du = { nhom: f.nhom.trim(), thuTu: Number(f.thuTu), noiDung: f.noiDung.trim(), xuLy: f.xuLy.trim(), nguon: f.nguon.trim(), hoatDong: 'hoatDong' in f };
    const cu = st.noiQuy.find((x) => x.id === el.dataset.id);
    if (cu) Object.assign(cu, du);
    else st.noiQuy.push({ id: Store.id('nq'), ...du });
    st.caiDat.phienBanNoiQuy = (st.caiDat.phienBanNoiQuy || 1) + 1;
    Store.ghiNhatKy('Sửa nội quy', du.noiDung.slice(0, 60));
    App.xong('Đã lưu nội quy. Mọi người sẽ được yêu cầu cam kết lại.');
  };

  /* ---------- Buổi khảo sát (quản lý) ---------- */
  App.theBuoiKhaoSat = () => {
    const st = Store.state;
    const ten = (mssv) => Store.troLy(mssv)?.hoTen || mssv;
    return `
      <section class="the">
        <div class="hang-dau"><h2>Buổi khảo sát tuyển</h2></div>
        ${st.buoiKhaoSat.length ? `<ul class="ds-canh-bao">${st.buoiKhaoSat.slice().reverse().map((b) => {
          const ds = st.thamGiaBuoi.filter((x) => x.buoiId === b.id);
          return `<li>
            <div class="hang-dau"><strong>${esc(b.ten)}</strong>${b.dangMo ? `<span class="ma-vao">Mã vào bài: <b>${esc(b.maVao)}</b></span>` : ''}</div>
            <p class="phu">${ngay(b.ngay)}, ${esc(b.tu)}–${esc(b.den)}, ${esc(b.diaDiem)} · ${ds.length}/${b.soCho} người</p>
            ${ds.length ? `<p class="phu">${ds.map((x) => esc(ten(x.mssv))).join(', ')}</p>` : ''}
            <div class="hang-nut">
              <button type="button" class="nut ${b.dangMo ? 'nut-phu' : 'nut-xanh'} nut-nho" data-act="mo-dong-buoi" data-id="${esc(b.id)}">${b.dangMo ? 'Đóng bài' : 'Mở bài, tạo mã'}</button>
              ${laAdmin() && !ds.length ? `<button type="button" class="nut-chu" data-act="xoa-buoi" data-id="${esc(b.id)}">Xóa</button>` : ''}
            </div>
          </li>`;
        }).join('')}</ul>` : '<p class="phu">Chưa có buổi khảo sát nào.</p>'}
        <details><summary>Tạo buổi mới</summary>
          <form data-form="tao-buoi" class="luoi-form">
            <label>Tên buổi <input name="ten" required /></label>
            <label>Địa điểm <input name="diaDiem" value="F4.02" required /></label>
            <label>Ngày <input type="date" name="ngay" min="${L.ngayKey(new Date(Store.now()))}" required /></label>
            <label>Số chỗ <input type="number" name="soCho" min="1" value="10" required /></label>
            <label>Từ <input type="time" name="tu" required /></label>
            <label>Đến <input type="time" name="den" required /></label>
            <div class="hang-nut rong-het"><button class="nut">Tạo buổi và báo ứng viên</button></div>
          </form>
        </details>
      </section>`;
  };

  App.form['tao-buoi'] = (f) => {
    if (L.phut(f.den) <= L.phut(f.tu)) return thongBao('Giờ kết thúc phải sau giờ bắt đầu.', 'loi');
    const st = Store.state;
    st.buoiKhaoSat.push({ id: Store.id('bk'), ten: f.ten.trim(), ngay: f.ngay, tu: f.tu, den: f.den, diaDiem: f.diaDiem.trim(), soCho: Number(f.soCho), maVao: '', dangMo: false });
    Store.guiThongBao({ tieuDe: 'Có lịch khảo sát tuyển', noiDung: `${f.ten.trim()}: ${ngayDu(f.ngay)}, ${f.tu}–${f.den}, ${f.diaDiem.trim()}.`, nguoiNhan: st.troLy.filter((t) => t.trangThai === 'cho_duyet').map((t) => t.mssv) });
    Store.ghiNhatKy('Tạo buổi khảo sát', f.ten.trim());
    App.xong('Đã tạo buổi khảo sát.');
  };

  App.act['mo-dong-buoi'] = (el) => {
    const b = Store.state.buoiKhaoSat.find((x) => x.id === el.dataset.id);
    b.dangMo = !b.dangMo;
    b.maVao = b.dangMo ? String(100000 + Math.floor(Math.random() * 900000)) : '';
    Store.ghiNhatKy(b.dangMo ? 'Mở bài khảo sát' : 'Đóng bài khảo sát', b.ten);
    App.xong();
  };

  App.act['xoa-buoi'] = (el) => {
    Store.state.buoiKhaoSat = Store.state.buoiKhaoSat.filter((x) => x.id !== el.dataset.id);
    App.xong('Đã xóa buổi.');
  };

  App.moTaLoTrinh = (t) => {
    const lt = L.loTrinhTuyen(Store.state, t.mssv);
    return `Tài liệu ${lt.soDaDoc}/${lt.tongBatBuoc}, nội quy ${lt.noiQuyXong ? 'đã cam kết' : 'chưa cam kết'}, ${lt.buoi ? `đăng ký ${lt.buoi.ten}` : 'chưa đăng ký buổi'}`;
  };

})();
