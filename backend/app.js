import express from "express"
import * as db from "./db/db.js"

const app = express();
app.use(express.json())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    if (req.method === "OPTIONS") return res.sendStatus(200)
    next()
})

const PORT = 3080

///-------------------------------------------------------------------- általános

app.delete("/delete/:type/:id", (req, res) => {
    const { type, id } = req.params
    db.deleteItem(type, id)
    return res.status(200).json({message: "Törlés sikeres"})
})

/// -------------------------------------------------------------------- regisztráció
app.post("/regisztracio", (req,res) =>{
        const {email, name, pwd} = req.body
        const bolt = req.body.bolt ? 1 : 0
        if(!name || !email || !pwd){
            return res.status(400).json({error: "Regisztrációs adat hiány"})
        }
        if(db.getEmail(email)){
            return res.status(400).json({error: "Ez az email használatban van"})
        }
        db.createUser(name, bolt, email, pwd)
        return res.status(201).json({message: "Sikeres regisztráció"})
})

/// ------------------------------------------------------------------- bejelentkezés

app.post("/bejelentkezes", (req, res) => {
    const {email, pwd} = req.body
    const user = db.getLogin(email, pwd)
    if(!user){
        return res.status(400).json({error: "Hibás email vagy jelszó"})
    }
    return res.status(200).json({user : user})
})
/// -------------------------------------------------------------------- bolt

app.post("/bolt", (req, res) => {
    const {user_name, name, price} = req.body
    const raktaron = req.body.raktaron ? 1 : 0
    if(!user_name || !name || !price){
        return res.status(400).json({error: "Hiányzó adat"})
    }
    db.createProduct(user_name, name, price, raktaron)
    return res.status(201).json({message: "Termék létrehozva"})
})

app.put("/bolt/:id", (req, res) => {
    const { id } = req.params
    const { name, price} = req.body
    const raktaron = req.body.raktaron ? 1 : 0
    if(!name || !price){
        return res.status(400).json({error: "Hiányzó adat"})
    }
    db.updateProduct(id, name, price, raktaron)
    return res.status(200).json({message: "Termék frissítve"})
})

app.get("/bolt/:user_name", (req, res) => {
    const { user_name } = req.params
    const data = db.getProductByUser(user_name)
    return res.status(200).json(data)})
/// -------------------------------------------------------------------- felhasználó

app.get("/keres/:product_name", (req, res) => {
    const { product_name } = req.params
    const data = db.getProductsByUser(product_name)
    if(!data){
        return res.status(404).json({error: "Nincs ilyen termék"})
    }
    return res.status(200).json(data)
})

app.get("/termekek", (req, res) => {
    const data = db.getProducts()
    return res.status(200).json(data)
})


///--------------------------------------------------------------------- kedvenc
app.get("/kedvenc/:user_name", (req, res) => {
    try {
        const { user_name } = req.params
        const data = db.getFavorites(user_name)
        return res.status(200).json(data)
    } catch(e) {
        return res.status(500).json({error: e.message})
    }
})

app.delete("/kedvenc/:id", (req, res) => {
    const { id } = req.params
    db.deleteItem("favorites", id)
    return res.status(200).json({message: "Kedvenc törölve"})
})

app.post("/kedvenc", (req, res) => {
    try{
        const { user_email, product_name } = req.body
        if(!user_email || !product_name){
            return res.status(400).json({error: "Hiányzó adat"})
        }
        db.createFavorite(user_email, product_name)
        return res.status(201).json({message: "Kedvenc hozzáadva"})
    }
    catch(e){
        return res.status(500).json({error: e.message})
    }
})

///-------------------------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`${PORT}`)
} )