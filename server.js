const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const BASE_URL = "https://mir3d.kz/category/univer/";

app.get("/vr-tours", async (req, res) => {
  try {
    const { data } = await axios.get(BASE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const items = [];

    $("article, .item, .project, .col, .grid, .post").each((i, el) => {
      let title =
        $(el).find("h2, h3, .title, .name, a").first().text().trim() || null;

      // Фильтруем только университеты
      if (
        title &&
        (title.includes("Университет") ||
          title.includes("Академия") ||
          title.includes("ВУЗ"))
      ) {
        let link =
          $(el).find("a").first().attr("href") ||
          $(el).find("a").attr("href") ||
          null;
        if (link && !link.startsWith("http")) link = "https://mir3d.kz" + link;

        const img =
          $(el).find("img").attr("src") ||
          $(el).find("img").attr("data-src") ||
          null;

        items.push({ title, link, img });
      }
    });

    res.json({ count: items.length, items });
  } catch (e) {
    console.error("Ошибка парсинга:", e);
    res.status(500).json({ error: "Ошибка загрузки данных" });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log("Сервер запущен: http://localhost:" + PORT)
);
