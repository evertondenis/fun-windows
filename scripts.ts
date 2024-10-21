const video = document.querySelector<HTMLVideoElement>('video');

type WindowDetails = {
  screenX: number;
  screenY: number;
  screenWidth: number;
  screenHeight: number;
  width: number;
  height: number;
  updated: number;
};

function getScreens(): [string, WindowDetails][] {
  return Object.entries(window.localStorage)
    .filter(([key]) => key.startsWith('screen-'))
    .map(([key, value]: [string, string]) => [key, JSON.parse(value) as WindowDetails]);
}

const screenId = `screen-${getScreenId()}`;
function setScreenDetails() {
  const windowDetails = {
    screenX: window.screenX,
    screenY: window.screenY,
    screenWidth: window.screen.availWidth,
    screenHeight: window.screen.availHeight,
    width: window.outerWidth,
    height: window.innerHeight,
    updated: Date.now(),
  };
  window.localStorage.setItem(screenId, JSON.stringify(windowDetails));
  // console.log(windowDetails);
}

function getScreenId() {
  const existingScreens = Object.keys(window.localStorage)
    .filter((key) => key.startsWith('screen-'))
    .map((key) => parseInt(key.replace('screen-', '')))
    .sort((a, b) => a - b);
  return existingScreens.at(-1) + 1 || 1;
}


function removeScreen() {
  console.log(`removing screen ${screenId}`);
  localStorage.removeItem(screenId);
}

function removeOld() {
  const screens = getScreens();
  for (const [key, screen] of screens) {
    if (Date.now() - screen.updated > 1000) {
      localStorage.removeItem(key);
    }
  }
}

function makeSVG() {
  video?.setAttribute('style', `transform: translate(-${window.screenX}px, -${window.screenY}px)`);

  /* const screens = getScreens();
  screens
    .map(([key, screen]) => {
      const x = screen.screenX + screen.width / 2;
      const y = screen.screenY + screen.height / 2;
      return [key, { ...screen, x, y }];
    }) */
}

const timers: ReturnType<typeof setInterval>[] = [];
function go() {
  timers.push(setInterval(setScreenDetails, 10));
  // timers.push(setInterval(displayStats, 10));
  timers.push(setInterval(removeOld, 100));
  timers.push(setInterval(makeSVG, 10));
}

window.addEventListener('beforeunload', removeScreen);

function populateWebcam() {
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    if (!video) return;
    video.width = window.screen.availWidth;
    video.height = window.screen.availHeight;
    video.srcObject = stream;
    video.play();
  });
}

go();
populateWebcam();