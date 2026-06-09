# Changelog

## [1.0.1] - 2026-03-06

### Added
- Input validation for budget minimums (Meta $1/day, TikTok $20/day)
- URL validation requiring https:// prefix
- TypeScript interfaces for API responses (`MetaApiResponse`, `TikTokApiResponse`, `CheckSetupResult`)
- Budget minimum constants (`META_MIN_BUDGET_USD`, `TIKTOK_MIN_BUDGET_USD`)
- Comprehensive documentation in `/docs` folder

### Changed
- Replaced `as any` type assertions with proper typed interfaces
- Updated error handling to use `instanceof Error` check
- Version bump to 1.0.1
- LICENSE file clarified as proprietary (removed MIT badge confusion)
- README completely rewritten for better agent usability

### Fixed
- Type safety throughout codebase
- Clearer error messages for budget validation failures

## [1.0.0] - 2026-03-01

### Added
- Initial release
- Meta (Facebook/Instagram) campaign management
- TikTok campaign management
- License tier enforcement (Scout/Operator/Commander/Agency)
