document.addEventListener("DOMContentLoaded", function() {
  // Функция для изменения типа катастрофы
  document.querySelector('.catastrophe-type').addEventListener('click', function() {
    const newType = prompt('Введите новый тип катастрофы:');
    if (newType !== null) {
      document.getElementById('catastropheType').textContent = newType;
    }
  });

  // Функция для изменения информации о бункере
  document.getElementById('bunkerDuration').addEventListener('click', function() {
    const newDuration = prompt('Введите новую продолжительность бункера:');
    if (newDuration !== null) {
      document.getElementById('bunkerDuration').textContent = newDuration;
    }
  });

  document.getElementById('bunkerArea').addEventListener('click', function() {
    const newArea = prompt('Введите новую площадь бункера:');
    if (newArea !== null) {
      document.getElementById('bunkerArea').textContent = newArea;
    }
  });

  document.getElementById('bunkerContents').addEventListener('click', function() {
    const newContents = prompt('Введите новый список имеющихся в бункере предметов:');
    if (newContents !== null) {
      document.getElementById('bunkerContents').textContent = newContents;
    }
  });
});
// Получаем параметры комнаты из URL
const urlParams = new URLSearchParams(window.location.search);
const maxPlayers = parseInt(urlParams.get('maxPlayers')); // Преобразуем строку в число

// Получаем контейнер для окон игроков
const playerContainer = document.getElementById('playerContainer');

// Генерируем HTML для каждого окна игрока и добавляем их в контейнер
for (let i = 1; i <= maxPlayers; i++) {
  const playerWindow = document.createElement('div');
  playerWindow.classList.add('player-window');
  playerWindow.innerHTML = `
    <h3>Player ${i}</h3>
    <!-- Здесь можно добавить дополнительную информацию о игроке -->
  `;
  playerContainer.appendChild(playerWindow);
}

