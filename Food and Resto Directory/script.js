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
    categoryFilter.addEventListener('change', updateDirectory);
    searchBar.addEventListener('keyup', updateDirectory);

    // Panggil fungsi saat halaman dimuat untuk memastikan semua kartu tampil di awal
    updateDirectory();
});
