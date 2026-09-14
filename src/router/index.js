import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/about', name: 'about', component: () => import('../views/About.vue') },
  { path: '/how-it-works', name: 'how-it-works', component: () => import('../views/HowItWorks.vue') },
  { path: '/pricing', name: 'pricing', component: () => import('../views/Pricing.vue') },
  { path: '/reviews', name: 'reviews', component: () => import('../views/Reviews.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/Contact.vue') },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/signup', name: 'signup', component: () => import('../views/Signup.vue') },
  {
    path: '/resident',
    name: 'resident-dashboard',
    component: () => import('../views/resident/Dashboard.vue'),
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/admin/Dashboard.vue'),
      },
      {
        path: 'zones',
        name: 'admin-zones',
        component: () => import('../views/admin/Zones.vue'),
      },
      {
        path: 'employees',
        name: 'admin-employees',
        component: () => import('../views/admin/Employees.vue'),
      },
      {
        path: 'payroll',
        name: 'admin-payroll',
        component: () => import('../views/admin/Payroll.vue'),
      },
      {
        path: 'cleanup-reports',
        name: 'admin-cleanup-reports',
        component: () => import('../views/admin/CleanupReports.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
