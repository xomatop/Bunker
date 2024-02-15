// Слушаем событие отправки формы регистрации
document.getElementById("registrationForm").addEventListener("submit", function(event) {
    // Отменяем стандартное поведение формы
    event.preventDefault();
  
    // Получаем значения полей формы
    let username = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let birthdate = document.getElementById("birthdate").value;
    let password = document.getElementById("password").value;
  
    // Создаем объект с данными пользователя
    let formData = {
      username: username,
      email: email,
      birthdate: birthdate,
      password: password
    };
  
    // Отправляем данные на сервер методом POST
    fetch('/registration', {
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
        return response.json();
    })
    .then(data => {
        console.log(data.message);
        // Перенаправляем пользователя на страницу профиля после успешной регистрации
        window.location.href = 'games.html'; // Изменен
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        
        // Проверяем, содержит ли ответ информацию о занятом логине или почте
        if (error.message.includes('Username is already taken')) {
            document.getElementById("usernameError").style.display = "block"; // Показываем уведомление об ошибке по имени пользователя
        }
        if (error.message.includes('Email is already in use')) {
            document.getElementById("emailError").style.display = "block"; // Показываем уведомление об ошибке по почте
        }
    });    
  });