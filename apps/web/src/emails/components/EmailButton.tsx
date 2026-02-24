import { Button } from '@react-email/components';

interface EmailButtonProps {
  href: string;
  children: string;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      className="inline-block rounded-md bg-[#18181b] px-6 py-3 text-center text-sm font-medium text-white no-underline"
    >
      {children}
    </Button>
  );
}
