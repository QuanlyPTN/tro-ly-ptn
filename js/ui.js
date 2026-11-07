/* Tiện ích giao diện dùng chung: định dạng, nhãn trạng thái, hộp thoại, thông báo nhanh. */
(function () {
  const L = window.Logic;

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const BIEU_TUONG = {
    nha: '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z"/>',
    them: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    ca: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lich: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    hoc: '<path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M7 12v5c3 2 7 2 10 0v-5"/>',
    tien: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    nguoi: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/>',
    nhom: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c1-4 4-6 7-6s6 2 7 6"/><path d="M16 5a3.5 3.5 0 010 6M18 14c2 1 3.5 3 4 6"/>',
    so: '<path d="M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 9h6M9 13h6"/>',
    chuong: '<path d="M6 10a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 004 0"/>',
    khoa: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    caiDat: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    nhatKy: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>',
    canhBao: '<path d="M12 4L2.5 20h19z"/><path d="M12 10v4M12 17v.5"/>',
    sach: '<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z"/><path d="M12 6v14"/>',
    khien: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    cauHoi: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.3-1.5 2.5M12 17v.5"/>',
    viec: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 12h18"/>',
    don: '<path d="M6 3h12v18H6z"/><path d="M9 13l2 2 4-4"/>',
    sao: '<path d="M12 3l2.7 5.8 6.3.8-4.6 4.3 1.2 6.3L12 17.1l-5.6 3.1 1.2-6.3L3 9.6l6.3-.8z"/>'
  };

  const bieuTuong = (ten) => `<svg viewBox="0 0 24 24" aria-hidden="true">${BIEU_TUONG[ten] || ''}</svg>`;

  function avatar(ten) {
    const tu = String(ten || '?').trim().split(/\s+/);
    const chu = tu.length > 1 ? tu[tu.length - 2][0] + tu[tu.length - 1][0] : tu[0].slice(0, 2);
    return `<span class="avatar" aria-hidden="true">${esc(chu.toUpperCase())}</span>`;
  }

  /* Định dạng nội dung tài liệu. Thoát HTML trước rồi mới thêm thẻ, nên chữ người nhập không thành mã chạy được. */
  const inLine = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  function vanBan(md) {
    const dong = esc(md).split('\n');
    const ra = [];
    for (let i = 0; i < dong.length; i++) {
      const d = dong[i].trim();
      if (!d) continue;
      if (d.startsWith('### ')) ra.push(`<h4>${inLine(d.slice(4))}</h4>`);
      else if (d.startsWith('## ')) ra.push(`<h3>${inLine(d.slice(3))}</h3>`);
      else if (d.startsWith('&gt; ')) ra.push(`<p class="luu-y">${inLine(d.slice(5))}</p>`);
      else if (d.startsWith('|')) {
        const hang = [];
        for (; i < dong.length && dong[i].trim().startsWith('|'); i++) hang.push(dong[i].trim());
        i -= 1;
        const o = (h) => h.replace(/^\||\|$/g, '').split('|').map((x) => inLine(x.trim()));
        const than = hang.slice(2).map((h) => `<tr>${o(h).map((x) => `<td>${x}</td>`).join('')}</tr>`).join('');
        ra.push(`<div class="cuon-ngang"><table class="bang"><thead><tr>${o(hang[0]).map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${than}</tbody></table></div>`);
      } else if (/^(- |\d+\. )/.test(d)) {
        const co = d.startsWith('- ');
        const muc = [];
        for (; i < dong.length && (co ? /^- /.test(dong[i].trim()) : /^\d+\. /.test(dong[i].trim())); i++) muc.push(dong[i].trim().replace(/^(- |\d+\. )/, ''));
        i -= 1;
        const the = co ? 'ul' : 'ol';
        ra.push(`<${the}>${muc.map((x) => `<li>${inLine(x)}</li>`).join('')}</${the}>`);
      } else ra.push(`<p>${inLine(d)}</p>`);
    }
    return ra.join('');
  }

  const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const ngay = (key) => {
    if (!key) return '–';
    const d = L.docNgay(key);
    return `${THU[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };
  const ngayDu = (key) => (key ? key.split('-').reverse().join('/') : '–');
  const gio = (ms) => (ms ? new Date(ms).toTimeString().slice(0, 5) : '–');
  const ngayGio = (ms) => {
    if (!ms) return '–';
    const d = new Date(ms);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${gio(ms)}`;
  };
  const so = (n, thapPhan = 1) => Number(n).toFixed(thapPhan).replace('.', ',');
  const tyLe = (n) => (n === null ? '–' : `${Math.round(n)}%`);

  const TRANG_THAI_TRO_LY = {
    cho_duyet: ['Chờ duyệt', 'vang'],
    cho_xac_nhan: ['Chờ xác nhận', 'vang'],
    thu_viec: ['Thử việc', 'tim'],
    dang_hoat_dong: ['Đang hoạt động', 'luc'],
    tam_nghi: ['Tạm nghỉ', 'xam'],
    da_nghi: ['Đã nghỉ', 'xam'],
    mat_tu_cach: ['Mất tư cách', 'do'],
    da_ra_truong: ['Đã ra trường', 'xam'],
    tu_choi: ['Từ chối', 'do']
  };
  const MUC_NE_NEP = {
    binh_thuong: ['Bình thường', 'luc'],
    nhac_nho: ['Nhắc nhở', 'vang'],
    canh_bao: ['Cảnh báo', 'cam'],
    mat_tu_cach: ['Đề xuất mất tư cách', 'do']
  };
  const TRANG_THAI_CA = {
    da_dang_ky: ['Đã đăng ký', 'tim'],
    huy_truoc: ['Đã hủy', 'xam'],
    huy_muon: ['Hủy muộn', 'vang'],
    vang_phep: ['Vắng có phép', 'xam'],
    vang_khong_bao: ['Vắng không báo', 'do'],
    ptn_huy: ['PTN hủy', 'xam'],
    da_truc: ['Đã trực', 'luc']
  };
  const KET_QUA_BAI = {
    dang_lam: ['Đang làm', 'tim'],
    cho_cham: ['Chờ chấm tự luận', 'vang'],
    dat: ['Đạt', 'luc'],
    khong_dat: ['Chưa đạt', 'do']
  };
  const LOAI_NE_NEP = { loi_nhe: 'Lỗi nhẹ', loi_nang: 'Lỗi nặng', an_toan: 'Vi phạm an toàn', diem_tot: 'Điểm tốt' };

  const nhan = (bang, khoa) => {
    const [ten, mau] = bang[khoa] || [khoa, 'xam'];
    return `<span class="nhan nhan-${mau}">${esc(ten)}</span>`;
  };

  function thongBao(noiDung, loai = 'ok') {
    const vung = document.getElementById('vung-thong-bao');
    const el = document.createElement('div');
    el.className = `toast toast-${loai}`;
    el.setAttribute('role', 'status');
    el.textContent = noiDung;
    vung.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }

  function moHop(tieuDe, noiDungHtml, { rong = false } = {}) {
    const hop = document.getElementById('hop-thoai');
    hop.className = rong ? 'hop-rong' : '';
    hop.innerHTML = `
      <div class="hop-dau">
        <h2>${esc(tieuDe)}</h2>
        <button type="button" class="nut-icon" data-act="dong-hop" aria-label="Đóng">×</button>
      </div>
      <div class="hop-than">${noiDungHtml}</div>`;
    if (!hop.open) hop.showModal();
  }

  function dongHop() {
    const hop = document.getElementById('hop-thoai');
    if (hop.open) hop.close();
  }

  /* Hộp xác nhận trả về Promise<boolean>, thay cho confirm() của trình duyệt. */
  function xacNhan(cauHoi, nhanNut = 'Đồng ý') {
    return new Promise((tra) => {
      const hop = document.getElementById('hop-xac-nhan');
      hop.innerHTML = `
        <p>${esc(cauHoi)}</p>
        <div class="hang-nut canh-phai">
          <button type="button" class="nut nut-phu" value="khong">Quay lại</button>
          <button type="button" class="nut" value="co">${esc(nhanNut)}</button>
        </div>`;
      hop.querySelectorAll('button').forEach((b) =>
        b.addEventListener('click', () => {
          hop.close();
          tra(b.value === 'co');
        })
      );
      hop.addEventListener('cancel', () => tra(false), { once: true });
      hop.showModal();
    });
  }

  window.UI = {
    esc, vanBan, bieuTuong, avatar, ngay, ngayDu, gio, ngayGio, so, tyLe, nhan, thongBao, moHop, dongHop, xacNhan,
    TRANG_THAI_TRO_LY, MUC_NE_NEP, TRANG_THAI_CA, KET_QUA_BAI, LOAI_NE_NEP
  };
})();
