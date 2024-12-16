// 定義 API URL
const API_URL = "http://127.0.0.1:8000/users/admins";

// DOM 元素
const dataContainer = document.getElementById("dataContainer");

// 定義函數來抓取管理員資料
async function fetchAdminUsers() {
    try {
        // 顯示載入中提示
        dataContainer.innerHTML = `<p style="color: blue; margin-left: 40px;">Loading data, please wait...</p>`;

        // 發送 API 請求
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        // 解析返回的 JSON 數據
        const data = await response.json();

        // 清空容器
        dataContainer.innerHTML = "";

        // 如果沒有數據，顯示提示
        if (data.length === 0) {
            dataContainer.innerHTML = `<p style="color: gray;">No admin users found.</p>`;
            return;
        }

        // 建立表格結構
        const table = document.createElement("table");
        table.style.width = "95%";
        table.style.margin = "20px auto";
        table.style.borderCollapse = "collapse";
        table.innerHTML = `
            <thead>
                <tr style="background-color: #d2e8f2;">
                    <th style="border: 1px solid #ddd; padding: 8px;">學號</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">暱稱</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">姓名</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">電子郵件</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">操作</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;

        const tbody = table.querySelector("tbody");

        // 將數據動態插入表格
        data.forEach((user, index) => {
            const row = document.createElement("tr");
            row.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";
            row.innerHTML = `
                <td style="border: 1px solid #ddd; padding: 8px;">${user.studentId}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${user.nickname}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${user.chineseName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${user.email}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                    <button class="btn" button style="background-color: #ff6666; color: white; border: none; padding: 5px 10px; cursor: pointer;" onclick="deleteAdmin('${user.studentId}')">刪除權限</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // 將表格插入到容器中
        dataContainer.appendChild(table);
    } catch (error) {
        console.error("Fetch Error:", error);
        dataContainer.innerHTML = `<p style="color: red;">Failed to fetch data. Please check the API and try again.</p>`;
    }
}

// 刪除管理員函數
function deleteAdmin(studentId) {
    if (confirm(`確定要刪除學號為 ${studentId} 的管理員嗎？`)) {
        console.log(`Deleting admin with studentId: ${studentId}`);
        // 可以在這裡添加刪除請求的邏輯
    }
}


// 新增管理員按鈕
document.querySelector(".add-admin button").addEventListener("click", async () => {
    const studentIdInput = document.getElementById("student-id");
    const studentId = studentIdInput.value.trim();

    if (!studentId) {
        alert("請輸入學號！");
        return;
    }

    try {
        // 發送 API 請求檢查學號
        const response = await fetch(`http://127.0.0.1:8000/users/check/${studentId}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.message === "NOT_FOUND") {
            alert("該學號的使用者不存在！");
        } else if (data.message === "ALREADY_ADMIN") {
            alert("該使用者已經是管理員！");
        } else if (data.message === "UPDATED") {
            alert(`已成功新增使用者學號 ${studentId} 為管理員！`);
            // 重新抓取管理員列表
            fetchAdminUsers();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("新增管理員失敗，請稍後再試！");
    }
});

// 刪除管理員函數
async function deleteAdmin(studentId) {
    if (confirm(`確定要刪除學號為 ${studentId} 的管理員嗎？`)) {
        try {
            // 發送 API 請求將該使用者權限改為 STUDENT
            const response = await fetch(`http://127.0.0.1:8000/users/remove-admin/${studentId}`, {
                method: "PATCH", // 使用 PATCH 方法表示更新部分數據
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.message === "NOT_FOUND") {
                alert("該學號的使用者不存在！");
            } else if (data.message === "REMOVED") {
                alert(`已刪除學號 ${studentId} 的管理員權限！`);
                // 重新抓取管理員列表
                fetchAdminUsers();
            }
        } catch (error) {
            console.error("Error:", error);
            alert("刪除管理員失敗，請稍後再試！");
        }
    }
}


// 當頁面載入時自動執行抓取資料函數
window.addEventListener("load", fetchAdminUsers);
