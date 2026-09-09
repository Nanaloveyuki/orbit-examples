import { createIcons, Box, Shuffle, Terminal, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronsUp, Pickaxe, Plus } from 'lucide';
import { createRenderer } from './renderer.js';

function reportError(error) {
  const el = document.getElementById('error');
  el.textContent = error instanceof Error ? error.message : String(error);
  el.hidden = false;
}
window.addEventListener('error', event => reportError(event.error ?? event.message));
window.addEventListener('unhandledrejection', event => reportError(event.reason));
window.orbitVoxel = {
  reportError,
  createRenderer(canvas, atlas) {
    const image = atlas.toDataURL();
    const tiles = [[0,0], [2,0], [3,0], [0,1], [2,1], [3,2], [2,2], [0,2], [0,3], [1,3], [2,3], [3,3]];
    document.querySelectorAll('.swatch').forEach((swatch, index) => {
      swatch.style.backgroundImage = `url(${image})`;
      swatch.style.backgroundPosition = `${-tiles[index][0] * 28}px ${-tiles[index][1] * 28}px`;
    });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      reportError('Graphics context lost. Reload the application.');
    });
    let touch;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      touch = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
      if (!touch || event.pointerType !== 'touch') return;
      const state = window.__moonbit_input;
      state.dx += event.clientX - touch.x;
      state.dy += event.clientY - touch.y;
      touch = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener('pointerup', () => { touch = undefined; });
    canvas.addEventListener('pointercancel', () => { touch = undefined; });
    return createRenderer(canvas, atlas);
  },
};
const names = ['Grass', 'Dirt', 'Stone', 'Sand', 'Wood', 'Brick', 'Planks', 'Leaves', 'Cobble', 'Gravel', 'Clay', 'Snow'];
const keys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'];
for (const [index, name] of names.entries()) {
  const button = document.createElement('button');
  button.className = 'slot';
  button.title = button.ariaLabel = name;
  button.innerHTML = `<span class="swatch"></span><kbd>${'1234567890-='[index]}</kbd>`;
  button.addEventListener('click', () => {
    const state = window.__moonbit_input;
    if (!state) return;
    state.keys[keys[index]] = true;
    requestAnimationFrame(() => requestAnimationFrame(() => { state.keys[keys[index]] = false; }));
  });
  document.getElementById('hotbar').append(button);
}
createIcons({ icons: { Box, Shuffle, Terminal, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronsUp, Pickaxe, Plus } });
document.getElementById('console').addEventListener('submit', event => event.preventDefault());
document.getElementById('console-toggle').addEventListener('click', event => {
  const panel = document.getElementById('console');
  panel.hidden = !panel.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) document.getElementById('cmd-input').focus();
});
for (const button of document.querySelectorAll('[data-key], [data-click]')) {
  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    const state = window.__moonbit_input;
    if (!state) return;
    if (button.dataset.key) state.keys[button.dataset.key] = true;
    else state.clicks[button.dataset.click] = true;
  });
  const release = () => {
    if (window.__moonbit_input && button.dataset.key) window.__moonbit_input.keys[button.dataset.key] = false;
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
}
if (window.__ORBIT__) {
  document.getElementById('host').textContent = 'Connecting';
  window.__ORBIT__.invoke('game.host', {}).then(host => {
    document.getElementById('host').textContent = `${host.name} ${host.version}`;
  }).catch(reportError);
}
const game = document.createElement('script');
game.src = 'game.js';
game.onerror = () => reportError('Could not load game.js. Rebuild the web assets.');
document.body.append(game);
