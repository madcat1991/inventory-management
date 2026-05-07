<template>
  <aside :class="['sidebar', { 'is-collapsed': collapsed }]">
    <div class="sidebar-header">
      <div class="brand" v-show="!collapsed">
        <h1>{{ t('nav.companyName') }}</h1>
        <p>{{ t('nav.subtitle') }}</p>
      </div>
      <button
        class="toggle-btn"
        @click="toggle"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :title="collapsed ? 'Expand' : 'Collapse'"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5l-5 5 5 5"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <!--
        Active state strategy:
        - For "/" we use exact-active-class so only the exact root path gets the active style,
          preventing it from matching every route (default router-link-active behavior).
        - For all other routes, router-link-active is sufficient because the paths are unique.
      -->
      <router-link
        to="/"
        exact-active-class="active"
        active-class=""
        :title="collapsed ? t('nav.overview') : null"
      >
        <span class="icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="6" height="6" rx="1"/>
            <rect x="11" y="3" width="6" height="6" rx="1"/>
            <rect x="3" y="11" width="6" height="6" rx="1"/>
            <rect x="11" y="11" width="6" height="6" rx="1"/>
          </svg>
        </span>
        <span class="label" v-show="!collapsed">{{ t('nav.overview') }}</span>
      </router-link>

      <router-link
        to="/inventory"
        :title="collapsed ? t('nav.inventory') : null"
      >
        <span class="icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z"/>
            <path d="M3 6l7 4 7-4"/>
            <path d="M10 10v8"/>
          </svg>
        </span>
        <span class="label" v-show="!collapsed">{{ t('nav.inventory') }}</span>
      </router-link>

      <router-link
        to="/orders"
        :title="collapsed ? t('nav.orders') : null"
      >
        <span class="icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="4" width="10" height="14" rx="1.5"/>
            <path d="M7 4V2.5a1 1 0 011-1h4a1 1 0 011 1V4"/>
            <path d="M8 9h4M8 12h4M8 15h2"/>
          </svg>
        </span>
        <span class="label" v-show="!collapsed">{{ t('nav.orders') }}</span>
      </router-link>

      <router-link
        to="/spending"
        :title="collapsed ? t('nav.finance') : null"
      >
        <span class="icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="16" height="10" rx="1.5"/>
            <circle cx="10" cy="10" r="2"/>
            <path d="M5 8v.01M15 12v.01"/>
          </svg>
        </span>
        <span class="label" v-show="!collapsed">{{ t('nav.finance') }}</span>
      </router-link>

      <router-link
        to="/demand"
        :title="collapsed ? t('nav.demandForecast') : null"
      >
        <span class="icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 14l4-4 3 3 7-7"/>
            <path d="M13 6h4v4"/>
          </svg>
        </span>
        <span class="label" v-show="!collapsed">{{ t('nav.demandForecast') }}</span>
      </router-link>

      <router-link
        to="/reports"
        :title="collapsed ? 'Reports' : null"
      >
        <span class="icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 17V8M9 17V4M15 17v-6"/>
          </svg>
        </span>
        <span class="label" v-show="!collapsed">Reports</span>
      </router-link>
    </nav>

    <div class="sidebar-footer" v-show="!collapsed">
      <!--
        Footer content is passed via a named slot so App.vue can attach event
        handlers directly to LanguageSwitcher and ProfileMenu without any
        prop/emit plumbing through Sidebar.
      -->
      <slot name="footer" />
    </div>
  </aside>
</template>

<script>
import { useI18n } from '../composables/useI18n'
import { useSidebar } from '../composables/useSidebar'

export default {
  name: 'Sidebar',
  setup() {
    const { t } = useI18n()
    const { collapsed, toggle } = useSidebar()
    return { t, collapsed, toggle }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  position: sticky;
  top: 0;
  height: 100vh;
  align-self: start;
  background: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 200ms ease;
}

.sidebar.is-collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  min-height: 73px; /* keeps header height stable when brand is hidden */
}

.sidebar.is-collapsed .sidebar-header {
  justify-content: center;
  padding: var(--space-4) 0;
}

.brand h1 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.025em;
  margin-bottom: 0.25rem;
  white-space: nowrap;
}

.brand p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 400;
  white-space: nowrap;
}

.toggle-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease;
}

.toggle-btn:hover {
  background: var(--color-hover-bg);
  color: var(--color-text);
}

.toggle-btn svg {
  transition: transform 200ms ease;
}

.is-collapsed .toggle-btn svg {
  transform: rotate(180deg);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4);
  flex: 1;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease, color 0.15s ease;
}

.sidebar-nav a:hover {
  background: var(--color-hover-bg);
  color: var(--color-text);
}

/* Active state for non-root routes (router-link-active) */
.sidebar-nav a.router-link-active {
  background: var(--color-active-bg);
  color: var(--color-text);
  font-weight: var(--weight-semibold);
}

/* Active state for root route (exact-active-class="active") */
.sidebar-nav a.active {
  background: var(--color-active-bg);
  color: var(--color-text);
  font-weight: var(--weight-semibold);
}

/* Collapsed: center icon, remove horizontal padding */
.is-collapsed .sidebar-nav {
  padding: var(--space-4) 0;
}

.is-collapsed .sidebar-nav a {
  justify-content: center;
  padding: var(--space-3) 0;
}

.icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  white-space: nowrap;
}

.sidebar-footer {
  border-top: 1px solid var(--color-border);
  padding: var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
