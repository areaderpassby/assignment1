/**
 * Core shopping cart business logic.
 *
 * Every function in this module is a pure function: it receives the current
 * `products` and `cart` state as arguments and returns a new result (or an
 * error result) without mutating its inputs. This keeps the logic easy to
 * unit test in isolation.
 */

// The initial catalogue. Each product has an id, name, description, price and
// the number of units currently available.
export const products = [
  {
    id: 'p1',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with a USB receiver.',
    price: 25,
    quantityAvailable: 10
  },
  {
    id: 'p2',
    name: 'Mechanical Keyboard',
    description: 'Tenkeyless mechanical keyboard with blue switches.',
    price: 80,
    quantityAvailable: 5
  },
  {
    id: 'p3',
    name: 'USB-C Cable',
    description: '1 metre braided USB-C to USB-C charging cable.',
    price: 12,
    quantityAvailable: 20
  },
  {
    id: 'p4',
    name: 'Laptop Stand',
    description: 'Adjustable aluminium laptop stand.',
    price: 45,
    quantityAvailable: 7
  }
]

/**
 * Add a product to the cart.
 *
 * @param {string} productId - the id of the product to add
 * @param {number|string} quantity - how many units to add
 * @param {Array} products - the current product catalogue
 * @param {Array} cart - the current cart
 * @returns {{success: boolean, message: string, updatedCart: Array}}
 */
export function addToCart (productId, quantity, products, cart) {
  const product = products.find((p) => p.id === productId)

  if (!product) {
    return {
      success: false,
      message: `Product with id "${productId}" was not found.`,
      updatedCart: cart
    }
  }

  const parsedQuantity = Number(quantity)

  if (!Number.isFinite(parsedQuantity)) {
    return {
      success: false,
      message: `"${quantity}" is not a valid quantity.`,
      updatedCart: cart
    }
  }

  if (parsedQuantity <= 0) {
    return {
      success: false,
      message: 'Quantity must be greater than 0.',
      updatedCart: cart
    }
  }

  const existingItem = cart.find((item) => item.id === productId)
  const currentQuantity = existingItem ? existingItem.quantity : 0

  if (currentQuantity + parsedQuantity > product.quantityAvailable) {
    return {
      success: false,
      message: `Not enough stock for "${product.name}". Only ${product.quantityAvailable} available.`,
      updatedCart: cart
    }
  }

  let updatedCart

  if (existingItem) {
    updatedCart = cart.map((item) => {
      if (item.id !== productId) {
        return item
      }

      const newQuantity = item.quantity + parsedQuantity
      return {
        ...item,
        quantity: newQuantity,
        totalPrice: newQuantity * product.price
      }
    })
  } else {
    updatedCart = [
      ...cart,
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: parsedQuantity,
        totalPrice: parsedQuantity * product.price
      }
    ]
  }

  return {
    success: true,
    message: `Added ${parsedQuantity} x ${product.name} to the cart.`,
    updatedCart
  }
}

/**
 * Calculate the total price of the cart.
 *
 * @param {Array} cart - the current cart
 * @returns {number} the total price
 */
export function calculateTotal (cart) {
  return cart.reduce((total, item) => total + item.totalPrice, 0)
}

/**
 * Check out the cart: deduct the ordered quantities from stock and return the
 * total amount to pay.
 *
 * @param {Array} cart - the current cart
 * @param {Array} products - the current product catalogue
 * @returns {{success: boolean, message: string, updatedProducts: Array, totalAmount: number}}
 */
export function checkoutCart (cart, products) {
  if (cart.length === 0) {
    return {
      success: false,
      message: 'Your cart is empty. Nothing to check out.',
      updatedProducts: products,
      totalAmount: 0
    }
  }

  for (const item of cart) {
    const product = products.find((p) => p.id === item.id)

    if (!product) {
      return {
        success: false,
        message: `Product with id "${item.id}" no longer exists.`,
        updatedProducts: products,
        totalAmount: 0
      }
    }

    if (item.quantity > product.quantityAvailable) {
      return {
        success: false,
        message: `Not enough stock for "${product.name}".`,
        updatedProducts: products,
        totalAmount: 0
      }
    }
  }

  const totalAmount = calculateTotal(cart)

  const updatedProducts = products.map((product) => {
    const item = cart.find((cartItem) => cartItem.id === product.id)

    if (!item) {
      return product
    }

    return {
      ...product,
      quantityAvailable: product.quantityAvailable - item.quantity
    }
  })

  return {
    success: true,
    message: 'Checkout completed successfully.',
    updatedProducts,
    totalAmount
  }
}
