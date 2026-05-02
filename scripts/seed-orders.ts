import { supabase } from '../src/lib/supabase'
import type { Order, OrderItem, Customer, ShippingAddress, Product } from '../src/lib/supabase'

// Helper to generate order numbers sequentially
async function getNextOrderNumber(): Promise<string> {
  const { data } = await supabase
    .from('orders')
    .select('order_number')
    .order('order_number', { ascending: false })
    .limit(1)

  const lastNum = data?.[0]?.order_number
  const nextNum = lastNum
    ? parseInt(lastNum.replace('CXX-2026-', ''), 10) + 1
    : 142 // Starting number

  return `CXX-2026-${String(nextNum).padStart(5, '0')}`
}

// Sample South African customer data
const sampleCustomers = [
  { name: 'Thabo Nkosi', email: 'thabo.nkosi@email.com', phone: '+27 82 123 4567', address: { address_line1: '123 Nelson Mandela Ave', city: 'Johannesburg', province: 'Gauteng', postal_code: '2001' } },
  { name: 'Sipho Moyo', email: 'sipho.moyo@email.com', phone: '+27 71 987 6543', address: { address_line1: '45 Victoria Wharf', city: 'Cape Town', province: 'Western Cape', postal_code: '8001' } },
  { name: 'Ayanda Dlamini', email: 'ayanda.d@email.com', phone: '+27 73 456 7890', address: { address_line1: '78 Florida Road', city: 'Durban', province: 'KwaZulu-Natal', postal_code: '4001' } },
  { name: 'Johan van der Merwe', email: 'johan.vdm@email.com', phone: '+27 84 321 0987', address: { address_line1: '12 Albany Street', city: 'Pretoria', province: 'Gauteng', postal_code: '0002' } },
  { name: 'Michelle Botha', email: 'michelle.b@email.com', phone: '+27 66 234 5678', address: { address_line1: '56 Sea Point Main Rd', city: 'Cape Town', province: 'Western Cape', postal_code: '8005' } },
  { name: 'Sibusiso Khumalo', email: 'sibusiso.k@email.com', phone: '+27 79 876 5432', address: { address_line1: '90 Boksburg North', city: 'Boksburg', province: 'Gauteng', postal_code: '1459' } },
  { name: 'Lerato Molefe', email: 'lerato.m@email.com', phone: '+27 83 159 7534', address: { address_line1: '34 Maunde Street', city: 'Bloemfontein', province: 'Free State', postal_code: '9301' } },
  { name: 'Pieter Steyn', email: 'pieter.steyn@email.com', phone: '+27 82 456 1230', address: { address_line1: ' Century Boulevard', city: 'Midrand', province: 'Gauteng', postal_code: '1685' } },
]

// Helper to generate random past date within last 30 days
function randomPastDate(): Date {
  const daysAgo = Math.floor(Math.random() * 30)
  const hoursAgo = Math.floor(Math.random() * 24)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hoursAgo, Math.floor(Math.random() * 60), 0, 0)
  return date
}

// Helper to generate shipping address object
function buildShippingAddress(customer: typeof sampleCustomers[0]): ShippingAddress {
  return {
    name: customer.name,
    address_line1: customer.address.address_line1,
    city: customer.address.city,
    province: customer.address.province,
    postal_code: customer.address.postal_code,
    phone: customer.phone,
  }
}

// Main seeding function
export async function seedOrders(): Promise<void> {
  console.log('🌱 Starting order seed...')

  // Step 1: Fetch existing products
  console.log('📦 Fetching products from database...')
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, retail_price')
    .eq('active', true)

  if (productsError || !products || products.length === 0) {
    console.error('❌ Failed to fetch products or no products found. Please add products first.')
    console.error('   Run your admin panel to add products, then retry.')
    process.exit(1)
  }

  console.log(`  ✓ Found ${products.length} active products`)

  // Step 2: Ensure customers exist
  console.log('\n📝 Creating customers...')
  const createdCustomers: Customer[] = []

  for (const cust of sampleCustomers) {
    const { data, error } = await supabase
      .from('customers')
      .upsert(
        { name: cust.name, email: cust.email, phone: cust.phone },
        { onConflict: 'email' }
      )
      .select('*')
      .single()

    if (error) {
      console.error(`❌ Failed to create customer ${cust.name}:`, error.message)
      continue
    }
    createdCustomers.push(data)
    console.log(`  ✓ ${cust.name}`)
  }

  // Step 3: Generate orders
  console.log(`\n📦 Generating ${createdCustomers.length * 3} orders...`)

  const orderStatuses: Array<'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'> = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
  const paymentMethods: Array<'payfast' | 'ozow' | 'eft'> = ['payfast', 'ozow', 'eft']
  const orderTypes: Array<'retail' | 'bulk'> = ['retail', 'bulk']

  let ordersCreated = 0

  // Create 3 orders per customer (24 total)
  for (const customer of createdCustomers) {
    for (let i = 0; i < 3; i++) {
      const orderNumber = await getNextOrderNumber()
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)]
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      const paymentStatus = status === 'cancelled' ? 'refunded' : (Math.random() > 0.2 ? 'paid' : 'unpaid')

      const createdAt = randomPastDate().toISOString()

      // Select 1-4 random products for this order
      const numItems = Math.floor(Math.random() * 4) + 1
      const selectedProducts = [...products]
        .sort(() => Math.random() - 0.5)
        .slice(0, numItems)

      // Build order items and calculate subtotal
      const orderItems: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[] = []
      let orderSubtotal = 0

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1
        const unitPrice = product.retail_price
        const lineTotal = quantity * unitPrice

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
        })

        orderSubtotal += lineTotal
      }

      // Apply bulk discount if bulk order (10% off for orders >= R500)
      let finalSubtotal = orderSubtotal
      if (orderType === 'bulk' && orderSubtotal >= 500) {
        finalSubtotal = orderSubtotal * 0.9
      }

      const shippingFee = orderType === 'bulk' && finalSubtotal >= 2000 ? 0 : (Math.random() > 0.5 ? 99.00 : 0)
      const total = finalSubtotal + shippingFee

      // Build order object
      const orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'> = {
        order_number: orderNumber,
        customer_id: customer.id,
        order_type: orderType,
        status,
        subtotal: Math.round(finalSubtotal * 100) / 100,
        shipping_fee: shippingFee,
        total: Math.round(total * 100) / 100,
        shipping_address: buildShippingAddress(customer),
        notes: Math.random() > 0.7 ? 'Please deliver before 5pm' : null,
        payment_method: paymentStatus === 'paid' ? paymentMethod : null,
        payment_status: paymentStatus,
        payment_reference: paymentStatus === 'paid' ? `${paymentMethod.toUpperCase()}-${Math.random().toString(36).substr(2, 10).toUpperCase()}` : null,
      }

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError || !order) {
        console.error(`❌ Failed to create order ${orderNumber}:`, orderError?.message)
        continue
      }

      // Insert order items
      const orderItemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: order.id,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsWithOrderId)

      if (itemsError) {
        console.error(`❌ Failed to insert items for order ${orderNumber}:`, itemsError.message)
      }

      ordersCreated++
      console.log(`  ✓ Order ${orderNumber} - ${customer.name} - R${total.toFixed(2)} (${status})`)
    }
  }

  console.log(`\n✅ Successfully seeded ${ordersCreated} orders!`)
  console.log('📊 Analytics should now reflect this data.')
  console.log('\nYou can view orders at: http://localhost:5173/admin/orders')
}

// Run if called directly
seedOrders().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
