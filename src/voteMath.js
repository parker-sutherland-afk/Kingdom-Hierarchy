export const PASS_PERCENT = 51;

// Adds up yes / no / not-voting points for a motion and decides whether it passes.
// By default the 51% line is measured against the votes cast. With countAbsentAsNo it is
// measured against all voting power, so members who did not vote count against the motion.
export function tallyVotes(members, votes, pointsFor, { countAbsentAsNo = false } = {}) {
  let yes = 0;
  let no = 0;
  let notVoting = 0;

  for (const member of members) {
    const points = pointsFor(member);
    const vote = votes[member.id];
    if (vote === 'yes') yes += points;
    else if (vote === 'no') no += points;
    else notVoting += points;
  }

  const total = yes + no + notVoting;
  const cast = yes + no;
  const basis = countAbsentAsNo ? total : cast;

  return {
    yes,
    no,
    notVoting,
    total,
    cast,
    share: basis > 0 ? yes / basis : 0,
    passes: basis > 0 && yes * 100 >= PASS_PERCENT * basis,
  };
}
