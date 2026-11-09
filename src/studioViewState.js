// Keep reading position across data refreshes, but not across a new decision.
function detailKey(el, index) {
  return el.dataset.viewKey || el.id || `details:${index}`;
}
export function captureView(root, key) {
  const doc = root.ownerDocument, win = doc?.defaultView || globalThis;
  const active = doc?.activeElement;
  return {
    key,
    details: Array.from(root.querySelectorAll('details'), (el, i) => [detailKey(el, i), el.open]),
    stage: root.querySelector('.stage')?.scrollTop || 0,
    x: win.scrollX || 0, y: win.scrollY || 0,
    focus: active && root.contains(active) ? active.id : null,
    selection: active && typeof active.selectionStart === 'number' ? [active.selectionStart, active.selectionEnd] : null
  };
}
export function restoreView(root, saved, key) {
  if (!saved || saved.key !== key) return;
  const details = new Map(saved.details);
  root.querySelectorAll('details').forEach((el, i) => {
    const k = detailKey(el, i);
    if (details.has(k)) el.open = details.get(k);
  });
  const stage = root.querySelector('.stage');
  if (stage) stage.scrollTop = saved.stage;
  const el = saved.focus && root.ownerDocument?.getElementById(saved.focus);
  if (el && root.contains(el)) {
    el.focus?.({preventScroll:true});
    if (saved.selection) try { el.setSelectionRange(...saved.selection); } catch {}
  }
  const win = root.ownerDocument?.defaultView;
  // A newly created DOM often keeps window scroll itself; avoid needless work.
  if (win && (win.scrollX !== saved.x || win.scrollY !== saved.y)) win.scrollTo?.(saved.x, saved.y);
}
