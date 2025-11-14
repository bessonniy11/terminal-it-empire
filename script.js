const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const gameControls = document.getElementById('game-controls');

// Обновленные ссылки на DOM-элементы для новой структуры
const activeProjectsPanel = document.getElementById('active-projects-panel');
const activeProjectsList = document.getElementById('active-projects-list');
const gameStatsPanel = document.getElementById('game-stats');
const statWeek = document.getElementById('stat-week');
const statMoney = document.getElementById('stat-money');
const statReputation = document.getElementById('stat-reputation');
const hiredEmployeesPanel = document.getElementById('hired-employees-panel');
const hiredEmployeesList = document.getElementById('hired-employees-list');
const hirePanel = document.getElementById('hire-panel');
const projectsPanel = document.getElementById('projects-panel');
const fireConfirmModal = document.getElementById('fire-confirm-modal');
const fireConfirmName = document.getElementById('fire-confirm-name');
const fireConfirmRole = document.getElementById('fire-confirm-role');
const confirmFireBtn = document.getElementById('confirm-fire-btn');
const cancelFireBtn = document.getElementById('cancel-fire-btn');

const SAVE_KEY = 'tib-save';
const SCHEMA_VERSION = 1;

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
        return { ...fallback, ...parsed };
    } catch (error) {
        console.warn('Failed to load state, using defaults', error);
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
// Удаляем ссылки на терминал-шторку и кнопку переключения, т.к. терминал всегда видим
// const terminalDrawerContainer = document.getElementById('terminal-drawer-container');
// const toggleTerminalBtn = document.getElementById('toggle-terminal-btn');
const gameLayout = document.querySelector('.game-layout');

class Game {
    constructor() {
        this.state = loadState();
        this.commands = {};
        this.initCommands();
        this.employeeIdPendingFire = null;
    }

    init() {
        this.print('Добро пожаловать в Terminal IT Empire!');
        this.print('Управляйте своей IT-компанией с помощью команд.');
        this.print('Наберите \'help\' для списка доступных команд.');
        // Удаляем вывод статистики, теперь она будет в game-stats
        // this.print(`Неделя: ${this.state.currentWeek} | Деньги: $${this.state.money} | Репутация: ${this.state.reputation}`);
        this.refreshAllPanels(); // Новая функция для обновления всех панелей
    }

    print(message, type = 'info') {
        const line = document.createElement('div');
        line.textContent = message;
        line.classList.add(type);
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    initCommands() {
        this.commands.help = this.cmdHelp.bind(this);
        this.commands.status = this.cmdStatus.bind(this);
        this.commands.hire = this.cmdHire.bind(this);
        this.commands.project = this.cmdProject.bind(this);
        this.commands.nextweek = this.cmdNextWeek.bind(this);
        this.commands.reset = this.cmdReset.bind(this);
    }

    handleCommand(input) {
        if (this.state.gameOver && input.toLowerCase() !== 'reset') {
            this.print('Игра окончена. Нажмите F5 для новой игры или наберите \'reset\' чтобы начать заново.');
            return;
        }

        const parts = input.toLowerCase().trim().split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        this.print(`$ ${input}`);

        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            this.print(`Неизвестная команда: ${command}. Наберите 'help' для списка команд.`);
        }
        this.refreshAllPanels(); // Теперь вызываем новую функцию
    }

    cmdHelp(args) {
        this.print('Доступные команды:');
        this.print('  help - Показать список команд');
        this.print('  status - Показать текущий статус компании (подробно в терминале, основное в панелях)');
        this.print('  hire <тип> - Нанять нового сотрудника (например, \'hire junior-dev\')');
        this.print('  project <название> - Начать новый проект (например, \'project Simple Landing Page\')');
        this.print('  nextweek - Перейти к следующей неделе');
        this.print('  reset - Начать новую игру');
    }

    cmdStatus(args) {
        // Вывод деталей в терминал, основная информация теперь в панелях
        this.print('-- Подробный статус компании --');
        this.print(`Неделя: ${this.state.currentWeek}`);
        this.print(`Деньги: $${this.state.money}`);
        this.print(`Репутация: ${this.state.reputation}`);
        this.print('Сотрудники:');
        if (this.state.employees.length === 0) {
            this.print('  У вас пока нет сотрудников.');
        } else {
            this.state.employees.forEach(emp => {
                this.print(`  - ${emp.name} (ID: ${emp.id}, ${emp.type}), ЗП: $${emp.salary}, Навыки: Coding: ${emp.skills.coding}, Bugfixing: ${emp.skills.bugfixing}`);
            });
        }
        this.print('Текущие проекты:');
        if (this.state.projects.length === 0) {
            this.print('  Нет активных проектов.');
        } else {
            this.state.projects.forEach(proj => {
                this.print(`  - ${proj.name} (Осталось: ${proj.remainingDuration} недель), Прогресс: ${proj.progress.toFixed(2)}%`);
            });
        }
    }

    calculateTotalSkills() {
        const totalSkills = { coding: 0, bugfixing: 0 };
        this.state.employees.forEach(emp => {
            totalSkills.coding += emp.skills.coding;
            totalSkills.bugfixing += emp.skills.bugfixing;
        });
        return totalSkills;
    }

    // Новая функция для рендеринга статистики
    renderGameStats() {
        statWeek.textContent = this.state.currentWeek;
        statMoney.textContent = this.state.money;
        statReputation.textContent = this.state.reputation;
    }

    // Новая функция для рендеринга нанятых сотрудников
    renderHiredEmployees() {
        hiredEmployeesList.innerHTML = ''; // Очищаем список
        const employeeEmojis = {
            'junior-dev': '👨‍💻',
            'mid-dev': '🧑‍💻',
            'senior-dev': '🧑‍🏫'
        };

        if (this.state.employees.length === 0) {
            hiredEmployeesList.innerHTML = '<p>У вас пока нет сотрудников.</p>';
        } else {
            this.state.employees.forEach(emp => {
                const employeeItem = document.createElement('div');
                employeeItem.classList.add('employee-item');
                const removeBtn = document.createElement('button');
                removeBtn.classList.add('fire-employee-trigger');
                removeBtn.innerHTML = '&times;';
                removeBtn.setAttribute('aria-label', `Уволить ${emp.name}`);
                removeBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.openFireModal(emp);
                });

                const emojiSpan = document.createElement('span');
                emojiSpan.classList.add('emoji');
                emojiSpan.textContent = employeeEmojis[emp.type];

                const infoSpan = document.createElement('span');
                infoSpan.textContent = `${emp.name} (${emp.type}) - ID: ${emp.id}`;

                employeeItem.appendChild(removeBtn);
                employeeItem.appendChild(emojiSpan);
                employeeItem.appendChild(infoSpan);
                hiredEmployeesList.appendChild(employeeItem);
            });
        }
    }

    // Новая функция для рендеринга активных проектов
    renderActiveProjects() {
        activeProjectsList.innerHTML = ''; // Очищаем список
        if (this.state.projects.length === 0) {
            activeProjectsList.innerHTML = '<p>Нет активных проектов.</p>';
        } else {
            this.state.projects.forEach(proj => {
                const projectItem = document.createElement('div');
                projectItem.classList.add('active-project-item');
                projectItem.innerHTML = `
                    <span>${proj.name}</span>
                    <span>Прогресс: ${proj.progress.toFixed(0)}%</span>
                    <span>Осталось: ${proj.remainingDuration} нед.</span>
                `;
                activeProjectsList.appendChild(projectItem);
            });
        }
    }

    renderHirePanel() {
        hirePanel.innerHTML = '<h2>Нанять сотрудника</h2>';
        GAME_DATA.employeeTypes.forEach(empType => {
            const employeeCard = document.createElement('div');
            employeeCard.classList.add('employee-card');
            let isDisabled = false;
            let disableReason = '';

            if (this.state.money < empType.cost) {
                isDisabled = true;
                disableReason = 'Недостаточно средств';
            } else if (this.state.reputation < empType.minReputation) {
                isDisabled = true;
                disableReason = `Требуется репутация ${empType.minReputation}+`;
            }

            if (isDisabled) {
                employeeCard.classList.add('disabled');
            } else {
                employeeCard.addEventListener('click', () => this.handleCommand(`hire ${empType.type}`));
            }

            employeeCard.innerHTML = `
                <h3>${empType.type.replace('-', ' ')}</h3>
                <p>Стоимость: $${empType.cost}</p>
                <p>Зарплата: $${empType.salary}/неделя</p>
                <p class="skills">Навыки: Coding: ${empType.skills.coding}, Bugfixing: ${empType.skills.bugfixing}</p>
                ${isDisabled ? `<p class="error">${disableReason}</p>` : ''}
            `;
            hirePanel.appendChild(employeeCard);
        });
    }

    renderProjectsPanel() {
        projectsPanel.innerHTML = '<h2>Доступные проекты</h2><div class="projects-grid"></div>';
        const projectsGrid = projectsPanel.querySelector('.projects-grid');
        const totalSkills = this.calculateTotalSkills();

        GAME_DATA.projectTypes.forEach(projType => {
            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card', `${projType.size}-project`);

            let isDisabled = false;
            let disableReason = '';
            let missingSkills = [];

            if (this.state.projects.some(p => p.name === projType.name)) {
                isDisabled = true;
                disableReason = 'Проект уже активен';
            } else if (this.state.reputation < projType.minReputation) {
                isDisabled = true;
                disableReason = `Требуется репутация ${projType.minReputation}+`;
                for (const skill in projType.requiredSkills) {
                    if (totalSkills[skill] < projType.requiredSkills[skill]) {
                        isDisabled = true;
                        missingSkills.push(`${skill}: требуется ${projType.requiredSkills[skill]}, у вас ${totalSkills[skill]}`);
                    }
                }
                if (missingSkills.length > 0) {
                    disableReason = 'Недостаточно навыков';
                }
            }

            if (isDisabled) {
                projectCard.classList.add('disabled');
            } else {
                projectCard.addEventListener('click', () => this.handleCommand(`project ${projType.name}`));
            }

            projectCard.innerHTML = `
                <div class="project-icon">${projType.icon}</div>
                <h3>${projType.name}</h3>
                <p>${projType.description}</p>
                <p class="skills-req">Требуемые навыки: Coding: ${projType.requiredSkills.coding}, Bugfixing: ${projType.requiredSkills.bugfixing}</p>
                <p>Длительность: ${projType.duration} недель</p>
                <p>Награда: $${projType.reward}, Репутация: +${projType.reputationGain}</p>
                ${isDisabled ? `<p class="error">${disableReason}${missingSkills.length > 0 ? ': ' + missingSkills.join(', ') : ''}</p>` : ''}
            `;
            projectsGrid.appendChild(projectCard);
        });
    }

    // Новая функция для обновления всех панелей
    refreshAllPanels() {
        this.renderGameStats();
        this.renderHiredEmployees();
        this.renderActiveProjects();
        this.renderHirePanel();
        this.renderProjectsPanel();
        this.persistState();
    }

    cmdHire(args) {
        // Ожидаем, что args[0] будет типом сотрудника (из кнопки)
        if (args.length < 1) {
            this.print('Использование: hire <тип_сотрудника> (например, \'hire junior-dev\')');
            return;
        }

        const employeeType = args[0];
        const employeeData = GAME_DATA.employeeTypes.find(type => type.type === employeeType);

        if (!employeeData) {
            this.print(`Неизвестный тип сотрудника: ${employeeType}`);
            return;
        }

        if (this.state.money < employeeData.cost) {
            this.print(`Недостаточно средств для найма ${employeeType}. Требуется $${employeeData.cost}.`);
            return;
        }

        if (this.state.reputation < employeeData.minReputation) {
            this.print(`Недостаточно репутации для найма ${employeeType}. Требуется ${employeeData.minReputation}+ репутации.`);
            return;
        }

        const randomName = employeeData.nameOptions[Math.floor(Math.random() * employeeData.nameOptions.length)];
        const newEmployee = {
            id: this.state.employees.length + 1,
            name: randomName,
            type: employeeType,
            salary: employeeData.salary,
            skills: { ...employeeData.skills }
        };

        this.state.money -= employeeData.cost;
        this.state.employees.push(newEmployee);
        this.print(`Нанят новый сотрудник: ${newEmployee.name} (${newEmployee.type})!`, 'success');
        // this.print(`Ваш баланс: $${this.state.money}`); // Удаляем, т.к. баланс в панели
        this.refreshAllPanels(); // Обновляем все панели после найма
    }

    cmdProject(args) {
        // Ожидаем, что args будет названием проекта (из кнопки)
        if (args.length < 1) {
            this.print('Использование: project <название_проекта> (например, \'project Simple Landing Page\')');
            return;
        }

        const projectName = args.join(' '); // Название проекта может содержать пробелы
        const projectData = GAME_DATA.projectTypes.find(p => p.name.toLowerCase() === projectName.toLowerCase());

        if (!projectData) {
            this.print(`Неизвестный проект: ${projectName}`);
            return;
        }

        if (this.state.projects.some(p => p.name.toLowerCase() === projectName.toLowerCase())) {
            this.print(`Проект '${projectName}' уже активен.`);
            return;
        }

        if (this.state.reputation < projectData.minReputation) {
            this.print(`Недостаточно репутации для начала проекта '${projectName}'. Требуется ${projectData.minReputation}+ репутации.`);
            return;
        }

        const totalSkills = this.calculateTotalSkills();
        let canDoProject = true;
        let missingSkills = [];

        for (const skill in projectData.requiredSkills) {
            if (totalSkills[skill] < projectData.requiredSkills[skill]) {
                canDoProject = false;
                missingSkills.push(`${skill}: требуется ${projectData.requiredSkills[skill]}, у вас ${totalSkills[skill]}`);
            }
        }

        if (!canDoProject) {
            this.print(`Недостаточно навыков для начала проекта '${projectName}':`, 'error');
            missingSkills.forEach(skill => this.print(`  - ${skill}`));
            return;
        }

        const newProject = {
            id: this.state.projects.length + 1,
            name: projectData.name,
            description: projectData.description,
            requiredSkills: { ...projectData.requiredSkills },
            duration: projectData.duration,
            remainingDuration: projectData.duration,
            reward: projectData.reward,
            reputationGain: projectData.reputationGain,
            progress: 0,
            skillPointsNeeded: projectData.requiredSkills.coding * projectData.duration, // Общее количество очков навыков для завершения
            currentSkillPoints: 0
        };

        this.state.projects.push(newProject);
        this.print(`Проект '${projectName}' запущен!`, 'success');
        this.refreshAllPanels(); // Обновляем все панели после запуска проекта
    }

    cmdNextWeek(args) {
        this.print('-- Началась неделя ' + ++this.state.currentWeek + ' --');

        // 1. Выплата зарплат
        let totalSalaries = this.state.employees.reduce((sum, emp) => sum + emp.salary, 0);
        this.state.money -= totalSalaries;
        if (totalSalaries > 0) {
            this.print(`Выплачены зарплаты на сумму $${totalSalaries}.`, 'warning');
        }

        // 2. Прогресс по проектам
        const totalSkills = this.calculateTotalSkills();
        this.state.projects.forEach(proj => {
            if (proj.remainingDuration > 0) {
                // Учитываем скиллы и продолжительность
                const skillContribution = totalSkills.coding * 1 + totalSkills.bugfixing * 0.5; // Увеличенный вклад скиллов
                proj.currentSkillPoints += skillContribution;

                proj.progress = (proj.currentSkillPoints / proj.skillPointsNeeded) * 100;
                if (proj.progress > 100) proj.progress = 100;

                if (proj.progress >= 100) {
                    proj.remainingDuration = 0; // Проект завершен
                } else {
                    proj.remainingDuration--;
                }
                this.print(`Прогресс по проекту '${proj.name}': ${proj.progress.toFixed(0)}%. Осталось недель: ${proj.remainingDuration}.`); //toFixed(0) для более чистого вывода
            }
        });

        // 3. Завершение проектов
        this.state.projects = this.state.projects.filter(proj => {
            if (proj.remainingDuration <= 0 && proj.progress >= 100) {
                this.state.money += proj.reward;
                this.state.reputation += proj.reputationGain;
                this.print(`Проект '${proj.name}' успешно завершен! Получено $${proj.reward} и +${proj.reputationGain} репутации.`, 'success');
                return false; // Удаляем завершенный проект
            }
            return true;
        });

        // 4. Случайные события (с небольшой вероятностью)
        let eventChance = 0.3;
        eventChance += (this.state.reputation / 100) * 0.2;

        if (Math.random() < eventChance) {
            const randomEvent = GAME_DATA.events[Math.floor(Math.random() * GAME_DATA.events.length)];

            if (this.state.reputation > 40 && randomEvent.type === 'negative' && Math.random() < 0.5) {
                this.print(`Событие: "${randomEvent.message}" удалось предотвратить благодаря высокой репутации!`, 'info');
            } else if (this.state.reputation < 20 && randomEvent.type === 'positive' && Math.random() < 0.5) {
                this.print(`Событие: "${randomEvent.message}" не принесло эффекта из-за низкой репутации.`, 'info');
                this.print(`СОБЫТИЕ: ${randomEvent.message}`, randomEvent.type === 'positive' ? 'success' : 'error');
                if (randomEvent.moneyChange) this.state.money += randomEvent.moneyChange;
                if (randomEvent.reputationChange) this.state.reputation += randomEvent.reputationChange;
            }
        }

        // 5. Проверка условий поражения
        if (this.state.money < 0) {
            this.print('Банкротство! У вас закончились деньги.', 'error');
            this.state.gameOver = true;
            this.print('Игра окончена. Нажмите F5 для новой игры или наберите \'reset\' чтобы начать заново.');
        }
        if (this.state.reputation < 0) {
            this.print('Репутация уничтожена! Ваша компания закрывается.', 'error');
            this.state.gameOver = true;
            this.print('Игра окончена. Нажмите F5 для новой игры или наберите \'reset\' чтобы начать заново.');
        }

        // Проверка условий победы
        const WIN_MONEY = 50000;
        const WIN_REPUTATION = 100;
        if (this.state.money >= WIN_MONEY && this.state.reputation >= WIN_REPUTATION) {
            this.print(`ПОБЕДА! Ваша компания достигла $${WIN_MONEY} и ${WIN_REPUTATION} репутации!`, 'success');
            this.state.gameOver = true;
            this.print('Игра окончена. Нажмите F5 для новой игры или наберите \'reset\' чтобы начать заново.', 'success');
        }

        // Обновляем общий статус после всех событий
        // this.print(`Неделя: ${this.state.currentWeek} | Деньги: $${this.state.money} | Репутация: ${this.state.reputation}`); // Удаляем, т.к. теперь в панели
        if (this.state.gameOver) {
            terminalInput.disabled = true; // Отключаем ввод команд
            gameControls.classList.add('disabled');
        } else {
            gameControls.classList.remove('disabled');
        }
        this.refreshAllPanels(); // Обновляем все панели в конце недели
    }

    cmdReset() {
        terminalOutput.innerHTML = ''; // Очищаем терминал
        if (hasLocalStorage()) {
            window.localStorage.removeItem(SAVE_KEY);
        }
        this.state = cloneInitialState(); // Сбрасываем состояние игры
        this.state.gameOver = false;
        terminalInput.disabled = false; // Включаем ввод
        gameControls.classList.remove('disabled'); // Включаем кнопки управления
        this.init(); // Инициализируем игру заново
    }

    persistState() {
        if (!this.state) {
            return;
        }
        saveState(this.state);
    }


    fireEmployeeById(employeeId) {
        const employeeIndex = this.state.employees.findIndex(emp => emp.id === employeeId);
        if (employeeIndex === -1) {
            this.print(`Сотрудник с ID ${employeeId} не найден.`);
            return false;
        }
        const firedEmployee = this.state.employees.splice(employeeIndex, 1)[0];
        this.print(`Сотрудник ${firedEmployee.name} (${firedEmployee.type}) был уволен.`, 'warning');
        this.refreshAllPanels();
        return true;
    }

    openFireModal(employee) {
        this.employeeIdPendingFire = employee.id;
        fireConfirmName.textContent = employee.name;
        fireConfirmRole.textContent = employee.type;
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

terminalInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const input = terminalInput.value;
        terminalInput.value = '';
        game.handleCommand(input);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    game.init();

    const controlButtons = document.querySelectorAll('.control-btn');
    controlButtons.forEach(button => {
        button.addEventListener('click', () => {
            const command = button.dataset.command;

            // Удаляем логику для 'toggle-terminal', так как терминал всегда видим
            // if (command === 'toggle-terminal') { ... return; }

            if (!game.state.gameOver || command === 'reset') {
                game.handleCommand(command);
            } else {
                game.print('Игра окончена. Используйте reset для начала заново.');
            }
            // Удаляем автоматический фокус на вводе после нажатия кнопки
            // terminalInput.focus();
        });
    });

    // Начальная настройка: терминал всегда видим, ввод включен
    terminalInput.disabled = false;

    // Ensure hire and projects panels stay visible
    hirePanel.classList.remove('hidden');
    projectsPanel.classList.remove('hidden');

    game.refreshAllPanels();

    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        // Небольшая задержка, чтобы анимация лоадера была видна
        setTimeout(() => {
            pageLoader.classList.add('fade-out');
        }, 500); // 0.5 секунды
    }
});

confirmFireBtn.addEventListener('click', () => {
    if (game.employeeIdPendingFire !== null) {
        game.fireEmployeeById(game.employeeIdPendingFire);
    }
    game.closeFireModal();
});

cancelFireBtn.addEventListener('click', () => game.closeFireModal());

fireConfirmModal.addEventListener('click', (event) => {
    if (event.target === fireConfirmModal) {
        game.closeFireModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        game.closeFireModal();
    }
});

