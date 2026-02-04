import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface SupportChatProps {
  lang?: 'en' | 'de' | 'ru' | 'ua';
  telegramBotUrl?: string;
  telegramGroupUrl?: string;
}

const translations = {
  en: {
    title: 'Support Chat',
    subtitle: 'We usually reply within minutes',
    placeholder: 'Type your message...',
    send: 'Send',
    greeting: 'Hello! How can we help you today?',
    offline: 'Our team is currently offline. Leave a message and we\'ll get back to you.',
    telegramTitle: 'Chat on Telegram',
    telegramDesc: 'Get instant support via Telegram',
    telegramOpen: 'Open Telegram',
    telegramBot: 'Chat with Bot',
    telegramGroup: 'Join Support Group',
    liveAgent: 'Live Agent',
    options: [
      'Exchange status',
      'Payment issues',
      'Verification help',
      'Other question',
    ],
  },
  de: {
    title: 'Support Chat',
    subtitle: 'Wir antworten normalerweise innerhalb von Minuten',
    placeholder: 'Nachricht eingeben...',
    send: 'Senden',
    greeting: 'Hallo! Wie können wir Ihnen heute helfen?',
    offline: 'Unser Team ist derzeit offline. Hinterlassen Sie eine Nachricht.',
    telegramTitle: 'Chat auf Telegram',
    telegramDesc: 'Sofortige Unterstützung über Telegram',
    telegramOpen: 'Telegram öffnen',
    telegramBot: 'Mit Bot chatten',
    telegramGroup: 'Support-Gruppe beitreten',
    liveAgent: 'Live-Agent',
    options: [
      'Exchange-Status',
      'Zahlungsprobleme',
      'Verifizierungshilfe',
      'Andere Frage',
    ],
  },
  ru: {
    title: 'Чат поддержки',
    subtitle: 'Обычно отвечаем в течение нескольких минут',
    placeholder: 'Введите сообщение...',
    send: 'Отправить',
    greeting: 'Здравствуйте! Чем мы можем вам помочь?',
    offline: 'Наша команда сейчас офлайн. Оставьте сообщение, и мы свяжемся с вами.',
    telegramTitle: 'Чат в Telegram',
    telegramDesc: 'Мгновенная поддержка через Telegram',
    telegramOpen: 'Открыть Telegram',
    telegramBot: 'Чат с ботом',
    telegramGroup: 'Присоединиться к группе',
    liveAgent: 'Живой оператор',
    options: [
      'Статус обмена',
      'Проблемы с оплатой',
      'Помощь с верификацией',
      'Другой вопрос',
    ],
  },
  ua: {
    title: 'Чат підтримки',
    subtitle: 'Зазвичай відповідаємо протягом кількох хвилин',
    placeholder: 'Введіть повідомлення...',
    send: 'Надіслати',
    greeting: 'Вітаємо! Чим ми можемо вам допомогти?',
    offline: 'Наша команда зараз офлайн. Залиште повідомлення, і ми зв\'яжемось з вами.',
    telegramTitle: 'Чат у Telegram',
    telegramDesc: 'Миттєва підтримка через Telegram',
    telegramOpen: 'Відкрити Telegram',
    telegramBot: 'Чат з ботом',
    telegramGroup: 'Приєднатися до групи',
    liveAgent: 'Живий оператор',
    options: [
      'Статус обміну',
      'Проблеми з оплатою',
      'Допомога з верифікацією',
      'Інше питання',
    ],
  },
};

const autoReplies: Record<string, Record<string, string>> = {
  en: {
    'exchange status': 'To check your exchange status, please provide your order code (e.g., ODIN123ABC). You can also track it on our website.',
    'payment issues': 'For payment issues, please provide your order code and describe the problem. Common solutions: 1) Check if payment was sent to correct address 2) Wait for bank processing 3) Contact your bank if payment was rejected.',
    'verification help': 'For verification, you need: 1) Valid ID (passport/national ID) 2) Proof of address (utility bill, not older than 3 months) 3) Selfie with ID. Upload documents in your profile or send them here.',
    'other question': 'Please describe your question and we\'ll help you as soon as possible.',
    'default': 'Thank you for your message! Our support team will respond shortly. For urgent matters, you can also reach us at support@odinexchange.com',
  },
  ru: {
    'статус обмена': 'Для проверки статуса обмена, пожалуйста, укажите код заказа (например, ODIN123ABC). Вы также можете отследить его на нашем сайте.',
    'проблемы с оплатой': 'При проблемах с оплатой укажите код заказа и опишите проблему. Частые решения: 1) Проверьте, что платеж отправлен на правильный адрес 2) Дождитесь обработки банком 3) Свяжитесь с банком, если платеж отклонен.',
    'помощь с верификацией': 'Для верификации необходимы: 1) Действующий ID (паспорт/удостоверение) 2) Подтверждение адреса (счет за услуги, не старше 3 месяцев) 3) Селфи с ID. Загрузите документы в профиле или отправьте здесь.',
    'другой вопрос': 'Пожалуйста, опишите ваш вопрос, и мы поможем вам как можно скорее.',
    'default': 'Спасибо за сообщение! Наша команда поддержки ответит в ближайшее время. Для срочных вопросов: support@odinexchange.com',
  },
};

// Telegram SVG Icon
const TelegramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export function SupportChat({
  lang = 'en',
  telegramBotUrl = 'https://t.me/OdinExchangeBot',
  telegramGroupUrl = 'https://t.me/OdinExchangeSupport'
}: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'telegram'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send greeting message
      setMessages([
        {
          id: '1',
          text: t.greeting,
          sender: 'support',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateReply = (userMessage: string): string => {
    const replies = autoReplies[lang] || autoReplies['en'];
    const lowerMessage = userMessage.toLowerCase();

    for (const [key, reply] of Object.entries(replies)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return reply;
      }
    }

    return replies['default'];
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate support reply
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateReply(inputValue),
        sender: 'support',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickOption = (option: string) => {
    setInputValue(option);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-50">
        {/* Telegram quick button */}
        <a
          href={telegramBotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          title={t.telegramOpen}
        >
          <TelegramIcon />
        </a>
        {/* Main chat button */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-96 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50 transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-[520px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{t.title}</h3>
            {!isMinimized && (
              <p className="text-xs text-white/80">{t.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-white/80 hover:text-white"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-700/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>{t.liveAgent}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('telegram')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'telegram'
                  ? 'text-[#0088cc] border-b-2 border-[#0088cc] bg-slate-700/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <TelegramIcon />
                <span>Telegram</span>
              </div>
            </button>
          </div>

          {activeTab === 'chat' ? (
            <>
              {/* Messages */}
              <div className="h-[300px] overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-emerald-500 text-white rounded-br-sm'
                          : 'bg-slate-700 text-slate-200 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 rounded-2xl px-4 py-2 rounded-bl-sm">
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick options */}
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-2">
                    {t.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickOption(option)}
                        className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm rounded-full hover:bg-slate-600 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t.placeholder}
                    className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Telegram Tab */
            <div className="p-6 space-y-6">
              {/* Telegram Bot */}
              <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center">
                    <TelegramIcon />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">ODIN Exchange Bot</h4>
                    <p className="text-xs text-slate-400">@OdinExchangeBot</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  {t.telegramDesc}
                </p>
                <a
                  href={telegramBotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl font-medium transition-colors"
                >
                  <TelegramIcon />
                  <span>{t.telegramBot}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Telegram Group */}
              <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Support Community</h4>
                    <p className="text-xs text-slate-400">@OdinExchangeSupport</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Join our community for updates and peer support
                </p>
                <a
                  href={telegramGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>{t.telegramGroup}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span>24/7 Support Available</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SupportChat;
