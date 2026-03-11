import {
  BookOpenIcon,
  CreditCardIcon,
  FileTextIcon,
  FolderIcon,
  KeyIcon,
  LayoutDashboardIcon,
  PlusIcon,
  PuzzleIcon,
  RocketIcon,
  SettingsIcon,
  ClockIcon,
  ShieldIcon,
  UsersIcon,
  WandSparklesIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getFeatureFlag } from '@/lib/features/flags';

export interface DashboardNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
}

const baseDashboardNavigation: DashboardNavItem[] = [
  { name: 'Projects', href: '/projects', icon: FolderIcon, shortcut: '⌘1' },
  { name: 'Templates', href: '/templates', icon: FileTextIcon, shortcut: '⌘2' },
  { name: 'History', href: '/history', icon: ClockIcon, shortcut: '⌘3' },
  { name: 'AI Keys', href: '/ai-keys', icon: KeyIcon },
  { name: 'Billing', href: '/billing', icon: CreditCardIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon, shortcut: '⌘4' },
];

const catalogNavigation: DashboardNavItem[] = [
  { name: 'Catalog', href: '/catalog', icon: BookOpenIcon },
];

const goldenPathsNavigation: DashboardNavItem[] = [
  { name: 'Golden Paths', href: '/golden-paths', icon: RocketIcon },
];

const pluginsNavigation: DashboardNavItem[] = [
  { name: 'Plugins', href: '/plugins', icon: PuzzleIcon },
];

const skillsNavigation: DashboardNavItem[] = [
  { name: 'Skills', href: '/skills', icon: WandSparklesIcon },
];

const teamsNavigation: DashboardNavItem[] = [{ name: 'Teams', href: '/teams', icon: UsersIcon }];

const adminDashboardNavigation: DashboardNavItem[] = [
  { name: 'Admin', href: '/admin', icon: ShieldIcon },
];

export function getDashboardNavigation(isAdmin: boolean): DashboardNavItem[] {
  const isCatalogEnabled = getFeatureFlag('ENABLE_SOFTWARE_CATALOG');
  const isGoldenPathsEnabled = getFeatureFlag('ENABLE_GOLDEN_PATHS');
  const isPluginsEnabled = getFeatureFlag('ENABLE_PLUGIN_SYSTEM');
  const isSkillsEnabled = getFeatureFlag('ENABLE_SKILL_MARKETPLACE');
  const isRbacEnabled = getFeatureFlag('ENABLE_RBAC');
  const catalogItems = isCatalogEnabled ? catalogNavigation : [];
  const goldenPathItems = isGoldenPathsEnabled ? goldenPathsNavigation : [];
  const pluginItems = isPluginsEnabled ? pluginsNavigation : [];
  const skillItems = isSkillsEnabled ? skillsNavigation : [];
  const teamItems = isRbacEnabled ? teamsNavigation : [];

  const projectsIndex = baseDashboardNavigation.findIndex((item) => item.name === 'Projects');
  const navItems = [
    ...baseDashboardNavigation.slice(0, projectsIndex + 1),
    ...catalogItems,
    ...goldenPathItems,
    ...pluginItems,
    ...skillItems,
    ...teamItems,
    ...baseDashboardNavigation.slice(projectsIndex + 1),
  ];

  return isAdmin ? [...navItems, ...adminDashboardNavigation] : navItems;
}

export function getDashboardPages(isAdmin: boolean): DashboardNavItem[] {
  return [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
    { name: 'Generate', href: '/generate', icon: PlusIcon },
    ...getDashboardNavigation(isAdmin),
  ];
}
