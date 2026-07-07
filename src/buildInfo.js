/** @type {string} */
export const BUILD_SHA = typeof __BUILD_SHA__ !== 'undefined' ? __BUILD_SHA__ : 'dev';

/** @type {string} */
export const BUILD_SHORT_SHA = typeof __BUILD_SHORT_SHA__ !== 'undefined' ? __BUILD_SHORT_SHA__ : 'dev';

/** @type {string} */
export const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '';

export const BUILD_COMMIT_URL = `https://github.com/yanivorion/text-effects/commit/${BUILD_SHA}`;
