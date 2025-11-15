# Spec — TIB-1

## 1. Состояние
- `economy`: `salaryScale`, `projectScale`, `inflationInterval`, `weeksUntilInflation`.
- `lastEmployeeId` — инкрементальное значение для новых сотрудников.
- `EmployeeState`:  
  `id`, `name`, `type`, `baseSalary`, `currentSalary`, `marketSalary` (рассчитывается от `baseSalary * salaryScale` и не меняется при изменении зарплаты),  
  `skills`, `behaviorProfile` (`positiveBias`, `negativeBias`, `learningRate`, `lowExpectations`),  
  `eventLog` (макс. 30 записей), `warning`, `pendingDeparture`, `weeksSinceWarning`, `moodScore`, `lastSalaryChangeWeek`.

## 2. Persistence
- `loadState()` поднимает JSON из `localStorage`, проверяет `schemaVersion`, мигрирует отсутствующие поля.
- `saveState()` вызывается после любого изменения: деньги, сотрудники, проекты, настроение.

## 3. Экономика и поведение
- Стоимость найма = `employee.cost * economy.salaryScale`.
- `marketSalary = employee.baseSalary * economy.salaryScale`.
- Минимально допустимая зарплата: `max(50, marketSalary * 0.8)` — нельзя опускаться ниже 80 % рынка.
- Профиль поведения:
  - у джунов 50 % профилей «косячники» (`lowExpectations = true`), 50 % — аккуратные;
  - `learningRate` постепенно понижает `negativeBias` (даже плохие сотрудники учатся);
  - `lowExpectations` снижает шанс предупреждений/увольнений и включает смешные статусы.
- `moodScore` зависит от отношения `currentSalary/marketSalary`, событий недели и последнего повышения.

## 4. Цикл недели
1. `paySalaries()` — списываем `currentSalary`.
2. `progressProjects()` — увеличиваем прогресс с учётом скиллов.
3. `processEmployeeEvents()` — для каждого сотрудника:
   - бросаем событие по `positiveBias/negativeBias`;
   - пишем запись в `eventLog` (усечён до 30);
   - обновляем настроение и вероятность предупреждений;
   - вызываем `improveBehaviorProfile()` (уменьшаем `negativeBias` на `learningRate`).
4. `updateEmployeeMood()` — учитывает зарплату, событие и сбрасывает предупреждения при щедрых повышениях.
5. `evaluateEmployeeRetention()` — зависит от `lowExpectations` (ниже пороги и шансы).
6. `processGlobalEvent()` — случайные бонусы/штрафы для компании.
7. Сохраняем состояние.

## 5. UI
- `employeeStatsModal`: имя, роль, текущая/рыночная зарплата, настроение, предупреждения, изменение зарплаты (с валидацией) и история событий.
- `global-stats-modal`: список сотрудников с бейджами настроения, предупреждений и кнопкой «Подробно».
- `notifications-container`: toast-уведомления про предупреждения, увольнения, внезапные события.

## 6. Валидации
- Зарплату нельзя понизить ниже `marketSalary * 0.8`; ошибка отображается и в модалке, и в терминале.
- Изменение зарплаты пишет системное событие в `eventLog`.
- Рыночная и текущая зарплаты всегда отображаются отдельно.

## 7. Сохранения
- После каждой операции вызываем `saveState()`; на загрузке — `loadState()` с миграциями.
- Команда `reset` очищает `localStorage` и создаёт новое состояние.

## 8. Примечания
- Humor: `lowExpectations` сотрудники получают особые статусы настроения и редко увольняются сами.
- Причины увольнений, предупреждения и события логируются как в терминал, так и в историю сотрудника.
