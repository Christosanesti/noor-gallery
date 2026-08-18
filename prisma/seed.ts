import { setDefaultResultOrder } from "node:dns";
import { config } from "dotenv";
import { list, put } from "@vercel/blob";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../generated/prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

try {
  setDefaultResultOrder("ipv4first");
} catch {
  // Node-only; ignore in constrained runtimes.
}

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
if (!blobToken) {
  throw new Error("BLOB_READ_WRITE_TOKEN is not set");
}

const adapter = new PrismaNeon({
  connectionString,
  connectionTimeoutMillis: 20_000,
});
const db = new PrismaClient({ adapter });

function unsplash(photoId: string) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1600&q=80`;
}

type PhotoFile = { buffer: Buffer; contentType: string };

async function listSeedBlobs() {
  const urls = new Map<string, string>();
  let cursor: string | undefined;
  do {
    const page = await list({
      prefix: "seed/",
      token: blobToken,
      cursor,
      limit: 1000,
    });
    for (const blob of page.blobs) {
      urls.set(blob.pathname, blob.url);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return urls;
}

async function downloadPhoto(photoId: string, cache: Map<string, PhotoFile>) {
  const cached = cache.get(photoId);
  if (cached) return cached;

  const source = unsplash(photoId);
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Failed to download ${photoId}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
  const file = { buffer, contentType };
  cache.set(photoId, file);
  return file;
}

async function ensureBlob(
  pathname: string,
  photoId: string,
  existing: Map<string, string>,
  cache: Map<string, PhotoFile>,
) {
  const current = existing.get(pathname);
  if (current) {
    return { url: current, blobPath: pathname };
  }

  const file = await downloadPhoto(photoId, cache);
  const blob = await put(pathname, file.buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: file.contentType,
    token: blobToken,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  existing.set(blob.pathname, blob.url);
  return { url: blob.url, blobPath: blob.pathname };
}

const categories = [
  { slug: "chandelier", nameFa: "لوستر", order: 0 },
  { slug: "classic", nameFa: "کلاسیک", order: 1 },
  { slug: "classic-crystal", nameFa: "کریستال کلاسیک", order: 2 },
  { slug: "modern", nameFa: "مدرن", order: 3 },
  { slug: "pendant", nameFa: "آویز", order: 4 },
  { slug: "wall", nameFa: "دیواری", order: 5 },
  { slug: "outdoor", nameFa: "فضای باز", order: 6 },
  { slug: "table", nameFa: "رومیزی", order: 7 },
  { slug: "abajour", nameFa: "آباژور", order: 8 },
  { slug: "lamp", nameFa: "لامپ", order: 9 },
  { slug: "ceiling", nameFa: "سقفی", order: 10 },
  { slug: "linear", nameFa: "خطی", order: 11 },
  { slug: "floor", nameFa: "ایستاده", order: 12 },
  { slug: "decorative", nameFa: "دکوراتیو", order: 13 },
] as const;

type CategorySlug = (typeof categories)[number]["slug"];

type SeedImage = {
  photoId: string;
  altFa: string;
};

type SeedCollection = {
  slug: string;
  categorySlug: CategorySlug;
  titleFa: string;
  excerptFa: string;
  descriptionFa: string;
  featured: boolean;
  images: SeedImage[];
};

const collections: SeedCollection[] = [
  {
    slug: "crystal-chandelier",
    categorySlug: "chandelier",
    titleFa: "لوستر کریستالی امپراطوری",
    excerptFa: "کریستال برش‌خورده، برنج طلایی و نور گرم برای سالن‌های تشریفاتی.",
    descriptionFa:
      "این لوستر با الهام از سبک امپراطوری طراحی شده و با کریستال‌های برش‌خورده، بازتاب نوری درخشان و جزئیات دست‌ساز ایجاد می‌کند. مناسب سالن‌های پذیرایی، لابی هتل و فضاهای VIP.",
    featured: true,
    images: [
      { photoId: "photo-1419833173245-f59e1b93f9ee", altFa: "لوستر کریستالی امپراطوری در سقف مجلل" },
      { photoId: "photo-1558171813-4c088753af8f", altFa: "جزئیات کریستال و نور گرم لوستر" },
      { photoId: "photo-1752847897985-7c4efe838969", altFa: "درخشش کریستال لوستر از نمای نزدیک" },
      { photoId: "photo-1617806118233-18e1de247200", altFa: "نصب لوستر در فضای داخلی لوکس" },
    ],
  },
  {
    slug: "brass-tier-chandelier",
    categorySlug: "chandelier",
    titleFa: "لوستر طبقه‌ای برنجی",
    excerptFa: "طبقات برنجی با شعله‌های نرم برای سقف‌های بلند.",
    descriptionFa:
      "لوستر طبقه‌ای با بدنه برنج پرداخت‌شده و آویزهای متقارن، حجم نوری باشکوه برای دوبلکس، راهروهای مرتفع و تالارهای کلاسیک می‌سازد.",
    featured: false,
    images: [
      { photoId: "photo-1771148886930-01cd06ddb38f", altFa: "لوستر طبقه‌ای زیر سقف منبت‌کاری" },
      { photoId: "photo-1565814329452-e1efa11c5b89", altFa: "آویز سفید لوکس در فضای داخلی" },
      { photoId: "photo-1600607687939-ce8a6c25118c", altFa: "سالن لوکس با نورپردازی سقفی" },
    ],
  },
  {
    slug: "lobby-crown-chandelier",
    categorySlug: "chandelier",
    titleFa: "لوستر تاج لابی",
    excerptFa: "حجمی تاج‌مانند برای لابی هتل و ورودی‌های تشریفاتی.",
    descriptionFa:
      "لوستر تاج لابی با حلقه‌های متحدالمرکز و کریستال‌های آبشاری، نقطه کانونی ورودی‌های بزرگ و لابی‌های مرمری است و نور را به‌صورت یکنواخت در ارتفاع پخش می‌کند.",
    featured: false,
    images: [
      { photoId: "photo-1616046229478-9901c5536a45", altFa: "لابی لوکس با لوستر مرکزی" },
      { photoId: "photo-1600210492486-724fe5c67fb0", altFa: "فضای ورودی با نور گرم سقفی" },
      { photoId: "photo-1631679706909-1844bbd07221", altFa: "نشیمن مجلل با لوستر مرکزی" },
      { photoId: "photo-1618221195710-dd6b41faaea6", altFa: "جزئیات معماری و نورپردازی لابی" },
    ],
  },
  {
    slug: "versailles-classic",
    categorySlug: "classic",
    titleFa: "مجموعه ورسای طلایی",
    excerptFa: "طلایی کهنه، کریستال و تناسبات کلاسیک فرانسوی.",
    descriptionFa:
      "مجموعه ورسای با پرداخت طلایی کهنه، بازوهای منحنی و شیدهای شفاف، حال‌وهوای کاخ‌های اروپایی را برای سالن‌های کلاسیک ایرانی بازسازی می‌کند.",
    featured: true,
    images: [
      { photoId: "photo-1771148886930-01cd06ddb38f", altFa: "لوستر کلاسیک زیر سقف تزئینی" },
      { photoId: "photo-1419833173245-f59e1b93f9ee", altFa: "لوستر طلایی کلاسیک" },
      { photoId: "photo-1616486338812-3dadae4b4ace", altFa: "اتاق کلاسیک با نور گرم" },
      { photoId: "photo-1481277542470-605612bd2d61", altFa: "جزئیات دکوراسیون کلاسیک و نور" },
    ],
  },
  {
    slug: "baroque-classic",
    categorySlug: "classic",
    titleFa: "لوستر باروک دست‌ساز",
    excerptFa: "حجم‌های پرانحنا و برنز تیره برای فضاهای رسمی.",
    descriptionFa:
      "لوستر باروک با ریخته‌گری دست‌ساز، پتینه برنز و آویزهای قطره‌ای، مناسب تالارهای رسمی، خانه‌های اعیانی و فضاهایی است که به حضور مجسمه‌گونه نور نیاز دارند.",
    featured: false,
    images: [
      { photoId: "photo-1558171813-4c088753af8f", altFa: "لوستر باروک با جزئیات فلزی" },
      { photoId: "photo-1752847897985-7c4efe838969", altFa: "درخشش آویزهای کلاسیک" },
      { photoId: "photo-1493663284031-b7e3aefcae8e", altFa: "نشیمن کلاسیک با نورپردازی گرم" },
    ],
  },
  {
    slug: "imperial-cascade-crystal",
    categorySlug: "classic-crystal",
    titleFa: "آبشار کریستال امپراطوری",
    excerptFa: "ریزش کریستال از سقف تا سطح دید، مثل آبشار نور.",
    descriptionFa:
      "آبشار کریستال امپراطوری با رشته‌های متراکم کریستال، برای سقف‌های بسیار بلند و راه‌پله‌های دوبلکس طراحی شده و در حرکت، بازی نور پیوسته‌ای می‌سازد.",
    featured: true,
    images: [
      { photoId: "photo-1752847897985-7c4efe838969", altFa: "آبشار کریستال درخشان" },
      { photoId: "photo-1419833173245-f59e1b93f9ee", altFa: "لوستر کریستالی بلند" },
      { photoId: "photo-1771148886930-01cd06ddb38f", altFa: "نصب کریستالی در سقف کاخ‌مانند" },
      { photoId: "photo-1617806118233-18e1de247200", altFa: "فضای لوکس با بازتاب کریستال" },
      { photoId: "photo-1600607687939-ce8a6c25118c", altFa: "سالن پذیرایی با نور کریستالی" },
    ],
  },
  {
    slug: "palace-ring-crystal",
    categorySlug: "classic-crystal",
    titleFa: "حلقه کریستال کاخ",
    excerptFa: "حلقه عریض کریستال برای میزهای گرد و گنبدها.",
    descriptionFa:
      "حلقه کریستال کاخ با قطر وسیع و آویزهای منظم، روی میزهای گرد ناهارخوری، گنبدهای داخلی و سالن‌های دایره‌ای تأثیری متقارن و درخشان می‌گذارد.",
    featured: false,
    images: [
      { photoId: "photo-1565814329452-e1efa11c5b89", altFa: "حلقه نوری کریستالی" },
      { photoId: "photo-1558171813-4c088753af8f", altFa: "جزئیات حلقه کریستال" },
      { photoId: "photo-1600210492486-724fe5c67fb0", altFa: "اتاق مجلل با نور حلقه‌ای" },
    ],
  },
  {
    slug: "black-orb-modern",
    categorySlug: "modern",
    titleFa: "گوی مشکی مدرن",
    excerptFa: "کره مشکی مات با نور متمرکز برای فضاهای معاصر.",
    descriptionFa:
      "گوی مشکی مدرن با سطح مات و منبع نور مخفی، تضادی دقیق با سنگ روشن و چوب تیره ایجاد می‌کند. مناسب پنت‌هاوس، گالری و نشیمن‌های مینیمال لوکس.",
    featured: true,
    images: [
      { photoId: "photo-1762144637568-a87f3a454d18", altFa: "آویزهای مدرن در فضای تیره" },
      { photoId: "photo-1540932239986-30128078f3c5", altFa: "گوی‌های نوری آویزان" },
      { photoId: "photo-1618220179428-22790b461013", altFa: "داخلی مدرن با نورپردازی خطی" },
      { photoId: "photo-1600585154526-990dced4db0d", altFa: "معماری معاصر و نور سقفی" },
    ],
  },
  {
    slug: "geometric-gold-modern",
    categorySlug: "modern",
    titleFa: "هندسه طلایی معاصر",
    excerptFa: "فرم‌های هندسی برنج با خطوط تیز و نور لایه‌ای.",
    descriptionFa:
      "مجموعه هندسه طلایی معاصر فرم‌های چندوجهی و میله‌های برنجی را با نور لایه‌ای ترکیب می‌کند؛ مناسب میز ناهارخوری مدرن و فضاهای گالری‌مانند.",
    featured: false,
    images: [
      { photoId: "photo-1600607687920-4e2a09cf159d", altFa: "داخلی معاصر با جزئیات طلایی" },
      { photoId: "photo-1600566752355-35792bedcfea", altFa: "فضای مدرن با نور گرم" },
      { photoId: "photo-1618220048045-10a6dbdf83e0", altFa: "نشیمن معاصر با چراغ سقفی" },
    ],
  },
  {
    slug: "modern-pendant",
    categorySlug: "pendant",
    titleFa: "آویز مدرن مینیمال",
    excerptFa: "خطوط مینیمال با نور متمرکز برای میز و جزیره.",
    descriptionFa:
      "آویز مدرن مینیمال با بدنه مشکی مات و نور متمرکز، گزینه‌ای ایده‌آل برای میز ناهارخوری، جزیره آشپزخانه و فضاهای کاری لوکس است.",
    featured: true,
    images: [
      { photoId: "photo-1540932239986-30128078f3c5", altFa: "آویز مدرن مینیمال" },
      { photoId: "photo-1513506003901-1e6a229e2d15", altFa: "آویزهای رنگی روی میز" },
      { photoId: "photo-1577140917170-285929fb55b7", altFa: "ردیف آویز در فضای غذاخوری" },
      { photoId: "photo-1762144637568-a87f3a454d18", altFa: "آویزهای معاصر در تاریکی" },
    ],
  },
  {
    slug: "clustered-glass-pendant",
    categorySlug: "pendant",
    titleFa: "خوشه شیشه‌ای آویز",
    excerptFa: "چند حباب شیشه‌ای در ارتفاع‌های متفاوت، مثل خوشه نور.",
    descriptionFa:
      "خوشه شیشه‌ای آویز با حباب‌های دهان‌دم در ارتفاع‌های متغیر، برای راهپله، بالای میز و فضاهای دوبلکس ترکیبی مجسمه‌ای و زنده می‌سازد.",
    featured: false,
    images: [
      { photoId: "photo-1513506003901-1e6a229e2d15", altFa: "خوشه آویز شیشه‌ای" },
      { photoId: "photo-1577140917170-285929fb55b7", altFa: "آویزهای خوشه‌ای رستورانی" },
      { photoId: "photo-1540932239986-30128078f3c5", altFa: "حباب‌های شیشه‌ای نورانی" },
    ],
  },
  {
    slug: "island-linear-pendant",
    categorySlug: "pendant",
    titleFa: "آویز جزیره آشپزخانه",
    excerptFa: "نور یکنواخت روی کانتر سنگ و جزیره آشپزخانه.",
    descriptionFa:
      "آویز جزیره برای طول کانتر طراحی شده؛ ترکیبی از نور کار و نور دکوراتیو که بافت سنگ، فلز و چوب آشپزخانه‌های لوکس را برجسته می‌کند.",
    featured: false,
    images: [
      { photoId: "photo-1556911220-bff31c812dba", altFa: "آشپزخانه لوکس با آویز جزیره" },
      { photoId: "photo-1556912173-3bb406ef7e77", altFa: "جزیره آشپزخانه و نور خطی" },
      { photoId: "photo-1600585152220-90363fe7e115", altFa: "آشپزخانه معاصر با چراغ آویز" },
      { photoId: "photo-1484154218962-a197022b5858", altFa: "نورپردازی روی کانتر آشپزخانه" },
    ],
  },
  {
    slug: "brass-sconce-wall",
    categorySlug: "wall",
    titleFa: "دیوارکوب برنجی کلاسیک",
    excerptFa: "بازوهای برنجی و شعله نرم برای راهرو و کنار آینه.",
    descriptionFa:
      "دیوارکوب برنجی کلاسیک با بازوی منحنی و حباب شیری، برای راهروهای هتل، کنار قاب آینه و راهپله‌های سنگی نوری دعوت‌کننده می‌سازد.",
    featured: true,
    images: [
      { photoId: "photo-1762631817831-c3e7ee1b1467", altFa: "دیوارکوب مدرن با نور گرم" },
      { photoId: "photo-1760977817633-86910d0dfe3d", altFa: "جفت دیوارکوب و بازی سایه" },
      { photoId: "photo-1481277542470-605612bd2d61", altFa: "راهرو کلاسیک با نور دیواری" },
    ],
  },
  {
    slug: "crystal-sconce-wall",
    categorySlug: "wall",
    titleFa: "دیوارکوب کریستالی",
    excerptFa: "کریستال و برنج برای دیوارهای آینه‌ای و سالن‌های رسمی.",
    descriptionFa:
      "دیوارکوب کریستالی نسخه دیواری مجموعه‌های کاخ است؛ مناسب دو سوی شومینه، دیوار آینه‌ای سالن و سوئیت‌های تشریفاتی.",
    featured: false,
    images: [
      { photoId: "photo-1760977817633-86910d0dfe3d", altFa: "دیوارکوب‌های متقارن روی دیوار" },
      { photoId: "photo-1752847897985-7c4efe838969", altFa: "جزئیات کریستال دیوارکوب" },
      { photoId: "photo-1615873968403-89e068629265", altFa: "اتاق خواب لوکس با نور دیواری" },
    ],
  },
  {
    slug: "halo-sconce-wall",
    categorySlug: "wall",
    titleFa: "دیوارکوب هاله‌نور",
    excerptFa: "صفحه نوری معماری که روی دیوار هاله می‌اندازد.",
    descriptionFa:
      "دیوارکوب هاله‌نور با پخش غیرمستقیم، برای راهروهای گالری، دیوار سنگی و فضاهای معاصر که به نور بدون خیرگی نیاز دارند طراحی شده است.",
    featured: false,
    images: [
      { photoId: "photo-1762631817831-c3e7ee1b1467", altFa: "هاله‌نور دیوارکوب معاصر" },
      { photoId: "photo-1552321554-5fefe8c9ef14", altFa: "نورپردازی دیواری در فضای بهداشتی لوکس" },
      { photoId: "photo-1560448075-bb485b067938", altFa: "جزئیات معماری و نور دیوار" },
    ],
  },
  {
    slug: "lantern-facade-outdoor",
    categorySlug: "outdoor",
    titleFa: "فانوس نمای سنگی",
    excerptFa: "نور گرم روی سنگ و آجر در ورودی ویلا.",
    descriptionFa:
      "فانوس نمای سنگی با بدنه فلزی مقاوم و شیشه بافت‌دار، ورودی ویلا، رواق و دیوارهای باغ را در غروب با نوری گرم و معماری روشن می‌کند.",
    featured: false,
    images: [
      { photoId: "photo-1759390304641-9490a433c34b", altFa: "فانوس فضای باز روی دیوار بافت‌دار" },
      { photoId: "photo-1578662996442-48f60103fc96", altFa: "فانوس‌های آویزان در فضای بیرونی" },
      { photoId: "photo-1512917774080-9991f1c4c750", altFa: "نمای ویلا با نورپردازی شب" },
      { photoId: "photo-1600596542815-ffad4c1539a9", altFa: "ورودی خانه لوکس در شب" },
    ],
  },
  {
    slug: "garden-lantern-outdoor",
    categorySlug: "outdoor",
    titleFa: "چراغ باغ و رواق",
    excerptFa: "مسیر باغ، استخر و رواق را با نور لایه‌ای می‌سازد.",
    descriptionFa:
      "چراغ باغ و رواق برای مسیر سنگفرش، کنار استخر و سقف رواق طراحی شده و در برابر رطوبت، با نوری نرم منظره شب را تعریف می‌کند.",
    featured: false,
    images: [
      { photoId: "photo-1578662996442-48f60103fc96", altFa: "چراغ‌های باغ و رواق" },
      { photoId: "photo-1564013799919-ab600027ffc6", altFa: "ویلا با نورپردازی محوطه" },
      { photoId: "photo-1605276374104-dee2a0ed3cd6", altFa: "نمای شب خانه با چراغ بیرونی" },
    ],
  },
  {
    slug: "villa-wall-outdoor",
    categorySlug: "outdoor",
    titleFa: "چراغ دیواری ویلا",
    excerptFa: "دیوارکوب بیرونی برای نما، پارکینگ و حیاط خلوت.",
    descriptionFa:
      "چراغ دیواری ویلا با پخش کنترل‌شده، نمای سنگ، درب ورودی و پارکینگ را بدون خیرگی روشن می‌کند و با معماری معاصر هماهنگ است.",
    featured: false,
    images: [
      { photoId: "photo-1759390304641-9490a433c34b", altFa: "چراغ دیواری نما در غروب" },
      { photoId: "photo-1570129477492-45c003edd2be", altFa: "نمای خانه با نورپردازی بیرونی" },
      { photoId: "photo-1512917774080-9991f1c4c750", altFa: "ویلای لوکس با چراغ دیواری" },
    ],
  },
  {
    slug: "crystal-table-lamp",
    categorySlug: "table",
    titleFa: "چراغ رومیزی کریستالی",
    excerptFa: "پایه کریستال و شید نرم برای میز کنسول و کنار تخت.",
    descriptionFa:
      "چراغ رومیزی کریستالی با پایه تراش‌خورده و شید پارچه‌ای، برای کنسول ورودی، میز تحریر و پاتختی سوئیت‌های لوکس نوری متمرکز و درخشان می‌سازد.",
    featured: false,
    images: [
      { photoId: "photo-1534349762230-e0cadf78f5da", altFa: "چراغ رومیزی روشن" },
      { photoId: "photo-1517991104123-1d56a6e81ed9", altFa: "چراغ رومیزی با شید پارچه‌ای" },
      { photoId: "photo-1494438639946-1ebd1d20bf85", altFa: "جزئیات لامپ رومیزی لوکس" },
      { photoId: "photo-1519710164239-da123dc03ef4", altFa: "چیدمان داخلی با چراغ رومیزی" },
    ],
  },
  {
    slug: "sculptural-table-lamp",
    categorySlug: "table",
    titleFa: "مجسمه نوری رومیزی",
    excerptFa: "فرم مجسمه‌ای مرمر و فلز برای میزهای کم‌ارتفاع.",
    descriptionFa:
      "مجسمه نوری رومیزی بیشتر یک آبجکت هنری است تا چراغ صرف؛ ترکیب مرمر، برنج و شید بسته برای میزهای جلومبلی و کنسول گالری.",
    featured: false,
    images: [
      { photoId: "photo-1517991104123-1d56a6e81ed9", altFa: "چراغ رومیزی مجسمه‌ای" },
      { photoId: "photo-1556228453-efd6c1ff04f6", altFa: "میز کنسول با چراغ تزئینی" },
      { photoId: "photo-1583847268964-b28dc8f51f92", altFa: "جزئیات دکوراسیون و نور رومیزی" },
    ],
  },
  {
    slug: "velvet-abajour",
    categorySlug: "abajour",
    titleFa: "آباژور مخمل طلایی",
    excerptFa: "نور گرم و بافت مخمل برای نشیمن و اتاق خواب.",
    descriptionFa:
      "آباژور مخمل طلایی با شید نرم و پایه برنجی، نوری گرم و دعوت‌کننده می‌سازد. مناسب نشیمن‌های کلاسیک، سوئیت‌های هتل و فضاهایی که به جزئیات لوکس نیاز دارند.",
    featured: true,
    images: [
      { photoId: "photo-1519710164239-da123dc03ef4", altFa: "آباژور مخمل طلایی" },
      { photoId: "photo-1534349762230-e0cadf78f5da", altFa: "نور گرم آباژور در فضا" },
      { photoId: "photo-1505693416388-ac5ce068fe85", altFa: "اتاق خواب با آباژور کنار تخت" },
      { photoId: "photo-1522771739844-6a9f6d5f14af", altFa: "سوئیت با نورپردازی نرم آباژور" },
    ],
  },
  {
    slug: "silk-shade-abajour",
    categorySlug: "abajour",
    titleFa: "آباژور ابریشم شامپاینی",
    excerptFa: "شید ابریشم و پایه مرمر برای گوشه‌های آرام خانه.",
    descriptionFa:
      "آباژور ابریشم شامپاینی نور را فیلتر می‌کند و سایه‌ای مخملی روی دیوار می‌اندازد؛ مناسب کتابخانه، نشیمن عصرانه و سوئیت مستر.",
    featured: false,
    images: [
      { photoId: "photo-1517991104123-1d56a6e81ed9", altFa: "آباژور با شید روشن" },
      { photoId: "photo-1578683010236-d716f9a3f461", altFa: "اتاق خواب لوکس با آباژور" },
      { photoId: "photo-1615875605825-5eb9bb5d52ac", altFa: "نشیمن آرام با نور آباژور" },
    ],
  },
  {
    slug: "opal-globe-lamp",
    categorySlug: "lamp",
    titleFa: "لامپ گوی شیری",
    excerptFa: "حباب شیری اپال برای نور نرم و بدون خیرگی.",
    descriptionFa:
      "لامپ گوی شیری با شیشه اپال، نوری پخش و آرام برای کنار تخت، میز مطالعه و گوشه‌های معماری می‌سازد و با فضاهای مدرن و کلاسیک سازگار است.",
    featured: false,
    images: [
      { photoId: "photo-1540932239986-30128078f3c5", altFa: "لامپ گوی شیری آویزان" },
      { photoId: "photo-1494438639946-1ebd1d20bf85", altFa: "لامپ رومیزی با حباب روشن" },
      { photoId: "photo-1534349762230-e0cadf78f5da", altFa: "جزئیات لامپ شیری" },
    ],
  },
  {
    slug: "studio-spot-lamp",
    categorySlug: "lamp",
    titleFa: "لامپ استودیویی متمرکز",
    excerptFa: "نور جهت‌دار برای آثار هنری، بافت سنگ و ویترین.",
    descriptionFa:
      "لامپ استودیویی متمرکز برای برجسته‌کردن تابلو، مجسمه و بافت متریال طراحی شده و در گالری خانگی یا ویترین محصولات، کنتراست دقیق می‌سازد.",
    featured: false,
    images: [
      { photoId: "photo-1554995207-c18c203602cb", altFa: "فضای روشن با نور متمرکز" },
      { photoId: "photo-1586023492125-27b2c045efd7", altFa: "نورپردازی لایه‌ای در فضای داخلی" },
      { photoId: "photo-1513694203232-719a280e022f", altFa: "نشیمن با نور نقطه‌ای" },
    ],
  },
  {
    slug: "flush-crystal-ceiling",
    categorySlug: "ceiling",
    titleFa: "سقفی کریستالی تخت",
    excerptFa: "نصب کم‌ارتفاع برای سقف‌های معمولی با درخشش کریستال.",
    descriptionFa:
      "چراغ سقفی کریستالی تخت برای فضاهایی با ارتفاع محدود طراحی شده؛ بدون از دست دادن درخشش، برای اتاق خواب، راهرو و نشیمن‌های شهری مناسب است.",
    featured: false,
    images: [
      { photoId: "photo-1565814329452-e1efa11c5b89", altFa: "چراغ سقفی کریستالی" },
      { photoId: "photo-1558171813-4c088753af8f", altFa: "جزئیات سقفی کریستال" },
      { photoId: "photo-1560448204-e02f11c3d0e2", altFa: "اتاق با چراغ سقفی کم‌ارتفاع" },
      { photoId: "photo-1560448204-61dc36dc98c8", altFa: "فضای داخلی با نور سقفی یکنواخت" },
    ],
  },
  {
    slug: "drum-ceiling-light",
    categorySlug: "ceiling",
    titleFa: "سقفی درام پارچه‌ای",
    excerptFa: "استوانه پارچه‌ای با نور نرم برای اتاق و نشیمن.",
    descriptionFa:
      "سقفی درام با شید پارچه‌ای، نور را به‌صورت یکنواخت پخش می‌کند و برای اتاق خواب، اتاق کودک لوکس و نشیمن‌های آرام انتخابی شیک است.",
    featured: false,
    images: [
      { photoId: "photo-1522771739844-6a9f6d5f14af", altFa: "اتاق خواب با چراغ سقفی نرم" },
      { photoId: "photo-1505693416388-ac5ce068fe85", altFa: "نورپردازی سقفی اتاق خواب" },
      { photoId: "photo-1598928506311-c55ded91a20c", altFa: "نشیمن آرام با نور سقفی" },
    ],
  },
  {
    slug: "gold-bar-linear",
    categorySlug: "linear",
    titleFa: "میله طلایی خطی",
    excerptFa: "پروفیل برنج برای میز ناهارخوری بلند و کانتر.",
    descriptionFa:
      "میله طلایی خطی نوری ممتد و دقیق روی سطح میز می‌ریزد؛ مناسب ناهارخوری‌های کشیده، میز جلسات خصوصی و جزایر سنگی.",
    featured: true,
    images: [
      { photoId: "photo-1556909114-f6e7ad7d3136", altFa: "نور خطی روی کانتر آشپزخانه" },
      { photoId: "photo-1484154218962-a197022b5858", altFa: "آشپزخانه با چراغ خطی" },
      { photoId: "photo-1600585152220-90363fe7e115", altFa: "جزیره و نور خطی طلایی" },
      { photoId: "photo-1556912173-3bb406ef7e77", altFa: "چیدمان آشپزخانه لوکس با نور ممتد" },
    ],
  },
  {
    slug: "crystal-bar-linear",
    categorySlug: "linear",
    titleFa: "خطی کریستال معلق",
    excerptFa: "میله کریستالی برای میزهای رسمی و گالری‌های خطی.",
    descriptionFa:
      "خطی کریستال معلق درخشش لوستر کلاسیک را در فرمی معاصر و کشیده بازتعریف می‌کند؛ برای میزهای رسمی دراز و راهروهای گالری.",
    featured: false,
    images: [
      { photoId: "photo-1762144637568-a87f3a454d18", altFa: "چراغ خطی معلق معاصر" },
      { photoId: "photo-1577140917170-285929fb55b7", altFa: "ردیف نور خطی روی میز" },
      { photoId: "photo-1618220179428-22790b461013", altFa: "فضای معاصر با نور خطی" },
    ],
  },
  {
    slug: "arc-floor-lamp",
    categorySlug: "floor",
    titleFa: "آباژور کمانی ایستاده",
    excerptFa: "قوس برنجی که نور را روی مبل و میز جلو می‌نشاند.",
    descriptionFa:
      "آباژور کمانی ایستاده با بازوی بلند، برای نشیمن‌های باز و کنار مبل‌های بزرگ طراحی شده و بدون اشغال میز، نور مطالعه و دکور می‌سازد.",
    featured: false,
    images: [
      { photoId: "photo-1555041469-a586c61ea9bc", altFa: "نشیمن با آباژور ایستاده کنار مبل" },
      { photoId: "photo-1598928506311-c55ded91a20c", altFa: "چراغ ایستاده در فضای نشیمن" },
      { photoId: "photo-1616486338812-3dadae4b4ace", altFa: "گوشه نشیمن با نور ایستاده" },
      { photoId: "photo-1484101403633-562f891dc89a", altFa: "مبلمان و چراغ ایستاده لوکس" },
    ],
  },
  {
    slug: "tripod-floor-lamp",
    categorySlug: "floor",
    titleFa: "ایستاده سه‌پایه برنجی",
    excerptFa: "سه‌پایه مجسمه‌ای با شید مخروطی برای گوشه‌های معماری.",
    descriptionFa:
      "ایستاده سه‌پایه برنجی هم سازه است و هم چراغ؛ برای کنار شومینه، گوشه کتابخانه و فضاهای دوبلکس که به یک عنصر عمودی طلایی نیاز دارند.",
    featured: false,
    images: [
      { photoId: "photo-1513694203232-719a280e022f", altFa: "چراغ ایستاده در نشیمن" },
      { photoId: "photo-1586023492125-27b2c045efd7", altFa: "گوشه داخلی با نور ایستاده" },
      { photoId: "photo-1600121848594-d8644e57abab", altFa: "فضای نشیمن با چراغ بلند" },
    ],
  },
  {
    slug: "art-glass-decorative",
    categorySlug: "decorative",
    titleFa: "شیشه هنری دکوراتیو",
    excerptFa: "حباب‌های دست‌ساز رنگی که خود اثر هنری‌اند.",
    descriptionFa:
      "شیشه هنری دکوراتیو مجموعه‌ای از حباب‌های دهان‌دم است که نور را رنگ می‌کند؛ برای وید، گالری خانگی و فضاهایی که نور باید مجسمه باشد.",
    featured: false,
    images: [
      { photoId: "photo-1513506003901-1e6a229e2d15", altFa: "حباب‌های شیشه‌ای رنگی آویزان" },
      { photoId: "photo-1577140917170-285929fb55b7", altFa: "چیدمان دکوراتیو آویزهای شیشه‌ای" },
      { photoId: "photo-1540932239986-30128078f3c5", altFa: "گوی‌های شیشه‌ای نورانی" },
    ],
  },
  {
    slug: "halo-ring-decorative",
    categorySlug: "decorative",
    titleFa: "حلقه نوری مجسمه‌ای",
    excerptFa: "حلقه‌های معلق معماری برای وید و سقف دوبلکس.",
    descriptionFa:
      "حلقه نوری مجسمه‌ای با قطرهای تودرتو، فضای خالی وید را پر می‌کند و از پایین به‌صورت یک اثر معلق طلایی دیده می‌شود.",
    featured: false,
    images: [
      { photoId: "photo-1762144637568-a87f3a454d18", altFa: "حلقه‌های نوری معلق" },
      { photoId: "photo-1600607687644-c7171b42498f", altFa: "وید معماری با نور مجسمه‌ای" },
      { photoId: "photo-1600566753190-17f0baa2a6c3", altFa: "فضای دوبلکس با نور حلقه‌ای" },
      { photoId: "photo-1600573472592-401b489a3cdc", altFa: "داخلی معاصر با حجم نوری" },
      { photoId: "photo-1600210491892-03d54c0aaf87", altFa: "معماری لوکس و نور معلق" },
    ],
  },
];

async function upsertCategory(input: (typeof categories)[number]) {
  return db.category.upsert({
    where: { slug: input.slug },
    create: {
      nameFa: input.nameFa,
      slug: input.slug,
      order: input.order,
    },
    update: {
      nameFa: input.nameFa,
      order: input.order,
    },
  });
}

async function syncSeedImages(
  collectionId: string,
  slug: string,
  images: SeedImage[],
  blobIndex: Map<string, string>,
  photoCache: Map<string, PhotoFile>,
) {
  const existingSeed = await db.galleryImage.findMany({
    where: {
      collectionId,
      OR: [{ blobPath: { startsWith: "seed:" } }, { blobPath: { startsWith: "seed/" } }],
    },
  });
  const byPath = new Map(existingSeed.map((image) => [image.blobPath, image]));
  const keptIds = new Set<string>();

  for (const [index, image] of images.entries()) {
    const pathname = `seed/${slug}/${index}.jpg`;
    const uploaded = await ensureBlob(pathname, image.photoId, blobIndex, photoCache);
    const payload = {
      url: uploaded.url,
      blobPath: uploaded.blobPath,
      altFa: image.altFa,
      order: index,
    };
    const current =
      byPath.get(pathname) ??
      byPath.get(`seed:${slug}:${index}`) ??
      existingSeed.find((row) => row.order === index && !keptIds.has(row.id));
    if (current) {
      await db.galleryImage.update({
        where: { id: current.id },
        data: payload,
      });
      keptIds.add(current.id);
    } else {
      const created = await db.galleryImage.create({
        data: {
          collectionId,
          ...payload,
        },
      });
      keptIds.add(created.id);
    }
  }

  const leftoverIds = existingSeed.filter((image) => !keptIds.has(image.id)).map((image) => image.id);

  if (leftoverIds.length) {
    await db.galleryImage.deleteMany({
      where: { id: { in: leftoverIds } },
    });
  }
}

async function main() {
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      heroTitleFa: "نور گالری، نمایشگاهی از نور و جزئیات",
      heroSubtitleFa:
        "مجموعه‌ای منتخب از لوستر، آباژور و روشنایی معماری با طراحی شیک و تجربه‌ای لوکس.",
      aboutFa:
        "نور گالری فضایی تخصصی برای کشف لوستر، لامپ و روشنایی معماری است. ما بر جزئیات، بافت و کیفیت نور تمرکز داریم تا هر بازدید، تجربه‌ای لوکس و الهام‌بخش باشد.",
      addressFa: "تهران، خیابان ولیعصر، نمایشگاه نور گالری",
      phone: "+98 21 1234 5678",
      instagram: "https://instagram.com/noorgallery",
      whatsapp: "989121234567",
    },
    update: {},
  });

  const categoryRecords = await Promise.all(categories.map(upsertCategory));
  const categoryIdBySlug = new Map(categoryRecords.map((category) => [category.slug, category.id]));
  const blobIndex = await listSeedBlobs();
  const photoCache = new Map<string, PhotoFile>();
  console.log(`Blob index: ${blobIndex.size} existing seed objects`);

  for (const collection of collections) {
    const categoryId = categoryIdBySlug.get(collection.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug ${collection.categorySlug}`);
    }

    const record = await db.collection.upsert({
      where: { slug: collection.slug },
      create: {
        titleFa: collection.titleFa,
        slug: collection.slug,
        excerptFa: collection.excerptFa,
        descriptionFa: collection.descriptionFa,
        featured: collection.featured,
        published: true,
        categoryId,
      },
      update: {
        titleFa: collection.titleFa,
        excerptFa: collection.excerptFa,
        descriptionFa: collection.descriptionFa,
        featured: collection.featured,
        published: true,
        categoryId,
      },
    });

    await syncSeedImages(record.id, collection.slug, collection.images, blobIndex, photoCache);
  }

  const [categoryCount, collectionCount, imageCount, featuredCount, blobImages] = await Promise.all([
    db.category.count(),
    db.collection.count({ where: { published: true } }),
    db.galleryImage.count(),
    db.collection.count({ where: { featured: true, published: true } }),
    db.galleryImage.count({
      where: { url: { contains: ".public.blob.vercel-storage.com" } },
    }),
  ]);

  const sample = await db.galleryImage.findFirst({
    where: { url: { contains: ".public.blob.vercel-storage.com" } },
    select: { url: true, blobPath: true },
  });

  console.log(
    `Seed completed: ${categories.length} catalog categories, ${collections.length} collections, ${imageCount} images (${blobImages} blob URLs, ${featuredCount} featured, ${categoryCount} total categories, ${collectionCount} published)`,
  );
  if (sample?.url) {
    const host = new URL(sample.url).host;
    console.log(`Blob sample host: ${host} path: ${sample.blobPath}`);
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
