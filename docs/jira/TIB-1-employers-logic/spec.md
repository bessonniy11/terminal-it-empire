# Spec — TIB-1

## 1. State
- `economy`: `salaryScale`, `projectScale`, `inflationInterval`, `weeksUntilInflation`.
- `lastEmployeeId`: incremental counter.
- `EmployeeState`:
  - `id`, `name`, `type`, `roleLabel`.
  - `baseSalary`, `currentSalary`, `marketSalary` (`baseSalary * salaryScale`, не меняется от raise).
  - `skills`, `behaviorProfile` (`positiveBias`, `negativeBias`, `learningRate`, `lowExpectations`, `growth`).
  - `eventLog` (макс. 30), `moodScore`, `warning`, `pendingDeparture`, `weeksSinceWarning`, `lastSalaryChangeWeek`.
  - `weeksInRole`, `promotionRequest`, `promotionWarning`.

## 2. Persistence
- `loadState()` читает JSON из `localStorage`, проверяет `schemaVersion`, добавляет отсутствующие поля (`weeksUntilInflation`, `promotionRequest` …).
- `saveState()` вызывается после любого изменения.
- `reset` очищает `localStorage`.

## 3. Economy & Behaviour
- Hire cost = `employee.cost * salaryScale`.
- Minimum salary = `max(50, marketSalary * 0.8)`.
- Профиль:
  - Джуны: 50 % аккуратных, 50 % косячников (`lowExpectations=true`, низкий `learningRate`, карьера не интересует).
- Только сотрудники без `lowExpectations` могут получить `growth=true`, и лишь в ~25 % случаев.
  - `improveBehaviorProfile()` каждую неделю уменьшает `negativeBias`.
- `moodScore` учитывает отношение `currentSalary/marketSalary`, события недели, недавние повышения.

## 4. Weekly Flow
1. `paySalaries()`.
2. `progressProjects()`.
3. `processEmployeeEvents()`:
   - генерирует событие по `positiveBias/negativeBias`;
   - пишет строку в `eventLog` (усечение до 30);
   - вызывает `updateEmployeeMood`, `evaluateEmployeeRetention`, `improveBehaviorProfile`, `handleCareerProgression`.
4. `processGlobalEvent()` — глобальные бонусы/штрафы.
5. `tickInflation()` — уменьшает `weeksUntilInflation`; при 0 умножает `salaryScale/projectScale` на `(1 + inflationRate)` и пересчитывает `marketSalary`.

## 5. Career growth
- `getPromotionTarget(type)` → `junior → mid`, `mid → senior`.
- Амбициозные (`growth=true`) после `weeksInRole ≥ 12` и `moodScore > 25` вызывают `createPromotionRequest` (toast + запись).
- Если 4 недели игнорирование → `issuePromotionWarning` (toast, `promotionWarning` в модалке).
- Если 8 недель игнорирование → вероятность 35 % увольнения с причиной «Не получил повышение…».
- `promoteEmployee()` меняет грейд, обновляет зарплаты/скиллы/профиль, сбрасывает предупреждения и повышает `moodScore`.

## 6. UI
- Employee modal: настроение, предупреждения, блок повышения грейда, изменение зарплаты с валидацией, история событий.
- Global modal: список сотрудников, mood chips, бейджи (`warning`, `pending`, `promo`), кнопка «Подробно».
- Toast notifications: предупреждения, карьерные запросы, увольнения, инфляция.

## 7. Validation & Notifications
- Изменение зарплаты логируется и валидируется (не ниже 80 % рынка).
- Любые предупреждения/увольнения и карьерные запросы отображаются в терминале, истории и toast-уведомлениях.
