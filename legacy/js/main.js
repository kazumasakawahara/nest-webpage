document.addEventListener('DOMContentLoaded', function () {

  // === ハンバーガーメニュー ===
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.header__nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      hamburger.setAttribute(
        'aria-expanded',
        nav.classList.contains('is-open')
      );
    });
  }

  // === スムーズスクロール（同一ページ内アンカー） ===
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // === 現在のページをナビにアクティブ表示 ===
  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.header__nav a').forEach(function (link) {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath ||
        (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('is-active');
    }
  });

});
