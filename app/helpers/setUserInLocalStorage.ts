export function setUserInLocalStorage(key: string, data: any) {
  window.localStorage.setItem(key, JSON.stringify(data));
}
