export interface Phrase {
  category: string;
  es: string;
  he: string;
  phonetic: string;
}

export const PHRASES: Phrase[] = [
  { category: 'ברכות', es: 'Hola', he: 'שלום', phonetic: 'אולה' },
  { category: 'ברכות', es: 'Buenos días', he: 'בוקר טוב', phonetic: 'בואנוס דיאס' },
  { category: 'ברכות', es: 'Buenas noches', he: 'לילה טוב', phonetic: 'בואנאס נוצ׳ס' },
  { category: 'ברכות', es: 'Gracias', he: 'תודה', phonetic: 'גראסיאס' },
  { category: 'ברכות', es: 'Por favor', he: 'בבקשה', phonetic: 'פור פבור' },
  { category: 'ברכות', es: '¿Habla inglés?', he: 'אתה מדבר אנגלית?', phonetic: 'אבלה אינגלס?' },
  { category: 'אוכל ושתייה', es: 'Una cerveza, por favor', he: 'בירה אחת בבקשה', phonetic: 'אונה סרבסה, פור פבור' },
  { category: 'אוכל ושתייה', es: 'La cuenta, por favor', he: 'את החשבון בבקשה', phonetic: 'לה קואנטה, פור פבור' },
  { category: 'אוכל ושתייה', es: '¿Qué recomienda?', he: 'מה מומלץ?', phonetic: 'קה רקומיאנדה?' },
  { category: 'אוכל ושתייה', es: 'Está delicioso', he: 'זה טעים מאוד', phonetic: 'אסטה דליסיוסו' },
  { category: 'אוכל ושתייה', es: 'Sin gluten', he: 'ללא גלוטן', phonetic: 'סין גלוטן' },
  { category: 'תחבורה', es: '¿Dónde está...?', he: 'איפה נמצא...?', phonetic: 'דונדה אסטה...?' },
  { category: 'תחבורה', es: '¿Cuánto cuesta?', he: 'כמה זה עולה?', phonetic: 'קואנטו קואסטה?' },
  { category: 'תחבורה', es: 'A la playa', he: 'לחוף הים', phonetic: 'א לה פלאיה' },
  { category: 'תחבורה', es: 'Al aeropuerto', he: 'לשדה התעופה', phonetic: 'אל אארופוארטו' },
  { category: 'חירום', es: '¡Ayuda!', he: 'עזרה!', phonetic: 'איודה!' },
  { category: 'חירום', es: 'Llame a la policía', he: 'קראו למשטרה', phonetic: 'יאמה א לה פוליסיה' },
  { category: 'חירום', es: 'Necesito un médico', he: 'אני צריך רופא', phonetic: 'נסיסיטו און מדיקו' },
  { category: 'חירום', es: 'Me han robado', he: 'נגנב ממני', phonetic: 'מה אן רובאדו' },
  { category: 'חירום', es: '¿Dónde está el hospital?', he: 'איפה בית החולים?', phonetic: 'דונדה אסטה אל אוספיטל?' },
];

export const PHRASE_CATEGORIES = ['ברכות', 'אוכל ושתייה', 'תחבורה', 'חירום'];
