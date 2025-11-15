const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const gameControls = document.getElementById('game-controls');

const statWeek = document.getElementById('stat-week');
const statMoney = document.getElementById('stat-money');
const statReputation = document.getElementById('stat-reputation');
const hiredEmployeesList = document.getElementById('hired-employees-list');
const activeProjectsList = document.getElementById('active-projects-list');
const hirePanel = document.getElementById('hire-panel');
const projectsPanel = document.getElementById('projects-panel');

const fireConfirmModal = document.getElementById('fire-confirm-modal');
const fireConfirmName = document.getElementById('fire-confirm-name');
const fireConfirmRole = document.getElementById('fire-confirm-role');
const confirmFireBtn = document.getElementById('confirm-fire-btn');
const cancelFireBtn = document.getElementById('cancel-fire-btn');
const employeeStatsModal = document.getElementById('employee-stats-modal');
const employeeModalName = document.getElementById('employee-modal-name');
const employeeModalRole = document.getElementById('employee-modal-role');
const employeeModalCurrentSalary = document.getElementById('employee-modal-current-salary');
const employeeModalMarketSalary = document.getElementById('employee-modal-market-salary');
const employeeModalMood = document.getElementById('employee-modal-mood');
const employeeModalWarning = document.getElementById('employee-modal-warning');
const employeeEventsList = document.getElementById('employee-events-list');
const employeeSalaryInput = document.getElementById('employee-salary-input');
const employeeSalaryError = document.getElementById('employee-salary-error');
const saveEmployeeSalaryBtn = document.getElementById('save-employee-salary');
const closeEmployeeModalBtn = document.getElementById('close-employee-modal');
const openGlobalStatsBtn = document.getElementById('open-global-stats');
const globalStatsModal = document.getElementById('global-stats-modal');
const globalStatsList = document.getElementById('global-stats-list');
const closeGlobalStatsBtn = document.getElementById('close-global-stats');
const notificationsContainer = document.getElementById('notifications-container');

const SAVE_KEY = 'tib-save';
const SCHEMA_VERSION = 1;
const LOG_LIMIT = 200;
const EMPLOYEE_EVENT_LIMIT = 30;

const DEFAULT_ECONOMY = Object.freeze({
    salaryScale: 1,
    projectScale: 1,
    inflationInterval: 10
});

const EMPLOYEE_POSITIVE_EVENTS = [
    { message: 'нашёл узкое место и ускорил билд', moneyChange: 600, reputationChange: 2 },
    { message: 'починил критический баг клиента', moneyChange: 800, reputationChange: 3 },
    { message: 'оптимизировал тесты, команда быстрее завершила спринт', reputationChange: 2 },
    { message: 'получил похвалу клиента за качество', moneyChange: 400, reputationChange: 4 },
    { message: 'переписал легаси на что-то читаемое', moneyChange: 500 },
    { message: 'провёл мини-воркшоп и вдохновил команду', reputationChange: 2 },
    { message: 'уронил техдолг на 5 единиц кармы', reputationChange: 1 },
    { message: 'вырос до тимлида за неделю (в голове)', reputationChange: 1 },
    { message: 'автоматизировал рутину и освободил время', moneyChange: 350 },
    { message: 'вынес баг-демона в горы', reputationChange: 3 }
];

const EMPLOYEE_NEGATIVE_EVENTS = [
    { message: 'допустил критический баг, клиент потребовал компенсацию', moneyChange: -900, reputationChange: -3 },
    { message: 'сорвал дедлайн задачи', reputationChange: -2 },
    { message: 'забыл покрыть тестами модуль, пришлось переделывать', moneyChange: -400 },
    { message: 'отправил неготовый релиз, пришлось устранять последствия', moneyChange: -700, reputationChange: -2 },
    { message: 'запушил пароль в репозиторий', moneyChange: -600, reputationChange: -4 },
    { message: 'устроил продовый фейерверк логов', reputationChange: -2 },
    { message: 'перепутал staging и prod по пятницам', moneyChange: -500 },
    { message: 'решил оптимизировать и случайно удалил всё', moneyChange: -800, reputationChange: -3 },
    { message: 'обновил зависимость и всё взорвалось', reputationChange: -1 }
];

const EMPLOYEE_NEUTRAL_EVENTS = [
    'занимался рефакторингом, без особых событий',
    'помог коллегам с ревью, неделя прошла спокойно',
    'много учился и писал документацию, влияние нейтральное',
    'осознал, что любимый шрифт — это стиль жизни',
    'организовал полку с мерчем, KPI не тронут',
    'целую неделю настраивал git hooks и доволен',
    'внедрил новый эмодзи-стандарт в чате'
];

const WARNING_SOURCES = [
    'Личное сообщение сотрудника',
    'Услышали через менеджера',
    'Коллеги сообщили о недовольстве',
    'Узнали по внутреннему опросу',
    'Заметили пассивно-агрессивный статус в Slack',
    'Наткнулись на резюме в LinkedIn',
    'HR сказал "нам нужно поговорить"',
    'Нашли записку на холодильнике в офисе',
    'Получили письмо с темой "не хочу, но надо"',
    'Сотрудник шепнул DevOps-у, а тот — всем',
    'На ретроспективе внезапно стало тихо',
    'Сотрудник спросил, где тут выход без ключ-карты'
];

const SATISFACTION_DESCRIPTIONS = [
    { min: 80, text: 'поёт гимн компании и раздаёт стикеры' },
    { min: 60, text: 'сияет ярче монитора в тёмной комнате' },
    { min: 40, text: 'доволен и подпевает во время стендапов' },
    { min: 20, text: 'шутит, но тихо ищет курсы роста' },
    { min: 5, text: 'держится, но кофе льётся литрами' },
    { min: -5, text: 'поглядывает на вакансии между коммитами' },
    { min: -20, text: 'ищет EXIT в каждом спринт-борде' },
    { min: -40, text: 'напечатал заявление и ищет принтер' },
    { min: -70, text: 'строит побег, пакует тикеты с собой' },
    { min: -101, text: 'написал "пока" в README' }
];


const DEPARTURE_REASONS = {
    salary: [
        'устал работать за еду',
        'сами работайте за такие деньги',
        'захотел зарплату в валюте, а не в респектах',
        'решил монетизировать талант дороже',
        'нашёл оффер в три раза выше, пока',
        'перешёл туда, где оплачивают переработки',
        'не хочет больше обменивать талант на доширак',
        'устал слышать слово "премия" только в будущем времени',
        'нашёл компанию без совета жаб по экономии',
        'забрал клавиатуру и ушёл торговаться за деньги',
        'зарплата покрывает только кофе, а он любит еду',
        'хочет оклад, который видит налоговая',
        'решил прекратить бартер "код за печеньки"',
        'обиделся, что его грейд выше, чем оклад',
        'говорит, что с таким прайсом даже ИИ обиделся',
        'решил перестать делить пиццу на зарплатные части',
        'нашёл место, где слово "бонус" не шёпотом',
        'перешёл туда, где зарплату индексируют чаще инфляции',
        'украл табличку "экономим" и унес к конкурентам',
        'понял, что карьерный рост дешевле, чем его кофе',
        'попросил рынок оценить его — рынок сказал «дорого»',
        'пересчитав часы, понял, что выгоднее блог вести',
        'нашёл место, где кофе стоит дешевле оклада',
        'решил, что “оплата опытом” — не его валюта',
        'ушёл туда, где хвалят не только пирожком',
        'устал ждать премию размером с шаурму',
        'решил платить ипотеку, а не плату за работу'
    ],
    burnout: [
        'выгорел и ушёл выращивать базилик',
        'решил сделать паузу и написать книгу о том, как ничего не писать',
        'уехал в горы без Wi-Fi',
        'ушёл искать дзен в офлайн-библиотеке',
        'решил лечиться от Jira-триггеров',
        'устал объяснять, что "ещё один хотфикс" — это боль',
        'взял отпуск на неопределённое “не звоните мне”',
        'решил сменить IDE на сапёр',
        'стал собирать пазлы вместо регрессии',
        'объявил detox от уведомлений',
        'попросил у HR объятия, а получил задачи — это было последней каплей',
        'заменил daily на daily йогу',
        'ушёл в отпуск по восстановлению чувства юмора',
        'захотел спать ночью, а не деплойть'
    ],
    growth: [
        'получил оффер с окладом в 3 раза больше, пока неудачники',
        'переходит в стартап мечты (там обещали кота в офисе)',
        'решил стать CTO в своём гараже',
        'ушёл в GameDev, потому что принёс геймдизайн в отчёт',
        'нашёл команду, где coffee-to-code ratio выше',
        'не смог отказаться от проекта “убить легаси” в другой компании',
        'решил открыть свою студию кода и кофе',
        'переходит в продукт, где декомпозиция — вид спорта',
        'уезжает строить метавселенную из фич',
        'продаёт курс “Как увольняться красиво”',
        'решил стать евангелистом TDD и тоскует по сцене'
    ],
    ignored: [
        'говорил о проблемах, но стена молчала',
        'достучаться до менеджмента не смог, зато до выхода смог',
        'решил не ждать, пока “подумаем” растянется на годы',
        'устал шептать в пустоту о повышении',
        'снял с доски “подумать позже” и ушёл с ней',
        'считает, что его предупреждение ушло в чёрную дыру',
        'последнее письмо осталось без ответа, а resignation — нет',
        'повесил объявление в коридоре, его не заметили — ушёл',
        'решил перестать писать в “общую почту”',
        'понял, что кнопка “эскалировать” не работает'
    ],
    sudden: [
        'получил оффер на Мальдивах, ноут забрал с собой',
        'его похитил конкурент, обещавший макбуки с M9',
        'говорят, ФСБ забрало — теперь он DevOps в тайне',
        'улетел на конференцию и не вернулся',
        'решил стать digital-номадом без обратного билета',
        'влюбился в продукт конкурента и убежал к нему',
        'прямо на daily позвонили из мечты',
        'зашёл на собес “просто посмотреть” и не вернулся',
        'его заметили на митапе и переманили мерчем',
        'увидел новый офис с качелями и исчез'
    ],
    neutral: [
        'переехал в другой город',
        'решил заняться семейным бизнесом',
        'ушёл в долгий отпуск по уходу за котом',
        'сменил сферу на преподавание',
        'решил попробовать силы в музыке',
        'ушёл учиться на психолога для разработчиков',
        'просто хотел перемен',
        'сказал “было весело” и ушёл к закату',
        'решил стать баристой по призванию',
        'открыл мастерскую по ремонту клавиатур',
        'отправился в кругосветку с ноутбуком',
        'нашёл себя в волонтёрстве',
        'решил получить второе высшее',
        'уехал растить детей и деревья'
    ],
    sad: [
        'выгорел так сильно, что перестал верить в ночные сборки',
        'сказал “я устал” и отключил все уведомления',
        'устал чинить чужие ошибки и ушёл чинить себя',
        'решил поставить здоровье выше дедлайнов',
        'забрал Zeplin с собой и ушёл в тишину',
        'попросил уважать его границы — теперь у него граница в другой компании'
    ]
};

function hasLocalStorage() {
    try {
        return typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null;
    } catch (error) {
        console.warn('localStorage unavailable', error);
        return false;
    }
}

function cloneInitialState() {
    const clone = JSON.parse(JSON.stringify(GAME_DATA.initialState));
    clone.schemaVersion = SCHEMA_VERSION;
    if (!Array.isArray(clone.log)) {
        clone.log = [];
    }
    if (typeof clone.lastEmployeeId !== 'number') {
        clone.lastEmployeeId = 0;
    }
    clone.economy = { ...DEFAULT_ECONOMY, ...(clone.economy || {}) };
    return clone;
}

function loadState() {
    const fallback = cloneInitialState();
    if (!hasLocalStorage()) {
        return fallback;
    }
    try {
        const raw = window.localStorage.getItem(SAVE_KEY);
        if (!raw) {
            return fallback;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return fallback;
        }
        if (parsed.schemaVersion !== SCHEMA_VERSION) {
            return fallback;
        }
        const merged = { ...fallback, ...parsed };
        merged.log = Array.isArray(merged.log) ? merged.log : [];
        merged.economy = { ...DEFAULT_ECONOMY, ...(merged.economy || {}) };
        merged.lastEmployeeId = typeof merged.lastEmployeeId === 'number' ? merged.lastEmployeeId : 0;
        return merged;
    } catch (error) {
        console.warn('Failed to load state, fallback to defaults.', error);
        return fallback;
    }
}

function saveState(state) {
    if (!hasLocalStorage()) {
        return;
    }
    try {
        const payload = { ...state, schemaVersion: SCHEMA_VERSION };
        window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn('Failed to save state', error);
    }
}

class Game {
    constructor() {
        this.state = loadState();
        this.commands = {};
        this.employeeIdPendingFire = null;
        this.employeeIdPendingStats = null;
        this.ensureStateShape();
        this.initCommands();
    }

    ensureStateShape() {
        if (!this.state || typeof this.state !== 'object') {
            this.state = cloneInitialState();
        }
        this.state.log = Array.isArray(this.state.log) ? this.state.log : [];
        this.state.employees = Array.isArray(this.state.employees) ? this.state.employees : [];
        this.state.projects = Array.isArray(this.state.projects) ? this.state.projects : [];
        this.state.economy = { ...DEFAULT_ECONOMY, ...(this.state.economy || {}) };
        this.state.lastEmployeeId = typeof this.state.lastEmployeeId === 'number' ? this.state.lastEmployeeId : 0;

        this.state.employees.forEach(employee => {
            employee.baseSalary = typeof employee.baseSalary === 'number' ? employee.baseSalary : employee.salary || 0;
            employee.currentSalary = typeof employee.currentSalary === 'number' ? employee.currentSalary : employee.baseSalary;
            employee.marketSalary = typeof employee.marketSalary === 'number' ? employee.marketSalary : employee.baseSalary;
            employee.eventLog = Array.isArray(employee.eventLog)
                ? employee.eventLog
                : (Array.isArray(employee.events) ? employee.events : []);
            if (employee.eventLog.length > EMPLOYEE_EVENT_LIMIT) {
                employee.eventLog.splice(0, employee.eventLog.length - EMPLOYEE_EVENT_LIMIT);
            }
            employee.behaviorProfile = employee.behaviorProfile || this.generateBehaviorProfile(employee.type);
            employee.moodScore = typeof employee.moodScore === 'number' ? employee.moodScore : 0;
            employee.warning = employee.warning || null;
            employee.pendingDeparture = employee.pendingDeparture || null;
            employee.weeksSinceWarning = typeof employee.weeksSinceWarning === 'number' ? employee.weeksSinceWarning : 0;
            employee.lastSalaryChangeWeek = typeof employee.lastSalaryChangeWeek === 'number'
                ? employee.lastSalaryChangeWeek
                : this.state.currentWeek || 1;
            if (!employee.roleLabel) {
                const typeRef = GAME_DATA.employeeTypes.find(type => type.type === employee.type);
                employee.roleLabel = typeRef ? typeRef.label : employee.type;
            }
        });

        this.state.projects.forEach(project => {
            project.baseReward = typeof project.baseReward === 'number' ? project.baseReward : project.reward || 0;
            project.currentReward = typeof project.currentReward === 'number' ? project.currentReward : project.baseReward;
            project.progress = typeof project.progress === 'number' ? project.progress : 0;
            project.remainingDuration = typeof project.remainingDuration === 'number' ? project.remainingDuration : project.duration;
            project.currentSkillPoints = typeof project.currentSkillPoints === 'number' ? project.currentSkillPoints : 0;
            project.skillPointsNeeded = typeof project.skillPointsNeeded === 'number'
                ? project.skillPointsNeeded
                : (project.requiredSkills?.coding || 0) * (project.duration || 1);
        });
    }

    initCommands() {
        this.commands.help = this.cmdHelp.bind(this);
        this.commands.status = this.cmdStatus.bind(this);
        this.commands.hire = this.cmdHire.bind(this);
        this.commands.project = this.cmdProject.bind(this);
        this.commands.nextweek = this.cmdNextWeek.bind(this);
        this.commands.reset = this.cmdReset.bind(this);
    }

    generateBehaviorProfile(type) {
        const base = { positive: 0.35, negative: 0.2 };
        if (type === 'junior-dev') {
            base.positive = 0.3;
            base.negative = 0.3;
        } else if (type === 'senior-dev') {
            base.positive = 0.45;
            base.negative = 0.15;
        }
        const positive = Math.min(0.8, Math.max(0.1, base.positive + (Math.random() - 0.5) * 0.2));
        const negative = Math.min(0.6, Math.max(0.05, base.negative + (Math.random() - 0.5) * 0.15));
        return {
            positiveBias: positive,
            negativeBias: negative
        };
    }

    pickRandom(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return '';
        }
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    composeDepartureReason(baseReason = '', sudden = false) {
        const lower = (baseReason || '').toLowerCase();
        if (sudden) {
            return this.pickRandom(DEPARTURE_REASONS.sudden);
        }
        if (lower.includes('зарплат') || lower.includes('оффер') || lower.includes('еда')) {
            return this.pickRandom(DEPARTURE_REASONS.salary);
        }
        if (lower.includes('выгор')) {
            return this.pickRandom(DEPARTURE_REASONS.burnout);
        }
        if (lower.includes('игнор') || lower.includes('предупреж')) {
            return this.pickRandom(DEPARTURE_REASONS.ignored);
        }
        if (lower.includes('долго')) {
            return this.pickRandom(DEPARTURE_REASONS.neutral);
        }
        if (Math.random() < 0.2) {
            return this.pickRandom(DEPARTURE_REASONS.sad);
        }
        if (Math.random() < 0.5) {
            return this.pickRandom(DEPARTURE_REASONS.growth);
        }
        return this.pickRandom(DEPARTURE_REASONS.neutral);
    }

    describeMood(moodScore) {
        const mood = Number(moodScore || 0);
        for (const state of SATISFACTION_DESCRIPTIONS) {
            if (mood >= state.min) {
                return `${state.text} (${mood.toFixed(0)})`;
            }
        }
        return `на грани побега (${mood.toFixed(0)})`;
    }

    getMoodClass(moodScore) {
        const mood = Number(moodScore || 0);
        if (mood >= 30) return 'mood-good';
        if (mood >= -10) return 'mood-neutral';
        return 'mood-bad';
    }

    init() {
        const hadLog = this.restoreLog();
        if (!hadLog) {
            this.print('Добро пожаловать в Terminal IT Empire!');
            this.print('Постройте лучшую студию: нанимайте специалистов и закрывайте проекты.');
            this.print('Введите help, чтобы увидеть список команд.');
        }
        this.refreshAllPanels();
    }

    print(message, type = 'info') {
        this.appendLogEntry(message, type, { store: true });
    }

    handleCommand(input) {
        const normalized = (input || '').trim();
        if (!normalized) {
            return;
        }

        if (this.state.gameOver && normalized.toLowerCase() !== 'reset') {
            this.print('Игра завершена. Введите reset, чтобы начать заново.');
            return;
        }

        const parts = normalized.toLowerCase().split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        this.print(`$ ${normalized}`);

        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            this.print(`Неизвестная команда: ${command}. Введите help для подсказки.`, 'warning');
        }
        this.refreshAllPanels();
    }

    cmdHelp() {
        this.print('Доступные команды:');
        this.print('  help — показать это окно помощи');
        this.print('  status — вывести состояние компании');
        this.print('  hire <тип> — нанять сотрудника (например, hire junior-dev)');
        this.print('  project <название> — взять проект (например, project Simple Landing Page)');
        this.print('  nextweek — перейти к следующей неделе');
        this.print('  reset — начать игру заново');
    }

    cmdStatus() {
        this.print('-- Статус компании --');
        this.print(`Неделя: ${this.state.currentWeek}`);
        this.print(`Баланс: $${this.formatMoney(this.state.money)}`);
        this.print(`Репутация: ${this.state.reputation}`);

        this.print('Сотрудники:');
        if (this.state.employees.length === 0) {
            this.print('  Пока никого не наняли.');
        } else {
            this.state.employees.forEach(emp => {
                this.print(
                    `  - ${emp.name} (${emp.roleLabel}), зарплата $${this.formatMoney(emp.currentSalary)}; ` +
                    `навыки Coding ${emp.skills.coding}, Bugfixing ${emp.skills.bugfixing}`
                );
            });
        }

        this.print('Активные проекты:');
        if (this.state.projects.length === 0) {
            this.print('  Нет проектов в работе.');
        } else {
            this.state.projects.forEach(proj => {
                this.print(
                    `  - ${proj.name}: прогресс ${proj.progress.toFixed(1)}%, осталось ${Math.max(proj.remainingDuration, 0)} нед.`
                );
            });
        }
    }

    cmdHire(args) {
        if (args.length < 1) {
            this.print('Использование: hire <тип>', 'warning');
            return;
        }

        const typeName = args[0];
        const employeeData = GAME_DATA.employeeTypes.find(type => type.type === typeName);
        if (!employeeData) {
            this.print(`Неизвестный тип сотрудника: ${typeName}`, 'error');
            return;
        }

        const hireCost = this.getScaledEmployeeCost(employeeData.baseCost);
        if (this.state.money < hireCost) {
            this.print(`Недостаточно денег. Нужна сумма $${this.formatMoney(hireCost)}.`, 'error');
            return;
        }

        if (this.state.reputation < employeeData.minReputation) {
            this.print(`Нужна репутация ${employeeData.minReputation}+ для найма ${employeeData.label}.`, 'error');
            return;
        }

        const randomName = employeeData.nameOptions[Math.floor(Math.random() * employeeData.nameOptions.length)];
        const marketSalary = this.getScaledSalary(employeeData.baseSalary);
        const newEmployee = {
            id: ++this.state.lastEmployeeId,
            name: randomName,
            type: employeeData.type,
            roleLabel: employeeData.label,
            baseSalary: employeeData.baseSalary,
            currentSalary: marketSalary,
            marketSalary,
            skills: { ...employeeData.skills },
            eventLog: [],
            behaviorProfile: this.generateBehaviorProfile(employeeData.type),
            moodScore: 0,
            warning: null,
            pendingDeparture: null,
            weeksSinceWarning: 0,
            lastSalaryChangeWeek: this.state.currentWeek
        };

        this.state.money -= hireCost;
        this.state.employees.push(newEmployee);
        this.print(`Нанят сотрудник ${newEmployee.name} (${newEmployee.roleLabel}).`, 'success');
    }

    cmdProject(args) {
        if (args.length < 1) {
            this.print('Использование: project <название проекта>', 'warning');
            return;
        }

        const projectName = args.join(' ').toLowerCase();
        const projectData = GAME_DATA.projectTypes.find(
            proj => proj.name.toLowerCase() === projectName
        );
        if (!projectData) {
            this.print(`Неизвестный проект: ${projectName}`, 'error');
            return;
        }

        if (this.state.projects.some(proj => proj.name.toLowerCase() === projectName)) {
            this.print(`Проект "${projectData.name}" уже выполняется.`, 'warning');
            return;
        }

        if (this.state.reputation < projectData.minReputation) {
            this.print(`Для проекта нужна репутация ${projectData.minReputation}+.`, 'error');
            return;
        }

        const totalSkills = this.calculateTotalSkills();
        const missingSkills = [];
        Object.keys(projectData.requiredSkills).forEach(skill => {
            if (totalSkills[skill] < projectData.requiredSkills[skill]) {
                missingSkills.push(
                    `${skill}: требуется ${projectData.requiredSkills[skill]}, у команды ${totalSkills[skill]}`
                );
            }
        });

        if (missingSkills.length > 0) {
            this.print(`Недостаточно навыков для проекта "${projectData.name}":`, 'error');
            missingSkills.forEach(msg => this.print(`  - ${msg}`));
            return;
        }

        const rewardValue = this.getScaledProjectReward(projectData.baseReward);
        const newProject = {
            id: this.state.projects.length + 1,
            name: projectData.name,
            description: projectData.description,
            requiredSkills: { ...projectData.requiredSkills },
            duration: projectData.duration,
            remainingDuration: projectData.duration,
            baseReward: projectData.baseReward,
            currentReward: rewardValue,
            reputationGain: projectData.reputationGain,
            progress: 0,
            skillPointsNeeded: projectData.requiredSkills.coding * projectData.duration,
            currentSkillPoints: 0
        };

        this.state.projects.push(newProject);
        this.print(`Проект "${projectData.name}" запущен.`, 'success');
    }

    cmdNextWeek() {
        if (this.state.gameOver) {
            this.print('Игра завершена. Введите reset для перезапуска.', 'warning');
            return;
        }

        this.state.currentWeek += 1;
        this.print(`-- Начинается неделя ${this.state.currentWeek} --`);

        const totalSalaries = this.state.employees.reduce((sum, emp) => sum + (emp.currentSalary || 0), 0);
        if (totalSalaries > 0) {
            this.state.money -= totalSalaries;
            this.print(`Выплачено зарплат на $${this.formatMoney(totalSalaries)}.`, 'warning');
        }

        const totalSkills = this.calculateTotalSkills();
        this.state.projects.forEach(project => {
            if (project.remainingDuration <= 0) {
                return;
            }
            const skillContribution = (totalSkills.coding * 1) + (totalSkills.bugfixing * 0.5);
            project.currentSkillPoints += skillContribution;
            const ratio = project.skillPointsNeeded > 0 ? project.currentSkillPoints / project.skillPointsNeeded : 1;
            project.progress = Math.min(100, ratio * 100);
            if (project.progress >= 100) {
                project.remainingDuration = 0;
            } else {
                project.remainingDuration = Math.max(0, project.remainingDuration - 1);
            }
            this.print(
                `Прогресс "${project.name}": ${project.progress.toFixed(0)}%, осталось ${project.remainingDuration} нед.`
            );
        });

        this.state.projects = this.state.projects.filter(project => {
            if (project.remainingDuration <= 0 && project.progress >= 100) {
                const rewardValue = project.currentReward || project.baseReward || 0;
                this.state.money += rewardValue;
                this.state.reputation += project.reputationGain;
                this.print(
                    `Проект "${project.name}" завершён! Получено $${this.formatMoney(rewardValue)} и +${project.reputationGain} репутации.`,
                    'success'
                );
                return false;
            }
            return true;
        });

        this.processEmployeeEvents();
        this.processGlobalEvent();
        this.evaluateWinLose();
        this.refreshAllPanels();
    }

    cmdReset() {
        terminalOutput.innerHTML = '';
        if (hasLocalStorage()) {
            window.localStorage.removeItem(SAVE_KEY);
        }
        this.state = cloneInitialState();
        this.ensureStateShape();
        this.init();
    }

    processEmployeeEvents() {
        this.state.employees.forEach(employee => {
            const event = this.createEmployeeEvent(employee);
            if (!event) {
                this.updateEmployeeMood(employee, null);
                this.evaluateEmployeeRetention(employee);
                return;
            }
            this.applyEmployeeEvent(employee, event);
            this.updateEmployeeMood(employee, event);
            this.evaluateEmployeeRetention(employee);
        });
    }

    createEmployeeEvent(employee) {
        const profile = employee.behaviorProfile || this.generateBehaviorProfile(employee.type);
        const roll = Math.random();
        const negativeThreshold = profile.negativeBias;
        const positiveThreshold = profile.negativeBias + profile.positiveBias;

        if (roll < negativeThreshold) {
            const template = EMPLOYEE_NEGATIVE_EVENTS[Math.floor(Math.random() * EMPLOYEE_NEGATIVE_EVENTS.length)];
            return { ...template, type: 'negative' };
        }
        if (roll < positiveThreshold) {
            const template = EMPLOYEE_POSITIVE_EVENTS[Math.floor(Math.random() * EMPLOYEE_POSITIVE_EVENTS.length)];
            return { ...template, type: 'positive' };
        }
        if (Math.random() < 0.4) {
            const message = EMPLOYEE_NEUTRAL_EVENTS[Math.floor(Math.random() * EMPLOYEE_NEUTRAL_EVENTS.length)];
            return { message, type: 'neutral' };
        }
        return null;
    }

    applyEmployeeEvent(employee, event) {
        if (event.moneyChange) {
            this.state.money += event.moneyChange;
        }
        if (event.reputationChange) {
            this.state.reputation += event.reputationChange;
        }

        this.recordEmployeeEvent(employee, {
            week: this.state.currentWeek,
            type: event.type,
            message: event.message,
            moneyChange: event.moneyChange || 0,
            reputationChange: event.reputationChange || 0
        });

        const tone = event.type === 'positive' ? 'success' : event.type === 'negative' ? 'warning' : 'info';
        const deltas = [];
        if (event.moneyChange) {
            const amount = `$${this.formatMoney(Math.abs(event.moneyChange))}`;
            deltas.push(`${event.moneyChange > 0 ? '+' : '-'}${amount}`);
        }
        if (event.reputationChange) {
            deltas.push(`репутация ${event.reputationChange > 0 ? '+' : ''}${event.reputationChange}`);
        }
        const suffix = deltas.length ? ` (${deltas.join(', ')})` : '';
        this.print(`[${employee.name}] ${event.message}${suffix}`, tone);
    }

    recordEmployeeEvent(employee, entry) {
        employee.eventLog = Array.isArray(employee.eventLog) ? employee.eventLog : [];
        employee.eventLog.push(entry);
        if (employee.eventLog.length > EMPLOYEE_EVENT_LIMIT) {
            employee.eventLog.splice(0, employee.eventLog.length - EMPLOYEE_EVENT_LIMIT);
        }
    }

    updateEmployeeMood(employee, event) {
        const salaryRatio = employee.currentSalary / Math.max(employee.marketSalary || employee.baseSalary || 1, 1);
        let salaryContribution = (salaryRatio - 1) * 70; // сильнее влияние
        if (salaryRatio >= 1.5) {
            salaryContribution += 25;
        } else if (salaryRatio >= 1.25) {
            salaryContribution += 15;
        }
        if (salaryRatio < 0.8) {
            salaryContribution -= 25;
        }
        let eventContribution = 0;
        if (event) {
            if (event.type === 'positive') eventContribution = 25;
            if (event.type === 'negative') eventContribution = -35;
            if (event.type === 'neutral') eventContribution = 5;
        }
        employee.moodScore = Math.max(-100, Math.min(100, (employee.moodScore || 0) * 0.4 + salaryContribution + eventContribution));
        if (salaryRatio >= 1.25 && (employee.warning || employee.pendingDeparture)) {
            employee.warning = null;
            employee.pendingDeparture = null;
            employee.weeksSinceWarning = 0;
        }
    }

    evaluateEmployeeRetention(employee) {
        const mood = employee.moodScore || 0;
        if (employee.pendingDeparture) {
            employee.pendingDeparture.weeks += 1;
            if (employee.pendingDeparture.weeks >= employee.pendingDeparture.timeout) {
                this.forceEmployeeDeparture(employee, employee.pendingDeparture.reason || 'Слишком долго игнорировали запрос.');
                employee.pendingDeparture = null;
                return;
            }
        }

        if (employee.warning) {
            employee.weeksSinceWarning += 1;
            if (mood > 10) {
                this.print(`[${employee.name}] успокоился и остался в команде.`, 'info');
                employee.warning = null;
                employee.weeksSinceWarning = 0;
            } else if (employee.weeksSinceWarning >= 3) {
                if (!employee.pendingDeparture) {
                    employee.pendingDeparture = { weeks: 0, timeout: 2, reason: 'Предупреждение игнорировалось.' };
                    this.print(`[${employee.name}] готовится к уходу, осталось мало времени.`, 'warning');
                }
            }
        }

        if (mood < -40 && !employee.warning && Math.random() < 0.7) {
            this.issueWarning(employee);
        } else if (mood < -70 && Math.random() < 0.3) {
            this.forceEmployeeDeparture(employee, 'Сотрудник внезапно ушёл (предложение от другой компании).', true);
        }
    }

    issueWarning(employee) {
        employee.warning = {
            week: this.state.currentWeek,
            source: this.pickRandom(WARNING_SOURCES)
        };
        employee.weeksSinceWarning = 0;
        this.recordEmployeeEvent(employee, {
            week: this.state.currentWeek,
            type: 'warning',
            message: `Предупреждение об уходе (${employee.warning.source}).`,
            moneyChange: 0,
            reputationChange: 0
        });
        this.print(`[${employee.name}] сигнализирует о желании уволиться (${employee.warning.source}).`, 'warning');
        this.showNotification({
            title: `${employee.name} недоволен`,
            message: employee.warning.source,
            tone: 'warning'
        });
    }

    forceEmployeeDeparture(employee, reason, sudden = false) {
        const finalReason = this.composeDepartureReason(reason, sudden);
        this.recordEmployeeEvent(employee, {
            week: this.state.currentWeek,
            type: 'system',
            message: sudden ? `Внезапное увольнение: ${finalReason}` : `Уволился: ${finalReason}`,
            moneyChange: 0,
            reputationChange: sudden ? -5 : -2
        });
        if (sudden) {
            this.state.reputation = Math.max(0, this.state.reputation - 3);
        }
        this.print(`[${employee.name}] уволился. Причина: ${finalReason}`, 'error');
        this.showNotification({
            title: `${employee.name} ушёл`,
            message: finalReason,
            tone: 'error'
        });
        this.state.employees = this.state.employees.filter(emp => emp.id !== employee.id);
    }

    processGlobalEvent() {
        const chance = 0.3 + (this.state.reputation / 100) * 0.2;
        if (Math.random() >= chance) {
            return;
        }

        const event = GAME_DATA.events[Math.floor(Math.random() * GAME_DATA.events.length)];
        if (this.state.reputation > 40 && event.type === 'negative' && Math.random() < 0.5) {
            this.print(`Благодаря репутации удалось избежать события: "${event.message}".`, 'info');
            return;
        }

        if (this.state.reputation < 20 && event.type === 'positive' && Math.random() < 0.5) {
            this.print(`Низкая репутация не позволила получить бонус: "${event.message}".`, 'warning');
            return;
        }

        this.print(`Событие: ${event.message}`, event.type === 'positive' ? 'success' : 'warning');
        if (event.moneyChange) {
            this.state.money += event.moneyChange;
        }
        if (event.reputationChange) {
            this.state.reputation += event.reputationChange;
        }
    }

    evaluateWinLose() {
        if (this.state.money < 0) {
            this.print('Компания обанкротилась. Денег нет.', 'error');
            this.state.gameOver = true;
        } else if (this.state.reputation < 0) {
            this.print('Репутация разрушена — клиенты ушли.', 'error');
            this.state.gameOver = true;
        }

        const WIN_MONEY = 50000;
        const WIN_REPUTATION = 100;
        if (!this.state.gameOver && this.state.money >= WIN_MONEY && this.state.reputation >= WIN_REPUTATION) {
            this.print(`Победа! На счету $${this.formatMoney(this.state.money)} и ${this.state.reputation} репутации.`, 'success');
            this.state.gameOver = true;
        }

        if (this.state.gameOver) {
            this.print('Игра завершена. Введите reset или обновите страницу.', 'info');
        }
    }

    calculateTotalSkills() {
        const totals = { coding: 0, bugfixing: 0 };
        this.state.employees.forEach(emp => {
            totals.coding += emp.skills.coding;
            totals.bugfixing += emp.skills.bugfixing;
        });
        return totals;
    }

    renderGameStats() {
        statWeek.textContent = this.state.currentWeek;
        statMoney.textContent = this.formatMoney(this.state.money);
        statReputation.textContent = this.state.reputation;
    }

    renderHiredEmployees() {
        hiredEmployeesList.innerHTML = '';
        if (this.state.employees.length === 0) {
            hiredEmployeesList.innerHTML = '<p class="empty-placeholder">Ещё никто не нанят.</p>';
            return;
        }

        const emojiMap = {
            'junior-dev': '👶💻',
            'mid-dev': '🧑‍💻',
            'senior-dev': '🧙‍💻'
        };

        this.state.employees.forEach(emp => {
            const container = document.createElement('div');
            container.classList.add('employee-item');

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('fire-employee-trigger');
            removeBtn.innerHTML = '&times;';
            removeBtn.setAttribute('aria-label', `Уволить ${emp.name}`);
            removeBtn.addEventListener('click', event => {
                event.stopPropagation();
                this.openFireModal(emp);
            });

            const emojiSpan = document.createElement('span');
            emojiSpan.classList.add('emoji');
            emojiSpan.textContent = emojiMap[emp.type] || '👤';

            const infoBlock = document.createElement('div');
            infoBlock.classList.add('employee-info');
            infoBlock.innerHTML = `
                <div class="employee-name">${emp.name}</div>
                <div class="employee-role">${emp.roleLabel}</div>
                <div class="employee-salary">$${this.formatMoney(emp.currentSalary)}/нед</div>
                <div class="employee-skills">Навыки: <br> Coding ${emp.skills.coding}, Bugfixing ${emp.skills.bugfixing}</div>
            `;

            const actions = document.createElement('div');
            actions.classList.add('employee-actions');
            const statsBtn = document.createElement('button');
            statsBtn.classList.add('employee-stats-btn');
            statsBtn.textContent = 'Статистика';
            statsBtn.type = 'button';
            statsBtn.title = 'Открыть статистику';
            statsBtn.addEventListener('click', event => {
                event.stopPropagation();
                this.openEmployeeStats(emp);
            });
            actions.appendChild(statsBtn);

            container.appendChild(removeBtn);
            container.appendChild(emojiSpan);
            container.appendChild(infoBlock);
            container.appendChild(actions);
            hiredEmployeesList.appendChild(container);
        });
    }

    renderActiveProjects() {
        activeProjectsList.innerHTML = '';
        if (this.state.projects.length === 0) {
            activeProjectsList.innerHTML = '<p class="empty-placeholder">Активных проектов нет.</p>';
            return;
        }

        this.state.projects.forEach(project => {
            const item = document.createElement('div');
            item.classList.add('active-project-item');
            item.innerHTML = `
                <div class="project-name">${project.name}</div>
                <div class="project-progress">Прогресс: ${project.progress.toFixed(0)}%</div>
                <div class="project-eta">Осталось недель: ${Math.max(project.remainingDuration, 0)}</div>
                <div class="project-reward">Награда: $${this.formatMoney(project.currentReward)}</div>
            `;
            activeProjectsList.appendChild(item);
        });
    }

    renderHirePanel() {
        hirePanel.innerHTML = '<h2>Нанять сотрудника</h2><div class="panel-content-scroll"></div>';
        const panelContent = hirePanel.querySelector('.panel-content-scroll');

        GAME_DATA.employeeTypes.forEach(type => {
            const hireCost = this.getScaledEmployeeCost(type.baseCost);
            const marketSalary = this.getScaledSalary(type.baseSalary);
            const card = document.createElement('div');
            card.classList.add('employee-card');

            let disabled = false;
            let reason = '';
            if (this.state.money < hireCost) {
                disabled = true;
                reason = 'Недостаточно денег';
            } else if (this.state.reputation < type.minReputation) {
                disabled = true;
                reason = `Нужна репутация ${type.minReputation}+`;
            }

            if (disabled) {
                card.classList.add('disabled');
            } else {
                card.addEventListener('click', () => this.handleCommand(`hire ${type.type}`));
            }

            card.innerHTML = `
                <div class="employee-card-header">
                    <h3>${type.label}</h3>
                    <span class="employee-type-tag">${type.type}</span>
                </div>
                <p>Стоимость найма: $${this.formatMoney(hireCost)}</p>
                <p>Рыночная зарплата: $${this.formatMoney(marketSalary)}/нед</p>
                <p class="skills">Навыки: Coding ${type.skills.coding}, Bugfixing ${type.skills.bugfixing}</p>
                ${disabled ? `<p class="error">${reason}</p>` : ''}
            `;

            panelContent.appendChild(card);
        });
    }

    renderProjectsPanel() {
        projectsPanel.innerHTML = '<h2>Доступные проекты</h2><div class="projects-grid"></div>';
        const grid = projectsPanel.querySelector('.projects-grid');
        const totalSkills = this.calculateTotalSkills();

        GAME_DATA.projectTypes.forEach(projectType => {
            const rewardValue = this.getScaledProjectReward(projectType.baseReward);
            const card = document.createElement('div');
            card.classList.add('project-card', `${projectType.size}-project`);

            let disabled = false;
            let reason = '';
            const missing = [];

            if (this.state.projects.some(project => project.name === projectType.name)) {
                disabled = true;
                reason = 'Проект уже выполняется';
            }

            if (!disabled && this.state.reputation < projectType.minReputation) {
                disabled = true;
                reason = `Нужна репутация ${projectType.minReputation}+`;
            }

            Object.keys(projectType.requiredSkills).forEach(skill => {
                if (totalSkills[skill] < projectType.requiredSkills[skill]) {
                    disabled = true;
                    missing.push(`${skill}: нужно ${projectType.requiredSkills[skill]}, есть ${totalSkills[skill]}`);
                }
            });

            if (disabled) {
                card.classList.add('disabled');
            } else {
                card.addEventListener('click', () => this.handleCommand(`project ${projectType.name}`));
            }

            card.innerHTML = `
                <div class="project-icon">${projectType.icon}</div>
                <h3>${projectType.name}</h3>
                <p>${projectType.description}</p>
                <p class="skills-req">Навыки: <br> Coding ${projectType.requiredSkills.coding}, Bugfixing ${projectType.requiredSkills.bugfixing}</p>
                <p>Длительность: ${projectType.duration} нед.</p>
                <p>Награда: $${this.formatMoney(rewardValue)}, репутация: +${projectType.reputationGain}</p>
                ${reason ? `<p class="error">${reason}</p>` : ''}
                ${missing.length && !reason ? `<p class="error">Недостаёт: ${missing.join(', ')}</p>` : ''}
            `;

            grid.appendChild(card);
        });
    }

    openEmployeeStats(employee) {
        if (globalStatsModal && globalStatsModal.classList.contains('visible')) {
            this.closeGlobalStatsModal();
        }
        this.employeeIdPendingStats = employee.id;
        this.renderEmployeeModal(employee);
        employeeStatsModal.classList.add('visible');
        employeeStatsModal.setAttribute('aria-hidden', 'false');
    }

    renderEmployeeModal(employee) {
        employeeModalName.textContent = employee.name;
        employeeModalRole.textContent = employee.roleLabel;
        employeeModalCurrentSalary.textContent = this.formatMoney(employee.currentSalary);
        employeeModalMarketSalary.textContent = this.formatMoney(employee.marketSalary);
        employeeSalaryInput.value = employee.currentSalary;
        employeeModalMood.textContent = this.describeMood(employee.moodScore || 0);
        if (employee.warning) {
            employeeModalWarning.textContent = `Есть предупреждение: ${employee.warning.source}`;
            employeeModalWarning.classList.add('warning-active');
        } else {
            employeeModalWarning.textContent = 'Предупреждений нет.';
            employeeModalWarning.classList.remove('warning-active');
        }
        if (employeeSalaryError) {
            employeeSalaryError.textContent = '';
        }
        this.renderEmployeeEventsList(employee);
    }

    renderEmployeeEventsList(employee) {
        employeeEventsList.innerHTML = '';
        const events = Array.isArray(employee.eventLog) ? [...employee.eventLog] : [];
        if (events.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'Пока нет событий для этого сотрудника.';
            emptyItem.classList.add('employee-event-item', 'neutral');
            employeeEventsList.appendChild(emptyItem);
            return;
        }
        events.slice().reverse().forEach(entry => {
            const item = document.createElement('li');
            item.classList.add('employee-event-item', entry.type || 'neutral');
            const details = [];
            if (entry.moneyChange) {
                details.push(`$${this.formatMoney(entry.moneyChange)}`);
            }
            if (entry.reputationChange) {
                details.push(`репутация ${entry.reputationChange > 0 ? '+' : ''}${entry.reputationChange}`);
            }
            const weekLabel = entry.week == null ? '—' : entry.week;
            item.innerHTML = `
                <span class="event-week">Неделя ${weekLabel}</span>
                <div class="event-message">${entry.message}</div>
                ${details.length ? `<div class="event-details">${details.join(', ')}</div>` : ''}
            `;
            employeeEventsList.appendChild(item);
        });
    }

    renderGlobalStatsList() {
        if (!globalStatsList) {
            return;
        }
        globalStatsList.innerHTML = '';
        if (this.state.employees.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = 'Нет сотрудников. Наймите кого-нибудь, чтобы не работать в одиночку.';
            globalStatsList.appendChild(empty);
            return;
        }
        this.state.employees.forEach(emp => {
            const card = document.createElement('div');
            card.classList.add('global-stats-item');
            const mood = emp.moodScore || 0;
            const warningBadge = emp.warning ? `<span class="status-badge status-warning">Есть предупреждение</span>` : '';
            const pendingBadge = emp.pendingDeparture ? `<span class="status-badge status-pending">Готовится к уходу</span>` : '';
            card.innerHTML = `
                <div class="global-stats-header">
                    <strong>${emp.name}</strong>
                    <span class="mood-chip ${this.getMoodClass(mood)}">${this.describeMood(mood)}</span>
                </div>
                <div class="global-stats-footer">
                    <span>Роль: ${emp.roleLabel}</span>
                    <span>Зарплата: $${this.formatMoney(emp.currentSalary)}/нед</span>
                    <span>Рыночная: $${this.formatMoney(emp.marketSalary)}/нед</span>
                    ${warningBadge}${pendingBadge}
                </div>
                <div class="global-stats-actions">
                    <button class="employee-stats-btn small" data-employee-id="${emp.id}">Подробно</button>
                </div>
            `;
            const openBtn = card.querySelector('.global-stats-actions .employee-stats-btn');
            openBtn.addEventListener('click', () => this.openEmployeeStats(emp));
            globalStatsList.appendChild(card);
        });
    }

    openGlobalStatsModal() {
        this.renderGlobalStatsList();
        if (!globalStatsModal) {
            return;
        }
        globalStatsModal.classList.add('visible');
        globalStatsModal.setAttribute('aria-hidden', 'false');
    }

    closeGlobalStatsModal() {
        if (!globalStatsModal) {
            return;
        }
        globalStatsModal.classList.remove('visible');
        globalStatsModal.setAttribute('aria-hidden', 'true');
    }

    closeEmployeeStatsModal() {
        this.employeeIdPendingStats = null;
        employeeStatsModal.classList.remove('visible');
        employeeStatsModal.setAttribute('aria-hidden', 'true');
    }

    getMinimumSalary(employee) {
        const base = employee.marketSalary || employee.baseSalary || 0;
        return Math.max(50, Math.round(base * 0.8));
    }

    handleEmployeeSalarySave() {
        if (this.employeeIdPendingStats === null) {
            return;
        }
        const employee = this.state.employees.find(emp => emp.id === this.employeeIdPendingStats);
        if (!employee) {
            this.closeEmployeeStatsModal();
            return;
        }
        const newSalary = Number(employeeSalaryInput.value);
        if (!Number.isFinite(newSalary) || newSalary <= 0) {
            this.print('Укажите корректную зарплату.', 'warning');
            return;
        }
        if (newSalary > this.state.money) {
            this.print('Недостаточно бюджета, чтобы гарантировать такую зарплату.', 'warning');
            return;
        }

        const minAllowed = this.getMinimumSalary(employee);
        if (newSalary < minAllowed) {
            const msg = `Нельзя снижать зарплату ниже $${this.formatMoney(minAllowed)} (80% от рыночной).`;
            if (employeeSalaryError) {
                employeeSalaryError.textContent = msg;
            }
            this.print(msg, 'warning');
            return;
        }
        if (employeeSalaryError) {
            employeeSalaryError.textContent = '';
        }

        const delta = newSalary - employee.currentSalary;
        if (delta === 0) {
            this.print('Зарплата не изменилась.', 'info');
            return;
        }

        employee.currentSalary = newSalary;
        employee.lastSalaryChangeWeek = this.state.currentWeek;
        const ratioToMarket = newSalary / Math.max(employee.marketSalary || 1, 1);
        if (ratioToMarket >= 1.2) {
            employee.moodScore = Math.max(employee.moodScore || 0, 60 + (ratioToMarket - 1.2) * 50);
            employee.warning = null;
            employee.pendingDeparture = null;
            employee.weeksSinceWarning = 0;
        }
        const message = delta > 0
            ? `Зарплата повышена на $${this.formatMoney(delta)}`
            : `Зарплата снижена на $${this.formatMoney(Math.abs(delta))}`;
        this.recordEmployeeEvent(employee, {
            week: this.state.currentWeek,
            type: 'system',
            message,
            moneyChange: 0,
            reputationChange: 0
        });
        this.print(`[${employee.name}] ${message}.`, delta > 0 ? 'success' : 'warning');
        this.renderEmployeeModal(employee);
        this.refreshAllPanels();
    }

    showNotification({ title, message, tone = 'info', timeout = 5000 }) {
        if (!notificationsContainer) {
            return;
        }
        const card = document.createElement('div');
        card.classList.add('notification-card', tone);
        card.innerHTML = `
            <h4>${title}</h4>
            <p>${message}</p>
        `;
        notificationsContainer.appendChild(card);
        setTimeout(() => card.classList.add('hide'), timeout - 400);
        setTimeout(() => card.remove(), timeout);
    }

    refreshAllPanels() {
        this.renderGameStats();
        this.renderHiredEmployees();
        this.renderActiveProjects();
        this.renderHirePanel();
        this.renderProjectsPanel();
        if (globalStatsModal && globalStatsModal.classList.contains('visible')) {
            this.renderGlobalStatsList();
        }
        this.updateControlsState();
        this.persistState();
    }

    getEconomy() {
        return this.state.economy || DEFAULT_ECONOMY;
    }

    getScaledSalary(baseSalary) {
        return Math.round(baseSalary * (this.getEconomy().salaryScale || 1));
    }

    getScaledEmployeeCost(baseCost) {
        return Math.round(baseCost * (this.getEconomy().salaryScale || 1));
    }

    getScaledProjectReward(baseReward) {
        return Math.round(baseReward * (this.getEconomy().projectScale || 1));
    }

    appendLogEntry(message, type = 'info', { store = true } = {}) {
        const line = document.createElement('div');
        line.textContent = message;
        line.classList.add(type);
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;

        if (store) {
            this.state.log.push({ message, type });
            if (this.state.log.length > LOG_LIMIT) {
                this.state.log.splice(0, this.state.log.length - LOG_LIMIT);
            }
            this.persistState();
        }
    }

    restoreLog() {
        terminalOutput.innerHTML = '';
        if (!Array.isArray(this.state.log) || this.state.log.length === 0) {
            return false;
        }
        this.state.log.forEach(entry => {
            this.appendLogEntry(entry.message, entry.type, { store: false });
        });
        return true;
    }

    persistState() {
        saveState(this.state);
    }

    formatMoney(value) {
        return Number(value || 0).toLocaleString('ru-RU');
    }

    updateControlsState() {
        if (this.state.gameOver) {
            terminalInput.disabled = true;
            gameControls.classList.add('disabled');
        } else {
            terminalInput.disabled = false;
            gameControls.classList.remove('disabled');
        }
    }

    fireEmployeeById(employeeId) {
        const index = this.state.employees.findIndex(emp => emp.id === employeeId);
        if (index === -1) {
            this.print(`Сотрудник с ID ${employeeId} не найден.`, 'error');
            return false;
        }
        const [fired] = this.state.employees.splice(index, 1);
        this.print(`Сотрудник ${fired.name} (${fired.roleLabel}) уволен.`, 'warning');
        this.refreshAllPanels();
        return true;
    }

    openFireModal(employee) {
        this.employeeIdPendingFire = employee.id;
        fireConfirmName.textContent = employee.name;
        fireConfirmRole.textContent = employee.roleLabel;
        fireConfirmModal.classList.add('visible');
        fireConfirmModal.setAttribute('aria-hidden', 'false');
    }

    closeFireModal() {
        this.employeeIdPendingFire = null;
        fireConfirmModal.classList.remove('visible');
        fireConfirmModal.setAttribute('aria-hidden', 'true');
    }
}

const game = new Game();

terminalInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        const command = terminalInput.value;
        terminalInput.value = '';
        game.handleCommand(command);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    game.init();

    document.querySelectorAll('.control-btn').forEach(button => {
        button.addEventListener('click', () => {
            const command = button.dataset.command;
            game.handleCommand(command);
        });
    });

    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        setTimeout(() => pageLoader.classList.add('fade-out'), 500);
    }
});

confirmFireBtn.addEventListener('click', () => {
    if (game.employeeIdPendingFire !== null) {
        game.fireEmployeeById(game.employeeIdPendingFire);
    }
    game.closeFireModal();
});

cancelFireBtn.addEventListener('click', () => game.closeFireModal());

fireConfirmModal.addEventListener('click', event => {
    if (event.target === fireConfirmModal) {
        game.closeFireModal();
    }
});

if (openGlobalStatsBtn) {
    openGlobalStatsBtn.addEventListener('click', () => game.openGlobalStatsModal());
}
if (closeGlobalStatsBtn) {
    closeGlobalStatsBtn.addEventListener('click', () => game.closeGlobalStatsModal());
}
if (globalStatsModal) {
    globalStatsModal.addEventListener('click', event => {
        if (event.target === globalStatsModal) {
            game.closeGlobalStatsModal();
        }
    });
}

saveEmployeeSalaryBtn.addEventListener('click', () => game.handleEmployeeSalarySave());
closeEmployeeModalBtn.addEventListener('click', () => game.closeEmployeeStatsModal());
employeeStatsModal.addEventListener('click', event => {
    if (event.target === employeeStatsModal) {
        game.closeEmployeeStatsModal();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        game.closeFireModal();
        game.closeEmployeeStatsModal();
        game.closeGlobalStatsModal();
    }
});
