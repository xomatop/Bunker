const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Установка конфигурации AWS SDK
AWS.config.update({
  region: "eu-north-1",
  accessKeyId: "ASIA5WIQPRZJO3RJKB7V",
  secretAccessKey: "CnBV8bZtUgj9HY4paiolmZgZP4u54sKkLqqIAi3C",
  sessionToken: "IQoJb3JpZ2luX2VjEMT//////////wEaCXVzLWVhc3QtMiJHMEUCIBmL10dfqnsf/ht6mIlNLhcNpWU6mUdNppHTvP2zhyGxAiEAnNqJcWsSRRoWG5T3w8IAWLF0P3Vxeft0oie7ZU6YxcoqtwIInf//////////ARAAGgw5NDExNjkyODI2NDIiDPZ7wU1kKt88j4zCdiqLAuWPAhnf9s+Xzsg0LCU9iTJoXnEzq10gJU6MpDl5fD0dFWx5yek4jOOJIoCmuPTAFT+a7HXOnyEfG/lUeKQiAKySLcOLKRoF8IsFmwfCzzxvw59kd1iwQhu0JHnrqixzkseSyO6vCLpXTe0FMIuqOOLYfZTVYcm2H0Minj5NlONvGcvuPi98Mo9V1FiDDyGfuqHadh243ZwbCElfXVS4qTVmX6E+JTsqVNpuC9ktyQnWpKaw/PtbjCr+KvgJTBQv/NE9jVK7pCiuVo7mEzJFyfEpHE71li8joXC/RrXS8EOCcSWExPP8q23UfU0cqk3Xr0q4Hsibo+euIgmQl8R6cP0YISph7aDj/+WdrzD4l7auBjqdAeJpPRrQkTQF1pF8XE4h8804/boJj36rsYguIiTxlaEjjlb+GPsdiGhFwKKGL+gp+bkC6CWUyMI7FOe+6UtqbfoYv00qWwk3xnmak+h3IR3sRHDvpzee0B4JYAX8DO2Wh3GiI/vgGsw0Qi/s/m0McN9dQ8bT9nIhS1Mo039tkARFdq1+2JJZjlBxCfFh7QW3n8GvBa4BPzKW1Gt1dBQ=",
});

// Создание экземпляра S3
const s3 = new AWS.S3();

// Роут для регистрации пользователя
app.post('/registration', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Получение данных о пользователях из S3
    let usersData = await getObjectFromS3('users.json') || [];

    // Проверка, нет ли уже пользователя с таким именем или почтой
    const existingUser = usersData.find(user => user.username === username || user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Добавление нового пользователя в массив пользователей
    usersData.push({ username, email, password });

    // Запись обновленных данных о пользователях в S3
    await putObjectToS3('users.json', usersData);

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

    // Получение данных о пользователях из S3
    const usersData = await getObjectFromS3('users.json') || [];

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

    // Получение данных о комнатах из S3
    let roomsData = await getObjectFromS3('rooms.json') || [];

    // Добавление новой комнаты в массив комнат
    roomsData.push(newRoom);

    // Запись обновленных данных о комнатах в S3
    await putObjectToS3('rooms.json', roomsData);

    console.log('Room created successfully:', newRoom);
    res.status(200).json({ message: 'Room created successfully', room: newRoom });

  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Функция для получения данных из S3
async function getObjectFromS3(key) {
  try {
    const data = await s3.getObject({ Bucket: 'cyclic-proud-lime-centipede-eu-north-1', Key: key }).promise();
    return JSON.parse(data.Body.toString());
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      // Если ключ не существует, возвращаем null
      return null;
    }
    console.error('Error getting object from S3:', error);
    throw error;
  }
}

// Функция для записи данных в S3
async function putObjectToS3(key, data) {
  try {
    await s3.putObject({
      Body: JSON.stringify(data),
      Bucket: 'cyclic-proud-lime-centipede-eu-north-1',
      Key: key,
    }).promise();
  } catch (error) {
    console.error('Error putting object to S3:', error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
