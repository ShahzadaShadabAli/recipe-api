import "dotenv/config"
import { ENV } from "./config/env.js"
import express from "express"
import { db } from "./config/db.js"
import { favouritesTable } from "./db/schema.js"
import { and, eq } from "drizzle-orm"


const app = express()

app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello World"
    })  
})

app.post("/api/favorites", async (req, res) => {
    try {
        const {userId, recipeId, title, image, cookTime, servings} = req.body
        if (!userId || !recipeId || !title) {
            return res.status(400).json({error: "Missing required fields"})
        }

        const newFavorite = await db.insert(favouritesTable).values({
            userId,
            recipeId,
            title,
            image,
            cookTime,
            servings
        }).returning()

        res.status(201).json(newFavorite[0])
    } catch (error) {
        console.log("Error adding favorite", error)
        res.status(500).json({error: "Something went wrong"})
    }
})

app.get("/api/favorites/:userId", async(req, res) =>{
    try {
        const {userId} = req.params

        const userFavorites = await db.select().from(favouritesTable).where(eq(favouritesTable.userId, userId))

        res.json(userFavorites)

    } catch (error) {
        console.log("Error fetching favorite", error)
        res.status(500).json({error: "Something went wrong"})
    }
})

app.delete("/api/favorites/:userId/:recipeId", async(req, res) => {
    try {
        const {userId, recipeId} = req.params
        await db.delete(favouritesTable).where(
            and(eq(favouritesTable.userId, userId)), eq(favouritesTable.recipeId, parseInt(recipeId))
        )

        res.status(200).json({message: "Favorite removed successfully"})

    } catch (error) {
        console.log("Error deleting favorite", error)
        res.status(500).json({error: "Something went wrong"})
    }
})

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`)
})