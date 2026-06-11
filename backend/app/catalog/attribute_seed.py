"""Initial attribute definitions and category filter mappings."""

from __future__ import annotations

from typing import TypedDict


class OptionDef(TypedDict):
    value: str
    label: str


class AttributeDef(TypedDict, total=False):
    id: str
    label: str
    value_type: str
    unit: str | None
    options: list[OptionDef]


class CategoryLinkDef(TypedDict, total=False):
    attribute_id: str
    show_in_form: bool
    show_in_filters: bool
    show_on_card: bool
    filter_type: str | None
    filter_min: float | None
    filter_max: float | None
    filter_step: float | None
    required: bool
    sort_order: int
    group_label: str | None


ATTRIBUTE_DEFINITIONS: list[AttributeDef] = [
    # Shared enums
    {
        "id": "device_type",
        "label": "Тип",
        "value_type": "enum",
        "options": [
            {"value": "1din", "label": "1 DIN"},
            {"value": "2din", "label": "2 DIN"},
            {"value": "9inch", "label": '9"'},
            {"value": "10inch", "label": '10"'},
            {"value": "accessory", "label": "Сопутствующее"},
        ],
    },
    {
        "id": "processor_type",
        "label": "Тип",
        "value_type": "enum",
        "options": [
            {"value": "dsp", "label": "DSP-процессор"},
            {"value": "equalizer", "label": "Эквалайзер"},
            {"value": "crossover", "label": "Кроссовер"},
        ],
    },
    {
        "id": "video_output",
        "label": "Видео выход",
        "value_type": "enum",
        "options": [
            {"value": "none", "label": "Нет"},
            {"value": "rca", "label": "RCA"},
            {"value": "hdmi", "label": "HDMI"},
        ],
    },
    {
        "id": "wire_gauge",
        "label": "Сечение проводника",
        "value_type": "enum",
        "unit": "Ga",
        "options": [
            {"value": "8", "label": "8 Ga"},
            {"value": "10", "label": "10 Ga"},
            {"value": "12", "label": "12 Ga"},
            {"value": "14", "label": "14 Ga"},
            {"value": "16", "label": "16 Ga"},
        ],
    },
    {
        "id": "wire_material",
        "label": "Материал проводника",
        "value_type": "enum",
        "options": [
            {"value": "ofc", "label": "OFC медь"},
            {"value": "cca", "label": "CCA"},
            {"value": "silver", "label": "Серебро"},
        ],
    },
    {
        "id": "fuse_type",
        "label": "Тип предохранителя",
        "value_type": "enum",
        "options": [
            {"value": "mini", "label": "Mini"},
            {"value": "ato", "label": "ATO"},
            {"value": "maxi", "label": "Maxi"},
            {"value": "anl", "label": "ANL"},
        ],
    },
    {
        "id": "speaker_size",
        "label": "Типоразмер",
        "value_type": "enum",
        "options": [
            {"value": "6x9", "label": "6×9"},
            {"value": "6.5", "label": "6.5″"},
            {"value": "5.25", "label": "5.25″"},
            {"value": "8", "label": "8″"},
            {"value": "10", "label": "10″"},
            {"value": "12", "label": "12″"},
            {"value": "15", "label": "15″"},
        ],
    },
    {
        "id": "water_resistance",
        "label": "Влагостойкость",
        "value_type": "enum",
        "options": [
            {"value": "yes", "label": "Да"},
            {"value": "no", "label": "Нет"},
        ],
    },
    # Booleans
    {"id": "sound_processor", "label": "Звуковой процессор", "value_type": "boolean"},
    {"id": "optical_output", "label": "Оптический выход", "value_type": "boolean"},
    {"id": "optical_input", "label": "Оптический вход", "value_type": "boolean"},
    {"id": "coax_input", "label": "Коаксиальный вход", "value_type": "boolean"},
    {"id": "bluetooth", "label": "Bluetooth", "value_type": "boolean"},
    {"id": "usb_audio", "label": "USB audio", "value_type": "boolean"},
    {"id": "wired_remote", "label": "Проводной регулятор", "value_type": "boolean"},
    # Numbers
    {"id": "screen_size", "label": "Диагональ экрана", "value_type": "number", "unit": "″"},
    {"id": "channel_count", "label": "Количество каналов", "value_type": "number"},
    {"id": "dsp_channels", "label": "Количество каналов процессора (DSP)", "value_type": "number"},
    {"id": "amp_channels", "label": "Количество каналов усилителя", "value_type": "number"},
    {"id": "impedance", "label": "Импеданс", "value_type": "number", "unit": "Ом"},
    {"id": "power_4ohm", "label": "Номинальная мощность 4 Ом", "value_type": "number", "unit": "Вт"},
    {"id": "power_2ohm", "label": "Номинальная мощность 2 Ом", "value_type": "number", "unit": "Вт"},
    {"id": "power_1ohm", "label": "Номинальная мощность 1 Ом", "value_type": "number", "unit": "Вт"},
    {"id": "power_bridge_4ohm", "label": "Мощность мостом 4 Ом", "value_type": "number", "unit": "Вт"},
    {"id": "power_bridge_2ohm", "label": "Мощность мостом 2 Ом", "value_type": "number", "unit": "Вт"},
    {"id": "speaker_bands", "label": "Количество полос", "value_type": "number"},
    {"id": "speaker_diameter", "label": "Диаметр", "value_type": "number", "unit": "″"},
    {"id": "voice_coils", "label": "Количество звуковых катушек", "value_type": "number"},
    {"id": "sensitivity", "label": "Чувствительность", "value_type": "number", "unit": "дБ"},
    {"id": "power_rms", "label": "Мощность RMS", "value_type": "number", "unit": "Вт"},
    {"id": "mounting_depth", "label": "Глубина установки", "value_type": "number", "unit": "мм"},
    {"id": "fuse_rating", "label": "Номинал предохранителя", "value_type": "number", "unit": "А"},
    {"id": "thickness", "label": "Толщина", "value_type": "number", "unit": "мм"},
    {"id": "sheet_weight", "label": "Вес 1 листа", "value_type": "number", "unit": "г"},
]


def _link(
    attribute_id: str,
    *,
    sort_order: int,
    filter_type: str | None = None,
    filter_min: float | None = None,
    filter_max: float | None = None,
    filter_step: float | None = None,
    group_label: str | None = None,
    show_on_card: bool = False,
    required: bool = False,
) -> CategoryLinkDef:
    return {
        "attribute_id": attribute_id,
        "show_in_form": True,
        "show_in_filters": filter_type is not None,
        "show_on_card": show_on_card,
        "filter_type": filter_type,
        "filter_min": filter_min,
        "filter_max": filter_max,
        "filter_step": filter_step,
        "required": required,
        "sort_order": sort_order,
        "group_label": group_label,
    }


CATEGORY_ATTRIBUTE_LINKS: dict[str, list[CategoryLinkDef]] = {
    "sources": [
        _link("device_type", sort_order=1, filter_type="dropdown", show_on_card=True),
        _link("screen_size", sort_order=2, filter_type="range", filter_min=6, filter_max=12, filter_step=0.5),
        _link("video_output", sort_order=3, filter_type="dropdown"),
        _link("sound_processor", sort_order=4, filter_type="checkbox"),
        _link("optical_output", sort_order=5, filter_type="checkbox"),
        _link("optical_input", sort_order=6, filter_type="checkbox"),
    ],
    "processors": [
        _link("processor_type", sort_order=1, filter_type="dropdown", show_on_card=True),
        _link("channel_count", sort_order=2, filter_type="dropdown"),
        _link("optical_input", sort_order=3, filter_type="checkbox"),
        _link("coax_input", sort_order=4, filter_type="checkbox"),
        _link("bluetooth", sort_order=5, filter_type="checkbox"),
    ],
    "amplifiers": [
        _link("amp_channels", sort_order=1, filter_type="dropdown", show_on_card=True),
        _link("power_4ohm", sort_order=2, filter_type="range", filter_min=0, filter_max=1200, filter_step=10, group_label="Мощность"),
        _link("power_2ohm", sort_order=3, filter_type="range", filter_min=0, filter_max=2000, filter_step=10, group_label="Мощность"),
        _link("power_1ohm", sort_order=4, filter_type="range", filter_min=0, filter_max=3000, filter_step=10, group_label="Мощность"),
        _link("power_bridge_4ohm", sort_order=5, filter_type="range", filter_min=0, filter_max=2000, filter_step=10, group_label="Мощность"),
        _link("power_bridge_2ohm", sort_order=6, filter_type="range", filter_min=0, filter_max=3200, filter_step=10, group_label="Мощность"),
        _link("dsp_channels", sort_order=7, filter_type="dropdown", group_label="Входы"),
        _link("optical_output", sort_order=8, filter_type="checkbox", group_label="Входы"),
        _link("optical_input", sort_order=9, filter_type="checkbox", group_label="Входы"),
        _link("coax_input", sort_order=10, filter_type="checkbox", group_label="Входы"),
        _link("usb_audio", sort_order=11, filter_type="checkbox"),
        _link("bluetooth", sort_order=12, filter_type="checkbox"),
        _link("wired_remote", sort_order=13, filter_type="checkbox"),
        _link("impedance", sort_order=14, filter_type="range", filter_min=1, filter_max=8, filter_step=0.5),
    ],
    "speakers": [
        _link("speaker_size", sort_order=1, filter_type="dropdown", show_on_card=True),
        _link("speaker_bands", sort_order=2, filter_type="dropdown"),
        _link("speaker_diameter", sort_order=3, filter_type="range", filter_min=4, filter_max=15, filter_step=0.5),
        _link("power_4ohm", sort_order=4, filter_type="range", filter_min=0, filter_max=135, filter_step=5, group_label="Мощность"),
        _link("power_2ohm", sort_order=5, filter_type="range", filter_min=0, filter_max=220, filter_step=5, group_label="Мощность"),
        _link("power_bridge_4ohm", sort_order=6, filter_type="range", filter_min=0, filter_max=460, filter_step=5, group_label="Мощность"),
        _link("impedance", sort_order=7, filter_type="range", filter_min=2, filter_max=8, filter_step=0.5),
        _link("voice_coils", sort_order=8, filter_type="dropdown"),
        _link("sensitivity", sort_order=9, filter_type="range", filter_min=80, filter_max=110, filter_step=1),
        _link("power_rms", sort_order=10, filter_type="range", filter_min=0, filter_max=3500, filter_step=10),
        _link("mounting_depth", sort_order=11, filter_type="range", filter_min=0, filter_max=267, filter_step=1),
    ],
    "wiring": [
        _link("wire_gauge", sort_order=1, filter_type="dropdown", show_on_card=True),
        _link("wire_material", sort_order=2, filter_type="dropdown"),
        _link("fuse_type", sort_order=3, filter_type="dropdown"),
        _link("fuse_rating", sort_order=4, filter_type="range", filter_min=10, filter_max=300, filter_step=5),
    ],
    "dampening": [
        _link("thickness", sort_order=1, filter_type="range", filter_min=1, filter_max=35, filter_step=1, show_on_card=True),
        _link("sheet_weight", sort_order=2, filter_type="range", filter_min=1.1, filter_max=6600, filter_step=10),
        _link("water_resistance", sort_order=3, filter_type="dropdown"),
    ],
}
