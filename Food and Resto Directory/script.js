document.addEventListener('DOMContentLoaded', () => {
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
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (!darkModeToggle) return;

        // Load dark mode preference from localStorage
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        darkModeToggle.checked = isDarkMode;

        // Toggle dark mode
        darkModeToggle.addEventListener('change', () => {
            const isEnabled = darkModeToggle.checked;
            document.body.classList.toggle('dark-mode', isEnabled);
            localStorage.setItem('darkMode', isEnabled);
        });
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

    // 8. Notification System
    const showNotification = (message) => {
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 1000;
                display: none;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    };

    // 9. Initialize all features
    initDarkMode();
    initFavorites();
    initShoppingCart();
    updateFavoritesDisplay();
    updateCartDisplay();
});
