# Spec — TIB-1

## 1. State
- `economy`: `salaryScale`, `projectScale`, `inflationInterval`, `weeksUntilInflation`.
- `lastEmployeeId`: incremental counter.
- `EmployeeState`:
  - `id`, `name`, `type`, `roleLabel`.
  - `baseSalary`, `currentSalary`, `marketSalary` (`baseSalary * salaryScale`, не меняется от raise).
  - `skills`, `behaviorProfile` (`positiveBias`, `negativeBias`, `learningRate`, `lowExpectations`, `growth`).
  - `eventLog` (max 30), `moodScore`, `warning`, `pendingDeparture`, `weeksSinceWarning`, `lastSalaryChangeWeek`.
  - `weeksInRole`, `promotionRequest`, `promotionWarning`.

## 2. Persistence
- `loadState()` читает JSON из `localStorage`, проверяет `schemaVersion`, добавляет отсутствующие поля (`weeksUntilInflation`, `promotionRequest` и т.д.).
- `saveState()` вызывается после любого изменения денег/сотрудников/проектов/настроения.
- `reset` очищает `localStorage`.

## 3. Economy & Behaviour
- Hire cost = `employee.cost * salaryScale`.
- Minimum salary = `max(50, marketSalary * 0.8)`.
- Профиль:
  - Джуны: 50 % аккуратных, 50 % косячников (`lowExpectations=true`, слабый `learningRate`, возможно `growth=false`).
  - `growth=true` означает амбициозного сотрудника (просит грейд).
  - Каждую неделю вызывается `improveBehaviorProfile()` → `negativeBias` плавно уменьшается.
- `moodScore` учитывает отношение `currentSalary/marketSalary`, события недели, последние повышения.

## 4. Weekly Flow
1. `paySalaries()`.
2. `progressProjects()`.
3. `processEmployeeEvents()`:
   - генерирует событие по `positiveBias/negativeBias`;
   - пишет строку в `eventLog`;
   - вызывает `updateEmployeeMood`, `evaluateEmployeeRetention`, `improveBehaviorProfile`, `handleCareerProgression`.
4. `processGlobalEvent()` — случайные бонусы/штрафы.
5. `tickInflation()` — уменьшает `weeksUntilInflation`; при 0 умножает `salaryScale/projectScale` на `(1 + inflationRate)` и пересчитывает `marketSalary`.
6. `saveState()`.

## 5. Career growth
- `getPromotionTarget(type)` → `junior → mid`, `mid → senior`.
- Амбициозные (`behaviorProfile.growth`) после `weeksInRole >= 12` и `moodScore > 25` вызывают `createPromotionRequest` (toast + log).
- Если 4 недели игнорирование → `issuePromotionWarning` (toast, `promotionWarning` в модалке).
- Если 8 недель игнорирование → шанс 35 % на увольнение с причиной «Не получил повышение…».
- В модалке есть кнопка «Повысить» → `promoteEmployee()` меняет грейд, обновляет `baseSalary/marketSalary/currentSalary`, перезаписывает профиль, сбрасывает предупреждения и повышает `moodScore`.

## 6. UI
- Employee modal: имя/роль/настроение, предупреждения, блок повышения грейда, изменение зарплаты (валидация + сообщение об ошибке), история событий.
- Global modal: список сотрудников, mood chips, бейджи (`warning`, `pending`, `promo`), кнопка «Подробно».
- Toast notifications: предупреждения, карьерные запросы, увольнения, инфляция.

## 7. Validation
- Salary raise/lowers записываются в `eventLog`.
- При попытке опустить зарплату ниже 80 % рынка выводится ошибка под инпутом и запись в терминал.

## 8. Notifications & Logs
- Любые предупреждения/увольнения пишутся в терминал, историю сотрудника и показываются тостами.
- Причины увольнений и карьерных запросов локализованы (в том числе юмористические варианты для low expectations).
