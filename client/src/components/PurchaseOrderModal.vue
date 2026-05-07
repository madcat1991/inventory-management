<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && backlogItem" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">
              {{ mode === 'create' ? 'Create Purchase Order' : 'Purchase Order Details' }}
            </h3>
            <button class="close-button" @click="close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Backlog item context summary -->
            <div class="context-banner">
              <div class="context-row">
                <span class="context-label">Item</span>
                <span class="context-value">{{ backlogItem.item_name }}</span>
              </div>
              <div class="context-row">
                <span class="context-label">SKU</span>
                <span class="context-value mono">{{ backlogItem.item_sku }}</span>
              </div>
              <div class="context-row">
                <span class="context-label">Order</span>
                <span class="context-value mono">{{ backlogItem.order_id }}</span>
              </div>
              <div class="context-row">
                <span class="context-label">Shortage</span>
                <span class="context-value shortage">
                  {{ shortageQty }} units
                </span>
              </div>
            </div>

            <!-- CREATE MODE: form -->
            <form v-if="mode === 'create'" class="po-form" @submit.prevent="submitForm">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label" for="po-number">PO Number</label>
                  <input
                    id="po-number"
                    v-model="form.po_number"
                    type="text"
                    class="form-input"
                    placeholder="e.g. PO-2025-0001"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="supplier">Supplier</label>
                  <input
                    id="supplier"
                    v-model="form.supplier_name"
                    type="text"
                    class="form-input"
                    placeholder="Supplier name"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="quantity">Quantity</label>
                  <input
                    id="quantity"
                    v-model.number="form.quantity"
                    type="number"
                    min="1"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="unit-cost">Unit Cost ($)</label>
                  <input
                    id="unit-cost"
                    v-model.number="form.unit_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-input"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div class="form-group full-span">
                  <label class="form-label" for="delivery-date">Expected Delivery Date</label>
                  <input
                    id="delivery-date"
                    v-model="form.expected_delivery_date"
                    type="date"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group full-span">
                  <label class="form-label" for="notes">Notes</label>
                  <textarea
                    id="notes"
                    v-model="form.notes"
                    class="form-textarea"
                    rows="3"
                    placeholder="Optional notes for this purchase order"
                  ></textarea>
                </div>
              </div>

              <div v-if="formError" class="form-error">{{ formError }}</div>
            </form>

            <!-- VIEW MODE: read-only PO details -->
            <div v-else class="po-view">
              <div v-if="backlogItem.purchase_order" class="info-grid">
                <div class="info-item">
                  <div class="info-label">PO Number</div>
                  <div class="info-value mono">{{ backlogItem.purchase_order.po_number }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Supplier</div>
                  <div class="info-value">{{ backlogItem.purchase_order.supplier_name }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Quantity</div>
                  <div class="info-value">{{ backlogItem.purchase_order.quantity }} units</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Unit Cost</div>
                  <div class="info-value">${{ backlogItem.purchase_order.unit_cost?.toFixed(2) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Total Cost</div>
                  <div class="info-value">
                    ${{ ((backlogItem.purchase_order.quantity || 0) * (backlogItem.purchase_order.unit_cost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">Expected Delivery</div>
                  <div class="info-value">{{ formatDate(backlogItem.purchase_order.expected_delivery_date) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Created</div>
                  <div class="info-value">{{ formatDate(backlogItem.purchase_order.created_date) }}</div>
                </div>
                <div v-if="backlogItem.purchase_order.notes" class="info-item full-span">
                  <div class="info-label">Notes</div>
                  <div class="info-value notes-value">{{ backlogItem.purchase_order.notes }}</div>
                </div>
              </div>
              <!-- Fallback when purchase_order object not present but purchase_order_id is set -->
              <div v-else class="po-placeholder">
                <p class="placeholder-text">
                  Purchase Order ID: <span class="mono">{{ backlogItem.purchase_order_id }}</span>
                </p>
                <p class="placeholder-sub">Full PO details are not available in this view.</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="close">
              {{ mode === 'create' ? 'Cancel' : 'Close' }}
            </button>
            <button
              v-if="mode === 'create'"
              class="btn-primary"
              @click="submitForm"
              :disabled="submitting"
            >
              {{ submitting ? 'Creating...' : 'Create Purchase Order' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  backlogItem: {
    type: Object,
    default: null
  },
  // 'create' opens the form; 'view' shows read-only PO details
  mode: {
    type: String,
    default: 'create',
    validator: (v) => ['create', 'view'].includes(v)
  }
})

const emit = defineEmits(['close', 'po-created'])

const submitting = ref(false)
const formError = ref(null)

const form = ref({
  po_number: '',
  supplier_name: '',
  quantity: props.backlogItem?.quantity_needed ?? 1,
  unit_cost: 0,
  expected_delivery_date: '',
  notes: ''
})

// Shortage units shown in the context banner
const shortageQty = computed(() => {
  if (!props.backlogItem) return 0
  return props.backlogItem.quantity_needed - props.backlogItem.quantity_available
})

const close = () => {
  formError.value = null
  emit('close')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const submitForm = () => {
  formError.value = null

  // Basic client-side validation before emitting
  if (!form.value.po_number.trim()) {
    formError.value = 'PO Number is required.'
    return
  }
  if (!form.value.supplier_name.trim()) {
    formError.value = 'Supplier name is required.'
    return
  }
  if (!form.value.expected_delivery_date) {
    formError.value = 'Expected delivery date is required.'
    return
  }

  submitting.value = true

  // No backend POST endpoint exists yet — PO is created client-side only.
  // Dashboard.vue's handlePOCreated patches the backlog item in-memory so
  // the row button state flips immediately without a page reload.
  const newPO = {
    id: `PO-${Date.now()}`,
    po_number: form.value.po_number.trim(),
    backlog_item_id: props.backlogItem.id,
    supplier_name: form.value.supplier_name.trim(),
    quantity: form.value.quantity,
    unit_cost: form.value.unit_cost,
    expected_delivery_date: form.value.expected_delivery_date,
    notes: form.value.notes.trim() || null,
    status: 'pending',
    created_date: new Date().toISOString().slice(0, 10)
  }

  emit('po-created', newPO)

  // Reset form for next use
  form.value = {
    po_number: '',
    supplier_name: '',
    quantity: props.backlogItem?.quantity_needed ?? 1,
    unit_cost: 0,
    expected_delivery_date: '',
    notes: ''
  }
  submitting.value = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.close-button {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.close-button:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem 2rem;
}

/* Context banner — always shown to ground the user */
.context-banner {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem 1.5rem;
}

.context-row {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.context-label {
  font-size: 0.688rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.context-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
}

.context-value.mono {
  font-family: 'Monaco', 'Courier New', monospace;
  color: #2563eb;
}

.context-value.shortage {
  color: #dc2626;
  font-weight: 700;
}

/* Form styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-span {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.813rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.form-input,
.form-textarea {
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #0f172a;
  background: white;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 72px;
}

.form-error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

/* View mode */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-span {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.813rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.info-value {
  font-size: 0.938rem;
  color: #0f172a;
  font-weight: 500;
}

.info-value.mono {
  font-family: 'Monaco', 'Courier New', monospace;
  color: #2563eb;
}

.notes-value {
  white-space: pre-wrap;
  line-height: 1.5;
}

.po-placeholder {
  padding: 2rem;
  text-align: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.placeholder-text {
  font-size: 0.938rem;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.placeholder-sub {
  font-size: 0.813rem;
  color: #64748b;
  margin: 0;
}

.mono {
  font-family: 'Monaco', 'Courier New', monospace;
  color: #2563eb;
}

/* Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-secondary:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: #3b82f6;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
