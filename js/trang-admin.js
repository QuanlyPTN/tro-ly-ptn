/* Phần Admin: tài khoản quản lý, cài đặt, nhật ký (mục 2, 8). */
(function () {
  const { esc, ngayGio, nhan, xacNhan, thongBao } = window.UI;

  App.trang['tai-khoan'] = {
    ten: 'Tài khoản',
    icon: 'khoa',
    render() {
      const ds = Store.state.taiKhoan.filter((t) => t.vaiTro === 'quan_ly');
      return `
        <section class="the">
          <h2>Tài khoản quản lý</h2>
          ${Store.tuXa ? '' : '<p class="phu">Bản thử trên máy không dùng mật khẩu.</p>'}
          <ul class="ds-gon">${ds.map((t) => `
            <li><span><strong>${esc(t.ten)}</strong> · ${esc(t.email)} ${t.khoa ? '<span class="nhan nhan-do">Đã khóa</span>' : ''}</span>
              <button type="button" class="nut nut-phu nut-nho" data-act="khoa-tai-khoan" data-id="${esc(t.id)}">${t.khoa ? 'Mở khóa' : 'Khóa'}</button></li>`).join('')}</ul>
          <form data-form="them-tai-khoan" class="luoi-form">
            <label>Họ tên <input name="ten" required /></label>
            <label>Email <input name="email" type="email" required /></label>
            ${Store.tuXa ? '<label>Mật khẩu ban đầu <input name="matKhau" type="password" minlength="8" autocomplete="new-password" required /></label>' : ''}
            <div class="hang-nut rong-het"><button class="nut">Cấp tài khoản</button></div>
          </form>
        </section>`;
    }
  };

  App.form['them-tai-khoan'] = async (f) => {
    const email = f.email.trim().toLowerCase();
    if (Store.tuXa) {
      try {
        await DongBo.thucHien('capTaiKhoan', { email, ten: f.ten, matKhau: f.matKhau });
      } catch (loi) {
        return thongBao(loi.tuMayChu ? loi.message : 'Không kết nối được máy chủ.', 'loi');
      }
      return App.xong('Đã cấp tài khoản.');
    }
    if (Store.state.taiKhoan.some((t) => t.email === email)) return thongBao('Email này đã có tài khoản.', 'loi');
    Store.state.taiKhoan.push({ id: Store.id('ql'), email, ten: f.ten.trim(), vaiTro: 'quan_ly', khoa: false });
    Store.ghiNhatKy('Cấp tài khoản quản lý', email);
    App.xong('Đã cấp tài khoản.');
  };

  App.act['khoa-tai-khoan'] = (el) => {
    const t = Store.state.taiKhoan.find((x) => x.id === el.dataset.id);
    t.khoa = !t.khoa;
    if (t.khoa && Store.phien.taiKhoanId === t.id) {
      const conLai = Store.state.taiKhoan.find((x) => x.vaiTro === 'quan_ly' && !x.khoa);
      Store.phien.taiKhoanId = conLai?.id || null;
      Store.luuPhien();
    }
    Store.ghiNhatKy(t.khoa ? 'Khóa tài khoản' : 'Mở khóa tài khoản', t.email);
    App.xong();
  };

  const O_SO = [
    ['soNguoiMoiKhung', 'Số người tối đa mỗi khung (chờ chốt)'],
    ['phutDungGio', 'Đúng giờ: trễ tối đa (phút)'],
    ['phutTreToiDa', 'Trực đủ: trễ tối đa (phút)'],
    ['phutRaSomToiDa', 'Trực đủ: ra sớm tối đa (phút)'],
    ['soLanQuenKetThuc', 'Quên Kết thúc trực: số lần cho phép/kỳ'],
    ['gioToiThieu', 'Giờ tối thiểu mỗi kỳ'],
    ['gioXuatSac', 'Giờ loại Xuất sắc (chờ chốt)'],
    ['soCaTinhToiThieu', 'Số ca tính để bật mốc tỷ lệ'],
    ['tuanXetMatTuCach', 'Tuần bắt đầu xét mất tư cách theo tỷ lệ'],
    ['diemBuLoi', 'Điểm cộng đồng bù 1 lỗi nhẹ'],
    ['ngayPhanHoi', 'Số ngày phản hồi trước khi quyết định']
  ];
  const O_MOC = [
    ['nhacNho', 'thamGia', 'Nhắc nhở: tham gia dưới (%)'], ['nhacNho', 'boCa', 'Nhắc nhở: ca bỏ'], ['nhacNho', 'loiNhe', 'Nhắc nhở: lỗi nhẹ'],
    ['canhBao', 'thamGia', 'Cảnh báo: tham gia dưới (%)'], ['canhBao', 'boCa', 'Cảnh báo: ca bỏ'], ['canhBao', 'loiNang', 'Cảnh báo: lỗi nặng'], ['canhBao', 'loiNhe', 'Cảnh báo: lỗi nhẹ'],
    ['matTuCach', 'thamGia', 'Mất tư cách: tham gia dưới (%)'], ['matTuCach', 'boCa', 'Mất tư cách: ca bỏ'], ['matTuCach', 'loiNang', 'Mất tư cách: lỗi nặng']
  ];

  App.trang['cai-dat'] = {
    ten: 'Cài đặt',
    icon: 'caiDat',
    render() {
      const st = Store.state;
      const cfg = st.caiDat;
      const dot = st.dotTuyen[0];
      const hk = st.hocKy[st.hocKy.length - 1];
      return `
        <section class="the">
          <h2>Đợt tuyển</h2>
          <form data-form="luu-dot-tuyen" class="luoi-form">
            <label>Tên đợt <input name="ten" value="${esc(dot.ten)}" required /></label>
            <label class="o-chon canh-day"><input type="checkbox" name="moDangKy"${dot.moDangKy ? ' checked' : ''} /><span>Đang mở đăng ký</span></label>
            <label>Từ ngày <input type="date" name="tuNgay" value="${esc(dot.tuNgay)}" required /></label>
            <label>Đến ngày <input type="date" name="denNgay" value="${esc(dot.denNgay)}" required /></label>
            <div class="hang-nut rong-het"><button class="nut">Lưu đợt tuyển</button></div>
          </form>
        </section>
        <section class="the">
          <h2>Học kỳ</h2>
          <form data-form="luu-hoc-ky" class="luoi-form cot-3">
            <label>Tên <input name="ten" value="${esc(hk.ten)}" required /></label>
            <label>Từ ngày <input type="date" name="tuNgay" value="${esc(hk.tuNgay)}" required /></label>
            <label>Đến ngày <input type="date" name="denNgay" value="${esc(hk.denNgay)}" required /></label>
            <div class="hang-nut rong-het"><button class="nut">Lưu học kỳ</button></div>
          </form>
        </section>
        <section class="the">
          <h2>Mốc và số phút</h2>
          <form data-form="luu-moc" class="luoi-form cot-3">
            ${O_SO.map(([k, ten]) => `<label>${esc(ten)} <input type="number" min="0" name="${k}" value="${cfg[k]}" required /></label>`).join('')}
            ${O_MOC.map(([m, k, ten]) => `<label>${esc(ten)} <input type="number" min="0" name="${m}.${k}" value="${cfg.moc[m][k]}" required /></label>`).join('')}
            <label class="o-chon rong-het"><input type="checkbox" name="choOnTruocKhaoSat"${cfg.choOnTruocKhaoSat === false ? '' : ' checked'} /><span>Cho ứng viên ôn câu hỏi bộ Tuyển trước khảo sát</span></label>
            <div class="hang-nut rong-het"><button class="nut">Lưu mốc</button></div>
          </form>
        </section>
        <section class="the">
          <h2>Đề kiểm tra</h2>
          <form data-form="luu-de">
            ${st.dotKiemTra.map((d) => `
              <fieldset class="luoi-form cot-4"><legend>${esc(d.ten)}</legend>
                ${d.nguon.map((n, i) => `<label>Câu TN bộ ${esc(n.bo)} <input type="number" min="0" name="${d.id}.nguon${i}" value="${n.soCau}" required /></label>`).join('')}
                <label>Câu tự luận <input type="number" min="0" name="${d.id}.soTuLuan" value="${d.soTuLuan}" required /></label>
                <label>Thời gian (phút) <input type="number" min="1" name="${d.id}.phut" value="${d.phut}" required /></label>
                <label>Đạt TN (%) <input type="number" min="0" max="100" name="${d.id}.tn" value="${d.dat.tn}" required /></label>
              </fieldset>`).join('')}
            <div class="hang-nut"><button class="nut">Lưu đề kiểm tra</button></div>
          </form>
        </section>
        <section class="the">
          <h2>Checklist cuối ca</h2>
          <ul class="ds-gon">${st.checklistMau.slice().sort((a, b) => a.thuTu - b.thuTu).map((m) => `
            <li><span class="${m.hoatDong ? '' : 'mo'}">${esc(m.noiDung)}</span>
            ${m.banGiao ? '' : `<button type="button" class="nut-chu" data-act="an-muc-checklist" data-id="${esc(m.id)}">${m.hoatDong ? 'Ẩn' : 'Hiện lại'}</button>`}</li>`).join('')}</ul>
          <form data-form="them-muc-checklist" class="hang-form">
            <input name="noiDung" aria-label="Mục checklist mới" placeholder="Mục mới" required />
            <button class="nut nut-phu">Thêm</button>
          </form>
        </section>
        <section class="the">
          <h2>Danh mục sổ nề nếp</h2>
          <form data-form="luu-danh-muc" class="luoi-form">
            ${Object.entries(UI.LOAI_NE_NEP).map(([k, ten]) => `<label>${ten} (mỗi dòng một mục) <textarea name="${k}" rows="5" required>${esc(st.danhMucLoi[k].join('\n'))}</textarea></label>`).join('')}
            <div class="hang-nut rong-het"><button class="nut">Lưu danh mục</button></div>
          </form>
        </section>
        ${Store.tuXa ? '' : `<section class="the the-do">
          <h2>Dữ liệu demo</h2>
          <p class="phu">Xóa toàn bộ dữ liệu trong trình duyệt này và tạo lại dữ liệu mẫu.</p>
          <button type="button" class="nut nut-phu" data-act="dat-lai-du-lieu">Đặt lại dữ liệu mẫu</button>
        </section>`}`;
    }
  };

  const daLuu = (viec) => {
    Store.ghiNhatKy('Sửa cài đặt', viec);
    App.xong('Đã lưu.');
  };

  App.form['luu-dot-tuyen'] = (f) => {
    if (f.denNgay < f.tuNgay) return thongBao('Ngày kết thúc phải sau ngày bắt đầu.', 'loi');
    Object.assign(Store.state.dotTuyen[0], { ten: f.ten.trim(), tuNgay: f.tuNgay, denNgay: f.denNgay, moDangKy: 'moDangKy' in f });
    daLuu('Đợt tuyển');
  };

  App.form['luu-hoc-ky'] = (f) => {
    if (f.denNgay <= f.tuNgay) return thongBao('Ngày kết thúc phải sau ngày bắt đầu.', 'loi');
    Object.assign(Store.state.hocKy[Store.state.hocKy.length - 1], { ten: f.ten.trim(), tuNgay: f.tuNgay, denNgay: f.denNgay });
    daLuu('Học kỳ');
  };

  App.form['luu-moc'] = (f) => {
    const cfg = Store.state.caiDat;
    O_SO.forEach(([k]) => (cfg[k] = Number(f[k])));
    O_MOC.forEach(([m, k]) => (cfg.moc[m][k] = Number(f[`${m}.${k}`])));
    cfg.choOnTruocKhaoSat = 'choOnTruocKhaoSat' in f;
    daLuu('Mốc và số phút');
  };

  App.form['luu-de'] = (f) => {
    Store.state.dotKiemTra.forEach((d) => {
      d.nguon.forEach((n, i) => (n.soCau = Number(f[`${d.id}.nguon${i}`])));
      d.soTuLuan = Number(f[`${d.id}.soTuLuan`]);
      d.phut = Number(f[`${d.id}.phut`]);
      d.dat.tn = Number(f[`${d.id}.tn`]);
    });
    daLuu('Đề kiểm tra');
  };

  App.act['an-muc-checklist'] = (el) => {
    const m = Store.state.checklistMau.find((x) => x.id === el.dataset.id);
    m.hoatDong = !m.hoatDong;
    daLuu(`Checklist: ${m.noiDung}`);
  };

  App.form['them-muc-checklist'] = (f) => {
    const ds = Store.state.checklistMau;
    // Giữ mục "Ghi bàn giao" ở cuối danh sách.
    const banGiao = ds.find((m) => m.banGiao);
    const thuTu = banGiao.thuTu;
    banGiao.thuTu += 1;
    ds.push({ id: Store.id('m'), noiDung: f.noiDung.trim(), chiCuoiBuoiChieu: false, thuTu, hoatDong: true });
    daLuu('Thêm mục checklist');
  };

  App.form['luu-danh-muc'] = (f) => {
    const dm = Store.state.danhMucLoi;
    Object.keys(UI.LOAI_NE_NEP).forEach((k) => (dm[k] = f[k].split('\n').map((x) => x.trim()).filter(Boolean)));
    daLuu('Danh mục sổ nề nếp');
  };

  App.act['dat-lai-du-lieu'] = async () => {
    if (!(await xacNhan('Mọi dữ liệu đã nhập trên trình duyệt này sẽ mất. Đặt lại?', 'Đặt lại'))) return;
    Store.datLaiDuLieu();
    App.ui = { trang: null };
    App.xong('Đã tạo lại dữ liệu mẫu.');
  };

  App.trang['nhat-ky'] = {
    ten: 'Nhật ký',
    icon: 'nhatKy',
    render() {
      const ds = Store.state.nhatKy.slice(0, 300);
      return `
        <section class="the">
          ${ds.length ? `<div class="cuon-ngang"><table class="bang">
            <thead><tr><th>Lúc</th><th>Ai</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th></tr></thead>
            <tbody>${ds.map((n) => `<tr><td>${ngayGio(n.luc)}</td><td>${esc(n.ai)}</td><td>${esc(n.hanhDong)}</td><td>${esc(n.doiTuong)}</td><td>${esc(n.chiTiet)}</td></tr>`).join('')}</tbody>
          </table></div>` : '<p class="phu">Chưa có thao tác nào được ghi.</p>'}
        </section>`;
    }
  };
})();
