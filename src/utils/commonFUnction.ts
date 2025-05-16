import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function getFormattedPhoneNumber(rawMobile?: string | number): string {
  if (!rawMobile) return "-";

  const mobile = `+${String(rawMobile)}`;
  const phoneNumber = parsePhoneNumberFromString(mobile);


  return phoneNumber?.formatInternational() || "-";
}

export const safeSplit = (text: string | undefined | null, delimiter: string = '_'): string[] => {
  if (!text || typeof text !== 'string') return [];
  try {
    return text.split(delimiter);
  } catch (error) {
    console.error('Error in safeSplit:', error);
    return [];
  }
};

export const capitalizeLabel = (text: string | undefined | null): string => {
  if (!text) return '';
  return safeSplit(text)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};