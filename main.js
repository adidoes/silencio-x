function doWork() {
  const targetDivs = Array.from(
    document.querySelectorAll(
      "article > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div"
    )
  );

  for (const targetDiv of targetDivs) {
    // avoid adding multiple buttons to the same tweet
    if (!targetDiv.querySelector(".silencio-btn")) {
      const silencioButton = createButton(
        "mute-btn",
        "Mute this account",
        `<path d="M18 6.59V1.2L8.71 7H5.5C4.12 7 3 8.12 3 9.5v5C3 15.88 4.12 17 5.5 17h2.09l-2.3 2.29 1.42 1.42 15.5-15.5-1.42-1.42L18 6.59zm-8 8V8.55l6-3.75v3.79l-6 6zM5 9.5c0-.28.22-.5.5-.5H8v6H5.5c-.28 0-.5-.22-.5-.5v-5zm6.5 9.24l1.45-1.45L16 19.2V14l2 .02v8.78l-6.5-4.06z"/>`
      );
      silencioButton.addEventListener("click", () =>
        handleMenuClick(targetDiv, "Mute")
      );
      targetDiv.insertBefore(silencioButton, targetDiv.firstChild);

      const notInterestedButton = createButton(
        "not-interested-btn",
        "Not interested in this post",
        `<path d="M9.5 7c.828 0 1.5 1.119 1.5 2.5S10.328 12 9.5 12 8 10.881 8 9.5 8.672 7 9.5 7zm5 0c.828 0 1.5 1.119 1.5 2.5s-.672 2.5-1.5 2.5S13 10.881 13 9.5 13.672 7 14.5 7zM12 22.25C6.348 22.25 1.75 17.652 1.75 12S6.348 1.75 12 1.75 22.25 6.348 22.25 12 17.652 22.25 12 22.25zm0-18.5c-4.549 0-8.25 3.701-8.25 8.25s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25S16.549 3.75 12 3.75zM8.947 17.322l-1.896-.638C7.101 16.534 8.322 13 12 13s4.898 3.533 4.949 3.684l-1.897.633c-.031-.09-.828-2.316-3.051-2.316s-3.021 2.227-3.053 2.322z"></path>`
      );
      notInterestedButton.addEventListener("click", () =>
        handleMenuClick(targetDiv, "Not interested in this post")
      );
      targetDiv.insertBefore(notInterestedButton, targetDiv.firstChild);
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

function createButton(className, title, svgPath) {
  const button = document.createElement("button");
  button.classList.add("silencio-btn");
  button.classList.add(className);
  button.setAttribute("title", title);

  const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgIcon.setAttribute("viewBox", "0 0 24 24");
  svgIcon.setAttribute("aria-hidden", "true");
  svgIcon.innerHTML = svgPath;

  button.appendChild(svgIcon);
  return button;
}

function handleMenuClick(targetDiv, targetText) {
  const moreButton = targetDiv.querySelector('button[aria-label="More"]');
  if (moreButton) {
    const documentObserver = new MutationObserver((mutations) => {
      const menuItems = document.querySelectorAll('div[role="menuitem"]');
      for (const menuItem of menuItems) {
        const span = menuItem.querySelector("span");
        if (span && span.textContent.trim().startsWith(targetText)) {
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
    console.warn("More button not found for tweet:", targetDiv);
  }
}

// The rest of the code (throttle and observe functions) remains the same

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
