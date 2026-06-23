# Сборка APK для Car4Rent Mobile

## 1. Меняем URL бекенда

В файле `src/api/axios-instance.ts` раскомментируй нужный вариант:

```ts
// Для реального телефона по Wi-Fi:
const BACKEND_URL = "http://192.168.1.xxx:3000";
// где xxx — IP твоего сервера/компьютера

// Для эмулятора Android:
// const BACKEND_URL = "http://10.0.2.2:3000";

// Для продакшена на сервере:
// const BACKEND_URL = "http://SERVER_IP:3000";
```

## 2. Устанавливаем EAS CLI (если ещё нет)

```bash
npm install -g eas-cli
eas login
```

## 3. Собираем APK (preview — неподписанный)

```bash
npx eas build --platform android --profile preview
```

Это создаст `.apk` файл, который можно установить на любой телефон.

## 4. Режим разработки (debug apk)

```bash
npx expo run:android
```

Или через EAS:
```bash
npx eas build --platform android --profile development
```

## 5. Прямая установка на телефон

Закинь `.apk` на телефон через:
- USB-кабель (скопировать как файл)
- Telegram/AnyDesk
- `npx expo install` + QR-код через `npx expo start --tunnel`

## Важно

- Для пет-проекта **не нужно** подписывать сертификатами
- Для стора (Google Play) нужен `app.json` с корректным `package` и подпись ключом
- Все нативные фичи (камера, гео, уведомления) будут работать без сертификата
