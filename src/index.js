/** Main CLI interaction loop for the shopping cart.
 *
 * This file drives the user through the terminal using `askQuestion` from
 * `askQuestion.js`. All business rules live in `cart.js` so that they can be
 * unit tested in isolation.
 */

import { askQuestion, noMoreQuestions } from './askQuestion.js'
import {
  products as initialProducts,
  addToCart,
  calculateTotal,
  checkoutCart
} from './cart.js'

// Local state for the CLI. We keep our own copies so the module-level
// catalogue in cart.js is never mutated.
let products = initialProducts.map((product) => ({ ...product }))
let cart = []

function printProducts () {
  console.log('\n--- Available products ---')
  for (const product of products) {
    console.log(
      `${product.id} | ${product.name} | $${product.price} | ${product.quantityAvailable} in stock`
    )
  }
  console.log('---------------------------\n')
}

function printCart () {
  if (cart.length === 0) {
    console.log('Your cart is empty.\n')
    return
  }

  console.log('\n--- Your cart ---')
  for (const item of cart) {
    console.log(
      `${item.quantity} x ${item.name} ($${item.price} each) = $${item.totalPrice}`
    )
  }
  console.log(`Total: $${calculateTotal(cart)}\n`)
}

async function run () {
  console.log('Welcome to the CLI shopping cart!\n')

  let running = true

  while (running) {
    printProducts()

    const answer = await askQuestion(
      "Enter product ID (or type 'checkout' to pay, 'quit' to exit): "
    )
    const input = answer.trim()

    if (input === 'quit') {
      console.log('Goodbye!')
      noMoreQuestions()
      running = false
      break
    }

    if (input === 'checkout') {
      const result = checkoutCart(cart, products)

      if (!result.success) {
        console.log(result.message)
        continue
      }

      products = result.updatedProducts
      console.log(`Checkout successful! Total amount to pay: $${result.totalAmount}`)

      cart = []
      printCart()

      const again = await askQuestion('Continue shopping? (yes/no): ')
      if (again.trim().toLowerCase() !== 'yes') {
        console.log('Thank you for shopping. Goodbye!')
        noMoreQuestions()
        running = false
        break
      }
      continue
    }

    const quantityAnswer = await askQuestion('Enter quantity: ')
    const quantity = quantityAnswer.trim()

    const result = addToCart(input, quantity, products, cart)

    if (!result.success) {
      console.log(`Error: ${result.message}`)
    } else {
      console.log(`Success: ${result.message}`)
      cart = result.updatedCart
    }

    printCart()
  }
}

run()
