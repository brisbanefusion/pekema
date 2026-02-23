
// Fix: Added React import to provide the React namespace for React.ReactNode
import React from 'react';

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendType?: 'up' | 'down';
  icon: React.ReactNode;
  colorClass: string;
}

export interface ActivityItem {
  id: string;
  vehicle: string;
  company: string;
  time: string;
  date: string;
}

export interface CompanyDominanceData {
  name: string;
  value: number;
}

export enum DashboardTab {
  RINGKASAN = 'Ringkasan Utama',
  KENDERAAN = 'Senarai Kenderaan',
  SYARIKAT = 'Senarai Syarikat',
  ANALISA = 'Analisa Cukai',
  INSIGHTS = 'AI Deep Insights',
  AGING = 'Analisa Tempoh Gudang',
  ADVANCED = 'Advanced',
  REKOD_DETAIL = 'Rekod Kenderaan',
  TAMBAH_KENDERAAN = 'Tambah Kenderaan',
  ADMIN = 'Superadmin Panel'
}
