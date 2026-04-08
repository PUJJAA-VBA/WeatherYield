// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import fetch from "node-fetch";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());


// app.post("/chat", async (req, res) => {
//   const { message } = req.body;

//   try {
//     const response = await fetch(
//   `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       contents: [
//         {
//           parts: [{ text: message }],
//         },
//       ],
//     }),
//   }
// );

// const data = await response.json();

// console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));

// if (!response.ok) {
//   return res.json({ reply: "❌ API Error: " + JSON.stringify(data) });
// }

// const reply =
//   data?.candidates?.[0]?.content?.parts?.[0]?.text ||
//   "⚠️ No response from Gemini";

// res.json({ reply });
//   } catch (err) {
//     console.error("ERROR:", err.message);
//     res.json({ reply: "⚠️ Gemini error" });
//   }
// });

// app.listen(5000, () => {
//   console.log("✅ Server running on http://localhost:5000");
// });