document.addEventListener('DOMContentLoaded', () => {
    const userName = document.getElementById('user-name');
    const trebleTokens = document.getElementById('treble-tokens');
    const shopItems = document.querySelector('.shop-items');

    // Fetch user info and tokens
    const userId = sessionStorage.getItem('userId');
    if (userId) {
        userName.textContent = sessionStorage.getItem('name');
        fetchTrebleTokens(userId);
    } else {
        window.location.href = '/login';
    }

    // Fetch and display shop items
    fetchShopItems();

    function fetchTrebleTokens(userId) {
        fetch(`/user-tokens/${userId}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                const trebleTokensElement = document.getElementById('treble-tokens');
                trebleTokensElement.textContent = `${data.trebleTokens} Tokens`;
            })
            .catch(error => {
                console.error('Error fetching Treble Tokens:', error);
                const trebleTokensElement = document.getElementById('treble-tokens');
                trebleTokensElement.textContent = 'Error loading tokens';
            });
    }

    function fetchShopItems() {
        // This is a placeholder. In a real application, you would fetch this data from your server.
        const items = [
            { id: 1, name: 'Premium Subscription', price: 100, image: 'assets/premium.jpg' },
            { id: 2, name: 'Exclusive Playlist', price: 50, image: 'assets/playlist.jpg' },
            { id: 3, name: 'Custom Theme', price: 30, image: 'assets/theme.jpg' },
        ];

        items.forEach(item => {
            const itemElement = createShopItem(item);
            shopItems.appendChild(itemElement);
        });
    }

    function createShopItem(item) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('shop-item');
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.price} Tokens</p>
            <button onclick="purchaseItem(${item.id})">Purchase</button>
        `;
        return itemElement;
    }

    window.purchaseItem = function(itemId) {
        // This is a placeholder. In a real application, you would send a request to your server to process the purchase.
        console.log(`Purchasing item ${itemId}`);
        alert('Purchase functionality not implemented yet.');
    }
});