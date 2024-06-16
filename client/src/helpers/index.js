export const setStorage = (key, value) => {
  if (value) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
}

export const getStorage = (key) => {
  return localStorage.getItem(key);
}

export const getItem = (label, key, icon, children, type, disabled) => ({
  key,
  icon,
  children,
  label,
  type,
  disabled,
  title: label,
});
