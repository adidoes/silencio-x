function doWork() {
  const targetDivs = Array.from(
    document.querySelectorAll(
      "article > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div"
    )
  );

  for (const targetDiv of targetDivs) {
    // avoid adding multiple buttons to the same tweet
    if (!targetDiv.querySelector(".silencio-btn")) {
      const newButton = document.createElement("button");
      newButton.classList.add("silencio-btn");

      // button icon
      const svgIcon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svgIcon.setAttribute("viewBox", "0 0 24 24");
      svgIcon.setAttribute("aria-hidden", "true");
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute(
        "d",
        "M18 6.59V1.2L8.71 7H5.5C4.12 7 3 8.12 3 9.5v5C3 15.88 4.12 17 5.5 17h2.09l-2.3 2.29 1.42 1.42 15.5-15.5-1.42-1.42L18 6.59zm-8 8V8.55l6-3.75v3.79l-6 6zM5 9.5c0-.28.22-.5.5-.5H8v6H5.5c-.28 0-.5-.22-.5-.5v-5zm6.5 9.24l1.45-1.45L16 19.2V14l2 .02v8.78l-6.5-4.06z"
      );
      svgIcon.appendChild(path);
      newButton.prepend(svgIcon);

      newButton.addEventListener("click", () => {
        // simulate click on the "more" button using aria-label
        const moreButton = targetDiv.querySelector('button[aria-label="More"]');
        if (moreButton) {
          // watch for the menu
          const documentObserver = new MutationObserver((mutations) => {
            // find the mute menu item and click it
            const menuItems = document.querySelectorAll('div[role="menuitem"]');
            for (const menuItem of menuItems) {
              const muteSpan = menuItem.querySelector("span");
              if (muteSpan && muteSpan.textContent.trim().startsWith("Mute")) {
                menuItem.click();
                documentObserver.disconnect();
                break;
              }
            }
          });

          documentObserver.observe(document, {
            childList: true,
            subtree: true,
          });

          moreButton.click();
        } else {
          console.warn("more button not found for tweet:", tweet);
        }
      });

      targetDiv.insertBefore(newButton, targetDiv.firstChild);
    }
  }

  // hide muted posts
  const mutedPostArticles = Array.from(
    document.querySelectorAll("article")
  ).filter((article) =>
    article.textContent.includes("This Post is from an account you muted.View")
  );
  mutedPostArticles.forEach((article) => (article.style.display = "none"));

  // hide "show probable spam" posts
  const showSpamPostArticles = Array.from(
    document.querySelectorAll('[role="button"]')
  ).filter((article) => article.textContent.includes("Show probable spam"));
  showSpamPostArticles.forEach((article) => (article.style.display = "none"));
}

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Function to start MutationObserver
const observe = () => {
  const runDocumentMutations = throttle(() => {
    requestAnimationFrame(doWork);
  }, 1000);

  const observer = new MutationObserver((mutationsList) => {
    if (!mutationsList.length) return;
    runDocumentMutations();
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
};

observe();
