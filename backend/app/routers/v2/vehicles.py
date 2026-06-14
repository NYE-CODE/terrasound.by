from fastapi import APIRouter

from app.api_constants import API_V2_PREFIX
from app.data.vehicles import VEHICLE_CATALOG
from app.schemas.vehicle import VehicleMakeOut, VehicleModelOut

router = APIRouter(prefix=f"{API_V2_PREFIX}/vehicles", tags=["vehicles"])


@router.get("", response_model=list[VehicleMakeOut])
def list_vehicles_v2() -> list[VehicleMakeOut]:
    return [
        VehicleMakeOut(
            id=make["id"],
            name=make["name"],
            models=[
                VehicleModelOut(
                    id=model["id"],
                    name=model["name"],
                    years=list(range(model["year_from"], model["year_to"] + 1)),
                )
                for model in make["models"]
            ],
        )
        for make in VEHICLE_CATALOG
    ]
