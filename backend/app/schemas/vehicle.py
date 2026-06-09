from app.schemas.common import CamelModel


class VehicleModelOut(CamelModel):
    id: str
    name: str
    years: list[int]


class VehicleMakeOut(CamelModel):
    id: str
    name: str
    models: list[VehicleModelOut]
