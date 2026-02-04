import { useEffect, useRef, useState } from "react";
import HotlineButton from "../components/HotlineButton";
import { IconCallMade, IconChevron } from "../components/Icons";

function ResourcesSection({
  localResources,
  title = "Resources",
  intro = "Has someone in your family been detained by agents or are you a witness of an agent raid in your community?",
  toggleLabel = "More local resources",
  hotlineLabel = "Find a Hotline",
  cardsLabel = "Local resource cards",
  closeMenuLabel = "Close local resources menu",
}) {
  const [isOpenByClick, setIsOpenByClick] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverCloseTimeout = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const hoverQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );
    const widthQuery = window.matchMedia("(min-width: 1201px)");

    const updateHoverCapable = () =>
      setHoverCapable(hoverQuery.matches && widthQuery.matches);

    const hasAddEventListener =
      typeof hoverQuery.addEventListener === "function";
    const hasWidthAddEventListener =
      typeof widthQuery.addEventListener === "function";

    updateHoverCapable();

    if (hasAddEventListener) {
      hoverQuery.addEventListener("change", updateHoverCapable);
    } else {
      hoverQuery.onchange = updateHoverCapable;
    }

    if (hasWidthAddEventListener) {
      widthQuery.addEventListener("change", updateHoverCapable);
    } else {
      widthQuery.onchange = updateHoverCapable;
    }

    return () => {
      if (hasAddEventListener) {
        hoverQuery.removeEventListener("change", updateHoverCapable);
      } else if (hoverQuery.onchange === updateHoverCapable) {
        hoverQuery.onchange = null;
      }

      if (hasWidthAddEventListener) {
        widthQuery.removeEventListener("change", updateHoverCapable);
      } else if (widthQuery.onchange === updateHoverCapable) {
        widthQuery.onchange = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hoverCloseTimeout.current) {
        clearTimeout(hoverCloseTimeout.current);
        hoverCloseTimeout.current = null;
      }
    };
  }, []);

  const handleToggle = () => setIsOpenByClick((prev) => !prev);

  const handlePointerEnter = () => {
    if (!hoverCapable) return;
    if (hoverCloseTimeout.current) {
      clearTimeout(hoverCloseTimeout.current);
      hoverCloseTimeout.current = null;
    }
    setIsHovering(true);
  };

  const handlePointerLeave = () => {
    if (!hoverCapable) return;
    if (hoverCloseTimeout.current) {
      clearTimeout(hoverCloseTimeout.current);
      hoverCloseTimeout.current = null;
    }
    hoverCloseTimeout.current = setTimeout(() => {
      setIsHovering(false);
      hoverCloseTimeout.current = null;
    }, 300);
  };

  const handleFocusCapture = (event) => {
    if (!hoverCapable) return;
    if (hoverCloseTimeout.current) {
      clearTimeout(hoverCloseTimeout.current);
      hoverCloseTimeout.current = null;
    }
    setIsHovering(true);
  };

  const handleBlurCapture = (event) => {
    if (!hoverCapable) return;
    const nextFocused = event.relatedTarget;
    if (!sectionRef.current?.contains(nextFocused)) {
      setIsHovering(false);
    }
  };

  const isMenuOpen = hoverCapable
    ? isHovering || isOpenByClick
    : isOpenByClick;

  return (
    <section
      id="resources"
      ref={sectionRef}
      className="panel flex-container flex-dir-col"

    >
      <h2 className="section-title archivo-800">{title}</h2>
      <p className="body-medium text-center roboto-400">{intro}</p>
      <HotlineButton>{hotlineLabel}</HotlineButton>
      <div
        className="resources-dropdown"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <button
          type="button"
          className="resource-toggle text-center flex-container"
          onClick={handleToggle}
          aria-expanded={isMenuOpen}
          data-hoverable={hoverCapable ? "true" : "false"}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
        >
          <span className="body-xlarge archivo-800">{toggleLabel} </span>
          <IconChevron />
        </button>
        {!hoverCapable && isOpenByClick && (
          <button
            type="button"
            aria-label={closeMenuLabel}
            className="resources-overlay"
            onClick={() => setIsOpenByClick(false)}
          />
        )}
        {hoverCapable && isMenuOpen && (
          <div
            aria-hidden="true"
            className="resources-hover-bridge"
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          />
        )}
        <ul
          className="local-resources"
          aria-label={cardsLabel}
          hidden={!isMenuOpen}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          {localResources.map((city) => (
            <li key={city.label} className="local-resource-card">
              <a
                className="archivo-800"
                href={city.url}
                target="_blank"
                rel="noreferrer"
              >
                {city.label}
                <IconCallMade />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default ResourcesSection;
