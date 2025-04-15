export function setUserInLocalStorage(data: any) {
  window.localStorage.setItem("data", JSON.stringify(data));
}
