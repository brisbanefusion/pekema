
import React from 'react';
import { ActivityItem, CompanyDominanceData } from './types';

export const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', 
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308', 
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4'
];

export const DOMINANCE_DATA: CompanyDominanceData[] = [
  { name: 'WDH MOSCORP SDN BHD', value: 120 },
  { name: 'WAX RAZIMOTO SDN BHD', value: 95 },
  { name: 'WDG RE TEGUH MOTOR SDN BHD', value: 88 },
  { name: 'WK6 GEMILANG AUTO PARTS SDN BHD', value: 74 },
  { name: 'WH7 BAYANGAN DINAMIK SDN BHD', value: 65 },
  { name: 'WAP ECW MOTORSPORTS SDN BHD', value: 58 },
  { name: 'WAF SINAR AUTO SDN BHD', value: 42 },
  { name: 'WAZ IMMONAAZ SDN BHD', value: 38 },
  { name: 'WW4 BUMI MUHIBAH MOTORS SDN BHD', value: 24 },
  { name: 'WM3 BUMI MUHIBAH MOTORS SDN BHD', value: 20 },
];

export const ACTIVITY_LOG: ActivityItem[] = [
  {
    id: '1',
    vehicle: 'USED TOYOTA VOXY S-Z C/W ACCESSORIES',
    company: 'WAX RAZIMOTO SDN BHD',
    time: '10:49 AM',
    date: '16 Feb'
  },
  {
    id: '2',
    vehicle: 'USED TOYOTA ALPHARD SC C/W ACCESSORIES',
    company: 'WAX RAZIMOTO SDN BHD',
    time: '10:48 AM',
    date: '16 Feb'
  },
  {
    id: '3',
    vehicle: 'USED TOYOTA ALPHARD SC C/W ACCESSORIES',
    company: 'WAX RAZIMOTO SDN BHD',
    time: '10:46 AM',
    date: '16 Feb'
  },
  {
    id: '4',
    vehicle: 'USED TOYOTA ALPHARD SC C/W ACCESSORIES',
    company: 'WAX RAZIMOTO SDN BHD',
    time: '10:43 AM',
    date: '16 Feb'
  },
  {
    id: '5',
    vehicle: 'USED TOYOTA ALPHARD S C/W ACCESSORIES',
    company: 'WAX RAZIMOTO SDN BHD',
    time: '10:43 AM',
    date: '16 Feb'
  },
];
