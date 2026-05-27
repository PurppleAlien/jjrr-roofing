/* ============================================================
   JJRR — Premium Roofing & Home Services
   Scripts: Language, UI, Map, Carousel, Form
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===== LANGUAGE TOGGLE =====
  let currentLang = 'en';
  const langToggle = document.getElementById('langToggle');

  window.toggleLang = function () {
    currentLang = currentLang === 'en' ? 'es' : 'en';
    document.body.classList.toggle('lang-en', currentLang === 'en');
    document.body.classList.toggle('lang-es', currentLang === 'es');
    langToggle.textContent = currentLang === 'en' ? 'ES' : 'EN';
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-placeholder-' + currentLang + ']').forEach(el => {
      el.placeholder = el.getAttribute('data-placeholder-' + currentLang);
    });
  };

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.getElementById('navbar');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ===== MOBILE MENU =====
  const mobileMenu = document.getElementById('mobile-menu');
  const burger = document.getElementById('burger');

  window.toggleMobile = function () {
    const open = mobileMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  window.closeMobile = function () {
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMobile();
    }
  });

  // Close mobile menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }, { passive: true });

  // ===== VIDEO PLAY/PAUSE =====
  window.toggleVideo = function (videoId, wrapId) {
    const video = document.getElementById(videoId);
    const wrap = document.getElementById(wrapId);
    const icon = document.getElementById('icon' + videoId.slice(-1));

    if (video.paused) {
      video.play();
      wrap.classList.add('playing');
      icon.className = 'fas fa-pause';
    } else {
      video.pause();
      wrap.classList.remove('playing');
      icon.className = 'fas fa-play';
    }
  };

  document.querySelectorAll('.video-wrap video').forEach(v => {
    v.addEventListener('ended', () => {
      const wrap = v.closest('.video-wrap');
      wrap.classList.remove('playing');
      const icon = wrap.querySelector('.play-circle i');
      if (icon) icon.className = 'fas fa-play';
    });
  });

  // ===== CAROUSEL =====
  let carouselIndex = 0;
  const slides = document.querySelectorAll('.carousel-slide');
  const track = document.getElementById('carouselTrack');
  const dotsEl = document.getElementById('carouselDots');
  let slidesPerView = getSlidesPerView();
  let autoAdvance = null;
  let isPaused = false;

  function getSlidesPerView() {
    const w = window.innerWidth;
    return w <= 768 ? 1 : w <= 1024 ? 2 : 3;
  }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const total = Math.ceil(slides.length / slidesPerView);
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i === carouselIdxToDot() ? ' active' : '');
      d.setAttribute('role', 'button');
      d.setAttribute('tabindex', '0');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', () => goToSlide(i));
      d.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToSlide(i);
        }
      });
      dotsEl.appendChild(d);
    }
  }

  function carouselIdxToDot() {
    return Math.floor(carouselIndex / slidesPerView);
  }

  function updateCarousel() {
    if (!slides.length || !track) return;
    const wrap = slides[0].parentElement.parentElement;
    const w = wrap.offsetWidth;
    const gap = 21;
    const sw = (w - gap * (slidesPerView - 1)) / slidesPerView;

    slides.forEach(s => { s.style.minWidth = sw + 'px'; });
    track.style.transform = 'translateX(-' + (carouselIndex * (sw + gap)) + 'px)';

    document.querySelectorAll('.carousel-dots .dot').forEach((d, i) => {
      d.classList.toggle('active', i === carouselIdxToDot());
    });
  }

  window.moveCarousel = function (dir) {
    const max = slides.length - slidesPerView;
    carouselIndex = Math.max(0, Math.min(carouselIndex + dir, max));
    updateCarousel();
  };

  function goToSlide(idx) {
    carouselIndex = idx * slidesPerView;
    updateCarousel();
  }

  // Auto-advance
  function startAutoAdvance() {
    if (autoAdvance) return;
    autoAdvance = setInterval(() => {
      if (isPaused) return;
      const max = slides.length - slidesPerView;
      carouselIndex = carouselIndex >= max ? 0 : carouselIndex + 1;
      updateCarousel();
    }, 5500);
  }

  function stopAutoAdvance() {
    if (autoAdvance) {
      clearInterval(autoAdvance);
      autoAdvance = null;
    }
  }

  const carouselWrap = document.querySelector('.carousel-wrap');
  if (carouselWrap) {
    carouselWrap.addEventListener('mouseenter', () => { isPaused = true; });
    carouselWrap.addEventListener('mouseleave', () => { isPaused = false; });
    carouselWrap.addEventListener('focusin', () => { isPaused = true; });
    carouselWrap.addEventListener('focusout', () => { isPaused = false; });

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    carouselWrap.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carouselWrap.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        moveCarousel(diff > 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      slidesPerView = getSlidesPerView();
      carouselIndex = 0;
      buildDots();
      updateCarousel();
    }, 150);
  }, { passive: true });

  if (slides.length) {
    buildDots();
    setTimeout(updateCarousel, 100);
    startAutoAdvance();
  }



  // ===== REVEAL ON SCROLL =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ===== MAP (Leaflet) =====
  const mapContainer = document.getElementById('jjrr-map');
  if (mapContainer) {

    function initMap() {
      if (typeof L === 'undefined') {
        // Leaflet not loaded yet, retry
        setTimeout(initMap, 300);
        return;
      }

      const map = L.map('jjrr-map', {
        center: [28.29, -81.50],
        zoom: 9,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false
      });

      // Custom zoom control position
      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      map.setView([28.29, -81.50], 9);

      map.on('click', () => { map.scrollWheelZoom.enable(); });

      // Geolocation
      const geoBtn = document.createElement('button');
      geoBtn.className = 'geolocate-btn';
      geoBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
      geoBtn.setAttribute('aria-label', 'Find my location');
      geoBtn.title = 'Find my location';
      mapContainer.appendChild(geoBtn);

      let userMarker = null;

      geoBtn.addEventListener('click', () => {
        if (!navigator.geolocation) return;

        geoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        geoBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;

            if (userMarker) {
              map.removeLayer(userMarker);
            }

            userMarker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: '',
                html: '<div style="width:20px;height:20px;background:#25D366;border:3px solid #fff;border-radius:50%;box-shadow:0 0 20px rgba(37,211,102,0.6);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            }).addTo(map);

            userMarker.bindPopup(
              '<div style="background:#111;color:#fff;padding:8px 12px;border-radius:4px;font-family:Montserrat,sans-serif;font-size:13px;">Your Location</div>',
              { closeButton: false }
            ).openPopup();

            map.setView([latitude, longitude], 10);
            geoBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
            geoBtn.disabled = false;
          },
          () => {
            geoBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
            geoBtn.disabled = false;
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });

      // Hide loading overlay
      const loading = document.getElementById('mapLoading');
      if (loading) {
        loading.classList.add('loaded');
      }
    }

    // Small delay to let Leaflet initialize
    setTimeout(initMap, 200);
  }
});
