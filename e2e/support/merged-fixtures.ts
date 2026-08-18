import { mergeTests } from "@playwright/test";
import { log } from "@seontechnologies/playwright-utils";
import { test as interceptFixture } from "@seontechnologies/playwright-utils/intercept-network-call/fixtures";
import { test as recurseFixture } from "@seontechnologies/playwright-utils/recurse/fixtures";

// playwright-utils deviation: network-error-monitor omitted — public/unauth
// navigations can include third-party 4xx that are unrelated to the showroom.

export const test = mergeTests(interceptFixture, recurseFixture);
export { expect } from "@playwright/test";
export { log };
