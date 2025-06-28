// 브랜드 데이터 불러오기
export async function getBrands() {
  const res = await fetch('/src/data/brands.json');
  if (!res.ok) throw new Error('브랜드 데이터를 불러올 수 없습니다');
  return await res.json();
}

// 모델 데이터 불러오기 (브랜드별)
export async function getModelsByBrandId(brandId) {
  const res = await fetch('/src/data/models.json');
  if (!res.ok) throw new Error('모델 데이터를 불러올 수 없습니다');
  const models = await res.json();
  return models.filter(m => m.brandId === brandId);
}

// 트림 데이터 불러오기 (모델별)
export async function getTrimsByModelId(modelId) {
  const res = await fetch('/src/data/trims.json');
  if (!res.ok) throw new Error('트림 데이터를 불러올 수 없습니다');
  const trims = await res.json();
  return trims.filter(t => t.modelId === modelId);
}

// 옵션 데이터 불러오기 (트림별)
export async function getOptionsByTrimId(trimId) {
  const res = await fetch('/src/data/options.json');
  if (!res.ok) throw new Error('옵션 데이터를 불러올 수 없습니다');
  const options = await res.json();
  return options.filter(o => o.trimId === trimId);
} 