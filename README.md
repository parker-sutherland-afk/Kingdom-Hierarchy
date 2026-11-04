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

Browser-level tests run the app in Chromium. Install the browser once, then run them with:

```sh
npx playwright install --with-deps chromium
npm run test:e2e
```

Run both the unit and browser tests with `npm run test:all`.

## Roster data

The site is a read-only viewer. To change the published roster, edit [`src/data/members.json`](./src/data/members.json) directly and deploy the project. Each member needs a unique `id`, a display `name`, a Minecraft `mcName`, and a role defined in [`src/roleConfig.js`](./src/roleConfig.js). `secondaryRole` and `customDesc` are optional.

Run `npm run validate:data` to check the roster for missing fields, duplicate IDs or Minecraft usernames, and unknown roles. The production build runs this validation automatically. Role definitions live in [`src/roleConfig.js`](./src/roleConfig.js).

To publish a temporary King-away notice, set `kingAway` in [`src/data/rosterMetadata.json`](./src/data/rosterMetadata.json) to `true`; set it back to `false` when the King returns. While enabled, the Leadership panel names the Advisors as acting leaders and labels their cards. This does not change anyone’s permanent role or voting points. Update `lastUpdated` in the same file whenever you change roster or leadership information, then commit and deploy the metadata change to update the shared site.

The rank display groups department heads under Council and the King and Advisors under High Council. The Council filter includes both High Council and department heads, while the High Council filter shows only the King and Advisors. Both filters include matching secondary roles.

Voting power is determined by the member’s primary role only. Secondary roles and `customPoints` do not affect it. Use the sort menu to order the roster by rank, name, or voting power, and the role selector to filter by a specific primary or secondary role.

Select **View full profile** on a member card for their roles, trims, description, and individual voting breakdown.

Profile links are shareable: open a member profile and select **Copy profile link**. Opening or closing a profile also keeps the browser URL in sync, so direct links and browser back/forward navigation work. Press `/` anywhere outside a text field to focus roster search; matching text is highlighted, and selecting a role badge filters the roster to that exact role.

Searches, group/role filters, and sort order are reflected in the URL. Select **Share view** to copy a link that restores those exact browsing settings. Update `lastUpdated` in [`src/data/rosterMetadata.json`](./src/data/rosterMetadata.json) when you change the roster.

Select **Print roster** or use your browser’s print command for a clean, ink-friendly roster layout.

Use the sticky section navigation to jump to the overview, member search, role guide, or roster. **Roles & points** opens the guide automatically. Use **Compact** to fit more member cards on screen; the selected density is included in shared links. Minecraft skins load by default, with Minotar, Cravatar, MineSkin, and MC-Heads tried in sequence if a provider fails. If all providers fail, the avatar shows local initials and a retry control. Choose **Local** in the avatar source control to avoid external image requests.

## Phone preview

To preview a phone-sized layout on your computer, run `npm run dev`, open the printed URL in Chrome or Edge, open Developer Tools (`F12`), then toggle the device toolbar with `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac). Choose a phone preset or enter a custom width.

To open the development site on an actual phone, run `npm run dev -- --host 0.0.0.0` and open your computer’s local network address on the phone while both are on the same trusted Wi-Fi. In a VS Code remote workspace, forward port `5173` from the **Ports** panel and use its private forwarded URL on your phone.
