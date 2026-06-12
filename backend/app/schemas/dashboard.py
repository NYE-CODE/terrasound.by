from app.schemas.common import CamelModel


class DashboardStatsOut(CamelModel):
    orders_new: int
    orders_total: int
    reviews_pending: int
    installation_requests: int
