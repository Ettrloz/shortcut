import { shortcut, instance } from '@ettrloz/shortcut';

(window as any).instance = instance;

const late = shortcut(document.body);

shortcut('ctrl+[zy]', ({ matched }) => {
  if (!matched || matched[0] !== 'ctrl') {
    return;
  }

  switch (matched[1]) {
    case 'z':
      document.body.innerHTML += '<br>undo';

      break;
    case 'y':
      document.body.innerHTML += '<br>redo';

      break;
  }
}).dispatch();

shortcut('escape', ({ matched }) => {
  document.body.innerHTML += '<br>done';
});

shortcut('ctrl+k', ({ matched }) => {
  document.body.innerHTML += '<br>search';
});

late('ctrl+l', ({ matched }) => {
  document.body.innerHTML += '<br>open';
});
