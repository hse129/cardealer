import { getModelsByBrandId } from './data.js';

export async function renderModelSelector({ targetId, brandId, onSelect, onBack }) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = '<div class="model-selector-loading">모델 불러오는 중...</div>';
  try {
    const models = await getModelsByBrandId(brandId);
    container.innerHTML = `
      <button class="model-selector-back" type="button">← 브랜드 선택으로</button>
      <div class="model-selector-grid">
        ${models.map(model => `
          <div class="model-card" data-id="${model.id}">
            <img src="${model.image}" alt="${model.name}" class="model-image" />
            <div class="model-name">${model.name}</div>
          </div>
        `).join('')}
      </div>
    `;
    // 모델 카드 클릭 이벤트
    const cards = container.querySelectorAll('.model-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const modelId = parseInt(card.dataset.id);
        if (onSelect) onSelect(modelId);
      });
    });
    // 뒤로가기 버튼 이벤트
    const backBtn = container.querySelector('.model-selector-back');
    if (backBtn && onBack) {
      backBtn.addEventListener('click', onBack);
    }
  } catch (e) {
    container.innerHTML = `<div class="model-selector-error">모델 데이터를 불러올 수 없습니다.</div>`;
  }
} 