const ELECTRON = false;
const get = (key) => {
  return new Promise((resolve, reject) => {
    if (ELECTRON) {
      reject();
    } else {
      resolve(window.localStorage.getItem(key));
    }
  });
};

const set = (key, value) => {
  return new Promise((resolve, reject) => {
    if (ELECTRON) {
      reject();
    } else {
      resolve(window.localStorage.setItem(key, value));
    }
  });
};

const remove = (key) => {
  return new Promise((resolve, reject) => {
    if (ELECTRON) {
      reject();
    } else {
      resolve(window.localStorage.removeItem(key));
    }
  });
};

export { get, set, remove };
