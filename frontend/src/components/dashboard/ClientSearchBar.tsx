'use client';

import { useState } from 'react';
import type { Client } from '@/types/client';
import {
  countActiveFilters,
  defaultFilters,
  getUniqueCities,
  getUniqueReligions,
  type ClientFilters,
  type QuickFilter,
} from '@/lib/clientFilters';

const QUICK_FILTERS: QuickFilter[] = ['All', 'Male', 'Female', 'Active', 'Paused', 'NRI'];

const AGE_OPTIONS = [
  { value: '', label: 'All Ages' },
  { value: '18-25', label: '18–25' },
  { value: '26-30', label: '26–30' },
  { value: '31-35', label: '31–35' },
  { value: '36-40', label: '36–40' },
  { value: '41-50', label: '41–50' },
  { value: '50+', label: '50+' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'New', label: 'New' },
  { value: 'Active', label: 'Active' },
  { value: 'Match Sent', label: 'Match Sent' },
  { value: 'Matched', label: 'Matched' },
  { value: 'Paused', label: 'Paused' },
];

const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'profiling', label: 'Profiling' },
  { value: 'active_search', label: 'Active Search' },
  { value: 'intro_sent', label: 'Intro Sent' },
  { value: 'date_scheduled', label: 'Date Scheduled' },
  { value: 'committed', label: 'Committed' },
  { value: 'paused', label: 'Paused' },
];

interface Props {
  clients: Client[];
  filters: ClientFilters;
  onChange: (filters: ClientFilters) => void;
  resultCount: number;
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

const selectStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  background: 'white',
  color: 'var(--text-secondary)',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 12,
  fontFamily: "'DM Sans', sans-serif",
  cursor: 'pointer',
  minWidth: 0,
};

export default function ClientSearchBar({ clients, filters, onChange, resultCount }: Props) {
  const cities = getUniqueCities(clients);
  const religions = getUniqueReligions(clients);
  const activeCount = countActiveFilters(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const patch = (partial: Partial<ClientFilters>) => onChange({ ...filters, ...partial });

  const clearAdvanced = () =>
    onChange({
      ...filters,
      location: '',
      ageRange: '',
      status: '',
      journeyStage: '',
      gender: '',
      diet: '',
      wantKids: '',
      openToRelocate: '',
      nri: '',
      incomeRange: '',
      maritalStatus: '',
      religion: '',
    });

  return (
    <div className="dash-search-panel">
      <div className="dash-search-row">
        <div className="dash-search-input-wrap">
          <span className="dash-search-icon">
            <SearchIcon />
          </span>
          <input
            className="dash-search-input"
            placeholder="Search by name, ID, city, company, religion…"
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
          />
        </div>

        <select
          style={selectStyle}
          value={filters.location}
          onChange={(e) => patch({ location: e.target.value })}
        >
          <option value="">All Locations</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          style={selectStyle}
          value={filters.ageRange}
          onChange={(e) => patch({ ageRange: e.target.value as ClientFilters['ageRange'] })}
        >
          {AGE_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          style={selectStyle}
          value={filters.status}
          onChange={(e) => patch({ status: e.target.value })}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`dash-more-filters-btn${showAdvanced ? ' active' : ''}`}
          onClick={() => setShowAdvanced((v) => !v)}
        >
          <FilterIcon />
          More Filters
          {activeCount > 0 ? <span className="dash-filter-badge">{activeCount}</span> : null}
        </button>
      </div>

      <div className="dash-quick-filters">
        {QUICK_FILTERS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`dash-pill${filters.quickFilter === tab ? ' active' : ''}`}
            onClick={() => patch({ quickFilter: tab })}
          >
            {tab}
          </button>
        ))}
        <span className="dash-result-count">
          {resultCount} {resultCount === 1 ? 'client' : 'clients'}
        </span>
      </div>

      {showAdvanced ? (
        <div className="dash-advanced-filters">
          <div className="dash-advanced-grid">
            <label className="dash-filter-field">
              <span>Journey Stage</span>
              <select
                style={selectStyle}
                value={filters.journeyStage}
                onChange={(e) => patch({ journeyStage: e.target.value })}
              >
                {STAGE_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="dash-filter-field">
              <span>Gender</span>
              <select
                style={selectStyle}
                value={filters.gender}
                onChange={(e) => patch({ gender: e.target.value as ClientFilters['gender'] })}
              >
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>

            <label className="dash-filter-field">
              <span>Diet</span>
              <select
                style={selectStyle}
                value={filters.diet}
                onChange={(e) => patch({ diet: e.target.value as ClientFilters['diet'] })}
              >
                <option value="">All</option>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </label>

            <label className="dash-filter-field">
              <span>Wants Kids</span>
              <select
                style={selectStyle}
                value={filters.wantKids}
                onChange={(e) => patch({ wantKids: e.target.value as ClientFilters['wantKids'] })}
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="maybe">Maybe</option>
              </select>
            </label>

            <label className="dash-filter-field">
              <span>Open to Relocate</span>
              <select
                style={selectStyle}
                value={filters.openToRelocate}
                onChange={(e) =>
                  patch({ openToRelocate: e.target.value as ClientFilters['openToRelocate'] })
                }
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="maybe">Maybe</option>
              </select>
            </label>

            <label className="dash-filter-field">
              <span>NRI Status</span>
              <select
                style={selectStyle}
                value={filters.nri}
                onChange={(e) => patch({ nri: e.target.value as ClientFilters['nri'] })}
              >
                <option value="">All</option>
                <option value="yes">NRI Only</option>
                <option value="no">India Only</option>
              </select>
            </label>

            <label className="dash-filter-field">
              <span>Income Range</span>
              <select
                style={selectStyle}
                value={filters.incomeRange}
                onChange={(e) => patch({ incomeRange: e.target.value as ClientFilters['incomeRange'] })}
              >
                <option value="">All Income</option>
                <option value="0-15">Under 15L</option>
                <option value="15-30">15–30L</option>
                <option value="30-50">30–50L</option>
                <option value="50-100">50L–1Cr</option>
                <option value="100+">1Cr+</option>
              </select>
            </label>

            <label className="dash-filter-field">
              <span>Marital Status</span>
              <select
                style={selectStyle}
                value={filters.maritalStatus}
                onChange={(e) =>
                  patch({ maritalStatus: e.target.value as ClientFilters['maritalStatus'] })
                }
              >
                <option value="">All</option>
                <option value="never_married">Never Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </label>

            <label className="dash-filter-field">
              <span>Religion</span>
              <select
                style={selectStyle}
                value={filters.religion}
                onChange={(e) => patch({ religion: e.target.value })}
              >
                <option value="">All</option>
                {religions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="dash-advanced-actions">
            <button type="button" className="dash-clear-btn" onClick={clearAdvanced}>
              Clear advanced filters
            </button>
            <button
              type="button"
              className="dash-clear-btn"
              onClick={() => onChange(defaultFilters)}
            >
              Reset all
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}