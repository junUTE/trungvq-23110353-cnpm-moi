// public/js/register.js

document.addEventListener("DOMContentLoaded", function () {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LENGTH = 6;
  const registerForm = document.getElementById("registerForm");
  const sendCodeButton = document.getElementById("sendCodeButton");
  const registerError = document.getElementById("registerError");
  const registerSuccess = document.getElementById("registerSuccess");
  const passwordToggleButtons = document.querySelectorAll("[data-toggle-password]");
  const lockedFieldNames = ["username", "email", "password", "confirmPassword"];
  let codeCooldown = 0;
  let cooldownInterval;

  function showError(msg) {
    registerError.textContent = msg;
    registerError.classList.remove("d-none");
    registerSuccess.classList.add("d-none");
  }
  function showSuccess(msg) {
    registerSuccess.textContent = msg;
    registerSuccess.classList.remove("d-none");
    registerError.classList.add("d-none");
  }
  function clearAlerts() {
    registerError.classList.add("d-none");
    registerSuccess.classList.add("d-none");
  }
  function setRegistrationFieldsLocked(isLocked) {
    lockedFieldNames.forEach((fieldName) => {
      registerForm[fieldName].readOnly = isLocked;
    });
  }
  function getFormValues() {
    return {
      username: registerForm.username.value.trim(),
      email: registerForm.email.value.trim(),
      password: registerForm.password.value,
      confirmPassword: registerForm.confirmPassword.value,
      verificationCode: registerForm.verificationCode.value.trim(),
    };
  }

  function validateRegisterData(values, options = {}) {
    const { requireVerificationCode = true } = options;

    if (!values.username || !values.email || !values.password || !values.confirmPassword) {
      return "Vui lòng điền đầy đủ thông tin.";
    }
    if (!EMAIL_REGEX.test(values.email)) {
      return "Email không đúng định dạng.";
    }
    if (values.password.length < MIN_PASSWORD_LENGTH) {
      return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
    }
    if (values.password !== values.confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }
    if (requireVerificationCode) {
      if (!values.verificationCode) {
        return "Vui lòng nhập mã xác thực.";
      }
      if (!/^\d{5}$/.test(values.verificationCode)) {
        return "Mã xác thực phải gồm 5 chữ số.";
      }
    }

    return null;
  }

  function startCooldown() {
    codeCooldown = 60;
    sendCodeButton.disabled = true;
    sendCodeButton.textContent = `Gửi lại (${codeCooldown}s)`;
    cooldownInterval = setInterval(() => {
      codeCooldown--;
      sendCodeButton.textContent = `Gửi lại (${codeCooldown}s)`;
      if (codeCooldown <= 0) {
        clearInterval(cooldownInterval);
        sendCodeButton.disabled = false;
        sendCodeButton.textContent = "Nhận mã";
      }
    }, 1000);
  }

  passwordToggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const fieldName = button.getAttribute("data-toggle-password");
      const input = registerForm[fieldName];
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      const openIcon = button.querySelector("[data-eye-open]");
      const closedIcon = button.querySelector("[data-eye-closed]");
      if (openIcon && closedIcon) {
        openIcon.classList.toggle("d-none", isHidden);
        closedIcon.classList.toggle("d-none", !isHidden);
      }
    });
  });

  sendCodeButton.addEventListener("click", async function () {
    clearAlerts();
    const formValues = getFormValues();
    const validationMessage = validateRegisterData(formValues, { requireVerificationCode: false });
    if (validationMessage) {
      showError(validationMessage);
      return;
    }
    setRegistrationFieldsLocked(true);
    sendCodeButton.disabled = true;
    sendCodeButton.textContent = "Đang gửi...";
    try {
      const res = await fetch("/api/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formValues.email,
          username: formValues.username,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Mã xác thực đã được gửi tới email của bạn.");
        startCooldown();
      } else {
        showError(data.message || "Không gửi được mã xác thực.");
        setRegistrationFieldsLocked(false);
        sendCodeButton.disabled = false;
        sendCodeButton.textContent = "Nhận mã";
      }
    } catch (err) {
      showError("Lỗi kết nối máy chủ.");
      setRegistrationFieldsLocked(false);
      sendCodeButton.disabled = false;
      sendCodeButton.textContent = "Nhận mã";
    }
  });

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearAlerts();
    const formValues = getFormValues();
    const validationMessage = validateRegisterData(formValues);
    if (validationMessage) {
      showError(validationMessage);
      return;
    }
    registerForm.registerSubmitButton.disabled = true;
    registerForm.registerSubmitButton.textContent = "Đang đăng ký...";
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formValues.username,
          email: formValues.email,
          password: formValues.password,
          verificationCode: formValues.verificationCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Đăng ký thành công! Đang chuyển sang trang đăng nhập...");
        registerForm.reset();
        window.setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        showError(data.message || "Đăng ký thất bại.");
        if (res.status === 410 || res.status === 429) {
          registerForm.verificationCode.value = "";
          registerForm.verificationCode.focus();
        }
      }
    } catch (err) {
      showError("Lỗi kết nối máy chủ.");
    }
    registerForm.registerSubmitButton.disabled = false;
    registerForm.registerSubmitButton.textContent = "Đăng ký";
  });
});
