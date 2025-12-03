import { Utils } from '@troop-themes/main';

document.on('shopify:section:load', ({ target: container }) => {
  const active_section = container.querySelector('[data-section-id]');
  if (active_section) {
    Utils.loadAllTransitions();

    console.log(`Event 'theme:section:load' triggered by .${active_section.classList[0]}`);
    if (typeof active_section.trigger === 'function') active_section.trigger('theme:section:load');
  }
});

document.on('shopify:section:unload', ({ target: container }) => {
  const active_section = container.querySelector('[data-section-id]');

  if (active_section) {
    console.log(`Event 'theme:section:unload' triggered by .${active_section.classList[0]}`);

    if (typeof active_section.trigger === 'function')
      active_section.trigger('theme:section:unload');
  }
});

document.on('shopify:section:select', ({ target: container }) => {
  const active_section = container.querySelector('[data-section-id]');

  if (active_section) {
    console.log(`Event 'theme:section:select' triggered by .${active_section.classList[0]}`);

    if (typeof active_section.open === 'function') active_section.open();
    if (typeof active_section.trigger === 'function')
      active_section.trigger('theme:section:select');
  }
});

document.on('shopify:section:deselect', ({ target: container }) => {
  const active_section = container.querySelector('[data-section-id]');

  if (active_section) {
    console.log(`Event 'theme:section:deselect' triggered by .${active_section.classList[0]}`);

    if (typeof active_section.close === 'function') active_section.close();
    if (typeof active_section.trigger === 'function')
      active_section.trigger('theme:section:deselect');
  }
});

document.on('shopify:section:reorder', ({ target: container }) => {
  const active_section = container.querySelector('[data-section-id]');

  if (active_section) {
    console.log(`Event 'theme:section:reorder' triggered by .${active_section.classList[0]}`);
    if (typeof active_section.trigger === 'function')
      active_section.trigger('theme:section:reorder');
  }
});

document.on('shopify:block:select', ({ target: block }) => {
  console.log(`Event 'theme:block:select' triggered by .${block.classList[0]}`);

  if (typeof block.open === 'function') block.open();
  if (typeof block.trigger === 'function') block.trigger('theme:block:select');
});

document.on('shopify:block:deselect', ({ target: block }) => {
  console.log(`Event 'theme:block:deselect' triggered by .${block.classList[0]}`);

  if (typeof block.close === 'function') block.close();
  if (typeof block.trigger === 'function') block.trigger('theme:block:deselect');
});
