/* Tập huấn: ôn luyện, bài kiểm tra có đồng hồ tự khóa, chấm tự luận, nạp ngân hàng (mục 6, 7). */
(function () {
  const L = window.Logic;
  const { esc, ngayGio, nhan, xacNhan, moHop, thongBao } = window.UI;
  const toi = () => Store.troLy(Store.phien.mssv);
  const dotCua = (id) => Store.state.dotKiemTra.find((d) => d.id === id);
  const baiDangLam = (mssv) => Store.state.baiLam.find((b) => b.mssv === mssv && b.ketQua === 'dang_lam') || null;

  /* Khóa mọi bài quá hạn, kể cả khi người làm đã đóng app rồi mở lại sau. */
  async function khoaBaiHetGio() {
    const now = Store.now();
    const qua = Store.state.baiLam.filter((b) => b.ketQua === 'dang_lam' && now >= b.hetHan);
    // Bản thật: quản lý không khóa hộ, máy chủ tự khóa bài của mọi người.
    if (Store.tuXa && Store.phien.vaiTro !== 'tro_ly') return [];
    const daNop = [];
    for (const b of qua) if (await Store.nopBai(b, true)) daNop.push(b);
    return daNop;
  }

  const dinhDangDem = (ms) => {
    const giay = Math.max(0, Math.ceil(ms / 1000));
    const hai = (n) => String(n).padStart(2, '0');
    return `${hai(Math.floor(giay / 60))}:${hai(giay % 60)}`;
  };

  App.batDauDem = () => {
    const daCanhBao = new Set();
    const nhip = async () => {
      const qua = await khoaBaiHetGio();
      if (qua.length) {
        if (!Store.tuXa) Store.luu();
        const cuaToi = qua.some((b) => b.mssv === Store.phien.mssv);
        App.render();
        if (cuaToi) thongBao('Hết giờ. Bài đã tự nộp và khóa.', 'loi');
      }
      const bai = Store.phien.vaiTro === 'tro_ly' ? baiDangLam(Store.phien.mssv) : null;
      const dongHo = document.querySelector('[data-dong-ho]');
      if (!bai || !dongHo) return;
      const con = bai.hetHan - Store.now();
      dongHo.textContent = dinhDangDem(con);
      const sapHet = con <= 5 * L.PHUT;
      dongHo.closest('.thanh-bai').classList.toggle('sap-het', sapHet);
      if (sapHet && !daCanhBao.has(bai.id)) {
        daCanhBao.add(bai.id);
        thongBao('Còn 5 phút. Hết giờ bài sẽ tự nộp.', 'loi');
      }
    };
    nhip();
    setInterval(nhip, 1000);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden || Store.phien.vaiTro !== 'tro_ly') return;
      const bai = baiDangLam(Store.phien.mssv);
      if (bai) {
        bai.roiManHinh += 1;
        Store.luuBaiTam(bai);
      }
    });

    // Lưu tự luận theo từng ký tự: hết giờ giữa lúc gõ vẫn giữ được phần đã viết.
    document.addEventListener('input', (e) => {
      const el = e.target.closest('[data-tu-luan]');
      if (!el) return;
      const bai = baiDangLam(Store.phien.mssv);
      if (!bai || Store.now() >= bai.hetHan) return;
      bai.de.tuLuan[Number(el.dataset.tuLuan)].traLoi = el.value;
      Store.luuBaiTam(bai);
    });
  };

  /* ---------- Trang của trợ lý ---------- */
  function trangLamBai(bai) {
    const dot = dotCua(bai.dotId);
    if (Store.now() >= bai.hetHan) return '<section class="the"><h2>Hết giờ</h2><p class="phu">Đang gửi bài lên máy chủ. Giữ nguyên trang này cho đến khi có kết quả.</p></section>';
    const daLam = Object.keys(bai.traLoi).length;
    return `
      <div class="thanh-bai">
        <div><strong>${esc(dot.ten)}</strong><small data-da-lam>${daLam}/${bai.de.tracNghiem.length} câu trắc nghiệm</small></div>
        <div class="dong-ho" role="timer" aria-label="Thời gian còn lại" data-dong-ho>${dinhDangDem(bai.hetHan - Store.now())}</div>
      </div>
      <div class="lam-bai">
      <div class="lam-bai-cau">
      ${bai.de.tracNghiem.map((q, i) => `
        <fieldset class="the cau-hoi" id="cau-${i}"><legend>Câu ${i + 1}</legend>
          <p>${esc(q.cauHoi)}</p>
          ${q.luaChon.map((l, j) => `<label class="lua-chon"><input type="radio" name="q-${esc(q.ma)}" value="${j}" data-doi="tra-loi" data-ma="${esc(q.ma)}"${bai.traLoi[q.ma] === j ? ' checked' : ''} /><span>${'ABCD'[j]}. ${esc(l.noiDung)}</span></label>`).join('')}
        </fieldset>`).join('')}
      ${bai.de.tuLuan.map((c, i) => `
        <section class="the cau-hoi">
          <h2>Tự luận ${i + 1}</h2>
          <p>${esc(c.tinhHuong)}</p>
          <label class="an-nhan" for="tl-${i}">Trả lời tự luận ${i + 1}</label>
          <textarea id="tl-${i}" rows="6" data-tu-luan="${i}">${esc(c.traLoi)}</textarea>
        </section>`).join('')}
      </div>
      <aside class="the bang-cau">
        <h2>Câu đã làm</h2>
        <div class="luoi-so-cau">${bai.de.tracNghiem.map((q, i) => `<button type="button" class="so-cau${bai.traLoi[q.ma] !== undefined ? ' da-lam' : ''}" data-act="den-cau" data-i="${i}" data-so-cau="${esc(q.ma)}" aria-label="Đến câu ${i + 1}">${i + 1}</button>`).join('')}</div>
        <button type="button" class="nut nut-lon" data-act="nop-bai">Nộp bài</button>
      </aside>
      </div>`;
  }

  function theDot(dot, t) {
    const bai = L.baiHieuLuc(Store.state, t.mssv, dot.id);
    const soTN = dot.nguon.reduce((s, n) => s + n.soCau, 0);
    const moTa = `${soTN} câu trắc nghiệm, ${dot.soTuLuan} câu tự luận, ${dot.phut} phút`;
    if (bai) {
      return `
        <li>
          <div class="hang-dau"><strong>${esc(dot.ten)}</strong>${nhan(UI.KET_QUA_BAI, bai.ketQua)}</div>
          <p class="phu">Trắc nghiệm đúng ${bai.diemTN}/${bai.de.tracNghiem.length} câu${bai.tuDongNop ? ' · tự nộp khi hết giờ' : ''}. Mỗi đợt chỉ làm 1 lượt.</p>
        </li>`;
    }
    const duocLam = t.trangThai === dot.doiTuong;
    if (dot.id === 'khao_sat' && duocLam) {
      return `<li><strong>${esc(dot.ten)}</strong><p class="phu">${moTa}. Làm tập trung tại PTN theo lộ trình phía trên.</p></li>`;
    }
    return `
      <li>
        <div class="hang-dau"><strong>${esc(dot.ten)}</strong>
          <button type="button" class="nut nut-nho" data-act="bat-dau-bai" data-dot="${esc(dot.id)}"${duocLam ? '' : ' disabled'}>Bắt đầu</button></div>
        <p class="phu">${moTa}${duocLam ? '' : `. Dành cho trợ lý ở giai đoạn ${UI.TRANG_THAI_TRO_LY[dot.doiTuong][0].toLowerCase()}`}.</p>
      </li>`;
  }

  function trangOnLuyen(on) {
    const q = on.ds[on.i];
    if (!q) {
      const dat = App.ui.on;
      return `
        <section class="the">
          <h2>Hoàn thành ôn luyện</h2>
          <p>Đúng ${dat.dung}/${dat.ds.length} câu. Câu sai đã được ghi lại để ôn tiếp.</p>
          <button type="button" class="nut" data-act="thoat-on">Về trang Tập huấn</button>
        </section>`;
    }
    const daChon = on.chon !== null;
    const lop = (j) => (!daChon ? '' : j === q.dapAn ? ' dung' : j === on.chon ? ' sai' : '');
    return `
      <section class="the cau-hoi">
        <div class="hang-dau"><span class="phu">Câu ${on.i + 1}/${on.ds.length} · ${esc(q.chuDe)}</span>
          <button type="button" class="nut-chu" data-act="thoat-on">Thoát</button></div>
        <p>${esc(q.cauHoi)}</p>
        ${q.luaChon.map((l, j) => `<button type="button" class="lua-chon nut-lua${lop(j)}" data-act="chon-on" data-j="${j}"${daChon ? ' disabled' : ''}>${'ABCD'[j]}. ${esc(l.noiDung)}</button>`).join('')}
        ${daChon ? `
          <div class="giai-thich" role="status">
            <strong>${on.chon === q.dapAn ? 'Chính xác.' : `Chưa đúng. Đáp án: ${'ABCD'[q.dapAn]}.`}</strong>
            <p>${q.giaiThich ? esc(q.giaiThich) : 'Câu này chưa có giải thích trong ngân hàng.'}</p>
            ${q.nguon ? `<small>Nguồn: ${esc(q.nguon)}</small>` : ''}
          </div>
          <button type="button" class="nut" data-act="cau-on-tiep">${on.i + 1 < on.ds.length ? 'Câu tiếp theo' : 'Xem kết quả'}</button>` : ''}
      </section>`;
  }

  App.trang['tap-huan'] = {
    ten: 'Tập huấn',
    icon: 'hoc',
    render() {
      const t = toi();
      const bai = baiDangLam(t.mssv);
      if (bai) return trangLamBai(bai);
      if (App.ui.on) return trangOnLuyen(App.ui.on);

      const { chuDe, maQR } = Store.thongKeBank();
      const ungVien = t.trangThai === 'cho_duyet';
      const duocOn = L.duocOnLuyen(Store.state, t);
      const soSai = Object.keys(Store.state.caiSai[t.mssv] || {}).length;
      return `
        ${ungVien ? `<section class="the the-nhat"><p>Đăng ký lịch trực mở sau khi được PTN duyệt.</p></section>${App.theLoTrinh(t)}` : ''}
        <section class="the">
          <h2>Bài kiểm tra</h2>
          <ul class="ds-canh-bao">${Store.state.dotKiemTra.map((d) => theDot(d, t)).join('')}</ul>
        </section>
        ${duocOn ? `<section class="the">
          <h2>Ôn luyện</h2>
          <p class="phu">Không tính điểm, xem đáp án sau mỗi câu.</p>
          <form data-form="bat-dau-on" class="luoi-form">
            ${ungVien ? '' : '<label>Bộ <select name="bo"><option value="">Cả hai bộ</option><option>Tuyển</option><option>Thử việc</option></select></label>'}
            <label>Chủ đề <select name="chuDe"><option value="">Mọi chủ đề</option>${chuDe.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label>
            <label>Mã QR <select name="maQR"><option value="">Mọi mã</option>${maQR.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label>
            <label>Số câu <input type="number" name="soCau" min="1" max="100" value="10" required /></label>
            <label class="o-chon rong-het"><input type="checkbox" name="chiCauSai"${soSai ? '' : ' disabled'} /><span>Chỉ ôn câu hay sai (${soSai} câu)</span></label>
            <div class="hang-nut rong-het"><button class="nut">Bắt đầu ôn</button></div>
          </form>
        </section>` : ''}`;
    }
  };

  App.act['bat-dau-bai'] = (el) => vaoBai(dotCua(el.dataset.dot));
  App.form['vao-khao-sat'] = (f) => vaoBai(dotCua('khao_sat'), f.maVao);

  async function vaoBai(dot, maVao) {
    const t = toi();
    if (L.baiHieuLuc(Store.state, t.mssv, dot.id)) return;
    const ok = await xacNhan(`${dot.ten}: ${dot.phut} phút, chỉ làm 1 lượt. Đồng hồ chạy ngay khi bắt đầu, hết giờ bài tự nộp và khóa. Bắt đầu?`, 'Bắt đầu làm bài');
    if (!ok) return;
    try {
      await Store.batDauBai(dot, t.mssv, maVao);
    } catch (loi) {
      return thongBao(loi.tuMayChu || !Store.tuXa ? loi.message : 'Không kết nối được máy chủ, chưa tính giờ làm bài.', 'loi');
    }
    App.render();
    window.scrollTo(0, 0);
  }

  App.doi['tra-loi'] = (el) => {
    const bai = baiDangLam(Store.phien.mssv);
    if (!bai || Store.now() >= bai.hetHan) return;
    bai.traLoi[el.dataset.ma] = Number(el.value);
    Store.luuBaiTam(bai);
    document.querySelector('[data-da-lam]').textContent = `${Object.keys(bai.traLoi).length}/${bai.de.tracNghiem.length} câu trắc nghiệm`;
    document.querySelector(`[data-so-cau="${CSS.escape(el.dataset.ma)}"]`)?.classList.add('da-lam');
  };

  App.act['den-cau'] = (el) => document.getElementById(`cau-${el.dataset.i}`).scrollIntoView({ behavior: 'smooth', block: 'start' });

  App.act['nop-bai'] = async () => {
    const bai = baiDangLam(Store.phien.mssv);
    if (!bai) return;
    const chuaLam = bai.de.tracNghiem.length - Object.keys(bai.traLoi).length;
    const ok = await xacNhan(`${chuaLam ? `Còn ${chuaLam} câu trắc nghiệm chưa chọn. ` : ''}Nộp xong sẽ không sửa được. Nộp bài?`, 'Nộp bài');
    if (!ok || bai.ketQua !== 'dang_lam') return;
    if (!(await Store.nopBai(bai, false))) return thongBao('Chưa gửi được bài, kiểm tra mạng rồi bấm Nộp bài lại.', 'loi');
    if (!Store.tuXa) Store.luu();
    App.render();
    thongBao('Đã nộp bài.');
    window.scrollTo(0, 0);
  };

  App.form['bat-dau-on'] = async (f) => {
    let ds;
    try {
      ds = await Store.layCauOn(f);
    } catch (loi) {
      return thongBao(loi.tuMayChu ? loi.message : 'Không kết nối được máy chủ.', 'loi');
    }
    if (!ds.length) return thongBao('Không có câu nào khớp bộ lọc.', 'loi');
    App.ui.on = { i: 0, chon: null, dung: 0, ds };
    App.render();
    window.scrollTo(0, 0);
  };

  App.act['chon-on'] = (el) => {
    const on = App.ui.on;
    const q = on.ds[on.i];
    on.chon = Number(el.dataset.j);
    if (on.chon === q.dapAn) on.dung += 1;
    else Store.ghiCauSai(q.ma);
    App.render();
  };
  App.act['cau-on-tiep'] = () => {
    Object.assign(App.ui.on, { i: App.ui.on.i + 1, chon: null });
    App.render();
    window.scrollTo(0, 0);
  };
  App.act['thoat-on'] = () => {
    App.ui.on = null;
    App.render();
  };

  /* ---------- Trang của quản lý ---------- */
  const tenSV = (mssv) => Store.troLy(mssv)?.hoTen || mssv;

  App.trang['quan-ly-tap-huan'] = {
    ten: 'Tập huấn',
    icon: 'hoc',
    render() {
      const st = Store.state;
      const ds = st.baiLam.slice().reverse();
      const choCham = ds.filter((b) => b.ketQua === 'cho_cham' && !b.moLaiBoi).length;
      return `
        ${App.theBuoiKhaoSat()}
        <section class="the">
          <div class="hang-dau"><h2>Bài làm</h2>${choCham ? `<span class="nhan nhan-vang">${choCham} bài chờ chấm</span>` : ''}</div>
          ${ds.length ? `<div class="cuon-ngang"><table class="bang bang-the">
            <thead><tr><th>Trợ lý</th><th>Đợt</th><th>Nộp lúc</th><th class="so">TN</th><th class="so">Rời màn hình</th><th>Kết quả</th><th></th></tr></thead>
            <tbody>${ds.map((b) => `<tr>
              <td><strong>${esc(tenSV(b.mssv))}</strong></td><td data-nhan="Đợt">${esc(dotCua(b.dotId).ten)}</td>
              <td data-nhan="Nộp lúc">${ngayGio(b.nopLuc)}${b.tuDongNop ? ' <small>(tự nộp)</small>' : ''}</td>
              <td class="so" data-nhan="Trắc nghiệm">${b.diemTN ?? '–'}/${b.de.tracNghiem.length}</td><td class="so" data-nhan="Rời màn hình">${b.roiManHinh}</td>
              <td data-nhan="Kết quả">${b.moLaiBoi ? '<span class="nhan nhan-xam">Đã mở lại</span>' : nhan(UI.KET_QUA_BAI, b.ketQua)}</td>
              <td class="hang-nut">
                ${b.ketQua === 'dang_lam' ? '' : `<button type="button" class="nut nut-phu nut-nho" data-act="xem-bai" data-id="${esc(b.id)}">${b.ketQua === 'cho_cham' ? 'Chấm' : 'Xem'}</button>`}
                ${b.moLaiBoi || b.ketQua === 'dang_lam' ? '' : `<button type="button" class="nut-chu" data-act="mo-lai-bai" data-id="${esc(b.id)}">Mở lại</button>`}
              </td></tr>`).join('')}</tbody>
          </table></div>` : '<p class="phu">Chưa có bài làm nào.</p>'}
        </section>`;
    }
  };

  App.act['xem-bai'] = (el) => {
    const b = Store.state.baiLam.find((x) => x.id === el.dataset.id);
    const choCham = b.ketQua === 'cho_cham';
    const cauTL = b.de.tuLuan.map((c, i) => `
      <section class="khoi-cham">
        <h3>Tự luận ${i + 1} (${c.diemToiDa} điểm)</h3>
        <p>${esc(c.tinhHuong)}</p>
        <blockquote>${esc(c.traLoi) || '<em>Bỏ trống</em>'}</blockquote>
        ${c.yChinh.map((y, j) => `<label class="o-chon"><input type="checkbox" name="y-${i}-${j}"${c.yDat.includes(j) ? ' checked' : ''}${choCham ? '' : ' disabled'} /><span>${esc(y)}</span></label>`).join('')}
        ${c.diem !== null ? `<p class="phu">Điểm: ${String(c.diem).replace('.', ',')}/${c.diemToiDa}</p>` : ''}
      </section>`).join('');
    const cauSai = b.de.tracNghiem.filter((q) => b.traLoi[q.ma] !== q.dapAn);
    moHop(`${tenSV(b.mssv)} – ${dotCua(b.dotId).ten}`, `
      <p class="phu">Trắc nghiệm đúng ${b.diemTN}/${b.de.tracNghiem.length}. Rời màn hình ${b.roiManHinh} lần.${b.tuDongNop ? ' Tự nộp khi hết giờ.' : ''}</p>
      <form data-form="luu-cham" data-id="${esc(b.id)}">
        ${cauTL}
        ${choCham ? '<div class="hang-nut canh-phai"><button class="nut">Lưu điểm tự luận</button></div>' : ''}
      </form>
      <details><summary>Câu trắc nghiệm sai hoặc bỏ trống (${cauSai.length})</summary>
        <ul class="ds-loi">${cauSai.map((q) => `<li>${esc(q.cauHoi)}<br /><small>Chọn: ${b.traLoi[q.ma] === undefined ? 'bỏ trống' : esc(q.luaChon[b.traLoi[q.ma]].noiDung)}. Đúng: ${esc(q.luaChon[q.dapAn].noiDung)}</small></li>`).join('')}</ul>
      </details>`, { rong: true });
  };

  App.form['luu-cham'] = (f, el) => {
    const b = Store.state.baiLam.find((x) => x.id === el.dataset.id);
    b.de.tuLuan.forEach((c, i) => {
      c.yDat = c.yChinh.map((_, j) => j).filter((j) => `y-${i}-${j}` in f);
      c.diem = L.chamTuLuan(c, c.yDat);
    });
    b.ketQua = L.ketLuanBai(b, dotCua(b.dotId));
    Store.ghiNhatKy('Chấm tự luận', b.mssv, `${dotCua(b.dotId).ten}: ${UI.KET_QUA_BAI[b.ketQua][0]}`);
    App.xong('Đã lưu điểm.');
  };

  App.act['mo-lai-bai'] = (el) => {
    const b = Store.state.baiLam.find((x) => x.id === el.dataset.id);
    App.hoiLyDo('Mở lại bài kiểm tra', `${tenSV(b.mssv)} sẽ được làm lại ${dotCua(b.dotId).ten} với đề mới. Bài cũ vẫn được lưu.`, (lyDo) => {
      b.moLaiBoi = Store.nguoiDung().id;
      b.lyDoMoLai = lyDo;
      Store.ghiNhatKy('Mở lại bài kiểm tra', b.mssv, `${dotCua(b.dotId).ten}: ${lyDo}`);
      App.xong('Đã mở lại bài.');
    });
  };
})();
