window.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8000/my_comments', {
        credentials: 'include'  // 確保請求包含憑據（如 Cookie）
    })
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data);  // 輸出接收到的數據

            const tbody = document.getElementById('comments-body');

            if (data.error) {
                tbody.innerHTML = `<tr><td colspan="4">${data.error}</td></tr>`;
                return;
            }

            data.forEach(comment => {
                const row = document.createElement('tr');

                // 課程代碼
                const courseIdCell = document.createElement('td');
                courseIdCell.textContent = comment.course_id;
                row.appendChild(courseIdCell);

                // 課程名稱
                const courseNameCell = document.createElement('td');
                courseNameCell.textContent = comment.course_name;
                row.appendChild(courseNameCell);

                // 評論內容
                // 評論內容
                const contentCell = document.createElement('td');
                const maxLength = 100; // 要顯示的最大字數
                const displayContent = comment.content
                    ? (comment.content.length > maxLength
                        ? comment.content.substring(0, maxLength) + '...' // 截斷內容加上 "..."
                        : comment.content)
                    : '無內容'; // 如果 content 是空值，顯示 "無內容"
                contentCell.textContent = displayContent;
                row.appendChild(contentCell);

                // 刪除按鈕
                const deleteCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn';
                deleteButton.textContent = '刪除';
                deleteButton.onclick = function () {
                    deleteComment(this, comment.comment_id);
                };
                deleteCell.appendChild(deleteButton);
                row.appendChild(deleteCell);

                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching comments:', error));
});

function deleteComment(button, commentId) {
    fetch('http://localhost:8000/comments/remove', {
        method: 'POST',
        credentials: 'include',  // Include cookies for authentication
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: commentId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Comment removed successfully') {
                // Remove the row from the table
                const row = button.parentElement.parentElement;
                row.parentElement.removeChild(row);
            } else {
                console.error('Error deleting comment:', data);
            }
        })
        .catch(error => console.error('Error:', error));
}