/**
 * Hook personnalisé pour gérer les événements tactiles et souris de manière cross-platform
 */

import { useEffect, useRef, useState } from 'react';

interface TouchMoveEvent {
  type: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'long-press';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  distance: number;
}

interface UsePointerEventOptions {
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  longPressDelay?: number;
  swipeThreshold?: number;
}

export const usePointerEvent = (
  ref: React.RefObject<HTMLElement>,
  options: UsePointerEventOptions = {}
) => {
  const {
    onTap,
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    longPressDelay = 500,
    swipeThreshold = 50,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTouching, setIsTouching] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handlePointerDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
      const isTouch = e instanceof TouchEvent;
      const clientX = isTouch ? e.touches[0].clientX : (e as PointerEvent | MouseEvent).clientX;
      const clientY = isTouch ? e.touches[0].clientY : (e as PointerEvent | MouseEvent).clientY;

      touchStartRef.current = {
        x: clientX,
        y: clientY,
        time: Date.now(),
      };

      setIsTouching(true);

      // Long press
      longPressTimeoutRef.current = setTimeout(() => {
        if (touchStartRef.current && onLongPress) {
          onLongPress();
        }
      }, longPressDelay);
    };

    const handlePointerMove = (e: PointerEvent | MouseEvent | TouchEvent) => {
      // Réinitialiser le long press si l'utilisateur bouge
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };

    const handlePointerUp = (e: PointerEvent | MouseEvent | TouchEvent) => {
      if (!touchStartRef.current) return;

      const isTouch = e instanceof TouchEvent;
      const clientX = isTouch
        ? e.changedTouches[0].clientX
        : (e as PointerEvent | MouseEvent).clientX;
      const clientY = isTouch
        ? e.changedTouches[0].clientY
        : (e as PointerEvent | MouseEvent).clientY;

      const deltaX = clientX - touchStartRef.current.x;
      const deltaY = clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Annuler le long press si le doigt a bougé
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }

      setIsTouching(false);

      // Déterminer le type de geste
      if (distance < swipeThreshold && deltaTime < 500) {
        // Tap
        onTap?.();
      } else if (distance >= swipeThreshold) {
        // Swipe
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

        if (isHorizontal) {
          if (deltaX > swipeThreshold && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < -swipeThreshold && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          if (deltaY > swipeThreshold && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < -swipeThreshold && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      touchStartRef.current = null;
    };

    // Ajouter les event listeners pour mouse et touch
    element.addEventListener('mousedown', handlePointerDown as EventListener);
    element.addEventListener('mousemove', handlePointerMove as EventListener);
    element.addEventListener('mouseup', handlePointerUp as EventListener);
    element.addEventListener('mouseleave', handlePointerUp as EventListener);

    element.addEventListener('touchstart', handlePointerDown as EventListener);
    element.addEventListener('touchmove', handlePointerMove as EventListener);
    element.addEventListener('touchend', handlePointerUp as EventListener);

    // Support PointerEvents (moderne)
    element.addEventListener('pointerdown', handlePointerDown as EventListener);
    element.addEventListener('pointermove', handlePointerMove as EventListener);
    element.addEventListener('pointerup', handlePointerUp as EventListener);
    element.addEventListener('pointerleave', handlePointerUp as EventListener);

    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }

      element.removeEventListener('mousedown', handlePointerDown as EventListener);
      element.removeEventListener('mousemove', handlePointerMove as EventListener);
      element.removeEventListener('mouseup', handlePointerUp as EventListener);
      element.removeEventListener('mouseleave', handlePointerUp as EventListener);

      element.removeEventListener('touchstart', handlePointerDown as EventListener);
      element.removeEventListener('touchmove', handlePointerMove as EventListener);
      element.removeEventListener('touchend', handlePointerUp as EventListener);

      element.removeEventListener('pointerdown', handlePointerDown as EventListener);
      element.removeEventListener('pointermove', handlePointerMove as EventListener);
      element.removeEventListener('pointerup', handlePointerUp as EventListener);
      element.removeEventListener('pointerleave', handlePointerUp as EventListener);
    };
  }, [onTap, onLongPress, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, longPressDelay, swipeThreshold]);

  return { isTouching };
};

/**
 * Hook pour détecter les clics en dehors d'un élément (compatible mobile)
 */
export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  excludeRefs: React.RefObject<HTMLElement>[] = []
) => {
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const isTouch = event instanceof TouchEvent;
      const target = event.target as Node;

      if (!ref.current?.contains(target)) {
        // Vérifier les refs à exclure
        const isExcluded = excludeRefs.some((excludeRef) => excludeRef.current?.contains(target));
        if (!isExcluded) {
          callback();
        }
      }
    };

    // Utiliser pointer events si disponibles, sinon mouse + touch
    document.addEventListener('mousedown', handlePointerDown as EventListener);
    document.addEventListener('touchstart', handlePointerDown as EventListener);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown as EventListener);
      document.removeEventListener('touchstart', handlePointerDown as EventListener);
    };
  }, [callback, excludeRefs, ref]);
};

/**
 * Hook pour supporter les gestes de zoom/pinch sur mobile
 */
export const usePinchGesture = (
  ref: React.RefObject<HTMLElement>,
  options: {
    onPinchIn?: (scale: number) => void;
    onPinchOut?: (scale: number) => void;
    minScale?: number;
    maxScale?: number;
  } = {}
) => {
  const { onPinchIn, onPinchOut, minScale = 1, maxScale = 3 } = options;
  const touchesRef = useRef<Touch[] | null>(null);
  const initialDistanceRef = useRef<number>(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        touchesRef.current = Array.from(e.touches);
        const [touch1, touch2] = e.touches;
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        initialDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchesRef.current && initialDistanceRef.current > 0) {
        const [touch1, touch2] = e.touches;
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const scale = currentDistance / initialDistanceRef.current;

        if (scale > 1) {
          onPinchOut?.(Math.min(scale, maxScale));
        } else if (scale < 1) {
          onPinchIn?.(Math.max(scale, minScale));
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchesRef.current = null;
        initialDistanceRef.current = 0;
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onPinchIn, onPinchOut, minScale, maxScale]);
};

export default {
  usePointerEvent,
  useClickOutside,
  usePinchGesture,
};
