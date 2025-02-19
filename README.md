# 🍽️ Online Food Ordering System - Backend

## Overview
This is the backend for an **Online Food Ordering System**, where users can browse restaurants, view menus, add items to the cart, place orders, and track their order status. Admins and restaurant owners can manage restaurants, menus, and orders.

## Features
### User Features
- **User Registration & Login**: Users can create an account and log in.
- **Browse Restaurants**: View available restaurants.
- **Search Restaurants**: Search for restaurants by name or cuisine.
- **View Menu**: View menu items of a selected restaurant.
- **Add to Cart**: Add menu items to the cart.
- **View & Manage Cart**: View, update, or remove items from the cart.
- **Place Orders**: Proceed to checkout and place an order.
- **Track Orders**: View order status and history.

### Admin & Restaurant Owner Features
- **Admin Login**: Secure login for admin users.
- **Manage Restaurants**: Admins can add, edit, or delete restaurants.
- **Manage Menus**: Restaurant owners can add, update, or remove menu items.
- **Manage Orders**: Admins and restaurant owners can view and update order statuses.

## Technologies Used
- **Node.js** - Backend runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT (JSON Web Token)** - Authentication & Authorization
- **Bcrypt** - Password Hashing

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yashp387/Food_Ordering_System 

🔹 Authentication
POST /api/auth/register - Register a new user
POST /api/auth/login - Login and get a token

🔹 User Routes
   - `GET /api/restaurants`  - Get all restaurants
   - `GET /api/restaurants/:id/menu`  - Get menu of a specific restaurant
   - `POST /api/cart`  - Add items to the cart
   - `GET /api/cart`  - View cart contents
   - `DELETE /api/cart/:itemId`  - Remove an item from the cart
   - `POST /api/orders`  - Place an order
   - `GET /api/orders`   - View user orders

🔹 Admin & Restaurant Owner Routes
   - `POST /api/admin/restaurants`  - Add a new restaurant (Admin)
   - `PUT /api/admin/restaurants/:id`  - Edit restaurant details (Admin)
   - `DELETE /api/admin/restaurants/:id`  - Delete a restaurant (Admin)
   - `POST /api/menu` - Add menu items (Restaurant Owner)
   - `PUT /api/menu/:menuItemId`  - Update menu items (Restaurant Owner)
   - `DELETE /api/menu/:menuItemId`  - Delete menu items (Restaurant Owner)
   - `GET /api/admin/orders`  - View all orders (Admin)
   - `PUT /api/admin/orders/:id`  - Update order status (Admin)