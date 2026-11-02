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

## Editing the roster

Use **Edit roster** on the site to add, update, or remove members. Changes can be saved in the current browser, undone while editing, or reset to the published roster. Browser-saved edits are private to that browser and do not update the live site for other visitors.

To publish changes for everyone, use **Download JSON**, replace [`src/data/members.json`](./src/data/members.json) with the downloaded file, and deploy the project. Each member needs a unique `id`, a display `name`, a Minecraft `mcName`, and a role defined by `ROLE_CONFIG` in `src/KingdomHierarchy.jsx`. `secondaryRole`, `customPoints`, and `customDesc` are optional.

The editor validates required fields, unique IDs, role names, point values, and limited role capacity before saving or exporting.

The rank display groups department heads under Council and the King and Advisors under High Council. The Council filter includes both High Council and department heads, while the High Council filter shows only the King and Advisors. Both filters include matching secondary roles.

Voting points add the primary and secondary role values unless `customPoints` is set; custom points replace that sum. Each member card has an expandable breakdown, and the sort menu can order the roster from highest to lowest voting power. Sorting does not change roles or points.

The dashboard shows vacancies for roles with a seat limit; secondary roles count toward seat occupancy, while unlimited roles are omitted. Select a vacancy to filter the roster by that role. Rank voting totals count each member once under their primary role, so the rank totals add up to the realm total. Select **View full profile** on a member card for their roles, trims, description, and voting breakdown.
