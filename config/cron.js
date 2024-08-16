import cron from "node-cron"
import axios from "axios"

// Use your deployed backend URL
export const croning=()=>{
    const BACKEND_URL = 'https://clabble-backend.onrender.com/'; // Replace with your deployed backend URL

    cron.schedule('*/10 * * * *', async () => {
    try {
        const response = await axios.get(BACKEND_URL);
        console.log(`Backend pinged successfully at ${new Date().toISOString()}`);
    } catch (error) {
        console.error(`Error pinging backend: ${error.message}`);
    }
    });
}
