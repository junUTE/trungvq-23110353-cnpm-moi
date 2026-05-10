document.addEventListener("DOMContentLoaded", async () => {
    const adminProtectedSection = document.querySelector('[data-auth-role="admin"]');
    if (!adminProtectedSection) {
        return;
    }

    const normalizeGenderValue = (value) => {
        if (value === true || value === 1 || value === "1" || value === "true") {
            return true;
        }

        if (value === false || value === 0 || value === "0" || value === "false") {
            return false;
        }

        return null;
    };

    const currentUser = await window.CarePlusAuth.requireAuth("admin");
    if (!currentUser) {
        return;
    }

    const showBoxMessage = (id, message) => {
        const box = document.getElementById(id);
        if (!box) {
            return;
        }

        box.textContent = message;
        box.classList.remove("d-none");
    };

    const hideBoxMessage = (id) => {
        const box = document.getElementById(id);
        if (!box) {
            return;
        }

        box.textContent = "";
        box.classList.add("d-none");
    };

    const renderUsersTable = async () => {
        const tbody = document.getElementById("usersTableBody");
        if (!tbody) {
            return;
        }

        hideBoxMessage("usersPageError");

        const { response, data } = await window.CarePlusAuth.apiFetch("/api/users");
        if (!response.ok || !data?.success) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">Không thể tải dữ liệu.</td></tr>';
            showBoxMessage("usersPageError", data?.message || "Không thể tải danh sách người dùng");
            return;
        }

        if (!data.users.length) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">Chưa có dữ liệu.</td></tr>';
            return;
        }

        tbody.innerHTML = data.users.map((user) => {
            const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—";
            const normalizedGender = normalizeGenderValue(user.gender);
            const gender = normalizedGender === null ? "—" : (normalizedGender ? "Nam" : "Nữ");
            const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—";
            const status = `${user.isActive ? "Active" : "Inactive"} / ${user.isLocked ? "Locked" : "Open"}`;

            return `
                <tr>
                    <td class="pl-4 text-nowrap">${user.id}</td>
                    <td class="text-nowrap">${user.username || "—"}</td>
                    <td class="text-nowrap">${user.email || "—"}</td>
                    <td>${fullName}</td>
                    <td class="text-nowrap"><span class="badge ${user.role === "admin" ? "badge-danger" : "badge-light border"}">${user.role || "user"}</span></td>
                    <td class="text-nowrap">${status}</td>
                    <td class="text-nowrap">${user.phone || "—"}</td>
                    <td class="text-nowrap">${gender}</td>
                    <td class="text-muted small text-nowrap">${createdAt}</td>
                    <td class="text-right pr-4 text-nowrap">
                        <a class="btn btn-sm btn-outline-secondary" href="/edit-crud?id=${user.id}">Sửa</a>
                        <button class="btn btn-sm btn-outline-danger ml-1" type="button" data-delete-user-id="${user.id}">Xoá</button>
                    </td>
                </tr>
            `;
        }).join("");

        tbody.querySelectorAll("[data-delete-user-id]").forEach((button) => {
            button.addEventListener("click", async () => {
                const userId = button.getAttribute("data-delete-user-id");
                if (!window.confirm("Xoá người dùng này?")) {
                    return;
                }

                const { response: deleteResponse, data: deleteData } = await window.CarePlusAuth.apiFetch(`/api/users/${userId}`, {
                    method: "DELETE",
                });

                if (!deleteResponse.ok || !deleteData?.success) {
                    showBoxMessage("usersPageError", deleteData?.message || "Không thể xóa người dùng");
                    return;
                }

                await renderUsersTable();
            });
        });
    };

    const createUserForm = document.getElementById("createUserForm");
    if (createUserForm) {
        createUserForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            hideBoxMessage("createUserError");
            hideBoxMessage("createUserSuccess");

            const formData = new FormData(createUserForm);
            const payload = Object.fromEntries(formData.entries());

            const { response, data } = await window.CarePlusAuth.apiFetch("/api/users", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (!response.ok || !data?.success) {
                showBoxMessage("createUserError", data?.message || "Không thể tạo người dùng");
                return;
            }

            showBoxMessage("createUserSuccess", data.message || "Tạo người dùng thành công");
            createUserForm.reset();
            createUserForm.querySelector('[name="role"]').value = "user";
            createUserForm.querySelector('[name="isActive"]').value = "true";
            createUserForm.querySelector('[name="isLocked"]').value = "false";
        });
    }

    const editUserForm = document.getElementById("editUserForm");
    if (editUserForm) {
        const userId = editUserForm.getAttribute("data-user-id");
        hideBoxMessage("editUserError");
        hideBoxMessage("editUserSuccess");

        const { response, data } = await window.CarePlusAuth.apiFetch(`/api/users/${userId}`);
        if (!response.ok || !data?.success) {
            showBoxMessage("editUserError", data?.message || "Không thể tải thông tin người dùng");
            return;
        }

        const user = data.user;
        editUserForm.querySelector('[name="username"]').value = user.username || "";
        editUserForm.querySelector('[name="email"]').value = user.email || "";
        editUserForm.querySelector('[name="firstName"]').value = user.firstName || "";
        editUserForm.querySelector('[name="lastName"]').value = user.lastName || "";
        editUserForm.querySelector('[name="address"]').value = user.address || "";
        editUserForm.querySelector('[name="phone"]').value = user.phone || "";
        editUserForm.querySelector('[name="role"]').value = user.role || "user";
        editUserForm.querySelector('[name="isActive"]').value = String(user.isActive);
        editUserForm.querySelector('[name="isLocked"]').value = String(user.isLocked);

        const normalizedGender = normalizeGenderValue(user.gender);
        if (normalizedGender !== null) {
            editUserForm.querySelector('[name="gender"]').value = normalizedGender ? "1" : "0";
        }

        editUserForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            hideBoxMessage("editUserError");
            hideBoxMessage("editUserSuccess");

            const formData = new FormData(editUserForm);
            const payload = Object.fromEntries(formData.entries());

            if (!payload.password) {
                delete payload.password;
            }

            const { response: updateResponse, data: updateData } = await window.CarePlusAuth.apiFetch(`/api/users/${userId}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            if (!updateResponse.ok || !updateData?.success) {
                showBoxMessage("editUserError", updateData?.message || "Không thể cập nhật người dùng");
                return;
            }

            showBoxMessage("editUserSuccess", updateData.message || "Cập nhật người dùng thành công");
        });
    }

    if (document.getElementById("usersTableBody")) {
        await renderUsersTable();
    }
});
