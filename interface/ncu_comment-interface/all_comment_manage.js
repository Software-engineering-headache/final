// 定義 API URL
const API_URL = "http://127.0.0.1:8000/admin_comments/all";
const DELETE_API_URL = "http://127.0.0.1:8000/admin_comments/"; // 基礎刪除 API URL

// DOM 元素
const tableBody = document.querySelector("#comment-table tbody");

// 抓取所有評論函數
async function fetchAllComments() {
    try {
        // 顯示載入中提示
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading data, please wait...</td></tr>`;

        // 發送 GET 請求
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        // 取得 JSON 資料
        const data = await response.json();

        // 如果沒有資料
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No comments found.</td></tr>`;
            return;
        }

        // 清空現有表格內容
        tableBody.innerHTML = "";

        // 動態建立表格列
        data.forEach((comment) => {
            const tr = document.createElement("tr");
            
            // 評論id
            const tdId = document.createElement("td");
            tdId.textContent = comment.id;
            tdId.style.border = "1px solid #ddd";
            tdId.style.padding = "8px";
            tr.appendChild(tdId);
            
            // 課程資訊
            const tdCourse = document.createElement("td");
            tdCourse.innerHTML = `
                <div><strong>課程代碼:</strong> ${comment.course_id}</div>
                <div><strong>課程名稱:</strong> ${comment.course_name || ''}</div>
            `;
            tdCourse.style.border = "1px solid #ddd";
            tdCourse.style.padding = "8px";
            tr.appendChild(tdCourse);
            
            // 評論資訊
            const tdCommentInfo = document.createElement("td");
            tdCommentInfo.innerHTML = `
                <div><strong>評分:</strong> ${comment.score}</div>
                <div><strong>評論內容:</strong> ${comment.comment_content || ''}</div>
            `;
            tdCommentInfo.style.border = "1px solid #ddd";
            tdCommentInfo.style.padding = "8px";
            tr.appendChild(tdCommentInfo);
            
            // 使用者資訊
            const tdUser = document.createElement("td");
            tdUser.innerHTML = `
                <div><strong>學號:</strong> ${comment.user_id}</div>
                <div><strong>名稱:</strong> ${comment.user_name || ''}</div>
                <div><strong>暱稱:</strong> ${comment.user_nickname || ''}</div>
                <div><strong>聯絡方式:</strong> ${comment.email || ''}</div>
            `;
            tdUser.style.border = "1px solid #ddd";
            tdUser.style.padding = "8px";
            tr.appendChild(tdUser);
            
            // 留言時間
            const tdTime = document.createElement("td");
            tdTime.textContent = comment.time || '';
            tdTime.style.border = "1px solid #ddd";
            tdTime.style.padding = "8px";
            tr.appendChild(tdTime);
            
            // 操作
            const tdAction = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.className = "btn-delete";
            deleteButton.setAttribute("data-id", comment.id);
            deleteButton.textContent = "刪除";
            // 按鈕樣式
            deleteButton.style.backgroundColor = "#ff6666";
            deleteButton.style.color = "white";
            deleteButton.style.border = "none";
            deleteButton.style.padding = "5px 10px";
            deleteButton.style.cursor = "pointer";
            tdAction.appendChild(deleteButton);
            tdAction.style.border = "1px solid #ddd";
            tdAction.style.padding = "8px";
            tr.appendChild(tdAction);
            
            tableBody.appendChild(tr);
        });

        // 為每個刪除按鈕新增點擊事件
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const commentId = btn.getAttribute("data-id");
                // 顯示確認對話框
                const confirmDelete = confirm(`您確定要刪除評論 ID ${commentId} 的評論嗎？`);
                if (confirmDelete) {
                    try {
                        // 發送 DELETE 請求
                        const deleteResponse = await fetch(`${DELETE_API_URL}${commentId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        if (!deleteResponse.ok) {
                            const errorData = await deleteResponse.json();
                            throw new Error(errorData.detail || '刪除失敗');
                        }

                        // const result = await deleteResponse.json(); // 不需要後端回傳的訊息
                        // 顯示刪除完成的提示
                        alert(`評論 ID ${commentId}已成功被刪除！`);

                        // 移除該評論的表格列
                        btn.closest('tr').remove();

                        // 如果刪除後表格沒有資料，顯示無評論訊息
                        if (tableBody.children.length === 0) {
                            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">目前沒有評論！</td></tr>`;
                        }

                    } catch (error) {
                        console.error("Delete Error:", error);
                        alert(`刪除失敗: ${error.message}`);
                    }
                }
            });
        });

    } catch (error) {
        console.error("Fetch Error:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">抓取評論失敗，請稍後再試</td></tr>`;
    }
}

// 頁面載入後抓取資料
window.addEventListener("load", fetchAllComments);
