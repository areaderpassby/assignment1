import { describe, it, expect, beforeEach } from 'vitest'
import {
  products as initialProducts,
  addToCart,
  calculateTotal,
  checkoutCart
} from '../src/cart.js'

describe('cart', () => {
  // Fresh copies of the catalogue and cart for every test, so no test can
  // pollute the state used by another.
  let products
  let cart

  beforeEach(() => {
    products = initialProducts.map((product) => ({ ...product }))
    cart = []
  })

  describe('addToCart', () => {
    it('adds a valid product to the cart', () => {
      const result = addToCart('p1', 2, products, cart)

      expect(result.success).toBe(true)
      expect(result.updatedCart).toHaveLength(1)
      expect(result.updatedCart[0]).toMatchObject({
        id: 'p1',
        name: 'Wireless Mouse',
        price: 25,
        quantity: 2,
        totalPrice: 50
      })
    })

    it('returns an error for a non-existent product id', () => {
      const result = addToCart('missing-id', 1, products, cart)

      expect(result.success).toBe(false)
      expect(result.message).toContain('not found')
      expect(result.updatedCart).toEqual([])
    })

    it('returns an error when the quantity exceeds the available stock', () => {
      const result = addToCart('p1', 11, products, cart) // only 10 in stock

      expect(result.success).toBe(false)
      expect(result.message).toContain('stock')
      expect(result.updatedCart).toEqual([])
    })

    it('returns an error when the quantity is <= 0', () => {
      expect(addToCart('p1', 0, products, cart).success).toBe(false)
      expect(addToCart('p1', -5, products, cart).success).toBe(false)
    })

    it('merges quantities when the same product is added more than once', () => {
      cart = addToCart('p1', 2, products, cart).updatedCart
      const result = addToCart('p1', 3, products, cart)

      expect(result.success).toBe(true)
      expect(result.updatedCart).toHaveLength(1)
      expect(result.updatedCart[0]).toMatchObject({
        id: 'p1',
        quantity: 5,
        totalPrice: 125
      })
    })

    it('rejects a merge that would exceed the available stock', () => {
      cart = addToCart('p2', 3, products, cart).updatedCart // 5 available
      const result = addToCart('p2', 3, products, cart) // 3 + 3 = 6 > 5

      expect(result.success).toBe(false)
      expect(result.updatedCart[0].quantity).toBe(3)
    })
  })

  describe('calculateTotal', () => {
    it('returns 0 for an empty cart', () => {
      expect(calculateTotal(cart)).toBe(0)
    })

    it('calculates the total for a single item', () => {
      cart = addToCart('p1', 2, products, cart).updatedCart // 2 x 25 = 50
      expect(calculateTotal(cart)).toBe(50)
    })

    it('calculates the total for multiple items', () => {
      cart = addToCart('p1', 1, products, cart).updatedCart // 25
      cart = addToCart('p2', 1, products, cart).updatedCart // 80
      expect(calculateTotal(cart)).toBe(105)
    })
  })

  describe('checkoutCart', () => {
    it('returns an error when the cart is empty', () => {
      const result = checkoutCart(cart, products)

      expect(result.success).toBe(false)
      expect(result.message).toContain('empty')
      expect(result.totalAmount).toBe(0)
    })

    it('reduces stock and returns the correct total after a successful checkout', () => {
      cart = addToCart('p1', 2, products, cart).updatedCart // 2 x 25 = 50
      cart = addToCart('p2', 1, products, cart).updatedCart // 1 x 80 = 80

      const result = checkoutCart(cart, products)

      expect(result.success).toBe(true)
      expect(result.totalAmount).toBe(130)

      const p1 = result.updatedProducts.find((product) => product.id === 'p1')
      const p2 = result.updatedProducts.find((product) => product.id === 'p2')
      const p3 = result.updatedProducts.find((product) => product.id === 'p3')

      expect(p1.quantityAvailable).toBe(8) // 10 - 2
      expect(p2.quantityAvailable).toBe(4) // 5 - 1
      expect(p3.quantityAvailable).toBe(20) // untouched

      // The original catalogue must not have been mutated (pure function).
      expect(products.find((product) => product.id === 'p1').quantityAvailable).toBe(10)
    })
  })
})
