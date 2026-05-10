document.addEventListener("DOMContentLoaded", async () => {
    const profilePage = document.querySelector('[data-auth-role="user"]');
    if (!profilePage) {
        return;
    }

    const user = await window.CarePlusAuth.requireAuth("user");
    if (!user) {
        return;
    }

    document.getElementById("profileUsername").textContent = user.username || "—";
    document.getElementById("profileEmail").textContent = user.email || "—";
    document.getElementById("profileFullName").textContent = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—";
    document.getElementById("profileRole").textContent = user.role || "—";
    document.getElementById("profileStatus").textContent = user.isActive ? "Đang hoạt động" : "Vô hiệu hóa";
    document.getElementById("profileLastLogin").textContent = user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleString("vi-VN")
        : "Chưa có dữ liệu";
});
