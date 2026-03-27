import express, {Application, Request, Response} from "express" ;
import driverRoutes from './src/routes/drivers';
import trackRoutes from './src/routes/tracks';
import dotenv from "dotenv";
import cors from "cors";
import { DriverinitDb } from "./src/driverdatabase";
import { TrackinitDb } from "./src/trackdatabase";
import authRoutes from "./src/routes/auth";
import adminRoutes from "./src/routes/admin";



dotenv.config();

const PORT = process.env.PORT || 3000;

export const app: Application = express();

if (process.env.NODE_ENV !== 'test') {
    DriverinitDb();
    TrackinitDb();
}
app.use(cors());
app.use(express.json());
app.use('/api/v1', authRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', trackRoutes)
app.use('/api/v1', driverRoutes)

app.get("/ban", async (_req : Request, res: Response) => {
    res.json({
    message: "Hello I am Naomi",
    });
});

app.get("/ping", async (_req : Request, res: Response) => {
    res.json({
    message: "Hello I am Henrick 2",
    });
});



// app.listen(PORT, () => {
//     console.log("Server is running on port", PORT);
// });


//export { app };

// if (require.main === module) {
//   app.listen(PORT, () => {
//     console.log(`Server irunning on port ${PORT}`);
// })};
