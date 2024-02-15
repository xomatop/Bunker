// login.js
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        let loginIdentifier = document.getElementById("loginIdentifier").value;
        let loginPassword = document.getElementById("loginPassword").value;
      
        let formData = {
          loginIdentifier: loginIdentifier,
          loginPassword: loginPassword
        };
      
        fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })

        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Проверяем, что тип ответа - JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                // Парсим JSON-ответ
                return response.json();
            } else {
                // Если тип ответа не JSON, возможно, сервер вернул HTML-страницу с ошибкой
                console.log('Response:', response);
                throw new Error('Unexpected response from server');
            }
        })       

        .then(data => {
            console.log(data.message);
            // Перенаправляем пользователя на страницу игр после успешного входа
            window.location.href = 'games.html';
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            // Отображаем сообщение об ошибке на странице
            document.getElementById("message").innerText = "Логин или пароль неверный."; // сообщение об ошибке
        });
        
    });
} else {
    console.error('Element with id "loginForm" not found.');
}
