const API_TOKEN = 'SSWS 00AUWepIiWCDLRXeFkBGMGwiXqpZyxjBFVmX2_-26i';
const API_BASE_URL = 'https://trial-9265416.okta.com';
const discoveryUri = 'https://trial-9265416.okta.com/oauth2/default';

// Basic Item Interface
export interface Item {
  id: string;
  name: string;
  imageUrl?: string;
  details?: string;
  relatedItems?: Item[];
}

// Screen Types
export type ScreenType =
  | 'layout_about'
  | 'layout_feed'
  | 'layout_accordion'
  | 'layout_details'
  | 'layout_news';

// Screen Data Interface
export interface ScreenData {
  id: string;
  type: ScreenType;
  title: string;
  data: any; // Flexible payload depending on type
  nestedScreens?: string[]; // IDs of screens linked from this one
}

export { API_TOKEN, API_BASE_URL, discoveryUri };
