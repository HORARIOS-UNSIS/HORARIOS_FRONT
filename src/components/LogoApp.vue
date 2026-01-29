<template>
  <div :style="{ width: size + 'px' }" class="logo-container">
    <svg 
      viewBox="0 0 500 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="unsis-svg"
    >
      <rect v-if="showBackground" width="800" height="600"  rx="15"/>

      <g id="Book_Icon">
        <path d="M250 170L190 140V70L250 100L310 70V140L250 170Z" fill="#2D1B43"/>
        
        <path d="M250 160L200 135V75L250 100L300 75V135L250 160Z" fill="#48C9B0"/>
        
        <path d="M250 145L215 125V85L250 100L285 85V125L250 145Z" fill="#EAE6FF"/>
        
        <path 
          d="M235 118L248 132L290 90" 
          stroke="#2D1B43" 
          stroke-width="10" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        
        <g class="circuits">
          <circle cx="242" cy="62" r="2.5" fill="#2D1B43"/>
          <circle cx="250" cy="56" r="2.5" fill="#2D1B43"/>
          <circle cx="258" cy="62" r="2.5" fill="#2D1B43"/>
          <path d="M242 65V75 M250 60V75 M258 65V75" stroke="#2D1B43" stroke-width="2"/>
        </g>
        
        <circle cx="290" cy="90" r="4" fill="white">
          <animate 
            attributeName="opacity" 
            values="0.3;1;0.3" 
            dur="2s" 
            repeatCount="indefinite" 
          />
        </circle>
      </g>

      <text 
        x="250" 
        y="225" 
        text-anchor="middle" 
        font-family="sans-serif" 
        font-weight="900" 
        font-size="48" 
        fill="#2D1B43"
      >UNSIS</text>
      
      <text 
        x="250" 
        y="255" 
        text-anchor="middle" 
        font-family="sans-serif" 
        font-size="15" 
        :fill="showBackground ? 'white' : '#555'" 
        letter-spacing="0.5"
      >Sistema Generador de Horarios de Exámenes</text>

      <defs>
        <linearGradient id="bg_gradient" x1="0" y1="0" x2="500" y2="300" gradientUnits="userSpaceOnUse">
          <stop stop-color="#B19FF9"/>
          <stop offset="1" stop-color="#80CED7"/>
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 400
  },
  showBackground: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.logo-container {
  display: inline-block;
  line-height: 0;
}
.unsis-svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.1));
}
</style>