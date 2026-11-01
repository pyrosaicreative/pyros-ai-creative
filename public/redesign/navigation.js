(() => {
  const menu = document.querySelector('.menu');
  menu.addEventListener('click', () => {
    const open = document.querySelector('nav').classList.toggle('open');
    menu.setAttribute('aria-expanded', open);
  });
  const aboutMenu = document.querySelector('.about-menu'),
    aboutToggle = document.querySelector('.about-toggle'),
    aboutSubmenu = document.querySelector('.about-submenu');
  function setAbout(open) {
    aboutToggle.setAttribute('aria-expanded', String(open));
    aboutSubmenu.hidden = !open;
  }
  aboutMenu.addEventListener('mouseenter', () => setAbout(true));
  aboutMenu.addEventListener('mouseleave', () => {
    if (!aboutMenu.contains(document.activeElement)) setAbout(false);
  });
  aboutMenu.addEventListener('focusin', () => setAbout(true));
  aboutMenu.addEventListener('focusout', (e) => {
    if (!aboutMenu.contains(e.relatedTarget)) setAbout(false);
  });
  aboutToggle.addEventListener('click', () => setAbout(true));
  document.addEventListener('click', (e) => {
    if (!aboutMenu.contains(e.target)) setAbout(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      aboutToggle.focus();
      setAbout(false);
    }
  });
  document.querySelectorAll('.design-header nav>a').forEach((a) => {
    if (
      new URL(a.href).origin === location.origin &&
      new URL(a.href).pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')
    )
      a.setAttribute('aria-current', 'page');
  });
  if (['/about/', '/why-ai-filmmaking/', '/about', '/why-ai-filmmaking'].includes(location.pathname))
    aboutToggle.setAttribute('aria-current', 'page');
})();
