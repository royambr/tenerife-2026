export interface Restaurant {
  name: string;
  cuisine: string;
  region: string;
  priceLevel: 1 | 2 | 3;
  description: string;
  mapsUrl: string;
  rating: number;
  meals: ('breakfast' | 'lunch' | 'dinner')[];
}

export const CUISINES = ['ספרדי', 'פירות ים', 'בשרים', 'טפאס', 'ים-תיכוני', 'בינלאומי', 'וגן'];

export const RESTAURANTS: Restaurant[] = [
  // ─── ספרדי / קנרי ───
  { name: 'El Coto de Antonio',       cuisine: 'ספרדי',     region: 'צפון', priceLevel: 2, rating: 4.6, meals: ['lunch','dinner'],            description: 'מסעדת בית קלאסית עם אוכל קנרי מסורתי',               mapsUrl: 'https://maps.google.com/?q=El+Coto+de+Antonio+Puerto+de+la+Cruz' },
  { name: 'Casa Domingo',             cuisine: 'ספרדי',     region: 'דרום', priceLevel: 2, rating: 4.2, meals: ['lunch','dinner'],            description: 'מטבח קנרי עם נוף פנורמי לים',                         mapsUrl: 'https://maps.google.com/?q=Casa+Domingo+Los+Cristianos' },
  { name: 'La Hierbita',              cuisine: 'ספרדי',     region: 'צפון', priceLevel: 2, rating: 4.5, meals: ['lunch','dinner'],            description: 'מסעדה היסטורית ב-La Laguna עם מטבח קנרי אותנטי',     mapsUrl: 'https://maps.google.com/?q=La+Hierbita+La+Laguna+Tenerife' },
  { name: 'El Guanche',               cuisine: 'ספרדי',     region: 'מרכז', priceLevel: 1, rating: 4.3, meals: ['breakfast','lunch','dinner'], description: 'אוכל קנרי עממי — פאפאס ארוגדס ומוחו אמיתי',           mapsUrl: 'https://maps.google.com/?q=El+Guanche+Tenerife' },
  { name: 'Bodegón Canario',          cuisine: 'ספרדי',     region: 'צפון', priceLevel: 2, rating: 4.4, meals: ['lunch','dinner'],            description: 'יין מקומי ומנות מסורתיות בסביבה כפרית',               mapsUrl: 'https://maps.google.com/?q=Bodegon+Canario+Tenerife' },
  { name: 'Guachinche Casa Bernardo', cuisine: 'ספרדי',     region: 'צפון', priceLevel: 1, rating: 4.6, meals: ['lunch','dinner'],            description: 'גוואצ\'ינצ\'ה כפרית — יין בית, גבינה ובשר קנרי',    mapsUrl: 'https://maps.google.com/?q=Guachinche+Casa+Bernardo+Tenerife' },
  { name: 'Restaurante Guayarmina',   cuisine: 'ספרדי',     region: 'צפון', priceLevel: 2, rating: 4.6, meals: ['lunch','dinner'],            description: 'מסעדת מורשת בלב הכפר קנרי — מנות עונתיות',           mapsUrl: 'https://maps.google.com/?q=Guayarmina+Tenerife' },
  { name: 'La Posada de Juan Carlos', cuisine: 'ספרדי',     region: 'דרום', priceLevel: 3, rating: 4.8, meals: ['dinner'],                    description: 'כוכב מישלן — מטבח קנרי יצירתי ואלגנטי',              mapsUrl: 'https://maps.google.com/?q=La+Posada+de+Juan+Carlos+Tenerife' },
  { name: 'Restaurante La Pasadita',  cuisine: 'ספרדי',     region: 'מרכז', priceLevel: 1, rating: 4.4, meals: ['lunch','dinner'],            description: 'מסעדת שכונה — ראנצ\'ו קנרי, סנקוצ\'ו ועוד',         mapsUrl: 'https://maps.google.com/?q=La+Pasadita+Santa+Cruz+Tenerife' },

  // ─── פירות ים ───
  { name: 'Cofradía de Pescadores',   cuisine: 'פירות ים',  region: 'צפון', priceLevel: 2, rating: 4.5, meals: ['lunch','dinner'],            description: 'מסעדת דייגים עם דגים טריים ישירות מהנמל',             mapsUrl: 'https://maps.google.com/?q=Cofradia+de+Pescadores+Puerto+de+la+Cruz' },
  { name: 'La Lonja del Pescado',     cuisine: 'פירות ים',  region: 'דרום', priceLevel: 2, rating: 4.4, meals: ['lunch','dinner'],            description: 'תמנון, חסילונים וקלמרי טריים ביום הדיג',              mapsUrl: 'https://maps.google.com/?q=La+Lonja+del+Pescado+Los+Cristianos' },
  { name: 'El Duende del Fuego',      cuisine: 'פירות ים',  region: 'צפון', priceLevel: 3, rating: 4.7, meals: ['dinner'],                    description: 'לובסטר וסלמון אטלנטי — מסעדת ים בכיתה בינלאומית',    mapsUrl: 'https://maps.google.com/?q=El+Duende+del+Fuego+Tenerife' },
  { name: 'El Pescador',              cuisine: 'פירות ים',  region: 'דרום', priceLevel: 2, rating: 4.1, meals: ['lunch','dinner'],            description: 'פרוויל דגים קנרי — גריל פשוט וטעים',                  mapsUrl: 'https://maps.google.com/?q=El+Pescador+Los+Gigantes+Tenerife' },
  { name: 'Marisquería El Puerto',    cuisine: 'פירות ים',  region: 'מרכז', priceLevel: 3, rating: 4.6, meals: ['lunch','dinner'],            description: 'חסילונים, צדפות ומרקי ים בנמל סנטה קרוז',             mapsUrl: 'https://maps.google.com/?q=Marisqueria+El+Puerto+Santa+Cruz+Tenerife' },
  { name: 'Restaurante Kaibo',        cuisine: 'פירות ים',  region: 'צפון', priceLevel: 3, rating: 4.7, meals: ['lunch','dinner'],            description: 'מסעדת דגים על המים — נוף לאוקיינוס וחסילונים טריים', mapsUrl: 'https://maps.google.com/?q=Kaibo+Puerto+de+la+Cruz+Tenerife' },
  { name: 'El Pez Gordo',             cuisine: 'פירות ים',  region: 'צפון', priceLevel: 2, rating: 4.5, meals: ['lunch','dinner'],            description: 'דגים גריל ים-תיכוני בסגנון ספרדי בנמל',               mapsUrl: 'https://maps.google.com/?q=El+Pez+Gordo+Puerto+de+la+Cruz+Tenerife' },
  { name: 'El Médano Restaurante',    cuisine: 'פירות ים',  region: 'דרום', priceLevel: 2, rating: 4.3, meals: ['lunch','dinner'],            description: 'סביצ\'ה, דגי אטלנטי וטפאס ים ליד חוף הקייטסורפינג', mapsUrl: 'https://maps.google.com/?q=El+Medano+Restaurante+Tenerife' },

  // ─── בשרים ───
  { name: 'Asador El Drago',          cuisine: 'בשרים',     region: 'צפון', priceLevel: 3, rating: 4.5, meals: ['lunch','dinner'],            description: 'סטייקים מהגריל — חוויית אכילה מיוחדת בנוף ירוק',     mapsUrl: 'https://maps.google.com/?q=Asador+El+Drago+Tenerife' },
  { name: 'La Parrilla',              cuisine: 'בשרים',     region: 'דרום', priceLevel: 2, rating: 4.2, meals: ['lunch','dinner'],            description: 'גריל ארגנטינאי עם נוף לאוקיינוס',                     mapsUrl: 'https://maps.google.com/?q=La+Parrilla+Los+Cristianos+Tenerife' },
  { name: 'El Asador de Tenerife',    cuisine: 'בשרים',     region: 'מרכז', priceLevel: 2, rating: 4.4, meals: ['lunch','dinner'],            description: 'מנות בשר מקומיות, כבש ועז קנריים בגריל פחם',          mapsUrl: 'https://maps.google.com/?q=El+Asador+de+Tenerife' },
  { name: 'Carne & Brasa',            cuisine: 'בשרים',     region: 'דרום', priceLevel: 3, rating: 4.6, meals: ['dinner'],                    description: 'אנטרקוט ואיבר שחור איברי — בחירת הבשרים הטובה בדרום', mapsUrl: 'https://maps.google.com/?q=Carne+Brasa+Costa+Adeje+Tenerife' },
  { name: 'Mesón Las Lanzas',         cuisine: 'בשרים',     region: 'דרום', priceLevel: 2, rating: 4.3, meals: ['lunch','dinner'],            description: 'מסון ספרדי קלאסי — בשר בגריל עץ ויין בית',            mapsUrl: 'https://maps.google.com/?q=Meson+Las+Lanzas+Tenerife' },

  // ─── טפאס ───
  { name: 'El Rincón del Toro',       cuisine: 'טפאס',      region: 'מרכז', priceLevel: 1, rating: 4.3, meals: ['breakfast','lunch','dinner'], description: 'טפאס מסורתיות ויין קנרי במחירים ידידותיים',            mapsUrl: 'https://maps.google.com/?q=El+Rincon+del+Toro+Tenerife' },
  { name: 'Tasca El Olivo',           cuisine: 'טפאס',      region: 'צפון', priceLevel: 2, rating: 4.5, meals: ['lunch','dinner'],            description: 'בר יין עם טפאס יצירתיות ויין מקומי',                  mapsUrl: 'https://maps.google.com/?q=Tasca+El+Olivo+Puerto+de+la+Cruz' },
  { name: 'La Bodeguita',             cuisine: 'טפאס',      region: 'מרכז', priceLevel: 1, rating: 4.2, meals: ['breakfast','lunch','dinner'], description: 'בר טפאס עממי עם פינצ\'וס ותמחיר כוס',                mapsUrl: 'https://maps.google.com/?q=La+Bodeguita+Santa+Cruz+Tenerife' },
  { name: 'El Bar de Mercado',        cuisine: 'טפאס',      region: 'צפון', priceLevel: 1, rating: 4.4, meals: ['breakfast','lunch'],         description: 'טפאס בבוקר בשוק La Laguna — חוויה אורבנית',           mapsUrl: 'https://maps.google.com/?q=Mercado+La+Laguna+Tenerife' },
  { name: 'Tasca Tierras del Sur',    cuisine: 'טפאס',      region: 'דרום', priceLevel: 2, rating: 4.3, meals: ['lunch','dinner'],            description: 'טפאס קנריות עם פלטת גבינות ונקניקים מקומיים',         mapsUrl: 'https://maps.google.com/?q=Tasca+Tierras+del+Sur+Tenerife' },
  { name: 'El Enyesque',              cuisine: 'טפאס',      region: 'דרום', priceLevel: 2, rating: 4.6, meals: ['lunch','dinner'],            description: 'טפאס יצירתיות של שף — מוצרים קנריים מקומיים',         mapsUrl: 'https://maps.google.com/?q=El+Enyesque+Tenerife' },
  { name: 'La Covacha',               cuisine: 'טפאס',      region: 'מרכז', priceLevel: 1, rating: 4.3, meals: ['breakfast','lunch','dinner'], description: 'בר אבן קטן וחמים — טפאס מסורתיות בלב סנטה קרוז',      mapsUrl: 'https://maps.google.com/?q=La+Covacha+Santa+Cruz+Tenerife' },
  { name: 'Tasca La Rampa',           cuisine: 'טפאס',      region: 'מרכז', priceLevel: 1, rating: 4.4, meals: ['lunch','dinner'],            description: 'אווירת בר ספרדי קלאסי, טפאס, יין ובירה מקומית',       mapsUrl: 'https://maps.google.com/?q=Tasca+La+Rampa+Santa+Cruz+Tenerife' },

  // ─── ים-תיכוני ───
  { name: 'Mare Nostrum',             cuisine: 'ים-תיכוני', region: 'דרום', priceLevel: 3, rating: 4.7, meals: ['dinner'],                    description: 'מטבח ים-תיכוני עדין עם נוף פנורמי לים',              mapsUrl: 'https://maps.google.com/?q=Mare+Nostrum+Tenerife' },
  { name: 'El Patio Canario',         cuisine: 'ים-תיכוני', region: 'מרכז', priceLevel: 2, rating: 4.3, meals: ['lunch','dinner'],            description: 'חצר קנרית קסומה עם אוכל יווני-ספרדי',                mapsUrl: 'https://maps.google.com/?q=El+Patio+Canario+Tenerife' },
  { name: 'Chez Germain',             cuisine: 'ים-תיכוני', region: 'צפון', priceLevel: 3, rating: 4.8, meals: ['lunch','dinner'],            description: 'ביסטרו צרפתי-ים-תיכוני — אחת המסעדות הטובות בטנריף',  mapsUrl: 'https://maps.google.com/?q=Chez+Germain+Puerto+de+la+Cruz+Tenerife' },
  { name: 'Kazan',                    cuisine: 'ים-תיכוני', region: 'דרום', priceLevel: 3, rating: 4.6, meals: ['lunch','dinner'],            description: 'מטבח לבנטיני-ים-תיכוני עם אווירת גן',                mapsUrl: 'https://maps.google.com/?q=Kazan+Costa+Adeje+Tenerife' },
  { name: 'Restaurante Valle del Mar', cuisine: 'ים-תיכוני',region: 'צפון', priceLevel: 2, rating: 4.5, meals: ['lunch','dinner'],            description: 'מטבח ים-תיכוני עם נוף לאטלנטיק ופירות ים טריים',     mapsUrl: 'https://maps.google.com/?q=Restaurante+Valle+del+Mar+Tenerife' },
  { name: 'Restaurante Azul',         cuisine: 'ים-תיכוני', region: 'דרום', priceLevel: 2, rating: 4.4, meals: ['lunch','dinner'],            description: 'ממנות יווניות ועד לבנוניות — ים-תיכוני בדרום',        mapsUrl: 'https://maps.google.com/?q=Restaurante+Azul+Costa+Adeje+Tenerife' },

  // ─── בינלאומי ───
  { name: 'La Torre del Mirador',     cuisine: 'בינלאומי',  region: 'דרום', priceLevel: 3, rating: 4.5, meals: ['dinner'],                    description: 'מסעדת גג עם תפריט בינלאומי ושקיעה מדהימה',            mapsUrl: 'https://maps.google.com/?q=La+Torre+del+Mirador+Tenerife' },
  { name: 'Restaurante El Risco',     cuisine: 'בינלאומי',  region: 'צפון', priceLevel: 3, rating: 4.7, meals: ['lunch','dinner'],            description: 'נוף מרהיב למצוקים ומטבח פיוז\'ן בינלאומי-קנרי',      mapsUrl: 'https://maps.google.com/?q=El+Risco+Garachico+Tenerife' },
  { name: 'Twelve Degrees',           cuisine: 'בינלאומי',  region: 'דרום', priceLevel: 3, rating: 4.4, meals: ['breakfast','lunch','dinner'], description: 'מסעדת מלון בוטיק עם תפריט יצירתי ונוף לבריכה',        mapsUrl: 'https://maps.google.com/?q=Twelve+Degrees+Costa+Adeje+Tenerife' },
  { name: 'Nomada Urban Kitchen',     cuisine: 'בינלאומי',  region: 'מרכז', priceLevel: 2, rating: 4.5, meals: ['lunch','dinner'],            description: 'מטבח אורבני יצירתי — פיוז\'ן עם מצרכים קנריים',      mapsUrl: 'https://maps.google.com/?q=Nomada+Urban+Kitchen+Santa+Cruz+Tenerife' },
  { name: 'Restaurante Abama',        cuisine: 'בינלאומי',  region: 'דרום', priceLevel: 3, rating: 4.9, meals: ['dinner'],                    description: 'שני כוכבי מישלן — אחת הרשויות הגסטרונומיות בספרד',    mapsUrl: 'https://maps.google.com/?q=Abama+Restaurant+Tenerife' },
  { name: 'La Quinta Roja',           cuisine: 'בינלאומי',  region: 'צפון', priceLevel: 2, rating: 4.5, meals: ['breakfast','lunch'],         description: 'בית קפה בפאטיו היסטורי — בוקר אירופאי ועוגות',        mapsUrl: 'https://maps.google.com/?q=La+Quinta+Roja+Garachico+Tenerife' },
  { name: 'Café El Morisco',          cuisine: 'בינלאומי',  region: 'צפון', priceLevel: 1, rating: 4.4, meals: ['breakfast','lunch'],         description: 'קפה מסוגנן עם פסטה, סנדוויצ\'ים ובוקר שלם',           mapsUrl: 'https://maps.google.com/?q=Cafe+El+Morisco+Puerto+de+la+Cruz' },

  // ─── וגן ───
  { name: 'Zenzia',                   cuisine: 'וגן',       region: 'צפון', priceLevel: 2, rating: 4.5, meals: ['breakfast','lunch','dinner'], description: 'מטבח צמחוני יצירתי עם מצרכים מקומיים טריים',          mapsUrl: 'https://maps.google.com/?q=Zenzia+Puerto+de+la+Cruz' },
  { name: 'La Verdura',               cuisine: 'וגן',       region: 'דרום', priceLevel: 1, rating: 4.1, meals: ['breakfast','lunch'],         description: 'סלטים, כריכים וירקות קלויים — בריא וטעים',            mapsUrl: 'https://maps.google.com/?q=La+Verdura+Los+Cristianos' },
  { name: 'Roots Kitchen',            cuisine: 'וגן',       region: 'צפון', priceLevel: 2, rating: 4.6, meals: ['breakfast','lunch','dinner'], description: 'תפריט טבעוני מלא — בורגרים, קארי וקינוחים ללא חלב',  mapsUrl: 'https://maps.google.com/?q=Roots+Kitchen+Puerto+de+la+Cruz+Tenerife' },
  { name: 'El Jardín Verde',          cuisine: 'וגן',       region: 'מרכז', priceLevel: 2, rating: 4.3, meals: ['lunch','dinner'],            description: 'מסעדת גינה ירוקה עם מנות טבעוניות מקומיות',           mapsUrl: 'https://maps.google.com/?q=El+Jardin+Verde+La+Laguna+Tenerife' },
];
