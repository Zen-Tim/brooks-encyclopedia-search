# Brooks Encyclopedia of Chart Patterns - Searchable Index

A fast, self-contained search tool for navigating Al Brooks' Encyclopedia of Chart Patterns (596 sections across 16 parts).

Built as a thank you to Al Brooks and a resource for the trading community.

## Features

- **Instant search** across section names, abbreviations, and semantic tags
- **Smart tagging** -- search "three pushes" and find Wedge patterns, search "trapped traders" and find Trap sections
- **Category filters** -- Pattern, Trend, Gap, Breakout, Reversal, Failed, Trading Range, and more
- **Part filters** -- quickly narrow to any of the 16 encyclopedia parts
- **Fully self-contained** -- no API calls, no backend, works offline after initial load
- **Direction indicators** -- Bull, Bear, or Both for each section

## About

The [Brooks Encyclopedia of Chart Patterns](https://brookstradingcourse.com) is a comprehensive resource by Al Brooks containing over 10,500 slides covering price action trading patterns. This search tool helps traders quickly find the relevant section when they recognise a pattern on the chart.

**Data source:** October 2025 edition of the Encyclopedia index.

## Development

```bash
npm install
npm run dev
```

## Deployment

Push to GitHub, connect to Vercel -- deploys automatically.

Or build manually:

```bash
npm run build
```

Output is in `dist/`.

## Credits

- **Al Brooks** -- [Brooks Trading Course](https://brookstradingcourse.com) -- for creating the Encyclopedia
- **Zen Trading Tech** -- [zentradingtech.com](https://zentradingtech.com) -- for building this search tool
