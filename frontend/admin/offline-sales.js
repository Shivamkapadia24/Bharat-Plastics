        // Global variables
        let allProducts = [];
        let cart = [];
        let selectedProduct = null;
        const API_BASE_URL = 'http://localhost:5001';
        
        // DOM elements
        const productSearch = document.getElementById('productSearch');
        const searchResults = document.getElementById('searchResults');
        const selectedProductDiv = document.getElementById('selectedProduct');
        const selectedProductName = document.getElementById('selectedProductName');
        const selectedProductDetails = document.getElementById('selectedProductDetails');
        const selectedProductStock = document.getElementById('selectedProductStock');
        const selectedProductPrice = document.getElementById('selectedProductPrice');
        const addToCartBtn = document.getElementById('addToCartBtn');
        const cartTableContainer = document.getElementById('cartTableContainer');
        const subtotalEl = document.getElementById('subtotal');
        
        const grandTotalEl = document.getElementById('grandTotal');
        const submitSaleBtn = document.getElementById('submitSaleBtn');
        const successAlert = document.getElementById('successAlert');
        const errorAlert = document.getElementById('errorAlert');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        const saleInfo = document.getElementById('saleInfo');
        const saleId = document.getElementById('saleId');
        const saleTotal = document.getElementById('saleTotal');
        
        // Helper functions
        function getToken() {
            return localStorage.getItem('greenNetsToken');
        }
        
        function authHeaders() {
            return {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            };
        }
        
        function showError(message) {
            errorMessage.textContent = message;
            errorAlert.style.display = 'block';
            successAlert.style.display = 'none';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                errorAlert.style.display = 'none';
            }, 5000);
        }
        
        function showSuccess(message) {
            successMessage.textContent = message;
            successAlert.style.display = 'block';
            errorAlert.style.display = 'none';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                successAlert.style.display = 'none';
            }, 5000);
        }
        
        function checkAuth() {
            const token = getToken();
            if (!token) {
                window.location.href = 'admin-login.html';
                return false;
            }
            return true;
        }
        
        // Load products from API
        async function loadProducts() {
            if (!checkAuth()) return;
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
                    headers: authHeaders()
                });
                
                if (response.status === 401) {
                    localStorage.removeItem('greenNetsToken');
                    window.location.href = 'admin-login.html';
                    return;
                }
                
                if (!response.ok) {
                    throw new Error('Failed to load products');
                }
                
                const data = await response.json();
                allProducts = data.products || data;
                
                // Set admin name from localStorage
                const adminName = localStorage.getItem('greenNetsUserName') || 'Admin';
                document.getElementById('adminName').textContent = adminName;
                document.getElementById('adminAvatar').textContent = adminName.charAt(0).toUpperCase();
                
            } catch (error) {
                showError(`Error loading products: ${error.message}`);
                console.error('Error loading products:', error);
            }
        }
        
        // Search products
        function searchProducts(query) {
            if (!query || query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }
            
            const searchTerm = query.toLowerCase();
            const filteredProducts = allProducts.filter(product => 
                (product.name || "").toLowerCase().includes(searchTerm) ||
                (product.category || "").toLowerCase().includes(searchTerm) ||
                (product.quality || "").toLowerCase().includes(searchTerm)
            );
            
            displaySearchResults(filteredProducts);
        }
        
        // Display search results
        function displaySearchResults(products) {
            if (products.length === 0) {
                searchResults.innerHTML = '<div class="search-result-item">No products found</div>';
                searchResults.style.display = 'block';
                return;
            }
            
            let html = '';
products.forEach(product => {

  // ✅ show correct price
  const showPrice =
    product.unitType === "meter"
      ? (product.pricePerMeter || 0)   // meter price
      : product.price;                             // bundle/piece price

  let stockText = "Out of stock";
  let stockClass = "stock-out";

  if (product.unitType === "meter") {
    const bundleStock = product.bundleStock || 0;
    const openPieces = product.openPieces || [];

    if (bundleStock > 0 || openPieces.length > 0) {
      stockText = `${bundleStock} + [${openPieces.join("m, ")}${openPieces.length ? "m" : ""}]`;
      stockClass = "stock-in";
    }
  } else {
    const s = product.stock || 0;
    if (s > 0) {
      stockText = `Stock: ${s}`;
      stockClass = "stock-in";
    }
  }

  html += `
    <div class="search-result-item" data-product-id="${product._id}">
      <div class="product-name">${product.name}</div>
      <div class="product-details">
        ${product.category} | ${product.quality || ''} | ${product.subCategory || ''}
        <span class="stock-badge ${stockClass}">${stockText}</span>
      </div>
      <div class="product-details" style="margin-top: 5px;">
        <strong>₹${showPrice}</strong>
        ${product.unitType === "meter" ? "<span style='color:#777;'> / m</span>" : ""}
      </div>
    </div>
  `;
});
            
            searchResults.innerHTML = html;
            searchResults.style.display = 'block';
            
            // Add click event to each result
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', function() {
                    const productId = this.getAttribute('data-product-id');
                    selectProduct(productId);
                    searchResults.style.display = 'none';
                    productSearch.value = '';
                });
            });
        }
        
        // Select a product
        function selectProduct(productId) {
            selectedProduct = allProducts.find(p => p._id === productId);
            
            if (!selectedProduct) return;
            
            selectedProductName.textContent = selectedProduct.name;
            selectedProductDetails.textContent = 
                `${selectedProduct.category} | ${selectedProduct.quality || ''} | ${selectedProduct.subCategory || ''}`;
            
            selectedProductPrice.textContent =
  selectedProduct.unitType === "meter"
    ? (selectedProduct.pricePerMeter || 0)
    : selectedProduct.price;
            
            // ✅ Update stock badge + enable add
let hasStock = false;

if (selectedProduct.unitType === "meter") {
  const bundleStock = Number(selectedProduct.bundleStock || 0);
  const openPieces = selectedProduct.openPieces || [];

  hasStock = bundleStock > 0 || openPieces.length > 0;

  const stockText = `${bundleStock} + [${openPieces.join("m, ")}${openPieces.length ? "m" : ""}]`;
  selectedProductStock.textContent = stockText;

} else {
  const s = Number(selectedProduct.stock || 0);
  hasStock = s > 0;
  selectedProductStock.textContent = `Stock: ${s}`;
}

if (hasStock) {
  selectedProductStock.className = "stock-badge stock-in";
  addToCartBtn.disabled = false;
} else {
  selectedProductStock.textContent = "Out of stock";
  selectedProductStock.className = "stock-badge stock-out";
  addToCartBtn.disabled = true;
}
            
            selectedProductDiv.style.display = 'block';
        }
        
        // Add selected product to cart
        function addItemToCart() {
  if (!selectedProduct) return;

  const existingItemIndex = cart.findIndex(
    item => item.productId === selectedProduct._id
  );

  // ✅ if item already exists in cart
  if (existingItemIndex >= 0) {
    const item = cart[existingItemIndex];

    if (item.unitType === "meter") {
      // ✅ increase by 0.1 meter
      item.quantity = Math.round((Number(item.quantity) + 0.1) * 10) / 10;
    } else {
      // ✅ piece product (check stock)
      if (item.quantity + 1 > selectedProduct.stock) {
        showError(`Cannot add more. Only ${selectedProduct.stock} units available.`);
        return;
      }
      item.quantity += 1;
    }

    item.lineTotal = item.quantity * item.sellingPrice;

  } else {

  const rate =
    selectedProduct.unitType === "meter"
      ? (selectedProduct.pricePerMeter || selectedProduct.price)
      : selectedProduct.price;

  cart.push({
    productId: selectedProduct._id,
    name: selectedProduct.name,
    price: rate,
    sellingPrice: rate,

    quantity: selectedProduct.unitType === "meter" ? 1.0 : 1,
    lineTotal: (selectedProduct.unitType === "meter" ? 1.0 : 1) * rate,

    unitType: selectedProduct.unitType || "piece",
    bundleStock: selectedProduct.bundleStock || 0,
    openPieces: selectedProduct.openPieces || [],
    stock: selectedProduct.stock || 0,
    category: selectedProduct.category,
    quality: selectedProduct.quality
  });
}

  // Reset selection
  selectedProduct = null;
  selectedProductDiv.style.display = "none";

  renderCart();
  updateTotals();
}
        
        // Render cart table
        function renderCart() {
            if (cart.length === 0) {
                cartTableContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Cart is Empty</h3>
                        <p>Search and add products to create a bill</p>
                    </div>
                `;
                submitSaleBtn.disabled = true;
                return;
            }
            
            let html = `
                <div style="overflow-x: auto;">
                    <table class="cart-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price (₹)</th>
                                <th>selling (₹)</th>
                                <th>Qty (m / pcs)</th>
                                <th>Total (₹)</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            cart.forEach((item, index) => {
              const qtyStep = item.unitType === "meter" ? "0.1" : "1";
const qtyMin = item.unitType === "meter" ? "0.1" : "1";
const qtyMax = item.unitType === "meter" ? "" : `max="${item.stock}"`;
                html += `
<tr>
  <td>
    <div style="font-weight: 600;">${item.name}</div>
    <div style="font-size: 12px; color: #777;">
      ${item.category} | ${item.quality || ""}
    </div>
  </td>

  <td>₹${item.price}</td>

  <!-- ✅ Selling Price -->
  <td>
    <input
      type="number"
      class="qty-input"
      style="width:90px;"
      value="${item.sellingPrice}"
      min="1"
      onchange="updateSellingPrice(${index}, this.value)"
    />
  </td>

  <!-- ✅ Quantity -->
  <td>
    <input
  type="number"
  class="qty-input"
  style="width:70px;"
  value="${item.quantity}"
  min="${qtyMin}"
  step="${qtyStep}"
  ${qtyMax}
  onchange="updateQuantity(${index}, this.value)"
/>
  </td>

  <!-- ✅ Total -->
  <td>₹${item.lineTotal}</td>

  <td>
    <button class="remove-btn" onclick="removeItem(${index})">
      <i class="fas fa-trash"></i> Remove
    </button>
  </td>
</tr>
`;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            cartTableContainer.innerHTML = html;
            submitSaleBtn.disabled = false;
        }
        
        // Update item quantity
function round1(n) {
  return Math.round(n * 10) / 10;
}

function updateQuantity(index, newQty) {
  let qty = Number(newQty);

  if (cart[index].unitType === "meter") {
    if (isNaN(qty) || qty <= 0) qty = 0.1;
    qty = round1(qty);

    // ✅ no max limit here (backend will validate actual meters)
    cart[index].quantity = qty;

  } else {
    // piece product
    if (isNaN(qty) || qty < 1) qty = 1;

    qty = Math.round(qty);

    if (qty > cart[index].stock) {
      showError(`Cannot add more. Only ${cart[index].stock} units available.`);
      qty = cart[index].stock;
    }

    cart[index].quantity = qty;
  }

  cart[index].lineTotal = cart[index].quantity * cart[index].sellingPrice;

  renderCart();
  updateTotals();
}
        
        // Remove item from cart
        function removeItem(index) {
            cart.splice(index, 1);
            renderCart();
            updateTotals();
        }
        
        // Update totals
        function updateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  subtotalEl.textContent = subtotal.toFixed(2);
  grandTotalEl.textContent = subtotal.toFixed(2);
}
        
        // Submit offline sale
        async function submitOfflineSale() {
            if (!checkAuth()) return;
            
            if (cart.length === 0) {
                showError('Please add at least one product to the cart');
                return;
            }
            
            const paymentMode = document.getElementById('paymentMode').value;
            if (!paymentMode) {
                showError('Please select a payment mode');
                return;
            }
            
            // Prepare sale data
            const saleData = {
                customerName: document.getElementById('customerName').value || 'Walk-in customer',
                customerPhone: document.getElementById('customerPhone').value || '',
                paymentMode: paymentMode,
                
                notes: document.getElementById('notes').value || '',
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    sellingPrice: item.sellingPrice
                }))
            };
            
            // Disable submit button and show loading
            submitSaleBtn.disabled = true;
            submitSaleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/offline-sales`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(saleData)
                });
                
                if (response.status === 401) {
                    localStorage.removeItem('greenNetsToken');
                    window.location.href = 'admin-login.html';
                    return;
                }
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create sale');
                }
                
                const result = await response.json();
                
                // Show success
                saleId.textContent = result.sale?.billNumber || "N/A";
                saleTotal.textContent = result.sale?.totalAmount ?? 0;
                saleInfo.style.display = 'block';
                
                showSuccess('Sale completed successfully! Bill generated.');
                
                // Reset form (but keep customer details for next sale)
                cart = [];
                renderCart();
                updateTotals();
                selectedProductDiv.style.display = 'none';
                
            } catch (error) {
                showError(`Error creating sale: ${error.message}`);
                console.error('Error creating sale:', error);
            } finally {
                // Re-enable submit button
                submitSaleBtn.disabled = false;
                submitSaleBtn.innerHTML = '<i class="fas fa-receipt"></i> Generate Bill / Save Sale';
            }
        }
        
        // Reset form for new sale
        function resetForm() {
            document.getElementById('customerName').value = '';
            document.getElementById('customerPhone').value = '';
            document.getElementById('paymentMode').value = 'Cash';
            document.getElementById('notes').value = '';
            
            cart = [];
            selectedProduct = null;
            selectedProductDiv.style.display = 'none';
            
            renderCart();
            updateTotals();
            
            saleInfo.style.display = 'none';
            successAlert.style.display = 'none';
            errorAlert.style.display = 'none';
        }
        
        // Logout function
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('greenNetsToken');
                localStorage.removeItem('greenNetsUserName');
                window.location.href = 'admin-login.html';
            }
        }
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Load products
            loadProducts();
            
            // Event listeners
            productSearch.addEventListener('input', function() {
                searchProducts(this.value);
            });
            
            // Close search results when clicking outside
            document.addEventListener('click', function(event) {
                if (!productSearch.contains(event.target) && !searchResults.contains(event.target)) {
                    searchResults.style.display = 'none';
                }
            });
            
            addToCartBtn.addEventListener('click', addItemToCart);
            
            
            
            submitSaleBtn.addEventListener('click', submitOfflineSale);
            
            // Set active menu
            document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
            document.querySelectorAll('.nav-links li')[3].classList.add('active');
        });
        function updateSellingPrice(index, newPrice) {
  newPrice = Number(newPrice);

  if (isNaN(newPrice) || newPrice <= 0) {
    newPrice = cart[index].price; // fallback to original
  }

  cart[index].sellingPrice = newPrice;
  cart[index].lineTotal = cart[index].quantity * cart[index].sellingPrice;

  renderCart();
  updateTotals();
}