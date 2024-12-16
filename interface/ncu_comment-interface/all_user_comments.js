// all_user_comments.js

// 定義新的 API URL
const USER_COMMENTS_API_URL_BASE = "http://127.0.0.1:8000/admin_comments/user/"; // 基礎 API 路由
const DELETE_API_URL = "http://127.0.0.1:8000/admin_comments/"; // 基礎刪除 API URL

// DOM 元素
const tableBody = document.querySelector("#comment-summary-table tbody");
const sectionTitle = document.getElementById("section-title"); // 選取標題元素

// 解析 URL 查詢參數以取得 studentId 和 chineseName
function getStudentInfoFromURL() {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('studentId');
    const chineseNameEncoded = params.get('chineseName');
    // 明確解碼 chineseName
    const chineseName = chineseNameEncoded ? decodeURIComponent(chineseNameEncoded) : null;
    return { studentId, chineseName };
}

// 抓取並顯示所有評論的函數
async function fetchUserComments() {
    const { studentId, chineseName } = getStudentInfoFromURL();
    console.log("Parsed studentId:", studentId, "Parsed chineseName:", chineseName); // 調試信息
    if (!studentId || !chineseName) {
        console.error("未取得 studentId 或 chineseName，無法抓取評論資料。");
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">未取得 studentId 或 chineseName，無法顯示評論。</td></tr>`;
        sectionTitle.textContent = "管理評論："; // 保持原本的標題
        return;
    }

    try {
        // 更新標題內容
        sectionTitle.textContent = `管理 ${studentId} ${chineseName} 的評論：`;

        // 顯示載入中提示
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">載入中，請稍候...</td></tr>`;

        // 發送 GET 請求到 user-specific API
        const response = await fetch(`${USER_COMMENTS_API_URL_BASE}${encodeURIComponent(studentId)}`);
        if (!response.ok) {
            throw new Error(`API 錯誤: ${response.statusText}`);
        }

        // 取得 JSON 資料
        const data = await response.json();

        // 如果沒有資料
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">該使用者尚未發表任何評論。</td></tr>`;
            return;
        }

        // 清空現有表格內容
        tableBody.innerHTML = "";

        // 動態建立表格列
        data.forEach((comment) => {
            const tr = document.createElement("tr");

            // 評論 ID
            const tdId = document.createElement("td");
            tdId.textContent = comment.comment_id;
            tr.appendChild(tdId);

            // 評分
            const tdScore = document.createElement("td");
            tdScore.textContent = comment.score;
            tr.appendChild(tdScore);

            // 評論內容
            const tdContent = document.createElement("td");
            tdContent.textContent = comment.comment_content;
            tr.appendChild(tdContent);

            // 課程代碼
            const tdCourseId = document.createElement("td");
            tdCourseId.textContent = comment.course_id;
            tr.appendChild(tdCourseId);

            // 課程名稱
            const tdCourseName = document.createElement("td");
            tdCourseName.textContent = comment.course_name || '無';
            tr.appendChild(tdCourseName);

            // 留言時間
            const tdTime = document.createElement("td");
            tdTime.textContent = comment.time || '無';
            tr.appendChild(tdTime);

            // 操作（刪除按鈕）
            const tdAction = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.className = "btn-delete";
            deleteButton.setAttribute("data-id", comment.comment_id);
            deleteButton.textContent = "刪除";

            // 按鈕樣式
            deleteButton.style.backgroundColor = "#ff6666";
            deleteButton.style.color = "white";
            deleteButton.style.border = "none";
            deleteButton.style.padding = "5px 10px";
            deleteButton.style.cursor = "pointer";
            deleteButton.style.borderRadius = "4px";
            deleteButton.style.transition = "background-color 0.3s ease";

            // 按鈕懸停效果
            deleteButton.addEventListener("mouseover", () => {
                deleteButton.style.backgroundColor = "#ff4d4d";
            });
            deleteButton.addEventListener("mouseout", () => {
                deleteButton.style.backgroundColor = "#ff6666";
            });

            tdAction.appendChild(deleteButton);
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

                        // 顯示刪除完成的提示
                        alert(`評論 ID ${commentId} 已成功被刪除！`);

                        // 移除該評論的表格列
                        btn.closest('tr').remove();

                        // 如果刪除後表格沒有資料，顯示無評論訊息
                        if (tableBody.children.length === 0) {
                            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">目前沒有評論！</td></tr>`;
                        }

                    } catch (error) {
                        console.error("刪除錯誤:", error);
                        alert(`刪除失敗: ${error.message}`);
                    }
                }
            });
        });

    } catch (error) {
        console.error("抓取錯誤:", error);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">抓取評論失敗，請稍後再試</td></tr>`;
    }
}

// 當頁面載入時執行
window.addEventListener("load", fetchUserComments);
