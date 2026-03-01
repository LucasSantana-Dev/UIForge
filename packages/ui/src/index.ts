// @siza/ui - Shared UI component library
// Design system: Siza dark-only theme with semantic design tokens

// Utilities
export { cn } from './lib/utils';

// UI Components
export { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
export { Badge, badgeVariants } from './components/ui/badge';
export type { BadgeProps } from './components/ui/badge';
export { Button, buttonVariants } from './components/ui/button';
export type { ButtonProps } from './components/ui/button';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/ui/card';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/ui/dropdown-menu';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Progress } from './components/ui/progress';
export { ScrollArea } from './components/ui/scroll-area';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/ui/select';
export { Separator } from './components/ui/separator';
export { Skeleton } from './components/ui/skeleton';
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './components/ui/sheet';
export { SizaBackground } from './components/ui/siza-background';
export { Toaster as SonnerToaster } from './components/ui/sonner';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
export { Textarea } from './components/ui/textarea';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui/tooltip';

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './components/ui/toast';
export { Toaster } from './components/ui/toaster';

// Hooks
export { useToast, toast } from './hooks/use-toast';

// Generator Components
export { default as CodeEditor } from './components/generator/CodeEditor';
export { default as LivePreview } from './components/generator/LivePreview';

// Generation types
export type {
  GenerationEvent,
  QualityResult,
  QualityReport,
  NavigationItem,
} from './lib/generation-types';

// Generator components (shared)
export { QualityPanel } from './components/generator/QualityPanel';
export { GenerationProgress } from './components/generator/GenerationProgress';

// Layout components (shared)
export { NavigationSidebar } from './components/layout/NavigationSidebar';
