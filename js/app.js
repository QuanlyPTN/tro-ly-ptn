/* Khung app: điều hướng, vòng render, phân phối sự kiện.
   Các file trang-*.js đăng ký trang và hành động vào App.trang / App.act / App.form / App.doi. */
(function () {
  const { esc } = window.UI;
  const L = window.Logic;

  const NHOM_NAV = [
    ['Hằng ngày', ['trang-chu', 'ca-hom-nay', 'lich-truc', 'viec-cua-toi', 'thong-bao', 'xin-vang']],
    ['Học tập', ['tap-huan', 'tai-lieu', 'noi-quy']],
    ['Cá nhân', ['tien-do', 'thong-tin', 'dang-ky']],
    ['Vận hành', ['tong-quan', 'bang-ca', 'danh-sach', 'duyet-don', 'so-ne-nep', 'canh-bao']],
    ['Việc và tin', ['viec-ngoai-ca', 'thong-bao-ql']],
    ['Tập huấn', ['quan-ly-tap-huan', 'ngan-hang', 'noi-dung', 'cuoi-ky']],
    ['Hệ thống', ['tai-khoan', 'cai-dat', 'nhat-ky']]
  ];
  const MO_TA = {
    'trang-chu': 'Tình hình của bạn trong học kỳ', 'ca-hom-nay': 'Bắt đầu, kết thúc trực và checklist cuối ca', 'lich-truc': 'Chọn khung trực cho tuần sau', 'viec-cua-toi': 'Việc được giao, việc đột xuất và điểm cộng đồng',
    'thong-bao': 'Tin từ PTN và nhắc việc', 'xin-vang': 'Gửi đơn và theo dõi duyệt', 'tap-huan': 'Bài kiểm tra và ôn luyện', 'tai-lieu': 'Đọc hiểu trước khi làm bài',
    'noi-quy': 'Quy định đối với trợ lý', 'tien-do': 'Chỉ số học kỳ và mức xếp loại', 'thong-tin': 'Hồ sơ và thời khóa biểu', 'dang-ky': 'Trở thành trợ lý PTN',
    'tong-quan': 'Tình hình PTN hôm nay', 'bang-ca': 'Theo dõi ca và duyệt giờ trực', 'danh-sach': 'Hồ sơ, bộ lọc và xuất Excel', 'duyet-don': 'Xin vắng, đổi ca, chuyển máy',
    'so-ne-nep': 'Ghi nhận lỗi và điểm tốt', 'canh-bao': 'Web đề xuất, quản lý chốt', 'viec-ngoai-ca': 'Việc đột xuất, việc giao và thống kê', 'thong-bao-ql': 'Soạn tin và xem ai đã đọc',
    'quan-ly-tap-huan': 'Buổi khảo sát, chấm bài, mở lại bài', 'ngan-hang': 'File câu hỏi, xem và sửa từng câu', 'noi-dung': 'Tài liệu tập huấn và nội quy',
    'cuoi-ky': 'Đánh giá và xếp loại học kỳ', 'tai-khoan': 'Tài khoản quản lý', 'cai-dat': 'Đợt tuyển, mốc, danh mục', 'nhat-ky': 'Ai làm gì, lúc nào'
  };
  const MENU_DUOI = { tro_ly: ['trang-chu', 'ca-hom-nay', 'lich-truc', 'thong-bao'], ung_vien: ['tap-huan', 'tai-lieu', 'noi-quy', 'thong-bao'], quan_ly: ['tong-quan', 'bang-ca', 'duyet-don', 'danh-sach'] };

  const App = {
    trang: {},
    act: {},
    form: {},
    doi: {},
    ui: { trang: null },

    dsTrang() {
      const { vaiTro, mssv } = Store.phien;
      if (vaiTro === 'tro_ly') {
        const tl = Store.troLy(mssv);
        if (!tl) return ['dang-ky'];
        if (['thu_viec', 'dang_hoat_dong'].includes(tl.trangThai)) return ['trang-chu', 'ca-hom-nay', 'lich-truc', 'thong-bao', 'viec-cua-toi', 'tap-huan', 'tai-lieu', 'noi-quy', 'tien-do', 'xin-vang', 'thong-tin'];
        if (tl.trangThai === 'cho_duyet') return ['tap-huan', 'tai-lieu', 'noi-quy', 'thong-bao', 'thong-tin'];
        return ['thong-tin', 'thong-bao', 'tien-do'];
      }
      const quanLy = ['tong-quan', 'bang-ca', 'danh-sach', 'duyet-don', 'so-ne-nep', 'thong-bao-ql', 'viec-ngoai-ca', 'canh-bao', 'quan-ly-tap-huan', 'ngan-hang', 'noi-dung', 'cuoi-ky'];
      return vaiTro === 'admin' ? [...quanLy, 'tai-khoan', 'cai-dat', 'nhat-ky'] : quanLy;
    },

    /* nen = true: vẽ lại do dữ liệu nền về. Phần không đổi thì giữ nguyên, nếu không cú bấm rơi đúng lúc thay DOM sẽ bị mất. */
    render(nen = false) {
      const dat = (id, html) => {
        const el = document.getElementById(id);
        if (nen && el.veCuoi === html) return;
        el.veCuoi = html;
        el.innerHTML = html;
      };
      const ds = this.dsTrang();
      if (!ds.includes(this.ui.trang)) this.ui.trang = ds[0];
      const trang = this.trang[this.ui.trang];

      const muc = (id, lop) => {
        const t = this.trang[id];
        const dangMo = id === this.ui.trang;
        const dem = t.dem ? t.dem() : 0;
        return `<button type="button" class="${lop}${dangMo ? ' dang-mo' : ''}" data-act="di-den" data-trang="${id}"${dangMo ? ' aria-current="page"' : ''}>
          ${UI.bieuTuong(t.icon)}<span>${esc(t.ten)}</span>${dem ? `<b class="huy-hieu" aria-label="${dem} mục mới">${dem}</b>` : ''}</button>`;
      };
      dat('dieu-huong', NHOM_NAV
        .map(([ten, nhom]) => [ten, nhom.filter((id) => ds.includes(id))])
        .filter(([, nhom]) => nhom.length)
        .map(([ten, nhom]) => `<p class="nhom-nav">${esc(ten)}</p>${nhom.map((id) => muc(id, 'muc-nav')).join('')}`)
        .join(''));

      const { vaiTro } = Store.phien;
      const tl = Store.troLy(Store.phien.mssv);
      const duoi = vaiTro !== 'tro_ly' ? MENU_DUOI.quan_ly : tl?.trangThai === 'cho_duyet' ? MENU_DUOI.ung_vien : MENU_DUOI.tro_ly;
      const coDuoi = duoi.filter((id) => ds.includes(id));
      dat('thanh-duoi', `${coDuoi.map((id) => muc(id, 'muc-duoi')).join('')}
        <button type="button" class="muc-duoi${coDuoi.includes(this.ui.trang) ? '' : ' dang-mo'}" data-act="mo-demo">${UI.bieuTuong('them')}<span>Thêm</span></button>`);

      dat('thu-demo', this.demoHtml());
      document.getElementById('tieu-de-trang').textContent = trang.ten;
      document.getElementById('mo-ta-trang').textContent = MO_TA[this.ui.trang] || '';
      dat('khu-nguoi-dung', this.nguoiDungHtml());
      dat('trang', trang.render());
      document.body.classList.toggle('che-do-lam-bai', Boolean(document.querySelector('#trang .thanh-bai')));
    },

    nguoiDungHtml() {
      const { ten } = Store.nguoiDung();
      const vai = { tro_ly: 'Trợ lý', quan_ly: 'Quản lý', admin: 'Admin' }[Store.phien.vaiTro];
      const tb = this.trang['thong-bao'];
      const dem = Store.phien.vaiTro === 'tro_ly' && Store.phien.mssv && this.dsTrang().includes('thong-bao') ? tb.dem() : 0;
      const chuong = this.dsTrang().includes('thong-bao')
        ? `<button type="button" class="nut-chuong" data-act="di-den" data-trang="thong-bao" aria-label="Thông báo">${UI.bieuTuong('chuong')}${dem ? `<b class="huy-hieu">${dem}</b>` : ''}</button>`
        : '';
      return `${chuong}<span class="nguoi-dung">${UI.avatar(ten)}<span>${esc(ten)}<small>${vai}</small></span></span>`;
    },

    demoHtml() {
      if (Store.tuXa) {
        if (Store.phien.vaiTro === 'tro_ly') return '<button type="button" class="nut nut-phu nut-nho" data-act="mo-dang-nhap">Đăng nhập quản lý</button>';
        return `<p class="nhan-demo">${esc(Store.nguoiDung().ten)}</p><button type="button" class="nut nut-phu nut-nho" data-act="dang-xuat">Đăng xuất</button>`;
      }
      const { vaiTro, mssv, taiKhoanId } = Store.phien;
      const nut = (id, ten) => `<button type="button" class="${vaiTro === id ? 'dang-chon' : ''}" data-act="doi-vai" data-vai="${id}" aria-pressed="${vaiTro === id}">${ten}</button>`;
      const nguoi =
        vaiTro === 'tro_ly'
          ? `<label>Xem với tư cách
              <select data-doi="doi-tro-ly">
                ${Store.state.troLy.map((t) => `<option value="${esc(t.mssv)}"${t.mssv === mssv ? ' selected' : ''}>${esc(t.hoTen)}</option>`).join('')}
                <option value=""${mssv ? '' : ' selected'}>Sinh viên mới</option>
              </select></label>`
          : vaiTro === 'quan_ly'
            ? `<label>Tài khoản
                <select data-doi="doi-tai-khoan">
                  ${Store.state.taiKhoan.filter((t) => t.vaiTro === 'quan_ly' && !t.khoa).map((t) => `<option value="${esc(t.id)}"${t.id === taiKhoanId ? ' selected' : ''}>${esc(t.ten)}</option>`).join('')}
                </select></label>`
            : '';
      const lech = Store.lechDongHo !== 0;
      const d = new Date(Store.now() - new Date().getTimezoneOffset() * L.PHUT).toISOString().slice(0, 16);
      return `
        <p class="nhan-demo">Đăng nhập thử</p>
        <div class="chon-vai">${nut('tro_ly', 'Trợ lý')}${nut('quan_ly', 'Quản lý')}${nut('admin', 'Admin')}</div>
        ${nguoi}
        <label>Đồng hồ thử
          <input type="datetime-local" value="${d}" data-doi="doi-dong-ho" />
        </label>
        ${lech ? '<button type="button" class="nut-chu" data-act="dong-ho-that">Về giờ thật</button>' : ''}`;
    },

    /* Lưu rồi vẽ lại, giữ nguyên vị trí cuộn của trang. */
    xong(thongBao) {
      Store.luu();
      const y = window.scrollY;
      UI.dongHop();
      this.render();
      window.scrollTo(0, y);
      if (thongBao) UI.thongBao(thongBao);
    },

    baoMang(matMang) {
      document.getElementById('bao-mang').hidden = !matMang;
    },

    /* Dữ liệu mới về: không vẽ lại khi người dùng đang nhập hoặc đang làm bài để khỏi mất chữ. */
    sauDongBo() {
      const dangNhap = document.querySelector('dialog[open]') || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      const lamBai = document.querySelector('.thanh-bai');
      if ((dangNhap || lamBai) && !this.ui.canVeLai) return;
      this.ui.canVeLai = false;
      const y = window.scrollY;
      this.render(true);
      window.scrollTo(0, y);
    },

    async khoiDong() {
      Store.maMay();
      try {
        await Store.khoiTao();
      } catch (loi) {
        document.getElementById('trang').innerHTML = `<section class="the"><h2>Chưa kết nối được máy chủ</h2><p class="phu">Kiểm tra mạng rồi tải lại trang.</p><button type="button" class="nut" data-act="tai-lai">Thử lại</button></section>`;
        document.addEventListener('click', (e) => e.target.closest('[data-act="tai-lai"]') && location.reload());
        return;
      }

      document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-act]');
        if (!el) return;
        const ham = this.act[el.dataset.act];
        if (ham) ham(el, e);
      });
      document.addEventListener('submit', (e) => {
        const el = e.target.closest('[data-form]');
        if (!el) return;
        e.preventDefault();
        const ham = this.form[el.dataset.form];
        if (ham) ham(Object.fromEntries(new FormData(el)), el);
      });
      document.addEventListener('change', (e) => {
        const el = e.target.closest('[data-doi]');
        if (!el) return;
        const ham = this.doi[el.dataset.doi];
        if (ham) ham(el, e);
      });

      // Tab khác ghi dữ liệu thì tab này đọc lại, tránh ghi đè bằng bản cũ.
      window.addEventListener('storage', (e) => {
        if (!Store.tuXa && e.key && e.key.startsWith('tlptn-du-lieu')) {
          Store.taiLai();
          if (!document.querySelector('dialog[open]')) this.render();
        }
      });

      if (location.protocol.startsWith('http') && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

      // Đồng hồ bài kiểm tra vẫn chạy khi app đóng, nên mở lại là vào thẳng bài đang làm.
      const { vaiTro, mssv } = Store.phien;
      if (vaiTro === 'tro_ly' && Store.state.baiLam.some((b) => b.mssv === mssv && b.ketQua === 'dang_lam')) this.ui.trang = 'tap-huan';
      this.render();
      if (this.batDauDem) this.batDauDem();
    }
  };

  App.act['di-den'] = (el) => {
    App.ui.trang = el.dataset.trang;
    document.body.classList.remove('mo-demo');
    App.render();
    window.scrollTo(0, 0);
  };
  App.act['doi-vai'] = (el) => {
    Store.phien.vaiTro = el.dataset.vai;
    Store.luuPhien();
    App.ui.trang = null;
    App.render();
  };
  App.act['mo-dang-nhap'] = () => UI.moHop('Đăng nhập quản lý', `
    <form data-form="dang-nhap">
      <label>Email <input type="email" name="email" autocomplete="username" required /></label>
      <label>Mật khẩu <input type="password" name="matKhau" autocomplete="current-password" required /></label>
      <p id="loi-dang-nhap" class="loi" role="alert" hidden></p>
      <div class="hang-nut canh-phai"><button class="nut">Đăng nhập</button></div>
    </form>`);
  App.form['dang-nhap'] = async (f, el) => {
    const nut = el.querySelector('button');
    nut.disabled = true;
    try {
      await DongBo.dangNhap(f.email, f.matKhau);
      App.ui.trang = null;
      UI.dongHop();
      App.render();
    } catch (loi) {
      const p = document.getElementById('loi-dang-nhap');
      p.hidden = false;
      p.textContent = loi.tuMayChu ? loi.message : 'Không kết nối được máy chủ.';
      nut.disabled = false;
    }
  };
  App.act['dang-xuat'] = async () => {
    await DongBo.dangXuat();
    App.ui.trang = null;
    App.render();
  };
  App.act['mo-demo'] = () => document.body.classList.toggle('mo-demo');
  App.act['dong-hop'] = () => UI.dongHop();
  App.act['dong-ho-that'] = () => {
    Store.datDongHo(null);
    App.render();
  };
  App.doi['doi-tro-ly'] = (el) => {
    Store.phien.mssv = el.value || null;
    Store.luuPhien();
    App.ui.trang = null;
    App.render();
  };
  App.doi['doi-tai-khoan'] = (el) => {
    Store.phien.taiKhoanId = el.value;
    Store.luuPhien();
    App.render();
  };
  App.doi['doi-dong-ho'] = (el) => {
    if (!el.value) return;
    Store.datDongHo(new Date(el.value).getTime());
    App.render();
  };

  window.App = App;
  document.addEventListener('DOMContentLoaded', () => App.khoiDong());
})();
