// Simple authentication system using localStorage
const Auth = {
    currentUser: null,
    
    init() {
        this.currentUser = JSON.parse(localStorage.getItem('blog_admin_user'));
    },
    
    login(username, password) {
        // In a real app, you would hash the password and check against stored hash
        if (username === 'admin' && password === 'password_123') {
            const user = { username, lastLogin: new Date() };
            localStorage.setItem('blog_admin_user', JSON.stringify(user));
            this.currentUser = user;
            return true;
        }
        return false;
    },
    
    logout() {
        localStorage.removeItem('blog_admin_user');
        this.currentUser = null;
    },
    
    isAuthenticated() {
        return this.currentUser !== null;
    }
};

// Initialize on load
Auth.init();
