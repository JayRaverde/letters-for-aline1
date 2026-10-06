import express from "express";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const LETTERS_FILE = path.join(DATA_DIR, "live_letters.json");
const VAULT_FILE = path.join(DATA_DIR, "letters_vault.json");
const SANCTUARY_CONTENT_FILE = path.join(DATA_DIR, "sanctuary_content.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return geminiClient;
}

const CURATED_WHISPERS = [
  "No matter how many timezones lie between our windows, my thoughts always orbit around you.",
  "Distance is merely a question of geometry; my devotion to you is infinite.",
  "I would count down a million seconds just to hear you laugh in person once.",
  "Every quiet night without you is just another page leading to our favorite chapter.",
  "You made an ocean feel like a puddle and midnight feel like home."
];

interface LiveLetterItem {
  id: string;
  title: string;
  content: string;
  author: 'Jazz' | 'Aline';
  timestamp: string;
  isoDate: string;
  readByRecipient: boolean;
  readAt?: string;
  reaction?: string;
  stationery: 'lined-warm' | 'velvet-noir';
}

interface VaultEntry {
  letter: LiveLetterItem;
  archivedAt: string;
  reason: 'created' | 'updated' | 'deleted' | 'synced';
}

const DEFAULT_STARTER_LETTER: LiveLetterItem = {
  id: 'live-1',
  title: 'Just thinking of you at my desk',
  content: "I took a moment between everything today just to look at our photos. The miles feel far today, but knowing you're in this world and that you chose me makes every single minute of waiting worth it. I'm right here with you, Aline. Always.",
  author: 'Jazz',
  timestamp: 'Today   8:15 PM',
  isoDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  readByRecipient: false,
  stationery: 'lined-warm',
};

// Disk Persistence Helpers
function loadLettersFromDisk(): LiveLetterItem[] {
  try {
    if (fs.existsSync(LETTERS_FILE)) {
      const data = fs.readFileSync(LETTERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading live_letters.json:", err);
  }
  return [DEFAULT_STARTER_LETTER];
}

function saveLettersToDisk(letters: LiveLetterItem[]) {
  try {
    fs.writeFileSync(LETTERS_FILE, JSON.stringify(letters, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing live_letters.json:", err);
  }
}

function loadVaultFromDisk(): VaultEntry[] {
  try {
    if (fs.existsSync(VAULT_FILE)) {
      const data = fs.readFileSync(VAULT_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Error reading letters_vault.json:", err);
  }
  return [];
}

function recordToVault(letter: LiveLetterItem, reason: VaultEntry['reason']) {
  try {
    const vault = loadVaultFromDisk();
    vault.unshift({
      letter: { ...letter },
      archivedAt: new Date().toISOString(),
      reason,
    });
    // Keep up to 200 vault entries
    const trimmed = vault.slice(0, 200);
    fs.writeFileSync(VAULT_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    console.error("Error updating vault:", err);
  }
}

// In-memory cache synced with disk
let liveLetters: LiveLetterItem[] = loadLettersFromDisk();

// Ensure initial file is written if not exists
if (!fs.existsSync(LETTERS_FILE)) {
  saveLettersToDisk(liveLetters);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      sanctuary: "Letters Across the Meridian",
      lettersCount: liveLetters.length,
      timestamp: new Date().toISOString(),
    });
  });

  // Download pre-built standalone ZIP bundle for instant drag & drop hosting (Netlify Drop / Vercel)
  app.get("/api/download-bundle", (_req, res) => {
    const zipPath = path.resolve(process.cwd(), "public", "sanctuary-for-aline-web.zip");
    if (fs.existsSync(zipPath)) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="sanctuary-for-aline-web.zip"');
      res.sendFile(zipPath);
    } else {
      res.status(404).send("Bundle is compiling, please retry in a moment.");
    }
  });

  // Get saved sanctuary custom content
  app.get("/api/sanctuary-content", (_req, res) => {
    try {
      if (fs.existsSync(SANCTUARY_CONTENT_FILE)) {
        const raw = fs.readFileSync(SANCTUARY_CONTENT_FILE, "utf-8");
        return res.json(JSON.parse(raw));
      }
      return res.json({ empty: true });
    } catch (err) {
      console.error("Error reading sanctuary content:", err);
      return res.status(500).json({ error: "Failed to read content" });
    }
  });

  // Save sanctuary content from Creator Workshop
  app.post("/api/sanctuary-content", (req, res) => {
    try {
      const data = req.body;
      fs.writeFileSync(SANCTUARY_CONTENT_FILE, JSON.stringify(data, null, 2), "utf-8");
      
      const publicDir = path.join(process.cwd(), "public");
      fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(path.join(publicDir, "sanctuary-data.json"), JSON.stringify(data, null, 2), "utf-8");

      return res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error("Error saving sanctuary content:", err);
      return res.status(500).json({ error: "Failed to save content" });
    }
  });

  // Bake and re-package the standalone bundle for morning deployment
  app.post("/api/bake-bundle", (req, res) => {
    try {
      const data = req.body;
      if (data && typeof data === 'object') {
        fs.writeFileSync(SANCTUARY_CONTENT_FILE, JSON.stringify(data, null, 2), "utf-8");
        
        const publicDir = path.join(process.cwd(), "public");
        fs.mkdirSync(publicDir, { recursive: true });
        fs.writeFileSync(path.join(publicDir, "sanctuary-data.json"), JSON.stringify(data, null, 2), "utf-8");

        const distDir = path.join(process.cwd(), "dist");
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, "sanctuary-data.json"), JSON.stringify(data, null, 2), "utf-8");
        }
      }

      // Re-pack static bundle with python3 scripts/zip_dist.py
      execSync("python3 scripts/zip_dist.py", { stdio: "inherit" });

      return res.json({
        success: true,
        message: "Bundle re-packaged successfully with all your customized letters, poems, and settings!",
        downloadUrl: "/api/download-bundle",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Error baking bundle:", err);
      return res.status(500).json({ error: "Failed to bake bundle: " + (err.message || String(err)) });
    }
  });

  // Poetic Verse / Whisper Inspiration
  app.post("/api/poetry/inspire", async (req, res) => {
    try {
      const {
        theme = "distance and love",
        herName = "Aline",
        hisName = "Jazz",
      } = req.body;

      const ai = getGemini();
      if (!ai) {
        const randomWhisper = CURATED_WHISPERS[Math.floor(Math.random() * CURATED_WHISPERS.length)];
        return res.json({
          verse: randomWhisper,
          source: "meridian_archive",
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write an evocative, tender, intimate 4-line poetic stanza from a loving partner named ${hisName} to his long-distance girlfriend named ${herName}. Theme: ${theme}. Voice: Romantic, poetic, deeply attentive to detail, no clichés. Only output the 4 lines of poetry.`,
      });

      const verseText = response.text?.trim() || CURATED_WHISPERS[0];
      return res.json({
        verse: verseText,
        source: "gemini_muse",
      });
    } catch (err) {
      console.error("Poetry generation error:", err);
      return res.json({
        verse: CURATED_WHISPERS[0],
        source: "meridian_archive",
      });
    }
  });

  // Get all live letters
  app.get("/api/letters", (_req, res) => {
    liveLetters = loadLettersFromDisk();
    const vault = loadVaultFromDisk();
    res.json({ letters: liveLetters, vaultCount: vault.length });
  });

  // Send a new live letter
  app.post("/api/letters", (req, res) => {
    try {
      const { title, content, author = 'Jazz', stationery = 'lined-warm' } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      const now = new Date();
      const formattedTime = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + '   ' + now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const newLetter: LiveLetterItem = {
        id: `live-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        content: content.trim(),
        author: author === 'Aline' ? 'Aline' : 'Jazz',
        timestamp: formattedTime,
        isoDate: now.toISOString(),
        readByRecipient: false,
        stationery: stationery === 'velvet-noir' ? 'velvet-noir' : 'lined-warm',
      };

      liveLetters = loadLettersFromDisk();
      liveLetters.unshift(newLetter);
      saveLettersToDisk(liveLetters);
      recordToVault(newLetter, 'created');

      return res.status(201).json({ letter: newLetter, letters: liveLetters });
    } catch (err) {
      console.error("Error creating letter:", err);
      return res.status(500).json({ error: "Could not send letter" });
    }
  });

  // Batch sync letters from client to server (protects against any server restart or data wipe)
  app.post("/api/letters/sync-batch", (req, res) => {
    try {
      const { letters: incomingLetters } = req.body;
      if (!Array.isArray(incomingLetters) || incomingLetters.length === 0) {
        return res.json({ letters: liveLetters });
      }

      liveLetters = loadLettersFromDisk();
      const existingIds = new Set(liveLetters.map((l) => l.id));
      let addedCount = 0;

      for (const item of incomingLetters) {
        if (!item || !item.content) continue;
        if (!existingIds.has(item.id)) {
          // If this is a valid user letter, merge it
          liveLetters.push(item);
          existingIds.add(item.id);
          recordToVault(item, 'synced');
          addedCount++;
        }
      }

      if (addedCount > 0) {
        // Sort newest first
        liveLetters.sort((a, b) => new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime());
        saveLettersToDisk(liveLetters);
      }

      return res.json({ success: true, addedCount, letters: liveLetters });
    } catch (err) {
      console.error("Batch sync error:", err);
      return res.status(500).json({ error: "Batch sync failed" });
    }
  });

  // Mark letter as read
  app.post("/api/letters/:id/read", (req, res) => {
    const { id } = req.params;
    liveLetters = loadLettersFromDisk();
    const letter = liveLetters.find((l) => l.id === id);
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }

    if (!letter.readByRecipient) {
      const now = new Date();
      letter.readByRecipient = true;
      letter.readAt = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + ' at ' + now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      saveLettersToDisk(liveLetters);
    }
    return res.json({ letter, letters: liveLetters });
  });

  // Add a sweet reaction or response note
  app.post("/api/letters/:id/react", (req, res) => {
    const { id } = req.params;
    const { reaction } = req.body;
    liveLetters = loadLettersFromDisk();
    const letter = liveLetters.find((l) => l.id === id);
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }

    letter.reaction = reaction;
    saveLettersToDisk(liveLetters);
    return res.json({ letter, letters: liveLetters });
  });

  // Delete a letter (archives it safely in vault before deleting from active desk)
  app.delete("/api/letters/:id", (req, res) => {
    const { id } = req.params;
    liveLetters = loadLettersFromDisk();
    const index = liveLetters.findIndex((l) => l.id === id);
    if (index !== -1) {
      const [deleted] = liveLetters.splice(index, 1);
      recordToVault(deleted, 'deleted');
      saveLettersToDisk(liveLetters);
    }
    return res.json({ success: true, letters: liveLetters });
  });

  // Edit a letter
  app.put("/api/letters/:id", (req, res) => {
    const { id } = req.params;
    const { title, content, stationery } = req.body;
    liveLetters = loadLettersFromDisk();
    const letter = liveLetters.find((l) => l.id === id);
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }

    if (title !== undefined) letter.title = title.trim();
    if (content !== undefined) letter.content = content.trim();
    if (stationery !== undefined) letter.stationery = stationery;

    saveLettersToDisk(liveLetters);
    recordToVault(letter, 'updated');
    return res.json({ letter, letters: liveLetters });
  });

  // Vault recovery endpoints
  app.get("/api/letters/vault", (_req, res) => {
    const vault = loadVaultFromDisk();
    res.json({ vault });
  });

  app.post("/api/letters/restore/:id", (req, res) => {
    const { id } = req.params;
    const vault = loadVaultFromDisk();
    const match = vault.find((v) => v.letter.id === id);
    if (!match) {
      return res.status(404).json({ error: "Letter not found in vault" });
    }

    liveLetters = loadLettersFromDisk();
    if (!liveLetters.some((l) => l.id === match.letter.id)) {
      liveLetters.unshift(match.letter);
      saveLettersToDisk(liveLetters);
    }
    return res.json({ success: true, letter: match.letter, letters: liveLetters });
  });

  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
  const isProduction = process.env.NODE_ENV === "production" || (hasDist && process.env.VITE_DEV !== "true");

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Letters Across the Meridian server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
