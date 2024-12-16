document.getElementById('profile-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const nickname = document.getElementById('nickname').value;
    const email = document.getElementById('email').value;
    const studentId = document.getElementById('studentId').innerText;

    fetch('http://localhost:8000/api/write_back_user_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nickname: nickname,
            email: email,
            studentId: studentId
        })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});
