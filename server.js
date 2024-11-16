const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const WebSocket = require('ws'); // Подключаем WebSocket
const app = express();

// Подключение к базе данных MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'xoma',
    database: 'bunker'
});

db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Подключение к базе данных успешно установлено');
    }
});

// Устанавливаем путь к каталогу, где находятся статические файлы
const publicDirectoryPath = path.join(__dirname, 'public');
app.use(express.static(publicDirectoryPath));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// === WebSocket сервер для обновлений в реальном времени ===
const wss = new WebSocket.Server({ noServer: true });
const clients = new Set(); // Храним всех подключенных клиентов

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Клиент подключился');

    // Удаляем клиента из списка при отключении
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Клиент отключился');
    });
});

// Функция для отправки обновлений всем клиентам
function broadcastUpdate() {
    const query = 'SELECT id, name, players_count, max_players, created_by FROM rooms';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Ошибка при получении данных о комнатах:', err);
            return;
        }

        const message = JSON.stringify({ type: 'update_rooms', data: results });
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
}

// === API для работы с комнатами ===

// Получение списка комнат
app.get('/rooms', (req, res) => {
    const query = 'SELECT id, name, players_count, max_players, created_by FROM rooms';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Ошибка при получении данных о комнатах:', err);
            return res.status(500).send('Ошибка сервера');
        }
        res.json(results);
    });
});

// Создание комнаты
app.post('/create-room', (req, res) => {
    const { roomName, password, maxPlayers, creatorName } = req.body;

    if (!roomName || !maxPlayers || !creatorName) {
        return res.status(400).send('Имя комнаты, имя создателя и максимальное количество игроков обязательны');
    }

    const query = `
        INSERT INTO rooms (name, password, max_players, players_count, created_by) 
        VALUES (?, ?, ?, 0, ?)
    `;
    db.query(query, [roomName, password || null, maxPlayers, creatorName], (err, result) => {
        if (err) {
            console.error('Ошибка при создании комнаты:', err);
            return res.status(500).send('Ошибка сервера');
        }
        console.log(`Комната создана: ${roomName}, ID: ${result.insertId}, Создатель: ${creatorName}`);

        // Обновляем список комнат
        broadcastUpdate();
        res.redirect(`/room/${result.insertId}`);
    });
});

// Удаление комнаты
app.post('/delete-room/:id', (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM rooms WHERE id = ?`;
    db.query(query, [id], (err) => {
        if (err) {
            console.error('Ошибка при удалении комнаты:', err);
            return res.status(500).send('Ошибка сервера');
        }
        console.log(`Комната с ID ${id} удалена`);

        // Обновляем список комнат
        broadcastUpdate();
        res.send({ message: 'Комната удалена' });
    });
});

// Получение информации о комнате
app.get('/room/:id', (req, res) => {
    const query = `SELECT * FROM rooms WHERE id = ?`;
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Ошибка при получении комнаты:', err);
            return res.status(500).send('Ошибка сервера');
        }
        if (results.length === 0) {
            return res.status(404).send('Комната не найдена');
        }
        res.sendFile(path.join(publicDirectoryPath, 'room.html'));
    });
});

// Вход в комнату
app.post('/enter-room/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    const query = `SELECT * FROM rooms WHERE id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Ошибка при получении комнаты:', err);
            return res.status(500).send('Ошибка сервера');
        }

        if (results.length === 0) {
            return res.status(404).send('Комната не найдена');
        }

        const room = results[0];

        // Проверяем пароль
        if (room.password && room.password !== password) {
            return res.status(403).send('Неверный пароль');
        }

        // Проверяем количество игроков
        if (room.players_count >= room.max_players) {
            return res.status(403).send('Комната заполнена');
        }

        // Увеличиваем количество игроков
        const updateQuery = `UPDATE rooms SET players_count = players_count + 1 WHERE id = ?`;
        db.query(updateQuery, [id], (err) => {
            if (err) {
                console.error('Ошибка при обновлении количества игроков:', err);
                return res.status(500).send('Ошибка сервера');
            }
            console.log(`Игрок вошел в комнату ID: ${id}`);
            res.send({ message: 'Вы вошли в комнату' });
        });
    });
});

// Загрузка изображения игрока
app.post('/room/:roomId/player/:playerId/image', upload.single('image'), (req, res) => {
    const { roomId, playerId } = req.params;

    if (req.file) {
        const imageUrl = `/uploads/${req.file.filename}`;
        const query = `UPDATE players SET image_url = ? WHERE id = ? AND room_id = ?`;

        db.query(query, [imageUrl, playerId, roomId], (err) => {
            if (err) {
                console.error('Ошибка при обновлении изображения:', err);
                return res.status(500).send('Ошибка сервера');
            }
            console.log(`Изображение обновлено для игрока ${playerId}`);
            res.send('Изображение обновлено');
        });
    } else {
        res.status(400).send('Необходимо загрузить изображение.');
    }
});

// === Настройка WebSocket на сервере Express ===
const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Сервер запущен на порту 3000');
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
