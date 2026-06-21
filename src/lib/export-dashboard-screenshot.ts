const CAPTURE_SCALE = 2;
const BACKGROUND_COLOR = "#000000";

function waitForDomPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function hasScrollableOverflow(style: CSSStyleDeclaration) {
  return (
    style.overflowX === "auto" ||
    style.overflowX === "scroll" ||
    style.overflowY === "auto" ||
    style.overflowY === "scroll" ||
    style.overflow === "auto" ||
    style.overflow === "scroll"
  );
}

function prepareOverflowContainersForCapture(root: HTMLElement) {
  const restored: Array<{
    element: HTMLElement;
    overflow: string;
    overflowX: string;
    overflowY: string;
    width: string;
    maxWidth: string;
    height: string;
    maxHeight: string;
  }> = [];

  [root, ...root.querySelectorAll<HTMLElement>("*")].forEach((element) => {
    const style = window.getComputedStyle(element);
    if (!hasScrollableOverflow(style)) return;

    restored.push({
      element,
      overflow: element.style.overflow,
      overflowX: element.style.overflowX,
      overflowY: element.style.overflowY,
      width: element.style.width,
      maxWidth: element.style.maxWidth,
      height: element.style.height,
      maxHeight: element.style.maxHeight,
    });

    element.style.overflow = "visible";
    element.style.overflowX = "visible";
    element.style.overflowY = "visible";

    if (element.scrollWidth > element.clientWidth) {
      element.style.width = `${element.scrollWidth}px`;
      element.style.maxWidth = "none";
    }

    if (element.scrollHeight > element.clientHeight) {
      element.style.height = `${element.scrollHeight}px`;
      element.style.maxHeight = "none";
    }
  });

  return () => {
    restored.forEach(
      ({ element, overflow, overflowX, overflowY, width, maxWidth, height, maxHeight }) => {
        element.style.overflow = overflow;
        element.style.overflowX = overflowX;
        element.style.overflowY = overflowY;
        element.style.width = width;
        element.style.maxWidth = maxWidth;
        element.style.height = height;
        element.style.maxHeight = maxHeight;
      }
    );
  };
}

function lockScreenshotButtonRows(root: HTMLElement) {
  const restored: Array<{
    element: HTMLElement;
    display: string;
    flexDirection: string;
    flexWrap: string;
    alignItems: string;
    width: string;
    minWidth: string;
  }> = [];

  root.querySelectorAll<HTMLElement>("[data-screenshot-button-row]").forEach((element) => {
    restored.push({
      element,
      display: element.style.display,
      flexDirection: element.style.flexDirection,
      flexWrap: element.style.flexWrap,
      alignItems: element.style.alignItems,
      width: element.style.width,
      minWidth: element.style.minWidth,
    });

    element.style.display = "flex";
    element.style.flexDirection = "row";
    element.style.flexWrap = "nowrap";
    element.style.alignItems = "center";
    element.style.width = "max-content";
    element.style.minWidth = `${element.scrollWidth}px`;
  });

  return () => {
    restored.forEach(
      ({ element, display, flexDirection, flexWrap, alignItems, width, minWidth }) => {
        element.style.display = display;
        element.style.flexDirection = flexDirection;
        element.style.flexWrap = flexWrap;
        element.style.alignItems = alignItems;
        element.style.width = width;
        element.style.minWidth = minWidth;
      }
    );
  };
}

function lockScreenshotButtonWidths(root: HTMLElement) {
  const restored: Array<{
    element: HTMLElement;
    minWidth: string;
    minHeight: string;
    whiteSpace: string;
    display: string;
    alignItems: string;
    justifyContent: string;
  }> = [];

  root.querySelectorAll<HTMLElement>("[data-screenshot-button]").forEach((element) => {
    restored.push({
      element,
      minWidth: element.style.minWidth,
      minHeight: element.style.minHeight,
      whiteSpace: element.style.whiteSpace,
      display: element.style.display,
      alignItems: element.style.alignItems,
      justifyContent: element.style.justifyContent,
    });

    element.style.display = "inline-flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";
    element.style.whiteSpace = "nowrap";
    element.style.minWidth = `${element.scrollWidth}px`;
    element.style.minHeight = `${element.scrollHeight}px`;
  });

  return () => {
    restored.forEach(
      ({ element, minWidth, minHeight, whiteSpace, display, alignItems, justifyContent }) => {
        element.style.minWidth = minWidth;
        element.style.minHeight = minHeight;
        element.style.whiteSpace = whiteSpace;
        element.style.display = display;
        element.style.alignItems = alignItems;
        element.style.justifyContent = justifyContent;
      }
    );
  };
}

function hideScrollbarsOnClone(node: Node) {
  if (!(node instanceof HTMLElement)) return;

  const style = window.getComputedStyle(node);
  if (!hasScrollableOverflow(style)) return;

  node.style.overflow = "visible";
  node.style.overflowX = "visible";
  node.style.overflowY = "visible";
  node.style.scrollbarWidth = "none";

  if (node.scrollWidth > node.clientWidth) {
    node.style.width = `${node.scrollWidth}px`;
    node.style.maxWidth = "none";
  }

  if (node.scrollHeight > node.clientHeight) {
    node.style.height = `${node.scrollHeight}px`;
    node.style.maxHeight = "none";
  }
}

function normalizeScreenshotButtonsOnClone(node: Node) {
  if (!(node instanceof HTMLElement) || !node.hasAttribute("data-screenshot-button")) return;

  node.style.whiteSpace = "nowrap";
  node.style.flexShrink = "0";
  node.style.display = "inline-flex";
  node.style.alignItems = "center";
  node.style.justifyContent = "center";
  node.style.lineHeight = "1";
}

function normalizeScreenshotButtonRowsOnClone(node: Node) {
  if (!(node instanceof HTMLElement) || !node.hasAttribute("data-screenshot-button-row")) return;

  node.style.display = "flex";
  node.style.flexDirection = "row";
  node.style.flexWrap = "nowrap";
  node.style.alignItems = "center";
  node.style.width = "max-content";
}

function downloadPng(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

function shouldIncludeScreenshotNode(node: Node) {
  return !(node instanceof HTMLElement && node.hasAttribute("data-screenshot-hide"));
}

export async function exportDashboardScreenshot(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const { domToPng } = await import("modern-screenshot");

  await waitForDomPaint();

  const restoreOverflow = prepareOverflowContainersForCapture(element);
  const restoreButtonRows = lockScreenshotButtonRows(element);
  const restoreButtonWidths = lockScreenshotButtonWidths(element);

  try {
    await waitForDomPaint();

    const dataUrl = await domToPng(element, {
      scale: CAPTURE_SCALE,
      backgroundColor: BACKGROUND_COLOR,
      width: element.scrollWidth,
      height: element.scrollHeight,
      filter: shouldIncludeScreenshotNode,
      features: {
        copyScrollbar: false,
        restoreScrollPosition: true,
      },
      onCloneEachNode: (node) => {
        hideScrollbarsOnClone(node);
        normalizeScreenshotButtonRowsOnClone(node);
        normalizeScreenshotButtonsOnClone(node);
      },
    });

    downloadPng(dataUrl, filename);
  } finally {
    restoreButtonWidths();
    restoreButtonRows();
    restoreOverflow();
  }
}
