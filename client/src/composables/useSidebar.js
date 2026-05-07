import { ref } from 'vue'

const collapsed = ref(false)
let userPreference = false

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('sidebar.collapsed')
  if (stored !== null) {
    collapsed.value = stored === '1'
    userPreference = true
  } else {
    collapsed.value = window.innerWidth < 1024
  }

  // The media query always wins over user preference at narrow viewports:
  // a user who chose "expanded" on desktop still gets collapsed on mobile.
  const mql = window.matchMedia('(max-width: 1023px)')
  const onBreakpoint = (e) => {
    if (e.matches) {
      collapsed.value = true
    } else {
      // Restore from localStorage if the user set a preference, else expand.
      collapsed.value = userPreference
        ? localStorage.getItem('sidebar.collapsed') === '1'
        : false
    }
  }
  mql.addEventListener('change', onBreakpoint)
}

const toggle = () => {
  collapsed.value = !collapsed.value
  userPreference = true
  if (typeof window !== 'undefined') {
    localStorage.setItem('sidebar.collapsed', collapsed.value ? '1' : '0')
  }
}

export function useSidebar() {
  return { collapsed, toggle }
}
