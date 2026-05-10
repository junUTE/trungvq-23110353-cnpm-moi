(function () {
    const TOKEN_KEY = "careplus_access_token";
    const USER_KEY = "careplus_current_user";

    const getToken = () => {
        return localStorage.getItem(TOKEN_KEY);
    };

    const setSession = (token, user) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    };

    const clearSession = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };

    const getStoredUser = () => {
        const rawValue = localStorage.getItem(USER_KEY);

        if (!rawValue) {
            return null;
        }

        try {
            return JSON.parse(rawValue);
        } catch (error) {
            clearSession();
            return null;
        }
    };

    const updateNavbar = (user) => {
        const loginButton = document.getElementById("loginNavButton");
        const userDropdown = document.getElementById("userNavDropdown");
        const userLabel = document.getElementById("navUserLabel");
        const userProfileLink = document.getElementById("userProfileNavLink");
        const adminUsersLink = document.getElementById("adminUsersNavLink");

        if (!loginButton || !userDropdown || !userLabel || !userProfileLink || !adminUsersLink) {
            return;
        }

        if (!user) {
            loginButton.classList.remove("d-none");
            userDropdown.classList.add("d-none");
            userProfileLink.classList.add("d-none");
            adminUsersLink.classList.add("d-none");
            return;
        }

        loginButton.classList.add("d-none");
        userDropdown.classList.remove("d-none");
        userLabel.textContent = user.username || user.email || "Tài khoản";

        if (user.role === "admin") {
            adminUsersLink.classList.remove("d-none");
            userProfileLink.classList.add("d-none");
        } else {
            userProfileLink.classList.remove("d-none");
            adminUsersLink.classList.add("d-none");
        }
    };

    const apiFetch = async (url, options = {}) => {
        const token = getToken();
        const headers = new Headers(options.headers || {});

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        let data = null;
        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        if (response.status === 401) {
            clearSession();
            updateNavbar(null);
        }

        return { response, data };
    };

    const getCurrentUser = async () => {
        const token = getToken();
        if (!token) {
            updateNavbar(null);
            return null;
        }

        const { response, data } = await apiFetch("/auth/me");
        if (!response.ok || !data?.success) {
            clearSession();
            updateNavbar(null);
            return null;
        }

        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        updateNavbar(data.user);
        return data.user;
    };

    const requireAuth = async (requiredRole) => {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = "/login";
            return null;
        }

        if (requiredRole && user.role !== requiredRole) {
            window.location.href = user.role === "admin" ? "/get-crud" : "/user/profile";
            return null;
        }

        return user;
    };

    document.addEventListener("DOMContentLoaded", async () => {
        updateNavbar(getStoredUser());

        const logoutButton = document.getElementById("logoutButton");
        if (logoutButton) {
            logoutButton.addEventListener("click", () => {
                clearSession();
                updateNavbar(null);
                window.location.href = "/login";
            });
        }

        if (getToken()) {
            await getCurrentUser();
        }
    });

    window.CarePlusAuth = {
        getToken,
        setSession,
        clearSession,
        getStoredUser,
        apiFetch,
        getCurrentUser,
        requireAuth,
    };
})();
