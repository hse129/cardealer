import brandsData from '../data/brands.json';
import modelsData from '../data/models.json';
import trimsData from '../data/trims.json';
import optionsData from '../data/options.json';

/**
 * 저장된 구성 비교 UI를 렌더링합니다.
 * @param {function} onBack - 뒤로가기 콜백
 */
export function renderCompareView(onBack) {
  const container = document.createElement('div');
  container.className = 'compare-container';

  const title = document.createElement('h2');
  title.textContent = '구성 비교';
  container.appendChild(title);

  // 저장된 구성 불러오기
  const saved = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
  if (saved.length < 2) {
    const msg = document.createElement('div');
    msg.className = 'compare-msg';
    msg.textContent = '비교할 저장된 구성이 2개 이상 필요합니다.';
    container.appendChild(msg);
    const backBtn = document.createElement('button');
    backBtn.textContent = '뒤로가기';
    backBtn.onclick = onBack;
    container.appendChild(backBtn);
    return container;
  }

  // 비교할 구성 선택
  const selectBox = document.createElement('div');
  selectBox.className = 'compare-select-box';
  selectBox.textContent = '비교할 구성을 2~3개 선택하세요:';
  const form = document.createElement('form');
  form.className = 'compare-form';
  saved.forEach((cfg, idx) => {
    const label = document.createElement('label');
    label.className = 'compare-select-label';
    label.style.display = 'block';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = cfg.id;
    cb.name = 'compare';
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + cfg.name));
    form.appendChild(label);
  });
  selectBox.appendChild(form);
  container.appendChild(selectBox);

  const compareBtn = document.createElement('button');
  compareBtn.textContent = '비교하기';
  compareBtn.type = 'button';
  compareBtn.style.margin = '16px 0';
  selectBox.appendChild(compareBtn);

  const resultBox = document.createElement('div');
  resultBox.className = 'compare-result-box';
  container.appendChild(resultBox);

  compareBtn.onclick = () => {
    let compareInputs = form.elements['compare'];
    if (!compareInputs.length) compareInputs = [compareInputs];
    const checked = Array.from(compareInputs).filter(cb => cb.checked).map(cb => cb.value);
    if (checked.length < 2) {
      alert('2개 이상 선택하세요!');
      return;
    }
    // 선택된 구성만 추출
    const selected = saved.filter(cfg => checked.includes(cfg.id));
    // 표 생성
    resultBox.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'compare-table';
    // 헤더
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.appendChild(document.createElement('th')); // 항목명
    selected.forEach(cfg => {
      const th = document.createElement('th');
      th.textContent = cfg.name;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);
    // 전체 기본옵션 행 추가 (모든 구성의 기본옵션을 중복 없이 한 번씩만 나열)
    const allBasicOptionsRow = document.createElement('tr');
    const allBasicOptionsTh = document.createElement('th');
    allBasicOptionsTh.textContent = '전체 기본옵션';
    allBasicOptionsTh.style.background = '#eaf4ff';
    allBasicOptionsTh.style.fontWeight = 'bold';
    allBasicOptionsTh.style.textAlign = 'left';
    allBasicOptionsTh.colSpan = 1;
    allBasicOptionsRow.appendChild(allBasicOptionsTh);
    // 모든 구성의 트림에서 기본옵션을 모아 중복 없이 합치기
    const allBasicOptionsSet = new Set();
    selected.forEach(cfg => {
      const t = trimsData.find(t => t.id === cfg.config.selectedTrimId);
      if (t && t.basicOptions && Array.isArray(t.basicOptions)) {
        t.basicOptions.forEach(opt => allBasicOptionsSet.add(opt));
      }
    });
    if (allBasicOptionsSet.size === 0) {
      allBasicOptionsSet.add('에어백, ABS, 전동 윈도우, 스마트키 등');
    }
    const allBasicOptionsTd = document.createElement('td');
    allBasicOptionsTd.colSpan = selected.length;
    allBasicOptionsTd.style.textAlign = 'left';
    allBasicOptionsTd.style.background = '#f8fbff';
    allBasicOptionsTd.style.fontSize = '0.98em';
    allBasicOptionsTd.style.lineHeight = '1.7';
    allBasicOptionsTd.textContent = Array.from(allBasicOptionsSet).join(', ');
    allBasicOptionsRow.appendChild(allBasicOptionsTd);
    table.appendChild(allBasicOptionsRow);
    // 전체 옵션 목록 행 추가 (각 구성별로 보여주기)
    const allOptionsRow = document.createElement('tr');
    const allOptionsTh = document.createElement('th');
    allOptionsTh.textContent = '전체 옵션';
    allOptionsTh.style.background = '#eaf4ff';
    allOptionsTh.style.fontWeight = 'bold';
    allOptionsTh.style.textAlign = 'left';
    allOptionsTh.colSpan = 1;
    allOptionsRow.appendChild(allOptionsTh);
    selected.forEach(cfg => {
      const opts = optionsData.filter(o => (cfg.config.selectedOptions||[]).includes(o.id));
      const td = document.createElement('td');
      td.style.textAlign = 'left';
      td.style.background = '#f8fbff';
      td.style.fontSize = '0.98em';
      td.style.lineHeight = '1.7';
      if (opts.length) {
        td.innerHTML = opts.map(opt => `${opt.name} <span style='color:#0078ff'>(${opt.price.toLocaleString()}원)</span>`).join(', ');
      } else {
        td.textContent = '없음';
      }
      allOptionsRow.appendChild(td);
    });
    table.appendChild(allOptionsRow);
    // 본문
    const tbody = document.createElement('tbody');
    // 브랜드, 모델, 트림, 트림가격, 기본 옵션, 선택 옵션, 옵션합계, 총합계
    const rows = [
      { label: '브랜드', get: cfg => {
        const b = brandsData.find(b => b.id === cfg.config.selectedBrandId); return b ? b.name : '-'; } },
      { label: '모델', get: cfg => {
        const m = modelsData.find(m => m.id === cfg.config.selectedModelId); return m ? m.name : '-'; } },
      { label: '트림', get: cfg => {
        const t = trimsData.find(t => t.id === cfg.config.selectedTrimId); return t ? t.name : '-'; } },
      { label: '트림 가격', get: cfg => {
        const t = trimsData.find(t => t.id === cfg.config.selectedTrimId);
        return t && typeof t.basePrice === 'number' ? t.basePrice.toLocaleString()+'원' : '-'; } },
      { label: '기본 옵션', get: cfg => {
        const t = trimsData.find(t => t.id === cfg.config.selectedTrimId);
        if (t && t.basicOptions && Array.isArray(t.basicOptions) && t.basicOptions.length > 0) {
          return t.basicOptions.join(', ');
        } else {
          return '에어백, ABS, 전동 윈도우, 스마트키 등';
        }
      } },
      { label: '선택 옵션', get: cfg => {
        const opts = optionsData.filter(o => (cfg.config.selectedOptions||[]).includes(o.id));
        return opts.length ? opts.map(o => o.name).join(', ') : '없음'; } },
      { label: '옵션 합계', get: cfg => {
        const opts = optionsData.filter(o => (cfg.config.selectedOptions||[]).includes(o.id));
        return opts.length ? opts.reduce((sum,o)=>sum+o.price,0).toLocaleString()+'원' : '0원'; } },
      { label: '총 차량 가격', get: cfg => {
        const t = trimsData.find(t => t.id === cfg.config.selectedTrimId);
        const opts = optionsData.filter(o => (cfg.config.selectedOptions||[]).includes(o.id));
        const total = (t && typeof t.basePrice === 'number' ? t.basePrice : 0) + opts.reduce((sum,o)=>sum+o.price,0);
        return total.toLocaleString()+'원'; } },
    ];
    rows.forEach(row => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = row.label;
      tr.appendChild(th);
      selected.forEach(cfg => {
        const td = document.createElement('td');
        td.textContent = row.get(cfg);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultBox.appendChild(table);

    // PDF 내보내기 버튼 추가
    let pdfBtn = document.getElementById('compare-pdf-btn');
    if (pdfBtn) pdfBtn.remove();
    pdfBtn = document.createElement('button');
    pdfBtn.id = 'compare-pdf-btn';
    pdfBtn.textContent = 'PDF 내보내기';
    pdfBtn.style.margin = '18px 0 0 0';
    pdfBtn.onclick = () => {
      const target = resultBox;
      const opt = {
        margin:       0.2,
        filename:     'compare-result.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, backgroundColor: null },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(target).save();
    };
    resultBox.appendChild(pdfBtn);

    // 처음으로 버튼 추가
    let homeBtn = document.getElementById('compare-home-btn');
    if (homeBtn) homeBtn.remove();
    homeBtn = document.createElement('button');
    homeBtn.id = 'compare-home-btn';
    homeBtn.textContent = '처음으로';
    homeBtn.style.margin = '18px 0 0 12px';
    homeBtn.style.background = '#0078ff';
    homeBtn.style.color = '#fff';
    homeBtn.style.border = '2px solid #005bb5';
    homeBtn.style.borderRadius = '8px';
    homeBtn.style.padding = '12px 36px';
    homeBtn.style.fontSize = '1.1rem';
    homeBtn.style.cursor = 'pointer';
    homeBtn.onclick = () => {
      if (window.showBrandSelector) window.showBrandSelector();
    };
    resultBox.appendChild(homeBtn);
  };

  // 뒤로가기 버튼
  const backBtn = document.createElement('button');
  backBtn.textContent = '뒤로가기';
  backBtn.onclick = onBack;
  container.appendChild(backBtn);

  // 저장 초기화 버튼 추가
  const clearBtn = document.createElement('button');
  clearBtn.textContent = '저장 초기화';
  clearBtn.style.marginLeft = '12px';
  clearBtn.onclick = () => {
    if (confirm('저장된 모든 구성을 삭제하시겠습니까?')) {
      localStorage.removeItem('savedConfigs');
      alert('저장된 구성이 모두 삭제되었습니다.');
      if (onBack) onBack();
    }
  };
  container.appendChild(clearBtn);

  return container;
} 