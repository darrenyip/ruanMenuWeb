<!-- src/components/ResponsiveContainer.vue -->
<template>
  <div class="responsive-container">
    <slot />
  </div>
</template>

<style lang="scss">
.responsive-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 $gutter-sm;

  @media (min-width: map-get($breakpoints, tablet)) {
    max-width: 720px;
    padding: 0 $gutter-md;
  }

  @media (min-width: map-get($breakpoints, desktop)) {
    max-width: 1200px;
    padding: 0 $gutter-lg;
  }
}
</style>
