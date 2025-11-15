const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const gameControls = document.getElementById('game-controls');

const statWeek = document.getElementById('stat-week');
const statMoney = document.getElementById('stat-money');
const statReputation = document.getElementById('stat-reputation');
const winInfoBtn = document.getElementById('win-info-btn');
const winTooltip = document.getElementById('win-tooltip');
let winTooltipPinned = false;
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
const promoteEmployeeBtn = document.getElementById('promote-employee-btn');
const employeePromotionSection = document.getElementById('employee-promotion-section');
const employeePromotionText = document.getElementById('employee-promotion-text');
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
const WIN_MONEY = 1000000;
const WIN_REPUTATION = 5000;

const DEFAULT_ECONOMY = Object.freeze({
    salaryScale: 1,
    projectScale: 1,
    inflationInterval: 10,
    weeksUntilInflation: 10
});
const INFLATION_RATE = 0.05;

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
    'HR сказал \"нам нужно поговорить\"',
    'Нашли записку на холодильнике в офисе',
    'Получили письмо с темой \"не хочу, но надо\"',
    'Сотрудник шепнул DevOps-у, а тот — всем',
    'На ретроспективе внезапно стало тихо',
    'Сотрудник спросил, где тут выход без ключ-карты'
];

const UNDERPERFORMER_STATUSES = [
    'Чувствую себя ничтожеством',
    'Меня, наверное, скоро уволят',
    'Спрятал резюме в ящике стола',
    'Надеваю футболку «я случайно тут»',
    'Если меня ищут — я в углу и паникую',
    'Каждый коммит — как признание вины',
    'Главное, чтобы никто не заметил, что я всё ещё здесь',
    'Пишу код и завещание одновременно',
    'Держусь за стул, потому что больше не за что',
    'Сегодня снова не уволили. Удивительно',
    'Надеюсь, кофе прикроет мои косяки',
    'Делаю вид, что понимаю происходящее',
    'Смотрю на тимлида, как на приговор',
    'Каждый баг — как письмо самому себе',
    'Я тут просто стажёр… уже третий год',
    'Моя цель — не быть худшим сегодня',
    'ЕСЛИ Я УЙДУ, КТО ЖЕ БУДЕТ ВСЁ ЛОМАТЬ?',
    'Подумываю открыть бизнес по извинениям',
    'Секретный план: стать незаметным',
    'Похоже, я снова ближайший кандидат на увольнение'
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
    { min: -101, text: 'написал «пока» в README' }
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
    clone.economy.weeksUntilInflation = clone.economy.weeksUntilInflation ?? clone.economy.inflationInterval;
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
        merged.economy.weeksUntilInflation = merged.economy.weeksUntilInflation ?? merged.economy.inflationInterval;
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
            if (typeof employee.behaviorProfile.lowExpectations !== 'boolean') {
                employee.behaviorProfile.lowExpectations = false;
            }
            if (employee.behaviorProfile.lowExpectations) {
                employee.behaviorProfile.growth = false;
            } else if (typeof employee.behaviorProfile.growth !== 'boolean') {
                employee.behaviorProfile.growth = employee.type !== 'senior-dev' && Math.random() < 0.25;
            }
            employee.moodScore = typeof employee.moodScore === 'number' ? employee.moodScore : 0;
            employee.warning = employee.warning || null;
            employee.pendingDeparture = employee.pendingDeparture || null;
            employee.weeksSinceWarning = typeof employee.weeksSinceWarning === 'number' ? employee.weeksSinceWarning : 0;
            employee.lastSalaryChangeWeek = typeof employee.lastSalaryChangeWeek === 'number'
                ? employee.lastSalaryChangeWeek
                : this.state.currentWeek || 1;
            employee.weeksInRole = typeof employee.weeksInRole === 'number' ? employee.weeksInRole : 0;
            employee.promotionRequest = employee.promotionRequest || null;
            employee.promotionWarning = employee.promotionWarning || null;
            employee.performanceScore = typeof employee.performanceScore === 'number' ? employee.performanceScore : 0;
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
        const profile = {
            positiveBias: 0.35,
            negativeBias: 0.2,
            learningRate: 0.01 + Math.random() * 0.02,
            lowExpectations: false,
            growth: false
        };
        if (type === 'junior-dev') {
            const chaotic = Math.random() < 0.5;
            if (chaotic) {
                profile.positiveBias = 0.15 + Math.random() * 0.1;
                profile.negativeBias = 0.45 + Math.random() * 0.12;
                profile.learningRate = 0.002 + Math.random() * 0.004;
                profile.lowExpectations = true;
            } else {
                profile.positiveBias = 0.5 + Math.random() * 0.1;
                profile.negativeBias = 0.12 + Math.random() * 0.06;
            }
        } else if (type === 'mid-dev') {
            profile.positiveBias = 0.4 + (Math.random() - 0.5) * 0.15;
            profile.negativeBias = 0.2 + (Math.random() - 0.5) * 0.1;
        } else if (type === 'senior-dev') {
            profile.positiveBias = 0.5 + Math.random() * 0.1;
            profile.negativeBias = 0.12 + Math.random() * 0.08;
        }
        profile.positiveBias = Math.min(0.85, Math.max(0.1, profile.positiveBias));
        profile.negativeBias = Math.min(0.6, Math.max(0.05, profile.negativeBias));
        if (!profile.lowExpectations && type !== 'senior-dev' && Math.random() < 0.25) {
            profile.growth = true;
        }
        return profile;
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

    describeMood(moodScore, employee = null) {
        const mood = Number(moodScore || 0);
        if (employee?.behaviorProfile?.lowExpectations && mood < 30) {
            return `${this.pickRandom(UNDERPERFORMER_STATUSES)} (${mood.toFixed(0)})`;
        }
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

    promoteEmployee(employee) {
        const target = this.getPromotionTarget(employee.type);
        if (!target) {
            this.print('Для этого сотрудника нет следующего грейда.', 'warning');
            return;
        }
        const targetData = target.data;
        employee.type = targetData.type;
        employee.roleLabel = targetData.label;
        employee.baseSalary = targetData.baseSalary;
        employee.marketSalary = this.getScaledSalary(targetData.baseSalary);
        employee.currentSalary = Math.max(employee.currentSalary, employee.marketSalary);
        employee.skills = { ...targetData.skills };
        employee.behaviorProfile = this.generateBehaviorProfile(targetData.type);
        employee.weeksInRole = 0;
        employee.promotionRequest = null;
        employee.promotionWarning = null;
        employee.warning = null;
        employee.pendingDeparture = null;
        employee.moodScore = Math.max(employee.moodScore || 0, 55);
        this.recordEmployeeEvent(employee, {
            week: this.state.currentWeek,
            type: 'system',
            message: `Повышен до ${targetData.label}.`,
            moneyChange: 0,
            reputationChange: 0
        });
        const label = this.formatEmployeeLabel(employee);
        this.print(`[${label}] повышен до ${targetData.label}.`, 'success');
        this.showNotification({
            title: `${label} повышен`,
            message: `Новая роль — ${targetData.label}`,
            tone: 'success'
        });
        this.renderEmployeeModal(employee);
        this.refreshAllPanels();
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
                    `  - ${this.formatEmployeeLabel(emp)} (${emp.roleLabel}), зарплата $${this.formatMoney(emp.currentSalary)}; ` +
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
            lastSalaryChangeWeek: this.state.currentWeek,
            weeksInRole: 0,
            promotionRequest: null,
            promotionWarning: null,
            performanceScore: 0
        };

        this.state.money -= hireCost;
        this.state.employees.push(newEmployee);
        this.print(`Нанят сотрудник ${this.formatEmployeeLabel(newEmployee)} (${newEmployee.roleLabel}).`, 'success');
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
        this.ensureAmbitionPipeline();
        this.processGlobalEvent();
        this.evaluateWinLose();
        this.tickInflation();
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
                this.updatePerformanceScore(employee, 'quiet');
                this.updateEmployeeMood(employee, null);
                this.evaluateEmployeeRetention(employee);
                this.improveBehaviorProfile(employee);
                this.handleCareerProgression(employee);
                return;
            }
            this.applyEmployeeEvent(employee, event);
            this.updateEmployeeMood(employee, event);
            this.evaluateEmployeeRetention(employee);
            this.improveBehaviorProfile(employee);
            this.handleCareerProgression(employee);
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
        this.print(`[${this.formatEmployeeLabel(employee)}] ${event.message}${suffix}`, tone);
        this.updatePerformanceScore(employee, event.type);
    }

    updatePerformanceScore(employee, eventType = null) {
        if (!employee) {
            return;
        }
        const clamp = value => Math.max(-20, Math.min(40, value));
        const type = eventType || 'none';
        const current = typeof employee.performanceScore === 'number' ? employee.performanceScore : 0;
        let delta = 0;
        if (type === 'positive') {
            delta = 2.5;
        } else if (type === 'neutral') {
            delta = 1;
        } else if (type === 'negative') {
            delta = -3.5;
        } else {
            delta = 0.5;
        }
        employee.performanceScore = clamp(current + delta);
    }

    improveBehaviorProfile(employee) {
        const profile = employee.behaviorProfile;
        if (!profile || !profile.learningRate) {
            return;
        }
        profile.negativeBias = Math.max(0.05, profile.negativeBias - profile.learningRate);
        profile.positiveBias = Math.min(0.85, profile.positiveBias + profile.learningRate * 0.5);
    }

    handleCareerProgression(employee) {
        if (!employee || employee.type === 'senior-dev') {
            return;
        }
        employee.weeksInRole = (employee.weeksInRole || 0) + 1;
        const target = this.getPromotionTarget(employee.type);
        const profile = employee.behaviorProfile || (employee.behaviorProfile = this.generateBehaviorProfile(employee.type));
        const performanceScore = typeof employee.performanceScore === 'number' ? employee.performanceScore : 0;
        if (!target) {
            employee.promotionRequest = null;
            employee.promotionWarning = null;
            return;
        }
        if (!profile.growth) {
            employee.promotionRequest = null;
            employee.promotionWarning = null;
            return;
        }
        if (performanceScore < 3) {
            profile.growth = false;
            employee.promotionRequest = null;
            employee.promotionWarning = null;
            return;
        }

        if (!employee.promotionRequest) {
            if (employee.weeksInRole >= 12 && (employee.moodScore || 0) > 25 && performanceScore >= 6) {
                this.createPromotionRequest(employee, target);
            }
            return;
        }

        employee.promotionRequest.weeksWaiting += 1;
        if (!employee.promotionRequest.warningIssued && employee.promotionRequest.weeksWaiting >= 4) {
            this.issuePromotionWarning(employee);
        } else if (employee.promotionRequest.warningIssued && employee.promotionRequest.weeksWaiting >= 8) {
            if (Math.random() < 0.35) {
                this.forceEmployeeDeparture(employee, `Не получил повышение до ${employee.promotionRequest.targetLabel}`);
                return;
            }
        }
    }

    ensureAmbitionPipeline() {
        const employees = this.state.employees.filter(emp => emp.type !== 'senior-dev');
        if (employees.length === 0) {
            return;
        }
        const desired = Math.max(1, Math.floor(employees.length * 0.25));
        employees.forEach(emp => {
            const profile = emp.behaviorProfile;
            if (profile && profile.growth && (emp.performanceScore || 0) < 2) {
                profile.growth = false;
                emp.promotionRequest = null;
                emp.promotionWarning = null;
            }
        });
        let current = employees.filter(emp => emp.behaviorProfile?.growth).length;
        if (current >= desired) {
            return;
        }
        const eligible = employees.filter(emp => {
            const profile = emp.behaviorProfile || this.generateBehaviorProfile(emp.type);
            if (profile.lowExpectations || profile.growth) {
                return false;
            }
            return (emp.performanceScore || 0) >= 6;
        });
        while (current < desired && eligible.length > 0) {
            const index = Math.floor(Math.random() * eligible.length);
            const picked = eligible.splice(index, 1)[0];
            if (!picked) {
                break;
            }
            picked.behaviorProfile = picked.behaviorProfile || this.generateBehaviorProfile(picked.type);
            picked.behaviorProfile.growth = true;
            current += 1;
        }
    }

    createPromotionRequest(employee, target) {
        employee.promotionRequest = {
            targetType: target.type,
            targetLabel: target.label,
            weeksWaiting: 0,
            warningIssued: false
        };
        const label = this.formatEmployeeLabel(employee);
        const message = `${label} считает, что готов стать ${target.label}.`;
        this.recordEmployeeEvent(employee, {
            week: this.state.currentWeek,
            type: 'system',
            message,
            moneyChange: 0,
            reputationChange: 0
        });
        this.print(message, 'info');
        this.showNotification({
            title: `${label} хочет роста`,
            message: `Хочет стать ${target.label}`,
            tone: 'info'
        });
    }

    issuePromotionWarning(employee) {
        if (!employee.promotionRequest) {
            return;
        }
        employee.promotionRequest.warningIssued = true;
        const label = this.formatEmployeeLabel(employee);
        const msg = `${label} недоволен отсутствием повышения до ${employee.promotionRequest.targetLabel}.`;
        employee.promotionWarning = msg;
        this.recordEmployeeEvent(employee, {
            week: this.state.currentWeek,
            type: 'warning',
            message: `Предупреждение: ${msg}`,
            moneyChange: 0,
            reputationChange: 0
        });
        this.print(msg, 'warning');
        this.showNotification({
            title: `${label} ждёт решения`,
            message: `Нужно повысить до ${employee.promotionRequest.targetLabel}`,
            tone: 'warning'
        });
    }

    getPromotionTarget(type) {
        const map = {
            'junior-dev': 'mid-dev',
            'mid-dev': 'senior-dev'
        };
        const targetType = map[type];
        if (!targetType) {
            return null;
        }
        const data = GAME_DATA.employeeTypes.find(t => t.type === targetType);
        if (!data) {
            return null;
        }
        return { type: data.type, label: data.label, data };
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
        const profile = employee.behaviorProfile || this.generateBehaviorProfile(employee.type);
        const warningMoodThreshold = profile.lowExpectations ? -70 : -40;
        const warningChance = profile.lowExpectations ? 0.25 : 0.7;
        const suddenMoodThreshold = profile.lowExpectations ? -90 : -70;
        const suddenChance = profile.lowExpectations ? 0.05 : 0.3;
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
                this.print(`[${this.formatEmployeeLabel(employee)}] успокоился и остался в команде.`, 'info');
                employee.warning = null;
                employee.weeksSinceWarning = 0;
            } else if (employee.weeksSinceWarning >= (profile.lowExpectations ? 4 : 3)) {
                if (!employee.pendingDeparture) {
                    employee.pendingDeparture = { weeks: 0, timeout: profile.lowExpectations ? 3 : 2, reason: 'Предупреждение игнорировалось.' };
                    this.print(`[${this.formatEmployeeLabel(employee)}] готовится к уходу, осталось мало времени.`, 'warning');
                }
            }
        }

        if (mood < warningMoodThreshold && !employee.warning && Math.random() < warningChance) {
            this.issueWarning(employee);
        } else if (mood < suddenMoodThreshold && Math.random() < suddenChance) {
            this.forceEmployeeDeparture(employee, 'Получил внезапный оффер и исчез', true);
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
        this.print(`[${this.formatEmployeeLabel(employee)}] сигнализирует о желании уволиться (${employee.warning.source}).`, 'warning');
        this.showNotification({
            title: `${this.formatEmployeeLabel(employee)} недоволен`,
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
        this.print(`[${this.formatEmployeeLabel(employee)}] уволился. Причина: ${finalReason}`, 'error');
        this.showNotification({
            title: `${this.formatEmployeeLabel(employee)} ушёл`,
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

    tickInflation() {
        const econ = this.state.economy;
        if (!econ || !econ.inflationInterval) {
            return;
        }
        econ.weeksUntilInflation = (econ.weeksUntilInflation ?? econ.inflationInterval) - 1;
        if (econ.weeksUntilInflation > 0) {
            return;
        }
        econ.weeksUntilInflation = econ.inflationInterval;
        econ.salaryScale = +(econ.salaryScale * (1 + INFLATION_RATE)).toFixed(4);
        econ.projectScale = +(econ.projectScale * (1 + INFLATION_RATE)).toFixed(4);
        this.state.employees.forEach(emp => {
            emp.marketSalary = Math.round(emp.baseSalary * econ.salaryScale);
        });
        this.print(`Инфляция: рынок вырос на ${(INFLATION_RATE * 100).toFixed(0)}%. Рыночные зарплаты и награды проектов увеличились.`, 'info');
    }

    evaluateWinLose() {
        if (this.state.money < 0) {
            this.print('Компания обанкротилась. Денег нет.', 'error');
            this.state.gameOver = true;
        } else if (this.state.reputation < 0) {
            this.print('Репутация разрушена — клиенты ушли.', 'error');
            this.state.gameOver = true;
        }

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
        if (winTooltip) {
            const winReputationLabel = WIN_REPUTATION.toLocaleString('ru-RU');
            winTooltip.textContent = `Победа: баланс $${this.formatMoney(WIN_MONEY)} и репутация ${winReputationLabel} одновременно.`;
        }
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
            const label = this.formatEmployeeLabel(emp);
            const container = document.createElement('div');
            container.classList.add('employee-item');

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('fire-employee-trigger');
            removeBtn.innerHTML = '&times;';
            removeBtn.setAttribute('aria-label', `Уволить ${label}`);
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
                <div class="employee-name">${label}</div>
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
        this.employeeIdPendingStats = employee.id;
        this.renderEmployeeModal(employee);
        employeeStatsModal.classList.add('visible');
        employeeStatsModal.setAttribute('aria-hidden', 'false');
    }

    renderEmployeeModal(employee) {
        employeeModalName.textContent = this.formatEmployeeLabel(employee);
        employeeModalRole.textContent = employee.roleLabel;
        employeeModalCurrentSalary.textContent = this.formatMoney(employee.currentSalary);
        employeeModalMarketSalary.textContent = this.formatMoney(employee.marketSalary);
        employeeSalaryInput.value = employee.currentSalary;
        employeeModalMood.textContent = this.describeMood(employee.moodScore || 0, employee);
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
        const target = this.getPromotionTarget(employee.type);
        if (target && employeePromotionSection) {
            employeePromotionSection.classList.add('visible');
            const request = employee.promotionRequest;
            const messages = [];
            messages.push(`Следующий грейд: ${target.label}.`);
            if (request) {
                messages.push(`Запрос на повышение ожидает ${request.weeksWaiting} нед.`);
            }
            if (employee.promotionWarning) {
                messages.push(employee.promotionWarning);
            }
            employeePromotionText.textContent = messages.join(' ');
            promoteEmployeeBtn.disabled = false;
            promoteEmployeeBtn.textContent = `Повысить до ${target.label}`;
        } else if (employeePromotionSection) {
            employeePromotionSection.classList.remove('visible');
            employeePromotionText.textContent = '';
            promoteEmployeeBtn.textContent = 'Повысить';
            promoteEmployeeBtn.disabled = true;
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
            const label = this.formatEmployeeLabel(emp);
            const card = document.createElement('div');
            card.classList.add('global-stats-item');
            const mood = emp.moodScore || 0;
            const warningBadge = emp.warning ? `<span class="status-badge status-warning">Есть предупреждение</span>` : '';
            const pendingBadge = emp.pendingDeparture ? `<span class="status-badge status-pending">Готовится к уходу</span>` : '';
            const promoBadge = emp.promotionRequest ? `<span class="status-badge status-promo">Ждёт повышение</span>` : '';
            card.innerHTML = `
                <div class="global-stats-header">
                    <strong>${label}</strong>
                    <span class="mood-chip ${this.getMoodClass(mood)}">${this.describeMood(mood, emp)}</span>
                </div>
                <div class="global-stats-footer">
                    <span>Роль: ${emp.roleLabel}</span>
                    <span>Зарплата: $${this.formatMoney(emp.currentSalary)}/нед</span>
                    <span>Рыночная: $${this.formatMoney(emp.marketSalary)}/нед</span>
                    ${warningBadge}${pendingBadge}${promoBadge}
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
        this.print(`[${this.formatEmployeeLabel(employee)}] ${message}.`, delta > 0 ? 'success' : 'warning');
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

    formatEmployeeLabel(employee, { withRole = false } = {}) {
        if (!employee) {
            return 'Сотрудник';
        }
        const base = employee.name || 'Сотрудник';
        const suffix = employee.id ? ` #${employee.id}` : '';
        if (withRole && employee.roleLabel) {
            return `${base}${suffix} (${employee.roleLabel})`;
        }
        return `${base}${suffix}`;
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
        this.print(`Сотрудник ${this.formatEmployeeLabel(fired)} (${fired.roleLabel}) уволен.`, 'warning');
        this.refreshAllPanels();
        return true;
    }

    openFireModal(employee) {
        this.employeeIdPendingFire = employee.id;
        fireConfirmName.textContent = this.formatEmployeeLabel(employee);
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
    initWinTooltip();

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
if (promoteEmployeeBtn) {
    promoteEmployeeBtn.addEventListener('click', () => {
        if (game.employeeIdPendingStats === null) {
            return;
        }
        const employee = game.state.employees.find(emp => emp.id === game.employeeIdPendingStats);
        if (employee) {
            game.promoteEmployee(employee);
        }
    });
}
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
        collapseWinTooltip();
    }
});

function initWinTooltip() {
    if (!winInfoBtn || !winTooltip) {
        return;
    }
    const setVisible = visible => {
        if (visible) {
            winTooltip.classList.add('visible');
        } else {
            winTooltip.classList.remove('visible');
        }
    };
    const hideIfNotPinned = () => {
        if (!winTooltipPinned) {
            setVisible(false);
        }
    };
    winInfoBtn.addEventListener('mouseenter', () => {
        if (!winTooltipPinned) {
            setVisible(true);
        }
    });
    winInfoBtn.addEventListener('mouseleave', hideIfNotPinned);
    winInfoBtn.addEventListener('focus', () => setVisible(true));
    winInfoBtn.addEventListener('blur', hideIfNotPinned);
    winInfoBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        winTooltipPinned = !winTooltipPinned;
        setVisible(winTooltipPinned || winInfoBtn.matches(':hover'));
    });
    document.addEventListener('click', event => {
        if (!winTooltipPinned) {
            return;
        }
        if (winInfoBtn.contains(event.target) || winTooltip.contains(event.target)) {
            return;
        }
        collapseWinTooltip();
    });
}

function collapseWinTooltip() {
    if (!winTooltip) {
        return;
    }
    winTooltipPinned = false;
    winTooltip.classList.remove('visible');
}
