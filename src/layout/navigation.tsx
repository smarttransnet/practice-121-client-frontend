import type { ReactElement } from 'react'
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'

export type NavItem = {
  label: string
  to: string
  icon: ReactElement
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Reports', to: '/reports', icon: <AnalyticsOutlinedIcon /> },
  { label: 'Settings', to: '/settings', icon: <SettingsOutlinedIcon /> },
]

