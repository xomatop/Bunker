document.addEventListener('DOMContentLoaded', () => {
    const generateCardsButton = document.getElementById('generateBtn');
    generateCardsButton.addEventListener('click', () => {
        const numberOfCardsInput = document.getElementById('numberOfCards');
        const numberOfCards = numberOfCardsInput.value;
        generateCards(numberOfCards);
    });

    const additionalBtn = document.getElementById('additionalBtn');
    additionalBtn.addEventListener('click', () => {
        const additionalAction = document.getElementById('additionalAction').value;
        const fileCount = document.getElementById('fileCount').value;
        performAdditionalAction(additionalAction, fileCount);
    });
});

function generateCards(numberOfCards) {
    fetch(`/generate-cards?number=${numberOfCards}`)
        .then(response => response.json())
        .then(cards => {
            cards.forEach((card, index) => {
                const blob = new Blob([formatCard(card)], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `card_${index + 1}.txt`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
            });
        })
        .catch(error => console.error('Error generating cards:', error));
}

function formatCard(card) {
    let formattedCard = '';
    let biologicalAdded = false; // Флаг для отслеживания добавления биологических характеристик
    Object.entries(card).forEach(([key, value]) => {
        if (key === 'Профессия' || key === 'Хобби') {
            // Если это ключ "Профессия" или "Хобби", добавляем случайный стаж
            const ageMatch = value.match(/\d+/); // Ищем число в строке
            const age = ageMatch ? parseInt(ageMatch[0]) : 0; // Если возраст найден, преобразуем его в число, иначе используем 0
            const randomExperience = Math.floor(Math.random() * age); // Случайное число между 0 и возрастом
            formattedCard += `${key}: ${value}, стаж: ${randomExperience} лет\n`;
        } else if (key === 'Биологические характеристики') {
            if (!biologicalAdded) {
                // Добавляем "Бесплодие" только если слово "Биологические характеристики" присутствует
                formattedCard += `${key}: ${value}\n`;
                if (Math.random() < 0.33) {
                    formattedCard += `Бесплодие\n`;
                }
                biologicalAdded = true; // Устанавливаем флаг, что биологические характеристики уже добавлены
            } else {
                formattedCard += `${key}: ${value}\n`;
            }
        } else {
            formattedCard += `${key}: ${value}\n`;
        }
    });
    return formattedCard;
}





function performAdditionalAction(action, fileCount) {
    fetch(`/perform-action?action=${action}&number=${fileCount}`)
        .then(response => response.json())
        .then(data => {
            // Обрабатываем ответ сервера, если необходимо
        })
        .catch(error => console.error('Error performing action:', error));
}
