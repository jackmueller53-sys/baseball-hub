# Baseball Hub — Advanced Stats & Stuff+ Leaderboard

A comprehensive baseball analytics dashboard featuring:

- **Stats Explorer**: Interactive scatter plot comparing any two metrics across MLB hitters and pitchers. Live data from FanGraphs and Baseball Savant APIs.
- **Stuff+ Leaderboard**: Custom XGBoost whiff-probability model grading pitcher arsenals on a 100-centered scale.

## Data Sources

- [FanGraphs](https://www.fangraphs.com) — wRC+, WAR, wOBA, FIP, xFIP, K%, BB%, SwStr%, BABIP, ISO, GB%, LOB%
- [Baseball Savant](https://baseballsavant.mlb.com) — xwOBA, xBA, xSLG, xERA, Barrel%, Avg EV, Hard Hit%, Whiff%, Sprint Speed
- [MLB Stats API](https://statsapi.mlb.com) — Player lookups, season stats

## Deployment

This site is deployed automatically to GitHub Pages on every push to `main`.

## Local Development

Simply open `index.html` in a browser, or serve locally:

```bash
npx serve .
```

## By Jack Mueller
