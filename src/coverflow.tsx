import "./coverflow.css"
import { useRef, useState } from "react"
import { useTransition, animated, useSprings } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"

type ItemWithKey<T> = { item: T; key: number }

/**
 * Add a key to an item, which is its original position in the list of items
 */
const withKeys = <T extends unknown>(items: T[]): ItemWithKey<T>[] => {
  return items.map((item, key) => ({ key, item }))
}

type ItemWithIndex<T> = { item: T; index: number }
/**
 * Add an index to an item with a key, which represents its current position in the list
 * of visible items
 */
const withIndex = <T extends unknown>(
  offset: number,
  items: ItemWithKey<T>[]
): ItemWithIndex<T>[] =>
  items.map((item) => ({ ...item, index: item.key - offset }))

export type CoverflowProps<T> = {
  /** A list of items to be displayed in the coverflow */
  items: T[]
  children: (item: T) => JSX.Element
  /** Maximum number of items to display on each side of the central item */
  sideItems?: number
  /** Which item will initially be displayed in the centre */
  startPosition?: number
  /** Amount by which to scale each item */
  scale?: number
  /** Ratio between the amount that we scale the central item and the amount we scale the side items */
  scaleRatio?: number
  /** The angle by which each side item is rotated, in degrees */
  angle?: number
  /** Gap between each side item, in pixels*/
  gap?: number
  /** Gap between the central item and each side item, in pixels */
  centreGap?: number
  /** The css 'perspective' value, which "determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective"*/
  perspective?: number
  /** Distance between the side items and the central item in the z-axis. A positive value moves the central item towards the viewer */
  depth?: number
  /** Event that will be fired when the central item is clicked*/
  itemClicked?: (item: T) => void
  /** Event that will be fired when any of the side items are clicked*/
  sideItemClicked?: (item: T) => void
  /** Show reflections below each item.*/
  showReflections?: boolean
  /** When dragging, how far in pixels to you need to drag in order for to trigger moving to the next item */
  dragThreshold?: number
  /** When dragging, allows adjustment of the amount moved by the mouse vs how far the item moves on screen */
  dragSpeed?: number
  /** If true, when clicking on a side item, the coverflow will advance to the next position */
  clickableSide?: boolean
}

export const Coverflow = <T extends unknown>({
  items,
  startPosition = 0,
  sideItems = 3,
  scale = 1,
  scaleRatio = 1,
  angle = 60,
  gap = 20,
  centreGap = 40,
  perspective = 1000,
  depth = 200,
  itemClicked,
  sideItemClicked,
  showReflections = true,
  dragThreshold = 100,
  clickableSide = true,
  dragSpeed = 0.5,
  children,
}: CoverflowProps<T>) => {
  const clampPosition = (n: number) => {
    return Math.max(0, Math.min(n, items.length - 1))
  }

  const [position, setPosition] = useState(clampPosition(startPosition))
  console.log(`position: ${position}, startPosition: ${startPosition}`)

  const preventClick = useRef(false)

  const handleClick = (item: ItemWithIndex<T>) => {
    if (preventClick.current) {
      preventClick.current = false
      return
    }

    if (item.index === 0) {
      itemClicked?.(item.item)
    } else {
      sideItemClicked?.(item.item)
      if (clickableSide) {
        setPosition((position) => position + Math.sign(item.index))
      }
    }
  }

  const start = Math.max(position - sideItems, 0)
  const end = Math.min(position + sideItems + 1, items.length)
  const visibleItems = withIndex(position, withKeys(items).slice(start, end))

  const getTransform = (index: number) => {
    const transX = index === 0 ? 0 : centreGap * Math.sign(index) + gap * index
    const rotation = index === 0 ? 0 : -Math.sign(index) * angle
    const scaleXY = scale * (index === 0 ? 1 : scaleRatio)
    const transZ = index === 0 ? 0 : -depth
    return `perspective(${perspective}px) translate3d(${transX}%,0px, ${transZ}px) rotateY(${rotation}deg) scale(${scaleXY}, ${scaleXY})`
  }

  const getZIndex = (index: number) => 100 - Math.abs(index)

  const transitions = useTransition(visibleItems, {
    from: (item) => ({
      opacity: 0,
      transform: getTransform(item.index),
    }),
    enter: (item) => ({
      opacity: 1,
      transform: getTransform(item.index),
    }),
    update: (item) => ({
      opacity: 1,
      transform: getTransform(item.index),
    }),
    leave: (item) => ({
      opacity: 0,
      transform: getTransform(item.index),
    }),

    // config: config.molasses,
    key: (item: ItemWithKey<unknown>) => item.key,
  })

  const [dragSprings, dragSpringsApi] = useSprings(
    visibleItems.length,
    (_index) => ({
      x: 0,
      rotateY: 0,
    })
  )

  const lastX = useRef(0)

  const bind = useDrag(
    ({ first, active, movement: [mx] }) => {
      if (first) {
        lastX.current = 0
      }
      const newX = mx - lastX.current
      // console.log(`lastX: ${lastX.current},mx: ${mx}, newX: ${newX}`)
      dragSpringsApi.start({ x: active ? newX * dragSpeed : 0, rotateY: 0 })
      if (Math.abs(newX) > dragThreshold) {
        setPosition((position) => clampPosition(position - Math.sign(newX)))
        lastX.current = mx
        preventClick.current = true
      }
    },
    { preventDefault: true }
  )

  return (
    <div className="coverflow-container">
      {transitions((style, item, _t, i) => {
        const theStyle = {
          ...style,
          zIndex: getZIndex(item.index),
        }

        return (
          <animated.div
            className={`coverflow-item-container`}
            style={theStyle}
            onClick={() => handleClick(item)}
          >
            <animated.div
              className={`coverflow-item-draggable ${
                showReflections ? "reflected" : ""
              }`}
              style={{ ...dragSprings[i], touchAction: "none" }}
              {...bind()}
            >
              {children(item.item)}
            </animated.div>
          </animated.div>
        )
      })}
    </div>
  )
}

export type CoverflowItemProps = {
  width: number
  height: number
  imageURL: string
} & React.HTMLAttributes<HTMLDivElement>

export const CoverflowItem = ({
  width,
  height,
  imageURL,
  className,
  ...otherProps
}: CoverflowItemProps) => {
  const props = {
    ...otherProps,
    className: `${className || ""} coverflow-item`,
    style: {
      ...otherProps.style,
      backgroundImage: `url(${imageURL})`,
      backgroundSize: "cover",
      width,
      height,
    },
  }
  return <div {...props} />
}
