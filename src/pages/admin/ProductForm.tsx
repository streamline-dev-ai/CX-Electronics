import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useCategories } from '../../hooks/useCategories'
import type { StockStatus, Variant } from '../../lib/supabase'

interface FormState {
  name: string
  slug: string
  description: string
  category_id: string
  retail_price: string
  is_bulk_available: boolean
  bulk_price: string
  bulk_min_qty: string
  active: boolean
  featured: boolean
  stock_status: StockStatus
  images: string[]
  imageUrls: string[]
  variants: Variant[]
}

const INITIAL: FormState = {
  name: '', slug: '', description: '',
  category_id: '', retail_price: '', is_bulk_available: false,
  bulk_price: '', bulk_min_qty: '', active: true, featured: false,
  stock_status: 'in_stock', images: [], imageUrls: [], variants: [],
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { categories } = useCategories()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (!id) return

    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, description, category_id, retail_price, is_bulk_available, bulk_price, bulk_min_qty, active, featured, stock_status, images, thumbnail_url, variants')
        .eq('id', id)
        .single()

      if (error || !data) {
        navigate('/admin/products')
        return
      }

      const images: string[] = data.images ?? []
      const imageUrls = images.map((path) => {
        const { data: url } = supabase.storage.from('products').getPublicUrl(path, {
          transform: { width: 400, height: 400, resize: 'contain', format: 'webp' as 'origin', quality: 80 },
        })
        return url.publicUrl
      })

      setForm({
        name: data.name ?? '',
        slug: data.slug ?? '',
        description: data.description ?? '',
        category_id: data.category_id ?? '',
        retail_price: String(data.retail_price ?? ''),
        is_bulk_available: data.is_bulk_available ?? false,
        bulk_price: data.bulk_price ? String(data.bulk_price) : '',
        bulk_min_qty: data.bulk_min_qty ? String(data.bulk_min_qty) : '',
        active: data.active ?? true,
        featured: data.featured ?? false,
        stock_status: (data.stock_status as StockStatus) ?? 'in_stock',
        images,
        imageUrls,
        variants: (data.variants as Variant[]) ?? [],
      })
      setLoading(false)
    }

    load()
  }, [id, navigate])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'name' && !isEdit ? { slug: slugify(value as string) } : {}),
    }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // ── Image upload ──────────────────────────────────────────────────────────

  async function uploadImages(files: File[]) {
    if (!files.length) return
    setUploading(true)

    const newPaths: string[] = []
    const newUrls: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (!error) {
        newPaths.push(path)
        const { data: url } = supabase.storage.from('products').getPublicUrl(path, {
          transform: { width: 400, height: 400, resize: 'contain', format: 'webp' as 'origin', quality: 80 },
        })
        newUrls.push(url.publicUrl)
      }
    }

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...newPaths],
      imageUrls: [...prev.imageUrls, ...newUrls],
    }))
    setUploading(false)
  }

  function removeImage(index: number) {
    const next = form.imageUrls.length - 1
    setActiveImage((prev) => (prev >= next ? Math.max(0, next - 1) : prev))
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }))
  }

  function setCover(index: number) {
    setForm((prev) => {
      const images = [...prev.images]
      const imageUrls = [...prev.imageUrls]
      const [imgPath] = images.splice(index, 1)
      const [imgUrl] = imageUrls.splice(index, 1)
      images.unshift(imgPath)
      imageUrls.unshift(imgUrl)
      return { ...prev, images, imageUrls }
    })
    setActiveImage(0)
  }

  // ── Variants ──────────────────────────────────────────────────────────────

  function addVariant() {
    set('variants', [...form.variants, { name: '', options: [] }])
  }

  function updateVariantName(index: number, name: string) {
    const next = form.variants.map((v, i) => (i === index ? { ...v, name } : v))
    set('variants', next)
  }

  function updateVariantOptions(index: number, raw: string) {
    const options = raw.split(',').map((s) => s.trim()).filter(Boolean)
    const next = form.variants.map((v, i) => (i === index ? { ...v, options } : v))
    set('variants', next)
  }

  function removeVariant(index: number) {
    set('variants', form.variants.filter((_, i) => i !== index))
  }

  // ── Validation + submit ───────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.slug.trim()) errs.slug = 'Slug is required'
    if (!form.retail_price || isNaN(Number(form.retail_price))) errs.retail_price = 'Valid retail price required'
    if (form.is_bulk_available) {
      if (!form.bulk_price || isNaN(Number(form.bulk_price))) errs.bulk_price = 'Bulk price required'
      if (!form.bulk_min_qty || isNaN(Number(form.bulk_min_qty))) errs.bulk_min_qty = 'Min quantity required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id || null,
      retail_price: Number(form.retail_price),
      is_bulk_available: form.is_bulk_available,
      bulk_price: form.is_bulk_available && form.bulk_price ? Number(form.bulk_price) : null,
      bulk_min_qty: form.is_bulk_available && form.bulk_min_qty ? Number(form.bulk_min_qty) : null,
      active: form.active,
      featured: form.featured,
      stock_status: form.stock_status,
      images: form.images,
      thumbnail_url: form.images[0] ?? null,
      variants: form.variants.filter((v) => v.name.trim() && v.options.length > 0),
      updated_at: new Date().toISOString(),
    }

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', id!)
      : await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() })

    setSaving(false)

    if (error) {
      if (error.message.includes('slug')) setErrors({ slug: 'This slug is already in use' })
      return
    }

    navigate('/admin/products')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-cxx-blue" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic info ─────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Info</h2>

          <Field label="Product Name" error={errors.name} required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={input(errors.name)}
              placeholder="e.g. USB-C 65W Fast Charger"
            />
          </Field>

          <Field label="URL Slug" error={errors.slug} required>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              className={input(errors.slug)}
              placeholder="usb-c-65w-fast-charger"
            />
            <p className="text-xs text-gray-400 mt-1">shop/{form.slug}</p>
          </Field>

          <Field label="Category">
            <select
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              className={input()}
            >
              <option value="">— Select category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              className={input()}
              placeholder="Describe the product — features, specs, compatibility..."
            />
          </Field>
        </section>

        {/* ── Images ─────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Images</h2>

          {/* Active image preview */}
          {form.imageUrls.length > 0 && (
            <div className="relative aspect-square w-full max-w-xs mx-auto bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={form.imageUrls[activeImage]}
                  alt="Preview"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-contain p-4"
                />
              </AnimatePresence>
              {activeImage === 0 && (
                <span className="absolute top-2 left-2 bg-cxx-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Cover
                </span>
              )}
            </div>
          )}

          {/* Thumbnail strip */}
          {form.imageUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {form.imageUrls.map((url, i) => (
                <div key={i} className="relative group w-16 h-16 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`w-full h-full rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? 'border-cxx-blue ring-2 ring-cxx-blue/20'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  </button>

                  {/* Set as cover */}
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => setCover(i)}
                      title="Set as cover"
                      className="absolute -bottom-1 -left-1 w-5 h-5 bg-cxx-blue text-white rounded-full text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ★
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              uploadImages([...e.dataTransfer.files].filter((f) => f.type.startsWith('image/')))
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-cxx-blue bg-blue-50' : 'border-gray-300 hover:border-cxx-blue'
            }`}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-cxx-blue mx-auto mb-1.5" />
            ) : (
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
            )}
            <p className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · max 5MB each</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => uploadImages([...(e.target.files ?? [])])}
          />

          <p className="text-xs text-gray-400">First image is the cover. Hover a thumbnail and click ★ to change it.</p>
        </section>

        {/* ── Pricing ────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>

          <Field label="Retail Price (R)" error={errors.retail_price} required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.retail_price}
                onChange={(e) => set('retail_price', e.target.value)}
                className={`${input(errors.retail_price)} pl-7`}
                placeholder="0.00"
              />
            </div>
          </Field>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Bulk / Wholesale Available</p>
              <p className="text-xs text-gray-400">Show bulk pricing to wholesale customers</p>
            </div>
            <button
              type="button"
              onClick={() => set('is_bulk_available', !form.is_bulk_available)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.is_bulk_available ? 'bg-cxx-blue' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.is_bulk_available ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {form.is_bulk_available && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Field label="Bulk Price (R)" error={errors.bulk_price} required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.bulk_price}
                    onChange={(e) => set('bulk_price', e.target.value)}
                    className={`${input(errors.bulk_price)} pl-7`}
                    placeholder="0.00"
                  />
                </div>
              </Field>
              <Field label="Min. Quantity" error={errors.bulk_min_qty} required>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.bulk_min_qty}
                  onChange={(e) => set('bulk_min_qty', e.target.value)}
                  className={input(errors.bulk_min_qty)}
                  placeholder="e.g. 10"
                />
              </Field>
            </div>
          )}
        </section>

        {/* ── Variants ───────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Variants</h2>
              <p className="text-xs text-gray-400 mt-0.5">e.g. Color, Size, Weight — shown as selectors on the product page</p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 text-sm font-medium text-cxx-blue hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Variant
            </button>
          </div>

          {form.variants.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
              No variants yet — click "Add Variant" to add options like Color or Size
            </p>
          )}

          <div className="space-y-3">
            {form.variants.map((variant, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Variant Type</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariantName(i, e.target.value)}
                      className={input()}
                      placeholder="e.g. Color, Size, Weight"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Options (comma-separated)</label>
                    <input
                      type="text"
                      value={variant.options.join(', ')}
                      onChange={(e) => updateVariantOptions(i, e.target.value)}
                      className={input()}
                      placeholder="e.g. Black, White, Red"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="mt-5 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {form.variants.some((v) => v.options.length > 0) && (
            <div className="text-xs text-gray-400 space-y-1">
              {form.variants.filter((v) => v.name && v.options.length > 0).map((v, i) => (
                <p key={i}>
                  <span className="font-medium text-gray-600">{v.name}:</span>{' '}
                  {v.options.map((opt) => (
                    <span key={opt} className="inline-block bg-gray-200 text-gray-700 text-[11px] px-1.5 py-0.5 rounded mr-1">{opt}</span>
                  ))}
                </p>
              ))}
            </div>
          )}
        </section>

        {/* ── Status ─────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Status</h2>

          <Field label="Stock Status">
            <select
              value={form.stock_status}
              onChange={(e) => set('stock_status', e.target.value as StockStatus)}
              className={input()}
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="on_order">On Order</option>
            </select>
          </Field>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set('active', e.target.checked)}
                className="rounded border-gray-300 text-cxx-blue focus:ring-cxx-blue"
              />
              <span className="text-sm font-medium text-gray-700">Active (visible in store)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="rounded border-gray-300 text-cxx-blue focus:ring-cxx-blue"
              />
              <span className="text-sm font-medium text-gray-700">Featured (show on homepage)</span>
            </label>
          </div>
        </section>

        {/* ── Submit ─────────────────────────────────────── */}
        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 bg-cxx-blue hover:bg-cxx-blue-hover text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function input(error?: string): string {
  return `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cxx-blue focus:border-transparent transition-colors ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`
}
