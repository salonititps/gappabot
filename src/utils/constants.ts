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

export const SCREEN_CONFIG: Record<string, Omit<ScreenData, 'data'>> = {
  about: {
    id: 'about',
    type: 'layout_about',
    title: 'About Us',
    nestedScreens: ['blogs', 'faqs', 'news'],
  },
  blogs: {
    id: 'blogs',
    type: 'layout_feed',
    title: 'Latest Blogs',
    nestedScreens: [],
  },
  faqs: {
    id: 'faqs',
    type: 'layout_accordion',
    title: 'Frequently Asked Questions',
    nestedScreens: [],
  },
  news: {
    id: 'news',
    type: 'layout_news',
    title: 'Latest News',
    nestedScreens: [],
  },
};

const ABOUT_DATA = {
  info: 'We are a company dedicated to bringing you the best server-driven UI experiences. Our mission is to make mobile development dynamic and flexible.',
  heroImage: {
    id: 'hero-1',
    name: 'Our Office',
    imageUrl: 'https://picsum.photos/id/10/800/400',
    details:
      'Our state-of-the-art office located in the heart of the tech district.',
  },
};

const BLOGS_DATA = {
  items: [
    {
      id: 'blog-1',
      name: 'The Future of SDUI',
      imageUrl: 'https://picsum.photos/id/20/400/300',
      details:
        'Exploring how Server Driven UI is changing the landscape of mobile development.',
    },
    {
      id: 'blog-2',
      name: 'React Native Optimization',
      imageUrl: 'https://picsum.photos/id/24/400/300',
      details:
        'Tips and tricks to keep your React Native apps running smoothly.',
    },
    {
      id: 'blog-3',
      name: 'Design Systems',
      imageUrl: 'https://picsum.photos/id/28/400/300',
      details: 'Building a robust design system for consistency and speed.',
    },
  ],
};

const FAQS_DATA = {
  items: [
    {
      id: 'faq-1',
      title: 'What is SDUI?',
      content:
        'Server Driven UI allowing semantic rendering of UI based on API responses.',
    },
    {
      id: 'faq-2',
      title: 'How do I add a new screen?',
      content:
        'Simply add a new entry to the JSON registry and it will be rendered automatically.',
    },
    {
      id: 'faq-3',
      title: 'Is it performant?',
      content:
        'Yes, by using native components and optimized lists, performance is high.',
    },
    {
      id: 'faq-4',
      title: 'Can I nest screens?',
      content:
        'Absolutely! Our architecture supports infinite nesting of screens.',
    },
    {
      id: 'faq-5',
      title: 'What about authentication?',
      content:
        'Authentication is handled separately via Okta and integrated into the app flow.',
    },
  ],
};

const NEWS_DATA = {
  accordionItems: [
    {
      id: 'news-faq-1',
      title: 'Breaking News',
      content: 'Major updates coming to the platform next week.',
    },
    {
      id: 'news-faq-2',
      title: 'Community Event',
      content: 'Join us for the annual developer conference.',
    },
  ],
  feedItems: [
    {
      id: 'news-1',
      name: 'New Feature Release',
      imageUrl: 'https://picsum.photos/id/30/400/300',
      details:
        'We have just launched a brand new feature for dynamic rendering.',
    },
    {
      id: 'news-2',
      name: 'Market Update',
      imageUrl: 'https://picsum.photos/id/34/400/300',
      details: 'Latest trends in the mobile development market.',
    },
  ],
};

export const SCREEN_CONTENT: Record<string, { data: any }> = {
  about: {
    data: ABOUT_DATA,
  },
  blogs: {
    data: BLOGS_DATA,
  },
  faqs: {
    data: FAQS_DATA,
  },
  news: {
    data: NEWS_DATA,
  },
};

export { API_TOKEN, API_BASE_URL, discoveryUri };
