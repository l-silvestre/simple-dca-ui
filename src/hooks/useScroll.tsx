import { RefObject, useCallback, useEffect, useState } from 'react';

const useScroll = (ref: RefObject<HTMLElement | null>) => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [isNearTop, setIsNearTop] = useState(false);
  const [isTopHalf, setIsTopHalf] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollChanged, setScrollChanged] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScrollEvent = useCallback((e: Event) => {
    if (e?.currentTarget) {
      setScrollChanged(val => !val);
      const target = e.currentTarget as HTMLElement;
      setIsScrolled(target.scrollTop > 0);
      const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
      setIsAtBottom(bottom);
      const topHalf = target.scrollTop < target.scrollHeight / 2;
      setIsTopHalf(topHalf);
      setIsTop(target.scrollTop === 0);
      const topThreshold = 0.1;
      setIsNearTop(target.scrollTop < target.scrollHeight * topThreshold);
      setScrollTop(target.scrollTop);
    }
  }, []);

  useEffect(() => {
    if (ref?.current) {
      ref.current.addEventListener('scroll', handleScrollEvent, false);
    }
    const vaueToClean = ref?.current;

    return () => {
      if (vaueToClean) {
        vaueToClean.removeEventListener('scroll', handleScrollEvent, false);
      }
    };
  }, [ref, handleScrollEvent]);

  return { isAtBottom, isTop, isNearTop, isTopHalf, isScrolled, scrollChanged, scrollTop };
};

export default useScroll;
