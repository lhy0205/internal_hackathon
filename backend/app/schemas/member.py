from pydantic import BaseModel, EmailStr


class MemberResponse(BaseModel):
    """회원 정보 응답 스키마"""
    id: int
    email: str
    nickname: str
    provider: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """로그인/회원가입 성공 후 반환하는 JWT 토큰"""
    access_token: str
    token_type: str = "bearer"
    member: MemberResponse
