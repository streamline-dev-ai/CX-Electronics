import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X, GripVertical, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useCategories } from '../../hooks/useCategories'
import type { StockStatus } from '../../lib/supabase'

interface FormState {
  name: string
  name_zh: string
  slug: string
  description: string
  description_zh: string
  category_id: string
  retail_price: string
  is_bulk_available: boolean
  bulk_price: string
  bulk_min_qty: string
  active: boolean
  featured: boolean
  stock_status: StockStatus
  images: string[]        // Supabase Storage paths
  imageUrls: string[]     // Resolved public URLs for preview
}

const INITIAL: FormState = {
  name: '', name_zh: '', slug: '', description: '', description_zh: '',
  category_id: '', retail_price: '', is_bulk_available: false,
  bulk_price: '', bulk_min_qty: '', active: true, featured: false,
  stock_status: 'in_stock', images: [], imageUrls: [],
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

  // Load existing product for edit
  useEffect(() => {
    if (!id) return

    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, name_zh, slug, description, description_zh, category_id, retail_price, is_bulk_available, bulk_price, bulk_min_qty, active, featured, stock_status, images, thumbnail_url')
        .eq('id', id)
        .single()

      if (error || !data) {
        navigate('/admin/products')
        return
      }

      const images: string[] = data.images ?? []
      const imageUrls = images.map((path) => {
        const { data: url } = supabase.storage.from('products').getPublicUrl(path, {
          transform: { width: 300, height: 300, resize: 'contain', format: 'webp' as 'origin', quality: 80 },
        })
        return url.publicUrl
      })

      setForm({
        name: data.name ?? '',
        name_zh: data.name_zh ?? '',
        slug: data.slug ?? '',
        description: data.description ?? '',
        description_zh: data.description_zh ?? '',
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
      })
      setLoading(false)
    }

    load()
  }, [id, navigate])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'name' && !isEdit
        ? { slug: slugify(value as string) }
        : {}),
    }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

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
          transform: { width: 300, height: 300, resize: 'contain', format: 'webp' as 'origin', quality: 80 },
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
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }))
  }

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
      name_zh: form.name_zh.trim() || null,
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      description_zh: form.description_zh.trim() || null,
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
      updated_at: new Date().toISOString(),
    }

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', id!)
      : await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() })

    setSaving(false)

    if (error) {
      if (error.message.includes('slug')) {
        setErrors({ slug: 'This slug is already in use' })
      }
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
          {isEdit ? 'Edit Product 编辑产品' : 'Add Product 添加产品'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Info</h2>

          <Field label="Product Name (EN)" error={errors.name} required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={input(errors.name)}
              placeholder="e.g. USB-C 65W Fast Charger"
            />
          </Field>

          <Field label="产品名称 (Chinese)" error={errors.name_zh}>
            <input
              type="text"
              value={form.name_zh}
              onChange={(e) => set('name_zh', e.target.value)}
              className={input()}
              placeholder="例如：65W氮化镓快速充电器"
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

          <Field label="Category 分类">
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

          <Field label="Description (EN)">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className={input()}
              placeholder="Product description in English"
            />
          </Field>

          <Field label="描述 (Chinese)">
            <textarea
              value={form.description_zh}
              onChange={(e) => set('description_zh', e.target.value)}
              rows={3}
              className={input()}
              placeholder="中文产品描述"
            />
          </Field>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing 价格</h2>

          <Field label="Retail Price (R) 零售价" error={errors.retail_price} required>
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

          {/* Bulk pricing toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Bulk / Wholesale Available 可批发</p>
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
            <div className="grid grid-cols-2 gap-4 p-4 bg-cxx-bg rounded-lg border border-cxx-blue/20">
              <Field label="Bulk Price (R) 批发价" error={errors.bulk_price} required>
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
              <Field label="Min. Quantity 最低订量" error={errors.bulk_min_qty} required>
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

        {/* Images */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Images 图片</h2>
          <p className="text-xs text-gray-400">First image is the thumbnail. Drag to reorder.</p>

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
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-cxx-blue bg-cxx-blue-light' : 'border-gray-300 hover:border-cxx-blue'
            }`}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cxx-blue mx-auto mb-2" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              uploadImages([...(e.target.files ?? [])])
            }
          />

          {/* Image previews */}
          {form.imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {form.imageUrls.map((url, i) => (
                <div key={i} className="relative group aspect-square">
                  <img
                    src={url}
                    alt={`Product image ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg bg-gray-100"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-cxx-blue text-white px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 cursor-grab">
                    <GripVertical className="w-4 h-4 text-white drop-shadow" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Status */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Status 状态</h2>

          <Field label="Stock Status 库存状态">
            <select
              value={form.stock_status}
              onChange={(e) => set('stock_status', e.target.value as StockStatus)}
              className={input()}
            >
              <option value="in_stock">In Stock 有货</option>
              <option value="out_of_stock">Out of Stock 缺货</option>
              <option value="on_order">On Order 预订</option>
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
              <span className="text-sm font-medium text-gray-700">Active (visible in store) 上架</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="rounded border-gray-300 text-cxx-blue focus:ring-cxx-blue"
              />
              <span className="text-sm font-medium text-gray-700">Featured (show on homepage) 精选</span>
            </label>
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 bg-cxx-blue hover:bg-cxx-blue-hover text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Product 保存'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel 取消
          </button>
        </div>
      </form>
    </div>
  )
}

// Helpers
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
