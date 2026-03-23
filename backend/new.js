// import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') }); // This points to backend/.env
const testBrevo = async () => {
    console.log("--- Starting Fetch Connection Test ---");

    const emailData = {
        sender: { name: "Aditya Library", email: "suryamamidala75@gmail.com" },
        to: [{ email: "suryamamidala75@gmail.com" }],
        subject: "Brevo Fetch Test 🚀",
        htmlContent: "<html><body><h1>It Works!</h1><p>Sent via Fetch API.</p></body></html>"
    };

    try {
        console.log("Sending...");
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("✅ DONE! Message ID:", result.messageId);
        } else {
            console.error("❌ FAILED!");
            console.error("Error Detail:", result);
        }
    } catch (error) {
        console.error("❌ Connection Error:", error);
    }
};

testBrevo();