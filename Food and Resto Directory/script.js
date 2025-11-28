document.addEventListener('DOMContentLoaded', () => {
    // Global error handling
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
        showToast('Terjadi kesalahan. Silakan refresh halaman.', 'error');
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise Rejection:', e.reason);
        showToast('Terjadi kesalahan jaringan.', 'error');
    });
    // 1. Ambil elemen-elemen penting dari HTML
    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('category-filter');
    const restoCards = document.querySelectorAll('.resto-card'); // Semua kartu menu

    // Fungsi utama untuk memfilter dan mencari kartu
    const updateDirectory = () => {
        const selectedCategory = categoryFilter.value;
        const searchTerm = searchBar.value.toLowerCase();

        // Loop melalui setiap kartu menu
        restoCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardText = card.textContent.toLowerCase();

            // Logika Filter Kategori: true jika 'all' atau kategori cocok.
            const isCategoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;

            // Logika Pencarian Teks: true jika teks ada di konten kartu
            const isSearchMatch = cardText.includes(searchTerm);

            // Tampilkan kartu HANYA jika memenuhi kedua kriteria
            if (isCategoryMatch && isSearchMatch) {
                // Menggunakan 'flex' karena properti display default card modern adalah flex
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    };

    // 2. Tambahkan Event Listener
    if (categoryFilter) categoryFilter.addEventListener('change', updateDirectory);
    if (searchBar) searchBar.addEventListener('keyup', updateDirectory);

    // Panggil fungsi saat halaman dimuat untuk memastikan semua kartu tampil di awal
    if (restoCards.length > 0) updateDirectory();

    // === WEB STORAGE FEATURES ===

    // 3. Dark Mode Toggle
    const initDarkMode = () => {
        let retryCount = 0;
        const maxRetries = 50; // Further increased retry count

        const findAndInitDarkMode = () => {
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            console.log('Attempting to find dark mode toggle, attempt:', retryCount + 1, 'Element found:', !!darkModeToggle);

            if (!darkModeToggle) {
                retryCount++;
                if (retryCount < maxRetries) {
                    setTimeout(findAndInitDarkMode, 25); // Even shorter retry interval
                } else {
                    console.error('Dark mode toggle not found after', maxRetries, 'retries on page:', window.location.pathname);
                    // Try one more time with a longer delay as fallback
                    setTimeout(() => {
                        const finalAttempt = document.getElementById('dark-mode-toggle');
                        if (finalAttempt) {
                            console.log('Found dark mode toggle on final fallback attempt');
                            initDarkModeToggle(finalAttempt);
                        } else {
                            console.error('Dark mode toggle still not found after all attempts');
                        }
                    }, 200);
                }
                return;
            }

            initDarkModeToggle(darkModeToggle);
        };

        const initDarkModeToggle = (darkModeToggle) => {
            console.log('Dark mode toggle found, initializing...');

            // Load dark mode preference from localStorage
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            document.body.classList.toggle('dark-mode', isDarkMode);
            darkModeToggle.checked = isDarkMode;

            // Toggle dark mode - add listener to both checkbox and its label for better compatibility
            const toggleFunction = () => {
                const isEnabled = darkModeToggle.checked;
                console.log('Dark mode toggled:', isEnabled);
                document.body.classList.toggle('dark-mode', isEnabled);
                localStorage.setItem('darkMode', isEnabled);
            };

            darkModeToggle.addEventListener('change', toggleFunction);

            // Also add to the label for index.html compatibility
            const label = darkModeToggle.closest('label');
            if (label) {
                console.log('Adding click listener to label');
                label.addEventListener('click', (e) => {
                    // Small delay to let the checkbox state update first
                    setTimeout(() => {
                        toggleFunction();
                    }, 10);
                });
            }

            // Additional fallback: listen for clicks on the theme-toggle container
            const themeToggleContainer = darkModeToggle.closest('.theme-toggle');
            if (themeToggleContainer) {
                console.log('Adding click listener to theme-toggle container');
                themeToggleContainer.addEventListener('click', (e) => {
                    // Only trigger if the click wasn't on the checkbox itself
                    if (e.target !== darkModeToggle) {
                        setTimeout(() => {
                            toggleFunction();
                        }, 10);
                    }
                });
            }

            // Extra fallback: listen for any click on the toggle area
            const toggleLabel = darkModeToggle.parentNode.querySelector('.toggle-label');
            if (toggleLabel) {
                console.log('Adding click listener to toggle label text');
                toggleLabel.addEventListener('click', () => {
                    setTimeout(() => {
                        darkModeToggle.checked = !darkModeToggle.checked;
                        toggleFunction();
                    }, 10);
                });
            }
        };

        findAndInitDarkMode();
    };

    // 4. Favorites Functionality
    const initFavorites = () => {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        // Update favorite buttons based on stored favorites
        favoriteButtons.forEach(btn => {
            const itemId = btn.getAttribute('data-item-id');
            const isFavorited = favorites.includes(itemId);
            btn.classList.toggle('favorited', isFavorited);
            btn.innerHTML = isFavorited ? '❤️' : '🤍';
        });

        // Handle favorite button clicks
        favoriteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.getAttribute('data-item-id');
                let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

                if (favorites.includes(itemId)) {
                    // Remove from favorites
                    favorites = favorites.filter(id => id !== itemId);
                    btn.classList.remove('favorited');
                    btn.innerHTML = '🤍';
                } else {
                    // Add to favorites
                    favorites.push(itemId);
                    btn.classList.add('favorited');
                    btn.innerHTML = '❤️';
                }

                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoritesDisplay();
            });
        });
    };

    // 5. Shopping Cart Functionality
    const initShoppingCart = () => {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        const cartCount = document.getElementById('cart-count');
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

        // Update cart count display
        const updateCartCount = () => {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            if (cartCount) cartCount.textContent = totalItems;
        };

        updateCartCount();

        // Handle add to cart button clicks
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.getAttribute('data-item-id');
                const itemName = btn.getAttribute('data-item-name');
                const itemPrice = parseInt(btn.getAttribute('data-item-price'));

                // Check if item already in cart
                const existingItem = cartItems.find(item => item.id === itemId);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cartItems.push({
                        id: itemId,
                        name: itemName,
                        price: itemPrice,
                        quantity: 1
                    });
                }

                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                updateCartCount();

                // Show success message
                showNotification(`${itemName} ditambahkan ke keranjang!`);
            });
        });
    };

    // 6. Favorites Display (for favorites page if exists)
    const updateFavoritesDisplay = () => {
        const favoritesContainer = document.getElementById('favorites-container');
        if (!favoritesContainer) return;

        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favoritesContainer.innerHTML = '';

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>Belum ada item favorit.</p>';
            return;
        }

        // Display favorite items (this would need to be customized based on your data structure)
        favorites.forEach(itemId => {
            const itemElement = document.createElement('div');
            itemElement.className = 'favorite-item';
            itemElement.innerHTML = `<p>Item ID: ${itemId}</p>`;
            favoritesContainer.appendChild(itemElement);
        });
    };

    // 7. Cart Display (for cart page if exists)
    const updateCartDisplay = () => {
        const cartContainer = document.getElementById('cart-container');
        if (!cartContainer) return;

        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        cartContainer.innerHTML = '';

        if (cartItems.length === 0) {
            cartContainer.innerHTML = '<p>Keranjang kosong.</p>';
            return;
        }

        let total = 0;
        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <p>${item.name} - ${item.quantity}x - Rp ${(item.price * item.quantity).toLocaleString()}</p>
                <button class="remove-from-cart" data-item-id="${item.id}">Hapus</button>
            `;
            cartContainer.appendChild(itemElement);
            total += item.price * item.quantity;
        });

        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total';
        totalElement.innerHTML = `<strong>Total: Rp ${total.toLocaleString()}</strong>`;
        cartContainer.appendChild(totalElement);

        // Add remove functionality
        document.querySelectorAll('.remove-from-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.getAttribute('data-item-id');
                let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
                cartItems = cartItems.filter(item => item.id !== itemId);
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                updateCartDisplay();
                updateCartCount();
            });
        });
    };

    // 8. Notification System (Toast)
    const showToast = (message, type = 'success') => {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        toast.style.cssText = `
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        document.getElementById('toast-container').appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    };

    // 9. Pagination Functionality
    const initPagination = () => {
        const restoList = document.getElementById('resto-list');
        const paginationControls = document.getElementById('pagination-controls');
        if (!restoList || !paginationControls) return;

        const itemsPerPage = 6;
        let currentPage = 1;
        const allItems = Array.from(restoList.children);

        const updatePagination = () => {
            const filteredItems = allItems.filter(item => item.style.display !== 'none');
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

            // Show/hide items based on current page
            filteredItems.forEach((item, index) => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                item.style.display = (index >= startIndex && index < endIndex) ? 'flex' : 'none';
            });

            // Generate pagination buttons
            paginationControls.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement('li');
                li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
                paginationControls.appendChild(li);
            }

            // Add event listeners to pagination buttons
            document.querySelectorAll('.page-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = parseInt(e.target.getAttribute('data-page'));
                    updatePagination();
                });
            });
        };

        // Initial pagination setup
        updatePagination();

        // Update pagination when filters change
        const originalUpdateDirectory = updateDirectory;
        updateDirectory = () => {
            originalUpdateDirectory();
            currentPage = 1; // Reset to first page
            updatePagination();
        };
    };

    // 10. Advanced Filters Functionality
    const initAdvancedFilters = () => {
        const priceFilter = document.getElementById('price-filter');
        const spicyFilter = document.getElementById('spicy-filter');
        const dietaryFilter = document.getElementById('dietary-filter');

        const applyAdvancedFilters = () => {
            const selectedPrice = priceFilter ? priceFilter.value : 'all';
            const selectedSpicy = spicyFilter ? spicyFilter.value : 'all';
            const selectedDietary = dietaryFilter ? dietaryFilter.value : 'all';

            restoCards.forEach(card => {
                const cardPrice = card.getAttribute('data-price-range');
                const cardSpicy = card.getAttribute('data-spicy');
                const cardDietary = card.getAttribute('data-dietary') || 'all'; // Assuming dietary data is added

                const priceMatch = selectedPrice === 'all' || cardPrice === selectedPrice;
                const spicyMatch = selectedSpicy === 'all' || cardSpicy === selectedSpicy;
                const dietaryMatch = selectedDietary === 'all' || cardDietary === selectedDietary;

                if (priceMatch && spicyMatch && dietaryMatch) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });

            // Update pagination after filtering
            if (typeof updatePagination === 'function') updatePagination();
        };

        if (priceFilter) priceFilter.addEventListener('change', applyAdvancedFilters);
        if (spicyFilter) spicyFilter.addEventListener('change', applyAdvancedFilters);
        if (dietaryFilter) dietaryFilter.addEventListener('change', applyAdvancedFilters);
    };

    // 11. Location-based Search using Geolocation API
    const initLocationSearch = () => {
        const locationBtn = document.getElementById('location-search-btn');
        if (!locationBtn) return;

        locationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // For demo purposes, we'll simulate finding nearby restaurants
                    // In a real app, you'd send this to a backend API
                    showToast(`Location found: ${lat.toFixed(2)}, ${lng.toFixed(2)}. Searching nearby restaurants...`, 'success');

                    // Simulate API call delay
                    setTimeout(() => {
                        showToast('Found 3 restaurants within 5km!', 'success');
                        // Here you would filter and display nearby restaurants
                    }, 2000);
                }, (error) => {
                    showToast('Unable to get your location. Please check permissions.', 'error');
                });
            } else {
                showToast('Geolocation is not supported by this browser.', 'error');
            }
        });
    };

    // 12. Map Integration (Placeholder for Google Maps or similar)
    const initMapIntegration = () => {
        // This would integrate with Google Maps API or similar
        // For now, we'll add a placeholder function
        const mapPlaceholder = () => {
            showToast('Map integration would show restaurant locations here.', 'info');
        };

        // You could call this when showing restaurant details
        // mapPlaceholder();
    };

    // 13. Search by Ingredients (Placeholder)
    const initIngredientSearch = () => {
        // This would allow searching by specific ingredients
        // For now, we'll enhance the existing search to include ingredients
        const originalUpdateDirectory = updateDirectory;
        updateDirectory = () => {
            const searchTerm = searchBar.value.toLowerCase();
            const selectedCategory = categoryFilter.value;

            restoCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const cardText = card.textContent.toLowerCase();
                const cardIngredients = card.getAttribute('data-ingredients') || ''; // Assuming ingredients data

                const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
                const textMatch = cardText.includes(searchTerm) || cardIngredients.includes(searchTerm);

                card.style.display = (categoryMatch && textMatch) ? 'flex' : 'none';
            });
        };
    };

    // 14. Loading Animations and Transitions
    const initLoadingAnimations = () => {
        // Add loading class to body initially
        document.body.classList.add('loading');

        // Remove loading class after page loads
        window.addEventListener('load', () => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        });

        // Add fade-in animation to cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        restoCards.forEach(card => {
            observer.observe(card);
        });
    };

    // 15. Smooth Scrolling
    const initSmoothScrolling = () => {
        // Add smooth scrolling to all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    };

    // 16. Back-to-Top Button
    const initBackToTop = () => {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
            display: none;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(backToTopBtn);

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };

    // 17. Enhanced Mobile Experience
    const initMobileExperience = () => {
        // Touch interactions for mobile
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Add swipe gestures for carousel (if implemented)
            // Add touch-friendly button sizes
            document.querySelectorAll('button').forEach(btn => {
                btn.style.minHeight = '44px';
                btn.style.minWidth = '44px';
            });

            // Improve form inputs for mobile
            document.querySelectorAll('input, select, textarea').forEach(input => {
                input.style.fontSize = '16px'; // Prevent zoom on iOS
            });
        }
    };

    // 18. Accessibility Features
    const initAccessibility = () => {
        // Add ARIA labels where missing
        document.querySelectorAll('button:not([aria-label]):not([title])').forEach(btn => {
            const text = btn.textContent.trim();
            if (text) {
                btn.setAttribute('aria-label', text);
            }
        });

        // Keyboard navigation for custom elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close modals/popups
                const popups = document.querySelectorAll('.popup-overlay[style*="display: flex"]');
                popups.forEach(popup => {
                    popup.style.display = 'none';
                });
            }
        });

        // Focus management
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(document.querySelectorAll(focusableElements));
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    };

    // 19. Search History Functionality
    const initSearchHistory = () => {
        const searchBar = document.getElementById('search-bar');
        if (!searchBar) return;

        // Load search history
        const loadSearchHistory = () => {
            const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
            return history;
        };

        // Save search to history
        const saveSearchToHistory = (query) => {
            if (!query.trim()) return;

            let history = loadSearchHistory();
            // Remove if already exists
            history = history.filter(item => item.query !== query);
            // Add to beginning
            history.unshift({
                query: query,
                timestamp: new Date().toISOString()
            });
            // Keep only last 10 searches
            history = history.slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(history));
        };

        // Show search suggestions
        const showSearchSuggestions = () => {
            const history = loadSearchHistory();
            if (history.length === 0) return;

            // Create suggestions dropdown
            let suggestionsContainer = document.getElementById('search-suggestions');
            if (!suggestionsContainer) {
                suggestionsContainer = document.createElement('div');
                suggestionsContainer.id = 'search-suggestions';
                suggestionsContainer.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-top: none;
                    border-radius: 0 0 5px 5px;
                    z-index: 1000;
                    max-height: 200px;
                    overflow-y: auto;
                    display: none;
                `;
                searchBar.parentNode.style.position = 'relative';
                searchBar.parentNode.appendChild(suggestionsContainer);
            }

            suggestionsContainer.innerHTML = `
                <div style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">
                    Riwayat Pencarian
                </div>
                ${history.map(item => `
                    <div class="search-suggestion" data-query="${item.query}" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0;">
                        ${item.query}
                    </div>
                `).join('')}
            `;

            suggestionsContainer.style.display = 'block';

            // Add click handlers
            document.querySelectorAll('.search-suggestion').forEach(suggestion => {
                suggestion.addEventListener('click', () => {
                    searchBar.value = suggestion.getAttribute('data-query');
                    suggestionsContainer.style.display = 'none';
                    updateDirectory();
                });
            });
        };

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            const suggestions = document.getElementById('search-suggestions');
            if (suggestions && !searchBar.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.style.display = 'none';
            }
        });

        // Show suggestions on focus
        searchBar.addEventListener('focus', showSearchSuggestions);

        // Save search on enter key
        searchBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveSearchToHistory(searchBar.value);
            }
        });
    };

    // 20. Newsletter Subscription
    const initNewsletter = () => {
        // Add newsletter signup to footer or create a dedicated section
        const footer = document.querySelector('footer');
        if (!footer) return;

        const newsletterSection = document.createElement('div');
        newsletterSection.className = 'newsletter-section';
        newsletterSection.innerHTML = `
            <div class="newsletter-content">
                <h3>Berlangganan Newsletter</h3>
                <p>Dapatkan update resep terbaru dan promo spesial LAKSA-NA</p>
                <form id="newsletter-form" class="newsletter-form">
                    <input type="email" id="newsletter-email" placeholder="Masukkan email Anda" required>
                    <button type="submit" class="btn-primary">Berlangganan</button>
                </form>
            </div>
        `;

        footer.insertBefore(newsletterSection, footer.firstChild);

        // Handle newsletter subscription
        const newsletterForm = document.getElementById('newsletter-form');
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletter-email').value;

            // Save to localStorage (in real app, this would be sent to backend)
            const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers')) || [];
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
                showToast('Terima kasih telah berlangganan newsletter!', 'success');
                newsletterForm.reset();
            } else {
                showToast('Email sudah terdaftar.', 'info');
            }
        });
    };

    // 21. FAQ Page Creation (Placeholder)
    const initFAQ = () => {
        // This would create an FAQ page, but for now we'll add FAQ functionality
        // to the about page or create a simple FAQ modal
        const faqData = [
            {
                question: "Apa itu LAKSA-NA?",
                answer: "LAKSA-NA adalah direktori kuliner khusus untuk berbagai jenis laksa dan hidangan Asia Tenggara lainnya."
            },
            {
                question: "Bagaimana cara memesan?",
                answer: "Anda dapat memesan melalui tombol 'Pesan Sekarang' di halaman detail menu, lalu pilih metode dine-in atau takeaway."
            },
            {
                question: "Apakah ada pengiriman?",
                answer: "Saat ini kami hanya menyediakan layanan dine-in dan takeaway. Pengiriman mungkin tersedia di masa depan."
            },
            {
                question: "Bagaimana cara membagikan resep?",
                answer: "Kunjungi halaman Resep dan klik tombol 'Bagikan Resep' untuk membagikan resep masakan Anda."
            }
        ];

        // Add FAQ button to navigation or footer
        const nav = document.querySelector('.header-center nav');
        if (nav) {
            const faqLink = document.createElement('a');
            faqLink.href = '#';
            faqLink.textContent = 'FAQ';
            faqLink.addEventListener('click', (e) => {
                e.preventDefault();
                showFAQModal(faqData);
            });
            nav.appendChild(faqLink);
        }
    };

    // Helper function to show FAQ modal
    const showFAQModal = (faqData) => {
        const faqModal = document.createElement('div');
        faqModal.className = 'modal-overlay';
        faqModal.innerHTML = `
            <div class="modal-content faq-modal">
                <button class="modal-close">&times;</button>
                <h2>Pertanyaan yang Sering Diajukan</h2>
                <div class="faq-list">
                    ${faqData.map(item => `
                        <div class="faq-item">
                            <h4>${item.question}</h4>
                            <p>${item.answer}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(faqModal);

        // Close modal
        faqModal.querySelector('.modal-close').addEventListener('click', () => {
            faqModal.remove();
        });

        faqModal.addEventListener('click', (e) => {
            if (e.target === faqModal) {
                faqModal.remove();
            }
        });
    };

    // Performance optimization: Debounce search input
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Apply debouncing to search input
    if (searchBar) {
        const debouncedUpdateDirectory = debounce(updateDirectory, 300);
        searchBar.addEventListener('keyup', debouncedUpdateDirectory);
        searchBar.removeEventListener('keyup', updateDirectory); // Remove original listener
    }

    // 9. Initialize all features
    initDarkMode();
    initFavorites();
    initShoppingCart();
    initPagination();
    initAdvancedFilters();
    initLocationSearch();
    initMapIntegration();
    initIngredientSearch();
    initLoadingAnimations();
    initSmoothScrolling();
    initBackToTop();
    initMobileExperience();
    initAccessibility();
    initSearchHistory();
    initNewsletter();
    initFAQ();
    updateFavoritesDisplay();
    updateCartDisplay();
});
