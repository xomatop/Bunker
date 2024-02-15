const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Роут для регистрации пользователя
app.post('/registration', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let usersData = [];

    // Проверяем существует ли файл и не пуст ли он
    if (fs.existsSync('users.txt')) {
      const fileContent = fs.readFileSync('users.txt', 'utf8');
      if (fileContent.trim() !== '') {
        usersData = JSON.parse(`[${fileContent.trim().split('\n').join(',')}]`);
      }
    }

    // Проверка, нет ли уже пользователя с таким именем или почтой
    const existingUser = usersData.find(user => user.username === username || user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Добавление нового пользователя в массив пользователей
    usersData.push({ username, email, password });

    // Запись обновленных данных о пользователях в файл
    fs.writeFileSync('users.txt', usersData.map(user => JSON.stringify(user)).join('\n'));

    console.log('User registered successfully:', { username, email });
    res.status(200).json({ message: 'Registration successful' });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Роут для входа пользователя
app.post('/login', async (req, res) => {
  try {
    const { loginIdentifier, loginPassword } = req.body;

    // Чтение данных о пользователях из файла
    const fileContent = fs.readFileSync('users.txt', 'utf8');
    const usersData = fileContent.trim().split('\n').map(line => JSON.parse(line));
    
    // Поиск пользователя по имени пользователя или почте
    const user = usersData.find(user => user.username === loginIdentifier || user.email === loginIdentifier);
    if (!user || user.password !== loginPassword) {
      console.log('Login failed:', { loginIdentifier });
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      console.log('Login successful:', { loginIdentifier });
      res.status(200).json({ message: 'Login successful' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Роут для создания комнаты
app.post('/createRoom', async (req, res) => {
  try {
    const { id, name, password, maxPlayers, players } = req.body;
    const newRoom = { id, name, password, maxPlayers, players };

    // Чтение данных о комнатах из файла
    let roomsData = [];
    if (fs.existsSync('rooms.txt')) {
      const fileContent = fs.readFileSync('rooms.txt', 'utf8');
      if (fileContent.trim() !== '') {
        roomsData = JSON.parse(`[${fileContent.trim().split('\n').join(',')}]`);
      }
    }

    // Добавление новой комнаты в массив комнат
    roomsData.push(newRoom);

    // Запись обновленных данных о комнатах в файл
    fs.writeFileSync('rooms.txt', roomsData.map(room => JSON.stringify(room)).join('\n'));

    console.log('Room created successfully:', newRoom);
    res.status(200).json({ message: 'Room created successfully', room: newRoom });

  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Роут для удаления комнаты
app.delete('/deleteRoom/:id', async (req, res) => {
  try {
    const roomId = req.params.id;

    // Чтение данных о комнатах из файла
    let roomsData = [];
    if (fs.existsSync('rooms.txt')) {
      const fileContent = fs.readFileSync('rooms.txt', 'utf8');
      console.log('File content:', fileContent); // Добавлено для отладки
      if (fileContent.trim() !== '') {
        roomsData = JSON.parse(fileContent);
      }
    }

    console.log('Rooms data before deletion:', roomsData); // Добавлено для отладки

    // Удаление комнаты с указанным id из массива комнат
    roomsData = roomsData.filter(room => room.id !== roomId);

    console.log('Rooms data after deletion:', roomsData); // Добавлено для отладки

    // Запись обновленных данных о комнатах в файл
    fs.writeFileSync('rooms.txt', JSON.stringify(roomsData));

    console.log('Room deleted successfully:', roomId);
    res.status(200).json({ message: `Room ${roomId} deleted successfully` });

  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});




// Роут для входа в игровую комнату
app.post('/enterRoom/:id', async (req, res) => {
  try {
    const roomId = req.params.id;

    // Чтение данных о комнатах из файла
    let roomsData = [];
    if (fs.existsSync('rooms.txt')) {
      const fileContent = fs.readFileSync('rooms.txt', 'utf8');
      if (fileContent.trim() !== '') {
        roomsData = JSON.parse(`[${fileContent.trim().split('\n').join(',')}]`);
      }
    }

    // Находим комнату с указанным id и увеличиваем количество игроков на 1
    const roomIndex = roomsData.findIndex(room => room.id === roomId);
    if (roomIndex !== -1) {
      roomsData[roomIndex].players++;
    } else {
      throw new Error(`Room with id ${roomId} not found`);
    }

    // Запись обновленных данных о комнатах в файл
    fs.writeFileSync('rooms.txt', JSON.stringify(roomsData));

    console.log('Player entered room:', roomId);
    res.status(200).json({ message: `Entered room ${roomId}` });

  } catch (error) {
    console.error('Error entering room:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});