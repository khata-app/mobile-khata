import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

type IconProps = SvgProps & { size?: number };

function Icon({ size = 24, color = '#3A2C1E', children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </Svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M4 7.5h3l1.5-2h7l1.5 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
      <Circle cx="12" cy="14" r="4" />
      <Path d="M18.5 10.5h.01" />
    </Icon>
  );
}

export function BuyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M5 9.5h14l-1.2 10H6.2L5 9.5Z" />
      <Path d="M8 9.5 10 4h4l2 5.5" />
      <Path d="M12 6v8" />
      <Path d="m9.5 11.5 2.5 2.5 2.5-2.5" />
    </Icon>
  );
}

export function SellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M5 9.5h14l-1.2 10H6.2L5 9.5Z" />
      <Path d="M8 9.5 10 4h4l2 5.5" />
      <Path d="M12 14V6" />
      <Path d="m9.5 8.5 2.5-2.5 2.5 2.5" />
    </Icon>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Icon>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Rect x="3" y="3" width="7" height="7" rx="1" />
      <Rect x="14" y="3" width="7" height="7" rx="1" />
      <Rect x="14" y="14" width="7" height="7" rx="1" />
      <Rect x="3" y="14" width="7" height="7" rx="1" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Icon>
  );
}

export function MinusIcon(props: IconProps) {
  return <Icon {...props}><Line x1="5" y1="12" x2="19" y2="12" /></Icon>;
}

export function ChevronRightIcon(props: IconProps) {
  return <Icon {...props}><Polyline points="9 18 15 12 9 6" /></Icon>;
}

export function ChevronLeftIcon(props: IconProps) {
  return <Icon {...props}><Polyline points="15 18 9 12 15 6" /></Icon>;
}

export function CaretDownIcon(props: IconProps) {
  return <Icon {...props}><Polyline points="6 9 12 15 18 9" /></Icon>;
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Line x1="5" y1="12" x2="19" y2="12" />
      <Polyline points="12 5 19 12 12 19" />
    </Icon>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Line x1="7" y1="17" x2="17" y2="7" />
      <Polyline points="7 7 17 7 17 17" />
    </Icon>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="1" fill="#3A2C1E" stroke="none" />
      <Circle cx="19" cy="12" r="1" fill="#3A2C1E" stroke="none" />
      <Circle cx="5" cy="12" r="1" fill="#3A2C1E" stroke="none" />
    </Icon>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </Icon>
  );
}

export function LedgerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <Line x1="9" y1="7" x2="15" y2="7" />
      <Line x1="9" y1="11" x2="15" y2="11" />
    </Icon>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Polyline points="14 2 14 8 20 8" />
      <Line x1="16" y1="13" x2="8" y2="13" />
      <Line x1="16" y1="17" x2="8" y2="17" />
    </Icon>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <Polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <Line x1="12" y1="22.08" x2="12" y2="12" />
    </Icon>
  );
}

export function BarChartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Line x1="12" y1="20" x2="12" y2="10" />
      <Line x1="18" y1="20" x2="18" y2="4" />
      <Line x1="6" y1="20" x2="6" y2="16" />
    </Icon>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <Polyline points="17 6 23 6 23 12" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
}

export function ZapIcon(props: IconProps) {
  return <Icon {...props}><Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon>;
}

export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Polyline points="23 4 23 10 17 10" />
      <Polyline points="1 20 1 14 7 14" />
      <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Icon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <Line x1="16" y1="2" x2="16" y2="6" />
      <Line x1="8" y1="2" x2="8" y2="6" />
      <Line x1="3" y1="10" x2="21" y2="10" />
    </Icon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="2" y1="12" x2="22" y2="12" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Icon>
  );
}

export function MoonIcon(props: IconProps) {
  return <Icon {...props}><Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Icon>;
}

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="5" />
      <Line x1="12" y1="1" x2="12" y2="3" />
      <Line x1="12" y1="21" x2="12" y2="23" />
      <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <Line x1="1" y1="12" x2="3" y2="12" />
      <Line x1="21" y1="12" x2="23" y2="12" />
      <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </Icon>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Icon>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <Line x1="12" y1="9" x2="12" y2="13" />
      <Line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return <Icon {...props}><Polyline points="20 6 9 17 4 12" /></Icon>;
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <Polyline points="22 4 12 14.01 9 11.01" />
    </Icon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <Line x1="1" y1="10" x2="23" y2="10" />
    </Icon>
  );
}

export function CoinsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Line x1="12" y1="1" x2="12" y2="23" />
      <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </Icon>
  );
}

export function PercentIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Line x1="19" y1="5" x2="5" y2="19" />
      <Circle cx="6.5" cy="6.5" r="2.5" />
      <Circle cx="17.5" cy="17.5" r="2.5" />
    </Icon>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="9" cy="21" r="1" />
      <Circle cx="20" cy="21" r="1" />
      <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </Icon>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Polyline points="7 10 12 15 17 10" />
      <Line x1="12" y1="15" x2="12" y2="3" />
    </Icon>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Polyline points="17 8 12 3 7 8" />
      <Line x1="12" y1="3" x2="12" y2="15" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Icon>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" y1="12" x2="9" y2="12" />
    </Icon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Line x1="10" y1="11" x2="10" y2="17" />
      <Line x1="14" y1="11" x2="14" y2="17" />
    </Icon>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <Path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <Path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <Path d="M10 6h4" />
      <Path d="M10 10h4" />
      <Path d="M10 14h4" />
      <Path d="M10 18h4" />
    </Icon>
  );
}

export function ScaleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <Path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <Path d="M7 21h10" />
      <Path d="M12 3v18" />
      <Path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </Icon>
  );
}

export function ReceiptIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <Path d="M14 8H8" />
      <Path d="M16 12H8" />
      <Path d="M13 16H8" />
    </Icon>
  );
}

export function SparkleIcon(props: IconProps) {
  return <Icon {...props}><Path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></Icon>;
}

export function WalletIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M20 12V8H6a2 2 0 0 1 0-4h14v4" />
      <Path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <Path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Polyline points="9 12 11 14 15 10" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Polyline points="22,6 12,13 2,6" />
    </Icon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <Line x1="1" y1="1" x2="23" y2="23" />
    </Icon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <Line x1="12" y1="18" x2="12.01" y2="18" />
    </Icon>
  );
}

export function BanknoteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
      <Circle cx="12" cy="12" r="2" />
      <Path d="M6 12h.01M18 12h.01" />
    </Icon>
  );
}

export function KhataMark({ size = 28, color = '#F6EEE1', ...props }: SvgProps & { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <Path
        d="M6 25.6A3.2 3.2 0 0 1 9.2 22.4H26V6.8a2.4 2.4 0 0 0-2.4-2.4H9.6a3.6 3.6 0 0 0-3.6 3.6v17.6Z"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M9.2 22.4v-17.6A3.2 3.2 0 0 0 6 8v17.6"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 11h9M12 15h9M12 19h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
