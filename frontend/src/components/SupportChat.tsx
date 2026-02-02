import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface SupportChatProps {
  lang?: 'en' | 'de' | 'ru' | 'ua';
}

const translations = {
  en: {
    title: 'Support Chat',
    subtitle: 'We usually reply within minutes',
    placeholder: 'Type your message...',
    send: 'Send',
    greeting: 'Hello! How can we help you today?',
    offline: 'Our team is currently offline. Leave a message and we\'ll get back to you.',
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

export function SupportChat({ lang = 'en' }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:scale-110 transition-transform z-50"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-96 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50 transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-[500px]'
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
          {/* Messages */}
          <div className="h-[340px] overflow-y-auto p-4 space-y-4">
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
      )}
    </div>
  );
}

export default SupportChat;
