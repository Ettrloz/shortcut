import { instance } from './shared';

export const shortcut = instance.shortcut;

shortcut(document.body)('a', event => {
  event.target;
});
