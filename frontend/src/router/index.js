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

export default router
