export interface Restaurant {
  name: string;
  cuisine: string;
  region: string;
  priceLevel: 1 | 2 | 3;
  description: string;
  mapsUrl: string;
}

export const CUISINES = ['ספרדי', 'פירות ים', 'בשרים', 'טפאס', 'ים-תיכוני', 'בינלאומי', 'וגן'];

export const RESTAURANTS: Restaurant[] = [
  { name: 'El Coto de Antonio', cuisine: 'ספרדי', region: 'צפון', priceLevel: 2, description: 'מסעדת בית קלאסית עם אוכל קנרי מסורתי', mapsUrl: 'https://maps.google.com/?q=El+Coto+de+Antonio+Puerto+de+la+Cruz' },
  { name: 'Casa Domingo', cuisine: 'ספרדי', region: 'דרום', priceLevel: 2, description: 'מטבח קנרי עם נוף פנורמי לים', mapsUrl: 'https://maps.google.com/?q=Casa+Domingo+Los+Cristianos' },
  { name: 'Cofradía de Pescadores', cuisine: 'פירות ים', region: 'צפון', priceLevel: 2, description: 'מסעדת דייגים עם דגים טריים ישירות מהנמל', mapsUrl: 'https://maps.google.com/?q=Cofradia+de+Pescadores+Puerto+de+la+Cruz' },
  { name: 'La Lonja del Pescado', cuisine: 'פירות ים', region: 'דרום', priceLevel: 2, description: 'תמנון, חסילונים וקלמרי טריים ביום הדיג', mapsUrl: 'https://maps.google.com/?q=La+Lonja+del+Pescado+Los+Cristianos' },
  { name: 'Asador El Drago', cuisine: 'בשרים', region: 'צפון', priceLevel: 3, description: 'סטייקים מהגריל — חוויית אכילה מיוחדת בנוף ירוק', mapsUrl: 'https://maps.google.com/?q=Asador+El+Drago+Tenerife' },
  { name: 'La Parrilla', cuisine: 'בשרים', region: 'דרום', priceLevel: 2, description: 'גריל ארגנטינאי עם נוף לאוקיינוס', mapsUrl: 'https://maps.google.com/?q=La+Parrilla+Los+Cristianos+Tenerife' },
  { name: 'El Rincón del Toro', cuisine: 'טפאס', region: 'מרכז', priceLevel: 1, description: 'טפאס מסורתיות ויין קנרי במחירים ידידותיים', mapsUrl: 'https://maps.google.com/?q=El+Rincon+del+Toro+Tenerife' },
  { name: 'Tasca El Olivo', cuisine: 'טפאס', region: 'צפון', priceLevel: 2, description: 'ווין בר עם טפאס יצירתיות ויין מקומי', mapsUrl: 'https://maps.google.com/?q=Tasca+El+Olivo+Puerto+de+la+Cruz' },
  { name: 'Mare Nostrum', cuisine: 'ים-תיכוני', region: 'דרום', priceLevel: 3, description: 'מטבח ים-תיכוני עדין עם נוף פנורמי לים', mapsUrl: 'https://maps.google.com/?q=Mare+Nostrum+Tenerife' },
  { name: 'El Patio Canario', cuisine: 'ים-תיכוני', region: 'מרכז', priceLevel: 2, description: 'חצר קנרית קסומה עם אוכל יווני-ספרדי', mapsUrl: 'https://maps.google.com/?q=El+Patio+Canario+Tenerife' },
  { name: 'La Torre del Mirador', cuisine: 'בינלאומי', region: 'דרום', priceLevel: 3, description: 'מסעדת גג עם תפריט בינלאומי ושקיעה מדהימה', mapsUrl: 'https://maps.google.com/?q=La+Torre+del+Mirador+Tenerife' },
  { name: 'Hard Rock Cafe Tenerife', cuisine: 'בינלאומי', region: 'דרום', priceLevel: 2, description: 'המבורגרים ואווירה אמריקאית בלב הדרום', mapsUrl: 'https://maps.google.com/?q=Hard+Rock+Cafe+Tenerife' },
  { name: 'Zenzia', cuisine: 'וגן', region: 'צפון', priceLevel: 2, description: 'מטבח צמחוני יצירתי עם מצרכים מקומיים טריים', mapsUrl: 'https://maps.google.com/?q=Zenzia+Puerto+de+la+Cruz' },
  { name: 'La Verdura', cuisine: 'וגן', region: 'דרום', priceLevel: 1, description: 'סלטים, כריכים וירקות קלויים — בריא וטעים', mapsUrl: 'https://maps.google.com/?q=La+Verdura+Los+Cristianos' },
];
