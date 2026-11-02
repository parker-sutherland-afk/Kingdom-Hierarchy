# Kingdom Hierarchy

A searchable roster for the kingdom, built with React, Vite, Tailwind CSS, and Lucide icons.

## Run locally

```sh
npm install
npm run dev
```

Vite prints the local development URL after the server starts.

## Production build

```sh
npm run build
npm run preview
```

## Tests

```sh
npm test
```

## Updating the roster

Edit [`src/data/members.json`](./src/data/members.json) to add or update roster entries. Keep each `id` unique, use a role name defined in `ROLE_CONFIG` in `src/KingdomHierarchy.jsx`, and include the member's name and Minecraft username. Members can also have a `secondaryRole`, `customPoints`, and `customDesc`.

The rank display groups department heads under Council and the King and Advisors under High Council. The Council filter includes both High Council and department heads, while the High Council filter shows only the King and Advisors. Both filters include matching secondary roles.

Voting points add the primary and secondary role values unless `customPoints` is set; custom points replace that sum. Each member card has an expandable breakdown, and the sort menu can order the roster from highest to lowest voting power. Sorting does not change roles or points.
