// Определение переменной isAdmin на сервере
const isAdmin = true; // Предполагаем, что пользователь считается администратором

// Симуляция списка активных игровых комнат
let gameRooms = [];

// Вызываем функцию для загрузки списка игровых комнат из локального хранилища при загрузке страницы
loadGameRoomsFromLocalStorage();

// Функция для отображения списка игровых комнат
function displayGameRooms() {
  console.log("Current game rooms:", gameRooms); // Добавляем лог о текущих комнатах
  const gameRoomsContainer = document.getElementById("gameRooms");
  if (!gameRoomsContainer) {
    console.error("Element with id 'gameRooms' not found");
    return;
  }

  gameRoomsContainer.innerHTML = "";

  gameRooms.forEach(room => {
    const roomElement = document.createElement("div");
    roomElement.classList.add("game-room");
    roomElement.innerHTML = `
      <div class="room-info">
        <div class="room-name">Комната: ${room.name}</div> 
        <div class="room-players">${room.players}/${room.maxPlayers} человек в игре</div>
      </div>
    `;

    const enterButton = document.createElement("button");
    enterButton.textContent = "Присоединиться";
    enterButton.addEventListener("click", () => {
      window.location.href = `room.html?id=${room.id}`;
    });
    enterButton.style.backgroundColor = 'rgb(79, 172, 79)';
    enterButton.style.color = 'white';
    enterButton.style.padding = '5px';
    enterButton.style.border = '1px solid white';
    enterButton.style.borderRadius = '5px';
    enterButton.style.marginRight = '5px'; // Уменьшаем отступ для кнопки присоединиться

    roomElement.appendChild(enterButton);

    // Проверяем статус администратора
    if (isAdmin) {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Удалить";
      deleteButton.addEventListener("click", () => {
        // Отправляем запрос на удаление комнаты
        fetch(`/deleteRoom/${room.id}`, {
          method: 'DELETE'
        })
        .then(response => {
          if (response.ok) {
            // Если комната успешно удалена, обновляем список игровых комнат
            const index = gameRooms.indexOf(room);
            if (index !== -1) {
              gameRooms.splice(index, 1); // Удаляем комнату из массива gameRooms
              displayGameRooms(); // Обновляем отображение списка игровых комнат
            }
          } else {
            return response.json().then(data =>{
              throw new Error('Ошибка удаления комнаты: ' + JSON.stringify(data));
            });
          }
        })
        .catch(error => {
          console.error('Error deleting room:', error);
          alert(error.message || 'Failed to delete room');
        });
      });
      deleteButton.style.backgroundColor = 'red';
      deleteButton.style.color = 'white';
      deleteButton.style.padding = '5px';
      deleteButton.style.border = '1px solid white';
      deleteButton.style.borderRadius = '5px';
      deleteButton.style.marginRight = '5px'; // Уменьшаем отступ для кнопки удалить

      roomElement.appendChild(deleteButton);
    }
    
    gameRoomsContainer.appendChild(roomElement); // Добавляем элемент комнаты в контейнер
  });
}


// Функция для обновления списка игровых комнат
function refreshGameRooms() {
  // Здесь можно реализовать логику обновления списка комнат, например, с помощью AJAX-запроса к серверу
}

// Обновляем список игровых комнат каждые 10 секунд
setInterval(refreshGameRooms, 10000);

// Функция для добавления комнаты в список игровых комнат
function addRoomToList(room) {
  // Проверка существования комнаты перед добавлением
  const existingRoomIndex = gameRooms.findIndex(existingRoom => existingRoom.id === room.id);
  if (existingRoomIndex === -1) {
    gameRooms.push(room); // Добавляем новую комнату в массив gameRooms
    displayGameRooms(); // Обновляем отображение списка игровых комнат на странице
    saveGameRoomsToLocalStorage(); // Сохраняем список игровых комнат в локальное хранилище
  }
}

// Функция для загрузки списка игровых комнат из локального хранилища
function loadGameRoomsFromLocalStorage() {
  const storedGameRooms = localStorage.getItem('gameRooms');
  if (storedGameRooms) {
    gameRooms = JSON.parse(storedGameRooms);
    displayGameRooms();
  }
}

// Функция для сохранения списка игровых комнат в локальное хранилище
function saveGameRoomsToLocalStorage() {
  localStorage.setItem('gameRooms', JSON.stringify(gameRooms));
}

// Функция для перехода в игровую комнату по её ID
function enterGameRoom(roomId) {
  console.log(`Entering game room ${roomId}`);
}

// Обработчик клика на кнопке создания игры
document.getElementById("createGameButton").addEventListener("click", function() {
  const roomId = generateRoomId();
  const roomName = prompt("Enter room name:");
  const roomPassword = prompt("Enter room password (leave empty for no password):");
  const maxPlayers = prompt("Enter maximum number of players:");

  const newRoom = {
    id: roomId,
    name: roomName,
    password: roomPassword,
    maxPlayers: maxPlayers,
    players: 0 // Начальное количество игроков в комнате
  };

  // Отправляем запрос на создание комнаты
  fetch('/createRoom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newRoom)
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to create room');
  })
  .then(data => {
    alert(data.message);
    addRoomToList(data.room); // Добавляем комнату в список на основе данных, полученных от сервера
  })
  .catch(error => {
    console.error('Error creating room:', error);
    alert('Failed to create room');
  });
});

function generateRoomId() {
  // Функция для генерации уникального идентификатора комнаты
  return Math.random().toString(36).substr(2, 9);
}
