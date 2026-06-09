from datetime import datetime

from sqlalchemy.orm import Session

from app.models.content import BlogPost, Brand, Category, InstallationService, TeamMember
from app.models.admin_account import AdminAccount
from app.models.site_stats import SiteStats
from app.services.admin_account import hash_password
from app.models.product import Product, ProductCompatibility, ProductImage, ProductSpec
from app.models.review import ProductReview, ServiceReview

CATEGORIES = [
    {
        "id": "speakers",
        "name": "Акустика",
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
        "sort_order": 1,
        "grid_cols": 2,
        "grid_tall": False,
    },
    {
        "id": "subwoofers",
        "name": "Сабвуферы",
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        "sort_order": 2,
        "grid_cols": 1,
        "grid_tall": True,
    },
    {
        "id": "amplifiers",
        "name": "Усилители",
        "image_url": "https://images.unsplash.com/photo-1545226685-5e8a2f1d1b8e?w=800&q=80",
        "sort_order": 3,
        "grid_cols": 1,
        "grid_tall": False,
    },
    {
        "id": "head-units",
        "name": "Головные устройства",
        "image_url": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
        "sort_order": 4,
        "grid_cols": 1,
        "grid_tall": False,
    },
    {
        "id": "dampening",
        "name": "Шумоизоляция",
        "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
        "sort_order": 5,
        "grid_cols": 1,
        "grid_tall": False,
    },
    {
        "id": "accessories",
        "name": "Кабели и аксессуары",
        "image_url": "https://images.unsplash.com/photo-1570733577647-d3e8ae86a000?w=800&q=80",
        "sort_order": 6,
        "grid_cols": 2,
        "grid_tall": False,
    },
]

CATALOGUE_PRODUCTS = [
    {
        "id": "1",
        "brand": "Focal",
        "name": "K2 Power 165 KRX3",
        "specs_short": "165mm 3-way component • 160W RMS",
        "price": 1299.0,
        "sale_price": 1099.0,
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
        "category": "speakers",
    },
    {
        "id": "2",
        "brand": "JL Audio",
        "name": "12W7AE-3",
        "specs_short": '12" subwoofer • 750W RMS',
        "price": 899.0,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
        "category": "subwoofers",
    },
    {
        "id": "3",
        "brand": "Ural",
        "name": "PT 6.165",
        "specs_short": "165mm coaxial • 100W RMS",
        "price": 189.0,
        "image_url": "https://images.unsplash.com/photo-1545226685-5e8a2f1d1b8e?w=400&q=80",
        "category": "speakers",
    },
    {
        "id": "4",
        "brand": "Hertz",
        "name": "MPK 165.3 Pro",
        "specs_short": "165mm 3-way component • 200W RMS",
        "price": 549.0,
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
        "category": "speakers",
    },
    {
        "id": "5",
        "brand": "JL Audio",
        "name": "XD400/4v2",
        "specs_short": "4-channel amplifier • 400W RMS",
        "price": 679.0,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
        "category": "amplifiers",
    },
    {
        "id": "6",
        "brand": "Pioneer",
        "name": "DMH-Z6350BT",
        "specs_short": '7" touchscreen • Apple CarPlay',
        "price": 459.0,
        "image_url": "https://images.unsplash.com/photo-1545226685-5e8a2f1d1b8e?w=400&q=80",
        "category": "head-units",
    },
    {
        "id": "7",
        "brand": "Focal",
        "name": "P 30 F",
        "specs_short": '12" subwoofer • 300W RMS',
        "price": 329.0,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
        "category": "subwoofers",
    },
    {
        "id": "8",
        "brand": "INCAR",
        "name": "StP Aero Plus",
        "specs_short": "Sound dampening material • 4mm",
        "price": 89.0,
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
        "category": "dampening",
    },
    {
        "id": "9",
        "brand": "Ural",
        "name": "DB 6.165",
        "specs_short": "165mm coaxial • 80W RMS",
        "price": 129.0,
        "image_url": "https://images.unsplash.com/photo-1545226685-5e8a2f1d1b8e?w=400&q=80",
        "category": "speakers",
    },
]

PRODUCT_1_IMAGES = [
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
    "https://images.unsplash.com/photo-1545226685-5e8a2f1d1b8e?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
]

PRODUCT_1_SPECS = {
    "Тип": "Трёхполосная компонентная система",
    "Мощность": "160 Вт RMS / 320 Вт макс.",
    "Частотный диапазон": "40 Гц — 28 кГц",
    "Чувствительность": "92,5 дБ",
    "Импеданс": "4 Ом",
    "Твитер": "25 мм инвертированный купол M-profile",
    "Среднечастотник": "80 мм",
    "Вуфер": "165 мм с конусом",
}

PRODUCT_1_COMPATIBILITY = [
    "Audi A4 (2016-2023)",
    "Audi A6 (2018-2023)",
    "BMW 3 Series (2015-2023)",
    "Mercedes C-Class (2014-2023)",
    "Volkswagen Passat (2015-2023)",
]

PRODUCT_COMPATIBILITY: dict[str, list[str]] = {
    "1": PRODUCT_1_COMPATIBILITY,
    "3": [
        "Audi A4 (2016-2023)",
        "Volkswagen Passat (2015-2023)",
        "BMW 3 Series (2015-2023)",
    ],
    "6": [
        "Audi A4 (2016-2023)",
        "Audi A6 (2018-2023)",
        "BMW 3 Series (2015-2023)",
        "BMW 5 Series (2017-2023)",
        "Mercedes C-Class (2014-2023)",
    ],
    "9": [
        "Audi A4 (2016-2023)",
        "Mercedes C-Class (2014-2023)",
        "Volkswagen Passat (2015-2023)",
    ],
}

SERVICE_REVIEWS = [
    {
        "id": "sr-1",
        "author": "Дмитрий К.",
        "car": "BMW 5 Series",
        "rating": 5,
        "text": "Лучшее качество установки в Гродно. Ребята знают своё дело.",
        "created_at": datetime(2026, 4, 15, 10, 0, 0),
    },
    {
        "id": "sr-2",
        "author": "Анна В.",
        "car": "Audi A4",
        "rating": 5,
        "text": "Помогли подобрать идеальную систему под мой бюджет. Звук невероятный.",
        "created_at": datetime(2026, 3, 20, 10, 0, 0),
    },
    {
        "id": "sr-3",
        "author": "Сергей П.",
        "car": "Mercedes C-Class",
        "rating": 5,
        "text": "Профессиональная акустическая калибровка изменила всё. Стоит каждого рубля.",
        "created_at": datetime(2026, 2, 10, 10, 0, 0),
    },
]

INSTALLATION_SERVICES = [
    {
        "id": "svc-1",
        "title": "Установка компонентной акустики",
        "description": "Профессиональная установка 2- или 3-полосных компонентных систем с оптимальным размещением и прокладкой проводки.",
        "price_range": "250-450",
        "sort_order": 1,
    },
    {
        "id": "svc-2",
        "title": "Установка сабвуфера и усилителя",
        "description": "Полная установка, включая изготовление короба, монтаж усилителя и подключение питания.",
        "price_range": "350-650",
        "sort_order": 2,
    },
    {
        "id": "svc-3",
        "title": "Замена головного устройства",
        "description": "Установка магнитол с интеграцией кнопок на руле и подключением камеры заднего вида.",
        "price_range": "150-300",
        "sort_order": 3,
    },
    {
        "id": "svc-4",
        "title": "Шумоизоляция",
        "description": "Нанесение вибропоглощающих материалов на двери, пол и багажник для снижения шума дороги.",
        "price_range": "400-800",
        "sort_order": 4,
    },
    {
        "id": "svc-5",
        "title": "Акустическая калибровка",
        "description": "Профессиональная настройка DSP, выравнивание задержек и частот для оптимальной сцены и АЧХ.",
        "price_range": "200-400",
        "sort_order": 5,
    },
    {
        "id": "svc-6",
        "title": "Сборка полной системы",
        "description": "Проектирование и установка полной аудиосистемы — от консультации до финальной калибровки.",
        "price_range": "1500-5000",
        "sort_order": 6,
    },
]

BRANDS = [
    {
        "id": "brand-1",
        "name": "Focal",
        "description": "Французский производитель премиальной акустики, известный исключительной чёткостью и точностью.",
        "country": "Франция",
        "since": "1979",
        "sort_order": 1,
    },
    {
        "id": "brand-2",
        "name": "JL Audio",
        "description": "Американский новатор в мобильном аудио, знаменитый сабвуферами и усилителями.",
        "country": "США",
        "since": "1975",
        "sort_order": 2,
    },
    {
        "id": "brand-3",
        "name": "Ural",
        "description": "Российский бренд с отличным соотношением цены и качества для автозвуковых систем.",
        "country": "Россия",
        "since": "1996",
        "sort_order": 3,
    },
    {
        "id": "brand-4",
        "name": "Hertz",
        "description": "Итальянский производитель, сочетающий европейский дизайн с превосходным звуком.",
        "country": "Италия",
        "since": "2002",
        "sort_order": 4,
    },
    {
        "id": "brand-5",
        "name": "Pioneer",
        "description": "Японский гигант электроники с десятилетиями инноваций в автозвуке.",
        "country": "Япония",
        "since": "1938",
        "sort_order": 5,
    },
    {
        "id": "brand-6",
        "name": "Alpine",
        "description": "Премиальный японский бренд, специализирующийся на головных устройствах и акустике.",
        "country": "Япония",
        "since": "1967",
        "sort_order": 6,
    },
    {
        "id": "brand-7",
        "name": "INCAR",
        "description": "Российский производитель аудиоаксессуаров и материалов для шумоизоляции.",
        "country": "Россия",
        "since": "2008",
        "sort_order": 7,
    },
]

TEAM_MEMBERS = [
    {
        "id": "team-1",
        "name": "Дмитрий Волков",
        "specialty": "Ведущий установщик",
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        "sort_order": 1,
    },
    {
        "id": "team-2",
        "name": "Сергей Петров",
        "specialty": "Акустик",
        "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
        "sort_order": 2,
    },
    {
        "id": "team-3",
        "name": "Антон Иванов",
        "specialty": "Специалист по электронике",
        "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
        "sort_order": 3,
    },
]

BLOG_POSTS = [
    {
        "id": "blog-1",
        "title": "Как выбрать акустику для вашего автомобиля",
        "excerpt": "Разбираем мощность, чувствительность и разницу между компонентной и коаксиальной акустикой.",
        "content": "Выбор акустики начинается с понимания типа системы. Компонентная акустика даёт лучшее разделение частот и более точную сцену, но требует аккуратной установки. Коаксиальная проще монтируется и подходит для обновления штатной системы без серьёзной переделки.\n\nОбращайте внимание на чувствительность (дБ): чем выше показатель, тем меньше мощности нужно усилителю для комфортной громкости. Мощность указывайте в паре с вашим усилителем — перегруз динамиков слышен сразу, недогруз даёт грязный звук на высокой громкости.\n\nДля большинства салонов оптимальны 16-сантиметровые динамики в дверях. Если планируете сабвуфер, заранее продумайте кроссоверы и место для усилителя.",
        "category": "Гайды",
        "created_at": datetime(2026, 5, 15, 10, 0, 0),
    },
    {
        "id": "blog-2",
        "title": "Зачем нужна шумоизоляция",
        "excerpt": "Почему обработка дверей и пола так сильно влияет на качество звука.",
        "content": "Двери автомобиля работают как короб для динамиков, но одновременно передают дорожный шум внутрь салона. Без демпфирования металл резонирует, и бас «размазывается», а средние частоты теряют чёткость.\n\nОбработка дверей — первый шаг к заметному улучшению: вибропоглощающий материал снижает резонанс, звукоизоляция отсекает внешний шум. Пол и арки колёс влияют на низкие частоты — особенно если в системе есть сабвуфер.\n\nШумоизоляция не заменяет хорошую акустику, но раскрывает её потенциал. После обработки динамики играют чище, а громкость комфортной музыки можно снизить без потери детализации.",
        "category": "Установка",
        "created_at": datetime(2026, 5, 8, 10, 0, 0),
    },
    {
        "id": "blog-3",
        "title": "Обзор Focal K2 Power: стоит ли своих денег?",
        "excerpt": "Подробный обзор флагманской компонентной системы Focal после 6 месяцев использования.",
        "content": "Focal K2 Power — система для тех, кто хочет максимум детализации. После полугода ежедневного использования главное впечатление — прозрачность верха и контролируемый бас при правильной установке.\n\nСильные стороны: широкая сцена, точная подача вокала, запас по динамике. Слабое место — требовательность к установке и настройке. Без качественных кроссоверов и акустической калибровки потенциал раскрывается лишь частично.\n\nПо соотношению цена/качество K2 Power оправдан, если вы готовы вложиться в монтаж и настройку. Для бюджетного апгрейда есть более доступные линейки, но флагман Focal остаётся ориентиром в премиальном сегменте.",
        "category": "Обзоры",
        "created_at": datetime(2026, 4, 28, 10, 0, 0),
    },
]

PRODUCT_REVIEWS = [
    {
        "id": "pr-1",
        "product_id": "1",
        "author": "Алекс П.",
        "text": "Исключительная чёткость и глубина. Установка прошла без проблем с помощью команды TerraSound.",
        "rating": 5,
        "created_at": datetime(2026, 5, 26, 10, 0, 0),
        "published": True,
    },
    {
        "id": "pr-2",
        "product_id": "1",
        "author": "Мария К.",
        "text": "Лучшие колонки, что у меня были. Стоит каждого рубля. Акустическая калибровка сильно изменила звук.",
        "rating": 5,
        "created_at": datetime(2026, 5, 9, 10, 0, 0),
        "published": True,
    },
]


def _seed_categories(db: Session) -> None:
    if db.query(Category).count() > 0:
        return
    for item in CATEGORIES:
        db.add(Category(published=True, **item))
    db.commit()


def _seed_products(db: Session) -> None:
    _seed_categories(db)
    if db.query(Product).count() > 0:
        return

    for item in CATALOGUE_PRODUCTS:
        product = Product(
            id=item["id"],
            brand=item["brand"],
            name=item["name"],
            price=item["price"],
            sale_price=item.get("sale_price"),
            category=item["category"],
            image_url=item["image_url"],
            specs_short=item["specs_short"],
            in_stock=True,
        )
        db.add(product)

    for index, url in enumerate(PRODUCT_1_IMAGES):
        db.add(ProductImage(product_id="1", url=url, sort_order=index))

    for key, value in PRODUCT_1_SPECS.items():
        db.add(ProductSpec(product_id="1", key=key, value=value))

    for product_id, vehicles in PRODUCT_COMPATIBILITY.items():
        for vehicle in vehicles:
            db.add(ProductCompatibility(product_id=product_id, vehicle=vehicle))

    for item in PRODUCT_REVIEWS:
        db.add(ProductReview(**item))

    for item in SERVICE_REVIEWS:
        db.add(ServiceReview(published=True, **item))

    db.commit()


def _seed_content(db: Session) -> None:
    if db.query(InstallationService).count() == 0:
        for item in INSTALLATION_SERVICES:
            db.add(InstallationService(published=True, **item))

    if db.query(Brand).count() == 0:
        for item in BRANDS:
            db.add(Brand(published=True, **item))

    if db.query(BlogPost).count() == 0:
        for item in BLOG_POSTS:
            db.add(BlogPost(published=True, **item))

    if db.query(TeamMember).count() == 0:
        for item in TEAM_MEMBERS:
            db.add(TeamMember(published=True, **item))

    db.commit()


def _seed_admin_account(db: Session) -> None:
    from app.config import settings

    if db.query(AdminAccount).filter(AdminAccount.id == 1).first():
        return
    db.add(
        AdminAccount(
            id=1,
            username=settings.admin_username,
            password_hash=hash_password(settings.admin_password),
        )
    )
    db.commit()


def _seed_site_stats(db: Session) -> None:
    if db.query(SiteStats).filter(SiteStats.id == 1).first():
        return
    db.add(SiteStats(id=1, installations_completed=1200, years_expertise=8))
    db.commit()


def seed_database(db: Session) -> None:
    _seed_categories(db)
    _seed_products(db)
    _seed_content(db)
    _seed_admin_account(db)
    _seed_site_stats(db)
