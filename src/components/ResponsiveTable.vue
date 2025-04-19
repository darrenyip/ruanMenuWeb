<!-- src/components/ResponsiveTable.vue -->
<template>
  <el-table :data="data" class="responsive-table" :row-class-name="rowClassName">
    <template v-for="col in columns" :key="col.prop">
      <el-table-column v-bind="col">
        <template #default="{ row }">
          <div class="cell-content">
            <span class="column-label">{{ col.label }}：</span>
            <span class="column-value">{{ row[col.prop] }}</span>
          </div>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script setup>
import { useDisplay } from '@/composables/useDisplay'

const props = defineProps({
  data: Array,
  columns: Array,
})

const { isMobile } = useDisplay()

const rowClassName = ({ rowIndex }) => {
  return isMobile.value ? 'mobile-row' : ''
}
</script>

<style lang="scss">
.responsive-table {
  @media (max-width: map-get($breakpoints, tablet)) {
    .el-table__header {
      display: none;
    }

    .el-table__body {
      .mobile-row {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        border-bottom: 1px solid var(--el-border-color);

        .cell-content {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0.5rem 0;
        }

        .column-label {
          font-weight: 500;
          color: $text-color-dark;
          min-width: 80px;
        }

        .column-value {
          flex: 1;
          text-align: right;
        }
      }
    }
  }
}
</style>
