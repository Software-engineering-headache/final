// 定義 API URL
const API_URL = "http://127.0.0.1:8000/users";

// DOM 元素
const dataContainer = document.getElementById("dataContainer");

// 定義函數來抓取所有使用者資料
async function fetchAllUsers() {
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
            dataContainer.innerHTML = `<p style="color: gray;">No users found.</p>`;
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
                    <th style="border: 1px solid #ddd; padding: 8px;">帳戶類型</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">暱稱</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">中文姓名</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">英文姓名</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">性別</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">生日</th>
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
                <td style="border: 1px solid #ddd; padding: 8px;">${user.accountType || "N/A"}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${user.nickname || "N/A"}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${user.chineseName || "N/A"}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${user.englishName || "N/A"}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${user.gender || "N/A"}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${user.birthday || "N/A"}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${user.email || "N/A"}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                    <button class="btn" style="padding: 5px 10px; cursor: pointer; margin-right: 10px;" 
                        onclick="viewComments('${user.studentId}', '${user.chineseName}')">查看所有評論</button>
                    <button class="btn" style="background-color: #ff6666; padding: 5px 10px; cursor: pointer;" 
                        onclick="deleteUser('${encodeURIComponent(user.studentId)}')">刪除使用者</button>
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

// 查看所有評論函數
function viewComments(studentId, chineseName) {
    // 使用 URL 查詢參數傳遞 studentId 和 chineseName
    window.location.href = `all_user_comments.html?studentId=${encodeURIComponent(studentId)}&chineseName=${encodeURIComponent(chineseName)}`;
}

// 刪除使用者函數
async function deleteUser(studentId) {
    if (confirm(`確定要刪除學號為 ${decodeURIComponent(studentId)} 的使用者嗎？`)) {
        try {
            const response = await fetch(`${API_URL}/${decodeURIComponent(studentId)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`刪除失敗: ${response.statusText}`);
            }

            alert(`學號為 ${decodeURIComponent(studentId)} 的使用者已成功刪除。`);
            fetchAllUsers();
        } catch (error) {
            console.error("刪除錯誤:", error);
            alert("刪除失敗，請稍後再試。");
        }
    }
}

// 當頁面載入時自動執行抓取資料函數
window.addEventListener("load", fetchAllUsers);
