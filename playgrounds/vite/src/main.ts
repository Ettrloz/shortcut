import { shortcut } from '@ettrloz/shortcut';

console.log('ok');

shortcut('ctrl+[sv+-]+shift', () => {
  document.body.innerHTML += 'ok';
});
