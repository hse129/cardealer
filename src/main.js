import './style.css'
import { renderBrandSelector } from './js/brandSelector.js';
import { renderModelSelector } from './js/modelSelector.js';
import { renderTrimSelector } from './js/trimSelector.js';
import { renderOptionSelector } from './js/optionSelector.js';
import { renderSummaryView } from './js/summaryView.js';
import { renderCompareView } from './js/compareView.js';

// 전체 상태 관리 객체
const state = {
  selectedBrandId: null,
  selectedModelId: null,
  selectedTrimId: null,
  selectedOptions: []
};

function showBrandSelector() {
  renderBrandSelector({
    targetId: 'app',
    onSelect: (brandId) => {
      state.selectedBrandId = brandId;
      showModelSelector(brandId);
    }
  });
}

function showModelSelector(brandId) {
  renderModelSelector({
    targetId: 'app',
    brandId,
    onSelect: (modelId) => {
      state.selectedModelId = modelId;
      showTrimSelector(modelId);
    },
    onBack: () => {
      showBrandSelector();
    }
  });
}

function showTrimSelector(modelId) {
  renderTrimSelector({
    targetId: 'app',
    modelId,
    onSelect: (trimId) => {
      state.selectedTrimId = trimId;
      // 옵션 선택 UI로 이동
      showOptionSelector(trimId);
    },
    onBack: () => {
      showModelSelector(state.selectedBrandId);
    }
  });
}

function showOptionSelector(trimId) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(
    renderOptionSelector(
      trimId,
      state,
      // 이전: 트림 선택으로 돌아감
      () => showTrimSelector(state.selectedModelId),
      // 다음: 구성 요약 화면으로 이동
      () => showSummaryView()
    )
  );
}

function showSummaryView() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(
    renderSummaryView(
      state,
      // 처음으로
      () => {
        state.selectedBrandId = null;
        state.selectedModelId = null;
        state.selectedTrimId = null;
        state.selectedOptions = [];
        showBrandSelector();
      },
      // 저장
      () => {
        alert('저장 기능은 완료되었습니다.');
      },
      // 비교
      () => {
        showCompareView();
      }
    )
  );
}

function showCompareView() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(
    renderCompareView(() => showSummaryView())
  );
}

// 앱 시작 시 브랜드 선택부터
showBrandSelector();

window.showCompareView = showCompareView;
window.showBrandSelector = showBrandSelector;
