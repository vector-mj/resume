// Opt-in post enhancements. Every one degrades to "nothing happens" if the
// markup it looks for isn't present, so a post can load this unconditionally.
// Load it AFTER highlight.js: the copy button copies the rendered text either
// way, but wrapping <pre> after highlighting keeps the DOM churn in one place.
(function () {
  'use strict';

  // ---- 1. copy button on every code block -------------------------------
  // .snip is the styleguide's own snippet box, which brings its own button.
  document.querySelectorAll('pre:not(.snip)').forEach(function (pre) {
    if (pre.closest('.copywrap')) return;

    var wrap = document.createElement('div');
    wrap.className = 'copywrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copybtn';
    btn.textContent = 'Copy';
    wrap.appendChild(btn);

    btn.addEventListener('click', function () {
      var text = pre.innerText;                 // innerText, so the CSS-drawn
      function done() {                         // "$ " prompt is NOT copied
        btn.textContent = 'Copied';
        btn.classList.add('done');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('done');
        }, 1200);
      }
      function fallback() {
        var r = document.createRange();
        r.selectNodeContents(pre);
        var s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
        btn.textContent = 'Ctrl+C';
        setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  // ---- 2. live filter over a table --------------------------------------
  document.querySelectorAll('table.filterable').forEach(function (table) {
    var rows = [].slice.call(table.tBodies.length ? table.tBodies[0].rows : table.rows);

    var input = document.createElement('input');
    input.type = 'search';
    input.className = 'tablefilter';
    input.placeholder = 'Filter ' + rows.length + ' rows…';
    input.setAttribute('aria-label', 'Filter table rows');

    var count = document.createElement('p');
    count.className = 'filtercount';
    count.hidden = true;

    table.parentNode.insertBefore(input, table);
    table.parentNode.insertBefore(count, table);

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      rows.forEach(function (row) {
        var hit = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
        row.hidden = !hit;
        if (hit) shown++;
      });
      count.hidden = !q;
      count.textContent = shown + ' of ' + rows.length + ' rows';
    });
  });

  // ---- 3. auto table of contents + heading anchors ----------------------
  // Give any h2/h3 without an id one derived from its text, then fill
  // <div class="toc" data-auto> if the post has one.
  var used = Object.create(null);
  var heads = [].slice.call(document.querySelectorAll('article h2, article h3'));

  heads.forEach(function (h) {
    if (!h.id) {
      var base = h.textContent.trim().toLowerCase()
        .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 50) || 'section';
      var id = base, n = 2;
      while (used[id] || document.getElementById(id)) { id = base + '-' + n++; }
      used[id] = true;
      h.id = id;
    }
    var a = document.createElement('a');
    a.className = 'anchor';
    a.href = '#' + h.id;
    a.textContent = '¶';
    a.setAttribute('aria-label', 'Link to this section');
    h.appendChild(a);
  });

  document.querySelectorAll('.toc[data-auto]').forEach(function (toc) {
    if (!heads.length) { toc.hidden = true; return; }
    var ul = document.createElement('ul');
    heads.forEach(function (h) {
      var li = document.createElement('li');
      if (h.tagName === 'H3') li.style.marginLeft = '1rem';
      var a = document.createElement('a');
      a.href = '#' + h.id;
      // the ¶ anchor is a child node, so read the heading's own first text node
      a.textContent = h.firstChild ? h.firstChild.textContent.trim() : h.id;
      li.appendChild(a);
      ul.appendChild(li);
    });
    toc.appendChild(ul);
  });

  // ---- 4. theme toggle ---------------------------------------------------
  // The <head> snippet already applied the stored theme; this only flips it.
  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    var sync = function () {
      var dark = document.documentElement.dataset.theme === 'dark';
      toggle.textContent = dark ? '☀' : '☾';
      toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    };
    // with no stored choice, reflect what the system is actually showing
    if (!document.documentElement.dataset.theme) {
      document.documentElement.dataset.theme =
        matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    sync();
    toggle.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      sync();
    });
  }
})();
