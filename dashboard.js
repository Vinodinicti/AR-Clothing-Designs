/* =========================================================
   AR CLOTHING & DESIGNS - DASHBOARD JS CONTROLLER
   ========================================================= */

const API_BASE_URL = 'http://localhost:5000/api';

// Authentication Check
function checkAuth() {
    const token = localStorage.getItem('ar_admin_token');
    const userStr = localStorage.getItem('ar_admin_user');

    if (!token || !userStr) {
        window.location.href = 'admin-login.html';
        return false;
    }

    try {
        const user = JSON.parse(userStr);
        const adminNameDisplay = document.getElementById('adminNameDisplay');
        if (adminNameDisplay && user.name) {
            adminNameDisplay.textContent = user.name;
        }
    } catch (e) {}

    return true;
}

// Perform Auth Check immediately
if (!checkAuth()) {
    // Redirecting to admin-login.html
}

// Logout Handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('ar_admin_token');
            localStorage.removeItem('ar_admin_user');
            window.location.href = 'admin-login.html';
        });
    }
});

// State Management
let currentTab = 'items'; // 'items', 'orders', 'users', 'cart', 'likes', or 'enquiries'
let itemsData = [];
let ordersData = [];
let usersData = [];
let cartData = [];
let likesData = [];
let enquiriesData = [];

// DOM Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const logoutBtn = document.getElementById('logoutBtn');
const tabItems = document.getElementById('tabItems');
const tabOrders = document.getElementById('tabOrders');
const tabUsers = document.getElementById('tabUsers');
const tabCart = document.getElementById('tabCart');
const tabEnquiries = document.getElementById('tabEnquiries');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const addBtnText = document.getElementById('addBtnText');

const totalItemsCount = document.getElementById('totalItemsCount');
const activeItemsCount = document.getElementById('activeItemsCount');
const totalInventoryValue = document.getElementById('totalInventoryValue');
const totalOrdersRevenue = document.getElementById('totalOrdersRevenue');

const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');
const refreshBtn = document.getElementById('refreshBtn');

const mainTableCard = document.getElementById('mainTableCard');
const tableHeadRow = document.getElementById('tableHeadRow');
const tableBody = document.getElementById('tableBody');

const itemModal = document.getElementById('itemModal');
const closeItemModalBtn = document.getElementById('closeItemModalBtn');
const cancelItemModalBtn = document.getElementById('cancelItemModalBtn');
const itemForm = document.getElementById('itemForm');
const modalTitle = document.getElementById('modalTitle');
const itemId = document.getElementById('itemId');
const itemTitleInput = document.getElementById('itemTitleInput');
const itemCategoryInput = document.getElementById('itemCategoryInput');
const itemPriceInput = document.getElementById('itemPriceInput');
const itemStatusInput = document.getElementById('itemStatusInput');
const itemTagInput = document.getElementById('itemTagInput');
const itemDescInput = document.getElementById('itemDescInput');
const itemImageFileInput = document.getElementById('itemImageFileInput');

const PRODUCT_IMAGE_MAP = {
    "Noir Executive Suit": "images/designs/design-1.jpg",
    "Urban Fleece Hoodie": "images/designs/design-2.jpg",
    "Classic Knit Sweater": "images/designs/design-3.jpg",
    "Emerald Drape Dress": "images/designs/design-4.jpg",
    "Golden Line Evening Gown": "images/designs/design-5.jpg",
    "Executive Formal Shirt": "images/designs/design-6.jpg"
};

function getProductEngagement(title) {
    if (!title) return { wishlists: 0, cart: 0, orders: 0 };
    const cleanTitle = title.trim().toLowerCase();

    const realOrdersCount = ordersData.filter(o => o.product_name && (o.product_name.trim().toLowerCase() === cleanTitle || cleanTitle.includes(o.product_name.trim().toLowerCase()) || o.product_name.trim().toLowerCase().includes(cleanTitle))).length;
    const realCartCount = cartData.filter(c => c.product_name && (c.product_name.trim().toLowerCase() === cleanTitle || cleanTitle.includes(c.product_name.trim().toLowerCase()) || c.product_name.trim().toLowerCase().includes(cleanTitle))).length;
    const realLikesCount = likesData.filter(l => l.product_name && (l.product_name.trim().toLowerCase() === cleanTitle || cleanTitle.includes(l.product_name.trim().toLowerCase()) || l.product_name.trim().toLowerCase().includes(cleanTitle))).length;

    return {
        wishlists: realLikesCount,
        cart: realCartCount,
        orders: realOrdersCount
    };
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadTableData();

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    if (tabItems) tabItems.addEventListener('click', () => switchTab('items'));
    if (tabOrders) tabOrders.addEventListener('click', () => switchTab('orders'));
    if (tabUsers) tabUsers.addEventListener('click', () => switchTab('users'));
    if (tabCart) tabCart.addEventListener('click', () => switchTab('cart'));
    if (tabEnquiries) tabEnquiries.addEventListener('click', () => switchTab('enquiries'));

    window.addEventListener('storage', (e) => {
        if (e.key === 'ar_project_enquiries') {
            loadTableData();
        }
    });

    if (searchInput) searchInput.addEventListener('input', filterAndRenderTable);
    if (categoryFilter) categoryFilter.addEventListener('change', filterAndRenderTable);
    if (statusFilter) statusFilter.addEventListener('change', filterAndRenderTable);
    if (refreshBtn) refreshBtn.addEventListener('click', refreshDashboard);

    if (openAddModalBtn) openAddModalBtn.addEventListener('click', openAddModal);
    if (closeItemModalBtn) closeItemModalBtn.addEventListener('click', closeModal);
    if (cancelItemModalBtn) cancelItemModalBtn.addEventListener('click', closeModal);
    if (itemForm) itemForm.addEventListener('submit', handleFormSubmit);

    if (itemModal) {
        itemModal.addEventListener('click', (e) => {
            if (e.target === itemModal) closeModal();
        });
    }

    const imagePreviewModal = document.getElementById('imagePreviewModal');
    const closeImagePreviewBtn = document.getElementById('closeImagePreviewBtn');
    if (closeImagePreviewBtn) closeImagePreviewBtn.addEventListener('click', closeImagePreview);
    if (imagePreviewModal) {
        imagePreviewModal.addEventListener('click', (e) => {
            if (e.target === imagePreviewModal) closeImagePreview();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeImagePreview();
    });
});

window.openImagePreview = function(imgSrc, title) {
    const modal = document.getElementById('imagePreviewModal');
    const modalImg = document.getElementById('previewModalImg');
    const caption = document.getElementById('previewModalCaption');

    if (modal && modalImg) {
        modalImg.src = imgSrc;
        if (caption) caption.textContent = title || 'Product Catalog Image';
        modal.classList.add('active');
    }
};

window.closeImagePreview = function() {
    const modal = document.getElementById('imagePreviewModal');
    if (modal) modal.classList.remove('active');
};

function handleLogout() {
    if (confirm('Are you sure you want to log out from Admin Dashboard?')) {
        localStorage.removeItem('ar_admin_token');
        localStorage.removeItem('ar_admin_user');
        window.location.href = 'login.html#admin';
    }
}

// =========================================================
// 2. TAB SWITCHING
// =========================================================
function switchTab(tab) {
    if (currentTab === tab) return;
    currentTab = tab;

    tabItems.classList.remove('active');
    tabOrders.classList.remove('active');
    tabUsers.classList.remove('active');
    if (tabCart) tabCart.classList.remove('active');
    if (tabEnquiries) tabEnquiries.classList.remove('active');
    mainTableCard.classList.remove('unique-orders-card');

    if (tab === 'items') {
        tabItems.classList.add('active');
        addBtnText.textContent = 'Add Clothing Product';
        openAddModalBtn.style.display = 'flex';
        searchInput.placeholder = 'Search clothing products by title or description...';
    } else if (tab === 'orders') {
        tabOrders.classList.add('active');
        mainTableCard.classList.add('unique-orders-card');
        addBtnText.textContent = 'Create Order';
        openAddModalBtn.style.display = 'flex';
        searchInput.placeholder = 'Search order summary by customer or product name...';
    } else if (tab === 'users') {
        tabUsers.classList.add('active');
        addBtnText.textContent = 'Add New User';
        openAddModalBtn.style.display = 'none'; // Users managed via user tab or login
        searchInput.placeholder = 'Search registered users by name, email, or phone...';
    } else if (tab === 'cart') {
        if (tabCart) tabCart.classList.add('active');
        openAddModalBtn.style.display = 'none';
        searchInput.placeholder = 'Search product summary by title or category...';
    } else if (tab === 'enquiries') {
        if (tabEnquiries) tabEnquiries.classList.add('active');
        openAddModalBtn.style.display = 'none';
        searchInput.placeholder = 'Search project enquiries by client name, email, company, or service...';
    }

    renderTableHead();
    loadTableData();
}

// Animated Number Counting Function (Count-Up Animation)
function animateNumberCounter(element, targetValue, isCurrency = false, duration = 1200) {
    if (!element) return;
    const startValue = 0;
    const startTime = performance.now();
    element.classList.add('counting');

    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Cubic easing out curve for smooth count up effect
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (targetValue - startValue) * easeProgress;

        if (isCurrency) {
            element.textContent = `₹${currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            element.textContent = Math.floor(currentValue).toLocaleString('en-IN');
        }

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.classList.remove('counting');
            if (isCurrency) {
                element.textContent = `₹${targetValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else {
                element.textContent = targetValue.toLocaleString('en-IN');
            }
        }
    }

    requestAnimationFrame(updateCounter);
}

// =========================================================
// 3. FETCH DATA & STATS FROM REST API
// =========================================================
async function loadDashboardStats() {
    try {
        const [itemStatsRes, userStatsRes, orderStatsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/items/stats`),
            fetch(`${API_BASE_URL}/users/stats`),
            fetch(`${API_BASE_URL}/orders/stats`)
        ]);

        const itemStats = await itemStatsRes.json();
        const userStats = await userStatsRes.json();
        const orderStats = await orderStatsRes.json();

        if (itemStats.success) {
            animateNumberCounter(totalItemsCount, itemStats.data.totalItems, false);
            animateNumberCounter(totalInventoryValue, itemStats.data.totalInventoryValue, true);
        }

        if (userStats.success) {
            animateNumberCounter(activeItemsCount, userStats.data.totalUsers, false);
        }

        if (orderStats.success) {
            animateNumberCounter(totalOrdersRevenue, orderStats.data.totalRevenue, true);
        }
    } catch (err) {
        console.error('❌ Failed to fetch dashboard metrics:', err);
    }
}

async function loadTableData() {
    try {
        const [itemsRes, ordersRes, usersRes, cartRes, likesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/items`),
            fetch(`${API_BASE_URL}/orders`),
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/cart`),
            fetch(`${API_BASE_URL}/likes`)
        ]);

        const itemsJson = await itemsRes.json();
        const ordersJson = await ordersRes.json();
        const usersJson = await usersRes.json();
        const cartJson = await cartRes.json();
        const likesJson = await likesRes.json();

        if (itemsJson.success) itemsData = itemsJson.data;
        if (ordersJson.success) ordersData = ordersJson.data;
        if (usersJson.success) usersData = usersJson.data;
        if (cartJson.success) cartData = cartJson.data;
        if (likesJson.success) likesData = likesJson.data;

        // Fetch Enquiries
        try {
            let enquiriesRes = await fetch(`${API_BASE_URL}/enquiries`);
            if (!enquiriesRes.ok) {
                enquiriesRes = await fetch(`http://localhost:5000/api/enquiries`);
            }
            if (enquiriesRes.ok) {
                const enquiriesJson = await enquiriesRes.json();
                if (enquiriesJson.success && Array.isArray(enquiriesJson.data)) {
                    enquiriesData = enquiriesJson.data;
                }
            }
        } catch (e) {}

        // Merge localStorage project enquiries for static host or offline fallback
        try {
            const localEnquiries = JSON.parse(localStorage.getItem('ar_project_enquiries') || '[]');
            const existingCodes = new Set(enquiriesData.map(e => e.enquiry_code));
            localEnquiries.forEach(item => {
                if (item && item.enquiry_code && !existingCodes.has(item.enquiry_code)) {
                    enquiriesData.push(item);
                }
            });
        } catch (e) {}

        filterAndRenderTable();
    } catch (err) {
        console.error('❌ Error fetching data:', err);
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Error connecting to SQLite backend server at ${API_BASE_URL}</td></tr>`;
    }
}

function refreshDashboard() {
    refreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => refreshBtn.style.transform = 'none', 500);
    loadDashboardStats();
    loadTableData();
}

// =========================================================
// 4. RENDER DATA TABLE HEADERS & ROWS
// =========================================================
function renderTableHead() {
    if (currentTab === 'items') {
        tableHeadRow.innerHTML = `
            <th>ID</th>
            <th>PRODUCT</th>
            <th>CATEGORY</th>
            <th>PRICE (INR)</th>
            <th>STATUS</th>
            <th>DESCRIPTION</th>
            <th>ACTIONS</th>
        `;
    } else if (currentTab === 'orders') {
        tableHeadRow.innerHTML = `
            <th>REF #</th>
            <th>CUSTOMER SUMMARY</th>
            <th>ORDERED ITEM</th>
            <th>SIZE & QTY</th>
            <th>TOTAL (INR)</th>
            <th>COURIER & AWB #</th>
            <th>ORDER STATUS (EDITABLE)</th>
            <th>ACTIONS</th>
        `;
    } else if (currentTab === 'users') {
        tableHeadRow.innerHTML = `
            <th>USER ID</th>
            <th>CUSTOMER & CATALOG ITEM</th>
            <th>PHONE NUMBER</th>
            <th>CUSTOMER SHIPPING ADDRESS</th>
            <th>ACCOUNT STATUS</th>
            <th>LAST ACTIVITY</th>
            <th>ACTIONS</th>
        `;
    } else if (currentTab === 'cart' || currentTab === 'likes') {
        tableHeadRow.innerHTML = `
            <th>PRODUCT ITEM</th>
            <th>CATEGORY</th>
            <th>PRICE (INR)</th>
            <th>❤️ WISHLISTS</th>
            <th>🛒 CART ADDITIONS</th>
            <th>📦 TOTAL ORDERS</th>
            <th>ACTIONS</th>
        `;
    } else if (currentTab === 'enquiries') {
        tableHeadRow.innerHTML = `
            <th>ENQ CODE</th>
            <th>CLIENT & COMPANY</th>
            <th>CONTACT INFO</th>
            <th>SERVICE & QTY</th>
            <th>BUDGET & TIMELINE</th>
            <th>PROJECT DETAILS & REQUIREMENTS</th>
            <th>STATUS (EDITABLE)</th>
            <th>ACTIONS</th>
        `;
    }
}

function filterAndRenderTable() {
    const search = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value.toLowerCase();
    const status = statusFilter.value.toLowerCase();

    if (currentTab === 'items') {
        const filteredItems = itemsData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(search) || (item.description && item.description.toLowerCase().includes(search));
            const matchesCategory = category === 'all' || item.category.toLowerCase() === category;
            const matchesStatus = status === 'all' || item.status.toLowerCase() === status;
            return matchesSearch && matchesCategory && matchesStatus;
        });

        renderItemsRows(filteredItems);
    } else if (currentTab === 'orders') {
        const filteredOrders = ordersData.filter(order => {
            const matchesSearch = order.customer_name.toLowerCase().includes(search) || order.product_name.toLowerCase().includes(search) || order.order_number.toLowerCase().includes(search);
            const matchesStatus = status === 'all' || order.order_status.toLowerCase() === status;
            return matchesSearch && matchesStatus;
        });

        renderOrdersRows(filteredOrders);
    } else if (currentTab === 'users') {
        const filteredUsers = usersData.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search) || (u.phone && u.phone.toLowerCase().includes(search));
            const matchesStatus = status === 'all' || u.status.toLowerCase() === status;
            return matchesSearch && matchesStatus;
        });

        renderUsersRows(filteredUsers);
    } else if (currentTab === 'cart' || currentTab === 'likes') {
        const filteredItems = itemsData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(search) || (item.category && item.category.toLowerCase().includes(search));
            const matchesCategory = category === 'all' || item.category.toLowerCase() === category;
            return matchesSearch && matchesCategory;
        });

        renderCartRows(filteredItems);
    } else if (currentTab === 'enquiries') {
        const filteredEnquiries = enquiriesData.filter(enq => {
            const matchesSearch = !search ||
                (enq.name && enq.name.toLowerCase().includes(search)) ||
                (enq.company && enq.company.toLowerCase().includes(search)) ||
                (enq.email && enq.email.toLowerCase().includes(search)) ||
                (enq.service && enq.service.toLowerCase().includes(search)) ||
                (enq.enquiry_code && enq.enquiry_code.toLowerCase().includes(search)) ||
                (enq.message && enq.message.toLowerCase().includes(search));
            const matchesStatus = status === 'all' || (enq.status && enq.status.toLowerCase() === status);
            return matchesSearch && matchesStatus;
        });

        renderEnquiriesRows(filteredEnquiries);
    }
}

function renderItemsRows(items) {
    if (items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No clothing products found matching your filters.</td></tr>`;
        return;
    }

    tableBody.innerHTML = items.map(item => {
        const imgSrc = item.image || PRODUCT_IMAGE_MAP[item.title] || 'images/designs/design-1.jpg';
        return `
            <tr>
                <td class="item-id" style="white-space: nowrap;">#${item.id}</td>
                <td>
                    <div class="product-cell">
                        <img src="${imgSrc}" alt="${escapeHtml(item.title)}" class="product-thumb" onerror="this.src='hero.jpg';" onclick="openImagePreview('${imgSrc.replace(/'/g, "\\'")}', '${escapeHtml(item.title).replace(/'/g, "\\'")}')" title="Touch / click to open full image preview">
                        <div>
                            <div class="item-title">${escapeHtml(item.title)}</div>
                            ${item.tag ? `<span class="order-badge-pill" style="font-size: 10px; margin-top: 3px; display: inline-block;">${escapeHtml(item.tag)}</span>` : ''}
                        </div>
                    </div>
                </td>
                <td style="white-space: nowrap;"><span class="category-pill">${escapeHtml(item.category)}</span></td>
                <td class="item-price" style="white-space: nowrap;">₹${parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style="white-space: nowrap;">
                    <span class="status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}">${item.status}</span>
                </td>
                <td style="max-width: 260px; color: var(--text-secondary);">${escapeHtml(item.description || '-')}</td>
                <td style="white-space: nowrap;">
                    <div class="action-buttons">
                        <button class="btn-action" onclick="openEditItemModal(${item.id})" title="Edit Product">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button class="btn-action delete" onclick="deleteItem(${item.id})" title="Delete Product">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderOrdersRows(orders) {
    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="empty-state">No orders in summary table.</td></tr>`;
        return;
    }

    const statuses = ['Pending', 'Packed', 'Shipped', 'Nearest Hub', 'Out for Delivery', 'Delivered', 'Cancelled'];

    tableBody.innerHTML = orders.map(order => {
        const itemObj = itemsData.find(i => i.title.toLowerCase() === order.product_name.toLowerCase());
        const imgSrc = (itemObj && itemObj.image) ? itemObj.image : (PRODUCT_IMAGE_MAP[order.product_name] || 'images/designs/design-1.jpg');
        const initials = order.customer_name ? order.customer_name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'CU';
        const courierName = order.courier_name || 'BlueDart Express';
        const trackingAwb = order.tracking_awb || 'AWB-98421074';

        const statusOptionsHtml = statuses.map(s => `
            <option value="${s}" ${order.order_status.toLowerCase() === s.toLowerCase() ? 'selected' : ''}>${s}</option>
        `).join('');

        return `
            <tr>
                <td style="white-space: nowrap;">
                    <span class="order-badge-pill">${order.order_number}</span>
                </td>
                <td>
                    <div class="customer-cell">
                        <div class="avatar-circle">${initials}</div>
                        <div>
                            <div class="item-title" style="font-size: 15px; font-weight: 800;">${escapeHtml(order.customer_name)}</div>
                            <small style="color: var(--text-secondary); font-size: 13px; font-weight: 600;"><i class="fa-regular fa-envelope"></i> ${escapeHtml(order.customer_email)}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="product-cell">
                        <img src="${imgSrc}" alt="${escapeHtml(order.product_name)}" class="product-thumb" onerror="this.src='hero.jpg';" onclick="openImagePreview('${imgSrc.replace(/'/g, "\\'")}', '${escapeHtml(order.product_name).replace(/'/g, "\\'")}')" title="Touch / click to open full image preview">
                        <div>
                            <div class="item-title" style="font-size: 14.5px; font-weight: 800;">${escapeHtml(order.product_name)}</div>
                        </div>
                    </div>
                </td>
                <td style="white-space: nowrap;">
                    <span class="category-pill" style="font-size: 12px; font-weight: 800; display: inline-block;">Size: ${order.size || 'M'}</span> 
                    <strong style="color: var(--text-navy); font-weight: 800; margin-left: 6px; font-size: 13.5px; display: inline-block;">x${order.quantity || 1}</strong>
                </td>
                <td class="item-price" style="white-space: nowrap;">₹${parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style="white-space: nowrap;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div>
                            <div style="font-weight: 800; color: var(--text-navy); font-size: 13.5px;"><i class="fa-solid fa-truck-fast" style="color: var(--gold-primary); margin-right: 4px;"></i>${escapeHtml(courierName)}</div>
                            <small style="color: var(--text-secondary); font-size: 12px; font-weight: 700;">${escapeHtml(trackingAwb)}</small>
                        </div>
                        <button class="btn-action" onclick="updateCourierAwb(${order.id}, '${escapeHtml(courierName).replace(/'/g, "\\'")}', '${escapeHtml(trackingAwb).replace(/'/g, "\\'")}')" title="Edit Courier & AWB" style="padding: 4px 8px; font-size: 11px;">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </div>
                </td>
                <td style="white-space: nowrap;">
                    <select class="filter-select" style="padding: 6px 12px; font-size: 13px; font-weight: 700;" onchange="updateOrderStatus(${order.id}, this.value)">
                        ${statusOptionsHtml}
                    </select>
                </td>
                <td style="white-space: nowrap;">
                    <div class="action-buttons">
                        <button class="btn-action delete" onclick="deleteOrder(${order.id})" title="Cancel Order">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.updateCourierAwb = async function(orderId, currentCourier, currentAwb) {
    const newCourier = prompt("Enter Courier Name (e.g. BlueDart Express, Delhivery, DTDC, Ecom Express):", currentCourier);
    if (newCourier === null) return;

    const newAwb = prompt("Enter Tracking AWB Number (e.g. AWB-98421074):", currentAwb);
    if (newAwb === null) return;

    const courierVal = newCourier.trim() || 'BlueDart Express';
    const awbVal = newAwb.trim() || 'AWB-98421074';

    // Update in-memory order object in allOrdersList
    const ordObj = allOrdersList.find(o => String(o.id) === String(orderId) || String(o.order_number) === String(orderId));
    if (ordObj) {
        ordObj.courier_name = courierVal;
        ordObj.tracking_awb = awbVal;
    }

    // Save courier override into localStorage
    try {
        const courierOverrides = JSON.parse(localStorage.getItem('ar_order_courier_overrides') || '{}');
        courierOverrides[orderId] = { courier: courierVal, awb: awbVal };
        if (ordObj && ordObj.order_number) {
            courierOverrides[ordObj.order_number] = { courier: courierVal, awb: awbVal };
        }
        localStorage.setItem('ar_order_courier_overrides', JSON.stringify(courierOverrides));
    } catch (e) {
        console.warn('Error saving courier override:', e);
    }

    // Try to update backend API if server is connected
    try {
        await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courier_name: courierVal,
                tracking_awb: awbVal
            })
        });
    } catch (err) {
        console.warn('Backend API connection offline. Courier update saved locally.', err);
    }

    renderOrdersSummary();
    if (typeof showToastNotification === 'function') {
        showToastNotification('Courier & Tracking AWB updated successfully!');
    }
};

// RENDER USERS SUMMARY TABLE
function renderUsersRows(users) {
    if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No registered users found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = users.map(u => {
        const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'US';

        // Match customer order to get exact catalog image and full customer shipping address
        const customerOrder = ordersData.find(o => o.customer_email && o.customer_email.toLowerCase() === u.email.toLowerCase())
                             || ordersData.find(o => o.customer_name && o.customer_name.toLowerCase() === u.name.toLowerCase());

        let imgSrc = 'images/designs/design-1.jpg';
        let orderedProdTitle = '';
        let fullAddress = '12 MG Road, High Street, Mumbai - 400001';

        if (customerOrder) {
            orderedProdTitle = customerOrder.product_name;
            if (customerOrder.shipping_address) fullAddress = customerOrder.shipping_address;
            const itemObj = itemsData.find(i => i.title.toLowerCase() === customerOrder.product_name.toLowerCase());
            imgSrc = (itemObj && itemObj.image) ? itemObj.image : (PRODUCT_IMAGE_MAP[customerOrder.product_name] || 'images/designs/design-1.jpg');
        }

        return `
            <tr>
                <td class="item-id" style="white-space: nowrap;">USR-#${u.id}</td>
                <td>
                    <div class="customer-cell">
                        <img src="${imgSrc}" alt="${escapeHtml(orderedProdTitle || 'Catalog Image')}" class="product-thumb" title="Catalog Item: ${escapeHtml(orderedProdTitle || 'Catalog Design')} (Touch / click for full preview)" onerror="this.src='hero.jpg';" onclick="openImagePreview('${imgSrc.replace(/'/g, "\\'")}', '${escapeHtml(orderedProdTitle || 'Catalog Design').replace(/'/g, "\\'")}')">
                        <div>
                            <div class="item-title" style="font-size: 15px; font-weight: 800;">${escapeHtml(u.name)}</div>
                            <small style="color: var(--text-secondary); font-size: 13px; font-weight: 600;"><i class="fa-regular fa-envelope"></i> ${escapeHtml(u.email)}</small>
                        </div>
                    </div>
                </td>
                <td style="font-weight: 700; color: var(--text-navy); font-size: 14px; white-space: nowrap;">${escapeHtml(u.phone || 'N/A')}</td>
                <td style="font-size: 13.5px; font-weight: 600; color: var(--text-navy); max-width: 250px; line-height: 1.4;">
                    <i class="fa-solid fa-location-dot" style="color: var(--gold-primary); margin-right: 4px;"></i>
                    ${escapeHtml(fullAddress)}
                </td>
                <td style="white-space: nowrap;">
                    <span class="status-badge status-${u.status.toLowerCase()}">${u.status}</span>
                </td>
                <td style="font-size: 13px; font-weight: 600; color: var(--text-secondary); white-space: nowrap;">${u.last_login ? new Date(u.last_login).toLocaleString('en-IN') : 'Just now'}</td>
                <td style="white-space: nowrap;">
                    <div class="action-buttons">
                        ${u.role !== 'admin' ? `
                            <button class="btn-action delete" onclick="deleteUser(${u.id})" title="Delete User">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        ` : '<span style="font-size: 12px; font-weight: 700; color: var(--text-secondary);">Protected</span>'}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// RENDER ADD TO CART & LIKED PRODUCTS SUMMARY (PRODUCT-CENTRIC METRICS)
function renderCartRows(items) {
    if (!items || items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No clothing items found in catalog summary.</td></tr>`;
        return;
    }

    tableBody.innerHTML = items.map(item => {
        const imgSrc = item.image || PRODUCT_IMAGE_MAP[item.title] || 'images/designs/design-1.jpg';
        const stats = getProductEngagement(item.title);

        return `
            <tr>
                <td>
                    <div class="product-cell">
                        <img src="${imgSrc}" alt="${escapeHtml(item.title)}" class="product-thumb" onerror="this.src='hero.jpg';" onclick="openImagePreview('${imgSrc.replace(/'/g, "\\'")}', '${escapeHtml(item.title).replace(/'/g, "\\'")}')" title="Touch / click to open full image preview">
                        <div>
                            <div class="item-title" style="font-size: 15.5px; font-weight: 800; color: var(--text-primary);">${escapeHtml(item.title)}</div>
                            <small style="color: var(--text-secondary); font-size: 12px; font-weight: 700;">Catalog Item #${item.id}</small>
                        </div>
                    </div>
                </td>
                <td style="white-space: nowrap;"><span class="category-pill">${escapeHtml(item.category)}</span></td>
                <td class="item-price" style="white-space: nowrap;">₹${parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style="white-space: nowrap;">
                    <span class="status-badge" style="background: #FFE4E6; color: #BE123C; font-weight: 800; font-size: 13.5px; padding: 7px 15px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;">
                        ❤️ ${stats.wishlists} wishlists
                    </span>
                </td>
                <td style="white-space: nowrap;">
                    <span class="status-badge" style="background: #FEF3C7; color: #B45309; font-weight: 800; font-size: 13.5px; padding: 7px 15px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;">
                        🛒 ${stats.cart} cart additions
                    </span>
                </td>
                <td style="white-space: nowrap;">
                    <span class="status-badge" style="background: #DCFCE7; color: #15803D; font-weight: 800; font-size: 13.5px; padding: 7px 15px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;">
                        📦 ${stats.orders} orders
                    </span>
                </td>
                <td style="white-space: nowrap;">
                    <div class="action-buttons">
                        <button class="btn-action" onclick="openEditItemModal(${item.id})" title="Edit Product">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderLikesRows(items) {
    renderCartRows(items);
}

// =========================================================
// 5. UPDATE ORDER STATUS & DELETE HANDLERS
// =========================================================
async function updateOrderStatus(orderId, newStatus) {
    // 1. Update in-memory order object in allOrdersList
    const ordObj = allOrdersList.find(o => String(o.id) === String(orderId) || String(o.order_number) === String(orderId));
    if (ordObj) {
        ordObj.order_status = newStatus;
    }

    // 2. Save status override into localStorage so customer tracking page (login.html) reads it instantly across tabs & pages
    try {
        const overrides = JSON.parse(localStorage.getItem('ar_order_status_overrides') || '{}');
        overrides[orderId] = newStatus;
        if (ordObj && ordObj.order_number) {
            overrides[ordObj.order_number] = newStatus;
        }
        localStorage.setItem('ar_order_status_overrides', JSON.stringify(overrides));
    } catch (e) {
        console.warn('Error saving order status override:', e);
    }

    // 3. Try to update backend API if server is connected
    try {
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_status: newStatus })
        });
        if (res.ok) {
            const json = await res.json();
            if (json && json.success) {
                console.log(`Order #${orderId} status updated to ${newStatus} on server.`);
            }
        }
    } catch (err) {
        console.warn('Backend API connection offline. Order status update saved locally.', err);
    }

    // 4. Refresh Dashboard UI stats and order summary table
    renderOrdersSummary();
    renderStats();
    if (typeof showToastNotification === 'function') {
        showToastNotification(`Order Status Updated to "${newStatus}"!`);
    }
}

async function deleteOrder(orderId) {
    if (!confirm(`Are you sure you want to cancel / remove order #${orderId}?`)) return;
    await updateOrderStatus(orderId, 'Cancelled');
}

async function deleteUser(userId) {
    if (!confirm(`Are you sure you want to delete user account #${userId}?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            refreshDashboard();
        } else {
            alert(`Error deleting user: ${json.error}`);
        }
    } catch (err) {
        console.error('❌ Error deleting user:', err);
    }
}

async function deleteCartItem(id) {
    if (!confirm(`Are you sure you want to remove cart item #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/cart/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            refreshDashboard();
        } else {
            alert(`Error removing cart item: ${json.error}`);
        }
    } catch (err) {
        console.error('❌ Error removing cart item:', err);
    }
}

async function deleteLikedItem(id) {
    if (!confirm(`Are you sure you want to remove liked product record #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/likes/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            refreshDashboard();
        } else {
            alert(`Error removing liked product: ${json.error}`);
        }
    } catch (err) {
        console.error('❌ Error removing liked item:', err);
    }
}

// =========================================================
// 6. MODAL FORM HANDLERS & IMAGE UPLOAD
// =========================================================
function openAddModal() {
    itemForm.reset();
    itemId.value = '';
    modalTitle.textContent = currentTab === 'items' ? 'Add Clothing Product' : 'Create New Order';
    itemModal.classList.add('active');
}

function openEditItemModal(id) {
    const item = itemsData.find(i => i.id === id);
    if (!item) return;

    itemId.value = item.id;
    itemTitleInput.value = item.title;
    itemCategoryInput.value = item.category;
    itemPriceInput.value = item.price;
    itemStatusInput.value = item.status;
    itemTagInput.value = item.tag || '';
    itemDescInput.value = item.description || '';

    modalTitle.textContent = `Edit Product #${item.id}`;
    itemModal.classList.add('active');
}

function closeModal() {
    itemModal.classList.remove('active');
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const id = itemId.value;
    const formData = new FormData();
    formData.append('title', itemTitleInput.value.trim());
    formData.append('category', itemCategoryInput.value);
    formData.append('price', itemPriceInput.value);
    formData.append('status', itemStatusInput.value);
    formData.append('tag', itemTagInput.value.trim());
    formData.append('description', itemDescInput.value.trim());

    if (itemImageFileInput.files.length > 0) {
        formData.append('image', itemImageFileInput.files[0]);
    }

    try {
        let res;
        if (id) {
            res = await fetch(`${API_BASE_URL}/items/${id}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            res = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                body: formData
            });
        }

        const json = await res.json();
        if (json.success) {
            closeModal();
            refreshDashboard();
        } else {
            alert(`Error: ${json.error}`);
        }
    } catch (err) {
        console.error('❌ Failed to save product:', err);
        alert('Server error saving product');
    }
}

async function deleteItem(id) {
    if (!confirm(`Are you sure you want to delete product #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            refreshDashboard();
        } else {
            alert(`Error deleting item: ${json.error}`);
        }
    } catch (err) {
        console.error('❌ Error deleting item:', err);
    }
}

async function deleteOrder(id) {
    if (!confirm(`Are you sure you want to cancel order #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            refreshDashboard();
        } else {
            alert(`Error cancelling order: ${json.error}`);
        }
    } catch (err) {
        console.error('❌ Error cancelling order:', err);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[match]);
}

function renderEnquiriesRows(enquiries) {
    if (!enquiries || enquiries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div style="padding: 36px; text-align: center; color: #94A3B8;">
                        <i class="fa-solid fa-clipboard-list" style="font-size: 32px; color: #E5C158; margin-bottom: 10px; display: block;"></i>
                        <h4 style="color: #FFF; font-size: 16px; margin: 0 0 4px;">No Project Enquiries Found</h4>
                        <p style="font-size: 13px; margin: 0;">Project enquiries submitted through the Contact page will appear here live.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const statusOptions = ['Pending Review', 'Quote Sent', 'In Discussion', 'Approved', 'Closed'];

    tableBody.innerHTML = enquiries.map(enq => {
        const code = enq.enquiry_code || ('ENQ-' + enq.id);
        const name = escapeHtml(enq.name || 'Valued Client');
        const company = enq.company ? `<div style="font-size: 11px; color: #E5C158; font-weight: 700; margin-top: 2px;">🏢 ${escapeHtml(enq.company)}</div>` : '';
        const email = escapeHtml(enq.email || '');
        const phone = escapeHtml(enq.phone || '');
        const service = escapeHtml(enq.service || 'Custom Garment Project');
        const quantity = escapeHtml(enq.quantity || 'N/A');
        const timeline = escapeHtml(enq.timeline || 'Flexible');
        const budget = escapeHtml(enq.budget || 'Under ₹25,000');
        const message = escapeHtml(enq.message || 'No additional details provided.');
        const currentStatus = enq.status || 'Pending Review';
        const dateStr = enq.created_at ? new Date(enq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

        const statusSelectOptions = statusOptions.map(opt => 
            `<option value="${opt}" ${opt.toLowerCase() === currentStatus.toLowerCase() ? 'selected' : ''}>${opt}</option>`
        ).join('');

        let badgeStyle = 'background: #0F172A; color: #E5C158; border: 1px solid #334155;';
        if (currentStatus === 'Quote Sent') badgeStyle = 'background: rgba(59,130,246,0.15); color: #60A5FA; border: 1px solid rgba(59,130,246,0.3);';
        else if (currentStatus === 'Approved') badgeStyle = 'background: rgba(16,185,129,0.15); color: #34D399; border: 1px solid rgba(16,185,129,0.3);';
        else if (currentStatus === 'Closed') badgeStyle = 'background: rgba(100,116,139,0.15); color: #94A3B8; border: 1px solid rgba(100,116,139,0.3);';

        return `
            <tr>
                <td style="font-family: monospace; font-weight: 800; color: #E5C158; white-space: nowrap;">${code}</td>
                <td>
                    <div style="font-weight: 700; color: #FFFFFF;">${name}</div>
                    ${company}
                </td>
                <td style="font-size: 13px; white-space: nowrap;">
                    <div style="color: #F1F5F9;">✉️ ${email}</div>
                    <div style="color: #34D399; margin-top: 2px;">📞 ${phone}</div>
                </td>
                <td style="font-size: 13px;">
                    <div style="font-weight: 700; color: #FFF;">${service}</div>
                    <span style="display: inline-block; padding: 2px 8px; background: rgba(255,255,255,0.08); border-radius: 12px; font-size: 11px; color: #CBD5E1; margin-top: 4px;">
                        📦 ${quantity}
                    </span>
                </td>
                <td style="font-size: 13px; white-space: nowrap;">
                    <div style="color: #E5C158; font-weight: 700;">💰 ${budget}</div>
                    <div style="color: #94A3B8; margin-top: 2px;">⏳ ${timeline}</div>
                </td>
                <td style="max-width: 280px; font-size: 12px; color: #CBD5E1; line-height: 1.4;">
                    <div style="background: rgba(15,23,42,0.7); padding: 8px 10px; border-radius: 8px; border: 1px solid #334155;">
                        "${message}"
                    </div>
                </td>
                <td style="white-space: nowrap;">
                    <select onchange="updateEnquiryStatus('${enq.id}', this.value)" class="styled-select" style="padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; ${badgeStyle}">
                        ${statusSelectOptions}
                    </select>
                </td>
                <td style="font-size: 12px; color: #94A3B8; white-space: nowrap;">
                    <div>📅 ${dateStr}</div>
                    <button onclick="deleteEnquiry('${enq.id}')" class="btn-action delete" style="margin-top: 6px;" title="Delete Project Enquiry">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

window.updateEnquiryStatus = async function(id, newStatus) {
    try {
        await fetch(`${API_BASE_URL}/enquiries/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
    } catch (e) {}

    enquiriesData = enquiriesData.map(enq => {
        if (String(enq.id) === String(id) || String(enq.enquiry_code) === String(id)) {
            return { ...enq, status: newStatus };
        }
        return enq;
    });

    try {
        localStorage.setItem('ar_project_enquiries', JSON.stringify(enquiriesData));
    } catch (e) {}

    filterAndRenderTable();
};

window.deleteEnquiry = async function(id) {
    if (!confirm('Are you sure you want to delete this project enquiry?')) return;

    try {
        await fetch(`${API_BASE_URL}/enquiries/${id}`, {
            method: 'DELETE'
        });
    } catch (e) {}

    enquiriesData = enquiriesData.filter(enq => String(enq.id) !== String(id) && String(enq.enquiry_code) !== String(id));

    try {
        localStorage.setItem('ar_project_enquiries', JSON.stringify(enquiriesData));
    } catch (e) {}

    filterAndRenderTable();
};
