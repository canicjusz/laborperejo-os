import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./src/api/index.js";
import bodyParser from "body-parser";
import "./src/cron.js";

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use(apiRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.resolve(__dirname, "../assets")));
app.use(express.static(path.resolve(__dirname, "../client/public")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/public/index.html"));
});

app.listen(process.env.PORT || 5000);
