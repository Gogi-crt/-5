// Основные функции для сайта
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех компонентов
    initComponents();

    // Обработка форм
    initForms();

    // Обработка корзины
    initCart();

    // Обработка галереи продуктов
    initProductGallery();
});

// Инициализация компонентов
function initComponents() {
    // Активация тултипов
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Активация всплывающих окон
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

    // Обработка счетчиков
    initCounters();

    // Обработка анимаций при прокрутке
    initScrollAnimations();
}

// Инициализация форм
function initForms() {
    // Валидация форм
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                showNotification('Пожалуйста, заполните все обязательные поля правильно', 'warning');
            }
        });
    });

    // Обработка ввода телефона
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            formatPhoneNumber(this);
        });
    });

    // Обработка показа/скрытия пароля
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);

            const icon = this.querySelector('i');
            icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
    });
}

// Инициализация корзины
function initCart() {
    // Обновление количества товаров
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    quantityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.quantity-controls').querySelector('.quantity-input');
            const action = this.querySelector('.bi').classList.contains('bi-plus') ? 'increase' : 'decrease';
            updateQuantity(input, action);
        });
    });

    // Валидация ввода количества
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateQuantity(this);
        });
    });
}

// Инициализация галереи продуктов
function initProductGallery() {
    const mainImage = document.querySelector('.main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const zoomOverlay = document.querySelector('.zoom-overlay');

    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                // Обновление главного изображения
                mainImage.src = this.src;

                // Обновление активной миниатюры
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Зум изображения
        if (mainImage && zoomOverlay) {
            mainImage.addEventListener('click', function() {
                const zoomedImage = document.getElementById('zoomedImage');
                if (zoomedImage) {
                    zoomedImage.src = this.src;
                    zoomOverlay.style.display = 'flex';
                }
            });

            // Закрытие зума
            const closeZoom = document.querySelector('.zoom-overlay .btn-close');
            if (closeZoom) {
                closeZoom.addEventListener('click', function() {
                    zoomOverlay.style.display = 'none';
                });
            }

            // Закрытие зума при клике на оверлей
            zoomOverlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        }
    }
}

// Инициализация счетчиков
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const increment = target / 200;
        let current = 0;

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.innerText = Math.ceil(current);
                setTimeout(updateCounter, 1);
            } else {
                counter.innerText = target;
            }
        };

        updateCounter();
    });
}

// Инициализация анимаций при прокрутке
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Форматирование номера телефона
function formatPhoneNumber(input) {
    let x = input.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    input.value = '+7' + (x[2] ? ' (' + x[2] : '') + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
}

// Валидация формы
function validateForm(form) {
    let isValid = true;
    const requiredInputs = form.querySelectorAll('[required]');

    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    // Проверка email
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            isValid = false;
            emailInput.classList.add('is-invalid');
        }
    }

    // Проверка пароля
    const passwordInput = form.querySelector('input[name="password"]');
    const confirmPasswordInput = form.querySelector('input[name="confirm_password"]');
    if (passwordInput && confirmPasswordInput) {
        if (passwordInput.value !== confirmPasswordInput.value) {
            isValid = false;
            confirmPasswordInput.classList.add('is-invalid');
        }
    }

    return isValid;
}

// Обновление количества товара
function updateQuantity(input, action) {
    const currentValue = parseInt(input.value);
    const min = parseInt(input.getAttribute('min')) || 1;
    const max = parseInt(input.getAttribute('max')) || 999;

    let newValue = currentValue;

    if (action === 'increase' && currentValue < max) {
        newValue = currentValue + 1;
    } else if (action === 'decrease' && currentValue > min) {
        newValue = currentValue - 1;
    }

    input.value = newValue;

    // Имитация отправки формы
    const form = input.closest('form');
    if (form) {
        // form.submit(); // Раскомментировать для реальной отправки
    }
}

// Валидация количества товара
function validateQuantity(input) {
    const value = parseInt(input.value);
    const min = parseInt(input.getAttribute('min')) || 1;
    const max = parseInt(input.getAttribute('max')) || 999;

    if (value < min) {
        input.value = min;
    } else if (value > max) {
        input.value = max;
        showNotification(`Максимальное количество: ${max} шт.`, 'warning');
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создание элемента уведомления
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';

    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${icon} me-2"></i>
            ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Получить иконку для уведомления
function getNotificationIcon(type) {
    const icons = {
        'success': 'bi-check-circle-fill',
        'danger': 'bi-exclamation-circle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'info': 'bi-info-circle-fill'
    };
    return icons[type] || 'bi-info-circle-fill';
}

// Добавить товар в корзину
function addToCart(productId, quantity = 1) {
    // Имитация добавления в корзину
    showNotification('Товар добавлен в корзину', 'success');

    // Обновление счетчика корзины
    updateCartCount(1);
}

// Обновить счетчик корзины
function updateCartCount(count) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const currentCount = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = currentCount + count;

        // Анимация
        cartCount.classList.add('animate__animated', 'animate__bounce');
        setTimeout(() => {
            cartCount.classList.remove('animate__animated', 'animate__bounce');
        }, 1000);
    }
}

// Переключение вида каталога (сетка/список)
function toggleView(viewType) {
    const productsContainer = document.getElementById('productsView');
    if (productsContainer) {
        if (viewType === 'grid') {
            productsContainer.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4';
        } else if (viewType === 'list') {
            productsContainer.className = 'row row-cols-1 g-4';
            productsContainer.querySelectorAll('.col').forEach(col => {
                col.className = 'col-12';
            });
        }
    }
}

// Фильтрация продуктов
function filterProducts() {
    const searchInput = document.querySelector('input[name="search"]');
    const categorySelect = document.querySelector('select[name="category"]');
    const minPrice = document.querySelector('input[name="min_price"]');
    const maxPrice = document.querySelector('input[name="max_price"]');

    // Здесь будет логика фильтрации
    // В реальном проекте это будет AJAX запрос или перезагрузка страницы с параметрами
}

// Инициализация слайдера цен
function initPriceSlider() {
    const priceSlider = document.getElementById('priceRange');
    if (priceSlider) {
        const priceOutput = document.getElementById('priceOutput');

        priceSlider.addEventListener('input', function() {
            if (priceOutput) {
                priceOutput.textContent = `${this.value} ₽`;
            }
        });
    }
}

// Загрузка дополнительных продуктов
function loadMoreProducts() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Загрузка...';
            this.disabled = true;

            // Имитация загрузки
            setTimeout(() => {
                // Здесь будет AJAX запрос для загрузки новых продуктов
                showNotification('Продукты успешно загружены', 'success');
                this.innerHTML = 'Загрузить еще';
                this.disabled = false;
            }, 1500);
        });
    }
}

// Сохранение в избранное
function toggleFavorite(productId) {
    const favoriteBtn = document.querySelector(`[data-product-id="${productId}"] .favorite-btn`);
    if (favoriteBtn) {
        const isFavorite = favoriteBtn.classList.contains('text-danger');

        if (isFavorite) {
            favoriteBtn.classList.remove('text-danger');
            favoriteBtn.classList.add('text-muted');
            showNotification('Удалено из избранного', 'info');
        } else {
            favoriteBtn.classList.remove('text-muted');
            favoriteBtn.classList.add('text-danger');
            showNotification('Добавлено в избранное', 'success');
        }
    }
}

// Инициализация всего при загрузке страницы
window.addEventListener('load', function() {
    // Инициализация слайдера цен
    initPriceSlider();

    // Инициализация кнопки "Загрузить еще"
    loadMoreProducts();

    // Инициализация обработчиков избранного
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.closest('[data-product-id]').getAttribute('data-product-id');
            toggleFavorite(productId);
        });
    });
});