import "./coverflow.css"
import { useState } from "react"
import { useTransition, animated, config } from "@react-spring/web"

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
  items: T[]
  children: (item: T) => JSX.Element
  sideItems?: number
  startPosition?: number
  scale?: number
  scaleRatio?: number
  angle?: number
  gap?: number
  centreGap?: number
  perspective?: number
  depth?: number
  itemClicked?: (item: T) => void
  sideItemClicked?: (item: T) => void
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
  children,
}: CoverflowProps<T>) => {
  const [position, setPosition] = useState(
    Math.max(0, Math.min(startPosition, items.length - 1))
  )

  const handleClick = (item: ItemWithIndex<T>) => {
    item.index == 0 ? itemClicked?.(item.item) : sideItemClicked?.(item.item)
    setPosition((p) => p + item.index)
  }

  const start = Math.max(position - sideItems, 0)
  const end = Math.min(position + sideItems + 1, items.length)
  const visibleItems = withIndex(position, withKeys(items).slice(start, end))

  const getTransform = (index: number) => {
    const transX =
      index === 0 ? 0 : (centreGap * index) / Math.abs(index) + gap * index
    const rotation = index === 0 ? 0 : -(index / Math.abs(index)) * angle
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

    config: config.molasses,
    key: (item: ItemWithKey<unknown>) => item.key,
  })

  return (
    <div className="coverflow-container">
      {transitions((style, item) => {
        const theStyle = {
          ...style,
          zIndex: getZIndex(item.index),
        }
        return (
          <animated.div
            className="coverflow-item"
            style={theStyle}
            onClick={() => handleClick(item)}
          >
            {children(item.item)}
          </animated.div>
        )
      })}
    </div>
  )
}
