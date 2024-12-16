
document.addEventListener("DOMContentLoaded", function () {
    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault(); // 防止默認導航行為

            fetch("http://localhost:8000/interface/ncu_comment-interface/logout", { // 確保使用完整的URL
                method: "GET",
                credentials: "include" // 確保攜帶 Cookie
            })
                .then(response => {
                    if (response.ok) {
                        // 登出成功，重定向到首頁
                        window.location.href = "index.html";
                    } else {
                        console.error("Logout failed");
                        alert("登出失敗，請稍後再試。");
                    }
                })
                .catch(error => {
                    console.error("Error during logout:", error);
                    alert("登出過程中出錯，請檢查網絡或稍後再試。");
                });
        });
    } else {
        console.error("Logout link not found");
    }
});
