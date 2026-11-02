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

## Roster data

The site is a read-only viewer. To change the published roster, edit [`src/data/members.json`](./src/data/members.json) directly and deploy the project. Each member needs a unique `id`, a display `name`, a Minecraft `mcName`, and a role defined by `ROLE_CONFIG` in [`src/KingdomHierarchy.jsx`](./src/KingdomHierarchy.jsx). `secondaryRole` and `customDesc` are optional.

The rank display groups department heads under Council and the King and Advisors under High Council. The Council filter includes both High Council and department heads, while the High Council filter shows only the King and Advisors. Both filters include matching secondary roles.

Voting power is determined by the member’s primary role only. Secondary roles and `customPoints` do not affect it. Use the sort menu to order the roster by rank, name, or voting power, and the role selector to filter by a specific primary or secondary role.

Select **View full profile** on a member card for their roles, trims, description, and individual voting breakdown.
