import { getBrands } from './data.js';

export async function renderBrandSelector({ targetId, onSelect }) {
  const container = document.getElementById(targetId);
  if (!container) return;

  // 중앙정렬 및 세로 배치 레이아웃 적용
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.minHeight = '100vh';
  container.innerHTML = '';

  try {
    const brands = await getBrands();
    // 그룹 분리
    const leftBrands = brands.filter(b => ["현대", "기아", "쉘비"].includes(b.name));
    const rightBrands = brands.filter(b => !["현대", "기아", "쉘비"].includes(b.name));
    // 브랜드 선택 UI 생성
    const selectorOuter = document.createElement('div');
    selectorOuter.className = 'brand-selector-outer';
    selectorOuter.style.marginBottom = 'auto';
    selectorOuter.innerHTML = `
      <div class="brand-selector-box left">
        <div class="brand-selector-title">국산 브랜드</div>
        <div class="brand-selector-grid">
          ${leftBrands.map(brand => `
            <div class="brand-item" data-id="${brand.id}">
              <img src="${brand.logo}" alt="${brand.name}" class="brand-logo" />
              <div class="brand-name">${brand.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="brand-selector-box right">
        <div class="brand-selector-title">수입 브랜드</div>
        <div class="brand-selector-grid">
          ${rightBrands.map(brand => `
            <div class="brand-item" data-id="${brand.id}">
              <img src="${brand.logo}" alt="${brand.name}" class="brand-logo" />
              <div class="brand-name">${brand.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    container.appendChild(selectorOuter);
    // 이벤트 바인딩 (양쪽 박스 모두)
    const items = selectorOuter.querySelectorAll('.brand-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        const brandId = parseInt(item.dataset.id);
        if (onSelect) onSelect(brandId);
      });
    });
    // 비교 바로가기 버튼을 항상 하단에 배치
    const compareBtn = document.createElement('button');
    compareBtn.id = 'brand-compare-btn';
    compareBtn.textContent = '비교 바로가기';
    compareBtn.style.fontSize = '1.1rem';
    compareBtn.style.background = '#0078ff';
    compareBtn.style.color = '#fff';
    compareBtn.style.border = '2px solid #005bb5';
    compareBtn.style.borderRadius = '8px';
    compareBtn.style.padding = '12px 36px';
    compareBtn.style.cursor = 'pointer';
    compareBtn.style.display = 'block';
    compareBtn.style.margin = '40px auto 0 auto';
    compareBtn.style.maxWidth = '300px';
    compareBtn.style.alignSelf = 'center';
    compareBtn.onclick = () => {
      if (window.showCompareView) window.showCompareView();
    };
    container.appendChild(compareBtn);
    // 작은 안내 박스 추가
    const infoBox = document.createElement('div');
    infoBox.textContent = '*현대만 가능';
    infoBox.style.fontSize = '0.95rem';
    infoBox.style.background = '#f5f5f7';
    infoBox.style.color = '#333';
    infoBox.style.border = '1px solid #d0d0d0';
    infoBox.style.borderRadius = '8px';
    infoBox.style.padding = '7px 18px';
    infoBox.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
    infoBox.style.position = 'absolute';
    infoBox.style.left = '32px';
    infoBox.style.top = '50%';
    infoBox.style.transform = 'translateY(-50%)';
    infoBox.style.zIndex = '10';

    // 부모 컨테이너에 relative 적용 (중복 적용 방지)
    container.style.position = 'relative';
    container.appendChild(infoBox);
  } catch (e) {
    container.innerHTML = `<div class="brand-selector-error">브랜드 데이터를 불러올 수 없습니다.</div>`;
  }
}