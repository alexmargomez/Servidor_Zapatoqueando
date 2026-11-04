<template>
  <div class="min-h-screen bg-stone-100 flex items-center justify-center p-4">
    <div class="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(5,46,22,0.12)] w-full max-w-md border border-slate-200/80">
      <div class="text-center mb-8 flex flex-col items-center">
        <div class="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3 shadow-xs">
          <img src="/logo.png" alt="Zapatoqueando" class="h-14 w-auto object-contain drop-shadow-xs" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">Zapatoqueando</h1>
        <p class="text-emerald-700 font-bold uppercase tracking-widest text-[11px] mt-1">Consola de Gestión Municipal</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">Usuario</label>
          <input 
            v-model="email" 
            type="text" 
            required 
            class="w-full px-4 py-3 rounded-xl bg-stone-50 border border-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-700 outline-none transition-all text-emerald-950 font-medium"
            placeholder="admin"
          >
        </div>

        <div>
          <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            class="w-full px-4 py-3 rounded-xl bg-stone-50 border border-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-700 outline-none transition-all text-emerald-950 font-medium"
            placeholder="••••••••"
          >
        </div>

        <div v-if="errorMsg" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs text-center font-bold">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center cursor-pointer"
        >
          <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-amber-400 border-t-transparent rounded-full mr-2"></span>
          Ingresar al Panel
        </button>
      </form>

      <div class="mt-6 pt-5 border-t border-slate-100 text-center">
        <router-link to="/" class="text-xs font-bold text-slate-500 hover:text-emerald-900 transition-colors inline-flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver al mapa interactivo
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
