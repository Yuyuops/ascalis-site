# Dashboard standardization plan

## What was added

This branch introduces a single registry file: `dashboard.catalog.js`.

It centralizes:
- the Pro tools catalog
- the Free tools catalog
- admin/client filtering
- summary counts used by dashboard cards and KPIs

## Why

The current `dashboard.html` duplicates tool information in multiple places:
- sidebar navigation
- dashboard cards
- dashboard KPI counts

That makes every new tool addition fragile because one change can require 3 manual edits.

## Recommended integration sequence

1. Load `dashboard.catalog.js` before the dashboard rendering code.
2. Replace the in-function `TOOLS_PRO` and `TOOLS_FREE` arrays with `getDashboardTools(currentUser.role)`.
3. Replace hard-coded KPI values with `getDashboardSummary(currentUser.role)`.
4. In a second pass, connect the sidebar tool links to the same registry.

## Safe migration note

The connector session allowed safe creation of new files on the branch, but not a fully safe in-place overwrite of `dashboard.html` with tree metadata exposure. The next step is to swap the existing inline arrays with the shared registry in one controlled edit.
