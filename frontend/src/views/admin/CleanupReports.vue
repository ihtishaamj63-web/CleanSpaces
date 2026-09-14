<template>
  <div class="admin-reports-page">
    <AdminNav />
    <div class="container">
      <h1>Cleanup Reports Management</h1>
      <p>View and manage before-and-after cleanup evidence submitted by crew leaders.</p>
    </div>
  </div>
</template>

<script>
import AdminNav from './AdminNav.vue'

export default {
  name: 'AdminCleanupReportsPage',
  components: { AdminNav }
}
</script>

<style scoped>
.admin-reports-page {
  padding: 2rem;
  background: #F7F3E8;
  min-height: 100vh;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
