import { nextTick, type Ref } from 'vue'

/**
 * Utility to control MapWidgetFrame with safety (nextTick)
 * @param widgetRef Reference to the MapWidgetFrame component
 */
export function useWidgetController(widgetRef: Ref<any>) {
  
  /**
   * Snaps the widget to a specific level with Vue update safety
   */
  const snapTo = async (level: 'MIN' | 'MID' | 'MAX') => {
    await nextTick()
    if (widgetRef.value?.snapTo) {
      widgetRef.value.snapTo(level)
    }
  }

  /**
   * Helper to perform an action and then snap
   */
  const actionAndSnap = async (action: () => void, level: 'MIN' | 'MID' | 'MAX' = 'MID') => {
    action()
    await snapTo(level)
  }

  return {
    snapTo,
    actionAndSnap
  }
}
