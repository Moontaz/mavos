import gsap from 'gsap';

export const motionEase = 'power4.out';

export function revealLines(elements: Element | Element[], delay = 0) {
  return gsap.fromTo(elements, { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, delay, stagger: 0.07, ease: motionEase });
}

export function enterPage(container: Element) {
  return gsap.fromTo(container, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.75, ease: motionEase });
}
