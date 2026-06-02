import en from '../locales/en.json';
import ru from '../locales/ru.json';

export type Locale = 'en' | 'ru';
export type Messages = typeof en;
export type MessageKey = keyof Messages;

export const dictionaries: Record<Locale, Messages> = { en, ru };

export function translate(messages: Messages, key: MessageKey, params: Record<string, string | number> = {}) {
  return Object.entries(params).reduce((text, [name, value]) => text.replace(`{${name}}`, String(value)), messages[key]);
}
