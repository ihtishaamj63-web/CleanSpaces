<template>
  <!-- Section navigation shared by every admin page -->
  <nav class="admin-nav">
    <router-link to="/admin/dashboard">Overview</router-link>
    <router-link to="/admin/zones">Zones</router-link>
    <router-link to="/admin/cleanup-requests">Requests</router-link>
    <router-link to="/admin/reviews">Reviews</router-link>
    <router-link to="/admin/employees">Employees</router-link>
    <router-link to="/admin/payroll">Payroll</router-link>
    <router-link to="/admin/cleanup-reports">Reports</router-link>
  </nav>
</template>

<style scoped>
/* Links wrap on narrow screens instead of overflowing */
.admin-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding: 0.35rem;
  background: #e7eeea;
  border-radius: 9px;
}

.admin-nav a {
  padding: 0.45rem 0.7rem;
  border-radius: 6px;
  white-space: nowrap;
  color: var(--green-dark);
  font-weight: 700;
  text-decoration: none;
  font-size: 0.88rem;
}

.admin-nav a.router-link-active {
  background: var(--green-dark);
  color: #fff;
}
</style>