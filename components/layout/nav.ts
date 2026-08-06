import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Landmark,
  TrendingUp,
  Shield,
  Target,
  PieChart,
  FileText,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Salary", href: "/salary", icon: Wallet },
  { title: "Expenses", href: "/expenses", icon: Receipt },
  { title: "Loans", href: "/loans", icon: Landmark },
  { title: "Investments", href: "/investments", icon: TrendingUp },
  { title: "Emergency", href: "/emergency-fund", icon: Shield },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Net Worth", href: "/net-worth", icon: PieChart },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Insights", href: "/insights", icon: Sparkles },
  { title: "Settings", href: "/settings", icon: Settings },
];

export const mobileNav = [
  mainNav[0],
  mainNav[2],
  mainNav[3],
  mainNav[4],
  mainNav[10],
];
