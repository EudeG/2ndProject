<script setup>
defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: "",
    },
    emptyMessage: {
        type: String,
        default: "No hay registros disponibles.",
    },
    colspan: {
        type: Number,
        default: 5,
    },
});
</script>

<template>
    <div>
        <div v-if="error" class="alert alert-error shadow-sm mb-4">
            <span>{{ error }}</span>
        </div>

        <div v-if="loading" class="flex justify-center py-16">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>

        <div v-else class="card bg-base-100 shadow-xl border border-base-300">
            <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                    <thead class="bg-base-200/60 text-base-content/80 text-sm">
                        <tr>
                            <slot name="header" />
                        </tr>
                    </thead>
                    <tbody>
                        <slot />
                        <tr v-if="!items || items.length === 0">
                            <td :colspan="colspan" class="text-center py-10 text-base-content/60">
                                {{ emptyMessage }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>