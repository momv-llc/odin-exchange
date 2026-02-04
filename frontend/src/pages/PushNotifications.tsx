import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Language } from '../translations';
import { api } from '../lib/api/client';
import { useUserAuth } from '../auth/context/UserAuthContext';

interface PushNotificationPageProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

interface BackendSubscription {
  id: string;
  deviceType?: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  sentAt?: string | null;
}

interface ReceivedNotification {
  title: string;
  body?: string;
  icon?: string;
  image?: string;
  url?: string;
  receivedAt: string;
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export function PushNotificationsPage({ currentLang, setCurrentLang }: PushNotificationPageProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useUserAuth();
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState('Не инициализирован');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [subscriptionEndpoint, setSubscriptionEndpoint] = useState<string | null>(null);
  const [backendSubscriptions, setBackendSubscriptions] = useState<BackendSubscription[]>([]);
  const [historyItems, setHistoryItems] = useState<NotificationHistoryItem[]>([]);
  const [receivedNotifications, setReceivedNotifications] = useState<ReceivedNotification[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [sendForm, setSendForm] = useState({
    title: 'Odin Exchange',
    body: 'Тестовое Web Push уведомление.',
    url: '/',
  });

  const supportsPush = useMemo(() => {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!supportsPush) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);
  }, [supportsPush]);

  useEffect(() => {
    if (!supportsPush) {
      return undefined;
    }

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'push-notification') {
        const payload = event.data.payload as ReceivedNotification;
        setReceivedNotifications((prev) => [
          {
            ...payload,
            receivedAt: payload.receivedAt || new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [supportsPush]);

  useEffect(() => {
    if (!supportsPush) {
      return;
    }

    navigator.serviceWorker.getRegistration('/push-sw.js').then((registration) => {
      if (registration) {
        setServiceWorkerStatus('Готово');
        refreshCurrentSubscription().catch(() => undefined);
      }
    });
  }, [supportsPush]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshBackendSubscriptions().catch(() => undefined);
    }
  }, [isAuthenticated]);

  const registerServiceWorker = async () => {
    if (!supportsPush) {
      setStatusMessage('Браузер не поддерживает Service Worker или Push API.');
      return;
    }

    setIsBusy(true);
    try {
      setServiceWorkerStatus('Регистрируется...');
      await navigator.serviceWorker.register('/push-sw.js');
      setServiceWorkerStatus('Готово');
      await refreshCurrentSubscription();
    } catch (error) {
      setServiceWorkerStatus('Ошибка регистрации');
      setStatusMessage('Не удалось зарегистрировать service worker.');
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  const refreshCurrentSubscription = async () => {
    if (!supportsPush) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setSubscriptionEndpoint(subscription?.endpoint || null);
  };

  const refreshBackendSubscriptions = async () => {
    setIsBusy(true);
    try {
      const response = await api.get('/push/subscriptions');
      setBackendSubscriptions(response.data || []);
    } catch (error) {
      setStatusMessage('Не удалось загрузить подписки с сервера.');
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  const subscribeToPush = async () => {
    if (!supportsPush) {
      setStatusMessage('Ваш браузер не поддерживает Web Push.');
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      setStatusMessage('VAPID public key не настроен (VITE_VAPID_PUBLIC_KEY).');
      return;
    }

    setIsBusy(true);
    try {
      if (Notification.permission !== 'granted') {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result !== 'granted') {
          setStatusMessage('Разрешение на уведомления не предоставлено.');
          return;
        }
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const subscriptionData = subscription.toJSON();

      if (!subscriptionData.keys?.p256dh || !subscriptionData.keys?.auth) {
        setStatusMessage('Не удалось получить ключи подписки.');
        return;
      }

      await api.post('/push/subscribe', {
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys,
        deviceType: navigator.userAgent,
      });

      setSubscriptionEndpoint(subscriptionData.endpoint);
      setStatusMessage('Подписка успешно создана.');
      await refreshBackendSubscriptions();
    } catch (error) {
      setStatusMessage('Ошибка при подписке на уведомления.');
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!supportsPush) {
      return;
    }

    setIsBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setStatusMessage('Активная подписка не найдена.');
        return;
      }

      await subscription.unsubscribe();
      await api.delete('/push/unsubscribe', { data: { endpoint: subscription.endpoint } });

      setSubscriptionEndpoint(null);
      setStatusMessage('Вы отписались от уведомлений.');
      await refreshBackendSubscriptions();
    } catch (error) {
      setStatusMessage('Не удалось отписаться от уведомлений.');
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  const loadNotificationHistory = async () => {
    setIsBusy(true);
    try {
      const response = await api.get('/admin/push/history');
      setHistoryItems(response.data?.notifications || []);
    } catch (error) {
      setStatusMessage('История уведомлений недоступна (требуются права администратора).');
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  const sendTestNotification = async () => {
    if (!user?.id) {
      setStatusMessage('Не найден идентификатор пользователя.');
      return;
    }

    setIsBusy(true);
    try {
      await api.post(`/admin/push/send/user/${user.id}`, {
        title: sendForm.title,
        body: sendForm.body,
        url: sendForm.url,
      });
      setStatusMessage('Запрос на отправку уведомления отправлен.');
    } catch (error) {
      setStatusMessage('Не удалось отправить уведомление. Требуются права администратора.');
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-white">Web Push уведомления</h1>
          <p className="text-slate-300">
            Управляйте подпиской на push-уведомления и просматривайте историю отправок и полученных событий.
          </p>
        </header>

        {statusMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            {statusMessage}
          </div>
        )}

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Статус браузера</h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-300">
            <div className="rounded-xl bg-slate-800/50 p-4">
              <p className="text-slate-400">Поддержка Web Push</p>
              <p className="text-white font-medium">{supportsPush ? 'Доступна' : 'Недоступна'}</p>
            </div>
            <div className="rounded-xl bg-slate-800/50 p-4">
              <p className="text-slate-400">Разрешение уведомлений</p>
              <p className="text-white font-medium">{permission}</p>
            </div>
            <div className="rounded-xl bg-slate-800/50 p-4">
              <p className="text-slate-400">Service Worker</p>
              <p className="text-white font-medium">{serviceWorkerStatus}</p>
            </div>
            <div className="rounded-xl bg-slate-800/50 p-4">
              <p className="text-slate-400">Текущая подписка</p>
              <p className="text-white font-medium break-all">
                {subscriptionEndpoint ? 'Активна' : 'Отсутствует'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={registerServiceWorker}
              disabled={isBusy}
              className="px-4 py-2 rounded-lg bg-slate-700/70 text-white hover:bg-slate-600/70 transition-colors disabled:opacity-50"
            >
              Зарегистрировать Service Worker
            </button>
            <button
              onClick={subscribeToPush}
              disabled={isBusy || !supportsPush}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              Подписаться
            </button>
            <button
              onClick={unsubscribeFromPush}
              disabled={isBusy || !supportsPush}
              className="px-4 py-2 rounded-lg bg-slate-700/70 text-white hover:bg-slate-600/70 transition-colors disabled:opacity-50"
            >
              Отписаться
            </button>
            <button
              onClick={refreshBackendSubscriptions}
              disabled={isBusy}
              className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:text-white hover:border-slate-400 transition-colors disabled:opacity-50"
            >
              Обновить подписки
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Подписки в профиле</h2>
          {backendSubscriptions.length === 0 ? (
            <p className="text-slate-400">Нет активных подписок в профиле пользователя.</p>
          ) : (
            <div className="space-y-3">
              {backendSubscriptions.map((sub) => (
                <div key={sub.id} className="rounded-xl bg-slate-800/50 p-4 text-sm text-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">ID: {sub.id}</span>
                    <span className="text-slate-400">
                      {sub.deviceType || 'Неизвестное устройство'}
                    </span>
                  </div>
                  <div className="mt-2 text-slate-400">
                    Создано: {new Date(sub.createdAt).toLocaleString()}
                  </div>
                  {sub.lastUsedAt && (
                    <div className="text-slate-400">
                      Последнее использование: {new Date(sub.lastUsedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Отправка тестового уведомления</h2>
          <p className="text-slate-400 text-sm">
            Доступно только для аккаунтов с правами администратора (эндпоинт /admin/push/send/user/:userId).
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              Заголовок
              <input
                value={sendForm.title}
                onChange={(event) => setSendForm((prev) => ({ ...prev, title: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              URL при клике
              <input
                value={sendForm.url}
                onChange={(event) => setSendForm((prev) => ({ ...prev, url: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
          </div>
          <label className="text-sm text-slate-300">
            Текст уведомления
            <textarea
              value={sendForm.body}
              onChange={(event) => setSendForm((prev) => ({ ...prev, body: event.target.value }))}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
            />
          </label>
          <button
            onClick={sendTestNotification}
            disabled={isBusy}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            Отправить уведомление
          </button>
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-white">История отправок</h2>
            <button
              onClick={loadNotificationHistory}
              disabled={isBusy}
              className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:text-white hover:border-slate-400 transition-colors disabled:opacity-50"
            >
              Загрузить историю
            </button>
          </div>
          {historyItems.length === 0 ? (
            <p className="text-slate-400">История отправок недоступна или пуста.</p>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-800/50 p-4 text-sm text-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-slate-300">{item.body}</p>
                  <div className="mt-2 text-slate-400">
                    Отправлено: {item.sentCount} • Ошибок: {item.failedCount}
                  </div>
                  {item.sentAt && (
                    <div className="text-slate-400">Время отправки: {new Date(item.sentAt).toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Полученные уведомления</h2>
          {receivedNotifications.length === 0 ? (
            <p className="text-slate-400">Пока нет полученных уведомлений. Ожидайте push-сообщение.</p>
          ) : (
            <div className="space-y-3">
              {receivedNotifications.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-xl bg-slate-800/50 p-4 text-sm text-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-slate-400">{new Date(item.receivedAt).toLocaleString()}</span>
                  </div>
                  {item.body && <p className="mt-2 text-slate-300">{item.body}</p>}
                  {item.url && <p className="mt-2 text-slate-400">URL: {item.url}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
