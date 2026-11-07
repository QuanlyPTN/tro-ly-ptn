/* Đơn từ: xin vắng, đổi ca, chuyển máy, PTN hủy ca hàng loạt; trang Duyệt đơn của quản lý (mục 3.2, 2, 8). */
(function () {
  const L = window.Logic;
  const { esc, ngay, ngayGio, nhan, xacNhan, thongBao } = window.UI;
  const toi = () => Store.troLy(Store.phien.mssv);
  const tenSV = (mssv) => Store.troLy(mssv)?.hoTen || mssv;
  const caCua = (id) => Store.state.caTruc.find((c) => c.id === id);
  const moTaCa = (c) => `${ngay(c.ngay)}, ${c.tu}–${c.den}`;
  const TRANG_THAI_DON = { cho_duyet: ['Chờ duyệt', 'vang'], da_duyet: ['Đã duyệt', 'luc'], tu_choi: ['Từ chối', 'do'], da_huy: ['Đã hủy', 'xam'], cho_nhan: ['Chờ người nhận', 'tim'] };

  /* Ca bị hủy hoặc chuyển trạng thái thì các đơn đang chờ của ca đó không còn hiệu lực. */
  App.dongDonCuaCa = (caId) => {
    const st = Store.state;
    st.donVang.filter((d) => d.caTrucId === caId && d.trangThai === 'cho_duyet').forEach((d) => (d.trangThai = 'da_huy'));
    st.doiCa.filter((d) => d.caTrucId === caId && ['cho_nhan', 'cho_duyet'].includes(d.trangThai)).forEach((d) => (d.trangThai = 'da_huy'));
  };

  /* ---------- Xin vắng ---------- */
  App.trang['xin-vang'] = {
    ten: 'Xin vắng',
    icon: 'don',
    render() {
      const t = toi();
      const st = Store.state;
      const coDon = new Set(st.donVang.filter((d) => d.trangThai === 'cho_duyet').map((d) => d.caTrucId));
      const coLuot = new Set(st.luotTruc.map((l) => l.caTrucId));
      const caChon = st.caTruc
        .filter((c) => c.mssv === t.mssv && c.trangThai === 'da_dang_ky' && !coDon.has(c.id) && !coLuot.has(c.id))
        .sort((a, b) => L.mocGio(a.ngay, a.tu) - L.mocGio(b.ngay, b.tu));
      const don = st.donVang.filter((d) => d.mssv === t.mssv).slice().reverse();
      return `
        <section class="the">
          <h2>Gửi đơn xin vắng</h2>
          <p class="phu">Ốm, thi hoặc có minh chứng. Được duyệt thì ca không vào mẫu số.</p>
          ${caChon.length ? `<form data-form="xin-vang">
            <label>Ca <select name="caTrucId" required>${caChon.map((c) => `<option value="${esc(c.id)}">${moTaCa(c)}</option>`).join('')}</select></label>
            <label>Lý do <textarea name="lyDo" rows="3" required></textarea></label>
            <label>Minh chứng <input name="minhChung" placeholder="Mô tả hoặc đường dẫn" required /></label>
            <div class="hang-nut"><button class="nut">Gửi đơn</button></div>
          </form>` : '<p class="phu">Bạn không có ca nào để xin vắng.</p>'}
        </section>
        <section class="the">
          <h2>Đơn của tôi</h2>
          ${don.length ? `<ul class="ds-gon">${don.map((d) => `
            <li><span><strong>${moTaCa(caCua(d.caTrucId))}</strong><br />${esc(d.lyDo)}${d.lyDoTuChoi ? `<small>PTN: ${esc(d.lyDoTuChoi)}</small>` : ''}</span>${nhan(TRANG_THAI_DON, d.trangThai)}</li>`).join('')}</ul>` : '<p class="phu">Chưa có đơn nào.</p>'}
        </section>`;
    }
  };

  App.form['xin-vang'] = (f) => {
    Store.state.donVang.push({ id: Store.id('dv'), mssv: toi().mssv, caTrucId: f.caTrucId, lyDo: f.lyDo.trim(), minhChung: f.minhChung.trim(), trangThai: 'cho_duyet', nguoiDuyet: null });
    App.xong('Đã gửi đơn xin vắng.');
  };

  /* ---------- Đổi ca (hiện trong trang Lịch trực) ---------- */
  const doiCaDangMo = (caId) => Store.state.doiCa.find((d) => d.caTrucId === caId && ['cho_nhan', 'cho_duyet'].includes(d.trangThai));

  App.nutDoiCa = (ca) => {
    const dc = doiCaDangMo(ca.id);
    if (!dc) return `<button type="button" class="nut nut-phu nut-nho" data-act="nho-doi-ca" data-id="${esc(ca.id)}">Nhờ đổi ca</button>`;
    return `${nhan(TRANG_THAI_DON, dc.trangThai)}<button type="button" class="nut-chu" data-act="rut-doi-ca" data-id="${esc(dc.id)}">Rút</button>`;
  };

  App.theCaCanNguoiNhan = (t) => {
    const ds = Store.state.doiCa.filter((d) => d.trangThai === 'cho_nhan' && d.tuMssv !== t.mssv && L.mocGio(caCua(d.caTrucId).ngay, caCua(d.caTrucId).tu) > Store.now());
    if (!ds.length) return '';
    return `
      <section class="the">
        <h2>Ca cần người nhận</h2>
        <p class="phu">Nhận xong và được xác nhận, ca thuộc về bạn. Không đến sẽ tính bạn bỏ ca.</p>
        <ul class="ds-gon">${ds.map((d) => `
          <li><span><strong>${moTaCa(caCua(d.caTrucId))}</strong> · ${esc(tenSV(d.tuMssv))}</span>
          <button type="button" class="nut nut-nho" data-act="nhan-ca" data-id="${esc(d.id)}">Nhận ca</button></li>`).join('')}</ul>
      </section>`;
  };

  App.act['nho-doi-ca'] = (el) => {
    const ca = caCua(el.dataset.id);
    Store.state.doiCa.push({ id: Store.id('dc'), caTrucId: ca.id, tuMssv: ca.mssv, nhanMssv: null, trangThai: 'cho_nhan', luc: Store.now() });
    const ban = Store.state.troLy.filter((x) => x.mssv !== ca.mssv && ['thu_viec', 'dang_hoat_dong'].includes(x.trangThai)).map((x) => x.mssv);
    Store.guiThongBao({ tieuDe: 'Có ca cần người nhận', noiDung: `${moTaCa(ca)}. Xem ở Đăng ký lịch trực.`, nguoiNhan: ban });
    App.xong('Đã đăng ca cần người nhận. Bạn vẫn giữ ca đến khi quản lý xác nhận.');
  };

  App.act['rut-doi-ca'] = (el) => {
    Store.state.doiCa.find((d) => d.id === el.dataset.id).trangThai = 'da_huy';
    App.xong('Đã rút đề nghị đổi ca.');
  };

  App.act['nhan-ca'] = async (el) => {
    const dc = Store.state.doiCa.find((d) => d.id === el.dataset.id);
    const t = toi();
    const kq = L.kiemTraNhanCa(caCua(dc.caTrucId), t.mssv, Store.state, Store.now());
    if (!kq.ok) return thongBao(kq.loi[0], 'loi');
    if (kq.canhBao.length && !(await xacNhan(`${kq.canhBao.join(' ')} Vẫn nhận ca?`, 'Vẫn nhận'))) return;
    Object.assign(dc, { nhanMssv: t.mssv, trangThai: 'cho_duyet' });
    App.xong('Đã nhận ca, chờ quản lý xác nhận.');
  };

  /* ---------- Chuyển máy ---------- */
  App.act['gui-chuyen-may'] = (el) => {
    const mssv = el.dataset.mssv;
    Store.state.deNghi.push({ id: Store.id('dn'), mssv, loai: 'chuyen_may', maMayMoi: Store.maMay(), trangThai: 'cho_duyet', nguoiDuyet: null, luc: Store.now() });
    Store.luu();
    el.parentElement.textContent = 'Đã gửi đề nghị chuyển máy, đang chờ PTN duyệt. Duyệt xong, nhập lại MSSV để dùng tiếp.';
  };

  /* ---------- Duyệt đơn ---------- */
  const donCho = () => {
    const st = Store.state;
    return {
      vang: st.donVang.filter((d) => d.trangThai === 'cho_duyet'),
      doiCa: st.doiCa.filter((d) => d.trangThai === 'cho_duyet'),
      deNghi: st.deNghi.filter((d) => d.trangThai === 'cho_duyet')
    };
  };

  App.trang['duyet-don'] = {
    ten: 'Duyệt đơn',
    icon: 'don',
    dem() {
      const d = donCho();
      return d.vang.length + d.doiCa.length + d.deNghi.length;
    },
    render() {
      const { vang, doiCa, deNghi } = donCho();
      const hn = L.ngayKey(new Date(Store.now()));
      const nut = (act, id, ten, kieu = 'nut-phu') => `<button type="button" class="nut ${kieu} nut-nho" data-act="${act}" data-id="${esc(id)}">${ten}</button>`;
      return `
        <section class="the">
          <h2>Xin vắng (${vang.length})</h2>
          ${vang.length ? `<ul class="ds-gon">${vang.map((d) => `
            <li><span><strong>${esc(tenSV(d.mssv))}</strong> · ${moTaCa(caCua(d.caTrucId))}<br />${esc(d.lyDo)}<small>Minh chứng: ${esc(d.minhChung)}</small></span>
            <span class="hang-nut">${nut('duyet-vang', d.id, 'Duyệt', 'nut-xanh')}${nut('tu-choi-vang', d.id, 'Từ chối')}</span></li>`).join('')}</ul>` : '<p class="phu">Không có đơn chờ duyệt.</p>'}
        </section>
        <section class="the">
          <h2>Đổi ca (${doiCa.length})</h2>
          ${doiCa.length ? `<ul class="ds-gon">${doiCa.map((d) => `
            <li><span><strong>${moTaCa(caCua(d.caTrucId))}</strong><br />${esc(tenSV(d.tuMssv))} → ${esc(tenSV(d.nhanMssv))}</span>
            <span class="hang-nut">${nut('duyet-doi-ca', d.id, 'Xác nhận', 'nut-xanh')}${nut('tu-choi-doi-ca', d.id, 'Từ chối')}</span></li>`).join('')}</ul>` : '<p class="phu">Không có đề nghị đổi ca.</p>'}
        </section>
        <section class="the">
          <h2>Chuyển máy (${deNghi.length})</h2>
          ${deNghi.length ? `<ul class="ds-gon">${deNghi.map((d) => `
            <li><span><strong>${esc(tenSV(d.mssv))}</strong> · ${esc(d.mssv)}<br />${esc(Store.troLy(d.mssv)?.maMay)} → ${esc(d.maMayMoi)}<small>${ngayGio(d.luc)}</small></span>
            <span class="hang-nut">${nut('duyet-chuyen-may', d.id, 'Duyệt', 'nut-xanh')}${nut('tu-choi-chuyen-may', d.id, 'Từ chối')}</span></li>`).join('')}</ul>` : '<p class="phu">Không có đề nghị chuyển máy.</p>'}
        </section>
        <section class="the">
          <h2>PTN đóng cửa, lễ, sự cố</h2>
          <p class="phu">Hủy hàng loạt các ca đã đăng ký trong ngày, không tính cho ai.</p>
          <form data-form="ptn-huy" class="luoi-form cot-3">
            <label>Ngày <input type="date" name="ngay" min="${hn}" required /></label>
            <label>Buổi <select name="buoi"><option value="">Cả ngày</option>${Store.state.caiDat.buoi.map((b, i) => `<option value="${i}">${esc(b.ten)}</option>`).join('')}</select></label>
            <label>Lý do <input name="lyDo" required /></label>
            <div class="hang-nut rong-het"><button class="nut nut-phu">Hủy các ca</button></div>
          </form>
        </section>`;
    }
  };

  const nguoiDuyet = () => Store.nguoiDung().id;

  App.act['duyet-vang'] = (el) => {
    const d = Store.state.donVang.find((x) => x.id === el.dataset.id);
    const ca = caCua(d.caTrucId);
    Object.assign(d, { trangThai: 'da_duyet', nguoiDuyet: nguoiDuyet() });
    ca.trangThai = 'vang_phep';
    App.dongDonCuaCa(ca.id);
    Store.ghiNhatKy('Duyệt xin vắng', d.mssv, `${ca.ngay} ${ca.tu}–${ca.den}`);
    Store.guiThongBao({ tieuDe: 'Đơn xin vắng được duyệt', noiDung: moTaCa(ca), nguoiNhan: [d.mssv] });
    App.xong('Đã duyệt đơn.');
  };

  App.act['tu-choi-vang'] = (el) => {
    const d = Store.state.donVang.find((x) => x.id === el.dataset.id);
    App.hoiLyDo('Từ chối đơn xin vắng', tenSV(d.mssv), (lyDo) => {
      Object.assign(d, { trangThai: 'tu_choi', nguoiDuyet: nguoiDuyet(), lyDoTuChoi: lyDo });
      Store.ghiNhatKy('Từ chối xin vắng', d.mssv, lyDo);
      Store.guiThongBao({ tieuDe: 'Đơn xin vắng bị từ chối', noiDung: lyDo, nguoiNhan: [d.mssv] });
      App.xong('Đã từ chối đơn.');
    });
  };

  App.act['duyet-doi-ca'] = (el) => {
    const d = Store.state.doiCa.find((x) => x.id === el.dataset.id);
    const ca = caCua(d.caTrucId);
    const kq = L.kiemTraNhanCa(ca, d.nhanMssv, Store.state, Store.now());
    if (!kq.ok) return thongBao(kq.loi[0], 'loi');
    Object.assign(ca, { mssv: d.nhanMssv, doiChoMssv: d.tuMssv });
    Object.assign(d, { trangThai: 'da_duyet', nguoiDuyet: nguoiDuyet() });
    Store.ghiNhatKy('Xác nhận đổi ca', ca.mssv, `${ca.ngay} ${ca.tu}–${ca.den}, nhận từ ${d.tuMssv}`);
    Store.guiThongBao({ tieuDe: 'Đổi ca đã được xác nhận', noiDung: `${moTaCa(ca)} thuộc ${tenSV(d.nhanMssv)}.`, nguoiNhan: [d.tuMssv, d.nhanMssv] });
    App.xong('Đã xác nhận đổi ca.');
  };

  App.act['tu-choi-doi-ca'] = (el) => {
    const d = Store.state.doiCa.find((x) => x.id === el.dataset.id);
    App.hoiLyDo('Từ chối đổi ca', `${tenSV(d.tuMssv)} vẫn giữ ca này.`, (lyDo) => {
      Object.assign(d, { trangThai: 'tu_choi', nguoiDuyet: nguoiDuyet() });
      Store.ghiNhatKy('Từ chối đổi ca', d.tuMssv, lyDo);
      Store.guiThongBao({ tieuDe: 'Đổi ca bị từ chối', noiDung: lyDo, nguoiNhan: [d.tuMssv, d.nhanMssv] });
      App.xong('Đã từ chối.');
    });
  };

  App.act['duyet-chuyen-may'] = (el) => {
    const d = Store.state.deNghi.find((x) => x.id === el.dataset.id);
    const t = Store.troLy(d.mssv);
    const cu = t.maMay;
    t.maMay = d.maMayMoi;
    Object.assign(d, { trangThai: 'da_duyet', nguoiDuyet: nguoiDuyet() });
    Store.ghiNhatKy('Duyệt chuyển máy', d.mssv, `${cu} → ${d.maMayMoi}`);
    Store.guiThongBao({ tieuDe: 'Đã chuyển sang máy mới', noiDung: 'Máy cũ hết hiệu lực.', nguoiNhan: [d.mssv] });
    App.xong('Đã duyệt chuyển máy.');
  };

  App.act['tu-choi-chuyen-may'] = (el) => {
    const d = Store.state.deNghi.find((x) => x.id === el.dataset.id);
    App.hoiLyDo('Từ chối chuyển máy', tenSV(d.mssv), (lyDo) => {
      Object.assign(d, { trangThai: 'tu_choi', nguoiDuyet: nguoiDuyet() });
      Store.ghiNhatKy('Từ chối chuyển máy', d.mssv, lyDo);
      App.xong('Đã từ chối.');
    });
  };

  App.form['ptn-huy'] = async (f) => {
    const st = Store.state;
    const buoi = f.buoi === '' ? null : st.caiDat.buoi[Number(f.buoi)];
    const coLuot = new Set(st.luotTruc.map((l) => l.caTrucId));
    const ds = st.caTruc.filter((c) => c.ngay === f.ngay && c.trangThai === 'da_dang_ky' && !coLuot.has(c.id) && (!buoi || (L.phut(c.tu) < L.phut(buoi.den) && L.phut(c.den) > L.phut(buoi.tu))));
    if (!ds.length) return thongBao('Không có ca nào để hủy.', 'loi');
    if (!(await xacNhan(`Hủy ${ds.length} ca ngày ${ngay(f.ngay)}? Các ca này không tính cho ai.`, 'Hủy các ca'))) return;
    ds.forEach((c) => {
      c.trangThai = 'ptn_huy';
      App.dongDonCuaCa(c.id);
    });
    Store.ghiNhatKy('PTN hủy ca hàng loạt', f.ngay, `${ds.length} ca: ${f.lyDo.trim()}`);
    Store.guiThongBao({ tieuDe: `PTN hủy ca ngày ${ngay(f.ngay)}`, noiDung: f.lyDo.trim(), nguoiNhan: [...new Set(ds.map((c) => c.mssv))] });
    App.xong(`Đã hủy ${ds.length} ca.`);
  };
})();
