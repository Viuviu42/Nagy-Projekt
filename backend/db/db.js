import Database from "better-sqlite3"


const db = new Database("./db/database.sqlite")
db.prepare("CREATE TABLE IF NOT EXISTS user(bolt BOOLEAN, name TEXT, email TEXT, pwd TEXT); ").run()
db.prepare("CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,user_name TEXT, name TEXT, price INTEGER, raktaron BOOLEAN)").run()
db.prepare("CREATE TABLE IF NOT EXISTS favorites(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT, product_name TEXT)").run()

/// -------------------------------------------------------------------- még jó lehet később
export const getAll = (type) => {
    return db.prepare(`SELECT * FROM ${type}`).all()
}

export const deleteItem = (type, id) => {
    return db.prepare(`DELETE FROM ${type} WHERE id = ?`).run(id)
}

export const getId = (type, id) => {
    return db.prepare(`SELECT * FROM ${type} WHERE id = ?`).get(id)
}

/// -------------------------------------------------------------------- (főként) regisztráció
export const createUser = (name, bolt, email, pwd) => {
    return db.prepare("INSERT INTO user (name, bolt, email, pwd) VALUES (?, ?, ?, ?)").run(name, bolt, email, pwd)
}
export const getEmail = (email) => {
    return db.prepare("SELECT email FROM user WHERE email = ?").get(email)
}
/// ------------------------------------------------------------------- (főként) bejelentkezés

export const getLogin = (email, pwd) => {
    return db.prepare("SELECT * FROM user WHERE email = ? AND pwd = ?").get(email, pwd)
}

/// --------------------------------------------------------------------(főként) bolt
export const createProduct = (user_name, name, price, raktaron) => {
    return db.prepare("INSERT INTO products (user_name, name, price, raktaron) VALUES (?, ?, ?, ?)").run(user_name, name, price, raktaron)
}

export const updateProduct = (id, name, price, raktaron) => {
    return db.prepare("UPDATE products SET name = ?, price = ?, raktaron = ? WHERE id = ?").run(name, price, raktaron, id)
}

/// -------------------------------------------------------------------- (főként) felhasználó

export const getProductsByUser = (product_name) => {
    return db.prepare("SELECT * FROM products WHERE name = ? ORDER BY price ASC").all(product_name)
}

export const createFavorite = (user_id, product_name) => {
    return db.prepare("INSERT INTO favorites (user_id, product_name) VALUES (?, ?)").run(user_id, product_name)
}

export const deleteFavorite = (user_id, product_name) => {
    return db.prepare("DELETE FROM favorites WHERE user_id = ? AND product_name = ?").run(user_id, product_name)
}

export const getFavorites = (user_id) => {
    return db.prepare("SELECT favorites.id, products.name, products.price, products.raktaron, products.user_name FROM favorites INNER JOIN products ON favorites.product_name = products.name WHERE favorites.user_id = ?").all(user_id)
}


