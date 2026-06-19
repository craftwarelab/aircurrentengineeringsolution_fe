'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { getCountries, getCountryCallingCode, parsePhoneNumberWithError, type CountryCode } from 'libphonenumber-js';
import { ChevronsUpDown, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Country data ────────────────────────────────────────────────────────────

const COUNTRY_NAMES = new Intl.DisplayNames(['en'], { type: 'region' });

interface CountryEntry {
  code: CountryCode;
  name: string;
  dial: string;
}

const ALL_COUNTRIES: CountryEntry[] = getCountries()
  .map((code) => {
    let name = '';
    try { name = COUNTRY_NAMES.of(code) ?? code; } catch { name = code; }
    return { code, name, dial: `+${getCountryCallingCode(code)}` };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// Pin popular countries to the top
const PINNED: CountryCode[] = ['LK', 'US', 'GB', 'AE', 'IN', 'AU', 'CA', 'SG', 'DE', 'FR'];

const SORTED_COUNTRIES: CountryEntry[] = [
  ...PINNED.map((code) => ALL_COUNTRIES.find((c) => c.code === code)!).filter(Boolean),
  ...ALL_COUNTRIES.filter((c) => !PINNED.includes(c.code)),
];

// Flag image via flagcdn.com — works on all OS/browsers, no emoji font needed
function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  const lower = code.toLowerCase();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${size}x15/${lower}.png`}
      srcSet={`https://flagcdn.com/${size * 2}x${15 * 2}/${lower}.png 2x`}
      width={size}
      height={15}
      alt={code}
      className="rounded-sm object-cover shrink-0"
      style={{ width: size, height: 15 }}
    />
  );
}

// Build a lookup: dial string → best CountryEntry (longest match wins, prefer pinned)
// e.g. "+1" → US, "+44" → GB, "+94" → LK
const DIAL_TO_COUNTRY: Map<string, CountryEntry> = (() => {
  const map = new Map<string, CountryEntry>();
  // Add pinned last so they overwrite non-pinned for shared codes (e.g. +1 → US)
  const order = [
    ...ALL_COUNTRIES.filter((c) => !PINNED.includes(c.code)),
    ...PINNED.map((code) => ALL_COUNTRIES.find((c) => c.code === code)!).filter(Boolean),
  ];
  for (const entry of order) {
    map.set(entry.dial, entry);
  }
  return map;
})();

// Given a raw string starting with "+", find the longest matching dial code
function detectCountryFromInput(raw: string): { country: CountryEntry; rest: string } | null {
  if (!raw.startsWith('+')) return null;
  // Try longest dial codes first (up to +1234), then shorter
  for (let len = 5; len >= 2; len--) {
    const candidate = raw.slice(0, len);
    const entry = DIAL_TO_COUNTRY.get(candidate);
    if (entry) {
      const rest = raw.slice(len).replace(/^\s+/, '');
      return { country: entry, rest };
    }
  }
  return null;
}

interface PhoneInputProps {
  value: string;           // full value stored in form state e.g. "+94701234567"
  onChange: (value: string) => void;
  onValidChange?: (valid: boolean) => void;
  required?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PhoneInput({ value, onChange, onValidChange, required, className }: PhoneInputProps) {
  // Derive initial country from value prefix, default to US
  const [selectedCountry, setSelectedCountry] = useState<CountryEntry>(() => {
    if (value) {
      for (const entry of SORTED_COUNTRIES) {
        if (value.startsWith(entry.dial)) return entry;
      }
    }
    return ALL_COUNTRIES.find((c) => c.code === 'LK')!;
  });

  // The local part the user types (without the country code)
  const [localNumber, setLocalNumber] = useState(() => {
    if (value && value.startsWith(selectedCountry.dial)) {
      return value.slice(selectedCountry.dial.length).trimStart();
    }
    return value ?? '';
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [touched, setTouched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [dropdownOpen]);

  // Filtered country list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return SORTED_COUNTRIES;
    return SORTED_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Validation
  const isValid = useMemo(() => {
    const full = `${selectedCountry.dial}${localNumber.replace(/\s/g, '')}`;
    if (!localNumber.trim()) return null; // not touched / empty → neutral
    try {
      const parsed = parsePhoneNumberWithError(full, selectedCountry.code);
      return parsed.isValid();
    } catch {
      return false;
    }
  }, [localNumber, selectedCountry]);

  // Propagate changes upward
  useEffect(() => {
    const full = localNumber.trim()
      ? `${selectedCountry.dial} ${localNumber.trim()}`
      : '';
    onChange(full);
    onValidChange?.(isValid === true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localNumber, selectedCountry]);

  const handleCountrySelect = (entry: CountryEntry) => {
    setSelectedCountry(entry);
    setLocalNumber('');
    setDropdownOpen(false);
    setSearch('');
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // If the user typed/pasted something starting with "+", try to auto-detect country
    if (raw.startsWith('+')) {
      const detected = detectCountryFromInput(raw);
      if (detected) {
        // Full dial code matched — switch country and keep only the local part
        setSelectedCountry(detected.country);
        // Strip non-digit/space/dash/parens from the remainder
        const clean = detected.rest.replace(/[^\d\s\-().]/g, '');
        setLocalNumber(clean);
        setTouched(true);
        return;
      }
      // Partial "+" entry (still typing the code) — allow it through as-is so
      // the user can keep typing; only strip chars that are never valid
      setLocalNumber(raw.replace(/[^\d+\s\-().]/g, ''));
      setTouched(true);
      return;
    }

    // Normal local entry — allow digits, spaces, dashes, parentheses
    const clean = raw.replace(/[^\d\s\-().]/g, '');
    setLocalNumber(clean);
    setTouched(true);
  };

  const showValidation = touched && localNumber.trim().length > 0;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center border rounded-lg overflow-hidden bg-background transition-colors',
          dropdownOpen ? 'ring-2 ring-accent border-accent' : 'border-border',
          showValidation && isValid === true && 'border-green-500',
          showValidation && isValid === false && 'border-red-500'
        )}
      >
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-2.5 border-r border-border hover:bg-muted/50 transition-colors shrink-0 h-full"
          aria-label="Select country code"
        >
          <FlagImg code={selectedCountry.code} />
          <span className="text-sm font-medium text-muted-foreground tabular-nums">
            {selectedCountry.dial}
          </span>
          <ChevronsUpDown className="w-3 h-3 text-muted-foreground" />
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          value={localNumber}
          onChange={handleLocalChange}
          onBlur={() => setTouched(true)}
          required={required}
          placeholder="70 123 4567"
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
        />

        {/* Validation icon */}
        {showValidation && (
          <div className="pr-3">
            {isValid === true
              ? <CheckCircle2 className="w-4 h-4 text-green-500" />
              : <AlertCircle className="w-4 h-4 text-red-500" />
            }
          </div>
        )}
      </div>

      {/* Validation message */}
      {showValidation && isValid === false && (
        <p className="text-xs text-red-500 mt-1">
          Invalid phone number for {selectedCountry.name} ({selectedCountry.dial})
        </p>
      )}

      {/* Country dropdown */}
      {dropdownOpen && (
        <div className="absolute z-50 top-full mt-1 left-0 w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or dial code..."
                className="flex-1 text-sm bg-transparent outline-none py-1 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* List */}
          <ul className="max-h-56 overflow-y-auto overscroll-contain">
            {search === '' && (
              <li className="px-3 py-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Popular
              </li>
            )}
            {filtered.map((entry, idx) => {
              const isPinnedDivider = search === '' && idx === PINNED.length;
              return (
                <>
                  {isPinnedDivider && (
                    <li key="divider" className="px-3 py-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide border-t border-border">
                      All Countries
                    </li>
                  )}
                  <li
                    key={entry.code}
                    onClick={() => handleCountrySelect(entry)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent/10',
                      selectedCountry.code === entry.code && 'bg-accent/10 font-medium'
                    )}
                  >
                    <FlagImg code={entry.code} />
                    <span className="flex-1 truncate">{entry.name}</span>
                    <span className="text-muted-foreground tabular-nums text-xs">{entry.dial}</span>
                  </li>
                </>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-sm text-muted-foreground text-center">No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
