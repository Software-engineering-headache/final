
document.getElementById("loginButton").addEventListener("click", () => {
    // 导向到 FastAPI 的 /login 路由，开始 OAuth 认证
    window.location.href = "http://127.0.0.1:8000/interface/ncu_comment-interface/login";
});

// 检查 URL 是否包含回调参数（假设回调重定向到前端）
window.addEventListener("load", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
        // 认证成功后，从后端获取用户资料
        try {
            const response = await fetch("http://localhost:8000/profile");
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const userData = await response.json();
            // 檢查是否是第一次登入
            if (userData.isFirstLogin) {
                // 跳轉到 register.html 填寫表單
                window.location.href = "register.html";
            } else {
                document.getElementById("userInfo").classList.remove("d-none");
                document.getElementById("userData").textContent = JSON.stringify(userData, null, 2);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }
});
