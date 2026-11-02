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

## Updating the roster

Edit the `INITIAL_MEMBERS` list and `ROLE_CONFIG` in `src/KingdomHierarchy.jsx`. Each member can have a primary role, an optional secondary role, a Minecraft username, a custom voting-point value, and a short description.

The rank display groups department heads under Council and the King and Advisors under High Council. The Council filter includes both High Council and department heads, while the High Council filter shows only the King and Advisors. Both filters include matching secondary roles; changing rank order does not change voting points.
