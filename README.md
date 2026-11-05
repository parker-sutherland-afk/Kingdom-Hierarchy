# Kingdom Hierarchy

A searchable roster and static community pages for the kingdom, built with React, Vite, Tailwind CSS, and Lucide icons.

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

## Community pages

The Community link opens static, read-only **Notices**, **Build projects**, and **Profiles** pages. There is no chat/message board, sign-in system, external database, or member editing. Public roster profiles link back to each member’s full roster profile.

To publish a notice, edit [`src/data/notices.json`](./src/data/notices.json) and deploy. Each notice has an `id`, `title`, `body`, and `date` (`YYYY-MM-DD`). To publish a build project, edit [`src/data/buildProjects.json`](./src/data/buildProjects.json) and deploy. Each project has an `id`, `title`, `description`, `status` (`planned`, `active`, or `completed`), and `progress` (0–100); `updatedAt` (`YYYY-MM-DD`) is optional. The pages are empty until you add content.

A council-only board is intentionally omitted: without a server or protected hosting, static content cannot be kept private. Do not put confidential council messages in the site or repository.

## Roster data

To change the published roster, edit [`src/data/members.json`](./src/data/members.json) directly and deploy the project. Each member needs a unique `id`, a display `name`, and a role defined in [`src/roleConfig.js`](./src/roleConfig.js). `mcName`, `section`, `secondaryRole`, and `customDesc` are optional. A member can have `section: "Citizens"` to place them in that area without changing their actual role or voting points.

Run `npm run validate:data` to check the roster for missing fields, duplicate IDs or Minecraft usernames, and unknown roles. Minecraft usernames are optional. The production build runs this validation automatically. Role definitions live in [`src/roleConfig.js`](./src/roleConfig.js).

To publish a temporary King-away notice, set `kingAway` in [`src/data/rosterMetadata.json`](./src/data/rosterMetadata.json) to `true`; set it back to `false` when the King returns. While enabled, the viewer lists members whose primary role is Advisor as acting leaders and labels their cards. This does not change anyone’s permanent role or voting points. Commit and deploy the metadata change to update the shared site.

The rank display groups department heads under Council and the King and Advisors under High Council. The Council filter includes both High Council and department heads, while the High Council filter shows only the King and Advisors. Both filters include matching secondary roles.

Voting power is determined by the member’s primary role only. Secondary roles and `customPoints` do not affect it. Use the sort menu to order the roster by rank, name, or voting power, and the role selector to filter by a specific primary or secondary role.

Select **View full profile** on a member card for their roles, trims, description, and individual voting breakdown.

Profile links are shareable: open a member profile and select **Copy profile link**. Opening or closing a profile also keeps the browser URL in sync, so direct links and browser back/forward navigation work. Press `/` anywhere outside a text field to focus roster search; matching text is highlighted, and selecting a role badge filters the roster to that exact role.

Searches, group/role filters, and sort order are reflected in the URL. Select **Share view** to copy a link that restores those exact browsing settings. Update `lastUpdated` in [`src/data/rosterMetadata.json`](./src/data/rosterMetadata.json) when you change the roster.

Select **Print roster** or use your browser’s print command for a clean, ink-friendly roster layout.

Open **Role guide and primary-role voting points** to review each defined role. Use **Compact** to fit more member cards on screen; the selected density is included in shared links. Minecraft skins load by default, with Minotar, Cravatar, MineSkin, and MC-Heads tried in sequence if a provider fails. If all providers fail, the avatar shows local initials and a retry control. Choose **Local** in the avatar source control to avoid external image requests.

## Phone preview

To preview a phone-sized layout on your computer, run `npm run dev`, open the printed URL in Chrome or Edge, open Developer Tools (`F12`), then toggle the device toolbar with `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac). Choose a phone preset or enter a custom width.

To open the development site on an actual phone, run `npm run dev -- --host 0.0.0.0` and open your computer’s local network address on the phone while both are on the same trusted Wi-Fi. In a VS Code remote workspace, forward port `5173` from the **Ports** panel and use its private forwarded URL on your phone.
