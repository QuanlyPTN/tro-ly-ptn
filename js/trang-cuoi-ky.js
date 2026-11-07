/* Cuối kỳ: đánh giá thang 5, xếp loại học kỳ, xuất Excel (mục 4). */
(function () {
  const L = window.Logic;
  const { esc, so, tyLe, moHop, xacNhan, thongBao } = window.UI;
  const TEN_TIEU_CHI = { chuyenCan: 'Chuyên cần', trachNhiem: 'Trách nhiệm, nề nếp', anToan: 'An toàn', kyNang: 'Kỹ năng', thaiDo: 'Thái độ, hợp tác' };

  const hocKyDangXem = () => Store.state.hocKy.find((k) => k.id === App.ui.hocKyCuoiKy) || L.hocKyHienTai(Store.state, Store.now());

  function hoSoKy(t, hk) {
    const st = Store.state;
    const cs = L.tinhChiSo(st, t.mssv, hk);
    const dg = st.danhGia.find((d) => d.mssv === t.mssv && d.hocKyId === hk.id) || null;
    const tb = L.diemDanhGiaTB(dg);
    const datThuViec = Boolean(t.ngayChinhThuc);
    const xepLoai = L.xepLoaiKy(cs, st.caiDat, tb, { daTapHuan: datThuViec, datThuViec, matTuCach: t.trangThai === 'mat_tu_cach' });
    const chot = st.xepLoaiKy.find((x) => x.mssv === t.mssv && x.hocKyId === hk.id) || null;
    return { t, cs, dg, tb, xepLoai, chot };
  }

  const danhSach = (hk) => Store.state.troLy
    .filter((t) => ['thu_viec', 'dang_hoat_dong', 'tam_nghi', 'mat_tu_cach'].includes(t.trangThai))
    .map((t) => hoSoKy(t, hk));

  App.trang['cuoi-ky'] = {
    ten: 'Cuối kỳ',
    icon: 'sao',
    render() {
      const st = Store.state;
      const hk = hocKyDangXem();
      const ds = danhSach(hk);
      const admin = Store.phien.vaiTro === 'admin';
      const conThieu = ds.filter((x) => x.tb === null).length;
      return `
        <section class="the">
          <div class="hang-dau">
            <select data-doi="doi-ky-cuoi" aria-label="Học kỳ">${st.hocKy.map((k) => `<option value="${esc(k.id)}"${k.id === hk.id ? ' selected' : ''}>${esc(k.ten)}</option>`).join('')}</select>
            <span class="hang-nut">
              <button type="button" class="nut nut-phu nut-nho" data-act="xuat-cuoi-ky">Xuất Excel</button>
              ${admin ? '<button type="button" class="nut nut-nho" data-act="chot-xep-loai">Chốt xếp loại</button>' : ''}
            </span>
          </div>
          <p class="phu">${conThieu ? `Còn ${conThieu} trợ lý chưa đánh giá.` : 'Đã đánh giá đủ.'} Xếp loại do web đề xuất, Admin chốt.</p>
          <div class="cuon-ngang"><table class="bang bang-the">
            <thead><tr><th>Trợ lý</th><th class="so">Giờ</th><th class="so">Tham gia</th><th class="so">Đúng giờ</th><th class="so">Đánh giá</th><th>Đề xuất</th><th>Đã chốt</th><th></th></tr></thead>
            <tbody>${ds.map(({ t, cs, tb, xepLoai, chot }) => `<tr>
              <td><strong>${esc(t.hoTen)}</strong></td>
              <td class="so" data-nhan="Giờ">${so(cs.tongGio)}</td><td class="so" data-nhan="Tham gia">${tyLe(cs.tyLeThamGia)}</td><td class="so" data-nhan="Đúng giờ">${tyLe(cs.tyLeDungGio)}</td>
              <td class="so" data-nhan="Đánh giá">${tb === null ? '–' : so(tb, 2)}</td>
              <td data-nhan="Đề xuất">${esc(xepLoai)}</td><td data-nhan="Đã chốt">${chot ? esc(chot.xepLoai) : '–'}</td>
              <td class="hang-nut"><button type="button" class="nut nut-phu nut-nho" data-act="mo-danh-gia" data-mssv="${esc(t.mssv)}">Đánh giá</button></td>
            </tr>`).join('')}</tbody>
          </table></div>
        </section>`;
    }
  };

  App.doi['doi-ky-cuoi'] = (el) => {
    App.ui.hocKyCuoiKy = el.value;
    App.render();
  };

  App.act['mo-danh-gia'] = (el) => {
    const hk = hocKyDangXem();
    const { t, cs, dg } = hoSoKy(Store.troLy(el.dataset.mssv), hk);
    const goiY = L.goiYDanhGia(cs);
    moHop(`Đánh giá ${t.hoTen}`, `
      <p class="phu">${esc(hk.ten)}. Thang 5, bước 0,5. Ô đã điền sẵn là gợi ý từ dữ liệu, quản lý chỉnh được.</p>
      <form data-form="luu-danh-gia" data-mssv="${esc(t.mssv)}">
        ${L.TIEU_CHI_DANH_GIA.map((k) => {
          const giaTri = dg?.[k] ?? goiY[k] ?? '';
          return `<label>${TEN_TIEU_CHI[k]}${goiY[k] === null ? ' (quản lý chấm)' : ''}
            <input type="number" name="${k}" min="1" max="5" step="0.5" value="${giaTri}" required /></label>`;
        }).join('')}
        <div class="hang-nut canh-phai"><button class="nut">Lưu đánh giá</button></div>
      </form>`);
  };

  App.form['luu-danh-gia'] = (f, el) => {
    const hk = hocKyDangXem();
    const mssv = el.dataset.mssv;
    const ds = Store.state.danhGia;
    const diem = Object.fromEntries(L.TIEU_CHI_DANH_GIA.map((k) => [k, Number(f[k])]));
    const cu = ds.find((d) => d.mssv === mssv && d.hocKyId === hk.id);
    if (cu) Object.assign(cu, diem, { nguoiDanhGia: Store.nguoiDung().id });
    else ds.push({ mssv, hocKyId: hk.id, ...diem, nguoiDanhGia: Store.nguoiDung().id });
    Store.ghiNhatKy('Đánh giá cuối kỳ', mssv, `${hk.ten}: ${L.diemDanhGiaTB(diem)}`);
    App.xong('Đã lưu đánh giá.');
  };

  App.act['chot-xep-loai'] = async () => {
    const st = Store.state;
    const hk = hocKyDangXem();
    const ds = danhSach(hk).filter((x) => x.tb !== null);
    if (!ds.length) return thongBao('Chưa có trợ lý nào được đánh giá.', 'loi');
    if (!(await xacNhan(`Chốt xếp loại ${hk.ten} cho ${ds.length} trợ lý đã đánh giá?`, 'Chốt'))) return;
    ds.forEach(({ t, cs, xepLoai }) => {
      st.xepLoaiKy = st.xepLoaiKy.filter((x) => !(x.mssv === t.mssv && x.hocKyId === hk.id));
      st.xepLoaiKy.push({ mssv: t.mssv, hocKyId: hk.id, chiSo: cs, xepLoai, trangThaiCuoiKy: t.trangThai });
    });
    Store.ghiNhatKy('Chốt xếp loại', hk.ten, `${ds.length} trợ lý`);
    Store.guiThongBao({ tieuDe: `Đã có xếp loại ${hk.ten}`, noiDung: 'Xem ở Tiến độ của tôi.', nguoiNhan: ds.map((x) => x.t.mssv) });
    App.xong('Đã chốt xếp loại.');
  };

  App.act['xuat-cuoi-ky'] = () => {
    const hk = hocKyDangXem();
    const dong = danhSach(hk).map(({ t, cs, dg, tb, xepLoai, chot }) => ({
      MSSV: t.mssv, 'Họ tên': t.hoTen, 'Tổng giờ': Math.round(cs.tongGio * 10) / 10,
      'Tham gia (%)': cs.tyLeThamGia === null ? '' : Math.round(cs.tyLeThamGia), 'Đúng giờ (%)': cs.tyLeDungGio === null ? '' : Math.round(cs.tyLeDungGio),
      'Ca bỏ': cs.soCaBo, 'Lỗi nhẹ': cs.loiNheConLai, 'Lỗi nặng': cs.loiNang, 'Điểm cộng đồng': cs.diemCongDong,
      ...Object.fromEntries(L.TIEU_CHI_DANH_GIA.map((k) => [TEN_TIEU_CHI[k], dg?.[k] ?? ''])),
      'Đánh giá TB': tb ?? '', 'Đề xuất': xepLoai, 'Đã chốt': chot?.xepLoai ?? ''
    }));
    const sach = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(sach, XLSX.utils.json_to_sheet(dong), 'Cuối kỳ');
    XLSX.writeFile(sach, `cuoi-ky-${hk.id}.xlsx`);
  };
})();
