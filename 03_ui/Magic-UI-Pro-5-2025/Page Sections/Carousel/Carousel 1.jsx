"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";

import { NextButton, PrevButton, useCarouselButtons } from "./carousel-button";

type EmblaCarouselPropType = {
  className?: string;
  slides: React.ReactNode[];
  options?: EmblaCarouselType["options"];
  autoplay?: boolean;
  autoplayDelay?: number;
  maxTranslateY?: number;
  tweenFactorBase?: number;
};

const TWEEN_FACTOR_BASE = 0.4;
const MAX_TRANSLATE_Y = 120;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

const EmblaCarousel: React.FC<EmblaCarouselPropType> = (props) => {
  const {
    slides,
    options,
    className,
    autoplay = true,
    autoplayDelay = 2000,
    maxTranslateY = MAX_TRANSLATE_Y,
    tweenFactorBase = TWEEN_FACTOR_BASE,
  } = props;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    options,
    autoplay
      ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
      : [],
  );
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = useCarouselButtons(emblaApi);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode: HTMLElement) => {
      return slideNode.querySelector(".embla__slide__number") as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = tweenFactorBase * emblaApi.scrollSnapList().length;
  }, []);

  const tweenTranslate = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi
        .scrollSnapList()
        .forEach((scrollSnap: number, snapIndex: number) => {
          let diffToTarget = scrollSnap - scrollProgress;
          const slidesInSnap = engine.slideRegistry[snapIndex];

          slidesInSnap.forEach((slideIndex: number) => {
            if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

            if (engine.options.loop) {
              engine.slideLooper.loopPoints.forEach((loopItem: any) => {
                const target = loopItem.target();

                if (slideIndex === loopItem.index && target !== 0) {
                  const sign = Math.sign(target);

                  if (sign === -1) {
                    diffToTarget = scrollSnap - (1 + scrollProgress);
                  }
                  if (sign === 1) {
                    diffToTarget = scrollSnap + (1 - scrollProgress);
                  }
                }
              });
            }

            const tweenValue = Math.abs(diffToTarget * tweenFactor.current);
            const translateY = numberWithinRange(
              tweenValue * maxTranslateY,
              0,
              maxTranslateY,
            );

            const opacity = numberWithinRange(1 - tweenValue * 0.5, 0.5, 1);

            const tweenNode = tweenNodes.current[slideIndex];
            tweenNode.style.transform = `translateY(${translateY}px)`;
            tweenNode.style.opacity = opacity.toString();
          });
        });
    },
    [],
  );

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenTranslate(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenTranslate)
      .on("scroll", tweenTranslate);
  }, [emblaApi, setTweenFactor, setTweenNodes, tweenTranslate]);

  return (
    <div className="relative">
      <div className="py-10 overflow-visible" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              className="max-[350px]:[flex:0_0_18rem] [flex:0_0_20rem] flex pl-4"
              key={index}
            >
              <div
                className={`embla__slide__number w-full flex items-center justify-center h-full ${
                  className || ""
                }`}
              >
                <div className="h-full w-full">
                  <div className="group relative z-0 h-full w-full overflow-hidden rounded">
                    <div className="overflow-hidden rounded h-full w-full">
                      {slide}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 py-10">
        <PrevButton
          className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-700 rounded-full"
          onClick={onPrevButtonClick}
          disabled={prevBtnDisabled}
        />
        <NextButton
          className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-700 rounded-full"
          onClick={onNextButtonClick}
          disabled={nextBtnDisabled}
        />
      </div>
    </div>
  );
};

const CarouselSlidesData = [
  {
    id: 1,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1675432656807-216d786dd468?q=80&w=1980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1669725687221-6fe12c2da6b1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1669725687150-15c603ac6a73?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1pbi1zYW1lLXNlcmllc3w1fHx8ZW58MHx8fHx8",
  },
  {
    id: 4,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1669740462444-ba6e0c316b59?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDZ8fHxlbnwwfHx8fHw%3D",
  },
  {
    id: 5,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1669725687221-6fe12c2da6b1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export function Emblacarousel1() {
  const OPTIONS: EmblaOptionsType = { loop: true };
  const slides = CarouselSlidesData.map((testimonial) => (
    <div
      key={testimonial.id}
      className="w-full h-full flex relative cursor-grab border rounded-xl select-none"
    >
      <div className="w-full h-full z-[1]">
        <div className="w-full h-full p-3.5 flex flex-col md:flex-row gap-x-10 items-start md:items-end justify-end md:justify-between text-content">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-full h-full object-cover absolute top-0 left-0 rounded-xl -z-10"
          />
          <div className="flex flex-col gap-y-2 w-full h-fit backdrop-blur-sm border border-neutral-200/50 rounded-xl p-5 text-white">
            <h2 className="text-base text-balance font-medium leading-6 text-left">
              {testimonial.text}
            </h2>
            <div className="flex flex-col gap-y-0.5">
              <p className="text-balance text-sm font-semibold text-left">
                {testimonial.name}
              </p>
              <p className="text-balance text-xs font-medium text-left">
                {testimonial.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <section className="flex flex-col items-center justify-center w-full">
      <div className="max-w-7xl mx-auto overflow-hidden p-5 pt-10 md:py-20 pb-28 flex items-center justify-center w-full">
        <EmblaCarousel
          slides={slides}
          options={OPTIONS}
          maxTranslateY={250}
          tweenFactorBase={0.2}
          className="w-full min-h-[25rem] h-full"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-1/5 bg-gradient-to-r from-white dark:from-black md:block"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/5 bg-gradient-to-l from-white dark:from-black md:block"></div>
      </div>
    </section>
  );
}
