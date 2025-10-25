// Kiểm tra xác thực admin
function checkAdminAuth() {
    return checkAdminAccess();
}

// Kiểm tra và hiển thị thông báo nếu không phải admin
function enforceAdminAuth() {
    if (!checkAdminAuth()) {
        alert('Bạn cần đăng nhập với tài khoản admin để truy cập trang này!');
        return false;
    }
    return true;
}

// Xử lý đăng xuất admin
function logoutAdmin() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminUser');
        window.location.href = '../login.html';
    }
}

// Backwards-compatible: checkAdminAccess is the canonical function used across admin pages
function isAdminSession() {
    return localStorage.getItem('isAdmin') === 'true' && !!localStorage.getItem('adminUser');
}

function getAdminUser() {
    try {
        return JSON.parse(localStorage.getItem('adminUser') || 'null');
    } catch (e) {
        return null;
    }
}

function checkAdminAccess() {
    // Return true if valid admin session. Otherwise redirect to login with redirect param.
    try {
        if (!isAdminSession()) {
            const redirect = encodeURIComponent(window.location.href);
            window.location.href = '../login.html?redirect=' + redirect;
            return false;
        }

        const user = getAdminUser();
        if (!user || user.email !== 'admin@ivymoda.local') {
            // invalid admin info
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('adminUser');
            const redirect = encodeURIComponent(window.location.href);
            window.location.href = '../login.html?redirect=' + redirect;
            return false;
        }

        return true;
    } catch (e) {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminUser');
        const redirect = encodeURIComponent(window.location.href);
        window.location.href = '../login.html?redirect=' + redirect;
        return false;
    }
}