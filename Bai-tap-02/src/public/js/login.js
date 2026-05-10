document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) {
        return;
    }

    const errorBox = document.getElementById("loginError");
    const successBox = document.getElementById("loginSuccess");
    const submitButton = document.getElementById("loginSubmitButton");

    const showMessage = (element, message) => {
        element.textContent = message;
        element.classList.remove("d-none");
    };

    const hideMessages = () => {
        errorBox.classList.add("d-none");
        successBox.classList.add("d-none");
        errorBox.textContent = "";
        successBox.textContent = "";
    };

    if (window.CarePlusAuth.getToken()) {
        window.CarePlusAuth.getCurrentUser().then((user) => {
            if (user) {
                window.location.href = user.role === "admin" ? "/get-crud" : "/user/profile";
            }
        });
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideMessages();
        submitButton.disabled = true;

        const formData = new FormData(loginForm);
        const payload = {
            login: (formData.get("login") || "").toString().trim(),
            password: (formData.get("password") || "").toString(),
        };

        const response = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        let data = null;
        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        submitButton.disabled = false;

        if (!response.ok || !data?.success) {
            showMessage(errorBox, data?.message || "Đăng nhập thất bại");
            return;
        }

        window.CarePlusAuth.setSession(data.token, data.user);
        showMessage(successBox, data.message || "Đăng nhập thành công");

        window.setTimeout(() => {
            window.location.href = data.redirectUrl || "/home";
        }, 500);
    });
});
