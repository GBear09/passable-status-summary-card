# Changelog

All notable changes to **Passable Status Summary Card** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.8] - 2026-10-02

### Changed
- **Compact Layout Restored**: Restored compact `.top-row` layout and tightened `.card-content` padding (12px 14px) for optimal dashboard density.
- **Removed Forced Subtitles & Dividers**: Removed automatic fallback subtitle generation ("... Overview") and divider line, displaying subtitle only when explicitly configured by the user.
- **Fixed Top-Right Metric Collision**: Added guaranteed spacing (`gap: 12px; margin-right: 8px; min-width: 130px;`) between status metric labels and values (e.g., "Battery" and "70%").

## [1.0.7] - 2026-10-02

### Changed
- **Design System Alignment**: Rebuilt header into standard horizontal split layout with `.header`, `.header-left`, dynamic header icon, 24px title, 14px subtitle, and bottom divider line (`border-bottom: 1px solid var(--divider-color)`).
- **Hover Pop Elimination**: Removed jarring `ha-card:hover { transform: scale(1.02); }` pop to ensure card elevation consistency across the dashboard.
- **Visual Editor**: Verified static `getConfigElement()` and registered `passable-status-summary-card-editor` with legacy `status-summary-card-editor` alias.
- **Registry Metadata**: Updated `window.customCards` description to a professional standard and added `documentationURL`.

## [1.0.6] - 2026-09-24

### Fixed
- Badge count rendering and multi-entity attribute updates.
