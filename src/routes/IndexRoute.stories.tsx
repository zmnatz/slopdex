import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { IndexRoute } from "./IndexRoute";

const meta = {
  title: "Routes/IndexRoute",
  render: () => <IndexRoute />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
