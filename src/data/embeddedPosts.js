// Embedded Systems Series: hardware teaching posts that reuse the same
// data-driven block format as the AI Engineering series (SeriesPost.jsx).
// Each post lives in content/embedded/ and is given its series metadata here.
import { POST as POWER_AND_CHARGING } from '../../content/embedded/power-and-charging-block.js';

const SERIES = 'Embedded Systems Series';

export const EMBEDDED_POSTS = [
  { ...POWER_AND_CHARGING, series: SERIES, seriesNum: 1, chapter: 'Chapter 1' },
];
