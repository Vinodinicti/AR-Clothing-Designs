/* =========================================================
   AR CLOTHING & DESIGNS
   MAIN JAVASCRIPT & E-COMMERCE ENGINE
========================================================= */

/* =========================================================
   1. PRODUCT CATALOG DATA
========================================================= */
const PRODUCTS_DATA = [
    {
        id: "design-1",
        name: "Noir Executive Suit",
        category: "men",
        categoryLabel: "Men's Formal",
        price: 3499,
        originalPrice: 4499,
        image: "images/designs/design-1.jpg",
        tag: "BESTSELLER",
        description: "Tailored navy wool-blend double-breasted suit featuring structured shoulders and satin lapels.",
        sizes: ["M", "L", "XL", "XXL"]
    },
    {
        id: "design-2",
        name: "Urban Fleece Hoodie",
        category: "men",
        categoryLabel: "Hoodies & Sweats",
        price: 1299,
        originalPrice: 1799,
        image: "images/designs/design-2.jpg",
        tag: "TRENDING",
        description: "Heavyweight 420 GSM organic french terry pullover hoodie with dropped shoulders.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "design-3",
        name: "Classic Knit Sweater",
        category: "women",
        categoryLabel: "Women's Casual",
        price: 1099,
        originalPrice: 1499,
        image: "images/designs/design-3.jpg",
        tag: "POPULAR",
        description: "Relaxed boat-neck knit sweater crafted with ultra-soft combed cotton for everyday comfort.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "design-4",
        name: "Emerald Drape Dress",
        category: "women",
        categoryLabel: "Women's Dresses",
        price: 1899,
        originalPrice: 2499,
        image: "images/designs/design-4.jpg",
        tag: "CLASSIC",
        description: "Fluid midi silhouette dress with elegant quarter sleeves and tailored waist gathering.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "design-5",
        name: "Golden Line Evening Gown",
        category: "women",
        categoryLabel: "Women's Evening",
        price: 2999,
        originalPrice: 3799,
        image: "images/designs/design-5.jpg",
        tag: "FEATURED",
        description: "Statement plunge-neck maroon evening gown featuring tailored drape and delicate gold trimming.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "design-6",
        name: "Executive Formal Shirt",
        category: "men",
        categoryLabel: "Men's Shirts",
        price: 1599,
        originalPrice: 2199,
        image: "images/designs/design-6.jpg",
        tag: "FORMAL LUXE",
        description: "Luxury Egyptian giza cotton formal shirt with an immaculate stitch count and satin finish.",
    }
];

/* =========================================================
   2. STATE MANAGEMENT & LOCAL STORAGE
========================================================= */
let cart = JSON.parse(localStorage.getItem("ar_cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("ar_wishlist")) || [];
let appliedDiscount = 0;
let checkoutItems = [];
let selectedPaymentMethod = "upi";

function saveCart() {
    localStorage.setItem("ar_cart", JSON.stringify(cart));
    updateBadges();
    renderCartDrawer();
}

function saveWishlist() {
    localStorage.setItem("ar_wishlist", JSON.stringify(wishlist));
    updateBadges();
    renderWishlistDrawer();
    syncWishlistButtons();
}

/* =========================================================
   3. DYNAMIC MODAL & DRAWER INJECTION
========================================================= */
function injectEcommerceModals() {
    if (document.getElementById("searchModal")) return;

    const modalHTML = `
    <!-- TOAST CONTAINER -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- SEARCH MODAL -->
    <div class="search-modal" id="searchModal" aria-hidden="true">
        <div class="search-modal-backdrop" id="searchBackdrop"></div>
        <div class="search-modal-container">
            <div class="search-header">
                <div class="search-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="searchInput" placeholder="Search designs, collections, shirts, hoodies, dresses..." autocomplete="off">
                    <button class="search-clear-btn" id="searchClearBtn" aria-label="Clear search">✕</button>
                </div>
                <button class="search-close-btn" id="searchCloseBtn" aria-label="Close search">✕</button>
            </div>
            <div class="search-body">
                <div class="search-quick-tags">
                    <span class="tag-label">Category:</span>
                    <button class="search-tag active" data-query="all">All</button>
                    <button class="search-tag" data-query="women">Women</button>
                    <button class="search-tag" data-query="men">Men</button>
                    <button class="search-tag" data-query="tshirt">T-Shirts</button>
                    <button class="search-tag" data-query="shirt">Shirts</button>
                    <button class="search-tag" data-query="hoodie">Hoodies</button>
                    <button class="search-tag" data-query="dress">Dresses</button>
                    <button class="search-tag" data-query="premium">Premium</button>
                </div>
                <div class="search-recommendations-bar" id="searchRecommendationsBar"></div>
                <div class="search-results-count" id="searchResultsCount">Showing all items</div>
                <div class="search-results-grid" id="searchResultsGrid"></div>
            </div>
        </div>
    </div>

    <!-- CART DRAWER -->
    <div class="drawer-backdrop" id="cartBackdrop"></div>
    <div class="drawer cart-drawer" id="cartDrawer" aria-hidden="true">
        <div class="drawer-header">
            <div class="drawer-title-wrap">
                <h3>Shopping Cart</h3>
                <span class="drawer-item-count" id="cartHeaderCount">(0 items)</span>
            </div>
            <button class="drawer-close-btn" id="cartCloseBtn" aria-label="Close cart">✕</button>
        </div>
        <div class="drawer-body" id="cartBody"></div>
        <div class="drawer-footer" id="cartFooter">
            <div class="promo-box">
                <input type="text" id="promoInput" placeholder="Promo code (e.g. ARFIRST)">
                <button type="button" id="applyPromoBtn">Apply</button>
            </div>
            <div class="promo-feedback" id="promoFeedback"></div>
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span id="cartSubtotal">₹0</span>
                </div>
                <div class="summary-row">
                    <span>Delivery</span>
                    <span class="free-badge">FREE</span>
                </div>
                <div class="summary-row discount-row" id="discountRow" style="display:none;">
                    <span id="discountLabel">Discount (10%)</span>
                    <span id="cartDiscount">-₹0</span>
                </div>
                <div class="summary-row total-row">
                    <span>Total Amount</span>
                    <span id="cartTotal">₹0</span>
                </div>
            </div>
            <div class="cart-drawer-actions">
                <button class="btn primary-btn btn-checkout" id="proceedToPayBtn">
                    Proceed to Payment
                </button>
                <button class="btn secondary-btn btn-continue-shopping" id="continueShoppingBtn">
                    Continue Shopping
                </button>
            </div>
        </div>
    </div>

    <!-- WISHLIST DRAWER -->
    <div class="drawer-backdrop" id="wishlistBackdrop"></div>
    <div class="drawer wishlist-drawer" id="wishlistDrawer" aria-hidden="true">
        <div class="drawer-header">
            <div class="drawer-title-wrap">
                <h3>My Wishlist</h3>
                <span class="drawer-item-count" id="wishlistHeaderCount">(0 items)</span>
            </div>
            <button class="drawer-close-btn" id="wishlistCloseBtn" aria-label="Close wishlist">✕</button>
        </div>
        <div class="drawer-body" id="wishlistBody"></div>
        <div class="drawer-footer" id="wishlistFooter" style="display:none;">
            <button class="btn primary-btn" id="moveAllToCartBtn" style="width: 100%;">
                Move All to Cart
            </button>
        </div>
    </div>

    <!-- CHECKOUT / PAYMENT MODAL -->
    <div class="checkout-modal" id="checkoutModal" aria-hidden="true">
        <div class="checkout-backdrop" id="checkoutBackdrop"></div>
        <div class="checkout-container">
            <div class="checkout-header">
                <div class="checkout-brand">
                    <span class="brand-name">AR Clothing & Designs</span>
                    <span class="checkout-badge">256-Bit Encrypted Checkout</span>
                </div>
                <button class="checkout-close-btn" id="checkoutCloseBtn" aria-label="Close Checkout">✕</button>
            </div>

            <!-- Stepper -->
            <div class="checkout-stepper">
                <div class="step-item active" id="stepIndicator1">
                    <span class="step-num">1</span>
                    <span class="step-title">Shipping</span>
                </div>
                <div class="step-line"></div>
                <div class="step-item" id="stepIndicator2">
                    <span class="step-num">2</span>
                    <span class="step-title">Payment</span>
                </div>
                <div class="step-line"></div>
                <div class="step-item" id="stepIndicator3">
                    <span class="step-num">3</span>
                    <span class="step-title">Review</span>
                </div>
            </div>

            <div class="checkout-content">
                <!-- Step 1: Shipping Details -->
                <div class="checkout-step-panel active" id="stepPanel1">
                    <h3>Shipping & Contact Details</h3>
                    <form id="shippingForm" class="checkout-form" onsubmit="event.preventDefault();">
                        <div class="form-row two-col">
                            <div class="form-group">
                                <label for="shipName">Full Name *</label>
                                <input type="text" id="shipName" required placeholder="e.g. Sarah Jenkins" value="Sarah Jenkins">
                            </div>
                            <div class="form-group">
                                <label for="shipPhone">Phone Number *</label>
                                <input type="tel" id="shipPhone" required placeholder="e.g. 9876543210" value="9876543210">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="shipEmail">Email Address *</label>
                            <input type="email" id="shipEmail" required placeholder="e.g. sarah@example.com" value="sarah@example.com">
                        </div>
                        <div class="form-group">
                            <label for="shipAddress">Street Address / House No. *</label>
                            <input type="text" id="shipAddress" required placeholder="Apartment, Studio, Floor, Street" value="402, High Street Fashion Hub">
                        </div>
                        <div class="form-row three-col">
                            <div class="form-group">
                                <label for="shipCity">City *</label>
                                <input type="text" id="shipCity" required placeholder="e.g. Mumbai" value="Mumbai">
                            </div>
                            <div class="form-group">
                                <label for="shipState">State *</label>
                                <input type="text" id="shipState" required placeholder="e.g. Maharashtra" value="Maharashtra">
                            </div>
                            <div class="form-group">
                                <label for="shipPin">PIN Code *</label>
                                <input type="text" id="shipPin" required placeholder="e.g. 400001" maxlength="6" value="400001">
                            </div>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn primary-btn btn-next-step" id="toStep2Btn">
                                Proceed to Payment Method →
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Step 2: Payment Method -->
                <div class="checkout-step-panel" id="stepPanel2">
                    <h3>Choose Payment Method</h3>
                    <div class="payment-methods-grid">
                        <!-- UPI -->
                        <label class="payment-method-card active" data-method="upi">
                            <input type="radio" name="payMethod" value="upi" checked>
                            <div class="method-card-content">
                                <div class="method-header">
                                    <span class="method-icon"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>
                                    <div>
                                        <strong>UPI / QR Code (Instant)</strong>
                                        <p>Google Pay, PhonePe, Paytm, BHIM or any UPI App</p>
                                    </div>
                                </div>
                                <div class="method-details upi-details">
                                    <div class="upi-apps-icons">
                                        <span class="app-chip">Google Pay</span>
                                        <span class="app-chip">PhonePe</span>
                                        <span class="app-chip">Paytm</span>
                                        <span class="app-chip">BHIM</span>
                                    </div>
                                    <div class="upi-id-input-wrap">
                                        <input type="text" id="upiIdInput" placeholder="Enter UPI ID (e.g. yourname@okhdfcbank)">
                                        <button type="button" class="btn-verify-upi" id="verifyUpiBtn">Verify ID</button>
                                    </div>
                                    <div class="upi-qr-box">
                                        <div class="qr-mock">
                                            <svg viewBox="0 0 100 100" class="qr-code-svg">
                                                <rect width="100" height="100" fill="white"/>
                                                <rect x="10" y="10" width="25" height="25" fill="#080808"/>
                                                <rect x="15" y="15" width="15" height="15" fill="white"/>
                                                <rect x="18" y="18" width="9" height="9" fill="#080808"/>
                                                <rect x="65" y="10" width="25" height="25" fill="#080808"/>
                                                <rect x="70" y="15" width="15" height="15" fill="white"/>
                                                <rect x="73" y="18" width="9" height="9" fill="#080808"/>
                                                <rect x="10" y="65" width="25" height="25" fill="#080808"/>
                                                <rect x="15" y="70" width="15" height="15" fill="white"/>
                                                <rect x="18" y="73" width="9" height="9" fill="#080808"/>
                                                <rect x="45" y="15" width="8" height="20" fill="#080808"/>
                                                <rect x="45" y="45" width="10" height="10" fill="#080808"/>
                                                <rect x="65" y="45" width="25" height="8" fill="#080808"/>
                                                <rect x="45" y="65" width="12" height="25" fill="#080808"/>
                                                <rect x="65" y="75" width="25" height="15" fill="#080808"/>
                                            </svg>
                                            <span>Scan QR with any UPI App</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>

                        <!-- Cards -->
                        <label class="payment-method-card" data-method="card">
                            <input type="radio" name="payMethod" value="card">
                            <div class="method-card-content">
                                <div class="method-header">
                                    <span class="method-icon"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></span>
                                    <div>
                                        <strong>Credit / Debit Card</strong>
                                        <p>Visa, MasterCard, RuPay, American Express</p>
                                    </div>
                                </div>
                                <div class="method-details card-details" style="display:none;">
                                    <div class="form-group" style="margin-bottom: 12px;">
                                        <label>Card Number</label>
                                        <input type="text" id="cardNumberInput" placeholder="4532 •••• •••• ••••" maxlength="19">
                                    </div>
                                    <div class="form-row two-col">
                                        <div class="form-group">
                                            <label>Cardholder Name</label>
                                            <input type="text" id="cardNameInput" placeholder="Name on card">
                                        </div>
                                        <div class="form-row two-col">
                                            <div class="form-group">
                                                <label>Expiry</label>
                                                <input type="text" id="cardExpiryInput" placeholder="MM/YY" maxlength="5">
                                            </div>
                                            <div class="form-group">
                                                <label>CVV</label>
                                                <input type="password" id="cardCvvInput" placeholder="•••" maxlength="4">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>

                        <!-- Net Banking -->
                        <label class="payment-method-card" data-method="netbanking">
                            <input type="radio" name="payMethod" value="netbanking">
                            <div class="method-card-content">
                                <div class="method-header">
                                    <span class="method-icon"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><line x1="3" y1="21" x2="21" y2="21"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 3 2 9 22 9 12 3"></polygon></svg></span>
                                    <div>
                                        <strong>Net Banking</strong>
                                        <p>All major Indian banks supported</p>
                                    </div>
                                </div>
                                <div class="method-details netbanking-details" style="display:none;">
                                    <select id="bankSelect" class="styled-select" style="width:100%;">
                                        <option value="HDFC Bank">HDFC Bank</option>
                                        <option value="State Bank of India">State Bank of India (SBI)</option>
                                        <option value="ICICI Bank">ICICI Bank</option>
                                        <option value="Axis Bank">Axis Bank</option>
                                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                                        <option value="Punjab National Bank">Punjab National Bank</option>
                                    </select>
                                </div>
                            </div>
                        </label>

                        <!-- Cash on Delivery -->
                        <label class="payment-method-card" data-method="cod">
                            <input type="radio" name="payMethod" value="cod">
                            <div class="method-card-content">
                                <div class="method-header">
                                    <span class="method-icon"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg></span>
                                    <div>
                                        <strong>Cash on Delivery (COD)</strong>
                                        <p>Pay cash or scan QR upon delivery</p>
                                    </div>
                                </div>
                                <div class="method-details cod-details" style="display:none;">
                                    <p class="cod-note">Pay via Cash or UPI at your doorstep upon receiving your package.</p>
                                </div>
                            </div>
                        </label>
                    </div>

                    <div class="step-actions">
                        <button type="button" class="btn secondary-btn" id="backToStep1Btn">← Back to Shipping</button>
                        <button type="button" class="btn primary-btn" id="toStep3Btn">Review Order →</button>
                    </div>
                </div>

                <!-- Step 3: Review & Pay -->
                <div class="checkout-step-panel" id="stepPanel3">
                    <h3>Order Summary & Confirmation</h3>
                    <div class="review-grid">
                        <div class="review-items-col">
                            <h4>Items in Order (<span id="reviewItemsCount">0</span>)</h4>
                            <div class="review-items-list" id="reviewItemsList"></div>
                        </div>
                        <div class="review-summary-col">
                            <div class="review-box">
                                <h4>Shipping Address</h4>
                                <p id="reviewShippingAddress">Sarah Jenkins, Mumbai, 400001</p>
                                <button type="button" class="btn-link" id="editShippingBtn">Edit</button>
                            </div>
                            <div class="review-box">
                                <h4>Payment Method</h4>
                                <p id="reviewPaymentMethod">UPI / QR Code</p>
                                <button type="button" class="btn-link" id="editPaymentBtn">Change</button>
                            </div>
                            <div class="review-price-breakdown">
                                <div class="summary-row">
                                    <span>Items Subtotal</span>
                                    <span id="reviewSubtotal">₹0</span>
                                </div>
                                <div class="summary-row">
                                    <span>Shipping</span>
                                    <span class="free-badge">FREE</span>
                                </div>
                                <div class="summary-row discount-row" id="reviewDiscountRow" style="display:none;">
                                    <span>Discount</span>
                                    <span id="reviewDiscount">-₹0</span>
                                </div>
                                <div class="summary-row total-row">
                                    <span>Total Payable</span>
                                    <span id="reviewTotal">₹0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="step-actions">
                        <button type="button" class="btn secondary-btn" id="backToStep2Btn">← Back to Payment</button>
                        <button type="button" class="btn primary-btn btn-pay-now" id="placeOrderBtn">
                            Pay & Place Order
                        </button>
                    </div>
                </div>

                <!-- Step 4: Processing & Order Success -->
                <div class="checkout-step-panel" id="stepPanel4">
                    <!-- Processing -->
                    <div class="payment-processing" id="paymentProcessing">
                        <div class="gold-spinner"></div>
                        <h3>Processing Your Secure Payment...</h3>
                        <p>Please wait while we confirm your transaction.</p>
                        <div class="security-badges">
                            <span>256-Bit SSL</span>
                            <span>RBI Compliant</span>
                            <span>Verified Merchant</span>
                        </div>
                    </div>

                    <!-- Success -->
                    <div class="payment-success" id="paymentSuccess" style="display:none;">
                        <div class="success-icon-wrap">
                            <div class="checkmark-circle">
                                <svg class="checkmark-svg" viewBox="0 0 52 52">
                                    <circle class="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
                                    <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                                </svg>
                            </div>
                        </div>
                        <h2>Payment Successful!</h2>
                        <p class="success-subtitle">Your order has been confirmed with AR Clothing & Designs.</p>

                        <div class="order-receipt-card" id="orderReceiptCard">
                            <div class="receipt-header">
                                <div>
                                    <span class="receipt-label">Order Number</span>
                                    <strong id="receiptOrderId">#AR-2026-98421</strong>
                                </div>
                                <div>
                                    <span class="receipt-label">Order Date</span>
                                    <strong id="receiptOrderDate">27 Aug 2026</strong>
                                </div>
                            </div>
                            <div class="receipt-body">
                                <div class="receipt-row">
                                    <span>Estimated Delivery</span>
                                    <strong id="receiptDeliveryDate">3 - 5 Business Days</strong>
                                </div>
                                <div class="receipt-row">
                                    <span>Payment Mode</span>
                                    <strong id="receiptPaymentMode">UPI Payment</strong>
                                </div>
                                <div class="receipt-row">
                                    <span>Delivering To</span>
                                    <strong id="receiptDeliveryTo">Sarah Jenkins, Mumbai</strong>
                                </div>
                                <div class="receipt-row receipt-total-row">
                                    <span>Total Amount Paid</span>
                                    <strong id="receiptTotalAmount">₹0</strong>
                                </div>
                            </div>
                        </div>

                        <div class="receipt-actions">
                            <button type="button" class="btn secondary-btn" id="printReceiptBtn">
                                Print Receipt
                            </button>
                            <button type="button" class="btn primary-btn" id="finishShoppingBtn">
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- FLOATING WHATSAPP BUTTON (BOTTOM RIGHT) -->
    <a href="https://wa.me/919876543210?text=Hello%20AR%20Clothing%20%26%20Designs%2C%20I%20would%20like%20to%20enquire%20about%20your%20fashion%20designs." class="floating-whatsapp-btn" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
        <span class="whatsapp-tooltip">Chat with us</span>
        <div class="whatsapp-btn-inner">
            <svg viewBox="0 0 32 32" class="whatsapp-icon-svg" fill="currentColor">
                <path d="M16 2a13.9 13.9 0 0 0-12 21L2 30l7.2-1.9A13.9 13.9 0 1 0 16 2zm0 25.5c-2.3 0-4.5-.6-6.4-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5A11.5 11.5 0 1 1 27.5 16c0 6.3-5.2 11.5-11.5 11.5zm6.3-8.6c-.3-.2-2-.1-2.3-.2-.3-.2-.5-.3-.7.1-.2.3-.8 1-.9 1.2-.2.2-.4.2-.7.1a9.2 9.2 0 0 1-5.4-4.7c-.2-.4 0-.6.1-.7.1-.2.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-.9-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9c0 1.7 1.2 3.3 1.4 3.5.2.3 2.5 3.8 6 5.3 3.5 1.5 3.5 1 4.2.9.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.5z"/>
            </svg>
        </div>
        <span class="whatsapp-pulse"></span>
    </a>
    `;

    const wrapper = document.createElement("div");
    wrapper.id = "ecommerceModalsWrapper";
    wrapper.innerHTML = modalHTML;
    document.body.appendChild(wrapper);

    setupHeaderActions();
    setupSearchEvents();
    setupCartEvents();
    setupWishlistEvents();
    setupCheckoutEvents();
    updateBadges();
    syncWishlistButtons();
}

/* =========================================================
   4. TOAST NOTIFICATIONS
========================================================= */
function showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.classList.add("toast-notification");
    toast.innerHTML = `
        <span class="toast-icon"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

/* =========================================================
   5. HEADER ACTIONS & BADGES
========================================================= */
function setupHeaderActions() {
    const headers = document.querySelectorAll(".header");
    headers.forEach(hdr => {
        if (!hdr.querySelector(".header-actions")) {
            const navBtn = hdr.querySelector(".nav-button");
            const actionGroup = document.createElement("div");
            actionGroup.className = "header-actions";
            actionGroup.innerHTML = `
                <button class="header-action-btn search-trigger-btn" aria-label="Search clothing" title="Search">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
                <button class="header-action-btn wishlist-trigger-btn" aria-label="Wishlist" title="Wishlist">
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <span class="action-badge wishlist-badge">0</span>
                </button>
                <button class="header-action-btn cart-trigger-btn" aria-label="Cart" title="Cart">
                    <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    <span class="action-badge cart-badge">0</span>
                </button>
            `;
            if (navBtn) {
                hdr.insertBefore(actionGroup, navBtn);
            } else {
                hdr.appendChild(actionGroup);
            }
        }
    });

    document.querySelectorAll(".search-trigger-btn").forEach(btn => {
        btn.addEventListener("click", openSearch);
    });

    document.querySelectorAll(".cart-trigger-btn").forEach(btn => {
        btn.addEventListener("click", openCart);
    });

    document.querySelectorAll(".wishlist-trigger-btn").forEach(btn => {
        btn.addEventListener("click", openWishlist);
    });
}

function updateBadges() {
    const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalWishlistCount = wishlist.length;

    document.querySelectorAll(".cart-badge").forEach(b => {
        b.textContent = totalCartCount;
        b.classList.add("bump");
        setTimeout(() => b.classList.remove("bump"), 300);
    });

    document.querySelectorAll(".wishlist-badge").forEach(b => {
        b.textContent = totalWishlistCount;
        b.classList.add("bump");
        setTimeout(() => b.classList.remove("bump"), 300);
    });
}

/* =========================================================
   6. SEARCH ENGINE
========================================================= */
/* Recent & Recommended Searches Management */
function getRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem("ar_recent_searches")) || ["Oversized Hoodie", "Linen Shirt", "Silk Dress"];
    } catch (e) {
        return ["Oversized Hoodie", "Linen Shirt", "Silk Dress"];
    }
}

function saveRecentSearch(term) {
    if (!term || term.trim().length < 2) return;
    const cleanTerm = term.trim();
    let searches = getRecentSearches().filter(s => s.toLowerCase() !== cleanTerm.toLowerCase());
    searches.unshift(cleanTerm);
    if (searches.length > 5) searches = searches.slice(0, 5);
    localStorage.setItem("ar_recent_searches", JSON.stringify(searches));
    renderSearchRecommendations();
}

function clearRecentSearches() {
    localStorage.removeItem("ar_recent_searches");
    renderSearchRecommendations();
}

function renderSearchRecommendations(query = "") {
    const recBox = document.getElementById("searchRecommendationsBar");
    if (!recBox) return;

    const cleanQ = query.trim().toLowerCase();
    const recent = getRecentSearches();

    const SUGGESTED_KEYWORDS = [
        "Oversized Hoodie", "Linen Cotton Shirt", "Silk Evening Dress",
        "Streetwear Jacket", "Organic Cotton T-Shirt", "Signature Apparel",
        "Men's Casual Wear", "Women's Couture", "Premium Tailored Suit"
    ];

    if (!cleanQ) {
        recBox.innerHTML = `
            <div class="recommendations-container">
                ${recent.length > 0 ? `
                    <div class="rec-group">
                        <div class="rec-title">
                            <span>Recent Searches</span>
                            <button type="button" class="rec-clear-btn" id="clearRecentBtn">Clear</button>
                        </div>
                        <div class="rec-chips">
                            ${recent.map(r => `<button class="rec-chip recent-chip" data-query="${r}">${r}</button>`).join("")}
                        </div>
                    </div>
                ` : ''}

                <div class="rec-group">
                    <div class="rec-title">Trending Recommendations</div>
                    <div class="rec-chips">
                        ${SUGGESTED_KEYWORDS.slice(0, 6).map(k => `<button class="rec-chip trending-chip" data-query="${k}">${k}</button>`).join("")}
                    </div>
                </div>
            </div>
        `;
    } else {
        const matchingKeywords = SUGGESTED_KEYWORDS.filter(k => k.toLowerCase().includes(cleanQ));
        const matchingProducts = PRODUCTS_DATA.filter(p => p.name.toLowerCase().includes(cleanQ) || p.categoryLabel.toLowerCase().includes(cleanQ)).slice(0, 3);

        if (matchingKeywords.length === 0 && matchingProducts.length === 0) {
            recBox.innerHTML = "";
            return;
        }

        recBox.innerHTML = `
            <div class="recommendations-container active-search">
                ${matchingKeywords.length > 0 ? `
                    <div class="rec-group">
                        <div class="rec-title">Suggested Searches</div>
                        <div class="rec-chips">
                            ${matchingKeywords.map(k => `<button class="rec-chip suggest-chip" data-query="${k}">${k}</button>`).join("")}
                        </div>
                    </div>
                ` : ''}

                ${matchingProducts.length > 0 ? `
                    <div class="rec-group">
                        <div class="rec-title">Recommended Matches</div>
                        <div class="rec-products-grid">
                            ${matchingProducts.map(p => `
                                <div class="rec-product-card" data-query="${p.name}">
                                    <img src="${p.image}" alt="${p.name}">
                                    <div class="rec-product-info">
                                        <h4>${p.name}</h4>
                                        <span>₹${p.price.toLocaleString('en-IN')} • ${p.categoryLabel}</span>
                                    </div>
                                    <span class="rec-select-arrow">→</span>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    recBox.querySelectorAll(".rec-chip, .rec-product-card").forEach(btn => {
        btn.addEventListener("click", () => {
            const q = btn.getAttribute("data-query");
            const input = document.getElementById("searchInput");
            if (input && q) {
                input.value = q;
                const clearBtn = document.getElementById("searchClearBtn");
                if (clearBtn) clearBtn.style.display = "block";
                saveRecentSearch(q);
                renderSearchResults(q, "all");
                renderSearchRecommendations(q);
            }
        });
    });

    const clearBtn = document.getElementById("clearRecentBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            clearRecentSearches();
        });
    }
}

function openSearch() {
    const modal = document.getElementById("searchModal");
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const input = document.getElementById("searchInput");
    if (input) {
        input.focus();
        renderSearchResults(input.value);
        renderSearchRecommendations(input.value);
    }
}

function closeSearch() {
    const modal = document.getElementById("searchModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function renderSearchResults(query = "", category = "all") {
    const grid = document.getElementById("searchResultsGrid");
    const countEl = document.getElementById("searchResultsCount");
    if (!grid) return;

    const cleanQ = query.trim().toLowerCase();

    const filtered = PRODUCTS_DATA.filter(item => {
        const matchesCategory = category === "all" || item.category === category;
        const matchesQuery = !cleanQ ||
            item.name.toLowerCase().includes(cleanQ) ||
            item.categoryLabel.toLowerCase().includes(cleanQ) ||
            item.description.toLowerCase().includes(cleanQ) ||
            (item.tag && item.tag.toLowerCase().includes(cleanQ)) ||
            item.price.toString().includes(cleanQ);

        return matchesCategory && matchesQuery;
    });

    if (countEl) {
        countEl.textContent = `Showing ${filtered.length} design${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="search-empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <h4>No designs found for "${query}"</h4>
                <p>Try searching for "Women", "Hoodie", "Shirt", "Signature", or "Premium".</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const isWishlisted = wishlist.includes(item.id);
        return `
            <div class="search-result-card">
                <div class="search-card-img">
                    <img src="${item.image}" alt="${item.name}">
                    <button class="wishlist-btn-card ${isWishlisted ? 'active' : ''}" data-id="${item.id}" aria-label="Wishlist">
                        <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                </div>
                <div class="search-card-body">
                    <span class="search-card-cat">${item.categoryLabel}</span>
                    <h4 class="search-card-title">${item.name}</h4>
                    <span class="search-card-price">₹${item.price.toLocaleString('en-IN')}</span>
                    <div class="search-card-actions">
                        <button class="btn-card-cart" data-id="${item.id}">Add Cart</button>
                        <button class="btn-card-buy" data-id="${item.id}">Buy Now</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    attachCardEventListeners(grid);
}

function setupSearchEvents() {
    const input = document.getElementById("searchInput");
    const clearBtn = document.getElementById("searchClearBtn");
    const closeBtn = document.getElementById("searchCloseBtn");
    const backdrop = document.getElementById("searchBackdrop");
    const tags = document.querySelectorAll(".search-tag");

    if (input) {
        input.addEventListener("input", (e) => {
            const val = e.target.value;
            if (clearBtn) clearBtn.style.display = val ? "block" : "none";
            renderSearchResults(val, getActiveSearchTag());
            renderSearchRecommendations(val);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                saveRecentSearch(input.value);
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (input) {
                input.value = "";
                clearBtn.style.display = "none";
                input.focus();
                renderSearchResults("", getActiveSearchTag());
                renderSearchRecommendations("");
            }
        });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeSearch);
    if (backdrop) backdrop.addEventListener("click", closeSearch);

    tags.forEach(tag => {
        tag.addEventListener("click", () => {
            tags.forEach(t => t.classList.remove("active"));
            tag.classList.add("active");
            const cat = tag.getAttribute("data-query");
            renderSearchResults(input ? input.value : "", cat);
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeSearch();
            closeCart();
            closeWishlist();
            closeCheckout();
        }
        if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            e.preventDefault();
            openSearch();
        }
    });
}

function getActiveSearchTag() {
    const activeTag = document.querySelector(".search-tag.active");
    return activeTag ? activeTag.getAttribute("data-query") : "all";
}

/* =========================================================
   7. CART ENGINE
========================================================= */
function openCart() {
    closeWishlist();
    closeSearch();
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("cartBackdrop");
    if (drawer && backdrop) {
        drawer.classList.add("active");
        backdrop.classList.add("active");
        drawer.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        renderCartDrawer();
    }
}

function closeCart() {
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("cartBackdrop");
    if (drawer && backdrop) {
        drawer.classList.remove("active");
        backdrop.classList.remove("active");
        drawer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

function addToCart(productId, size = "M", quantity = 1) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.categoryLabel,
            size: size,
            quantity: quantity,
            sizes: product.sizes
        });
    }

    saveCart();
    showToast(`Added "${product.name}" to cart!`);
    openCart();
}

function removeFromCart(index) {
    if (cart[index]) {
        const removed = cart.splice(index, 1);
        saveCart();
        showToast(`Removed "${removed[0].name}" from cart.`);
    }
}

function updateCartQuantity(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            saveCart();
        }
    }
}

function updateCartItemSize(index, newSize) {
    if (cart[index]) {
        cart[index].size = newSize;
        saveCart();
    }
}

function renderCartDrawer() {
    const body = document.getElementById("cartBody");
    const footer = document.getElementById("cartFooter");
    const countEl = document.getElementById("cartHeaderCount");
    if (!body) return;

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countEl) countEl.textContent = `(${totalCount} item${totalCount === 1 ? '' : 's'})`;

    if (cart.length === 0) {
        body.innerHTML = `
            <div class="empty-drawer">
                <span class="empty-drawer-icon"><svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" fill="none" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></span>
                <h4>Your Cart is Empty</h4>
                <p>Explore our exclusive fashion designs and add items to your cart.</p>
                <button class="btn primary-btn" onclick="closeCart(); openSearch();">
                    Explore Designs
                </button>
            </div>
        `;
        if (footer) footer.style.display = "none";
        return;
    }

    if (footer) footer.style.display = "block";

    body.innerHTML = cart.map((item, index) => `
        <div class="drawer-item">
            <img src="${item.image}" alt="${item.name}" class="drawer-item-img">
            <div class="drawer-item-info">
                <div>
                    <h4 class="drawer-item-title">${item.name}</h4>
                    <div class="drawer-item-meta">
                        <span>${item.category}</span>
                        <span>•</span>
                        <label>Size: 
                            <select class="drawer-size-select" onchange="updateCartItemSize(${index}, this.value)">
                                ${(item.sizes || ["S", "M", "L", "XL"]).map(s => `
                                    <option value="${s}" ${s === item.size ? 'selected' : ''}>${s}</option>
                                `).join("")}
                            </select>
                        </label>
                    </div>
                </div>
                <div class="drawer-item-bottom">
                    <span class="drawer-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
            <button class="drawer-item-remove" onclick="removeFromCart(${index})" title="Remove item">✕</button>
        </div>
    `).join("");

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
    const total = subtotal - discountAmount;

    const subtotalEl = document.getElementById("cartSubtotal");
    const totalEl = document.getElementById("cartTotal");
    const discountRow = document.getElementById("discountRow");
    const discountLabel = document.getElementById("discountLabel");
    const discountEl = document.getElementById("cartDiscount");

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

    if (appliedDiscount > 0 && discountRow) {
        discountRow.style.display = "flex";
        if (discountLabel) discountLabel.textContent = `Discount (${appliedDiscount}%)`;
        if (discountEl) discountEl.textContent = `-₹${discountAmount.toLocaleString('en-IN')}`;
    } else if (discountRow) {
        discountRow.style.display = "none";
    }
}

function setupCartEvents() {
    const closeBtn = document.getElementById("cartCloseBtn");
    const backdrop = document.getElementById("cartBackdrop");
    const continueBtn = document.getElementById("continueShoppingBtn");
    const applyPromoBtn = document.getElementById("applyPromoBtn");
    const promoInput = document.getElementById("promoInput");
    const proceedBtn = document.getElementById("proceedToPayBtn");

    if (closeBtn) closeBtn.addEventListener("click", closeCart);
    if (backdrop) backdrop.addEventListener("click", closeCart);
    if (continueBtn) continueBtn.addEventListener("click", closeCart);

    if (applyPromoBtn && promoInput) {
        applyPromoBtn.addEventListener("click", () => {
            const code = promoInput.value.trim().toUpperCase();
            const feedback = document.getElementById("promoFeedback");
            if (!feedback) return;

            if (code === "ARFIRST") {
                appliedDiscount = 10;
                feedback.textContent = "10% Welcome Discount applied!";
                feedback.className = "promo-feedback success";
                renderCartDrawer();
            } else if (code === "GOLD20") {
                appliedDiscount = 20;
                feedback.textContent = "20% Luxury Discount applied!";
                feedback.className = "promo-feedback success";
                renderCartDrawer();
            } else {
                feedback.textContent = "Invalid promo code. Try 'ARFIRST'";
                feedback.className = "promo-feedback error";
            }
        });
    }

    if (proceedBtn) {
        proceedBtn.addEventListener("click", () => {
            closeCart();
            openCheckout(cart);
        });
    }
}

/* =========================================================
   8. WISHLIST ENGINE
========================================================= */
function openWishlist() {
    closeCart();
    closeSearch();
    const drawer = document.getElementById("wishlistDrawer");
    const backdrop = document.getElementById("wishlistBackdrop");
    if (drawer && backdrop) {
        drawer.classList.add("active");
        backdrop.classList.add("active");
        drawer.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        renderWishlistDrawer();
    }
}

function closeWishlist() {
    const drawer = document.getElementById("wishlistDrawer");
    const backdrop = document.getElementById("wishlistBackdrop");
    if (drawer && backdrop) {
        drawer.classList.remove("active");
        backdrop.classList.remove("active");
        drawer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    const title = product ? product.name : "Design";

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast(`Removed "${title}" from Wishlist.`);
    } else {
        wishlist.push(productId);
        showToast(`Added "${title}" to Wishlist!`);
    }

    saveWishlist();
}

function syncWishlistButtons() {
    document.querySelectorAll(".wishlist-btn-card").forEach(btn => {
        const id = btn.getAttribute("data-id");
        if (wishlist.includes(id)) {
            btn.classList.add("active");
            btn.setAttribute("title", "Remove from Wishlist");
        } else {
            btn.classList.remove("active");
            btn.setAttribute("title", "Add to Wishlist");
        }
    });
}

function renderWishlistDrawer() {
    const body = document.getElementById("wishlistBody");
    const footer = document.getElementById("wishlistFooter");
    const countEl = document.getElementById("wishlistHeaderCount");
    if (!body) return;

    if (countEl) countEl.textContent = `(${wishlist.length} item${wishlist.length === 1 ? '' : 's'})`;

    const wishlistedProducts = PRODUCTS_DATA.filter(p => wishlist.includes(p.id));

    if (wishlistedProducts.length === 0) {
        body.innerHTML = `
            <div class="empty-drawer">
                <span class="empty-drawer-icon"><svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" fill="none" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span>
                <h4>Your Wishlist is Empty</h4>
                <p>Save items you love here by clicking the heart icon on any design.</p>
                <button class="btn primary-btn" onclick="closeWishlist(); openSearch();">
                    Explore Designs
                </button>
            </div>
        `;
        if (footer) footer.style.display = "none";
        return;
    }

    if (footer) footer.style.display = "block";

    body.innerHTML = wishlistedProducts.map(item => `
        <div class="drawer-item">
            <img src="${item.image}" alt="${item.name}" class="drawer-item-img">
            <div class="drawer-item-info">
                <div>
                    <h4 class="drawer-item-title">${item.name}</h4>
                    <div class="drawer-item-meta">
                        <span>${item.categoryLabel}</span>
                    </div>
                </div>
                <div class="drawer-item-bottom">
                    <span class="drawer-item-price">₹${item.price.toLocaleString('en-IN')}</span>
                    <button class="btn-move-cart" onclick="moveWishlistToCart('${item.id}')">
                        Move to Cart
                    </button>
                </div>
            </div>
            <button class="drawer-item-remove" onclick="toggleWishlist('${item.id}')" title="Remove">✕</button>
        </div>
    `).join("");
}

function moveWishlistToCart(productId) {
    addToCart(productId, "M", 1);
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        saveWishlist();
    }
}

function setupWishlistEvents() {
    const closeBtn = document.getElementById("wishlistCloseBtn");
    const backdrop = document.getElementById("wishlistBackdrop");
    const moveAllBtn = document.getElementById("moveAllToCartBtn");

    if (closeBtn) closeBtn.addEventListener("click", closeWishlist);
    if (backdrop) backdrop.addEventListener("click", closeWishlist);

    if (moveAllBtn) {
        moveAllBtn.addEventListener("click", () => {
            const ids = [...wishlist];
            ids.forEach(id => addToCart(id, "M", 1));
            wishlist = [];
            saveWishlist();
            closeWishlist();
            openCart();
            showToast("All wishlisted items moved to cart!");
        });
    }
}

/* =========================================================
   9. PAYMENT & CHECKOUT ENGINE
========================================================= */
function openCheckout(itemsToCheckout) {
    if (!itemsToCheckout || itemsToCheckout.length === 0) {
        showToast("Please add items to cart first.");
        return;
    }

    checkoutItems = [...itemsToCheckout];
    const modal = document.getElementById("checkoutModal");
    if (!modal) return;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    goToCheckoutStep(1);
}

function closeCheckout() {
    const modal = document.getElementById("checkoutModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function goToCheckoutStep(stepNumber) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`stepIndicator${i}`);
        const panel = document.getElementById(`stepPanel${i}`);
        if (indicator) {
            indicator.classList.remove("active", "completed");
            if (i < stepNumber) indicator.classList.add("completed");
            if (i === stepNumber) indicator.classList.add("active");
        }
        if (panel) {
            panel.classList.remove("active");
            if (i === stepNumber) panel.classList.add("active");
        }
    }

    const panel4 = document.getElementById("stepPanel4");
    if (panel4) {
        panel4.classList.remove("active");
        if (stepNumber === 4) panel4.classList.add("active");
    }

    if (stepNumber === 3) {
        renderOrderReview();
    }
}

function renderOrderReview() {
    const list = document.getElementById("reviewItemsList");
    const countEl = document.getElementById("reviewItemsCount");
    const addrEl = document.getElementById("reviewShippingAddress");
    const payEl = document.getElementById("reviewPaymentMethod");
    const subtotalEl = document.getElementById("reviewSubtotal");
    const discountRow = document.getElementById("reviewDiscountRow");
    const discountEl = document.getElementById("reviewDiscount");
    const totalEl = document.getElementById("reviewTotal");

    const totalCount = checkoutItems.reduce((s, i) => s + i.quantity, 0);
    if (countEl) countEl.textContent = totalCount;

    if (list) {
        list.innerHTML = checkoutItems.map(item => `
            <div class="review-item-row">
                <img src="${item.image}" alt="${item.name}" class="review-item-img">
                <div class="review-item-details">
                    <strong>${item.name}</strong>
                    <span>Size: ${item.size} • Qty: ${item.quantity}</span>
                </div>
                <span class="review-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
        `).join("");
    }

    const name = document.getElementById("shipName")?.value || "Sarah Jenkins";
    const city = document.getElementById("shipCity")?.value || "Mumbai";
    const pin = document.getElementById("shipPin")?.value || "400001";
    const address = document.getElementById("shipAddress")?.value || "High Street";
    if (addrEl) addrEl.textContent = `${name}, ${address}, ${city} - ${pin}`;

    const payNames = {
        upi: "UPI / QR Code (Instant)",
        card: "Credit / Debit Card",
        netbanking: `Net Banking (${document.getElementById("bankSelect")?.value || "Bank"})`,
        cod: "Cash on Delivery (COD)"
    };
    if (payEl) payEl.textContent = payNames[selectedPaymentMethod] || "UPI Payment";

    const subtotal = checkoutItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
    const total = subtotal - discountAmount;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

    if (appliedDiscount > 0 && discountRow) {
        discountRow.style.display = "flex";
        if (discountEl) discountEl.textContent = `-₹${discountAmount.toLocaleString('en-IN')}`;
    } else if (discountRow) {
        discountRow.style.display = "none";
    }
}

function processPayment() {
    goToCheckoutStep(4);
    const processingEl = document.getElementById("paymentProcessing");
    const successEl = document.getElementById("paymentSuccess");

    if (processingEl) processingEl.style.display = "flex";
    if (successEl) successEl.style.display = "none";

    setTimeout(() => {
        if (processingEl) processingEl.style.display = "none";
        if (successEl) successEl.style.display = "block";

        const orderId = `#AR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const orderDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        
        const subtotal = checkoutItems.reduce((s, i) => s + (i.price * i.quantity), 0);
        const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
        const total = subtotal - discountAmount;

        const name = document.getElementById("shipName")?.value || "Customer";
        const city = document.getElementById("shipCity")?.value || "City";

        const orderIdEl = document.getElementById("receiptOrderId");
        const orderDateEl = document.getElementById("receiptOrderDate");
        const modeEl = document.getElementById("receiptPaymentMode");
        const toEl = document.getElementById("receiptDeliveryTo");
        const totalEl = document.getElementById("receiptTotalAmount");

        if (orderIdEl) orderIdEl.textContent = orderId;
        if (orderDateEl) orderDateEl.textContent = orderDate;
        if (modeEl) modeEl.textContent = selectedPaymentMethod.toUpperCase();
        if (toEl) toEl.textContent = `${name}, ${city}`;
        if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

        cart = [];
        saveCart();
    }, 1600);
}

function setupCheckoutEvents() {
    const closeBtn = document.getElementById("checkoutCloseBtn");
    const backdrop = document.getElementById("checkoutBackdrop");

    if (closeBtn) closeBtn.addEventListener("click", closeCheckout);
    if (backdrop) backdrop.addEventListener("click", closeCheckout);

    const toStep2Btn = document.getElementById("toStep2Btn");
    if (toStep2Btn) {
        toStep2Btn.addEventListener("click", () => {
            const form = document.getElementById("shippingForm");
            if (form && !form.checkValidity()) {
                form.reportValidity();
                return;
            }
            goToCheckoutStep(2);
        });
    }

    const methodCards = document.querySelectorAll(".payment-method-card");
    methodCards.forEach(card => {
        card.addEventListener("click", () => {
            methodCards.forEach(c => {
                c.classList.remove("active");
                const radio = c.querySelector("input[type='radio']");
                if (radio) radio.checked = false;
                const details = c.querySelector(".method-details");
                if (details) details.style.display = "none";
            });

            card.classList.add("active");
            const radio = card.querySelector("input[type='radio']");
            if (radio) radio.checked = true;
            const details = card.querySelector(".method-details");
            if (details) details.style.display = "block";

            selectedPaymentMethod = card.getAttribute("data-method") || "upi";
        });
    });

    const verifyUpiBtn = document.getElementById("verifyUpiBtn");
    if (verifyUpiBtn) {
        verifyUpiBtn.addEventListener("click", () => {
            const input = document.getElementById("upiIdInput");
            if (input && input.value.trim().length > 3) {
                verifyUpiBtn.textContent = "Verified";
                verifyUpiBtn.style.color = "#4ade80";
                verifyUpiBtn.style.borderColor = "#4ade80";
                showToast("UPI ID verified successfully!");
            } else {
                showToast("Please enter a valid UPI ID (e.g. mobile@upi)");
            }
        });
    }

    const backToStep1Btn = document.getElementById("backToStep1Btn");
    if (backToStep1Btn) backToStep1Btn.addEventListener("click", () => goToCheckoutStep(1));

    const toStep3Btn = document.getElementById("toStep3Btn");
    if (toStep3Btn) toStep3Btn.addEventListener("click", () => goToCheckoutStep(3));

    const backToStep2Btn = document.getElementById("backToStep2Btn");
    if (backToStep2Btn) backToStep2Btn.addEventListener("click", () => goToCheckoutStep(2));

    const editShippingBtn = document.getElementById("editShippingBtn");
    if (editShippingBtn) editShippingBtn.addEventListener("click", () => goToCheckoutStep(1));

    const editPaymentBtn = document.getElementById("editPaymentBtn");
    if (editPaymentBtn) editPaymentBtn.addEventListener("click", () => goToCheckoutStep(2));

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    if (placeOrderBtn) placeOrderBtn.addEventListener("click", processPayment);

    const finishShoppingBtn = document.getElementById("finishShoppingBtn");
    if (finishShoppingBtn) {
        finishShoppingBtn.addEventListener("click", () => {
            closeCheckout();
            showToast("Thank you for shopping with AR Clothing & Designs!", "✨");
        });
    }

    const printReceiptBtn = document.getElementById("printReceiptBtn");
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener("click", () => {
            window.print();
        });
    }
}

/* =========================================================
   10. ATTACHING CARD ACTIONS TO STATIC & DYNAMIC CARDS
========================================================= */
function attachCardEventListeners(root = document) {
    root.querySelectorAll(".btn-card-cart, .add-cart-btn").forEach(btn => {
        if (btn.hasAttribute("data-bound")) return;
        btn.setAttribute("data-bound", "true");

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute("data-id") || getNearestProductId(btn);
            if (id) {
                addToCart(id, "M", 1);
            }
        });
    });

    root.querySelectorAll(".btn-card-buy, .buy-now-btn, .buy-btn").forEach(btn => {
        if (btn.hasAttribute("data-bound")) return;
        btn.setAttribute("data-bound", "true");

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute("data-id") || getNearestProductId(btn);
            if (id) {
                const product = PRODUCTS_DATA.find(p => p.id === id);
                if (product) {
                    openCheckout([{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.categoryLabel,
                        size: "M",
                        quantity: 1,
                        sizes: product.sizes
                    }]);
                }
            }
        });
    });

    root.querySelectorAll(".wishlist-btn-card").forEach(btn => {
        if (btn.hasAttribute("data-bound")) return;
        btn.setAttribute("data-bound", "true");

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute("data-id") || getNearestProductId(btn);
            if (id) {
                toggleWishlist(id);
            }
        });
    });

    // Bind full card click to open Product Details Modal
    root.querySelectorAll(".collection-card, .product-card, .design-card").forEach(card => {
        if (card.hasAttribute("data-click-bound")) return;
        card.setAttribute("data-click-bound", "true");
        card.style.cursor = "pointer";

        card.addEventListener("click", (e) => {
            if (e.target.closest(".btn-card-cart, .btn-card-buy, .wishlist-btn-card, .add-cart-btn, .buy-now-btn, button, a")) return;
            const id = card.getAttribute("data-id") || getNearestProductId(card);
            if (id) {
                openProductModal(id);
            }
        });
    });
}

/* =========================================================
   PRODUCT DETAILS QUICK VIEW POPUP MODAL ENGINE
========================================================= */
function openProductModal(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    let modal = document.getElementById("productDetailModal");
    if (!modal) {
        const modalHTML = `
            <div id="productDetailModal" class="product-detail-modal" aria-hidden="true">
                <div class="modal-overlay" onclick="closeProductModal()"></div>
                <div class="modal-dialog product-modal-dialog">
                    <button type="button" class="product-modal-close" onclick="closeProductModal()" aria-label="Close">&times;</button>
                    <div id="productModalContent" class="product-modal-content"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        modal = document.getElementById("productDetailModal");
    }

    const contentEl = document.getElementById("productModalContent");
    if (!contentEl) return;

    const sizesHTML = (product.sizes || ["S", "M", "L", "XL"]).map((sz, idx) => `
        <button type="button" class="modal-size-btn ${idx === 1 ? 'active' : ''}" data-size="${sz}" onclick="selectModalSize(this)">
            ${sz}
        </button>
    `).join("");

    const isWishlisted = wishlist.includes(product.id);
    const originalPrice = Math.round(product.price * 1.25);

    contentEl.innerHTML = `
        <div class="product-modal-grid">
            <!-- Left Image Showcase -->
            <div class="product-modal-gallery">
                <div class="product-modal-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" id="modalMainImage">
                    ${product.tag ? `<span class="product-modal-tag">${product.tag}</span>` : ''}
                </div>
                <div class="product-modal-benefits">
                    <div class="modal-benefit-pill">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        GST Verified Invoice
                    </div>
                    <div class="modal-benefit-pill">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        Quality Checked & Export Standard
                    </div>
                    <div class="modal-benefit-pill">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        Custom Sizing Available
                    </div>
                </div>
            </div>

            <!-- Right Details Section -->
            <div class="product-modal-details">
                <div class="modal-meta-top">
                    <span class="modal-category-label">${product.categoryLabel || "Collection"}</span>
                    <span class="modal-stock-status">● In Stock • Ready for Delivery</span>
                </div>

                <h2 class="modal-product-title">${product.name}</h2>

                <div class="modal-price-row">
                    <span class="modal-current-price">₹${product.price.toLocaleString('en-IN')}</span>
                    <span class="modal-slashed-price">₹${originalPrice.toLocaleString('en-IN')}</span>
                    <span class="modal-save-tag">20% OFF</span>
                </div>

                <div class="modal-description">
                    <p>${product.description || 'Crafted with premium materials, fine stitching, and attention to detail. Designed for comfort, elegant drape, and long-lasting durability.'}</p>
                </div>

                <div class="modal-option-group">
                    <div class="modal-option-label">
                        <span>Select Size</span>
                        <span class="size-guide-trigger" onclick="showToast('Standard Size Chart: S (36), M (38), L (40), XL (42), XXL (44)')">Size Guide 📏</span>
                    </div>
                    <div class="modal-sizes-row">
                        ${sizesHTML}
                    </div>
                </div>

                <div class="modal-option-group">
                    <div class="modal-option-label">
                        <span>Quantity</span>
                    </div>
                    <div class="modal-qty-counter">
                        <button type="button" class="qty-btn" onclick="updateModalQty(-1)">-</button>
                        <input type="number" id="modalQtyInput" value="1" min="1" max="99" readonly>
                        <button type="button" class="qty-btn" onclick="updateModalQty(1)">+</button>
                    </div>
                </div>

                <div class="modal-actions-grid">
                    <button type="button" class="modal-add-cart-btn" onclick="submitModalAddToCart('${product.id}')">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        ADD TO CART
                    </button>

                    <button type="button" class="modal-buy-now-btn" onclick="submitModalBuyNow('${product.id}')">
                        BUY NOW
                    </button>

                    <button type="button" class="modal-wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${product.id}'); this.classList.toggle('active');" title="Wishlist">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                </div>

                <div class="modal-whatsapp-enquiry">
                    <a href="https://wa.me/919876543210?text=Hi%20AR%20Clothing%2C%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}%20(₹${product.price})" target="_blank" class="modal-whatsapp-btn">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                        Ask Design Team via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeProductModal() {
    const modal = document.getElementById("productDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function selectModalSize(btn) {
    document.querySelectorAll(".modal-size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function updateModalQty(change) {
    const input = document.getElementById("modalQtyInput");
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(99, val + change));
    input.value = val;
}

function submitModalAddToCart(productId) {
    const activeSizeBtn = document.querySelector(".modal-size-btn.active");
    const size = activeSizeBtn ? activeSizeBtn.getAttribute("data-size") : "M";
    const qtyInput = document.getElementById("modalQtyInput");
    const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

    addToCart(productId, size, qty);
    closeProductModal();
}

function submitModalBuyNow(productId) {
    const activeSizeBtn = document.querySelector(".modal-size-btn.active");
    const size = activeSizeBtn ? activeSizeBtn.getAttribute("data-size") : "M";
    const qtyInput = document.getElementById("modalQtyInput");
    const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    closeProductModal();
    openCheckout([{
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.categoryLabel,
        size: size,
        quantity: qty,
        sizes: product.sizes
    }]);
}

function getNearestProductId(element) {
    const card = element.closest("[data-id], .collection-card, .product-card, .design-card");
    if (!card) return null;
    return card.getAttribute("data-id");
}

/* =========================================================
   11. EXISTING WEBSITE FEATURES
========================================================= */

/* Mobile Navigation */
const header = document.querySelector(".header");
const navbar = document.querySelector(".navbar");

if (header && navbar) {
    const menuButton = document.createElement("button");
    menuButton.classList.add("menu-toggle");
    menuButton.setAttribute("aria-label", "Toggle navigation");
    menuButton.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2.2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    
    const headerActions = header.querySelector(".header-actions");
    if (headerActions) {
        headerActions.appendChild(menuButton);
    } else {
        header.appendChild(menuButton);
    }

    menuButton.addEventListener("click", () => {
        navbar.classList.toggle("mobile-active");
        menuButton.classList.toggle("open");
    });

    const navLinks = navbar.querySelectorAll("a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navbar.classList.remove("mobile-active");
            menuButton.classList.remove("open");
        });
    });
}

/* Header Scroll Effect */
window.addEventListener("scroll", () => {
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

/* Collection Category Filter (Designs page) */
const filterButtons = document.querySelectorAll(".filter-btn");
const collectionCards = document.querySelectorAll(".collection-card");

if (filterButtons.length > 0 && collectionCards.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            const selectedCategory = button.getAttribute("data-filter");

            collectionCards.forEach(card => {
                const cardCategory = card.getAttribute("data-category");
                if (selectedCategory === "all" || cardCategory === selectedCategory) {
                    card.style.display = "";
                    setTimeout(() => card.classList.add("show"), 20);
                } else {
                    card.classList.remove("show");
                    card.style.display = "none";
                }
            });
        });
    });
}

/* Live Sort Select Handler on Designs Page */
const sortSelect = document.getElementById("sortSelect");
const collectionGrid = document.querySelector(".collection-grid");

if (sortSelect && collectionGrid) {
    sortSelect.addEventListener("change", () => {
        const val = sortSelect.value;
        const cardsArray = Array.from(collectionGrid.querySelectorAll(".collection-card"));

        cardsArray.sort((a, b) => {
            const priceA = parseFloat(a.querySelector(".collection-price")?.textContent.replace(/[^0-9.]/g, "") || 0);
            const priceB = parseFloat(b.querySelector(".collection-price")?.textContent.replace(/[^0-9.]/g, "") || 0);

            if (val === "price-low") return priceA - priceB;
            if (val === "price-high") return priceB - priceA;
            if (val === "newest") {
                const idA = a.getAttribute("data-id") || "";
                const idB = b.getAttribute("data-id") || "";
                return idB.localeCompare(idA);
            }
            return 0; // featured default
        });

        cardsArray.forEach(card => collectionGrid.appendChild(card));
    });
}

/* Products Category Filter (Collections page) */
const categoryButtons = document.querySelectorAll(".category-btn");
const productCards = document.querySelectorAll(".product-card");

if (categoryButtons.length > 0 && productCards.length > 0) {
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            categoryButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            const selectedCategory = button.getAttribute("data-category");

            productCards.forEach(card => {
                const cardCategory = card.getAttribute("data-category");
                if (selectedCategory === "all" || cardCategory === selectedCategory) {
                    card.style.display = "";
                    setTimeout(() => card.classList.add("show"), 20);
                } else {
                    card.classList.remove("show");
                    card.style.display = "none";
                }
            });
        });
    });
}

/* Contact Form */
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = document.getElementById("name")?.value.trim();
        const company = document.getElementById("company")?.value.trim() || "";
        const phone = document.getElementById("phone")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const requirement = document.getElementById("requirement")?.value;
        const quantity = document.getElementById("quantity")?.value;
        const timeline = document.getElementById("timeline")?.value;
        const budget = document.getElementById("budget")?.value;
        const message = document.getElementById("message")?.value.trim();
        const whatsappUpdates = document.getElementById("whatsappUpdates")?.checked;

        if (!name || !phone || !email || !requirement || !message) {
            showFormMessage("Please complete all mandatory fields marked with an asterisk (*).", "error");
            return;
        }

        const phonePattern = /^[0-9+\-\s()]{7,20}$/;
        if (!phonePattern.test(phone)) {
            showFormMessage("Please enter a valid phone number (e.g. +91 98765 43210).", "error");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showFormMessage("Please enter a valid email address.", "error");
            return;
        }

        const refId = "AR-" + Math.floor(100000 + Math.random() * 900000);
        const submitBtn = document.getElementById("submitEnquiryBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Processing Enquiry...</span>`;
        }

        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Submit Project Enquiry</span><span class="btn-arrow">→</span>`;
            }

            const successHTML = `
                <div class="enquiry-success-card">
                    <div class="success-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                    <h4>Enquiry Submitted Successfully!</h4>
                    <p class="ref-code">Reference ID: <strong>#${refId}</strong></p>
                    <p>Thank you <strong>${name}</strong>${company ? ' (' + company + ')' : ''}. Our fashion & production specialists have received your project specifications and will contact you via <strong>${email}</strong> / WhatsApp within 24 hours.</p>
                </div>
            `;

            showFormSuccessHTML(successHTML);
            showToast(`Enquiry Submitted! Ref #${refId}`);
            contactForm.reset();
        }, 600);
    });
}

function showFormMessage(message, type = "error") {
    if (!formMessage) return;
    formMessage.innerHTML = `<div class="form-alert ${type}">${message}</div>`;
    formMessage.style.display = "block";
    setTimeout(() => {
        formMessage.style.display = "none";
    }, 6000);
}

function showFormSuccessHTML(html) {
    if (!formMessage) return;
    formMessage.innerHTML = html;
    formMessage.style.display = "block";
    formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* Smooth Scroll */
const internalLinks = document.querySelectorAll('a[href^="#"]');
internalLinks.forEach(link => {
    link.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");
        if (targetId === "#" || targetId.length <= 1) return;
        const target = document.querySelector(targetId);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

/* AI Generator Notification */
const aiButton = document.querySelector(".ai-coming-btn");
if (aiButton) {
    aiButton.addEventListener("click", () => {
        showAIFeatureMessage();
    });
}

function showAIFeatureMessage() {
    const message = document.createElement("div");
    message.classList.add("ai-notification");
    message.innerHTML = `
        <div class="ai-notification-content">
            <div class="ai-notification-icon"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
            <div>
                <strong>AI Design Generator</strong>
                <p>This feature is currently under development. Soon you'll be able to turn your clothing ideas into AI-generated design concepts.</p>
            </div>
            <button class="ai-close" aria-label="Close notification">×</button>
        </div>
    `;
    document.body.appendChild(message);
    const closeButton = message.querySelector(".ai-close");
    closeButton.addEventListener("click", () => message.remove());
    setTimeout(() => { if (message.parentElement) message.remove(); }, 6000);
}

/* Scroll Reveal Observer */
const revealElements = document.querySelectorAll(
    ".main-service-card, .collection-card, .benefit-card, .process-step, .contact-card, .product-card"
);

if (revealElements.length > 0 && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(element => {
        element.classList.add("reveal-element");
        revealObserver.observe(element);
    });
}

/* Current Year */
document.querySelectorAll(".current-year").forEach(element => {
    element.textContent = new Date().getFullYear();
});

/* Hero Background Parallax Scroll Effect */
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    if (scrollY < 1200) {
        const heroSection = document.querySelector(".hero, .page-hero");
        if (heroSection) {
            heroSection.style.backgroundPositionY = `${scrollY * 0.3}px`;
        }
    }
});

/* Privacy Policy Modal Injector & Event Handler */
function initPrivacyModal() {
    if (document.getElementById("privacyModal")) return;

    const modalHTML = `
        <div id="privacyModal" class="privacy-modal" aria-hidden="true">
            <div class="modal-overlay" data-close-privacy></div>
            <div class="modal-dialog privacy-dialog">
                <div class="modal-header">
                    <h3>Privacy Policy & Terms</h3>
                    <button type="button" class="modal-close-btn" data-close-privacy aria-label="Close Modal">&times;</button>
                </div>
                <div class="modal-body privacy-body">
                    <div class="privacy-modal-card">
                        <h4>1. Design Confidentiality & Non-Disclosure</h4>
                        <p>All design sketches, tech packs, measurements, and proprietary garment concepts submitted to AR Clothing & Designs remain 100% your intellectual property. We do not share, replicate, or commercialize client designs without written approval.</p>
                    </div>
                    <div class="privacy-modal-card">
                        <h4>2. Personal Data Protection</h4>
                        <p>Your full name, phone number, email address, and order specifications submitted through our project enquiry form are encrypted and strictly used for project communication, quotes, and order fulfillment.</p>
                    </div>
                    <div class="privacy-modal-card">
                        <h4>3. Quotation & Payment Terms</h4>
                        <p>All project estimates and manufacturing quotes are valid for 30 calendar days. Sample payments and bulk order deposits are processed securely with generated GST invoices and order receipts.</p>
                    </div>
                    <div class="privacy-modal-card">
                        <h4>4. Communication Policy</h4>
                        <p>We send project updates and design previews via WhatsApp and email only when requested. You can opt out of updates at any time by replying to our communication channels.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn primary-btn" data-close-privacy>I Understand</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("privacyModal");
    const openBtns = document.querySelectorAll("#openPrivacyModalBtn, .footer-privacy-btn, a[href='#privacy-policy']");

    openBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        });
    });

    document.querySelectorAll("[data-close-privacy]").forEach(el => {
        el.addEventListener("click", () => {
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        });
    });
}

/* AI Feature Trigger Listener */
function initAiHomeTrigger() {
    const aiBtn = document.getElementById("triggerAiFeatureBtn");
    if (aiBtn) {
        aiBtn.addEventListener("click", () => {
            showAIFeatureMessage();
        });
    }
}

/* =========================================================
   11B. ADMIN & STAFF LOGIN SYSTEM (INTEGRATED TAB)
========================================================= */
function openAdminModal() {
    if (window.location.pathname.includes("login.html")) {
        switchAuthTab("admin");
    } else {
        window.location.href = "login.html#admin";
    }
}

function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const emailInput = document.getElementById("page-admin-email") || document.getElementById("admin-email");
    const email = emailInput && emailInput.value ? emailInput.value : "admin@arclothing.com";
    const roleSelect = document.getElementById("page-admin-role") || document.getElementById("admin-role");
    const roleName = roleSelect ? roleSelect.options[roleSelect.selectedIndex].text : "Store Administrator";

    showToastNotification(`Welcome Back! Authenticated as ${roleName} (${email}). Loading Dashboard...`);
}

/* Auth Tab Switcher (Sign In, Create Account, Admin Login) */
function switchAuthTab(tab) {
    const signinBtn = document.getElementById("tab-signin-btn");
    const registerBtn = document.getElementById("tab-register-btn");
    const adminBtn = document.getElementById("tab-admin-btn");

    const signinForm = document.getElementById("signin-form");
    const registerForm = document.getElementById("register-form");
    const adminForm = document.getElementById("admin-form");

    if (signinBtn) signinBtn.classList.remove("active");
    if (registerBtn) registerBtn.classList.remove("active");
    if (adminBtn) adminBtn.classList.remove("active");

    if (signinForm) signinForm.classList.remove("active");
    if (registerForm) registerForm.classList.remove("active");
    if (adminForm) adminForm.classList.remove("active");

    if (tab === "signin") {
        if (signinBtn) signinBtn.classList.add("active");
        if (signinForm) signinForm.classList.add("active");
    } else if (tab === "register") {
        if (registerBtn) registerBtn.classList.add("active");
        if (registerForm) registerForm.classList.add("active");
    } else if (tab === "admin") {
        if (adminBtn) adminBtn.classList.add("active");
        if (adminForm) adminForm.classList.add("active");
    }
}

/* =========================================================
   12. TOP HERO IMAGE SLIDER, ANIMATION & NAVIGATION SYSTEM
========================================================= */
const HERO_SHOWCASE_IMAGES = [
    { url: "images/designs/hero.jpg", label: "Showroom", title: "Luxury Showcase" },
    { url: "images/designs/design-1.jpg", label: "Executive Suits", title: "Men's Formal Line" },
    { url: "images/designs/designer-1.jpg", label: "Design Studio", title: "Couture Atelier" },
    { url: "images/gallery/gallery-3.jpg", label: "Manufacturing", title: "Garment Production" },
    { url: "images/designs/design-5.jpg", label: "Evening Gowns", title: "Women's Evening" }
];

let heroCurrentIndex = 0;
let heroAutoPlayTimer = null;
let isHeroAutoPlaying = true;

function initTopHeroImageSlider() {
    const heroElem = document.querySelector(".hero.index-hero, .page-hero");
    if (!heroElem) return;

    // Inject Interactive Hero Image Controls Widget
    if (!heroElem.querySelector(".hero-img-nav-wrap")) {
        const navHTML = `
            <div class="hero-img-nav-wrap" aria-label="Hero Image Carousel Controls">
                <button type="button" class="hero-nav-arrow prev" title="Previous Hero Image" onclick="prevHeroImage()">‹</button>
                <div class="hero-nav-dots" id="heroNavDots">
                    ${HERO_SHOWCASE_IMAGES.map((img, idx) => `
                        <button type="button" class="hero-dot ${idx === 0 ? 'active' : ''}" title="${img.label}" onclick="setHeroImage(${idx})"></button>
                    `).join('')}
                </div>
                <button type="button" class="hero-nav-arrow next" title="Next Hero Image" onclick="nextHeroImage()">›</button>
                <button type="button" class="hero-play-pause-btn" id="heroPlayPauseBtn" title="Pause Hero Slideshow" onclick="toggleHeroPlayPause()">
                    <svg class="pause-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>
                    <svg class="play-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style="display:none;"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
            </div>
        `;
        heroElem.appendChild(document.createRange().createContextualFragment(navHTML));
    }

    startHeroAutoPlay();
}

function updateHeroDisplay(index) {
    const heroElem = document.querySelector(".hero.index-hero, .page-hero");
    if (!heroElem) return;

    heroCurrentIndex = (index + HERO_SHOWCASE_IMAGES.length) % HERO_SHOWCASE_IMAGES.length;
    const imgData = HERO_SHOWCASE_IMAGES[heroCurrentIndex];

    let styleTag = document.getElementById("dynamicHeroStyle");
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "dynamicHeroStyle";
        document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
        .hero.index-hero::before,
        .page-hero::before {
            background-image: url("${imgData.url}") !important;
            transition: background-image 0.8s ease-in-out !important;
        }
    `;

    const dots = document.querySelectorAll("#heroNavDots .hero-dot");
    dots.forEach((dot, idx) => {
        if (idx === heroCurrentIndex) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

function setHeroImage(index) {
    updateHeroDisplay(index);
    restartHeroAutoPlay();
}

function nextHeroImage() {
    updateHeroDisplay(heroCurrentIndex + 1);
    restartHeroAutoPlay();
}

function prevHeroImage() {
    updateHeroDisplay(heroCurrentIndex - 1);
    restartHeroAutoPlay();
}

function startHeroAutoPlay() {
    if (heroAutoPlayTimer) clearInterval(heroAutoPlayTimer);
    if (isHeroAutoPlaying) {
        heroAutoPlayTimer = setInterval(() => {
            updateHeroDisplay(heroCurrentIndex + 1);
        }, 5500);
    }
}

function restartHeroAutoPlay() {
    if (isHeroAutoPlaying) {
        startHeroAutoPlay();
    }
}

function toggleHeroPlayPause() {
    isHeroAutoPlaying = !isHeroAutoPlaying;
    const btn = document.getElementById("heroPlayPauseBtn");
    if (btn) {
        const pauseIcon = btn.querySelector(".pause-icon");
        const playIcon = btn.querySelector(".play-icon");
        if (isHeroAutoPlaying) {
            pauseIcon.style.display = "block";
            playIcon.style.display = "none";
            btn.title = "Pause Hero Slideshow";
            startHeroAutoPlay();
        } else {
            pauseIcon.style.display = "none";
            playIcon.style.display = "block";
            btn.title = "Play Hero Slideshow";
            if (heroAutoPlayTimer) clearInterval(heroAutoPlayTimer);
        }
    }
}

/* =========================================================
   13. INITIALIZATION ON DOM READY
========================================================= */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        injectEcommerceModals();
        attachCardEventListeners();
        initPrivacyModal();
        initAiHomeTrigger();
        initTopHeroImageSlider();
        if (window.location.hash === "#admin") switchAuthTab("admin");
    });
} else {
    injectEcommerceModals();
    attachCardEventListeners();
    initPrivacyModal();
    initAiHomeTrigger();
    initTopHeroImageSlider();
    if (window.location.hash === "#admin") switchAuthTab("admin");
}
