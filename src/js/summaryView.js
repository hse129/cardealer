import brandsData from '../data/brands.json';
import modelsData from '../data/models.json';
import trimsData from '../data/trims.json';
import optionsData from '../data/options.json';

function saveConfigToLocalStorage(state) {
  const saved = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
  // 중복 체크: 브랜드, 모델, 트림, 옵션(정렬, 숫자 변환, stringify) 모두 같으면 중복
  const optsB = Array.isArray(state.selectedOptions) ? state.selectedOptions.map(Number).sort((a,b)=>a-b) : [];
  const isDuplicate = saved.some(cfg => {
    const a = cfg.config;
    if (!a) return false;
    if (a.selectedBrandId !== state.selectedBrandId) return false;
    if (a.selectedModelId !== state.selectedModelId) return false;
    if (a.selectedTrimId !== state.selectedTrimId) return false;
    const optsA = Array.isArray(a.selectedOptions) ? a.selectedOptions.map(Number).sort((a,b)=>a-b) : [];
    if (optsA.length !== optsB.length) return false;
    if (JSON.stringify(optsA) !== JSON.stringify(optsB)) return false;
    return true;
  });
  if (isDuplicate) {
    // 디버깅용 로그
    console.log('중복 저장 시도:', state);
    alert('중복사항이 있습니다');
    return false;
  }
  const now = new Date();
  const name = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}의 구성`;
  const config = {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    name,
    savedAt: now.toISOString(),
    config: JSON.parse(JSON.stringify(state))
  };
  saved.push(config);
  localStorage.setItem('savedConfigs', JSON.stringify(saved));
  return true;
}

/**
 * 구성 요약(최종 견적) UI를 렌더링합니다.
 * @param {object} state - 전체 앱 상태(선택된 브랜드, 모델, 트림, 옵션)
 * @param {function} onRestart - 처음으로 돌아가기 콜백
 * @param {function} onSave - 저장 콜백(추후 구현)
 * @param {function} onCompare - 비교 콜백(추후 구현)
 */
export async function renderSummaryView(state, onRestart, onSave, onCompare) {
  const container = document.createElement('div');
  container.className = 'summary-container';

  // 데이터 동적 fetch
  const [brandsData, modelsData, trimsData, optionsData] = await Promise.all([
    fetch('/data/brands.json').then(r => r.json()),
    fetch('/data/models.json').then(r => r.json()),
    fetch('/data/trims.json').then(r => r.json()),
    fetch('/data/options.json').then(r => r.json()),
  ]);

  // 데이터 매칭
  const brand = brandsData.find(b => b.id === state.selectedBrandId);
  const model = modelsData.find(m => m.id === state.selectedModelId);
  const trim = trimsData.find(t => t.id === state.selectedTrimId);
  const selectedOptions = optionsData.filter(opt => state.selectedOptions.includes(opt.id));

  // 가격 합계 계산
  const trimPrice = trim && typeof trim.basePrice === 'number' ? trim.basePrice : 0;
  const trimPriceText = trim && typeof trim.basePrice === 'number' ? trim.basePrice.toLocaleString() + '원' : '-';
  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalPrice = trimPrice + optionsTotal;

  // 타이틀
  const title = document.createElement('h2');
  title.textContent = '구성 요약';
  container.appendChild(title);

  // 차량/트림 정보
  const carBox = document.createElement('div');
  carBox.className = 'summary-car-box';
  if (brand && brand.logo) {
    const brandLogo = document.createElement('img');
    brandLogo.src = brand.logo;
    brandLogo.alt = brand.name;
    brandLogo.className = 'summary-brand-logo';
    carBox.appendChild(brandLogo);
  }
  if (model && model.image) {
    const modelImg = document.createElement('img');
    modelImg.src = model.image;
    modelImg.alt = model.name;
    modelImg.className = 'summary-model-image';
    carBox.appendChild(modelImg);
  }
  const carInfo = document.createElement('div');
  carInfo.className = 'summary-car-info text-box';
  carInfo.innerHTML =
    `<b>브랜드:</b> ${brand ? brand.name : '-'}<br>` +
    `<b>모델:</b> ${model ? model.name : '-'}<br>` +
    `<b>트림:</b> ${trim ? trim.name : '-'}<br>` +
    `<b>트림 가격:</b> ${trimPriceText}`;
  // 기본옵션 버튼
  const basicOptBtn = document.createElement('button');
  basicOptBtn.textContent = '기본옵션 보기';
  basicOptBtn.style.marginLeft = '10px';
  basicOptBtn.onclick = () => {
    let msg = '';
    if (trim && trim.basicOptions && Array.isArray(trim.basicOptions) && trim.basicOptions.length > 0) {
      msg = trim.basicOptions.map(opt => '- ' + opt).join('\n');
    } else {
      msg = '트림별 기본 옵션 예시:\n- 에어백, ABS, 전동 윈도우, 스마트키, 후방카메라 등\n(실제 기본 옵션은 제조사/트림별로 다를 수 있습니다)';
    }
    alert(msg);
  };
  carInfo.appendChild(basicOptBtn);
  carBox.appendChild(carInfo);
  container.appendChild(carBox);

  // 옵션 정보
  const optionBox = document.createElement('div');
  optionBox.className = 'summary-option-box';
  const optionTitle = document.createElement('div');
  optionTitle.className = 'summary-option-title text-box';
  optionTitle.textContent = '선택한 옵션';
  optionBox.appendChild(optionTitle);
  if (selectedOptions.length === 0) {
    const none = document.createElement('div');
    none.className = 'text-box';
    none.textContent = '없음';
    optionBox.appendChild(none);
  } else {
    selectedOptions.forEach(opt => {
      const optRow = document.createElement('div');
      optRow.className = 'summary-option-row text-box';
      if (opt.image) {
        const optImg = document.createElement('img');
        optImg.src = opt.image;
        optImg.alt = opt.name;
        optImg.className = 'summary-option-image';
        optRow.appendChild(optImg);
      }
      const optName = document.createElement('span');
      optName.textContent = `${opt.name} (${opt.price.toLocaleString()}원)`;
      optRow.appendChild(optName);
      optionBox.appendChild(optRow);
    });
  }
  // 트림 가격, 옵션 합계, 총 차량 가격
  const trimSum = document.createElement('div');
  trimSum.className = 'summary-option-sum text-box';
  trimSum.innerHTML = `<b>트림 가격:</b> ${trimPriceText}`;
  optionBox.appendChild(trimSum);
  const optionSum = document.createElement('div');
  optionSum.className = 'summary-option-sum text-box';
  optionSum.innerHTML = `<b>옵션 합계:</b> ${optionsTotal.toLocaleString()}원`;
  optionBox.appendChild(optionSum);
  container.appendChild(optionBox);

  // 취등록세, 기타비용, 최종 예상 비용
  const tax = Math.round(totalPrice * 0.07);
  const etc = 500000;
  const etcDetail = '번호판, 보험, 공채 등';
  const finalTotal = totalPrice + tax + etc;

  const taxDiv = document.createElement('div');
  taxDiv.className = 'summary-option-sum text-box';
  taxDiv.innerHTML = `<b>취등록세(7%):</b> ${tax.toLocaleString()}원`;
  container.appendChild(taxDiv);

  const etcDiv = document.createElement('div');
  etcDiv.className = 'summary-option-sum text-box';
  etcDiv.innerHTML = `<b>기타비용:</b> ${etc.toLocaleString()}원 <span style='font-size:0.97em;color:#555;'>(예: ${etcDetail})</span>`;
  container.appendChild(etcDiv);

  // 총합계
  const total = document.createElement('div');
  total.className = 'summary-total text-box';
  total.innerHTML = `<b>총 차량 가격:</b> <span>${totalPrice.toLocaleString()}원</span>`;
  container.appendChild(total);

  // 최종 예상 비용
  const finalDiv = document.createElement('div');
  finalDiv.className = 'summary-total text-box';
  finalDiv.innerHTML = `<b>최종 예상 비용:</b> <span>${finalTotal.toLocaleString()}원</span>`;
  container.appendChild(finalDiv);

  // 버튼 영역
  const btnBox = document.createElement('div');
  btnBox.className = 'summary-btn-box';
  const restartBtn = document.createElement('button');
  restartBtn.textContent = '처음으로';
  restartBtn.onclick = onRestart;
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '저장';
  saveBtn.onclick = () => {
    const ok = saveConfigToLocalStorage(state);
    if (ok) {
      alert('구성이 저장되었습니다!\n(비교, 저장 목록에서 활용할 수 있습니다.)');
      if (onSave) onSave();
    }
  };
  const compareBtn = document.createElement('button');
  compareBtn.textContent = '비교';
  compareBtn.onclick = onCompare;
  const pdfBtn = document.createElement('button');
  pdfBtn.textContent = 'PDF 내보내기';
  pdfBtn.onclick = () => {
    const target = container;
    const opt = {
      margin:       0.2,
      filename:     'car-config.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: null },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    window.html2pdf().set(opt).from(target).save();
  };
  btnBox.appendChild(restartBtn);
  btnBox.appendChild(saveBtn);
  btnBox.appendChild(compareBtn);
  btnBox.appendChild(pdfBtn);
  container.appendChild(btnBox);

  return container;
} 