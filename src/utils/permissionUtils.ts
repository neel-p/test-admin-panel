export const MODULE_DISPLAY_NAMES = {
  jobtask: 'Job Posting',
  documents: 'Collection List',
  user: 'User List',
  collection: 'Collection List',
  client:'Client List'
} as const;

export const MODULE_ROUTES = {
  jobtask: '/job-posting',
  documents: '/collection-list',
//   user: '/user-agents',
  collection: '/collection-list',
  user: '/client/user',
  client: '/admin'
} as const;

export type ModuleKey = keyof typeof MODULE_DISPLAY_NAMES;

export const getModuleDisplayName = (module: ModuleKey): string => {
  return MODULE_DISPLAY_NAMES[module];
};

export const getModuleRoute = (module: ModuleKey): string => {
  return MODULE_ROUTES[module];
}; 