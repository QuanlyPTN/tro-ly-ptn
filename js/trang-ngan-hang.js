/* Ngân hàng câu hỏi: quản lý nhiều file, xem, sửa từng câu (mục 6, 7). */
(function () {
  const L = window.Logic;
  const { esc, ngayGio, moHop, xacNhan, thongBao } = window.UI;
  const MOI_TRANG = 20;
  const laAdmin = () => Store.coQuyen('xoa_ngan_hang');
  const nh = () => (App.ui.nh ||= { bank: null, dangTai: false, loai: 'tn', tim: '', file: '', bo: '', chuDe: '', thieu: false, trang: 0 });

  async function taiBank() {
    const ui = nh();
    if (ui.dangTai) return;
    ui.dangTai = true;
    try {
      ui.bank = await Store.layBank();
    } catch (loi) {
      thongBao(loi.tuMayChu ? loi.message : 'Không tải được ngân hàng câu hỏi.', 'loi');
    }
    ui.dangTai = false;
    if (App.ui.trang === 'ngan-hang') App.render();
  }

  function dsLoc() {
    const ui = nh();
    const tim = ui.tim.trim().toLowerCase();
    const ds = ui.loai === 'tn' ? ui.bank.cauHoi : ui.bank.tuLuan;
    return ds.filter((q) =>
      (!ui.file || q.fileId === ui.file) && (!ui.bo || q.bo === ui.bo) && (!ui.chuDe || q.chuDe === ui.chuDe) &&
      (!ui.thieu || !q.giaiThich) &&
      (!tim || `${q.ma} ${q.cauHoi || q.tinhHuong}`.toLowerCase().includes(tim)));
  }

  const opt = (ds, chon) => ds.map(([v, n]) => `<option value="${esc(v)}"${String(chon) === String(v) ? ' selected' : ''}>${esc(n)}</option>`).join('');

  function theFile(ui) {
    const tk = L.thongKeNganHang(ui.bank);
    const canhBao = L.canhBaoDuDe(ui.bank, Store.state.dotKiemTra);
    return `
      <section class="the">
        <h2>File câu hỏi đã nạp</h2>
        ${canhBao.length ? `<p class="loi">${esc(canhBao.join(' '))}</p>` : ''}
        ${tk.files.length ? `<ul class="ds-gon">${tk.files.map((f) => `
          <li><span><strong>${esc(f.ten)}</strong><small>${f.soTN} trắc nghiệm, ${f.soTL} tự luận · ${ngayGio(f.luc)} · ${esc(f.nguoi)}</small></span>
          ${laAdmin() ? `<button type="button" class="nut nut-phu nut-nho" data-act="xoa-file-ngan-hang" data-id="${esc(f.id)}">Xóa file</button>` : ''}</li>`).join('')}</ul>` : '<p class="phu">Chưa nạp file nào.</p>'}
        <label class="nut nut-phu nut-tep">Nạp thêm file Excel
          <input type="file" accept=".xlsx" multiple data-doi="nap-ngan-hang" />
        </label>
        <p class="phu">Chọn được nhiều file. Mẫu file theo mục 7.1, có sheet "Trắc nghiệm" và "Tự luận". Bài đã phát đề giữ nguyên đề cũ.</p>
        <div class="luoi-chi-so">
          <div class="chi-so"><span>Bộ Tuyển</span><strong>${tk.tuyen}</strong></div>
          <div class="chi-so"><span>Bộ Thử việc</span><strong>${tk.thuViec}</strong></div>
          <div class="chi-so"><span>Tự luận</span><strong>${tk.tuLuan}</strong></div>
          <div class="chi-so"><span>Chưa có giải thích</span><strong>${tk.thieuGiaiThich}</strong></div>
        </div>
      </section>`;
  }

  function theDanhSach(ui) {
    const ds = dsLoc();
    const soTrang = Math.max(1, Math.ceil(ds.length / MOI_TRANG));
    ui.trang = Math.min(ui.trang, soTrang - 1);
    const phan = ds.slice(ui.trang * MOI_TRANG, (ui.trang + 1) * MOI_TRANG);
    const chuDe = [...new Set((ui.loai === 'tn' ? ui.bank.cauHoi : ui.bank.tuLuan).map((q) => q.chuDe))];
    const tn = ui.loai === 'tn';
    return `
      <section class="the">
        <div class="hang-dau">
          <div class="chon-vai chon-loai">
            <button type="button" class="${tn ? 'dang-chon' : ''}" data-act="doi-loai-cau" data-loai="tn">Trắc nghiệm</button>
            <button type="button" class="${tn ? '' : 'dang-chon'}" data-act="doi-loai-cau" data-loai="tl">Tự luận</button>
          </div>
          <button type="button" class="nut nut-nho" data-act="sua-cau" data-ma="">Thêm câu</button>
        </div>
        <div class="bo-loc">
          <input type="search" placeholder="Tìm mã hoặc nội dung" aria-label="Tìm mã hoặc nội dung" value="${esc(ui.tim)}" data-doi="loc-cau" data-loc="tim" />
          <select data-doi="loc-cau" data-loc="file" aria-label="File"><option value="">Mọi file</option>${opt(ui.bank.files.map((f) => [f.id, f.ten]), ui.file)}</select>
          <select data-doi="loc-cau" data-loc="bo" aria-label="Bộ"><option value="">Mọi bộ</option>${opt([['Tuyển', 'Tuyển'], ['Thử việc', 'Thử việc']], ui.bo)}</select>
          <select data-doi="loc-cau" data-loc="chuDe" aria-label="Chủ đề"><option value="">Mọi chủ đề</option>${opt(chuDe.map((c) => [c, c]), ui.chuDe)}</select>
        </div>
        ${tn ? `<label class="o-chon"><input type="checkbox" data-doi="loc-thieu"${ui.thieu ? ' checked' : ''} /><span>Chỉ câu chưa có giải thích</span></label>` : ''}
        <p class="phu">${ds.length} câu</p>
        <ul class="ds-cau">${phan.map((q) => `
          <li>
            <button type="button" class="dong-cau" data-act="sua-cau" data-ma="${esc(q.ma)}">
              <small>${esc(q.ma)} · ${esc(q.bo)} · ${esc(q.chuDe)}${tn && !q.giaiThich ? ' · chưa có giải thích' : ''}</small>
              <span>${esc(q.cauHoi || q.tinhHuong)}</span>
              ${tn ? `<span class="dap-an">${esc(q.dapAn)}. ${esc(q[q.dapAn])}</span>` : ''}
            </button>
          </li>`).join('') || '<li class="phu">Không có câu phù hợp.</li>'}</ul>
        ${soTrang > 1 ? `<div class="hang-nut canh-phai">
          <button type="button" class="nut nut-phu nut-nho" data-act="trang-cau" data-buoc="-1"${ui.trang === 0 ? ' disabled' : ''}>Trước</button>
          <span class="phu">Trang ${ui.trang + 1}/${soTrang}</span>
          <button type="button" class="nut nut-phu nut-nho" data-act="trang-cau" data-buoc="1"${ui.trang >= soTrang - 1 ? ' disabled' : ''}>Sau</button>
        </div>` : ''}
      </section>`;
  }

  App.trang['ngan-hang'] = {
    ten: 'Ngân hàng câu hỏi',
    icon: 'cauHoi',
    render() {
      const ui = nh();
      if (!ui.bank) {
        taiBank();
        return '<p class="phu">Đang tải ngân hàng câu hỏi…</p>';
      }
      return theFile(ui) + theDanhSach(ui);
    }
  };

  const veLai = () => {
    const y = window.scrollY;
    App.render();
    window.scrollTo(0, y);
  };
  App.act['doi-loai-cau'] = (el) => {
    Object.assign(nh(), { loai: el.dataset.loai, trang: 0, chuDe: '', thieu: false });
    veLai();
  };
  App.doi['loc-cau'] = (el) => {
    Object.assign(nh(), { [el.dataset.loc]: el.value, trang: 0 });
    veLai();
  };
  App.doi['loc-thieu'] = (el) => {
    Object.assign(nh(), { thieu: el.checked, trang: 0 });
    veLai();
  };
  App.act['trang-cau'] = (el) => {
    nh().trang += Number(el.dataset.buoc);
    veLai();
  };

  App.doi['nap-ngan-hang'] = async (el) => {
    const tep = [...el.files];
    el.value = '';
    for (const f of tep) if (!(await napMotFile(f))) break;
  };

  async function napMotFile(tep) {
    const ui = nh();
    let kq;
    try {
      const sach = XLSX.read(await tep.arrayBuffer());
      const doc = (ten) => (sach.Sheets[ten] ? XLSX.utils.sheet_to_json(sach.Sheets[ten], { defval: '' }) : []);
      kq = L.docNganHang(doc('Trắc nghiệm'), doc('Tự luận'));
    } catch {
      thongBao(`Không đọc được file ${tep.name}.`, 'loi');
      return false;
    }
    if (kq.loi.length) {
      moHop(`Chưa nạp được ${tep.name}`, `
        <p class="phu">Có ${kq.loi.length} lỗi, ngân hàng hiện tại vẫn giữ nguyên.</p>
        <ul class="ds-loi">${kq.loi.slice(0, 20).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`);
      return false;
    }
    const cu = ui.bank?.files.find((f) => f.ten === tep.name);
    const hoi = cu
      ? `Đã có file "${tep.name}". Thay bằng bản mới (${kq.cauHoi.length} trắc nghiệm, ${kq.tuLuan.length} tự luận)? Câu đã sửa trên web trong file này sẽ bị ghi đè.`
      : `Nạp thêm "${tep.name}": ${kq.cauHoi.length} trắc nghiệm, ${kq.tuLuan.length} tự luận?`;
    if (!(await xacNhan(hoi, cu ? 'Thay file' : 'Nạp thêm'))) return false;
    try {
      const { bank, soDoiMa } = await Store.napBank(tep.name, kq, cu?.id || null);
      ui.bank = bank;
      App.xong(soDoiMa ? `Đã nạp. ${soDoiMa} câu trùng mã với file khác được tự đổi mã.` : 'Đã nạp file câu hỏi.');
      return true;
    } catch (loi) {
      thongBao(loi.tuMayChu ? loi.message : 'Không gửi được lên máy chủ, ngân hàng chưa đổi.', 'loi');
      return false;
    }
  }

  App.act['xoa-file-ngan-hang'] = async (el) => {
    const ui = nh();
    const f = ui.bank.files.find((x) => x.id === el.dataset.id);
    const conLai = L.xoaFileNganHang(ui.bank, f.id);
    const canhBao = L.canhBaoDuDe(conLai, Store.state.dotKiemTra);
    const them = canhBao.length ? ` Sau khi xóa sẽ không đủ câu: ${canhBao.join(' ')}` : '';
    if (!(await xacNhan(`Xóa file "${f.ten}" và toàn bộ câu trong file? Bài đã làm không bị ảnh hưởng.${them}`, 'Xóa file'))) return;
    try {
      ui.bank = await Store.xoaFileBank(f.id);
      App.xong('Đã xóa file.');
    } catch (loi) {
      thongBao(loi.tuMayChu ? loi.message : 'Không kết nối được máy chủ.', 'loi');
    }
  };

  App.act['sua-cau'] = (el) => {
    const ui = nh();
    const tn = ui.loai === 'tn';
    const q = (tn ? ui.bank.cauHoi : ui.bank.tuLuan).find((x) => x.ma === el.dataset.ma);
    const v = q || { ma: '', bo: 'Tuyển', chuDe: '', maQR: 'Chung', mucDo: 'Biết', nhomY: '', cauHoi: '', A: '', B: '', C: '', D: '', dapAn: 'A', giaiThich: '', nguon: '', tinhHuong: '', yChinh: [], diemToiDa: 10, phutGoiY: 5 };
    const chung = `
      <div class="luoi-form cot-3">
        <label>Mã câu <input name="ma" value="${esc(v.ma)}" required /></label>
        <label>Bộ <select name="bo">${opt([['Tuyển', 'Tuyển'], ['Thử việc', 'Thử việc']], v.bo)}</select></label>
        <label>Mã QR <input name="maQR" value="${esc(v.maQR)}" /></label>
      </div>
      <label>Chủ đề <input name="chuDe" value="${esc(v.chuDe)}" required /></label>`;
    const phanTN = `
      <div class="luoi-form"><label>Mức độ <select name="mucDo">${opt(['Biết', 'Hiểu', 'Vận dụng'].map((x) => [x, x]), v.mucDo)}</select></label>
      <label>Nhóm ý <input name="nhomY" value="${esc(v.nhomY)}" required /></label></div>
      <label>Câu hỏi <textarea name="cauHoi" rows="3" required>${esc(v.cauHoi)}</textarea></label>
      ${['A', 'B', 'C', 'D'].map((k) => `<label>Phương án ${k} <input name="${k}" value="${esc(v[k])}" required /></label>`).join('')}
      <label>Đáp án đúng <select name="dapAn">${opt(['A', 'B', 'C', 'D'].map((x) => [x, x]), v.dapAn)}</select></label>
      <label>Giải thích <textarea name="giaiThich" rows="3">${esc(v.giaiThich)}</textarea></label>`;
    const phanTL = `
      <label>Tình huống <textarea name="tinhHuong" rows="4" required>${esc(v.tinhHuong)}</textarea></label>
      <label>Ý chính cần có (mỗi dòng một ý) <textarea name="yChinh" rows="6" required>${esc((v.yChinh || []).join('\n'))}</textarea></label>
      <div class="luoi-form"><label>Điểm tối đa <input type="number" name="diemToiDa" min="1" value="${v.diemToiDa}" required /></label>
      <label>Thời gian gợi ý (phút) <input type="number" name="phutGoiY" min="0" value="${v.phutGoiY}" /></label></div>`;
    moHop(q ? `Sửa câu ${q.ma}` : 'Thêm câu mới', `
      <form data-form="luu-cau" data-ma="${esc(q?.ma || '')}">
        ${chung}${tn ? phanTN : phanTL}
        <label>Nguồn <input name="nguon" value="${esc(v.nguon)}" /></label>
        <p id="loi-cau" class="loi" role="alert" hidden></p>
        <div class="hang-nut canh-phai">
          ${q && laAdmin() ? `<button type="button" class="nut nut-phu" data-act="xoa-cau" data-ma="${esc(q.ma)}">Xóa câu</button>` : ''}
          <button class="nut">Lưu</button>
        </div>
      </form>`, { rong: true });
  };

  App.form['luu-cau'] = async (f, el) => {
    const ui = nh();
    const tn = ui.loai === 'tn';
    const maCu = el.dataset.ma || null;
    const sach = Object.fromEntries(Object.entries(f).map(([k, x]) => [k, x.trim()]));
    const cau = tn ? sach : {
      ma: sach.ma, bo: sach.bo, chuDe: sach.chuDe, maQR: sach.maQR, tinhHuong: sach.tinhHuong, nguon: sach.nguon,
      yChinh: sach.yChinh.split('\n').map((x) => x.trim()).filter(Boolean), diemToiDa: Number(sach.diemToiDa), phutGoiY: Number(sach.phutGoiY) || 0
    };
    const baoLoi = (noiDung) => {
      const p = document.getElementById('loi-cau');
      p.hidden = false;
      p.textContent = noiDung;
    };
    const loi = (tn ? L.kiemTraCauHoi : L.kiemTraTuLuan)(cau, ui.bank, maCu);
    if (loi.length) return baoLoi(loi[0]);
    try {
      ui.bank = await Store.luuCau(ui.loai, cau, maCu);
      App.xong('Đã lưu câu hỏi.');
    } catch (e) {
      baoLoi(e.tuMayChu ? e.message : 'Không kết nối được máy chủ.');
    }
  };

  App.act['xoa-cau'] = async (el) => {
    const ui = nh();
    if (!(await xacNhan(`Xóa câu ${el.dataset.ma}?`, 'Xóa câu'))) return;
    try {
      ui.bank = await Store.xoaCau(ui.loai, el.dataset.ma);
      App.xong('Đã xóa câu.');
    } catch (e) {
      thongBao(e.tuMayChu ? e.message : 'Không kết nối được máy chủ.', 'loi');
    }
  };
})();
