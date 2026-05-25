export interface Restaurant {
  name: string;
  cuisine: string;
  region: string;
  priceLevel: 1 | 2 | 3;
  description: string;
  mapsUrl: string;
  rating: number; // out of 5
}

export const CUISINES = ['ספרדי', 'פירות ים', 'בשרים', 'טפאס', 'ים-תיכוני', 'בינלאומי', 'וגן'];

export const RESTAURANTS: Restaurant[] = [
  { name: 'El Coto de Antonio', cuisine: 'ספרדי', region: 'צפון', priceLevel: 2, rating: 4.6, description: 'מסעדת בית קלאסית עם אוכל קנרי מסורתי', mapsUrl: 'https://maps.google.com/?q=El+Coto+de+Antonio+Puerto+de+la+Cruz' },
  { name: 'Casa Domingo', cuisine: 'ספרדי', region: 'דרום', priceLevel: 2, rating: 4.2, description: 'מטבח קנרי עם נוף פנורמי לים', mapsUrl: 'https://maps.google.com/?q=Casa+Domingo+Los+Cristianos' },
  { name: 'La Hierbita', cuisine: 'ספרדי', region: 'צפון', priceLevel: 2, rating: 4.5, description: 'מסעדה היסטורית ב-La Laguna עם מטבח קנרי אותנטי', mapsUrl: 'https://maps.google.com/?q=La+Hierbita+La+Laguna+Tenerife' },
  { name: 'El Guanche', cuisine: 'ספרדי', region: 'מרכז', priceLevel: 1, rating: 4.3, description: 'אוכל קנרי עממי — פאפאס ארוגדס ומוחו אמיתי', mapsUrl: 'https://maps.google.com/?q=El+Guanche+Tenerife' },
  { name: 'Bodegón Canario', cuisine: 'ספרדי', region: 'צפון', priceLevel: 2, rating: 4.4, description: 'יין מקומי ומנות מסורתיות בסביבה כפרית', mapsUrl: 'https://maps.google.com/?q=Bodegon+Canario+Tenerife' },
  { name: 'Cofradía de Pescadores', cuisine: 'פירות ים', region: 'צפון', priceLevel: 2, rating: 4.5, description: 'מסעדת דייגים עם דגים טריים ישירות מהנמל', mapsUrl: 'https://maps.google.com/?q=Cofradia+de+Pescadores+Puerto+de+la+Cruz' },
  { name: 'La Lonja del Pescado', cuisine: 'פירות ים', region: 'דרום', priceLevel: 2, rating: 4.4, description: 'תמנון, חסילונים וקלמרי טריים ביום הדיג', mapsUrl: 'https://maps.google.com/?q=La+Lonja+del+Pescado+Los+Cristianos' },
  { name: 'El Duende del Fuego', cuisine: 'פירות ים', region: 'צפון', priceLevel: 3, rating: 4.7, description: 'לובסטר וסלמון אטלנטי — מסעדת ים בכיתה בינלאומית', mapsUrl: 'https://maps.google.com/?q=El+Duende+del+Fuego+Tenerife' },
  { name: 'El Pescador', cuisine: 'פירות ים', region: 'דרום', priceLevel: 2, rating: 4.1, description: 'פרוויל דגים קנרי — גריל פשוט וטעים', mapsUrl: 'https://maps.google.com/?q=El+Pescador+Los+Gigantes+Tenerife' },
  { name: 'Marisquería El Puerto', cuisine: 'פירות ים', region: 'מרכז', priceLevel: 3, rating: 4.6, description: 'חסילונים, צדפות ומרקי ים בנמל סנטה קרוז', mapsUrl: 'https://maps.google.com/?q=Marisqueria+El+Puerto+Santa+Cruz+Tenerife' },
  { name: 'Asador El Drago', cuisine: 'בשרים', region: 'צפון', priceLevel: 3, rating: 4.5, description: 'סטייקים מהגריל — חוויית אכילה מיוחדת בנוף ירוק', mapsUrl: 'https://maps.google.com/?q=Asador+El+Drago+Tenerife' },
  { name: 'La Parrilla', cuisine: 'בשרים', region: 'דרום', priceLevel: 2, rating: 4.2, description: 'גריל ארגנטינאי עם נוף לאוקיינוס', mapsUrl: 'https://maps.google.com/?q=La+Parrilla+Los+Cristianos+Tenerife' },
  { name: 'El Asador de Tenerife', cuisine: 'בשרים', region: 'מרכז', priceLevel: 2, rating: 4.4, description: 'מנות בשר מקומיות, כבש ועז קנריים בגריל פחם', mapsUrl: 'https://maps.google.com/?q=El+Asador+de+Tenerife' },
  { name: 'Carne & Brasa', cuisine: 'בשרים', region: 'דרום', priceLevel: 3, rating: 4.6, description: 'אנטרקוט ואיבר שחור איברי — בחירת הבשרים הטובה בדרום', mapsUrl: 'https://maps.google.com/?q=Carne+Brasa+Costa+Adeje+Tenerife' },
  { name: 'El Rincón del Toro', cuisine: 'טפאס', region: 'מרכז', priceLevel: 1, rating: 4.3, description: 'טפאס מסורתיות ויין קנרי במחירים ידידותיים', mapsUrl: 'https://maps.google.com/?q=El+Rincon+del+Toro+Tenerife' },
  { name: 'Tasca El Olivo', cuisine: 'טפאס', region: 'צפון', priceLevel: 2, rating: 4.5, description: 'בר יין עם טפאס יצירתיות ויין מקומי', mapsUrl: 'https://maps.google.com/?q=Tasca+El+Olivo+Puerto+de+la+Cruz' },
  { name: 'La Bodeguita', cuisine: 'טפאס', region: 'מרכז', priceLevel: 1, rating: 4.2, description: 'בר טפאס עממי עם פינצ\'וס ותמחיר כוס', mapsUrl: 'https://maps.google.com/?q=La+Bodeguita+Santa+Cruz+Tenerife' },
  { name: 'El Bar de Mercado', cuisine: 'טפאס', region: 'צפון', priceLevel: 1, rating: 4.4, description: 'טפאס בבוקר בשוק La Laguna — חוויה אורבנית', mapsUrl: 'https://maps.google.com/?q=Mercado+La+Laguna+Tenerife' },
  { name: 'Tasca Tierras del Sur', cuisine: 'טפאס', region: 'דרום', priceLevel: 2, rating: 4.3, description: 'טפאס קנריות עם פלטת גבינות ונקניקים מקומיים', mapsUrl: 'https://maps.google.com/?q=Tasca+Tierras+del+Sur+Tenerife' },
  { name: 'Mare Nostrum', cuisine: 'ים-תיכוני', region: 'דרום', priceLevel: 3, rating: 4.7, description: 'מטבח ים-תיכוני עדין עם נוף פנורמי לים', mapsUrl: 'https://maps.google.com/?q=Mare+Nostrum+Tenerife' },
  { name: 'El Patio Canario', cuisine: 'ים-תיכוני', region: 'מרכז', priceLevel: 2, rating: 4.3, description: 'חצר קנרית קסומה עם אוכל יווני-ספרדי', mapsUrl: 'https://maps.google.com/?q=El+Patio+Canario+Tenerife' },
  { name: 'Chez Germain', cuisine: 'ים-תיכוני', region: 'צפון', priceLevel: 3, rating: 4.8, description: 'ביסטרו צרפתי-ים-תיכוני — אחת המסעדות הטובות בטנריף', mapsUrl: 'https://maps.google.com/?q=Chez+Germain+Puerto+de+la+Cruz+Tenerife' },
  { name: 'Kazan', cuisine: 'ים-תיכוני', region: 'דרום', priceLevel: 3, rating: 4.6, description: 'מטבח לבנטיני-ים-תיכוני עם אווירת גן', mapsUrl: 'https://maps.google.com/?q=Kazan+Costa+Adeje+Tenerife' },
  { name: 'La Torre del Mirador', cuisine: 'בינלאומי', region: 'דרום', priceLevel: 3, rating: 4.5, description: 'מסעדת גג עם תפריט בינלאומי ושקיעה מדהימה', mapsUrl: 'https://maps.google.com/?q=La+Torre+del+Mirador+Tenerife' },
  { name: 'Hard Rock Cafe Tenerife', cuisine: 'בינלאומי', region: 'דרום', priceLevel: 2, rating: 4.0, description: 'המבורגרים ואווירה אמריקאית בלב הדרום', mapsUrl: 'https://maps.google.com/?q=Hard+Rock+Cafe+Tenerife' },
  { name: 'Restaurante El Risco', cuisine: 'בינלאומי', region: 'צפון', priceLevel: 3, rating: 4.7, description: 'נוף מרהיב למצוקים ומטבח פיוז\'ן בינלאומי-קנרי', mapsUrl: 'https://maps.google.com/?q=El+Risco+Garachico+Tenerife' },
  { name: 'Twelve Degrees', cuisine: 'בינלאומי', region: 'דרום', priceLevel: 3, rating: 4.4, description: 'מסעדת מלון בוטיק עם תפריט יצירתי ונוף לבריכה', mapsUrl: 'https://maps.google.com/?q=Twelve+Degrees+Costa+Adeje+Tenerife' },
  { name: 'Zenzia', cuisine: 'וגן', region: 'צפון', priceLevel: 2, rating: 4.5, description: 'מטבח צמחוני יצירתי עם מצרכים מקומיים טריים', mapsUrl: 'https://maps.google.com/?q=Zenzia+Puerto+de+la+Cruz' },
  { name: 'La Verdura', cuisine: 'וגן', region: 'דרום', priceLevel: 1, rating: 4.1, description: 'סלטים, כריכים וירקות קלויים — בריא וטעים', mapsUrl: 'https://maps.google.com/?q=La+Verdura+Los+Cristianos' },
  { name: 'Roots Kitchen', cuisine: 'וגן', region: 'צפון', priceLevel: 2, rating: 4.6, description: 'תפריט טבעוני מלא — בורגרים, קארי וקינוחים ללא חלב', mapsUrl: 'https://maps.google.com/?q=Roots+Kitchen+Puerto+de+la+Cruz+Tenerife' },
  { name: 'El Jardín Verde', cuisine: 'וגן', region: 'מרכז', priceLevel: 2, rating: 4.3, description: 'מסעדת גינה ירוקה עם מנות טבעוניות מקומיות', mapsUrl: 'https://maps.google.com/?q=El+Jardin+Verde+La+Laguna+Tenerife' },
];
