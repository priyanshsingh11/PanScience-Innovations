from fastapi import HTTPException, status

async def get_current_user():
    """
    Temporary: Bypass authentication and return a static user_id.
    """
    return "test_user"
