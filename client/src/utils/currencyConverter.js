// Currency conversion utility
// Note: These are approximate exchange rates. For production, use a real-time API like exchangerate-api.com

const EXCHANGE_RATES = {
  // Base: USD = 1
  USD: 1,
  // South Asia
  PKR: 278.5,  // Pakistani Rupee
  INR: 83.0,   // Indian Rupee
  BDT: 110.0,  // Bangladeshi Taka
  LKR: 325.0,  // Sri Lankan Rupee
  NPR: 133.0,  // Nepalese Rupee
  AFN: 70.0,   // Afghan Afghani
  // Southeast Asia
  SGD: 1.35,   // Singapore Dollar
  MYR: 4.75,   // Malaysian Ringgit
  THB: 36.0,   // Thai Baht
  IDR: 15700,  // Indonesian Rupiah
  PHP: 56.0,   // Philippine Peso
  VND: 24500,  // Vietnamese Dong
  MMK: 2100,   // Myanmar Kyat
  KHR: 4100,   // Cambodian Riel
  LAK: 21000,  // Lao Kip
  BND: 1.35,   // Brunei Dollar
  // East Asia
  CNY: 7.2,    // Chinese Yuan
  JPY: 150.0,  // Japanese Yen
  KRW: 1330,   // South Korean Won
  TWD: 32.0,   // Taiwan Dollar
  MNT: 3400,   // Mongolian Tugrik
  HKD: 7.8,    // Hong Kong Dollar
  MOP: 8.0,    // Macanese Pataca
  // Middle East
  AED: 3.67,   // UAE Dirham
  SAR: 3.75,   // Saudi Riyal
  QAR: 3.64,   // Qatari Riyal
  KWD: 0.31,   // Kuwaiti Dinar
  BHD: 0.38,   // Bahraini Dinar
  OMR: 0.38,   // Omani Rial
  JOD: 0.71,   // Jordanian Dinar
  LBP: 15000,  // Lebanese Pound
  IQD: 1310,   // Iraqi Dinar
  IRR: 42000,  // Iranian Rial
  ILS: 3.7,    // Israeli Shekel
  TRY: 32.0,   // Turkish Lira
  // Central Asia
  KZT: 450,    // Kazakhstani Tenge
  UZS: 12300,  // Uzbekistani Som
  KGS: 89.0,   // Kyrgyzstani Som
  // Europe
  EUR: 0.92,
  GBP: 0.79,
  CHF: 0.88,
  SEK: 10.5,
  NOK: 10.8,
  DKK: 6.85,
  PLN: 4.0,
  CZK: 23.0,   // Czech Koruna
  RON: 4.6,    // Romanian Leu
  HUF: 360,    // Hungarian Forint
  BGN: 1.8,    // Bulgarian Lev
  // North America
  CAD: 1.35,
  MXN: 17.0,
  // Oceania
  AUD: 1.52,
  NZD: 1.65,   // New Zealand Dollar
  FJD: 2.25,   // Fijian Dollar
  // South America
  BRL: 4.95,
  ARS: 850,
  CLP: 950,
  COP: 3900,   // Colombian Peso
  PEN: 3.7,    // Peruvian Sol
  VES: 36.0,   // Venezuelan Bolívar
  // Africa
  ZAR: 18.5,
  EGP: 31.0,
  NGN: 1600,
  KES: 130,    // Kenyan Shilling
  GHS: 12.0,   // Ghanaian Cedi
  MAD: 10.0,   // Moroccan Dirham
  TND: 3.1,    // Tunisian Dinar
  DZD: 135,    // Algerian Dinar
  ETB: 56.0,   // Ethiopian Birr
  TZS: 2500    // Tanzanian Shilling
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;
  
  return convertedAmount;
};

export const formatCurrency = (amount, currency = 'USD', showConverted = false, targetCurrency = null) => {
  if (showConverted && targetCurrency && targetCurrency !== currency) {
    const converted = convertCurrency(amount, currency, targetCurrency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency
    }).format(converted);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount || 0);
};

export const getAllCurrencies = () => {
  return Object.keys(EXCHANGE_RATES).sort();
};

export const getCurrencyName = (code) => {
  const names = {
    // North America
    USD: 'US Dollar',
    CAD: 'Canadian Dollar',
    MXN: 'Mexican Peso',
    // South Asia
    PKR: 'Pakistani Rupee',
    INR: 'Indian Rupee',
    BDT: 'Bangladeshi Taka',
    LKR: 'Sri Lankan Rupee',
    NPR: 'Nepalese Rupee',
    AFN: 'Afghan Afghani',
    // Southeast Asia
    SGD: 'Singapore Dollar',
    MYR: 'Malaysian Ringgit',
    THB: 'Thai Baht',
    IDR: 'Indonesian Rupiah',
    PHP: 'Philippine Peso',
    VND: 'Vietnamese Dong',
    MMK: 'Myanmar Kyat',
    KHR: 'Cambodian Riel',
    LAK: 'Lao Kip',
    BND: 'Brunei Dollar',
    // East Asia
    CNY: 'Chinese Yuan',
    JPY: 'Japanese Yen',
    KRW: 'South Korean Won',
    TWD: 'Taiwan Dollar',
    MNT: 'Mongolian Tugrik',
    HKD: 'Hong Kong Dollar',
    MOP: 'Macanese Pataca',
    // Middle East
    AED: 'UAE Dirham',
    SAR: 'Saudi Riyal',
    QAR: 'Qatari Riyal',
    KWD: 'Kuwaiti Dinar',
    BHD: 'Bahraini Dinar',
    OMR: 'Omani Rial',
    JOD: 'Jordanian Dinar',
    LBP: 'Lebanese Pound',
    IQD: 'Iraqi Dinar',
    IRR: 'Iranian Rial',
    ILS: 'Israeli Shekel',
    TRY: 'Turkish Lira',
    // Central Asia
    KZT: 'Kazakhstani Tenge',
    UZS: 'Uzbekistani Som',
    KGS: 'Kyrgyzstani Som',
    // Europe
    EUR: 'Euro',
    GBP: 'British Pound',
    CHF: 'Swiss Franc',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    PLN: 'Polish Zloty',
    CZK: 'Czech Koruna',
    RON: 'Romanian Leu',
    HUF: 'Hungarian Forint',
    BGN: 'Bulgarian Lev',
    // Oceania
    AUD: 'Australian Dollar',
    NZD: 'New Zealand Dollar',
    FJD: 'Fijian Dollar',
    // South America
    BRL: 'Brazilian Real',
    ARS: 'Argentine Peso',
    CLP: 'Chilean Peso',
    COP: 'Colombian Peso',
    PEN: 'Peruvian Sol',
    VES: 'Venezuelan Bolívar',
    // Africa
    ZAR: 'South African Rand',
    EGP: 'Egyptian Pound',
    NGN: 'Nigerian Naira',
    KES: 'Kenyan Shilling',
    GHS: 'Ghanaian Cedi',
    MAD: 'Moroccan Dirham',
    TND: 'Tunisian Dinar',
    DZD: 'Algerian Dinar',
    ETB: 'Ethiopian Birr',
    TZS: 'Tanzanian Shilling'
  };
  return names[code] || code;
};

