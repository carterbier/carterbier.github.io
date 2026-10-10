'use strict';

document.addEventListener('click', (event) => {
  document.querySelectorAll('.nav-menu[open]').forEach((menu) => {
    if (!menu.contains(event.target)) menu.removeAttribute('open');
  });
});

const galleryPhotos = Array.from(document.querySelectorAll('.photo'));
const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox.querySelector('.lightbox-image');
const closeButton = lightbox.querySelector('.lightbox-close');
const prevButton = lightbox.querySelector('.lightbox-prev');
const nextButton = lightbox.querySelector('.lightbox-next');
const counter = lightbox.querySelector('.lightbox-counter');
let lightboxIndex = 0;
let requestId = 0;
let lastTrigger = null;
const cache = new Map();

const getFullSrc = (index) => galleryPhotos[(index + galleryPhotos.length) % galleryPhotos.length].dataset.full;
const preload = (index) => {
  const src = getFullSrc(index);
  if (cache.has(src)) return cache.get(src);
  const image = new Image();
  const promise = new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = reject;
  });
  cache.set(src, promise);
  promise.catch(() => cache.delete(src));
  image.src = src;
  return promise;
};

const showLightboxPhoto = (index) => {
  lightboxIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  const token = ++requestId;
  const photo = galleryPhotos[lightboxIndex];
  const src = photo.dataset.full;
  counter.textContent = `${lightboxIndex + 1} / ${galleryPhotos.length}`;
  lightbox.classList.add('is-loading');
  lightboxImage.alt = photo.querySelector('img').alt;
  preload(lightboxIndex).then(() => {
    if (token !== requestId || !lightbox.open) return;
    lightboxImage.src = src;
    lightbox.classList.remove('is-loading');
    preload(lightboxIndex - 1);
    preload(lightboxIndex + 1);
  }).catch(() => {
    if (token === requestId) {
      lightbox.classList.remove('is-loading');
      lightboxImage.removeAttribute('src');
    }
  });
};

const closeLightbox = () => { if (lightbox.open) lightbox.close(); };

galleryPhotos.forEach((photo, index) => {
  photo.addEventListener('click', () => {
    lastTrigger = photo;
    lightboxImage.removeAttribute('src');
    lightbox.showModal();
    document.documentElement.classList.add('lightbox-open');
    document.body.classList.add('lightbox-open');
    showLightboxPhoto(index);
  });
});

closeButton.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
lightbox.addEventListener('close', () => {
  ++requestId;
  lightbox.classList.remove('is-loading');
  document.documentElement.classList.remove('lightbox-open');
  document.body.classList.remove('lightbox-open');
  if (lastTrigger) lastTrigger.focus({ preventScroll: true });
});
prevButton.addEventListener('click', (event) => { event.stopPropagation(); showLightboxPhoto(lightboxIndex - 1); });
nextButton.addEventListener('click', (event) => { event.stopPropagation(); showLightboxPhoto(lightboxIndex + 1); });
document.addEventListener('keydown', (event) => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); showLightboxPhoto(lightboxIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showLightboxPhoto(lightboxIndex + 1); }
  if (event.key === 'Escape') closeLightbox();
});
