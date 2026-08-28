import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/Home.vue') },
    { path: '/pricing', name: 'pricing', component: () => import('../views/Pricing.vue') },
    { path: '/about', name: 'about', component: () => import('../views/About.vue') },
    { path: '/reviews', name: 'reviews', component: () => import('../views/Reviews.vue') },
    { path: '/contact', name: 'contact', component: () => import('../views/Contact.vue') },
    { path: '/how-it-works', name: 'howItWorks', component: () => import('../views/HowItWorks.vue') },
    { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
    { path: '/signup', name: 'signup', component: () => import('../views/Signup.vue') },
    { path: '/payment', name: 'payment', component: () => import('../views/Payment.vue') },
    { path: '/payment/success/:id', name: 'paymentSuccess', component: () => import('../views/PaymentSuccess.vue') },
    { path: '/resident/dashboard', name: 'residentDashboard', component: () => import('../views/resident/Dashboard.vue'), meta: { requiresAuth: true } },
    { path: '/admin/dashboard', name: 'adminDashboard', component: () => import('../views/admin/Dashboard.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/zones', name: 'adminZones', component: () => import('../views/admin/Zones.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/employees', name: 'adminEmployees', component: () => import('../views/admin/Employees.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/payroll', name: 'adminPayroll', component: () => import('../views/admin/Payroll.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/cleanup-reports', name: 'adminCleanupReports', component: () => import('../views/admin/CleanupReports.vue'), meta: { requiresAuth: true, requiresAdmin: true } }
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  if (to.meta.requiresAuth && !token) return { name: 'login' }
  if (to.meta.requiresAdmin && role !== 'admin') return { name: 'home' }
})

export default router