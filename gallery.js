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

const showLightboxPhoto = (index) => {
  lightboxIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[lightboxIndex];
  lightboxImage.src = photo.dataset.full;
  lightboxImage.alt = photo.querySelector('img').alt;
  counter.textContent = `${lightboxIndex + 1} / ${galleryPhotos.length}`;
};

const closeLightbox = () => {
  if (lightbox.open) lightbox.close();
};

galleryPhotos.forEach((photo, index) => {
  const img = photo.querySelector('img');
  const markLoaded = () => img.classList.add('is-loaded');
  if (img.complete) markLoaded();
  else {
    img.addEventListener('load', markLoaded, { once: true });
    img.addEventListener('error', markLoaded, { once: true });
  }
  photo.addEventListener('click', () => {
    showLightboxPhoto(index);
    lightbox.showModal();
    document.documentElement.classList.add('lightbox-open');
    document.body.classList.add('lightbox-open');
  });
});

closeButton.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox.addEventListener('close', () => {
  document.documentElement.classList.remove('lightbox-open');
  document.body.classList.remove('lightbox-open');
});
prevButton.addEventListener('click', (event) => {
  event.stopPropagation();
  showLightboxPhoto(lightboxIndex - 1);
});
nextButton.addEventListener('click', (event) => {
  event.stopPropagation();
  showLightboxPhoto(lightboxIndex + 1);
});
document.addEventListener('keydown', (event) => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); showLightboxPhoto(lightboxIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showLightboxPhoto(lightboxIndex + 1); }
  if (event.key === 'Escape') closeLightbox();
});

let touchStartX = 0;
let touchStartY = 0;
lightbox.addEventListener('touchstart', (event) => {
  if (event.touches.length !== 1) return;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });
lightbox.addEventListener('touchend', (event) => {
  if (event.changedTouches.length !== 1) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
    showLightboxPhoto(lightboxIndex + (dx < 0 ? 1 : -1));
  }
}, { passive: true });
