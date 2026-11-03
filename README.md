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

The site is a read-only viewer. To change the published roster, edit [`src/data/members.json`](./src/data/members.json) directly and deploy the project. Each member needs a unique `id`, a display `name`, a Minecraft `mcName`, and a role defined in [`src/roleConfig.js`](./src/roleConfig.js). `secondaryRole` and `customDesc` are optional.

Run `npm run validate:data` to check the roster for missing fields, duplicate IDs or Minecraft usernames, and unknown roles. The production build runs this validation automatically. Role definitions live in [`src/roleConfig.js`](./src/roleConfig.js).

The rank display groups department heads under Council and the King and Advisors under High Council. The Council filter includes both High Council and department heads, while the High Council filter shows only the King and Advisors. Both filters include matching secondary roles.

Voting power is determined by the member’s primary role only. Secondary roles and `customPoints` do not affect it. Use the sort menu to order the roster by rank, name, or voting power, and the role selector to filter by a specific primary or secondary role.

Select **View full profile** on a member card for their roles, trims, description, and individual voting breakdown.

Profile links are shareable: open a member profile and select **Copy profile link**. Opening or closing a profile also keeps the browser URL in sync, so direct links and browser back/forward navigation work. Press `/` anywhere outside a text field to focus roster search; matching text is highlighted, and selecting a role badge filters the roster to that exact role.

Searches, group/role filters, and sort order are reflected in the URL. Select **Share view** to copy a link that restores those exact browsing settings. Update `lastUpdated` in [`src/data/rosterMetadata.json`](./src/data/rosterMetadata.json) when you change the roster.

Select **Print roster** or use your browser’s print command for a clean, ink-friendly roster layout.

## Phone preview

To preview a phone-sized layout on your computer, run `npm run dev`, open the printed URL in Chrome or Edge, open Developer Tools (`F12`), then toggle the device toolbar with `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac). Choose a phone preset or enter a custom width.

To open the development site on an actual phone, run `npm run dev -- --host 0.0.0.0` and open your computer’s local network address on the phone while both are on the same trusted Wi-Fi. In a VS Code remote workspace, forward port `5173` from the **Ports** panel and use its private forwarded URL on your phone.
