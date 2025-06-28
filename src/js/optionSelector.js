// 옵션 선택 UI 생성 및 로직

/**
 * 옵션 선택 UI를 렌더링합니다.
 * @param {number} trimId - 현재 선택된 트림의 ID
 * @param {object} state - 전체 앱 상태(선택된 옵션 등)
 * @param {function} onPrev - 이전 단계(트림 선택)로 이동 콜백
 * @param {function} onNext - 다음 단계(구성 요약)로 이동 콜백
 */
export function renderOptionSelector(trimId, state, onPrev, onNext) {
  const container = document.createElement('div');
  container.className = 'option-selector-container';

  // 해당 트림의 옵션만 필터링
  fetch('/data/options.json')
    .then(response => response.json())
    .then(data => {
      const options = data.filter(opt => opt.trimId === trimId);

      // 선택 옵션 상태 초기화
      if (!state.selectedOptions) state.selectedOptions = [];

      // 타이틀
      const title = document.createElement('h2');
      title.textContent = '추가 옵션 선택';
      title.className = 'text-box';
      container.appendChild(title);

      // 옵션 카드 목록
      const list = document.createElement('div');
      list.className = 'option-list';

      options.forEach(option => {
        const card = document.createElement('div');
        card.className = 'option-card';

        // 이미지
        if (option.image) {
          const img = document.createElement('img');
          img.src = option.image;
          img.alt = option.name;
          img.className = 'option-image';
          card.appendChild(img);
        }

        // 이름/설명/가격/체크박스
        const info = document.createElement('div');
        info.className = 'option-info';
        const name = document.createElement('div');
        name.className = 'option-name';
        name.textContent = option.name;
        const desc = document.createElement('div');
        desc.className = 'option-desc';
        desc.textContent = option.description;
        const price = document.createElement('div');
        price.className = 'option-price';
        price.textContent = option.price.toLocaleString() + '원';
        // 체크박스
        const checkboxBox = document.createElement('div');
        checkboxBox.className = 'option-checkbox-box';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = state.selectedOptions.includes(option.id);
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            state.selectedOptions.push(option.id);
          } else {
            state.selectedOptions = state.selectedOptions.filter(id => id !== option.id);
          }
          updateSummary();
        });
        checkboxBox.appendChild(checkbox);
        info.appendChild(name);
        info.appendChild(desc);
        info.appendChild(price);
        info.appendChild(checkboxBox);
        card.appendChild(info);

        list.appendChild(card);
      });
      container.appendChild(list);

      // 옵션 요약 및 가격
      const summary = document.createElement('div');
      summary.className = 'option-summary';
      container.appendChild(summary);

      function updateSummary() {
        const selected = options.filter(opt => state.selectedOptions.includes(opt.id));
        const total = selected.reduce((sum, opt) => sum + opt.price, 0);
        summary.innerHTML =
          `<b>선택한 옵션:</b> ${selected.map(opt => opt.name).join(', ') || '없음'}<br>` +
          `<b>옵션 가격 합계:</b> ${total.toLocaleString()}원`;
      }
      updateSummary();

      // 버튼 영역
      const btnBox = document.createElement('div');
      btnBox.className = 'option-btn-box';
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '이전';
      prevBtn.onclick = onPrev;
      const nextBtn = document.createElement('button');
      nextBtn.textContent = '다음';
      nextBtn.onclick = () => onNext();
      btnBox.appendChild(prevBtn);
      btnBox.appendChild(nextBtn);
      container.appendChild(btnBox);
    });

  return container;
} 