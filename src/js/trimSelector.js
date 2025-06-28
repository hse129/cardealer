import { getTrimsByModelId } from './data.js';

export async function renderTrimSelector({ targetId, modelId, onSelect, onBack }) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = '<div class="trim-selector-loading">트림 불러오는 중...</div>';
  try {
    const trims = await getTrimsByModelId(modelId);
    container.innerHTML = `
      <button class="trim-selector-back" type="button">← 모델 선택으로</button>
      <div class="trim-selector-grid">
        ${trims.map(trim => `
          <div class="trim-card" data-id="${trim.id}">
            <img src="${trim.image}" alt="${trim.name}" class="trim-image" />
            <div class="trim-text-box">
              <div class="trim-name">${trim.name}</div>
              <div class="trim-price">₩${trim.basePrice.toLocaleString()}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    // 트림 카드 클릭 이벤트
    const cards = container.querySelectorAll('.trim-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const trimId = parseInt(card.dataset.id);
        if (onSelect) onSelect(trimId);
      });
    });
    // 뒤로가기 버튼 이벤트
    const backBtn = container.querySelector('.trim-selector-back');
    if (backBtn && onBack) {
      backBtn.addEventListener('click', onBack);
    }
  } catch (e) {
    container.innerHTML = `<div class="trim-selector-error">트림 데이터를 불러올 수 없습니다.</div>`;
  }
} 