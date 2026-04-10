// Auth pages have no shared nav — just the page content
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1">{children}</main>;
}
