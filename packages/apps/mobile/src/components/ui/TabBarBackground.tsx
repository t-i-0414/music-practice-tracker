// This is a shim for web and Android where the tab bar is generally opaque.
export default undefined;

const FIRST_TAB_INDEX = 0;
export function useBottomTabOverflow(): number {
  return FIRST_TAB_INDEX;
}
