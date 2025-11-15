const GAME_DATA = {
    initialState: {
        schemaVersion: 1,
        money: 20000,
        reputation: 15,
        employees: [],
        projects: [],
        log: [],
        currentWeek: 1,
        lastEmployeeId: 0,
        economy: {
            salaryScale: 1,
            projectScale: 1,
            inflationInterval: 10
        },
        gameOver: false
    },
    employeeTypes: [
        {
            type: 'junior-dev',
            label: 'Junior Developer',
            baseCost: 1000,
            baseSalary: 500,
            skills: { coding: 2, bugfixing: 1 },
            nameOptions: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
            minReputation: 0
        },
        {
            type: 'mid-dev',
            label: 'Middle Developer',
            baseCost: 3000,
            baseSalary: 1500,
            skills: { coding: 4, bugfixing: 2 },
            nameOptions: ['Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'],
            minReputation: 20
        },
        {
            type: 'senior-dev',
            label: 'Senior Developer',
            baseCost: 6000,
            baseSalary: 3000,
            skills: { coding: 7, bugfixing: 4 },
            nameOptions: ['Kevin', 'Linda', 'Mike', 'Nancy', 'Oscar'],
            minReputation: 50
        }
    ],
    projectTypes: [
        {
            name: 'Simple Landing Page',
            icon: '📄',
            description: 'Небольшой промо-сайт для локального бизнеса.',
            requiredSkills: { coding: 3, bugfixing: 1 },
            duration: 3,
            baseReward: 5000,
            reputationGain: 10,
            minReputation: 0,
            size: 'small'
        },
        {
            name: 'Company Website',
            icon: '🏢',
            description: 'Корпоративный сайт с базовыми интеграциями.',
            requiredSkills: { coding: 6, bugfixing: 2 },
            duration: 6,
            baseReward: 12000,
            reputationGain: 15,
            minReputation: 15,
            size: 'medium'
        },
        {
            name: 'E-commerce Platform',
            icon: '🛒',
            description: 'Полноценный интернет-магазин с каталогом и оплатой.',
            requiredSkills: { coding: 12, bugfixing: 5 },
            duration: 10,
            baseReward: 25000,
            reputationGain: 30,
            minReputation: 30,
            size: 'large'
        },
        {
            name: 'Mobile App MVP',
            icon: '📱',
            description: 'Кроссплатформенный MVP мобильного приложения.',
            requiredSkills: { coding: 10, bugfixing: 4 },
            duration: 8,
            baseReward: 20000,
            reputationGain: 25,
            minReputation: 25,
            size: 'medium'
        }
    ],
    events: [
        { type: 'positive', message: 'Клиент отметил высокое качество кода, репутация выросла!', reputationChange: 2 },
        { type: 'negative', message: 'Баг у клиента в проде — платим неустойку. (-$1000)', moneyChange: -1000, reputationChange: -5 },
        { type: 'positive', message: 'Команда ускорила процесс, прогресс вырос.', reputationChange: 1 },
        { type: 'negative', message: 'Неудачный спринт, заказчик недоволен. (-$500)', moneyChange: -500, reputationChange: -2 },
        { type: 'positive', message: 'Удачный PR-актив, поток заявок усилился.', reputationChange: 5 },
        { type: 'negative', message: 'Проблемы с инфраструктурой клиента — скушали бюджет. (-$2000)', moneyChange: -2000 }
    ]
};

