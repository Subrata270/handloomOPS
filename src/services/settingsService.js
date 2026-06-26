const SETTINGS_KEY = 'smh_business_settings';

const defaultSettings = {
  businessName: 'Sri Mahalakshmi Handlooms',
  ownerName: 'Subrata Sahu',
  logo: '',
  phone: '9876543210',
  email: 'contact@mahalakshmihandlooms.com',
  address: 'Sri Mahalakshmi Handlooms, Main Road, Handloom Zone, Odisha',
  gstin: '21AAAAA1111A1Z1',
  termsAndConditions: '1. Goods once sold will not be taken back.\n2. Subject to local jurisdiction.\n3. Keep the invoice for any claims.',
};

export function getSettings() {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  try {
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch (e) {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  // Dispatch event so other components can react
  window.dispatchEvent(new Event('settingsUpdated'));
  return settings;
}
