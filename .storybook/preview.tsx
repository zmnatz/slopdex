import { definePreview } from "@storybook/tanstack-react";
import addonMsw from "msw-storybook-addon";
import { createElement } from "react";
import { clearPokeApiCache } from "../src/utils/api";
import { StoryProviders } from "./StoryProviders";
import { mswHandlers } from "./msw-handlers";
import { previewQueryClient } from "./query-client";
import "../src/index.css";

// Stories and tests import the shared client from here.
export { previewQueryClient };

const preview = definePreview({
  addons: [addonMsw()],
  decorators: [(Story) => createElement(StoryProviders, null, createElement(Story))],
  beforeEach: async ({ msw }) => {
    await msw.resetHandlers();
    await msw.use(...mswHandlers);
    // Every story starts with empty caches so earlier stories' fetched data
    // can't mask a loading/error state in the one under test.
    previewQueryClient.clear();
    await clearPokeApiCache();
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
});

export default preview;
