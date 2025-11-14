# Spec — TIB-1

## 1. Состояние
- `economy`: `salaryScale`, `projectScale`, `inflationInterval`, `weeksUntilInflation`.
- `lastEmployeeId` — автоинкремент.
- `EmployeeState`: `id`, `name`, `type`, `baseSalary`, `currentSalary`, `marketSalary`, `skills`, `trend`, `eventLog`, `warnings`, `performance`, `pendingLeave`, `weeksSinceRaise`, `moodScore`, `warningCooldown`.

## 2. Сохранения
- `loadState()` читает JSON из localStorage, проверяет `schemaVersion`, мигрирует недостающие поля.
- `saveState()` вызывается после любого изменения (найм, неделя, изменение зарплаты, предупреждение, увольнение).

## 3. Найм
- Стоимость = `employee.cost * economy.salaryScale`.
- `marketSalary = employee.salary * economy.salaryScale`.
- Создаём сотрудника с трендом (от -0.2 до +0.2 с поправкой на уровень).
- Добавляем системное событие «принят в команду».

## 4. Еженедельная логика
1. `applyInflation()` — когда `weeksUntilInflation === 0`, умножить `salaryScale` и `projectScale` на `(1+INFLATION_RATE)`, сбросить счётчик, сообщить в терминал.
2. `paySalaries()` — списать сумму `currentSalary`.
3. `progressProjects()` — как сейчас, но награда проектов умножена на `projectScale`.
4. `processEmployeeEvents(emp)`:
   - вероятность события `baseChance + emp.trend`.
   - позитивы/негативы влияют на деньги/репутацию и записываются в `eventLog` (max 30).
5. `updateMood(emp)` рассчитывает `moodScore`.
6. `handleWarnings(emp)` — создаёт предупреждения, уменьшает счётчик, увольняет или снимает тревогу.
7. `maybeFire(emp)` — обрабатывает процент внезапных уходов.

## 5. Модалки
- `employeeStatsModal`: список событий, текущее состояние, input зарплаты.
- `employeeAlertModal`: предупреждения с текстами («услышали в курилке», «лично предупредил» и т.д.).

## 6. Ограничения
- `currentSalary >= baseSalary * salaryScale * 0.5`.
- Повышение/понижение добавляет запись в log и сбрасывает `weeksSinceRaise`.

## 7. Терминал
- Все ключевые события (найм, инфляция, прогресс, бонусы, штрафы, предупреждения, увольнения) печатаются.

## 8. Ошибки/сброс
- При `reset` очищаем localStorage и создаём новый state.
