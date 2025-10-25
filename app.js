// Simple app logic: users and cart stored in localStorage

const APP = (function(){
    const USERS_KEY = 'ivymoda_users';
    const AUTH_KEY = 'ivymoda_auth';
    const CART_KEY = 'ivymoda_cart';

    function _readUsers(){
        try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }catch(e){ return []; }
    }
    function _writeUsers(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

    // sync register (legacy) - kept for compatibility
    function registerUser({firstName, lastName, email, phone, password}){
        const users = _readUsers();
        if(users.some(u=>u.email.toLowerCase()===email.toLowerCase())){
            return {ok:false, message:'Email đã được sử dụng'};
        }
        const id = Date.now();
        users.push({id, firstName, lastName, email, phone, password});
        _writeUsers(users);
        // auto-login
        localStorage.setItem(AUTH_KEY, JSON.stringify({id, email}));
        return {ok:true, user:{id, firstName, lastName, email}};
    }

    // Async wrappers: try remote API if API_BASE_URL is set; otherwise use localStorage logic with a small simulated delay
    const API_BASE_URL = null; // set to your backend URL string to enable real API calls, e.g. 'https://api.example.com'

    async function registerUserAsync(payload){
        if(API_BASE_URL){
            try{
                const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/register`, {
                    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
                });
                const data = await res.json();
                return data;
            }catch(e){
                return {ok:false, message: 'Lỗi kết nối. Vui lòng thử lại.'};
            }
        }
        // local fallback
        return new Promise(resolve => {
            setTimeout(()=>{
                const result = registerUser(payload);
                resolve(result);
            }, 250);
        });
    }

    function loginUser({email, password}){
        const users = _readUsers();
        const user = users.find(u=>u.email.toLowerCase()===email.toLowerCase() && u.password===password);
        if(!user) return {ok:false, message:'Email hoặc mật khẩu không đúng'};
        localStorage.setItem(AUTH_KEY, JSON.stringify({id:user.id,email:user.email}));
        return {ok:true, user};
    }

    async function loginUserAsync(payload){
        if(API_BASE_URL){
            try{
                const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/login`, {
                    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
                });
                const data = await res.json();
                return data;
            }catch(e){
                return {ok:false, message: 'Lỗi kết nối. Vui lòng thử lại.'};
            }
        }
        return new Promise(resolve=>{
            setTimeout(()=>{
                const result = loginUser(payload);
                resolve(result);
            }, 200);
        });
    }

    function logout(){ localStorage.removeItem(AUTH_KEY); }

    function currentUser(){
        const auth = JSON.parse(localStorage.getItem(AUTH_KEY)||'null');
        if(!auth) return null;
        const users = _readUsers();
        return users.find(u=>u.id===auth.id) || null;
    }

    // Cart operations
    function _readCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch(e){ return []; } }
    function _writeCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

    function addToCart(item){
        const cart = _readCart();
        const idx = cart.findIndex(c=>c.id===item.id);
        if(idx>-1){ cart[idx].qty += item.qty||1; }
        else { cart.push(Object.assign({qty:1}, item)); }
        _writeCart(cart);
        return cart;
    }

    function updateCartItem(id, qty){
        const cart = _readCart();
        const idx = cart.findIndex(c=>c.id===id);
        if(idx>-1){ cart[idx].qty = Math.max(1, qty); _writeCart(cart); }
        return cart;
    }

    function removeCartItem(id){
        let cart = _readCart();
        cart = cart.filter(c=>c.id!==id);
        _writeCart(cart);
        return cart;
    }

    function clearCart(){ localStorage.removeItem(CART_KEY); }

    function getCart(){ return _readCart(); }

    // Admin helpers
    function getUsers(){ return _readUsers(); }
    function deleteUser(id){ let users = _readUsers(); users = users.filter(u=>u.id!==id); _writeUsers(users); return users; }

    return {
        // synchronous (legacy)
        registerUser, loginUser,
        // async helpers (preferred)
        registerUserAsync, loginUserAsync,
        logout, currentUser,
        addToCart, updateCartItem, removeCartItem, clearCart, getCart,
        // admin
        getUsers, deleteUser
    };
})();

// Helper to format price
function formatVND(n){ 
    // Ensure n is a number
    const value = typeof n === 'number' ? n : parseInt(String(n).replace(/[^\d]/g, '')) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('VND', '₫');
}

// escape HTML helper
function escapeHtml(str){ if(!str) return ''; return String(str).replace(/[&<>"'`]/g, function(s){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[s]; }); }

// Wire up UI elements on pages
document.addEventListener('DOMContentLoaded', ()=>{
    // update cart count elements
    const cartCountEls = document.querySelectorAll('.cart-count-badge');
    function refreshCartCount(){
        const cart = APP.getCart();
        const count = cart.reduce((s,i)=>s+i.qty,0);
        cartCountEls.forEach(el=>el.textContent = count);
    }
    refreshCartCount();

    // Render user area (if .user-area exists)
    const userArea = document.querySelectorAll('.user-area');
    function renderUserArea(){
        const user = APP.currentUser();
        userArea.forEach(el => {
            // build a user-icon based menu
            if(!user){
                // When not logged in, clicking the user icon should go to the login page
                el.innerHTML = `
                    <a href="login.html" class="user-icon" title="Đăng nhập">
                        <i class="fas fa-user"></i>
                    </a>
                `;
            } else {
                const name = (user.firstName || user.email || '');
                el.innerHTML = `
                    <div class="user-menu">
                        <button class="user-icon" aria-haspopup="true" aria-expanded="false" title="${escapeHtml(name)}">
                            <i class="fas fa-user-circle"></i>
                        </button>
                        <div class="user-menu-dropdown" role="menu">
                            <a href="account/profile.html" class="user-menu-item">Hồ sơ</a>
                            <a href="#" class="user-menu-item" id="logoutBtn">Đăng xuất</a>
                        </div>
                    </div>
                `;
            }

            // attach toggle listeners for logged-in dropdown only
            const menu = el.querySelector('.user-menu');
            const btn = el.querySelector('.user-icon');
            const dropdown = el.querySelector('.user-menu-dropdown');
            if(menu && btn && dropdown){
                btn.addEventListener('click', (evt) => {
                    evt.stopPropagation();
                    const isOpen = dropdown.classList.toggle('show');
                    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                });
                // close when clicking outside
                document.addEventListener('click', (e)=>{
                    if(!menu.contains(e.target)){
                        dropdown.classList.remove('show');
                        btn.setAttribute('aria-expanded','false');
                    }
                });
            }

            // attach logout handler if present
            const logoutBtn = el.querySelector('#logoutBtn');
            if(logoutBtn){
                logoutBtn.addEventListener('click', function(e){ e.preventDefault(); APP.logout(); renderUserArea(); refreshCartCount(); window.location.href='index.html'; });
            }
        });
    }
    // expose renderUserArea so other scripts (login/register) can call it
    window.renderUserArea = renderUserArea;
    renderUserArea();

    // Attach add-to-cart buttons (data attributes expected)
    document.querySelectorAll('.cart-btn').forEach(btn=>{
        btn.addEventListener('click', function(e){
            e.stopPropagation();
            const card = this.closest('.product-card');
            if(!card) return;
            const id = card.dataset.id || card.dataset.url || card.querySelector('.product-link')?.getAttribute('href') || ('p'+Date.now());
            const title = card.querySelector('.product-title')?.textContent.trim() || card.querySelector('img')?.alt || 'Sản phẩm';
            const priceText = card.querySelector('.product-price')?.textContent || '0';
            // Parse price: remove all non-digits and convert to number
            const price = parseInt(priceText.replace(/[^\d]/g,'')) || 0;
            const img = card.querySelector('img')?.src || '';
            APP.addToCart({id, title, price, img, qty:1});
            refreshCartCount();
            alert('Đã thêm vào giỏ hàng');
        });
    });
});
