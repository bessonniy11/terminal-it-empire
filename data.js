const GAME_DATA = {
    initialState: {
        money: 20000, // Увеличенный стартовый капитал
        reputation: 15, // Немного увеличенная стартовая репутация
        employees: [],
        projects: [],
        currentWeek: 1,
        gameOver: false
    },
    employeeTypes: [
        {
            type: 'junior-dev',
            cost: 1000,
            salary: 500,
            skills: { coding: 2, bugfixing: 1 },
            nameOptions: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
            minReputation: 0 // Джуниоров можно нанимать всегда
        },
        {
            type: 'mid-dev',
            cost: 3000,
            salary: 1500,
            skills: { coding: 4, bugfixing: 2 },
            nameOptions: ['Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'],
            minReputation: 20 // Для найма мидлов нужна репутация 20+
        },
        {
            type: 'senior-dev',
            cost: 6000,
            salary: 3000,
            skills: { coding: 7, bugfixing: 4 },
            nameOptions: ['Kevin', 'Linda', 'Mike', 'Nancy', 'Oscar'],
            minReputation: 50 // Для найма сеньоров нужна репутация 50+
        }
    ],
    projectTypes: [
        {
            name: 'Simple Landing Page',
            icon: '🌐',
            description: 'Быстрый одностраничный сайт для малого бизнеса.',
            requiredSkills: { coding: 3, bugfixing: 1 },
            duration: 3, // in weeks
            reward: 5000,
            reputationGain: 10,
            minReputation: 0,
            size: 'small'
        },
        {
            name: 'Company Website',
            icon: '🏢',
            description: 'Полноценный сайт-визитка с несколькими страницами.',
            requiredSkills: { coding: 6, bugfixing: 2 },
            duration: 6, // in weeks
            reward: 12000,
            reputationGain: 15,
            minReputation: 15,
            size: 'medium'
        },
        {
            name: 'E-commerce Platform',
            icon: '🛒',
            description: 'Онлайн-магазин с системой оплаты и каталогом товаров.',
            requiredSkills: { coding: 12, bugfixing: 5 },
            duration: 10, // in weeks
            reward: 25000,
            reputationGain: 30,
            minReputation: 30,
            size: 'large'
        },
        {
            name: 'Mobile App MVP',
            icon: '📱',
            description: 'Минимально жизнеспособный продукт для нового мобильного приложения.',
            requiredSkills: { coding: 10, bugfixing: 4 },
            duration: 8, // in weeks
            reward: 20000,
            reputationGain: 25,
            minReputation: 25,
            size: 'medium'
        }
    ],
    events: [
        { type: 'positive', message: 'Ваша компания получила положительный отзыв, репутация повысилась!', reputationChange: 2 },
        { type: 'negative', message: 'Критическая ошибка в проекте, репутация понизилась и небольшой штраф! (-$1000)', moneyChange: -1000, reputationChange: -5 },
        { type: 'positive', message: 'Нашли талантливого фрилансера, он помог с багфиксом (+1 к bugfixing на текущую неделю)!'},
        { type: 'negative', message: 'Отключился сервер, потеря репутации и небольшой финансовый удар! (-$500)', moneyChange: -500, reputationChange: -2 },
        { type: 'positive', message: 'Удачное PR-событие! Репутация компании значительно возросла.', reputationChange: 5},
        { type: 'negative', message: 'Внезапная проверка налоговой службы! Штраф за неточности в отчетности. (-$2000)', moneyChange: -2000}
    ]
};
