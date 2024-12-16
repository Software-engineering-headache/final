const PROFILE_URL = "http://localhost:8000/api/profile"; // 請依實際情況修改
let currentStudentId = null;
const logsContainer = document.getElementById("logsContainer");

// 檢查登入狀態並取得 studentId
async function checkLoginStatus() {
    try {
        const profileResponse = await fetch(PROFILE_URL, {
            credentials: "include",
        });

        if (!profileResponse.ok) {
            // 未登入或取得資料失敗
            currentStudentId = null;
            return false;
        }

        const profileData = await profileResponse.json();
        if (profileData.studentId) {
            currentStudentId = profileData.studentId;
            return true;
        } else {
            currentStudentId = null;
            return false;
        }
    } catch (error) {
        console.error("檢查登入狀態失敗:", error);
        currentStudentId = null;
        return false;
    }
}

// 取得 logs 並呈現在表格中
async function fetchLogs() {
    try {
        const response = await fetch("http://127.0.0.1:8000/settings/logs");
        if (!response.ok) {
            throw new Error("無法取得日志資料");
        }

        const logsData = await response.json();
        
        // 如果沒有資料，顯示提示文字
        if (logsData.length === 0) {
            logsContainer.innerHTML = `<p style="color: gray; text-align:center;">目前尚無任何更新紀錄</p>`;
            return;
        }

        // 建立表格
        const table = document.createElement("table");
        table.className = "log-table"; // 新增 class 名稱
        table.innerHTML = `
            <thead>
                <tr style="background-color: #d2e8f2;">
                    <th>更新id</th>
                    <th>字數限制</th>
                    <th>更新備註</th>
                    <th>更新時間</th>
                    <th>變更的管理員帳號</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        // 將 logsData 插入表格中
        logsData.forEach((log, index) => {
            const row = document.createElement("tr");
            row.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";

            const actionText = log.action === null ? "" : log.action;
            const adminIdText = log.admin_id === null ? "" : log.admin_id;

            // 格式化時間字串（如果需要更可讀的格式，可使用日期處理庫）
            const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString() : "";

            row.innerHTML = `
                <td>${log.id}</td>
                <td>${log.char_count}</td>
                <td>${actionText}</td>
                <td>${timestamp}</td>
                <td>${adminIdText}</td>
            `;
            tbody.appendChild(row);
        });

        logsContainer.innerHTML = "";
        logsContainer.appendChild(table);
    } catch (error) {
        console.error("取得日志資料時發生錯誤:", error);
        logsContainer.innerHTML = `<p style="color: red; text-align:center;">無法取得日志資料，請稍後再試</p>`;
    }
}

document.getElementById("save-settings-btn").addEventListener("click", async () => {
    const charCountInput = document.getElementById("comment-limit");
    const actionInput = document.getElementById("system-log");

    const charCountValue = charCountInput.value.trim();
    const actionValue = actionInput.value.trim();

    // 檢查是否已登入
    const loggedIn = await checkLoginStatus();
    if (!loggedIn || !currentStudentId) {
        alert("您尚未登入，請先登入後再試！");
        return;
    }

    // 檢查評論字數上限是否為空
    if (!charCountValue) {
        alert("字數上限欄位不可為空白！");
        return;
    }

    const charCountNumber = parseInt(charCountValue, 10);
    if (isNaN(charCountNumber)) {
        alert("字數上限欄位必須為數字！");
        return;
    }

    // 組裝要傳給後端的資料，多加上 admin_id 欄位
    const payload = {
        char_count: charCountNumber,
        action: actionValue === "" ? null : actionValue,
        admin_id: currentStudentId
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/settings/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`儲存失敗：${errorData.detail || "未知錯誤"}`);
            return;
        }

        const data = await response.json();
        alert(data.message || "設定已儲存成功！");
        
        // 儲存成功後清空備註欄位，並重新取得 logs 顯示最新紀錄
        actionInput.value = "";
        await fetchLogs();

    } catch (error) {
        console.error("Error:", error);
        alert("儲存失敗，請稍後再試！");
    }
});

// 頁面載入完成後自動取得 logs
window.addEventListener("DOMContentLoaded", async () => {
    await fetchLogs();
});
