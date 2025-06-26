document.addEventListener('DOMContentLoaded', function() {
  // Анимация счетчиков
  function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target') || +counter.innerText.replace('+', '');
        const count = +counter.innerText.replace('+', '');

        const increment = target / speed;

        if (count < target) {
          counter.innerText = Math.ceil(count + increment);
          setTimeout(updateCount, 10);
        } else {
          if (counter.classList.contains('counter')) {
            counter.innerText = target + (target > 1000 ? '+' : '');
          }
        }
      };

      updateCount();
    });
  }

  // Запуск счетчиков при появлении в области видимости
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter-section').forEach(section => {
    observer.observe(section);
  });

  // Параллакс эффект для героя
  window.addEventListener('scroll', function() {
    const scrollPosition = window.pageYOffset;
    const hero = document.querySelector('.hero-section');

    if (hero) {
      hero.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
    }

    // Добавляем класс при прокрутке для навигации
    const navbar = document.querySelector('.navbar');
    if (scrollPosition > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Инициализация галереи
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const imgSrc = this.querySelector('img').src;
      const modal = document.createElement('div');
      modal.className = 'gallery-modal';
      modal.innerHTML = `
        <div class="gallery-modal-content">
          <span class="gallery-close">&times;</span>
          <img src="${imgSrc}" alt="Gallery image" class="img-fluid">
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector('.gallery-close').addEventListener('click', () => {
        modal.remove();
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    });
  });
});