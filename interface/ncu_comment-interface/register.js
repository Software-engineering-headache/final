document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;

        try {
            const response = await fetch('http://localhost:8000/interface/ncu_comment-interface/register', {
                method: 'POST',
                credentials: 'include', // 確保請求包含 Cookie
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            if (response.ok) {
                window.location.href = 'http://localhost:5500/interface/ncu_comment-interface/index.html';
            } else {
                alert('註冊失敗，請稍後再試');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('註冊失敗，請稍後再試');
        }
    });
});