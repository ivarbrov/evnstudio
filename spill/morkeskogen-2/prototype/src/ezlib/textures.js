// EVN: teksturer settes av grafikklaget (ikke lastet her)
export const TEX = { bark: {}, leaves: {} };
export function getBarkTexture(barkType, fileType, scale = { x: 1, y: 1 }) { const t = TEX.bark[barkType + '_' + fileType]; if (!t) return null; t.repeat.set(scale.x, 1 / scale.y); return t; }
export function getLeafTexture(leafType) { return TEX.leaves[leafType] || null; }
