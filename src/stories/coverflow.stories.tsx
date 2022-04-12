import { Coverflow, CoverflowItem, CoverflowProps } from "../coverflow"
import { Story } from "@storybook/react"

export default {
  title: "Coverflow",
  component: Coverflow,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    numberOfItems: {
      description: `Size of the array of items to set up for this test.
      (This is part of the test fixture, not a property of the Coverflow component).`,
      control: { type: "number", min: 1, max: 500 },
    },
    items: {
      control: false,
    },
    sideItems: {
      control: { type: "range", min: 1, max: 50, step: 1 },
    },
    startPosition: {
      control: { type: "number", min: 1, max: 500 },
    },
    scale: {
      control: { type: "range", min: 0.1, max: 3, step: 0.1 },
    },
    scaleRatio: {
      control: { type: "range", min: 0.1, max: 3, step: 0.1 },
    },
    angle: {
      control: { type: "range", min: 0, max: 90, step: 1 },
    },
    gap: {
      control: { type: "range", min: 1, max: 100, step: 5 },
    },
    centreGap: {
      control: { type: "range", min: 1, max: 100, step: 1 },
    },
    perspective: {
      control: { type: "range", min: 0, max: 2000, step: 10 },
    },
    depth: {
      control: { type: "range", min: 0, max: 1000, step: 10 },
    },
    showReflections: {
      control: {
        type: "boolean",
      },
    },
    dragThreshold: {
      control: { type: "range", min: 0, max: 250, step: 5 },
    },
    dragSpeed: {
      control: { type: "range", min: 0, max: 4, step: 0.25 },
    },
    clickableSide: {
      control: {
        type: "boolean",
      },
    },
    itemClicked: {
      control: false,
      action: "itemClicked",
    },
    sideItemClicked: {
      control: false,
      action: "sideItemClicked",
    },
  },
}

type Image = { src: string }

type StoryType = CoverflowProps<Image> & { numberOfItems: number }

const Template: Story<StoryType> = ({ numberOfItems, ...args }: StoryType) => {
  const images = [...new Array(numberOfItems)].map((_, i) => ({
    src: `https://picsum.photos/300/300?${i}`,
  }))

  return (
    <Coverflow {...args} items={images}>
      {(image) => (
        <CoverflowItem width={300} height={300} imageURL={image.src} />
      )}
    </Coverflow>
  )
}

export const Basic = Template.bind({})
Basic.args = {
  numberOfItems: 50,
  startPosition: 0,
  sideItems: 3,
  scale: 1,
  scaleRatio: 1,
  angle: 60,
  gap: 20,
  centreGap: 40,
  perspective: 1000,
  depth: 200,
  showReflections: true,
  dragThreshold: 100,
  dragSpeed: 0.5,
  clickableSide: true,
}
