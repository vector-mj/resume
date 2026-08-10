// Image lightbox. Progressive enhancement: without this file the gallery links
// still open the full-size image, they just do it as a normal page navigation.
// Uses a native <dialog>, so Esc, focus trapping and inertness come for free.
(function () {
  var links = [].slice.call(document.querySelectorAll('.gallery a, a.zoom'));
  if (!links.length) return;

  var dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.innerHTML =
    '<button class="close" type="button" aria-label="Close">Close</button>' +
    '<button class="prev" type="button" aria-label="Previous">&#8592;</button>' +
    '<img alt="">' +
    '<button class="next" type="button" aria-label="Next">&#8594;</button>' +
    '<p class="cap"></p>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('img');
  var cap = dlg.querySelector('.cap');
  var at  = 0;

  function show(i) {
    at = (i + links.length) % links.length;   // wrap both directions
    var a = links[at];
    var thumb = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = thumb ? thumb.alt : '';
    // caption comes from the sibling figcaption, falling back to the alt text
    var fig = a.closest('figure');
    var fc  = fig && fig.querySelector('figcaption');
    cap.textContent = fc ? fc.textContent : img.alt;
    // a lone image has nothing to page through
    dlg.querySelector('.prev').hidden = links.length < 2;
    dlg.querySelector('.next').hidden = links.length < 2;
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;  // let "open in new tab" work
      e.preventDefault();
      show(i);
      dlg.showModal();
    });
  });

  dlg.querySelector('.close').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.prev').addEventListener('click', function () { show(at - 1); });
  dlg.querySelector('.next').addEventListener('click', function () { show(at + 1); });

  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });

  // click the backdrop (i.e. the dialog itself, not the image) to dismiss
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  // don't hold a big image in memory once it's closed.
  // removeAttribute, not src='' — an empty src resolves to the page URL and
  // makes the browser re-request the document as an image.
  dlg.addEventListener('close', function () { img.removeAttribute('src'); });
})();
