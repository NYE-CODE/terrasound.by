from fastapi import Depends

from app.auth import get_current_admin

ADMIN_ROUTER_DEPENDENCIES = [Depends(get_current_admin)]
