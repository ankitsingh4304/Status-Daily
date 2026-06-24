export type ProfileCirclePosition =
  | 'center'
  | 'bottomRight'
  | 'bottomLeft'
  | 'topRight'
  | 'topLeft';

/** Cycle order when user taps Change Design.
 *  Per product decision, the name plate only toggles between the two bottom
 *  corners — bottom-right is the default/standard, bottom-left is the alternate. */
export const PROFILE_POSITION_CYCLE: ProfileCirclePosition[] = [
  'bottomRight',
  'bottomLeft',
];

export function nextProfilePosition(current: ProfileCirclePosition): ProfileCirclePosition {
  const i = PROFILE_POSITION_CYCLE.indexOf(current);
  return PROFILE_POSITION_CYCLE[(i + 1) % PROFILE_POSITION_CYCLE.length];
}
