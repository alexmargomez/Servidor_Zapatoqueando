import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: 'eventos',
          name: 'eventos',
          component: () => import('../views/EventosView.vue')
        },
        {
          path: 'rutas',
          name: 'rutas',
          component: () => import('../views/RutasView.vue')
        },
        {
          path: 'descargar',
          name: 'descargar',
          component: () => import('../views/DescargarView.vue')
        }
      ]
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/LoginView.vue')
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/admin/posters'
        },
        {
          path: 'posters',
          name: 'admin-posters',
          component: () => import('../views/admin/AdminPosters.vue')
        },
        {
          path: 'places',
          name: 'admin-places',
          component: () => import('../views/admin/AdminPlaces.vue')
        },
        {
          path: 'routes',
          name: 'admin-routes',
          component: () => import('../views/admin/AdminRoutes.vue')
        }
      ]
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next('/admin/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
