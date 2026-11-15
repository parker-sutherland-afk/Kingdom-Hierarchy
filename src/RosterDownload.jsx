import React from 'react';
import { Download } from 'lucide-react';
import MEMBERS from './data/members.json';
import ROLE_CONFIG from './roleConfig.js';
import { getVotingPowerBreakdown } from './rosterUtils.js';
import { buildRosterCsv, downloadTextFile } from './rosterCsv.js';

export default function RosterDownloadButton() {
  function download() {
    const csv = buildRosterCsv(MEMBERS, member => getVotingPowerBreakdown(member, ROLE_CONFIG).points);
    downloadTextFile(`kingdom-roster-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-stone-700 px-3 font-semibold text-stone-300 transition hover:border-amber-400/50 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
    >
      <Download aria-hidden="true" size={13} /> Download roster
    </button>
  );
}
