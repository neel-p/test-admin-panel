export const MODULE_DISPLAY_NAMES = {
  jobtask: 'Job Posting',
  documents: 'Document List',
  user: 'User List',
  collection: 'Collection List',
  client: 'Client List',
  isAgent: 'Agent List',
  isTalentPool: 'Talent Pool'
} as const;

export const MODULE_ROUTES = {
  jobtask: '/job-posting',
  documents: '/collection-list',
//   user: '/user-agents',
  collection: '/collection-list',
  user: '/client/user',
  client: '/admin',
  isAgent: '/client/agent',
  isTalentPool: '/talent-pool'
} as const;

export type ModuleKey = keyof typeof MODULE_DISPLAY_NAMES;

export const getModuleDisplayName = (module: ModuleKey): string => {
  return MODULE_DISPLAY_NAMES[module];
};

export const getModuleRoute = (module: ModuleKey): string => {
  return MODULE_ROUTES[module];
}; 