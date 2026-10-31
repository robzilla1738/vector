---
name: amazon
siteSpecific: true
description: Amazon shopping, orders, and account-state guidance.
icon: "/builtin-skills/v1/amazon.svg"
autoInject:
  keywords: ["Amazon"]
  url:
    - amazon.com
    - www.amazon.com
---

# Amazon

## Addresses

- Home: `https://www.amazon.com/`
- Search: `https://www.amazon.com/s?k=${query}`
- Orders: `https://www.amazon.com/gp/css/order-history?ref_=nav_orders_first`
- Cart: `https://www.amazon.com/gp/cart/view.html?ref_=nav_cart`
- Account: `https://www.amazon.com/gp/css/homepage.html`

## Keep snapshots small

Amazon pages produce huge snapshots, so scope them to the part you need. If one of these selectors stops working, update this file with the new one.

- Search results: `snapshot(page, { selector: '[data-component-type="s-search-results"]' })`
- Cart: `snapshot(page, { selector: '#activeCartViewForm' })`. The checkout button isn't inside that form; it's `<input name="proceedToRetailCheckout">`.

## How to work

- Skip the home page unless the user asks for it. It's mostly noise and ads.
- Before anything to do with orders, returns, payment or addresses, check which account and delivery address the header shows.
- Shipments, invoices, returns and buying again: start from Your Orders.
- Quantities and anything near checkout: start from the Cart.
- Order cards re-render often, so snapshot again after navigating or expanding one.

## Keys

| Action | Keys |
| --- | --- |
| Search | `Option+/` |
| Cart | `Shift+Option+C` |
| Home | `Shift+Option+H` |
| Orders | `Shift+Option+O` |
| Shortcut list | `Shift+Option+Z` |
