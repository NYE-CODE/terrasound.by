from datetime import datetime

from sqlalchemy.orm import Session

from app.catalog.attribute_seed import ATTRIBUTE_DEFINITIONS, CATEGORY_ATTRIBUTE_LINKS
from app.models.attribute import Attribute, AttributeOption, CategoryAttribute, ProductAttributeValue
from app.models.content import BlogPost, Brand, Category, InstallationService, PortfolioWork
from app.models.admin_account import AdminAccount
from app.models.site_contact import SiteContact
from app.models.site_announcement import SiteAnnouncement
from app.models.product_highlights import ProductHighlights
from app.models.site_stats import SiteStats
from app.contact_utils import address_to_maps_url
from app.services.site_contact import (
    DEFAULT_ADDRESS,
    DEFAULT_EMAIL,
    DEFAULT_INSTAGRAM,
    DEFAULT_PHONE,
    DEFAULT_TELEGRAM,
    DEFAULT_TIKTOK,
    DEFAULT_WORKING_HOURS,
)
from app.services.admin_account import hash_password
from app.models.product import Product, ProductCompatibility, ProductImage, ProductSpec
from app.models.review import ProductReview, ServiceReview

CATEGORIES = [
    {
        "id": "sources",
        "name": "Источники",
        "image_url": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
        "sort_order": 1,
        "grid_cols": 2,
        "grid_tall": False,
    },
    {
        "id": "processors",
        "name": "Процессоры",
        "image_url": "https://images.unsplash.com/photo-1545226685-5e8a2f1d1b8e?w=800&q=80",
        "sort_order": 2,
        "grid_cols": 1,
        "grid_tall": False,
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
        "id": "speakers",
        "name": "Динамики",
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
        "sort_order": 4,
        "grid_cols": 2,
        "grid_tall": True,
    },
    {
        "id": "wiring",
        "name": "Проводка и сопутствующие",
        "image_url": "https://images.unsplash.com/photo-1570733577647-d3e8ae86a000?w=800&q=80",
        "sort_order": 5,
        "grid_cols": 1,
        "grid_tall": False,
    },
    {
        "id": "dampening",
        "name": "Шумоизоляция",
        "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
        "sort_order": 6,
        "grid_cols": 1,
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
        "category": "speakers",
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
        "category": "sources",
    },
    {
        "id": "7",
        "brand": "Focal",
        "name": "P 30 F",
        "specs_short": '12" subwoofer • 300W RMS',
        "price": 329.0,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
        "category": "speakers",
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

EXTRA_CATALOGUE_PRODUCTS = [
    {
        "id": "10",
        "brand": "Audison",
        "name": "bit One HD Virtuoso",
        "specs_short": "10-channel DSP processor • Bluetooth",
        "price": 1199.0,
        "image_url": "https://images.unsplash.com/photo-1545226685-5e8a2f1d1b8e?w=400&q=80",
        "category": "processors",
    },
    {
        "id": "11",
        "brand": "Ural",
        "name": "УК 4 GA",
        "specs_short": "Power cable 4 Ga OFC • 5 m",
        "price": 45.0,
        "image_url": "https://images.unsplash.com/photo-1570733577647-d3e8ae86a000?w=400&q=80",
        "category": "wiring",
    },
]

PRODUCT_ATTRIBUTE_VALUES: dict[str, dict[str, str | int | float | bool]] = {
    "1": {
        "speaker_size": "6.5",
        "speaker_bands": 3,
        "speaker_diameter": 6.5,
        "power_4ohm": 160,
        "power_2ohm": 220,
        "impedance": 4,
        "voice_coils": 1,
        "sensitivity": 92,
        "power_rms": 160,
        "mounting_depth": 65,
    },
    "2": {
        "speaker_size": "12",
        "speaker_bands": 1,
        "speaker_diameter": 12,
        "power_4ohm": 750,
        "power_rms": 750,
        "impedance": 4,
        "voice_coils": 2,
        "sensitivity": 86,
        "mounting_depth": 140,
    },
    "3": {
        "speaker_size": "6.5",
        "speaker_bands": 2,
        "speaker_diameter": 6.5,
        "power_4ohm": 100,
        "power_rms": 100,
        "impedance": 4,
        "voice_coils": 1,
        "sensitivity": 90,
        "mounting_depth": 58,
    },
    "4": {
        "speaker_size": "6.5",
        "speaker_bands": 3,
        "speaker_diameter": 6.5,
        "power_4ohm": 200,
        "power_rms": 200,
        "impedance": 4,
        "voice_coils": 1,
        "sensitivity": 93,
        "mounting_depth": 62,
    },
    "5": {
        "amp_channels": 4,
        "power_4ohm": 100,
        "power_2ohm": 150,
        "power_bridge_4ohm": 200,
        "dsp_channels": 0,
        "optical_output": False,
        "optical_input": False,
        "coax_input": True,
        "usb_audio": False,
        "bluetooth": False,
        "wired_remote": True,
        "impedance": 4,
    },
    "6": {
        "device_type": "2din",
        "screen_size": 7,
        "video_output": "rca",
        "sound_processor": True,
        "optical_output": True,
        "optical_input": False,
    },
    "7": {
        "speaker_size": "12",
        "speaker_bands": 1,
        "speaker_diameter": 12,
        "power_4ohm": 300,
        "power_rms": 300,
        "impedance": 4,
        "voice_coils": 1,
        "sensitivity": 88,
        "mounting_depth": 120,
    },
    "8": {
        "thickness": 4,
        "sheet_weight": 1200,
        "water_resistance": "no",
    },
    "9": {
        "speaker_size": "6.5",
        "speaker_bands": 2,
        "speaker_diameter": 6.5,
        "power_4ohm": 80,
        "power_rms": 80,
        "impedance": 4,
        "voice_coils": 1,
        "sensitivity": 89,
        "mounting_depth": 55,
    },
    "10": {
        "processor_type": "dsp",
        "channel_count": 10,
        "optical_input": True,
        "coax_input": True,
        "bluetooth": True,
    },
    "11": {
        "wire_gauge": "4",
        "wire_material": "ofc",
        "fuse_type": "anl",
        "fuse_rating": 100,
    },
}

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
        "sort_order": 1,
    },
    {
        "id": "svc-2",
        "title": "Установка сабвуфера и усилителя",
        "description": "Полная установка, включая изготовление короба, монтаж усилителя и подключение питания.",
        "sort_order": 2,
    },
    {
        "id": "svc-3",
        "title": "Замена головного устройства",
        "description": "Установка магнитол с интеграцией кнопок на руле и подключением камеры заднего вида.",
        "sort_order": 3,
    },
    {
        "id": "svc-4",
        "title": "Шумоизоляция",
        "description": "Нанесение вибропоглощающих материалов на двери, пол и багажник для снижения шума дороги.",
        "sort_order": 4,
    },
    {
        "id": "svc-5",
        "title": "Акустическая калибровка",
        "description": "Профессиональная настройка DSP, выравнивание задержек и частот для оптимальной сцены и АЧХ.",
        "sort_order": 5,
    },
    {
        "id": "svc-6",
        "title": "Сборка полной системы",
        "description": "Проектирование и установка полной аудиосистемы — от консультации до финальной калибровки.",
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

PORTFOLIO_WORKS = [
    {
        "id": "portfolio-1",
        "title": "BMW 5 Series",
        "image_url": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80",
        "sort_order": 1,
    },
    {
        "id": "portfolio-2",
        "title": "Mercedes-Benz E-Class",
        "image_url": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
        "sort_order": 2,
    },
    {
        "id": "portfolio-3",
        "title": "Porsche 911",
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
        "sort_order": 3,
    },
    {
        "id": "portfolio-4",
        "title": "Audi A6",
        "image_url": "https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&q=80",
        "sort_order": 4,
    },
    {
        "id": "portfolio-5",
        "title": "Volkswagen Golf",
        "image_url": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80",
        "sort_order": 5,
    },
    {
        "id": "portfolio-6",
        "title": "Toyota Camry",
        "image_url": "https://images.unsplash.com/photo-1570733577647-d3e8ae86a000?w=600&q=80",
        "sort_order": 6,
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
    _seed_extra_products(db)
    _seed_product_attribute_values(db)


def _seed_extra_products(db: Session) -> None:
    for item in EXTRA_CATALOGUE_PRODUCTS:
        if db.query(Product).filter(Product.id == item["id"]).first():
            continue
        db.add(
            Product(
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
        )
    db.commit()


def _seed_product_attribute_values(db: Session) -> None:
    for product_id, attributes in PRODUCT_ATTRIBUTE_VALUES.items():
        if not db.query(Product).filter(Product.id == product_id).first():
            continue
        for attribute_id, raw in attributes.items():
            exists = (
                db.query(ProductAttributeValue)
                .filter(
                    ProductAttributeValue.product_id == product_id,
                    ProductAttributeValue.attribute_id == attribute_id,
                )
                .first()
            )
            if exists:
                continue
            attribute = db.query(Attribute).filter(Attribute.id == attribute_id).first()
            if not attribute:
                continue
            row = ProductAttributeValue(product_id=product_id, attribute_id=attribute_id)
            if attribute.value_type == "boolean":
                row.value_bool = bool(raw)
            elif attribute.value_type == "number":
                row.value_number = float(raw)
            else:
                row.value_string = str(raw)
            db.add(row)
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

    if db.query(PortfolioWork).count() == 0:
        for item in PORTFOLIO_WORKS:
            db.add(PortfolioWork(published=True, **item))

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


def _seed_site_announcement(db: Session) -> None:
    if db.query(SiteAnnouncement).filter(SiteAnnouncement.id == 1).first():
        return
    db.add(SiteAnnouncement(id=1, text="", enabled=False))
    db.commit()


def _seed_product_highlights(db: Session) -> None:
    if db.query(ProductHighlights).filter(ProductHighlights.id == 1).first():
        return
    import json

    from app.services.product_highlights import DEFAULT_HIGHLIGHTS

    db.add(ProductHighlights(id=1, highlights_json=json.dumps(DEFAULT_HIGHLIGHTS, ensure_ascii=False)))
    db.commit()


def _seed_site_stats(db: Session) -> None:
    if db.query(SiteStats).filter(SiteStats.id == 1).first():
        return
    db.add(SiteStats(id=1, installations_completed="1200+", years_expertise="8"))
    db.commit()


def _seed_site_contact(db: Session) -> None:
    if db.query(SiteContact).filter(SiteContact.id == 1).first():
        return
    db.add(
        SiteContact(
            id=1,
            phone=DEFAULT_PHONE,
            email=DEFAULT_EMAIL,
            instagram_url=DEFAULT_INSTAGRAM,
            tiktok_url=DEFAULT_TIKTOK,
            telegram_url=DEFAULT_TELEGRAM,
            address=DEFAULT_ADDRESS,
            maps_url=address_to_maps_url(DEFAULT_ADDRESS),
            working_hours=DEFAULT_WORKING_HOURS,
        )
    )
    db.commit()


def _seed_attributes(db: Session) -> None:
    from app.filter_types import resolve_default_filter_type

    if db.query(Attribute).count() == 0:
        for item in ATTRIBUTE_DEFINITIONS:
            options = item.get("options", [])
            attribute = Attribute(
                id=item["id"],
                label=item["label"],
                value_type=item["value_type"],
                unit=item.get("unit"),
                filter_type=resolve_default_filter_type(item["value_type"], len(options)),
            )
            db.add(attribute)
            db.flush()
            for index, option in enumerate(options):
                db.add(
                    AttributeOption(
                        attribute_id=attribute.id,
                        value=option["value"],
                        label=option["label"],
                        sort_order=index,
                    )
                )
        db.commit()

    for category_id, links in CATEGORY_ATTRIBUTE_LINKS.items():
        if not db.query(Category).filter(Category.id == category_id).first():
            continue
        for link in links:
            exists = (
                db.query(CategoryAttribute)
                .filter(
                    CategoryAttribute.category_id == category_id,
                    CategoryAttribute.attribute_id == link["attribute_id"],
                )
                .first()
            )
            if exists:
                continue
            db.add(CategoryAttribute(category_id=category_id, **link))

    db.commit()


def seed_database(db: Session) -> None:
    _seed_categories(db)
    _seed_attributes(db)
    _seed_products(db)
    _seed_extra_products(db)
    _seed_product_attribute_values(db)
    _seed_content(db)
    _seed_admin_account(db)
    _seed_site_stats(db)
    _seed_site_contact(db)
    _seed_site_announcement(db)
    _seed_product_highlights(db)
