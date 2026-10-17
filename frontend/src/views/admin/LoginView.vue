<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
      <div class="text-center mb-8 flex flex-col items-center">
        <img src="/logo.png" alt="Zapatoqueando" class="h-16 w-auto mb-3 drop-shadow-sm" />
        <h1 class="text-3xl font-black text-green-950 tracking-tight">Zapatoqueando</h1>
        <p class="text-gray-500 mt-1 text-sm">Panel de Administración</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">Usuario</label>
          <input 
            v-model="email" 
            type="text" 
            required 
            class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            placeholder="admin"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            placeholder="••••••••"
          >
        </div>

        <div v-if="errorMsg" class="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-green-950 hover:bg-green-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center cursor-pointer"
        >
          <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          Ingresar
        </button>
      </form>

      <div class="mt-6 pt-5 border-t border-gray-100 text-center">
        <router-link to="/" class="text-xs font-semibold text-gray-400 hover:text-green-900 transition-colors inline-flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver al mapa principal
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const data = await res.json()
    
    if (res.ok && data.token) {
      localStorage.setItem('admin_token', data.token)
      router.push('/admin')
    } else {
      errorMsg.value = data.error || 'Credenciales inválidas'
    }
  } catch (err) {
    errorMsg.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
